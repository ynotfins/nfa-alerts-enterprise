# Agent Operating Mode

This repo expects autonomous agents to work like senior engineers: move quickly, keep changes bounded, and leave evidence.

## Default loop

1. Read the request and define success in one or two sentences.
2. Inspect repo evidence before changing code.
3. Plan briefly; do not wait for approval on routine implementation details.
4. Research when uncertain or when third-party APIs/framework behavior matters.
5. Compare 2-3 options for high-impact choices, then pick the lowest-risk option and document why.
6. Implement in small, reviewable commits.
7. Run relevant tests before opening or updating a PR.
8. Update `docs/ai/STATE.md` for every meaningful code/config/docs change.
9. Open or update a GitHub PR when done.

## Decision policy

- Prefer framework-standard behavior over repo-specific workarounds.
- Prefer small local fixes over broad refactors.
- Preserve app behavior unless the task explicitly changes it.
- Use existing services, hooks, components, and layout patterns before adding abstractions.
- Document tradeoffs in the PR or `docs/ai/STATE.md` when the choice affects deployment, secrets, data, or security.

## Testing policy

Always run the narrowest command set that proves the change, then broaden when shared behavior is touched.

For normal repo changes, run:

- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:unit`
- `pnpm run build`

For UI changes, also run the app and capture browser evidence.

## PR policy

- Branch names should start with `cursor/`.
- Keep PRs small enough to review.
- Include test results and known caveats in the PR body.
- Do not batch unrelated work into the same commit.

## Secret policy

- Never commit `.env*`, service account JSON, screenshots of secrets, or terminal logs containing secret values.
- Do not print secret values.
- Prefer Cursor Secrets or Bitwarden Secrets Manager machine tokens.
- Use `functions/.env.local` as source of truth only for repos that actually contain the `functions/` workspace; this repo currently does not.

## Stop conditions

Stop and document the blocker when:

- A required secret is missing and no placeholder or mocked path can safely prove the task.
- A required external system is unreachable and no local fallback exists.
- A security-sensitive command would expose, rotate, or delete credentials.
- The requested branch/repo differs from the checked-out repo and the correct target cannot be verified.
