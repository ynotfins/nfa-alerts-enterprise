# Memory Contract — NFA Alerts

**Generated**: 2026-04-23

---

## Authoritative Memory Sources (Priority Order)

1. `docs/ai/recovery/` bundle — current-state.json, active-blockers.json, session-summary.md, memory-delta.json
2. OpenMemory (search `nfa-alerts-v2` at session start)
3. `docs/ai/STATE.md`
4. ONE of: `docs/ai/memory/DECISIONS.md`, `PATTERNS.md`, or `HANDOFF.md` (on demand)
5. `docs/ai/context/AGENT_EXECUTION_LEDGER.md` (last resort)

---

## OpenMemory Usage Rules

- Always search at session start: `nfa-alerts-v2`, task keywords
- Store at session end: compact, self-identifying entries only
- Format: `[repo=nfa-alerts-v2][kind=decision|pattern|blocker][status=active|closed][date=YYYY-MM-DD] <content>`
- No secrets. No raw code. No long transcripts.
- Max entry: ~200 words

---

## What Goes Where

| Content | Location |
|---------|----------|
| Durable architectural decisions | DECISIONS.md + OpenMemory |
| Recurring implementation patterns | PATTERNS.md + OpenMemory |
| Open blockers | active-blockers.json + OpenMemory |
| Session facts | recovery/current-state.json |
| Completed session narrative | recovery/session-summary.md |
| Verbatim AGENT execution record | context/AGENT_EXECUTION_LEDGER.md |
| Rolling operational window | STATE.md |
| Concise unresolved operator snapshot | HANDOFF.md |
