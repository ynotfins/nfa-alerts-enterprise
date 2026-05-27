# NFA Alerts Enterprise Context Block

Last updated: 2026-05-26

## 1. Project Identity

NFA Alerts is an enterprise rebuild of a commercial emergency-response coordination product. The rebuild is the source-of-truth repository and will eventually replace the live reference version after the native clients, backend contracts, security rules, and commercial controls are production-ready.

- Repo path: `D:\github\nfa-alerts-enterprise`
- GitHub repo: `ynotfins/nfa-alerts-enterprise`
- Current branch: `feature/android-infrastructure-wiring`
- Live reference project: `nfa-alerts-v2`
- Firebase project currently used: `nfa-alerts-v2`
- Android package/application ID: `com.emergency.alerts`
- Web/PWA app: `apps/web`
- Native Android app: `apps/android`
- Firebase config/rules/indexes: `firebase/`
- Root package manager: pnpm workspace, with root scripts forwarding to the `web` workspace

`nfa-alerts-v2` is a live reference only. Do not modify or push from it unless explicitly authorized.

## 2. Tool Ownership

- Android Studio/Copilot owns Android implementation, Gradle sync, Android dependency fixes, emulator/device runs, Compose previews, Logcat, and Android build validation under `apps/android`.
- Cursor owns repo orchestration, GitHub sync when explicitly requested, cross-repo audits, context docs, backend/docs coordination, safety guardrails, and restore-point commits.
- Gemini/Copilot inside Android Studio may implement Android code after reading the source-cited context docs.
- The live reference project `nfa-alerts-v2` is read-only reference unless the operator explicitly authorizes otherwise.
- Firebase deploy requires explicit approval. Do not run `firebase deploy` or mutate production Firebase data from this repo without that approval.

## 3. Non-Negotiable Architecture Rules

- Android consumes normalized Firestore documents only.
- Android must not parse raw alert text.
- Android must not call `POST /api/webhook`.
- Android must not call backend admin routes such as `/api/admin/backfill-counts`, `/api/admin/cleanup-promo-codes`, or `/api/admin/merge-duplicates`.
- Backend owns raw alert ingestion, parsing, normalization, dedupe, geocoding, CRM/ERP creation when implemented, and alert aggregation.
- Backend owns `commercialDisplayId` generation and parser/category truth.
- Android calculates distance locally from current device location and Firestore `incident.location.lat/lng`.
- Android must not geocode on device.
- `google-services.json` stays local/ignored and must not be committed.
- `local.properties`, `.env*`, service accounts, keystores, APKs, build outputs, generated caches, screenshots, and secret-bearing logs must not be committed.
- No production Firebase data mutation without explicit approval.
- No Firebase deploy without explicit approval.
- No force push and no merge to `main` from this checkpoint task.

## 4. Current Android State

The native Android project is a Kotlin, Jetpack Compose, Material 3, Hilt, Flow/StateFlow, Firebase Auth, Firestore, FCM, Maps SDK, and Play Services Location app under `apps/android`.

Current app flow:

- `apps/android/app/src/main/java/com/emergency/alerts/MainActivity.kt` initializes `NFAAlertsTheme`, observes `SessionViewModel`, shows `LoginScreen` for unauthenticated users, profile/restriction panels for missing/restricted profiles, and `HomeFeedScreen` for authenticated users.
- `apps/android/app/src/main/java/com/emergency/alerts/feature/auth/SessionViewModel.kt` maps `AuthRepository.observeSession()` into `Loading`, `Unauthenticated`, `MissingProfile`, `Restricted`, `Authenticated`, and `Error` UI states.
- `apps/android/app/src/main/java/com/emergency/alerts/data/repository/FirebaseAuthRepositoryImpl.kt` listens to Firebase Auth, then `profiles/{uid}`. It treats missing docs as `MissingProfile`, active bans/suspensions as restricted, incomplete profiles as restricted, and complete profiles as authenticated.
- `apps/android/app/src/main/java/com/emergency/alerts/feature/auth/LoginViewModel.kt` signs in with Firebase email/password. `LoginScreen.kt` renders a basic Material login form.
- Profile bootstrap is wired through Firebase Auth plus the `profiles/{uid}` listener. Full native registration/profile creation remains outside the current Home checkpoint.

Current Home feed:

- `HomeFeedViewModel.kt` combines `ObserveHomeFeedUseCase` and `HomeFeedPreferencesRepository`.
- `ObserveHomeFeedUseCase.kt` observes Firestore incidents, current auth/profile flags, device location, and local read state. It groups by `alertId` when present, falls back to Firestore document ID, calculates distance locally, tracks unread state by `readStateKey`, and sorts by `latestUpdateTimestamp` with `createdAt` fallback.
- `FirestoreIncidentRepository.kt` reads `incidents` and legacy `userIncidents`. Home incident query is still `status == active` plus `orderBy("createdAt", DESCENDING)` and `limit(50)`, then the use case performs latest-update sorting in memory.
- `DataStoreHomeFeedPreferencesRepository.kt` persists local favorite, bookmark, silent, hidden, filters, and High Alert config state.
- `DataStoreHomeFeedReadStateRepository.kt` persists local `lastSeenByAlertKey`.
- Firestore `userIncidents` remains the legacy server-side flag collection. Android currently overlays local DataStore state and does not yet write the new recommended profile subcollections.

Current design system:

- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/` contains tokens, theme, top bar, bottom nav, incident card, map preview, distance label, icon button, severity badge, and loading/empty/error states.
- `NFAColors.kt` defines locked palette tokens: Purple `#6840B8`, Red `#D81800`, Orange `#FF7000`, Green `#00A858`, and Blue `#508FF8`.
- `NFATheme.kt` exposes `NFAAlertsTheme`, token locals, light/dark mode support, and theme presets. `MainActivity.kt` currently forces `NFAThemePreset.Light` and `NFAThemeMode.Light`.
- `NFAIncidentCard.kt` uses rounded Material surfaces, subtle borders/elevation, compact metadata/body layout, a blue update stripe, inline card body text, distance label, and action icons.
- `NFABottomNavBar.kt` defines role-aware destinations for Incidents, Favorites, Route, Notifications, Chasers, Chat, and Profile. Current known icon issue: Chasers and Profile both use `Icons.Default.Person`; Chasers should become a group/two-person icon while Profile remains single-person.

Known visual status:

- Home feed is live Firestore-backed.
- Auth/session/login flow and profile bootstrap are wired.
- Compose design system exists.
- Material 3 color tokens were recently refined.
- Home cards are visually close to the desired direction.
- Remaining Home cleanup: move action icons to the top row in the desired placement, put compact blue distance immediately after timestamp, correct bottom-nav Profile/Chasers icons, and keep action icons without visible circular discs.

## 5. Current Home Behavior

Current Home contract:

- One visible card per `alertId` or `readStateKey`.
- If `alertId` is blank, use Firestore document ID.
- Newest update should be top. Current Android use case sorts by `updatedAt` fallback `createdAt`; repository query remains `createdAt desc limit 50`.
- Inline body order is: State, County, City, Address, normalized alert type/headline, Alert message, Department codes, `#AlertId`.
- `HomeFeedCardFormatter.kt` builds the inline body from normalized Firestore fields only.
- Visible alert type/category no longer derives from description.
- Date/time is compact through `NFAIncidentCard.kt`; current formatter is `MM/dd/yy hh:mm a`.
- Distance should sit immediately after timestamp as blue compact text like `12m`. Current component still accepts miles and reserves width through `NFADistanceLabel`.
- Action icons should be in the top row between distance/time and the remaining right area.
- Favorite should be red, bookmark orange/yellow, silent orange, hide/eye blue.
- Visible circular discs around action icons should stay removed.
- `BNNDESK` must be hidden, while valid department codes after it must be preserved.
- Emojis are additive only and must never replace words.
- Emoji/category hints must come from normalized fields unless backend later adds a normalized category field.

Current files:

- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedCardFormatter.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedScreen.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedViewModel.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedFiltering.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/components/NFAIncidentCard.kt`

## 6. Current Design Direction

Target visual direction:

- Google Developer / Google Cloud / Firebase mobile web style.
- Clean, premium, friendly, Material 3.
- Apple-like polish: whitespace, rounded cards, subtle shadows, disciplined hierarchy.
- Operational but not harsh; premium mobile app polish over default template UI.
- Dark mode later should follow a Google Developer dark card style.

Locked palette:

- Purple `#6840B8`
- Red `#D81800`
- Orange `#FF7000`
- Green `#00A858`
- Blue `#508FF8`

Rules:

- All app colors must live in design tokens.
- Do not scatter raw colors through feature UI.
- Use `NFATheme.colors`, `NFATheme.spacing`, `NFATheme.shapes`, `NFATheme.elevation`, and Material theme roles.
- If a new semantic color is needed, add it to the token layer first.

## 7. Android Role Direction

Current roles are `chaser`, `supe`, and `admin`, stored on `profiles/{uid}.role` and mapped in Android through `NFAUserRole`.

Direction:

- Supe/Admin version: supervisor/admin operational Home first, eventually full chaser location oversight, assignments, closure/reopen controls, and management workflows.
- Chaser version: chaser profile, assigned/route-focused workflows, response actions, documents/signatures, notes, and route planning.
- Profile bottom-nav icon should be single-person.
- Chasers bottom-nav icon should be group/two-person.
- Supes can eventually see all chasers' locations, subject to rules, privacy, and location tracking consent.
- Tenant-scoped membership roles are needed before commercial rollout; `profiles/{uid}.role` remains current compatibility state only.

## 8. Backend/Parser State

Backend parser source files:

- `apps/web/src/app/api/webhook/route.ts`
- `apps/web/src/lib/webhook/parser.ts`
- `apps/web/src/lib/webhook/normalization.ts`
- `apps/web/src/lib/webhook/geocoder.ts`
- `apps/web/tests/webhook-parser.test.ts`

Current behavior:

- Webhook route receives JSON and extracts only supported raw message fields: `message`, `rawMessage`, or `text`.
- Webhook route no longer sends `JSON.stringify(body)` to `parseNotification`.
- Parser uses OpenAI structured output through `generateObject` and a Zod schema.
- Parser type values are `fire`, `flood`, `storm`, `wind`, `hail`, and `other`.
- Parser prompt now explicitly defaults ambiguous/non-fire incidents to `other`.
- Parser tests cover gas leaks, hazmat/fuel spills, utility/power-line incidents, EMS/medical/injury, vehicle/MVA/traffic incidents, police/law enforcement, smoke/working fire, 10-75, alarm levels, BNNDESK filtering, slash-separated department codes, U/D updates, NYC boroughs, raw payload extraction, and commercial display IDs.
- Backend type/category is the source of truth for clients.

Canonical original BNN-style format:

```text
State | County | City | Address | Alert Type | Alert Message | <C> BNN | Department Codes | #AlertId
```

Important parser contract:

- The alert type is the field immediately before alert message in original BNN-style alerts.
- `U/D` or update prefix means update.
- Department promo tokens such as `BNNDESK` and `BNN` are stripped.
- Valid department codes after promo tokens are preserved.
- Backend owns `alertId` dedupe, update detection, incident creation, activity append, geocoding, county normalization, department code filtering, and optional `commercialDisplayId`.
- Android must not infer alert type/category from description and must not parse raw alerts.

## 9. Firestore Model/Rules Direction

Current Firestore model:

- `incidents`
- `incidents/{incidentId}/activities`
- `incidents/{incidentId}/notes`
- `incidents/{incidentId}/chaserSubmissions/{chaserId}/documents`
- `incidents/{incidentId}/chaserSubmissions/{chaserId}/signedDocuments`
- `profiles`
- `profiles/{uid}/locations`
- `userIncidents`
- `appNotifications`
- `threads`
- `changeRequests`
- `webhookLogs`
- `counters`
- `presence`
- `bannedDevices`

Current rules/indexes:

- `firebase/firestore.rules` requires auth for most app collections.
- `profiles` and `incidents` currently have broad authenticated reads.
- `userIncidents` owner-scopes reads/writes by `odm_profileId`.
- `webhookLogs` are admin-read and client-write blocked.
- `counters` are authenticated-read and client-write blocked.
- `firebase/firestore.indexes.json` includes `incidents(status, createdAt)`, `incidents(alertId, createdAt)`, responder queries, `userIncidents` queries, app notification queries, thread queries, change request queries, and a collection group override for notes author queries.

Recommended future model from `docs/architecture/USER_ALERT_FLAGS_FILTERS_HIGH_ALERT_SCHEMA.md`:

- `profiles/{uid}/alertFlags/{alertKey}`
- `profiles/{uid}/filterGroups/{filterGroupId}`
- `profiles/{uid}/highAlertSettings/default`

Rules direction:

- No rules deploy yet.
- Add user-scoped subcollections as a non-breaking phase.
- Restrict PII reads before production.
- Make notification creates server-owned.
- Add schema validation after current app flows are stable.
- Test in emulator before any production rollout.

## 10. High Alert Direction

High Alert is a dedicated subsystem, not just a Home-only UI filter.

Current state from `apps/android/ai-context/HIGH_ALERT_NOTIFICATION_ARCHITECTURE.md` and Android source:

- Local DataStore persistence exists for High Alert config.
- Home filter can show only High Alert matches.
- UI/config scaffolding exists for future options.
- Not implemented now: siren playback, flashlight/strobe execution, foreground service, DND override, backend notification mutation, or production Firebase writes.

Direction:

- Driven by filter groups and High Alert settings.
- Supports vibration, siren, and strobe only inside Android OS constraints.
- Cannot guarantee Do Not Disturb or volume override.
- DND bypass requires explicit notification policy access granted by the user.
- Flashlight/strobe is hardware, permission, foreground/lifecycle, and OEM-gated.
- Future server or cross-device persistence should use `profiles/{uid}/highAlertSettings/default` after rules and migration are approved.

## 11. Maps, Distance, and Geocoding

Backend geocoding:

- `apps/web/src/lib/webhook/geocoder.ts` uses Google Maps Geocoding API server-side.
- `apps/web/src/app/api/webhook/route.ts` geocodes once, validates coordinates, and writes `location.lat/lng` to Firestore.
- Backend geocoding keys must remain server-side in Secret Manager or deployment env.

Android maps/distance:

- `apps/android/MAPS_DISTANCE_FOUNDATION.md` states Android uses Maps SDK for display only.
- Android reads Firestore `incident.location.lat/lng`.
- Android calculates distance only from current device location and existing incident coordinates.
- Android must not call Google Geocoding API for incident feed cards.
- Android should calculate distance only for visible Home cards where possible.
- Android map display key is display-only, restricted by package name and signing SHA fingerprints, and supplied through local Gradle/user properties or ignored `local.properties`.
- Backend geocoding key must never be embedded in Android.

## 12. ERPNext/CRM Direction

ERPNext/CRM integration is not implemented in active source, but the ownership direction is fixed:

- ERPNext CRM integration must be backend-owned.
- Android, iOS, and web clients should not call ERPNext directly.
- Backend creates or updates ERPNext leads, customers, jobs, or related business records from normalized incidents/actions.
- Firestore stores integration status/results for clients to read.
- ERPNext credentials and secrets live server-side only.
- No ERPNext credentials in Android.
- ERPNext is durable business workflow/source-of-record direction, while Firestore remains realtime operational coordination.

## 13. Subscription/Commercial Direction

Current status:

- No Stripe, Google Play Billing, commercial tenant, subscription, or entitlement implementation was found in active source.
- `docs/commercial/SECURITY_SECRETS_SUBSCRIPTIONS_ARCHITECTURE.md` is the detailed commercial architecture plan.
- `docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md` keeps the placeholder principle that emergency realtime behavior must not depend directly on billing-provider availability.

Direction:

- Google Play Billing for Android digital subscriptions if sold in app.
- Stripe for web/PWA billing.
- Backend verifies purchases/subscriptions and processes provider webhooks.
- Backend writes subscription, purchase token, entitlement, and audit records to Firestore.
- Firestore entitlement docs drive client access.
- Android reads entitlements only.
- Android purchase state may be displayed optimistically but is not authoritative.
- No client-owned subscription truth.
- Tenant/account/membership roles must be introduced before commercial rollout.

## 14. Secrets and Security

Rules:

- Google Cloud Secret Manager or deployment env owns backend secrets.
- Android has no server secrets.
- Android may use Firebase client config from local `google-services.json`, but that file must stay untracked.
- App Check and Play Integrity are planned.
- API keys must be restricted by package/SHA or web origin as appropriate.
- No service accounts in repo.
- No env files committed except `.env.example` with empty assignments only.
- No real API keys, private keys, OAuth secrets, webhook secrets, Play service account JSON, Firebase Admin service account JSON, Stripe secret keys, OpenAI keys, or backend geocoding keys in Android or docs.
- Never print or store secret values in logs, docs, tests, terminal output, screenshots, or bug reports.

## 15. Current Files/Docs To Read First

Read these before Android, backend, parser, or restore-point work:

- `CONTEXT_BLOCK.md`
- `apps/android/AGENTS.md`
- `apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md`
- `docs/handoff/CHATGPT_HANDOFF.md`
- `docs/ai/STATE.md`
- `apps/android/ai-context/ALERT_ARCHITECTURE.md`
- `apps/android/ai-context/PARSING_CONTRACT.md`
- `apps/android/ai-context/FIRESTORE_MODEL.md`
- `apps/android/ai-context/UI_RULES.md`
- `apps/android/ai-context/DESIGN_SYSTEM.md`
- `apps/android/ai-context/HIGH_ALERT_NOTIFICATION_ARCHITECTURE.md`
- `docs/architecture/PARSING_NORMALIZATION_CONTRACT.md`
- `docs/architecture/USER_ALERT_FLAGS_FILTERS_HIGH_ALERT_SCHEMA.md`
- `docs/architecture/FIRESTORE_RULES_CHANGE_PLAN.md`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedCardFormatter.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedScreen.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedViewModel.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedFiltering.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/components/NFAIncidentCard.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/components/NFABottomNavBar.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/tokens/NFAColors.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/theme/NFATheme.kt`
- `apps/web/src/app/api/webhook/route.ts`
- `apps/web/src/lib/webhook/parser.ts`
- `apps/web/src/lib/webhook/normalization.ts`
- `apps/web/src/lib/webhook/geocoder.ts`
- `apps/web/tests/webhook-parser.test.ts`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`

## 16. Current Known Next Steps

Immediate Home polish:

- Move card action icons to the top row.
- Put distance next to timestamp in blue compact text like `12m`.
- Correct bottom nav icons: Profile single-person, Chasers group/two-person.
- Verify newest update ordering in practice, including the interaction between repository `createdAt` query limit and in-memory `updatedAt` sorting.
- Confirm backend `type` values after parser fix with real Firestore data.
- Add formatter/unit tests for Home inline body, BNNDESK stripping, department preservation, emoji additivity, no description-derived category, and distance/time formatting.

Next product phases:

- Details screen after Home locks.
- Then map/details/timeline/actions.
- Later Firestore user flags/filterGroups/highAlert sync.
- Later ERPNext backend integration.
- Later iOS planning via shared contracts, not immediate build.

## Restore-Point Safety Notes

For this checkpoint:

- Preserve unrelated dirty/untracked files.
- Do not reset, clean, stash, discard, force-push, merge to main, run Firebase deploy, or mutate production Firebase data.
- Stage only relevant context/docs and intended Android checkpoint files.
- Do not stage `apps/android/app/google-services.json`, `apps/android/google-services.json`, `apps/android/local.properties`, `.gradle`, build outputs, APKs, keystores, `.env*`, service account JSON, screenshots, generated caches, or local test-profile scripts.

## Source Reference Index

Inspected or cross-referenced for this snapshot:

- `README.md`
- `AGENTS.md`
- `openmemory.md`
- `docs/ai/CLOUD_AGENTS.md`
- `docs/ai/AGENT_OPERATING_MODE.md`
- `docs/ai/STATE.md`
- `docs/ai/ARCHITECTURE_CURRENT.md`
- `ARCHITECTURE.md`
- `docs/handoff/CHATGPT_HANDOFF.md`
- `apps/android/AGENTS.md`
- `apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md`
- `apps/android/MAPS_DISTANCE_FOUNDATION.md`
- `apps/android/ai-context/ALERT_ARCHITECTURE.md`
- `apps/android/ai-context/PARSING_CONTRACT.md`
- `apps/android/ai-context/FIRESTORE_MODEL.md`
- `apps/android/ai-context/UI_RULES.md`
- `apps/android/ai-context/DESIGN_SYSTEM.md`
- `apps/android/ai-context/HIGH_ALERT_NOTIFICATION_ARCHITECTURE.md`
- `apps/android/ai-context/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- `docs/architecture/PARSING_NORMALIZATION_CONTRACT.md`
- `docs/architecture/USER_ALERT_FLAGS_FILTERS_HIGH_ALERT_SCHEMA.md`
- `docs/architecture/FIRESTORE_RULES_CHANGE_PLAN.md`
- `docs/commercial/SECURITY_SECRETS_SUBSCRIPTIONS_ARCHITECTURE.md`
- `docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md`
- `apps/android/app/build.gradle.kts`
- `apps/android/app/src/main/AndroidManifest.xml`
- `apps/android/app/src/main/java/com/emergency/alerts/MainActivity.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/auth/SessionViewModel.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/auth/LoginViewModel.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/auth/LoginScreen.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/data/repository/FirebaseAuthRepositoryImpl.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/data/repository/FirestoreIncidentRepository.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/data/repository/DataStoreHomeFeedPreferencesRepository.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/data/repository/DataStoreHomeFeedReadStateRepository.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/domain/usecase/ObserveHomeFeedUseCase.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/domain/usecase/MarkHomeFeedIncidentSeenUseCase.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/domain/model/HomeFeedIncident.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/domain/model/HomeFeedPreferences.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedCardFormatter.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedScreen.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedViewModel.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/feature/home/HomeFeedFiltering.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/components/NFAIncidentCard.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/components/NFABottomNavBar.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/tokens/NFAColors.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/core/designsystem/theme/NFATheme.kt`
- `apps/web/src/app/api/webhook/route.ts`
- `apps/web/src/lib/webhook/parser.ts`
- `apps/web/src/lib/webhook/normalization.ts`
- `apps/web/src/lib/webhook/geocoder.ts`
- `apps/web/tests/webhook-parser.test.ts`
- `apps/web/src/lib/db.ts`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`
