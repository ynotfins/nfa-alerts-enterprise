# NFA Alerts — AI State

**Last updated**: 2026-05-27
**Session type**: AGENT Executioner — local Cursor MCP setup
**Status**: COMPLETE — Composio MCP added to local Cursor config and repo docs aligned

---

## What happened this session (2026-05-27 — Composio Cursor MCP Setup)

Configured Cursor to use Composio via the vendor-recommended HTTP MCP endpoint from `https://composio.dev/cursor`.

1. **Global Cursor MCP updated**: Added a `composio` HTTP MCP entry to `C:\Users\ynotf\.cursor\mcp.json` pointing at `https://connect.composio.dev/mcp`.
2. **Auth flow kept vendor-standard**: Did not add auth headers to the config because the Composio Cursor setup page specifies OAuth-based connection handling.
3. **Repo docs aligned**: Updated `docs/ai/CURSOR_MCP_AND_TOOLS.md` to document the Composio MCP entry, expected usage, and the preference for Composio over browser automation when supported.
4. **Project state recorded**: Logged this setup in `docs/ai/STATE.md` so future agent sessions can discover the local MCP addition without re-auditing machine config.

### Composio Setup Evidence

| Check | Result |
| --- | --- |
| `https://composio.dev/cursor` instructions | PASS — vendor page specifies HTTP MCP at `https://connect.composio.dev/mcp` with no auth headers |
| `C:\Users\ynotf\.cursor\mcp.json` | PASS — `composio` entry added |
| `docs/ai/CURSOR_MCP_AND_TOOLS.md` | PASS — Composio section added |
| `docs/ai/STATE.md` | PASS — session recorded |

### Composio Setup Caveats

1. **Reload required**: Cursor should be reloaded before the new MCP server appears in the tools list.
2. **First-use auth is still manual**: App connections happen through Composio's OAuth flow and dashboard, not via static headers in local config.
3. **No repo code changes**: This session updated local MCP config and documentation only; app code, Firebase data, and deployment state were unchanged.

---

## What happened this session (2026-05-26 — Enterprise Context Snapshot and Restore Point)

Created a full root enterprise context snapshot for the rebuild and prepared the branch for a GitHub restore point after Android Home feed polish.

1. **Repo identity confirmed**: Verified repo root `D:/github/nfa-alerts-enterprise` and branch `feature/android-infrastructure-wiring`.
2. **Root context refreshed**: Fully rewrote `CONTEXT_BLOCK.md` with current enterprise identity, tool ownership, Android/Home state, parser/backend boundaries, Firestore/rules direction, High Alert, maps/distance, ERPNext/CRM, subscriptions, secrets, next steps, and source references.
3. **Android parser boundary preserved**: Confirmed `apps/android/AGENTS.md` already contains the stricter `HomeFeedCardFormatter.kt` rule: Home builds from normalized Firestore fields, must not infer alert type/category from description, and emojis are additive only.
4. **Memory guide aligned**: Updated `openmemory.md` so the project index no longer mentions description heuristics as acceptable presentation hints.
5. **Validation passed**: `./gradlew.bat assembleDebug` and `./gradlew.bat testDebugUnitTest` passed from `apps/android`. `adb devices` found `emulator-5554`; debug APK install and launcher smoke test passed.

### Restore Point Evidence

| Check | Result |
| --- | --- |
| `git rev-parse --show-toplevel` | PASS — `D:/github/nfa-alerts-enterprise` |
| `git status --short --branch` | PASS — on `feature/android-infrastructure-wiring...origin/feature/android-infrastructure-wiring` |
| `./gradlew.bat assembleDebug` from `apps/android` | PASS |
| `./gradlew.bat testDebugUnitTest` from `apps/android` | PASS |
| `adb install -r apps/android/app/build/outputs/apk/debug/app-debug.apk` | PASS |
| `adb shell monkey -p com.emergency.alerts -c android.intent.category.LAUNCHER 1` | PASS |

### Restore Point Caveats

1. **Preserved dirty tree**: Existing Android implementation changes, untracked local scripts, screenshots, generated outputs, and agent skill files were preserved unless deliberately staged for the restore point.
2. **No Firebase side effects**: No Firebase deploy and no production Firebase data mutation were performed.
3. **No Android code authored by Cursor in this pass**: This pass refreshed context and validation state; it did not implement the remaining Home icon/distance layout fixes.

---

## What happened this session (2026-05-19 — Parser Contract and Android Field Alignment)

Hardened the backend-owned alert parsing/write contract and kept Android consumption tolerant.

1. **Webhook parser input fixed**: `POST /api/webhook` now extracts a raw alert message from supported top-level payload fields (`message`, `rawMessage`, `text`) and no longer sends `JSON.stringify(body)` to `parseNotification`.
2. **Backend normalization added**: Added webhook helpers for NYC borough-to-county normalization, county base-name cleanup, department promo-code filtering, and backend-only `commercialDisplayId` generation for valid new incidents.
3. **Parser prompt and tests strengthened**: Prompt guidance now explicitly defaults ambiguous/non-fire incidents to `other`; parser/helper tests cover gas leaks, hazmat/fuel spills, utility/power-line incidents, EMS/medical/injury, vehicle/MVA/traffic, police/law enforcement, smoke/working fire, 10-75, alarm levels, BNNDESK filtering, slash-separated department codes, U/D updates, NYC boroughs, raw payload extraction, and commercial display IDs.
4. **Android field tolerance documented**: Android DTO/domain mapping accepts optional `commercialDisplayId`; docs reinforce that Android must not parse raw alerts or treat presentation heuristics as business logic.

### Parser Contract Evidence

| Check | Result |
| --- | --- |
| `pnpm --filter web test:unit -- webhook-parser` | PASS — 37/37 focused parser/helper tests |
| `pnpm --filter web typecheck` | PASS |
| Targeted ESLint on changed web files | PASS |
| `git diff --check` on changed files | PASS |
| `pnpm --filter web lint:ci` | FAIL — unrelated untracked `apps/web/create-test-profile.js` and `apps/web/test-profile.js` use `require()` imports; edited files passed targeted lint |

### Parser Contract Caveats

1. **Android Gradle validation not run**: Repo operating docs assign Android build validation to Android Studio, and prior state notes local-only Firebase config is expected for Android builds.
2. **No AdjustLeads ingestion**: Only the future normalized source object is documented; no new AdjustLeads route/parser was created.
3. **No production side effects**: No Firebase deploy, production data mutation, real secrets, commit, push, or `nfa-alerts-v2` modification was performed.

---

## What happened this session (2026-05-18 — Security, Secrets, and Subscription Architecture)

Created `docs/commercial/SECURITY_SECRETS_SUBSCRIPTIONS_ARCHITECTURE.md` as a documentation-only commercial architecture plan for backend secret handling, Android secret boundaries, Firebase App Check/Play Integrity, Stripe Billing, Google Play Billing, Firestore entitlements, tenant/account memberships, role alignment, rules impact, scaling risks, and migration from the live `nfa-alerts-v2` Firebase project.

1. **Trusted backend entitlement model**: Documented Firestore as the entitlement source of truth, with Stripe and Google Play purchase events updating entitlements only through verified backend processing.
2. **Secret and client boundaries**: Captured Google Cloud Secret Manager strategy, placeholder-only secret names, Android no-backend-secret/no-webhook rules, and `google-services.json` handling.
3. **Commercial Firestore model**: Added architecture-level collection map for tenants, accounts, memberships, roles, subscriptions, entitlements, audit logs, webhook events, and Play purchase token tracking.
4. **Rollout and migration plan**: Added release blockers, phased checklist, high-volume scaling risks, rules/index impacts, and additive migration strategy from `nfa-alerts-v2`.

### Commercial Architecture Evidence

| Check | Result |
| --- | --- |
| Output doc | PASS — `docs/commercial/SECURITY_SECRETS_SUBSCRIPTIONS_ARCHITECTURE.md` created |
| Safety boundary | PASS — docs-only; no Firebase deploy, production data mutation, real secrets, Android logic changes, commit, or push |
| Existing plan relationship | PASS — new doc expands `docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md` without implementing billing logic |

---

## What happened this session (2026-05-16 — Android Home/Alert Details Architecture Audit)

Created `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md` as a documentation-only audit for building native Android Home and Alert Details screens from the current Next.js/Firebase codebase.

1. **Backend contract audit**: Documented Firebase Auth, Firestore, Storage, Admin Messaging, webhook ingestion, geocoding, weather, and notification flows from local source artifacts.
2. **Firestore contract map**: Consolidated `profiles`, `incidents`, `userIncidents`, `notes`, `activities`, media submissions, notifications, change requests, webhook logs, counters, roles, and moderation structures.
3. **Android implementation guidance**: Added documentation snippets for Kotlin DTOs, repository interfaces, ViewModel structure, exact listeners/queries, package naming, migration roadmap, and Android-specific portability risks.
4. **Safety boundaries**: Preserved Android Studio ownership of Gradle/Kotlin work; no Firebase deploys, production reads/writes, Android webhook calls, subscription implementation, commits, or pushes were performed.

### Audit Evidence

| Check | Result |
| --- | --- |
| Local repo safety | Branch was dirty and behind remote; no destructive reset or merge performed |
| Source inspection | PASS — local `apps/web/src`, `firebase/`, and existing Android docs reviewed |
| Output doc | PASS — `docs/android/ANDROID_HOME_ALERT_DETAILS_ARCHITECTURE.md` created |

### Audit Caveats

1. **Branch staleness**: The local branch was behind remote at audit start, so remote-only changes not present in the checkout may not be reflected.
2. **Docs-only validation**: Full web build was intentionally not run because only markdown/state docs changed.

---

## What happened this session (2026-05-18 — Android Design System + Home Parity)

Implemented a centralized native Android Compose design system and refactored the Home feed to use reusable components while preserving the live Firestore feed, session flow, and repository/use-case/viewmodel boundaries.

1. **Centralized design system**: Added `app/src/main/java/com/emergency/alerts/core/designsystem/` with token files for colors, typography, spacing, shapes, and elevation plus a new `NFATheme.kt` that supports a default light theme, dark mode, and preset themes (`Light`, `Classic Blue`, `Executive Dark`, `High Contrast`, `Firehouse`).
2. **Future admin-theme architecture**: Added `NFAThemeSelection`, `NFAThemeMode`, `NFAThemePreset`, and `NFAThemeOverrides` to prepare future admin-controlled theme selection for primary, secondary, accent, background, surface, text, and light/dark mode without building the admin UI yet.
3. **Reusable UI components**: Added reusable Compose components for a premium bottom nav, top bar, incident card, severity badge, distance label, icon button, and loading/empty/error states.
4. **Home parity refactor**: Reworked `HomeFeedScreen` to use the design system components, keep the live Firestore-backed ViewModel flow, preserve dedupe/sort behavior from the existing use case, and keep department code cleanup plus alert ID rendering for the incident body.
5. **Role-aware shell prep**: Added role-aware navigation configuration for future Admin/Supe/Chaser divergence while keeping only the Incidents destination active now.
6. **Theme migration cleanup**: Removed the old generated `ui/theme` template files and moved the app shell to the new design system theme entry point.

### Android Design System Evidence

| Check | Result |
| --- | --- |
| Centralized token/theme package | PASS — `core/designsystem/{tokens,theme,components}` added |
| Home feed refactor | PASS — Home now uses reusable design system components |
| Live feed boundary | PASS — no mock data, webhook/admin route calls, or repository logic moved into Composables |

### Android Design System Caveats

1. **Default app theme**: The app now defaults to the new light preset to match the UI examples more closely; dark mode support exists but is not the current default.
2. **Role divergence**: Admin/Supe/Chaser role structure is prepared in navigation config only; separate dashboards and admin controls remain future work.

---

## What happened this session (2026-05-18 — Android UI Refinement Pass)

Performed a visual refinement pass on the native Android design system and Home feed to move the UI closer to the premium `UI_example` direction without changing app architecture or Home feed data behavior.

1. **Token polish**: Tightened spacing, softened elevation, refined corner radii, tuned typography hierarchy, and improved neutral/background/surface contrast in the shared design tokens.
2. **Incident card polish**: Improved metadata/body rhythm, refined divider insets, softened card presentation, tuned line height for the 7-line alert body, and upgraded the right-arrow affordance.
3. **Badge and distance polish**: Refined alarm badge pill sizing, borders, and premium color treatment; made distance labels subtler and better aligned for operational scanning.
4. **Bottom nav polish**: Improved floating container border/shadow treatment, icon alignment, and active-state presentation while preserving icons-only behavior and the role-aware nav model.
5. **Home spacing polish**: Added a bit more breathing room in the feed while preserving dense responder scanning and existing Firestore-backed behavior.

### Android Refinement Evidence

| Check | Result |
| --- | --- |
| Firestore/Home behavior preserved | PASS — no data-layer or backend changes |
| Theme architecture preserved | PASS — only token/component polish applied |
| Role-aware nav preserved | PASS — nav architecture unchanged, visuals refined |

---

## What happened this session (2026-05-16 — Multitask Migration Cleanup)

Ran a focused cleanup/fix pass after the enterprise monorepo migration:

1. **Generated artifact hygiene**: Added ignore coverage for `.idea/`, `android_bootstrap_backup/`, and `test-results/`; verified those paths plus `apps/web/.next/` and `apps/web/node_modules/` are ignored.
2. **Documentation path alignment**: Corrected active docs that still pointed at root `src/`, root `public/`, or plain `firebase use` after the move to `apps/web` and `firebase/firebase.json`.
3. **State formatting**: Fixed the malformed literal `\n` in the current migration summary.
4. **Validation**: Re-ran `pnpm --filter web lint`, `typecheck`, `test:unit`, and `build`; all passed. Firebase emulators reached "All emulators ready" with `--config firebase/firebase.json` and were stopped after verification.

### Cleanup Evidence

| Check | Result |
| --- | --- |
| `git status --ignored -- .idea android_bootstrap_backup test-results apps/web/node_modules apps/web/.next` | PASS — local/generated artifacts are ignored |
| `pnpm --filter web lint` | PASS — 20 existing warnings, 0 errors |
| `pnpm --filter web typecheck` | PASS |
| `pnpm --filter web test:unit` | PASS — 40/40 tests |
| `pnpm --filter web build` | PASS |
| `firebase emulators:start --config firebase/firebase.json --project nfa-alerts-v2 --only auth,firestore` | PASS — reached "All emulators ready" and was stopped |

### Cleanup Caveats

1. **Existing lint debt**: The 20 ESLint warnings remain pre-existing and were not fixed in this migration cleanup pass.
2. **Historical docs**: Some older dated/history docs still mention old root paths as historical evidence; this pass updated current operating and architecture docs only.

---

## What happened this session (2026-05-16 — Enterprise Monorepo Migration)

Migrated the parent repository toward a commercial enterprise monorepo layout:

1. **Workspace layout**: Moved the Next.js PWA from repo root into `apps/web` and kept root package scripts as workspace forwarding commands.
2. **Firebase layout**: Moved Firebase CLI config, Firestore rules/indexes, Storage rules, and CORS config into `firebase/` while preserving rule/index contents.
3. **Android boundary**: Created only an `apps/android` documentation placeholder. Android Studio remains responsible for creating the native Gradle project there.
4. **Safety docs**: Added enterprise, Android, Firebase, and commercial planning docs for production guardrails and future work boundaries.
5. **Validation**: `pnpm install`, `pnpm --filter web lint`, `typecheck`, `test:unit`, and `build` passed. `firebase use` requires `--config firebase/firebase.json` in the new layout; emulator startup passed with that config and was stopped after verification.

### Checklist

- [x] Confirm migration branch and working tree
- [x] Move web app files with `git mv`
- [x] Move Firebase config files with `git mv`
- [x] Split root/web package configuration
- [x] Preserve webhook route at `apps/web/src/app/api/webhook/route.ts`
- [x] Avoid Android Gradle generation
- [x] Run validation commands
- [x] Record final migration report

---

## What happened this session (2026-05-16 — Canvas SDK maintenance)

Updated the managed Cursor canvas at `C:/Users/ynotf/.cursor/projects/d-github-nfa-alerts-enterprise/canvases/deep-structural-scan.canvas.tsx` so it matches the current Canvas SDK surface and guidance:

1. **SDK comparison**: Re-read the current canvas skill plus the live `cursor/canvas` declaration files before editing. The original primitives still exist, but the public surface is broader now and the design guidance is stricter about composition.
2. **Canvas refresh**: Reworked the scan to use current primitives such as `Card`, `CardHeader`, `CardBody`, `Row`, and `Code` alongside the existing `Table`, `Stat`, `Callout`, and `Pill` components.
3. **Runtime fix**: Replaced brace-style Firestore placeholders like `profiles/{uid}` and `incidents/{id}` with code-formatted angle-bracket placeholders like `profiles/<uid>` and `incidents/<id>` to eliminate the reported `uid is not defined` failure mode.
4. **Layout cleanup**: Kept tables directly under headings per current canvas guidance, added striping for scan-heavy sections, and mixed open sections with card-based provider summaries instead of relying only on stacked tables.

### Canvas Checklist

- [x] Read current canvas skill and SDK declaration files
- [x] Compare the existing canvas against the current public API
- [x] Update the managed canvas to use current `cursor/canvas` components
- [x] Replace brace-style displayed path placeholders that could trigger runtime evaluation
- [x] Run a post-edit lint check

### Canvas Evidence

| Check | Result |
| --- | --- |
| Canvas skill | PASS — current skill read before editing |
| `cursor/canvas` declarations | PASS — current SDK exports and prop types reviewed |
| `ReadLints` on the canvas file | PASS — no linter errors |

### Canvas Caveats

1. **Best-effort build diagnostics**: The managed canvas status sidecar was not present during this pass, so the fix is verified by source inspection and lint status rather than sidecar output.
2. **Static artifact drift**: This canvas is still a hand-maintained structural snapshot; future repo changes can make its route, dependency, or risk rows stale again.

---

## What happened this session (2026-04-30 — Android UI Specification Pack)

Created a source- and screenshot-backed documentation pack for rebuilding the existing NFA Alerts PWA as a native Android app with UI parity:

1. **Documentation root**: Added `docs/android-ui-spec/` with overview docs, role differences, realtime/Firebase mapping, Android build plan, component inventory, and verification report.
2. **Screen specs**: Added 36 per-screen/state markdown specs under `docs/android-ui-spec/screens/`, covering auth/onboarding, incidents, filters, incident details, homeowner/docs/signing, favorites tabs, route planner, notifications, chat, chasers, profile, legal/help, admin, and system states.
3. **Screenshot review**: Inspected all 34 Supe app screenshots in `screenshots/` and mapped each screenshot to screen docs and verification evidence.
4. **Source verification**: Verified route/page maps, shared components, hooks, services, Firebase client/admin wiring, Firestore/Storage rules, PWA service workers, and manifest behavior from current source.
5. **Android translation**: Added Jetpack Compose, Firebase Android SDK, navigation graph, state management, offline/cache, and milestone guidance in `android-build-plan.md`.
6. **Known gaps**: Marked Chaser-specific visuals, admin screenshots, populated notification/docs/signing states, permission-denied states, and several source/doc contradictions as verification gaps instead of inventing UI details.

### Checklist

- [x] Create `docs/android-ui-spec/`
- [x] Create `docs/android-ui-spec/screens/`
- [x] Inspect all 34 screenshots
- [x] Verify current source instead of trusting older docs
- [x] Create README, app map, design system, screen index
- [x] Create 36 screen/state specs
- [x] Create role differences, realtime/Firebase, Android build plan, component inventory, verification report
- [x] Run safe validation command

### Evidence

| Check | Result |
| --- | --- |
| Screenshot inventory | PASS — 34 JPG screenshots inspected |
| Markdown docs created | PASS — 45 markdown files under `docs/android-ui-spec/` |
| `pnpm run typecheck` | PASS |

### What is still broken / blocked

1. **Chaser visual parity**: Screenshots are Supe-only; Chaser-specific UI must be captured on device before final native parity.
2. **Admin screenshots**: Admin users, admin user edit, and admin live locations are source-backed but not screenshot-backed.
3. **Runtime state coverage**: Populated notifications, uploaded documents, completed signed PDFs, permission-denied states, and error states need additional screenshots.
4. **Source/doc contradictions**: Existing docs still contain stale claims about Next.js version, Playwright/functions, APK artifact, and some product behavior; new Android spec records these contradictions.

---

## What happened this session (2026-04-26 — Cloud/Bugbot/VPS Platform Hardening)

Extended the Cursor Cloud Agent setup into repo-tracked platform automation:

1. **Bugbot rules**: Added `.cursor/BUGBOT.md` and `docs/ai/BUGBOT_RULES.md` focused on runtime errors, Next.js boundaries, API failures, Firebase issues, deployment risks, and secret leaks while avoiding style noise.
2. **Cloud Agent hardening**: Updated `AGENTS.md` and `docs/ai/CLOUD_AGENTS.md` with exact dashboard steps, runtime/PORT behavior, production smoke tests, Bugbot activation, and My Machines guidance.
3. **VPS setup**: Added `scripts/vps-hostinger-setup.sh`, `scripts/vps-deploy.sh`, and `docs/ai/VPS_HOSTINGER.md` for Ubuntu/Hostinger setup with Node.js 22, pnpm 10.33.0, nginx, PM2, UFW, env-file handling, deployment, restart, and logs.
4. **CI automation**: Added `.github/workflows/ci.yml` to run install, typecheck, lint, unit tests, and build on PRs and pushes to `main`.
5. **Runtime config**: Confirmed existing production scripts already force `NODE_ENV=production`; no build/start script changes were made in this pass.
6. **VPS env loading fix**: Updated PM2 to start Next.js through `node -r dotenv/config` with `DOTENV_CONFIG_PATH=.env.production.local`, moved `dotenv` to runtime dependencies, and made deploy fail before build/restart when required env keys are absent.
7. **Graceful shutdown fix**: Replaced `scripts/next-start.mjs` `spawnSync` usage with `spawn`, signal forwarding for `SIGINT`/`SIGTERM`, and child cleanup on wrapper exit so PM2 stops do not leave orphaned Next.js children.
8. **Deployment consistency**: Added `packageManager: pnpm@10.33.0`, pinned the VPS setup script to pnpm `10.33.0`, added deploy-time pnpm mismatch warnings, and rejected placeholder nginx `server_name` values.
9. **Autonomous PR convergence**: Added `docs/ai/AUTONOMOUS_PR_FIXING.md`, updated agent/Bugbot rules, and extended CI with a PR readiness comment that reports safe-to-merge vs needs-fixes and marks draft PRs ready when CI passes and no blocking labels are present.
10. **Safe auto-merge**: Added a PR-only auto-merge job that runs after CI passes, skips drafts, verifies merge state is not dirty/unknown, and enables squash auto-merge with the GitHub CLI.
11. **Secret handling**: Verified `.env` is ignored and not tracked without printing values, reset `.env.example` to empty placeholders only, documented Cursor Cloud Agents > My Secrets as source of truth, and normalized `CONTEXT7_SECRET_KEY` naming in docs/examples.
12. **Review fixes**: Restored VPS deploy validation for Firebase Admin credentials, added Firebase Admin placeholders to the generated VPS `.env.production.example`, removed `CONTEXT7_SECRET_KEY` from required VPS runtime validation, and made `WEB_PUSH_PRIVATE_KEY` optional because app code only uses `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` plus Firebase Admin Messaging today.
13. **Stable CI checks**: Added explicit GitHub Actions job names `CI Validate` and `CI PR Readiness` so branch rules can require stable check names without the pull request event suffix.
14. **Review rule cleanup**: Updated Bugbot, agent, and Cloud Agent guidance to prohibit any committed `.env*` file except `.env.example`, and to allow `.env.example` only when every assignment is exactly empty (`KEY=`) with no placeholder-like or real values.

### Checklist

- [x] Preserve verified `NODE_ENV` build/start wrappers
- [x] Add Bugbot repo rules and activation instructions
- [x] Add VPS setup/deploy scripts
- [x] Add My Machines/self-hosted guidance
- [x] Add GitHub Actions CI workflow
- [x] Ensure PM2 production start loads `.env.production.local`
- [x] Ensure VPS deploy fails when `.env.production.local` is missing or incomplete
- [x] Ensure production start wrapper forwards shutdown signals
- [x] Pin pnpm version for local, CI, and VPS consistency
- [x] Reject placeholder nginx domains in VPS setup
- [x] Warn on pnpm version mismatch during VPS deploy
- [x] Add autonomous Bugbot/Qodo follow-up fix policy
- [x] Add PR readiness comment automation
- [x] Add safe squash auto-merge job for non-draft, conflict-free PRs after CI passes
- [x] Verify `.env` is ignored and not tracked without printing secret values
- [x] Update `.env.example` with empty placeholders only
- [x] Normalize `CONTEXT7_SECRET_KEY` in docs/examples
- [x] Restore Firebase Admin credential validation for VPS deploys
- [x] Add Firebase Admin credential placeholders to generated VPS env example
- [x] Remove `CONTEXT7_SECRET_KEY` from required VPS runtime validation
- [x] Investigate `WEB_PUSH_PRIVATE_KEY` usage and document it as optional
- [x] Remove unused `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SITE_URL` from VPS runtime-required validation
- [x] Add stable explicit job names for branch protection checks
- [x] Clarify review rules so `.env.example` placeholder-only changes are allowed
- [x] Run validation commands
- [x] Commit, push, and update PR

### Evidence

| Check | Result |
| --- | --- |
| `git status --short --branch` | PASS — on `cursor/setup-dev-environment-cc8b` |
| `printf 'NODE_ENV=%s PORT=%s\n' "$NODE_ENV" "$PORT"` | WARN — Cloud still injects `NODE_ENV=development`; production scripts force production mode |
| `bash -n scripts/vps-hostinger-setup.sh` | PASS |
| `bash -n scripts/vps-deploy.sh` | PASS |
| `bash -n scripts/with-bitwarden-env.sh` | PASS |
| `pm2 --version` | WARN — PM2 is installed by the VPS setup script but not present in this Cloud VM |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm run test:unit` | PASS — 40/40 tests |
| `pnpm run build` | PASS — wrapper forced production mode despite injected `NODE_ENV=development` |
| `PORT=3002 pnpm run start` + `SIGTERM` to wrapper PID | PASS — wrapper exited `143`; child PID terminated; no orphan remained |
| `bash -n scripts/vps-hostinger-setup.sh && bash -n scripts/vps-deploy.sh && pnpm install --frozen-lockfile && pnpm run build` | PASS — after pnpm pin and deploy consistency checks |
| `pnpm dlx prettier --check .github/workflows/ci.yml` | PASS — workflow YAML parsed/formatted |
| `pnpm install --frozen-lockfile && pnpm run typecheck && pnpm run lint:ci && pnpm run test:unit && pnpm run build` | PASS — after PR readiness automation |
| `pnpm dlx prettier --check .github/workflows/ci.yml && pnpm install --frozen-lockfile && pnpm run build` | PASS — after safe auto-merge job |
| `.env` presence/tracking check | PASS — `.env` not present in this checkout, ignored by `.gitignore`, and not tracked |
| `rg CONTEXT7_SECRET_KEY` | PASS — uppercase Context7 secret references are documented |
| `git status --short && pnpm install --frozen-lockfile && pnpm run typecheck && pnpm run lint:ci && pnpm run test:unit && pnpm run build` | PASS — after secret baseline normalization |
| `rg WEB_PUSH_PRIVATE_KEY src` | PASS — no app runtime references; current push path uses Firebase Admin Messaging and `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` |
| `bash -n scripts/vps-deploy.sh && bash -n scripts/vps-hostinger-setup.sh && pnpm install --frozen-lockfile && pnpm run typecheck && pnpm run lint:ci && pnpm run test:unit && pnpm run build` | PASS — after blocking review fixes |
| `curl -i http://127.0.0.1:3001/login` | PASS — `200 OK` from existing production server |

### What is still broken / blocked

1. **Manual UI action**: Bugbot must be enabled in Cursor/GitHub UI; repo files cannot authorize the GitHub app.
2. **Manual UI action**: Cursor Cloud dashboard settings still need default repo/base branch/routing/secrets review.
3. **Manual VPS action**: Hostinger server setup requires a real domain, DNS, runtime secrets in `.env.production.local`, and optional HTTPS certificate installation.
4. **My Machines**: Not recommended unless Cloud Agents need private-network/VPS-local access; enabling requires `agent login` or a team/service-account API key on the target machine.
5. **Existing lint debt**: `lint:ci` passes inside the configured warning budget but still reports 20 pre-existing warnings.
6. **External automation**: Actual Bugbot/Qodo AI follow-up commits require those services to be enabled with write/autofix permissions; repo code now supplies policy, CI, and readiness comments.
7. **Manual secret action**: Add real values manually in Cursor Cloud Agents > My Secrets scoped to `ynotfins/nfa-alerts-enterprise`; do not commit local `.env` files.

---

## Previous Session (2026-04-25 — Cloud Agent Readiness Hardening)

Audited and hardened this repo for future Cursor Cloud Agents:

1. **Cloud readiness audit**: Confirmed the checked-out repo is `ynotfins/nfa-alerts-enterprise`, GitHub CLI is authenticated, Node `v22.22.2`, npm `10.9.7`, pnpm `10.33.0`, and current Cloud secrets expose `NODE_ENV=development` plus `PORT=3000`.
2. **Tooling caveat**: MCP resources are not exposed in this Cloud session, and `firebase` CLI is not installed. Fallback used: repository inspection, Cursor docs, Bitwarden docs, GitHub CLI, and web research.
3. **Build hardening**: Changed `pnpm run build` to run `scripts/next-build.mjs`, which explicitly runs `next build` with `NODE_ENV=production` even when Cursor injects `NODE_ENV=development`.
4. **Environment template**: Removed `NODE_ENV` from `.env.example`; it should not be configured as an app secret.
5. **Cloud Agent docs**: Added `docs/ai/CLOUD_AGENTS.md` with dashboard recommendations, required secrets, validation commands, MCP/plugin guidance, Bitwarden strategy, and troubleshooting.
6. **Operating policy**: Added `docs/ai/AGENT_OPERATING_MODE.md` and root `AGENTS.md` so future Cloud Agents find repo-specific operating rules automatically.
7. **Bitwarden workflow**: Added `scripts/with-bitwarden-env.sh`, a placeholder-only wrapper around `bws run --project-id "$BWS_PROJECT_ID"` that requires `BWS_ACCESS_TOKEN` and never prints secrets.
8. **Docs alignment**: Updated `docs/ai/INDEX.md` to point at Cloud Agent docs and fixed stale web push env names in `docs/ai/SYSTEM_WIRING.md`.
9. **Validation**: Full install/typecheck/lint/test/build suite passed with the Cloud environment still injecting `NODE_ENV=development`, proving `pnpm run build` now handles that bad secret safely.
10. **Production start hardening**: Added `scripts/next-start.mjs` so `pnpm run start` also serves with `NODE_ENV=production` instead of inheriting the bad Cloud value.

### Checklist

- [x] Inspect current repo, git remote, Node/npm/pnpm versions, and exposed env caveats
- [x] Confirm MCP resources unavailable in this session and record fallback path
- [x] Research Cursor Cloud Agent setup/settings/Slack routing docs
- [x] Research Bitwarden Secrets Manager CLI/access-token docs
- [x] Add build wrapper for invalid inherited `NODE_ENV=development`
- [x] Remove `NODE_ENV` from `.env.example`
- [x] Add Cloud Agent setup docs
- [x] Add autonomous operating mode docs
- [x] Add Bitwarden wrapper
- [x] Run full validation suite after commit/push
- [x] Update PR

### Evidence

| Check | Result |
| --- | --- |
| `git remote -v` | PASS — origin points at `ynotfins/nfa-alerts-enterprise` |
| `node --version && npm --version && pnpm --version` | PASS — `v22.22.2`, `10.9.7`, `10.33.0` |
| `printf 'NODE_ENV=%s PORT=%s\n' "$NODE_ENV" "$PORT"` | WARN — Cloud secrets currently inject `NODE_ENV=development` |
| `ListMcpResources` | WARN — no MCP resources exposed to this Cloud session |
| `gh auth status` | PASS — GitHub CLI authenticated |
| `firebase --version` | WARN — Firebase CLI not installed in this VM |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm run test:unit` | PASS — 40/40 tests |
| `pnpm run build` | PASS — wrapper forced `NODE_ENV=production`; Next.js build completed |
| `PORT=3001 pnpm run start` | PASS — wrapper forced `NODE_ENV=production`; Next.js production server ready |
| `curl -i http://127.0.0.1:3001/login` | PASS — `200 OK` from production server |
| `bash -n scripts/with-bitwarden-env.sh` | PASS |

### What is still broken / blocked

1. **Manual dashboard setting**: Remove the `NODE_ENV` Cursor secret; the build wrapper prevents failure, but the secret remains incorrect for a Next.js repo.
2. **Manual dashboard setting**: Set default repository to `ynotfins/nfa-alerts-enterprise`, base branch to `main`, and add routing keywords for this app.
3. **MCP availability**: Context7/Firebase/Vercel/Playwright/shadcn/GitHub MCPs should be configured in Cursor dashboard or local Cursor settings; none are visible in this Cloud session.
4. **Bitwarden**: Wrapper is ready, but real use requires manual `BWS_ACCESS_TOKEN` and `BWS_PROJECT_ID` secret setup.
5. **Existing lint debt**: `lint:ci` passes inside the configured warning budget but still reports 20 pre-existing warnings.

---

## Previous Session (2026-04-25 — Development Environment Setup)

Set up and validated the local Cursor Cloud development environment for the Next.js app:

1. **Dependency install**: Ran `pnpm install --frozen-lockfile` with pnpm 10.33.0; 1056 packages installed from `pnpm-lock.yaml`.
2. **Toolchain verified**: Node `v22.22.2`, npm `10.9.7`, Corepack `0.34.6`, pnpm `10.33.0`.
3. **Static validation**: `pnpm run typecheck` passed; `pnpm run lint:ci` passed with the existing 20 warnings and 0 errors.
4. **Unit validation**: `pnpm run test:unit` passed with 40/40 tests.
5. **Production build**: `env -u NODE_ENV pnpm run build` passed. A first build attempt failed because the persisted shell had `NODE_ENV=development`, which Next.js warns is invalid for `next build`; unsetting it let Next set production mode correctly.
6. **Dev server**: Started `pnpm run dev --hostname 0.0.0.0 --port 3000` in tmux session `nfa-next-dev` with non-secret local Firebase placeholder values.
7. **HTTP verification**: Confirmed `/` returns `307` to `/login`; confirmed `/login` returns `200`.
8. **Browser verification**: Confirmed the app intentionally shows the desktop "Mobile Only" screen and renders the NFA Alerts sign-in form under mobile viewport emulation.

**Walkthrough artifacts**:

- `/opt/cursor/artifacts/next_dev_login_page_running.mp4`
- `/opt/cursor/artifacts/nfa_login_mobile_dev.webp`

### Checklist

- [x] Read setup files: `package.json`, `README.md`, `.env.example`, `next.config.ts`, `tsconfig.json`
- [x] Installed dependencies from lockfile
- [x] Ran TypeScript validation
- [x] Ran ESLint CI validation
- [x] Ran unit tests
- [x] Ran production build with a clean `NODE_ENV`
- [x] Started the dev app
- [x] Verified HTTP responses
- [x] Captured browser walkthrough evidence
- [x] Left dev server running for follow-up testing

### Evidence

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm run test:unit` | PASS — 40/40 tests |
| `env -u NODE_ENV pnpm run build` | PASS — build completed; Firebase Admin credentials unavailable warnings only |
| `curl -i http://127.0.0.1:3000/` | PASS — `307 Temporary Redirect` to `/login` |
| `curl -i http://127.0.0.1:3000/login` | PASS — `200 OK` |
| Browser walkthrough | PASS — mobile login page rendered |

### What is still broken / blocked

1. **Runtime credentials**: Real Firebase client/admin credentials are not configured in this Cloud VM; the dev server was started with non-secret public Firebase placeholder values only to prove the app boots and renders.
2. **Shell environment caveat**: Do not run `next build` with `NODE_ENV=development`; use `env -u NODE_ENV pnpm run build` if the shell has a persisted `NODE_ENV`.
3. **Existing lint debt**: `lint:ci` passes inside the configured warning budget but still reports 20 pre-existing warnings.
4. **Security blocker remains**: Old repo Firebase service-account key rotation/history cleanup from SEC-001 remains a human-owned blocker.

---

## Previous Session (2026-04-25 — GitHub Repository Setup)

Successfully published the clean NFA Alerts Enterprise repository to GitHub with comprehensive security validation:

1. **Repository State Verification**: Confirmed clean working tree, committed pending .gitignore changes (OpenMemory IDE rules)
2. **Security Scan**: Comprehensive secret scan found no actual secrets in tracked files - all matches were documentation references to old repo issues
3. **Validation Suite**: All validation passed - TypeScript, ESLint (20 warnings/0 errors), Tests (40/40), and Next.js build
4. **GitHub Repository Creation**: Used GitHub MCP to create `ynotfins/nfa-alerts-enterprise` as private repository
5. **Push Success**: Pushed `main` branch (commit `4f32070`) to new GitHub repository
6. **Verification**: Confirmed remote configuration and successful push

**GitHub Repository**: https://github.com/ynotfins/nfa-alerts-enterprise  
**Current HEAD**: `4f320703244ecbfbcfeda0126cafcdbb27e78e4a`  
**Pushed Commit**: `4f32070` (chore: add OpenMemory IDE rules to .gitignore)

---

## Previous Session (2026-04-24)

## What happened this session

Pre-push audit after commit `be1ceb9ff5f8c6dbb07e069960449b335174fbc2` confirmed the Firebase Admin static `service-account.json` dependency is removed. This session hardens the remaining client Firebase placeholder behavior so missing `NEXT_PUBLIC_FIREBASE_*` values can only use placeholders during `next build`, not in real app runtime.

During readonly inspection, `.env.example` had an uncommitted credential-like service-account value in the working tree. It was removed before validation and must not be committed with real values.

## 🔴 CRITICAL — Requires Immediate Human Action

**`service-account.json` is committed to the old repo git history and on GitHub.** (SEC-001 — partially mitigated)

- Commit: `42fde63` (Nov 27 2025, status: Added)
- Old repo remote: `github.com/ynotfins/nfa-alert` (pushed)
- Clean repo code: no longer imports or falls back to `service-account.json`

**Do this NOW**:

1. Rotate the Firebase service account key in Firebase Console
2. Remove file from git history: `git filter-repo --invert-paths --path service-account.json`
3. Force-push to remote
4. Configure clean repo/runtime Firebase Admin credentials through server env vars only

See `RISK_REGISTER.md` RISK-001.

---

## Pre-push Checklist

- [x] Reconfirmed `git status --short`
- [x] Reconfirmed `git show --stat be1ceb9`
- [x] Inspected `src/lib/firebase-admin.ts`, `src/lib/firebase.ts`, `.gitignore`, `openmemory.md`, `docs/ai/STATE.md`, `docs/ai/RISK_REGISTER.md`, `docs/ai/CODEBASE_VALIDATION_REPORT.md`, and `package.json`
- [x] Kept Firebase Admin env-based credential loading
- [x] Removed uncommitted credential value from `.env.example`
- [x] Hardened client Firebase placeholder fallback to build-only behavior
- [x] Cleaned local-agent ignores for `openmemory.md` and `CLAUDE.md`
- [x] Run `pnpm run typecheck`
- [x] Run `pnpm run lint:ci`
- [x] Run `pnpm run test:unit`
- [x] Run `pnpm run build`
- [x] Commit only if all validation passes

---

## Active Blockers

| ID | Severity | Summary | Owner |
| --- | --- | --- | --- |
| SEC-001 | CRITICAL | Old repo key rotation + history cleanup still required | Human |
| ~~PUSH-001~~ | ~~HIGH~~ | ~~Clean repo push requires explicit approval and confirmed GitHub repo URL/visibility~~ | ~~RESOLVED 2026-04-25~~ |
| RISK-008 | MEDIUM | ~3% test coverage | PLAN |

**PUSH-001 Resolution**: Clean repository successfully pushed to `ynotfins/nfa-alerts-enterprise` (private) on 2026-04-25.

---

## Next Manual Steps (Deployment Checklist)

**⚠️ Required before production deployment:**

1. **Set Vercel Environment Variable**:
   - Add `FIREBASE_SERVICE_ACCOUNT_JSON_B64` to Vercel project settings
   - Value should be base64-encoded Firebase Admin SDK JSON

2. **Redeploy Application**:
   - Trigger Vercel deployment from new GitHub repository
   - Verify deployment uses clean repository code

3. **Test Critical Functions**:
   - Test webhook endpoints (`/api/webhook`)
   - Test notification system (`/api/notifications/send`)
   - Test admin routes (`/admin/*`)
   - Verify Firebase Admin SDK works with new credentials

4. **Security Cleanup (After Production Verification)**:
   - Delete old Firebase service account keys from Firebase Console
   - Only perform after confirming new deployment works correctly

---

## Git State (validated 2026-04-24 pre-push audit)

- Branch: `main`
- Expected audited commit: `be1ceb9ff5f8c6dbb07e069960449b335174fbc2`
- Readonly starting dirty state: `.env.example`, `.gitignore`, and untracked empty `openmemory.md`
- `openmemory.md` is local assistant state and must remain uncommitted
- No push, remote creation, or deployment is part of this session

---

## Validation

| Command | Result |
| --- | --- |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm run test:unit` | PASS — 40/40 tests |
| `pnpm run build` | PASS — Next.js 16.1.1 build completed; sanitized Firebase Admin unavailable warnings only |

---

## Files Changed This Session

| File | Action | Summary |
| --- | --- | --- |
| `.env.example` | CLEANED | Restored value-free Firebase Admin credential placeholder |
| `.gitignore` | UPDATED | Keeps `.cursor/` broad ignore and intentionally ignores `openmemory.md` + `CLAUDE.md` |
| `src/lib/firebase.ts` | UPDATED | Allows placeholder Firebase client config only during `next build`; runtime without public env now fails fast |
| `docs/ai/STATE.md` | UPDATED | Current checklist, evidence, blockers, and validation status |
| `docs/ai/CODEBASE_VALIDATION_REPORT.md` | UPDATED | Fresh validation evidence for this hardening pass |
| `docs/ai/RISK_REGISTER.md` | UPDATED | Current validation date and clean-repo env hygiene note |

---

## What is still broken / blocked

1. **Security**: Rotate old Firebase service account key and remove `service-account.json` from old repo git history (SEC-001 — CRITICAL residual)
2. **Push**: Do not push the clean repo until explicitly approved
3. **GitHub repo**: Confirm final repo URL and private visibility before remote setup
4. **Runtime config**: Configure public Firebase client env vars and server Firebase Admin credentials in deployment before running the app

---

## Session 2026-04-24 (Later) — MCP Server Installation

**Status**: COMPLETE — 4 mandatory MCP servers installed and documented

### MCP Servers Installed

1. ✅ **Firebase MCP** - Firebase project management, Firestore, Functions, logs
   - Configuration: `firebase mcp --dir D:\github\nfa-alerts-v2\nfa-alert`
   - Authentication: OAuth (logged in as `ynotfins@gmail.com`)
   - Project: `nfa-alerts-v2` (ID: `nfa-alerts-v2`, #466111323548)

2. ✅ **Next.js DevTools MCP** - Next.js routes, diagnostics, runtime context
   - Configuration: `npx -y next-devtools-mcp@latest`
   - Works with Next.js 16.1.1 App Router

3. ✅ **Vercel MCP** - Deployment logs, runtime logs, project management
   - Configuration: `https://mcp.vercel.com` (HTTP endpoint)
   - Requires OAuth authentication on first use

4. ✅ **Shadcn MCP** - Component browsing and installation
   - Configuration: `npx shadcn@latest mcp`
   - Initialized with: `npx shadcn@latest mcp init --client cursor`
   - Reads existing `components.json` (style: new-york, rsc: true)

### Documentation Created

- `docs/ai/CURSOR_MCP_AND_TOOLS.md` - Complete MCP server catalog (13 sections, 550+ lines)
- `docs/ai/MCP_QUICK_REFERENCE.md` - Quick commands and workflows (300+ lines)
- `docs/ai/INDEX.md` - Central documentation directory
- Updated `docs/ai/tabs/TAB_BOOTSTRAP_PROMPTS.md` with new mandatory MCP stack
- Updated `nfa-alert/README.md` with MCP tools section

### Troubleshooting Performed

- Fixed broken `npx` cache causing Firebase MCP to fail
- Installed `firebase-tools@15.15.0` globally as workaround
- Updated `C:\Users\ynotf\.cursor\mcp.json` with correct Firebase working directory

### Next Actions

- **Reload Cursor** to activate all new MCP servers: `Ctrl+Shift+P` → `Developer: Reload Window`
- Authenticate Vercel MCP on first use (OAuth prompt)
- Verify all 4 servers appear in Cursor chat: "What MCP tools do you have available?"

</contents>
</invoke>

---

## Session 2026-04-24 (Migration + Phase 1 Security Fix) — Clean Repo Extraction

**Status**: COMPLETE — clean target copied, baseline committed, Firebase Admin file dependency removed, and local verification passed.

### Checklist

- [x] Created local broken/current snapshot under `D:/github/nfa-alerts-migration-backups/20260424-185639`
- [x] Copied app to isolated target `D:/github/nfa-alerts-enterprise`
- [x] Excluded `.env`, service account JSON, Firebase Admin SDK JSON, `.firebaserc`, logs, `.git`, `.next`, `node_modules`, `.cursor`, and `.serena`
- [x] Strengthened `.gitignore` for local secrets, deploy bindings, logs, tool state, and migration artifacts
- [x] Generated value-free `.env.example` from source environment variable references
- [x] Initialize and commit clean baseline
- [x] Replace static Firebase Admin `service-account.json` import with env-based credential loading
- [x] Run local verification
- [ ] Push only after a new GitHub repo URL is provided
- [ ] Restore old workspace only after human confirms exact known-good target

### Evidence

- Old app branch at freeze: `main`
- Old app HEAD at freeze: `a5d8ec28879848733c6e76c2ba8fa2039c261441`
- New repo baseline commit: `53a834d74bac056b27523bcea614652fbb28af3a`
- Backup record: `D:/github/nfa-alerts-migration-backups/20260424-185639/RESTORE_RECORD.txt`
- Secret scan is path-only; values were not printed. Strong scan still flags existing public Firebase web config and test/source token references for review.
- `pnpm install --frozen-lockfile` passed using existing `pnpm 10.24.0`.
- Initial `pnpm run typecheck` failed because `src/lib/firebase-admin.ts` imported `../../service-account.json`, which is intentionally absent from the clean repo.
- Phase 1 fix: `src/lib/firebase-admin.ts` now loads Firebase Admin credentials from `FIREBASE_SERVICE_ACCOUNT_JSON`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, or the `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` env triplet.
- `.env.example` contains variable names only; no credential values were added.
- `pnpm run typecheck` passed.
- `pnpm run lint:ci` passed with 20 warnings and 0 errors.
- `pnpm run test:unit` passed: 40/40 tests.
- `pnpm run build` passed. Build emitted sanitized Firebase Admin unavailable warnings because no Admin credentials are configured in the clean local environment.

### Still Broken / Blocked

- SEC-001 is only code-fixed in the clean repo. The old repo still requires Firebase key rotation and git history cleanup.
- New GitHub repo URL is not provided yet, so push must stop before remote setup.
- Old workspace restoration is blocked until the new repo is verified and a human confirms the exact known-good commit/tag/branch.
