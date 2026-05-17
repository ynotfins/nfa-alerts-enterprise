# Android Firestore Model

Last updated: 2026-05-17

This is local AI context for native Android Firestore integration. It is documentation only and must not be treated as permission to modify Gradle, Kotlin, Firebase rules, production data, or deployments.

## Source Evidence

- Model definitions: `apps/web/src/lib/db.ts`
- Incident service/listeners: `apps/web/src/services/incidents.ts`, `apps/web/src/hooks/use-incidents.ts`
- Profile service: `apps/web/src/services/profiles.ts`
- Notifications service: `apps/web/src/services/notifications.ts`
- Webhook writes: `apps/web/src/app/api/webhook/route.ts`
- Firestore rules: `firebase/firestore.rules`
- Firestore indexes: `firebase/firestore.indexes.json`
- Architecture audit: `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`

## Collections Required for Home and Details

Android Home and Alert Details primarily use:

- `profiles`
- `profiles/{uid}/locations`
- `incidents`
- `incidents/{incidentId}/activities`
- `incidents/{incidentId}/notes`
- `incidents/{incidentId}/chaserSubmissions/{chaserId}/documents`
- `incidents/{incidentId}/chaserSubmissions/{chaserId}/signedDocuments`
- `userIncidents`
- `appNotifications`

Secondary collections not required for Home/Details v1:

- `threads`
- `changeRequests`
- `webhookLogs`
- `counters`
- `presence`
- `bannedDevices`

## `incidents`

Purpose: primary alert document for Home and Details.

Key fields:

- `alertId`: nullable external alert/update key.
- `displayId`: human-readable ID such as `INC-000001`.
- `location.lat`, `location.lng`, `location.address`, `location.city`, `location.county`, `location.state`.
- `type`: `fire`, `flood`, `storm`, `wind`, `hail`, `other`.
- `description`.
- `departmentNumber`: list of department codes.
- `alarmLevel`: nullable alarm value.
- `emergencyServicesStatus`: nullable status.
- `responderIds`: profile IDs.
- `respondedAt`.
- `responderCount`.
- `securedById`, `securedAt`.
- `status`: `active` or `closed`.
- `closedAt`, `closedById`.
- `homeowner`.
- `activityCount`.
- `createdAt`, `updatedAt`.

Rules summary:

- Authenticated users can read incidents.
- Supe/admin can create and update.
- Responders can update allowed operational fields only.
- Admin can delete.

## Activities and Updates

Path: `incidents/{incidentId}/activities/{activityId}`.

Purpose: Details timeline entries from webhook updates and user actions.

Fields:

- `type`
- `description`
- `profileId`
- `metadata`
- `createdAt`

Listener:

- `incidents/{incidentId}/activities orderBy createdAt desc`

Android contract:

- Listen in real time on Details.
- Use as the appended update timeline.
- Do not display each activity as a Home card.
- Include listener error state.

## Notes

Path: `incidents/{incidentId}/notes/{noteId}`.

Fields:

- `text`
- `authorId`
- `createdAt`

Listener:

- `incidents/{incidentId}/notes orderBy createdAt desc`

Rules summary:

- Authenticated users can read/create.
- Only the author can update/delete.

Android contract:

- Use a real-time listener for Detail notes.
- Show empty state when no notes exist.
- Use collection group `notes where authorId == uid` only for "my notes across incidents" features.

## Responder Tracking

Responder membership:

- `incidents/{incidentId}.responderIds`
- `incidents/{incidentId}.responderCount`
- `incidents/{incidentId}.respondedAt`

Responder profile/location:

- `profiles/{responderId}`
- `profiles/{responderId}.locationTracking.lat`
- `profiles/{responderId}.locationTracking.lng`
- `profiles/{responderId}.locationTracking.accuracy`
- `profiles/{responderId}.locationTracking.lastUpdate`
- Optional history: `profiles/{uid}/locations`

Queries:

- Responded active incidents: `incidents where responderIds array-contains uid and status == "active" orderBy createdAt desc`.
- Responder profiles: document gets by ID, or `whereIn(FieldPath.documentId(), chunkOfIds)` in chunks of 30.

Caveat:

- Current web source increments `responderCount` on response even though `arrayUnion` deduplicates `responderIds`. Android should debounce duplicate response taps and reconcile from server state.

## `userIncidents`

Purpose: current-user flags joined into incident cards.

Fields:

- `odm_profileId`
- `odm_incidentId`
- `odm_action`: `favorite`, `bookmark`, `hide`, `mute`, `view`
- `createdAt`

Home listener:

- `userIncidents where odm_profileId == uid`
- Join locally by `odm_incidentId`.

Detail listener:

- `userIncidents where odm_profileId == uid and odm_incidentId == incidentId`

Rules summary:

- Users can read/write only their own flag docs.
- Preserve `odm_*` field names. Do not rename them in Firestore DTOs.

## Listener and Query Expectations

Home:

- Current profile: `profiles/{uid}` document listener.
- Incident feed: `incidents orderBy createdAt desc limit 50`.
- Active-only option: `incidents where status == "active" orderBy createdAt desc limit 50`.
- Current-user flags: `userIncidents where odm_profileId == uid`.

Details:

- Incident doc: `incidents/{incidentId}`.
- Activities: `incidents/{incidentId}/activities orderBy createdAt desc`.
- Notes: `incidents/{incidentId}/notes orderBy createdAt desc`.
- Current-user flags for incident.
- Responder profiles by IDs.
- Documents/signatures when Docs/Sign tabs are implemented.

Notifications:

- `appNotifications where profileId == uid orderBy createdAt desc`.
- Unread count: `appNotifications where profileId == uid and read == false`.

Indexes already present:

- `incidents(status ASC, createdAt DESC)`.
- `incidents(alertId ASC, createdAt DESC)`.
- `incidents(responderIds array-contains, status ASC, createdAt DESC)`.
- `userIncidents(odm_profileId ASC, odm_incidentId ASC, odm_action ASC)`.
- `userIncidents(odm_profileId ASC, odm_action ASC)`.
- `appNotifications(profileId ASC, createdAt DESC)`.
- Collection group override for `notes.authorId`.

## Distance Calculation Strategy

Distance is not stored on incidents.

Android should:

- Request device location permission when the user needs distance sorting/filtering.
- Calculate miles locally from device location to `incident.location.lat/lng`.
- Use the same haversine strategy as web.
- Cache per incident while current location and incident coordinates are unchanged.
- Disable nearest-first sorting until location is available.
- Never geocode incident addresses on the device for alert display.

## FCM Notes

Current web behavior:

- Push tokens are stored at `profiles/{uid}.pushToken`.
- Server sends through Firebase Admin Messaging.
- In-app notifications are stored in `appNotifications`.

Android contract:

- Use Firebase Messaging Android SDK when implementation begins.
- Write the Android FCM token to `profiles/{uid}.pushToken`.
- Subscribe to `appNotifications` for in-app notification lists/badges.
- Do not call `/api/notifications/send` from normal Home/Details UI.
- Treat notification creation as server-owned where possible.

## Offline-First Guidance

The PWA initializes Firestore with persistent local cache. Android should match that product expectation using Firebase Android offline persistence.

Android should:

- Enable offline persistence before production testing.
- Render cached incidents while offline.
- Mark stale/offline state visibly.
- Queue allowed writes through Firestore where safe.
- Surface write failures and permission denials.
- Keep listener errors visible instead of silently failing.
- Avoid long-running background location until an explicit battery/privacy design exists.

## Security and Privacy Caveats

Current rules allow broad authenticated reads for profiles, incidents, notes, and activities. These documents can include personal or homeowner data. Android must not treat local DTO filtering as a security boundary.

Do not store secrets, webhook tokens, service account JSON, or production Firebase credentials in Android docs or runtime code.
