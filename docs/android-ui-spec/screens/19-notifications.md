# 19 - Notifications

## Screen purpose
Show in-app notifications and mark them read.

## Role visibility
Both.

## Screenshot references
`Notifications.jpg` shows loading skeleton state.

## Route/path
`/notifications`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/notifications/notifications-client.tsx`
- `apps/web/src/hooks/use-notifications.ts`
- `apps/web/src/services/notifications.ts`
- `apps/web/src/lib/db.ts` `AppNotification`

## Data dependencies
Firestore `appNotifications` where `profileId == current uid`, ordered by `createdAt desc`.

## Realtime listeners
`subscribeToNotifications` and `subscribeToUnreadCount` use Firestore `onSnapshot`.

## Layout description from top to bottom
Screenshot shows blue header skeleton blocks and list skeleton rows. Source-backed completed state uses title `Notifications`, optional mark-all-read header action, rows with circular type icon, title/body/timestamp, unread styling, and empty state `No Notifications`.

## Component hierarchy
Notifications client -> Header/HeaderSkeleton -> PageContent/ContentSkeleton -> notification rows.

## Interaction inventory
- Tap notification to mark read and navigate to `notification.url`.
- Mark all as read.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Mark-all check icon updates all unread notifications for current user. Row click marks one notification read.

## Navigation targets
Notification-specific `url` field, such as `/chat/[threadId]` or incident paths.

## Loading states
Screenshot-backed skeleton list.

## Empty states
Source-backed `No Notifications` centered empty state.

## Error states
No explicit listener error surface in source.

## Permission/role restrictions
Users can read/update/delete only own notifications per rules.

## Android UI reconstruction notes
Use realtime Firestore query and notification type icon map. Preserve skeleton shimmer/loading rows for parity.

## Open questions / verification gaps
Need screenshot of populated notifications and empty state.
