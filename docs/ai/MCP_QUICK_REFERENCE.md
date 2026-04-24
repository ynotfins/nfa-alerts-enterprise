# MCP Quick Reference Guide

Quick commands and queries for working with MCP servers in the NFA Alerts v2 project.

---

## Firebase MCP

### Common Queries

```text
"Show me the Firestore collections in this project"
"What are the current Firebase security rules?"
"List all Cloud Functions deployed"
"Show me recent Firebase Function logs for [function-name]"
"What Firebase Authentication methods are enabled?"
"Check Firebase Hosting deployments"
```

### Database Operations

```text
"Query the alerts collection for incidents from the last week"
"Show me the schema/structure of the users collection"
"List all documents in the notifications collection"
"Check Firestore indexes for the alerts collection"
```

### Debugging

```text
"Why is my Firebase Function failing?"
"Show me the last 50 lines of logs for the ingest function"
"Check if Firebase Auth is properly configured"
"Verify my Firestore security rules allow this read"
```

---

## Next.js DevTools MCP

### Route Analysis

```text
"Show me all routes in this Next.js app"
"What layouts are applied to the /incidents route?"
"List all API routes and their methods"
"Show me the route structure under /dashboard"
"Which routes use Server Components vs Client Components?"
```

### Performance & Diagnostics

```text
"What's the current dev server status?"
"Show me bundle size for the dashboard page"
"List all middleware in use"
"What environment variables are being used?"
"Check for route conflicts or issues"
```

### Documentation

```text
"How do I use Server Actions in Next.js 16?"
"What's the recommended pattern for loading states?"
"Show me Next.js App Router metadata best practices"
"How do I implement parallel routes?"
```

---

## Vercel MCP

### Deployment Management

```text
"List recent deployments for this project"
"Show me the build logs for the latest deployment"
"What's the status of the current production deployment?"
"Show me deployment details for [deployment-url]"
```

### Runtime Logs

```text
"Get runtime logs for the last hour"
"Show me errors from the production deployment"
"Search logs for 'authentication failed'"
"Show me function invocation logs for api/ingest"
```

### Environment & Configuration

```text
"List environment variables for production"
"What's the current deployment configuration?"
"Show me the preview deployment for PR #123"
"Check if edge config is enabled"
```

---

## Shadcn MCP

### Component Discovery

```text
"Show me all available shadcn components"
"What form components are available?"
"Search for dialog or modal components"
"List all button variants in the registry"
"What components use Radix UI primitives?"
```

### Installation

```text
"Install the button component"
"Add the dialog component to my project"
"Install the form and all its dependencies"
"Add the calendar and date picker components"
"Install the card component with the new-york style"
```

### Component Info

```text
"Show me the props for the Button component"
"What dependencies does the Form component need?"
"Show me examples of using the Dialog component"
"What's the difference between Alert and AlertDialog?"
```

---

## Context7

### Framework Documentation

```text
"Show me the latest Next.js 16 App Router docs"
"What's new in React 19 Server Components?"
"How do I use Firebase Admin SDK in Next.js?"
"Show me Tailwind CSS v4 configuration"
"What's the current Vercel deployment API?"
```

### Package & API Reference

```text
"Show me the react-hook-form v7 API"
"What are the Firestore v12 query methods?"
"How do I use zod v4 for validation?"
"Show me the @radix-ui/react-dialog API"
"What's the Firebase Auth v13 API for Next.js?"
```

---

## Thinking Patterns

### Use Cases

```text
Use `sequential_thinking` for:
- Multi-step implementation planning
- Complex feature architecture
- Migration strategies

Use `problem_decomposition` for:
- Breaking down large features
- Refactoring planning
- Test strategy development

Use `debugging_approach` for:
- Systematic bug investigation
- Root cause analysis
- Error pattern identification

Use `decision_framework` for:
- Technology choices
- Architecture decisions
- Trade-off analysis

Use `mental_model` for:
- System design
- Data flow architecture
- Integration planning

Use `critical_thinking` for:
- Plan validation
- Risk assessment
- Security review
```

---

## Common Workflows

### Starting a New Feature

```text
1. "Show me the current route structure" (Next.js DevTools)
2. "What components are already available?" (Shadcn)
3. "Show me the Firestore collections structure" (Firebase)
4. Use `mental_model` thinking pattern to design
5. Use `sequential_thinking` to plan implementation
```

### Debugging a Production Issue

```text
1. "Show me recent production errors" (Vercel MCP)
2. "Get runtime logs for the failing endpoint" (Vercel MCP)
3. "Check the Cloud Function logs" (Firebase MCP)
4. Use `debugging_approach` thinking pattern
5. "Show me the route configuration" (Next.js DevTools)
```

### Adding UI Components

```text
1. "Search for [type] components" (Shadcn MCP)
2. "Show me examples of the [component] component" (Shadcn)
3. "Install the [component] component" (Shadcn)
4. "Verify the component was added correctly" (check src/components/ui/)
```

### Deployment Investigation

```text
1. "List recent deployments" (Vercel MCP)
2. "Show build logs for [deployment]" (Vercel MCP)
3. "Check environment variables" (Vercel MCP)
4. "Verify Firebase configuration" (Firebase MCP)
5. "Check if routes are properly configured" (Next.js DevTools)
```

---

## Pro Tips

### Combine Multiple MCP Servers

```text
"Check the Firebase connection in my Next.js API route at app/api/ingest"
→ Uses Next.js DevTools to find route + Firebase to check connection

"Show me why the deployment is failing to connect to Firestore"
→ Uses Vercel logs + Firebase config + Next.js routes

"Install the form components and show me how to validate with Firebase"
→ Uses Shadcn to install + Context7 for Firebase patterns
```

### Chain Queries for Efficiency

```text
Instead of: "Show routes" then "Show API routes" then "Show middleware"
Do: "Give me a complete routing overview including API routes and middleware"
```

### Ask for Specific Evidence

```text
Good: "Show me the exact error in the logs for the last deploy"
Better: "Get the runtime logs for api/ingest from the last hour and identify the root cause"
```

### Use Natural Language

```text
✅ "Add a dialog component that works with Server Components"
✅ "Why is my Firebase Function timing out?"
✅ "Install the form components and their dependencies"

❌ "execute shadcn component installation routine"
❌ "query firebase logs via CLI"
```

---

## Emergency Commands

### Production is Down

```text
1. "Show me all production errors from the last 10 minutes" (Vercel)
2. "Get Firebase Function logs for [function-name]" (Firebase)
3. "What was the last successful deployment?" (Vercel)
4. "Show me the diff between current and last working deploy" (GitHub)
```

### Database Access Issues

```text
1. "Check Firebase security rules for [collection]" (Firebase)
2. "Show me recent Firestore operation logs" (Firebase)
3. "Verify Firebase Auth configuration" (Firebase)
4. "Check environment variables for Firebase config" (Vercel)
```

### Build Failures

```text
1. "Show me the build logs for the failing deployment" (Vercel)
2. "What changed in the last commit?" (GitHub)
3. "Check for TypeScript errors in the build output" (Next.js DevTools)
4. "Verify all dependencies are installed correctly"
```

---

## Verification After Changes

### After Installing Components

```text
"List files changed in src/components/ui/"
"Verify the new component imports are correct"
"Check if the component works with our Tailwind config"
```

### After Firebase Changes

```text
"Validate the updated security rules"
"Check if the new indexes are deployed"
"Verify Function deployment succeeded"
```

### After Route Changes

```text
"Show me the updated route structure"
"Verify middleware is applied correctly"
"Check for route conflicts"
```

---

## Best Practices

1. **Be Specific**: Include collection names, function names, route paths
2. **Ask for Evidence**: Request logs, configs, actual code snippets
3. **Chain Related Queries**: Let the AI use multiple MCP servers together
4. **Verify After Changes**: Always check that operations succeeded
5. **Use Read-Only First**: Inspect before modifying production systems

---

## Learning Resources

- Full MCP documentation: `docs/ai/CURSOR_MCP_AND_TOOLS.md`
- Bootstrap prompts: `docs/ai/tabs/TAB_BOOTSTRAP_PROMPTS.md`
- Current state: `docs/ai/STATE.md`

---

**Last updated:** 2026-04-24
