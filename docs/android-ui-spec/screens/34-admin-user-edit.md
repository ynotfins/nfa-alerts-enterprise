# 34 - Admin User Edit

## Screen purpose
Edit a user's profile, role, legal/contact fields, location tracking, and moderation state.

## Role visibility
Admin only.

## Screenshot references
Needs Screenshot.

## Route/path
`/admin/users/[id]`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/admin/users/[id]/admin-user-edit-client.tsx`
- `apps/web/src/hooks/use-profiles.ts`
- `apps/web/src/services/profiles.ts`

## Data dependencies
Firestore `profiles/{id}` fields: firstName, lastName, email, phone, address, role, legal, emergencyContact, locationTracking, suspension, ban, stats.

## Realtime listeners
Profile fetch/subscription via `useProfile(userId)`.

## Layout description from top to bottom
Source-backed: header, editable fields for personal info, role select, legal DOB, emergency contact, location tracking switch, accordion sections, suspend/ban drawers. Exact visual needs screenshot.

## Component hierarchy
AdminUserEditClient -> Header -> form fields -> role select -> accordions -> moderation drawers -> save action.

## Interaction inventory
- Edit profile fields.
- Change role.
- Toggle location tracking.
- Suspend/unsuspend.
- Ban/unban.
- Save profile.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Save updates `profiles/{id}`. Moderation writes nested profile moderation objects.

## Navigation targets
Back to `/admin/users`.

## Loading states
`Loading user...` source state.

## Empty states
`User not found` with back button.

## Error states
Toasts on save/moderation failure.

## Permission/role restrictions
Admin only; must not be accessible to Chaser/Supe in native Android without server/rules checks.

## Android UI reconstruction notes
Use a form screen with sections. Model edits as local state and call Firestore update through repository. Role changes should be guarded.

## Open questions / verification gaps
Need screenshot and exact form grouping/labels.
