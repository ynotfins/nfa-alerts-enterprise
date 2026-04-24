# Firebase Migration - Simplification Suggestions

## Current Complexity (Convex Pattern)

```
useQuery(api.x.y) → returns reactive data
useMutation(api.x.y) → returns function
usePreloadedQuery() → SSR hydration
```

Requires: hooks everywhere, context providers, preloading on server pages

## Simplified Firebase Approach

### 1. Direct Firestore Calls (No Custom Hooks)

Instead of wrapping everything in hooks, use Firestore directly in components:

```typescript
// OLD - Multiple layers
const { incidents, loading } = useIncidents();

// NEW - Direct, simple
const [incidents, setIncidents] = useState([]);
useEffect(() => {
  return onSnapshot(collection(db, "incidents"), (snap) => {
    setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}, []);
```

**Benefit:** No hook abstraction layer, direct control, easier debugging.

---

### 2. Server Components + Server Actions (Next.js 15)

Skip client-side subscriptions where real-time isn't needed:

```typescript
// app/incidents/page.tsx (Server Component)
async function IncidentsPage() {
  const incidents = await getDocs(collection(adminDb, "incidents"));
  return <IncidentsList data={incidents.docs.map((d) => d.data())} />;
}
```

**Benefit:** No loading states, faster initial render, SEO-friendly.

---

### 3. Server Actions for Mutations

```typescript
// actions/incidents.ts
"use server";

export async function respondToIncident(incidentId: string) {
  const session = await getServerSession();
  await adminDb
    .collection("incidents")
    .doc(incidentId)
    .update({
      responderIds: FieldValue.arrayUnion(session.user.id),
    });
  revalidatePath("/incidents");
}

// Component usage
<form action={respondToIncident.bind(null, incidentId)}>
  <button>Respond</button>
</form>;
```

**Benefit:** No client mutations, automatic revalidation, simpler mental model.

---

### 4. SWR/React Query Instead of Custom Hooks

```typescript
// Use SWR for data fetching with caching
const { data: incidents } = useSWR("incidents", () =>
  getDocs(collection(db, "incidents")).then((s) => s.docs.map((d) => d.data()))
);
```

**Benefit:** Built-in caching, deduplication, revalidation.

---

### 5. Simplified Auth Pattern

```typescript
// Single auth check function
export async function requireAuth() {
  const user = auth.currentUser;
  if (!user) redirect("/login");
  const profile = await getDoc(doc(db, "profiles", user.uid));
  if (!profile.exists()) redirect("/signup/profile");
  return { user, profile: profile.data() };
}

// Usage in any page
export default async function DashboardPage() {
  const { profile } = await requireAuth();
  // ...
}
```

---

### 6. Remove Typesaurus (Optional)

Typesaurus adds complexity. Plain Firestore + TypeScript interfaces is simpler:

```typescript
// types.ts
interface Profile {
  userId: string;
  email: string;
  role: "chaser" | "supe" | "admin";
  // ...
}

// Usage
const profile = doc.data() as Profile;
```

**Benefit:** No extra dependency, direct Firestore API, easier debugging.

---

### 7. Consolidate Services → Single File

Instead of 5 service files, one `db.ts` with namespaced exports:

```typescript
// lib/db.ts
export const profiles = {
  get: (id: string) => getDoc(doc(db, "profiles", id)),
  update: (id: string, data: Partial<Profile>) =>
    updateDoc(doc(db, "profiles", id), data),
  subscribe: (id: string, cb: (p: Profile) => void) =>
    onSnapshot(doc(db, "profiles", id), cb),
};

export const incidents = {
  list: () =>
    getDocs(query(collection(db, "incidents"), orderBy("createdAt", "desc"))),
  get: (id: string) => getDoc(doc(db, "incidents", id)),
  respond: (id: string) =>
    updateDoc(doc(db, "incidents", id), {
      responderIds: arrayUnion(auth.currentUser!.uid),
    }),
};
```

---

## Recommended Approach

| Feature         | Approach                           |
| --------------- | ---------------------------------- |
| Incident list   | Server Component + revalidate      |
| Incident detail | Real-time subscription (client)    |
| Chat messages   | Real-time subscription (client)    |
| Profile updates | Server Action                      |
| File uploads    | Client-side Firebase Storage       |
| Auth            | Server-side check + client context |

---

## Migration Simplification Plan

1. **Keep real-time only where needed:** Chat, presence, active incident
2. **Use Server Components:** Lists, profiles, admin pages
3. **Use Server Actions:** All mutations (respond, update, delete)
4. **Remove:** Custom hooks layer, Typesaurus, preloading complexity
5. **Single db.ts:** All Firestore operations in one place

---

## Questions to Decide

1. Do we need real-time for incident list or can we use polling/revalidation?
2. Should chat be the only real-time feature?
3. Use Server Actions or keep client mutations?
4. Keep Typesaurus or use plain TypeScript?
