# Codebase End-to-End Validation Report

**Last updated**: 2026-04-30
**Session**: Security correctness fixes for server auth, notifications, and React profile state

## Scope

- Secured `changeRequests` server actions so requester/reviewer identity is resolved from verified Firebase ID tokens instead of caller-supplied IDs.
- Secured `/api/notifications/send` so unauthenticated requests cannot create app notifications or trigger FCM.
- Fixed Firebase Admin default app selection to avoid brittle `getApps()[0]` behavior.
- Removed render-time state updates from `useProfile`.
- Kept fire-alert ingestion, alert writes, alert listener/query behavior, alert schema, notification flow for alerts, Firestore rules, Storage rules, and Firebase config untouched.

## Validation Matrix

| Check | Result | Evidence |
| --- | --- | --- |
| Node availability | WARN then PASS | `node` was missing initially; fallback installed Node `v22.22.2` for validation. |
| Context7 MCP | WARN | Context7 returned monthly quota exceeded; fallback used repo inspection and local package behavior. |
| `pnpm install --frozen-lockfile` | PASS | Dependencies installed with `pnpm 10.33.0`. |
| `pnpm run typecheck` | PASS | TypeScript completed with no errors. |
| `pnpm run lint:ci` | PASS | 0 errors, 19 pre-existing warnings within the warning budget. |
| `pnpm run test:unit` | PASS | 5 files, 52 tests passed. |
| `pnpm run build` | PASS | Next.js production build completed; Firebase Admin unavailable warnings are expected without runtime credentials. |
| `pnpm dlx firebase-tools --version` | PASS | Firebase CLI `15.16.0`. |
| Firebase rules local validation | PASS | `pnpm dlx firebase-tools emulators:exec --only firestore,storage --project demo-nfa-alerts-enterprise "true"` started Firestore and Storage emulators and exited successfully. |

## Auth Behavior Before / After

| Area | Before | After |
| --- | --- | --- |
| Change request create | Browser supplied `requesterId` and `requesterName`; server trusted them. | Browser supplies Firebase ID token; server verifies token and loads requester profile from Firestore. |
| Change request approve/reject | Browser supplied reviewer ID/name; server trusted them. | Browser supplies Firebase ID token; server verifies token, loads profile, and requires `supe` or `admin`. |
| Notification send API | Any caller with a valid-shaped body could create app notifications and trigger FCM. | Request must use internal bearer token or Firebase bearer token; Firebase callers may only send `message_new` for themselves as `metadata.senderId`. |
| Push token logging | Logged a partial push token before sending. | No push token value is logged. |

## Fire-Alert Pipeline Confirmation

Untouched files:

- `src/app/api/webhook/route.ts`
- `src/lib/webhook/parser.ts`
- `src/lib/webhook/geocoder.ts`
- `src/hooks/use-incidents.ts`
- `src/services/incidents.ts`
- `firestore.rules`
- `storage.rules`
- `firebase.json`
- `firestore.indexes.json`

## Risks Intentionally Deferred

- Firestore and Storage rules remain broad by request; no least-privilege tightening was attempted.
- Existing lint warnings remain within the configured warning budget and were not part of this security fix.
- Runtime Firebase Admin credentials are still required in deployment for server auth and FCM; no secrets were added or printed.
- Chat message notification endpoint access is narrowed to authenticated self-sender `message_new` requests, but deeper participant membership enforcement is deferred to avoid broad chat refactors.

## Next PR Recommendation

- Add a dedicated server-side chat notification action that verifies thread membership before creating message notifications, then remove the browser-facing `/api/notifications/send` path for chat sends.
