# 32 - Legal / Privacy

## Screen purpose
Display Terms of Service and Privacy Policy static legal content.

## Role visibility
Both. Screenshots are Supe.

## Screenshot references
`Supe-Legal.jpg`, `Supe-Privacy-Policy.jpg`.

## Route/path
`/terms-privacy`.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/terms-privacy/page.tsx`
- `apps/web/src/components/legal-tabs.tsx`

## Data dependencies
Static content only.

## Realtime listeners
None.

## Layout description from top to bottom
White top bar with back arrow and `Legal`. Two top tabs: `Terms of Service`, `Privacy Policy`; active tab has blue underline. Content card with `Last Updated: January 15, 2025`, bold section headings, dense legal paragraphs. Bottom nav remains visible.

## Component hierarchy
Terms/privacy page -> Header -> LegalTabs -> scrollable legal content card.

## Interaction inventory
Switch between Terms and Privacy tabs; back navigation.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
Tab buttons switch local/legal content view.

## Navigation targets
Back to `/profile`.

## Loading states
None.

## Empty states
None.

## Error states
None.

## Permission/role restrictions
Protected route in dashboard group.

## Android UI reconstruction notes
Use Compose `TabRow` or custom underline tabs with scrollable text. Preserve dense but readable paragraph spacing.

## Open questions / verification gaps
Legal copy should be reviewed by counsel before native release.
