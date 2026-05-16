# NFA Alerts — New Chat Handoff

## Current repo

- Repo: `ynotfins/nfa-alerts-enterprise`
- Default branch: `main`
- Package manager: `pnpm 10.33.0`
- Runtime: Node 22
- Framework: Next.js
- App purpose: enterprise NFA alerts / incident coordination platform
- Current environment: Cursor Cloud Agents + GitHub PR automation

## Completed / merged work

- Cloud Agent environment setup completed.
- Production wrappers avoid inheriting invalid Cloud Agent runtime mode values during build/start.
- `.env` is ignored and untracked.
- `.env.example` is placeholder-only and should use empty assignments only.
- Stable CI check names exist:
  - `CI Validate`
  - `CI PR Readiness`
- GitHub PR automation is working.
- Bugbot/Qodo review flow is working.
- Firebase Admin / VPS env validation was restored.
- Non-runtime secrets were removed from required VPS validation.
- Review rules were adjusted so `.env.example` is allowed only when empty-placeholder-only.

## GitHub settings

- Branch ruleset: `main-protection`
- Target branch: `main`
- Required checks:
  - `CI Validate`
  - `CI PR Readiness`
- Require PR before merging: enabled
- Required approvals: 0
- Require conversation resolution: enabled
- Require status checks: enabled
- Require branches up to date: enabled
- Block force pushes: enabled
- Restrict deletions: enabled
- Classic branch protection: not used
- Auto-merge: allowed
- Preferred merge method: squash

## Cursor Cloud Agents settings

- Default repo: `ynotfins/nfa-alerts-enterprise`
- Base branch: `main`
- Branch prefix: `cursor/`
- Create PRs: Always
- PR review destination: GitHub
- Slack notifications: optional
- Repository routing keywords: `nfa`, `nfa-alerts`, `nfa-alerts-enterprise`, `enterprise`, `nfa alerts`, `incidents`, `chasers`, `firebase`
- Network access: allow all network access for now
- My Secrets are repo-scoped where possible

## Secrets strategy

- Real secrets must never be committed.
- `.env`, `.env.local`, `.env.production.local`, and `.env.*` are ignored.
- `.env.example` may be committed only with empty values like `KEY=`.
- Cursor Cloud Agents My Secrets currently contain repo runtime values.
- GitHub Actions secrets should be used for deployment credentials later.
- VPS runtime secrets belong in `.env.production.local` on the VPS.
- Bitwarden Secrets Manager is optional; it is not required for the next UI documentation task.
- Do not rely on OpenMemory/Mem0 for secrets.

## Known current secrets by name only

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_PRIVATE_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `WEBHOOK_AUTH_TOKEN`
- `SITE_URL`
- `NEXT_PUBLIC_GOOGLE_MAP_ID`
- `CONTEXT7_SECRET_KEY`
- `BWS_ACCESS_TOKEN`
- `BWS_PROJECT_ID`
- `PORT`

## Abandoned work

- PR #5 / Cloud Agent MCP setup was confused and should be ignored/closed.
- Do not use PR #5 docs as source of truth unless later manually reviewed and recreated cleanly.

## MCP / tooling guidance

- Local Cursor Desktop MCPs do not automatically carry over to Cloud Agents.
- Cloud Agents can proceed without MCP blockers using repo inspection, uploaded screenshots, and built-in browser/computer-use.
- Context7 is useful if available.
- Figma is only useful if real Figma files exist.
- OpenMemory/Mem0 is optional and only for high-level non-secret facts.
- Do not block UI documentation on MCP setup.

## Immediate next task

The next Cloud Agent task should be:

Public repo safety audit + Supe screenshot-to-source UI documentation.

Inputs required:

- Attach the screenshot ZIP directly to the Cloud Agent task, or place screenshots under a repo-local `screenshots/` directory.
- Start from latest `main`.

Expected outputs:

- `docs/public/PUBLIC_RELEASE_AUDIT.md`
- `docs/APP_SOURCE_OF_TRUTH.md`
- `docs/ui/SUPE_SCREENSHOT_INVENTORY.md`
- `docs/ui/pages/*.md`
- `docs/ui/SUPE_NATIVE_ANDROID_REBUILD_INDEX.md`
