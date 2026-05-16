# 29 - My Information

## Screen purpose
Read-only detail view of current user's profile information and signature.

## Role visibility
Both. Screenshot is Supe.

## Screenshot references
`Supe-My-Info.jpg`.

## Route/path
`/profile/information`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/profile/information/page.tsx`
- `apps/web/src/hooks/use-profiles.ts`

## Data dependencies
Current `profiles/{uid}`: name, email, phone, address, role, legal, emergencyContact, signatureUrl.

## Realtime listeners
Current profile listener from AuthProvider.

## Layout description from top to bottom
Blue app bar with back arrow and `My Information`. Large card `Personal Information` with rows Full Name, Email, Role separated by thin dividers. Signature card with title `Signature` and signature image inside muted bordered box. Bottom nav remains visible with Profile active.

## Component hierarchy
MyInformationPage -> Header -> scroll content -> personal info card -> optional legal/emergency/signature cards.

## Interaction inventory
Back navigation only in screenshot.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Back arrow returns to Profile.

## Navigation targets
`/profile`.

## Loading states
Skeleton header and cards.

## Empty states
`Profile not found` fallback.

## Error states
No explicit fetch error state beyond missing profile.

## Permission/role restrictions
Current user only.

## Android UI reconstruction notes
Use read-only labeled rows in Cards. Preserve spacious vertical layout and dividers.

## Open questions / verification gaps
Need screenshots with phone/address/legal/emergency fields populated.
