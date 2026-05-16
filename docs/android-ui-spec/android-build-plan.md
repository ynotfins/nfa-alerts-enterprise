# Android Build Plan

## Recommended native architecture

Use Kotlin + Jetpack Compose + Firebase Android SDK.

- **UI**: Jetpack Compose, Material 3 primitives customized to match the PWA.
- **Navigation**: Navigation Compose with typed route objects.
- **State**: ViewModel per feature, Kotlin Flow/StateFlow for UI state.
- **Data**: Repository layer around Firebase Auth, Firestore, Storage, Messaging, Google Maps.
- **Dependency injection**: Hilt or lightweight manual DI for first milestone.
- **Maps**: Maps SDK for Android / Maps Compose.
- **Images/files**: Android Photo Picker, CameraX if camera capture is required.

## Navigation graph proposal

- Auth graph: Login, SignupCredentials, SignupProfilePhoto, SignupLegal, SignupSignature, Suspended, Banned.
- Main graph: Incidents, IncidentDetail, Homeowner, Docs, Sign, Favorites, Route, Notifications, Chat, ChatThread, Chasers, ChaserDetail, Profile, MyInformation, MyActivity, HelpSupport, TermsPrivacy.
- Admin graph: AdminUsers, AdminUserEdit, AdminLocations.
- Modal destinations: IncidentFilters, ChasersFilters, StartConversation, SigningDrawer, SignatureUpdate, ChatProfileModeration.

## Screen-by-screen implementation sequence

1. Static app shell: top bars, floating bottom nav, theme, shared cards/buttons/tabs.
2. Incident list static rows and filter sheet from screenshots.
3. Incident detail static cards, map placeholder, page tabs.
4. Favorites/Bookmarks/Responded/Notes empty and populated list states.
5. Chat contacts/thread static UI including audio bubble.
6. Chasers list/map/filter/detail static UI.
7. Profile/info/activity/help/legal static UI.
8. Auth/signup static UI.
9. Admin users/locations source-backed UI after screenshots are captured.
10. Firebase wiring by feature.

## Jetpack Compose component mapping

| PWA component | Compose equivalent |
| --- | --- |
| `Header` | Custom `TopAppBar` wrapper with blue background |
| `Shell` bottom nav | Custom rounded `Surface` + `NavigationBarItem`-like rows |
| `Card` | `Card`/`Surface` with rounded 16dp and border |
| `PageTabs` | Custom segmented tabs with active blue pill |
| `Drawer` / sheets | `ModalBottomSheet` |
| `IncidentCard` | Custom `IncidentRow` composable |
| `ChaserSelector` | `ExposedDropdownMenuBox` or custom selector row |
| `SignatureCanvas` | Custom canvas composable capturing bitmap paths |
| Google map | Maps Compose `GoogleMap` |
| Skeletons | Accompanist placeholder or custom shimmer surfaces |

## Firebase Android SDK mapping

| Web source | Android SDK |
| --- | --- |
| Firebase Auth | `FirebaseAuth` |
| Firestore `onSnapshot` | `addSnapshotListener` converted to Flow |
| Firestore writes | `FirebaseFirestore` document/collection APIs |
| Storage uploads | `FirebaseStorage` `putBytes` / `putFile` |
| FCM token | `FirebaseMessaging.getToken()` |
| FCM background | `FirebaseMessagingService` |
| App notifications | Firestore `appNotifications` + Android notification channel |

## State management proposal

- `AuthViewModel`: auth state, profile state, role, completion state.
- `IncidentsViewModel`: incident list listener, search/filter/sort state, user flags.
- `IncidentDetailViewModel`: incident doc listener, notes/activities/weather, actions.
- `ChatViewModel`: thread listeners, messages, send/voice/upload state.
- `ProfileViewModel`: profile preferences, signature, sign out.
- `ChasersViewModel`: chaser list/map/filter state.
- `AdminViewModel`: admin users/locations.

## Offline/cache considerations

The PWA has Firestore persistent local cache, but the custom service worker does not populate Cache API entries. Native Android should rely on Firestore offline persistence for data and explicitly design offline UI for maps, uploads, and chat sends. Storage uploads should queue or fail clearly.

## UI parity checklist

- Blue top app bars and title sizing match screenshots.
- Floating rounded bottom nav with role-specific items.
- Dense incident rows with distance, timestamp, alarm badge, action icons.
- Segmented page tabs above bottom nav.
- Rounded bottom sheets with drag handle and full-width actions.
- Empty states with large muted circular icon, title, helper text.
- Signature canvas and document grid match PWA spacing.
- Chat bubbles, audio bubbles, and composer match screenshots.
- Map overlays/chips preserve PWA visual language.

## First milestone: static UI shell

Deliver all routes with static/sample data, correct navigation graph, role-switched bottom nav, and screenshot-matched components. No Firebase writes.

## Second milestone: Firebase Auth + live alerts

Wire Firebase Auth, profile listener, incident list listener, incident detail listener, user flags, and notification count. Add auth-completion routing.

## Third milestone: chat/location/respond flows

Wire respond flow, documents/signatures, chat messages/voice uploads, FCM token/notifications, geolocation/location tracking, and Chaser/Supe moderation workflows.

## Required pre-wiring decisions

- Fix or consciously replicate current responder rules mismatch.
- Decide whether Supe Responded tab should be all-responded or current-user scoped.
- Replace unauthenticated notification endpoint with native-safe server flow.
- Decide whether admin features ship in first Android release.
