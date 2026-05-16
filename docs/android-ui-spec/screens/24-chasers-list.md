# 24 - Chasers List

## Screen purpose
Supervisor list of field users with status and quick access to profiles.

## Role visibility
Supe/Admin only. Source denies non-supe view with access-denied message.

## Screenshot references
`Chasers.jpg`.

## Route/path
`/chasers`, list mode.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/chasers/chasers-client.tsx`
- `apps/web/src/hooks/use-profiles.ts`
- `apps/web/src/services/profiles.ts`

## Data dependencies
Firestore `profiles` where `role == "chaser"`; stats and locationTracking fields.

## Realtime listeners
Fetch-on-load via `listChasers`; no realtime listener in current hook.

## Layout description from top to bottom
Blue app bar `Chasers` with action icons: list/map toggle and filter. Vertical list of rounded white cards. Each card has circular avatar/initial, name, small status dot, and status text `Offline`. Bottom nav shows Chasers active, Chat badge.

## Component hierarchy
Chasers client -> Header -> mode toggle/filter actions -> PageContent -> chaser cards.

## Interaction inventory
- Switch list/map view.
- Open filters.
- Tap chaser card to detail.

## Filters/search/sort controls
Filter sheet documented in `26-chasers-filters.md`.

## Buttons/actions and expected results
Map/list toggle updates local `view` state. Filter opens drawer.

## Navigation targets
`/chasers/[chaserId]`.

## Loading states
Header and card skeletons.

## Empty states
If no chasers, source should show empty list; no screenshot.

## Error states
No explicit error state.

## Permission/role restrictions
Only `supe` or `admin` per `profile.role`.

## Android UI reconstruction notes
Use `LazyColumn` chaser cards, blue top bar with segmented view icon buttons and filter button. Keep large bottom nav.

## Open questions / verification gaps
Need online state screenshot and populated stats display if any.
