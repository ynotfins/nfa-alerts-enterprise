import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import serviceAccount from "../../service-account.json";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;
let adminMessaging: Messaging | null = null;

function initAdmin() {
  if (adminApp) return;

  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount as Parameters<typeof cert>[0]),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
    adminMessaging = getMessaging(adminApp);
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

initAdmin();

export { adminApp, adminAuth, adminDb, adminStorage, adminMessaging };

export async function sendNotification(
  token: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) {
  if (!adminMessaging) {
    throw new Error("Firebase Admin Messaging not initialized");
  }

  try {
    await adminMessaging.send({
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      webpush: {
        fcmOptions: {
          link: notification.data?.url || "/incidents",
        },
      },
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}

export async function sendNotificationToMultiple(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) {
  if (!adminMessaging) {
    throw new Error("Firebase Admin Messaging not initialized");
  }

  try {
    await adminMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      webpush: {
        fcmOptions: {
          link: notification.data?.url || "/incidents",
        },
      },
    });
  } catch (error) {
    console.error("Failed to send notifications:", error);
    throw error;
  }
}
