import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, sendNotification } from "@/lib/firebase-admin";
import type { AppNotification } from "@/lib/db";
import {
  AuthError,
  type AuthenticatedProfile,
  authorizeInternalOrFirebaseRequest,
} from "@/lib/server-auth";

const notificationTypes = [
  "incident_new",
  "incident_responded",
  "incident_activity",
  "message_new",
  "change_request",
  "change_request_approved",
  "change_request_rejected",
] as const satisfies readonly AppNotification["type"][];
const notificationTypeSchema = z.enum(notificationTypes);

const notificationSchema = z.object({
  profileId: z.string().min(1),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  url: z.string().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

type NotificationInput = z.infer<typeof notificationSchema>;

function stringifyNotificationData(metadata: NotificationInput["metadata"]) {
  if (!metadata) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    ]),
  );
}

function metadataString(
  metadata: NotificationInput["metadata"],
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

async function canSendFirebaseNotification(
  profile: AuthenticatedProfile,
  notification: z.infer<typeof notificationSchema>,
) {
  if (profile.role === "supe" || profile.role === "admin") {
    return true;
  }

  const threadId = metadataString(notification.metadata, "threadId");
  const senderId = metadataString(notification.metadata, "senderId");
  if (
    notification.type !== "message_new" ||
    senderId !== profile._id ||
    !threadId ||
    !adminDb
  ) {
    return false;
  }

  const threadSnap = await adminDb.collection("threads").doc(threadId).get();
  const thread = threadSnap.data();
  if (!thread) {
    return false;
  }

  const participants = isStringArray(thread.participants)
    ? thread.participants
    : [];
  const chaserIds = isStringArray(thread.chaserIds) ? thread.chaserIds : [];
  const senderIsParticipant =
    participants.includes(profile._id) || chaserIds.includes(profile._id);
  if (!senderIsParticipant) {
    return false;
  }

  if (participants.includes(notification.profileId)) {
    return true;
  }

  if (thread.type !== "chaser_to_supes") {
    return false;
  }

  const recipientSnap = await adminDb
    .collection("profiles")
    .doc(notification.profileId)
    .get();
  const recipient = recipientSnap.data();
  return recipient?.role === "supe" || recipient?.role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    const authContext = await authorizeInternalOrFirebaseRequest(request);

    const parsed = notificationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notification payload" },
        { status: 400 },
      );
    }

    const { profileId, type, title, body: notifBody, url, metadata } =
      parsed.data;
    if (
      authContext.type === "firebase" &&
      !(await canSendFirebaseNotification(authContext.profile, parsed.data))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
            ...stringifyNotificationData(metadata),
          },
        });
        console.log(`Push sent successfully to ${profileId}`);
      } catch (pushError: unknown) {
        console.error("Push notification failed:", pushError);
        const errorMessage =
          pushError instanceof Error ? pushError.message : "";
        if (
          errorMessage.includes("not a valid FCM registration token") ||
          errorMessage.includes("Requested entity was not found")
        ) {
          console.log(`Clearing invalid pushToken for ${profileId}`);
          await adminDb.collection("profiles").doc(profileId).update({
            pushToken: "",
          });
        }
      }
    } else {
      console.log(`No pushToken for profile ${profileId}`);
    }

    return NextResponse.json({ success: true, id: notifRef.id });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Failed to send notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
