# Engineering Quality Assessment - NFA Alerts

## Lint Policy

The project uses two lint scripts with different strictness levels:

**`pnpm lint:ci`** - CI gate with warning budget (currently 25 warnings allowed). This is the gate used in CI pipelines and for routine development. The warning budget is a temporary measure to allow the codebase to pass CI while warnings are addressed incrementally.

**`pnpm lint:strict`** - Zero-tolerance mode (`--max-warnings 0`). This is the future target for the codebase. Once all warnings are resolved, `lint:ci` will be updated to match `lint:strict`.

**Ratchet Plan**: The warning budget will be reduced over time as warnings are fixed. Each PR that fixes warnings should also reduce the budget in `package.json` to prevent regression.

Current warning count: 20 (budget set to 25 for buffer)

---

## Summary Table

| Dimension | Health | Notes |
|-----------|--------|-------|
| **Modularity & Separation** | 🟢 Good | Clean layering, but some service files are oversized |
| **Test Coverage** | 🔴 Poor | Only webhook parser tested (~3% estimated coverage) |
| **Error Handling & Logging** | 🟢 Good | Improved error handling, typed catch blocks |
| **Security Posture** | 🟡 Fair | Auth solid, Firestore rules overly permissive |
| **Performance** | 🟢 Good | N+1 query fixed, collection group queries implemented |

---

## Recent Improvements (Dec 1, 2025)

### Performance ✅
- **Fixed N+1 query in favorites page** - Refactored `getIncidentsWithNotes()` to use collection group query
- **Firestore indexes deployed** - Added field override for `notes.authorId` collection group
- **Database read reduction** - Changed from O(n) to O(1) for notes lookup

### Code Quality ✅
- **Linting cleanup** - Fixed 30+ ESLint warnings (unused imports, unescaped entities, `any` types)
- **TypeScript strict mode** - Fixed compilation errors, improved type safety
- **Error handling** - Added typed catch blocks (`catch (error: unknown)`)

### Infrastructure ✅
- **Firestore security rules** - Deployed collection group rules to production
- **Google Maps integration** - Added Map ID support for Advanced Markers
- **Safety snapshots** - Created rollback branch and tag for safety

---

## 1. Modularity & Separation of Concerns

### Strengths ✅

1. **Clear Layer Separation**
   - Presentation (`src/app/`, `src/components/`)
   - State management (`src/contexts/`, `src/hooks/`)
   - Business logic (`src/services/`)
   - Infrastructure (`src/lib/`)
   - Evidence: Clean import hierarchy, services don't import components

2. **Route Group Organization**
   - `(auth)` for public routes, `(dashboard)` for protected
   - Evidence: `src/app/(auth)/layout.tsx` vs `src/app/(dashboard)/layout.tsx`

3. **Colocated Feature Components**
   - Incident-specific components in `src/components/incidents/`
   - Chat components in `src/components/chat/`
   - Evidence: Domain components don't leak into `ui/` folder

4. **Single Responsibility for Hooks**
   - Each hook has focused purpose
   - Evidence: `use-push-notifications.ts` (push only), `use-chat.ts` (chat only), `use-incidents.ts` (incidents only)

5. **Schemas Separated from Runtime Code**
   - Zod schemas in `src/schemas/` folder
   - Evidence: `src/schemas/incident.ts`, `src/schemas/profile.ts`

### Weaknesses ⚠️

1. **Oversized Service Files**
   - `src/services/incidents.ts` is 799 lines
   - Contains CRUD, subscriptions, flags, documents, signatures all in one file
   - Should split into: `incident-crud.ts`, `incident-subscriptions.ts`, `incident-documents.ts`

2. **Type Definitions Scattered**
   - Types in `src/lib/db.ts` (runtime types)
   - Zod schemas in `src/schemas/` (validation)
   - No single source of truth - types should derive from Zod
   - Evidence: `Incident` interface at `db.ts:61` duplicates fields from `incident.ts` schema

3. **Mixed Concerns in Auth Context**
   - `src/contexts/auth-context.tsx` handles:
     - Auth state machine
     - Profile subscription
     - Device fingerprinting
     - Ban checking
     - Route redirects
   - Should extract fingerprinting and moderation to separate hooks

4. **Dashboard Layout Overloaded**
   - `src/app/(dashboard)/layout.tsx` wraps 7 providers
   - Evidence: Protected → Presence → ProfilesProvider → PushNotificationProvider → GoogleMapsProvider → Shell → children

---

## 2. Test Coverage & Quality

### Strengths ✅

1. **Webhook Parser Well-Tested**
   - 12 test cases covering various formats
   - Evidence: `tests/webhook-parser.test.ts` lines 1-124

2. **Test Infrastructure Configured**
   - Vitest with UI mode available
   - Environment loading via dotenv
   - Evidence: `vitest.config.ts`, `tests/setup.ts`

### Weaknesses ⚠️

1. **~3% Estimated Coverage**
   - Only 2 test files for entire codebase
   - No tests for: incidents service, chat service, auth context, any components
   - Evidence: `tests/` contains only `webhook-parser.test.ts` and `webhook-notifications.test.ts`

2. **No Integration Tests**
   - Firestore operations untested
   - Would catch issues like missing indexes, rule violations
   - Evidence: No test files import Firebase or mock Firestore

3. **No Component/E2E Tests**
   - UI behavior completely untested
   - Auth flows, form submissions, real-time updates not verified
   - Evidence: No Playwright/Cypress config, no `__tests__` folders in components

4. **Tests Require Live OpenAI API**
   - Parser tests call actual GPT-4o-mini
   - Slow (~2-5s per test), costs money, flaky
   - Evidence: `tests/webhook-parser.test.ts` calls `parseNotification()` which hits OpenAI

5. **No Mocking Strategy**
   - No test utilities for mocking Firebase
   - No fixture data for consistent testing
   - Evidence: No `__mocks__/` directory, no test helpers

---

## 3. Error Handling & Logging

### Strengths ✅

1. **Webhook Extensively Logged**
   - Every step logged with `[WEBHOOK]` prefix
   - Timing information captured
   - Evidence: `src/app/api/webhook/route.ts` lines 52, 80-81, 92-98, 100-105, etc.

2. **Webhook Error Audit Trail**
   - All requests logged to `webhookLogs` collection
   - Success and failure captured with processing time
   - Evidence: `route.ts` lines 209-219, 238-248, 283-293

3. **Custom Error Classes**
   - `GeocodingError`, `ParsingError` for typed error handling
   - Evidence: `src/lib/webhook/errors.ts`

4. **Service Functions Return Result Objects**
   - Pattern: `return { success: true, id }` or `return { success: false, error }`
   - Evidence: `src/services/incidents.ts:89-96`, `src/services/chat.ts:243-249`

### Weaknesses ⚠️

1. **Silent Failures in Client Code**
   - Many `catch` blocks only `console.error` without user feedback
   - Evidence: `src/contexts/auth-context.tsx:122-124` fingerprint errors silently caught

2. **Inconsistent Error Propagation**
   - Some services throw, others return error objects
   - `src/services/profiles.ts:66` throws Error
   - `src/services/incidents.ts:125-129` returns error object
   - Caller must handle both patterns

3. **No Structured Logging**
   - Plain `console.log`/`console.error` throughout
   - No log levels, no correlation IDs, no structured format
   - Evidence: All files use raw console methods

4. **Push Notification Failures Swallowed**
   - `src/services/chat.ts:237-240` catches notification errors but continues
   - User never knows if notification failed
   - Evidence: `catch (notifErr) { console.error(...) }` with no retry or alert

5. **No Global Error Boundary Data**
   - `src/app/error.tsx` exists but doesn't report to any service
   - No Sentry, LogRocket, or similar integration
   - Evidence: Error boundary just shows UI, no telemetry

---

## 4. Security Posture

### Strengths ✅

1. **Firebase Auth with Multiple Providers**
   - Email/password + Google OAuth supported
   - Evidence: `src/lib/firebase.ts` auth initialization

2. **Role-Based Access in Firestore Rules**
   - `isSupe()`, `isAdmin()`, `isOwner()` helper functions
   - Evidence: `firestore.rules` lines 9-23

3. **Device Fingerprinting for Ban Enforcement**
   - Banned devices tracked and checked on auth
   - Evidence: `src/contexts/auth-context.tsx:99-133`, `bannedDevices` collection

4. **Webhook Auth Token Required**
   - Bearer token validation before processing
   - Evidence: `src/app/api/webhook/route.ts:55-69`

5. **Input Sanitization on Webhook**
   - Control characters stripped, length limited
   - Evidence: `src/app/api/webhook/route.ts:9-14` `sanitizeInput()`

### Weaknesses ⚠️

1. **Overly Permissive Incident Updates**
   - Any authenticated user can update any incident
   - Evidence: `firestore.rules:46` - `allow update: if isAuthenticated()`
   - Should be: `isOwner(resource.data.createdBy) || responderIds.hasAny([request.auth.uid]) || isSupe()`

2. **No Rate Limiting**
   - Webhook endpoint has no rate limiting
   - API notification endpoint has no rate limiting
   - Evidence: No middleware or rate limit checks in any API route

3. **Service Account in Repo Root**
   - `service-account.json` at project root (gitignored but risky)
   - One accidental commit exposes all Firebase access
   - Evidence: File exists at `D:\github\nfa-alert\service-account.json`

4. **API Keys in Client Bundle**
   - `NEXT_PUBLIC_FIREBASE_*` keys exposed to client
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` exposed
   - Evidence: `src/lib/firebase.ts:7-14` reads public env vars
   - Mitigation: Restrict API key usage in Google Cloud console

5. **No CSRF Protection on Custom API Routes**
   - `/api/notifications/send` accepts any POST with valid body
   - No origin checking or CSRF token
   - Evidence: `src/app/api/notifications/send/route.ts` - no request validation

---

## 5. Performance Risks

### Strengths ✅

1. **Firestore Persistent Cache Enabled**
   - Multi-tab manager for offline support
   - Evidence: `src/lib/firebase.ts:20-30` `persistentLocalCache`

2. **Query Limits Applied**
   - Default 50 item limit on list queries
   - Evidence: `src/services/incidents.ts:32` `DEFAULT_QUERY_LIMIT = 50`

3. **Subscription-Based Real-Time**
   - Uses Firestore `onSnapshot` instead of polling
   - Evidence: `subscribeToIncidents()`, `subscribeToMessages()` patterns

4. **Lazy Loading for Maps**
   - Google Maps loaded via provider, not globally
   - Evidence: `src/components/google-maps-provider.tsx`

### Weaknesses ⚠️

1. **N+1 Query in Chat Notifications**
   - For chaser_to_supes threads, queries ALL supes on every message
   - Evidence: `src/services/chat.ts:213-221`
   ```typescript
   const supesQuery = query(
     collection(db, "profiles"),
     where("role", "in", ["supe", "admin"]),
   );
   const supesSnap = await getDocs(supesQuery);
   ```
   - Impact: Every chat message triggers full profiles query

2. **~~Full Table Scan for User Notes~~** ✅ FIXED (Dec 1, 2025)
   - ~~`getIncidentsWithNotes()` iterates ALL incidents, then queries notes subcollection for each~~
   - **Fixed:** Refactored to use collection group query with field override index
   - Evidence: `src/services/incidents.ts:499-519`
   ```typescript
   // NEW: Single collection group query by authorId
   const notesQuery = query(
     collectionGroup(db, "notes"),
     where("authorId", "==", user.uid)
   );
   const notesSnap = await getDocs(notesQuery);
   
   // Extract incident IDs from paths, fetch only those incidents
   const incidentIds = new Set<string>();
   notesSnap.docs.forEach((noteDoc) => {
     const pathSegments = noteDoc.ref.path.split("/");
     incidentIds.add(pathSegments[pathSegments.indexOf("incidents") + 1]);
   });
   ```
   - Impact: Reduced from O(all_incidents) to O(incidents_with_notes) reads
   - Deployed collection group index to production

3. **No Pagination**
   - Incident list capped at 50, no "load more"
   - Chat messages loaded all at once
   - Evidence: No `startAfter`/`endBefore` pagination anywhere

4. **Synchronous Notification Loop**
   - `sendMessage()` sends push notifications sequentially in loop
   - Evidence: `src/services/chat.ts:224-241`
   ```typescript
   for (const recipientId of recipientIds) {
     await fetch("/api/notifications/send", ...);
   }
   ```
   - Impact: Message send blocked by N notification API calls

5. **Large Bundle from UI Components**
   - 56 shadcn components imported
   - Some components import entire icon libraries
   - Evidence: `src/components/ui/` has 56 files, each imports Radix + icons

---

## Top 3 Risks

### Risk #1: Overly Permissive Firestore Rules for Incidents

**Evidence:**
```
firestore.rules:46
allow update: if isAuthenticated();
```

**Probable Impact:**
- Any authenticated user can modify ANY incident
- Malicious user could: change incident status, remove responders, alter location data
- Data integrity compromised across the platform
- Audit trail (`activities` subcollection) can be bypassed

**Mitigation:**
1. Restrict updates to: incident creator, responders, or supes
2. Add field-level validation (e.g., can't change `displayId`, `createdAt`)
3. Use Cloud Functions for sensitive operations (close, award secured)
4. Example rule:
```javascript
allow update: if isAuthenticated() && (
  isSupe() ||
  request.auth.uid in resource.data.responderIds ||
  resource.data.createdById == request.auth.uid
);
```

---

### Risk #2: N+1 Query Pattern in Chat Service

**Evidence:**
```typescript
// src/services/chat.ts:213-221
if (threadData?.type === "chaser_to_supes") {
  const supesQuery = query(
    collection(db, "profiles"),
    where("role", "in", ["supe", "admin"]),
  );
  const supesSnap = await getDocs(supesQuery);
  // ... iterates all supes
}
```

**Probable Impact:**
- Every message in chaser_to_supes thread triggers full profiles query
- With 10 supes × 100 messages/day = 1,000 extra queries/day
- Increases Firestore read costs
- Adds latency to message send (~100-300ms per query)
- At scale: noticeable delay and higher Firebase bill

**Mitigation:**
1. Cache supe list in memory (refresh every 5 mins)
2. Denormalize supe IDs into thread document on creation
3. Use Cloud Function trigger instead of client-side notification
4. Batch notification sends with `Promise.all()` instead of sequential loop

---

### Risk #3: Near-Zero Test Coverage

**Evidence:**
- Only 2 test files: `webhook-parser.test.ts`, `webhook-notifications.test.ts`
- No tests for: `incidents.ts` (799 LOC), `chat.ts` (442 LOC), `profiles.ts` (279 LOC)
- No component tests, no E2E tests
- Estimated coverage: ~3%

**Probable Impact:**
- Regressions shipped to production undetected
- Refactoring extremely risky (no safety net)
- Bug fixes may introduce new bugs
- Developer velocity decreases as codebase grows
- Critical flows (auth, incident response, document signing) untested

**Mitigation:**
1. Add integration tests for critical services:
   - `incidents.ts`: create, respond, close flow
   - `chat.ts`: send message, mark read flow
   - `profiles.ts`: create, update, ban flow
2. Mock Firebase with `firebase-admin` test utilities or emulator
3. Add E2E tests with Playwright for critical user journeys:
   - Login → View incidents → Respond → Chat
4. Set coverage threshold (e.g., 60%) in CI pipeline
5. Extract OpenAI calls behind interface for deterministic testing

---

## High-Level Recommendations

### Immediate (This Sprint)

1. **Fix Firestore Rules**
   - Restrict incident updates to authorized users
   - Add field-level validation
   - Deploy with `firebase deploy --only firestore:rules`

2. **Add Rate Limiting**
   - Use Next.js middleware or Vercel's rate limiting
   - Protect `/api/webhook` and `/api/notifications/send`

3. **Move Service Account**
   - Store in environment variable as base64
   - Or use Google Cloud Secret Manager

### Short-Term (Next 2-4 Weeks)

4. **Add Integration Tests**
   - Priority: incidents service, auth context
   - Use Firebase emulator for isolated testing
   - Target: 40% coverage on services

5. **Fix N+1 Queries**
   - Cache supe list in chat service (still needed)
   - ~~Refactor `getIncidentsWithNotes()` to use composite index~~ ✅ DONE

6. **Split Large Service Files**
   - Break `incidents.ts` into focused modules
   - Extract auth context concerns into separate hooks

### Medium-Term (1-2 Months)

7. **Add Structured Logging**
   - Integrate Pino or Winston
   - Add correlation IDs for request tracing
   - Ship logs to observability platform

8. **Add E2E Tests**
   - Playwright for critical flows
   - Run in CI on PR

9. **Implement Pagination**
   - Cursor-based pagination for incident list
   - Virtual scrolling for chat messages

