"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Paperclip, Eye, Lock, Loader2 } from "lucide-react";
import { IncidentDocsSkeleton } from "@/components/incidents/incident-detail-skeleton";
import { toast } from "sonner";
import { Timestamp } from "@/components/timestamp";
import { ChaserSelector } from "@/components/chaser-selector";
import { useAuthContext } from "@/contexts/auth-context";
import { useIncident, useIncidentDocuments, useAllChaserSubmissions, useIncidentResponders } from "@/hooks/use-incidents";
import { uploadIncidentDocument, getFileUrl } from "@/services/storage";

interface DocWithUrl {
  _id: string;
  name: string;
  type: string;
  createdAt: number;
  url: string | null;
}

async function loadDocUrls(docs: Array<{ _id: string; name: string; type: string; storagePath: string; createdAt: number }>) {
  return Promise.all(
    docs.map(async (doc) => {
      try {
        const url = await getFileUrl(doc.storagePath);
        return { ...doc, url };
      } catch (error) {
        console.error(`Failed to load URL for ${doc.name}:`, error);
        return { ...doc, url: null };
      }
    })
  );
}

function DocumentList({ docs, onView }: { docs: DocWithUrl[]; onView: (url: string | null) => void }) {
  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet</p>;
  }

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div key={doc._id} className="flex items-center gap-3 rounded-lg border p-3">
          <div className="shrink-0 rounded-lg bg-primary/10 p-2">
            {doc.type?.startsWith("image/") ? <Camera className="h-5 w-5 text-primary" /> : <Paperclip className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{doc.name}</p>
            <p className="text-xs text-muted-foreground">
              <Timestamp date={new Date(doc.createdAt)} />
            </p>
            {doc.url === null && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Access denied - Check Firebase Storage permissions
              </p>
            )}
          </div>
          <button
            onClick={() => onView(doc.url)}
            className="shrink-0 rounded-full p-2 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={doc.url === null}
          >
            {doc.url === null ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-primary" />}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function DocsPage() {
  const params = useParams();
  const incidentId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuthContext();

  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedChaserId, setSelectedChaserId] = useState<string | undefined>();
  const [docsWithUrls, setDocsWithUrls] = useState<DocWithUrl[]>([]);
  const [allChaserDocsWithUrls, setAllChaserDocsWithUrls] = useState<Array<{ chaserId: string; documents: DocWithUrl[] }>>([]);

  const { incident, loading: incidentLoading } = useIncident(incidentId);
  const { documents, loading: docsLoading, refresh: refreshDocs } = useIncidentDocuments(incidentId);
  const { responders } = useIncidentResponders(incident?.responderIds);
  const { allDocuments, loading: allDocsLoading } = useAllChaserSubmissions(incidentId, incident?.responderIds);

  const isLoading = docsLoading || incidentLoading;
  const isSupe = profile?.role === "supe" || profile?.role === "admin";
  const hasResponded = profile?._id && incident?.responderIds?.includes(profile._id);
  const canAccess = isSupe || hasResponded;

  useEffect(() => {
    if (documents.length > 0) loadDocUrls(documents).then(setDocsWithUrls);
    else setDocsWithUrls([]);
  }, [documents]);

  useEffect(() => {
    if (allDocuments.length > 0) {
      Promise.all(
        allDocuments.map(async (c) => ({ chaserId: c.chaserId, documents: await loadDocUrls(c.documents) }))
      ).then(setAllChaserDocsWithUrls);
    } else {
      setAllChaserDocsWithUrls([]);
    }
  }, [allDocuments]);

  const handleFileSelect = (capture?: boolean) => {
    if (!fileInputRef.current) return;
    if (capture) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
    } else {
      fileInputRef.current.accept = "*/*";
      fileInputRef.current.removeAttribute("capture");
    }
    fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadIncidentDocument(incidentId, file, file.name);
      toast.success("Document uploaded");
      setMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refreshDocs();
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleView = (url: string | null) => url && window.open(url, "_blank");

  if (isLoading) return <IncidentDocsSkeleton />;

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-muted p-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Response Required</h3>
                <p className="text-sm text-muted-foreground">You must respond to this incident before uploading documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ChaserDocsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => handleFileSelect(true)} disabled={uploading} className="h-11" variant="outline">
          <Camera className="h-5 w-5 mr-2" />
          Take Photo
        </Button>
        <Button onClick={() => handleFileSelect(false)} disabled={uploading} className="h-11" variant="outline">
          <Paperclip className="h-5 w-5 mr-2" />
          Attach File
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message (max 500 characters)."
            className="min-h-32 resize-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-muted-foreground mt-2">{message.length}/500</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents & Photos ({docsWithUrls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList docs={docsWithUrls} onView={handleView} />
        </CardContent>
      </Card>
    </div>
  );

  const SupeReviewView = () => {
    const currentId = selectedChaserId || responders[0]?._id;
    const chaserDocs = allChaserDocsWithUrls.find((c) => c.chaserId === currentId)?.documents || [];

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Submissions</h2>
          <p className="text-sm text-muted-foreground">Review uploaded documents from all responders</p>
        </div>

        {allDocsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : responders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No responders yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <ChaserSelector responders={responders} selectedId={selectedChaserId} onSelect={setSelectedChaserId} />
            <Card>
              <CardHeader>
                <CardTitle>Documents & Photos ({chaserDocs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentList docs={chaserDocs} onView={handleView} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />

      {isSupe && hasResponded ? (
        <Tabs defaultValue="my-docs" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="my-docs" className="flex-1">My Documents</TabsTrigger>
            <TabsTrigger value="review" className="flex-1">Review All</TabsTrigger>
          </TabsList>
          <TabsContent value="my-docs"><ChaserDocsView /></TabsContent>
          <TabsContent value="review"><SupeReviewView /></TabsContent>
        </Tabs>
      ) : isSupe ? (
        <SupeReviewView />
      ) : (
        <ChaserDocsView />
      )}
    </>
  );
}
