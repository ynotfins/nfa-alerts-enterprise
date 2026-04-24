"use server";

import { adminDb, sendNotification, sendNotificationToMultiple } from "@/lib/firebase-admin";
import type { AppNotification } from "@/lib/db";

interface SendNotificationParams {
  profileId: string;
  type: AppNotification["type"];
  title: string;
  body: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export async function sendAppNotification(params: SendNotificationParams) {
  const { profileId, type, title, body, url, metadata } = params;

  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  // Create in-app notification
  const notifRef = adminDb.collection("appNotifications").doc();
  await notifRef.set({
    profileId,
    type,
    title,
    body,
    read: false,
    url,
    metadata,
    createdAt: Date.now(),
  });

  // Get user's push token and send FCM
  const profileSnap = await adminDb.collection("profiles").doc(profileId).get();
  const profile = profileSnap.data();

  if (profile?.pushToken) {
    try {
      await sendNotification(profile.pushToken, {
        title,
        body,
        data: {
          type,
          url: url || "/notifications",
        },
      });
    } catch (pushError) {
      console.error("Push notification failed:", pushError);
    }
  }

  return { success: true, id: notifRef.id };
}

export async function sendNotificationToRole(
  role: "chaser" | "supe" | "admin",
  params: Omit<SendNotificationParams, "profileId">
) {
  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  const { type, title, body, url, metadata } = params;

  // Get all profiles with the specified role
  const profilesSnap = await adminDb
    .collection("profiles")
    .where("role", "==", role)
    .get();

  const batch = adminDb.batch();
  const pushTokens: string[] = [];

  profilesSnap.docs.forEach((doc) => {
    const profile = doc.data();

    // Create in-app notification
    const notifRef = adminDb!.collection("appNotifications").doc();
    batch.set(notifRef, {
      profileId: doc.id,
      type,
      title,
      body,
      read: false,
      url,
      metadata,
      createdAt: Date.now(),
    });

    if (profile.pushToken) {
      pushTokens.push(profile.pushToken);
    }
  });

  await batch.commit();

  // Send FCM to all tokens
  if (pushTokens.length > 0) {
    try {
      await sendNotificationToMultiple(pushTokens, {
        title,
        body,
        data: {
          type,
          url: url || "/notifications",
        },
      });
    } catch (pushError) {
      console.error("Push notifications failed:", pushError);
    }
  }

  return { success: true, count: profilesSnap.size };
}

export async function sendNotificationToSupes(
  params: Omit<SendNotificationParams, "profileId">
) {
  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  const { type, title, body, url, metadata } = params;

  // Get all supes and admins
  const supesSnap = await adminDb
    .collection("profiles")
    .where("role", "in", ["supe", "admin"])
    .get();

  const batch = adminDb.batch();
  const pushTokens: string[] = [];

  supesSnap.docs.forEach((doc) => {
    const profile = doc.data();

    const notifRef = adminDb!.collection("appNotifications").doc();
    batch.set(notifRef, {
      profileId: doc.id,
      type,
      title,
      body,
      read: false,
      url,
      metadata,
      createdAt: Date.now(),
    });

    if (profile.pushToken) {
      pushTokens.push(profile.pushToken);
    }
  });

  await batch.commit();

  if (pushTokens.length > 0) {
    try {
      await sendNotificationToMultiple(pushTokens, {
        title,
        body,
        data: {
          type,
          url: url || "/notifications",
        },
      });
    } catch (pushError) {
      console.error("Push notifications failed:", pushError);
    }
  }

  return { success: true, count: supesSnap.size };
}
