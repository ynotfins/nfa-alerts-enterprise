# Full-Stack Project Auditor

Use this skill when a project needs a production-grade audit across CI/CD, modular architecture, observability, cloud functions or microservices, and data-store contracts. The skill coordinates specialist subagents, compares their findings, and produces a final pass/fail/revise report with concrete corrective actions.

## Inputs

Require or collect these inputs before running the audit:

1. **CI/CD pipeline definition**: workflow YAML, build scripts, deployment scripts, environment gates, rollback steps, and required checks.
2. **Modular architecture specification**: service boundaries, package layout, dependency rules, data-flow diagrams, ownership boundaries, and explicit non-goals.
3. **Observability metrics and logs**: trace samples, structured logs, dashboard exports, alert rules, SLO/SLA thresholds, runbooks, and recent incident logs.
4. **Cloud function or microservice definition**: runtime, trigger type, source file paths, API contract, dependencies, environment variables, retry/idempotency behavior, and deployment target.
5. **Data store schema or query set**: schema docs, Firestore rules and indexes, migrations, query definitions, typed domain models, and sample sanitized records.

If any input is absent, mark that dimension `revise` unless repository evidence proves the same control through another artifact.

## Operating loop

1. Build an evidence map from the supplied inputs and repository files.
2. Spawn the six subagents listed below, giving each agent the same evidence map and its role-specific checklist.
3. Ask each subagent to return:
   - Verdict: `pass`, `fail`, or `revise`.
   - Evidence: exact files, commands, logs, metrics, or missing artifacts.
   - Risk level: `critical`, `high`, `medium`, or `low`.
   - Corrective actions: explicit, owner-ready changes.
4. Cross-check subagent findings for contradictions.
5. Aggregate findings into a final report with a verdict per dimension.
6. If a dimension is `fail` or `revise`, define the smallest next corrective step and the validation command or artifact that proves it.
7. Attempt each corrective-preparation step no more than three times. After the third failed attempt, stop and request human instructions with the failing evidence.

## Subagent roles

### Drift Critique Agent

Analyze pipeline, code, dependencies, runtime versions, and release procedures for drift risk, maintainability, and rollback complexity.

Checklist:

- Detect stale package/runtime versions, deprecated APIs, unpinned tooling, and unmanaged generated artifacts.
- Compare CI commands with local development commands and deployment scripts.
- Identify manual-only release steps, undocumented environment requirements, and stateful rollout assumptions.
- Evaluate rollback complexity: data migrations, irreversible writes, missing backups, feature flags, and partial deploy behavior.
- Flag drift between documentation, tests, infrastructure, and actual source paths.

EMU Alerts / NFA enhancements:

- Validate Firebase Cloud Function runtime versions and reject deprecated CommonJS-only or v1-only function patterns when functions are present.
- Assess Firestore incident structure and explicitly verify whether `incidents/{id}/updates` is implemented, documented, indexed, or intentionally replaced by `incidents/{id}/activities`.
- Confirm Android MacroDroid trigger documentation aligns with current Android notification permission behavior and app foreground/background restrictions.

### Modularity Validator Agent

Assess architectural separation of concerns, code modularity, and adherence to scalable project patterns.

Checklist:

- Map modules to architecture boundaries and flag circular dependencies or mixed responsibilities.
- Verify parsing, validation, persistence, notification, and transport code are separated.
- Identify oversized files, duplicate utilities, hidden side effects, and ambiguous ownership boundaries.
- Confirm shared types and schemas are defined at system boundaries.
- Prefer concrete refactor actions over broad rewrite recommendations.

EMU Alerts / NFA enhancements:

- Review `functions/index.js` if present; otherwise review the active ingestion entrypoint such as `apps/web/src/app/api/webhook/route.ts`.
- Ensure reusable utilities, including JSON parsing, text sanitization, promo-code filtering, geocoding, and notification parsing, are isolated from request orchestration.
- Confirm ingestion logic is separated from Firestore update logic and notification delivery.

### Observability Judge Agent

Judge whether tracing, logging, metrics, alerts, and operational evidence satisfy governance thresholds.

Checklist:

- Verify structured logs include correlation IDs, trigger source, request identity where safe, execution phase, latency, outcome, and sanitized error details.
- Check distributed tracing or trace-compatible correlation across ingress, service work, data writes, and notification sends.
- Evaluate metrics for success rate, latency, retries, dead-letter counts, write failures, parse failures, and delivery failures.
- Confirm alerts are actionable and tied to runbooks, severity, thresholds, and ownership.
- Ensure logs do not expose secrets, tokens, private keys, or sensitive customer data.

EMU Alerts / NFA enhancements:

- Ensure Firestore write failures record detailed sanitized error payloads in `ingestErrors/` or an explicitly documented replacement collection.
- Validate that future FCM topic delivery for topic `incidents` includes delivery-attempt and confirmation tracking.
- Verify timestamped Firebase logs from `firebase functions:log` match expected operational phases for ingestion, parsing, Firestore writes, and notification delivery.

### Governance Enforcer Agent

Validate compliance with anti-drift policies, type safety, operational simplicity, and repo-specific guardrails.

Checklist:

- Confirm the project has no undocumented manual steps for build, test, deploy, backup, or rollback.
- Check secret-handling rules, env-file restrictions, least-privilege access, and production-data safety.
- Enforce type safety at system boundaries and reject untyped payload propagation.
- Verify documentation states which automation owns each operational action.
- Flag complexity that adds operational burden without measurable risk reduction.

EMU Alerts / NFA enhancements:

- Validate anti-drift policies for MacroDroid: trigger definitions must be backed up, scripted, or exported with restore instructions.
- Enforce strong typing for every incident and update object in TypeScript, Kotlin, or Flutter/Dart clients, depending on the current app target.
- Require schema updates to include data model, rules, index, parser, and UI/client type updates in one reviewed change.

### CI/CD Validator Agent

Evaluate pipeline stages, automated tests, rollback readiness, and failure recovery procedures.

Checklist:

- Confirm CI installs dependencies from lockfiles, typechecks, lints, runs unit/integration tests, and builds deployable artifacts.
- Verify required checks match branch protection and PR readiness rules.
- Validate deployment gates, environment promotion, secrets injection, smoke tests, and rollback commands.
- Ensure tests exercise changed code paths and include negative/error cases where risk warrants them.
- Check that failed deployments leave the system in a known recoverable state.

EMU Alerts / NFA enhancements:

- Confirm end-to-end ingestion tests, including PowerShell or cURL webhook tests when used operationally, are committed or represented in CI.
- Ensure rollback capability for incident writes: use transactions or batched writes where multi-document writes must be atomic, and document compensating recovery when Firestore cannot roll back external side effects.
- Verify Firestore rules and indexes are validated before deployment.

### Cross-Referencer Agent

Cross-check code, infrastructure, data definitions, and architecture goals for consistency.

Checklist:

- Compare architecture docs against actual package layout, routes, functions, database collections, and deployment files.
- Cross-check schemas, DTOs, API contracts, tests, Firestore rules, indexes, and client models.
- Identify duplicated terminology, stale path references, and inconsistent naming between docs and code.
- Confirm observability fields match dashboards and alert queries.
- Verify rollback and recovery docs match actual scripts.

EMU Alerts / NFA enhancements:

- Cross-check Firestore incident and update/activity schemas against web TypeScript types and any native Android, Flutter, or Dart types.
- Validate MacroDroid triggers against the current BNN notification format accepted by the parser and tests.
- Confirm Firestore indexes cover documented incident/update query patterns.

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

## Stop conditions and unresolved questions

- <blocker, failed attempt count, or human-owned decision>
```

## Quality bar

- Every `pass` verdict must cite evidence.
- Every `fail` verdict must include a concrete production risk.
- Every `revise` verdict must include the missing artifact or ambiguity that prevents a pass.
- Corrective actions must be specific enough for an implementation agent to execute without reinterpreting the audit.
- Prefer small, verifiable improvements over broad rewrites.
- Never recommend production writes, deploys, or secret exposure without explicit human approval.
