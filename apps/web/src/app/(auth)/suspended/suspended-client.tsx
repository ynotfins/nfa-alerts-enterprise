"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { authClient } from "@/lib/auth-client";
import { ShieldExclamationIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function SuspendedClient() {
  const router = useRouter();
  const { user, profile } = useAuthContext();
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (profile && !profile.suspension?.active && !profile.ban?.active) {
      router.push("/incidents");
      return;
    }

    if (profile?.suspension?.active && profile.suspension.until) {
      const updateTimer = () => {
        if (!profile.suspension?.until) return;
        const now = Date.now();
        const diff = profile.suspension.until - now;

        if (diff <= 0) {
          router.push("/incidents");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);

      return () => clearInterval(interval);
    }
  }, [user, profile, router]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isBanned = profile.ban?.active;
  const isSuspended = profile.suspension?.active;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-muted/20 to-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto mb-4 rounded-full bg-destructive/10 p-4 w-fit">
            <ShieldExclamationIcon className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {isBanned ? "Account Banned" : "Account Suspended"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBanned ? (
            <>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Your account has been permanently banned from the platform.
                </p>
                {profile.ban?.reason && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Reason:</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.ban.reason}
                    </p>
                  </div>
                )}
                {profile.ban?.at && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Banned on{" "}
                    {new Date(profile.ban.at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </>
          ) : isSuspended ? (
            <>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Your account has been temporarily suspended.
                </p>
                {profile.suspension?.until ? (
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg flex items-center justify-center gap-2">
                    <ClockIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Time Remaining</p>
                      <p className="text-lg font-bold text-primary">
                        {timeRemaining}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Indefinite Suspension</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact an administrator for more information
                    </p>
                  </div>
                )}
                {profile.suspension?.reason && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Reason:</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.suspension.reason}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}

          <div className="pt-4 space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              If you believe this is a mistake, please contact support.
            </p>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
