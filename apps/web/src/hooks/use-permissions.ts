"use client";

import { useState, useEffect, useCallback } from "react";
import { updatePushToken } from "@/services/profiles";
import { getMessagingInstance } from "@/lib/firebase";
import { getToken } from "firebase/messaging";

export type PermissionStatus = "granted" | "denied" | "prompt" | "unsupported";

export interface PermissionState {
  notifications: PermissionStatus;
  location: PermissionStatus;
  camera: PermissionStatus;
  microphone: PermissionStatus;
}

export interface PermissionInfo {
  key: keyof PermissionState;
  name: string;
  description: string;
  required: boolean;
}

export const REQUIRED_PERMISSIONS: PermissionInfo[] = [
  {
    key: "notifications",
    name: "Push Notifications",
    description: "Receive instant alerts for incidents and messages",
    required: true,
  },
  {
    key: "location",
    name: "Location Access",
    description: "Enable route planning and proximity alerts",
    required: true,
  },
  {
    key: "camera",
    name: "Camera Access",
    description: "Take photos of incidents and documents",
    required: false,
  },
];

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionState>({
    notifications: "prompt",
    location: "prompt",
    camera: "prompt",
    microphone: "prompt",
  });
  const [hasFetched, setHasFetched] = useState(false);

  const getPermissionState = useCallback(async (): Promise<PermissionState> => {
    const state: PermissionState = {
      notifications: "unsupported",
      location: "unsupported",
      camera: "unsupported",
      microphone: "unsupported",
    };

    // Check notification permission
    if ("Notification" in window) {
      const notifPerm = Notification.permission;
      state.notifications = notifPerm === "default" ? "prompt" : notifPerm;

      // Get FCM token if notifications granted
      if (notifPerm === "granted") {
        try {
          const messaging = await getMessagingInstance();
          if (messaging) {
            const registration = await navigator.serviceWorker.getRegistration(
              "/firebase-messaging-sw.js",
            );
            if (registration) {
              const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
                serviceWorkerRegistration: registration,
              });
              if (token) {
                await updatePushToken(token);
              }
            }
          }
        } catch (error) {
          console.error("Failed to get FCM token:", error);
        }
      }
    }

    // Check geolocation permission
    if ("geolocation" in navigator) {
      // Check localStorage first (for Safari/iOS which doesn't support permissions.query for geolocation)
      const storedLocationPerm = localStorage.getItem("location-permission");
      if (storedLocationPerm === "granted") {
        state.location = "granted";
      } else if (storedLocationPerm === "denied") {
        state.location = "denied";
      } else if ("permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({
            name: "geolocation",
          });
          state.location = result.state === "prompt" ? "prompt" : result.state;
        } catch {
          // Safari doesn't support geolocation permission query, fall back to prompt
          state.location = "prompt";
        }
      } else {
        state.location = "prompt";
      }
    }

    // Check camera permission
    if ("mediaDevices" in navigator && "permissions" in navigator) {
      try {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        state.camera = result.state === "prompt" ? "prompt" : result.state;
      } catch (error) {
        console.error("Failed to check camera permission:", error);
        state.camera = "prompt";
      }
    }

    // Check microphone permission
    if ("mediaDevices" in navigator && "permissions" in navigator) {
      try {
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        state.microphone = result.state === "prompt" ? "prompt" : result.state;
      } catch (error) {
        console.error("Failed to check microphone permission:", error);
        state.microphone = "prompt";
      }
    }

    return state;
  }, []);

  const checkPermissions = useCallback(async () => {
    const state = await getPermissionState();
    setPermissions(state);
    setHasFetched(true);
  }, [getPermissionState]);

  useEffect(() => {
    getPermissionState().then((state) => {
      setPermissions(state);
      setHasFetched(true);
    });
  }, [getPermissionState]);

  // Derive loading from hasFetched
  const loading = !hasFetched;

  const requestNotifications = useCallback(async () => {
    if (!("Notification" in window)) return false;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPermissions((p) => ({ ...p, notifications: "denied" }));
      return false;
    }

    // Get FCM token
    try {
      const messaging = await getMessagingInstance();
      if (messaging) {
        let registration = await navigator.serviceWorker.getRegistration(
          "/firebase-messaging-sw.js",
        );
        if (!registration) {
          registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
          );
        }
        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          await updatePushToken(token);
        }
      }
      setPermissions((p) => ({ ...p, notifications: "granted" }));
      return true;
    } catch (error) {
      console.error("FCM token failed:", error);
      setPermissions((p) => ({ ...p, notifications: "granted" }));
      return true;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!("geolocation" in navigator)) return false;

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async () => {
          localStorage.setItem("location-permission", "granted");
          setPermissions((p) => ({ ...p, location: "granted" }));
          resolve(true);
        },
        async (error) => {
          console.error("Location permission error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            localStorage.setItem("location-permission", "denied");
          }
          setPermissions((p) => ({ ...p, location: "denied" }));
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }, []);

  const requestCamera = useCallback(async () => {
    if (!("mediaDevices" in navigator)) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((p) => ({ ...p, camera: "granted" }));
      return true;
    } catch (error) {
      console.error("Camera permission failed:", error);
      setPermissions((p) => ({ ...p, camera: "denied" }));
      return false;
    }
  }, []);

  const requestPermission = useCallback(
    async (key: keyof PermissionState) => {
      switch (key) {
        case "notifications":
          return requestNotifications();
        case "location":
          return requestLocation();
        case "camera":
          return requestCamera();
        default:
          return false;
      }
    },
    [requestNotifications, requestLocation, requestCamera],
  );

  const allRequiredGranted = REQUIRED_PERMISSIONS.filter(
    (p) => p.required,
  ).every((p) => permissions[p.key] === "granted");

  const anyDenied = REQUIRED_PERMISSIONS.some(
    (p) => permissions[p.key] === "denied",
  );

  return {
    permissions,
    loading,
    requestPermission,
    requestNotifications,
    requestLocation,
    requestCamera,
    checkPermissions,
    allRequiredGranted,
    anyDenied,
  };
}
