# Full-Stack Project Auditor

Use this skill when a project needs a production-grade audit across CI/CD, modular architecture, observability, cloud functions or microservices, and data-store contracts. The skill coordinates specialist subagents, compares their findings, and produces a final pass/fail/revise report with concrete corrective actions.

## Modes

- **Full-cycle mode**: run all six subagents, aggregate their findings, and produce the complete report.
- **Focused mode**: run one or more named subagents when the request targets a single dimension. Return only the relevant dimension rows and note which dimensions were not tested.
- **Improvement mode**: run the subagents against the skill itself, collect prompt-friction findings, update this skill, and record validation evidence in project docs.

## Inputs

Require or collect these inputs before running the audit:

1. **CI/CD pipeline definition**: workflow YAML, build scripts, deployment scripts, environment gates, rollback steps, and required checks.
2. **Modular architecture specification**: service boundaries, package layout, dependency rules, data-flow diagrams, ownership boundaries, and explicit non-goals.
3. **Observability metrics and logs**: trace samples, structured logs, dashboard exports, alert rules, SLO/SLA thresholds, runbooks, and recent incident logs.
4. **Cloud function or microservice definition**: runtime, trigger type, source file paths, API contract, dependencies, environment variables, retry/idempotency behavior, and deployment target.
5. **Data store schema or query set**: schema docs, Firestore rules and indexes, migrations, query definitions, typed domain models, and sample sanitized records.
6. **Audit scope metadata**: branch, commit SHA, deployment model, active app roots, and whether the audit is full-cycle or focused.

If any input is absent, mark that dimension `revise` unless repository evidence proves the same control through another artifact.

## Project profile detection

Before role-specific work, build a project profile:

1. Record the current branch and commit SHA.
2. Detect app roots (`apps/*`, `packages/*`, `functions/`, `firebase/`, `scripts/`, `.github/workflows/`).
3. Detect active clients by file evidence:
   - TypeScript/Next.js: `package.json`, `apps/web/src`, `next.config.*`.
   - Kotlin Android: `.kt`, Gradle files, or `apps/android` source.
   - Flutter/Dart: `pubspec.yaml` or `.dart` files. Skip Flutter checks when absent.
4. Detect deployment model:
   - GitHub Actions CD.
   - Firebase Functions.
   - Next.js route handlers on Vercel or VPS/PM2.
   - Manual VPS scripts.
5. Detect data-store contracts: Firestore rules, indexes, typed models, schemas, parser fixtures, and tests.

For the NFA/EMU Alerts monorepo, treat this source hierarchy as canonical:

1. Runtime source under `apps/web/src` and Firebase config under `firebase/`.
2. Current architecture docs: `docs/ai/ARCHITECTURE_CURRENT.md`, `docs/ai/SYSTEM_WIRING.md`, and `docs/android-ui-spec/`.
3. Operating docs: `AGENTS.md`, `docs/ai/CLOUD_AGENTS.md`, `docs/ai/AGENT_OPERATING_MODE.md`, and `docs/ai/VPS_HOSTINGER.md`.
4. Legacy or lower-trust docs: root `ARCHITECTURE.md`, stale path references, old recovery files, and historical state entries.

For NFA/EMU terminology, normalize known collection names before scoring:

| Legacy / requested term | Current accepted term |
| --- | --- |
| `incidents/{id}/updates` | `incidents/{id}/activities` when code, rules, and current docs agree |
| `notifications` | `appNotifications` for in-app notification documents |
| `ingestErrors/` | `webhookLogs` with `success: false` or another documented failure-audit collection |

## Operating loop

1. Build an evidence map from the supplied inputs, project profile, and repository files.
2. Spawn the requested subagents listed below, or all six in full-cycle mode, giving each agent the same evidence map and its role-specific checklist.
3. Ask each subagent to return:
   - Verdict: `pass`, `fail`, or `revise`.
   - Evidence: exact files, commands, logs, metrics, or missing artifacts.
   - Risk level: `critical`, `high`, `medium`, or `low`.
   - Corrective actions: explicit, owner-ready changes.
   - Skill-friction notes: unclear instructions, false positives, and missing branch logic.
4. Cross-check subagent findings for contradictions.
5. Aggregate findings into a final report with a verdict per dimension.
6. If a dimension is `fail` or `revise`, define the smallest next corrective step and the validation command or artifact that proves it.
7. Attempt each corrective-preparation step no more than three times. After the third failed attempt, stop and request human instructions with the failing evidence.

## Subagent roles

### Drift Critique Agent

Analyze pipeline, code, dependencies, runtime versions, and release procedures for drift risk, maintainability, and rollback complexity.

Checklist:

- Detect stale package/runtime versions, deprecated APIs, unpinned tooling, and unmanaged generated artifacts.
- Compare CI commands with local development commands and deployment scripts. For this monorepo, compare `.github/workflows/*.yml`, root `package.json`, app package scripts, and `scripts/vps-*.sh`.
- Identify manual-only release steps, undocumented environment requirements, and stateful rollout assumptions.
- Evaluate rollback complexity: data migrations, irreversible writes, missing backups, feature flags, and partial deploy behavior.
- Flag drift between documentation, tests, infrastructure, and actual source paths, including stale risk registers and handoff docs.

EMU Alerts / NFA enhancements:

- Validate Firebase Cloud Function runtime versions and reject deprecated CommonJS-only or v1-only function patterns when functions are present.
- If no `functions/` workspace exists, mark Cloud Functions runtime as `pass (N/A)` with evidence and audit the active Next.js route handler instead.
- Assess Firestore incident structure and explicitly verify whether `incidents/{id}/updates` is implemented, documented, indexed, or intentionally replaced by `incidents/{id}/activities`. If code, rules, and current docs consistently use `activities`, score the rename as `pass`.
- Confirm Android MacroDroid trigger documentation aligns with current Android notification permission behavior and app foreground/background restrictions. If no MacroDroid artifacts exist, mark `revise` with the expected artifact path instead of inferring behavior from BNN parser tests.

### Modularity Validator Agent

Assess architectural separation of concerns, code modularity, and adherence to scalable project patterns.

Checklist:

- Map modules to architecture boundaries and flag circular dependencies or mixed responsibilities.
- Verify parsing, validation, persistence, notification, and transport code are separated.
- Identify oversized files, duplicate utilities, hidden side effects, and ambiguous ownership boundaries.
- Confirm shared types and schemas are defined at system boundaries.
- Trace parser output through persistence shape, Firestore rules, shared types, and UI/native consumers.
- Detect duplicate constants and business logic across client SDK services, Admin SDK route handlers, and cleanup scripts.
- Treat route handlers over 150 lines that mix transport, parsing, and persistence as `revise` unless strong local conventions justify it.
- Prefer concrete refactor actions over broad rewrite recommendations.

EMU Alerts / NFA enhancements:

- Review `functions/index.js` if present; otherwise review the active ingestion entrypoint such as `apps/web/src/app/api/webhook/route.ts`.
- Ensure reusable utilities, including JSON parsing, text sanitization, promo-code filtering, geocoding, and notification parsing, are isolated from request orchestration.
- Confirm ingestion logic is separated from Firestore update logic and notification delivery.
- For NFA, prefer pure modules like `lib/webhook/{parser,geocoder,sanitize,promo-codes,incident-writer,schemas,errors}.ts`; keep route handlers focused on auth, transport, orchestration, and response mapping.
- Flag unused or duplicate domain schemas, especially multiple `Incident` or `IncidentActivity` definitions with different Firestore shapes.

### Observability Judge Agent

Judge whether tracing, logging, metrics, alerts, and operational evidence satisfy governance thresholds.

Checklist:

- Verify structured logs include correlation IDs, trigger source, request identity where safe, execution phase, latency, outcome, and sanitized error details.
- Check distributed tracing or trace-compatible correlation across ingress, service work, data writes, and notification sends. For VPS/PM2 or Vercel apps without Cloud Functions, use host/runtime logs instead of `firebase functions:log`.
- Evaluate metrics for success rate, latency, retries, dead-letter counts, write failures, parse failures, and delivery failures.
- Confirm alerts are actionable and tied to runbooks, severity, thresholds, and ownership.
- Ensure logs do not expose secrets, tokens, private keys, full webhook bodies, or sensitive customer data.
- Cross-check observability claims in docs against actual write sites and logging code.

EMU Alerts / NFA enhancements:

- Ensure Firestore write failures record detailed sanitized error payloads in `ingestErrors/` or an explicitly documented replacement collection.
- Accept `webhookLogs` as the replacement only when failure paths actually write `success: false` or equivalent error fields and current architecture docs document it.
- Validate FCM topic delivery for topic `incidents` only if topic delivery exists or is documented as planned; otherwise audit the active per-token FCM path and incident-notification wiring.
- Verify timestamped Firebase logs from `firebase functions:log` only for deployed Cloud Functions. For Next.js route handlers, verify Vercel runtime logs or VPS `pm2 logs` match operational phases for ingestion, parsing, Firestore writes, and notification delivery.
- Minimum pass bar: durable failure audit, correlation ID, one ingestion runbook, and one actionable alert or documented monitoring threshold.

### Governance Enforcer Agent

Validate compliance with anti-drift policies, type safety, operational simplicity, and repo-specific guardrails.

Checklist:

- Confirm the project has no undocumented manual steps for build, test, deploy, backup, or rollback.
- Check secret-handling rules, env-file restrictions, least-privilege access, and production-data safety.
- Enforce type safety at system boundaries and reject untyped payload propagation.
- Verify documentation states which automation owns each operational action.
- Flag complexity that adds operational burden without measurable risk reduction.
- Cross-check critical/high risk register entries; an open critical secret or production safety item caps governance at `revise`.
- Verify `.env.example` contains every documented required key as an empty `KEY=` assignment, and no placeholder or real values.
- Confirm schema-change governance exists in a PR template, agent policy, Bugbot rule, or equivalent checklist.

EMU Alerts / NFA enhancements:

- Validate anti-drift policies for MacroDroid: trigger definitions must be backed up, scripted, or exported with restore instructions.
- Enforce strong typing for every incident and update/activity object in active clients only. Detect TypeScript, Kotlin, and Flutter/Dart from actual files before scoring.
- Require schema updates to include data model, rules, index, parser, and UI/client type updates in one reviewed change.
- Accept documented alternatives to `updates` and `ingestErrors` only when rules, types, code, tests, and docs all use the replacement consistently.

### CI/CD Validator Agent

Evaluate pipeline stages, automated tests, rollback readiness, and failure recovery procedures.

Checklist:

- Confirm CI installs dependencies from lockfiles, typechecks, lints, runs unit/integration tests, and builds deployable artifacts.
- Verify required checks match branch protection and PR readiness rules.
- Validate deployment gates, environment promotion, secrets injection, smoke tests, and rollback commands.
- Ensure tests exercise changed code paths and include negative/error cases where risk warrants them.
- Check that failed deployments leave the system in a known recoverable state.
- Separate validation into build gates, infrastructure gates, and runtime gates.
- Inspect test setup files and mocks before crediting route-handler or webhook tests as end-to-end.
- Score rollback separately for git rollback, process rollback, and data rollback.

EMU Alerts / NFA enhancements:

- Confirm end-to-end ingestion tests, including PowerShell or cURL webhook tests when used operationally, are committed or represented in CI.
- Ensure rollback capability for incident writes: use transactions or batched writes where multi-document writes must be atomic, and document compensating recovery when Firestore cannot roll back external side effects.
- Verify Firestore rules and indexes are validated before deployment.
- For `firebase/firebase.json`, all emulator and rules validation commands must include `--config firebase/firebase.json` from the repo root.
- For VPS/PM2 deployment, check env preflight, CI parity, PM2 config versioning or generation, post-deploy smoke tests, and a rollback script or runbook.
- For webhook ingestion, require negative coverage for missing auth, invalid token, short message, parse failure, geocode failure, and partial write failure where practical.

### Cross-Referencer Agent

Cross-check code, infrastructure, data definitions, and architecture goals for consistency.

Checklist:

- Compare architecture docs against actual package layout, routes, functions, database collections, and deployment files.
- Cross-check schemas, DTOs, API contracts, tests, Firestore rules, indexes, and client models.
- Identify duplicated terminology, stale path references, and inconsistent naming between docs and code.
- Confirm observability fields match dashboards and alert queries.
- Verify rollback and recovery docs match actual scripts.
- Distinguish mocked tests from true integration or runtime tests before crediting coverage.
- Check skill discoverability from `AGENTS.md`, project docs index, and local/global skill directories.

EMU Alerts / NFA enhancements:

- Cross-check Firestore incident and update/activity schemas against web TypeScript types and any native Android, Flutter, or Dart types.
- Validate MacroDroid triggers against the current BNN notification format accepted by the parser and tests.
- Confirm Firestore indexes cover documented incident/update query patterns.
- Require at least one golden BNN fixture matching the parser format specification when BNN is a critical input source.
- Flag duplicate domain models, orphaned Zod schemas, and mismatches between parser activity enums and stored activity types.
- If native Android has docs but no Kotlin sources, mark native type validation `revise`; do not mark it `fail` unless docs claim implemented types.

## Aggregated report format

Return one report in this shape:

```markdown
# Full-Stack Project Audit Report

## Executive verdict

Overall: pass|fail|revise
Reason: <one paragraph>

## Input coverage

| Input | Status | Evidence | Missing items |
| --- | --- | --- | --- |

## Dimension verdicts

| Dimension | Verdict | Risk | Evidence | Corrective actions |
| --- | --- | --- | --- | --- |
| Drift | pass|fail|revise | critical|high|medium|low | <files/logs/commands> | <actions> |
| Modularity | pass|fail|revise | critical|high|medium|low | <files/logs/commands> | <actions> |
| Observability | pass|fail|revise | critical|high|medium|low | <files/logs/commands> | <actions> |
| Governance | pass|fail|revise | critical|high|medium|low | <files/logs/commands> | <actions> |
| CI/CD | pass|fail|revise | critical|high|medium|low | <files/logs/commands> | <actions> |
| Cross-reference | pass|fail|revise | critical|high|medium|low | <files/logs/commands> | <actions> |

## Corrective action plan

1. <pipeline action and validation>
2. <architecture action and validation>
3. <observability action and validation>
4. <governance action and validation>

## Skill-friction findings

| Role | Finding | Skill update needed |
| --- | --- | --- |

## Stop conditions and unresolved questions

- <blocker, failed attempt count, or human-owned decision>
```

## Quality bar

- Every `pass` verdict must cite evidence.
- Every `fail` verdict must include a concrete production risk.
- Every `revise` verdict must include the missing artifact or ambiguity that prevents a pass.
- Corrective actions must be specific enough for an implementation agent to execute without reinterpreting the audit.
- Prefer small, verifiable improvements over broad rewrites.
- Focused-mode reports must clearly state that unrun dimensions are untested, not passed.
- Branching assumptions must be explicit: Cloud Functions vs Next.js route handler, topic FCM vs per-token FCM, MacroDroid present vs absent, native client present vs docs-only.
- Never recommend production writes, deploys, or secret exposure without explicit human approval.
