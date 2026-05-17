# Android Home and Alert Details Architecture

Last updated: 2026-05-16

This audit documents what the native Android app needs to implement the Home screen and Alert Details screen from the current Next.js/Firebase codebase. It is intentionally documentation-only: do not create Android Gradle files, Kotlin source files, Firebase deployments, production data mutations, subscription logic, or Android webhook calls from this document.

Current checkout caveat: local branch `chore/enterprise-monorepo-migration` was dirty and behind remote when this audit started. The analysis below is based on local repository artifacts after a read-only fetch, primarily `apps/web/src`, `firebase/`, `docs/android-ui-spec`, and existing architecture docs.

## Backend Architecture

The app is a pnpm workspace monorepo with the Next.js PWA in `apps/web`, Firebase config/rules under `firebase`, and Android Studio-owned native Android work under `apps/android`. Android package name must remain `com.emergency.alerts`; Firebase project is `nfa-alerts-v2`.

Core runtime services:

- Firebase Auth: client auth state and profile bootstrap in `apps/web/src/contexts/auth-context.tsx`.
- Firestore client SDK: initialized with persistent local cache in `apps/web/src/lib/firebase.ts`.
- Firebase Admin SDK: server-side Firestore, Auth, Storage, and Messaging in `apps/web/src/lib/firebase-admin.ts`.
- Cloud Storage: profile photos, signatures, incident documents, chat attachments, and voice uploads in `apps/web/src/services/storage.ts` plus `firebase/storage.rules`.
- FCM: web push token registration in `apps/web/src/hooks/use-push-notifications.ts` and `apps/web/src/hooks/use-permissions.ts`; server sends through `apps/web/src/lib/firebase-admin.ts`.
- Webhook ingestion: `POST /api/webhook` in `apps/web/src/app/api/webhook/route.ts` parses external alert text, geocodes, creates or updates incidents, and writes audit logs.
- Maps/geocoding: webhook geocoding uses Google Maps Geocoding API in `apps/web/src/lib/webhook/geocoder.ts`; UI maps use Google Maps components, documented in `docs/android-ui-spec/screens/08-incident-detail.md`.
- Weather: Alert Details calls `GET /api/weather?lat=<lat>&lng=<lng>` in `apps/web/src/app/api/weather/route.ts` for weather.gov forecast data.

Android boundary:

- Android Home and Alert Details should read/write app state directly through Firebase Android SDK and Firestore security rules.
- Android must not call `POST /api/webhook`; webhook ingestion remains a backend/server integration.
- Android should call backend routes only for server-owned work that cannot safely run on the client, such as the weather proxy if native parity needs the same weather card.

## Firestore Schema Map

Primary rules source: `firebase/firestore.rules`. TypeScript model source: `apps/web/src/lib/db.ts`. Query/index source: `firebase/firestore.indexes.json`.

### `profiles/{uid}`

Purpose: authenticated user identity, role, onboarding status, moderation state, push token, and live location.

Important fields:

- `userId: string`, `email?: string`, `role: "chaser" | "supe" | "admin"`, `completedSteps: number`.
- `name?`, `firstName?`, `lastName?`, `phone?`, `address?`, `avatarUrl?`, `dob?`.
- `locationTracking?: { enabled: boolean; lastUpdate?: number; accuracy?: number; lat?: number; lng?: number }`.
- `geofencingEnabled?: boolean`, `geofenceRadius?: number`, `online?: boolean`, `lastSeen?: number`.
- `pushToken?: string`, `signatureUrl?: string`, `signedAt?: number`.
- `stats?`, `suspension?`, `ban?`, `warnings?`, `deviceFingerprint?`, `hasCompletedWalkthrough?`.
- `createdAt: number`, `updatedAt: number`.

Rules: authenticated users can read profiles; users can create their own profile; owners can update their own profile except role/moderation fields; admins can update/delete any profile.

Android use: listen to `profiles/{uid}` after Firebase Auth, read responder profiles by document id, write `pushToken` after Firebase Messaging registration, and write location fields only when location tracking is intentionally enabled.

### `profiles/{uid}/activities` and `profiles/{uid}/locations`

`activities` stores `{ type, description, incidentId?, createdAt }`. `locations` stores `{ lat, lng, accuracy, heading?, speed?, createdAt }`.

Rules allow owner or supe/admin reads and owner writes. Web location writes happen every 5 seconds in `apps/web/src/components/presence.tsx`; Android should use lifecycle-aware foreground location updates and should not add background location until explicitly designed.

### `incidents/{incidentId}`

Purpose: primary alert/incident record for Home and Alert Details.

Important fields from `Incident`:

- `alertId?: string | null`, `displayId: string`.
- `location: { lat: number; lng: number; address: string; city: string; county?: string | null; state: string }`.
- `type: "fire" | "flood" | "storm" | "wind" | "hail" | "other"`.
- `description: string`, `departmentNumber?: string[]`.
- `alarmLevel?: "all_hands" | "2nd_alarm" | "3rd_alarm" | "4th_alarm" | "5th_alarm" | null`.
- `emergencyServicesStatus?: "dispatched" | "on-scene" | "cleared"`.
- `responderIds?: string[]`, `respondedAt?: number`, `responderCount?: number`.
- `securedById?: string`, `securedAt?: number`.
- `status?: "active" | "closed"`, `closedAt?: number`, `closedById?: string`.
- `homeowner?: { name?; contact?; phone?; email?; address?; insurance?; description?; adjuster?; notes? }`.
- `activityCount?: number`, `createdAt: number`, `updatedAt: number`.

Rules: authenticated users can read; supe/admin can create and update any incident field; responders can update operational fields only; admins can delete.

Android use: Home listens to the incident feed, Alert Details listens to one incident doc, responders update responder fields, and supe/admin actions update `status`, `securedById`, or `closedById` fields.

### `incidents/{incidentId}/notes/{noteId}`

Purpose: incident notes/comments.

Fields: `text: string`, `authorId: string`, `createdAt: number`.

Rules: authenticated users can read/create; only the author can update/delete. Web fetches notes once and refreshes after add; Android should use a real-time listener for better native behavior.

### `incidents/{incidentId}/activities/{activityId}`

Purpose: timeline entries from webhook updates and user actions.

Fields: `type: string`, `description: string`, `profileId?: string`, `metadata?: map`, `createdAt: number`.

Rules: authenticated users can read/create. Android should listen or query ordered by `createdAt desc` for Alert Details timeline.

### `incidents/{incidentId}/chaserSubmissions/{chaserId}`

Purpose: per-chaser submission parent with two subcollections:

- `documents/{docId}`: `name`, `storagePath`, `type`, `size`, `uploaderId`, `createdAt`.
- `signedDocuments/{docId}`: `documentId`, `documentTitle`, `homeownerSignature`, `chaserSignature`, `signedAt`, `signerId`.

Rules scope reads/writes to the chaser owner or supe/admin. Storage paths are written by `apps/web/src/services/storage.ts` under `incidents/{incidentId}/{uid}/documents/{file}` and `incidents/{incidentId}/signatures/{file}`.

### `userIncidents/{docId}`

Purpose: user-specific incident flags.

Fields: `odm_profileId: string`, `odm_incidentId: string`, `odm_action: "favorite" | "bookmark" | "hide" | "mute" | "view"`, `createdAt: number`.

Rules allow users to read/write only their own flag docs. Android Home should keep this as a separate current-user listener or cache, then join flags into incident cards locally.

### `appNotifications/{notifId}`

Purpose: in-app notifications and companion records for push notifications.

Fields: `profileId`, `type`, `title`, `body`, `read`, `url?`, `metadata?`, `createdAt`.

Rules allow owners to read/update/delete their notifications and authenticated users to create. Server route `/api/notifications/send` also creates these docs and sends FCM if `profiles/{profileId}.pushToken` exists.

### Other Collections

- `threads/{threadId}` and `threads/{threadId}/messages/{messageId}`: chat, not required for Home/Details v1 except notification/nav badge context. Source: `apps/web/src/services/chat.ts`.
- `changeRequests/{requestId}`: homeowner info approval workflow. Source: `apps/web/src/services/change-requests.ts` and `apps/web/src/actions/change-requests.ts`.
- `webhookLogs/{logId}`: server-only webhook audit logs; admin read only; client writes denied.
- `counters/{counterId}`: server-owned display ID counter, especially `counters/incidents`; client writes denied.
- `presence/{presenceId}`: rules support online presence owner writes, but current location implementation writes to `profiles/{uid}` instead.
- `bannedDevices/{deviceId}`: moderation device ban list. Source: `apps/web/src/services/moderation.ts`.
- `signedDocuments/{docId}`: top-level signed docs are allowed by rules, but Home/Details flows primarily use incident-scoped signed docs.

## TypeScript Models Inventory

Canonical model references live in `apps/web/src/lib/db.ts`:

- `Profile`: auth profile, role, moderation, push token, and location fields.
- `Incident`: main alert data contract.
- `Note`: incident note contract.
- `IncidentActivity`: timeline contract.
- `UserIncident`: favorite/bookmark/hide/mute/view relationship contract.
- `Document`, `Signature`, `ChaserSubmission`: media/document/signature contracts.
- `AppNotification`: in-app notification contract.
- `Thread`, `Message`: chat contracts.
- `ChangeRequest`: homeowner change approval contract.

Webhook parse contract lives in `apps/web/src/lib/webhook/parser.ts` as `notificationSchema` and `ParsedNotification`.

## API Endpoint Inventory

| Endpoint | Methods | Auth | Purpose | Android use |
| --- | --- | --- | --- | --- |
| `/api/webhook` | `POST` | `Authorization: Bearer <WEBHOOK_AUTH_TOKEN>` | External alert ingestion, parsing, geocoding, incident create/update, `webhookLogs`. | Do not call from Android. |
| `/api/notifications/send` | `POST` | No explicit user auth in route; rate-limited by proxy | Creates `appNotifications`, looks up `profiles/{profileId}.pushToken`, sends FCM. | Do not call directly for normal Home/Details v1. |
| `/api/weather` | `GET` | None | Proxies weather.gov forecast by `lat,lng` with 15 minute in-memory cache. | Use for Alert Details weather parity if needed. |
| `/api/admin/backfill-counts` | `POST` | Bearer token | Recalculates `activityCount` and `responderCount`. | Do not call from Android. |
| `/api/admin/cleanup-promo-codes` | `POST` | Bearer token | Strips promo department codes. | Do not call from Android. |
| `/api/admin/merge-duplicates` | `GET`, `POST` | Bearer token | Detects/deletes duplicate incidents by `alertId`. | Do not call from Android. |

Rate limiting in `apps/web/src/proxy.ts`: `/api/webhook` is 10/min/IP and `/api/notifications/send` is 20/min/IP. The limiter is in-memory per Next.js replica.

## Webhook Payload Examples

The webhook accepts JSON with a `message` field and returns JSON. Use a redacted bearer token; do not put real tokens in docs or Android code.

New incident example:

```json
{
  "message": "FL| Miami-Dade| Miami| Structure Fire| 123 Main Street | <C> BNN | fl001/fl002 | #1839267"
}
```

Expected parsed shape:

```json
{
  "source": "BNN",
  "alertId": "1839267",
  "isUpdate": false,
  "incidentType": "fire",
  "location": {
    "address": "123 Main Street",
    "city": "Miami",
    "county": "Miami-Dade",
    "state": "FL"
  },
  "description": "Structure Fire",
  "departmentNumber": ["fl001", "fl002"],
  "alarmLevel": null
}
```

Update example:

```json
{
  "message": "U/D NJ| Union| Elizabeth| 4th Alarm| 323 Stiles St| fire placed u/c | <C> BNN | njk1r/nj159 | #1839267"
}
```

Expected behavior when `alertId` already exists and `isUpdate` is true:

- Add `incidents/{incidentId}/activities/{activityId}`.
- Increment `activityCount`.
- Merge new department codes after promo-code filtering.
- Update `alarmLevel` and optional `location.county` when present.
- Add `webhookLogs/{logId}` with `action: "activity_added"`.

## Flow Traces

### Webhook Ingestion and Incident Creation

Source references: `apps/web/src/app/api/webhook/route.ts`, `apps/web/src/lib/webhook/parser.ts`, `apps/web/src/lib/webhook/geocoder.ts`, `firebase/firestore.indexes.json`.

1. External system sends `POST /api/webhook` with bearer auth.
2. Route validates `WEBHOOK_AUTH_TOKEN`, Firebase Admin availability, and `message` length.
3. Route sanitizes JSON body text by stripping control characters and limiting to 10,000 chars.
4. `parseNotification` uses OpenAI structured output with Zod schema.
5. `geocodeAddress` calls Google Maps Geocoding API and validates coordinate range.
6. If `alertId` exists, query `incidents where alertId == parsed.alertId limit 1`.
7. If existing update, write activity and update incident metadata.
8. If new, transact `counters/incidents`, create incident with `displayId`, location, type, description, status, empty `responderIds`, and timestamps.
9. Write `webhookLogs` and return status JSON.

### Realtime Listener Flow

Source references: `apps/web/src/hooks/use-incidents.ts`, `apps/web/src/services/incidents.ts`, `apps/web/src/contexts/auth-context.tsx`, `apps/web/src/services/notifications.ts`.

- Auth: `onAuthStateChanged` then `onSnapshot(profiles/{uid})`.
- Home: `onSnapshot(query(incidents orderBy createdAt desc limit 50))`.
- Detail: `onSnapshot(incidents/{incidentId})`.
- Flags: web currently fetches `userIncidents` once; Android should listen to current-user flags for Home.
- Notes/activities: web currently fetches once; Android should listen for native freshness.
- Notifications: `appNotifications where profileId == uid orderBy createdAt desc` and unread count where `read == false`.

### Notification Flow

Source references: `apps/web/src/services/chat.ts`, `apps/web/src/app/api/notifications/send/route.ts`, `apps/web/src/lib/firebase-admin.ts`, `apps/web/src/hooks/use-push-notifications.ts`.

1. Client action or server action decides a user should be notified.
2. `/api/notifications/send` creates `appNotifications/{new}`.
3. Route reads `profiles/{profileId}.pushToken`.
4. `sendNotification` sends FCM via Firebase Admin Messaging.
5. Web clients register FCM tokens through service worker + VAPID and store token at `profiles/{uid}.pushToken`.
6. Android should use Firebase Messaging Android SDK and update the same `pushToken` field, but Android notification triggers should be server-owned where possible.

### Auth Flow

Source references: `apps/web/src/contexts/auth-context.tsx`, `apps/web/src/services/profiles.ts`, `firebase/firestore.rules`.

1. Firebase Auth reports user/null.
2. If null, app enters unauthenticated state.
3. If user exists, listen to `profiles/{uid}`.
4. Missing or incomplete profile enters onboarding state until `completedSteps >= 4`.
5. Active `suspension` or `ban` routes user away.
6. Authenticated users can enter protected routes and read incidents.

## Android Data Contracts

Use Firestore epoch millis as `Long` to match the web. Do not convert to Firestore `Timestamp` unless the backend contract changes. Keep nullable fields nullable because webhook-created docs can contain explicit `null` for `alertId`, `alarmLevel`, and `location.county`.

Required Home models:

- `Incident`: core incident card data, location, response counts, flags joined locally.
- `IncidentFlags`: current user's favorite/bookmark/hide/mute/view booleans.
- `Profile`: current role and optional responder display data.

Required Alert Details models:

- `Incident`.
- `Note`.
- `IncidentActivity`.
- `ProfileSummary` for responders.
- `WeatherSummary` if using `/api/weather`.
- `DocumentMetadata` and `SignedDocument` for Details tab extensions.

## Kotlin Data Class Recommendations

Documentation snippets only; do not create Kotlin files from this audit.

```kotlin
data class IncidentDto(
    val id: String = "",
    val alertId: String? = null,
    val displayId: String = "",
    val location: IncidentLocationDto = IncidentLocationDto(),
    val type: String = "other",
    val description: String = "",
    val departmentNumber: List<String> = emptyList(),
    val alarmLevel: String? = null,
    val emergencyServicesStatus: String? = null,
    val responderIds: List<String> = emptyList(),
    val respondedAt: Long? = null,
    val responderCount: Long? = null,
    val securedById: String? = null,
    val securedAt: Long? = null,
    val status: String = "active",
    val closedAt: Long? = null,
    val closedById: String? = null,
    val homeowner: HomeownerDto? = null,
    val activityCount: Long? = null,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L,
)

data class IncidentLocationDto(
    val lat: Double = 0.0,
    val lng: Double = 0.0,
    val address: String = "",
    val city: String = "",
    val county: String? = null,
    val state: String = "",
)
```

```kotlin
data class UserIncidentFlagDto(
    val id: String = "",
    val odm_profileId: String = "",
    val odm_incidentId: String = "",
    val odm_action: String = "",
    val createdAt: Long = 0L,
)

data class NoteDto(
    val id: String = "",
    val text: String = "",
    val authorId: String = "",
    val createdAt: Long = 0L,
)

data class IncidentActivityDto(
    val id: String = "",
    val type: String = "custom",
    val description: String = "",
    val profileId: String? = null,
    val createdAt: Long = 0L,
)
```

```kotlin
data class ProfileDto(
    val id: String = "",
    val userId: String = "",
    val email: String? = null,
    val role: String = "chaser",
    val completedSteps: Long = 0L,
    val firstName: String? = null,
    val lastName: String? = null,
    val name: String? = null,
    val phone: String? = null,
    val avatarUrl: String? = null,
    val pushToken: String? = null,
    val locationTracking: LocationTrackingDto? = null,
    val online: Boolean? = null,
    val lastSeen: Long? = null,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L,
)

data class LocationTrackingDto(
    val enabled: Boolean = false,
    val lastUpdate: Long? = null,
    val accuracy: Double? = null,
    val lat: Double? = null,
    val lng: Double? = null,
)
```

Prefer domain enums in the Kotlin domain layer, but keep Firestore DTOs string-compatible to avoid crashing on new backend values.

## Firebase Listeners/Queries

### Home Screen

Home source references: `docs/android-ui-spec/screens/06-live-alerts-home.md`, `apps/web/src/app/(dashboard)/incidents/incidents-client.tsx`, `apps/web/src/hooks/use-incidents.ts`, `apps/web/src/services/incidents.ts`.

Required listeners/queries:

1. Current profile:
   - Path: `profiles/{uid}`.
   - Type: document listener.
   - Purpose: role, moderation, permissions, location settings.

2. Incident feed:
   - Collection: `incidents`.
   - Query: `orderBy("createdAt", DESCENDING).limit(50)`.
   - Existing index: single-field order likely enough; composite `status + createdAt` exists for status-filtered variants.
   - Purpose: Home alert list.

3. Optional active-only feed:
   - Query: `whereEqualTo("status", "active").orderBy("createdAt", DESCENDING).limit(50)`.
   - Existing composite index: `incidents(status ASC, createdAt DESC)`.
   - Recommendation: use this if Android Home should exclude closed incidents by default.

4. Current-user flags:
   - Collection: `userIncidents`.
   - Query: `whereEqualTo("odm_profileId", uid)`.
   - Purpose: join favorite/bookmark/hide/mute/view flags into Home cards.
   - Existing composite indexes support `odm_profileId + odm_action` and `odm_profileId + odm_incidentId + odm_action`.

5. Responded active incidents:
   - Collection: `incidents`.
   - Query: `whereArrayContains("responderIds", uid).whereEqualTo("status", "active").orderBy("createdAt", DESCENDING)`.
   - Existing composite index: `responderIds array-contains + status ASC + createdAt DESC`.

Client-side Home behavior to preserve:

- Search locally across address, city, state, county, type, description, and displayId.
- Sort locally by time, distance, or alarm level.
- Filter locally by type, alarm level, emergency services status, responder presence, state, city, department, distance, and minimum updates.
- Distance uses the user's current device location and incident `location.lat/lng`.

### Alert Details Screen

Detail source references: `docs/android-ui-spec/screens/08-incident-detail.md`, `apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx`, `apps/web/src/hooks/use-incidents.ts`, `apps/web/src/services/incidents.ts`.

Required listeners/queries:

1. Incident detail:
   - Path: `incidents/{incidentId}`.
   - Type: document listener.

2. Current-user flags for this incident:
   - Collection: `userIncidents`.
   - Query: `whereEqualTo("odm_profileId", uid).whereEqualTo("odm_incidentId", incidentId)`.

3. Notes:
   - Path: `incidents/{incidentId}/notes`.
   - Query: `orderBy("createdAt", DESCENDING)`.
   - Web fetches once; Android should listen.

4. Activities:
   - Path: `incidents/{incidentId}/activities`.
   - Query: `orderBy("createdAt", DESCENDING)`.
   - Web fetches once; Android should listen or refresh on demand.

5. Responder profiles:
   - Collection: `profiles`.
   - Query: document gets by `responderIds`, or `whereIn(FieldPath.documentId(), chunkOfIds)` with chunks of at most 30.
   - Source web chunks IDs in `getResponderProfiles`.

6. Documents:
   - Current chaser: `incidents/{incidentId}/chaserSubmissions/{uid}/documents orderBy createdAt desc`.
   - Supe/admin all responders: repeat per `responderIds` or redesign with collection group/index later.

7. Signed documents:
   - Current chaser: `incidents/{incidentId}/chaserSubmissions/{uid}/signedDocuments`.
   - Specific doc: same path with `whereEqualTo("documentId", documentId)`.

8. Weather:
   - HTTP: `GET /api/weather?lat=<incident.location.lat>&lng=<incident.location.lng>`.
   - Cache in repository for at least the server's 15 minute cache window.

### Favorites, Notes, and Responder Tracking

Favorites:

- Query `userIncidents where odm_profileId == uid and odm_action == "favorite"`.
- Resolve each `odm_incidentId` with document gets from `incidents`.
- For Home, prefer a single `userIncidents where odm_profileId == uid` listener and derive favorite/bookmark/hide/mute/view maps locally.

Notes:

- Detail notes: `incidents/{incidentId}/notes orderBy createdAt desc`.
- User's notes across incidents: collection group `notes where authorId == uid`, then derive incident ID from parent path and fetch incidents.
- `firebase/firestore.indexes.json` includes a collection group override for `notes.authorId`.

Responder tracking:

- Incident membership: `incidents/{incidentId}.responderIds` and `responderCount`.
- Responded list: `incidents where responderIds array-contains uid and status == active orderBy createdAt desc`.
- Live chaser location: `profiles/{responderId}.locationTracking` and optional history under `profiles/{uid}/locations`.
- Secured assignment: `incidents/{incidentId}.securedById` and `securedAt`.

## Android Repository/ViewModel Architecture

Recommended package structure, documentation-only:

```text
com.emergency.alerts
  core/firebase
  core/model
  core/result
  feature/auth
  feature/home
  feature/incidentdetail
  feature/favorites
  feature/notifications
  feature/profile
  data/firestore
  data/weather
  data/location
  data/messaging
```

Repository interfaces, documentation-only:

```kotlin
interface IncidentRepository {
    fun observeHomeIncidents(activeOnly: Boolean = true): Flow<List<Incident>>
    fun observeIncident(incidentId: String): Flow<Incident?>
    fun observeIncidentFlags(userId: String): Flow<Map<String, IncidentFlags>>
    fun observeIncidentFlags(userId: String, incidentId: String): Flow<IncidentFlags>
    fun observeNotes(incidentId: String): Flow<List<IncidentNote>>
    fun observeActivities(incidentId: String): Flow<List<IncidentActivity>>
    suspend fun respondToIncident(incidentId: String, note: String? = null)
    suspend fun addNote(incidentId: String, text: String)
    suspend fun toggleUserIncidentAction(incidentId: String, action: UserIncidentAction)
}
```

```kotlin
interface ProfileRepository {
    fun observeCurrentProfile(): Flow<Profile?>
    suspend fun getProfiles(ids: List<String>): List<ProfileSummary>
    suspend fun updatePushToken(token: String)
    suspend fun updateLocation(location: DeviceLocation)
}

interface WeatherRepository {
    suspend fun getWeather(lat: Double, lng: Double): WeatherSummary
}
```

ViewModel structure:

- `HomeViewModel`: combines auth profile, incident feed, user flags, device location, search/filter/sort state, and exposes `HomeUiState`.
- `IncidentDetailViewModel`: combines incident doc, flags, notes, activities, responder profiles, weather, and action state.
- `FavoritesViewModel`: listens to current user's `userIncidents` favorite/bookmark actions and resolves incidents.
- `LocationViewModel` or service-level use case: updates profile location only while allowed by role/settings and Android permissions.
- `MessagingViewModel` or app startup use case: registers FCM token and writes `profiles/{uid}.pushToken`.

Use one-shot writes for toggles and notes, but use listeners for screen state. Wrap all listeners with explicit error propagation; web has several `onSnapshot` calls without error callbacks.

## Migration Roadmap

1. Android Studio creates/validates native project in `apps/android` with package `com.emergency.alerts`; Cursor should not create Gradle/Kotlin files in this task.
2. Add Firebase Android app config through Android Studio/Firebase Console, then place `google-services.json` at `apps/android/app/google-services.json` when authorized.
3. Implement auth/profile bootstrap first: Firebase Auth, `profiles/{uid}` listener, role/onboarding/moderation state.
4. Implement Home read path: incident feed listener, current-user flags listener, local filtering/sorting/search, geolocation distance.
5. Implement Alert Details read path: incident doc listener, notes and activity listeners, responder profiles, weather proxy call.
6. Implement safe write actions: favorite/bookmark/hide/mute/view, respond, add note. Gate supe/admin actions by profile role and let rules enforce server truth.
7. Add FCM token registration to `profiles/{uid}.pushToken`; do not add Android notification webhooks.
8. Add documents/signatures after Home/Details are stable, using existing Storage paths and incident-scoped metadata.
9. Add offline/cache policy and explicit listener error states before production testing.
10. Revisit Firestore rules with strict schema validation before broad rollout; current rules are permissive in several authenticated paths.

## Shared Naming Conventions

- Keep Firestore collection names identical to web: `profiles`, `incidents`, `userIncidents`, `appNotifications`, `changeRequests`, `webhookLogs`, `counters`.
- Preserve legacy `odm_*` field names in `userIncidents`; do not rename in Android DTOs.
- Keep incident actions as backend strings and map to Kotlin enums in the domain layer only.
- Use `id` in Android domain models for Firestore document IDs; use `_id` only when mirroring web DTOs in docs/tests.
- Use epoch millis `Long` for current contracts because web writes `Date.now()` numbers.

## Technical Debt/Risks

- Current branch state is dirty and behind remote; audit may miss remote-only changes not present in the checkout.
- Firestore rules permit broad authenticated reads for `profiles`, `incidents`, notes, activities, and some storage paths. This may expose PII such as email/phone/homeowner data to all authenticated users.
- Rules do not perform strict schema/type validation; Android must not rely on local DTOs as a security boundary.
- Client-side notification route `/api/notifications/send` has no explicit Firebase Auth or membership check in the route itself; it relies on callers/rate limiting and should be hardened before mobile reuse.
- `respondToIncident` increments `responderCount` every call while `arrayUnion` deduplicates `responderIds`, so duplicate taps can drift counts.
- Home feed is capped at 50 and filters/search are client-side; this will not scale to large incident histories or multi-tenant deployments.
- Several listeners lack error callbacks in web; Android should expose listener errors and retry states.
- Notes/activities/documents are one-shot fetched in web detail hooks; Android should improve this with real-time listeners where screen state needs freshness.
- `profiles/{uid}/locations` can grow quickly with 5-second writes; Android needs retention, batching, and battery policy before background tracking.
- Webhook and admin maintenance routes use the same bearer-token style; production ops need tighter separation, audit, and replay protection.
- Subscription/payment infrastructure is intentionally not implemented. `docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md` says billing must stay backend-only and must not couple Android/iOS directly to billing webhooks.
- Android portability concern: web uses browser APIs for service workers, web push, geolocation, camera, and app badges. Native replacements are Firebase Messaging, Android location APIs, CameraX/photo picker, notification badges, and lifecycle-aware permissions.
- Weather uses a Next.js proxy with in-memory cache. Native Android direct weather.gov calls would need its own cache, user-agent, and error handling; using the existing proxy preserves parity.

## Source Reference Index

- Firebase rules: `firebase/firestore.rules`, `firebase/firestore.indexes.json`, `firebase/storage.rules`.
- Models: `apps/web/src/lib/db.ts`.
- Firebase client/admin: `apps/web/src/lib/firebase.ts`, `apps/web/src/lib/firebase-admin.ts`.
- Incidents and listeners: `apps/web/src/services/incidents.ts`, `apps/web/src/hooks/use-incidents.ts`.
- Home UI: `apps/web/src/app/(dashboard)/incidents/incidents-client.tsx`, `docs/android-ui-spec/screens/06-live-alerts-home.md`.
- Alert Details UI: `apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx`, `docs/android-ui-spec/screens/08-incident-detail.md`.
- Auth/profile flow: `apps/web/src/contexts/auth-context.tsx`, `apps/web/src/services/profiles.ts`.
- Notifications: `apps/web/src/services/notifications.ts`, `apps/web/src/app/api/notifications/send/route.ts`, `apps/web/src/hooks/use-push-notifications.ts`, `apps/web/src/hooks/use-permissions.ts`.
- Webhook parsing/geocoding: `apps/web/src/app/api/webhook/route.ts`, `apps/web/src/lib/webhook/parser.ts`, `apps/web/src/lib/webhook/geocoder.ts`.
- Storage/media: `apps/web/src/services/storage.ts`, `firebase/storage.rules`.
- Change requests: `apps/web/src/services/change-requests.ts`, `apps/web/src/actions/change-requests.ts`.
- Moderation/roles: `apps/web/src/services/moderation.ts`, `firebase/firestore.rules`.
- Existing Android guidance: `docs/android/ANDROID_STUDIO_BOOTSTRAP.md`, `docs/android-ui-spec/realtime-and-firebase.md`, `docs/android-ui-spec/screens/06-live-alerts-home.md`, `docs/android-ui-spec/screens/08-incident-detail.md`.
