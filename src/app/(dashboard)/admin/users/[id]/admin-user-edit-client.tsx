"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Header } from "@/components/layout";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDialog } from "@/hooks/use-dialog";
import { useProfile } from "@/hooks/use-profiles";
import {
  updateProfile,
  suspendUser as suspendUserService,
  unsuspendUser as unsuspendUserService,
  banUser as banUserService,
  unbanUser as unbanUserService,
} from "@/services/profiles";

type UserProfile = {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: "chaser" | "supe" | "admin";
  legal?: {
    dob?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  locationTracking?: {
    enabled: boolean;
    lastUpdate?: number;
    lat?: number;
    lng?: number;
  };
  suspension?: {
    active: boolean;
    until?: number;
    reason?: string;
    by?: string;
  };
  ban?: {
    active: boolean;
    at: number;
    reason?: string;
    by?: string;
  };
  stats?: {
    alertsResponded: number;
    daysActive: number;
  };
};

// Helper functions to extract first/last name from user
const getFirstNameFromUser = (user: UserProfile | null) => {
  if (!user) return "";
  if (user.firstName) return user.firstName;
  if (user.name) return user.name.split(" ")[0] || "";
  return "";
};

const getLastNameFromUser = (user: UserProfile | null) => {
  if (!user) return "";
  if (user.lastName) return user.lastName;
  if (user.name) {
    const parts = user.name.split(" ");
    return parts.slice(1).join(" ") || "";
  }
  return "";
};

export default function AdminUserEditClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { profile: user, loading } = useProfile(userId);

  // Track which user ID we've initialized form for
  const [initializedForId, setInitializedForId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"chaser" | "supe" | "admin">("chaser");
  const [dob, setDob] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [locationTracking, setLocationTracking] = useState(false);

  const [suspendDays, setSuspendDays] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [banReason, setBanReason] = useState("");

  const suspendDrawer = useDialog();
  const banDrawer = useDialog();

  // Initialize form when user data loads (only once per user)
  if (user && initializedForId !== user._id) {
    setInitializedForId(user._id);
    setFirstName(getFirstNameFromUser(user));
    setLastName(getLastNameFromUser(user));
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setRole(user.role || "chaser");
    setDob(user.legal?.dob || "");
    setEmergencyName(user.emergencyContact?.name || "");
    setEmergencyPhone(user.emergencyContact?.phone || "");
    setEmergencyRelationship(user.emergencyContact?.relationship || "");
    setLocationTracking(user.locationTracking?.enabled || false);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">User not found</h2>
          <Button onClick={() => router.push("/admin/users")}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile(userId, {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        address,
        role,
        legal: {
          dob,
        },
        emergencyContact:
          emergencyName && emergencyPhone && emergencyRelationship
            ? {
                name: emergencyName,
                phone: emergencyPhone,
                relationship: emergencyRelationship,
              }
            : undefined,
        locationTracking: {
          enabled: locationTracking,
          lastUpdate: user.locationTracking?.lastUpdate,
          lat: user.locationTracking?.lat,
          lng: user.locationTracking?.lng,
        },
      });
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleSuspend = async () => {
    try {
      const until = suspendDays
        ? Date.now() + parseInt(suspendDays) * 24 * 60 * 60 * 1000
        : undefined;
      await suspendUserService(userId, suspendReason || "", until);
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
      await unsuspendUserService(userId);
      toast.success("User unsuspended");
    } catch {
      toast.error("Failed to unsuspend user");
    }
  };

  const handleBan = async () => {
    try {
      await banUserService(userId, banReason || "");
      toast.success("User banned");
      banDrawer.close();
      setBanReason("");
    } catch {
      toast.error("Failed to ban user");
    }
  };

  const handleUnban = async () => {
    try {
      await unbanUserService(userId);
      toast.success("User unbanned");
    } catch {
      toast.error("Failed to unban user");
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "supe":
        return <Badge variant="default">Supe</Badge>;
      case "chaser":
        return <Badge variant="secondary">Chaser</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Header title="Edit User" back>
        <div className="flex items-center gap-3 mt-3">
          <Avatar className="h-12 w-12 border-2 border-white/20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
            <AvatarFallback className="bg-white/20 text-primary-foreground text-lg">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">{user.name || "No Name"}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {getRoleBadge(user.role)}
              {user.suspension?.active && (
                <Badge variant="outline" className="border-orange-300 text-orange-200 text-xs">
                  Suspended
                </Badge>
              )}
              {user.ban?.active && (
                <Badge variant="outline" className="border-red-300 text-red-200 text-xs">
                  Banned
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {(user.suspension?.active || user.ban?.active) && (
          <div className={`rounded-lg p-3 mb-4 ${user.ban?.active ? "bg-red-500/10 border border-red-500/30" : "bg-orange-500/10 border border-orange-500/30"}`}>
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className={`h-5 w-5 ${user.ban?.active ? "text-red-600" : "text-orange-600"}`} />
              <span className={`font-semibold text-sm ${user.ban?.active ? "text-red-600" : "text-orange-600"}`}>
                {user.ban?.active ? "Banned" : "Suspended"}
              </span>
            </div>
            {user.suspension?.active && (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  {user.suspension.until
                    ? `Until ${new Date(user.suspension.until).toLocaleDateString()}`
                    : "Indefinite"}
                  {user.suspension.reason && ` - ${user.suspension.reason}`}
                </p>
                <Button size="sm" variant="outline" onClick={handleUnsuspend} className="h-7 text-xs">
                  Remove Suspension
                </Button>
              </>
            )}
            {user.ban?.active && (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  Banned on {new Date(user.ban.at).toLocaleDateString()}
                  {user.ban.reason && ` - ${user.ban.reason}`}
                </p>
                <Button size="sm" variant="outline" onClick={handleUnban} className="h-7 text-xs">
                  Remove Ban
                </Button>
              </>
            )}
          </div>
        )}

        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs">Role</Label>
            <Select value={role} onValueChange={(v: "chaser" | "supe" | "admin") => setRole(v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chaser">Chaser</SelectItem>
                <SelectItem value="supe">Supe</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="locationTracking" className="text-sm">Location Tracking</Label>
              <p className="text-xs text-muted-foreground">Allow this user to be tracked</p>
            </div>
            <Switch
              id="locationTracking"
              checked={locationTracking}
              onCheckedChange={setLocationTracking}
            />
          </div>
        </div>

        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="more-info">
            <AccordionTrigger className="text-sm">More Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-xs">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <Label className="text-xs font-semibold mb-3 block">Emergency Contact</Label>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="emergencyName" className="text-xs">Name</Label>
                      <Input
                        id="emergencyName"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="emergencyPhone" className="text-xs">Phone</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="emergencyRelationship" className="text-xs">Relationship</Label>
                      <Input
                        id="emergencyRelationship"
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="actions">
            <AccordionTrigger className="text-sm text-destructive">Danger Zone</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {!user.suspension?.active && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => suspendDrawer.open()}
                  >
                    Suspend User
                  </Button>
                )}
                {!user.ban?.active && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => banDrawer.open()}
                  >
                    Ban User
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="px-4 pb-4 pt-2 border-t bg-background">
        <Button className="w-full" onClick={handleSave}>
          Save Changes
        </Button>
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
