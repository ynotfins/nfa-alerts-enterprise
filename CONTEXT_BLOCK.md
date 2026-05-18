# NFA Alerts Enterprise Rebuild Context Block

Last updated: 2026-05-17

## Product Mission

NFA Alerts is a commercial emergency-response coordination product for real-time alert intake, incident triage, field responder coordination, supervisor oversight, documents/signatures, notifications, and operational follow-up.

The enterprise rebuild goal is a production-grade, commercially viable system where backend services normalize emergency alerts into durable incident records, native mobile clients render operational workflows quickly, and safety boundaries prevent clients from owning ingestion, parsing, secret handling, deployment, or production data mutation.

## Repository Identity

- Current repo path: `D:\github\nfa-alerts-enterprise`
- GitHub repo: `ynotfins/nfa-alerts-enterprise`
- Firebase project name: `nfa-alerts-v2`
- Android package name: `com.emergency.alerts`
- Current branch/state from `git status --short --branch`: `feature/android-infrastructure-wiring...origin/feature/android-infrastructure-wiring`
- Current working tree caveat: dirty checkout with staged/modified Android infrastructure files, modified `.gitignore`, modified `apps/android/app/src/main/AndroidManifest.xml`, untracked `.agents/`, `.cursor/rules/`, Android screenshots, `docs/ai/HANDOFF_TO_NEW_CHAT.md`, `nfa-alerts-enterprise`, `screenshots/`, and `skills-lock.json`.
- This handoff did not reset, clean, stash, switch branches, commit, push, run Firebase deploy, or modify production Firebase data.

## Monorepo Structure

Confirmed from repo files:

- `apps/web`: existing Next.js PWA and API routes.
- `apps/android`: Android Studio-owned native Android project.
- `apps/ios`: future iOS placeholder.
- `packages/shared`: future shared contracts/utilities placeholder.
- `packages/config`: future shared configuration placeholder.
- `firebase`: Firebase CLI config, Firestore rules, Firestore indexes, Storage rules, and CORS config.
- `docs`: architecture, Android, Firebase, enterprise, AI, and commercial planning docs.
- `scripts`: repo-level automation and deployment helpers.
- `.github`: GitHub Actions CI and repository automation.

Root `package.json` is a pnpm workspace coordinator. Root scripts forward to the `web` workspace with `pnpm --filter web`. `pnpm-workspace.yaml` declares `apps/*` and `packages/*`. `apps/web/package.json` owns the Next.js app dependencies and scripts.

## Web App Location And Role

The web/PWA lives at `apps/web`.

Confirmed stack:

- Next.js App Router `16.1.1`.
- React `19.2.3`.
- TypeScript strict mode.
- Firebase client SDK for Auth, Firestore, Storage, and FCM.
- Firebase Admin SDK for server-side Firestore, Auth, Storage, and Messaging.
- Tailwind CSS v4 and shadcn-style components.
- OpenAI structured parsing through `@ai-sdk/openai`.
- Google Maps APIs for maps/geocoding.
- Vitest unit tests.

Important web-owned paths:

- Webhook ingestion: `apps/web/src/app/api/webhook/route.ts`.
- Webhook parser: `apps/web/src/lib/webhook/parser.ts`.
- Webhook geocoder: `apps/web/src/lib/webhook/geocoder.ts`.
- Firebase client setup: `apps/web/src/lib/firebase.ts`.
- Firebase Admin setup: `apps/web/src/lib/firebase-admin.ts`.
- Firestore TypeScript contracts: `apps/web/src/lib/db.ts`.
- Incident services/listeners: `apps/web/src/services/incidents.ts`, `apps/web/src/hooks/use-incidents.ts`.
- Auth/profile state: `apps/web/src/contexts/auth-context.tsx`.
- Notification sender route: `apps/web/src/app/api/notifications/send/route.ts`.
- Push token registration: `apps/web/src/hooks/use-push-notifications.ts`.

## Android App Location And Role

The native Android project lives at `apps/android`.

Current Android facts from repository inspection:

- Android root path: `D:\github\nfa-alerts-enterprise\apps\android`
- Native Android only; the current priority is the native Android rebuild, not the web/PWA.
- Package/application ID: `com.emergency.alerts`.
- Kotlin + Jetpack Compose + Material 3.
- MVVM + Repository pattern + Hilt + Flow/StateFlow are the intended architecture.
- Firebase Auth, Cloud Firestore, FCM, and location/distance infrastructure are now represented in Android infrastructure files.
- `NFAAlertsApplication` exists and is registered in `AndroidManifest.xml`.
- `MainActivity` is still the default Hello Android Compose shell.
- Android Studio owns Gradle sync, assemble, emulator/device validation, Compose previews, Logcat, and Android build stabilization.
- Cursor owns repo-wide orchestration, audits, documentation, contracts, safety guardrails, and GitHub sync.

Current Android infrastructure files found:

- Gradle/settings: `apps/android/settings.gradle.kts`, `apps/android/build.gradle.kts`, `apps/android/app/build.gradle.kts`, `apps/android/gradle/libs.versions.toml`, `apps/android/gradle.properties`.
- Application/activity: `apps/android/app/src/main/java/com/emergency/alerts/NFAAlertsApplication.kt`, `apps/android/app/src/main/java/com/emergency/alerts/MainActivity.kt`.
- Domain models: `apps/android/app/src/main/java/com/emergency/alerts/domain/model/Incident.kt`, `Profile.kt`, `Chat.kt`, `HomeFeedIncident.kt`.
- Repository interfaces: `apps/android/app/src/main/java/com/emergency/alerts/domain/repository/AuthRepository.kt`, `IncidentRepository.kt`, `ChatRepository.kt`, `LocationRepository.kt`.
- Data DTOs/mappers: `apps/android/app/src/main/java/com/emergency/alerts/data/firestore/dto/FirestoreDtos.kt`, `apps/android/app/src/main/java/com/emergency/alerts/data/mapper/FirestoreMappers.kt`.
- Firebase repositories: `apps/android/app/src/main/java/com/emergency/alerts/data/repository/FirebaseAuthRepositoryImpl.kt`, `FirestoreIncidentRepository.kt`, `FirestoreChatRepository.kt`.
- Location repository: `apps/android/app/src/main/java/com/emergency/alerts/data/repository/AndroidLocationRepository.kt`.
- Hilt modules: `apps/android/app/src/main/java/com/emergency/alerts/core/di/FirebaseModule.kt`, `RepositoryModule.kt`.
- FCM service: `apps/android/app/src/main/java/com/emergency/alerts/data/messaging/NFAAlertsMessagingService.kt`.
- Result wrapper: `apps/android/app/src/main/java/com/emergency/alerts/core/result/Result.kt`.

Current Android compile status:

- Reported current status: Gradle sync passed after a KSP compatibility fix, then Android infrastructure implementation introduced compile errors that need stabilization.
- This docs pass did not run Gradle sync or `assembleDebug`.
- Possible evidence-backed stabilization areas include `apps/android/gradle.properties` line where `android.useAndroidX=true` and `android.suppressUnsupportedCompileSdk=36` appear concatenated, and missing coroutine task dependency risk for `kotlinx.coroutines.tasks.await` imports. Android Studio/Gemini must confirm exact errors from the current IDE/build output.

## Firebase Configuration

Firebase config lives under `firebase/`.

Confirmed files:

- `firebase/firebase.json`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`
- `firebase/storage.rules`
- `firebase/cors.json`

`firebase/firebase.json` uses config-relative paths:

- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Storage rules: `storage.rules`
- Emulators: Auth `9099`, Functions `5001`, Firestore `8080`, Emulator UI `4000`, single project mode enabled.

Root-run Firebase commands must pass explicit config, for example:

```powershell
firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

Do not run `firebase deploy` without explicit approval.

## Live Production Safety Rules

Non-negotiable safety constraints:

- Do not run `firebase deploy` without explicit approval.
- Do not modify production Firebase data without explicit approval.
- Do not commit `.env*` files except `.env.example` with empty assignments only.
- Do not commit service account JSON, private keys, signing keys, Bitwarden tokens, logs containing secret values, Android keystores, or `google-services.json`.
- Do not expose API keys, private keys, tokens, service account values, or local absolute secret paths.
- Do not reset, clean, stash, or switch branches while preserving unrelated local changes.
- Do not commit or push unless explicitly asked.
- Android must not call the Next.js webhook.
- Android must not parse raw alert text.
- Android must consume normalized Firestore documents only.

## Firestore-First Architecture Decision

The primary alert system stays on Cloud Firestore.

Reasons supported by current repo evidence:

- Current web runtime already uses Firestore client listeners and Firebase Admin writes.
- Current security rules, indexes, services, models, and Android DTOs are Firestore-shaped.
- Home, Details, notes, activities, notifications, chat, profiles, user flags, documents, and moderation already map to Firestore collections/subcollections.
- Android infrastructure is now being built around Firebase Auth, Firestore repositories, Flow listeners, and DTO/domain mapping.
- Backend/webhook code writes normalized `incidents` docs and `incidents/{incidentId}/activities` subcollection updates.

Why not Firebase Realtime Database as the primary alert system:

- No inspected source path uses Realtime Database for primary alert data.
- Firestore indexes already support required incident, responder, user flag, app notification, thread, change request, and notes queries.
- Firestore document/subcollection boundaries fit the current incident plus timeline model.
- Current Firestore rules express role-based access for profiles, incidents, user flags, notes, activities, notifications, and audit collections.
- Migrating primary alerts to Realtime Database would require rewriting data contracts, rules, indexes, backend writes, Android repositories, and web listeners without evidence of a current need.
- Realtime Database can be reconsidered later only for a specific supplemental use case if evidence proves Firestore is insufficient; it is not the primary alert data source.

## Alert Aggregation Model

Backend-owned behavior:

- External raw alert arrives at `POST /api/webhook`.
- The webhook validates bearer auth, sanitizes input, parses with OpenAI structured output, geocodes the address, and uses Firebase Admin SDK.
- `alertId` is the external dedupe/update key.
- If `alertId` matches an existing incident and the parsed payload is an update, the backend appends an activity at `incidents/{incidentId}/activities/{activityId}` and updates incident metadata such as `updatedAt`, `activityCount`, department codes, `alarmLevel`, or `location.county`.
- If no matching incident exists, the backend creates one `incidents/{incidentId}` doc with a generated `displayId`.
- Webhook logs are written to `webhookLogs`.

Android-owned display behavior:

- Home displays one card per normalized incident document.
- Home must not locally parse raw messages or collapse raw alert text.
- Details displays the full timeline for the selected incident from the incident doc plus its activities.

Important current caveat:

- Existing docs and source show Home currently orders by `createdAt desc`; requested enterprise behavior says cards reorder by latest update timestamp. This is a product contract for the rebuild and should be implemented deliberately, likely by sorting on `updatedAt` or a denormalized latest-update field after confirming read costs and UX stability. Mark this as not done yet.

## Backend/Webhook Responsibility

Backend owns:

- Raw alert ingestion.
- Bearer-token webhook authorization.
- AI parsing and schema validation.
- Geocoding.
- Coordinate validation.
- CRM/ERP contact creation requirement when that integration exists.
- Dedupe and alert aggregation by `alertId`.
- Incident creation.
- Incident update/timeline append.
- `webhookLogs`.
- Server-owned notification creation and FCM sends.
- Admin maintenance routes such as duplicate detection/merge, count backfill, and promo-code cleanup.
- Secrets and service credentials.

Android must not own these responsibilities.

## Android Responsibility

Android owns:

- Firebase Auth client state.
- Current profile listener.
- Firestore incident feed listeners.
- Current-user `userIncidents` flag listener and local joins.
- Home feed rendering.
- Alert Details rendering.
- Client-side distance calculation from device location to incident `lat/lng`.
- FCM token registration to `profiles/{uid}.pushToken`.
- In-app notification list/badges from `appNotifications`.
- Allowed client writes under Firestore rules, such as notes, user flags, push token updates, and operational actions the current role is allowed to perform.
- Clear listener, permission, offline, and write-error states.

Android does not:

- Parse raw alerts.
- Call `POST /api/webhook`.
- Call admin maintenance routes.
- Store secrets.
- Commit or require `google-services.json`.
- Own CRM/ERP creation.
- Own backend dedupe/aggregation.

## CRM/ERP Contact Creation Requirement

The requirement is that backend services own CRM/ERP contact creation for homeowners/customers/business records when that integration exists.

Current inspected repo status:

- No implemented CRM/ERP integration was found in active source.
- `apps/android/ai-context/PARSING_CONTRACT.md` explicitly assigns CRM/ERP or external operational record creation to the backend when that exists.
- `docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md` says account, tenant, entitlement, and audit contracts still require a dedicated future architecture task.
- Existing incident model includes homeowner/contact fields inside `incidents/{incidentId}.homeowner`.

Missing/unknown:

- Exact CRM/ERP product is not implemented in this repo.
- Exact contact/customer schema is not implemented in this repo.
- Exact trigger for contact creation is not implemented in this repo.
- Exact dedupe rules for CRM/ERP contacts are not implemented in this repo.

## Distance Calculation Requirement

Distance is client-side and display-only:

- Android uses device location after permission is granted.
- Android uses backend-geocoded incident coordinates from `incidents/{incidentId}.location.lat/lng`.
- Android should calculate miles locally and display distance on Home cards and relevant Details surfaces.
- Android should omit or show loading/unavailable distance when location permission or location fix is unavailable.
- Distance is not stored on incident documents in the current contract.
- Android should not geocode incident addresses for cards.

## Geocoding Requirement

Backend owns geocoding.

Current source:

- `apps/web/src/lib/webhook/geocoder.ts` uses Google Maps Geocoding API with address, city, and state.
- The webhook rejects geocoding failures and validates coordinate ranges.
- Incident docs store `location.lat`, `location.lng`, `location.address`, `location.city`, `location.county`, and `location.state`.

Android consumes geocoded Firestore fields. Android may use map rendering on Details, but must not geocode raw alert addresses as part of incident ingestion/display.

## Auth, Chat, And Notification Requirements

Auth:

- Firebase Auth is used by web and must be used by Android.
- `profiles/{uid}` stores role, onboarding state, moderation state, push token, and location fields.
- Roles are `chaser`, `supe`, and `admin`.
- Users with incomplete profiles, suspensions, bans, or moderation restrictions need explicit UI states.

Chat:

- Firestore `threads` and `threads/{threadId}/messages` exist in web contracts.
- Chat is not required for Home/Details v1, but the Android architecture should keep repository boundaries ready for later chat implementation.
- Server-side chat notification hardening exists in Git history/memory; exact current PR details should be verified before changing chat.

Notifications:

- Web stores push tokens at `profiles/{uid}.pushToken`.
- Web notification route creates `appNotifications` docs and sends FCM via Firebase Admin Messaging.
- Android should use Firebase Messaging Android SDK and write the Android FCM token to the same `pushToken` field.
- Android should read `appNotifications` for notification list/badges.
- Android should not normally call `/api/notifications/send` from Home/Details UI; notification creation should be server-owned where possible.

## What Is Already Working

Confirmed or documented as working:

- Repository is a pnpm workspace monorepo.
- Next.js PWA lives under `apps/web`.
- Root scripts forward to the `web` workspace.
- Firebase config/rules/indexes live under `firebase`.
- `firebase/firebase.json` uses config-relative rule/index paths.
- Webhook route remains at `apps/web/src/app/api/webhook/route.ts`.
- Webhook parsing, geocoding, incident creation/update, and webhook logging are implemented in web/backend source.
- Firestore rules and indexes exist.
- Web unit test baseline was previously documented as 40/40 passing.
- Android native project exists under `apps/android`.
- Android package/application ID is `com.emergency.alerts`.
- Android Gradle dependency wiring for Firebase, Hilt, Navigation, Serialization, Location, and Timber exists.
- Android domain models, DTOs, mappers, repository interfaces, Firebase repository implementations, Hilt modules, FCM service, Location repository, Result wrapper, and `NFAAlertsApplication` exist.
- Android AI context docs exist under `apps/android/ai-context`.
- Android screenshot references exist under `apps/android/ai-context/screenshots` with 34 JPGs.

## What Is Not Done Yet

Not done or unknown:

- Android compile stabilization is not complete.
- Android Home screen is not implemented.
- Android Alert Details screen is not implemented.
- Android navigation/app shell beyond the default Hello Android activity is not implemented.
- Android auth/profile UI is not implemented.
- Android Firestore listener UI states are not implemented.
- Android distance display UI is not implemented.
- Android map/geocoded address UI is not implemented.
- Android notes/chat/notifications screens are not complete.
- Android offline/error states are not complete.
- Android `google-services.json` is local-only and must not be committed.
- CRM/ERP integration is not implemented in inspected source.
- Commercial subscription/tenant/billing architecture is not implemented.
- Firestore rules still have broad authenticated read/write areas and need a dedicated safety audit before commercial rollout.
- Home card reordering by latest update timestamp is a requested enterprise contract but current source/docs still show `createdAt desc` as existing behavior.
- Exact current Android compile errors are missing/unknown until Android Studio/Gemini runs sync/assemble and reports the IDE/build output.

## Tool Ownership Model

Cursor:

- Owns monorepo orchestration.
- Owns repo-wide audits.
- Owns context docs and contracts.
- Owns safety guardrails.
- Owns GitHub sync when explicitly asked.
- May inspect Android files and write docs.
- Must not replace Android Studio for Gradle/build/device validation.

Android Studio:

- Owns `apps/android` Gradle sync.
- Owns Android SDK/AGP/Gradle compatibility.
- Owns emulator/device validation.
- Owns Compose previews.
- Owns Logcat/runtime debugging.
- Owns `assembleDebug`, lint, and Android build validation.
- Owns local `google-services.json` placement.

Gemini:

- Owns Android implementation inside Android Studio when prompted by the operator.
- Should read source-cited docs before changing Android.
- Should stabilize compile errors before adding screens.
- Should not touch backend/webhook/Firebase rules/secrets unless explicitly asked.

GitHub:

- Source-of-truth remote: `ynotfins/nfa-alerts-enterprise`.
- Sync should happen only when explicitly requested.
- Current checkout is dirty and must be preserved.

Firebase:

- Production project: `nfa-alerts-v2`.
- Firestore is primary alert data source.
- Firebase deploy and production data mutation are blocked without explicit approval.
- Local emulators are allowed for approved validation with explicit config.

## Testing And Validation Workflow

Docs-only validation for this task:

- Use markdown lint if available.
- If markdown lint is unavailable, use `git diff --check -- CONTEXT_BLOCK.md apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md docs/handoff/CHATGPT_HANDOFF.md`.
- Perform basic readback/format review.
- Run `git status --short`.
- Do not run full web, Android, or Firebase validation for docs-only changes.

Normal web validation before PRs:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:unit`
- `pnpm run build`

Android validation in Android Studio:

- Gradle sync.
- `assembleDebug`.
- Run app on emulator/device.
- Inspect Logcat.
- Lint later.
- Detekt later if configured.

Firebase local validation when explicitly approved:

- `firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore`

## GitHub Sync Workflow

Current task is docs-only and must not commit or push.

When explicitly asked later:

1. Check `git status --short --branch`.
2. Review staged/unstaged/untracked changes.
3. Confirm only intended docs/source changes are included.
4. Never include secrets, `google-services.json`, service accounts, `.env*` values, logs with secrets, keystores, or production data dumps.
5. Use focused commits.
6. Push only when explicitly asked.
7. Open or update PR only when explicitly asked.

## Known Risks And Enforcement Gaps

- Firestore rules allow broad authenticated reads for profiles/incidents/notes/activities and some storage paths; this can expose PII/homeowner data to any authenticated user.
- Firestore rules do not enforce strict schema/type validation.
- Android compile errors currently need stabilization.
- `apps/android/gradle.properties` appears to concatenate two Android properties on one line.
- Android source imports `kotlinx.coroutines.tasks.await`; dependency support should be verified in Android Studio.
- Current Android Home/Details are not implemented.
- Current web Home order is documented as `createdAt desc`, while requested enterprise rebuild wants latest-update ordering.
- `respondToIncident` in web increments `responderCount` while `arrayUnion` deduplicates responders; duplicate taps can drift count.
- Web notification route lacks explicit user auth in route code and should be audited before mobile reuse.
- Incident feed is capped at 50 and filters/search are client-side; not enough for large commercial history without pagination/query design.
- CRM/ERP contact creation is a requirement, but no implementation was found.
- Multi-tenant SaaS, billing, entitlements, and commercial rollout controls are not implemented.
- Old repo service account/key history risk remains documented in `docs/ai/STATE.md`; current clean repo should not reintroduce service-account files.
- Android `google-services.json` is intentionally local-only and must remain ignored.

## Next Recommended Phases

1. Android Studio/Gemini compile stabilization only.
2. Android Home + Details implementation after compile is stable.
3. Android auth/profile/bootstrap and FCM token registration integration.
4. Android offline/error/permission state hardening.
5. Firestore rules/security audit before commercial rollout.
6. Backend normalization hardening: dedupe, latest-update denormalization, responder count reconciliation, notification route auth, audit logging.
7. CRM/ERP contact creation architecture and implementation.
8. Commercial tenancy/account/entitlement architecture.
9. GitHub sync after docs and Android compile work are reviewed.

## Source Reference Index

Inspected or cross-referenced:

- `README.md`
- `AGENTS.md`
- `docs/ai/STATE.md`
- `docs/ai/CLOUD_AGENTS.md`
- `docs/ai/AGENT_OPERATING_MODE.md`
- `docs/ai/ARCHITECTURE_CURRENT.md`
- `docs/ai/SYSTEM_WIRING.md`
- `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md`
- `docs/android/ANDROID_STUDIO_BOOTSTRAP.md`
- `docs/enterprise/MONOREPO_MIGRATION_REPORT.md`
- `docs/enterprise/MONOREPO_MIGRATION_PLAN.md`
- `docs/enterprise/PRODUCTION_SAFETY_GUARDRAILS.md`
- `docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md`
- `package.json`
- `pnpm-workspace.yaml`
- `apps/web/package.json`
- `apps/web/src/lib/db.ts`
- `apps/web/src/app/api/webhook/route.ts`
- `apps/web/src/lib/webhook/parser.ts`
- `apps/web/src/lib/webhook/geocoder.ts`
- `apps/web/src/services/incidents.ts`
- `apps/web/src/hooks/use-incidents.ts`
- `apps/web/src/contexts/auth-context.tsx`
- `apps/web/src/hooks/use-push-notifications.ts`
- `apps/web/src/app/api/notifications/send/route.ts`
- `apps/web/src/app/api/admin/merge-duplicates/route.ts`
- `firebase/firebase.json`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`
- `firebase/storage.rules`
- `apps/android/settings.gradle.kts`
- `apps/android/build.gradle.kts`
- `apps/android/app/build.gradle.kts`
- `apps/android/gradle/libs.versions.toml`
- `apps/android/gradle.properties`
- `apps/android/app/src/main/AndroidManifest.xml`
- `apps/android/app/src/main/java/com/emergency/alerts/**`
- `apps/android/ai-context/**`
- `apps/android/ai-context/screenshots/*.jpg`

Gemini artifact docs requested for inspection were searched by exact filename and were not found in the checkout:

- `architecture_summary.artifact.md`
- `infrastructure_architecture.artifact.md`
- `compatibility_summary.artifact.md`
- `implementation_plan.artifact.md`
- `walkthrough.artifact.md`
- `task.artifact.md`
- `architecture_validation.artifact.md`
