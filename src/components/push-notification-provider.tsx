"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAuth } from "@/contexts/auth-context";

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useAuth();
  const { isSupported } = usePushNotifications();

  useEffect(() => {
    if (!user || !profile) return;
    if (!isSupported) return;

    const registerServiceWorker = async () => {
      try {
        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();
  }, [user, profile, isSupported]);

  return <>{children}</>;
}
