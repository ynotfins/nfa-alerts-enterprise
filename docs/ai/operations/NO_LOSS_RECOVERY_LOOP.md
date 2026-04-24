# No-Loss Recovery Loop — NFA Alerts

**Generated**: 2026-04-23  
**Canonical source for this repo**: This file  
**Tri-workspace canonical source**: AI-PM repo `NO_LOSS_RECOVERY_LOOP.md`

---

## Recovery Order (Numbered — Authoritative)

1. Search OpenMemory: `nfa-alerts-v2` + task keywords
2. Read `docs/ai/recovery/current-state.json`
3. Read `docs/ai/recovery/active-blockers.json`
4. Read `docs/ai/STATE.md`
5. Read ONE of `DECISIONS.md`, `PATTERNS.md`, or `HANDOFF.md` (demand-driven)
6. Read `docs/ai/context/AGENT_EXECUTION_LEDGER.md` (last resort — one block only)

## Critical Pre-Session Checks

```bash
cd D:/github/nfa-alerts-v2/nfa-alert
git branch --show-current          # Verify branch
git rev-parse HEAD                 # Verify HEAD
git status --short                 # Verify dirty state
```

Expected HEAD: `a5d8ec28879848733c6e76c2ba8fa2039c261441`  
Expected branch: `main`

## Recovery Bundle Files

All live at `docs/ai/recovery/`:
- `current-state.json` — structured current state
- `session-summary.md` — narrative of last session
- `active-blockers.json` — all open blockers
- `memory-delta.json` — decisions/patterns made last session

**Contract**: These files are non-canonical. They never override repo docs.
