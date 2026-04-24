# Architecture — Current State

**Generated**: 2026-04-23  
**Source**: AGENT Bootstrap — reconstructed from code inspection + existing ARCHITECTURE.md  
**Git HEAD**: `a5d8ec28879848733c6e76c2ba8fa2039c261441`

---

## 1. System Identity

**National Fire Alerts (NFA)** — emergency response coordination PWA for organizations like Miami-Dade Fire Rescue.

- **Role**: Connects supervisors (Supes) with field responders (Chasers) for real-time incident coordination
- **Deployment**: Next.js 16.0.1 deployed to Vercel (inferred from `vercel.json`)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Mobile-first**: Max 448px viewport, blocks desktop (`md:hidden` wrapper)
- **PWA**: `public/manifest.json` — standalone display, portrait orientation
- **Service workers**: `/sw.js` (PWA) + `/firebase-messaging-sw.js` (FCM background push)
- **Android artifact**: `public/android.apk` tracked in git (TWA manifest at `twa-manifest.json`)

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js App Router | 16.0.1 |
| Runtime | React | 19.2.0 |
| Language | TypeScript | strict mode |
| Database | Firebase Firestore | persistent local cache |
| Auth | Firebase Authentication | email/password + Google OAuth |
| Storage | Firebase Cloud Storage | — |
| Push | Firebase Cloud Messaging (FCM) | — |
| AI | OpenAI GPT-4o-mini (via `@ai-sdk/openai`) | — |
| Maps | Google Maps API | Advanced Markers |
| CSS | Tailwind CSS | v4 |
| UI library | shadcn/ui | 30+ components |
| Forms | React Hook Form + Zod | — |
| PDF | @react-pdf/renderer | — |
| Test | Vitest | v4.0.8 |
| Package manager | pnpm | v10.24.0 |
| Node | v22.22.0 | — |

---

## 3. Routes (App Router)

### Auth Group `(auth)`
| Route | File | Type |
|-------|------|------|
| `/login` | `(auth)/login/page.tsx` | Static |
| `/signup` | `(auth)/signup/page.tsx` | Static |
| `/signup/legal` | `(auth)/signup/legal/page.tsx` | Static |
| `/signup/profile` | `(auth)/signup/profile/page.tsx` | Static |
| `/signup/signature` | `(auth)/signup/signature/page.tsx` | Static |
| `/banned` | `(auth)/banned/page.tsx` | Static |
| `/suspended` | `(auth)/suspended/page.tsx` | Static |

### Dashboard Group `(dashboard)` — Protected
| Route | File | Type |
|-------|------|------|
| `/incidents` | `incidents/page.tsx` | Static |
| `/incidents/[id]` | `incidents/[id]/page.tsx` | Dynamic |
| `/incidents/[id]/docs` | `incidents/[id]/docs/page.tsx` | Dynamic |
| `/incidents/[id]/homeowner` | `incidents/[id]/homeowner/page.tsx` | Dynamic |
| `/incidents/[id]/sign` | `incidents/[id]/sign/page.tsx` | Dynamic |
| `/chat` | `chat/page.tsx` | Static |
| `/chat/[threadId]` | `chat/[threadId]/page.tsx` | Dynamic |
| `/chasers` | `chasers/page.tsx` | Static |
| `/chasers/[chaserId]` | `chasers/[chaserId]/page.tsx` | Dynamic |
| `/favorites` | `favorites/page.tsx` | Static |
| `/notifications` | `notifications/page.tsx` | Static |
| `/profile` | `profile/page.tsx` | Static |
| `/profile/activity` | `profile/activity/page.tsx` | Static |
| `/profile/information` | `profile/information/page.tsx` | Static |
| `/route` | `route/page.tsx` | Static |
| `/admin/users` | `admin/users/page.tsx` | Dynamic |
| `/admin/users/[id]` | `admin/users/[id]/page.tsx` | Dynamic |
| `/admin/locations` | `admin/locations/page.tsx` | Dynamic |
| `/dev-tools` | `dev-tools/page.tsx` | Static |
| `/help-support` | `help-support/page.tsx` | Static |
| `/terms-privacy` | `terms-privacy/page.tsx` | Dynamic |

### API Routes
| Route | File | Auth |
|-------|------|------|
| `POST /api/webhook` | `api/webhook/route.ts` | Bearer token |
| `POST /api/notifications/send` | `api/notifications/send/route.ts` | None (internal) |
| `GET /api/weather` | `api/weather/route.ts` | — |
| `POST /api/admin/backfill-counts` | Admin only | — |
| `POST /api/admin/cleanup-promo-codes` | Admin only | — |
| `POST /api/admin/merge-duplicates` | Admin only | — |

### Other
| Route | Notes |
|-------|-------|
| `/` | `app/page.tsx` — redirect to `/incidents` |
| `/logout` | `app/logout/page.tsx` |

---

## 4. Contexts & Providers (Top-Down Tree)

```
RootLayout (app/layout.tsx)
└── Providers (app/providers.tsx)
    └── AuthProvider (src/contexts/auth-context.tsx)
        └── Toaster (sonner)
            └── [pages]
                └── Protected (src/components/auth/protected.tsx)
                    └── Presence (src/components/presence.tsx)
                    └── ProfilesProvider (src/contexts/profiles-context.tsx)
                        └── PushNotificationProvider (src/components/push-notification-provider.tsx)
                            └── GoogleMapsProvider (src/components/google-maps-provider.tsx)
                                └── Shell (src/components/layout/shell.tsx)
                                    └── {children}
                                └── PermissionsPrompt
                                └── WalkthroughProvider
```

---

## 5. Contexts

| Context | File | Responsibility |
|---------|------|----------------|
| `AuthContext` | `src/contexts/auth-context.tsx` | Auth state machine, profile subscription, device fingerprinting, ban checking, route redirects |
| `ProfileContext` | `src/contexts/profile-context.tsx` | Current user's profile |
| `ProfilesContext` | `src/contexts/profiles-context.tsx` | All profiles map (for chasers list, admin) |

### Auth State Machine (AuthContext)
```
loading → unauthenticated → incomplete → authenticated
                          ↘ banned
                          ↘ suspended
```

---

## 6. Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useIncidents` | `src/hooks/use-incidents.ts` | Incident list + real-time subscription |
| `useChat` | `src/hooks/use-chat.ts` | Chat threads + messages |
| `useMessageNotifications` | `src/hooks/use-message-notifications.ts` | Unread badge counts |
| `useNotifications` | `src/hooks/use-notifications.ts` | In-app notifications |
| `usePushNotifications` | `src/hooks/use-push-notifications.ts` | FCM token registration |
| `usePermissions` | `src/hooks/use-permissions.ts` | Browser permission state |
| `useRole` | `src/hooks/use-role.ts` | Current user role |
| `useProfiles` | `src/hooks/use-profiles.ts` | Profiles list |
| `useGeofencing` | `src/hooks/use-geofencing.ts` | Location geofencing |
| `useAppBadge` | `src/hooks/use-app-badge.ts` | App badge API |
| `useDialog` | `src/hooks/use-dialog.ts` | Dialog state helper |
| `useMobile` | `src/lib/hooks/use-mobile.ts` | Mobile viewport detection |

---

## 7. Services

| Service | File | Key Operations |
|---------|------|----------------|
| Incidents | `src/services/incidents.ts` (~800 LOC) | CRUD, subscribe, respond, close, documents, signatures, favorites, bookmarks |
| Chat | `src/services/chat.ts` | Thread CRUD, send message, subscribe, mark read |
| Profiles | `src/services/profiles.ts` | Create, update, role management |
| Storage | `src/services/storage.ts` | Upload avatar, signature, documents, voice |
| Notifications | `src/services/notifications.ts` | In-app notification CRUD |
| Moderation | `src/services/moderation.ts` | Ban/suspension checks |
| Change Requests | `src/services/change-requests.ts` | Change request workflow |
| Verification | `src/services/verification.ts` | User verification |

---

## 8. Firebase Collections (Firestore)

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `profiles` | User records | uid, role, pushToken, name, phone |
| `profiles/{uid}/activities` | User activity log | type, description |
| `profiles/{uid}/locations` | Location history | lat, lng, timestamp |
| `incidents` | Incident records | displayId, type, status, responderIds, alertId |
| `incidents/{id}/notes` | User notes on incident | authorId, text |
| `incidents/{id}/activities` | Incident activity log | type, description, profileId |
| `incidents/{id}/chaserSubmissions/{uid}/documents` | Chaser document submissions | — |
| `threads` | Chat thread records | type, participants, lastMessage |
| `threads/{id}/messages` | Chat messages | senderId, text, readBy, reactions |
| `userIncidents` | User-incident relations | favorite, bookmark, hide, mute |
| `appNotifications` | In-app notifications | profileId, type, title, body |
| `webhookLogs` | Webhook audit trail | source, status, processingTime |
| `counters` | Auto-increment (displayId) | incidents: number |
| `presence` | Online status | uid, online, lastSeen |
| `changeRequests` | Change request workflow | — |
| `bannedDevices` | Device ban list | fingerprint, bannedAt |
| `signedDocuments` | Signed PDF records | — |

---

## 9. Infrastructure Files

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Client SDK init (Auth, Firestore, Storage, FCM) with persistentLocalCache |
| `src/lib/firebase-admin.ts` | Server SDK init + `sendNotification()` + `sendNotificationToMultiple()` |
| `src/lib/firebase-db.ts` | Firestore helpers |
| `src/lib/db.ts` | TypeScript type definitions (Incident, Note, Document, Signature, Profile) |
| `src/lib/auth-client.ts` | Client-side auth utilities |
| `src/lib/fingerprint.ts` | Device fingerprinting for ban enforcement |
| `src/lib/pdf-generator.ts` | PDF generation with @react-pdf/renderer |
| `src/lib/utils.ts` | General utilities (cn, formatters) |
| `src/lib/webhook/parser.ts` | OpenAI GPT-4o-mini structured output parser |
| `src/lib/webhook/geocoder.ts` | Google Maps geocoding |
| `src/lib/webhook/errors.ts` | Custom error classes (GeocodingError, ParsingError) |

---

## 10. Security Rules

| File | Deployed | Notes |
|------|----------|-------|
| `firestore.rules` | Yes (production) | Role helpers: isSupe(), isAdmin(), isOwner() |
| `storage.rules` | Yes (production) | Path-based rules |

---

## 11. Testing

| File | Tests | Status |
|------|-------|--------|
| `tests/webhook-parser.test.ts` | 12 | PASS (mocked OpenAI) |
| `tests/webhook-notifications.test.ts` | 28 | PASS (mocked fetch) |
| `tests/__mocks__/ai.ts` | — | OpenAI mock |

**Total**: 40/40 PASS. Coverage: ~3% (webhook parser only).

---

## 12. Android / Mobile

- **Android APK**: `public/android.apk` tracked in git
- **TWA manifest**: `twa-manifest.json` at repo root
- **PWA manifest**: `public/manifest.json` — `prefer_related_applications: false`
- **Service workers**: Dual registration (sw.js + firebase-messaging-sw.js)
- Strategy is currently PWA-first with TWA wrapper for Play Store distribution

---

## 13. Known Issues / Debt Summary

See `RISK_REGISTER.md` for full details. Summary:

| Priority | Issue |
|----------|-------|
| 🔴 CRITICAL | service-account.json committed to git (rotate key immediately) |
| 🔴 HIGH | No rate limiting on webhook/notifications API |
| 🟡 MEDIUM | N+1 query in chat supe notifications |
| 🟡 MEDIUM | No pagination (incident list capped at 50) |
| 🟡 MEDIUM | Dual service worker registration |
| 🟡 MEDIUM | ~3% test coverage |
| 🟢 LOW | 20 ESLint warnings (within budget) |
| 🟢 LOW | incidents.ts oversized (799 LOC) |
