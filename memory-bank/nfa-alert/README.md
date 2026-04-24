# Memory Bank

This folder contains the project memory bank for use with the [memory-bank-mcp](https://github.com/alioshr/memory-bank-mcp) MCP server.

## Files Structure

| File | Purpose |
|------|---------|
| `projectbrief.md` | Core requirements and goals |
| `productContext.md` | Problem context and solutions |
| `techContext.md` | Tech stack and setup |
| `systemPatterns.md` | Architecture and code patterns |
| `activeContext.md` | Current focus and decisions |
| `progress.md` | Status and roadmap |
| `.clinerules` | Project-specific AI rules |

## Setup MCP Server in Cursor

### Option 1: GUI Setup (Recommended)

1. Open Cursor Settings (`Ctrl+,`)
2. Go to **Features** → **MCP Servers**
3. Click **Add new MCP server**
4. Enter:
   - **Name:** `memory-bank`
   - **Command:** 
   ```
   env MEMORY_BANK_ROOT=D:/github/nfa-alert/memory-bank npx -y @allpepper/memory-bank-mcp@latest
   ```

### Option 2: Manual JSON Config

Add to your Cursor MCP settings:

```json
{
  "memory-bank": {
    "command": "npx",
    "args": ["-y", "@allpepper/memory-bank-mcp@latest"],
    "env": {
      "MEMORY_BANK_ROOT": "D:/github/nfa-alert/memory-bank"
    }
  }
}
```

## Available MCP Tools

Once configured, these tools become available:

| Tool | Purpose |
|------|---------|
| `memory_bank_read` | Read memory bank files |
| `memory_bank_write` | Create new memory bank files |
| `memory_bank_update` | Update existing memory bank files |
| `list_projects` | List available projects |
| `list_project_files` | List files within a project |

## Usage Commands

Tell the AI assistant:

- **"follow your custom instructions"** - Triggers full memory bank read
- **"initialize memory bank"** - Creates project structure if missing
- **"update memory bank"** - Triggers documentation updates

## File Relationships

```
projectbrief.md ─────┬──→ productContext.md
                     ├──→ techContext.md
                     └──→ systemPatterns.md
                              │
                              ▼
                        activeContext.md
                              │
                              ▼
                         progress.md
```

- Foundation files inform context files
- All context files inform `activeContext.md`
- `progress.md` tracks implementation status
- `.clinerules` is accessed throughout for project intelligence


