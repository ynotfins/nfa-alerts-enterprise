# Android UI Rules

Last updated: 2026-05-17

This is local AI context for the native Android app. These rules guide future screen implementation only; do not create Kotlin or Gradle files from this document.

## Source Evidence

- Home evidence: `screenshots/Home1.jpg`, `screenshots/Home2.jpg`, `docs/android-ui-spec/screens/06-live-alerts-home.md`
- Filter evidence: `screenshots/Home-Filters.jpg`, `docs/android-ui-spec/screens/07-home-filters.md`
- Detail evidence: `screenshots/Details.jpg`, `docs/android-ui-spec/screens/08-incident-detail.md`
- Source components: `apps/web/src/components/incidents/incident-card.tsx`, `apps/web/src/app/(dashboard)/incidents/incidents-client.tsx`, `apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx`

## Primary Rule

Operational hierarchy comes first. The app exists to help users identify, locate, respond to, and track emergency incidents quickly.

## No Oversized Cards

Home cards must stay compact.

Do:

- Use dense rows for the Home feed.
- Keep the alert summary scannable in one compact block.
- Use badges, activity stripes, and metadata to compress meaning.
- Open full details only after the user taps an incident.

Do not:

- Turn each Home alert into a large social card.
- Add big thumbnails, decorative hero sections, or excessive vertical padding.
- Repeat the entire Details timeline on Home.
- Let action icons consume more attention than the alert.

## One-Handed Usability

Android must support fast one-handed phone use:

- Primary actions should be reachable near the lower half when possible.
- Detail primary action, such as Respond, should be full-width and easy to hit.
- Top bar actions should remain simple: filter, sort, search, back.
- Bottom navigation must stay reachable and visually separate from content.
- Filters should use a sheet or full-screen sheet with large controls and a close affordance.

## Fast Scanning

Home scan order:

1. Alarm/severity.
2. Timestamp.
3. Distance.
4. Location.
5. Incident type.
6. Description.
7. Responder/update count.
8. User flags.

Details scan order:

1. Map/location.
2. Incident summary.
3. Response status/action.
4. Alerts timeline.
5. Notes and supporting context.

Rules:

- Distance should be visually distinct when available.
- Alarm badge must be visible without opening details.
- Activity/update count must be represented without overwhelming text.
- Use consistent field order for every incident row.

## Restrained Animation

Allowed:

- Short touch feedback.
- Bottom sheet transitions.
- Pull-to-refresh indicator.
- Swipe affordance on incident rows.
- Skeleton loading shimmer or static skeletons.

Avoid:

- Bounce-heavy motion.
- Decorative animations.
- Auto-playing transitions.
- Reordering animations that make the feed feel unstable during active incidents.

## No Social-Media Styling

Do not use:

- Large engagement-style cards.
- Like-count emphasis.
- Comment-feed visual language.
- Decorative gradients behind alerts.
- Oversized avatars in incident feed rows.

Favorites/bookmarks/mute/hide are operational personal flags, not social engagement.

## Critical Alert Visibility

Critical alert requirements:

- `3rd_alarm`, `4th_alarm`, and `5th_alarm` must have high-contrast critical styling.
- Alarm badge remains visible in Home and Details.
- Active incidents remain visually stronger than closed incidents.
- Closed incidents must not look active in the default feed.
- Muted/hidden flags must not hide severity from screens where the incident is intentionally shown.
- Listener/offline errors must not silently leave users with stale critical data.

## Feed Stability

- A new incident may appear at the top.
- A timeline update should update the existing card in place under default `createdAt desc` sorting.
- Do not reorder the list by `updatedAt` unless product explicitly changes the sort contract.
- Maintain scroll position when Firestore updates existing visible rows.

## Details Rules

- Details may use larger cards because the user selected the incident.
- The Alerts card must show the original alert and appended updates.
- Notes are operational annotations and should not be styled like a chat thread.
- Supe/admin controls must be clearly separated from responder controls.
- Weather is supporting context, not the main alert.

## Empty, Loading, Error

- Loading: use skeleton rows/cards.
- Empty Home: state clearly that there are no active/matching incidents.
- Listener errors: show a retry-capable error state.
- Offline: show cached data with a visible stale/offline indicator when available.

## Roadmap Labels

If a behavior is not currently implemented in the web app but is required for Android, label it in implementation docs as "Android contract" or "roadmap item." Examples include real-time notes/activities listeners and richer offline-first states.
