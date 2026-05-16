import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

const NEXT_PHASE_ENV_KEY = "NEXT_PHASE";
const NEXT_PHASE_PRODUCTION_BUILD = "phase-production-build";

const requiredFirebaseEnv = [
  ["apiKey", "NEXT_PUBLIC_FIREBASE_API_KEY"],
  ["authDomain", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"],
  ["projectId", "NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
  ["storageBucket", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"],
  ["messagingSenderId", "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
  ["appId", "NEXT_PUBLIC_FIREBASE_APP_ID"],
] as const;

type FirebaseConfigKey = (typeof requiredFirebaseEnv)[number][0];
type CompleteFirebaseConfig = Record<FirebaseConfigKey, string>;

const envFirebaseConfig: Record<FirebaseConfigKey, string | undefined> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const buildOnlyFirebaseConfig: FirebaseOptions = {
  apiKey: "build-placeholder-api-key",
  authDomain: "build-placeholder.firebaseapp.com",
  projectId: "build-placeholder",
  storageBucket: "build-placeholder.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
};

const missingFirebaseEnvKeys = requiredFirebaseEnv
  .filter(([configKey]) => !envFirebaseConfig[configKey])
  .map(([, envKey]) => envKey);

const isBrowserRuntime = typeof window !== "undefined";
const isNextProductionBuild =
  !isBrowserRuntime &&
  process.env[NEXT_PHASE_ENV_KEY] === NEXT_PHASE_PRODUCTION_BUILD;

function hasCompleteFirebaseConfig(
  config: Record<FirebaseConfigKey, string | undefined>,
): config is CompleteFirebaseConfig {
  return missingFirebaseEnvKeys.length === 0;
}

function getFirebaseConfig(): FirebaseOptions {
  if (hasCompleteFirebaseConfig(envFirebaseConfig)) {
    return envFirebaseConfig;
  }

  if (isNextProductionBuild) {
    return buildOnlyFirebaseConfig;
  }

  throw new Error(
    `Firebase client environment variables are not configured: ${missingFirebaseEnvKeys.join(
      ", ",
    )}. Set all NEXT_PUBLIC_FIREBASE_* values before running the app.`,
  );
}

const firebaseConfig = getFirebaseConfig();

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getApps().length === 1
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  : initializeFirestore(getApps()[0], {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
export const storage = getStorage(app);

export const getMessagingInstance = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export { app };
