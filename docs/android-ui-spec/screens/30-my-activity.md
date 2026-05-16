# 30 - My Activity

## Screen purpose
Show current user's activity stats and recent activity log.

## Role visibility
Both. Screenshot is Supe.

## Screenshot references
`Supe-Profile-My-Activity.jpg`.

## Route/path
`/profile/activity`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/profile/activity/page.tsx`
- `apps/web/src/services/profiles.ts#getActivities`
- `apps/web/src/hooks/use-profiles.ts`

## Data dependencies
`profiles.stats.alertsResponded`, `profiles.stats.daysActive`, `profiles/{uid}/activities`.

## Realtime listeners
Current profile listener; activities fetch-on-load.

## Layout description from top to bottom
Blue app bar with back arrow and `My Activity`. Two stat cards in a row with circular icons, blue `0`, labels `Alerts Responded` and `Days Active`. Large `Recent Activity` card with centered clock icon, `No recent activity to display`, helper text `Your activity will appear here once you start responding to incidents`. Bottom nav with Profile active.

## Component hierarchy
Activity page -> Header -> stats grid -> recent activity card -> optional chaser performance card source-only.

## Interaction inventory
Back only; activity rows are display-only in source.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
None.

## Navigation targets
Back to `/profile`.

## Loading states
Skeleton header, stat cards, recent card.

## Empty states
Screenshot-backed recent activity empty state.

## Error states
No explicit error state.

## Permission/role restrictions
Current user only. Source includes Chaser-only performance card not visible in Supe screenshot.

## Android UI reconstruction notes
Use two stat cards and a large activity card. Add Chaser performance section after Chaser screenshots/requirements are verified.

## Open questions / verification gaps
Need Chaser profile activity screenshot and populated activity history.
