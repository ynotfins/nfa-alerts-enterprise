# Monorepo Migration Plan

## Scope And Safety

This plan covers the audit-only first step for converting `D:\github\nfa-alerts-enterprise` into a commercial enterprise monorepo. No files have been moved by this plan.

Hard constraints:

- Do not run `firebase deploy`.
- Do not modify production Firebase data.
- Do not delete files during migration.
- Use `git mv` for tracked files where possible to preserve history.
- Preserve the Next.js PWA behavior and existing webhook route functionality.
- Preserve environment variable names.
- Preserve Firebase rules/index contents unless path references must change.
- Keep Android as a standalone Gradle project under `apps/android`.
- Do not generate Android Gradle files manually unless explicitly requested.
- Do not fight Android Studio's generated Gradle structure.
- Treat Android Studio as the owner of Android Gradle bootstrap, SDK setup, Gradle sync, emulator/device validation, Compose preview validation, Logcat validation, and Android build validation.
- Do not add subscriptions, new app features, or Android webhook calls.
- Stop after this plan until migration approval is given.

## Current File Structure

The repo is currently a root-oriented Next.js application with Firebase and Android-related files mixed at the repository root.

Current high-level structure:

```text
D:\github\nfa-alerts-enterprise\
  .cursor/
  .github/
  .idea/
  .agents/
  android_bootstrap_backup/
  docs/
  memory-bank/
  prompts/
  public/
  screenshots/
  scripts/
  src/
  tests/
  .env.example
  .firebaserc
  .gitignore
  AGENTS.md
  components.json
  cors.json
  eslint.config.mjs
  firebase.json
  firestore.indexes.json
  firestore.rules
  next.config.ts
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  postcss.config.mjs
  README.md
  storage.rules
  tsconfig.json
  twa-manifest.json
  vercel.json
  vitest.config.ts
```

Current web-owned root surface:

- `src/`: Next.js App Router, API routes, proxy, components, hooks, services, schemas, contexts, Firebase client/admin code, and webhook ingestion code.
- `public/`: PWA manifest, service workers, static assets, and notification sound.
- `tests/`: Vitest tests and mocks.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `components.json`: web app configuration.
- Root `package.json`: currently owns all Next.js dependencies and scripts.

Current Firebase-owned root surface:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `.firebaserc`
- `cors.json`

Current Android status:

- `android/` is absent.
- The old partial `android/` folder was intentionally deleted so Android Studio can create a clean native project later.
- `google-services.json` is held separately by the operator and should be added back only after Android Studio creates the app module.
- Cursor must not create Android Gradle files as part of monorepo migration. Android Studio must create, sync, validate, and build the native Android project.
- The future Android app must use Firebase project `nfa-alerts-v2` and package `com.emergency.alerts`.

## Proposed Target File Structure

Target high-level structure:

```text
D:\github\nfa-alerts-enterprise\
  .cursor/
  .github/
  apps/
    web/
    android/
    ios/
  packages/
    shared/
    config/
  firebase/
    firebase.json
    firestore.rules
    firestore.indexes.json
    storage.rules
    cors.json
  docs/
    android/
    enterprise/
    firebase/
  scripts/
  .env.example
  .firebaserc
  .gitignore
  AGENTS.md
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  README.md
```

`apps/web` becomes the Next.js project root. `apps/android` becomes the Android Studio project root after migration. Firebase CLI configuration is grouped under `firebase/`, while `.firebaserc` remains at repo root for project aliasing.

## Exact Files And Folders To Move

Move web app files into `apps/web`:

```text
src/                         -> apps/web/src/
public/                      -> apps/web/public/
tests/                       -> apps/web/tests/
next.config.ts               -> apps/web/next.config.ts
tsconfig.json                -> apps/web/tsconfig.json
eslint.config.mjs            -> apps/web/eslint.config.mjs
postcss.config.mjs           -> apps/web/postcss.config.mjs
vitest.config.ts             -> apps/web/vitest.config.ts
components.json              -> apps/web/components.json
twa-manifest.json            -> apps/web/twa-manifest.json
```

Move or split package ownership:

```text
package.json                 -> split into root package.json and apps/web/package.json
```

The existing dependency and script surface should move into `apps/web/package.json`. The root `package.json` should become a workspace coordinator with forwarding scripts.

Move Firebase files:

```text
firebase.json                -> firebase/firebase.json
firestore.rules              -> firebase/firestore.rules
firestore.indexes.json       -> firebase/firestore.indexes.json
storage.rules                -> firebase/storage.rules
cors.json                    -> firebase/cors.json
```

Create Android placeholder only:

```text
apps/android/                -> placeholder directory only
```

Because `android/` is absent, there is no Android project to move. Create `apps/android/README.md` or `.gitkeep` only. Android Studio will create the real Gradle project directly at `D:\github\nfa-alerts-enterprise\apps\android` after the monorepo structure exists.

Create future app/package placeholders only after approval:

```text
apps/ios/
apps/android/
packages/shared/
packages/config/
docs/android/
docs/firebase/
docs/commercial/
```

These should start with minimal documentation/package placeholders only if needed by tooling. No new runtime features should be implemented during migration.

## Files And Folders To Leave At Root

Keep these at repo root:

```text
.cursor/
.github/
.agents/
docs/
memory-bank/
prompts/
scripts/
screenshots/
.env.example
.firebaserc
.gitignore
AGENTS.md
README.md
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
```

Notes:

- `.firebaserc` should stay at root with aliases for `nfa-alerts-v2`.
- `.env.example` should stay at root unless deployment policy later requires app-specific examples. Preserve the current variable names exactly.
- `.github/` stays root because GitHub Actions must remain repo-level.
- `scripts/` stays root initially, but web-specific scripts should be updated to support `apps/web` as their working directory.
- `screenshots/` and existing Android UI spec docs can remain documentation/reference assets.
- Do not leave or recreate a root `android/` folder during monorepo migration.

## Package.json Changes Required

Root `package.json` should become a workspace coordinator:

```json
{
  "name": "nfa-alerts-enterprise",
  "private": true,
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "start": "pnpm --filter web start",
    "lint": "pnpm --filter web lint",
    "lint:ci": "pnpm --filter web lint:ci",
    "lint:strict": "pnpm --filter web lint:strict",
    "typecheck": "pnpm --filter web typecheck",
    "test": "pnpm --filter web test",
    "test:unit": "pnpm --filter web test:unit",
    "test:ui": "pnpm --filter web test:ui"
  }
}
```

Create `apps/web/package.json` from the current root `package.json`:

- Set `"name": "web"`.
- Keep `"private": true`.
- Keep existing Next.js scripts, but update build/start wrappers if they remain root-owned.
- Move current dependencies and devDependencies into `apps/web/package.json`.

Two viable wrapper options:

1. Keep web wrappers at root under `scripts/` and call them from `apps/web/package.json` as `node ../../scripts/next-build.mjs` and `node ../../scripts/next-start.mjs`.
2. Move web-specific wrappers to `apps/web/scripts/` and keep root `scripts/` for repo-level automation.

Recommended migration path: keep root `scripts/` in place for the first migration pass and update `apps/web/package.json` scripts to call `../../scripts/next-build.mjs` and `../../scripts/next-start.mjs`. This minimizes script movement while validating the app relocation.

## pnpm-workspace.yaml Changes Required

Current `pnpm-workspace.yaml` only contains `ignoredBuiltDependencies`. It must become a real workspace file while preserving the ignored build dependency settings:

```yaml
packages:
  - "apps/*"
  - "packages/*"

ignoredBuiltDependencies:
  - "@firebase/util"
  - esbuild
  - protobufjs
  - sharp
  - unrs-resolver
```

After package movement, run `pnpm install` from the repo root to update importer paths in `pnpm-lock.yaml` from `.` to `apps/web`.

## Next.js Config Path Impacts

`next.config.ts` should move to `apps/web/next.config.ts`.

Current config is minimal and only sets Server Actions body size:

```ts
experimental: {
  serverActions: {
    bodySizeLimit: "5mb",
  },
},
```

Path impacts:

- `src/proxy.ts` must remain under the Next app source root as `apps/web/src/proxy.ts`.
- `src/app/api/webhook/route.ts` must remain at `apps/web/src/app/api/webhook/route.ts`; this preserves the `/api/webhook` route.
- `public/sw.js`, `public/firebase-messaging-sw.js`, and `public/manifest.json` must move with the web app to `apps/web/public/` so the deployed app still serves them from `/sw.js`, `/firebase-messaging-sw.js`, and `/manifest.json`.
- Do not deploy the web app under a URL subpath; the PWA and service workers assume root scope.

## TypeScript Config Impacts

`tsconfig.json` should move to `apps/web/tsconfig.json`.

Current path aliases:

```json
"paths": {
  "@/*": ["./src/*"],
  "@convex/*": ["./convex/*"]
}
```

Path impacts:

- `@/*` remains valid if `tsconfig.json` moves with `src/` into `apps/web`.
- The `@convex/*` alias currently points to `./convex/*`; no `convex/` app directory was found in the audit. Keep the alias during the first migration unless validation proves it is dead.
- `include` patterns like `next-env.d.ts`, `.next/types/**/*.ts`, `.next/dev/types/**/*.ts`, and `**/*.ts(x)` remain valid when scoped inside `apps/web`.
- Root TypeScript commands should call `pnpm --filter web typecheck`.

## Tailwind, PostCSS, And shadcn Impacts

Tailwind status:

- No `tailwind.config.ts` file was found.
- The app uses Tailwind CSS v4 through `postcss.config.mjs`.

Move `postcss.config.mjs` to `apps/web/postcss.config.mjs` unchanged:

```js
plugins: {
  "@tailwindcss/postcss": {},
}
```

Move `components.json` to `apps/web/components.json`.

Current shadcn paths:

```json
"tailwind": {
  "config": "",
  "css": "src/app/globals.css"
},
"aliases": {
  "components": "@/components",
  "utils": "@/lib/utils",
  "ui": "@/components/ui",
  "lib": "@/lib",
  "hooks": "@/lib/hooks"
}
```

These remain valid if `components.json`, `tsconfig.json`, and `src/` all move together into `apps/web`.

## Firebase Config Path Impacts

Current `firebase.json` is root-relative:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

Target location is `firebase/firebase.json`.

Recommended target config when Firebase CLI commands are run from repo root with `--config firebase/firebase.json`. Firebase CLI resolves rule paths relative to the config file directory:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```

Validation must confirm Firebase CLI path resolution with:

```powershell
firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

Do not run `firebase deploy`. Do not change rule/index contents beyond path relocation.

`.firebaserc` remains at root:

```json
{
  "projects": {
    "default": "nfa-alerts-v2",
    "prod": "nfa-alerts-v2"
  }
}
```

## Vercel Deployment Impacts

Current `vercel.json` is root-based:

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

Required changes:

- Prefer configuring Vercel Project Settings > Root Directory to `apps/web`.
- Move `vercel.json` into `apps/web/vercel.json` or keep a root `vercel.json` only if Vercel is intentionally run from the repo root.
- Change build command to pnpm:

```json
"buildCommand": "pnpm run build"
```

If Vercel root remains repository root, use:

```json
"buildCommand": "pnpm --filter web build"
```

Recommendation: set Vercel Root Directory to `apps/web` and keep app-specific Vercel config in `apps/web/vercel.json`.

## GitHub Actions Impacts

Current `.github/workflows/ci.yml` runs root scripts:

```yaml
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint:ci
pnpm run test:unit
pnpm run build
```

Two compatible paths:

1. Keep root forwarding scripts as listed above. CI commands can remain unchanged.
2. Change CI commands explicitly to `pnpm --filter web typecheck`, `pnpm --filter web lint:ci`, `pnpm --filter web test:unit`, and `pnpm --filter web build`.

Recommended migration path: keep root forwarding scripts so existing CI command shape remains stable, then optionally make CI filter-explicit in a later cleanup.

CI cache remains `pnpm` at repo root.

## Android Studio Path Impacts

Current rule:

- Cursor opens repo root.
- Android Studio opens only the Android project.
- Cursor may inspect Android files, write docs, and propose Android changes.
- Cursor must not replace Android Studio for Gradle project bootstrap, Android SDK setup, Android Gradle Plugin setup, emulator/device validation, Compose preview validation, Logcat/debug validation, or build validation.

After migration:

- Cursor opens `D:\github\nfa-alerts-enterprise`.
- Android Studio opens `D:\github\nfa-alerts-enterprise\apps\android`.
- All Android source and Gradle files must live inside `apps/android`.
- `apps/android/app/google-services.json` must retain package `com.emergency.alerts` and project `nfa-alerts-v2`.

Android Studio should create or open the native app at `D:\github\nfa-alerts-enterprise\apps\android` after the monorepo skeleton exists. Do not recreate `D:\github\nfa-alerts-enterprise\android`.

Android Studio New Project settings if the project is not valid yet:

```text
Template: Empty Activity
App name: NFA Alerts
Package name: com.emergency.alerts
Language: Kotlin
UI: Jetpack Compose
Build configuration language: Kotlin DSL
Minimum SDK: API 24
Firebase project: nfa-alerts-v2
Location after migration: D:\github\nfa-alerts-enterprise\apps\android
Firebase config path: app/google-services.json inside the Android app module
```

Because `android/` is absent now, the migration should not move Android project files. It should create `apps/android` as a placeholder and document that Android Studio will create the actual Gradle project there later. After Android Studio creates the app module, the operator will add `google-services.json` at `apps/android/app/google-services.json`.

## Documentation And Agent Instruction Impacts

Docs that should be updated during migration:

- `AGENTS.md`: update commands and paths from root app to monorepo layout.
- `README.md`: document root workspace commands and app-specific paths.
- `docs/ai/CLOUD_AGENTS.md`: update install/validate/dev commands and Vercel root assumptions.
- `docs/ai/AGENT_OPERATING_MODE.md`: update normal validation commands if root forwarding scripts change.
- `docs/ai/STATE.md`: add migration summary and validation evidence.
- `docs/android-ui-spec/**`: update source references from `src/...` to `apps/web/src/...` where relevant.
- `docs/enterprise/MONOREPO_MIGRATION_REPORT.md`: create after migration.
- `docs/enterprise/PRODUCTION_SAFETY_GUARDRAILS.md`: create after migration.
- `docs/android/ANDROID_NATIVE_IMPLEMENTATION_PLAN.md`: create after migration.
- `docs/firebase/FIREBASE_ENVIRONMENT_STRATEGY.md`: create after migration.

## Environment Variable Impacts

Preserve current env names exactly:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
WEB_PUSH_PRIVATE_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
OPENAI_API_KEY
WEBHOOK_AUTH_TOKEN
SITE_URL
NEXT_PUBLIC_GOOGLE_MAP_ID
CONTEXT7_SECRET_KEY
```

Do not commit `.env*` files except `.env.example`, and keep `.env.example` values empty.

## Rollback Plan

Rollback must be possible without deleting files.

Before migration:

```powershell
git status --short
git branch --show-current
git switch -c chore/monorepo-migration
```

After each stage:

```powershell
git status --short
pnpm install
pnpm run typecheck
pnpm run lint:ci
pnpm run test:unit
pnpm run build
```

If a stage fails and cannot be fixed locally:

```powershell
git status --short
git diff --stat
```

Then reverse only the current stage with explicit `git mv` commands. Do not use `git reset --hard` unless explicitly approved.

Example reverse moves:

```powershell
git mv apps/web/src src
git mv apps/web/public public
git mv apps/web/tests tests
git mv apps/web/next.config.ts next.config.ts
git mv apps/web/tsconfig.json tsconfig.json
git mv apps/web/eslint.config.mjs eslint.config.mjs
git mv apps/web/postcss.config.mjs postcss.config.mjs
git mv apps/web/vitest.config.ts vitest.config.ts
git mv apps/web/components.json components.json
git mv apps/web/twa-manifest.json twa-manifest.json
git mv firebase/firebase.json firebase.json
git mv firebase/firestore.rules firestore.rules
git mv firebase/firestore.indexes.json firestore.indexes.json
git mv firebase/storage.rules storage.rules
git mv firebase/cors.json cors.json
```

If package splitting causes dependency resolution issues, restore the previous root package shape from Git history into the working tree and re-run `pnpm install`.

## Risk List

High risks:

- Webhook breakage if `src/app/api/webhook/route.ts`, `src/proxy.ts`, or aliases are moved without keeping Next app-root semantics intact.
- Deployment breakage if Vercel or VPS continues to build from repo root without root forwarding scripts or `apps/web` root configuration.
- Firebase CLI path confusion after moving `firebase.json` under `firebase/`.
- CI breakage if package scripts move before `.github/workflows/ci.yml` and root forwarding scripts are updated.
- Lockfile churn after moving the package importer from `.` to `apps/web`.
- Android workflow breakage if Cursor manually creates or rewrites Gradle files instead of letting Android Studio own generated project structure.

Medium risks:

- Service worker scope issues if `public/` is not deployed from the Next app root.
- Vitest import failures if `tests/` does not move with `src/`.
- shadcn path issues if `components.json` is separated from `tsconfig.json` and `src/`.
- Stale docs and agent instructions causing future work to target root `src/`.
- Android Studio confusion if operators open repo root instead of `apps/android`.
- Creating anything beyond an `apps/android` placeholder in Cursor risks conflicting with Android Studio's generated project structure.

Low risks:

- Empty `apps/ios`, `packages/shared`, and `packages/config` placeholders may add noise before they have real package contracts.
- Existing docs contain stale references such as old Android/TWA assumptions that may need cleanup beyond migration mechanics.

## Exact Command Plan

Do not run these until migration approval is given.

### Stage 0: Preflight

```powershell
cd D:\github\nfa-alerts-enterprise
git status --short
git branch --show-current
git switch -c chore/monorepo-migration
pnpm install
pnpm run typecheck
pnpm run lint:ci
pnpm run test:unit
pnpm run build
```

### Stage A: Create Monorepo Directories And Move Web App

```powershell
New-Item -ItemType Directory -Force apps, packages, firebase, docs\enterprise, docs\android, docs\firebase
New-Item -ItemType Directory -Force apps\web, apps\ios, packages\shared, packages\config
git mv src apps/web/src
git mv public apps/web/public
git mv tests apps/web/tests
git mv next.config.ts apps/web/next.config.ts
git mv tsconfig.json apps/web/tsconfig.json
git mv eslint.config.mjs apps/web/eslint.config.mjs
git mv postcss.config.mjs apps/web/postcss.config.mjs
git mv vitest.config.ts apps/web/vitest.config.ts
git mv components.json apps/web/components.json
git mv twa-manifest.json apps/web/twa-manifest.json
```

### Stage B: Create Android Placeholder

Current audit result: `android/` is absent. There is no Android project to move.

Create the target directory and documentation placeholder only:

```powershell
New-Item -ItemType Directory -Force apps\android
Set-Content -Path apps\android\README.md -Value "# Android App`n`nAndroid Studio owns this directory. Create the native Android project here with Empty Activity, Kotlin, Jetpack Compose, Kotlin DSL, package com.emergency.alerts, and minimum SDK API 24. Do not add Gradle files manually from Cursor.`n"
```

Do not create `settings.gradle.kts`, `build.gradle.kts`, `gradlew`, `AndroidManifest.xml`, or Kotlin source files. Android Studio will create those later.

### Stage C: Move Firebase Config

```powershell
git mv firebase.json firebase/firebase.json
git mv firestore.rules firebase/firestore.rules
git mv firestore.indexes.json firebase/firestore.indexes.json
git mv storage.rules firebase/storage.rules
git mv cors.json firebase/cors.json
```

Then update `firebase/firebase.json` rule/index paths for root-run CLI commands:

```json
"rules": "firestore.rules"
"indexes": "firestore.indexes.json"
"rules": "storage.rules"
```

### Stage D: Split Package Configuration

```powershell
Copy-Item package.json apps/web/package.json
```

Then edit:

- root `package.json` into workspace coordinator scripts.
- `apps/web/package.json` into the app package with `"name": "web"`.
- `apps/web/package.json` build/start scripts if wrappers remain in root `scripts/`.

### Stage E: Update Workspace File

Edit `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Keep existing `ignoredBuiltDependencies`.

Run:

```powershell
pnpm install
```

### Stage F: Update Deployment And CI Assumptions

Update one of these deployment paths:

- Preferred: configure Vercel Root Directory to `apps/web`, and move/update app-specific `vercel.json`.
- Compatible fallback: keep root `vercel.json` and set `buildCommand` to `pnpm --filter web build`.

Update `.github/workflows/ci.yml` only if root forwarding scripts are not kept.

Update VPS scripts in `scripts/` to run with `apps/web` as the app working directory before using VPS deployment again.

### Stage G: Update Docs And Agent Instructions

Update:

```text
AGENTS.md
README.md
docs/ai/CLOUD_AGENTS.md
docs/ai/AGENT_OPERATING_MODE.md
docs/ai/STATE.md
docs/android-ui-spec/**
```

Create required final docs:

```text
docs/enterprise/MONOREPO_MIGRATION_REPORT.md
docs/enterprise/PRODUCTION_SAFETY_GUARDRAILS.md
docs/android/ANDROID_NATIVE_IMPLEMENTATION_PLAN.md
docs/firebase/FIREBASE_ENVIRONMENT_STRATEGY.md
```

### Stage H: Validation

Run from repo root:

```powershell
pnpm install
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test:unit
pnpm --filter web build
firebase use --config firebase/firebase.json\nfirebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore
```

Android validation:

```text
Android Studio: Open D:\github\nfa-alerts-enterprise\apps\android
Android Studio: Run Gradle sync
Android Studio: Build the project
Android Studio: Validate Compose previews/emulator/device/logcat as needed
```

Cursor should not run Gradle commands as a substitute for Android Studio validation during this migration. If `apps/android` is still not a generated Gradle project, document that Android validation is blocked by missing Android Studio project skeleton rather than treating it as a web migration failure.

### Stage I: Migration Report

Create `docs/enterprise/MONOREPO_MIGRATION_REPORT.md` with:

- every file/folder moved
- every config edited
- validation command output summary
- unresolved risks
- rollback notes
- confirmation that no Firebase deploy was run
- confirmation that no production data was modified

## Approval Gate

Stop here until explicit approval is given to perform the migration.
