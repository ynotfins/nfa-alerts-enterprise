# 28 - Profile

## Screen purpose
Current user's profile, signature, preferences, account links, and sign out.

## Role visibility
Both. Screenshot is Supe profile.

## Screenshot references
`Supe-Profile.jpg`.

## Route/path
`/profile`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/profile/profile-client.tsx`
- `apps/web/src/hooks/use-profiles.ts`
- `apps/web/src/hooks/use-push-notifications.ts`
- `apps/web/src/services/profiles.ts`
- `apps/web/src/lib/auth-client.ts`

## Data dependencies
Current `profiles/{uid}`; profile signature URL; FCM push token; location/geofence settings.

## Realtime listeners
Current profile comes from `AuthProvider` profile `onSnapshot`.

## Layout description from top to bottom
Blue header `Profile`. Center avatar with small camera/edit badge, name `Don Deluciano`, role pill `Supe`. Employee Information card with Name, Role, Email and edit pencil. Signature card with signature image and `Update Signature`. Preferences card with rows: Push Notifications, Location Tracking, Geofence Alerts; orange toggles for enabled, gray for disabled. Link card rows: My Information, My Activity, Help & Support, Terms & Privacy. Red full-width `Sign Out`. Bottom nav shows Profile/Supe active.

## Component hierarchy
Profile client -> profile hero -> info card -> signature card -> preferences card -> link list -> sign out.

## Interaction inventory
- Edit name.
- Update signature drawer.
- Toggle push notifications.
- Toggle location tracking.
- Toggle geofence alerts.
- Navigate to info/activity/help/legal.
- Sign out and clear local storage/caches.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Toggles update profile/FCM settings. Sign out calls Firebase signOut, clears caches, redirects to login.

## Navigation targets
`/profile/information`, `/profile/activity`, `/help-support`, `/terms-privacy`, `/login`.

## Loading states
Header/content skeletons.

## Empty states
Avatar fallback initials, missing signature hidden or empty.

## Error states
Toasts on update/signout failures.

## Permission/role restrictions
Protected current user screen.

## Android UI reconstruction notes
Use Compose `LazyColumn`, centered avatar, grouped cards, switches, chevron list rows, destructive sign-out button. Use Firebase Auth signOut and Firestore profile updates.

## Open questions / verification gaps
Need Chaser profile screenshot and signature update completed state.
