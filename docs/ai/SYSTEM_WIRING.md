# System Wiring — NFA Alerts

**Generated**: 2026-04-23  
**Source**: AGENT Bootstrap — reconstructed from code inspection

---

## Provider Wiring Tree

```
RootLayout (apps/web/src/app/layout.tsx)
├── Viewport: mobile-only, theme #3b82f6
├── ServiceWorker registration: /sw.js + /firebase-messaging-sw.js
└── Providers (apps/web/src/app/providers.tsx)
    └── AuthProvider (apps/web/src/contexts/auth-context.tsx)
        ├── onAuthStateChanged → Firebase Auth
        ├── onSnapshot(profiles/{uid}) → Firestore
        ├── getFingerprint() → apps/web/src/lib/fingerprint.ts
        ├── Writes presence to profiles/{uid}
        └── Redirects: loading/unauthenticated/incomplete/banned/suspended
    └── Toaster (sonner — toast notifications)
    └── [Protected Routes: (dashboard)/layout.tsx]
        └── Protected (apps/web/src/components/auth/protected.tsx)
            ├── Reads AuthContext
            └── Redirects if not authenticated
        └── Presence (apps/web/src/components/presence.tsx)
            └── Writes to presence/{uid} in Firestore
        └── ProfilesProvider (apps/web/src/contexts/profiles-context.tsx)
            └── onSnapshot(profiles collection) → all profiles
        └── PushNotificationProvider (apps/web/src/components/push-notification-provider.tsx)
            ├── usePushNotifications hook
            ├── Requests notification permission
            ├── getToken(messaging, { vapidKey }) → FCM token
            └── Writes token to profiles/{uid}.pushToken
        └── GoogleMapsProvider (apps/web/src/components/google-maps-provider.tsx)
            └── Loads Google Maps JS SDK (lazy)
        └── Shell (apps/web/src/components/layout/shell.tsx)
            └── Navigation + bottom tab bar + {children}
        └── PermissionsPrompt (apps/web/src/components/permissions-prompt.tsx)
        └── WalkthroughProvider (apps/web/src/components/walkthrough-provider.tsx)
```

---

## Webhook Ingest Flow

```
External System
  → POST /api/webhook (Bearer token auth)
  → apps/web/src/app/api/webhook/route.ts
      → sanitizeInput() — strip control chars, limit 10k
      → parseNotification() — apps/web/src/lib/webhook/parser.ts
          → OpenAI GPT-4o-mini generateObject()
          → Schema: notificationSchema (Zod)
          → Returns: {source, alertId, isUpdate, incidentType, location, description}
      → geocodeAddress() — apps/web/src/lib/webhook/geocoder.ts
          → Google Maps Geocoding API
          → Returns: {lat, lng}
      → adminDb.collection("incidents").where("alertId", "==", alertId)
      → IF isUpdate + existing: addActivity() to incident
      → ELSE: getNextIncidentNumber() [transaction on counters/incidents]
              + adminDb.collection("incidents").add({...})
      → Log to webhookLogs collection
      → Return 200/401/422/500
```

---

## Auth State Machine

```
FirebaseAuth.onAuthStateChanged
  → null → state: "unauthenticated" → redirect /login
  → user (no profile) → state: "incomplete" → redirect /signup/profile
  → user (banned device) → state: "banned" → redirect /banned
  → user (suspended) → state: "suspended" → redirect /suspended
  → user (profile complete) → state: "authenticated" → continue
```

---

## Chat Message → Push Notification Flow

```
User sends message
  → apps/web/src/services/chat.ts:sendMessage()
      → setDoc(threads/{id}/messages/{new}) — Firestore
      → updateDoc(threads/{id}) — update lastMessage, unreadCount
      → getProfile(senderId) — get sender name
      → IF thread.type === "direct": recipient = other participant
      → IF thread.type === "chaser_to_supes": 
          → getDocs(profiles where role in [supe, admin]) — N+1 issue
      → FOR EACH recipient:
          → fetch("/api/notifications/send", {profileId, type, title, body, url})
              → apps/web/src/app/api/notifications/send/route.ts
                  → setDoc(appNotifications/{new}) — Firestore
                  → IF profile.pushToken:
                      → sendNotification(token, {title, body, data})
                          → apps/web/src/lib/firebase-admin.ts
                          → adminMessaging.send()
                          → FCM → Device
```

---

## Incident Respond Flow

```
User taps Respond
  → apps/web/src/app/(dashboard)/incidents/[id]/incident-detail-client.tsx
  → respondToIncident(incidentId, note?)
      → apps/web/src/services/incidents.ts:respondToIncident()
          → updateDoc(incidents/{id}, {
              responderIds: arrayUnion(uid),
              responderCount: increment(1),
              respondedAt: Date.now()
            })
          → IF note: addNote(incidentId, note)
              → setDoc(incidents/{id}/notes/{new})
          → addIncidentActivity(incidentId, {...})
              → setDoc(incidents/{id}/activities/{new})
              → updateDoc(incidents/{id}, {activityCount: increment(1)})
  → All onSnapshot subscribers receive update automatically
```

---

## FCM / Service Worker Setup

```
apps/web/public/firebase-messaging-sw.js
  → Firebase App init with firebaseConfig (hardcoded public keys)
  → getMessaging()
  → onBackgroundMessage() → shows notification via self.registration.showNotification()

apps/web/public/sw.js
  → Standard PWA service worker (cache-first strategy)

Registration (apps/web/src/app/layout.tsx):
  navigator.serviceWorker.register('/sw.js')
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
  [NOTE: Dual registration — potential conflict risk]
```

---

## Firebase Admin SDK Initialization

```
apps/web/src/lib/firebase-admin.ts
  → Reads FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS_JSON env var
    OR FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
  → initializeApp({ credential: cert(firebaseServiceAccount) })
  → adminDb = getFirestore(adminApp)
  → adminMessaging = getMessaging(adminApp)
```

---

## PWA / Android Wiring

```
apps/web/public/manifest.json
  → name: "NFA Alerts - Emergency Response Platform"
  → display: standalone
  → orientation: portrait
  → start_url: /
  → icons: icon-192.png, icon-512.png

apps/web/twa-manifest.json
  → Trusted Web Activity manifest for Play Store distribution

apps/web/public/android.apk
  → Pre-built APK committed to git (⚠ large binary in git history)
```

---

## Environment Variables Surface

| Var | Side | Used In |
|-----|------|---------|
| `FIREBASE_PROJECT_ID` | Server | firebase-admin.ts |
| `FIREBASE_CLIENT_EMAIL` | Server | firebase-admin.ts |
| `FIREBASE_PRIVATE_KEY` | Server | firebase-admin.ts |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server | firebase-admin.ts |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Server | firebase-admin.ts |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | firebase.ts |
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | Client | use-push-notifications.ts, use-permissions.ts |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client | google-maps-provider.tsx |
| `OPENAI_API_KEY` | Server | webhook/parser.ts |
| `WEBHOOK_AUTH_TOKEN` | Server | api/webhook/route.ts |
