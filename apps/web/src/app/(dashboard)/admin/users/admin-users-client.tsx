"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  UserIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import { useAllProfiles } from "@/hooks/use-profiles";
import { Header } from "@/components/layout";
import {
  suspendUser as suspendUserService,
  unsuspendUser as unsuspendUserService,
  banUser as banUserService,
  unbanUser as unbanUserService,
} from "@/services/profiles";

type UserProfile = {
  _id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: "chaser" | "supe" | "admin";
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

const roleFilters = [
  { value: "all", label: "All" },
  { value: "admin", label: "Admins" },
  { value: "supe", label: "Supes" },
  { value: "chaser", label: "Chasers" },
];

export default function AdminUsersClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [suspendDays, setSuspendDays] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [banReason, setBanReason] = useState("");

  const actionsDrawer = useDialog<string>();
  const suspendDrawer = useDialog<string>();
  const banDrawer = useDialog<string>();

  const { profiles, loading, refresh } = useAllProfiles();

  const users = profiles as UserProfile[];

  const filteredUsers = users.filter((user) => {
    if (
      searchQuery &&
      !user.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }
    return true;
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    supe: users.filter((u) => u.role === "supe").length,
    chaser: users.filter((u) => u.role === "chaser").length,
  };

  const handleSuspend = async () => {
    if (!suspendDrawer.data) return;
    try {
      const until = suspendDays
        ? Date.now() + parseInt(suspendDays) * 24 * 60 * 60 * 1000
        : undefined;
      await suspendUserService(
        suspendDrawer.data,
        suspendReason || "",
        until
      );
      toast.success("User suspended");
      suspendDrawer.close();
      setSuspendDays("");
      setSuspendReason("");
      await refresh();
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const handleUnsuspend = async (profileId: string) => {
    try {
      await unsuspendUserService(profileId);
      toast.success("User unsuspended");
      actionsDrawer.close();
      await refresh();
    } catch {
      toast.error("Failed to unsuspend user");
    }
  };

  const handleBan = async () => {
    if (!banDrawer.data) return;
    try {
      await banUserService(banDrawer.data, banReason || "");
      toast.success("User banned");
      banDrawer.close();
      setBanReason("");
      await refresh();
    } catch {
      toast.error("Failed to ban user");
    }
  };

  const handleUnban = async (profileId: string) => {
    try {
      await unbanUserService(profileId);
      toast.success("User unbanned");
      actionsDrawer.close();
      await refresh();
    } catch {
      toast.error("Failed to unban user");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Users">
        <div className="relative mt-3">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/60" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60"
          />
        </div>
      </Header>

      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {roleFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(filter.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                roleFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {filter.label}
              <span className="ml-1.5 text-xs opacity-70">
                {counts[filter.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Users Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {searchQuery || roleFilter !== "all"
                ? "No users match your search"
                : "No users in system"}
            </p>
            {(searchQuery || roleFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 px-4 border-b py-3 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/users/${user._id}`)}
            >
              <Avatar className="h-11 w-11 shrink-0">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold truncate text-sm">
                    {user.name || "No Name"}
                  </h3>
                  {user.suspension?.active && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600 text-[10px] px-1.5 py-0">
                      Suspended
                    </Badge>
                  )}
                  {user.ban?.active && (
                    <Badge variant="outline" className="border-red-500 text-red-600 text-[10px] px-1.5 py-0">
                      Banned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email || "No email"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {getRoleBadge(user.role)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    actionsDrawer.open(user._id);
                  }}
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Drawer open={actionsDrawer.isOpen} onOpenChange={actionsDrawer.setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>User Actions</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (actionsDrawer.data) {
                  router.push(`/admin/users/${actionsDrawer.data}`);
                  actionsDrawer.close();
                }
              }}
            >
              Edit User
            </Button>

            {actionsDrawer.data &&
              users.find((u) => u._id === actionsDrawer.data)?.suspension
                ?.active && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (actionsDrawer.data) {
                      handleUnsuspend(actionsDrawer.data);
                    }
                  }}
                >
                  Remove Suspension
                </Button>
              )}

            {actionsDrawer.data &&
              !users.find((u) => u._id === actionsDrawer.data)?.suspension
                ?.active && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    suspendDrawer.open(actionsDrawer.data);
                    actionsDrawer.close();
                  }}
                >
                  Suspend User
                </Button>
              )}

            {actionsDrawer.data &&
              users.find((u) => u._id === actionsDrawer.data)?.ban?.active && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (actionsDrawer.data) {
                      handleUnban(actionsDrawer.data);
                    }
                  }}
                >
                  Remove Ban
                </Button>
              )}

            {actionsDrawer.data &&
              !users.find((u) => u._id === actionsDrawer.data)?.ban?.active && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    banDrawer.open(actionsDrawer.data);
                    actionsDrawer.close();
                  }}
                >
                  Ban User
                </Button>
              )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
              <p className="text-xs text-muted-foreground">
                Leave empty for indefinite suspension
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Why is this user being suspended?"
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
              This will permanently ban the user from the platform.
            </p>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Why is this user being banned?"
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
