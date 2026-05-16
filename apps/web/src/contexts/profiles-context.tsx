"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Profile } from "@/lib/db";

type ProfileWithId = Profile & { _id: string };

interface ProfilesContextValue {
  profiles: Map<string, ProfileWithId>;
  getProfile: (id: string) => ProfileWithId | undefined;
  fetchProfile: (id: string) => Promise<ProfileWithId | null>;
  subscribeToProfile: (id: string) => () => void;
}

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Map<string, ProfileWithId>>(new Map());
  const [subscriptions] = useState<Map<string, () => void>>(new Map());

  const getProfile = useCallback((id: string) => {
    return profiles.get(id);
  }, [profiles]);

  const fetchProfile = useCallback(async (id: string): Promise<ProfileWithId | null> => {
    const existing = profiles.get(id);
    if (existing) return existing;

    try {
      const ref = doc(db, "profiles", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const profile = { _id: snap.id, ...snap.data() } as ProfileWithId;
        setProfiles(prev => new Map(prev).set(id, profile));
        return profile;
      }
    } catch (err) {
      console.error("Failed to fetch profile:", id, err);
    }
    return null;
  }, [profiles]);

  const subscribeToProfile = useCallback((id: string) => {
    if (subscriptions.has(id)) {
      return () => {};
    }

    const ref = doc(db, "profiles", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const profile = { _id: snap.id, ...snap.data() } as ProfileWithId;
        setProfiles(prev => new Map(prev).set(id, profile));
      }
    });

    subscriptions.set(id, unsub);

    return () => {
      const sub = subscriptions.get(id);
      if (sub) {
        sub();
        subscriptions.delete(id);
      }
    };
  }, [subscriptions]);

  useEffect(() => {
    return () => {
      subscriptions.forEach(unsub => unsub());
      subscriptions.clear();
    };
  }, [subscriptions]);

  return (
    <ProfilesContext.Provider value={{ profiles, getProfile, fetchProfile, subscribeToProfile }}>
      {children}
    </ProfilesContext.Provider>
  );
}

export function useProfiles() {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error("useProfiles must be used within ProfilesProvider");
  return ctx;
}

export function useProfile(id: string | undefined) {
  const { getProfile, subscribeToProfile, fetchProfile } = useProfiles();
  const [profile, setProfile] = useState<ProfileWithId | undefined>(
    id ? getProfile(id) : undefined
  );
  const [subscribedId, setSubscribedId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch profile if not cached, setState happens in fetchProfile's callback
    const cached = getProfile(id);
    if (!cached) {
      fetchProfile(id).then((p) => {
        if (p) setProfile(p);
      });
    }

    return subscribeToProfile(id);
  }, [id, getProfile, subscribeToProfile, fetchProfile]);

  // Sync profile from cache when it changes (using derived state pattern)
  const cachedProfile = id ? getProfile(id) : undefined;
  if (cachedProfile && cachedProfile !== profile && subscribedId !== id) {
    setProfile(cachedProfile);
    setSubscribedId(id ?? null);
  }

  return profile;
}
