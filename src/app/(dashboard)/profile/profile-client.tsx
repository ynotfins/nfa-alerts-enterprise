"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentProfile } from "@/hooks/use-profiles";
import {
  BellIcon,
  MapPinIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  UserIcon,
  ChartBarIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import { Loader2, RotateCcw } from "lucide-react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
import { authClient } from "@/lib/auth-client";
import { Header, HeaderSkeleton, PageContent, ContentSkeleton } from "@/components/layout";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/use-push-notifications";
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
import SignatureCanvas from "react-signature-canvas";

export default function ProfileClient() {
  const router = useRouter();
  const {
    profile,
    loading,
    updateProfile,
    toggleLocationTracking,
    toggleGeofencing,
  } = useCurrentProfile();

  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [signatureDrawerOpen, setSignatureDrawerOpen] = useState(false);
  const [isUpdatingSignature, setIsUpdatingSignature] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [isUpdatingGeofencing, setIsUpdatingGeofencing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);


  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNameEdit = () => {
    setEditedName(profile?.name || "");
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!editedName.trim()) return;

    try {
      await updateProfile({ name: editedName.trim() });
      toast.success("Name updated");
      setIsEditingName(false);
    } catch {
      toast.error("Failed to update name");
    }
  };

  const handleAvatarChange = async () => {
    toast.info("Photo upload feature coming soon");
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleUpdateSignature = async () => {
    toast.info("Signature update feature coming soon");
  };

  const handlePushNotificationToggle = async (checked: boolean) => {
    if (!isSupported) {
      toast.error("Push notifications not supported in this browser");
      return;
    }

    setIsUpdatingNotifications(true);
    try {
      if (checked) {
        await subscribe();
        toast.success("Push notifications enabled");
      } else {
        await unsubscribe();
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update notifications";
      toast.error(message);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleLocationToggle = async (checked: boolean) => {
    setIsUpdatingLocation(true);
    try {
      await toggleLocationTracking(checked);
      toast.success(checked ? "Location tracking enabled" : "Location tracking disabled");
    } catch {
      toast.error("Failed to update location tracking");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleGeofencingToggle = async (checked: boolean) => {
    setIsUpdatingGeofencing(true);
    try {
      if (checked) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Notification permission required for geofence alerts");
          setIsUpdatingGeofencing(false);
          return;
        }
      }
      await toggleGeofencing(checked, 0.5);
      if (checked && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "GEOFENCE_ENABLED",
          radius: 0.5,
        });
      }
      toast.success(checked ? "Geofence alerts enabled" : "Geofence alerts disabled");
    } catch {
      toast.error("Failed to update geofence alerts");
    } finally {
      setIsUpdatingGeofencing(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }

    localStorage.clear();
    sessionStorage.clear();

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SIGN_OUT" });
    }

    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (e) {
        console.error("Cache delete error:", e);
      }
    }

    window.location.replace("/login");
  };

  const isLoading = loading || !profile;

  return (
    <div className="flex h-full flex-col">
      {isLoading ? <HeaderSkeleton /> : <Header title="Profile" />}

      {isLoading ? (
        <ContentSkeleton className="px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </ContentSkeleton>
      ) : (
        <PageContent className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <Avatar className="h-24 w-24">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
                <AvatarFallback className="text-3xl font-bold">
                  {getInitials(profile.name || "")}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUpdatingAvatar}
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={isUpdatingAvatar}
              >
                {isUpdatingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CameraIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <h2 className="text-2xl font-bold">{profile.name || "Unknown"}</h2>
            <p className="mt-1 text-lg text-primary capitalize">{profile.role}</p>
          </div>

          {profile.stats && (
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="flex flex-col items-center">
                  <p className="text-3xl font-bold text-primary">
                    {profile.stats.alertsResponded}
                  </p>
                  <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">
                    Alerts Responded
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center">
                  <p className="text-3xl font-bold text-primary">
                    {profile.stats.alertsWithNotes || 0}
                  </p>
                  <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">
                    Alerts with Notes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center">
                  <p className="text-3xl font-bold text-primary">
                    {profile.stats.daysActive}
                  </p>
                  <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">
                    Days Active
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Name</label>
                  {!isEditingName ? (
                    <button onClick={handleNameEdit} className="p-1 hover:bg-accent rounded">
                      <PencilIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={handleNameSave} className="p-1 hover:bg-accent rounded">
                        <CheckIcon className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </div>
                {isEditingName ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    className="h-11"
                  />
                ) : (
                  <p className="text-base">{profile.name}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Role</label>
                <p className="text-base capitalize">{profile.role}</p>
                <p className="text-xs text-muted-foreground">
                  Role can only be changed by admin
                </p>
              </div>

              {profile.address && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Address</label>
                    <p className="text-base">{profile.address}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-base">{profile.email}</p>
              </div>

              {profile.phone && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="text-base">{profile.phone}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.signatureUrl && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <img
                    src={profile.signatureUrl}
                    alt="Signature"
                    className="w-full h-24 object-contain"
                  />
                </div>
              )}
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => setSignatureDrawerOpen(true)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {profile.signatureUrl ? "Update Signature" : "Add Signature"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellIcon className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-base">Push Notifications</span>
                    {!isSupported && (
                      <p className="text-xs text-muted-foreground">Not supported in this browser</p>
                    )}
                  </div>
                </div>
                <Switch
                  variant="warning"
                  checked={isSubscribed}
                  onCheckedChange={handlePushNotificationToggle}
                  disabled={!isSupported || isUpdatingNotifications}
                />
              </div>

              <Separator />

              {profile.role === "chaser" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-base">Location Tracking</span>
                      <p className="text-xs text-muted-foreground">
                        Always on for chasers
                      </p>
                    </div>
                  </div>
                  <Switch
                    variant="warning"
                    checked={true}
                    disabled
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-base">Location Tracking</span>
                      <p className="text-xs text-muted-foreground">
                        {profile.locationTracking?.enabled
                          ? "Your location is being shared"
                          : "Location sharing is off"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    variant="warning"
                    checked={profile.locationTracking?.enabled ?? false}
                    onCheckedChange={handleLocationToggle}
                    disabled={isUpdatingLocation}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapIcon className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-base">Geofence Alerts</span>
                    <p className="text-xs text-muted-foreground">
                      {profile.geofencingEnabled
                        ? "Alerts when near incidents"
                        : "Get notified near incidents"}
                    </p>
                  </div>
                </div>
                <Switch
                  variant="warning"
                  checked={profile.geofencingEnabled ?? false}
                  onCheckedChange={handleGeofencingToggle}
                  disabled={isUpdatingGeofencing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <button
                onClick={() => router.push("/profile/information")}
                className="flex items-center justify-between w-full hover:bg-accent p-2 -mx-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <span className="text-base">My Information</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>

              <Separator />

              <button
                onClick={() => router.push("/profile/activity")}
                className="flex items-center justify-between w-full hover:bg-accent p-2 -mx-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ChartBarIcon className="h-5 w-5 text-primary" />
                  <span className="text-base">My Activity</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>

              <Separator />

              <button
                onClick={() => router.push("/help-support")}
                className="flex items-center justify-between w-full hover:bg-accent p-2 -mx-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-primary" />
                  <span className="text-base">Help & Support</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>

              <Separator />

              <button
                onClick={() => router.push("/terms-privacy")}
                className="flex items-center justify-between w-full hover:bg-accent p-2 -mx-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-5 w-5 text-primary" />
                  <span className="text-base">Terms & Privacy</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>

              <Separator />

              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full h-11 bg-red-600 hover:bg-red-700"
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                )}
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </Button>
            </CardContent>
          </Card>
        </div>
        </PageContent>
      )}

      <Drawer
        open={signatureDrawerOpen}
        onOpenChange={setSignatureDrawerOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Update Your Signature</DrawerTitle>
            <DrawerDescription>
              This signature will be used when signing incident documents
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Signature</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSignature}
                  disabled={isUpdatingSignature}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="border-2 border-dashed rounded-lg bg-white touch-none">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "w-full h-40",
                    style: { touchAction: 'none' }
                  }}
                />
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={handleUpdateSignature}
              className="w-full h-11"
              disabled={isUpdatingSignature}
            >
              {isUpdatingSignature ? "Updating..." : "Save Signature"}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full h-11"
                disabled={isUpdatingSignature}
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
