"use client";

import { useEffect, useState } from "react";
import { GavelIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";

export default function SuspendedPage() {
  const { profile, signOut } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");

  const suspension = profile?.suspension;
  const ban = profile?.ban;

  useEffect(() => {
    if (!suspension?.until) return;

    const updateTime = () => {
      const now = Date.now();
      const diff = suspension.until! - now;

      if (diff <= 0) {
        setTimeLeft("Suspension ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${minutes}m remaining`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [suspension?.until]);

  if (ban?.active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <GavelIcon className="h-10 w-10 text-destructive" weight="fill" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Account Banned</h1>
            <p className="text-muted-foreground">
              Your account has been permanently banned.
            </p>
            {ban.reason && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-left">
                <p className="font-medium mb-1">Reason:</p>
                <p className="text-muted-foreground">{ban.reason}</p>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={signOut} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center">
          <GavelIcon className="h-10 w-10 text-orange-500" weight="fill" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account Suspended</h1>
          <p className="text-muted-foreground">
            Your account has been temporarily suspended.
          </p>
          {timeLeft && (
            <p className="text-lg font-semibold text-orange-500">{timeLeft}</p>
          )}
          {suspension?.until && (
            <p className="text-xs text-muted-foreground">
              Until{" "}
              {format(new Date(suspension.until), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
          {suspension?.reason && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-left">
              <p className="font-medium mb-1">Reason:</p>
              <p className="text-muted-foreground">{suspension.reason}</p>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={signOut} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
