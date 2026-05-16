# Component Inventory

## Layout components

| Component | Source | Appears in | Props/state inferred | Android equivalent |
| --- | --- | --- | --- | --- |
| `Header` | `apps/web/src/components/layout/header.tsx` | Most screens | `title`, optional `back`, `actions`, children | Custom TopAppBar |
| `PageContent` | `apps/web/src/components/layout/page-content.tsx` | Dashboard screens | scroll content padding/className | Scaffold content container |
| `PageTabs` / `PageTab` | `apps/web/src/components/layout/page-tabs.tsx` | Favorites, incident tabs, chat tabs | active tab, click callback | Custom segmented tab row |
| `Shell` | `apps/web/src/components/layout/shell.tsx` | Dashboard root | profile role, unread counts, nav items | Scaffold + custom floating bottom nav |
| `FloatingContainer` | `apps/web/src/components/layout/floating-container.tsx` | Chat thread | fixed bottom composer region | Bottom aligned Surface |

## Incident components

| Component | Source | Appears in | Props/state inferred | Android equivalent |
| --- | --- | --- | --- | --- |
| `IncidentCard` | `apps/web/src/components/incidents/incident-card.tsx` | Incidents, Favorites, Responded, Notes | incident, icon, userRole, showActions, userLocation, flags | `IncidentRow` composable |
| `IncidentFiltersDrawer` | `apps/web/src/components/incidents/filters-drawer.tsx` | Incident list | filter state setters, available departments | Modal filter sheet |
| Incident skeletons | `apps/web/src/components/incidents/incident-detail-skeleton.tsx`, `incident-list-skeleton.tsx` | Loading states | none | Shimmer placeholders |

## Chat components

| Component | Source | Appears in | Props/state inferred | Android equivalent |
| --- | --- | --- | --- | --- |
| `ContactCard` | `apps/web/src/components/chat/contact-card.tsx` | Chat contact/search surfaces | profile/contact props | Contact row/card |
| `ChaserSearchDrawer` | `apps/web/src/components/chat/chaser-search-drawer.tsx` | Chat contacts | search, list, select chaser | Start conversation sheet |
| `TypingIndicator` | `apps/web/src/components/chat/typing-indicator.tsx` | Chat thread | typing state | Animated typing dots |
| Voice player block | inline in `chat-thread-client.tsx` | Chat thread | storagePath, duration, isOwnMessage | Audio message bubble |

## Profile/user components

| Component | Source | Appears in | Props/state inferred | Android equivalent |
| --- | --- | --- | --- | --- |
| `ChaserSelector` | `apps/web/src/components/chaser-selector.tsx` | Docs/sign review | responders, selectedId, onSelect | Dropdown selector row |
| `PWAInstallPrompt` | `apps/web/src/components/pwa-install-prompt.tsx` | Login/Shell | install state, platform detection | Not needed for native; maybe migration banner omitted |
| `PermissionsPrompt` | `apps/web/src/components/permissions-prompt.tsx` | Dashboard layout | required permission states | Native permission education screen/sheet |
| `WalkthroughProvider` / `AppWalkthrough` | `apps/web/src/components/walkthrough-provider.tsx`, `app-walkthrough.tsx` | Dashboard | tour completion state | Optional onboarding coach marks |
| `Presence` | `apps/web/src/components/presence.tsx` | Dashboard layout | auth/profile state | Background location/presence worker |

## UI primitives

Source: `apps/web/src/components/ui/*`, shadcn/Radix style.

| Primitive | Android equivalent | Visual notes |
| --- | --- | --- |
| Button | `Button` / custom `Surface` clickable | Rounded, full-width, strong blue or red destructive |
| Card | `Card` / `Surface` | White rounded 12-18dp, subtle border/shadow |
| Drawer | `ModalBottomSheet` | Drag handle, rounded top corners, dimmed backdrop |
| Tabs | Custom segmented controls | Active blue pill, inactive text |
| Input/Textarea | `OutlinedTextField` | Rounded, light border, placeholder gray |
| Badge | `AssistChip` / custom Surface | Compact pill, role/status/alarm colors |
| Avatar | `AsyncImage` clipped CircleShape | Fallback initials in pale blue circle |
| Skeleton | Placeholder/shimmer | Light gray rounded blocks |
| Switch | `Switch` with custom orange active color | Screenshot uses orange active toggles |

## Visual notes from screenshots

- Bottom nav is the signature component: rounded floating container, icon + label, role-specific items, red badge for unread chat.
- Incident rows are information-dense and must preserve hierarchy: timestamp first, distance blue, location/type/body black, badges inline.
- Sheets use large readable titles and generous vertical spacing.
- Empty states are consistent across Favorites/Bookmarks/Notes/Activity.

## Props/state to preserve in Android

- `profile.role` drives nav and role-specific actions.
- `incident.responderIds` controls responded/access state.
- `userIncidents` flags control favorite/bookmark/hide/mute/view icons.
- `thread.unreadCount[currentUid]` drives chat badges.
- `appNotifications.read` drives notification badge/count.
- `profile.locationTracking` and `geofencingEnabled` drive location UI.
