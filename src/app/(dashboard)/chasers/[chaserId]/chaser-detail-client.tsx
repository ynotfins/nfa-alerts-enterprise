"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PhoneIcon,
  MapPinIcon,
  SignalIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Header } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatDistanceToNow } from "date-fns";
import { Map, Marker } from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profiles";
import { useAuthContext } from "@/contexts/auth-context";
import {
  updateProfile,
  suspendUser,
  unsuspendUser,
  banUser,
  unbanUser,
} from "@/services/profiles";
import { useDialog } from "@/hooks/use-dialog";

export default function ChaserDetailClient({ chaserId }: { chaserId: string }) {
  const router = useRouter();
  const { profile: chaser, loading } = useProfile(chaserId);
  const { profile: currentUser } = useAuthContext();

  const [suspendDays, setSuspendDays] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [banReason, setBanReason] = useState("");

  const suspendDrawer = useDialog();
  const banDrawer = useDialog();

  const isSupe = currentUser?.role === "supe" || currentUser?.role === "admin";

  const lastLocation = chaser?.locationTracking;
  const hasLocation = lastLocation?.lat && lastLocation?.lng;

  const handleToggleTracking = async (enabled: boolean) => {
    try {
      await updateProfile(chaserId, {
        locationTracking: {
          ...lastLocation,
          enabled,
        },
      });
      toast.success(
        enabled ? "Location tracking enabled" : "Location tracking disabled",
      );
    } catch {
      toast.error("Failed to update location tracking");
    }
  };

  const handleSuspend = async () => {
    try {
      const until = suspendDays
        ? Date.now() + parseInt(suspendDays) * 24 * 60 * 60 * 1000
        : undefined;
      await suspendUser(chaserId, suspendReason || "", until);
      toast.success("User suspended");
      suspendDrawer.close();
      setSuspendDays("");
      setSuspendReason("");
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const handleUnsuspend = async () => {
    try {
      await unsuspendUser(chaserId);
      toast.success("User unsuspended");
    } catch {
      toast.error("Failed to unsuspend user");
    }
  };

  const handleBan = async () => {
    try {
      await banUser(chaserId, banReason || "");
      toast.success("User banned");
      banDrawer.close();
      setBanReason("");
    } catch {
      toast.error("Failed to ban user");
    }
  };

  const handleUnban = async () => {
    try {
      await unbanUser(chaserId);
      toast.success("User unbanned");
    } catch {
      toast.error("Failed to unban user");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!chaser) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <h2 className="text-lg font-semibold">Chaser Not Found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Chaser Details" back />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage
                src={chaser.avatarUrl}
                alt={chaser.name || "Chaser"}
              />
              <AvatarFallback className="text-2xl">
                {chaser.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold">{chaser.name || "Unknown"}</h2>
              {chaser.locationTracking?.enabled && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="gap-1">
                    <SignalIcon className="h-3 w-3" />
                    Live Tracking
                  </Badge>
                </div>
              )}
              {chaser.email && (
                <p className="text-sm text-muted-foreground mt-2">
                  {chaser.email}
                </p>
              )}
              {chaser.phone && (
                <p className="text-sm text-muted-foreground">{chaser.phone}</p>
              )}
            </div>
          </div>

          {chaser.phone && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={`tel:${chaser.phone}`}>
                <PhoneIcon className="h-4 w-4 mr-1" />
                Call
              </a>
            </Button>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Alerts Responded</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold mb-2">
                  {chaser.stats?.alertsResponded || 0}
                </p>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (chaser.stats?.alertsResponded || 0) * 2,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Days Active</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold mb-2">
                  {chaser.stats?.daysActive || 0}
                </p>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((chaser.stats?.daysActive || 0) / 365) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {chaser.address && (
            <div className="border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Home Address</p>
              <p className="text-sm font-medium">{chaser.address}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Location Tracking
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="location-tracking"
                    className="text-sm text-muted-foreground"
                  >
                    {lastLocation?.enabled ? "Enabled" : "Disabled"}
                  </Label>
                  <Switch
                    id="location-tracking"
                    checked={lastLocation?.enabled ?? false}
                    onCheckedChange={handleToggleTracking}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasLocation ? (
                <div className="space-y-3">
                  <div className="w-full h-48 rounded-lg overflow-hidden border">
                    <Map
                      defaultCenter={{
                        lat: lastLocation.lat!,
                        lng: lastLocation.lng!,
                      }}
                      defaultZoom={15}
                      disableDefaultUI
                      zoomControl
                    >
                      <Marker
                        position={{
                          lat: lastLocation.lat!,
                          lng: lastLocation.lng!,
                        }}
                      />
                    </Map>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={lastLocation.enabled ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {lastLocation.enabled ? "Live" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Coordinates</span>
                      <span className="font-mono text-xs">
                        {lastLocation.lat!.toFixed(4)},{" "}
                        {lastLocation.lng!.toFixed(4)}
                      </span>
                    </div>
                    {lastLocation.accuracy && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="text-xs">
                          ±{lastLocation.accuracy.toFixed(0)}m
                        </span>
                      </div>
                    )}
                    {lastLocation.lastUpdate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Last Update
                        </span>
                        <span className="text-xs">
                          {formatDistanceToNow(
                            new Date(lastLocation.lastUpdate),
                          )}{" "}
                          ago
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Open in Google Maps
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No location data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {chaser.emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">
                    {chaser.emergencyContact.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <a
                    href={`tel:${chaser.emergencyContact.phone}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {chaser.emergencyContact.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Relationship</span>
                  <span className="font-medium">
                    {chaser.emergencyContact.relationship}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {isSupe && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
                  Moderation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(chaser.suspension?.active || chaser.ban?.active) && (
                  <div
                    className={`rounded-lg p-3 ${chaser.ban?.active ? "bg-red-500/10 border border-red-500/30" : "bg-orange-500/10 border border-orange-500/30"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ExclamationTriangleIcon
                        className={`h-5 w-5 ${chaser.ban?.active ? "text-red-600" : "text-orange-600"}`}
                      />
                      <span
                        className={`font-semibold text-sm ${chaser.ban?.active ? "text-red-600" : "text-orange-600"}`}
                      >
                        {chaser.ban?.active ? "Banned" : "Suspended"}
                      </span>
                    </div>
                    {chaser.suspension?.active && (
                      <>
                        <p className="text-xs text-muted-foreground mb-2">
                          {chaser.suspension.until
                            ? `Until ${new Date(chaser.suspension.until).toLocaleDateString()}`
                            : "Indefinite"}
                          {chaser.suspension.reason &&
                            ` - ${chaser.suspension.reason}`}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUnsuspend}
                          className="h-7 text-xs"
                        >
                          Remove Suspension
                        </Button>
                      </>
                    )}
                    {chaser.ban?.active && (
                      <>
                        <p className="text-xs text-muted-foreground mb-2">
                          Banned on{" "}
                          {new Date(chaser.ban.at).toLocaleDateString()}
                          {chaser.ban.reason && ` - ${chaser.ban.reason}`}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUnban}
                          className="h-7 text-xs"
                        >
                          Remove Ban
                        </Button>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {!chaser.suspension?.active && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => suspendDrawer.open()}
                    >
                      Suspend User
                    </Button>
                  )}
                  {!chaser.ban?.active && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={() => banDrawer.open()}
                    >
                      Ban User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Drawer open={suspendDrawer.isOpen} onOpenChange={suspendDrawer.setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Suspend User</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input
                type="number"
                placeholder="Leave empty for indefinite"
                value={suspendDays}
                onChange={(e) => setSuspendDays(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSuspend}>Suspend User</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={banDrawer.isOpen} onOpenChange={banDrawer.setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Ban User</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently ban the user.
            </p>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DrawerFooter>
            <Button variant="destructive" onClick={handleBan}>
              Ban User
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
