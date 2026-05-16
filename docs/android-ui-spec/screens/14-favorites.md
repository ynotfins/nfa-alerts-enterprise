# 14 - Favorites

## Screen purpose
Show incidents the user has favorited.

## Role visibility
Both. Screenshot is Supe app.

## Screenshot references
`Favorites.jpg`.

## Route/path
`/favorites`, Favorite tab.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/favorites/favorites-client.tsx`
- `apps/web/src/services/incidents.ts`
- `apps/web/src/components/incidents/incident-card.tsx`

## Data dependencies
`userIncidents` where `odm_action == "favorite"`; incident documents loaded by id; browser geolocation for distance display.

## Realtime listeners
Fetch-on-load, not realtime in current source.

## Layout description from top to bottom
Blue app bar `My Incidents`. Empty state centered: gray circular heart icon, title `No Favorites Yet`, subtitle `Incidents you've favorited will appear here`. Bottom segmented tabs: Favorite active, Bookmarks, Responded, Notes. Floating bottom nav with Favorites active.

## Component hierarchy
Favorites client -> Header -> PageContent -> EmptyState or IncidentCard list -> PageTabs -> Shell bottom nav.

## Interaction inventory
- Switch tabs.
- If list exists, interact with incident cards.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Tab buttons change local `activeTab`.

## Navigation targets
Incident cards open `/incidents/[id]`; bottom nav routes.

## Loading states
Header/content skeletons.

## Empty states
Screenshot-backed empty favorites state.

## Error states
Data fetch catches failures and falls back to empty arrays.

## Permission/role restrictions
Protected route.

## Android UI reconstruction notes
Use shared `MyIncidentsScreen` composable with tab state and empty-state component.

## Open questions / verification gaps
Need screenshot with populated favorites list.
