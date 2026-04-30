# Codebase End-to-End Validation Report

**Generated**: 2026-04-30
**Session**: Security actions and notifications hardening
**Branch**: `cursor/security-actions-notifications-0e10`

---

## Scope

This pass makes minimal correctness/security fixes while preserving the current fire-alert ingestion and live-alert delivery path.

## Changes Validated

| Area | Result |
| --- | --- |
| Change-request server actions | Authenticated Firebase ID token now determines requester/reviewer identity; approval/rejection requires `supe` or `admin`. |
| Notification send API | Requires an internal bearer token or a valid Firebase ID token before writing `appNotifications` or sending FCM. |
| Notification payload | Zod validation rejects missing/invalid fields before writes. |
| Firebase Admin init | Reuses the default Admin app through `getApp()` instead of brittle `getApps()[0]`. |
| React profile hook | `useProfile` derives cached profile state without render-phase or synchronous effect state updates. |
| Fire-alert path | No edits to webhook ingestion, Firestore alert rules, incident schema, alert queries/listeners, or alert notification flow. |

## Validation Evidence

| Command | Status | Notes |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | PASS | Lockfile install completed with pnpm `10.33.0`. |
| `pnpm run typecheck` | PASS | TypeScript passed. |
| `pnpm run lint:ci` | PASS | 19 warnings, 0 errors; warnings are pre-existing lint debt inside the 25-warning budget. |
| `pnpm run test:unit` | PASS | 46/46 tests passed after adding notification and change-request security tests. |
| `pnpm run build` | PASS | Next.js production build passed; Firebase Admin unavailable warnings are expected without runtime credentials. |
| `pnpm dlx firebase-tools --version` | PASS | Firebase CLI available via `pnpm dlx`; version `15.16.0`. |
| `pnpm dlx firebase-tools deploy --only firestore:rules,storage --dry-run` | WARN | Did not deploy; blocked because no active Firebase project is configured in this checkout. |
| `pnpm dlx firebase-tools projects:list` | WARN | Firebase CLI auth is unavailable in this Cloud VM; restore with `firebase login` or application-default credentials outside this PR. |

## Fire-alert Pipeline Files Confirmed Untouched

| File | Status |
| --- | --- |
| `src/app/api/webhook/route.ts` | Untouched |
| `firestore.rules` | Untouched |
| `storage.rules` | Untouched |
| `firebase.json` | Untouched |
| `firestore.indexes.json` | Untouched |

## Deferred Risks

1. Firestore and Storage rules remain broad by instruction to avoid disrupting the operational alert path.
2. Server actions still depend on client-supplied Firebase ID tokens because this app has no existing server session cookie utility; the token is verified server-side with Firebase Admin before any privileged write.
3. Notification API allows any authenticated app user to request a notification, matching the current chat use case; stricter recipient/participant authorization should be a follow-up after mapping all notification producers.
4. Existing webhook tests still include a hard-coded fake token string; it is test-only and not a runtime secret.

## Next PR Recommendation

Add a server-side notification service for chat and other app events so client code does not call `/api/notifications/send` directly, then enforce event-specific recipient authorization centrally.
