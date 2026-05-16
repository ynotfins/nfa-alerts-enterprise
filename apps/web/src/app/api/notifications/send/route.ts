import { NextRequest, NextResponse } from "next/server";
import { adminDb, sendNotification } from "@/lib/firebase-admin";
import type { AppNotification } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profileId,
      type,
      title,
      body: notifBody,
      url,
      metadata,
    } = body as {
      profileId: string;
      type: AppNotification["type"];
      title: string;
      body: string;
      url?: string;
      metadata?: Record<string, unknown>;
    };

    if (!profileId || !type || !title || !notifBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

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
        console.log(
          `Sending push to ${profileId}, token: ${profile.pushToken.slice(0, 20)}...`,
        );
        await sendNotification(profile.pushToken, {
          title,
          body: notifBody,
          data: {
            type,
            url: url || "/notifications",
            ...(metadata as Record<string, string>),
          },
        });
        console.log(`Push sent successfully to ${profileId}`);
      } catch (pushError: unknown) {
        console.error("Push notification failed:", pushError);
        // Clear invalid token
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
    console.error("Failed to send notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
