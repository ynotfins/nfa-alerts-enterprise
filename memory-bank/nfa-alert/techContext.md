# Tech Context

## Stack Overview

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.0.1 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.0 |
| Database | Firebase Firestore | - |
| Auth | Firebase Auth | - |
| Storage | Firebase Storage | - |
| State | TanStack Query | 5.90 |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (Radix) | 56 components |
| Forms | React Hook Form + Zod | 7.66 / 4.1 |
| Icons | Phosphor + Lucide | - |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public routes (login, signup)
│   ├── (dashboard)/       # Protected routes
│   └── api/               # API routes (webhook, admin)
├── components/
│   ├── ui/                # 56 shadcn/ui components
│   ├── layout/            # Shell, Header, PageContent
│   └── incidents/         # Domain components
├── contexts/              # Auth, Profile contexts
├── hooks/                 # Custom React hooks
├── services/              # Firebase service functions
├── schemas/               # Zod validation schemas
├── lib/
│   ├── firebase.ts        # Client SDK
│   ├── firebase-admin.ts  # Admin SDK
│   └── db.ts              # Type definitions
└── types/                 # TypeScript types
```

## Environment Variables

```bash
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
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=

# Other
OPENAI_API_KEY=
WEBHOOK_AUTH_TOKEN=
SITE_URL=
```

## Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (localhost:3000) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check |
| `pnpm test` | Run Vitest tests |

## Key Dependencies

### Runtime
- `firebase` / `firebase-admin` - Database, auth, storage
- `@tanstack/react-query` - Server state management
- `react-hook-form` + `zod` - Form handling
- `sonner` - Toast notifications
- `date-fns` - Date formatting
- `@googlemaps/js-api-loader` - Maps integration
- `web-push` - Push notifications

### UI
- `tailwindcss` - Utility CSS
- `@radix-ui/*` - Headless components
- `@phosphor-icons/react` - Icon set
- `lucide-react` - Additional icons
- `framer-motion` - Animations
- `recharts` - Charts
- `react-signature-canvas` - Signature capture

## Firestore Collections

```
profiles              # User profiles
incidents             # Incident records
  └── notes           # Subcollection
  └── documents       # Subcollection
  └── activities      # Subcollection
  └── signedDocuments # Subcollection
threads               # Chat threads
messages              # Chat messages
userIncidents         # Favorites/bookmarks/hidden/muted
notifications         # Push notifications
counters              # Auto-increment counters
```

## External Integrations

| Service | Purpose |
|---------|---------|
| Google Maps | Geocoding, directions, map display |
| OpenAI | Webhook notification parsing |
| Web Push | Browser push notifications |
| Weather.gov | Weather conditions (planned) |


