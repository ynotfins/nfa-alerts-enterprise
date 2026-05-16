# Production Safety Guardrails

## Hard Prohibitions

- Do not run `firebase deploy` without explicit approval.
- Do not modify production Firebase data from migration tasks.
- Do not commit `.env*` files except `.env.example` with empty assignments only.
- Do not commit service account JSON, private keys, signing keys, Bitwarden tokens, logs containing secret values, or Android keystores.
- Do not create Android Gradle files from Cursor during monorepo migration.
- Do not change Firebase rule/index contents unless a separate rules task is approved.

## Firebase

Production project: `nfa-alerts-v2`.

Allowed local validation:

```powershell
firebase use --config firebase/firebase.json
firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

Blocked without explicit approval:

```powershell
firebase deploy
firebase firestore:delete
firebase database:remove
```

## Webhook

Webhook ingestion remains in `apps/web/src/app/api/webhook/route.ts`. Android must never call this route; it reads Firestore `incidents` instead.

## Migration Discipline

Use `git mv` where possible, preserve behavior, preserve environment variable names, and fix only migration-caused path/config issues during validation.
