# Android Alert Architecture

Last updated: 2026-05-17

This is local AI context for the native Android app. It is documentation only: do not create Kotlin, Gradle, Firebase deploys, production data changes, or Android webhook calls from this file.

## Source Evidence

- Backend audit: `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- Incident models and services: `apps/web/src/lib/db.ts`, `apps/web/src/services/incidents.ts`, `apps/web/src/hooks/use-incidents.ts`
- Webhook normalization: `apps/web/src/app/api/webhook/route.ts`, `apps/web/src/lib/webhook/parser.ts`, `apps/web/src/lib/webhook/geocoder.ts`
- Web Home UI: `apps/web/src/app/(dashboard)/incidents/incidents-client.tsx`, `apps/web/src/components/incidents/incident-card.tsx`
- Web Detail UI: `apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx`
- Firestore rules and indexes: `firebase/firestore.rules`, `firebase/firestore.indexes.json`
- Visual evidence: `screenshots/Home1.jpg`, `screenshots/Home2.jpg`, `screenshots/Details.jpg`, `screenshots/Home-Filters.jpg`

## Core Contract

Android treats Firestore as the source of truth for alert display. The backend creates and updates `incidents` from parsed external alerts; Android only observes normalized incident docs and incident subcollections.

One Home card equals one Firestore `incidents/{incidentId}` document. The stable card identity is the Firestore document ID. `alertId` is an external dedupe/update key, not the Android list key.

## One Card Per `alertId`

- The backend queries `incidents where alertId == parsed.alertId limit 1` before creating a new incident.
- If an existing incident is found and the parsed payload is an update, the backend appends an activity under that incident instead of creating a second Home card.
- Android must not locally collapse rows by raw alert text. It should display one card per incident doc and rely on backend deduplication by `alertId`.
- If a document has `alertId == null`, Android still renders it as one incident card by Firestore document ID.

## Latest Update on Home

Current web Home evidence shows cards ordered by `createdAt desc`, with compact rows showing distance, state/county/city/address/type, description, alarm badge, responder count, activity bars, and user action icons.

Android contract:

- Home shows one compact card per incident.
- Home card text should stay concise and operational. It should not expand into a full timeline.
- The main card line should represent the incident's latest normalized summary fields from the incident doc: `location`, `type`, `description`, `alarmLevel`, `responderCount`, `activityCount`, `createdAt`, and `updatedAt`.
- If Android needs a "latest update" preview, use the latest `activities` item as a short secondary preview only. Do not duplicate the incident as another card.

Roadmap note: current web Home does not listen to each incident's activity subcollection. Android may add a bounded latest-activity listener or denormalized `latestActivity` field later, but that should be designed deliberately for read cost.

## Updates Append to Details Timeline

Webhook updates write `incidents/{incidentId}/activities/{activityId}` with `type`, `description`, optional `metadata.source`, and `createdAt`, then increment `activityCount` on the incident.

Android Detail contract:

- The Details timeline starts with the original incident creation summary.
- Each update is appended from `incidents/{incidentId}/activities`, ordered by `createdAt desc` for newest-first display or reversed in UI for chronological sections if product chooses that layout.
- Updates must never create extra Home cards.
- Timeline copy should use normalized `activity.type` and `activity.description`, not raw webhook payloads.

## Realtime Listener Expectations

Minimum listeners:

- Current profile: `profiles/{uid}` document listener after Firebase Auth.
- Home feed: `incidents orderBy createdAt desc limit 50`.
- Optional active-only Home feed: `incidents where status == "active" orderBy createdAt desc limit 50`.
- Detail incident: `incidents/{incidentId}` document listener.
- Detail activities: `incidents/{incidentId}/activities orderBy createdAt desc` listener.
- Detail notes: `incidents/{incidentId}/notes orderBy createdAt desc` listener.
- Current-user flags: `userIncidents where odm_profileId == uid`, then join locally by `odm_incidentId`.
- Notifications: `appNotifications where profileId == uid orderBy createdAt desc`; unread count where `read == false`.

Android must include listener error callbacks and visible retry/error states. Several current web `onSnapshot` calls omit error callbacks, so Android should improve this.

## Operational Feed Behavior

Home is an operational feed, not a social feed:

- Default sort is newest first, matching current web source.
- Filters/search/sort are local over the currently loaded incident window unless a backend query is explicitly introduced.
- Search fields: address, city, state, county, type, description, and `displayId`.
- Filters: type, alarm level, emergency services status, responder presence, state, city, department, distance, and minimum updates.
- Action icons write `userIncidents` flags: `favorite`, `bookmark`, `hide`, `mute`, `view`.
- Hidden/muted behavior should be a current-user presentation layer unless backend semantics change.

## Card Reorder Behavior

Current source order is `createdAt desc`; webhook updates change `updatedAt` and `activityCount` but do not change `createdAt`.

Android contract:

- New incidents appear at the top when sorting by time.
- Updates to an existing incident should update that card in place.
- Existing cards should not jump to the top solely because a timeline update arrived unless the user selected a future "latest activity" sort.
- Sorting by distance uses current device location and incident coordinates.
- Sorting by alarm level uses severity order: `5th_alarm`, `4th_alarm`, `3rd_alarm`, `2nd_alarm`, `all_hands`, then no alarm.

## Incident Lifecycle

Expected statuses:

- `active`: visible in the active operational feed.
- `closed`: visible only when history or closed filters are enabled.

Lifecycle writes:

- Backend creates incident with `status: "active"`, `responderIds: []`, `createdAt`, and `updatedAt`.
- Chasers respond by adding their UID to `responderIds`, setting `respondedAt`, and incrementing `responderCount`.
- Supe/admin can assign work through `securedById` and `securedAt`.
- Supe/admin can close and reopen incidents through `status`, `closedAt`, and `closedById`.

Caveat from source audit: `respondToIncident` increments `responderCount` every call while `arrayUnion` deduplicates `responderIds`; Android should debounce duplicate taps and treat rules/server state as final.

## Distance Calculation

Distance is client-side and display-only:

- Use device location only after permission is granted.
- Use incident `location.lat` and `location.lng`, which are backend-geocoded.
- Match web distance behavior in miles using the haversine formula.
- Show loading or omit distance when location permission is unavailable.
- Do not geocode addresses on Android for incident cards.
