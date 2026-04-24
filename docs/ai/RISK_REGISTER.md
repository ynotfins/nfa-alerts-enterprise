# Risk Register — NFA Alerts

**Generated**: 2026-04-23  
**Last validated**: 2026-04-23 (AGENT Bootstrap session)

---

## 🔴 CRITICAL — Immediate Action Required

### RISK-001: Firebase Admin SDK Private Key Committed to Git

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL — Data Breach Risk |
| **Status** | PARTIAL — clean repo code dependency fixed; old repo key rotation/history cleanup still required |
| **Detected** | 2026-04-23 (AGENT Bootstrap session) |
| **Evidence** | `git show 42fde63 --name-status -- service-account.json` → status `A` (Added) |
| **Commit** | `42fde63 refactor: remove deprecated files and clean up environment configuration` (Nov 27 2025) |
| **Affected file** | `service-account.json` (2392 bytes, Firebase Admin SDK private key) |
| **Exposure scope** | File is in current HEAD and was pushed to `github.com/ynotfins/nfa-alert` |
| **Gitignore status** | File IS in `.gitignore:23` but was committed before the rule was effective |

**Impact**: Anyone with access to the GitHub repo can extract the private key and gain admin-level Firebase access (Firestore full read/write, Auth admin, Storage admin, FCM send to all users).

**Remediation (in order)**:
1. **Rotate the key NOW** — Firebase Console → Project Settings → Service Accounts → Generate New Private Key → delete the old key
2. Download the new key and store it securely (Secret Manager or env var as base64)
3. Remove the committed file from git history: `git filter-repo --invert-paths --path service-account.json`
4. Force-push to remote (coordinate with team): `git push origin main --force`
5. ✅ Clean repo: update `firebase-admin.ts` to load credentials from env vars, not file
6. Verify `.gitignore` entry covers `service-account.json`

**Note**: The `nfa-alerts-v2-firebase-adminsdk-*.json` file also exists locally but IS gitignored via `.gitignore:24:*-firebase-adminsdk-*.json`. However, since a key was committed, rotate all keys as a precaution.

**Clean repo Phase 1 status (2026-04-24)**: `D:/github/nfa-alerts-enterprise` no longer requires `service-account.json` in product code. Firebase Admin now uses server environment variables. This does **not** rotate the exposed old key or clean old repository history.

---

## 🔴 HIGH — Security

### RISK-002: Overly Permissive Firestore Rules for Incidents

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **Status** | Partially mitigated (PR #12 deployed) |
| **Evidence** | `firestore.rules:46 allow update: if isAuthenticated()` (pre-fix) |
| **PR #12** | `security: lock role changes + restrict incident updates` |

**Current state**: PR #12 deployed `d5c30d8`. Verify that update rules now restrict to responders/supes.  
**Residual risk**: Verify in Firebase Console → Rules Playground that non-responders cannot update incidents.

### RISK-003: No Rate Limiting on API Routes

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **Status** | OPEN |
| **Affected routes** | `/api/webhook`, `/api/notifications/send` |

**Impact**: DoS via webhook flooding; notification spam.  
**Mitigation**: Add Next.js middleware rate limiting or Vercel Edge rate limiting.

### RISK-004: No CSRF Protection on Notification API

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **Status** | OPEN |
| **Route** | `/api/notifications/send` |

---

## 🟡 MEDIUM — Performance

### RISK-005: N+1 Query in Chat Notification Loop

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **Status** | OPEN |
| **Evidence** | `src/services/chat.ts:213-221` — queries ALL supes on every message |

**Impact**: Every chaser_to_supes message triggers full profiles query + sequential notification fetch loop.

### RISK-006: No Pagination

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **Status** | OPEN |

Incident list hard-capped at 50. Chat loads all messages. No cursor-based pagination.

---

## 🟡 MEDIUM — Reliability

### RISK-007: Dual Service Worker Registration

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **Status** | OPEN |
| **Evidence** | `src/app/layout.tsx` registers both `/sw.js` and `/firebase-messaging-sw.js` |

**Impact**: Potential service worker conflicts, cache inconsistency.

### RISK-008: Near-Zero Test Coverage (~3%)

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **Status** | OPEN |
| **Coverage** | Only webhook parser (40 tests). No incidents, chat, auth, components. |

**Impact**: Regressions shipped undetected. Refactoring extremely risky.

---

## 🟢 LOW — Tech Debt

### RISK-009: Oversized Service Files

`incidents.ts` is 799 LOC. Should be split into incident-crud, incident-subscriptions, incident-documents.

### RISK-010: Type Definitions Scattered

Types duplicated between `src/lib/db.ts` and `src/schemas/*.ts`. Should derive from Zod schemas.

### RISK-011: 20 ESLint Warnings

Within budget (25) but need incremental resolution. See ENGINEERING_QUALITY.md ratchet plan.

---

## Closed / Mitigated

| Risk | Resolution |
|------|-----------|
| Full table scan in favorites (`getIncidentsWithNotes`) | Fixed Dec 1 2025 — collection group query |
| OpenAI live API calls in tests | Fixed PR #9 — mocked with `tests/__mocks__/ai.ts` |
| 28 lint errors | Fixed PR #8 — zero errors |
| Permissive incident update rules | Partially fixed PR #12 |
