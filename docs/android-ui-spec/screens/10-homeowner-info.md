# 10 - Homeowner Information

## Screen purpose
Collect and edit homeowner/property/insurance details for an incident.

## Role visibility
Both with role differences. Supe/Admin can save directly; Chaser flow can request changes for supe approval according to source.

## Screenshot references
`Details-Homeowner.jpg`.

## Route/path
`/incidents/[id]/homeowner`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/incidents/[id]/homeowner/homeowner-client.tsx`
- `apps/web/src/actions/change-requests.ts`
- `apps/web/src/services/change-requests.ts`
- `apps/web/src/hooks/use-incidents.ts`

## Data dependencies
Firestore `incidents/{id}.homeowner`; `changeRequests` for proposed changes.

## Realtime listeners
Incident document listener; `subscribeToPendingChangeRequests` for supe/admin review.

## Layout description from top to bottom
Blue app bar `Incident Details`. White card titled `Homeowner Information`. Vertical form fields: Homeowner Name, Contact Person, Phone, Email, Property Address, Policy Number, Carrier Name, Claims Phone, Damage Description, Adjuster Name/Phone, Additional Notes. Bottom full-width blue `Save Changes` button. Page tabs show Details, Homeowner active, Docs, Sign.

## Component hierarchy
Homeowner client -> card form -> nested insurance/adjuster fields -> save/request change controls -> page tabs.

## Interaction inventory
- Edit homeowner fields.
- Save directly for supe/admin.
- Chaser can open/request field changes per source.
- Supe can approve/reject pending changes per source.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
`Save Changes` updates `incidents/{id}.homeowner` for supe/admin. Change request actions write `changeRequests` and notify supes/requester.

## Navigation targets
Back to incident detail tabs; review query parameter can focus change request source flow.

## Loading states
`IncidentHomeownerSkeleton`.

## Empty states
Blank text inputs for missing data.

## Error states
Toast on save/request/review failure.

## Permission/role restrictions
Supe/Admin direct edit; Chaser request approval path is source-backed but not screenshot-backed.

## Android UI reconstruction notes
Use Compose form in `LazyColumn` with grouped Card. Model homeowner as nested state; for Chaser, render read-only rows with edit/request affordance after native Chaser screenshots are captured.

## Open questions / verification gaps
Need Chaser screenshot for request-change UI and Supe screenshot for pending request review panel.
