# 07 - Home Filters

## Screen purpose
Filter incident feed by type, alarm/status, responder, location, department, and activity count.

## Role visibility
Both. Screenshot is Supe app.

## Screenshot references
`Home-Filters.jpg`.

## Route/path
Modal/sheet state from `/incidents`.

## Source files/components/hooks/services
- `apps/web/src/components/incidents/filters-drawer.tsx`
- `apps/web/src/app/(dashboard)/incidents/incidents-client.tsx`

## Data dependencies
Local filter state derived from incident fields: `type`, `alarmLevel`, `emergencyServicesStatus`, `responderIds`, `location`, `departmentNumber`, `activityCount`.

## Realtime listeners
Uses parent incident feed listener.

## Layout description from top to bottom
Full-height sheet/page with title `Filters`, close X, white background, accordion sections. Sections visible: Incident, Status, Location, Activity. Each has labels and rounded dropdown/select fields.

## Component hierarchy
Filter drawer -> accordion sections -> select/multi-combobox controls -> apply/reset actions in source.

## Interaction inventory
- Expand/collapse section chevrons.
- Select incident type, alarm level, emergency status, responder filter, distance, state, department, minimum updates.
- Close sheet.

## Filters/search/sort controls
Type, Alarm Level, Emergency Services, Responder, Distance, State, Department, Minimum Updates.

## Buttons/actions and expected results
Selections update parent `filters` state. Reset clears filters.

## Navigation targets
Returns to `/incidents` list.

## Loading states
None visible; parent list may still load behind sheet.

## Empty states
Department options may be empty if incident data has no department numbers.

## Error states
None visible.

## Permission/role restrictions
No role-specific controls confirmed.

## Android UI reconstruction notes
Use `ModalBottomSheet` or full-screen sheet with `LazyColumn`, section headers, ExposedDropdownMenuBox equivalents, and a fixed close icon.

## Open questions / verification gaps
Need lower sheet screenshots for apply/reset/footer if present offscreen.
