# Convex to Firebase Migration Plan

## Executive Summary

Migrate NFA Alerts from Convex + Better Auth to Firebase (Firestore, Firebase Auth, Cloud Functions, Cloud Storage). Same UI, same functionality.

**Estimated Effort:** 95-140 hours of focused work

---

## Recent Features Added (Must Migrate)

### Incident Management

- **Secured Award Flow** - Supes can award "Secured" status to chasers who won homeowners
- **Incident Lifecycle** - Open/Closed status with close/reopen actions
- **Remove Responder** - Supes can remove chasers from incidents

### Chaser Management

- **Real-time Status** - Chasers show as "Responding", "Available", or "Offline"
- **Active Incidents** - Shows which incident a chaser is currently responding to
- **Online Detection** - Based on lastSeen timestamp (5 min threshold)

### UI/UX Improvements

- **Distance Badge** - Shows distance to incident at start of description
- **Interactive Walkthrough** - Multi-phase Joyride tour (list → detail → nav)
- **Role-specific Tours** - Different steps for Chasers vs Supes
- **Horizontal Scroll Indicators** - Fade gradients on nav when scrollable
- **Forced PWA Install** - Blocks web access, requires app installation
- **PWA Detection** - Detects if already installed, shows "Open App"

### Profile

- **Location Tracking Toggle** - Users can enable/disable location sharing
- **Walkthrough Completion** - Tracks if user completed app tour

---

## Current Stack vs Target Stack

| Layer              | Current                  | Target                             |
| ------------------ | ------------------------ | ---------------------------------- |
| Database           | Convex (18 tables)       | Firestore + Typesaurus (type-safe) |
| Auth               | Better Auth + Convex     | Firebase Auth                      |
| Real-time          | Convex useQuery          | Typesaurus hooks (onSnapshot)      |
| Backend            | Convex mutations/queries | Cloud Functions + Zod validation   |
| File Storage       | Convex Storage           | Firebase Storage                   |
| Background Jobs    | Convex scheduler         | Cloud Tasks / Pub/Sub              |
| Push Notifications | web-push via Convex      | Firebase Cloud Messaging           |
| Validation         | Zod schemas              | Zod schemas (reuse existing)       |

---

## Migration Phases

### Phase 1: Foundation Setup

**Effort: 8-12 hours**

- [ ] Create Firebase project
- [ ] Configure Firebase Auth (Email/Password + Google OAuth)
- [ ] Setup Firestore database with security rules
- [ ] Setup Firebase Storage with security rules
- [ ] Setup Cloud Functions project (TypeScript)
- [ ] Configure Firebase Admin SDK
- [ ] Environment variables setup
- [ ] Replace Convex client provider with Firebase provider

**Files to create:**

```
src/lib/firebase.ts          # Firebase client config
src/lib/firebase-admin.ts    # Admin SDK (server-side)
src/lib/db.ts                # Typesaurus schema
src/functions/               # Cloud Functions (in-app, no subproject)
firestore.rules              # Security rules
storage.rules                # Storage security rules
```

---

### Phase 2: Authentication Migration

**Effort: 12-16 hours**

#### 2.1 Firebase Auth Setup

- [ ] Replace Better Auth with Firebase Auth
- [ ] Email/password authentication
- [ ] Google OAuth provider
- [ ] Session management (replace Better Auth sessions)

#### 2.2 Auth Hook Migration

- [ ] Rewrite `src/hooks/use-auth.ts` for Firebase
- [ ] Update `src/components/auth-provider.tsx`
- [ ] Update auth state checks across all pages

#### 2.3 Auth Pages

- [ ] `/src/app/(auth)/login/page.tsx`
- [ ] `/src/app/(auth)/signup/page.tsx` (all steps)
- [ ] `/src/app/(auth)/forgot-password/page.tsx`
- [ ] `/src/app/(auth)/verify-email/page.tsx`

**Key Changes:**

- `@convex-dev/better-auth` → `firebase/auth`
- `authComponent.getAuthUser(ctx)` → Firebase Admin `verifyIdToken()`
- Session cookies → Firebase ID tokens

---

### Phase 3: Database Schema Migration

**Effort: 6-8 hours**

#### Firestore Collections Design

```
/users/{uid}                    # Profiles (merged with auth)
                                # + hasCompletedWalkthrough: boolean
/incidents/{incidentId}         # Incidents
                                # + securedById, securedAt (awarded chaser)
                                # + status: "active" | "closed"
                                # + closedAt, closedById
/incidents/{id}/notes/{noteId}  # Subcollection
/incidents/{id}/documents/{docId}
/incidents/{id}/signatures/{sigId}
/incidents/{id}/activities/{actId}
/threads/{threadId}             # Chat threads
/threads/{id}/messages/{msgId}  # Subcollection
/userIncidents/{id}             # Favorites/bookmarks/hidden/muted/viewed (composite)
/locations/{uid}                # Latest location
/locationHistory/{uid}/points/{pointId}  # Location breadcrumbs
/activities/{activityId}        # User activities
/presence/{uid}                 # Online status
/appNotifications/{id}          # In-app notifications
/webhookLogs/{id}               # Webhook audit log
/counters/incidents             # Atomic counter
```

#### Migration Tasks

- [ ] Design Firestore schema with Typesaurus
- [ ] Write Firestore security rules
- [ ] Define Typesaurus schema (type-safe collections)
- [ ] Reuse existing Zod schemas for validation
- [ ] Write data migration script (Convex → Firestore)

---

### Phase 4: Cloud Functions (Backend Logic)

**Effort: 20-25 hours**

#### 4.1 Profile Functions

```typescript
// Callable functions
createProfile(data);
updateProfile(uid, data);
uploadProfilePhoto(uid, base64);
updateLegalInfo(uid, data);
updateEmergencyContact(uid, data);
uploadSignature(uid, base64);
toggleLocationTracking(uid, enabled);
updateLocation(uid, coords);
updatePushToken(uid, token);
completeWalkthrough(uid);             # Mark walkthrough as completed

// Admin functions
listAllUsers();
updateUserRole(uid, role);
suspendUser(uid, reason);
banUser(uid, reason);
deleteUser(uid);
```

#### 4.2 Incident Functions

```typescript
// Callable
listIncidents(filters)
getIncident(id)
createIncident(data)
respondToIncident(incidentId, note)
addNote(incidentId, text)
uploadDocument(incidentId, file)
updateHomeowner(incidentId, data)
toggleFavorite(incidentId)
toggleBookmark(incidentId)
toggleHide(incidentId)
toggleMute(incidentId)
markViewed(incidentId)
awardSecured(incidentId, chaserId)    # Supe awards secured to chaser
removeSecured(incidentId)             # Supe removes secured award
closeIncident(incidentId)             # Supe closes incident
reopenIncident(incidentId)            # Supe reopens incident
removeResponder(incidentId, chaserId) # Supe removes chaser from incident

// HTTP triggers
webhookHandler(req, res)   # External webhook ingestion

// Background triggers
onIncidentCreate()         # Send notifications
onIncidentUpdate()         # Activity logging
```

#### 4.3 Chat Functions

```typescript
// Callable
listThreads()
getThread(threadId)
getMessages(threadId, pagination)
sendMessage(threadId, content)
markAsRead(threadId)
getOrCreateDirectThread(participantId)

// Background triggers
onMessageCreate()          # Push notification
```

#### 4.4 Notification Functions

```typescript
// Background (Pub/Sub or triggered)
sendPushNotification(tokens, payload);
createAppNotification(uid, data);

// Callable
listAppNotifications();
markNotificationRead(id);
markAllNotificationsRead();
```

---

### Phase 5: Client-Side Migration

**Effort: 25-35 hours**

#### 5.1 Replace Convex Hooks

| Convex                 | Firebase Equivalent                   |
| ---------------------- | ------------------------------------- |
| `useQuery(api.x.y)`    | Custom hook with `onSnapshot`         |
| `useMutation(api.x.y)` | `httpsCallable()` or direct Firestore |
| `usePreloadedQuery()`  | Server-side `getDoc()` + hydration    |
| Optimistic updates     | Firestore `setDoc` with merge         |

#### 5.2 Pages to Migrate (45 files)

**Auth Pages (4 files)**

- [ ] `signup/profile/page.tsx`
- [ ] `signup/legal/page.tsx`
- [ ] `signup/signature/page.tsx`
- [ ] `suspended/suspended-client.tsx`

**Dashboard Pages (15+ files)**

- [ ] `incidents/incidents-client.tsx`
- [ ] `incidents/[id]/IncidentDetailClient.tsx`
- [ ] `incidents/[id]/homeowner/HomeownerClient.tsx`
- [ ] `incidents/[id]/docs/DocsClient.tsx`
- [ ] `incidents/[id]/sign/SignClient.tsx`
- [ ] `chat/chat-client.tsx`
- [ ] `chat/[threadId]/ChatThreadClient.tsx`
- [ ] `chasers/chasers-client.tsx`
- [ ] `chasers/[chaserId]/ChaserDetailClient.tsx`
- [ ] `admin/users/admin-users-client.tsx`
- [ ] `admin/users/[id]/admin-user-edit-client.tsx`
- [ ] `profile/profile-client.tsx`
- [ ] `profile/information/page.tsx`
- [ ] `profile/activity/page.tsx`
- [ ] `notifications/notifications-client.tsx`
- [ ] `favorites/favorites-client.tsx`

**Components (5+ files)**

- [ ] `components/layout/app-layout.tsx`
- [ ] `components/incidents/incident-card.tsx`
- [ ] `components/presence.tsx`
- [ ] `components/auth-provider.tsx`

**Hooks (3 files)**

- [ ] `hooks/use-auth.ts`
- [ ] `hooks/use-push-notifications.ts`
- [ ] `hooks/use-message-notifications.ts`

**API Routes (2 files)**

- [ ] `api/webhook/route.ts`
- [ ] `api/admin/merge-duplicates/route.ts`

---

### Phase 6: File Storage Migration

**Effort: 4-6 hours**

- [ ] Replace Convex storage with Firebase Storage
- [ ] Update upload flows (profile photos, signatures, documents)
- [ ] Update download URL generation
- [ ] Migrate existing files from Convex to Firebase Storage
- [ ] Update security rules for file access

**Pattern Change:**

```typescript
// Convex
const uploadUrl = await generateUploadUrl();
await fetch(uploadUrl, { method: "POST", body: file });
const storageId = result.storageId;
const url = await ctx.storage.getUrl(storageId);

// Firebase
const storageRef = ref(storage, `users/${uid}/profile.jpg`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
```

---

### Phase 7: Real-time Features

**Effort: 6-8 hours**

- [ ] Implement Firestore listeners for incidents list
- [ ] Implement Firestore listeners for chat messages
- [ ] Implement presence system with Firestore
- [ ] Implement unread count tracking
- [ ] Test real-time sync across devices

**Pattern:**

```typescript
// Convex (automatic)
const incidents = useQuery(api.incidents.list)

// Firebase (manual subscription)
const [incidents, setIncidents] = useState([])
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'incidents'), where(...), orderBy(...)),
    (snapshot) => setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  )
  return unsubscribe
}, [])
```

---

### Phase 8: Push Notifications

**Effort: 4-6 hours**

- [ ] Setup Firebase Cloud Messaging (FCM)
- [ ] Replace web-push with FCM
- [ ] Update service worker for FCM
- [ ] Update push subscription flow
- [ ] Test notifications across browsers

---

### Phase 9: Testing & Cleanup

**Effort: 8-12 hours**

- [ ] End-to-end testing of all flows
- [ ] Fix type errors
- [ ] Remove all Convex dependencies
- [ ] Remove convex/ directory
- [ ] Update package.json
- [ ] Update environment variables documentation
- [ ] Performance testing
- [ ] Security audit

---

## Detailed File Changes

### Files to Delete

```
convex/                     # Entire directory (21 files)
```

### Files to Create

```
src/lib/firebase.ts           # Client SDK config
src/lib/firebase-admin.ts     # Admin SDK (server-side)
src/lib/db.ts                 # Typesaurus schema definitions
src/functions/                # Cloud Functions (same project, no subdir)
├── index.ts                  # Entry point, exports all functions
├── profiles.ts
├── incidents.ts
├── chat.ts
├── notifications.ts
├── storage.ts
└── webhooks.ts
firestore.rules
storage.rules
```

### Files to Heavily Modify (45 files)

All files listed in Phase 5.2

---

## Risk Factors

### High Risk

1. **Data Migration** - Need zero-downtime migration strategy
2. **Auth State** - Users will need to re-authenticate
3. **Real-time Perf** - Firestore listeners behave differently than Convex

### Medium Risk

4. **Type Safety** - Mitigated by Typesaurus + Zod
5. **Complex Queries** - Some Convex queries need denormalization
6. **File URLs** - Signed URL expiration handling

### Low Risk

7. **Push Notifications** - FCM is well-documented
8. **UI** - No changes needed to UI components

---

## Dependencies to Change

### Remove

```json
"convex": "^1.28.0",
"@convex-dev/better-auth": "^0.9.7",
"@convex-dev/migrations": "^0.1.8",
"better-auth": "^1.3.0"
```

### Add

```json
"firebase": "^10.x",
"firebase-admin": "^12.x",
"firebase-functions": "^5.x",
"typesaurus": "^10.x",           // Type-safe Firestore ORM
"zod": "^3.x"                    // Already in project, reuse for validation
```

---

## Effort Summary

| Phase                 | Hours            |
| --------------------- | ---------------- |
| 1. Foundation         | 8-12             |
| 2. Auth               | 12-16            |
| 3. Database           | 6-8              |
| 4. Cloud Functions    | 20-25            |
| 5. Client Migration   | 25-35            |
| 6. File Storage       | 4-6              |
| 7. Real-time          | 6-8              |
| 8. Push Notifications | 4-6              |
| 9. Testing            | 8-12             |
| **Total**             | **93-128 hours** |

---

## Recommended Approach

1. **Parallel Development** - Build Firebase backend while Convex runs
2. **Feature Flags** - Toggle between backends during migration
3. **Incremental Migration** - Migrate one module at a time
4. **Data Sync** - Run both backends temporarily, sync data

### Suggested Order

1. Auth (blocking for everything)
2. Profiles (needed for all features)
3. Incidents (core feature)
4. Chat (complex, independent)
5. Notifications (depends on above)
6. Admin features (lower priority)

---

## Questions to Resolve Before Starting

1. **Data Migration Strategy** - Export all Convex data first? Live migration?
2. **Downtime Tolerance** - Can we have maintenance window?
3. **User Re-auth** - Acceptable to require users to sign in again?
4. **Firebase Project** - New or existing Firebase project?
5. **Hosting** - Stay on Vercel or move to Firebase Hosting?
6. **Budget** - Firebase billing plan (Blaze required for Cloud Functions)
