import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { getProfile } from "@/services/profiles";
import { Thread, Message } from "@/lib/db";

const THREADS = "threads";
const DEFAULT_QUERY_LIMIT = 50;

export type ThreadWithId = Thread & { _id: string };
export type MessageWithId = Message & { _id: string };

export async function getThread(
  threadId: string,
): Promise<ThreadWithId | null> {
  const ref = doc(db, THREADS, threadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { _id: snap.id, ...snap.data() } as ThreadWithId;
}

export async function listThreads(): Promise<ThreadWithId[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, THREADS),
    where("participants", "array-contains", user.uid),
    orderBy("lastMessageAt", "desc"),
    limit(DEFAULT_QUERY_LIMIT),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ _id: d.id, ...d.data() }) as ThreadWithId);
}

export async function getOrCreateDirectThread(
  otherUserId: string,
): Promise<ThreadWithId> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const participants = [user.uid, otherUserId].sort();

  const q = query(
    collection(db, THREADS),
    where("type", "==", "direct"),
    where("participants", "==", participants),
  );

  const snap = await getDocs(q);
  if (snap.docs.length > 0) {
    const existing = snap.docs[0];
    return { _id: existing.id, ...existing.data() } as ThreadWithId;
  }

  const ref = doc(collection(db, THREADS));
  const now = Date.now();
  const thread: Thread = {
    type: "direct",
    participants,
    typingUsers: [],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, thread);
  return { _id: ref.id, ...thread };
}

export async function getOrCreateSupesThread(): Promise<ThreadWithId> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(
    collection(db, THREADS),
    where("type", "==", "chaser_to_supes"),
    where("chaserIds", "array-contains", user.uid),
  );

  const snap = await getDocs(q);
  if (snap.docs.length > 0) {
    const existing = snap.docs[0];
    return { _id: existing.id, ...existing.data() } as ThreadWithId;
  }

  const ref = doc(collection(db, THREADS));
  const now = Date.now();
  const thread: Thread = {
    type: "chaser_to_supes",
    participants: [user.uid],
    chaserIds: [user.uid],
    typingUsers: [],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, thread);
  return { _id: ref.id, ...thread };
}

export async function getOrCreateChaserSupesThread(
  chaserId: string,
): Promise<ThreadWithId> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(
    collection(db, THREADS),
    where("type", "==", "chaser_to_supes"),
    where("chaserIds", "array-contains", chaserId),
  );

  const snap = await getDocs(q);
  if (snap.docs.length > 0) {
    const existing = snap.docs[0];
    return { _id: existing.id, ...existing.data() } as ThreadWithId;
  }

  const ref = doc(collection(db, THREADS));
  const now = Date.now();
  const thread: Thread = {
    type: "chaser_to_supes",
    participants: [chaserId],
    chaserIds: [chaserId],
    typingUsers: [],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, thread);
  return { _id: ref.id, ...thread };
}

export async function sendMessage(
  threadId: string,
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
) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const messageRef = doc(collection(db, THREADS, threadId, "messages"));
    const now = Date.now();

    const message: Message = {
      senderId: user.uid,
      text,
      readBy: [user.uid],
      reactions: [],
      createdAt: now,
      ...(options?.replyTo && { replyTo: options.replyTo }),
      ...(options?.voice && { voice: options.voice }),
      ...(options?.attachment && { attachment: options.attachment }),
    };

    await setDoc(messageRef, message);

    const threadRef = doc(db, THREADS, threadId);
    const threadSnap = await getDoc(threadRef);
    const threadData = threadSnap.data();
    const participants = threadData?.participants || [];

    const unreadCount: Record<string, number> = {
      ...(threadData?.unreadCount || {}),
    };
    participants.forEach((participantId: string) => {
      if (participantId !== user.uid) {
        unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
      } else {
        unreadCount[participantId] = 0;
      }
    });

    await updateDoc(threadRef, {
      lastMessage: text,
      lastMessageAt: now,
      lastMessageSenderId: user.uid,
      updatedAt: now,
      unreadCount,
    });

    // Send push notifications to other participants
    const senderProfile = await getProfile(user.uid);
    const senderName = senderProfile
      ? `${senderProfile.firstName} ${senderProfile.lastName}`
      : "Someone";

    let recipientIds = participants.filter((id: string) => id !== user.uid);

    // For chaser_to_supes threads, also notify all supes
    if (threadData?.type === "chaser_to_supes") {
      const supesQuery = query(
        collection(db, "profiles"),
        where("role", "in", ["supe", "admin"]),
      );
      const supesSnap = await getDocs(supesQuery);
      const supeIds = supesSnap.docs
        .map((d) => d.id)
        .filter((id) => id !== user.uid);
      recipientIds = [...new Set([...recipientIds, ...supeIds])];
    }

    const authToken = await user.getIdToken();

    for (const recipientId of recipientIds) {
      try {
        await fetch("/api/notifications/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            profileId: recipientId,
            type: "message_new",
            title: `New message from ${senderName}`,
            body: text.length > 100 ? text.slice(0, 100) + "..." : text,
            url: `/chat/${threadId}`,
            metadata: { threadId, senderId: user.uid },
          }),
        });
      } catch (notifErr) {
        console.error("Failed to send notification:", notifErr);
      }
    }

    return { success: true, id: messageRef.id };
  } catch (error) {
    console.error("Failed to send message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getMessages(
  threadId: string,
  options?: { limit?: number },
): Promise<MessageWithId[]> {
  let q = query(
    collection(db, THREADS, threadId, "messages"),
    orderBy("createdAt", "desc"),
  );

  if (options?.limit) {
    q = query(q, limit(options.limit));
  }

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ _id: d.id, ...d.data() }) as MessageWithId)
    .reverse();
}

export async function markAsRead(threadId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(collection(db, THREADS, threadId, "messages"));
  const snap = await getDocs(q);

  const updates = snap.docs
    .filter((d) => {
      const data = d.data() as Message;
      return !data.readBy.includes(user.uid);
    })
    .map((d) =>
      updateDoc(d.ref, {
        readBy: arrayUnion(user.uid),
      }),
    );

  await Promise.all(updates);

  const threadRef = doc(db, THREADS, threadId);
  await updateDoc(threadRef, {
    [`unreadCount.${user.uid}`]: 0,
  });

  return { success: true };
}

export async function setTyping(threadId: string, isTyping: boolean) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, THREADS, threadId);
  await updateDoc(ref, {
    typingUsers: isTyping ? arrayUnion(user.uid) : arrayRemove(user.uid),
  });
  return { success: true };
}

export async function addReaction(
  threadId: string,
  messageId: string,
  emoji: string,
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, THREADS, threadId, "messages", messageId);
  await updateDoc(ref, {
    reactions: arrayUnion({ emoji, profileId: user.uid }),
  });
  return { success: true };
}

export async function removeReaction(
  threadId: string,
  messageId: string,
  emoji: string,
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, THREADS, threadId, "messages", messageId);
  await updateDoc(ref, {
    reactions: arrayRemove({ emoji, profileId: user.uid }),
  });
  return { success: true };
}

export function subscribeToUserThreads(
  userId: string,
  callback: (threads: ThreadWithId[]) => void,
) {
  const q = query(
    collection(db, THREADS),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc"),
    limit(DEFAULT_QUERY_LIMIT),
  );

  return onSnapshot(q, (snap) => {
    const threads = snap.docs.map(
      (d) => ({ _id: d.id, ...d.data() }) as ThreadWithId,
    );
    callback(threads);
  });
}

export function subscribeToChaserToSupesThreads(
  callback: (threads: ThreadWithId[]) => void,
) {
  const q = query(
    collection(db, THREADS),
    where("type", "==", "chaser_to_supes"),
    orderBy("lastMessageAt", "desc"),
    limit(DEFAULT_QUERY_LIMIT),
  );

  return onSnapshot(q, (snap) => {
    const threads = snap.docs.map(
      (d) => ({ _id: d.id, ...d.data() }) as ThreadWithId,
    );
    callback(threads);
  });
}

export function subscribeToThread(
  threadId: string,
  callback: (thread: ThreadWithId | null) => void,
) {
  const ref = doc(db, THREADS, threadId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ _id: snap.id, ...snap.data() } as ThreadWithId);
    } else {
      callback(null);
    }
  });
}

export function subscribeToMessages(
  threadId: string,
  callback: (messages: MessageWithId[]) => void,
) {
  const q = query(
    collection(db, THREADS, threadId, "messages"),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ _id: d.id, ...d.data() }) as MessageWithId),
    );
  });
}

export async function getUnreadCount(): Promise<number> {
  const user = auth.currentUser;
  if (!user) return 0;

  const threadsQuery = query(
    collection(db, THREADS),
    where("participants", "array-contains", user.uid),
    limit(DEFAULT_QUERY_LIMIT),
  );

  const threads = await getDocs(threadsQuery);
  let count = 0;

  threads.docs.forEach((thread) => {
    const data = thread.data();
    const unreadByUser = data.unreadCount?.[user.uid] || 0;
    count += unreadByUser;
  });

  return count;
}

export function getOtherParticipantId(
  thread: ThreadWithId,
  currentUserId: string,
): string | null {
  if (thread.type === "direct") {
    return thread.participants.find((p) => p !== currentUserId) || null;
  }
  if (thread.type === "chaser_to_supes") {
    return thread.chaserIds?.[0] || thread.participants[0] || null;
  }
  return null;
}
