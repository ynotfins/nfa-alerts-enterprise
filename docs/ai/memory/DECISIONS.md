# Decisions — NFA Alerts

**Generated**: 2026-04-23  
**Purpose**: Durable architectural decisions. Add when a non-obvious choice is locked in.

---

## DEC-001: Authoritative docs location is nfa-alert/docs/ai/

**Date**: 2026-04-23  
**Session**: AGENT Bootstrap  
**Decision**: The authoritative in-repo AI workflow docs live at `D:/github/nfa-alerts-v2/nfa-alert/docs/ai/`. The workspace-root `D:/github/nfa-alerts-v2/docs/ai/` is preserved as migration/reference but is not the live operational location.  
**Rationale**: The git root is `nfa-alert/`. Keeping docs inside the git repo is safer and ensures they travel with the codebase.

---

## DEC-002: Firebase Admin SDK credential loading order

**Date**: 2026-04-23  
**Session**: AGENT Bootstrap (observed, not changed)  
**Current behavior**: Clean repo `firebase-admin.ts` loads Firebase Admin credentials from server environment variables only. It supports `FIREBASE_SERVICE_ACCOUNT_JSON`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, or the `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` triplet.
**Required change**: Old repo key rotation and git history cleanup remain required for RISK-001. Do not restore file-based credential loading.
**Status**: CODE-FIXED in clean repo — old repo rotation/history cleanup still required

---

## DEC-003: PWA-first mobile strategy (TWA for Android)

**Date**: 2026-04-23  
**Session**: AGENT Bootstrap (research only — not a binding PLAN decision)  
**Current**: TWA via `twa-manifest.json` + `public/android.apk`  
**Deferred**: Capacitor migration — higher risk/effort than value at current phase  
**Next review trigger**: When geolocation background tracking, native push, or biometric auth are required

---

## DEC-005: Next.js 16 uses proxy.ts, not middleware.ts

**Date**: 2026-04-24  
**Session**: AGENT Executioner (RISK-003 Rate Limiting)  
**Decision**: In Next.js 16, the `middleware.ts` file convention is deprecated. The correct file is `src/proxy.ts` with `export function proxy` (not `export function middleware`). The `config.matcher` export API is unchanged.  
**Rationale**: Verified via Context7 against Next.js 16.1.1 docs. Build generates deprecation warning with `middleware.ts`, no warning with `proxy.ts`.  
**Codemod**: `npx @next/codemod@latest middleware-to-proxy .`

---

## DEC-006: IP resolution via x-forwarded-for header

**Date**: 2026-04-24  
**Session**: AGENT Executioner (RISK-003 Rate Limiting)  
**Decision**: `request.ip` was removed in Next.js 16. The official replacement (`@vercel/functions` `ipAddress()`) is not in this project's dependencies. IP resolution uses `x-forwarded-for` header — consistent with the existing webhook route handler (`route.ts` line 49). First entry in the comma-separated header value is the client IP.  
**Rationale**: No new dependency required. Pattern already established in codebase. Works on Vercel; falls back to "unknown" locally (all local requests share one rate limit slot — acceptable).

---

## DEC-004: Lint budget ratchet policy

**Date**: Dec 2025 (documented 2026-04-23)  
**Decision**: Two lint scripts — `lint:ci` (--max-warnings 25, CI gate) and `lint:strict` (--max-warnings 0, future target). Budget reduced incrementally as warnings resolved.  
**Current**: 20 warnings, budget 25.  
**Source**: `ENGINEERING_QUALITY.md`
