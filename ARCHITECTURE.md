# NFA Alerts - Architecture Report

## 1. High-Level System Purpose

**National Fire Alerts (NFA)** is an emergency response coordination platform connecting supervisors (Supes) with field responders (Chasers) for organizations like Miami-Dade Fire Rescue.

**Core Capabilities:**
- Real-time incident management and alerting
- Role-based communication (Chaser ↔ Supe chat)
- Document workflow (capture, sign, PDF generation)
- Location tracking for field responders
- Push notifications for incident updates
- Mobile-first PWA (max 448px viewport)

---

## 2. Architecture Overview

### 2.1 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.0.1 (App Router, React 19.2.0) |
| **Database** | Firebase Firestore (persistent local cache) |
| **Auth** | Firebase Authentication |
| **Storage** | Firebase Cloud Storage |
| **Real-time** | Firestore `onSnapshot` listeners |
| **Push** | Firebase Cloud Messaging (FCM) |
| **AI** | OpenAI GPT-4o-mini (webhook parsing) |
| **Maps** | Google Maps API (geocoding) |
| **UI** | Tailwind CSS 4, shadcn/ui (56 components) |
| **Forms** | React Hook Form + Zod validation |

### 2.2 Layers & Module Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                             │
│  src/app/           Next.js App Router (pages & layouts)        │
│  src/components/    UI components (56 shadcn + domain)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE & CONTEXT                            │
│  src/contexts/      AuthContext, ProfileContext, ProfilesCtx    │
│  src/hooks/         Custom React hooks (12 files)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│  src/services/      Firebase CRUD operations (8 files)          │
│  src/actions/       Server Actions (notifications, changes)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                             │
│  src/lib/firebase.ts       Client SDK (auth, db, storage)       │
│  src/lib/firebase-admin.ts Server SDK (admin ops, FCM)          │
│  src/lib/webhook/*         AI parser + geocoder                 │
│  src/app/api/*             Next.js API routes                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                           │
│  Firebase (Firestore, Auth, Storage, FCM)                       │
│  OpenAI GPT-4o-mini (notification parsing)                      │
│  Google Maps API (geocoding)                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Subsystem Descriptions

### 3.1 Authentication & Authorization

**Responsibility:** Manages user authentication, profile lifecycle, role-based access, and device fingerprinting for ban enforcement.

**Key Files:**
- `src/contexts/auth-context.tsx` - Auth state machine (loading → unauthenticated → incomplete → authenticated)
- `src/components/auth/protected.tsx` - Route guard wrapper
- `src/lib/firebase.ts` - Firebase client config
- `src/services/profiles.ts` - Profile CRUD, role management
- `src/services/moderation.ts` - Ban/suspension checks

**Communication:**
- Firestore `onSnapshot` for real-time profile updates
- Redirects based on auth state (incomplete → signup steps)
- Device fingerprint checked against `bannedDevices` collection

**Roles:**
- `chaser` - Field responder (view/respond to incidents)
- `supe` - Supervisor (manage chasers, close incidents)
- `admin` - Full access (user management, system config)

### 3.2 Incident Management

**Responsibility:** CRUD for incidents, responder tracking, document workflow, activity logging, favorites/bookmarks.

**Key Files:**
- `src/services/incidents.ts` - 800+ LOC service with all incident operations
- `src/app/(dashboard)/incidents/` - 16 files (list, detail, tabs)
- `src/lib/db.ts` - Type definitions (Incident, Note, Document, Signature)
- `src/schemas/incident.ts` - Zod validation

**Communication:**
- Direct Firestore calls from service layer
- `subscribeToIncidents()` for real-time list updates
- `subscribeToIncident(id)` for single incident updates
- Subcollections: `incidents/{id}/notes`, `incidents/{id}/activities`, `incidents/{id}/chaserSubmissions/{chaserId}/documents`

**Data Model:**
```typescript
Incident {
  displayId: "INC-000001"
  type: "fire" | "flood" | "storm" | "wind" | "hail" | "other"
  location: { lat, lng, address, city, county, state }
  status: "active" | "closed"
  responderIds: string[]
  securedById?: string  // Awarded chaser
  alarmLevel?: "all_hands" | "2nd_alarm" | ...
}
```

### 3.3 Webhook Pipeline

**Responsibility:** Ingest external emergency notifications, parse with AI, geocode addresses, create/update incidents.

**Key Files:**
- `src/app/api/webhook/route.ts` - Main entry point (338 LOC)
- `src/lib/webhook/parser.ts` - OpenAI GPT-4o-mini structured output
- `src/lib/webhook/geocoder.ts` - Google Maps geocoding
- `src/lib/webhook/errors.ts` - Custom error classes

**Communication:**
- HTTP POST with Bearer token auth
- OpenAI API for structured parsing
- Google Maps API for lat/lng
- Firebase Admin SDK for server-side writes
- Logs to `webhookLogs` collection

**Flow:** See Critical Flow #1 below.

### 3.4 Chat System

**Responsibility:** Real-time messaging between users. Supports direct threads and chaser-to-supes broadcast threads.

**Key Files:**
- `src/services/chat.ts` - Thread/message CRUD, subscriptions
- `src/app/(dashboard)/chat/` - Chat UI (6 files)
- `src/hooks/use-chat.ts` - Chat hook
- `src/hooks/use-message-notifications.ts` - Unread badges

**Communication:**
- Firestore subcollections: `threads/{id}/messages`
- Real-time via `subscribeToMessages(threadId)`
- Push notifications via `/api/notifications/send`

**Thread Types:**
- `direct` - 1:1 between two users
- `chaser_to_supes` - Chaser broadcasts to all Supes

### 3.5 Push Notifications

**Responsibility:** FCM-based push notifications for incidents and messages.

**Key Files:**
- `src/hooks/use-push-notifications.ts` - Client-side FCM registration
- `src/app/api/notifications/send/route.ts` - Server-side notification dispatch
- `src/lib/firebase-admin.ts` - `sendNotification()`, `sendNotificationToMultiple()`
- `public/firebase-messaging-sw.js` - Service worker for background push

**Communication:**
- FCM token stored in `profiles.pushToken`
- In-app notifications stored in `appNotifications` collection
- Invalid tokens auto-cleared on send failure

### 3.6 File Storage

**Responsibility:** Upload and manage profile photos, signatures, incident documents, voice messages.

**Key Files:**
- `src/services/storage.ts` - All upload functions
- `storage.rules` - Firebase Storage security rules

**Storage Paths:**
```
profiles/{uid}/avatar.jpg
profiles/{uid}/signature.png
incidents/{id}/{chaserId}/documents/{file}
incidents/{id}/signatures/{file}
voice/{threadId}/{file}
attachments/{threadId}/{file}
```

---

## 4. Critical Data Flows

### Flow #1: Webhook → Incident Creation

**Trigger:** External system POSTs notification to `/api/webhook`

```
1. POST /api/webhook
   └─ src/app/api/webhook/route.ts:POST()
      │
      ├─ Validate Bearer token (WEBHOOK_AUTH_TOKEN)
      │
      ├─ Sanitize input (sanitizeInput())
      │   └─ Remove control chars, limit 10k chars
      │
      ├─ AI Parse (parseNotification())
      │   └─ src/lib/webhook/parser.ts
      │      └─ OpenAI GPT-4o-mini generateObject()
      │         Schema: notificationSchema (Zod)
      │         Output: {source, alertId, isUpdate, incidentType, location, description}
      │
      ├─ Geocode (geocodeAddress())
      │   └─ src/lib/webhook/geocoder.ts
      │      └─ Google Maps Geocoding API
      │         Returns: {lat, lng}
      │
      ├─ Check existing incident by alertId
      │   └─ adminDb.collection("incidents").where("alertId", "==", ...)
      │
      ├─ If isUpdate + existing → Add activity to incident
      │   └─ incidents/{id}/activities.add({type, description})
      │
      └─ Else → Create new incident
          ├─ getNextIncidentNumber() → runTransaction on counters/incidents
          ├─ adminDb.collection("incidents").add({...})
          └─ Log to webhookLogs collection
```

**Error Handling:**
- 401: Invalid auth token
- 422: Geocoding or parsing failure
- 500: Server error

### Flow #2: User Responds to Incident

**Trigger:** User taps "Respond" button on incident detail page

```
1. UI: User clicks respond button
   └─ src/app/(dashboard)/incidents/[id]/IncidentDetailClient.tsx
      │
      └─ respondToIncident(incidentId, note?)
         └─ src/services/incidents.ts:respondToIncident()
            │
            ├─ Get auth.currentUser.uid
            │
            ├─ updateDoc(incidents/{id}, {
            │     responderIds: arrayUnion(uid),
            │     responderCount: increment(1),
            │     respondedAt: Date.now()
            │   })
            │
            ├─ If note provided:
            │   └─ addNote(incidentId, note)
            │      └─ setDoc(incidents/{id}/notes/{new})
            │
            └─ addIncidentActivity(incidentId, {
                 type: "custom",
                 description: "Responded to incident",
                 profileId: uid
               })
               └─ setDoc(incidents/{id}/activities/{new})
               └─ updateDoc(incidents/{id}, { activityCount: increment(1) })
```

**Real-time Update:**
- All clients subscribed via `subscribeToIncident(id)` receive `onSnapshot` update
- Incident list refreshes via `subscribeToIncidents()`

### Flow #3: Chat Message → Push Notification

**Trigger:** User sends message in chat thread

```
1. UI: User submits message
   └─ src/app/(dashboard)/chat/[threadId]/ChatThreadClient.tsx
      │
      └─ sendMessage(threadId, text)
         └─ src/services/chat.ts:sendMessage()
            │
            ├─ Create message document
            │   └─ setDoc(threads/{id}/messages/{new}, {
            │        senderId, text, readBy: [senderId], reactions: []
            │      })
            │
            ├─ Update thread metadata
            │   └─ updateDoc(threads/{id}, {
            │        lastMessage: text,
            │        lastMessageAt: now,
            │        unreadCount: { ...increment for other participants }
            │      })
            │
            ├─ Get sender profile name
            │   └─ getProfile(uid)
            │
            ├─ Determine recipients
            │   ├─ Direct: other participant
            │   └─ chaser_to_supes: query profiles where role in [supe, admin]
            │
            └─ For each recipient:
                └─ fetch("/api/notifications/send", {
                     profileId, type: "chat", title, body, url
                   })
                   └─ src/app/api/notifications/send/route.ts:POST()
                      │
                      ├─ Create appNotifications doc
                      │
                      └─ If profile.pushToken exists:
                          └─ sendNotification(token, {title, body, data})
                             └─ src/lib/firebase-admin.ts
                                └─ adminMessaging.send()
                                   └─ FCM delivery to device
```

---

## 5. Integrations & Dependencies

### External Services

| Service | Purpose | Files |
|---------|---------|-------|
| **Firebase Auth** | Email/password + Google OAuth | `src/lib/firebase.ts`, `src/contexts/auth-context.tsx` |
| **Firebase Firestore** | Primary database (14+ collections) | `src/services/*.ts` |
| **Firebase Storage** | File uploads | `src/services/storage.ts` |
| **Firebase Cloud Messaging** | Push notifications | `src/lib/firebase-admin.ts`, `public/firebase-messaging-sw.js` |
| **OpenAI GPT-4o-mini** | Webhook notification parsing | `src/lib/webhook/parser.ts` |
| **Google Maps API** | Geocoding addresses | `src/lib/webhook/geocoder.ts` |

### Firestore Collections

```
profiles              # User profiles + subcollections (activities, locations)
incidents             # Incident records + subcollections (notes, activities, chaserSubmissions)
threads               # Chat threads + subcollection (messages)
userIncidents         # User-incident relations (favorite, bookmark, hide, mute, view)
appNotifications      # In-app notifications
webhookLogs           # Webhook audit trail
counters              # Auto-increment counters
presence              # Online status
changeRequests        # Change request workflow
bannedDevices         # Device ban list
signedDocuments       # Signed PDF records
```

### Key NPM Dependencies

- `firebase` / `firebase-admin` - Firebase SDKs
- `@ai-sdk/openai` + `ai` - AI SDK for structured output
- `@googlemaps/google-maps-services-js` - Server-side geocoding
- `@tanstack/react-query` - Available but not heavily used (direct Firestore preferred)
- `react-hook-form` + `zod` - Form validation
- `@react-pdf/renderer` - PDF generation
- `react-signature-canvas` - Signature capture
- `web-push` - VAPID push (legacy, FCM now primary)

---

## 6. Risks & Tech Debt

### Security Risks

1. **Firestore Rules - Overly Permissive**
   - `incidents` allow any authenticated user to update (`allow update: if isAuthenticated()`)
   - Should restrict to responders or owner

2. **Webhook Auth - Bearer Token Only**
   - No IP allowlist or request signing
   - Token in env var is single point of failure

3. **Admin SDK Exposed Server-Side Only**
   - Service account JSON file in repo root (gitignored but risky)

### Performance Risks

1. **N+1 Queries in Chat**
   - `sendMessage()` queries all supes for chaser_to_supes threads
   - Should cache supe list or use denormalized field

2. **`getIncidentsWithNotes()` - Full Table Scan**
   - Iterates all incidents to check for user's notes
   - Should use composite index or denormalize

3. **Large Incident Lists**
   - Default limit is 50, no pagination implemented
   - Mobile may struggle with large lists

### Complexity / Tech Debt

1. **Mixed Real-time Patterns**
   - Some components use `subscribeToX()` directly
   - Some use hooks like `useChat()`
   - Inconsistent approach

2. **Duplicate Type Definitions**
   - Types in `src/lib/db.ts` and Zod schemas in `src/schemas/`
   - Should derive types from Zod schemas (`z.infer`)

3. **Service Worker Dual Registration**
   - Both `sw.js` and `firebase-messaging-sw.js` registered
   - Potential conflicts

4. **No Offline Support**
   - Firestore persistent cache enabled but no explicit offline handling
   - PWA without true offline capability

---

## 7. Testing Situation

### Test Location
- `tests/` directory (3 files)

### Test Files
| File | Purpose |
|------|---------|
| `tests/setup.ts` | Vitest setup, loads dotenv |
| `tests/webhook-parser.test.ts` | AI parser unit tests (12 tests) |
| `tests/webhook-notifications.test.ts` | Notification parsing tests |

### Test Runner
- **Vitest 4.0.8** with UI mode available
- Run: `pnpm test` or `pnpm test:ui`

### Coverage Gaps
- No integration tests for Firestore operations
- No E2E tests
- No component tests
- Only webhook parsing is tested

---

## 8. Debugging Pointers

| Issue | Where to Look |
|-------|---------------|
| Auth not working | `src/contexts/auth-context.tsx` (state machine), browser console for Firebase errors |
| Webhook failures | `webhookLogs` collection in Firestore, server logs for `[WEBHOOK]` prefixed messages |
| Push not delivered | Check `profiles.pushToken` exists, FCM console, `firebase-messaging-sw.js` registration |
| Incident not updating | Check `subscribeToIncident()` subscription, Firestore rules, browser Network tab |
| Chat messages missing | `threads/{id}/messages` subcollection, `subscribeToMessages()` listener |
| File upload fails | Check Storage rules, `src/services/storage.ts`, Firebase Storage console |
| AI parsing wrong | `src/lib/webhook/parser.ts` prompt, add test case to `webhook-parser.test.ts` |
| Geocoding fails | Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, Google Cloud console quotas |

### Useful Commands

```bash
pnpm dev          # Start dev server
pnpm test         # Run tests
pnpm lint         # ESLint check
pnpm build        # Production build

# Firebase
firebase emulators:start    # Local emulators
firebase deploy --only firestore:rules
```

---

## 9. File Quick Reference

### Entrypoints
- `src/app/page.tsx` - Root redirect to /incidents
- `src/app/layout.tsx` - Root layout with providers
- `src/app/api/webhook/route.ts` - Webhook ingestion
- `src/app/api/notifications/send/route.ts` - Push dispatch

### Core Services
- `src/services/incidents.ts` - Incident CRUD (800 LOC)
- `src/services/profiles.ts` - User profiles
- `src/services/chat.ts` - Messaging
- `src/services/storage.ts` - File uploads
- `src/services/notifications.ts` - In-app notifications

### Infrastructure
- `src/lib/firebase.ts` - Client SDK init
- `src/lib/firebase-admin.ts` - Server SDK + FCM
- `src/lib/webhook/parser.ts` - AI parsing
- `src/lib/webhook/geocoder.ts` - Address geocoding

### Security
- `firestore.rules` - Firestore access control
- `storage.rules` - Storage access control

### Types & Validation
- `src/lib/db.ts` - TypeScript interfaces
- `src/schemas/*.ts` - Zod schemas

