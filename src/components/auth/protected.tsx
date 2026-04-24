"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { ProfileProvider } from "@/contexts/profile-context";

export function Protected({ children }: { children: ReactNode }) {
  const { profile, state } = useAuth();

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (state !== "authenticated" || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return <ProfileProvider value={profile}>{children}</ProfileProvider>;
}
