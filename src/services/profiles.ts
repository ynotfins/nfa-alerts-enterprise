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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Profile, Activity } from "@/lib/db";
import { auth } from "@/lib/firebase";

const PROFILES = "profiles";

export async function getProfile(uid: string) {
  const ref = doc(db, PROFILES, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { _id: snap.id, ...snap.data() } as Profile & { _id: string };
}

export async function getCurrentProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  return getProfile(user.uid);
}

export async function createProfile(
  uid: string,
  data: Partial<Profile> & { email: string; role: Profile["role"] },
) {
  const ref = doc(db, PROFILES, uid);
  const now = Date.now();
  const isSupe = data.role === "supe" || data.role === "admin";
  await setDoc(ref, {
    userId: uid,
    completedSteps: 0,
    createdAt: now,
    updatedAt: now,
    locationTracking: {
      enabled: isSupe,
    },
    ...data,
  });
  return { success: true };
}

export async function updateProfile(uid: string, data: Partial<Profile>) {
  const ref = doc(db, PROFILES, uid);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: Date.now(),
    },
    { merge: true },
  );
  return { success: true };
}

export async function updateCurrentProfile(data: Partial<Profile>) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return updateProfile(user.uid, data);
}

export async function toggleLocationTracking(enabled: boolean) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const ref = doc(db, PROFILES, user.uid);
  await updateDoc(ref, {
    "locationTracking.enabled": enabled,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function toggleGeofencing(enabled: boolean, radius?: number) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const ref = doc(db, PROFILES, user.uid);
  const updates: Record<string, unknown> = {
    geofencingEnabled: enabled,
    updatedAt: Date.now(),
  };
  if (radius !== undefined) {
    updates.geofenceRadius = radius;
  }
  await updateDoc(ref, updates);
  return { success: true };
}

export async function updateLocation(coords: {
  lat: number;
  lng: number;
  accuracy: number;
  heading?: number;
  speed?: number;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, PROFILES, user.uid);
  await updateDoc(ref, {
    "locationTracking.lat": coords.lat,
    "locationTracking.lng": coords.lng,
    "locationTracking.accuracy": coords.accuracy,
    "locationTracking.lastUpdate": Date.now(),
    lastSeen: Date.now(),
    online: true,
    updatedAt: Date.now(),
  });

  const locRef = doc(collection(db, PROFILES, user.uid, "locations"));
  await setDoc(locRef, {
    ...coords,
    createdAt: Date.now(),
  });

  return { success: true };
}

export async function completeWalkthrough() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const ref = doc(db, PROFILES, user.uid);
  await updateDoc(ref, {
    hasCompletedWalkthrough: true,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function updatePushToken(token: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const ref = doc(db, PROFILES, user.uid);
  await updateDoc(ref, {
    pushToken: token,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function listChasers() {
  const q = query(collection(db, PROFILES), where("role", "==", "chaser"));
  const snap = await getDocs(q);
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;

  return snap.docs.map((d) => {
    const data = d.data() as Profile;
    const isOnline = data.lastSeen ? now - data.lastSeen < FIVE_MINUTES : false;
    return {
      _id: d.id,
      ...data,
      isOnline,
    };
  });
}

export async function listSupes() {
  const q = query(
    collection(db, PROFILES),
    where("role", "in", ["supe", "admin"]),
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as Profile & { _id: string },
  );
}

export async function listAllProfiles() {
  const snap = await getDocs(collection(db, PROFILES));
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as Profile & { _id: string },
  );
}

export async function updateUserRole(profileId: string, role: Profile["role"]) {
  const ref = doc(db, PROFILES, profileId);
  await updateDoc(ref, {
    role,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function suspendUser(
  profileId: string,
  reason: string,
  until?: number,
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, PROFILES, profileId);
  await updateDoc(ref, {
    suspension: {
      active: true,
      reason,
      until,
      by: user.uid,
    },
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function unsuspendUser(profileId: string) {
  const ref = doc(db, PROFILES, profileId);
  await updateDoc(ref, {
    "suspension.active": false,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function banUser(profileId: string, reason: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, PROFILES, profileId);
  await updateDoc(ref, {
    ban: {
      active: true,
      at: Date.now(),
      reason,
      by: user.uid,
    },
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function unbanUser(profileId: string) {
  const ref = doc(db, PROFILES, profileId);
  await updateDoc(ref, {
    "ban.active": false,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export function subscribeToProfile(
  uid: string,
  callback: (profile: (Profile & { _id: string }) | null) => void,
) {
  const ref = doc(db, PROFILES, uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ _id: snap.id, ...snap.data() } as Profile & { _id: string });
    } else {
      callback(null);
    }
  });
}

export async function addActivity(activity: Omit<Activity, "createdAt">) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(collection(db, PROFILES, user.uid, "activities"));
  await setDoc(ref, {
    ...activity,
    createdAt: Date.now(),
  });
  return { success: true };
}

export async function getActivities(profileId: string) {
  const snap = await getDocs(collection(db, PROFILES, profileId, "activities"));
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as Activity & { _id: string },
  );
}
