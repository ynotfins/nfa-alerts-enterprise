# 35 - Live Locations Admin

## Screen purpose
Admin map of all tracked users with role-colored markers and expandable list.

## Role visibility
Admin only.

## Screenshot references
Needs Screenshot.

## Route/path
`/admin/locations`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/admin/locations/admin-locations-client.tsx`
- `apps/web/src/hooks/use-profiles.ts`
- `@vis.gl/react-google-maps`

## Data dependencies
Firestore `profiles` with `locationTracking.enabled`, `lat`, `lng`, `lastUpdate`, `accuracy`, role/name/avatar.

## Realtime listeners
Fetch-on-load via `useAllProfiles`; not realtime in current source.

## Layout description from top to bottom
Source-backed: header `Live Locations` with badge `{n} tracked`; full-screen Google map; AdvancedMarkers colored by role (`admin` red, `supe` green, `chaser` blue); expandable bottom list of tracked users with avatars, role badges, and last update.

## Component hierarchy
AdminLocationsClient -> Header -> Map -> AdvancedMarkers -> bottom expandable list.

## Interaction inventory
- Tap marker to select/unselect user.
- Expand/collapse list.
- Tap list row to focus map on user.

## Filters/search/sort controls
No filters in source.

## Buttons/actions and expected results
`Hide List` / `Show List` toggles bottom panel height.

## Navigation targets
Potential profile/user detail via list if source includes it; verify before native.

## Loading states
Centered `Loading locations...`.

## Empty states
`No Active Tracking`, helper text `No users have location tracking enabled`.

## Error states
No explicit map/profile error state.

## Permission/role restrictions
Admin only by nav/source intent.

## Android UI reconstruction notes
Use Google Maps Compose, custom marker colors, and bottom sheet list over map.

## Open questions / verification gaps
Need screenshot for exact map/list visual and selection state.
