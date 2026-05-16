# Screen Index

| # | Screen | Route / state | Role | Screenshot ids | Source files | Data sources | Realtime | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Login | `/login` | Public | Needs screenshot | `apps/web/src/app/(auth)/login/page.tsx` | Firebase Auth, `profiles` | Auth listener | P1 |
| 02 | Signup credentials | `/signup` | Public | Needs screenshot | `apps/web/src/app/(auth)/signup/page.tsx` | Firebase Auth, `profiles` | Auth listener | P2 |
| 03 | Signup profile photo | `/signup/profile` | apps/web/public/incomplete | Needs screenshot | `signup/profile/page.tsx`, `storage.ts` | Storage `profiles/{uid}/avatar.jpg`, `profiles` | Auth/profile listener | P2 |
| 04 | Signup legal | `/signup/legal` | apps/web/public/incomplete | Needs screenshot | `signup/legal/page.tsx` | `profiles.legal`, emergency contact | Auth/profile listener | P2 |
| 05 | Signup signature | `/signup/signature` | apps/web/public/incomplete | Needs screenshot | `signup/signature/page.tsx`, `storage.ts` | Storage signature, `profiles.signatureUrl` | Auth/profile listener | P2 |
| 06 | Live alerts home | `/incidents` | Both | `Home1`, `Home2` | `incidents-client.tsx`, `IncidentCard` | `incidents`, `userIncidents`, profile location | `subscribeToIncidents` | P1 |
| 07 | Home filters | Incident filter sheet | Both | `Home-Filters` | `filters-drawer.tsx` | Local filter state, incident fields | Parent incidents listener | P1 |
| 08 | Incident detail | `/incidents/[id]` | Both | `Details` | `incident-detail-client.tsx` | `incidents`, notes, activities, weather API | `subscribeToIncident` | P1 |
| 09 | Expanded map directions | Incident detail map sheet | Both | `Details-Expand-Map` | `incident-detail-client.tsx`, Google map components | Incident location, browser location | Incident listener | P1 |
| 10 | Homeowner info | `/incidents/[id]/homeowner` | Both | `Details-Homeowner` | `homeowner-client.tsx`, change request actions | `incidents.homeowner`, `changeRequests` | Incident + change requests | P2 |
| 11 | Documents and photos | `/incidents/[id]/docs` | Both after access | `Details-Docs` | `docs-client.tsx`, `storage.ts` | Storage docs, chaser submissions | Fetch-on-load, incident listener | P2 |
| 12 | E-signature docs | `/incidents/[id]/sign` | Both after access | `Details-Sign`, `Details-Esignature-Docs`, `Details-Sign-Signed` | `sign-client.tsx`, `pdf-generator.ts` | signed docs, profile signature | Fetch-on-load, incident listener | P2 |
| 13 | Signing drawer | Sign bottom sheet | Both after access | `Details-Docs-Selected-Doc-Sign`, `Details-Respond-Docs` | `sign-client.tsx` | signatures, verification proof | Write on submit | P2 |
| 14 | Favorites | `/favorites` tab favorite | Both | `Favorites` | `favorites-client.tsx` | `userIncidents`, `incidents` | Fetch-on-load | P1 |
| 15 | Bookmarks | `/favorites` tab bookmarks | Both | `Bookmarks` | `favorites-client.tsx` | `userIncidents`, `incidents` | Fetch-on-load | P1 |
| 16 | Responded | `/favorites` tab responded | Both | `Responded` | `favorites-client.tsx`, `incidents.ts` | `incidents.responderIds` | Fetch-on-load | P1 |
| 17 | Notes | `/favorites` tab notes | Both | `Notes` | `favorites-client.tsx` | collection group `notes`, `incidents` | Fetch-on-load | P2 |
| 18 | Route planner | `/route` | Both | `Route` | `route-client.tsx` | responded incidents, geolocation | Fetch-on-load | P2 |
| 19 | Notifications | `/notifications` | Both | `Notifications` loading | `notifications-client.tsx`, `use-notifications.ts` | `appNotifications` | `subscribeToNotifications` | P2 |
| 20 | Chat contacts | `/chat` | Both | `Chat` | `chat-client.tsx`, `use-chat.ts` | `threads`, `profiles` | thread listeners | P1 |
| 21 | Start conversation | Chat contact sheet | Both | `Chat-Contacts` | `ChaserSearchDrawer`, chat services | `profiles`, `threads` | Fetch-on-load | P2 |
| 22 | Chat thread | `/chat/[threadId]` | Both | `Chat-`, `Chat-audio-message` | `chat-thread-client.tsx`, `storage.ts` | `threads/{id}/messages`, Storage voice | `subscribeToMessages` | P1 |
| 23 | Chat profile/moderation sheet | Chat thread sheet | Supe/Admin actions | `Chaser-profile` | `chat-thread-client.tsx`, `moderation.ts` | `profiles`, `bannedDevices` | Thread/profile fetch | P3 |
| 24 | Chasers list | `/chasers` | Supe/Admin | `Chasers` | `chasers-client.tsx`, `use-profiles.ts` | `profiles` | Fetch-on-load | P2 |
| 25 | Chasers map | `/chasers` map mode | Supe/Admin | `Chasers-Geo` | `chasers-client.tsx`, Google map | `profiles.locationTracking` | Fetch-on-load | P2 |
| 26 | Chasers filters | Chasers filter sheet | Supe/Admin | `Chasers-Filters` | `chasers-client.tsx` | local filter state, profile stats/location | Parent profiles fetch | P2 |
| 27 | Chaser detail | `/chasers/[chaserId]` | Supe/Admin | `Chaser-details`, `Chaser-Details2` | `chaser-detail-client.tsx` | `profiles`, location fields | profile subscription/fetch | P2 |
| 28 | Profile | `/profile` | Both | `Supe-Profile` | `profile-client.tsx` | `profiles`, Storage signature, FCM | Current profile listener | P1 |
| 29 | My information | `/profile/information` | Both | `Supe-My-Info` | `profile/information/page.tsx` | `profiles` | Current profile listener | P2 |
| 30 | My activity | `/profile/activity` | Both | `Supe-Profile-My-Activity` | `profile/activity/page.tsx`, `profiles.ts` | `profiles.stats`, `profiles/{uid}/activities` | Fetch-on-load | P2 |
| 31 | Help & support | `/help-support` | Both | `Supe-Helpsupport` | `help-support/page.tsx` | Static content | None | P3 |
| 32 | Legal / privacy | `/terms-privacy` | Both | `Supe-Legal`, `Supe-Privacy-Policy` | `terms-privacy/page.tsx` | Static content | None | P3 |
| 33 | Admin users | `/admin/users` | Admin | Needs screenshot | `admin-users-client.tsx` | `profiles` | Fetch-on-load | P3 |
| 34 | Admin user edit | `/admin/users/[id]` | Admin | Needs screenshot | `admin-user-edit-client.tsx` | `profiles`, moderation fields | profile subscription/fetch | P3 |
| 35 | Live locations admin | `/admin/locations` | Admin | Needs screenshot | `admin-locations-client.tsx` | `profiles.locationTracking` | Fetch-on-load | P3 |
| 36 | System states | `/banned`, `/suspended`, `/logout`, errors | Mixed | Needs screenshot | app route/error/not-found files | Auth/profile state | Auth listener | P3 |
