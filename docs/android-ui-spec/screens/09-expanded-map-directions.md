# 09 - Expanded Map Directions

## Screen purpose
Large map and directions sheet for navigating to the incident and viewing nearby resources.

## Role visibility
Both.

## Screenshot references
`Details-Expand-Map.jpg`.

## Route/path
Bottom sheet/modal state from `/incidents/[id]`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx`
- Google Maps components via app map provider.

## Data dependencies
Incident `location.lat`, `location.lng`, address, browser geolocation for directions.

## Realtime listeners
Parent incident listener.

## Layout description from top to bottom
Dimmed incident detail backdrop. Large rounded top sheet with drag handle. Title `Location & Directions`. Large map fills most of sheet with Map/Satellite toggle, Traffic chip, red incident marker, Google map controls. Below map: `Nearby Resources` list with resource names and distance pills. Bottom full-width blue `Get Directions` button with navigation icon.

## Component hierarchy
Expanded map drawer -> title -> Google map -> resource list -> action button.

## Interaction inventory
- Toggle Map/Satellite.
- Toggle traffic overlay.
- Pan/zoom map.
- Tap Get Directions.

## Filters/search/sort controls
Map layer toggles only.

## Buttons/actions and expected results
`Get Directions` opens external Google Maps directions to incident.

## Navigation targets
External Google Maps app/browser.

## Loading states
Map tile loading from Google Maps.

## Empty states
Nearby resources may be absent; no screenshot of empty resource state.

## Error states
No explicit map error state visible.

## Permission/role restrictions
No role difference confirmed.

## Android UI reconstruction notes
Use Google Maps Compose in a `ModalBottomSheet`. Preserve large map, overlay chips, resource rows, and fixed primary bottom action.

## Open questions / verification gaps
Source of Nearby Resources is not fully traced; verify whether static, Google Places, or placeholder before backend wiring.
