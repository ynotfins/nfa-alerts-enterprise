"use client";

import { createContext, useContext } from "react";
import { Profile } from "@/lib/db";

export type ProfileWithId = Profile & { _id: string };

const ProfileContext = createContext<ProfileWithId | null>(null);

export const ProfileProvider = ProfileContext.Provider;

export function useProfile() {
  const profile = useContext(ProfileContext);
  return profile;
}
