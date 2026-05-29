# Android Design System

Last updated: 2026-05-17

This is local AI context for the native Android app. It captures design direction for Android Studio/Gemini without creating implementation files.

## Source Evidence

- Existing Android UI spec: `docs/android-ui-spec/design-system.md`
- Home screen spec: `docs/android-ui-spec/screens/06-live-alerts-home.md`
- Detail screen spec: `docs/android-ui-spec/screens/08-incident-detail.md`
- Screenshots: `screenshots/Home1.jpg`, `screenshots/Home2.jpg`, `screenshots/Details.jpg`, `screenshots/Home-Filters.jpg`, `screenshots/Notifications.jpg`
- Web components: `apps/web/src/components/incidents/incident-card.tsx`, `apps/web/src/app/(dashboard)/incidents/incidents-client.tsx`, `apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx`

## Design Intent

The Android app is an emergency operations tool. It should be dark-first for field use, glanceable under stress, and optimized for quick triage. The current PWA evidence is mostly light UI with a strong blue app bar, rounded white cards, compact incident rows, and floating bottom navigation. Android should use that evidence for information hierarchy while adopting a dark-first operational theme.

## Color Tokens

Dark-first base:

- Background: `#000000` to `#050505`, with `#050505` as the preferred default app background token.
- Surface: `#121212` dark cards with `#151515` elevated surfaces and `#2A2A2A` subtle borders.
- Primary: emergency operations blue, matching the PWA's blue app bar and primary buttons.
- Text primary: `#FFFFFF`.
- Text secondary: `#B8B8B8`.
- Divider/border: low-contrast slate.
- Scrim: black with strong opacity for bottom sheets and dialogs.

Locked accent palette:

- Blue `#508FF8`
- Red `#D81800`
- Orange `#FF7000`
- Green `#00A858`
- Purple `#6840B8`
- Yellow `#F4B400`

Implementation rules:

- Android UI must use named semantic tokens from `core/designsystem/tokens/NFAColors.kt`.
- Do not hardcode `Color(0xFF...)` values in feature screens or reusable components.
- Action, navigation, and alert colors should resolve through semantic roles such as favorites, route, notifications, chasers, profile, and alert severity.

Severity palette:

- Critical alarm: red for `3rd_alarm`, `4th_alarm`, `5th_alarm`.
- High attention: orange/amber for warning, unsaved notes, or pending caution.
- Active/default: blue for `all_hands`, active tabs, primary actions, distance, and activity stripes.
- Success/assigned/responded: green for assigned jobs and successful response state.
- Muted/closed/disabled: gray with enough contrast to remain readable.

Light parity fallback:

- PWA primary blue approximates `#1a73e8` to `#2f6fe4`.
- PWA border approximates `#e5e7eb`.
- PWA muted fill approximates `#f4f5f7`.

## Typography Hierarchy

Use a modern readable sans such as Roboto or Google Sans. Favor weight and spacing over decorative style.

- Screen title: 22-24sp, bold.
- Section/card title: 18-22sp, bold.
- Incident row primary text: 15-17sp, semibold/bold, tight line height.
- Operational metadata: 11-13sp, medium/semibold.
- Button text: 15-17sp, bold.
- Notes/body copy: 14-16sp, regular/medium.

Rules:

- Dates, distances, alarm badges, and responder counts must scan faster than body copy.
- Do not shrink critical alert text below readable field size.
- Use uppercase sparingly; high contrast and weight are preferred.

## Card Density

Home incident cards are dense rows, not oversized social cards.

Home card must fit:

- Timestamp.
- Optional responder count.
- Distance when available.
- State/county/city/address/type.
- Short description.
- Optional alarm badge.
- Favorite/bookmark/mute/hide actions when shown.
- Left activity stripe based on `activityCount`.

Details uses larger stacked cards:

- Map/location card.
- Incident summary card.
- Respond/action card areas.
- Alerts/timeline card.
- Weather card if enabled.
- Notes card.

Density guidance:

- Home rows may use separators and a compact left activity indicator instead of boxed cards.
- Details cards may use more padding because the user has already selected an incident.
- Avoid large hero imagery on operational alert screens.

## Spacing System

Use an 8dp grid.

- Screen horizontal padding: 16dp.
- Compact Home row vertical padding: 8-12dp.
- Detail card gap: 12-16dp.
- Detail card inner padding: 16-24dp.
- Internal control gap: 8-12dp.
- Touch targets: minimum 48dp where feasible.
- Bottom nav reserve: 72-88dp plus system safe area.

## Material 3 Guidance

Use Compose Material 3 primitives but customize for operational parity.

- `Scaffold` for app shell.
- Custom top app bars for exact title/action hierarchy.
- `LazyColumn` for feeds and detail stacks.
- `Card` or `Surface` with rounded corners and thin borders.
- `ModalBottomSheet` for filters and secondary workflows.
- `AssistChip` or custom surfaces for alarm/status pills.
- Google Maps Compose for maps when implemented.
- Preserve product colors over dynamic color for the first parity milestone.

## Compose Theming Expectations

Android Studio should define theme tokens before screen work:

- Dark and light color schemes, with dark as the primary QA target.
- Incident severity colors as named tokens, not inline colors.
- Spacing constants based on the 8dp grid.
- Typography roles matching the hierarchy above.
- Shared shape tokens for rows, cards, pills, and bottom sheets.
- Icon mapping to Material Symbols or app vector assets.
- Dark mode must stay tokenized even while the app is temporarily forced to light mode in `MainActivity`; later toggles should flow through `NFATheme` instead of bypassing it.
- Optional rainbow accent borders/strokes must be opt-in design-system utilities, never automatic global card styling.

Do not rely on default Material colors for alarm severity. Emergency meaning must be explicit and consistent.

## Operational Readability Rules

- Make distance, alarm level, location, and timestamp the first scan path.
- Keep descriptions readable across two to three lines on Home, then defer the full narrative to Details.
- Show closed/muted/hidden states without reducing critical information below legibility.
- Prefer static, stable layouts over motion-heavy UI.
- Use skeletons for loading lists, matching the current Notifications visual evidence.
- Make listener/error/offline states visible and actionable.

## Evidence Gaps

The existing screenshots mostly show light mode. Dark-first behavior is an Android contract and should be validated with Android Studio previews and device screenshots before implementation is considered complete.
