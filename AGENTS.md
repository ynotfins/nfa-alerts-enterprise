# Cursor Cloud specific instructions

Read `docs/ai/CLOUD_AGENTS.md` and `docs/ai/AGENT_OPERATING_MODE.md` before implementation work.

- This is a pnpm workspace monorepo. The Next.js PWA lives in `apps/web` and root package scripts forward to the `web` workspace.
- Use `pnpm install --frozen-lockfile` for dependency setup.
- Do not set or rely on `NODE_ENV` secrets; Next.js controls `NODE_ENV` for `dev`, `build`, and `start`.
- Before opening or updating a PR, run `pnpm run typecheck`, `pnpm run lint:ci`, `pnpm run test:unit`, and `pnpm run build` from the repo root.
- For UI changes, run the web app with `pnpm run dev --hostname 0.0.0.0 --port 3000` and test with a mobile viewport.
- Firebase config and rules live under `firebase/`. Do not run `firebase deploy` or modify production Firebase data without explicit approval.
- Android Studio owns the native Android Gradle project under `apps/android`. Cursor may document and review Android work, but must not create Gradle files, run Gradle, or replace Android Studio validation unless explicitly requested.
- Keep Android package `com.emergency.alerts`; Android reads Firestore `incidents` and must not call the Next.js webhook.
- Keep PRs small and focused; document high-impact tradeoffs in the PR body or `docs/ai/STATE.md`.
- For Bugbot/Qodo findings, follow `docs/ai/AUTONOMOUS_PR_FIXING.md`: fix critical/high/medium issues in follow-up commits on the same PR, treat low-severity-only findings as non-blocking, and keep CI green.
- Treat `.cursor/BUGBOT.md` as the active Bugbot repository rule file; keep `docs/ai/BUGBOT_RULES.md` aligned when rules change.
- For VPS deployment details, use `docs/ai/VPS_HOSTINGER.md` and scripts under `scripts/vps-*.sh`; update those scripts before using VPS deployment from the monorepo layout.
- Update `docs/ai/STATE.md` for meaningful code, config, or docs changes.
- Never commit `.env*` files except `.env.example`, service account JSON, Bitwarden tokens, or logs containing secret values.
- `.env.example` is the only allowed env-file exception and is valid only when every assignment is exactly `KEY=` with nothing after `=`. Flag placeholder-like values such as `your-key-here`, `example`, `changeme`, fake tokens, or real tokens.
- Real values belong only in Cursor Cloud Agents My Secrets, GitHub Actions secrets, or VPS `.env.production.local`.
