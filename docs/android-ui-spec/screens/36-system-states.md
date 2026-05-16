# 36 - System States

## Screen purpose
Document app-wide routes/states not covered by primary screenshots: root redirect, logout, banned, suspended, error, not-found, desktop-block, and dev tools.

## Role visibility
Mixed.

## Screenshot references
Needs Screenshot for all states. Desktop-block is source-backed from `apps/web/src/app/layout.tsx`.

## Route/path
`/`, `/logout`, `/banned`, `/suspended`, `/dev-tools`, app `error.tsx`, app `not-found.tsx`.

## Source files/components/hooks/services
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/logout/page.tsx`
- `apps/web/src/app/(auth)/banned/page.tsx`
- `apps/web/src/app/(auth)/suspended/page.tsx`
- `apps/web/src/app/error.tsx`
- `apps/web/src/app/not-found.tsx`
- `apps/web/src/app/layout.tsx`

## Data dependencies
Auth state, profile `suspension` and `ban`, device fingerprint checks in `AuthProvider`.

## Realtime listeners
Auth/profile listener controls redirects to suspended/banned states.

## Layout description from top to bottom
Source-backed desktop state: fixed full-screen centered message with phone icon and title `Mobile Only`, explaining the app is designed exclusively for phones/tablets. Other system-state visuals need screenshots/source-specific review before Android parity.

## Component hierarchy
RootLayout wraps all mobile content and desktop-block. AuthProvider controls redirect states.

## Interaction inventory
- Root redirects to incidents.
- Logout signs out.
- Banned/suspended show status messaging.
- Error/not-found display app-level fallback UI.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Depends on specific state; logout returns user to login.

## Navigation targets
`/incidents`, `/login`, profile/support routes depending state.

## Loading states
Auth loading spinner used in protected/auth flows.

## Empty states
Not applicable.

## Error states
Global error page and not found page.

## Permission/role restrictions
Banned/suspended are based on profile fields and device ban lookup.

## Android UI reconstruction notes
Native Android does not need a desktop block. It does need banned/suspended blocking screens and global error/offline states.

## Open questions / verification gaps
Need screenshots of banned, suspended, not-found, error, logout, and dev-tools if they will exist in native Android.
