# 21 - Start Conversation

## Screen purpose
Search chasers and start a chat thread.

## Role visibility
Both where `ChaserSearchDrawer` is reachable; screenshot is Supe app.

## Screenshot references
`Chat-Contacts.jpg`.

## Route/path
Bottom sheet state from `/chat`.

## Source files/components/hooks/services
- `apps/web/src/components/chat/chaser-search-drawer.tsx`
- `apps/web/src/services/chat.ts`
- `apps/web/src/hooks/use-profiles.ts`

## Data dependencies
Firestore `profiles` filtered/listed as chasers; `threads` for direct or chaser-to-supes thread creation.

## Realtime listeners
Profile list is fetch-on-load via `listChasers` in current hook.

## Layout description from top to bottom
Dimmed contacts screen, rounded bottom sheet with drag handle. Title `Start Conversation`, subtitle `Search for chasers to message`, search field placeholder `Search chasers...`, vertical contact list with avatars/initials, name and email, bottom white `Cancel` button.

## Component hierarchy
Drawer -> header -> search input -> chaser list -> cancel footer.

## Interaction inventory
- Type search query.
- Tap chaser row to create/open thread.
- Cancel closes sheet.

## Filters/search/sort controls
Search by chaser name/email.

## Buttons/actions and expected results
Contact row calls chat thread creation service and navigates to thread.

## Navigation targets
`/chat/[threadId]`.

## Loading states
Source likely uses chaser hook loading; no screenshot.

## Empty states
No screenshot; expected no-results state should be added in Android.

## Error states
Toast on thread creation failure.

## Permission/role restrictions
Protected. Product says Chaser/Supe pairing to supes becomes group thread.

## Android UI reconstruction notes
Compose `ModalBottomSheet`, `SearchBar`, `LazyColumn` contacts, fixed cancel button.

## Open questions / verification gaps
Need no-results and loading screenshots.
