# 25 - Chasers Map

## Screen purpose
Supervisor map view of chaser live locations.

## Role visibility
Supe/Admin only.

## Screenshot references
`Chasers-Geo.jpg`.

## Route/path
`/chasers`, map mode.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/chasers/chasers-client.tsx`
- `apps/web/src/components/google-maps-provider.tsx`
- `@vis.gl/react-google-maps`

## Data dependencies
Firestore `profiles.locationTracking.lat/lng/enabled`; profile names/avatars.

## Realtime listeners
Current source fetches chasers, not realtime.

## Layout description from top to bottom
Blue app bar `Chasers` with list/map toggle and filter. Full-screen Google map centered around New York/New Jersey area in screenshot. Red map pins mark chaser locations. Floating bottom nav overlays map with Chasers active.

## Component hierarchy
Chasers client -> Google `Map` -> `Marker`/`InfoWindow` -> bottom nav.

## Interaction inventory
- Pan/zoom map.
- Tap pins to select chaser info.
- Toggle back to list.
- Open filters.

## Filters/search/sort controls
Same filter state as chaser list.

## Buttons/actions and expected results
Map/list toggle changes `view`. Filter opens sheet.

## Navigation targets
Chaser detail from selected marker/list interaction.

## Loading states
Map tile loading.

## Empty states
Source shows no-location state if no chasers have location.

## Error states
No explicit map load failure visible.

## Permission/role restrictions
Supe/Admin only.

## Android UI reconstruction notes
Use Google Maps Compose, red custom markers, map-filling layout under top bar, and bottom nav overlay.

## Open questions / verification gaps
Need marker info window screenshot and live update behavior confirmation.
