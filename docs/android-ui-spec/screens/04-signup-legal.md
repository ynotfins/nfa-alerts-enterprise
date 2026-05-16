# 04 - Signup Legal

## Screen purpose
Collect required legal and emergency contact information during onboarding.

## Role visibility
Incomplete authenticated users.

## Screenshot references
Needs Screenshot. Legal/profile policy screenshots cover static terms pages, not onboarding form.

## Route/path
`/signup/legal`.

## Source files/components/hooks/services
- `apps/web/src/app/(auth)/signup/legal/page.tsx`
- `apps/web/src/services/profiles.ts`
- `apps/web/src/schemas/auth.ts`

## Data dependencies
Firestore `profiles.legal`, `profiles.emergencyContact`, `completedSteps`.

## Realtime listeners
Global auth/profile listener observes profile completion.

## Layout description from top to bottom
Source-backed: onboarding card with progress, legal/contact fields validated by Zod, continue action.

## Component hierarchy
Signup legal page -> `Card` -> `Progress` -> form fields -> submit button.

## Interaction inventory
- Enter date/legal values and emergency contact fields.
- Update current profile.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
- Continue: saves legal/contact details and routes to signature step.

## Navigation targets
`/signup/signature`.

## Loading states
Submit loading state.

## Empty states
None.

## Error states
Inline validation and submit errors.

## Permission/role restrictions
Requires authenticated incomplete profile.

## Android UI reconstruction notes
Use Compose form with date input, emergency contact fields, validation messages, and step progress.

## Open questions / verification gaps
Need screenshot and final field list confirmation from runtime.
