# NFA Alerts — AI State

**Last updated**: 2026-04-24  
**Session type**: AGENT Executioner — Safe Repository Migration  
**Status**: IN PROGRESS — clean baseline extraction to `D:/github/nfa-alerts-enterprise`

---

## What happened this session

Added IP-based sliding window rate limiting to `/api/webhook` (10 req/min) and `/api/notifications/send` (20 req/min) via `src/proxy.ts`. No existing files modified. No new dependencies added.

**Key discovery**: Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` (`export function proxy`). Created the file using the correct Next.js 16 convention to avoid deprecation warnings. Context7 also confirmed `request.ip` was removed in Next.js 16; rate limiter uses `x-forwarded-for` header (consistent with existing webhook route).

## 🔴 CRITICAL — Requires Immediate Human Action

**`service-account.json` is committed to git and on GitHub.** (SEC-001 — unchanged from prior session)

- Commit: `42fde63` (Nov 27 2025, status: Added)
- Current HEAD: file still present
- Remote: `github.com/ynotfins/nfa-alert` (pushed)

**Do this NOW**:
1. Rotate the Firebase service account key in Firebase Console
2. Remove file from git history: `git filter-repo --invert-paths --path service-account.json`
3. Force-push to remote
4. Update `firebase-admin.ts` to use env var (not file)

See `RISK_REGISTER.md` RISK-001.

---

## Active Blockers

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| SEC-001 | CRITICAL | service-account.json committed to git | Human/PLAN |
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

1. **Security**: Rotate Firebase service account key + remove from git history (SEC-001 — CRITICAL, unchanged)
2. **Commit**: `git add src/proxy.ts docs/ai/ && git commit -m "feat: add IP rate limiting via Next.js 16 proxy (RISK-003)"`
3. **Deploy**: Push + redeploy to Vercel so rate limiting takes effect in production
4. **Test coverage**: Next safe task is RISK-008 — add integration tests for incidents service
5. **DEC-002 pending**: After SEC-001 key rotation, remove `service-account.json` file fallback from `firebase-admin.ts`

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

## Session 2026-04-24 (Migration) — Clean Repo Extraction

**Status**: IN PROGRESS — clean target copied, secret-bearing files excluded from baseline.

### Checklist

- [x] Created local broken/current snapshot under `D:/github/nfa-alerts-migration-backups/20260424-185639`
- [x] Copied app to isolated target `D:/github/nfa-alerts-enterprise`
- [x] Excluded `.env`, service account JSON, Firebase Admin SDK JSON, `.firebaserc`, logs, `.git`, `.next`, `node_modules`, `.cursor`, and `.serena`
- [x] Strengthened `.gitignore` for local secrets, deploy bindings, logs, tool state, and migration artifacts
- [x] Generated value-free `.env.example` from source environment variable references
- [ ] Initialize and commit clean baseline
- [ ] Run local verification
- [ ] Push only after a new GitHub repo URL is provided
- [ ] Restore old workspace only after human confirms exact known-good target

### Evidence

- Old app branch at freeze: `main`
- Old app HEAD at freeze: `a5d8ec28879848733c6e76c2ba8fa2039c261441`
- Backup record: `D:/github/nfa-alerts-migration-backups/20260424-185639/RESTORE_RECORD.txt`
- Secret scan is path-only; values were not printed. Strong scan still flags existing public Firebase web config and test/source token references for review.

### Still Broken / Blocked

- New GitHub repo URL is not provided yet, so push must stop before remote setup.
- Old workspace restoration is blocked until the new repo is verified and a human confirms the exact known-good commit/tag/branch.