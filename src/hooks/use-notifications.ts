"use client";

import { useState, useEffect, useCallback } from "react";
import { AppNotification } from "@/lib/db";
import {
  markNotificationRead as markNotificationReadService,
  markAllNotificationsRead as markAllNotificationsReadService,
  subscribeToNotifications,
  subscribeToUnreadCount,
} from "@/services/notifications";

type NotificationWithId = AppNotification & { _id: string };

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    await markNotificationReadService(notificationId);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await markAllNotificationsReadService();
  }, []);

  return {
    notifications,
    loading,
    markNotificationRead,
    markAllNotificationsRead,
  };
}

export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToUnreadCount(setCount);
    return () => unsubscribe();
  }, []);

  return count;
}
