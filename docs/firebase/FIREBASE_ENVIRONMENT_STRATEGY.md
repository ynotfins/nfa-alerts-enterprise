# Firebase Environment Strategy

## Project

Production Firebase project: `nfa-alerts-v2`.

## Repository Layout

Firebase CLI files live under `firebase/`:

```text
firebase/firebase.json
firebase/firestore.rules
firebase/firestore.indexes.json
firebase/storage.rules
firebase/cors.json
```

`.firebaserc` remains at the repo root for project aliases.

## Local Commands

Run emulator validation from the repo root:

```powershell
firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

Do not run `firebase deploy` during monorepo migration.

## Runtime Clients

The web app initializes Firebase from preserved `NEXT_PUBLIC_FIREBASE_*` environment variable names in `apps/web/src/lib/firebase.ts`.

Server-side Firebase Admin initialization remains in `apps/web/src/lib/firebase-admin.ts` and continues to use environment-provided credentials.

Android will use Firebase Android SDK configuration at `apps/android/app/google-services.json` after Android Studio creates the app module.
