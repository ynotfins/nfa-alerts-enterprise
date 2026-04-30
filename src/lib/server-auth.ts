import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { Profile } from "@/lib/db";

export type AuthenticatedProfile = Profile & { _id: string };

const VALID_ROLES = new Set(["chaser", "supe", "admin"]);

export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function isProfile(value: Record<string, unknown>): boolean {
  return (
    typeof value.userId === "string" &&
    typeof value.role === "string" &&
    VALID_ROLES.has(value.role)
  );
}

export async function getAuthenticatedProfile(
  idToken: string,
): Promise<AuthenticatedProfile> {
  if (!adminAuth || !adminDb) {
    throw new Error("Firebase Admin not initialized");
  }

  const decoded = await adminAuth.verifyIdToken(idToken);
  const snap = await adminDb.collection("profiles").doc(decoded.uid).get();

  if (!snap.exists) {
    throw new Error("Authenticated profile not found");
  }

  const profile = snap.data();
  if (!profile || !isProfile(profile)) {
    throw new Error("Authenticated profile is invalid");
  }

  return { _id: snap.id, ...(profile as Profile) };
}

export function requireSupe(profile: AuthenticatedProfile) {
  if (profile.role !== "supe" && profile.role !== "admin") {
    throw new Error("Forbidden");
  }
}
