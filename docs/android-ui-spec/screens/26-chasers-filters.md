# 26 - Chasers Filters

## Screen purpose
Filter chaser list/map by name, activity, and location tracking.

## Role visibility
Supe/Admin only.

## Screenshot references
`Chasers-Filters.jpg`.

## Route/path
Bottom sheet from `/chasers`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/chasers/chasers-client.tsx`

## Data dependencies
Local filter state: search query, minimum responses, minimum days active, location tracking only.

## Realtime listeners
Parent profile/chaser data fetch.

## Layout description from top to bottom
Dimmed map background. Bottom sheet with drag handle, title `Search & Filters`, subtitle `Filter chasers by name, activity, and location tracking`. Search field with icon. Slider rows `Minimum Responses: 0`, `Minimum Days Active: 0`. Checkbox `Location Tracking Enabled Only`. Full-width blue `Apply Filters`, white `Reset Filters`.

## Component hierarchy
Drawer -> title/subtitle -> search input -> sliders -> checkbox -> footer buttons.

## Interaction inventory
- Type search.
- Drag sliders.
- Toggle checkbox.
- Apply or reset filters.

## Filters/search/sort controls
Search by name; minimum response count; minimum days active; location tracking enabled.

## Buttons/actions and expected results
Apply closes drawer; reset clears local state.

## Navigation targets
Returns to chasers list/map.

## Loading states
None visible.

## Empty states
No-results handled by parent.

## Error states
None.

## Permission/role restrictions
Supe/Admin only.

## Android UI reconstruction notes
Use Compose `ModalBottomSheet`, `OutlinedTextField`, `Slider`, `Checkbox`, primary/secondary buttons.

## Open questions / verification gaps
Need screenshot after non-zero slider/filter values.
