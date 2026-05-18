# ChatGPT Handoff: NFA Alerts Enterprise Rebuild

Last updated: 2026-05-17

This handoff is written for a new ChatGPT conversation. It summarizes the current local checkout and the required rules for continuing the NFA Alerts commercial enterprise rebuild without losing context.

## Current State Summary

Repository:

- Local path: `D:\github\nfa-alerts-enterprise`
- GitHub repo: `ynotfins/nfa-alerts-enterprise`
- Current branch from `git status --short --branch`: `feature/android-infrastructure-wiring...origin/feature/android-infrastructure-wiring`
- Working tree caveat: dirty checkout with staged/modified Android infrastructure files and several untracked artifacts. Do not reset, clean, stash, switch branches, commit, or push unless explicitly asked.

Product:

- NFA Alerts is a commercial emergency-response coordination platform.
- Native Android is now the priority.
- The existing mobile-first Next.js PWA remains under `apps/web`.
- Android Studio owns native Android Gradle/build/device validation.
- Cursor owns monorepo orchestration, audits, context docs, contracts, safety guardrails, and GitHub sync.
- Gemini owns Android implementation inside Android Studio.

Main task status:

- Enterprise monorepo migration already happened.
- Web/PWA remains functional in `apps/web`.
- Firebase config moved to `firebase/`.
- Native Android project exists in `apps/android`.
- Android infrastructure has been introduced, but compile stabilization is still needed.
- Home and Details screens are not implemented yet.

## All Relevant Project Facts

Repo structure:

- `apps/web`: Next.js PWA and API routes.
- `apps/android`: Android Studio-owned native Android app.
- `apps/ios`: future iOS placeholder.
- `packages/shared`: future shared contracts/utilities placeholder.
- `packages/config`: future shared config placeholder.
- `firebase`: Firebase CLI config, Firestore rules/indexes, Storage rules, CORS.
- `docs`: project architecture, AI state, Android specs, enterprise docs, commercial planning.
- `scripts`: repo automation/deploy helpers.

Firebase:

- Firebase project: `nfa-alerts-v2`.
- Firebase config path: `firebase/firebase.json`.
- Firestore rules: `firebase/firestore.rules`.
- Firestore indexes: `firebase/firestore.indexes.json`.
- Storage rules: `firebase/storage.rules`.
- Do not run `firebase deploy` without explicit approval.
- Do not modify production Firebase data.

Web:

- App path: `apps/web`.
- Next.js App Router `16.1.1`.
- React `19.2.3`.
- Package manager: pnpm `10.33.0`.
- Root package scripts forward to `pnpm --filter web`.
- Webhook route: `apps/web/src/app/api/webhook/route.ts`.
- Parser: `apps/web/src/lib/webhook/parser.ts`.
- Geocoder: `apps/web/src/lib/webhook/geocoder.ts`.
- Firebase Admin: `apps/web/src/lib/firebase-admin.ts`.
- Firestore contracts: `apps/web/src/lib/db.ts`.

Android:

- Android path: `D:\github\nfa-alerts-enterprise\apps\android`.
- Package/application ID: `com.emergency.alerts`.
- Native Android only.
- Kotlin + Jetpack Compose + Material 3.
- MVVM + Repository pattern + Hilt + Flow/StateFlow.
- Firebase Auth + Cloud Firestore + FCM.
- Location/distance infrastructure exists.
- `NFAAlertsApplication` exists.
- `MainActivity` is still a default Hello Android shell.
- `google-services.json` must stay local at `apps/android/app/google-services.json` and must not be committed.

Android infrastructure currently present:

- Gradle: `settings.gradle.kts`, root `build.gradle.kts`, app `build.gradle.kts`, `gradle/libs.versions.toml`, `gradle.properties`.
- Domain models: `Incident`, `HomeFeedIncident`, `Profile`, `Chat`.
- Repository interfaces: Auth, Incident, Chat, Location.
- DTOs/mappers: Firestore DTOs and domain mappers.
- Firebase repository implementations: Auth, Incident, Chat.
- Hilt modules: Firebase and repository bindings.
- FCM service.
- Android location repository.
- Result wrapper.
- Application class.

## Important Decisions Made

1. Firestore remains the primary alert data source.
2. Android consumes normalized Firestore docs only.
3. Android must not parse raw alerts.
4. Android must not call the Next.js webhook.
5. Backend owns alert ingestion, parsing, normalization, geocoding, dedupe, aggregation, and future CRM/ERP contact creation.
6. Home shows one card per alert/incident, with latest update only.
7. Details shows full timeline for that incident/alert.
8. Distance is calculated client-side from device location and incident coordinates.
9. Android Studio owns Android Gradle/build/device validation.
10. Cursor may inspect/write docs and orchestrate repo work, but should not replace Android Studio.
11. Gemini should do Android implementation inside Android Studio.
12. `google-services.json` stays local and ignored.
13. Do not migrate the primary alert system to Firebase Realtime Database.

## Toolchain

Repo/web:

- Node documented in current docs as `v22.22.x`.
- pnpm `10.33.0`.
- Next.js `16.1.1`.
- React `19.2.3`.
- TypeScript `^5`.
- Vitest `^4.0.8`.
- Firebase JS SDK `^12.6.0`.
- Firebase Admin `^13.6.0`.
- OpenAI through `@ai-sdk/openai`.

Android:

- Android Studio owns validation.
- AGP `8.3.1`.
- Kotlin `2.0.21`.
- KSP `2.0.21-1.0.25`.
- Compose BOM `2024.04.01`.
- Firebase BOM `33.1.0`.
- Hilt `2.51.1`.
- Navigation Compose `2.7.7`.
- Play Services Location `21.2.0`.
- Timber `5.0.1`.
- compileSdk `36`, targetSdk `36`, minSdk `24`.

Firebase:

- Project: `nfa-alerts-v2`.
- Firestore primary database.
- Storage rules present.
- Auth/Firestore emulators configured.

## Android Setup History

Known history from docs/memory/current files:

- The monorepo migration originally created only an Android placeholder under `apps/android`.
- Android Studio later created the native Gradle project under `apps/android`.
- Android package is `com.emergency.alerts`.
- Android Studio/Gemini introduced Android infrastructure wiring:
  - Gradle dependencies.
  - Firebase/Hilt/Compose/Navigation/Location/Timber wiring.
  - Domain models.
  - DTOs and mappers.
  - Repositories and interfaces.
  - Hilt modules.
  - FCM service.
  - Location repository.
  - Result wrapper.
  - `NFAAlertsApplication`.
- Reported current status: Gradle sync passed after a KSP compatibility fix, but infrastructure implementation introduced compile errors that need stabilization.
- This handoff task did not run Gradle.

Known compile-stabilization clues:

- `apps/android/gradle.properties` appears to concatenate `android.useAndroidX=true` and `android.suppressUnsupportedCompileSdk=36`.
- `FirebaseAuthRepositoryImpl.kt` imports `kotlinx.coroutines.tasks.await`; verify the correct coroutine dependency.
- FCM token value logging should be removed or redacted.
- Location/notification permissions may need Android manifest/runtime handling before real device validation.

## Firebase Setup History

Known history:

- Firebase project is `nfa-alerts-v2`.
- Firebase config moved from repo root to `firebase/`.
- `firebase/firebase.json` uses config-relative paths.
- Previous validation documented Auth/Firestore emulators reaching "All emulators ready" with:

```powershell
firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

- Firestore rules and indexes were moved, not intentionally changed, during monorepo migration.
- Production deploy was not run during migration.
- Production data was not modified during migration.

Security history:

- Old repo service account/key history risk is documented in `docs/ai/STATE.md`; do not reintroduce service account files.
- Current repo should load Firebase Admin credentials from environment only.
- Do not print or store secret values.

## Monorepo Migration History

The project was migrated into an enterprise monorepo:

- Next.js PWA moved to `apps/web`.
- Firebase config/rules/indexes/storage/cors moved to `firebase/`.
- Root `package.json` became a workspace coordinator.
- `apps/web/package.json` owns web dependencies/scripts.
- `pnpm-workspace.yaml` declares `apps/*` and `packages/*`.
- Android path established at `apps/android`.
- iOS and shared/config placeholders exist for future expansion.
- Docs were added for enterprise migration, Android Studio bootstrap, Firebase environment strategy, commercial subscription planning, and agent operation.

Current migration caveat:

- Some historical docs may still mention older paths; use current source and current docs over old historical notes.

## GitHub And PR History

Discoverable from local docs/memory:

- Clean repository was published to GitHub as private repo `ynotfins/nfa-alerts-enterprise`.
- Earlier local docs mention initial pushed commit `4f32070`.
- Monorepo migration branch/history used `chore/enterprise-monorepo-migration`.
- Current branch is `feature/android-infrastructure-wiring`.
- Memory indicates branch `feature/android-infrastructure-wiring` had an Android infrastructure foundation synced to GitHub at commit `560fc98`, but current local working tree is dirty with additional staged/modified Android infrastructure files.
- Previous PR automation merged PR #7 and PR #9 according to memory; verify with GitHub before relying on exact PR status.

Current GitHub rule:

- Do not commit, push, or open/update PR unless explicitly asked.

## Cursor/Gemini Division Of Labor

Cursor should:

- Inspect current repo state.
- Update docs/context/handoff files.
- Audit safety and contracts.
- Keep repo-wide state coherent.
- Avoid modifying Android source/Gradle unless explicitly requested.
- Avoid Firebase deploys and production data changes.
- Handle GitHub sync only when explicitly asked.

Gemini in Android Studio should:

- Fix Android compile errors.
- Run Gradle sync.
- Run `assembleDebug`.
- Run the app on emulator/device.
- Implement native Android screens after compile is stable.
- Use Android Studio evidence and Logcat.

Android Studio should:

- Be the validation authority for Android build and runtime.
- Own `google-services.json` local placement.
- Own emulator/device checks.

## What The Next Assistant Should Do First

If the next assistant is working in Cursor:

1. Read `CONTEXT_BLOCK.md`.
2. Read `apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md`.
3. Read this file.
4. Run `git status --short --branch`.
5. Preserve dirty/untracked user/Android Studio changes.
6. If doing docs only, do not run full web/Android/Firebase validation.
7. If asked to sync GitHub, inspect diffs carefully and exclude secrets/local artifacts.

If the next assistant is working in Android Studio/Gemini:

1. Open `D:\github\nfa-alerts-enterprise\apps\android`.
2. Read `apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md`.
3. Run Gradle sync.
4. Run `assembleDebug`.
5. Fix compile errors before adding UI.
6. Do not touch web/backend/Firebase rules/secrets.

## What The Next Assistant Must Not Do

Do not:

- Run `firebase deploy` without explicit approval.
- Modify production Firebase data.
- Commit or expose secrets.
- Commit `google-services.json`.
- Commit service account JSON.
- Commit `.env*` except `.env.example` with empty assignments only.
- Reset, clean, stash, switch branches, or revert unrelated changes.
- Commit or push unless explicitly asked.
- Modify `apps/web` when the task is Android compile/UI only.
- Modify `firebase/firestore.rules` or `firebase/firestore.indexes.json` unless asked for a rules task.
- Add raw alert parsing to Android.
- Add Android calls to `POST /api/webhook`.
- Move primary alerts to Realtime Database.
- Treat Android DTO filtering as a security boundary.

## Prompt Library

### 1. Cursor Repo Audit Prompt

```text
Repo: D:\github\nfa-alerts-enterprise
GitHub: ynotfins/nfa-alerts-enterprise

Perform a documentation-only repo audit for the NFA Alerts enterprise rebuild.

First read:
- CONTEXT_BLOCK.md
- apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md
- docs/handoff/CHATGPT_HANDOFF.md
- AGENTS.md
- docs/ai/STATE.md
- README.md

Then inspect current source only as needed:
- apps/web
- apps/android
- apps/android/ai-context
- firebase/firestore.rules
- firebase/firestore.indexes.json
- package.json
- pnpm-workspace.yaml
- apps/web/package.json

Rules:
- Do not modify source code.
- Do not run firebase deploy.
- Do not modify production Firebase data.
- Do not expose secrets.
- Do not commit google-services.json.
- Preserve dirty/untracked local changes.
- Label unknown facts as missing/unknown.

Return:
- current branch/state
- source files inspected
- Android compile/status caveats
- Firestore/backend contract summary
- missing/unknown facts
- next recommended action
```

### 2. Android Studio Compile-Fix Prompt

```text
You are in Android Studio working on:
D:\github\nfa-alerts-enterprise\apps\android

Goal: fix all current Gradle sync and compile errors without adding Home/Details screens yet.

Read first:
- D:\github\nfa-alerts-enterprise\CONTEXT_BLOCK.md
- D:\github\nfa-alerts-enterprise\apps\android\ANDROID_STUDIO_CONTEXT_BLOCK.md
- apps/android/settings.gradle.kts
- apps/android/build.gradle.kts
- apps/android/app/build.gradle.kts
- apps/android/gradle/libs.versions.toml
- apps/android/gradle.properties
- apps/android/app/src/main/AndroidManifest.xml
- all Kotlin under apps/android/app/src/main/java/com/emergency/alerts

Hard rules:
- Keep package/application ID com.emergency.alerts.
- Native Android only.
- Do not touch apps/web.
- Do not touch firebase rules/indexes.
- Do not run firebase deploy.
- Do not modify production Firebase data.
- Do not expose or commit secrets.
- Keep google-services.json local and ignored.
- Android must not parse raw alerts.
- Android must not call webhook/admin routes.

Task:
- Run Gradle sync and assembleDebug.
- Fix exact compile errors from Android Studio.
- Check malformed gradle.properties line.
- Verify dependency support for kotlinx.coroutines.tasks.await.
- Remove/redact FCM token value logging.
- Add only minimal missing Android dependencies/permissions needed for compile/runtime correctness.
- Leave unimplemented repository behavior as compiling TODO-safe code; do not build screens yet.

Success:
- Gradle sync passes.
- assembleDebug passes.
- No secrets in source/log output.
- Report files changed and validation result.
```

### 3. Home/Details Implementation Prompt

```text
You are in Android Studio working on:
D:\github\nfa-alerts-enterprise\apps\android

Only start after Gradle sync and assembleDebug pass.

Goal: implement native Android Home and Alert Details for NFA Alerts using Firestore-first architecture.

Read first:
- D:\github\nfa-alerts-enterprise\CONTEXT_BLOCK.md
- D:\github\nfa-alerts-enterprise\apps\android\ANDROID_STUDIO_CONTEXT_BLOCK.md
- docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md
- apps/android/ai-context/ALERT_ARCHITECTURE.md
- apps/android/ai-context/PARSING_CONTRACT.md
- apps/android/ai-context/FIRESTORE_MODEL.md
- apps/android/ai-context/UI_RULES.md
- apps/android/ai-context/DESIGN_SYSTEM.md
- firebase/firestore.rules
- firebase/firestore.indexes.json
- apps/web/src/lib/db.ts
- apps/web/src/services/incidents.ts
- screenshots under apps/android/ai-context/screenshots

Hard rules:
- Kotlin + Jetpack Compose + Material 3.
- MVVM + Repository pattern + Hilt + Flow/StateFlow.
- Firebase Auth + Cloud Firestore + FCM.
- Android consumes normalized Firestore docs only.
- Android must not parse raw alerts.
- Android must not call POST /api/webhook.
- Backend owns parsing, normalization, geocoding, CRM/ERP creation, dedupe, alert aggregation.
- Home shows one card per alertId/incident with latest update only.
- Details shows full timeline for the same alertId/incident.
- Distance is calculated client-side from user location and incident lat/lng.
- Keep Cloud Firestore; do not migrate primary alerts to Realtime Database.
- Do not modify apps/web or firebase rules/indexes.
- Do not run firebase deploy.
- Do not expose secrets.

Implement:
- Compose navigation shell if needed.
- Home feed with compact operational cards, severity/status styling, distance, loading/empty/error/offline states.
- Latest-update ordering for enterprise behavior, while preserving one card per incident.
- Details screen with incident summary, geocoded map/address area, full activity timeline, and notes scaffold.
- ViewModels using Flow/StateFlow and repositories; no direct Firestore logic in Composables.

Validate:
- Gradle sync.
- assembleDebug.
- Run app on emulator/device.
- Tapping Home card opens Details for same incident.
- No webhook/admin calls or raw parser code in Android.
```

### 4. GitHub Sync Prompt

```text
Repo: D:\github\nfa-alerts-enterprise
GitHub: ynotfins/nfa-alerts-enterprise

Prepare GitHub sync for the current requested work only.

First:
- Run git status --short --branch.
- Run git diff for staged and unstaged changes.
- Inspect untracked files.
- Verify no secrets, google-services.json, service account JSON, .env values, keystores, or logs with secret values are included.
- Preserve unrelated dirty/untracked artifacts.

Rules:
- Do not reset, clean, stash, switch branches, or revert user changes.
- Do not commit or push unless the user explicitly asked in this message.
- If committing, use a focused commit message and include only relevant files.
- If pushing/opening PR, return the PR URL.
- Do not run firebase deploy.
- Do not modify production Firebase data.

Return:
- branch/state
- files intended for commit
- files excluded and why
- validation performed
- commit/push/PR result if explicitly requested
```

### 5. Safety Audit Prompt

```text
Repo: D:\github\nfa-alerts-enterprise

Perform a safety audit for the NFA Alerts enterprise rebuild.

Read:
- CONTEXT_BLOCK.md
- apps/android/ANDROID_STUDIO_CONTEXT_BLOCK.md
- docs/handoff/CHATGPT_HANDOFF.md
- AGENTS.md
- docs/ai/STATE.md
- firebase/firestore.rules
- firebase/firestore.indexes.json
- firebase/storage.rules
- apps/web/src/app/api/webhook/route.ts
- apps/web/src/app/api/notifications/send/route.ts
- apps/web/src/lib/firebase-admin.ts
- apps/web/src/services/incidents.ts
- apps/android/app/src/main/AndroidManifest.xml
- apps/android/app/src/main/java/com/emergency/alerts/**
- .gitignore

Rules:
- Documentation/audit only unless explicitly asked to fix.
- Do not print secrets.
- Do not inspect local google-services.json values.
- Do not run firebase deploy.
- Do not modify production Firebase data.
- Do not reset/clean/stash/switch branches.

Audit for:
- Secret exposure risks.
- google-services.json tracking risk.
- Android webhook/raw parser violations.
- Firestore rule overexposure.
- Notification route auth/membership gaps.
- Responder count drift.
- Latest-update ordering gaps.
- CRM/ERP missing integration.
- Realtime Database migration risk.
- Android compile/build ownership violations.

Return findings first by severity, with file references and exact recommended next actions.
```

## Missing/Unknown Facts

These are missing or unknown from inspected files:

- Exact current Android compile errors; Gradle was not run in this docs-only pass.
- Exact local `google-services.json` presence/content; do not inspect values.
- Exact Firebase Console Android app registration state.
- Exact current emulator/device validation state.
- Exact Gemini-created artifact docs requested by filename; searched exact names and none were found:
  - `architecture_summary.artifact.md`
  - `infrastructure_architecture.artifact.md`
  - `compatibility_summary.artifact.md`
  - `implementation_plan.artifact.md`
  - `walkthrough.artifact.md`
  - `task.artifact.md`
  - `architecture_validation.artifact.md`
- Exact CRM/ERP product/schema/trigger; current repo documents the requirement but no implementation was found.
- Exact commercial tenant/billing/entitlement implementation; current docs say this needs a future dedicated architecture task.
- Whether Home should reorder by `updatedAt`, latest activity timestamp, or a new denormalized `latestActivityAt`; the enterprise requirement says latest update timestamp, while current web source/docs use `createdAt desc`.

## DO NOT LOSE THESE RULES

- Best commercial enterprise option first.
- Android Studio owns Android Gradle/build/device validation.
- Cursor owns repo orchestration and GitHub sync.
- Gemini owns Android implementation inside AS.
- Android must not parse raw alerts.
- Android must not call webhook.
- Backend owns parsing, normalization, geocoding, CRM/ERP creation, dedupe, alert aggregation.
- Android consumes normalized Firestore docs only.
- Home shows one card per alertId with latest update only.
- Details shows full timeline for alertId.
- Distance is calculated client-side from user location and incident lat/lng.
- Keep Cloud Firestore, do not migrate primary alert system to Realtime Database.
- google-services.json stays local and ignored.
- Never run firebase deploy without explicit approval.
