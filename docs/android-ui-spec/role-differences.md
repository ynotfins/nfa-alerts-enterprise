# Role Differences

## Evidence policy

Screenshots are Supe app screenshots only. Chaser behavior below is included only when confirmed by source, Firestore rules, or shared routes/components. Anything else is labeled as inference or gap.

## Role values

| Role | Source value | Notes |
| --- | --- | --- |
| Chaser | `chaser` | Default role in signup source. |
| Supe | `supe` | Supervisor role. Many source checks treat `supe` like admin for field features. |
| Admin / Super Admin | `admin` | Admin gets user and live-location admin nav entries. |

## Shared behavior confirmed by source

- Both authenticated roles are routed through `(dashboard)` and `Protected`.
- Both use the same `Shell` component and core nav, with role-specific nav additions.
- Both can read incidents according to Firestore rules (`incidents` read requires authenticated user).
- Both share incident detail, homeowner, docs, sign, favorites, route, notifications, chat, profile, help, and legal route files.
- Both can have profile signature, push token, location tracking/geofencing settings, and activity stats.

## Supe/Admin-only behavior

| Capability | Evidence | Notes |
| --- | --- | --- |
| Chasers nav item | `Shell` adds `/chasers` for `supe` or `admin` | Screenshot-backed in Chasers screens. |
| Chasers list/map | `chasers-client.tsx` checks `isSupe` | Non-supe gets access denied source state. |
| Chaser detail/moderation | `chaser-detail-client.tsx`, chat profile sheet | Screenshot-backed moderation buttons. |
| Incident Supe Actions | `incident-detail-client.tsx` role checks | Screenshot shows `Close Incident`. |
| Review all docs/signatures | `docs-client.tsx`, `sign-client.tsx` | Source-backed and screenshot-backed. |
| Admin Users / Locations | `Shell` adds admin nav for `admin` | Source-backed, no screenshots. |
| Change request review | `homeowner-client.tsx`, `actions/change-requests.ts` | Source-backed. |

## Chaser behavior confirmed by source

| Capability | Evidence | Notes |
| --- | --- | --- |
| Respond to incident | `respondToIncident` in `services/incidents.ts` | Contract mismatch exists with Firestore rules; see verification report. |
| Upload incident docs after responding | `docs-client.tsx` `canAccess = isSupe || hasResponded` | Chaser must be in `responderIds`. |
| Collect signatures after responding | `sign-client.tsx` same access pattern | Requires profile signature. |
| Chaser-to-supes chat | `chat.ts`, `chat-client.tsx` | Product model and source create `chaser_to_supes` threads. |
| Profile preferences | `profile-client.tsx` shared route | Chaser-specific screenshots missing. |

## Responder status flow

Source flow: user taps respond -> `respondToIncident(incidentId, note?)` -> update incident `responderIds`, `responderCount`, `respondedAt`, `updatedAt` -> optional note -> add incident activity. This is source-backed. Firestore rules currently only allow existing responders or supes to update incidents, so first-time Chaser response requires a rules/server fix before Android should depend on it.

## Live location visibility

- Chaser/source location: `Presence` periodically calls `updateLocation` when user is a chaser or location tracking is enabled.
- Supe visibility: Chasers list/detail and admin locations read profile `locationTracking` fields.
- Firestore rules allow profile reads for any authenticated user, but UI gates Chasers map/detail to supe/admin.

## Chat differences

- Supe/Admin: `useThreads` subscribes to current user's threads and also all `chaser_to_supes` threads.
- Chaser: can see direct chaser contacts and a supes group thread. Source can create a supes thread when chaser opens the Supes tab.
- Screenshots only show Supe contacts and thread UI.

## Assignment / response differences

- Supe/Admin source can award/remove secured assignment on incident detail.
- Chaser source can respond and then access docs/signature flows.
- Product model mentions `mark themselves on the way`; this exact UI text/status was not visible in screenshots and should be verified.

## Source-confirmed vs inferred differences

| Difference | Status |
| --- | --- |
| Supe sees Chasers nav and Chaser management screens | Source-confirmed and screenshot-backed |
| Chaser lacks Chasers/Admin nav entries | Source-confirmed by Shell role logic |
| Chaser can respond/upload/sign after responding | Source-confirmed |
| Supe sees all responded incidents in Favorites | Product-doc claim; current source appears current-user scoped. Needs verification. |
| Chaser-specific visual styling | Needs screenshots |
| Admin role visual surface | Source-confirmed, screenshots missing |
