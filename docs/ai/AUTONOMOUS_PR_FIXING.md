# Autonomous PR Fixing

Goal: PRs should converge to mergeable state with minimal human input.

## Follow-up fix loop

When Bugbot, Qodo, CI, or a human review reports an issue on an open PR:

1. Triage severity first.
2. For critical, high, medium, runtime, security, data-integrity, CI, build, API, Firebase, deployment, or Next.js boundary issues, create a follow-up commit on the same PR branch.
3. Run the relevant focused test, then the standard validation suite:
   - `pnpm install --frozen-lockfile`
   - `pnpm run typecheck`
   - `pnpm run lint:ci`
   - `pnpm run test:unit`
   - `pnpm run build`
4. Update `docs/ai/STATE.md` with evidence.
5. Push the same branch and update the PR body.

## Merge readiness policy

- If CI passes and no critical/high/medium issues remain, mark the PR ready for merge.
- Low-severity issues do not block merge when they are cosmetic, stylistic, non-runtime documentation nits, or minor maintainability notes.
- Low-severity issues may still be fixed opportunistically when the fix is small and low risk.
- Never merge or mark ready when secrets are exposed, tests are failing, production build is failing, or runtime behavior is unvalidated.

## PR comment policy

Automation should leave one concise PR comment after CI:

- `Safe to merge` when CI passes and no blocking issue is known.
- `Needs fixes` when CI fails or a blocking issue exists.
- Include validation status, known blockers, and whether remaining issues are low severity.

## Safety rules

- Never commit `.env*`, service account JSON, tokens, or logs containing secrets.
- Never print secret values.
- Do not make breaking changes without tests and documented tradeoffs.
- Prefer small follow-up commits over broad rewrites.
- Keep fixes on the same PR branch unless the user asks for a new branch.

## External automation limits

Repo code can add CI, rules, and comments. Actual AI-generated follow-up commits from Bugbot/Qodo require those services to be enabled with write/autofix permissions in their dashboards.
