# Android Studio Context Block

Last updated: 2026-05-17

## Purpose

This file is for Android Studio/Gemini work on the native Android rebuild of NFA Alerts.

Android root path:

```text
D:\github\nfa-alerts-enterprise\apps\android
```

Native Android is now the priority. The existing web/PWA remains under `apps/web`, but Android implementation should happen inside Android Studio with the native project under `apps/android`.

## Ownership Rules

Android Studio owns:

- Opening `D:\github\nfa-alerts-enterprise\apps\android`.
- Gradle sync.
- Android SDK and AGP/Kotlin/KSP compatibility.
- Android dependency fixes.
- Compose previews.
- Emulator/device runs.
- Logcat/runtime debugging.
- `assembleDebug`.
- Android lint later.
- Detekt later if configured.

Cursor owns:

- Repo orchestration.
- Cross-repo audits.
- Context docs.
- Source-of-truth contract docs.
- GitHub sync when explicitly asked.
- Safety guardrails.

Gemini owns:

- Android implementation inside Android Studio.
- Compile stabilization from actual Gradle/IDE errors.
- Native Home/Details screen implementation after compile is stable.

Do not use Cursor to replace Android Studio for Gradle/build/device validation.

## Current Android Project Facts

Confirmed from repository files:

- Project root: `apps/android`
- App module: `apps/android/app`
- Package/application ID: `com.emergency.alerts`
- Language: Kotlin
- UI: Jetpack Compose
- Design system target: Material 3
- Architecture target: MVVM + Repository pattern + Hilt + Flow/StateFlow
- Firebase project: `nfa-alerts-v2`
- Minimum SDK: API 24
- Compile SDK: 36
- Target SDK: 36
- Android app name: NFA Alerts

Current Gradle/plugin facts from `apps/android/gradle/libs.versions.toml`:

- Android Gradle Plugin: `8.3.1`
- Kotlin: `2.0.21`
- KSP: `2.0.21-1.0.25`
- Compose BOM: `2024.04.01`
- Firebase BOM: `33.1.0`
- Google Services plugin: `4.4.1`
- Firebase Crashlytics plugin: `3.0.1`
- Hilt: `2.51.1`
- Navigation Compose: `2.7.7`
- Play Services Location: `21.2.0`
- Timber: `5.0.1`

## Required Native Stack

Use:

- Kotlin.
- Jetpack Compose.
- Material 3.
- MVVM.
- Repository pattern.
- Hilt dependency injection.
- Flow/StateFlow for realtime state.
- Firebase Auth.
- Cloud Firestore.
- Firebase Cloud Messaging.
- Google Play Services Location / fused location provider.
- Google geocoded address handling from Firestore incident fields.

Do not use:

- Raw alert parsing on Android.
- Webhook calls from Android.
- Firebase Realtime Database as the primary alert system.
- Android-side CRM/ERP contact creation.
- Runtime secrets in source code.

## Firebase And Secret Rules

`google-services.json` belongs only at:

```text
apps/android/app/google-services.json
```

Rules:

- `google-services.json` stays local and ignored.
- Do not commit `google-services.json`.
- Do not commit service account JSON.
- Do not commit `.env*` except `.env.example` with empty assignments only.
- Do not expose API keys, private keys, tokens, service-account values, signing keys, keystores, or secret local paths.
- Do not run `firebase deploy`.
- Do not modify production Firebase data.

## Android Runtime Boundary

Android consumes normalized Firestore docs only.

Backend owns:

- Raw alert ingestion.
- AI parsing.
- Structured validation.
- Geocoding.
- CRM/ERP contact creation when implemented.
- Dedupe by `alertId`.
- Alert aggregation.
- Incident creation/update.
- Activity timeline append.
- Webhook audit logs.
- Server-owned notification creation and FCM sends.

Android owns:

- Firebase Auth client state.
- Profile listener.
- Home feed listener.
- Details listener.
- Current-user flags listener.
- Distance calculation from device location and incident coordinates.
- FCM token registration to `profiles/{uid}.pushToken`.
- In-app notification reads from `appNotifications`.
- Allowed client actions enforced by Firestore rules.

Android must not call:

- `POST /api/webhook`
- `/api/admin/backfill-counts`
- `/api/admin/cleanup-promo-codes`
- `/api/admin/merge-duplicates`

The only backend route that may be used later for Home/Details parity is `GET /api/weather?lat=<lat>&lng=<lng>`, if native weather cards need the same server behavior.

## Firestore-First Architecture

Primary data source:

- Cloud Firestore.

Important collections:

- `profiles`
- `profiles/{uid}/locations`
- `incidents`
- `incidents/{incidentId}/activities`
- `incidents/{incidentId}/notes`
- `incidents/{incidentId}/chaserSubmissions/{chaserId}/documents`
- `incidents/{incidentId}/chaserSubmissions/{chaserId}/signedDocuments`
- `userIncidents`
- `appNotifications`
- `threads`
- `changeRequests`
- `webhookLogs`
- `counters`
- `presence`
- `bannedDevices`

Indexes already present in `firebase/firestore.indexes.json` include:

- `incidents(status ASC, createdAt DESC)`
- `incidents(alertId ASC, createdAt DESC)`
- `incidents(responderIds array-contains, status ASC, createdAt DESC)`
- `userIncidents(odm_profileId ASC, odm_incidentId ASC, odm_action ASC)`
- `userIncidents(odm_profileId ASC, odm_action ASC)`
- `appNotifications(profileId ASC, createdAt DESC)`
- Thread and change request indexes.
- Collection group support for `notes.authorId`.

## Infrastructure Already Implemented By Gemini

Repository inspection shows these infrastructure pieces now exist:

- Gradle dependency wiring in `apps/android/app/build.gradle.kts`.
- Kotlin/KSP compatibility wiring in `apps/android/gradle/libs.versions.toml`.
- Domain models:
  - `domain/model/Incident.kt`
  - `domain/model/HomeFeedIncident.kt`
  - `domain/model/Profile.kt`
  - `domain/model/Chat.kt`
- DTOs:
  - `data/firestore/dto/FirestoreDtos.kt`
- Mappers:
  - `data/mapper/FirestoreMappers.kt`
- Repository interfaces:
  - `domain/repository/AuthRepository.kt`
  - `domain/repository/IncidentRepository.kt`
  - `domain/repository/ChatRepository.kt`
  - `domain/repository/LocationRepository.kt`
- Firebase repository implementations:
  - `data/repository/FirebaseAuthRepositoryImpl.kt`
  - `data/repository/FirestoreIncidentRepository.kt`
  - `data/repository/FirestoreChatRepository.kt`
- Hilt modules:
  - `core/di/FirebaseModule.kt`
  - `core/di/RepositoryModule.kt`
- FCM service:
  - `data/messaging/NFAAlertsMessagingService.kt`
- Location repository:
  - `data/repository/AndroidLocationRepository.kt`
- Result wrapper:
  - `core/result/Result.kt`
- Application class:
  - `NFAAlertsApplication.kt`
- Manifest registration for:
  - `NFAAlertsApplication`
  - `NFAAlertsMessagingService`
  - `MainActivity`

## Current Compile Status

Reported current status:

- Gradle sync passed after the KSP compatibility fix.
- Infrastructure implementation introduced compile errors that need stabilization.

This context doc did not run Gradle sync or `assembleDebug`; Android Studio/Gemini must use the current IDE/build output as the source of truth for exact errors.

Known evidence-backed areas to check first:

- `apps/android/gradle.properties` appears to concatenate `android.useAndroidX=true` and `android.suppressUnsupportedCompileSdk=36` on one line. These should be separate properties if Android Studio confirms the file is malformed.
- `FirebaseAuthRepositoryImpl.kt` imports `kotlinx.coroutines.tasks.await`; verify the required coroutine Play Services/tasks dependency is present.
- Manifest permissions for location/notifications may still be incomplete for runtime behavior, even if not the immediate compile blocker.
- FCM token logging in `NFAAlertsMessagingService.kt` logs the token; that is a security/logging concern to fix during stabilization, without printing secrets.
- Several repository write methods are placeholders and need real Firestore implementation later, but compile stabilization comes first.

## Home Page Rules

Home is the operational alert feed.

Rules:

- One card per `alertId` concept, implemented as one card per normalized Firestore `incidents/{incidentId}` doc.
- `alertId` is the backend dedupe/update key, not the Android list identity.
- If `alertId` is null, still render one card for the Firestore incident doc.
- Latest update only on the Home card.
- Do not render the full activity timeline on Home.
- Cards reorder by latest update timestamp for the enterprise rebuild contract.
- Current source/docs still show `createdAt desc`; implementing latest-update ordering is not done and must be treated as an intentional product change.
- Distance is displayed when device location and incident coordinates are available.
- Severity/status styling must be visible and consistent.
- High severity alarms such as `3rd_alarm`, `4th_alarm`, and `5th_alarm` need high-contrast styling.
- Active incidents must look active.
- Closed incidents must not look active in the default feed.
- Search/filter/sort should be local over the loaded incident window until backend pagination/query design is added.
- Action flags write `userIncidents`: `favorite`, `bookmark`, `hide`, `mute`, `view`.
- Hidden/muted are operational user flags, not social engagement.
- Listener/offline/error states must be visible.

Home required data:

- Current profile: `profiles/{uid}`.
- Incident feed: `incidents`.
- Optional active-only query: `incidents where status == "active" orderBy createdAt desc`.
- User flags: `userIncidents where odm_profileId == uid`.
- Device location for distance.

## Details Page Rules

Details is the full selected-incident workspace.

Rules:

- Details shows full timeline for the same `alertId`/incident document.
- The timeline comes from the original incident summary plus `incidents/{incidentId}/activities`.
- Details must include map/geocoded address from normalized `location` fields.
- Details may show larger cards than Home.
- Chat/notes later, but notes infrastructure should use `incidents/{incidentId}/notes`.
- Supe/admin controls must be separated from responder controls.
- Weather is supporting context, not the main alert.
- Listener errors, offline stale data, and permission denials must be visible.

Details required data:

- Incident doc: `incidents/{incidentId}`.
- Activities: `incidents/{incidentId}/activities orderBy createdAt desc`.
- Notes: `incidents/{incidentId}/notes orderBy createdAt desc`.
- Current-user flags for selected incident.
- Responder profiles by ID.
- Documents/signatures later.
- Weather proxy later if needed.

## Distance And Location Infrastructure

Current source includes:

- `domain/usecase/CalculateDistanceUseCase.kt`
- `data/repository/AndroidLocationRepository.kt`
- `domain/repository/LocationRepository.kt`
- `domain/repository/DeviceLocation`

Rules:

- Distance is calculated client-side.
- Use current device location and incident `location.lat/lng`.
- Incident coordinates are backend-geocoded.
- Android should not geocode alert addresses for display.
- Distance is display-only and not stored on incident docs.
- Request permissions clearly.
- Disable nearest-first sorting until location is available.

## Google Geocoded Address Handling

Backend geocoding source:

- `apps/web/src/lib/webhook/geocoder.ts`

Android consumes:

- `incident.location.address`
- `incident.location.city`
- `incident.location.county`
- `incident.location.state`
- `incident.location.lat`
- `incident.location.lng`

Android map UI should use those normalized fields. Do not use raw alert text. Do not re-run ingestion geocoding on-device.

## Files Gemini Should Read Before Changes

Before compile stabilization:

- `apps/android/settings.gradle.kts`
- `apps/android/build.gradle.kts`
- `apps/android/app/build.gradle.kts`
- `apps/android/gradle/libs.versions.toml`
- `apps/android/gradle.properties`
- `apps/android/app/src/main/AndroidManifest.xml`
- `apps/android/app/src/main/java/com/emergency/alerts/NFAAlertsApplication.kt`
- `apps/android/app/src/main/java/com/emergency/alerts/MainActivity.kt`
- All current files under `apps/android/app/src/main/java/com/emergency/alerts/core`
- All current files under `apps/android/app/src/main/java/com/emergency/alerts/domain`
- All current files under `apps/android/app/src/main/java/com/emergency/alerts/data`

Before Home + Details:

- `CONTEXT_BLOCK.md`
- `apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md`
- `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- `apps/android/ai-context/ALERT_ARCHITECTURE.md`
- `apps/android/ai-context/PARSING_CONTRACT.md`
- `apps/android/ai-context/FIRESTORE_MODEL.md`
- `apps/android/ai-context/UI_RULES.md`
- `apps/android/ai-context/DESIGN_SYSTEM.md`
- `apps/android/ai-context/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`
- `apps/web/src/lib/db.ts`
- `apps/web/src/services/incidents.ts`
- `apps/web/src/hooks/use-incidents.ts`
- `apps/web/src/app/api/webhook/route.ts`
- Screenshots under `apps/android/ai-context/screenshots`

## Files Gemini Should Not Touch

Unless explicitly instructed:

- `apps/web/**`
- `firebase/**`
- `docs/**` except Android implementation notes if asked.
- `.github/**`
- `scripts/**`
- `.env*`
- `google-services.json`
- Service account JSON.
- Keystores/signing files.
- Production Firebase data.
- Next.js webhook code.
- Firestore rules/indexes.
- Any generated/local Android Studio files not meant for source control.

## Exact Next Android Studio/Gemini Prompt: Fix Compile Errors

Use this prompt in Android Studio with Gemini:

```text
You are working in Android Studio on the native Android project at:
D:\github\nfa-alerts-enterprise\apps\android

Goal: stabilize the current Android infrastructure so Gradle sync and assembleDebug pass without changing product behavior or adding screens.

Read first:
- D:\github\nfa-alerts-enterprise\CONTEXT_BLOCK.md
- D:\github\nfa-alerts-enterprise\apps\android\ANDROID_STUDIO_CONTEXT_BLOCK.md
- apps/android/settings.gradle.kts
- apps/android/build.gradle.kts
- apps/android/app/build.gradle.kts
- apps/android/gradle/libs.versions.toml
- apps/android/gradle.properties
- apps/android/app/src/main/AndroidManifest.xml
- all current Kotlin under apps/android/app/src/main/java/com/emergency/alerts/core
- all current Kotlin under apps/android/app/src/main/java/com/emergency/alerts/domain
- all current Kotlin under apps/android/app/src/main/java/com/emergency/alerts/data
- NFAAlertsApplication.kt
- MainActivity.kt

Hard rules:
- Native Android only.
- Keep package/application ID com.emergency.alerts.
- Do not call the Next.js webhook from Android.
- Do not parse raw alerts on Android.
- Android consumes normalized Firestore docs only.
- Do not modify apps/web.
- Do not modify firebase rules/indexes.
- Do not run firebase deploy.
- Do not modify production Firebase data.
- Do not commit or expose google-services.json, API keys, private keys, tokens, service account values, keystores, or secret paths.
- Keep google-services.json local and ignored.

Task:
1. Run Gradle sync and assembleDebug from Android Studio.
2. Fix every compile/sync error with the smallest safe Android-only changes.
3. Prefer fixing version/dependency/property issues before changing Kotlin APIs.
4. Check apps/android/gradle.properties for malformed concatenated properties.
5. Verify any kotlinx.coroutines.tasks.await usage has the correct dependency.
6. Remove any sensitive token logging, especially FCM token value logging.
7. Add missing Android permissions only if required for compile/runtime correctness, but do not implement background location.
8. Leave repository methods that are not needed for compile as TODO-safe only if they compile; do not build Home/Details yet.
9. After fixes, report the exact files changed and the exact Gradle sync/assembleDebug result.

Success criteria:
- Gradle sync passes.
- assembleDebug passes.
- No source contains secrets.
- No web/backend/Firebase rules changes.
- No Home or Details UI implementation yet.
```

## Exact Next Android Studio/Gemini Prompt: Build Home + Details

Use this only after compile is stable:

```text
You are working in Android Studio on:
D:\github\nfa-alerts-enterprise\apps\android

Goal: implement the first native Android Home and Alert Details screens using the existing Firestore-first architecture.

Read first:
- D:\github\nfa-alerts-enterprise\CONTEXT_BLOCK.md
- D:\github\nfa-alerts-enterprise\apps\android\ANDROID_STUDIO_CONTEXT_BLOCK.md
- docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md
- apps/android/ai-context/ALERT_ARCHITECTURE.md
- apps/android/ai-context/PARSING_CONTRACT.md
- apps/android/ai-context/FIRESTORE_MODEL.md
- apps/android/ai-context/UI_RULES.md
- apps/android/ai-context/DESIGN_SYSTEM.md
- apps/android/ai-context/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md
- firebase/firestore.rules
- firebase/firestore.indexes.json
- apps/web/src/lib/db.ts
- apps/web/src/services/incidents.ts
- apps/web/src/hooks/use-incidents.ts
- apps/web/src/app/api/webhook/route.ts
- screenshots under apps/android/ai-context/screenshots

Hard rules:
- Native Android only.
- Kotlin + Jetpack Compose + Material 3.
- MVVM + Repository pattern + Hilt + Flow/StateFlow.
- Firebase Auth + Cloud Firestore + FCM.
- Android must not parse raw alerts.
- Android must not call POST /api/webhook.
- Android must not call admin routes.
- Backend owns parsing, normalization, geocoding, CRM/ERP creation, dedupe, and alert aggregation.
- Android consumes normalized Firestore docs only.
- Home shows one card per incident/alertId, latest update only.
- Details shows the full timeline for the selected incident/alertId.
- Distance is calculated client-side from user location and incident lat/lng.
- Keep Cloud Firestore; do not migrate primary alerts to Realtime Database.
- Do not modify apps/web.
- Do not modify firebase rules/indexes.
- Do not run firebase deploy.
- Do not modify production Firebase data.
- Do not expose or commit secrets.

Implementation:
1. Add a Compose navigation shell if needed.
2. Build Home screen with compact operational cards:
   - one card per normalized incident doc
   - latest update only
   - cards sorted by latest update timestamp for enterprise behavior
   - distance displayed when location is available
   - severity/status styling
   - loading/empty/error/offline states
3. Build Alert Details screen:
   - selected incident summary
   - map/geocoded address placeholder or map integration if dependencies are already stable
   - full timeline from incident activities
   - notes section scaffold for later if needed
   - response/status actions only if repository writes are safe and rules-compatible
4. Use Flow/StateFlow ViewModels and repository methods; do not put Firestore logic directly in Composables.
5. Keep UI dense and operational, not social-media styled.
6. Do not implement chat yet except navigation placeholders if necessary.
7. After implementation, run Gradle sync, assembleDebug, and run the app on an emulator/device.

Success criteria:
- assembleDebug passes.
- App launches.
- Home screen renders loading/empty/error and data states.
- Tapping a Home card opens Details.
- Details shows incident summary and timeline for the same incident.
- No raw alert parsing or webhook calls exist in Android code.
- No secrets are committed or printed.
```

## Validation Commands

In Android Studio:

1. Gradle sync.
2. `assembleDebug`.
3. Run app on emulator/device.
4. Inspect Logcat.
5. Lint later.
6. Detekt later, if configured.

From command line only if the operator explicitly wants command-line Android validation:

```powershell
cd D:\github\nfa-alerts-enterprise\apps\android
.\gradlew.bat assembleDebug
```

Do not treat command-line Gradle as replacing Android Studio ownership unless explicitly requested.

## Current Missing/Unknown Facts

- Exact current compile errors are unknown in this docs pass because Gradle was intentionally not run.
- Exact local `google-services.json` presence/content is unknown and should not be inspected for values.
- Exact Firebase Console Android app registration status is unknown.
- Exact device/emulator validation status after the latest infrastructure changes is unknown.
- Exact Home/Details implementation branch history from Gemini is only partially inferable from local files and memory; use current source as truth.

## Source Reference Index

Use these as source-of-truth references:

- `CONTEXT_BLOCK.md`
- `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- `docs/android/ANDROID_STUDIO_BOOTSTRAP.md`
- `apps/android/ai-context/ALERT_ARCHITECTURE.md`
- `apps/android/ai-context/PARSING_CONTRACT.md`
- `apps/android/ai-context/FIRESTORE_MODEL.md`
- `apps/android/ai-context/UI_RULES.md`
- `apps/android/ai-context/DESIGN_SYSTEM.md`
- `apps/android/ai-context/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`
- `apps/web/src/lib/db.ts`
- `apps/web/src/app/api/webhook/route.ts`
- `apps/web/src/lib/webhook/parser.ts`
- `apps/web/src/lib/webhook/geocoder.ts`
- `apps/web/src/services/incidents.ts`
- `apps/web/src/hooks/use-incidents.ts`
- `apps/web/src/contexts/auth-context.tsx`
- `apps/web/src/hooks/use-push-notifications.ts`
- `apps/android/app/src/main/java/com/emergency/alerts/**`
