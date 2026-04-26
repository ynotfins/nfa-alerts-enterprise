# AI Documentation Index

Central directory for all AI-assisted development documentation in NFA Alerts v2.

**Location:** `D:/github/nfa-alerts-v2/docs/ai/`

---

## Quick Start

### New to this project?

1. Read [STATE.md](STATE.md) - Current project state and recent changes
2. Read [CLOUD_AGENTS.md](CLOUD_AGENTS.md) - Cursor Cloud Agent setup and validation
3. Read [AGENT_OPERATING_MODE.md](AGENT_OPERATING_MODE.md) - Autonomous agent workflow policy
4. Read [BUGBOT_RULES.md](BUGBOT_RULES.md) - Bugbot review focus and activation steps
5. Read [VPS_HOSTINGER.md](VPS_HOSTINGER.md) - Hostinger VPS deployment and worker guidance
6. Read [CURSOR_MCP_AND_TOOLS.md](CURSOR_MCP_AND_TOOLS.md) - Available MCP servers
7. Read [MCP_QUICK_REFERENCE.md](MCP_QUICK_REFERENCE.md) - Common commands

### Starting a coding session?

1. Check [STATE.md](STATE.md) for current blockers and progress
2. Review [CLOUD_AGENTS.md](CLOUD_AGENTS.md) for Cloud Agent settings and commands
3. Review [AGENT_OPERATING_MODE.md](AGENT_OPERATING_MODE.md) before implementation
4. Review [BUGBOT_RULES.md](BUGBOT_RULES.md) before PR-impacting changes
5. Review [HANDOFF.md](HANDOFF.md) for immediate context

---

## Core Documentation

### Current State & Context

- **[STATE.md](STATE.md)** - Operational truth for active repo/session
  - Current MCP server installations and status
  - Recent changes and evidence
  - Pending actions and blockers

- **[HANDOFF.md](HANDOFF.md)** - Concise snapshot for next session
  - Unresolved issues
  - In-progress work
  - Immediate next steps

### MCP Tools & Integration

- **[CURSOR_MCP_AND_TOOLS.md](CURSOR_MCP_AND_TOOLS.md)** - Complete MCP reference
  - All installed MCP servers and configurations
  - Features and capabilities per server
  - Usage guidelines and security policies
  - Troubleshooting common issues

- **[MCP_QUICK_REFERENCE.md](MCP_QUICK_REFERENCE.md)** - Common commands
  - Quick query examples for each MCP server
  - Common workflows and patterns
  - Emergency commands
  - Pro tips for combining MCP servers

### Workflow & Processes

- **[CLOUD_AGENTS.md](CLOUD_AGENTS.md)** - Cursor Cloud Agent readiness guide
  - Dashboard settings
  - Secrets and Bitwarden strategy
  - Validation and troubleshooting

- **[AGENT_OPERATING_MODE.md](AGENT_OPERATING_MODE.md)** - Autonomous agent operating policy
  - Planning, decision, testing, PR, and secret handling rules

- **[tabs/TAB_BOOTSTRAP_PROMPTS.md](tabs/TAB_BOOTSTRAP_PROMPTS.md)** - 5-tab model setup
  - PLAN, AGENT, DEBUG, ASK, ARCHIVE tab prompts
  - Required MCP/tool policy
  - Project mental model seed
  - Memory system structure

### Recovery & Logging

- **[recovery/session-summary.md](recovery/session-summary.md)** - Latest session summary
- **[context/AGENT_EXECUTION_LEDGER.md](context/AGENT_EXECUTION_LEDGER.md)** - Execution log

---

## Additional Documentation

### Project Architecture

- Architecture diagrams
- System wiring and integrations
- Data flow documentation
- Component relationships

*(These files to be created as needed by PLAN sessions)*

### Memory & Decisions

- **memory/DECISIONS.md** - Durable decisions and rationale
- **memory/PATTERNS.md** - Implementation patterns
- **memory/OPENMEMORY_SYNC.md** - OpenMemory integration

### Operations

- **operations/NO_LOSS_RECOVERY_LOOP.md** - Recovery procedures
- **operations/RECOVERY_BUNDLE_SPEC.md** - State backup specification

---

## Document Roles

| Document | Purpose | Updated By | Frequency |
|----------|---------|------------|-----------|
| STATE.md | Current operational state | All tabs | Every meaningful change |
| HANDOFF.md | Session transition | All tabs | End of session |
| CURSOR_MCP_AND_TOOLS.md | MCP server catalog | ARCHIVE | When servers added/changed |
| MCP_QUICK_REFERENCE.md | Command examples | ARCHIVE | As patterns emerge |
| TAB_BOOTSTRAP_PROMPTS.md | Session setup | ARCHIVE | When workflow changes |
| AGENT_EXECUTION_LEDGER.md | Command history | AGENT | After each execution |
| session-summary.md | Work summary | All tabs | End of session |

---

## MCP Servers Installed (2026-04-24)

### Mandatory Stack (All Installed ✅)

1. **Firebase MCP** - Backend infrastructure
2. **Next.js DevTools MCP** - Framework tooling
3. **Vercel MCP** - Deployment management
4. **Shadcn MCP** - UI component library

### Additional Available

- OpenMemory - Session memory
- Thinking Patterns - Structured reasoning
- Context7 - Documentation lookup
- GitHub MCP - Repository operations
- Playwright MCP - Browser testing
- Serena - Semantic code analysis

See [CURSOR_MCP_AND_TOOLS.md](CURSOR_MCP_AND_TOOLS.md) for complete details.

---

## File Organization

```text
docs/ai/
├── INDEX.md                          (this file)
├── STATE.md                          ← Read first
├── HANDOFF.md                        ← Session context
├── CURSOR_MCP_AND_TOOLS.md          ← MCP reference
├── MCP_QUICK_REFERENCE.md           ← Quick commands
├── tabs/
│   └── TAB_BOOTSTRAP_PROMPTS.md     ← Session setup
├── memory/
│   ├── DECISIONS.md
│   ├── PATTERNS.md
│   └── OPENMEMORY_SYNC.md
├── operations/
│   ├── NO_LOSS_RECOVERY_LOOP.md
│   └── RECOVERY_BUNDLE_SPEC.md
├── recovery/
│   ├── current-state.json
│   ├── session-summary.md
│   ├── active-blockers.json
│   └── memory-delta.json
├── context/
│   └── AGENT_EXECUTION_LEDGER.md
└── archive/
    └── (old state snapshots)
```

---

## Naming Conventions

- **ALL_CAPS.md** - Persistent reference documentation
- **lowercase-hyphenated.md** - Session/state files
- **Sentence_Case.md** - Archive/backup files

---

## Rules & Policies

### Memory Hierarchy

1. **Repository files win** - Always source of truth over memory
2. **STATE.md** - Current operational state
3. **OpenMemory** - Durable cross-session context
4. **Session files** - Temporary working state

### Update Requirements

Per user rule: "After every meaningful change (code/config/docs), Agent must update docs/ai/STATE.md in the same commit (or at minimum before ending the session), including checklist, evidence, and what's still broken."

### Security

- Never commit credentials or secrets to any doc
- Use read-only MCP access by default
- Require explicit approval for production writes
- Document security decisions in memory/DECISIONS.md

---

## Getting Help

### For MCP Server Issues

1. Check [CURSOR_MCP_AND_TOOLS.md](CURSOR_MCP_AND_TOOLS.md) troubleshooting section
2. Verify configuration in `C:\Users\ynotf\.cursor\mcp.json`
3. Reload Cursor: `Ctrl+Shift+P` → `Developer: Reload Window`

### For Workflow Questions

1. Review [tabs/TAB_BOOTSTRAP_PROMPTS.md](tabs/TAB_BOOTSTRAP_PROMPTS.md)
2. Check [MCP_QUICK_REFERENCE.md](MCP_QUICK_REFERENCE.md) for examples
3. Consult [STATE.md](STATE.md) for current context

### For Project Questions

1. Start with [STATE.md](STATE.md)
2. Check OpenMemory for historical context
3. Use Context7 MCP for library documentation
4. Ask in ASK tab for research

---

**Last updated:** 2026-04-24  
**Workspace:** `D:/github/nfa-alerts-v2`  
**Git root:** `D:/github/nfa-alerts-v2/nfa-alert`
