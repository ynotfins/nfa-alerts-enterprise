# 20 - Chat Contacts

## Screen purpose
List chat threads and show unread message state.

## Role visibility
Both, with role-specific thread grouping. Screenshots are Supe app.

## Screenshot references
`Chat.jpg`.

## Route/path
`/chat`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/chat/chat-client.tsx`
- `apps/web/src/hooks/use-chat.ts`
- `apps/web/src/services/chat.ts`
- `apps/web/src/components/chat/chaser-search-drawer.tsx`

## Data dependencies
Firestore `threads`; `profiles` for participant names/avatars; per-user `unreadCount` map.

## Realtime listeners
`subscribeToUserThreads`; Supe/Admin also `subscribeToChaserToSupesThreads`.

## Layout description from top to bottom
Blue app bar `Contacts` with plus button. Thread rows: avatar, contact name, last message preview, date on right. Empty lower area when few contacts. Floating bottom nav shows Chat active with red unread badge count.

## Component hierarchy
Chat page -> Header -> ThreadItem list -> optional PageTabs for chaser view -> bottom nav.

## Interaction inventory
- Tap plus to open start conversation sheet.
- Tap row to open chat thread.
- Chaser tab can switch between chasers and supes according to source.

## Filters/search/sort controls
No search on main list; search exists in start conversation sheet.

## Buttons/actions and expected results
Plus opens `ChaserSearchDrawer`.

## Navigation targets
`/chat/[threadId]`.

## Loading states
Header and row skeletons.

## Empty states
Source has empty messages for no chaser/supe contacts.

## Error states
Toast if creating supes thread fails.

## Permission/role restrictions
Supe/Admin see chaser-to-supes threads; Chaser can create supes thread and direct chaser threads per source.

## Android UI reconstruction notes
Use Firestore snapshot listener, `LazyColumn`, avatar row composable, unread badge. Top app bar plus button opens modal sheet.

## Open questions / verification gaps
Need Chaser chat tab screenshots.
