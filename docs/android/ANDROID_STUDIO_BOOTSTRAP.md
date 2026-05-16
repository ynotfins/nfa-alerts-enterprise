# Android Studio Bootstrap

Android Studio owns native Android project creation, sync, previews, emulator/device checks, Logcat, and builds.

## Project Settings

```text
Template: Empty Activity
App name: NFA Alerts
Package name: com.emergency.alerts
Save location: D:\github\nfa-alerts-enterprise\apps\android
Language: Kotlin
Build configuration language: Kotlin DSL
Minimum SDK: API 24
Jetpack Compose: Yes
Firebase project: nfa-alerts-v2
```

## Cursor Boundary

Cursor may create this documentation and the `apps/android` placeholder only. Cursor must not create or rewrite Gradle files during monorepo migration.

Do not create these from Cursor unless explicitly requested later:

- `settings.gradle.kts`
- `build.gradle.kts`
- `gradlew` or `gradlew.bat`
- `gradle/wrapper/*`
- `AndroidManifest.xml`
- Kotlin source files

## Firebase Config

After Android Studio creates the app module, add the Android Firebase config at:

```text
apps/android/app/google-services.json
```

The app package must remain `com.emergency.alerts`.

## Runtime Contract

The native Android app reads alert data from Firestore collection `incidents`. It must not call the Next.js webhook route.
