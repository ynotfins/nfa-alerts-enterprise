"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IncidentSignSkeleton } from "@/components/incidents/incident-detail-skeleton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignatureCanvas from "react-signature-canvas";
import {
  RotateCcw,
  X,
  Download,
  Share2,
  Loader2,
  Lock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { generatePDF, getDocumentContent } from "@/lib/pdf-generator";
import { ChaserSelector } from "@/components/chaser-selector";
import { useAuthContext } from "@/contexts/auth-context";
import {
  useIncident,
  useSignedDocuments,
  useAllChaserSubmissions,
  useIncidentResponders,
} from "@/hooks/use-incidents";
import { Timestamp } from "@/components/timestamp";
import {
  createVerificationProof,
  saveVerificationProof,
} from "@/services/verification";

const E_SIGNATURE_DOCS = [
  {
    id: "1",
    title: "Property Damage Assessment",
    required: true,
    description: "Initial damage evaluation form",
  },
  {
    id: "2",
    title: "Insurance Claim Authorization",
    required: true,
    description: "Authorization to process insurance claim",
  },
  {
    id: "3",
    title: "Emergency Services Agreement",
    required: false,
    description: "Agreement for emergency response services",
  },
  {
    id: "4",
    title: "Property Access Consent",
    required: false,
    description: "Consent for property access and inspection",
  },
  {
    id: "5",
    title: "Photo/Video Release",
    required: false,
    description: "Permission to document property condition",
  },
  {
    id: "6",
    title: "Temporary Repairs Authorization",
    required: false,
    description: "Authorization for emergency temporary repairs",
  },
];

async function loadSignatureAsDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      return url;
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = URL.createObjectURL(blob);
    });
  } catch {
    return url;
  }
}

export default function SignPage() {
  const { user, profile } = useAuthContext();
  const params = useParams();
  const incidentId = params.id as string;

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [chaserSignatureDataURL, setChaserSignatureDataURL] = useState("");
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [viewingChaserId, setViewingChaserId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [selectedChaserId, setSelectedChaserId] = useState<
    string | undefined
  >();
  const [isVerifying, setIsVerifying] = useState(false);

  const homeownerSignatureRef = useRef<SignatureCanvas>(null);

  const { incident, loading: incidentLoading } = useIncident(incidentId);
  const {
    signedDocs,
    loading: signedDocsLoading,
    saveSignedDocument,
    getDocument,
  } = useSignedDocuments(incidentId);
  const { responders } = useIncidentResponders(incident?.responderIds);
  const {
    allSignedDocs,
    loading: allSubmissionsLoading,
  } = useAllChaserSubmissions(incidentId, incident?.responderIds);

  const isLoading = !profile || signedDocsLoading || incidentLoading;
  const isSupe = profile?.role === "supe" || profile?.role === "admin";
  const hasResponded =
    profile?._id && incident?.responderIds?.includes(profile._id);
  const canAccess = isSupe || hasResponded;

  useEffect(() => {
    if (profile?.signatureUrl) {
      loadSignatureAsDataUrl(profile.signatureUrl)
        .then(setChaserSignatureDataURL)
        .catch((error) => {
          console.error("Failed to load signature:", error);
          if (profile.signatureUrl) {
            setChaserSignatureDataURL(profile.signatureUrl);
          }
        });
    }
  }, [profile?.signatureUrl]);

  if (isLoading) return <IncidentSignSkeleton />;

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-muted p-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Response Required</h3>
                <p className="text-sm text-muted-foreground">
                  You must respond to this incident before collecting
                  signatures
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleDocument = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSignDocuments = () => {
    if (!selectedDocs.length) return;
    if (!chaserSignatureDataURL) {
      toast.error("Please add your signature in Profile settings first");
      return;
    }
    setCurrentDocIndex(0);
    setAgreed(false);
    homeownerSignatureRef.current?.clear();
    setDrawerOpen(true);
  };

  const handleSubmitSignature = async () => {
    const homeownerSig = homeownerSignatureRef.current?.toDataURL();
    if (!homeownerSig || homeownerSignatureRef.current?.isEmpty()) {
      toast.error("Please provide homeowner signature");
      return;
    }
    if (!chaserSignatureDataURL) {
      toast.error("Chaser signature not found");
      return;
    }
    if (!agreed) {
      toast.error("You must agree to the document terms");
      return;
    }

    if (!incident?.location?.lat || !incident?.location?.lng) {
      toast.error("Incident location not available");
      return;
    }

    setIsSigning(true);
    try {
      if (currentDocIndex === 0 && !isSupe) {
        setIsVerifying(true);
        toast.info("Verifying location...");

        const proof = await createVerificationProof(
          incident.location.lat,
          incident.location.lng,
          {
            requirePhoto: false,
            requireDeviceAttestation: false,
            maxDistance: 200,
          }
        );

        await saveVerificationProof(incidentId, proof);
        toast.success(
          `Location verified: ${Math.round(
            proof.location.distanceFromIncident
          )}m from incident`
        );
        setIsVerifying(false);
      }

      const doc = E_SIGNATURE_DOCS.find(
        (d) => d.id === selectedDocs[currentDocIndex]
      );
      if (!doc) throw new Error("Document not found");

      await saveSignedDocument(
        selectedDocs[currentDocIndex],
        doc.title,
        homeownerSig,
        chaserSignatureDataURL
      );

      if (currentDocIndex < selectedDocs.length - 1) {
        setCurrentDocIndex((i) => i + 1);
        setAgreed(false);
        homeownerSignatureRef.current?.clear();
      } else {
        toast.success(`${selectedDocs.length} document(s) signed successfully`);
        setDrawerOpen(false);
        setCurrentDocIndex(0);
        setSelectedDocs([]);
      }
    } catch (error) {
      console.error("Failed to sign document:", error);
      if (error instanceof Error && error.message.includes("Too far")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to sign document");
      }
    } finally {
      setIsSigning(false);
      setIsVerifying(false);
    }
  };

  const handleViewSignedDoc = async (docId: string, chaserId?: string) => {
    const doc = E_SIGNATURE_DOCS.find((d) => d.id === docId);
    if (!doc || !user?.uid) return;

    setViewingDocId(docId);
    setViewingChaserId(chaserId || null);
    setViewDrawerOpen(true);
    setIsLoadingPdf(true);

    try {
      const result = await getDocument(docId);
      if (!result?.homeownerSignature || !result?.chaserSignature) {
        toast.error("Failed to load signed document");
        setViewDrawerOpen(false);
        return;
      }
      const pdfBlob = await generatePDF(
        doc.title,
        getDocumentContent(docId),
        result.homeownerSignature,
        result.chaserSignature,
        profile?.name || "Unknown"
      );
      setPdfUrl(URL.createObjectURL(pdfBlob));
    } catch (error) {
      console.error("Failed to generate document:", error);
      toast.error("Failed to generate document");
      setViewDrawerOpen(false);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl || !viewingDocId) return;
    const doc = E_SIGNATURE_DOCS.find((d) => d.id === viewingDocId);
    if (!doc) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${doc.title.replace(/\s+/g, "_")}_Signed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Document downloaded");
  };

  const handleSharePDF = async () => {
    if (!pdfUrl || !viewingDocId) return;
    const doc = E_SIGNATURE_DOCS.find((d) => d.id === viewingDocId);
    if (!doc) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.title,
          text: `Signed document: ${doc.title}`,
          url: pdfUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(pdfUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const currentDoc = E_SIGNATURE_DOCS.find(
    (d) => d.id === selectedDocs[currentDocIndex]
  );
  const getChaserName = (chaserId: string) =>
    responders.find((r) => r._id === chaserId)?.name || "Unknown";

  const ChaserSigningView = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">E-Signature Documents</h2>
        <p className="text-sm text-muted-foreground">
          Select documents to sign with homeowner
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {E_SIGNATURE_DOCS.map((doc) => {
          const isSelected = selectedDocs.includes(doc.id);
          const isSigned = !!signedDocs[doc.id];
          return (
            <div
              key={doc.id}
              className={cn(
                "relative rounded-lg border-2 p-4 transition-all cursor-pointer",
                isSigned
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/50"
              )}
              onClick={() =>
                isSigned ? handleViewSignedDoc(doc.id) : toggleDocument(doc.id)
              }
            >
              {(isSigned || isSelected) && (
                <CheckCircleIcon
                  className={cn(
                    "absolute top-2 right-2 h-5 w-5",
                    isSigned ? "text-green-600" : "text-primary"
                  )}
                />
              )}
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className={cn(
                    "relative rounded-lg p-3",
                    isSigned
                      ? "bg-green-100"
                      : isSelected
                      ? "bg-primary/10"
                      : "bg-muted"
                  )}
                >
                  <DocumentTextIcon
                    className={cn(
                      "h-8 w-8",
                      isSigned
                        ? "text-green-600"
                        : isSelected
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  {doc.required && !isSigned && (
                    <div className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-destructive">
                      <StarIcon className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-tight">
                    {doc.title}
                  </p>
                  <p
                    className={cn(
                      "text-xs leading-tight",
                      isSigned
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {isSigned ? "Signed" : doc.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        className="w-full h-11"
        disabled={!selectedDocs.length}
        onClick={handleSignDocuments}
      >
        Sign{" "}
        {selectedDocs.length > 0
          ? `${selectedDocs.length} Document${
              selectedDocs.length > 1 ? "s" : ""
            }`
          : "Documents"}
      </Button>
    </div>
  );

  const SupeReviewView = () => {
    const currentId = selectedChaserId || responders[0]?._id;
    const chaserSignedDocs =
      allSignedDocs.find((s) => s.chaserId === currentId)?.signedDocs || {};
    const signedCount = Object.keys(chaserSignedDocs).length;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Submissions</h2>
          <p className="text-sm text-muted-foreground">
            Review signed documents from all responders
          </p>
        </div>

        {allSubmissionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !responders.length ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No responders yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <ChaserSelector
              responders={responders}
              selectedId={selectedChaserId}
              onSelect={setSelectedChaserId}
            />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Signed Documents</CardTitle>
                  <Badge variant={signedCount > 0 ? "default" : "secondary"}>
                    {signedCount} signed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {signedCount > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {E_SIGNATURE_DOCS.filter((d) => chaserSignedDocs[d.id]).map(
                      (doc) => (
                        <div
                          key={doc.id}
                          className="rounded-lg border p-3 bg-green-50 dark:bg-green-950/20 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleViewSignedDoc(doc.id, currentId)}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {doc.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Timestamp
                              date={new Date(chaserSignedDocs[doc.id].signedAt)}
                              format="relative"
                            />
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents signed yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {isSupe && hasResponded ? (
        <Tabs defaultValue="my-submissions" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="my-submissions" className="flex-1">
              My Submissions
            </TabsTrigger>
            <TabsTrigger value="review" className="flex-1">
              Review All
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-submissions">
            <ChaserSigningView />
          </TabsContent>
          <TabsContent value="review">
            <SupeReviewView />
          </TabsContent>
        </Tabs>
      ) : isSupe ? (
        <SupeReviewView />
      ) : (
        <ChaserSigningView />
      )}

      {/* Sign Document Drawer */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DrawerTitle>{currentDoc?.title}</DrawerTitle>
                <DrawerDescription>
                  Document {currentDocIndex + 1} of {selectedDocs.length}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-4 relative">
            {isSigning && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">
                    Saving signed document...
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {currentDoc?.description}
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                By signing below, both parties acknowledge agreement to this
                document.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Homeowner Signature
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => homeownerSignatureRef.current?.clear()}
                  disabled={isSigning}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="border-2 border-dashed rounded-lg bg-white touch-none">
                <SignatureCanvas
                  ref={homeownerSignatureRef}
                  canvasProps={{
                    className: "w-full h-40",
                    style: { touchAction: 'none' }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Chaser Signature ({profile?.name || "You"})
              </Label>
              {chaserSignatureDataURL ? (
                <div className="rounded-lg border-2 p-4 bg-muted/30">
                  <img
                    src={chaserSignatureDataURL}
                    alt="Chaser Signature"
                    className="w-full h-32 object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed p-4 bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground">
                    No signature found. Add in Profile settings.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreed"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c as boolean)}
                disabled={isSigning}
              />
              <Label htmlFor="agreed" className="text-sm leading-none">
                Both parties agree to the terms of this document
              </Label>
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSubmitSignature}
              className="w-full h-11"
              disabled={isSigning || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying Location...
                </>
              ) : isSigning ? (
                "Signing..."
              ) : currentDocIndex < selectedDocs.length - 1 ? (
                "Sign & Next"
              ) : (
                "Complete Signing"
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full h-11"
                disabled={isSigning}
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* View PDF Drawer */}
      <Drawer
        open={viewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DrawerTitle>
                  {viewingDocId &&
                    E_SIGNATURE_DOCS.find((d) => d.id === viewingDocId)?.title}
                </DrawerTitle>
                <DrawerDescription>
                  Signed Document{" "}
                  {viewingChaserId && `by ${getChaserName(viewingChaserId)}`}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden px-4">
            {isLoadingPdf ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pdfUrl ? (
              <div className="rounded-lg border bg-muted/50 overflow-hidden h-full">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Signed Document"
                />
              </div>
            ) : null}
          </div>
          <DrawerFooter>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSharePDF}
                variant="outline"
                className="w-full h-11"
                disabled={isLoadingPdf}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="w-full h-11"
                disabled={isLoadingPdf}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full h-11"
                disabled={isLoadingPdf}
              >
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
