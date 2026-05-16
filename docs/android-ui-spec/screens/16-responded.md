# 16 - Responded

## Screen purpose
Show incidents the current user responded to; product model says Supe view should show all responded incidents.

## Role visibility
Both; screenshot is Supe app.

## Screenshot references
`Responded.jpg`.

## Route/path
`/favorites`, Responded tab.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/favorites/favorites-client.tsx`
- `apps/web/src/services/incidents.ts#getRespondedIncidents`
- `apps/web/src/components/incidents/incident-card.tsx`

## Data dependencies
Firestore query on `incidents` where `responderIds array-contains current uid` and `status == active`; fallback query filters client-side.

## Realtime listeners
Fetch-on-load, not realtime.

## Layout description from top to bottom
Blue app bar `My Incidents`. Populated incident list using same dense IncidentCard row style. Responded tab active in lower segmented tab bar. Each row shows timestamp, responder count icon, distance, incident fields, alarm badges where available, and action icons.

## Component hierarchy
Favorites client -> responded list -> IncidentCard rows -> PageTabs.

## Interaction inventory
Open incident, favorite/bookmark/mute/hide, switch tabs.

## Filters/search/sort controls
None in screenshot.

## Buttons/actions and expected results
Tab and card actions as shared incident cards.

## Navigation targets
`/incidents/[id]`.

## Loading states
Parent skeleton.

## Empty states
If no responded incidents, title `No Responded Incidents` per source.

## Error states
Fetch failure returns empty list.

## Permission/role restrictions
Protected route. Source currently queries current user's responderIds; product model says Supe should see all responses, so parity requirement should be confirmed.

## Android UI reconstruction notes
Reuse incident list row. Consider role-aware repository method for Supe all-responded behavior if product confirms.

## Open questions / verification gaps
Conflict: `PRODUCT_MODEL.md` says Supe sees all responded alerts; current source appears current-user scoped. Verify intended Android behavior.
