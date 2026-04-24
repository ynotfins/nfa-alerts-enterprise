# Recovery Bundle Spec — NFA Alerts

**Generated**: 2026-04-23

---

## Files in the Recovery Bundle

| File | Format | Purpose |
|------|--------|---------|
| `recovery/current-state.json` | JSON | Structured current state of repo, session, blockers |
| `recovery/session-summary.md` | Markdown | Narrative of last AGENT/ARCHIVE session |
| `recovery/active-blockers.json` | JSON | All open blockers with severity, owner, remediation |
| `recovery/memory-delta.json` | JSON | Decisions and patterns made in the most recent session |

---

## Update Contract

- Every AGENT session must write all 4 files before ending
- Every ARCHIVE session must verify all 4 files are current
- Files are non-canonical — they never override repo docs or OpenMemory
- Files are written last (after all other docs), paired with one OpenMemory write

---

## current-state.json Schema

```json
{
  "generated": "ISO8601",
  "session_type": "AGENT | ARCHIVE | DEBUG",
  "session_outcome": "string",
  "git": {
    "root": "path",
    "branch": "string",
    "head": "sha",
    "ahead_by": 0,
    "dirty_tracked": ["file"],
    "untracked": ["file"]
  },
  "validation": {
    "lint": "PASS|FAIL",
    "typecheck": "PASS|FAIL",
    "tests": "PASS|FAIL",
    "build": "PASS|FAIL"
  },
  "active_blockers": ["B001"],
  "docs_present": {}
}
```
