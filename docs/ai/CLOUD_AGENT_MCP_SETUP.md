# Cloud Agent MCP Setup

Cloud Agents do not inherit local Cursor Desktop MCP servers automatically. Desktop MCPs often run as local `stdio` processes, depend on a local browser profile, or read a machine-specific config such as `~/.cursor/mcp.json`. Cloud Agents run in remote VMs and should use Cloud Agent MCP settings, team integrations, or built-in cloud tools.

## Current Cloud Agent findings

| Tool | Found in this session | Enabled by this agent | Notes |
| --- | --- | --- | --- |
| Context7 MCP | No | No | Recommended for framework and library docs. Must be enabled manually in Cursor Cloud Agent MCP settings if available. |
| Browser testing / computer use | Yes | Already available | Available as Cloud Agent tools for browser/manual UI verification, screenshots, and recordings. No repo token needed. |
| Playwright MCP | No | No | Optional only if Cursor Cloud supports it for this workspace. This repo does not currently include Playwright test dependencies. |
| OpenMemory / Mem0 | No | No | Optional only with a Cloud-compatible server and explicit authorization. Store non-secret project facts only. |
| Figma | No | No | Optional only when real Figma files are available for this project. Do not block repo audit work on it. |
| GitHub MCP | No | No | GitHub CLI is available separately for read-only inspection. PR creation uses Cursor's PR tool, not `gh` writes. |
| Local Cursor Desktop MCPs | Not applicable | No | Do not copy local-only MCP configs into the repo for Cloud Agents. |

## Recommended MCPs and tools

| MCP/tool | Purpose | Setup type | Required secrets or headers | Scope | Safe for public-repo audit |
| --- | --- | --- | --- | --- | --- |
| Context7 | Current official docs for Next.js, Firebase, GitHub Actions, Jetpack Compose, Android, and library APIs. Use as reference, not as source of truth for app behavior. | Built-in plugin or Cloud-compatible custom HTTP MCP. | Usually none for public docs. If the provider requires a token, add `CONTEXT7_SECRET_KEY` in Cursor My Secrets and configure `Authorization: Bearer ${CONTEXT7_SECRET_KEY}` in the Cloud MCP settings. | Global is acceptable; per repo is preferred if using a token. | Yes. |
| Browser testing / computer use | Run the app, inspect visible routes, verify mobile UI states, capture screenshots and videos, and support screenshot-to-source documentation. | Built-in Cloud Agent capability. | None. | Global. | Yes. |
| Playwright MCP | Optional browser automation for repeatable UI exploration if Cloud supports the MCP. | Cloud-compatible custom HTTP MCP or built-in plugin only. Avoid local `npx @playwright/mcp` unless Cursor Cloud explicitly supports that server. | None for local browser control; provider-specific token only if the chosen hosted MCP requires one. Store it in Cursor My Secrets and send it via an `Authorization` header. | Per repo. | Yes when configured read-only against local/dev app URLs. |
| OpenMemory / Mem0 | Store only high-level, non-secret workflow facts that help future agents. Repo markdown remains the durable source of truth. | Cloud-compatible custom HTTP MCP or built-in plugin only. | If using Mem0 Cloud, add `MEM0_API_KEY` in Cursor My Secrets and configure `Authorization: Bearer ${MEM0_API_KEY}`. If using another OpenMemory host, use the provider's documented token name and header; do not guess or commit it. | Per repo. | Yes, only for non-secret summaries. |
| Figma | Map screenshots and UI implementation to real designs when a project Figma file exists. | Built-in plugin/OAuth or Cloud-compatible custom HTTP MCP. | Prefer OAuth through Cursor. If a token-based setup is required, add `FIGMA_ACCESS_TOKEN` in Cursor My Secrets and configure `Authorization: Bearer ${FIGMA_ACCESS_TOKEN}`. | Per repo. | Yes, only when design access is intended for this repo. |

## Not recommended for this Cloud Agent setup

| MCP/tool | Recommendation | Reason |
| --- | --- | --- |
| Serena | Skip unless Cursor documents Cloud Agent support for the exact server. | Usually local indexing/language-server state. Cloud Agents already have repo search and TypeScript tooling. |
| Local filesystem MCP | Skip. | Cloud Agents already have repository filesystem tools; adding another filesystem MCP increases write and secret-exposure risk. |
| Local browser-profile MCPs | Skip. | They depend on local desktop profiles and cookies that Cloud Agents cannot safely access. |
| Desktop-only MCPs | Skip. | Local app context does not apply to remote Cloud Agent VMs. |
| Thinking Patterns / Sequential Thinking | Skip. | Structured reasoning is already part of the agent prompt; no external MCP is needed. |
| next-devtools | Skip for this task unless Cloud support is explicit. | Useful locally, but this task focuses on public repo audit, UI documentation, and Android planning. Context7 plus repo inspection covers framework reference safely. |

## Manual setup steps

Use these steps only in Cursor Cloud Agent or team integration settings, not in repo files:

1. Open Cursor Cloud Agents or Cursor Dashboard integrations.
2. Add Context7 first if it is available as a built-in plugin. Prefer no-token public docs mode.
3. Confirm browser/computer-use testing is available for agents. No MCP token is needed.
4. Add Playwright MCP only if Cursor Cloud lists a supported Cloud-compatible option.
5. Add OpenMemory/Mem0 only if the workspace owner wants memory beyond repo markdown docs. Use per-repo scope and store only non-secret summaries.
6. Add Figma only after a real design file or team design workspace exists.
7. Put any required token only in Cursor My Secrets or the provider dashboard. Never commit MCP tokens or headers.
8. Prefer HTTP MCPs for Cloud Agents. Avoid copying local `stdio` MCP commands from Cursor Desktop unless Cursor documents Cloud Agent support for that server.

## Security rules

- Never store secrets in MCP memory.
- Never commit MCP tokens, API keys, OAuth tokens, cookies, or generated MCP config containing credentials.
- Never paste API keys into prompts, screenshots, markdown docs, terminal logs, or PR bodies.
- Use Cursor My Secrets, GitHub Secrets, provider OAuth, or provider dashboards for credentials.
- Keep repo markdown docs as the durable source of truth.
- Use Context7 only for current framework/library reference.
- Use browser testing for visible UI evidence; avoid production accounts or customer data.

## Optional memory entry

If OpenMemory/Mem0 is available and authorized, store exactly this high-level fact:

> For nfa-alerts-enterprise Cloud Agent workflows, repo markdown docs are the durable source of truth. Use Context7 for current framework docs. Use Playwright/browser testing if available. Use memory only for non-secret high-level project facts.

Do not store secrets, tokens, customer data, private URLs, raw environment values, or screenshots that contain sensitive data.
