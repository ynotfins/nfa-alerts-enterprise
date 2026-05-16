# 15 - Bookmarks

## Screen purpose
Show incidents the user has bookmarked.

## Role visibility
Both. Screenshot is Supe app.

## Screenshot references
`Bookmarks.jpg`.

## Route/path
`/favorites`, Bookmarks tab.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/favorites/favorites-client.tsx`
- `apps/web/src/services/incidents.ts`

## Data dependencies
`userIncidents` where `odm_action == "bookmark"`; incidents loaded by id.

## Realtime listeners
Fetch-on-load.

## Layout description from top to bottom
Blue app bar `My Incidents`. Empty state with gray bookmark icon, title `No Bookmarks Yet`, subtitle `Incidents you've bookmarked will appear here`. Segmented tab bar with Bookmarks active. Floating bottom nav with Favorites active.

## Component hierarchy
Same as Favorites screen with `activeTab === "bookmarks"`.

## Interaction inventory
Switch tabs; open incidents if populated.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Bookmarks tab updates local state.

## Navigation targets
Incident detail when populated; bottom nav routes.

## Loading states
Skeletons from parent.

## Empty states
Screenshot-backed.

## Error states
Fallback empty on fetch failure.

## Permission/role restrictions
Protected route.

## Android UI reconstruction notes
Reuse shared tabbed incidents component with bookmark icon empty state.

## Open questions / verification gaps
Need populated bookmarks screenshot.
