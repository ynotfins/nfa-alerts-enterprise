# Active Context

## Current Focus

Firebase app fully operational and production-ready. Recent hardening pass completed on `dev-tony` branch merged to main.

## Recent Changes (Dec 1, 2025)

### Performance Fixes
- ✅ Fixed favorites page freeze caused by N+1 query in `getIncidentsWithNotes()`
- ✅ Refactored to use Firestore collection group query on `notes` subcollection
- ✅ Added field override in `firestore.indexes.json` for collection group support
- ✅ Deployed updated Firestore security rules to `nfa-alerts-v2` project

### Code Quality Improvements
- ✅ Fixed 30+ linting warnings across codebase
  - Removed unused imports and variables
  - Fixed unescaped JSX entities
  - Replaced `any` types with proper interfaces
  - Fixed `catch` blocks missing error parameters
- ✅ Fixed TypeScript build errors
  - Added missing `Incident` type import
  - Fixed `PDFContent` interface type definitions
  - Restored accidentally removed state variables

### Google Maps Integration
- ✅ Added Map ID support for Advanced Markers
- ✅ Environment variable `NEXT_PUBLIC_GOOGLE_MAP_ID` ready to be configured
- ✅ Graceful fallback with warning if Map ID not set

### Safety & Deployment
- ✅ Created safety snapshot: branch `dev-tony-safe-1` + tag `safety/dev-tony-initial-hardening`
- ✅ All changes merged to `main` and pushed to GitHub (commit `1e330a5`)
- ✅ Build passes successfully

## Active Issues (from tasks.md)

1. Supe cannot toggle Location Off (keep Chaser Lock enforced)
2. Admin panel needs design/UX fixes
3. Put responder section higher in UI
4. Favorites tab rename: "Notes" (remove "just")
5. Home screen fade animation issue (should be text only, not whole screen)
6. Add Notifications menu/page enhancements

## Environment

- **Dev server:** `pnpm dev` → http://localhost:3000
- **Firebase project:** `nfa-alerts-v2` (production)
- **Database:** Firestore with collection group indexes
- **Storage:** Firebase Storage
- **Branch:** `main`
- **Last commit:** `1e330a5` - TypeScript build fixes

## Next Steps

1. Deploy to Vercel (auto-deploy on push to main or manual `vercel --prod`)
2. Add `NEXT_PUBLIC_GOOGLE_MAP_ID` to Vercel environment variables
3. Test favorites page with real data (collection group query)
4. Test incident details page
5. Resume feature work on admin panel and location tracking

## Notes

- App uses Vercel for hosting (not Firebase Hosting)
- Firebase only used for backend services (Auth, Firestore, Storage)
- Build output ready in `.next/` directory
