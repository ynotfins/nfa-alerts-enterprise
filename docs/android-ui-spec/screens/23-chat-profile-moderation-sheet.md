# 23 - Chat Profile / Moderation Sheet

## Screen purpose
Show chat participant profile summary and supervisor moderation actions.

## Role visibility
Moderation actions are Supe/Admin. Screenshot is Supe app.

## Screenshot references
`Chaser-profile.jpg`.

## Route/path
Bottom sheet state from `/chat/[threadId]`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/chat/[threadId]/chat-thread-client.tsx`
- `apps/web/src/services/moderation.ts`
- `apps/web/src/services/profiles.ts`

## Data dependencies
`profiles/{userId}`; moderation writes `warnings`, `suspension`, `ban`, `bannedDevices`.

## Realtime listeners
Parent chat/profile data; action writes are not realtime-specific in sheet.

## Layout description from top to bottom
Dimmed chat backdrop. Rounded bottom sheet with drag handle, title `Details`, centered avatar, name `Tony Valentine`, role pill `Chaser`. Full-width blue `View Full Profile`. Three horizontal action buttons: `Warn`, `Suspend`, red `Ban`. Full-width white `Close` button.

## Component hierarchy
Drawer -> profile avatar/name/role -> primary profile button -> moderation action row -> close.

## Interaction inventory
- View full profile.
- Warn user.
- Suspend user.
- Ban user.
- Close sheet.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Moderation buttons open further drawers/forms in source and write profile moderation fields.

## Navigation targets
`/chasers/[chaserId]` or admin/user profile depending source flow.

## Loading states
None visible.

## Empty states
Fallback initials/avatar if missing.

## Error states
Toast on moderation failure.

## Permission/role restrictions
Only supe/admin should see moderation actions. Chaser equivalent should be profile-only if present.

## Android UI reconstruction notes
Use `ModalBottomSheet`, centered profile header, role chip, primary CTA, and three action buttons with red destructive styling for ban.

## Open questions / verification gaps
Need screenshot of warn/suspend/ban nested drawers and Chaser-visible profile sheet.
