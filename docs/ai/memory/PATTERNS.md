# Patterns — NFA Alerts

**Generated**: 2026-04-23  
**Purpose**: Recurring implementation patterns in this codebase.

---

## PAT-001: Real-time data — Firestore onSnapshot pattern

All real-time subscriptions follow this pattern:
```typescript
// In a service file:
export function subscribeToX(id: string, callback: (data: X) => void): Unsubscribe {
  return onSnapshot(doc(db, "collection", id), (snap) => {
    callback(snap.data() as X)
  })
}

// In a hook:
useEffect(() => {
  const unsub = subscribeToX(id, setData)
  return unsub  // cleanup
}, [id])
```

---

## PAT-002: Service function return pattern

Services return result objects, not throws (with some inconsistency — see RISK_REGISTER.md RISK-009):
```typescript
// Preferred pattern:
return { success: true, id: docRef.id }
return { success: false, error: "Description" }
```

---

## PAT-003: Route group protection

All protected routes are in `(dashboard)/` group, wrapped by `Protected` component which checks `AuthContext`. Public routes are in `(auth)/` group.

---

## PAT-004: Server Action pattern for notifications

Notifications are dispatched via `fetch("/api/notifications/send", {...})` from the client service layer (not Server Actions). Server Actions are used for change-requests.

---

## PAT-005: Admin SDK for all server-side writes

All server-side Firestore operations (webhook handler, API routes) use Firebase Admin SDK (`firebase-admin.ts`), never the client SDK. Client SDK is browser-only.

---

## PAT-006: Type naming convention

Firestore types defined in `src/lib/db.ts` (runtime). Validation schemas in `src/schemas/*.ts` (Zod). Inconsistency: types should be derived from schemas but currently duplicated. See RISK_REGISTER.md RISK-010.

---

## PAT-008: Rate limiting — in-memory sliding window in proxy.ts

In-memory sliding window rate limiter using a module-level `Map` in `src/proxy.ts`.

```typescript
// Store: composite key (pathname:ip) -> request timestamps
const rateLimitStore = new Map<string, number[]>();

// Config: pathname -> { limit, windowMs }
const RATE_LIMITS = {
  "/api/webhook": { limit: 10, windowMs: 60_000 },
  "/api/notifications/send": { limit: 20, windowMs: 60_000 },
};

function isRateLimited(key, limit, windowMs): boolean {
  const recent = (rateLimitStore.get(key) ?? []).filter(t => Date.now() - t < windowMs);
  if (recent.length >= limit) { rateLimitStore.set(key, recent); return true; }
  recent.push(Date.now());
  rateLimitStore.set(key, recent);
  return false;
}
```

- **Scope**: Per-replica only (module state, not shared across Vercel instances)
- **Memory**: Each key holds at most `limit` timestamps — naturally bounded
- **IP key**: `pathname:ip` — namespaced per route, supports per-IP accounting
- **429 body**: `{ error: "rate_limit_exceeded" }`
- **Add a new route**: Add entry to `RATE_LIMITS` and ensure it's covered by `config.matcher`

---

## PAT-007: Component colocating

Domain-specific client components are colocated with their page:
```
incidents/[id]/page.tsx          # Server component (RSC)
incidents/[id]/incident-detail-client.tsx  # Client component
```

Page = server, *-client.tsx = client. This pattern is consistent throughout the app.
