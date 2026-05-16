"use client";

import { useEffect, useRef } from "react";
import { useIncidents } from "./use-incidents";
import { useAuthContext } from "@/contexts/auth-context";

export function useBackgroundGeofencing() {
  const { profile } = useAuthContext();
  const { incidents } = useIncidents();
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const enabled = profile?.geofencingEnabled ?? false;

    if (!enabled || !navigator.geolocation || !("serviceWorker" in navigator)) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "GEOFENCE_DISABLED" });
      }
      return;
    }

    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "GEOFENCE_ENABLED",
        radius: profile?.geofenceRadius ?? 0.5,
      });
    }

    const incidentData = incidents.map((i) => ({
      id: i._id,
      lat: i.location.lat,
      lng: i.location.lng,
      displayId: i.displayId,
      address: i.location.address,
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "GEOFENCE_CHECK",
            lat,
            lng,
            incidents: incidentData,
          });
        }
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [profile?.geofencingEnabled, profile?.geofenceRadius, incidents]);
}
