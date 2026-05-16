# Design System

## Visual Language

The PWA uses a polished mobile-first card interface with a strong blue app bar, rounded white surfaces, subtle borders, large readable text, and a floating bottom navigation container. Screenshots are the primary visual evidence for this document.

## Color Palette Approximation

| Token | Approx hex | Evidence |
| --- | --- | --- |
| Primary blue | `#1a73e8` to `#2f6fe4` | App bars, active tabs, primary buttons in screenshots; source theme uses blue `oklch(0.55 0.22 252)` |
| Active nav blue | `#1479e8` | Incidents/Profile active nav icons |
| Chat purple | `#a855f7` | Chat nav icon and unread badge region |
| Route mint | `#5fd7b0` | Route nav icon |
| Notifications amber | `#f2b24a` | Notification bell nav icon |
| Favorite pink/red | `#ef6f87` / `#ef4444` | Favorite heart and ban/destructive button |
| Text primary | `#111111` | Body/headline text |
| Text secondary | `#6b7280` | Subtitles, metadata, empty-state text |
| Border | `#e5e7eb` | Card/input dividers |
| Background | `#ffffff` | Main screen background |
| Muted fill | `#f4f5f7` | Skeletons, inactive segmented controls, empty icons |

## Typography Scale

Source uses the Outfit Google font in `apps/web/src/app/layout.tsx`. Android should use a rounded modern sans such as Google Sans/Roboto with weight tuning to match.

| Use | Approx size | Weight | Notes |
| --- | --- | --- | --- |
| App bar title | 22-24sp | 700 | `Incidents`, `Contacts`, `Profile`, `Incident Details` |
| Section title | 18-22sp | 700 | Card titles such as `Homeowner Information`, `Submissions` |
| Incident title/body | 15-17sp | 600-700 | Dense but readable incident list copy |
| Metadata | 11-13sp | 500-600 | Dates, distances, labels |
| Button text | 15-17sp | 700 | Primary buttons have bold centered labels |
| Empty-state title | 19-22sp | 700 | `No Favorites Yet` etc. |

## Spacing System

Use an 8dp base grid. Common screenshot rhythms: 16dp screen padding, 12-16dp card gap, 16-24dp card padding, 8-12dp internal control gap, 72-88dp bottom navigation height, 32dp bottom safe-area spacing.

## Cards

Cards are white, rounded 12-18dp, lightly bordered, and occasionally shadowed. Most cards are full-width with `16dp` horizontal margins. Incident list rows are not always boxed; they use separators and a blue left activity stripe.

## Buttons

- Primary: full-width blue rounded rectangle, 44-52dp height, bold white text.
- Secondary/outline: white or muted background, border, black text.
- Destructive: saturated red filled button.
- Icon buttons: circular or rounded-square icon-only targets in headers and cards.
- Disabled: primary blue becomes pale/low-opacity.

## Pills and Badges

- Alarm badges: compact rounded pills, red for `3rd Alarm`, blue for `All Hands`, small dark text for `2nd Alarm` style.
- Role badges: compact white/gray pill under profile name (`Supe`, `Chaser`).
- Status chips: `Offline`, counts, `0 signed`, unread badge with red circular count.
- Tabs: segmented pill bar with active blue rounded rectangle and inactive text-only tabs.

## Icons

Icon source is mixed: Phosphor, Heroicons, Lucide, and Radix/shadcn controls. Android should normalize to Material Symbols or custom vector assets but preserve icon meaning: droplet for incidents, heart favorites, route squiggle, bell notifications, users/chasers, chat bubble, profile/user, filter, sort, search, bookmark, hidden/muted.

## Map Styling

Maps use Google default styling with standard controls in expanded or detail contexts. Chasers map uses red pins. Incident expanded map includes Map/Satellite segmented controls, Traffic chip, Google default zoom/Street View controls, nearby resources, and a primary Get Directions button.

## Dialogs, Sheets, Modals

Bottom sheets have a dimmed backdrop, rounded top corners, centered drag handle, title, body content, and bottom action buttons. Sheets are used for filters, start conversation, profile details/moderation, signature update, and document signing.

## Empty, Loading, Error States

- Empty states use a large muted circular icon, bold title, and secondary explanatory text centered vertically.
- Loading states use skeleton blocks and rows, as visible in Notifications screenshot.
- Error states are usually toast-backed in source. Some screens show inline access-denied or response-required cards.

## Mobile Viewport Assumptions

The PWA is mobile-only. `apps/web/src/app/layout.tsx` hides the app at `md` and up. Native Android should target portrait phone layouts first and keep bottom navigation within a rounded floating container above system navigation.

## Material 3 Mapping Recommendations

- Use Compose `Scaffold` with custom top app bar and a custom floating bottom nav, not default NavigationBar if exact parity matters.
- Use `Card` with `RoundedCornerShape(16.dp)` and thin borders.
- Use `ModalBottomSheet` with custom drag handle and full-width action buttons.
- Use `LazyColumn` for incident/contact lists.
- Use `GoogleMap` Compose for maps, but wrap with PWA-style chips and cards.
- Preserve PWA colors over default dynamic color for first parity milestone.
