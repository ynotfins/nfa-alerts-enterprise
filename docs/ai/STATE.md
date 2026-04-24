# NFA Alerts — AI State

**Last updated**: 2026-04-24  
**Session type**: AGENT Executioner — Phase 1 Firebase Admin Credential Fix
**Status**: COMPLETE — clean repo credential-loading fix verified; push still blocked pending explicit approval

---

## What happened this session

Added IP-based sliding window rate limiting to `/api/webhook` (10 req/min) and `/api/notifications/send` (20 req/min) via `src/proxy.ts`. No existing files modified. No new dependencies added.

**Key discovery**: Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` (`export function proxy`). Created the file using the correct Next.js 16 convention to avoid deprecation warnings. Context7 also confirmed `request.ip` was removed in Next.js 16; rate limiter uses `x-forwarded-for` header (consistent with existing webhook route).

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

## Active Blockers

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| SEC-001 | CRITICAL | Old repo key rotation + history cleanup still required | Human |
| RISK-008 | MEDIUM | ~3% test coverage | PLAN |

RISK-003 (rate limiting) — **RESOLVED this session**.

---

## Git State (validated 2026-04-24)

- Branch: `main`, HEAD: `a5d8ec2`
- **1 commit ahead of remote** (unpushed) + `src/proxy.ts` untracked (new)
- Dirty tracked: `.env`, `.gitignore`, `package.json`, `pnpm-lock.yaml`
- Untracked: `.firebaserc`, `PRODUCT_MODEL.md`, `firestore-debug.log`, `pnpm-workspace.yaml`, `src/proxy.ts`

---

## Validation (all PASS)

| Command | Result |
|---------|--------|
| `pnpm lint:ci` | PASS — 20 warnings, 0 errors (unchanged) |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS — 34 routes + Proxy active, no deprecation warning |

---

## Files Changed This Session

| File | Action | Summary |
|------|--------|---------|
| `src/proxy.ts` | CREATED | IP sliding window rate limiter for /api/webhook + /api/notifications/send |
| `docs/ai/STATE.md` | UPDATED | Session 2026-04-24 added |
| `docs/ai/HANDOFF.md` | UPDATED | This file |
| `docs/ai/recovery/current-state.json` | UPDATED | RISK-003 resolved |
| `docs/ai/recovery/active-blockers.json` | UPDATED | RISK-003 removed |
| `docs/ai/recovery/session-summary.md` | UPDATED | Session added |
| `docs/ai/recovery/memory-delta.json` | UPDATED | New decisions/patterns |
| `docs/ai/memory/DECISIONS.md` | UPDATED | DEC-005, DEC-006 added |
| `docs/ai/memory/PATTERNS.md` | UPDATED | PAT-008 added |
| `docs/ai/context/AGENT_EXECUTION_LEDGER.md` | UPDATED | Session block appended |

---

## What PLAN should do next

1. **Security**: Rotate old Firebase service account key + remove `service-account.json` from old repo git history (SEC-001 — CRITICAL residual)
2. **Push**: Do not push the clean repo until explicitly approved
3. **Deploy**: Configure runtime env vars before any Vercel redeploy
4. **Test coverage**: Next safe task is RISK-008 — add integration tests for incidents service

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
