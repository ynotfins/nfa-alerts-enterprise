import { NextRequest, NextResponse } from "next/server";
import { adminDb, sendNotification } from "@/lib/firebase-admin";
import { getAuthenticatedProfile, getBearerToken } from "@/lib/server-auth";
import { z } from "zod";

const notificationTypes = [
  "incident_new",
  "incident_responded",
  "incident_activity",
  "message_new",
  "change_request",
  "change_request_approved",
  "change_request_rejected",
] as const;

const notificationRequestSchema = z.object({
  profileId: z.string().min(1),
  type: z.enum(notificationTypes),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  url: z.string().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

async function authorizeNotificationRequest(request: NextRequest) {
  const bearerToken = getBearerToken(request.headers.get("authorization"));
  const internalToken = process.env.WEBHOOK_AUTH_TOKEN;

  if (!bearerToken) {
    return false;
  }

  if (internalToken && bearerToken === internalToken) {
    return true;
  }

  await getAuthenticatedProfile(bearerToken);
  return true;
}

function stringifyMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return undefined;

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key, String(value)]),
  );
}

export async function POST(request: NextRequest) {
  try {
    try {
      const authorized = await authorizeNotificationRequest(request);

      if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const parsed = notificationRequestSchema.safeParse(requestBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const {
      profileId,
      type,
      title,
      body: notifBody,
      url,
      metadata,
    } = parsed.data;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    // Create in-app notification
    const notifRef = adminDb.collection("appNotifications").doc();
    await notifRef.set({
      profileId,
      type,
      title,
      body: notifBody,
      read: false,
      url,
      metadata,
      createdAt: Date.now(),
    });

    // Get user's push token
    const profileSnap = await adminDb
      .collection("profiles")
      .doc(profileId)
      .get();
    const profile = profileSnap.data();

    if (profile?.pushToken) {
      try {
        await sendNotification(profile.pushToken, {
          title,
          body: notifBody,
          data: {
            type,
            url: url || "/notifications",
            ...stringifyMetadata(metadata),
          },
        });
      } catch (pushError: unknown) {
        console.error("Push notification failed:", pushError);
        // Clear invalid token
        const errorMessage =
          pushError instanceof Error ? pushError.message : "";
        if (
          errorMessage.includes("not a valid FCM registration token") ||
          errorMessage.includes("Requested entity was not found")
        ) {
          await adminDb.collection("profiles").doc(profileId).update({
            pushToken: "",
          });
        }
      }
    }

    return NextResponse.json({ success: true, id: notifRef.id });
  } catch (error) {
    console.error("Failed to send notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
