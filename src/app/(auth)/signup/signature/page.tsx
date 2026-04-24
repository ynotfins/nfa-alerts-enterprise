"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SignatureCanvas from "react-signature-canvas";
import {
  liabilitySignatureSchema,
  type LiabilitySignatureInput,
} from "@/schemas/auth";
import { uploadSignature } from "@/services/storage";
import { updateCurrentProfile } from "@/services/profiles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function SignaturePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LiabilitySignatureInput>({
    resolver: zodResolver(liabilitySignatureSchema),
  });

  const clearSignature = () => {
    signatureRef.current?.clear();
    setValue("signature", "");
    setSignatureError(false);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSignatureError(false);

    try {
      const signature = signatureRef.current?.toDataURL();
      if (!signature || signatureRef.current?.isEmpty()) {
        setError("Please provide your signature");
        setSignatureError(true);
        setIsLoading(false);
        return;
      }

      if (!agreed) {
        setError("You must agree to the terms");
        setIsLoading(false);
        return;
      }

      const result = await uploadSignature(signature);
      if (!result.success) {
        throw new Error("Failed to upload signature");
      }

      await updateCurrentProfile({
        signatureUrl: result.url,
        signedAt: Date.now(),
        completedSteps: 4,
      });

      sessionStorage.clear();

      toast.success("Profile completed! Welcome to NFA Alerts.");
      window.location.href = "/incidents";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Liability Agreement</CardTitle>
            <CardDescription>
              Step 4 of 4: Sign the liability waiver
            </CardDescription>
          </div>
          <Progress value={(4 / 4) * 100} className="h-2" />
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  By signing below, I acknowledge that I have read and agree to
                  the terms and conditions, liability waiver, and privacy
                  policy. I understand the risks involved in emergency response
                  work and agree to hold harmless all parties involved.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Signature</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSignature}
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                <div
                  className={`border-2 border-dashed rounded-lg bg-white ${signatureError ? "border-destructive" : ""}`}
                >
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-40 touch-none",
                    }}
                    onBegin={() => setSignatureError(false)}
                    onEnd={() => {
                      const data = signatureRef.current?.toDataURL();
                      setValue("signature", data || "");
                    }}
                  />
                </div>
                {signatureError && (
                  <p className="text-sm text-destructive">
                    Signature is required
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreed"
                  checked={agreed}
                  onCheckedChange={(checked) => {
                    setAgreed(checked as boolean);
                    setValue("agreed", checked as true);
                  }}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="agreed"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions
                </Label>
              </div>
              {errors.agreed && (
                <p className="text-sm text-destructive">
                  {errors.agreed.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-8">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => router.push("/signup/legal")}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Signup
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
