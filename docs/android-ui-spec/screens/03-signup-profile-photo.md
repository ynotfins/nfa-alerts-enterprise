# 03 - Signup Profile Photo

## Screen purpose
Optional onboarding profile photo capture/upload.

## Role visibility
Incomplete authenticated users.

## Screenshot references
Needs Screenshot.

## Route/path
`/signup/profile`.

## Source files/components/hooks/services
- `apps/web/src/app/(auth)/signup/profile/page.tsx`
- `apps/web/src/services/storage.ts`
- `apps/web/src/services/profiles.ts`
- `apps/web/src/schemas/auth.ts`

## Data dependencies
Firebase Storage `profiles/{uid}/avatar.jpg`; Firestore `profiles.avatarUrl`, `completedSteps`.

## Realtime listeners
Global auth/profile listener observes `completedSteps`.

## Layout description from top to bottom
Source-backed: centered card with title `Profile Photo`, subtitle `Step 2 of 4`, progress at 50%, avatar preview, `Take Photo` button, hidden file input with `capture="environment"`, continue and skip buttons.

## Component hierarchy
`ProfilePhotoPage` -> `Card` -> `Progress` -> `Avatar` -> upload button -> footer actions.

## Interaction inventory
- Choose/capture image and preview via FileReader.
- Upload base64 image to Storage.
- Save profile `avatarUrl` and `completedSteps: 1`.
- Skip without updating profile photo.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
- `Take Photo`: opens camera/file picker.
- `Continue`: uploads photo, updates profile, navigates to `/signup/legal`.
- `Skip for now`: navigates to `/signup/legal`.

## Navigation targets
`/signup/legal`.

## Loading states
Submit button spinner.

## Empty states
Avatar fallback icon.

## Error states
Inline alert on upload failure.

## Permission/role restrictions
Requires authenticated user; source stores through Firebase client auth.

## Android UI reconstruction notes
Use camera/gallery picker, circular avatar preview, Storage upload task, and Firestore profile update. Preserve optional skip.

## Open questions / verification gaps
Need screenshot and product decision on whether camera-only or gallery is allowed in native Android.
