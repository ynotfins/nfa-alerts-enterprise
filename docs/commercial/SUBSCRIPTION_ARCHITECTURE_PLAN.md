# Subscription Architecture Plan

Subscription logic is intentionally out of scope for the monorepo migration.

## Status

- No subscription logic was added during migration.
- No billing provider was selected during migration.
- No entitlement checks were added during migration.

## Future Planning Principles

- Keep emergency-response realtime behavior independent from billing-provider availability.
- Centralize account, tenant, entitlement, and audit contracts before implementing paid plans.
- Treat billing webhooks as backend-only routes with explicit verification and replay protection.
- Do not couple Android or iOS clients directly to billing webhooks.

A dedicated subscription architecture task should define tenant model, billing source of truth, entitlement cache, failure modes, audit logging, and production rollout controls before implementation.
