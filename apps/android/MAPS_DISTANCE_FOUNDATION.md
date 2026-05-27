# Android Maps and Distance Foundation

This Android app uses the **Maps SDK for Android** for map display only.

## Boundaries

- Android **does not geocode** Home card addresses.
- Android **does not call the Google Geocoding API** for incident feed cards.
- Backend services own geocoding and write normalized Firestore coordinates.
- Android reads Firestore `incident.location.lat` / `incident.location.lng` and renders maps from those existing values only.

## Home Distance

- Home distance is calculated client-side from:
  - the current device location
  - Firestore incident latitude/longitude
- If device location is unavailable, or incident latitude/longitude is missing/invalid, Home shows `-- mi`.
- No network geocoding is used for distance.

## Android Maps API Key

- Android map display uses a **Maps SDK for Android** key only.
- Do **not** hardcode or commit a real API key.
- Supply the key locally through either:
  - `~/.gradle/gradle.properties` with `NFA_MAPS_API_KEY=...`
  - or ignored `local.properties` with `NFA_MAPS_API_KEY=...`
- Restrict the key to the Android package and signing SHA fingerprints.

## Important

- Geocoding API keys remain server-side only.
- Android should never call webhook/admin routes for map or distance behavior.
- This foundation is intended for Home/Details display parity without changing Firebase production data.

## Geocoding and Cache Architecture

- Android does **not** geocode Home addresses.
- Backend geocodes once and stores the normalized address plus `lat/lng` on the incident.
- Multiple chasers or supes opening the same alert should reuse the same Firestore `lat/lng` values.
- Future backend architecture should maintain an address/geocode cache to avoid duplicate geocoding charges.
- Android distance calculation is display-only and local; it does not write back coordinates or distance values.
