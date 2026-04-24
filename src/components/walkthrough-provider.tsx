"use client";

import { useAuth } from "@/contexts/auth-context";
import { AppWalkthrough } from "./app-walkthrough";

export function WalkthroughProvider() {
  const { profile } = useAuth();

  if (!profile || !profile.role) return null;

  return (
    <AppWalkthrough
      role={profile.role}
      hasCompleted={profile.hasCompletedWalkthrough ?? false}
    />
  );
}
