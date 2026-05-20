# NFA Alerts — AI State

**Last updated**: 2026-05-20  
**Session type**: AGENT Executioner — Full-Stack Project Auditor improvement
**Status**: COMPLETE — skill improved, globally installed, and validation passing

---

## What happened this session (2026-05-20 — Auditor Skill Test and Global Install)

Improved the Full-Stack Project Auditor skill after testing all six auditor roles against this monorepo:

1. **Agent self-test**: Ran Drift, Modularity, Observability, Governance, CI/CD, and Cross-Referencer agents in focused mode. Every role returned a `revise` verdict with actionable repo findings and skill-friction feedback.
2. **Skill upgrade**: Added modes, project-profile detection, NFA/EMU source hierarchy, collection-name normalization, conditional Cloud Functions/MacroDroid/Flutter handling, explicit focused-mode behavior, and stronger role checklists.
3. **Docs update**: Added `docs/ai/FULL_STACK_PROJECT_AUDITOR.md`, linked the skill from `docs/ai/INDEX.md`, `AGENTS.md`, `CLAUDE.md`, `docs/ai/AGENT_OPERATING_MODE.md`, and the Cloud Agent prompt template.
4. **Global install**: Copied the skill to `/home/ubuntu/.claude/skills/full-stack-project-auditor.md` for global use on this Cloud machine.

### Checklist

- [x] Run all six auditor role subagents against the repo
- [x] Apply skill improvements from agent feedback
- [x] Add usage, self-test, and global install documentation
- [x] Install global skill copy for this user environment
- [x] Run repository validation commands
- [x] Commit, push, and update PR

### Evidence

| Check | Result |
| --- | --- |
| Drift Critique Agent | PASS — role executed; verdict `revise` / medium |
| Modularity Validator Agent | PASS — role executed; verdict `revise` / medium |
| Observability Judge Agent | PASS — role executed; verdict `revise` / high |
| Governance Enforcer Agent | PASS — role executed; verdict `revise` / high |
| CI/CD Validator Agent | PASS — role executed; verdict `revise` / medium-high |
| Cross-Referencer Agent | PASS — role executed; verdict `revise` / medium |
| `cp /workspace/.claude/skills/full-stack-project-auditor.md /home/ubuntu/.claude/skills/full-stack-project-auditor.md` | PASS |
| `cmp -s /workspace/.claude/skills/full-stack-project-auditor.md /home/ubuntu/.claude/skills/full-stack-project-auditor.md` | PASS |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 19 existing warnings, 0 errors |
| `pnpm run test:unit` | PASS — 57/57 tests |
| `pnpm run build` | PASS — Firebase Admin credentials unavailable warnings only |

### What is still broken / blocked

1. **Existing lint debt**: `lint:ci` passes inside the warning budget but still reports 19 pre-existing warnings.

---

## What happened this session (2026-05-20 — Full-Stack Project Auditor Skill)

Created a repository-local auditor skill for production-grade multi-agent review cycles:

1. **Skill addition**: Added `.claude/skills/full-stack-project-auditor.md` with required inputs, subagent roles, operating loop, verdict rubric, stop condition, and report template.
2. **EMU/NFA enhancements**: Added project-specific checks for Firebase runtimes, incident update/activity schema alignment, MacroDroid/BNN trigger drift, Firestore write error logging, future FCM topic delivery tracking, type safety, CI ingestion tests, rollback behavior, and schema cross-reference.
3. **Documentation index**: Linked the skill from `docs/ai/INDEX.md` so future agents can discover it.

### Checklist

- [x] Create branch `multi_agent_team`
- [x] Inspect existing skill and AI documentation conventions
- [x] Add Full-Stack Project Auditor skill
- [x] Update documentation index
- [x] Run repository validation commands
- [x] Commit, push, and create PR

### Evidence

| Check | Result |
| --- | --- |
| `git checkout -b multi_agent_team` | PASS |
| `.claude/skills/full-stack-project-auditor.md` | ADDED |
| `docs/ai/INDEX.md` | UPDATED |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 19 existing warnings, 0 errors |
| `pnpm run test:unit` | PASS — 57/57 tests |
| `pnpm run build` | PASS — Firebase Admin credentials unavailable warnings only |

### What is still broken / blocked

1. **Existing lint debt**: `lint:ci` passes inside the warning budget but still reports 19 pre-existing warnings.

---

## What happened this session (2026-05-16 — PR Review Fixes)

Resolved merge-readiness blockers after PR #7 landed on `main`:

1. **Merge update**: Merged latest `origin/main` into the monorepo migration branch and kept the newly hardened auth/profile/test files under `apps/web`.
2. **Runtime dependencies**: Moved runtime-used Radix UI packages from `apps/web` dev dependencies into production dependencies while leaving unused alert-dialog/toast packages in dev dependencies.
3. **VPS deploy scripts**: Updated VPS build/start paths to run the `web` workspace in the monorepo layout.
4. **Ignore cleanup**: Removed duplicate `.gitignore` entries and the misleading `AGENTS.md` ignore rule.

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

## What happened this session (2026-04-30 — Security Correctness Hardening)

Made minimal correctness/security fixes while leaving the fire-alert ingestion/listener/rules path untouched:

1. **Change requests**: Server actions now verify Firebase ID tokens server-side, derive requester/reviewer identity from the authenticated profile, reject non-supe/admin reviews, validate request fields with Zod, and prevent re-reviewing non-pending requests.
2. **Notification API**: `/api/notifications/send` now requires either the existing internal bearer token or Firebase bearer auth. Internal callers may send supported notification types; Firebase callers are limited to their own `message_new` notifications.
3. **Push logs**: Removed push-token logging from the notification route.
4. **Firebase Admin**: Replaced brittle `getApps()[0]` fallback with explicit default-app lookup via `getApp()`.
5. **React hook correctness**: Removed render-time state updates from `useProfile` and added async cancellation for fetch completion.
6. **Type cleanup**: Removed assertions/comments from the security-changed path, added a profile Firestore boundary parser, inferred change-request field types from one shared constant, and kept cleanup scoped away from fire-alert services.
7. **Merge blocker fixes**: Firebase Admin ID token verification failures now return `AuthError("Unauthorized", 401)`, while profile-not-found remains forbidden; profile parsing preserves existing Firestore fields while normalizing required fields.
8. **Tests**: Added focused tests for server auth, notification API auth/payload behavior, profile boundary parsing, and change-request authenticated identity/reviewer enforcement.
9. **Tooling**: Added the Vitest `@/*` alias so tests resolve app imports the same way TypeScript/Next do.

### Checklist

- [x] Read required Cloud Agent, state, Firebase config/rules, Admin SDK, change-request, notification, and profile files
- [x] Preserve fire-alert ingestion, Firestore alert write path, alert listener/query behavior, alert schema, alert notification flow, and alert rules behavior
- [x] Secure change-request create/approve/reject server actions
- [x] Secure `/api/notifications/send` without breaking existing chat notifications
- [x] Fix Firebase Admin default app selection
- [x] Fix React state update during render in `useProfile`
- [x] Add async cancellation guard for isolated profile fetch
- [x] Remove assertions/comments and duplicate boundary typing from files changed for this PR
- [x] Normalize invalid Firebase ID token failures to 401
- [x] Preserve full Firestore profile documents in `parseProfile`
- [x] Add focused unit tests
- [x] Run install/typecheck/lint/unit/build/Firebase CLI/rules validation
- [x] Update `docs/ai/CODEBASE_END_TO_END_VALIDATION_REPORT.md`

### Evidence

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 19 existing warnings, 0 errors |
| `pnpm run test:unit` | PASS — 56/56 tests |
| `pnpm run build` | PASS — Firebase Admin credentials unavailable warnings only |
| `pnpm dlx firebase-tools --version` | PASS — 15.16.0 |
| `pnpm dlx firebase-tools emulators:exec --only firestore,storage --project demo-nfa-alerts-enterprise "true"` | PASS — Firestore and Storage emulators started and exited cleanly |
| Context7 MCP | WARN — monthly quota exceeded; fallback used repository inspection and installed package behavior |
| Initial Cloud toolchain | WARN — `node`, `npm`, `corepack`, and `pnpm` were missing from the image; installed Node 22.22.2 and activated pnpm 10.33.0 for validation |

### Fire-alert pipeline untouched

- `firestore.rules` unchanged.
- `storage.rules` unchanged.
- `firebase.json` unchanged.
- `src/app/api/webhook/route.ts` unchanged.
- Incident services/hooks and Firestore incident listener/query behavior unchanged.

### What is still broken / blocked

1. **Runtime secrets**: Real Firebase Admin credentials and `WEBHOOK_AUTH_TOKEN` still need to be configured in Vercel/Cloud runtime; no secrets were committed or printed.
2. **Least-privilege rules**: Firestore/Storage rules remain intentionally broad per request to avoid disrupting the alert path.
3. **Legacy cleanup**: Old repo service-account key rotation/history cleanup remains human-owned.
4. **Existing lint debt**: `lint:ci` passes within the warning budget but still reports 19 pre-existing warnings.
5. **Tooling setup**: Future Cloud agents should start from an image with Node 22 and Corepack/pnpm preinstalled to avoid repeating setup.

---

## What happened this session (2026-04-29 — New Chat Handoff)

Created `docs/ai/HANDOFF_TO_NEW_CHAT.md` as a concise, secret-free handoff for the next senior engineering assistant. The handoff summarizes current repo state, merged platform work, GitHub/Cursor settings, secret strategy, MCP/tooling guidance, abandoned PR #5, and the immediate next documentation task.

### Checklist

- [x] Create clean handoff document
- [x] Avoid secret values, raw tokens, private keys, and customer/private data
- [x] Document main branch as source of truth
- [x] Document PR #5 as closed/ignored
- [x] Record current GitHub/Cursor/secret strategy expectations

### Evidence

| Check | Result |
| --- | --- |
| `docs/ai/HANDOFF_TO_NEW_CHAT.md` | ADDED |

### What is still broken / blocked

1. **Next task input**: Attach the screenshot ZIP directly to the Cloud Agent task, or place screenshots under a repo-local `screenshots/` directory.
2. **Manual settings**: GitHub/Cursor dashboard settings remain manual configuration surfaces.

---

## Previous Session (2026-04-26 — Cloud/Bugbot/VPS Platform Hardening)

Extended the Cursor Cloud Agent setup into repo-tracked platform automation:

1. **Bugbot rules**: Added `.cursor/BUGBOT.md` and `docs/ai/BUGBOT_RULES.md` focused on runtime errors, Next.js boundaries, API failures, Firebase issues, deployment risks, and secret leaks while avoiding style noise.
2. **Cloud Agent hardening**: Updated `AGENTS.md` and `docs/ai/CLOUD_AGENTS.md` with exact dashboard steps, runtime/PORT behavior, production smoke tests, Bugbot activation, and My Machines guidance.
3. **VPS setup**: Added `scripts/vps-hostinger-setup.sh`, `scripts/vps-deploy.sh`, and `docs/ai/VPS_HOSTINGER.md` for Ubuntu/Hostinger setup with Node.js 22, pnpm 10.33.0, nginx, PM2, UFW, env-file handling, deployment, restart, and logs.
4. **CI automation**: Added `.github/workflows/ci.yml` to run install, typecheck, lint, unit tests, and build on PRs and pushes to `main`.
5. **Runtime config**: Confirmed existing production wrappers avoid inheriting invalid Cloud Agent runtime mode values during build/start; no build/start script changes were made in this pass.
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

- [x] Preserve verified production build/start wrappers
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
| Build/start environment check | WARN — Cloud Agent runtime mode values can be invalid for production commands; production wrappers avoid inheriting them |
| `bash -n scripts/vps-hostinger-setup.sh` | PASS |
| `bash -n scripts/vps-deploy.sh` | PASS |
| `bash -n scripts/with-bitwarden-env.sh` | PASS |
| `pm2 --version` | WARN — PM2 is installed by the VPS setup script but not present in this Cloud VM |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm run test:unit` | PASS — 40/40 tests |
| `pnpm run build` | PASS — wrapper avoided inheriting invalid Cloud Agent runtime mode values |
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

1. **Cloud readiness audit**: Confirmed the checked-out repo is `ynotfins/nfa-alerts-enterprise`, GitHub CLI is authenticated, Node `v22.22.2`, npm `10.9.7`, pnpm `10.33.0`, and the Cloud runtime environment exposed values incompatible with production commands.
2. **Tooling caveat**: MCP resources are not exposed in this Cloud session, and `firebase` CLI is not installed. Fallback used: repository inspection, Cursor docs, Bitwarden docs, GitHub CLI, and web research.
3. **Build hardening**: Changed `pnpm run build` to run `scripts/next-build.mjs`, which avoids inheriting invalid Cloud Agent runtime mode values during build.
4. **Environment template**: Removed manual runtime mode configuration from `.env.example`; Next.js controls its own runtime mode.
5. **Cloud Agent docs**: Added `docs/ai/CLOUD_AGENTS.md` with dashboard recommendations, required secrets, validation commands, MCP/plugin guidance, Bitwarden strategy, and troubleshooting.
6. **Operating policy**: Added `docs/ai/AGENT_OPERATING_MODE.md` and root `AGENTS.md` so future Cloud Agents find repo-specific operating rules automatically.
7. **Bitwarden workflow**: Added `scripts/with-bitwarden-env.sh`, a placeholder-only wrapper around `bws run --project-id "$BWS_PROJECT_ID"` that requires `BWS_ACCESS_TOKEN` and never prints secrets.
8. **Docs alignment**: Updated `docs/ai/INDEX.md` to point at Cloud Agent docs and fixed stale web push env names in `docs/ai/SYSTEM_WIRING.md`.
9. **Validation**: Full install/typecheck/lint/test/build suite passed with Cloud Agent runtime mode values present, proving `pnpm run build` avoids inheriting invalid values safely.
10. **Production start hardening**: Added `scripts/next-start.mjs` so `pnpm run start` also avoids inheriting invalid Cloud Agent runtime mode values.

### Checklist

- [x] Inspect current repo, git remote, Node/npm/pnpm versions, and exposed env caveats
- [x] Confirm MCP resources unavailable in this session and record fallback path
- [x] Research Cursor Cloud Agent setup/settings/Slack routing docs
- [x] Research Bitwarden Secrets Manager CLI/access-token docs
- [x] Add build wrapper for invalid inherited Cloud Agent runtime mode values
- [x] Remove manual runtime mode configuration from `.env.example`
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
| Build/start environment check | WARN — Cloud Agent runtime mode values can be invalid for production commands |
| `ListMcpResources` | WARN — no MCP resources exposed to this Cloud session |
| `gh auth status` | PASS — GitHub CLI authenticated |
| `firebase --version` | WARN — Firebase CLI not installed in this VM |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm run test:unit` | PASS — 40/40 tests |
| `pnpm run build` | PASS — wrapper avoided inheriting invalid runtime mode values; Next.js build completed |
| `PORT=3001 pnpm run start` | PASS — wrapper avoided inheriting invalid runtime mode values; Next.js production server ready |
| `curl -i http://127.0.0.1:3001/login` | PASS — `200 OK` from production server |
| `bash -n scripts/with-bitwarden-env.sh` | PASS |

### What is still broken / blocked

1. **Manual dashboard setting**: Do not configure runtime mode manually; Next.js controls it for dev, build, and start.
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
5. **Production build**: `pnpm run build` passed after the wrapper avoided inheriting invalid runtime mode values for production builds.
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
- [x] Ran production build with the runtime mode wrapper
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
| `pnpm run build` | PASS — build completed; Firebase Admin credentials unavailable warnings only |
| `curl -i http://127.0.0.1:3000/` | PASS — `307 Temporary Redirect` to `/login` |
| `curl -i http://127.0.0.1:3000/login` | PASS — `200 OK` |
| Browser walkthrough | PASS — mobile login page rendered |

### What is still broken / blocked

1. **Runtime credentials**: Real Firebase client/admin credentials are not configured in this Cloud VM; the dev server was started with non-secret public Firebase placeholder values only to prove the app boots and renders.
2. **Shell environment caveat**: Run builds through the repo script so the production wrapper can avoid inheriting invalid runtime mode values.
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
   - Configuration: `firebase mcp --dir <repo-path>`
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
