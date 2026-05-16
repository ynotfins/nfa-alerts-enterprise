# 11 - Documents and Photos

## Screen purpose
Upload incident photos/documents and allow supes to review submissions by responder.

## Role visibility
Responded Chasers and Supe/Admin. Source blocks access until response unless user is supe/admin.

## Screenshot references
`Details-Docs.jpg`.

## Route/path
`/incidents/[id]/docs`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/incidents/[id]/docs/docs-client.tsx`
- `apps/web/src/services/storage.ts`
- `apps/web/src/hooks/use-incidents.ts`
- `apps/web/src/components/chaser-selector.tsx`

## Data dependencies
Storage `incidents/{incidentId}/{uid}/documents/{file}`; Firestore `incidents/{id}/chaserSubmissions/{uid}/documents`; incident responders.

## Realtime listeners
Incident listener; documents are fetched via Firestore queries and refreshed after upload.

## Layout description from top to bottom
Segmented control `My Documents` / `Review All`. Two side-by-side outline buttons: `Take Photo`, `Attach File`. Card titled `Message` with large textarea placeholder `Add a message (max 500 characters).` and `0/500` counter. Card(s) titled `Documents & Photos (0)` with empty content and `No documents uploaded yet`. Page tab `Docs` active.

## Component hierarchy
Docs page -> optional tabs -> upload buttons -> message card -> document list cards -> chaser selector for review mode.

## Interaction inventory
- Take photo opens image capture.
- Attach file opens file picker.
- Textarea accepts up to 500 chars.
- View uploaded document via signed/download URL.
- Supe review selects responder and sees their documents.

## Filters/search/sort controls
Responder selector in Supe review mode.

## Buttons/actions and expected results
- `Take Photo` / `Attach File`: upload file to Storage and create Firestore document metadata.
- Eye icon: opens file URL.

## Navigation targets
No route changes except page tabs.

## Loading states
`IncidentDocsSkeleton`, inline upload state disables buttons.

## Empty states
`No documents uploaded yet`, no responders yet for Supe review.

## Error states
Toast on upload failure; document item can show `Access denied - Check Firebase Storage permissions`.

## Permission/role restrictions
Non-supe users must be in `incident.responderIds` to access.

## Android UI reconstruction notes
Use Compose image/file picker, Storage upload progress, document list card, and optional responder selector. Keep upload controls as two equal-width outlined buttons.

## Open questions / verification gaps
Need screenshot with actual uploaded docs and Supe Review All state populated.
