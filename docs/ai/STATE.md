# NFA Alerts — AI State

**Last updated**: 2026-04-24  
**Session type**: AGENT Executioner — Pre-push Firebase env hygiene hardening
**Status**: COMPLETE — validation passed; this commit is the pre-push hardening commit

---

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
| PUSH-001 | HIGH | Clean repo push requires explicit approval and confirmed GitHub repo URL/visibility | Human |
| RISK-008 | MEDIUM | ~3% test coverage | PLAN |

Recommended target for later push, pending human confirmation: `ynotfins/nfa-alerts-enterprise`, visibility `private`.

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
