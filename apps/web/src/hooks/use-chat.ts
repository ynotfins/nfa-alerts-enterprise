"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useProfiles } from "@/contexts/profiles-context";
import {
  ThreadWithId,
  MessageWithId,
  subscribeToUserThreads,
  subscribeToChaserToSupesThreads,
  subscribeToThread,
  subscribeToMessages,
  sendMessage as sendMessageService,
  markAsRead as markAsReadService,
  setTyping as setTypingService,
  addReaction as addReactionService,
  removeReaction as removeReactionService,
  getOrCreateDirectThread,
  getOrCreateSupesThread,
  getUnreadCount,
  getOtherParticipantId,
} from "@/services/chat";

export type ThreadWithParticipant = ThreadWithId & {
  otherParticipant?: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
  } | null;
  unreadCount?: number;
};

export function useThreads() {
  const { user, profile } = useAuthContext();
  const { fetchProfile, getProfile } = useProfiles();
  const [userThreads, setUserThreads] = useState<ThreadWithId[]>([]);
  const [chaserThreads, setChaserThreads] = useState<ThreadWithId[]>([]);
  const [loading, setLoading] = useState(true);

  const isSupe = profile?.role === "supe" || profile?.role === "admin";

  useEffect(() => {
    if (!user) return;

    const unsubs: (() => void)[] = [];

    const unsub1 = subscribeToUserThreads(user.uid, (threads) => {
      setUserThreads(threads);
      setLoading(false);
    });
    unsubs.push(unsub1);

    if (isSupe) {
      const unsub2 = subscribeToChaserToSupesThreads((threads) => {
        setChaserThreads(threads);
      });
      unsubs.push(unsub2);
    }

    return () => unsubs.forEach((u) => u());
  }, [user, isSupe]);

  const allThreads = useMemo(() => {
    const map = new Map<string, ThreadWithId>();
    userThreads.forEach((t) => map.set(t._id, t));
    if (isSupe) {
      chaserThreads.forEach((t) => map.set(t._id, t));
    }
    return Array.from(map.values()).sort(
      (a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0),
    );
  }, [userThreads, chaserThreads, isSupe]);

  useEffect(() => {
    if (!user) return;
    allThreads.forEach((thread) => {
      const otherId = getOtherParticipantId(thread, user.uid);
      if (otherId) {
        fetchProfile(otherId);
      }
    });
  }, [allThreads, user, fetchProfile]);

  const threadsWithParticipants: ThreadWithParticipant[] = useMemo(() => {
    if (!user) return [];
    return allThreads.map((thread) => {
      const otherId = getOtherParticipantId(thread, user.uid);
      const otherProfile = otherId ? getProfile(otherId) : null;
      return {
        ...thread,
        otherParticipant: otherProfile
          ? {
              _id: otherProfile._id,
              displayName:
                otherProfile.name ||
                `${otherProfile.firstName || ""} ${otherProfile.lastName || ""}`.trim() ||
                otherProfile.email ||
                "Unknown",
              avatarUrl: otherProfile.avatarUrl,
            }
          : null,
        unreadCount: (thread as ThreadWithId & { unreadCount?: Record<string, number> }).unreadCount?.[user.uid] || 0,
      };
    });
  }, [allThreads, user, getProfile]);

  return { threads: threadsWithParticipants, loading };
}

export function useThread(threadId: string | undefined) {
  const { user } = useAuthContext();
  const { fetchProfile, getProfile } = useProfiles();
  const [thread, setThread] = useState<ThreadWithId | null>(null);
  const [messages, setMessages] = useState<MessageWithId[]>([]);
  const [fetchedId, setFetchedId] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId) {
      return;
    }

    const unsubThread = subscribeToThread(threadId, (data) => {
      setThread(data);
      setFetchedId(threadId);
    });

    const unsubMessages = subscribeToMessages(threadId, setMessages);

    return () => {
      unsubThread();
      unsubMessages();
    };
  }, [threadId]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = threadId ? fetchedId !== threadId : false;

  useEffect(() => {
    if (!thread || !user) return;
    thread.participants.forEach((id) => {
      if (id !== user.uid) {
        fetchProfile(id);
      }
    });
    thread.chaserIds?.forEach((id) => {
      fetchProfile(id);
    });
  }, [thread, user, fetchProfile]);

  const messagesWithSenders = useMemo(() => {
    return messages.map((msg) => {
      const senderProfile = getProfile(msg.senderId);
      return {
        ...msg,
        senderName:
          senderProfile?.name ||
          `${senderProfile?.firstName || ""} ${senderProfile?.lastName || ""}`.trim() ||
          senderProfile?.email ||
          "Unknown",
        senderAvatar: senderProfile?.avatarUrl,
      };
    });
  }, [messages, getProfile]);

  const sendMessage = useCallback(
    async (
      text: string,
      options?: {
        replyTo?: string;
        voice?: { storagePath: string; duration: number };
        attachment?: {
          storagePath: string;
          name: string;
          type: string;
          size: number;
        };
      },
    ) => {
      if (!threadId) return;
      await sendMessageService(threadId, text, options);
    },
    [threadId],
  );

  const markAsRead = useCallback(async () => {
    if (!threadId) return;
    await markAsReadService(threadId);
  }, [threadId]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!threadId) return;
      await setTypingService(threadId, isTyping);
    },
    [threadId],
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!threadId) return;
      await addReactionService(threadId, messageId, emoji);
    },
    [threadId],
  );

  const removeReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!threadId) return;
      await removeReactionService(threadId, messageId, emoji);
    },
    [threadId],
  );

  const otherParticipant = useMemo(() => {
    if (!thread || !user) return null;
    const otherId = getOtherParticipantId(thread, user.uid);
    if (!otherId) return null;
    const p = getProfile(otherId);
    if (!p) return null;
    return {
      _id: p._id,
      displayName:
        p.name ||
        `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
        p.email ||
        "Unknown",
      avatarUrl: p.avatarUrl,
    };
  }, [thread, user, getProfile]);

  return {
    thread,
    messages: messagesWithSenders,
    loading,
    sendMessage,
    markAsRead,
    setTyping,
    addReaction,
    removeReaction,
    otherParticipant,
  };
}

export function useDirectThread(otherUserId: string | undefined) {
  const [thread, setThread] = useState<ThreadWithId | null>(null);
  const [fetchedId, setFetchedId] = useState<string | null>(null);

  useEffect(() => {
    if (!otherUserId) {
      return;
    }

    getOrCreateDirectThread(otherUserId).then((data) => {
      setThread(data);
      setFetchedId(otherUserId);
    });
  }, [otherUserId]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = otherUserId ? fetchedId !== otherUserId : false;

  return { thread, loading };
}

export function useSupesThread(enabled = true) {
  const { user } = useAuthContext();
  const [thread, setThread] = useState<ThreadWithId | null>(null);
  const [fetchKey, setFetchKey] = useState<string | null>(null);

  // Create a key that changes when enabled or user changes
  const currentKey = enabled && user ? `${enabled}:${user.uid}` : null;

  useEffect(() => {
    if (!enabled || !user) {
      return;
    }

    getOrCreateSupesThread()
      .then((data) => {
        setThread(data);
        setFetchKey(`${enabled}:${user.uid}`);
      })
      .catch((err) => {
        console.error("Failed to get/create supes thread:", err);
        setFetchKey(`${enabled}:${user.uid}`);
      });
  }, [enabled, user]);

  // Derive loading: we're loading if we have valid inputs but haven't fetched for this key yet
  const loading = currentKey ? fetchKey !== currentKey : false;

  return { thread, loading };
}

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(setCount);

    const interval = setInterval(() => {
      getUnreadCount().then(setCount);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return count;
}
