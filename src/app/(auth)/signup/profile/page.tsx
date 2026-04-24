"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profilePhotoSchema, type ProfilePhotoInput } from "@/schemas/auth";
import { uploadProfilePhotoBase64 } from "@/services/storage";
import { updateCurrentProfile } from "@/services/profiles";
import { useAuthContext } from "@/contexts/auth-context";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle, Camera, User } from "lucide-react";

export default function ProfilePhotoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { user: _user } = useAuthContext();

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfilePhotoInput>({
    resolver: zodResolver(profilePhotoSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("photoFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (preview) {
        const result = await uploadProfilePhotoBase64(preview);
        if (!result.success) {
          throw new Error("Failed to upload photo");
        }

        await updateCurrentProfile({
          avatarUrl: result.url,
          completedSteps: 1,
        });

        toast.success("Profile photo uploaded!");
      }

      router.push("/signup/legal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/signup/legal");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>
              Step 2 of 4: Upload your profile picture (optional)
            </CardDescription>
          </div>
          <Progress value={(2 / 4) * 100} className="h-2" />
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                {preview ? (
                  <AvatarImage src={preview} alt="Profile preview" />
                ) : (
                  <AvatarFallback>
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="w-full space-y-2">
                <Label htmlFor="photo" className="text-sm font-medium">
                  Profile Photo
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => document.getElementById("photo")?.click()}
                  disabled={isLoading}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {errors.photoFile && (
                  <p className="text-sm text-destructive">
                    {errors.photoFile.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-8">
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || !preview}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
