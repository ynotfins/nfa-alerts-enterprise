# 22 - Chat Thread

## Screen purpose
Direct or group chat with text, voice messages, reactions, attachments, and read/typing state.

## Role visibility
Both. Screenshots are Supe app.

## Screenshot references
`Chat-.jpg`, `Chat-audio-message.jpg`.

## Route/path
`/chat/[threadId]`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/chat/[threadId]/chat-thread-client.tsx`
- `apps/web/src/hooks/use-chat.ts`
- `apps/web/src/services/chat.ts`
- `apps/web/src/services/storage.ts`

## Data dependencies
Firestore `threads/{threadId}` and `threads/{threadId}/messages`; Storage `voice/{threadId}` and `attachments/{threadId}`; profiles for sender names/avatars.

## Realtime listeners
`subscribeToThread` and `subscribeToMessages` use Firestore `onSnapshot`. `markAsRead` updates read state/unread count.

## Layout description from top to bottom
White top bar with back arrow, avatar, contact name, overflow menu. Message area mostly white. Own messages appear as rounded blue bubbles aligned right with white text and timestamp. Voice messages use blue bubble with circular play button, progress bar, duration and timestamp. Bottom input dock is a rounded white floating container with pill text field placeholder `Type your message here...` and microphone icon.

## Component hierarchy
Chat thread client -> header -> messages list -> optional voice player / attachment blocks -> floating composer.

## Interaction inventory
- Send text.
- Record/upload voice.
- Play/pause voice audio.
- Add/remove reactions.
- Mark thread read.
- Open profile/moderation menu from overflow.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
- Send creates message, updates thread lastMessage/unreadCount, and triggers notification fetches.
- Microphone records voice and uploads to Storage.
- Back navigates to contacts.

## Navigation targets
Back to `/chat`; profile drawer; notification URL can target this route.

## Loading states
Thread loading skeleton route exists.

## Empty states
Blank message area for empty thread.

## Error states
Toast/logging on send/upload failures.

## Permission/role restrictions
Rules should enforce thread membership; current rules need tightening for message subcollection per audit.

## Android UI reconstruction notes
Use Compose chat layout with reversed/scrolling message list, custom blue bubbles, bottom input surface, voice playback row, and Firestore listener state holder.

## Open questions / verification gaps
Need screenshots for incoming bubbles, attachments, reactions, typing indicator, and empty thread.
