# NFA Alerts - Polish Report (Phase 1)

## Executive Summary

This report analyzes the NFA Alerts codebase to identify polish opportunities, document the architecture, and propose targeted PRs. The codebase is well-structured with clear separation of concerns, but has several issues that should be addressed before production readiness.

**Key Findings:**
- 3 lint errors blocking CI (React hooks purity violations)
- Overly permissive Firestore rules for incident updates (security risk)
- Role enforcement gaps in service layer (Supe vs Chaser)
- Gates mismatch between package.json and expected CI scripts
- ~3% test coverage (only webhook parser tested)

---

## 1. Architecture Map

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.1 (App Router, React 19.2.3) |
| Database | Firebase Firestore (persistent local cache) |
| Auth | Firebase Authentication |
| Storage | Firebase Cloud Storage |
| Real-time | Firestore `onSnapshot` listeners |
| Push | Firebase Cloud Messaging (FCM) |
| AI | OpenAI GPT-4o-mini (webhook parsing) |
| Maps | Google Maps API (geocoding) |
| UI | Tailwind CSS 4, shadcn/ui (56 components) |
| Forms | React Hook Form + Zod validation |

### Layer Diagram

```
+------------------------------------------------------------------+
|                        PRESENTATION                               |
|  src/app/           Next.js App Router (pages & layouts)          |
|  src/components/    UI components (56 shadcn + domain)            |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      STATE & CONTEXT                              |
|  src/contexts/      AuthContext (auth state machine)              |
|  src/hooks/         Custom React hooks (11 files)                 |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                       SERVICE LAYER                               |
|  src/services/      Firebase CRUD operations (8 files)            |
|  src/actions/       Server Actions (change requests)              |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      INFRASTRUCTURE                               |
|  src/lib/firebase.ts       Client SDK (auth, db, storage)         |
|  src/lib/firebase-admin.ts Server SDK (admin ops, FCM)            |
|  src/lib/webhook/*         AI parser + geocoder                   |
|  src/app/api/*             Next.js API routes                     |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                     EXTERNAL SERVICES                             |
|  Firebase (Firestore, Auth, Storage, FCM)                         |
|  OpenAI GPT-4o-mini (notification parsing)                        |
|  Google Maps API (geocoding)                                      |
+------------------------------------------------------------------+
```

### Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Public: /login, /signup, /banned
│   ├── (dashboard)/         # Protected routes
│   │   ├── incidents/       # Incident list + details (16 files)
│   │   ├── chat/            # Messaging (6 files)
│   │   ├── chasers/         # Chaser management (supes only)
│   │   ├── favorites/       # Bookmarks, favorites
│   │   ├── notifications/   # Push notifications
│   │   ├── profile/         # User profile
│   │   ├── route/           # Route planner
│   │   └── admin/           # Admin pages
│   └── api/                 # API routes (webhook, notifications, weather)
├── components/
│   ├── ui/                  # shadcn/ui components (56 files)
│   ├── layout/              # Shell, Header, PageContent
│   ├── auth/                # Protected wrapper
│   └── incidents/           # Incident-specific components
├── contexts/                # AuthContext
├── hooks/                   # Custom hooks (11 files)
├── services/                # Firebase service functions (8 files)
├── schemas/                 # Zod validation schemas
├── lib/
│   ├── firebase.ts          # Firebase client
│   ├── firebase-admin.ts    # Firebase Admin SDK
│   ├── db.ts                # Type definitions
│   └── webhook/             # AI parser + geocoder
└── types/                   # Additional TypeScript types
```

### Key Data Flows

**Webhook -> Incident Creation:**
```
POST /api/webhook
  -> Validate Bearer token
  -> Sanitize input
  -> AI Parse (OpenAI GPT-4o-mini)
  -> Geocode (Google Maps)
  -> Check existing incident by alertId
  -> Create/Update incident in Firestore
  -> Log to webhookLogs collection
```

**User Responds to Incident:**
```
UI: Click "Respond" button
  -> respondToIncident(incidentId)
  -> updateDoc(incidents/{id}, { responderIds: arrayUnion(uid) })
  -> addIncidentActivity(incidentId, { type: "custom", description: "Responded" })
  -> Real-time update via onSnapshot to all subscribers
```

---

## 2. Role Model (Supe vs Chaser)

### Role Definitions

| Role | Description | Capabilities |
|------|-------------|--------------|
| **chaser** | Field responder | View/respond to incidents, chat with chasers/supes, add notes, upload documents |
| **supe** | Supervisor | All chaser + create incidents, assign jobs, close incidents, manage chasers, view all chats |
| **admin** | Administrator | All supe + user management, system config, view webhook logs |

### Server-Side Enforcement (Firestore Rules)

The Firestore rules define role-checking functions:

```javascript
// firestore.rules:17-23
function isSupe() {
  return isAuthenticated() && getProfile().role in ['supe', 'admin'];
}

function isAdmin() {
  return isAuthenticated() && getProfile().role == 'admin';
}
```

**Role enforcement by collection:**

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| profiles | Owner | Auth | Owner/Admin | Admin |
| incidents | **Supe** | Auth | **Auth (TOO PERMISSIVE)** | Admin |
| incidents/notes | Auth | Auth | Author | Author |
| incidents/documents | Auth | Auth | - | Supe |
| threads | Auth | Participant/Supe | Participant/Supe | - |
| changeRequests | Auth | Requester/Supe | Supe | Admin |
| bannedDevices | - | Auth | Supe | - |

### Client-Side Enforcement

The `useRole()` hook provides role checks:

```typescript
// src/hooks/use-role.ts
export function useRole() {
  const { profile } = useAuth();
  const isSupe = profile?.role === "supe" || profile?.role === "admin";
  const isChaser = profile?.role === "chaser";
  const isAdmin = profile?.role === "admin";
  return { isSupe, isChaser, isAdmin, role: profile?.role };
}
```

**UI enforcement examples:**
- `ChasersClient` (line 95-107): Shows "Access Denied" if not supe
- `IncidentDetailClient` (line 171, 533, 576): Conditionally renders supe-only actions

### Role Enforcement Gaps

**Issue #1: Overly Permissive Incident Updates**
- Location: `firestore.rules:45`
- Current: `allow update: if isAuthenticated();`
- Problem: Any authenticated user can modify ANY incident
- Should be: Restrict to responders, creator, or supes

**Issue #2: Service Functions Lack Role Checks**
The following service functions perform privileged operations without role verification:

| Function | Location | Issue |
|----------|----------|-------|
| `awardSecured()` | incidents.ts:169 | No supe check |
| `removeSecured()` | incidents.ts:186 | No supe check |
| `closeIncident()` | incidents.ts:196 | No supe check |
| `reopenIncident()` | incidents.ts:217 | No supe check |
| `removeResponder()` | incidents.ts:238 | No supe check |
| `warnUser()` | moderation.ts:13 | No supe check |
| `suspendUser()` | moderation.ts:30 | No supe check |
| `banUser()` | moderation.ts:67 | No supe check |

These rely on Firestore rules for enforcement, but the rules are too permissive. The UI hides these actions from non-supes, but a malicious user could call the service functions directly.

---

## 3. Top Issues (Ranked by Impact x Confidence / Effort)

### Scoring Legend
- **Impact**: High (3), Medium (2), Low (1)
- **Confidence**: High (3), Medium (2), Low (1)
- **Effort**: High (3), Medium (2), Low (1)
- **Score**: (Impact x Confidence) / Effort

| # | Issue | Impact | Confidence | Effort | Score | Priority |
|---|-------|--------|------------|--------|-------|----------|
| 1 | React Hooks lint errors (3 files) | 2 | 3 | 1 | **6.0** | Critical |
| 2 | Overly permissive Firestore rules | 3 | 3 | 1 | **9.0** | Critical |
| 3 | Unused variables lint warnings (4 files) | 1 | 3 | 1 | **3.0** | High |
| 4 | Service functions lack role checks | 2 | 2 | 2 | **2.0** | Medium |
| 5 | N+1 query in chat service | 2 | 3 | 2 | **3.0** | Medium |
| 6 | Type definitions scattered | 2 | 3 | 2 | **3.0** | Medium |
| 7 | Test coverage ~3% | 3 | 3 | 3 | **3.0** | Medium |
| 8 | Oversized service files | 1 | 3 | 2 | **1.5** | Low |

### Issue Details

#### Issue #1: React Hooks Lint Errors (BLOCKING)

**Files affected:**
1. `src/app/(dashboard)/admin/locations/admin-locations-client.tsx:99`
   - Error: `Date.now()` called during render (impure function)
2. `src/app/(dashboard)/admin/users/[id]/admin-user-edit-client.tsx:127`
   - Error: `setState` called synchronously within effect
3. `src/app/(dashboard)/chat/chat-client.tsx:112`
   - Error: `setState` called synchronously within effect

**Impact**: These are lint errors that will fail CI.

#### Issue #2: Overly Permissive Firestore Rules (SECURITY)

**Location**: `firestore.rules:45`
```javascript
allow update: if isAuthenticated();
```

**Problem**: Any authenticated user can update ANY incident field including:
- `status` (close incidents)
- `securedById` (assign jobs)
- `responderIds` (add/remove responders)
- `location` (alter incident data)

**Recommended fix**:
```javascript
allow update: if isAuthenticated() && (
  isSupe() ||
  request.auth.uid in resource.data.responderIds ||
  resource.data.createdById == request.auth.uid
);
```

#### Issue #3: Unused Variables Lint Warnings

**Files affected:**
1. `src/actions/change-requests.ts:103` - `_homeowner` unused
2. `src/app/(auth)/login/page.tsx:32` - `router` unused
3. `src/app/(auth)/signup/profile/page.tsx:32` - `_user` unused
4. `src/app/(dashboard)/admin/users/[id]/admin-user-edit-client.tsx:46` - `UserProfile` unused

#### Issue #4: Service Functions Lack Role Checks

Service functions like `awardSecured()`, `closeIncident()`, `banUser()` perform privileged operations without verifying the caller has the required role. They rely on:
1. UI hiding the buttons (client-side only)
2. Firestore rules (currently too permissive)

#### Issue #5: N+1 Query in Chat Service

**Location**: `src/services/chat.ts:213-221`

Every message sent in a `chaser_to_supes` thread queries ALL supes:
```typescript
const supesQuery = query(
  collection(db, "profiles"),
  where("role", "in", ["supe", "admin"]),
);
const supesSnap = await getDocs(supesQuery);
```

**Impact**: With 10 supes and 100 messages/day = 1,000 extra Firestore reads/day.

---

## 4. Gates Mismatch Notes

### Current State (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### Expected Gates (per user instructions)

```
pnpm typecheck
pnpm test:unit
pnpm build
pnpm lint:ci
```

### Missing Scripts

| Expected | Current | Status |
|----------|---------|--------|
| `typecheck` | - | **MISSING** |
| `test:unit` | `test` | Name mismatch |
| `build` | `build` | OK |
| `lint:ci` | `lint` | Name mismatch |

### Recommended Additions (DO NOT FIX YET)

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run",
    "lint:ci": "eslint --max-warnings 0"
  }
}
```

**Note**: Per user instructions, gate script normalization is handled by infra PRs. This report documents the mismatch without implementing fixes.

---

## 5. Proposed PRs (Priority Order)

### PR #1: Fix React Hooks Lint Errors
**Priority**: Critical (blocks CI)
**Effort**: Low (~30 min)
**Files**: 3

Fix the 3 React hooks purity violations:
1. Move `Date.now()` call outside render in `admin-locations-client.tsx`
2. Refactor `setState` in effects to use proper patterns in `admin-user-edit-client.tsx`
3. Refactor `setState` in effects in `chat-client.tsx`

### PR #2: Tighten Firestore Rules for Incidents
**Priority**: Critical (security)
**Effort**: Low (~1 hour)
**Files**: 1

Update `firestore.rules` to restrict incident updates:
- Only responders, creator, or supes can update incidents
- Add field-level validation to prevent changing `displayId`, `createdAt`

### PR #3: Clean Up Unused Variables
**Priority**: High (lint warnings)
**Effort**: Low (~15 min)
**Files**: 4

Remove or prefix unused variables:
- `_homeowner` in change-requests.ts
- `router` in login/page.tsx
- `_user` in signup/profile/page.tsx
- `UserProfile` in admin-user-edit-client.tsx

### PR #4: Add Role Checks to Service Functions
**Priority**: Medium (defense in depth)
**Effort**: Medium (~2 hours)
**Files**: 2

Add explicit role verification to privileged service functions:
- `awardSecured()`, `removeSecured()`, `closeIncident()`, `reopenIncident()`, `removeResponder()` in incidents.ts
- `warnUser()`, `suspendUser()`, `banUser()` in moderation.ts

### PR #5: Cache Supe List in Chat Service
**Priority**: Medium (performance)
**Effort**: Medium (~1 hour)
**Files**: 1

Implement in-memory caching for supe list in `sendMessage()`:
- Cache supe IDs with 5-minute TTL
- Reduces Firestore reads by ~90% for chaser_to_supes messages

### PR #6: Normalize Gate Scripts (DEFERRED)
**Priority**: Medium (CI/CD)
**Effort**: Low (~15 min)
**Files**: 1

Add missing scripts to package.json:
- `typecheck`: `tsc --noEmit`
- `test:unit`: `vitest run`
- `lint:ci`: `eslint --max-warnings 0`

**Note**: Deferred per user instructions - handled by infra PRs.

---

## 6. Test Status

### Current Coverage

| Area | Coverage | Notes |
|------|----------|-------|
| Webhook Parser | ~100% | 12 test cases |
| Webhook Notifications | ~100% | 28 test cases |
| Services | 0% | No tests |
| Components | 0% | No tests |
| E2E | 0% | No tests |

**Estimated overall coverage**: ~3%

### Test Execution Status

Tests currently fail due to invalid OpenAI API key in `.env`:
```
APICallError: Incorrect API key provided: sk-proj-***
```

The tests require a valid OpenAI API key to run because they call the actual GPT-4o-mini API (no mocking).

---

## Appendix: File Metrics

| File | Lines | Notes |
|------|-------|-------|
| src/services/incidents.ts | 799 | Largest service file |
| src/services/chat.ts | 442 | Second largest |
| src/services/profiles.ts | 280 | |
| src/services/moderation.ts | 197 | |
| src/app/api/webhook/route.ts | 338 | Well-documented |
| src/contexts/auth-context.tsx | 194 | Multiple concerns |
| src/lib/db.ts | 265 | Type definitions |

---

*Report generated: December 28, 2025*
*Devin Session: https://app.devin.ai/sessions/9d356073798240d68a758e4e9439d048*
