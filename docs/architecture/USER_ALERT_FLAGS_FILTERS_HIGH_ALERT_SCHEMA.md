# User Alert Flags, Filters, and High Alert Schema

Last updated: 2026-05-19

## Current State Summary

### Production Firestore Collections

**Supported:**
- `userIncidents` - Favorite, bookmark, hide, mute, view flags per user/incident
- `profiles` - User profile with role, push token, location tracking
- `incidents` - Main incident documents

**NOT Supported (DataStore-only):**
- Home filter preferences (alert types, distance, updates, keyword, departments)
- High Alert configuration
- Seen/read state per incident
- Silent alert flags
- Hidden alert restoration state

### Android Current State

**DataStore-only (NOT synced to Firestore):**
1. `favoriteAlertKeys` - Set<String> of incident keys marked favorite
2. `bookmarkAlertKeys` - Set<String> of incident keys marked bookmark
3. `silentAlertKeys` - Set<String> of incident keys muted
4. `hiddenAlertKeys` - Set<String> of incident keys hidden
5. `lastSeenByAlertKey` - Map<String, Long> of read timestamps
6. Home filters:
   - Selected alert types
   - Distance filter option
   - Update filter option
   - Keyword query
   - Selected department codes
   - High Alert only toggle
7. High Alert configuration:
   - Enabled flag
   - Selected alert types
   - Selected keywords
   - Selected departments
   - Max distance miles
   - Min update count
   - Vibration enabled
   - Siren enabled (scaffold only)
   - Flashlight/strobe enabled (scaffold only)

**Already synced to Firestore:**
- Nothing. `userIncidents` collection exists but Android is NOT currently writing to it.

### Production Persistence Recommendation

## OPTION A: User-scoped subcollections (RECOMMENDED)

### Schema Design

```
profiles/{uid}/
  alertFlags/{alertId}
    - favorite: boolean
    - bookmark: boolean
    - silent: boolean
    - hidden: boolean
    - lastSeen: number (epoch millis)
    - createdAt: number
    - updatedAt: number

profiles/{uid}/
  filterGroups/{filterGroupId}
    - name: string
    - selectedAlertTypes: string[]
    - distanceMaxMiles: number?
    - updateMinCount: number?
    - keywordQuery: string
    - selectedDepartments: string[]
    - enabled: boolean
    - createdAt: number
    - updatedAt: number

profiles/{uid}/
  highAlertSettings/default
    - enabled: boolean
    - selectedAlertTypes: string[]
    - selectedKeywords: string[]
    - selectedDepartments: string[]
    - maxDistanceMiles: number?
    - minUpdateCount: number
    - vibrationEnabled: boolean
    - sirenEnabled: boolean
    - flashlightStrobeEnabled: boolean
    - createdAt: number
    - updatedAt: number
```

### Advantages
✅ Natural security boundary - rules enforce `isOwner(uid)`
✅ Simple queries - `profiles/{uid}/alertFlags` returns all user flags
✅ No composite index needed for user-scoped reads
✅ Clean user data deletion - delete `profiles/{uid}` deletes flags
✅ Scales per-user - flags don't grow unbounded in root collection
✅ Firestore UI navigation - grouped under user profile
✅ Backup/export - flags included in profile export

### Disadvantages
❌ Cross-user queries expensive - "which users favorited incident X?"
❌ Denormalized - same incident referenced in multiple user subtrees
❌ Migration complexity - existing `userIncidents` flat structure

## OPTION B: Flat root collections (Current userIncidents pattern)

### Schema Design

```
userIncidents/{docId}
  - odm_profileId: string
  - odm_incidentId: string
  - odm_action: "favorite" | "bookmark" | "hide" | "mute" | "view"
  - lastSeen: number?
  - createdAt: number

userFilterGroups/{docId}
  - profileId: string
  - name: string
  - selectedAlertTypes: string[]
  - distanceMaxMiles: number?
  - updateMinCount: number?
  - keywordQuery: string
  - selectedDepartments: string[]
  - enabled: boolean
  - createdAt: number
  - updatedAt: number

userHighAlertSettings/{profileId}
  - enabled: boolean
  - selectedAlertTypes: string[]
  - selectedKeywords: string[]
  - selectedDepartments: string[]
  - maxDistanceMiles: number?
  - minUpdateCount: number
  - vibrationEnabled: boolean
  - sirenEnabled: boolean
  - flashlightStrobeEnabled: boolean
  - createdAt: number
  - updatedAt: number
```

### Advantages
✅ Existing pattern - `userIncidents` already uses flat structure
✅ Cross-user analytics - "10 users favorited this incident"
✅ Firestore composite indexes already exist
✅ Easier migration - extend existing `userIncidents`

### Disadvantages
❌ Composite index required for `profileId` queries
❌ User deletion cleanup - must query/delete flags separately
❌ Unbounded root collection growth
❌ Security rules more complex - `resource.data.profileId == request.auth.uid`
❌ Backup/export - flags separate from profile

## Final Recommendation: OPTION A

**Rationale:**
1. **Security** - User subcollections have natural ownership boundary
2. **Scalability** - Flags scale per-user, not globally
3. **Simplicity** - No composite index for user-scoped reads
4. **Privacy** - User data deletion is atomic
5. **Product fit** - Cross-user analytics ("who favorited X?") NOT a current requirement

**Migration Path:**
1. Keep existing `userIncidents` collection for backward compatibility
2. Add new `profiles/{uid}/alertFlags/{alertId}` subcollection
3. Android writes to BOTH during transition
4. Android reads from subcollection first, falls back to `userIncidents`
5. Background job migrates `userIncidents` to subcollections
6. Remove `userIncidents` write path after migration complete

## Firestore Rules (Option A)

```javascript
match /profiles/{profileId}/alertFlags/{alertId} {
  allow read: if isOwner(profileId);
  allow create: if isOwner(profileId) && request.resource.data.keys().hasAll(['createdAt', 'updatedAt']);
  allow update: if isOwner(profileId) && !fieldChanged('createdAt');
  allow delete: if isOwner(profileId);
}

match /profiles/{profileId}/filterGroups/{filterGroupId} {
  allow read: if isOwner(profileId);
  allow create: if isOwner(profileId) && request.resource.data.keys().hasAll(['name', 'enabled', 'createdAt', 'updatedAt']);
  allow update: if isOwner(profileId) && !fieldChanged('createdAt');
  allow delete: if isOwner(profileId);
}

match /profiles/{profileId}/highAlertSettings/{settingsId} {
  allow read: if isOwner(profileId);
  allow write: if isOwner(profileId);
}
```

## Firestore Indexes (Option A)

**None required.** Subcollection queries under single user path don't need composite indexes.

Single-field indexes auto-created:
- `profiles/{uid}/alertFlags: [favorite, bookmark, silent, hidden, lastSeen, updatedAt]`
- `profiles/{uid}/filterGroups: [name, enabled, updatedAt]`
- `profiles/{uid}/highAlertSettings: [enabled, updatedAt]`

## Firestore Rules (Option B - if chosen)

```javascript
match /userAlertFlags/{docId} {
  allow read: if isAuthenticated() && resource.data.profileId == request.auth.uid;
  allow create: if isAuthenticated() && request.resource.data.profileId == request.auth.uid;
  allow update, delete: if isAuthenticated() && resource.data.profileId == request.auth.uid;
}

match /userFilterGroups/{docId} {
  allow read: if isAuthenticated() && resource.data.profileId == request.auth.uid;
  allow create: if isAuthenticated() && request.resource.data.profileId == request.auth.uid;
  allow update, delete: if isAuthenticated() && resource.data.profileId == request.auth.uid;
}

match /userHighAlertSettings/{profileId} {
  allow read: if isOwner(profileId);
  allow write: if isOwner(profileId);
}
```

## Firestore Indexes (Option B - if chosen)

```json
{
  "collectionGroup": "userAlertFlags",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "profileId", "order": "ASCENDING" },
    { "fieldPath": "incidentId", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "userAlertFlags",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "profileId", "order": "ASCENDING" },
    { "fieldPath": "favorite", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "userFilterGroups",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "profileId", "order": "ASCENDING" },
    { "fieldPath": "enabled", "order": "DESCENDING" }
  ]
}
```

## Android Implementation Notes

### Read State Key
Android currently uses `readStateKey` derived from:
- `incident.alertId` if non-null
- `incident.id` (Firestore document ID) as fallback

**Recommendation:** Continue using this pattern for local-first behavior.

### Sync Strategy
1. Write to Firestore on user action (favorite, bookmark, hide, mute)
2. Listen to Firestore subcollection for cross-device sync
3. Merge Firestore state with DataStore state
4. Use DataStore as write-ahead log during offline

### High Alert Settings
- Store in Firestore at `profiles/{uid}/highAlertSettings/default`
- Sync on settings change
- Use for cross-device High Alert configuration
- Notification matching remains client-side (Android cannot bypass OS restrictions)

### Filter Groups (Future)
- Not required for v1 Home implementation
- Design ready for multi-filter-group support
- Default filter group ID can be `default` or `home`

## Migration Checklist

- [ ] Create Firestore rules for Option A subcollections
- [ ] Android repository: Add `FirestoreUserFlagsRepository`
- [ ] Android: Write favorite/bookmark/hide/mute to Firestore
- [ ] Android: Listen to `profiles/{uid}/alertFlags`
- [ ] Android: Merge Firestore flags with DataStore flags
- [ ] Android: Write High Alert settings to Firestore
- [ ] Backend: No changes required (read-only for admin analytics)
- [ ] Test: Verify cross-device sync
- [ ] Test: Verify offline write-ahead behavior
- [ ] Deploy Firestore rules
- [ ] Monitor: Read/write metrics for `alertFlags` subcollection
