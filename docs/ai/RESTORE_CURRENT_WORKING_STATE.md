# Restore Current Working State

**Generated**: 2026-04-23  
**Session**: AGENT Bootstrap  
**Status**: VERIFIED from live git evidence

---

## ⚠ CRITICAL WARNING BEFORE RESTORING

**`service-account.json` is committed to the old repo git HEAD.** The Firebase Admin SDK private key is exposed in the old repository (commit `42fde63`, present on GitHub remote). Before restoring or sharing the old repo, rotate the Firebase service account key in the Firebase Console and remove the file from git history.

The clean repo at `D:/github/nfa-alerts-enterprise` must not restore or copy `service-account.json`. Firebase Admin credentials are loaded from server environment variables instead.

---

## Repo Identity

| Property | Value |
|----------|-------|
| Workspace root | `D:/github/nfa-alerts-v2` |
| Git root | `D:/github/nfa-alerts-v2/nfa-alert` |
| Remote | `https://github.com/ynotfins/nfa-alert` |
| Branch | `main` |
| HEAD commit | `a5d8ec28879848733c6e76c2ba8fa2039c261441` |
| HEAD message | `chore: force prod redeploy (env sync)` |
| Ahead of remote | **1 commit** (not yet pushed) |
| Node version | v22.22.0 |
| pnpm version | 10.24.0 |

---

## Current Git State (Snapshot: 2026-04-23)

### Dirty Tracked Files (modified, not staged/committed)

```
 M .env
 M .gitignore
 M package.json
 M pnpm-lock.yaml
```

**Warning**: `.env` is modified. Contains live credentials. Do NOT commit or overwrite.

### Untracked Files

```
.firebaserc
PRODUCT_MODEL.md
firestore-debug.log
pnpm-workspace.yaml
```

**Warning**: `.firebaserc` contains Firebase project binding — do not lose.

---

## Validation Evidence (2026-04-23)

| Command | Result |
|---------|--------|
| `pnpm lint:ci` | PASS — 20 warnings, 0 errors |
| `pnpm typecheck` | PASS — 0 errors |
| `pnpm test:unit` | PASS — 40/40 tests |
| `pnpm build` | PASS — all 34 routes compiled |

---

## Restore Commands

### Verify you are on the correct branch and HEAD

```bash
cd D:/github/nfa-alerts-v2/nfa-alert
git branch --show-current
# Expected: main

git rev-parse HEAD
# Expected: a5d8ec28879848733c6e76c2ba8fa2039c261441

git status --short
# Expected: M .env, M .gitignore, M package.json, M pnpm-lock.yaml
#           ?? .firebaserc, ?? PRODUCT_MODEL.md, ?? firestore-debug.log, ?? pnpm-workspace.yaml
```

### Restore dependencies (if node_modules missing)

```bash
cd D:/github/nfa-alerts-v2/nfa-alert
pnpm install
```

### Start dev server

```bash
cd D:/github/nfa-alerts-v2/nfa-alert
pnpm dev
# App runs at http://localhost:3000
# Mobile-only viewport — use Chrome DevTools device simulation
```

### Verify build is still clean

```bash
pnpm lint:ci          # Expect: 0 errors, ≤25 warnings
pnpm typecheck        # Expect: 0 errors
pnpm test:unit        # Expect: 40 passed
pnpm build            # Expect: all routes compile
```

---

## Files That Must NOT Be Overwritten

| File | Reason |
|------|--------|
| `.env` | Live Firebase, OpenAI, Google Maps, VAPID, webhook secret credentials |
| `service-account.json` | Old repo Firebase Admin SDK private key (CRITICAL — do not restore to clean repo; rotate then delete from old repo history) |
| `nfa-alerts-v2-firebase-adminsdk-*.json` | Firebase Admin SDK key (alternate name — gitignored) |
| `.firebaserc` | Firebase project binding (`nfa-alerts-v2`) |
| `firestore.rules` | Production Firestore security rules (deployed) |
| `storage.rules` | Production Storage security rules (deployed) |
| `firestore.indexes.json` | Deployed Firestore composite indexes |

---

## Safety Artifacts

The following files in the workspace root provide the pre-session baseline:

- `D:/github/nfa-alerts-v2/safety-status.txt` — git status at session start (matches current)
- `D:/github/nfa-alerts-v2/safety-untracked.txt` — untracked files at session start (matches current)

---

## Recovery Tags / Branches

Check for safety tags:

```bash
git tag --list
git log --oneline -20
```

ENGINEERING_QUALITY.md mentions a rollback branch was created for safety during the Dec 2025 polish phase. Verify:

```bash
git branch -a
```

---

## Environment Surfaces (do not hardcode)

The app reads these env vars from `.env`:
- `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS_JSON` — server-side Firebase Admin SDK service account JSON (raw or base64)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — alternate server-side Firebase Admin SDK triplet
- `NEXT_PUBLIC_FIREBASE_*` — client-side Firebase SDK (safe to expose but restrict API key scope)
- `OPENAI_API_KEY` — OpenAI GPT-4o-mini
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps (restrict in Google Cloud console)
- `WEBHOOK_AUTH_TOKEN` — Bearer token for `/api/webhook`
- `VAPID_*` — Web Push keys
