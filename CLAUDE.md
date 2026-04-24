# NFA Alerts - Project Context

## Project Overview

National Fire Alerts (NFA) - Emergency response coordination platform connecting supervisors (Supes) w/ field responders (Chasers). Real-time incident mgmt, location tracking, communication for orgs like Miami-Dade Fire Rescue.

**Tech Stack:** Next.js 16 web app (NOT React Native)

## Architecture

### Framework & Core

- Next.js 16.0.1 App Router
- React 19.2.0
- TypeScript 5
- Server Actions + Server Components

### Backend & Data

- Firebase: Firestore, Auth, Storage
- Firebase Admin SDK for server-side operations
- TanStack Query 5.90: Server state mgmt

### UI & Validation

- Tailwind CSS 4 (mobile-first)
- shadcn/ui components (Radix UI primitives)
- Phosphor Icons (use `Icon` suffix, e.g., `CaretLeftIcon` not `CaretLeft`) + Lucide Icons
- React Hook Form + Zod
- Sonner (toasts), date-fns

### Maps & Location

- @googlemaps/js-api-loader
- geofire-common

## File Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Public: /login, /signup
│   ├── (dashboard)/         # Protected routes
│   │   ├── incidents/       # Incident list + details
│   │   ├── chat/            # Messaging
│   │   ├── chasers/         # Chaser management (supes)
│   │   ├── favorites/       # Bookmarks, favorites
│   │   ├── notifications/   # Push notifications
│   │   ├── profile/         # User profile
│   │   ├── route/           # Route planner
│   │   └── admin/           # Admin pages
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Shell, Header, PageContent, PageTabs
│   ├── auth/                # Protected wrapper
│   └── incidents/           # Incident-specific components
├── contexts/                # Auth context
├── hooks/                   # Custom hooks
├── services/                # Firebase service functions
├── lib/
│   ├── firebase.ts          # Firebase client
│   ├── firebase-admin.ts    # Firebase Admin SDK
│   └── db.ts                # Type definitions
└── service-account.json     # Firebase credentials (gitignored)
```

## Implementation Status

### ✅ Completed

- Firebase Auth (email/password + Google OAuth)
- Multi-step signup flow (6 steps)
- Profile photo + signature upload
- Incident CRUD operations
- Real-time incident subscriptions
- Incident filters (type, alarm, distance, etc.)
- Favorites, bookmarks, hide, mute
- Chat system w/ real-time messaging
- Unread message badges
- Push notifications (web push)
- Notification center
- Admin user management
- Admin locations management
- Chaser management (list view)
- Route planner (nearest-neighbor algorithm)
- PWA install prompt
- Responsive layout w/ floating nav
- Page tabs component
- Document signing
- Activity logging

### 🔄 Partial

- Google Maps integration (loader ready, map views pending)
- Location tracking (UI ready, background tracking pending)

### ❌ Not Implemented

- Map view for incidents
- Live chaser location on map
- Weather integration
- Offline support
- Dark mode

## Coding Rules

### Type Safety

1. Avoid type assertions (`as`, `satisfies`) when possible
2. Zod schemas are source of truth → `z.infer<typeof schema>`
3. Define types at boundaries (inputs/outputs)
4. Use utility types (`Pick`, `Omit`, `Partial`)

### Code Quality

1. No comments unless absolutely necessary
2. Remove dead code
3. Prefer direct implementations over abstractions
4. Keep code minimal - only what's needed

### Patterns

#### Firebase Service Pattern

```typescript
export async function getIncident(id: string) {
  const ref = doc(db, "incidents", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { _id: snap.id, ...snap.data() } as Incident & { _id: string };
}
```

#### Auth Context Pattern

```typescript
const { user, profile, loading } = useAuthContext();
if (loading) return <Skeleton />;
if (!user) redirect("/login");
```

#### Layout Pattern

```typescript
<Header title="Page Title" back actions={<Button />} />
<PageContent className="p-4">
  {content}
</PageContent>
<PageTabs>
  <PageTab active={tab === "a"} onClick={() => setTab("a")}>Tab A</PageTab>
</PageTabs>
```

## Environment Variables

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Other
OPENAI_API_KEY=
WEBHOOK_AUTH_TOKEN=
SITE_URL=
```

Firebase Admin SDK uses `service-account.json` file (gitignored).

## Firestore Collections

```
profiles         # User profiles
incidents        # Incident records
  └── notes      # Subcollection
  └── documents  # Subcollection
  └── activities # Subcollection
  └── signedDocuments # Subcollection
threads          # Chat threads
messages         # Chat messages
userIncidents    # User-incident relations (favorites, bookmarks, etc.)
notifications    # Push notifications
counters         # Auto-increment counters
```

## User Roles

- **Chaser**: View/respond to incidents, chat w/ supes
- **Supe**: All chaser + manage chasers, view all chats
- **Admin**: All supe + user management, system config

## Key Routes

- `/incidents` - Incident list w/ filters
- `/incidents/[id]` - Incident details (tabs: details, homeowner, docs, sign)
- `/route` - Route planner for responded incidents
- `/chat` - Messaging (tabs: chasers, supes)
- `/favorites` - Favorites/bookmarks (tabs: favorite, bookmarks, responded, notes)
- `/notifications` - Notification center
- `/profile` - User profile (tabs: information, activity)
- `/chasers` - Chaser list (supes only)
- `/admin/users` - User management (admin only)
- `/admin/locations` - Location management (admin only)
