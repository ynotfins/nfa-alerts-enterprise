# HANDOFF

**Last updated**: 2026-04-24  
**Session type**: AGENT Executioner — RISK-003 Rate Limiting  
**Status**: COMPLETE — `src/proxy.ts` created, all validation gates pass

---

## What happened this session

Added IP-based sliding window rate limiting to `/api/webhook` (10 req/min) and `/api/notifications/send` (20 req/min) via `src/proxy.ts`. No existing files modified. No new dependencies added.

**Key discovery**: Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` (export function renamed from `middleware` to `proxy`). Used the correct convention to avoid deprecation warnings. Context7 confirmed `request.ip` was removed in Next.js 16; rate limiter uses `x-forwarded-for` header (consistent with existing webhook route line 49).

## 🔴 CRITICAL — Requires Immediate Human Action

**`service-account.json` is committed to git and on GitHub.** (SEC-001 — unchanged)

**Do this NOW**:
1. Rotate the Firebase service account key in Firebase Console
2. Remove file from git history: `git filter-repo --invert-paths --path service-account.json`
3. Force-push to remote
4. Update `firebase-admin.ts` to use env var only

---

## Active Blockers

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| SEC-001 | CRITICAL | service-account.json committed to git | Human/PLAN |
| RISK-008 | MEDIUM | ~3% test coverage | PLAN |

RISK-003 — **RESOLVED this session** via `src/proxy.ts`.

---

## Git State (validated 2026-04-24)

- Branch: `main`, HEAD: `a5d8ec2`
- 1 commit ahead of remote (unpushed) + `src/proxy.ts` newly untracked
- Dirty tracked: `.env`, `.gitignore`, `package.json`, `pnpm-lock.yaml`

---

## Validation (all PASS)

| Command | Result |
|---------|--------|
| `pnpm lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm typecheck` | PASS — 0 errors |
| `pnpm build` | PASS — 34 routes + Proxy active, no deprecation warning |

---

## What PLAN should do next

1. **SEC-001 CRITICAL**: Rotate Firebase key + remove from git history
2. **Commit & deploy**: `git add src/proxy.ts docs/ai/ && git commit -m "feat: IP rate limiting via Next.js 16 proxy (RISK-003)"` then push + Vercel redeploy
3. **RISK-008**: Next safe task — integration tests for incidents service
4. **DEC-002**: After SEC-001, remove `service-account.json` file fallback from `firebase-admin.ts`
