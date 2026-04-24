# Cursor Agent Workflow — NFA Alerts

**Generated**: 2026-04-23

---

## 5-Tab Workflow Overview

This project uses a 5-tab AI workflow in Cursor:

| Tab | Role | Model | Job |
|-----|------|-------|-----|
| PLAN | Architect/Planner | GPT-5.4 Thinking | Define bounded tasks for AGENT. Make trade-off decisions. Never executes code. |
| AGENT | Executioner | GPT-5.4 Thinking (complex) / Sonnet (fast) | Executes exactly what PLAN specifies. No freelancing. |
| DEBUG | Forensics | GPT-5.4 Thinking | Root cause analysis only. No edits. Produces one fix prompt for AGENT. |
| ASK | Researcher | Sonnet / GPT-5.4 | Answers questions, compares options. Nothing binding until promoted to PLAN. |
| ARCHIVE | Docs Curator | Fast model | Maintains docs/ai/* + OpenMemory. No product code. |

---

## Tab Prompts Location

Bootstrap prompts for all 5 tabs:  
`D:/github/nfa-alerts-v2/docs/ai/tabs/TAB_BOOTSTRAP_PROMPTS.md`

---

## Session Start Protocol (AGENT)

1. Confirm repo path is `D:/github/nfa-alerts-v2/nfa-alert`
2. Read latest PLAN from `context/AGENT_EXECUTION_LEDGER.md` or chat
3. Verify restore point (`git branch --show-current`, `git rev-parse HEAD`)
4. Search OpenMemory for `nfa-alerts-v2` context
5. Read `docs/ai/STATE.md` and `docs/ai/HANDOFF.md`
6. Read `docs/ai/recovery/current-state.json`
7. Read `docs/ai/memory/DECISIONS.md` and `PATTERNS.md`
8. Use Serena for code inspection before any edits

---

## Session End Protocol (AGENT)

After every session, update:
- `docs/ai/STATE.md`
- `docs/ai/HANDOFF.md`
- `docs/ai/recovery/current-state.json`
- `docs/ai/recovery/session-summary.md`
- `docs/ai/recovery/active-blockers.json`
- `docs/ai/recovery/memory-delta.json`
- `docs/ai/memory/DECISIONS.md` (if decisions made)
- `docs/ai/memory/PATTERNS.md` (if patterns discovered)
- `docs/ai/context/AGENT_EXECUTION_LEDGER.md` (append entry)
- OpenMemory (compact durable entries)

---

## Stop Conditions (AGENT)

Stop immediately and document in `active-blockers.json` if:
- PLAN prompt is incomplete or ambiguous
- PLAN assumptions conflict with repo evidence
- Secret exposure discovered
- Required MCP/tool is degraded and task cannot proceed safely

---

## Authoritative Docs Location

`D:/github/nfa-alerts-v2/nfa-alert/docs/ai/` — this directory  
Workspace-root `D:/github/nfa-alerts-v2/docs/ai/` — migration/reference only (preserved, not deleted)
