# 31 - Help & Support

## Screen purpose
Static support resources, FAQ, and emergency contact action.

## Role visibility
Both. Screenshot is Supe.

## Screenshot references
`Supe-Helpsupport.jpg`.

## Route/path
`/help-support`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/help-support/page.tsx`

## Data dependencies
Static content only.

## Realtime listeners
None.

## Layout description from top to bottom
White top bar with back arrow and `Help & Support`. Card `Contact Us` with rows Email Support, Phone Support, Live Chat, each with pale blue circular icon. Card `Frequently Asked Questions` with multiple FAQ rows, question icons, bold question text and gray explanatory answers. Card `Emergency Contact` with warning copy and full-width red `Emergency Hotline: 911` button. Bottom nav visible.

## Component hierarchy
Static page -> Header -> contact card -> FAQ card -> emergency contact card.

## Interaction inventory
- Email/phone/live chat rows may be tappable by source if implemented.
- Emergency hotline button.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Emergency button should initiate phone dialer or emergency guidance in native Android; verify source before wiring.

## Navigation targets
Back to `/profile`.

## Loading states
None.

## Empty states
None.

## Error states
None.

## Permission/role restrictions
Protected route.

## Android UI reconstruction notes
Static Compose screen with grouped cards and clear hierarchy. For native, use `Intent.ACTION_DIAL` for phone rows after legal/product approval.

## Open questions / verification gaps
Confirm actual support email/phone/live chat endpoints before production.
