import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { AppNotification } from "@/lib/db";

const APP_NOTIFICATIONS = "appNotifications";

export async function createNotification(
  data: Omit<AppNotification, "createdAt" | "read">
) {
  const ref = doc(collection(db, APP_NOTIFICATIONS));
  await setDoc(ref, {
    ...data,
    read: false,
    createdAt: Date.now(),
  });
  return { success: true, id: ref.id };
}

export async function listNotifications() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, APP_NOTIFICATIONS),
    where("profileId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() } as AppNotification & { _id: string })
  );
}

export async function markNotificationRead(notificationId: string) {
  const ref = doc(db, APP_NOTIFICATIONS, notificationId);
  await updateDoc(ref, { read: true });
  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const q = query(
    collection(db, APP_NOTIFICATIONS),
    where("profileId", "==", user.uid),
    where("read", "==", false)
  );

  const snap = await getDocs(q);
  const batch = writeBatch(db);

  snap.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });

  await batch.commit();
  return { success: true };
}

export async function getUnreadNotificationCount() {
  const user = auth.currentUser;
  if (!user) return 0;

  const q = query(
    collection(db, APP_NOTIFICATIONS),
    where("profileId", "==", user.uid),
    where("read", "==", false)
  );

  const snap = await getDocs(q);
  return snap.size;
}

export function subscribeToNotifications(
  callback: (notifications: (AppNotification & { _id: string })[]) => void
) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, APP_NOTIFICATIONS),
    where("profileId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map(
        (d) => ({ _id: d.id, ...d.data() } as AppNotification & { _id: string })
      )
    );
  });
}

export function subscribeToUnreadCount(callback: (count: number) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, APP_NOTIFICATIONS),
    where("profileId", "==", user.uid),
    where("read", "==", false)
  );

  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
}
