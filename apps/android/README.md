# Android App

Android Studio owns this directory.

Create the native Android project here with:

```text
Template: Empty Activity
App name: NFA Alerts
Package: com.emergency.alerts
Language: Kotlin
UI: Jetpack Compose
Build configuration language: Kotlin DSL
Minimum SDK: API 24
Firebase project: nfa-alerts-v2
```

Cursor must not create `settings.gradle.kts`, `build.gradle.kts`, `gradlew`, `AndroidManifest.xml`, or Kotlin source files manually during monorepo migration.

After Android Studio creates the app module, add `google-services.json` at `app/google-services.json`.
