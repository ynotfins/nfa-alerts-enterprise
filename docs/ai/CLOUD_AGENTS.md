# Cursor Cloud Agents — NFA Alerts

## Readiness status

This repo is ready for Cursor Cloud Agents when the dashboard points agents at `ynotfins/nfa-alerts-enterprise` and the update command is `pnpm install --frozen-lockfile`.

Validated Cloud evidence:

- `pnpm install --frozen-lockfile` passes.
- `pnpm run typecheck` passes.
- `pnpm run lint:ci` passes within the current warning budget.
- `pnpm run test:unit` passes.
- `pnpm run build` passes even when Cursor injects `NODE_ENV=development`.
- `pnpm run dev --hostname 0.0.0.0 --port 3000` renders `/login` with mobile viewport emulation.

The dashboard item "Set up your cloud environment" can remain incomplete even when a saved environment is active. Cursor resolves environments in this order: repo `.cursor/environment.json`, personal environment, then team environment. The docs do not expose a reliable agent-readable completion flag for that onboarding checklist, and Cloud Agents cannot change dashboard settings from inside the repo. Treat a successful agent launch plus the validation commands above as the repo-level readiness signal.

## Cursor dashboard settings

Recommended settings:

| Setting | Recommendation | Reason |
| --- | --- | --- |
| Default repository | `ynotfins/nfa-alerts-enterprise` | Avoids routing this app's work to `ynotfins/AI-Project-Manager`. |
| Base branch | `main` | Matches this repo's integration branch. Blank also works if GitHub default remains `main`. |
| Branch prefix | `cursor/` | Matches current branch and PR convention. |
| Create PRs | Always | Keeps autonomous work reviewable and traceable. |
| PR review destination | GitHub | Matches repo workflow. |
| Network access | Allow all network access | Useful while agents install packages, fetch docs, and inspect provider APIs. Revisit if the repo needs stricter controls. |
| Slack notifications | On for completion/failure only if you want async nudges; otherwise off is fine for solo work | Slack is useful when agents run long or from Slack threads. For solo dashboard-driven work, GitHub PRs and Cursor notifications are usually enough. |
| Routing rules | Add one rule for this repo | Map `nfa`, `nfa-alerts`, `firebase`, `incidents`, and `chasers` to `ynotfins/nfa-alerts-enterprise`. |

If Slack is used, mention the repo explicitly for important tasks: `@Cursor in ynotfins/nfa-alerts-enterprise, ...`.

Manual dashboard steps:

1. Open Cursor Dashboard > Cloud Agents.
2. Set Default repository to `ynotfins/nfa-alerts-enterprise`.
3. Set Base branch to `main`.
4. Keep Branch prefix as `cursor/`.
5. Keep Create PRs as Always.
6. Keep PR review destination as GitHub.
7. Keep Network access as Allow all network access unless a production security policy requires allowlisting.
8. Remove the `NODE_ENV` secret. Keep `PORT` only when a fixed port is required.
9. Add routing keywords `nfa`, `nfa-alerts`, `firebase`, `incidents`, and `chasers` for this repository.
10. If Slack is used, enable completion/failure notifications only; for solo dashboard-driven work, Slack can stay disabled.

## Required secrets

Add real values manually in Cursor Cloud Agents > My Secrets. Scope each secret to `ynotfins/nfa-alerts-enterprise` where the dashboard allows repo scoping. Do not commit `.env*` files with real values; `.env.example` is structure only.

Required for real runtime:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `WEBHOOK_AUTH_TOKEN`
- `SITE_URL`
- `NEXT_PUBLIC_GOOGLE_MAP_ID`

Required for server/admin features:

- One of:
  - `FIREBASE_SERVICE_ACCOUNT_JSON`
  - `GOOGLE_APPLICATION_CREDENTIALS_JSON`
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

Optional by feature:

- `WEB_PUSH_PRIVATE_KEY` only if future server-side Web Push sending is added; current notification sending uses Firebase Admin Messaging and client token registration uses `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`.
- `CONTEXT7_SECRET_KEY` for Cursor/MCP/agent tooling only; not required by the application runtime.
- `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`
- `NEXT_PUBLIC_CONVEX_URL` only if Convex code is restored
- `PORT` only for process managers that require a fixed port

Firebase Admin credentials are required for server-side API routes and notification sending because `src/lib/firebase-admin.ts` initializes `adminDb` and `adminMessaging` from those values.

Do not set `NODE_ENV` as a Cursor secret. `pnpm run dev` keeps normal development behavior, while `pnpm run build` and `pnpm run start` explicitly run Next.js with `NODE_ENV=production` so injected Cloud secrets cannot force production commands into development mode.

## Update and validation commands

Cursor update command:

- `pnpm install --frozen-lockfile`

Validation before PR:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:unit`
- `pnpm run build`

GitHub Actions runs the same validation on `main` and PRs through `.github/workflows/ci.yml`.

Local app smoke test:

- Start: `pnpm run dev --hostname 0.0.0.0 --port 3000`
- Check: `curl -i http://127.0.0.1:3000/login`
- Browser: use mobile viewport emulation; desktop intentionally shows "Mobile Only".

Production smoke test:

- Build: `pnpm run build`
- Start on default port: `pnpm run start`
- Start on alternate port when 3000 is busy: `PORT=3001 pnpm run start`
- Check: `curl -i http://127.0.0.1:${PORT:-3000}/login`

`PORT` is read by Next.js. If unset, Next.js uses port 3000. This repo does not require global env injection for build or start; production scripts force `NODE_ENV=production`.

## Recommended MCPs and plugins

| Tool | Use? | Why |
| --- | --- | --- |
| GitHub | Yes | PRs, branches, CI logs, issue context. |
| Context7 | Yes | Current docs for Next.js, Firebase, React, Tailwind, shadcn, and libraries. |
| Vercel | Yes | Deployment logs and env/config checks if this app deploys on Vercel. |
| Playwright | Yes | End-to-end browser checks for mobile PWA flows. |
| shadcn/ui | Yes | This repo uses shadcn-style components under `src/components/ui`. |
| Firebase | Yes | This repo uses Firebase Auth, Firestore, Storage, Admin SDK, FCM. |
| Supabase | No | This repo does not use Supabase. |
| Sentry | Optional future | No current Sentry dependency; consider for production error tracking. |
| Stripe | No | No payments integration found. |
| Prisma | No | No Prisma usage found. |
| Exa | Yes | Research fallback when official docs or MCPs are unavailable. |
| Serena / thinking-patterns | Optional if Cloud supports them | Useful for semantic code inspection and structured decisions, but not guaranteed in Cloud Agents. |

If an MCP is unavailable in Cloud, announce it and use fallback search, repository inspection, and official web docs.

## Bugbot setup

Tracked rules:

- `.cursor/BUGBOT.md` is the active Bugbot rules file.
- `docs/ai/BUGBOT_RULES.md` mirrors the same priorities for human review and copy-paste.

Enable Bugbot manually:

1. Open Cursor Dashboard > Integrations.
2. Connect GitHub or manage the existing GitHub connection.
3. In GitHub, authorize the Cursor GitHub app for `ynotfins/nfa-alerts-enterprise`.
4. Open Cursor Dashboard > Bugbot.
5. Enable Bugbot for `ynotfins/nfa-alerts-enterprise`.
6. Enable reviews on non-draft PRs; keep draft PR reviews off unless explicitly needed.
7. Keep Autofix off until Bugbot review quality is proven on this repo.
8. Merge `.cursor/BUGBOT.md` to `main`; Bugbot reads rules from the default branch.
9. Open or update a PR.
10. Verify Bugbot comments appear. To force a run, comment `cursor review` or `bugbot run` on the PR.
11. If no review appears, comment `cursor review verbose=true` and use the returned request ID for troubleshooting.

## Bitwarden secrets strategy

Best option for Cloud Agents: Bitwarden Secrets Manager with a machine account token, not the personal vault CLI. Machine tokens can be scoped to one project and revoked without exposing a personal vault.

Cursor secrets to add:

- `BWS_ACCESS_TOKEN` as a redacted secret.
- `BWS_PROJECT_ID` as a non-secret project identifier.

Bitwarden secret keys should match this repo's environment variable names, such as `NEXT_PUBLIC_FIREBASE_API_KEY` and `WEBHOOK_AUTH_TOKEN`.

Runtime options:

- Preferred for one command: `scripts/with-bitwarden-env.sh pnpm run dev --hostname 0.0.0.0 --port 3000`
- Direct build/test without secrets: use normal `pnpm run build`; production build tolerates missing Firebase Admin credentials and uses build-only public Firebase placeholders.
- Avoid `bws secret list --output env` in logs because it prints values.
- Avoid `set -x` in any shell that receives secrets.
- Prefer `bws run --project-id "$BWS_PROJECT_ID" -- <command>` so secrets are injected only into the child process.

The wrapper is ready, but real Bitwarden use still needs manual setup of the machine account, project, and the `BWS_ACCESS_TOKEN` / `BWS_PROJECT_ID` Cursor secrets.

## Starting future agents

Prompt template:

```text
Work in `ynotfins/nfa-alerts-enterprise` from base branch `main`.
Read `docs/ai/STATE.md`, `docs/ai/CLOUD_AGENTS.md`, and `docs/ai/AGENT_OPERATING_MODE.md`.
Implement the requested change on a `cursor/` branch, run install/typecheck/lint/test/build, update `docs/ai/STATE.md`, commit, push, and open a GitHub PR.
Never commit secrets or `.env*` files.
```

## Troubleshooting

- Dashboard setup appears incomplete: verify an agent can launch, dependencies install, and validation commands pass. If yes, treat it as onboarding-state drift unless future agents fail to start.
- Wrong repo selected: set dashboard default repo to this repo and add routing keywords.
- Build/start sees `NODE_ENV=development`: remove the Cursor secret. The wrappers force production mode for production commands, but the secret should still not exist.
- Firebase Admin warnings during build: acceptable when credentials are absent; runtime admin features need real secrets.
- Desktop browser shows "Mobile Only": expected. Use mobile viewport emulation.
- MCP unavailable: document the degraded tool and use fallback web/repo search.
