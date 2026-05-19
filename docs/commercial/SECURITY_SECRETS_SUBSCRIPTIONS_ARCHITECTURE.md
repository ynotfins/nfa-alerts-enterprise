# Security, Secrets, and Subscription Architecture

Last updated: 2026-05-18

This plan defines the commercial security, secrets, tenant, billing, and entitlement architecture for NFA Alerts. It is documentation-only and does not authorize Firebase deploys, production data mutation, Android UI/business logic changes, real secret insertion, `google-services.json` commits, commits, or pushes.

This document expands the placeholder planning principles in `docs/commercial/SUBSCRIPTION_ARCHITECTURE_PLAN.md`. If both documents disagree later, this document is the more specific commercial architecture plan.

## Repo Evidence Used

- Production Firebase project is currently documented as `nfa-alerts-v2`.
- The web/PWA lives in `apps/web` and owns Next.js API routes.
- Firebase CLI config, Firestore rules, indexes, and storage rules live in `firebase/`.
- Server-side Firebase Admin initialization currently loads credentials only from environment-provided values.
- Existing roles are `chaser`, `supe`, and `admin` on `profiles/{uid}.role`.
- Existing Firestore rules are single-tenant and profile-role based; they do not yet model tenant memberships or billing entitlements.
- Android package is `com.emergency.alerts`; Android consumes normalized Firestore docs and must not parse raw alerts or call `POST /api/webhook`.
- No Stripe, Google Play Billing, commercial tenant, subscription, or entitlement implementation was found in active source.

## Recommended Architecture

NFA Alerts should use a trusted-backend entitlement architecture:

1. Clients authenticate with Firebase Auth.
2. Web/PWA users start Stripe Checkout or open Stripe Customer Portal through Next.js backend routes.
3. Android users purchase through Google Play Billing on-device, then send purchase tokens to a backend verification route.
4. Stripe webhooks and Google Play verification/notification events are processed by backend-only code using server secrets from Google Cloud Secret Manager.
5. Backend writes normalized subscription and entitlement state into Firestore.
6. Web and Android clients read Firestore entitlements and tenant memberships; they never trust billing client state as the source of truth.
7. Firestore rules enforce tenant membership, role, and entitlement gates for protected data.

Firestore remains the realtime operational database. Billing provider availability must not block emergency incident rendering for already-authorized users; entitlement outages should fail closed for admin/billing actions and fail with a documented grace policy for time-critical responder workflows.

## Secret Manager Strategy

Google Cloud Secret Manager should be the source of truth for backend secrets in Google-hosted environments. Runtime code should consume secrets through platform-supported injection or Application Default Credentials wherever possible; local development should use empty `.env.example` placeholders and operator-managed local secrets outside git.

Principles:

- Store one logical secret per Secret Manager secret name, using environment-specific projects or prefixes.
- Grant `Secret Manager Secret Accessor` only to the runtime service account that needs a secret.
- Prefer Application Default Credentials and workload identity over checked-in service account key files.
- Rotate secret versions without renaming environment variables.
- Disable or destroy old secret versions only after the new version is deployed and verified.
- Audit access logs and alert on unexpected secret access.
- Never print secret values in logs, docs, tests, terminal output, screenshots, or bug reports.
- Do not commit `.env*` except `.env.example` with empty assignments only.
- Do not commit Firebase service account JSON, Google Play service account JSON, Stripe keys, webhook secrets, Android signing keys, or `google-services.json`.

Recommended naming:

- Secret Manager secret names should match runtime environment variable names where possible.
- Production and staging should be separated by Google Cloud project, deployment environment, or explicit prefix such as `PROD_` and `STAGING_`.
- Public client configuration values may remain normal environment configuration, but no values belong in repo docs.

## Android Client Secret Boundary

Android must not hold backend secrets. The Android app may include Firebase client configuration from local `apps/android/app/google-services.json` and Play Billing product identifiers, but it must never include:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_PRIVATE_KEY`
- `WEBHOOK_AUTH_TOKEN`
- OpenAI keys, server Google Maps/geocoding keys, or backend signing secrets

Android must not call `POST /api/webhook`, admin maintenance routes, Stripe webhooks, or backend-only billing webhooks. Android should call only explicitly designed, authenticated, App Check-protected client API routes such as purchase verification or entitlement refresh.

Android purchase state is not authoritative. The app can display local Play Billing status optimistically, but access decisions must come from Firestore entitlements written by the trusted backend after server-side verification.

## App Check and Play Integrity Rollout

App Check should protect Firebase products and custom backend APIs from non-genuine clients. For Android, use the Play Integrity provider for release builds and a debug provider only for local development.

Rollout phases:

1. Register Android app SHA-256 fingerprints and configure the Play Integrity provider.
2. Add App Check initialization before Firebase SDK use in Android.
3. Add App Check token forwarding to client-owned backend routes.
4. Add backend App Check verification for protected Next.js API routes.
5. Monitor App Check metrics without enforcement.
6. Enable enforcement for lower-risk APIs and Firestore in staging.
7. Gradually enable production enforcement after Android release adoption is high enough.
8. Keep emergency operational monitoring active during rollout; be prepared to pause enforcement if legitimate clients are blocked.

Backend APIs that should require App Check:

- Client entitlement refresh.
- Google Play purchase verification.
- Admin/member management APIs used by the web/PWA.
- Any future client write proxy that creates privileged server-side effects.

Do not rely on App Check as authentication or authorization. App Check says the request likely came from a registered app; Firebase Auth, tenant membership, role, and entitlement checks still decide what the user can do.

## Stripe Billing for Web/PWA

Stripe should be the web/PWA billing provider for commercial subscriptions. Use backend-created Checkout Sessions for new purchases and Stripe Customer Portal for self-service subscription management.

Recommended flow:

1. Authenticated tenant admin opens a billing page in the PWA.
2. PWA calls `POST /api/billing/stripe/checkout` with the selected plan and tenant/account context.
3. Backend verifies Firebase ID token, tenant admin role, App Check where applicable, and plan eligibility.
4. Backend creates or reuses a Stripe Customer mapped to `accounts/{accountId}`.
5. Backend creates a Stripe Checkout Session with metadata linking `tenantId`, `accountId`, and internal plan identifiers.
6. Stripe redirects the user through hosted Checkout.
7. Stripe sends signed webhook events to `POST /api/billing/stripe/webhook`.
8. Backend verifies the webhook signature, deduplicates event IDs, stores a webhook event audit record, and updates Firestore subscription and entitlement documents.
9. Clients observe entitlement changes from Firestore.

Use Stripe Customer Portal for cancellation, payment method updates, invoices, and plan changes where product policy allows. Portal access must be created by a backend route after verifying the caller can manage billing for the account.

Use Stripe Entitlements only as provider-side feature metadata, not as the app's only source of truth. The app source of truth is Firestore, updated by trusted backend processing of Stripe events.

## Google Play Billing for Android

Google Play Billing should be the Android in-app subscription provider for Android-distributed subscriptions.

Recommended flow:

1. Android uses Google Play Billing client to show products and complete the purchase on-device.
2. Android sends `purchaseToken`, product/base-plan identifiers, package name, and authenticated tenant/account context to `POST /api/billing/play/verify`.
3. Backend verifies Firebase ID token, App Check token, tenant membership, and request shape.
4. Backend calls the Google Play Developer API for server-side subscription verification.
5. Backend checks subscription state, expiry/renewal fields, package/product match, and linked purchase token lineage.
6. Backend acknowledges purchases when entitlement is granted and acknowledgment is required.
7. Backend writes subscription, purchase token, entitlement, and audit records to Firestore.
8. Backend handles Real-time Developer Notifications through a Pub/Sub-backed route or worker and updates Firestore on renewals, cancellations, grace periods, pauses, expirations, and refunds.

Android must not receive Google Play service account credentials. It must not directly call Google Play Developer API endpoints. Purchase token verification and entitlement mutation are backend-only.

## Shared Entitlement Model

Firestore is the entitlement source of truth for NFA Alerts clients. Stripe and Google Play are provider sources; they do not directly authorize app behavior until backend processing writes Firestore state.

Recommended entitlement shape:

- `tenantId`: tenant scope for operational access.
- `accountId`: billing account or customer owner.
- `subjectType`: `tenant`, `account`, or `user`.
- `subjectId`: ID matching the subject type.
- `featureKey`: stable app feature key such as `incident_realtime`, `chaser_mobile`, `admin_console`, or `advanced_audit`.
- `status`: `active`, `trialing`, `grace`, `past_due`, `expired`, `revoked`.
- `source`: `stripe`, `google_play`, `manual_admin`, `migration`.
- `providerCustomerId`: provider customer ID when applicable.
- `providerSubscriptionId`: provider subscription ID when applicable.
- `providerPurchaseTokenHash`: hashed token reference for Play purchases, never raw token in client-visible docs.
- `effectiveAt`, `expiresAt`, `graceUntil`, `updatedAt`.
- `updatedBy`: backend actor or provider event reference.

Client authorization should read an entitlement snapshot that is cheap to query and safe for rules. Backend can maintain denormalized summary docs such as `tenants/{tenantId}/entitlementSummary/current` for UI speed, but the audit trail must remain immutable and provider-event based.

## Tenant, Account, and Membership Model

The enterprise rebuild should distinguish operational tenant, billing account, user profile, and membership:

- `tenants` represent emergency-response organizations or customer workspaces.
- `accounts` represent commercial billing/legal entities and can own one or more tenants.
- `profiles` remain user-centric Firebase Auth profile documents.
- `tenantMemberships` connect users to tenants with scoped roles and status.
- `accountMemberships` connect users to billing accounts with billing/admin rights.

Do not rely only on `profiles/{uid}.role` for commercial authorization. Keep it during migration as a compatibility field, but introduce tenant-scoped membership roles before commercial rollout.

Recommended role alignment:

- `chaser`: field responder. Reads tenant incidents allowed by rules, responds to incidents, writes own notes/activities/flags, updates own profile/location/push token.
- `supe`: supervisor. Creates and manages tenant incidents, oversees responders, closes/reopens incidents, reviews change requests, sees operational audit relevant to the tenant.
- `admin`: tenant administrator. Manages tenant members, role assignments, billing account linkage, subscription settings, and tenant-level configuration.
- Platform operator access should be separate from customer `admin`; use a distinct internal mechanism such as `platformAdmin` custom claims or an internal-only console, not a normal tenant role.

## Firestore Collection Map

Recommended commercial collections:

```text
tenants/{tenantId}
accounts/{accountId}
profiles/{uid}
tenantMemberships/{tenantId_uid}
accountMemberships/{accountId_uid}
plans/{planId}
subscriptions/{subscriptionId}
entitlements/{entitlementId}
entitlementEvents/{eventId}
billingCustomers/{accountId_provider}
billingWebhookEvents/{provider_eventId}
playPurchaseTokens/{tokenHash}
auditLogs/{auditId}
adminRoleChanges/{changeId}
appCheckAudits/{auditId}
```

Architecture-level fields:

| Collection | Purpose | Key fields |
| --- | --- | --- |
| `tenants` | Operational customer workspace | `name`, `status`, `accountId`, `region`, `createdAt`, `updatedAt`, `createdBy` |
| `accounts` | Billing/legal owner | `displayName`, `status`, `primaryTenantId`, `billingProvider`, `stripeCustomerId`, `createdAt`, `updatedAt` |
| `profiles` | User identity/profile | Existing profile fields plus `defaultTenantId`, `activeTenantIds`, compatibility `role` during migration |
| `tenantMemberships` | Tenant-scoped access | `tenantId`, `uid`, `role`, `status`, `invitedBy`, `approvedBy`, `createdAt`, `updatedAt` |
| `accountMemberships` | Billing/account access | `accountId`, `uid`, `role`, `status`, `createdAt`, `updatedAt` |
| `plans` | Internal plan catalog mirror | `planKey`, `status`, `features`, `stripePriceIds`, `playProductIds`, `limits`, `updatedAt` |
| `subscriptions` | Normalized subscription state | `accountId`, `tenantId`, `provider`, `providerCustomerId`, `providerSubscriptionId`, `status`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `updatedAt` |
| `entitlements` | Client-readable access source of truth | `tenantId`, `accountId`, `subjectType`, `subjectId`, `featureKey`, `status`, `source`, `effectiveAt`, `expiresAt`, `updatedAt` |
| `entitlementEvents` | Immutable entitlement history | `entitlementId`, `provider`, `eventType`, `oldStatus`, `newStatus`, `reason`, `createdAt` |
| `billingCustomers` | Provider customer mapping | `accountId`, `provider`, `providerCustomerId`, `createdAt`, `updatedAt` |
| `billingWebhookEvents` | Idempotency and audit | `provider`, `eventId`, `eventType`, `status`, `processedAt`, `createdAt`, `errorCode` |
| `playPurchaseTokens` | Play token lineage | `tokenHash`, `uid`, `accountId`, `tenantId`, `productId`, `linkedTokenHash`, `status`, `expiresAt`, `updatedAt` |
| `auditLogs` | Security and billing audit | `tenantId`, `accountId`, `actorUid`, `actorRole`, `action`, `targetPath`, `metadata`, `createdAt` |
| `adminRoleChanges` | Role-change audit | `tenantId`, `targetUid`, `oldRole`, `newRole`, `changedBy`, `reason`, `createdAt` |
| `appCheckAudits` | App Check rollout visibility | `uid`, `appId`, `platform`, `route`, `result`, `createdAt` |

Existing operational collections should receive `tenantId` before multi-tenant rollout:

- `incidents`
- `threads`
- `appNotifications`
- `changeRequests`
- `webhookLogs`
- `counters`
- `presence`
- `bannedDevices`
- relevant subcollections under `profiles` and `incidents`

## Backend Endpoint Inventory

Recommended Next.js API routes:

| Endpoint | Method | Auth boundary | Purpose |
| --- | --- | --- | --- |
| `/api/billing/stripe/checkout` | `POST` | Firebase ID token, tenant/account admin role, App Check for browser route if feasible | Create Stripe Checkout Session for selected plan |
| `/api/billing/stripe/portal` | `POST` | Firebase ID token, account billing/admin role | Create Stripe Customer Portal Session |
| `/api/billing/stripe/webhook` | `POST` | Stripe signature only; raw body required | Verify Stripe event, dedupe, update subscriptions and entitlements |
| `/api/billing/play/verify` | `POST` | Firebase ID token, App Check, tenant membership | Verify Android purchase token with Google Play Developer API |
| `/api/billing/play/rtdn` | `POST` | Pub/Sub or Google-signed push verification | Process Real-time Developer Notifications |
| `/api/entitlements/refresh` | `POST` | Firebase ID token, App Check, tenant membership | Recompute entitlement summary from provider-normalized state |
| `/api/admin/roles` | `POST`/`PATCH` | Firebase ID token, tenant admin/platform operator role, App Check | Invite/change/remove tenant members and write role audit |
| `/api/admin/accounts` | `POST`/`PATCH` | Platform operator or account admin | Create/update account and tenant linkage |
| `/api/app-check/audit` | `POST` | App Check token, Firebase ID token where available | Optional rollout diagnostics without granting access |

Existing routes to preserve and harden:

- `/api/webhook`: external emergency alert ingestion; Android must not call it.
- `/api/notifications/send`: should be audited before mobile reuse; current route creates notifications and sends FCM through Admin SDK.
- `/api/admin/backfill-counts`, `/api/admin/cleanup-promo-codes`, `/api/admin/merge-duplicates`: backend/admin-only maintenance; Android must not call them.

## Secrets and Environment Inventory

Use placeholder names only. Do not add values to docs or repo files.

Backend secret candidates:

| Name | Scope | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Server only | Used by Stripe backend routes |
| `STRIPE_WEBHOOK_SECRET` | Server only | Used only by Stripe webhook verifier |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Server only | Prefer workload identity/ADC when available; if JSON is unavoidable, store only in Secret Manager |
| `GOOGLE_PLAY_PACKAGE_NAME` | Server config | Package allowlist for Play verification |
| `FIREBASE_ADMIN_PROJECT_ID` | Server config | Preferred explicit Admin project ID placeholder |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server only | Existing supported Admin credential form; avoid files |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Server only | Existing supported Admin credential form; avoid files |
| `FIREBASE_PROJECT_ID` | Server config | Existing split Admin credential support |
| `FIREBASE_CLIENT_EMAIL` | Server only | Existing split Admin credential support |
| `FIREBASE_PRIVATE_KEY` | Server only | Existing split Admin credential support |
| `WEBHOOK_AUTH_TOKEN` | Server only | Existing emergency alert webhook/admin token; consider replacing with stronger sender auth later |
| `OPENAI_API_KEY` | Server only | Existing parser dependency |
| `GOOGLE_MAPS_GEOCODING_API_KEY` | Server only | Recommended server-only geocoding key placeholder |
| `APP_BASE_URL` | Server config | Absolute Stripe redirect and webhook metadata URLs |
| `BILLING_WEBHOOK_IDEMPOTENCY_SALT` | Server only | Optional token hashing/idempotency support |
| `FIREBASE_APP_CHECK_DEBUG_TOKEN` | Non-prod only | Local/staging only; never commit |

Public or client configuration placeholders:

| Name | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web client config | Public Firebase client config, not a backend secret |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Web client config | Public Firebase client config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Web client config | Public Firebase client config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Web client config | Public Firebase client config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Web client config | Public Firebase client config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web client config | Public Firebase client config |
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | Web client config | Public VAPID/FCM browser config |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Web client config | Stripe publishable key only |
| `NEXT_PUBLIC_APP_CHECK_SITE_KEY` | Web client config | If web App Check uses a web provider |
| `STRIPE_PRICE_ID_*` | Server/client config by policy | Price IDs are identifiers, but keep environment-specific |
| `GOOGLE_PLAY_PRODUCT_ID_*` | Android/server config | Product/base-plan identifiers, not secrets |

## Firestore Rules Impact

Current rules are not ready for commercial multi-tenant subscriptions because they authorize mostly by global `profiles/{uid}.role`. Commercial rules need tenant-aware helpers and server-owned billing collections.

Required rules changes before rollout:

- Add `tenantId` to tenant-owned operational documents and require it to be immutable for non-server writes.
- Add membership helper functions such as `isTenantMember(tenantId)`, `hasTenantRole(tenantId, roles)`, and `canManageBilling(accountId)`.
- Restrict `profiles` reads; broad authenticated reads expose user/contact/location data.
- Restrict `incidents` reads by tenant membership and entitlement, not just authentication.
- Make `subscriptions`, provider customer mappings, webhook events, entitlement events, audit logs, and role-change records backend-write only.
- Allow clients to read only the entitlement summaries needed for their current tenant/account.
- Prevent users from creating or upgrading their own privileged roles.
- Prevent clients from writing billing provider IDs, entitlement status, or subscription status.
- Add schema validation for expected fields, types, enum values, immutable fields, and timestamp fields where practical.
- Add tests for chaser, supe, admin, suspended, banned, expired subscription, grace-period, and no-membership cases.

App Check enforcement is configured outside Firestore rules, but the rollout should be coordinated with rules tests because App Check failures can look like permission failures to clients.

Index impact:

- Add composite indexes for tenant-scoped incident feeds, for example `tenantId + status + updatedAt desc`.
- Add indexes for membership lookup by `uid`, `tenantId`, `status`, and `role`.
- Add indexes for entitlements by `tenantId`, `subjectId`, `featureKey`, and `status`.
- Add indexes for subscription lookup by `accountId`, `tenantId`, `provider`, and `status`.
- Review collection-group indexes before using tenant-owned subcollections at high volume.

## High-Volume Scaling Risks

Primary risks:

- Existing incident feeds are capped and ordered by `createdAt`; commercial feeds need tenant-scoped pagination and likely `updatedAt` or `latestActivityAt` ordering.
- Existing `counters/incidents` is a single counter document and can become a write hotspot; use tenant-scoped counters, sharded counters, or avoid strict sequential display IDs at high write rates.
- Firestore rules that call membership documents on every read can add latency and hit rule evaluation limits; design membership docs and custom claims carefully.
- Broad realtime listeners across large tenant datasets can multiply read costs; use scoped queries, pagination, and summary docs.
- Existing in-memory API rate limiting is per Next.js replica and not enough for commercial abuse protection.
- Webhook event processing must be idempotent because Stripe, Pub/Sub, and emergency alert senders can retry.
- A single `profiles.pushToken` can be overwritten by multiple devices/platforms; commercial push should move toward `profiles/{uid}/devices/{deviceId}`.
- Audit logs and webhook events are append-heavy; partition by date or tenant if query volume grows.
- Entitlement changes must propagate quickly but not depend on client polling; use small entitlement summary docs.
- Billing provider outages and delayed webhooks require explicit grace policies and reconciliation jobs.

## Migration Path from `nfa-alerts-v2`

The migration must be additive, reversible, and audited. Do not modify production data until an approved migration task is opened.

Phase 0: Safety prerequisites

- Rotate any old Firebase service account key exposed in the legacy repo history.
- Remove legacy `service-account.json` from old repo history as a human-owned security cleanup.
- Confirm no `google-services.json`, service account JSON, or real secret values are tracked.
- Inventory current Firebase Auth users, Firestore collections, indexes, rules, Storage paths, FCM usage, and webhook senders.

Phase 1: Staging rebuild

- Create or select a staging Firebase/GCP environment separate from production.
- Configure Secret Manager with placeholder-named secrets and real values only in the cloud console or approved secret manager.
- Deploy no production changes during staging.
- Create tenant/account/membership/subscription/entitlement schemas in staging.
- Run Firestore rules and indexes in emulator/staging first.

Phase 2: Additive production schema

- Add `tenantId` and account linkage fields to new writes only after rules are ready.
- Backfill production data through an approved, logged, dry-run capable migration job.
- Start with a single default tenant for existing data if no tenant mapping exists.
- Preserve existing document IDs where clients depend on them.
- Keep old fields such as `profiles.role` during compatibility windows.

Phase 3: Dual-read and verification

- Web and Android read tenant-aware docs but can fall back only where explicitly approved.
- Compare old role behavior against new membership behavior.
- Verify entitlements are present for migrated tenants before enforcing subscription gates.
- Reconcile billing account ownership manually before charging real customers.

Phase 4: Enforcement

- Enable tenant-aware Firestore rules.
- Enable App Check enforcement gradually.
- Enable Stripe webhooks and Play verification in production.
- Enable entitlement-gated commercial features after provider events and Firestore summaries match.

Rollback considerations:

- Keep backups/exports before backfills.
- Make migrations idempotent and record batch checkpoints.
- Keep compatibility fields until rollback window closes.
- Store webhook events so subscriptions/entitlements can be replayed.
- If entitlement enforcement causes operational impact, disable enforcement gates before changing source data.

## Android Work Items

- Keep `google-services.json` local at `apps/android/app/google-services.json` and ignored.
- Add App Check Play Integrity initialization before Firebase SDK use.
- Add App Check token handling only for approved client backend routes.
- Add Play Billing client integration for subscription purchase UI after backend verification routes exist.
- Send purchase tokens only to `POST /api/billing/play/verify`; never send them to Stripe or emergency webhook routes.
- Read Firestore entitlement summaries and tenant memberships to gate commercial UI.
- Support no-entitlement, grace-period, expired, and verification-pending states.
- Avoid storing backend secrets, raw webhook examples, or service account data in Android source/resources/logs.
- Add device-level FCM token strategy that does not overwrite web/mobile tokens long term.
- Do not change Android Home/Details business logic as part of this architecture plan.

## Web and Backend Work Items

- Add Stripe SDK/server dependency only when implementation begins.
- Add backend route handlers for Stripe Checkout, Customer Portal, and webhook processing.
- Add raw-body handling for Stripe webhook signature verification.
- Add Google Play verification route and RTDN processing path.
- Add Firebase Admin App Check verification helper for protected backend APIs.
- Add tenant/account/membership services and schemas.
- Add entitlement recomputation service with idempotent provider-event processing.
- Add Firestore rules tests for roles, tenants, and entitlement scenarios.
- Add composite indexes for tenant-scoped queries.
- Replace or augment in-memory rate limiting with shared production rate limiting for public and billing routes.
- Split server-only geocoding key configuration from public Maps configuration if commercial policy requires it.
- Add audit logging for billing, entitlement, role, and admin actions.

## Release Blockers

- Old `nfa-alerts-v2` service account exposure remediation is complete or explicitly risk-accepted by the owner.
- Secret Manager secrets and IAM are configured per environment.
- No real secrets are present in git, docs, screenshots, logs, `.env*`, or Android resources.
- Stripe products, prices, webhook endpoint, customer portal policy, and test-mode flows are configured and tested.
- Google Play app, Play Billing products/base plans, Play Integrity, RTDN, and backend verification are configured and tested.
- App Check is monitored in production before enforcement and has a rollback plan.
- Firestore rules are tenant-aware, entitlement-aware, tested, and deployed only through an approved rules task.
- Firestore indexes for tenant, membership, subscription, entitlement, notification, and incident queries are defined and validated.
- Backend idempotency exists for Stripe webhooks, Play RTDN, and purchase verification.
- Entitlement summary docs update correctly for renewal, cancellation, refund, expiration, grace, trial, and manual override cases.
- Android and web clients handle pending verification, entitlement expiry, and offline states without exposing privileged actions.
- Migration dry runs, backups, rollback steps, and owner approvals are complete.

## Phased Rollout Checklist

Phase A: Architecture and contracts

- [x] Document commercial security, secrets, billing, tenant, role, entitlement, and migration architecture.
- [ ] Approve tenant/account/membership collection contracts.
- [ ] Approve entitlement feature keys and plan catalog.
- [ ] Approve grace-period policy for emergency workflows.

Phase B: Staging foundations

- [ ] Configure staging Secret Manager and IAM.
- [ ] Add staging Firestore rules and indexes.
- [ ] Add billing backend routes behind staging secrets.
- [ ] Add App Check in staging with debug/release separation.
- [ ] Add provider webhook event storage and replay tools.

Phase C: Provider integration

- [ ] Configure Stripe test products/prices/portal/webhooks.
- [ ] Configure Google Play internal testing products/base plans/RTDN.
- [ ] Verify Stripe and Play events update Firestore entitlements.
- [ ] Verify cancellation/refund/expiration/grace paths.

Phase D: Client rollout

- [ ] Web billing UI uses backend-created Checkout and Portal sessions.
- [ ] Android Play Billing sends purchase tokens only to backend verification.
- [ ] Web and Android read Firestore entitlement summaries.
- [ ] App Check monitoring shows healthy legitimate traffic.

Phase E: Production migration

- [ ] Complete production data backup/export.
- [ ] Run tenant/account/member backfill dry run.
- [ ] Run approved production backfill with audit logs.
- [ ] Enable tenant-aware rules.
- [ ] Gradually enforce App Check.
- [ ] Gradually enforce paid entitlements with rollback switch.

## Missing or Unknown Facts

- Exact commercial pricing, plans, trial policy, feature keys, and grace-period policy are not defined.
- Exact Stripe account mode, tax strategy, invoice policy, and customer ownership rules are not defined.
- Exact Google Play product IDs, base plans, offers, and package signing state are not defined.
- Exact Firebase App Check registration state and SHA-256 certificate fingerprints are unknown.
- Exact production data tenant mapping is unknown.
- Exact CRM/ERP system of record and customer/contact schema are not implemented in this repo.
- Exact deployment platform for backend billing routes is not finalized in this plan.

## Explicit Non-Actions in This Plan

- No Firebase deploy.
- No production Firebase data mutation.
- No real secrets added.
- No `google-services.json` committed.
- No Android UI or business logic modified.
- No commit or push.
