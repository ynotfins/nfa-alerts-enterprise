"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCurrentProfile } from "@/hooks/use-profiles";
import { Header } from "@/components/layout";

export default function MyInformationPage() {
  const { profile, loading } = useCurrentProfile();
  const isLoading = loading;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="My Information" back="/profile" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Full Name
                </label>
                <p className="text-base">{profile.name || "Not provided"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-base">{profile.email}</p>
              </div>

              {profile.phone && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-base">{profile.phone}</p>
                  </div>
                </>
              )}

              {profile.address && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Address
                    </label>
                    <p className="text-base">{profile.address}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Role</label>
                <p className="text-base capitalize">{profile.role}</p>
              </div>
            </CardContent>
          </Card>

          {profile.legal && (
            <Card>
              <CardHeader>
                <CardTitle>Legal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.legal.dob && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Date of Birth
                      </label>
                      <p className="text-base">
                        {new Date(profile.legal.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

              </CardContent>
            </Card>
          )}

          {profile.emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.emergencyContact.name && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Name
                      </label>
                      <p className="text-base">
                        {profile.emergencyContact.name}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {profile.emergencyContact.phone && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-base">
                        {profile.emergencyContact.phone}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {profile.emergencyContact.relationship && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Relationship
                    </label>
                    <p className="text-base capitalize">
                      {profile.emergencyContact.relationship}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {profile.signatureUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <img
                    src={profile.signatureUrl}
                    alt="Signature"
                    className="w-full h-24 object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
