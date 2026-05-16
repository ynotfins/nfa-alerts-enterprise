# 33 - Admin Users

## Screen purpose
Admin list/search/filter surface for user moderation and profile management.

## Role visibility
Admin only in bottom nav source.

## Screenshot references
Needs Screenshot.

## Route/path
`/admin/users`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/admin/users/admin-users-client.tsx`
- `apps/web/src/hooks/use-profiles.ts`
- `apps/web/src/services/profiles.ts`

## Data dependencies
Firestore `profiles`, moderation fields `suspension`, `ban`, roles and stats.

## Realtime listeners
Fetch-on-load via `useAllProfiles`.

## Layout description from top to bottom
Source-backed: header, search field, role filter chips/tabs/counts, user rows with avatar, name/email, role badge, action drawer via ellipsis. Exact visual needs screenshot.

## Component hierarchy
AdminUsersClient -> Header -> search/filter controls -> user list -> action/suspend/ban drawers.

## Interaction inventory
- Search by name/email.
- Filter by role.
- Open user action drawer.
- Suspend/unsuspend, ban/unban.
- Navigate to edit detail.

## Filters/search/sort controls
Role filters: All, Admins, Supes, Chasers. Search query filters name/email.

## Buttons/actions and expected results
Moderation actions update profile fields and refresh list.

## Navigation targets
`/admin/users/[id]`.

## Loading states
Source has loading branch.

## Empty states
No screenshot; should show no users/no results state in Android.

## Error states
Toasts on moderation failure.

## Permission/role restrictions
Admin only by shell nav; enforce server/rules in native implementation.

## Android UI reconstruction notes
Compose `LazyColumn`, search bar, filter chips, user cards, modal action sheets.

## Open questions / verification gaps
Need screenshot and admin authorization design for Android.
