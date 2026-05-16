# Realtime and Firebase

## Firebase Auth flow

Source: `apps/web/src/lib/firebase.ts`, `apps/web/src/lib/auth-client.ts`, `apps/web/src/contexts/auth-context.tsx`.

The client initializes Firebase from `NEXT_PUBLIC_FIREBASE_*` environment variables. `AuthProvider` listens to `onAuthStateChanged(auth, ...)`, then subscribes to `profiles/{uid}`. Auth states are `loading`, `unauthenticated`, `incomplete`, and `authenticated`. Completed profiles are `completedSteps >= 4`. Suspended or banned profiles redirect to suspended/banned screens.

## Firestore initialization

`apps/web/src/lib/firebase.ts` exports `db` from `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`. This gives the PWA persistent local Firestore cache.

## Firebase Admin initialization

`apps/web/src/lib/firebase-admin.ts` reads server credentials from `FIREBASE_SERVICE_ACCOUNT_JSON`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, or split `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. It exports `adminDb`, `adminMessaging`, `adminAuth`, and `adminStorage`, although only Admin Firestore and messaging are heavily used.

## Firestore collections

| Collection/path | Purpose | Key source files |
| --- | --- | --- |
| `profiles` | User identity, role, push token, signature, stats, location, moderation | `auth-context.tsx`, `profiles.ts`, `profiles-context.tsx` |
| `profiles/{uid}/activities` | User activity log | `profiles.ts`, `profile/activity/page.tsx` |
| `profiles/{uid}/locations` | Location history | `profiles.ts#updateLocation` |
| `incidents` | Alert records | `services/incidents.ts`, `api/webhook/route.ts` |
| `incidents/{id}/notes` | Incident notes | `services/incidents.ts` |
| `incidents/{id}/activities` | Incident timeline | `services/incidents.ts`, webhook route |
| `incidents/{id}/chaserSubmissions/{uid}/documents` | Uploaded docs | `services/storage.ts`, `docs-client.tsx` |
| `incidents/{id}/chaserSubmissions/{uid}/signedDocuments` | Signed docs | `services/incidents.ts`, `sign-client.tsx` |
| `threads` | Chat threads | `services/chat.ts` |
| `threads/{id}/messages` | Chat messages | `services/chat.ts` |
| `userIncidents` | favorite/bookmark/hide/mute/view flags | `services/incidents.ts` |
| `appNotifications` | In-app notifications | `services/notifications.ts`, `api/notifications/send` |
| `changeRequests` | Homeowner change workflow | `services/change-requests.ts`, `actions/change-requests.ts` |
| `webhookLogs` | Webhook audit logs | `api/webhook/route.ts` |
| `counters` | Incident display id counter | webhook route; client helper exists but rules deny client writes |
| `bannedDevices` | Device ban list | `services/moderation.ts` |

## onSnapshot subscriptions

| Subscription | Source | Android equivalent |
| --- | --- | --- |
| Auth profile | `auth-context.tsx` `onSnapshot(profiles/{uid})` | `addSnapshotListener` on profile doc |
| Incident list | `services/incidents.ts#subscribeToIncidents` | query listener ordered by `createdAt desc`, limit 50 |
| Incident detail | `subscribeToIncident` | doc listener |
| Threads | `subscribeToUserThreads`, `subscribeToChaserToSupesThreads` | query listeners |
| Thread detail/messages | `subscribeToThread`, `subscribeToMessages` | doc + subcollection listeners |
| Notifications | `subscribeToNotifications`, `subscribeToUnreadCount` | query listeners scoped by `profileId` |
| Change requests | `subscribeToPendingChangeRequests` | query listener by status/incident |

Important: several current `onSnapshot` calls omit error callbacks. Android should include listener error handling.

## appNotifications

Notifications are stored in `appNotifications` with `profileId`, `type`, `title`, `body`, `read`, `url`, metadata, and `createdAt`. The notifications page subscribes by current profile id. Server actions and `/api/notifications/send` can create app notifications and send FCM through Admin Messaging.

## Incidents

Incidents are primarily created by `POST /api/webhook`: webhook auth -> parse with OpenAI structured output -> geocode address -> write incident -> log `webhookLogs`. Client incident creation exists but appears unwired and conflicts with client-denied `counters` writes.

## Profiles and presence/location

`Presence` calls `updateLocation` every 5 seconds if the user is a chaser or location tracking is enabled. It writes location fields to `profiles/{uid}` and also appends to `profiles/{uid}/locations`.

## Threads/messages

Threads are either `direct` or `chaser_to_supes`. Messages are subcollection docs with senderId, text, readBy, reactions, optional voice, optional attachment, and createdAt. Sending a message updates the parent thread last-message fields and unread count map.

## userIncidents

User-specific flags live in `userIncidents` with `odm_profileId`, `odm_incidentId`, and `odm_action` values such as `favorite`, `bookmark`, `hide`, `mute`, `view`.

## Storage paths

| Path | Use |
| --- | --- |
| `profiles/{uid}/avatar.jpg` | Profile photo |
| `profiles/{uid}/signature.png` | Profile signature |
| `incidents/{incidentId}/{uid}/documents/{file}` | Uploaded docs/photos |
| `incidents/{incidentId}/signatures/{file}` | Incident signatures |
| `voice/{threadId}/{timestamp}.webm` | Voice message audio |
| `attachments/{threadId}/{file}` | Chat attachments |

## FCM / push behavior

Foreground token registration is in `use-push-notifications.ts` and `use-permissions.ts`. Background FCM is handled by `apps/web/public/firebase-messaging-sw.js`, which uses Firebase compat scripts and hardcoded public config. `apps/web/public/sw.js` also has a generic `push` event handler and notification click behavior. Native Android should use Firebase Messaging Android SDK and avoid the PWA dual-worker split.

## Google geocoding/map behavior

- Webhook geocoding uses `@googlemaps/google-maps-services-js` in `apps/web/src/lib/webhook/geocoder.ts` with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- UI maps use `@vis.gl/react-google-maps` components and Google Maps provider.
- Route planner opens external Google Maps directions URLs.

## Firebase rules evidence

- `firestore.rules` defines role helpers from `profiles/{uid}` and gates incidents, profiles, threads, notifications, change requests, counters, and webhook logs.
- `storage.rules` requires auth for storage and owner match for `profiles/{userId}/**`.
