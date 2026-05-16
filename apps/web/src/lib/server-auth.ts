import type { NextRequest } from "next/server";
import type { Profile, WithId } from "@/lib/db";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { parseProfile } from "@/lib/profile-boundary";

export type AuthenticatedProfile = WithId<Profile>;
type InternalAuthContext = { type: "internal" };
type FirebaseAuthContext = { type: "firebase"; profile: AuthenticatedProfile };
type PrivilegedAuthContext = InternalAuthContext | FirebaseAuthContext;

export class AuthError extends Error {
  status: number;

  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function getBearerToken(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function isPrivilegedRole(role: Profile["role"]) {
  return role === "supe" || role === "admin";
}

export async function getProfileForId(uid: string): Promise<AuthenticatedProfile> {
  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  const profileSnap = await adminDb.collection("profiles").doc(uid).get();
  if (!profileSnap.exists) {
    throw new AuthError("Authenticated profile not found", 403);
  }

  return parseProfile(profileSnap.id, profileSnap.data());
}

export async function verifyFirebaseBearerToken(
  authorization: string | null,
): Promise<AuthenticatedProfile> {
  if (!adminAuth) {
    throw new Error("Firebase Admin Auth not initialized");
  }

  const token = getBearerToken(authorization);
  if (!token) {
    throw new AuthError();
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw new AuthError();
  }

  return getProfileForId(decoded.uid);
}

export async function requireFirebaseBearerToken(
  request: NextRequest,
): Promise<AuthenticatedProfile> {
  return verifyFirebaseBearerToken(request.headers.get("authorization"));
}

export async function requirePrivilegedFirebaseBearerToken(
  request: NextRequest,
): Promise<AuthenticatedProfile> {
  const profile = await requireFirebaseBearerToken(request);
  if (!isPrivilegedRole(profile.role)) {
    throw new AuthError("Forbidden", 403);
  }

  return profile;
}

export async function authorizeInternalOrPrivilegedRequest(
  request: NextRequest,
): Promise<PrivilegedAuthContext> {
  const authorization = request.headers.get("authorization");
  const internalToken = process.env.WEBHOOK_AUTH_TOKEN;
  const bearerToken = getBearerToken(authorization);

  if (internalToken && bearerToken === internalToken) {
    return { type: "internal" };
  }

  const profile = await verifyFirebaseBearerToken(authorization);
  if (!isPrivilegedRole(profile.role)) {
    throw new AuthError("Forbidden", 403);
  }

  return { type: "firebase", profile };
}

export async function authorizeInternalOrFirebaseRequest(
  request: NextRequest,
): Promise<PrivilegedAuthContext> {
  const authorization = request.headers.get("authorization");
  const internalToken = process.env.WEBHOOK_AUTH_TOKEN;
  const bearerToken = getBearerToken(authorization);

  if (internalToken && bearerToken === internalToken) {
    return { type: "internal" };
  }

  const profile = await verifyFirebaseBearerToken(authorization);
  return { type: "firebase", profile };
}
