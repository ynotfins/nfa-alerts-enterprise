# 17 - Notes

## Screen purpose
Show incidents where the user has added notes.

## Role visibility
Both. Screenshot is Supe app.

## Screenshot references
`Notes.jpg`.

## Route/path
`/favorites`, Notes tab.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/favorites/favorites-client.tsx`
- `apps/web/src/services/incidents.ts#getIncidentsWithNotes`
- Firestore collection group `notes` index in `firestore.indexes.json`

## Data dependencies
Collection group query on `notes` where `authorId == current uid`; then parent incident ids are loaded.

## Realtime listeners
Fetch-on-load.

## Layout description from top to bottom
Blue app bar `My Incidents`. Empty state with gray note/document icon, title `No Incidents with Notes`, subtitle `Incidents you've added notes to will appear here`. Notes tab active.

## Component hierarchy
Favorites client -> notes empty/list branch -> PageTabs.

## Interaction inventory
Switch tabs; open incident if populated.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Tab selection only.

## Navigation targets
Incident detail when populated.

## Loading states
Parent skeleton.

## Empty states
Screenshot-backed empty notes state.

## Error states
Source catches collection group failures and returns empty.

## Permission/role restrictions
Protected route; query is current-user scoped.

## Android UI reconstruction notes
Use Firestore collection group query with index; show same empty-state component.

## Open questions / verification gaps
Need populated notes screenshot and Supe all-users notes behavior decision if any.
