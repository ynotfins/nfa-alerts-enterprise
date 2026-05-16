# App Map

## Current Application Shape

NFA Alerts is a mobile-only Next.js App Router PWA. The root layout blocks desktop widths with a "Mobile Only" message and renders the app inside `AuthProvider` on mobile widths. Dashboard routes are protected by `Protected` and wrapped by the shared `Shell` bottom navigation.

## Public Routes

| Route | Source | Screen doc | Evidence |
| --- | --- | --- | --- |
| `/` | `apps/web/src/app/page.tsx` | Covered in `36-system-states.md` | Source-backed redirect to `/incidents` |
| `/login` | `apps/web/src/app/(auth)/login/page.tsx` | `01-login.md` | Source-backed, no screenshot |
| `/signup` | `apps/web/src/app/(auth)/signup/page.tsx` | `02-signup-credentials.md` | Source-backed, no screenshot |
| `/signup/profile` | `apps/web/src/app/(auth)/signup/profile/page.tsx` | `03-signup-profile-photo.md` | Source-backed, no screenshot |
| `/signup/legal` | `apps/web/src/app/(auth)/signup/legal/page.tsx` | `04-signup-legal.md` | Source-backed, no screenshot |
| `/signup/signature` | `apps/web/src/app/(auth)/signup/signature/page.tsx` | `05-signup-signature.md` | Source-backed, no screenshot |
| `/banned` | `apps/web/src/app/(auth)/banned/page.tsx` | `36-system-states.md` | Source-backed, no screenshot |
| `/suspended` | `apps/web/src/app/(auth)/suspended/page.tsx` | `36-system-states.md` | Source-backed, no screenshot |
| `/logout` | `apps/web/src/app/logout/page.tsx` | `36-system-states.md` | Source-backed |

## Protected Dashboard Routes

| Route | Source | Screen doc | Role visibility | Screenshot coverage |
| --- | --- | --- | --- | --- |
| `/incidents` | `apps/web/src/app/(dashboard)/incidents/page.tsx`, `incidents-client.tsx` | `06-live-alerts-home.md`, `07-home-filters.md` | Both | `Home1`, `Home2`, `Home-Filters` |
| `/incidents/[id]` | `incident-detail-client.tsx` | `08-incident-detail.md`, `09-expanded-map-directions.md` | Both, with role actions | `Details`, `Details-Expand-Map` |
| `/incidents/[id]/homeowner` | `homeowner-client.tsx` | `10-homeowner-info.md` | Both, review workflow differs | `Details-Homeowner` |
| `/incidents/[id]/docs` | `docs-client.tsx` | `11-documents-and-photos.md` | Responders + Supe/Admin | `Details-Docs` |
| `/incidents/[id]/sign` | `sign-client.tsx` | `12-e-signature-documents.md`, `13-signing-drawer.md` | Responders + Supe/Admin | `Details-Sign`, `Details-Esignature-Docs`, `Details-Docs-Selected-Doc-Sign`, `Details-Sign-Signed`, `Details-Respond-Docs` |
| `/favorites` | `favorites-client.tsx` | `14-favorites.md`, `15-bookmarks.md`, `16-responded.md`, `17-notes.md` | Both | `Favorites`, `Bookmarks`, `Responded`, `Notes` |
| `/route` | `route-client.tsx` | `18-route-planner.md` | Both | `Route` |
| `/notifications` | `notifications-client.tsx` | `19-notifications.md` | Both | `Notifications` loading state |
| `/chat` | `chat-client.tsx` | `20-chat-contacts.md`, `21-start-conversation.md` | Both, role tabs differ | `Chat`, `Chat-Contacts` |
| `/chat/[threadId]` | `chat-thread-client.tsx` | `22-chat-thread.md`, `23-chat-profile-moderation-sheet.md` | Both, moderation for supe/admin | `Chat-`, `Chat-audio-message`, `Chaser-profile` |
| `/chasers` | `chasers-client.tsx` | `24-chasers-list.md`, `25-chasers-map.md`, `26-chasers-filters.md` | Supe/Admin | `Chasers`, `Chasers-Geo`, `Chasers-Filters` |
| `/chasers/[chaserId]` | `chaser-detail-client.tsx` | `27-chaser-detail.md` | Supe/Admin | `Chaser-details`, `Chaser-Details2` |
| `/profile` | `profile-client.tsx` | `28-profile.md` | Both | `Supe-Profile` |
| `/profile/information` | `profile/information/page.tsx` | `29-my-information.md` | Both | `Supe-My-Info` |
| `/profile/activity` | `profile/activity/page.tsx` | `30-my-activity.md` | Both, chaser performance block source-only | `Supe-Profile-My-Activity` |
| `/help-support` | `help-support/page.tsx` | `31-help-support.md` | Both | `Supe-Helpsupport` |
| `/terms-privacy` | `terms-privacy/page.tsx` | `32-legal-privacy.md` | Both | `Supe-Legal`, `Supe-Privacy-Policy` |
| `/admin/users` | `admin-users-client.tsx` | `33-admin-users.md` | Admin | No screenshot |
| `/admin/users/[id]` | `admin-user-edit-client.tsx` | `34-admin-user-edit.md` | Admin | No screenshot |
| `/admin/locations` | `admin-locations-client.tsx` | `35-live-locations-admin.md` | Admin | No screenshot |
| `/dev-tools`, errors, not found | app files | `36-system-states.md` | Protected/system | No screenshot |

## Bottom Navigation / Shell Layout

Source: `apps/web/src/components/layout/shell.tsx`.

Base nav items are Incidents, Favorites, Route, Notifications, Chat, Profile. Supe/Admin adds Chasers. Admin inserts Users and Locations. Chat detail pages hide the bottom bar. `/chat`, `/favorites`, and `/incidents/[id]` routes can show secondary page tabs above the bottom nav.

## Major User Flows

1. **Auth onboarding**: login/signup -> profile photo -> legal -> signature -> incidents.
2. **Alert response**: incident list -> incident detail -> respond -> docs/sign/homeowner tabs -> route planner.
3. **Supervisor monitoring**: incidents -> chasers list/map -> chaser detail -> moderation or assignment context.
4. **Chat**: contacts -> start conversation sheet -> thread -> text/audio messages -> optional profile/moderation drawer.
5. **Profile/preferences**: profile -> notification/location/geofence toggles -> my information/activity/help/legal.
6. **Admin management**: admin users -> user edit -> suspend/ban/role/location tracking; admin locations -> live map.

## Firebase Collections By Area

| Area | Collections / paths |
| --- | --- |
| Auth/profile | `profiles`, `profiles/{uid}/activities`, `profiles/{uid}/locations`, `bannedDevices` |
| Incidents | `incidents`, `incidents/{id}/notes`, `incidents/{id}/activities`, `counters`, `webhookLogs` |
| Documents/signing | `incidents/{id}/chaserSubmissions/{uid}/documents`, `signedDocuments`, Firebase Storage incident paths |
| Favorites/tabs | `userIncidents`, `incidents`, collection group `notes` |
| Chat | `threads`, `threads/{id}/messages`, `profiles`, `appNotifications` |
| Notifications | `appNotifications`, `profiles.pushToken`, FCM |
| Chasers/admin | `profiles`, profile location fields, moderation fields |

## Screenshot Coverage Mapping

All 34 screenshots are Supe-app screenshots. Chaser UI parity is source-confirmed only where routes/components are shared. Chaser-only missing screenshots are listed in `verification-report.md`.
