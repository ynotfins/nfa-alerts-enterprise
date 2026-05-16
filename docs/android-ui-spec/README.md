# NFA Alerts Android UI Specification

## Purpose

This documentation pack captures the existing NFA Alerts PWA UI and behavior so a native Android implementation can start from UI parity. It is UI-first: Android developers should be able to recreate the current Supe PWA screens before wiring Firebase or business logic.

The app is an emergency fire-alert response tool for supervisors and field responders. Supervisors monitor alerts, responders, live locations, assignments, and chat. Chasers respond to incidents, navigate to properties, communicate with supervisors, upload documents, collect signatures, and support homeowner/insurance intake.

## Source Inputs Used

- Screenshot evidence: all 34 images in `screenshots/*.jpg`.
- Source evidence: `apps/web/src/app/**`, `apps/web/src/components/**`, `apps/web/src/hooks/**`, `apps/web/src/services/**`, `apps/web/src/contexts/**`, `apps/web/src/lib/**`.
- Firebase evidence: `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `apps/web/src/lib/firebase.ts`, `apps/web/src/lib/firebase-admin.ts`.
- PWA evidence: `apps/web/public/manifest.json`, `apps/web/public/sw.js`, `apps/web/public/firebase-messaging-sw.js`, `twa-manifest.json`.
- Prior scan evidence: source-verified structural scan and contract audit outputs were read, but stale claims were rechecked against source.

## How To Read These Docs

- Start with `app-map.md` for routes, role gates, navigation, and Firebase touchpoints.
- Use `screen-index.md` to find a specific screen spec.
- Use `design-system.md` when implementing shared Android Compose components.
- Use `realtime-and-firebase.md` when wiring Firebase after static UI parity.
- Use `android-build-plan.md` for implementation order and architecture.
- Each file under `screens/` contains a UI reconstruction spec for one route, tab, modal, or major state.

## Evidence Labels

- **Screenshot-backed**: directly visible in one or more screenshots.
- **Source-backed**: confirmed in application source code.
- **Firebase-backed**: confirmed in rules, indexes, or Firebase init code.
- **Inference**: likely behavior based on names, route structure, or shared components, but not directly visible in screenshots.
- **Needs verification**: missing screenshot, runtime check, or Chaser-specific evidence.

## Glossary

- **Supe**: Supervisor role. Source role value is `supe`; admins are treated as supe-capable in many screens.
- **Chaser**: Field employee / responder role. Source role value is `chaser`.
- **Incident**: Fire or emergency alert stored in Firestore `incidents`.
- **Alert**: User-facing incident notification or incident list item; often used interchangeably with incident in UI copy.
- **Responder**: A profile id in an incident's `responderIds` array.
- **Thread**: Firestore `threads` document for direct or chaser-to-supes chat.
- **Profile**: Firestore `profiles/{uid}` document containing role, name, push token, stats, signature, moderation, and location settings.
- **Presence**: Current/periodic user online/location signal. Source writes location fields to `profiles`; rules also define a `presence` collection that is not actively used by source.
- **Notification**: Firestore `appNotifications` item and/or FCM push notification.

## Role Matrix Summary

| Area | Supe / Admin | Chaser | Evidence |
| --- | --- | --- | --- |
| Incident list | Sees all active incidents | Source says all authenticated users can read incidents | Source/Firebase-backed |
| Incident details | Sees supe actions such as close incident and review submissions | Can respond, upload docs, collect signatures after responding | Source-backed, Supe screenshots |
| Chasers list/map | Visible for supe/admin | Not visible in nav for chaser | Source-backed, screenshots |
| Admin users/locations | Admin nav only; source uses `profile.role === "admin"` | Not visible | Source-backed |
| Chat | Supes see chaser-to-supes threads; chasers can start chaser and supes threads | Chaser shared route confirmed, screenshots are Supe-only | Source-backed, screenshots |
| Profile | Same base profile route, role labels differ | Same base route | Source-backed, Supe screenshots |
| Documents/signing | Supe can review all responder submissions; responders manage own docs | Shared source confirms Chaser access after responding | Source-backed, screenshots for Supe/shared UI |

## Verification Status Legend

- **Verified**: screenshot and source align.
- **Source only**: source confirms behavior, screenshot missing.
- **Screenshot only**: visible in screenshot, source not deeply traced.
- **Inferred**: labeled inference and should be validated before native implementation.
- **Gap**: needs a screenshot, runtime test, or product decision.
