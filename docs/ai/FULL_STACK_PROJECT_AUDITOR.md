# Full-Stack Project Auditor

`Full-Stack Project Auditor` is the repo-local skill at `.claude/skills/full-stack-project-auditor.md`. It is also installed globally for this Cloud user at `/home/ubuntu/.claude/skills/full-stack-project-auditor.md`.

## When to use it

Use this skill for production-readiness reviews across CI/CD, modular architecture, observability, governance, cloud functions or microservices, and data-store contracts.

Use focused mode when only one dimension is requested. Use full-cycle mode when the request asks for a production audit, release readiness review, or multi-agent critique.

## Required inputs

- CI/CD pipeline definition.
- Modular architecture specification.
- Observability metrics, logs, alerts, and runbooks.
- Cloud function, route handler, or microservice definition.
- Data-store schema, Firestore rules/indexes, typed models, and query set.
- Audit scope metadata: branch, commit SHA, deployment model, active app roots, and full-cycle vs focused mode.

## Agent self-test results

The skill was tested by launching all six auditor roles against this monorepo:

| Role | Test verdict | Main skill improvement applied |
| --- | --- | --- |
| Drift Critique Agent | `revise` / medium | Added monorepo source hierarchy, no-`functions/` fallback, `updates` to `activities` decision rules, MacroDroid conditional handling, and doc freshness checks. |
| Modularity Validator Agent | `revise` / medium | Added route-handler size guidance, Admin/client duplication checks, expected webhook module map, shared type tracing, and duplicate schema detection. |
| Observability Judge Agent | `revise` / high | Added Next.js/VPS log branch, `webhookLogs` failure-audit acceptance rules, PII log checks, per-token FCM handling, and a minimum pass bar. |
| Governance Enforcer Agent | `revise` / high | Added active-client detection, `.env.example` key validation, critical-risk cap, schema-change governance checks, and Flutter/MacroDroid false-positive controls. |
| CI/CD Validator Agent | `revise` / medium-high | Added build/infra/runtime validation tiers, mocked-test detection, Firebase config path rule, VPS deployment model checks, rollback taxonomy, and negative ingestion-test guidance. |
| Cross-Referencer Agent | `revise` / medium | Added source-of-truth hierarchy, collection-name map, BNN golden-fixture requirement, native docs-only handling, and skill discoverability checks. |

The `revise` outcomes were expected: they tested the skill against real repo gaps and produced prompt-friction feedback, not product-code changes.

## Global installation

The global copy is not tracked by git. After changing the repo-local skill, refresh it with:

```bash
mkdir -p /home/ubuntu/.claude/skills
cp /workspace/.claude/skills/full-stack-project-auditor.md /home/ubuntu/.claude/skills/full-stack-project-auditor.md
```

In a different machine or project, copy the same file into that user's global skills directory and keep the repo-local copy as the source of truth for review.

## Validation

For documentation-only skill changes, run:

- `pnpm run typecheck`
- `pnpm run lint:ci`
- `pnpm run test:unit`
- `pnpm run build`

Also run at least one focused auditor role when the skill logic itself changes.
