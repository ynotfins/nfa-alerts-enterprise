# 12 - E-Signature Documents

## Screen purpose
Select standard documents for homeowner/chaser signing and review signed submissions.

## Role visibility
Responded Chasers and Supe/Admin.

## Screenshot references
`Details-Sign.jpg`, `Details-Esignature-Docs.jpg`, `Details-Sign-Signed.jpg`.

## Route/path
`/incidents/[id]/sign`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/incidents/[id]/sign/sign-client.tsx`
- `apps/web/src/lib/pdf-generator.ts`
- `apps/web/src/services/verification.ts`
- `apps/web/src/hooks/use-incidents.ts`

## Data dependencies
Incident location/responders; profile `signatureUrl`; signed documents under incident chaser submissions; verification proof for non-supe signing.

## Realtime listeners
Incident listener; signed docs are fetched by hooks and refreshed after saves.

## Layout description from top to bottom
Blue app bar. Segmented control `My Submissions` / `Review All`. Header `E-Signature Documents` with subtitle `Select documents to sign with homeowner`. Two-column grid of rounded document cards with gray document icon, required red star badges, selected blue border/checkmark. Primary bottom button reads `Sign Documents` or `Sign 1 Document`; disabled when none selected. Review screen shows `Submissions`, responder selector, `Signed Documents`, and count chip.

## Component hierarchy
Sign page -> tabs -> document card grid -> primary sign action -> review mode cards/responder selector.

## Interaction inventory
- Select/deselect documents.
- Start signing drawer.
- Review all signed docs by responder.
- View/share/download generated PDFs per source.

## Filters/search/sort controls
Responder selector in review mode.

## Buttons/actions and expected results
`Sign Documents` opens signing drawer if docs selected and profile signature exists.

## Navigation targets
Stays in sign tab; signing drawer overlays screen.

## Loading states
`IncidentSignSkeleton`; PDF loading state in source.

## Empty states
`No documents signed yet` in review mode.

## Error states
Toast if no signature in profile, missing homeowner signature, missing agreement, or verification fails.

## Permission/role restrictions
Non-supe users must have responded. Non-supe location verification can run on first document signing.

## Android UI reconstruction notes
Use Compose two-column `LazyVerticalGrid`, required star badge, selected stroke/check badge, bottom primary button. Store selected doc ids in state holder.

## Open questions / verification gaps
Need screenshot of signed document list populated and PDF viewer drawer.
