"use client";

import { useEffect, useState } from "react";
import { useCurrentProfile } from "@/hooks/use-profiles";
import { getMessagingInstance } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { updatePushToken } = useCurrentProfile();
  const unreadCount = 0;

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const messaging = await getMessagingInstance();
    if (messaging) {
      setIsSupported(true);
      checkSubscription();
    }
  };

  useEffect(() => {
    if ("serviceWorker" in navigator && unreadCount !== undefined) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: "UPDATE_BADGE",
            count: unreadCount,
          });
        }
      });

      // Also update badge directly as fallback
      if ("setAppBadge" in navigator) {
        if (unreadCount > 0) {
          navigator.setAppBadge(unreadCount);
        } else {
          navigator.clearAppBadge();
        }
      }
    }
  }, [unreadCount]);

  const checkSubscription = async () => {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js",
      );
      if (!registration) return;

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        setFcmToken(token);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Failed to check token:", error);
    }
  };

  const subscribe = async () => {
    try {
      if (!isSupported) {
        throw new Error("Push notifications not supported");
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      const messaging = await getMessagingInstance();
      if (!messaging) {
        throw new Error("Messaging not supported");
      }

      // Wait for service worker to be ready
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
        vapidKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error("Failed to get push token");
      }

      await updatePushToken(token);
      setFcmToken(token);
      setIsSubscribed(true);

      onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        if (payload.notification) {
          new Notification(payload.notification.title || "New Notification", {
            body: payload.notification.body || "",
            icon: "/icon-192.png",
          });
        }
      });

      return token;
    } catch (error) {
      console.error("Push token registration failed:", error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      if (fcmToken) {
        await updatePushToken("");
        setFcmToken(null);
        setIsSubscribed(false);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription: fcmToken,
    subscribe,
    unsubscribe,
    checkSubscription,
    unreadCount,
    pushEnabled: isSubscribed,
    setPushEnabled: isSubscribed ? unsubscribe : subscribe,
  };
}
