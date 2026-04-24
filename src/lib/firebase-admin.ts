import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import { getMessaging, Messaging } from "firebase-admin/messaging";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;
let adminMessaging: Messaging | null = null;

type ServiceAccountEnvJson = {
  project_id?: string;
  projectId?: string;
  client_email?: string;
  clientEmail?: string;
  private_key?: string;
  privateKey?: string;
};

const SERVICE_ACCOUNT_JSON_ENV_KEYS = [
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_APPLICATION_CREDENTIALS_JSON",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function normalizeServiceAccount(
  value: ServiceAccountEnvJson,
): ServiceAccount | null {
  const projectId = value.projectId ?? value.project_id;
  const clientEmail = value.clientEmail ?? value.client_email;
  const privateKey = value.privateKey ?? value.private_key;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

function parseServiceAccountJson(rawValue: string): ServiceAccount | null {
  try {
    const trimmed = rawValue.trim();
    const json = trimmed.startsWith("{")
      ? trimmed
      : Buffer.from(trimmed, "base64").toString("utf8");
    const parsed = JSON.parse(json) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    return normalizeServiceAccount({
      projectId:
        getOptionalString(parsed, "projectId") ??
        getOptionalString(parsed, "project_id"),
      clientEmail:
        getOptionalString(parsed, "clientEmail") ??
        getOptionalString(parsed, "client_email"),
      privateKey:
        getOptionalString(parsed, "privateKey") ??
        getOptionalString(parsed, "private_key"),
    });
  } catch {
    return null;
  }
}

function getServiceAccountFromEnv(): ServiceAccount | null {
  for (const key of SERVICE_ACCOUNT_JSON_ENV_KEYS) {
    const rawValue = process.env[key];
    if (!rawValue?.trim()) {
      continue;
    }

    const credential = parseServiceAccountJson(rawValue);
    if (!credential) {
      throw new Error("Firebase Admin credential JSON is invalid");
    }

    return credential;
  }

  return normalizeServiceAccount({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  });
}

function initAdmin() {
  if (adminApp) return;

  try {
    if (getApps().length === 0) {
      const firebaseServiceAccount = getServiceAccountFromEnv();

      if (!firebaseServiceAccount) {
        console.warn(
          "Firebase Admin credentials are not configured; admin services are unavailable.",
        );
        return;
      }

      adminApp = initializeApp({
        credential: cert(firebaseServiceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
    adminMessaging = getMessaging(adminApp);
  } catch {
    console.error(
      "Failed to initialize Firebase Admin. Check server credential configuration.",
    );
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
