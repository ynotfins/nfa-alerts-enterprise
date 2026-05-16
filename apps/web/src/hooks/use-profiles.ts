"use client";

import { useState, useEffect, useCallback } from "react";
import { Profile } from "@/lib/db";
import {
  updateCurrentProfile,
  toggleLocationTracking as toggleLocationTrackingService,
  toggleGeofencing as toggleGeofencingService,
  updateLocation as updateLocationService,
  completeWalkthrough as completeWalkthroughService,
  updatePushToken as updatePushTokenService,
  listChasers,
  listAllProfiles,
  subscribeToProfile,
} from "@/services/profiles";
import { useAuthContext } from "@/contexts/auth-context";

type ProfileWithId = Profile & { _id: string };

export function useCurrentProfile() {
  const { profile, loading } = useAuthContext();

  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    await updateCurrentProfile(data);
  }, []);

  const toggleLocationTracking = useCallback(async (enabled: boolean) => {
    await toggleLocationTrackingService(enabled);
  }, []);

  const toggleGeofencing = useCallback(async (enabled: boolean, radius?: number) => {
    await toggleGeofencingService(enabled, radius);
  }, []);

  const updateLocation = useCallback(
    async (coords: {
      lat: number;
      lng: number;
      accuracy: number;
      heading?: number;
      speed?: number;
    }) => {
      await updateLocationService(coords);
    },
    []
  );

  const completeWalkthrough = useCallback(async () => {
    await completeWalkthroughService();
  }, []);

  const updatePushToken = useCallback(async (token: string) => {
    await updatePushTokenService(token);
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    toggleLocationTracking,
    toggleGeofencing,
    updateLocation,
    completeWalkthrough,
    updatePushToken,
  };
}

export function useProfile(profileId: string | undefined) {
  const [profile, setProfile] = useState<ProfileWithId | null>(null);
  const [fetchedId, setFetchedId] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      return;
    }

    const unsubscribe = subscribeToProfile(profileId, (data) => {
      setProfile(data);
      setFetchedId(profileId);
    });

    return () => unsubscribe();
  }, [profileId]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = profileId ? fetchedId !== profileId : false;

  return { profile, loading };
}

export function useChasers() {
  const [chasers, setChasers] = useState<
    Array<ProfileWithId & { isOnline: boolean }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listChasers().then((data) => {
      setChasers(data);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const data = await listChasers();
    setChasers(data);
  }, []);

  return { chasers, loading, refresh };
}

export function useAllProfiles() {
  const [profiles, setProfiles] = useState<ProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllProfiles().then((data) => {
      setProfiles(data);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const data = await listAllProfiles();
    setProfiles(data);
  }, []);

  return { profiles, loading, refresh };
}
