# 18 - Route Planner

## Screen purpose
Sort responded incidents into a route and open Google Maps navigation.

## Role visibility
Both.

## Screenshot references
`Route.jpg`.

## Route/path
`/route`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/route/route-client.tsx`
- `apps/web/src/services/incidents.ts#getRespondedIncidents`

## Data dependencies
Responded incidents; browser geolocation; Google Maps external URLs.

## Realtime listeners
Fetch-on-load only.

## Layout description from top to bottom
Blue app bar `Route Planner`. Summary card with `Total Stops`, `Est. Distance`, and Start button. Text `Optimized Route` with stop count. Long vertical numbered list of stop cards/rows showing incident display id, distance in blue, address, and small action icons. Bottom nav has Route active.

## Component hierarchy
RouteClient -> summary card -> optimized list -> bottom nav.

## Interaction inventory
- Get current location.
- Sort stops by nearest-neighbor distance.
- Mark stops complete.
- Open individual stop in Google Maps.
- Open full route in Google Maps.

## Filters/search/sort controls
Automatic nearest sorting when location exists.

## Buttons/actions and expected results
`Start` opens Google Maps route with origin and waypoint list. Row action opens single destination.

## Navigation targets
External Google Maps app/browser; incident detail if row supports it by source/UI.

## Loading states
Loading while responded incidents fetch.

## Empty states
If no responded incidents, card says `No Responded Incidents` and has button `View Incidents`.

## Error states
Location error banner `Enable location for optimal routing`.

## Permission/role restrictions
Requires location permission for optimized routing; fallback uses unsorted list.

## Android UI reconstruction notes
Use `FusedLocationProviderClient`, Google Maps intent URLs, and Compose numbered route rows. Keep blue numbered circles and compact action icons.

## Open questions / verification gaps
Need screenshot of empty route and completed-stop state.
