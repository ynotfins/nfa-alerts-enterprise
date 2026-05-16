# 06 - Live Alerts Home

## Screen purpose
Primary incident feed showing active fire/emergency alerts and quick actions.

## Role visibility
Both. Screenshots are Supe app; source/Firebase rules allow authenticated users to read incidents.

## Screenshot references
`Home1.jpg`, `Home2.jpg`.

## Route/path
`/incidents`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/incidents/page.tsx`
- `apps/web/src/app/(dashboard)/incidents/incidents-client.tsx`
- `apps/web/src/components/incidents/incident-card.tsx`
- `apps/web/src/hooks/use-incidents.ts`
- `apps/web/src/services/incidents.ts`
- `apps/web/src/components/layout/shell.tsx`

## Data dependencies
Firestore `incidents`; `userIncidents` for favorite/bookmark/hide/mute/view flags; browser geolocation for distance.

## Realtime listeners
`subscribeToIncidents` uses Firestore `onSnapshot` ordered by `createdAt desc`, limit 50.

## Layout description from top to bottom
Blue top app bar with title `Incidents`, filter icon, sort icon, search icon. Body is a dense vertical incident list. Each row shows timestamp, optional responder count icon, distance in blue, state/county/city/address/type, incident description, optional alarm badge, and action icons for favorite/bookmark/mute/hide. Left edge blue tick/stripe indicates activity/count emphasis. Floating rounded bottom nav overlays the lower viewport.

## Component hierarchy
`IncidentsClient` -> `Header` -> optional search/filter controls -> `IncidentCard` list -> `Shell` bottom navigation.

## Interaction inventory
- Tap incident row: opens detail.
- Tap filter: opens filter sheet.
- Tap search: toggles search input.
- Tap sort: time/distance/alarm menu.
- Heart/bookmark/bell-slash/eye-slash actions update `userIncidents` flags.
- Swipe action in card can respond to incident per source.

## Filters/search/sort controls
Search text matches address, city, state, county, type, description, displayId. Sort options: time, distance, alarm. Filter sheet details in `07-home-filters.md`.

## Buttons/actions and expected results
Action icons update local flags and Firestore user incident records. Sort/filter controls update list state only.

## Navigation targets
Incident detail `/incidents/[id]`; bottom nav targets Favorites, Route, Notifications, Chasers, Chat, Profile depending role.

## Loading states
`HeaderSkeleton` and list skeleton from `incidents/loading.tsx` / `ContentSkeleton`.

## Empty states
Source likely shows empty list if no incidents; no screenshot. Needs runtime screenshot.

## Error states
Realtime listener errors are not surfaced in current source; Android should expose an error state.

## Permission/role restrictions
Protected route. Admin/Supe nav includes additional destinations; Chaser nav does not include Chasers/Admin.

## Android UI reconstruction notes
Use `LazyColumn`, sticky blue top app bar, custom incident row composable, and floating bottom nav. State holder subscribes to Firestore query and tracks filter/search/sort/user flags.

## Open questions / verification gaps
Need Chaser screenshot for nav differences and empty/error states.
