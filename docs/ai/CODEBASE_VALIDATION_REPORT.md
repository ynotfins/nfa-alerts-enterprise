# Codebase Validation Report

**Generated**: 2026-04-23  
**Session**: AGENT Bootstrap  
**Git HEAD**: `a5d8ec28879848733c6e76c2ba8fa2039c261441`

---

## Summary

| Command | Outcome | Notes |
|---------|---------|-------|
| `pnpm lint:ci` | ✅ PASS | 20 warnings, 0 errors (budget: 25) |
| `pnpm typecheck` | ✅ PASS | 0 TypeScript errors |
| `pnpm test:unit` | ✅ PASS | 40/40 tests, 2 files |
| `pnpm build` | ✅ PASS | 34 routes compiled, 0 errors |

**Overall: CLEAN BUILD** — production-ready at current HEAD.

---

## pnpm lint:ci — PASS (20 warnings)

**Command**: `pnpm lint:ci` (eslint --max-warnings 25)  
**Result**: 0 errors, 20 warnings  
**Budget**: 25 (5-warning buffer remaining)

### Warning Breakdown

| File | Line | Warning | Rule |
|------|------|---------|------|
| `src/app/(dashboard)/admin/users/admin-users-client.tsx` | — | `CardContent` defined but never used | no-unused-vars |
| `src/components/chat/chaser-search-drawer.tsx` | 28 | `loading` assigned but never used | no-unused-vars |
| `src/components/chat/chaser-search-drawer.tsx` | 50 | `error` defined but never used | no-unused-vars |
| `src/components/google-map.tsx` | 165 | Unused eslint-disable directive | — |
| `src/components/incidents/incident-card.tsx` | 80 | `userRole` defined but never used | no-unused-vars |
| `src/components/pwa-install-prompt.tsx` | 132 | Using `<img>` — consider `<Image />` | @next/next/no-img-element |
| `src/contexts/auth-context.tsx` | 12 | `Unsubscribe` defined but never used | no-unused-vars |
| `src/contexts/auth-context.tsx` | 20 | `checkUserStatus` defined but never used | no-unused-vars |
| `src/hooks/use-incidents.ts` | 4 | `Profile` defined but never used | no-unused-vars |
| `src/hooks/use-incidents.ts` | 6 | `listIncidents` defined but never used | no-unused-vars |
| `src/hooks/use-incidents.ts` | 7 | `getIncident` defined but never used | no-unused-vars |
| `src/hooks/use-push-notifications.ts` | 18 | Missing `checkSupport` in useEffect deps | react-hooks/exhaustive-deps |

**Action**: None required this session. Reduce budget incrementally per ENGINEERING_QUALITY.md ratchet plan.

---

## pnpm typecheck — PASS

**Command**: `pnpm typecheck` (tsc --noEmit)  
**Result**: 0 errors, clean exit  
**Note**: TypeScript strict mode is enabled.

---

## pnpm test:unit — PASS

**Command**: `pnpm test:unit` (vitest run)  
**Result**: 40/40 tests passed, 2 test files  
**Duration**: ~354ms total

| File | Tests | Status |
|------|-------|--------|
| `tests/webhook-notifications.test.ts` | 28 | ✅ PASS |
| `tests/webhook-parser.test.ts` | 12 | ✅ PASS |

**Note**: Tests use `tests/__mocks__/ai.ts` to mock OpenAI — deterministic, no live API calls.

**Coverage gap**: Only webhook parser is tested. See RISK_REGISTER.md RISK-008.

---

## pnpm build — PASS

**Command**: `pnpm build` (next build)  
**Result**: All 34 routes compiled, 0 errors  
**Build artifacts**: `.next/` directory

### Route Summary

| Type | Count | Routes |
|------|-------|--------|
| Static (○) | ~20 | /incidents, /chat, /login, /signup/*, /profile, etc. |
| Dynamic (ƒ) | ~14 | /incidents/[id], /chat/[threadId], /chasers/[chaserId], /api/* |

**Note**: A `.next/` build directory exists and is current. Do not delete it unless rebuilding.

---

## What Was Not Run

| Command | Reason |
|---------|--------|
| `pnpm test:ui` | Interactive UI mode — not appropriate for non-interactive AGENT session |
| `firebase emulators:start` | Requires Java 11+; not part of this bootstrap scope |
| E2E tests | No Playwright/Cypress configured |
| Firebase deploy | Not in scope for this session |
