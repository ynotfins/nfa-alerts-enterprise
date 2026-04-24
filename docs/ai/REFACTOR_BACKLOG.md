# Refactor Backlog

**Generated**: 2026-04-23  
**Scope**: Tracked tech debt. Each item needs a PLAN task before AGENT executes.

---

## Priority Order

### P1 — Security (Do First)

| Item | File | Risk | Effort |
|------|------|------|--------|
| Rotate + remove service-account.json from git history | `service-account.json` | CRITICAL | Medium |
| Add rate limiting to /api/webhook + /api/notifications/send | `next.config.ts` / middleware | HIGH | Low |
| Move service account to env var | `firebase-admin.ts` | HIGH | Low |

### P2 — Test Coverage

| Item | File | Risk | Effort |
|------|------|------|--------|
| Add integration tests for incidents.ts | `tests/` | MEDIUM | High |
| Add integration tests for chat.ts | `tests/` | MEDIUM | Medium |
| Add auth context tests | `tests/` | MEDIUM | Medium |
| Add Playwright E2E for login → incidents → respond | `e2e/` | MEDIUM | High |
| Set coverage threshold in vitest.config.ts | `vitest.config.ts` | LOW | Low |

### P3 — Performance

| Item | File | Risk | Effort |
|------|------|------|--------|
| Cache supe list in chat service | `src/services/chat.ts` | MEDIUM | Low |
| Parallelize notification sends | `src/services/chat.ts:224` | MEDIUM | Low |
| Add cursor-based pagination to incident list | `src/services/incidents.ts` | MEDIUM | Medium |
| Add pagination to chat messages | `src/services/chat.ts` | LOW | Medium |

### P4 — PWA / Mobile

| Item | File | Risk | Effort |
|------|------|------|--------|
| Add SW cache-control headers | `next.config.ts` | LOW | Low |
| Migrate public/manifest.json to app/manifest.ts | `src/app/manifest.ts` | LOW | Low |
| Remove android.apk from git (large binary) | git history | LOW | Low |
| Evaluate Capacitor migration | — | LOW | High |

### P5 — Code Quality

| Item | File | Risk | Effort |
|------|------|------|--------|
| Split incidents.ts (799 LOC) into focused modules | `src/services/incidents.ts` | LOW | Medium |
| Derive types from Zod schemas (remove db.ts duplication) | `src/lib/db.ts` | LOW | Medium |
| Extract fingerprinting from auth-context | `src/contexts/auth-context.tsx` | LOW | Low |
| Resolve 20 ESLint warnings (ratchet down budget) | Multiple | LOW | Low |
| Add structured logging (Pino/Winston) | Multiple | LOW | High |

---

## Completed Refactors

| Item | PR | Date |
|------|----|----|
| Fixed N+1 in getIncidentsWithNotes() | — | Dec 1, 2025 |
| Fixed 28 lint errors | PR #8 | — |
| Made tests deterministic (mocked OpenAI) | PR #9 | — |
| Added lint budget + strict target | PR #10 | — |
| Locked role changes + incident update rules | PR #12 | — |
| Deleted 4,029 lines of unused code | PR #3 | — |
| Next.js + React security upgrades | PR #4 | — |
