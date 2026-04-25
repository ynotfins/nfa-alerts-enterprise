# Cursor Cloud specific instructions

Read `docs/ai/CLOUD_AGENTS.md` and `docs/ai/AGENT_OPERATING_MODE.md` before implementation work.

- Use `pnpm install --frozen-lockfile` for dependency setup.
- Do not set or rely on `NODE_ENV` secrets; Next.js controls `NODE_ENV` for `dev`, `build`, and `start`.
- Before opening or updating a PR, run `pnpm run typecheck`, `pnpm run lint:ci`, `pnpm run test:unit`, and `pnpm run build`.
- For UI changes, run the app with `pnpm run dev --hostname 0.0.0.0 --port 3000` and test with a mobile viewport.
- Update `docs/ai/STATE.md` for meaningful code, config, or docs changes.
- Never commit `.env*`, service account JSON, Bitwarden tokens, or logs containing secret values.
