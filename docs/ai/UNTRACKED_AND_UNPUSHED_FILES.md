# Untracked and Unpushed Files

**Generated**: 2026-04-23  
**Validated against**: live `git status` + safety-status.txt (exact match)

---

## Unpushed Commits (1 commit ahead of origin/main)

| Commit | Message |
|--------|---------|
| `a5d8ec2` | `chore: force prod redeploy (env sync)` |

**Action required**: Review before pushing. The `.env` file is marked as dirty (modified). Ensure the env sync intended by this commit does not expose secrets.

---

## Dirty Tracked Files (modified, not staged)

| File | Risk | Notes |
|------|------|-------|
| `.env` | 🔴 CRITICAL | Live credentials — do NOT commit |
| `.gitignore` | 🟢 Safe | Gitignore additions — safe to commit |
| `package.json` | 🟢 Safe | Script/dep changes — safe to commit |
| `pnpm-lock.yaml` | 🟢 Safe | Lock file sync — safe to commit |

**Warning**: Stashing `.env` will NOT remove it from the working tree if it was already dirty before your session. Always verify `.env` is not staged before committing.

---

## Untracked Files

| File | Status | Notes |
|------|--------|-------|
| `.firebaserc` | 🟡 Keep | Firebase project binding for CLI — do NOT lose |
| `PRODUCT_MODEL.md` | 🟡 Keep | Product spec — consider committing |
| `firestore-debug.log` | 🟢 Safe to delete | Debug log — not needed |
| `pnpm-workspace.yaml` | 🟡 Keep | pnpm workspace config — should be committed or gitignored |

---

## Files in Working Dir but Gitignored (sensitive)

| File | Gitignored By | Risk |
|------|---------------|------|
| `service-account.json` | `.gitignore:23` | 🔴 COMMITTED — see RISK-001 |
| `nfa-alerts-v2-firebase-adminsdk-*.json` | `.gitignore:24` | 🔴 Gitignored correctly but may still be sensitive |
| `.env` | `.gitignore` | 🔴 Live credentials |

---

## Recommended Actions

1. **Immediately**: Rotate Firebase service account key (RISK-001)
2. **Soon**: Commit `pnpm-workspace.yaml` or add to `.gitignore`
3. **Soon**: Commit `PRODUCT_MODEL.md` (product spec should be tracked)
4. **Any time**: Delete `firestore-debug.log`
5. **Review**: The unpushed `a5d8ec2` commit before pushing
