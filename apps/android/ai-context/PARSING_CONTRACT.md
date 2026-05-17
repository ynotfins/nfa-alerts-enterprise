# Android Parsing Contract

Last updated: 2026-05-17

This is local AI context for the native Android app. Android must consume normalized Firebase data only. It must not parse raw emergency alerts or call the ingestion webhook.

## Source Evidence

- Webhook route: `apps/web/src/app/api/webhook/route.ts`
- Parser schema and prompt: `apps/web/src/lib/webhook/parser.ts`
- Geocoder: `apps/web/src/lib/webhook/geocoder.ts`
- Firestore model inventory: `apps/web/src/lib/db.ts`
- Android architecture audit: `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- Firestore rules and indexes: `firebase/firestore.rules`, `firebase/firestore.indexes.json`

## Non-Negotiable Boundaries

Android must NEVER parse raw alerts.

Backend owns:

- Raw alert ingestion.
- AI parsing and structured validation.
- Geocoding.
- CRM/ERP or external operational record creation when that exists.
- Deduplication by `alertId`.
- Incident creation and webhook audit logs.
- Appending update activity entries.

Android owns:

- Listening to normalized Firestore docs.
- Rendering Home, Details, notes, favorites/bookmarks, responder state, and notifications.
- Writing only user/client actions allowed by Firestore rules.

## Raw Alert Handling

Do not put raw webhook examples, parser prompts, bearer tokens, or ingestion endpoints in Android runtime code.

Android must not call:

- `POST /api/webhook`
- `/api/admin/backfill-counts`
- `/api/admin/cleanup-promo-codes`
- `/api/admin/merge-duplicates`

The only backend route that may be used for Home/Details parity is the weather proxy, if native weather cards need the same server behavior:

- `GET /api/weather?lat=<lat>&lng=<lng>`

## Backend Normalization

The backend parser returns a `ParsedNotification` shape with:

- `source`
- `alertId`
- `isUpdate`
- `incidentType`
- `location.address`
- `location.city`
- `location.county`
- `location.state`
- `description`
- `departmentNumber`
- `alarmLevel`
- `activityType`
- `activityDescription`

The backend geocoder turns address/city/state into `location.lat` and `location.lng`, validates coordinate range, and rejects invalid geocoding.

Android consumes the final Firestore incident shape, not the parser shape.

## Incident Aggregation Behavior

When a normalized alert arrives:

- If `alertId` matches an existing incident and `isUpdate == true`, backend writes a new activity under `incidents/{incidentId}/activities`.
- Backend increments `activityCount`.
- Backend may merge new department codes after promo-code filtering.
- Backend may update `alarmLevel`, `location.county`, and `updatedAt`.
- Home still shows one card for the incident.
- Details shows the original alert plus appended activity entries.

When a normalized alert is new:

- Backend creates a new `incidents/{incidentId}` doc.
- Backend assigns `displayId` from `counters/incidents`.
- Backend writes normalized location, type, description, departments, alarm level, status, responders, and timestamps.

## Required Android DTO Fields

Use DTOs that tolerate nullable fields and unknown future strings. Firestore currently stores epoch millis numbers, not Firestore `Timestamp`, for these contracts.

Incident fields:

- `id`: Firestore document ID, Android-local field.
- `alertId`: nullable external alert key.
- `displayId`: human-readable incident ID.
- `location.lat`, `location.lng`, `location.address`, `location.city`, `location.county`, `location.state`.
- `type`: `fire`, `flood`, `storm`, `wind`, `hail`, or `other`.
- `description`.
- `departmentNumber`: list of department codes.
- `alarmLevel`: nullable `all_hands`, `2nd_alarm`, `3rd_alarm`, `4th_alarm`, `5th_alarm`.
- `emergencyServicesStatus`: nullable `dispatched`, `on-scene`, `cleared`.
- `responderIds`: list of profile IDs.
- `respondedAt`: nullable epoch millis.
- `responderCount`: nullable number.
- `securedById`: nullable profile ID.
- `securedAt`: nullable epoch millis.
- `status`: `active` or `closed`, default active if absent.
- `closedAt`: nullable epoch millis.
- `closedById`: nullable profile ID.
- `homeowner`: nullable nested object.
- `activityCount`: nullable number.
- `createdAt`: epoch millis.
- `updatedAt`: epoch millis.

Location fields:

- `lat`
- `lng`
- `address`
- `city`
- `county`
- `state`

User incident flag fields:

- `id`: Firestore document ID, Android-local field.
- `odm_profileId`
- `odm_incidentId`
- `odm_action`: `favorite`, `bookmark`, `hide`, `mute`, or `view`.
- `createdAt`

Activity fields:

- `id`: Firestore document ID, Android-local field.
- `type`
- `description`
- `profileId`
- `metadata`
- `createdAt`

Note fields:

- `id`: Firestore document ID, Android-local field.
- `text`
- `authorId`
- `createdAt`

Profile summary fields for responder display:

- `id`: Firestore document ID.
- `userId`
- `role`
- `name`, `firstName`, `lastName`
- `email`
- `phone`
- `avatarUrl`
- `pushToken`
- `locationTracking.enabled`
- `locationTracking.lat`
- `locationTracking.lng`
- `locationTracking.accuracy`
- `locationTracking.lastUpdate`
- `online`
- `lastSeen`

Notification fields:

- `id`: Firestore document ID.
- `profileId`
- `type`
- `title`
- `body`
- `read`
- `url`
- `metadata`
- `createdAt`

## Android Write Surface

Allowed client writes must follow Firestore rules:

- Current user's profile fields that are not restricted moderation/role fields.
- Current user's `pushToken`.
- Current user's location fields only when permission and product state allow tracking.
- `userIncidents` docs owned by the current user.
- Notes under `incidents/{incidentId}/notes`.
- Activities under `incidents/{incidentId}/activities`, when tied to a user action.
- Operational incident fields only when the user is allowed by role/rules.

Android must treat Firestore rules as the enforcement boundary and surface permission errors clearly.
