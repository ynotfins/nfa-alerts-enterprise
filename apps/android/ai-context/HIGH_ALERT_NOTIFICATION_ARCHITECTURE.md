# High Alert Notification Architecture

Last updated: 2026-05-19

This document captures the Android-side **planning scaffold** for High Alert handling.
It does **not** mean the app can bypass Android OS notification, audio, DND, or background limits.

## Scope in this pass

Android currently stores High Alert configuration locally so Home filtering and future notification logic can share the same criteria.

Stored configuration includes:
- `enabled`
- selected alert types
- selected keywords
- selected departments
- max distance
- min update count
- vibration enabled
- siren enabled
- flashlight/strobe enabled

## Current implementation boundary

Implemented now:
- local DataStore persistence for High Alert configuration
- local Home filter toggle to show only High Alert matches
- UI scaffolding for future options

Not implemented now:
- siren playback
- flashlight/strobe execution
- foreground service
- DND override
- backend notification mutation
- production Firebase writes

## Future Android architecture

Planned components:
1. **High Alert notification channel**
   - high-priority notification channel
   - importance and sound policy per Android rules
2. **Notification handling layer**
   - evaluate incoming incidents/notifications against High Alert criteria
   - respect per-alert silent state before surfacing
3. **Vibration pattern**
   - use `Vibrator` / `VibratorManager` with permission-safe fallbacks
4. **Optional siren playback**
   - foreground-safe media playback only
   - must respect Android audio focus and hardware volume constraints
5. **Optional flashlight / strobe**
   - `CameraManager` torch control
   - hardware support required
   - foreground/lifecycle safe only
6. **Notification policy / DND checks**
   - DND override requires explicit user-granted policy access
   - app must not assume bypass capability
7. **Foreground-service review**
   - background execution is restricted on modern Android
   - any persistent urgent behavior needs foreground-service review and user-visible justification

## Android OS limitations

Important limitations to preserve in code and product copy:
- Android cannot safely guarantee volume override.
- DND override requires user-granted notification policy access.
- Flashlight/strobe requires hardware support and careful foreground handling.
- Background execution is restricted.
- Notification behavior is still subject to user/device OEM settings.

## Backend / Firestore boundary

High Alert settings are local in this pass.
If the product later needs cross-device persistence, future work should define:
- Firestore user preference contract
- safe write repository path
- migration/merge behavior with local DataStore

That future persistence is **not** implemented in this pass.
