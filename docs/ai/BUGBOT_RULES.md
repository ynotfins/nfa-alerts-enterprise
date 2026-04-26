# Bugbot Rules

Copy of the active repository rule file: `.cursor/BUGBOT.md`.

Bugbot must focus on production defects, not style noise:

- Flag runtime errors, unhandled promise failures, unsafe null/undefined access, hydration problems, and Next.js App Router boundary violations.
- Flag API route failures, bad status codes, missing auth checks, missing input validation, and webhook parsing failures.
- Flag Firebase issues: client/admin SDK mixups, missing credential guards, unsafe Firestore writes, broken listeners, FCM token mistakes, and security-sensitive rule bypasses.
- Flag secret leaks: `.env*`, service account JSON, private keys, webhook tokens, API keys, screenshots, or logs containing credentials.
- Flag deployment risks: build/start scripts that rely on global env injection, production commands running with `NODE_ENV=development`, missing required runtime env, and broken `PORT` handling.
- Flag PWA/mobile breakage that prevents `/login`, signup, incident detail, notifications, or route planning from rendering on mobile viewport.
- Ignore formatting-only changes, minor lint nits, import ordering, naming preferences, and harmless refactors unless they create a concrete bug.
- Prefer concise findings with file path, line, impact, and a fix recommendation.

Manual activation notes:

1. Merge `.cursor/BUGBOT.md` to `main`; Bugbot reads rules from the default branch.
2. Enable Bugbot for `ynotfins/nfa-alerts-enterprise` in Cursor's Bugbot dashboard.
3. Open or update a PR.
4. Verify Bugbot comments appear, or manually comment `cursor review`.
