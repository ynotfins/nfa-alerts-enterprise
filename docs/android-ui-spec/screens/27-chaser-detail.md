# 27 - Chaser Detail

## Screen purpose
Show a chaser profile, response stats, live/location tracking state, map, coordinates, and moderation controls.

## Role visibility
Supe/Admin only.

## Screenshot references
`Chaser-details.jpg`, `Chaser-Details2.jpg`.

## Route/path
`/chasers/[chaserId]`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/chasers/[chaserId]/chaser-detail-client.tsx`
- `apps/web/src/hooks/use-profiles.ts`
- `apps/web/src/services/profiles.ts`
- `apps/web/src/services/moderation.ts`

## Data dependencies
Firestore `profiles/{chaserId}` fields: name, email, avatar, stats, locationTracking, suspension, ban.

## Realtime listeners
Profile subscription/fetch through `useProfile`.

## Layout description from top to bottom
Blue app bar with back arrow and `Chaser Details`. Profile header with large avatar, name, email. Two stat cards: `Alerts Responded`, `Days Active`, both large numeric value and muted progress line. Location Tracking card with pin icon, enabled/disabled state, toggle, embedded Google map. Lower details show Status pill, Coordinates, Accuracy, Last Update, `Open in Google Maps` button. Moderation card with warning icon, `Suspend User`, red `Ban User`.

## Component hierarchy
Chaser detail client -> header -> profile hero -> stats grid -> location card/map -> moderation card.

## Interaction inventory
- Toggle location tracking.
- Open coordinates in Google Maps.
- Suspend user.
- Ban user.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Moderation buttons open flows and update profile moderation fields. Google Maps opens external map.

## Navigation targets
Back to Chasers; external Google Maps.

## Loading states
Route loading skeleton.

## Empty states
Profile not found / no location map fallback.

## Error states
Toasts on moderation/update failures.

## Permission/role restrictions
Supe/Admin only.

## Android UI reconstruction notes
Compose `LazyColumn`: profile hero, two stat cards, map card, detail rows, moderation card. Use Maps Compose and Material switches.

## Open questions / verification gaps
Need screenshots of enabled tracking, online status, suspend/ban drawers.
