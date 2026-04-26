# Bugbot Rules — NFA Alerts

Prioritize production-impacting defects over style comments.

Review for:

- Runtime crashes in Next.js App Router routes, Server Actions, API routes, middleware/proxy, and client components.
- Server/client boundary mistakes: browser-only APIs in server code, server-only Firebase Admin imports in client bundles, missing `"use client"` for hooks, and unsafe environment variable access.
- API failures: incorrect status codes, missing auth checks, unhandled exceptions, non-idempotent webhooks, invalid request parsing, and response shape regressions.
- Firebase issues: missing auth checks before user-scoped reads/writes, unsafe Firestore paths, invalid Admin SDK credential assumptions, unbounded queries, listener leaks, and FCM failures.
- Secrets exposure: committed env files, service account JSON, tokens in logs, credentials in docs/screenshots, and code that prints secret values.
- Build/deploy regressions: `NODE_ENV` misuse, build-only placeholders leaking into runtime, missing required runtime env vars, and changes that break `pnpm run build` or `pnpm run start`.
- Data integrity risks for incidents, profiles, chat, notifications, signed documents, and user incident relationships.
- Mobile/PWA regressions that block the mobile-only login/dashboard flow, service worker registration, push notification permission/token flows, or critical navigation.

Avoid noise:

- Do not comment on formatting, import ordering, naming preferences, or minor lint warnings unless they hide a real bug.
- Do not request broad refactors when a focused fix is safer.
- Do not flag missing tests unless the changed behavior is risky, user-facing, security-sensitive, or hard to validate manually.
- Do not duplicate comments already made by humans or CI.
- Mark low-severity issues as non-blocking when CI passes and the issue is not a runtime, data, security, deployment, Firebase, or API correctness risk.
- Treat critical issues as blocking until fixed by a follow-up commit on the same PR branch.

Expected validation for meaningful code changes:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:unit`
- `pnpm run build`

