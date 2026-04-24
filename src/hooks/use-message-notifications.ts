"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useThreads } from "./use-chat";

export function useMessageNotifications() {
  const { profile } = useAuth();
  const { threads } = useThreads();
  const prevUnreadCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!threads || !profile) return;

    const unreadCount = threads.reduce((total, thread) => {
      if (thread.lastMessageSenderId === profile._id) return total;
      return total + 1;
    }, 0);

    if (isInitialLoadRef.current) {
      prevUnreadCountRef.current = unreadCount;
      isInitialLoadRef.current = false;
      return;
    }

    prevUnreadCountRef.current = unreadCount;
  }, [threads, profile]);
}
