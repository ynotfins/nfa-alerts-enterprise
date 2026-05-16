# 02 - Signup Credentials

## Screen purpose
Create a Firebase Auth user and initial chaser profile.

## Role visibility
Public.

## Screenshot references
Needs Screenshot.

## Route/path
`/signup`.

## Source files/components/hooks/services
- `apps/web/src/app/(auth)/signup/page.tsx`
- `apps/web/src/lib/auth-client.ts`
- `apps/web/src/services/profiles.ts`
- `apps/web/src/schemas/auth.ts`

## Data dependencies
Firebase Auth create user; Firestore `profiles/{uid}` with `role: "chaser"`, `completedSteps: 0`, timestamps.

## Realtime listeners
Global auth/profile listeners after user creation.

## Layout description from top to bottom
Source-backed: centered card, title `Create account`, subtitle `Step 1 of 4: Enter your credentials`, progress bar at 25%, email/password/confirm password fields, continue button, Google sign-up option, sign-in link.

## Component hierarchy
`SignUpPage` -> `Card` -> `Progress` + `form` -> fields, alert, submit button.

## Interaction inventory
- Validate credentials with Zod/react-hook-form.
- Create Firebase user.
- Create profile with default role `chaser`.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
- `Continue`: creates user/profile and navigates to `/signup/profile`.
- Google sign-up: triggers Google OAuth; redirect/profile handling occurs after auth state change.

## Navigation targets
`/signup/profile`, `/login`.

## Loading states
Submit button spinner.

## Empty states
None.

## Error states
Inline alert when account or profile creation fails.

## Permission/role restrictions
Public route; default role is Chaser.

## Android UI reconstruction notes
Compose card with `LinearProgressIndicator`, three fields, validation messages, full-width button. Use Firebase Auth Android SDK and Firestore profile creation.

## Open questions / verification gaps
Need screenshot for exact auth page visual spacing.
