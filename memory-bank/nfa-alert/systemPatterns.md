# System Patterns

## Architecture

### Tech Stack
- **Framework:** Next.js 16.0.1 App Router
- **Language:** TypeScript 5, React 19.2.0
- **Database:** Firebase Firestore
- **Auth:** Firebase Auth
- **Storage:** Firebase Storage
- **State:** TanStack Query 5.90
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Forms:** React Hook Form + Zod
- **Icons:** Phosphor Icons (use `Icon` suffix) + Lucide
- **Maps:** Google Maps JavaScript API with Map ID support

### Route Groups
- `(auth)` - Public routes: login, signup steps
- `(dashboard)` - Protected routes: incidents, chat, profile, admin

## Coding Patterns

### Firebase Service Pattern

```typescript
export async function getIncident(id: string) {
  const ref = doc(db, "incidents", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { _id: snap.id, ...snap.data() } as Incident & { _id: string };
}
```

### Collection Group Query Pattern (Avoid N+1)

```typescript
// ❌ BAD: N+1 query - fetches all incidents then queries notes for each
export async function getIncidentsWithNotes() {
  const incidents = await getAllIncidents();
  const results = await Promise.all(
    incidents.map(async (inc) => {
      const notes = await getDocs(collection(db, `incidents/${inc.id}/notes`));
      return notes.empty ? null : inc;
    })
  );
  return results.filter(Boolean);
}

// ✅ GOOD: Collection group query - single query across all notes
export async function getIncidentsWithNotes() {
  const user = auth.currentUser;
  if (!user) return [];

  const notesQuery = query(
    collectionGroup(db, "notes"),
    where("authorId", "==", user.uid)
  );
  const notesSnap = await getDocs(notesQuery);

  const incidentIds = new Set<string>();
  notesSnap.docs.forEach((noteDoc) => {
    const pathSegments = noteDoc.ref.path.split("/");
    const incidentIdIndex = pathSegments.indexOf("incidents") + 1;
    if (incidentIdIndex > 0) {
      incidentIds.add(pathSegments[incidentIdIndex]);
    }
  });

  const incidents = await Promise.all(
    Array.from(incidentIds).map(getIncident)
  );
  return incidents.filter(Boolean);
}
```

### Auth Context Pattern

```typescript
const { user, profile, loading } = useAuthContext();
if (loading) return <Skeleton />;
if (!user) redirect("/login");
```

### Layout Pattern

```typescript
<Header title="Page Title" back actions={<Button />} />
<PageContent className="p-4">
  {content}
</PageContent>
<PageTabs>
  <PageTab active={tab === "a"} onClick={() => setTab("a")}>Tab A</PageTab>
</PageTabs>
```

### Form Pattern (React Hook Form + Zod)

```typescript
const schema = z.object({ name: z.string().min(1) });
type FormData = z.infer<typeof schema>;

const form = useForm<FormData>({ resolver: zodResolver(schema) });

const onSubmit = async (data: FormData) => {
  try {
    await saveData(data);
    toast.success("Saved!");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save";
    toast.error(message);
  }
};
```

### TanStack Query Pattern

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["incidents", filters],
  queryFn: () => getIncidents(filters),
});

const mutation = useMutation({
  mutationFn: createIncident,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] }),
});
```

### Error Handling Pattern

```typescript
// ✅ GOOD: Typed error with proper handling
try {
  await riskyOperation();
} catch (error: unknown) {
  console.error("Operation failed:", error);
  const message = error instanceof Error ? error.message : "Unknown error";
  toast.error(message);
}

// ❌ BAD: Empty catch block or missing error parameter
try {
  await riskyOperation();
} catch {
  toast.error("Failed");
}
```

## Type Safety Rules

1. **NO type assertions** - Avoid `as`, `satisfies`, `<Type>`
2. **Zod inference** - `z.infer<typeof schema>`
3. **Boundary types** - Define at inputs/outputs only
4. **Utility types** - Use `Pick`, `Omit`, `Partial`, `ReturnType`
5. **Error handling** - Always type catch parameters as `unknown`
6. **NO any types** - Use specific interfaces or `unknown`

## Code Quality Rules

1. **NO comments** - Self-documenting code
2. **NO dead code** - Remove unused imports, variables, functions
3. **Minimal abstractions** - Direct implementations preferred
4. **DRY principle** - Reuse existing code
5. **JSX entities** - Escape special characters (`&apos;`, `&quot;`)
6. **Catch blocks** - Always include error parameter: `catch (error: unknown)`

## Firestore Collections

```
profiles           # User profiles
incidents          # Incident records
  └── notes        # Subcollection (collection group indexed)
  └── documents    # Subcollection
  └── activities   # Subcollection
  └── signedDocuments
threads            # Chat threads
messages           # Chat messages
userIncidents      # User-incident relations
notifications      # Push notifications
counters           # Auto-increment counters
```

### Collection Group Indexes

For querying across all subcollections with the same name:

```json
// firestore.indexes.json
{
  "fieldOverrides": [
    {
      "collectionGroup": "notes",
      "fieldPath": "authorId",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION_GROUP" }
      ]
    }
  ]
}
```

### Security Rules for Collection Groups

```javascript
// firestore.rules
match /{path=**}/notes/{noteId} {
  allow read: if isAuthenticated();
}
```

## User Roles

| Role | Access |
|------|--------|
| Chaser | View/respond to incidents, chat with supes |
| Supe | All chaser + manage chasers, view all chats |
| Admin | All supe + user management, system config |

## File Upload Pattern

```typescript
// 1. Upload to Firebase Storage
const storageRef = ref(storage, `users/${uid}/profile.jpg`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);

// 2. Save URL to Firestore
await updateDoc(doc(db, "profiles", uid), { photoUrl: url });
```

## Error Handling

```typescript
// API routes - HTTP status codes
return NextResponse.json({ error: "Not found" }, { status: 404 });

// Components - Toast notifications
try {
  await action();
  toast.success("Done!");
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Failed";
  toast.error(message);
}

// Forms - React Hook Form errors
{errors.field && <span className="text-red-500">{errors.field.message}</span>}
```

## Google Maps Integration

```typescript
// Load API with Map ID support
const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

// Warn if not configured
useEffect(() => {
  if (!GOOGLE_MAP_ID) {
    console.warn("NEXT_PUBLIC_GOOGLE_MAP_ID not set; Advanced Markers disabled");
  }
}, []);

// Pass to Map component
<Map mapId={GOOGLE_MAP_ID} /* other props */ />
```

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest tests |
| `firebase deploy --only firestore:rules` | Deploy security rules |
| `firebase deploy --only firestore:indexes` | Deploy indexes |

## Performance Best Practices

1. **Avoid N+1 queries** - Use collection group queries or batch reads
2. **Index strategically** - Add field overrides for collection groups
3. **Load states** - Always show loading UI during async operations
4. **Error boundaries** - Catch and display errors gracefully
5. **Optimize re-renders** - Use `useMemo`, `useCallback` when needed (but sparingly)
