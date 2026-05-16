# 05 - Signup Signature

## Screen purpose
Capture liability agreement signature and finish onboarding.

## Role visibility
Incomplete authenticated users.

## Screenshot references
Needs Screenshot for onboarding. Related signature drawing UI is visible in `Details-Respond-Docs`.

## Route/path
`/signup/signature`.

## Source files/components/hooks/services
- `apps/web/src/app/(auth)/signup/signature/page.tsx`
- `apps/web/src/services/storage.ts`
- `apps/web/src/services/profiles.ts`
- `react-signature-canvas`

## Data dependencies
Firebase Storage `profiles/{uid}/signature.png`; Firestore `profiles.signatureUrl`, `signedAt`, `completedSteps: 4`.

## Realtime listeners
Global auth/profile listener transitions to authenticated dashboard when profile is complete.

## Layout description from top to bottom
Source-backed: card with title `Liability Agreement`, step 4 progress, waiver text, dashed signature canvas, clear button, agreement checkbox, continue/submit button.

## Component hierarchy
`SignaturePage` -> `Card` -> `Progress` -> waiver text block -> `SignatureCanvas` -> `Checkbox` -> submit button.

## Interaction inventory
- Draw signature.
- Clear signature.
- Agree to terms.
- Upload signature image and update profile.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
- `Clear`: resets canvas.
- Submit: validates signature and agreement, uploads, clears session storage, navigates to `/incidents`.

## Navigation targets
`/incidents`.

## Loading states
Submit button loading state.

## Empty states
Empty signature canvas.

## Error states
Inline errors for missing signature/agreement and upload failure.

## Permission/role restrictions
Requires authenticated user.

## Android UI reconstruction notes
Use a custom Compose signature canvas with bitmap export to Firebase Storage. Preserve dashed border and clear action.

## Open questions / verification gaps
Need onboarding screenshot and legal copy approval.
