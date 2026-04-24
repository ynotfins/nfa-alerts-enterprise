# Cursor MCP and Tools Configuration

This document catalogs all Model Context Protocol (MCP) servers and tools configured for the NFA Alerts v2 project.

**Last updated:** 2026-04-24

**Global MCP config location:** `C:\Users\ynotf\.cursor\mcp.json`

---

## Installed MCP Servers

### 1. Firebase MCP ✅

**Status:** Installed and configured  
**Type:** CLI-based MCP server  
**Authentication:** OAuth (logged in as `ynotfins@gmail.com`)

**Configuration:**

```json
"firebase": {
  "command": "firebase",
  "args": ["mcp", "--dir", "D:\\github\\nfa-alerts-v2\\nfa-alert"],
  "env": {}
}
```

**Features:**

- Firebase project management and inspection
- Firestore database queries and operations
- Firebase Authentication management
- Cloud Functions inspection and logs
- Firebase Storage management
- Hosting configuration and deployments
- Security rules validation

**Project context:**

- Active project: `nfa-alerts-v2` (Project ID: `nfa-alerts-v2`)
- Project number: `466111323548`
- Firebase CLI version: `15.15.0`

**Usage guidelines:**

- Prefer read-only operations unless explicitly approved for writes
- Always verify which Firebase project is active before operations
- Use for debugging authentication, Firestore queries, and function logs

---

### 2. Next.js DevTools MCP ✅

**Status:** Installed and configured  
**Type:** npm-based MCP server  
**Authentication:** None required

**Configuration:**

```json
"next-devtools": {
  "command": "npx",
  "args": ["-y", "next-devtools-mcp@latest"],
  "env": {}
}
```

**Features:**

- Access to Next.js app routes and file structure
- Runtime diagnostics and performance monitoring
- Dev server context and build information
- Next.js documentation search and reference
- Route generation and analysis
- App Router and Pages Router inspection

**Project context:**

- Next.js version: `16.1.1`
- React version: `19.2.3`
- App Router architecture
- TypeScript enabled

**Usage guidelines:**

- Use for understanding route structure and layouts
- Query for Next.js-specific patterns and best practices
- Debug server-side rendering and client component issues
- Verify route configurations and middleware

---

### 3. Vercel MCP ✅

**Status:** Installed (requires OAuth authentication)  
**Type:** HTTP-based MCP server  
**Authentication:** OAuth (pending first use)

**Configuration:**

```json
"vercel": {
  "type": "http",
  "url": "https://mcp.vercel.com"
}
```

**Features:**

- List and inspect deployments
- Access deployment build logs
- Retrieve runtime logs for debugging
- Search Vercel documentation
- Project and team management
- Environment variable inspection (read-only recommended)
- Deployment preview URLs and status

**Usage guidelines:**

- Authenticate on first use via OAuth prompt
- Use for debugging production deployment issues
- Check runtime logs when investigating production errors
- Verify environment variable configuration
- Inspect build failures and optimize build performance
- Read-only access recommended; require explicit approval for deployments

---

### 4. Shadcn MCP ✅

**Status:** Installed and configured  
**Type:** npm-based MCP server  
**Authentication:** None required

**Configuration:**

```json
"shadcn": {
  "command": "npx",
  "args": ["shadcn@latest", "mcp"]
}
```

**Features:**

- Browse available shadcn/ui components from registry
- Search components by name or functionality
- Install components with natural language commands
- Automatic dependency resolution
- Support for blocks and templates
- Registry namespace support for custom registries

**Project context:**

- Components location: `src/components/ui/`
- Style: New York
- React Server Components: Enabled
- Icon library: Lucide
- Tailwind CSS configured with CSS variables
- Path aliases: `@/components`, `@/lib/utils`, `@/components/ui`

**Usage guidelines:**

- Use AI commands like "install the button component" or "add a dialog"
- Browse available components before installing
- Verify component compatibility with React Server Components
- Check for existing components before adding duplicates

---

## Additional Available MCP Servers

### 5. OpenMemory

**Status:** Available  
**Type:** Python-based MCP server  
**Purpose:** Session memory and context persistence

**Configuration:**

```json
"openmemory": {
  "command": "python",
  "args": ["D:\\github\\AI-Project-Manager\\scripts\\openmemory_cursor_server.py"],
  "env": {
    "CLIENT_NAME": "cursor",
    "OPENMEMORY_STORE_PATH": "C:\\Users\\ynotf\\.openclaw\\data\\openmemory-cursor.sqlite3",
    "OPENMEMORY_TRACE_FILE": "C:\\Users\\ynotf\\.openclaw\\logs\\openmemory-cursor-trace.log"
  }
}
```

**Usage:**

- Store durable decisions and patterns
- Retrieve project context across sessions
- Track blockers and resolutions
- Maintain long-term project memory

---

### 6. Thinking Patterns

**Status:** Available  
**Type:** Standalone executable  
**Purpose:** Structured reasoning and decision frameworks

**Configuration:**

```json
"thinking-patterns": {
  "command": "thinking-patterns"
}
```

**Available patterns:**

- `sequential_thinking` - Multi-step problem breakdown
- `problem_decomposition` - Task and subproblem analysis
- `decision_framework` - Comparing options and trade-offs
- `debugging_approach` - Systematic bug investigation
- `mental_model` - Architecture and system design
- `critical_thinking` - Plan validation and risk analysis

---

### 7. Context7

**Status:** Available  
**Type:** HTTP-based documentation MCP  
**Purpose:** Real-time library and framework documentation

**Configuration:**

```json
"Context7": {
  "type": "http",
  "url": "https://mcp.context7.com/mcp",
  "headers": {}
}
```

**Usage:**

- Fetch current Next.js, React, Firebase documentation
- Query Tailwind CSS, TypeScript, and other library docs
- Verify API syntax and migration guides
- Access up-to-date package documentation

---

### 8. GitHub MCP

**Status:** Available  
**Type:** npm-based MCP server  
**Purpose:** Git and GitHub operations

**Configuration:**

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {}
}
```

**Usage:**

- Create and manage branches
- Review pull requests and diffs
- Inspect commit history
- Manage issues and labels
- Only use when repo operations are in scope

---

### 9. Playwright MCP

**Status:** Available  
**Type:** npm-based MCP server  
**Purpose:** Browser automation and testing

**Configuration:**

```json
"playwright": {
  "command": "npx",
  "args": ["@playwright/mcp@latest"]
}
```

**Usage:**

- Browser-level verification and smoke testing
- End-to-end test automation
- Visual regression testing
- PWA functionality verification

---

### 10. Serena

**Status:** Available  
**Type:** Semantic code analysis MCP  
**Purpose:** Intelligent codebase navigation

**Configuration:**

```json
"serena": {
  "command": "serena",
  "args": ["start-mcp-server", "--project-from-cwd"],
  "env": {}
}
```

**Usage:**

- Semantic code search and symbol discovery
- Cross-file relationship analysis
- Impact analysis for refactoring
- Type and interface tracking

---

### 11. Obsidian Vault

**Status:** Available  
**Type:** PowerShell-based MCP server  
**Purpose:** Knowledge base integration

**Configuration:**

```json
"obsidian-vault": {
  "command": "pwsh",
  "args": ["-NoProfile", "-NonInteractive", "-File", "C:\\Users\\ynotf\\.openclaw\\start-obsidian-mcp-server.ps1"],
  "env": {
    "OBSIDIAN_BASE_URL": "http://127.0.0.1:27123",
    "OBSIDIAN_VERIFY_SSL": "false"
  }
}
```

---

### 12. Filesystem MCP

**Status:** Available  
**Type:** npm-based MCP server  
**Purpose:** File system operations

**Configuration:**

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "D:\\github",
    "C:\\Users\\ynotf\\.openclaw",
    "D:\\github_2"
  ],
  "env": {}
}
```

---

## MCP Server Priority for NFA Alerts v2

For this Next.js/Firebase PWA project, prioritize these MCP servers:

### Always use when available

1. **Firebase MCP** - Core backend infrastructure
2. **Next.js DevTools MCP** - Framework-specific tooling
3. **Shadcn MCP** - UI component management
4. **Context7** - Current documentation access

### Use when task-appropriate

5. **Vercel MCP** - Deployment and production debugging
6. **thinking-patterns** - Complex decisions and architecture
7. **Serena** - Large refactors and impact analysis
8. **OpenMemory** - Cross-session context and decisions

### Use only when explicitly needed

9. **GitHub MCP** - When doing repo operations (branches, PRs)
10. **Playwright MCP** - When testing is in scope
11. **filesystem** - When external file operations are needed

---

## Security and Access Control

### Read-only by default

- Firebase operations (unless explicitly approved)
- Vercel deployments and environment variables
- GitHub repository modifications
- Filesystem operations outside project directory

### Requires explicit approval

- Production database writes
- Deployment triggers
- Branch operations and force pushes
- Environment variable changes
- Security rule modifications

### Never expose

- API keys and secrets in logs
- Service account credentials
- User authentication tokens
- Production database credentials

---

## Troubleshooting

### MCP Server not loading

1. Check `C:\Users\ynotf\.cursor\mcp.json` for correct configuration
2. Verify npm packages are accessible (check `npx` cache)
3. Reload Cursor: `Ctrl+Shift+P` → `Developer: Reload Window`
4. Check MCP status in Cursor Settings → Tools & MCP

### Firebase MCP issues

- Verify Firebase CLI is logged in: `firebase login:list`
- Check project context: `firebase use`
- Confirm working directory is correct in mcp.json `--dir` arg

### Vercel MCP authentication

- First use will prompt for OAuth
- Re-authenticate if session expires
- Check network connectivity to `mcp.vercel.com`

### Shadcn MCP issues

- Ensure `components.json` exists in project
- Verify project was initialized with `npx shadcn@latest init`
- Check Tailwind CSS is properly configured

---

## Adding New MCP Servers

To add additional MCP servers:

1. Add configuration to `C:\Users\ynotf\.cursor\mcp.json`
2. Update this documentation file
3. Update `docs/ai/tabs/TAB_BOOTSTRAP_PROMPTS.md` if mandatory
4. Update `docs/ai/STATE.md` with installation evidence
5. Reload Cursor to activate new server
6. Test server availability in Cursor chat

---

## References

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Firebase CLI MCP Documentation](https://firebase.google.com/docs/cli/mcp)
- [Next.js DevTools MCP GitHub](https://github.com/vercel/next-devtools-mcp)
- [Vercel MCP Documentation](https://mcp.vercel.com/docs)
- [Shadcn MCP Documentation](https://ui.shadcn.com/docs/mcp)
