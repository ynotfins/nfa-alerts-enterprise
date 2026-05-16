# Monorepo Migration Report

## Summary

Completed the approved enterprise monorepo migration on branch `chore/enterprise-monorepo-migration`.

The Next.js PWA now lives in `apps/web`, Firebase CLI assets live in `firebase`, and Android is represented only by a placeholder README at `apps/android` for Android Studio to replace later with a real Gradle project.

No Firebase deploy was run. No production Firebase data was modified. No Android Gradle files, Android manifests, or Kotlin source files were created.

## Branch

```text
chore/enterprise-monorepo-migration
```

## File Movement Summary

Moved web app assets into `apps/web`:

```text
src/ -> apps/web/src/
public/ -> apps/web/public/
tests/ -> apps/web/tests/
next.config.ts -> apps/web/next.config.ts
tsconfig.json -> apps/web/tsconfig.json
eslint.config.mjs -> apps/web/eslint.config.mjs
postcss.config.mjs -> apps/web/postcss.config.mjs
vitest.config.ts -> apps/web/vitest.config.ts
components.json -> apps/web/components.json
twa-manifest.json -> apps/web/twa-manifest.json
vercel.json -> apps/web/vercel.json
```

Moved Firebase assets into `firebase`:

```text
firebase.json -> firebase/firebase.json
firestore.rules -> firebase/firestore.rules
firestore.indexes.json -> firebase/firestore.indexes.json
storage.rules -> firebase/storage.rules
cors.json -> firebase/cors.json
```

Created placeholders:

```text
apps/android/README.md
apps/ios/README.md
packages/shared/README.md
packages/config/README.md
docs/android/ANDROID_STUDIO_BOOTSTRAP.md
docs/enterprise/PRODUCTION_SAFETY_GUARDRAILS.md
docs/firebase/FIREBASE_ENVIRONMENT_STRATEGY.md
docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md
```

## Config Changes

- Root `package.json` is now a workspace coordinator with scripts forwarding to `pnpm --filter web`.
- `apps/web/package.json` owns the existing Next.js dependencies, devDependencies, and app scripts.
- `pnpm-workspace.yaml` now declares `apps/*` and `packages/*` while preserving `ignoredBuiltDependencies`.
- `apps/web/vercel.json` now uses `pnpm run build` for the app-root Vercel configuration.
- `firebase/firebase.json` now uses config-relative rule paths because Firebase CLI resolves paths relative to `firebase/firebase.json` when `--config firebase/firebase.json` is used.
- `scripts/next-build.mjs` and `scripts/next-start.mjs` now use a shell for Windows `.cmd` launchers, fixing the migration-exposed `spawnSync next.cmd EINVAL` failure.
- `.gitignore` now covers workspace app outputs and Android Studio/Gradle outputs under `apps/android`.

## Firebase Path Note

The requested moved Firebase config is under `firebase/firebase.json`. In this layout, root-run Firebase CLI commands must pass the config explicitly:

```powershell
firebase use --config firebase/firebase.json
firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

A plain `firebase use` from repo root fails because Firebase CLI does not treat a directory without root `firebase.json` as a Firebase project directory. This is expected after moving the config under `firebase/`.

## Android Boundary

`apps/android` contains only a README placeholder. Android Studio will create the real native project there later.

Android Studio settings remain:

```text
Template: Empty Activity
App name: NFA Alerts
Package: com.emergency.alerts
Language: Kotlin
UI: Jetpack Compose
Build configuration language: Kotlin DSL
Minimum SDK: API 24
Firebase project: nfa-alerts-v2
```

The operator will add `google-services.json` at `apps/android/app/google-services.json` after Android Studio creates the app module.

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm install` | PASS | Workspace install completed. Existing React 19 peer warnings remain for `react-joyride`/`react-floater`. |
| `pnpm --filter web lint` | PASS | 20 warnings, 0 errors. These warnings existed before migration and now report under `apps/web`. |
| `pnpm --filter web typecheck` | PASS | `tsc --noEmit` completed. |
| `pnpm --filter web test:unit` | PASS | 2 files, 40 tests passed. |
| `pnpm --filter web build` | PASS | Next.js production build completed. Firebase Admin missing-credential warnings are expected in build-only environments. |
| `firebase use` | FAIL EXPECTED | Fails from repo root after moving `firebase.json`; use `firebase use --config firebase/firebase.json`. |
| `firebase use --config firebase/firebase.json` | PASS | Reported `nfa-alerts-v2`. |
| `firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore` | PASS | Auth and Firestore emulators reached "All emulators ready" and were stopped after verification. |

## Multitask Cleanup Validation

Follow-up cleanup pass on 2026-05-16 found and fixed only migration-caused path, documentation, and local-artifact issues:

- Added ignore coverage for `.idea/`, `android_bootstrap_backup/`, and `test-results/`; verified `.idea/`, `android_bootstrap_backup/`, `test-results/`, `apps/web/.next/`, and `apps/web/node_modules/` are ignored.
- Corrected active docs that still referenced root `src/`, root `public/`, or plain `firebase use` after the move to `apps/web` and `firebase/firebase.json`.
- Fixed a malformed literal `\n` in the current `docs/ai/STATE.md` migration entry.

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm --filter web lint` | PASS | 20 warnings, 0 errors; warnings match existing lint debt and were not migration-caused. |
| `pnpm --filter web typecheck` | PASS | `tsc --noEmit` completed. |
| `pnpm --filter web test:unit` | PASS | 2 files, 40 tests passed. |
| `pnpm --filter web build` | PASS | Next.js 16.1.1 production build completed; expected build-only Firebase Admin missing-credential warnings appeared. |
| `firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore` | PASS | Auth and Firestore emulators reached "All emulators ready" with config-relative rules and were stopped after verification. |

## Failures And Fixes

1. `pnpm --filter web build` initially failed before Next.js output.
   - Cause: Node `spawnSync('next.cmd', ..., { shell: false })` fails on Windows command shims with `EINVAL` from the relocated workspace execution path.
   - Fix: Use `shell: process.platform === "win32"` in `scripts/next-build.mjs` and `scripts/next-start.mjs`, and report wrapper errors.

2. First Firebase emulator run warned that `firebase/firebase/firestore.rules` did not exist and would allow all reads/writes.
   - Cause: With `--config firebase/firebase.json`, Firebase CLI resolves paths relative to the config file directory.
   - Fix: Change `firebase/firebase.json` paths to `firestore.rules`, `firestore.indexes.json`, and `storage.rules`.

3. Plain `firebase use` failed.
   - Cause: Firebase CLI expects a root `firebase.json` for that exact command.
   - Resolution: Use `firebase use --config firebase/firebase.json` in the moved-config layout.

## Production Safety Confirmation

- `firebase deploy` was not run.
- No production Firebase data was modified.
- Firestore and Storage rule/index contents were not intentionally changed; only their file locations and config references changed.
- No Android Gradle files were created.
- No Android screens were implemented.
- No subscription logic was added.
- Android webhook calls were not added.

## Remaining Follow-Ups

- Configure Vercel project Root Directory to `apps/web`, or ensure deployment uses `apps/web/vercel.json`.
- Update VPS scripts before any VPS deployment from the monorepo layout.
- Let Android Studio create the native Gradle project at `apps/android`.
- Decide later whether to keep `firebase use --config firebase/firebase.json` as the documented Firebase workflow or add a root Firebase shim in a separate approved task.
