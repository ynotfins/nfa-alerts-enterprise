"use client";

import { useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { updateLocation } from "@/services/profiles";

export function Presence() {
  const { user, profile } = useAuthContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isChaser = profile?.role === "chaser";
  const locationEnabled = isChaser || profile?.locationTracking?.enabled;
  const shouldStoreLocation = locationEnabled;

  useEffect(() => {
    if (!user) return;

    const updatePresenceAndLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (shouldStoreLocation) {
              try {
                await updateLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                });
              } catch (error) {
                console.error("Failed to update location:", error);
              }
            }
          },
          () => {},
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      }
    };

    updatePresenceAndLocation();

    intervalRef.current = setInterval(() => {
      updatePresenceAndLocation();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, shouldStoreLocation]);

  return null;
}
