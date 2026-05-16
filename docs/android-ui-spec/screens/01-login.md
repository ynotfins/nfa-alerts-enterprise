# 01 - Login

## Screen purpose
Public entry point for returning users to sign in with email/password or Google.

## Role visibility
Public. Authenticated users are redirected by `AuthProvider`.

## Screenshot references
Needs Screenshot. No login screenshot exists in `screenshots/`.

## Route/path
`/login`.

## Source files/components/hooks/services
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/lib/auth-client.ts`
- `apps/web/src/schemas/auth.ts`
- `apps/web/src/contexts/auth-context.tsx`
- `apps/web/src/components/pwa-install-prompt.tsx`

## Data dependencies
Firebase Auth; Firestore `profiles/{uid}` for Google sign-in profile existence check.

## Realtime listeners
Global `AuthProvider` uses Firebase `onAuthStateChanged` and profile `onSnapshot`.

## Layout description from top to bottom
Source-backed: centered card on a white mobile viewport. Card contains title `Sign in`, helper text, email field, password field, submit button, Google sign-in flow, and link affordances from the auth form. PWA install prompt can render over the screen.

## Component hierarchy
`LoginPage` -> `PWAInstallPrompt` + `Card` -> `form` -> `Input`, `Button`, `Alert`.

## Interaction inventory
- Submit email/password via `authClient.signIn.email`.
- Tap Google sign-in via `authClient.signIn.social({ provider: "google" })`.
- For first-time Google users, create minimal `profiles/{uid}` with role `chaser`, then route to signup profile.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
- `Sign in`: authenticates; redirect is handled by `AuthProvider`.
- Google sign-in: creates/loads auth session and profile.

## Navigation targets
`/incidents` for complete profiles; `/signup/profile` for incomplete Google profiles.

## Loading states
Spinner while auth state is `loading`; button spinner while submitting.

## Empty states
None.

## Error states
Inline destructive alert and toast messages on failed auth.

## Permission/role restrictions
Public route. Completed authenticated users should not remain here.

## Android UI reconstruction notes
Use Compose `Card` centered in `Box`, `OutlinedTextField`s, full-width primary button, secondary Google button. State holder: `LoginViewModel` with Firebase Auth calls and profile lookup.

## Open questions / verification gaps
Need screenshot for final visual parity and exact Google button styling.
