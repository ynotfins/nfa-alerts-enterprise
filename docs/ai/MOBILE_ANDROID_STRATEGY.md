# Mobile & Android Strategy

**Generated**: 2026-04-23  
**Source**: AGENT Bootstrap — Context7 docs (Next.js PWA guide, Capacitor docs) + existing repo artifacts  
**Decision status**: RESEARCH ONLY — no platform switch decided this session

---

## Current State

### What exists in the repo today

| Artifact | Status | Notes |
|----------|--------|-------|
| `public/manifest.json` | ✅ Present | Standalone PWA, portrait orientation |
| `public/sw.js` | ✅ Present | PWA service worker (cache-first) |
| `public/firebase-messaging-sw.js` | ✅ Present | FCM background push service worker |
| `public/android.apk` | ✅ Present (git-tracked) | Pre-built APK committed to git |
| `twa-manifest.json` | ✅ Present | Trusted Web Activity (Play Store) manifest |
| PWA metadata in `app/layout.tsx` | ✅ Present | apple-mobile-web-app-capable, icon-192 |
| `next.config.ts` | ⚠ Minimal | No PWA headers, no SW build pipeline |

### Current delivery approach
- **Primary**: Install PWA from browser (Add to Home Screen)
- **Android**: TWA (Trusted Web Activity) via `twa-manifest.json` and pre-built `android.apk`
- **iOS**: Safari PWA (add to home screen)

---

## Next.js PWA Guidance (from Context7 — Next.js official docs, 2026)

### Recommended manifest approach
Next.js App Router supports a native `manifest.ts` in the `app/` directory (Route Handler pattern) for dynamic manifests. The current static `public/manifest.json` is valid and functional but the official recommendation is `app/manifest.ts`:

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NFA Alerts - Emergency Response Platform',
    short_name: 'NFA Alerts',
    start_url: '/',
    display: 'standalone',
    // ...
  }
}
```

**Current repo uses**: `public/manifest.json` (static). Works but less flexible for dynamic theming.

### Recommended service worker security headers
Official Next.js PWA guide recommends explicit security headers in `next.config.ts` for service workers:

```javascript
// next.config.ts
async headers() {
  return [
    { source: '/sw.js', headers: [
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
    ]},
  ]
}
```

**Current repo**: No explicit SW headers in `next.config.ts`. Risk: browser may cache a stale service worker.

### Dual service worker concern
The current app registers both `/sw.js` and `/firebase-messaging-sw.js`. The official guide uses a single service worker. Firebase's own guidance supports a separate messaging service worker, so the dual pattern is intentional — but the SW scope and cache-control headers should be verified to avoid conflicts.

---

## Capacitor Android Guidance (from Context7 — Capacitor official docs, 2026)

### What Capacitor provides over TWA
| Feature | TWA | Capacitor |
|---------|-----|-----------|
| Play Store distribution | ✅ | ✅ |
| Native API access | Limited | Full (camera, push, file, biometric) |
| FCM push | Via PWA | Via native plugin |
| Deep links | ✅ | ✅ |
| Offline support | Via SW | Via native + SW |
| Build complexity | Low | Medium |
| Live reload dev | No | Yes (`npx cap run android`) |

### Capacitor workflow (if adopted)
```bash
# One-time setup
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android

# Per-change workflow
pnpm build                # Build Next.js app
npx cap copy android      # Copy build to android/
npx cap sync              # Sync + update native deps
npx cap run android       # Run on device/emulator
```

### Key consideration for FCM + Capacitor
If adopting Capacitor, the `@capacitor-community/fcm` plugin or `@capacitor/push-notifications` replaces the web FCM service worker approach. The `firebase-messaging-sw.js` would no longer be needed for the native path.

---

## Options Analysis

### Option A: Keep TWA (current approach)
- **Pros**: Already working, minimal build complexity, no native code
- **Cons**: No native API access, limited offline, weak iOS experience
- **Suitability**: Good for simple emergency alert consumption
- **Next step if chosen**: Add SW security headers to `next.config.ts`; migrate `public/manifest.json` to `app/manifest.ts` for dynamic theming per PRODUCT_MODEL.md theme presets

### Option B: Migrate to Capacitor
- **Pros**: Full native APIs, better FCM, better offline, better iOS experience
- **Cons**: Build complexity, need Android Studio, separate build pipeline
- **Suitability**: Better for geolocation, voice messages, background location
- **Next step if chosen**: `pnpm add @capacitor/core @capacitor/cli @capacitor/android`

### Option C: Hybrid (Capacitor for Android, TWA for now, then iOS)
- **Pros**: Incremental migration
- **Cons**: More paths to maintain

---

## Recommendation (Research — Not a PLAN Decision)

**The current TWA approach works.** For the near-term, the risk-to-reward of a Capacitor migration is not justified while RISK-001 (service account exposure), RISK-003 (no rate limiting), and RISK-008 (near-zero test coverage) remain open.

**Minimum PWA improvements to request from PLAN**:
1. Add `Cache-Control: no-cache` headers for `/sw.js` and `/firebase-messaging-sw.js` in `next.config.ts`
2. Migrate `public/manifest.json` to `app/manifest.ts` to enable dynamic theming (PRODUCT_MODEL.md requirement)
3. Investigate consolidating dual service workers or clearly document their scope boundaries
4. Remove `public/android.apk` from git tracking (binary in git is expensive)

**Capacitor migration**: Defer to PLAN. Requires separate AGENT session with dedicated scope.

---

## Evidence Links

- Next.js PWA guide: https://nextjs.org/docs/app/guides/progressive-web-apps
- Capacitor Android docs: https://capacitorjs.com/docs/android
- Capacitor workflow: https://capacitorjs.com/docs/basics/workflow
- Current manifest: `D:/github/nfa-alerts-v2/nfa-alert/public/manifest.json`
- Current TWA manifest: `D:/github/nfa-alerts-v2/nfa-alert/twa-manifest.json`
