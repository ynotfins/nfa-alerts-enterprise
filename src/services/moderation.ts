import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const PROFILES = "profiles";
const BANNED_DEVICES = "bannedDevices";

export async function warnUser(userId: string, reason: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const ref = doc(db, PROFILES, userId);
  await updateDoc(ref, {
    warnings: arrayUnion({
      reason,
      by: currentUser.uid,
      at: Date.now(),
    }),
    updatedAt: Date.now(),
  });

  return { success: true };
}

export async function suspendUser(
  userId: string,
  reason: string,
  durationDays: number,
) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const until = Date.now() + durationDays * 24 * 60 * 60 * 1000;

  const ref = doc(db, PROFILES, userId);
  await updateDoc(ref, {
    suspension: {
      active: true,
      until,
      reason,
      by: currentUser.uid,
      at: Date.now(),
    },
    updatedAt: Date.now(),
  });

  return { success: true };
}

export async function unsuspendUser(userId: string) {
  const ref = doc(db, PROFILES, userId);
  await updateDoc(ref, {
    suspension: {
      active: false,
    },
    updatedAt: Date.now(),
  });

  return { success: true };
}

export async function banUser(userId: string, reason: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const profileRef = doc(db, PROFILES, userId);
  const profileSnap = await getDoc(profileRef);
  const profileData = profileSnap.data();

  const deviceFingerprint = profileData?.deviceFingerprint;
  const email = profileData?.email;

  await updateDoc(profileRef, {
    ban: {
      active: true,
      at: Date.now(),
      reason,
      by: currentUser.uid,
      deviceFingerprints: deviceFingerprint ? [deviceFingerprint] : [],
    },
    updatedAt: Date.now(),
  });

  if (deviceFingerprint) {
    const bannedDeviceRef = doc(db, BANNED_DEVICES, deviceFingerprint);
    await setDoc(bannedDeviceRef, {
      fingerprint: deviceFingerprint,
      bannedUserId: userId,
      bannedEmail: email,
      reason,
      bannedBy: currentUser.uid,
      bannedAt: Date.now(),
    });
  }

  return { success: true };
}

export async function unbanUser(userId: string) {
  const profileRef = doc(db, PROFILES, userId);
  const profileSnap = await getDoc(profileRef);
  const profileData = profileSnap.data();

  const deviceFingerprints = profileData?.ban?.deviceFingerprints || [];

  await updateDoc(profileRef, {
    ban: {
      active: false,
      at: Date.now(),
    },
    updatedAt: Date.now(),
  });

  for (const fp of deviceFingerprints) {
    try {
      const bannedDeviceRef = doc(db, BANNED_DEVICES, fp);
      await updateDoc(bannedDeviceRef, { active: false });
    } catch {}
  }

  return { success: true };
}

export async function isDeviceBanned(fingerprint: string): Promise<boolean> {
  if (!fingerprint) return false;

  const ref = doc(db, BANNED_DEVICES, fingerprint);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return data.active !== false;
  }

  return false;
}

export async function checkUserStatus(userId: string): Promise<{
  banned: boolean;
  suspended: boolean;
  suspendedUntil?: number;
  banReason?: string;
  suspendReason?: string;
}> {
  const ref = doc(db, PROFILES, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { banned: false, suspended: false };
  }

  const data = snap.data();

  const banned = data.ban?.active === true;
  const suspension = data.suspension;
  let suspended = false;
  let suspendedUntil: number | undefined;

  if (suspension?.active && suspension?.until) {
    if (Date.now() < suspension.until) {
      suspended = true;
      suspendedUntil = suspension.until;
    }
  }

  return {
    banned,
    suspended,
    suspendedUntil,
    banReason: data.ban?.reason,
    suspendReason: suspension?.reason,
  };
}

export async function saveDeviceFingerprint(fingerprint: string) {
  const currentUser = auth.currentUser;
  if (!currentUser || !fingerprint) return;

  try {
    const ref = doc(db, PROFILES, currentUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    await updateDoc(ref, {
      deviceFingerprint: fingerprint,
      updatedAt: Date.now(),
    });
  } catch {
    // Silent fail - fingerprint storage is non-critical
  }
}
