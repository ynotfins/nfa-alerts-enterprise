# 08 - Incident Detail

## Screen purpose
Show incident location, core fire alert metadata, responder controls, supe actions, alert text, live weather, notes, and tab navigation.

## Role visibility
Both. Screenshot shows Supe app and includes Supe Actions.

## Screenshot references
`Details.jpg`.

## Route/path
`/incidents/[id]`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx`
- `apps/web/src/hooks/use-incidents.ts`
- `apps/web/src/services/incidents.ts`
- `apps/web/src/components/weather/weather-display.tsx`
- `apps/web/src/app/api/weather/route.ts`

## Data dependencies
Firestore `incidents/{id}`, `userIncidents`, `incidents/{id}/notes`, `incidents/{id}/activities`; weather API via `/api/weather?lat&lng`.

## Realtime listeners
`subscribeToIncident(id)` for the incident document. Notes/activities are fetched on load/refresh.

## Layout description from top to bottom
Blue top app bar with back arrow and `Incident Details`. Content cards: Location & Map with embedded map and `Expand Map`; incident summary card with type, favorite/bookmark/mute/hide icons, display id, FD number, type badge, reported timestamp, location, description, and full-width `Respond to Incident`; Supe Actions card with `Close Incident`; Alerts card with raw alert copy; Live Weather card with forecast and weather tips; Notes card with empty message, text input, and `Add Note`. Bottom page tabs: Details, Homeowner, Docs, Sign above bottom nav.

## Component hierarchy
Detail client -> map card -> incident info card -> role action card -> alerts/weather/notes cards -> `PageTabs`.

## Interaction inventory
- Respond to incident.
- Favorite/bookmark/mute/hide.
- Expand map.
- Close/reopen incident for supe/admin.
- Add note.
- Switch detail tabs.

## Filters/search/sort controls
None on this screen.

## Buttons/actions and expected results
- `Respond to Incident`: updates responder fields and activity in Firestore.
- `Close Incident`: sets status closed and adds activity.
- `Add Note`: creates note subdocument.
- `Expand Map`: opens directions sheet.

## Navigation targets
Homeowner `/homeowner`, Docs `/docs`, Sign `/sign`, map directions via Google Maps link, bottom nav routes.

## Loading states
`IncidentDetailSkeleton` / loading screen for route.

## Empty states
Notes card shows `No notes yet. Be the first to add one!`.

## Error states
Toast errors for action failures; weather failures are currently swallowed by source.

## Permission/role restrictions
Supe/Admin see Supe Actions. Chaser actions depend on response state.

## Android UI reconstruction notes
Compose `LazyColumn` with stacked cards, top app bar, nested map composable, segmented page tabs, and sticky floating bottom nav. Use a detail state holder with Firestore document listener and action methods.

## Open questions / verification gaps
Need Chaser screenshot to confirm absence of Supe Actions and exact post-response button text.
