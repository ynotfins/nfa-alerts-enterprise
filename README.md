# NFA Alerts Enterprise

NFA Alerts Enterprise is a commercial emergency response monorepo. The current production-facing web client is a mobile-first Next.js PWA backed by Firebase Auth, Firestore, Storage, FCM, and Firebase Admin-powered API routes.

## Repository Layout

```text
apps/
  web/       Next.js PWA and API routes
  android/   Android Studio-owned native project placeholder
  ios/       Future iOS app placeholder
packages/
  shared/    Future shared contracts/utilities
  config/    Future shared configuration
firebase/    Firebase CLI config, Firestore rules/indexes, Storage rules
scripts/     Repo-level automation and deployment helpers
docs/        Architecture, operations, Android, Firebase, and enterprise docs
.github/     CI workflows
```

## Web App

The web app lives in `apps/web`. Root scripts forward to the `web` workspace:

```powershell
pnpm install
pnpm run dev
pnpm run lint:ci
pnpm run typecheck
pnpm run test:unit
pnpm run build
```

The webhook ingestion route remains in `apps/web/src/app/api/webhook/route.ts` and must preserve its behavior.

## Firebase

Firebase project: `nfa-alerts-v2`.

Firebase config and rules live in `firebase/`. Emulator commands should be run from the repo root with explicit config:

```powershell
firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

Do not run `firebase deploy` without explicit approval.

## Android

Android Studio owns `apps/android`. Cursor must not create Android Gradle files manually.

Android Studio project settings:

```text
Template: Empty Activity
App name: NFA Alerts
Package: com.emergency.alerts
Save location: D:\github\nfa-alerts-enterprise\apps\android
Language: Kotlin
Build config language: Kotlin DSL
Minimum SDK: API 24
Jetpack Compose: Yes
```

The operator will add `google-services.json` to `apps/android/app/google-services.json` after Android Studio creates the app module.
