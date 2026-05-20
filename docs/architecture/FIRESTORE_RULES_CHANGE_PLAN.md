# Firestore Rules Change Plan

Last updated: 2026-05-19

## Current Rules Summary

### Access Model Overview

**Current security boundary:**
- ✅ Authentication required for all collections
- ⚠️ Broad authenticated read access to profiles, incidents, notes, activities
- ✅ Owner-scoped writes for user data
- ✅ Role-based writes for incidents (supe/admin can update, responders limited)
- ❌ No schema validation
- ❌ No PII access restrictions

### Current Rules Breakdown

#### `profiles/{profileId}`
```javascript
allow read: if isAuthenticated();
allow create: if isOwner(profileId);
allow update: if isAdmin() || (isOwner(profileId) && !isChangingRestrictedProfileFields());
allow delete: if isAdmin();
```

**Risk:** Any authenticated user can read all profile emails, phones, addresses, homeowner data.

#### `incidents/{incidentId}`
```javascript
allow read: if isAuthenticated();
allow create: if isSupe();
allow update: if isSupe() || (isAuthenticated() && isResponder() && !isChangingSupeOnlyIncidentFields());
allow delete: if isAdmin();
```

**Risk:** Any authenticated user can read all incident homeowner data, addresses, descriptions.

#### `incidents/{incidentId}/notes/{noteId}`
```javascript
allow read: if isAuthenticated();
allow create: if isAuthenticated();
allow update, delete: if isAuthenticated() && resource.data.authorId == request.auth.uid;
```

**Risk:** Any authenticated user can read all notes across all incidents.

#### `incidents/{incidentId}/activities/{activityId}`
```javascript
allow read: if isAuthenticated();
allow create: if isAuthenticated();
```

**Risk:** Any authenticated user can read all activities. Any authenticated user can CREATE activities (should be restricted).

#### `userIncidents/{docId}`
```javascript
allow read: if isAuthenticated() && resource.data.odm_profileId == request.auth.uid;
allow create: if isAuthenticated() && request.resource.data.odm_profileId == request.auth.uid;
allow update, delete: if isAuthenticated() && resource.data.odm_profileId == request.auth.uid;
```

**Security:** ✅ Properly scoped to owner.

#### `appNotifications/{notifId}`
```javascript
allow read: if isAuthenticated() && resource.data.profileId == request.auth.uid;
allow create: if isAuthenticated();
allow update: if isAuthenticated() && resource.data.profileId == request.auth.uid;
allow delete: if isAuthenticated() && resource.data.profileId == request.auth.uid;
```

**Risk:** Any authenticated user can CREATE notifications for other users.

#### `webhookLogs/{logId}`
```javascript
allow read: if isAdmin();
allow write: if false;
```

**Security:** ✅ Properly restricted.

#### `counters/{counterId}`
```javascript
allow read: if isAuthenticated();
allow write: if false;
```

**Security:** ✅ Read-only for authenticated users, write blocked.

#### `threads/{threadId}` and `threads/{threadId}/messages/{messageId}`
```javascript
allow read: if isAuthenticated() && (
  request.auth.uid in resource.data.participants ||
  request.auth.uid in resource.data.chaserIds ||
  (resource.data.type == 'chaser_to_supes' && isSupe())
);
```

**Security:** ✅ Participant-scoped access.

#### `changeRequests/{requestId}`
```javascript
allow read: if isAuthenticated() && (resource.data.requesterId == request.auth.uid || isSupe());
allow create: if isAuthenticated();
allow update: if isSupe();
allow delete: if isAdmin();
```

**Security:** ✅ Properly scoped.

## Current Indexes Summary

### Existing Composite Indexes

1. **incidents(status ASC, createdAt DESC)**
   - Query: Active incidents ordered by time
   - Used by: Android Home feed `where status == "active" orderBy createdAt desc`

2. **incidents(alertId ASC, createdAt DESC)**
   - Query: Find existing incident by alertId
   - Used by: Webhook duplicate detection

3. **incidents(responderIds array-contains, status ASC, createdAt DESC)**
   - Query: Find incidents where user is responder
   - Used by: "My Responded Incidents" view

4. **userIncidents(odm_profileId ASC, odm_incidentId ASC, odm_action ASC)**
   - Query: Find specific user flag for specific incident
   - Used by: Details screen flag lookup

5. **userIncidents(odm_profileId ASC, odm_action ASC)**
   - Query: Find all user flags of specific action type
   - Used by: Favorites list, Bookmarks list

6. **appNotifications(profileId ASC, createdAt DESC)**
   - Query: User notification feed
   - Used by: Notification center

7. **threads(participants array-contains, lastMessageAt DESC)**
   - Query: User's threads ordered by last message
   - Used by: Chat list

8. **threads(type ASC, chaserIds array-contains)**
   - Query: Chaser-to-supes threads
   - Used by: Supe chat routing

9. **threads(type ASC, lastMessageAt DESC)**
   - Query: Threads by type ordered by time
   - Used by: Chat type filtering

10. **changeRequests(status ASC, createdAt DESC)**
    - Query: Change requests by status
    - Used by: Pending approvals view

11. **changeRequests(incidentId ASC, status ASC, createdAt DESC)**
    - Query: Change requests for specific incident
    - Used by: Incident detail change history

### Collection Group Overrides

1. **notes.authorId (COLLECTION_GROUP scope)**
   - Query: `collectionGroup('notes').where('authorId', '==', uid)`
   - Used by: "My Notes Across All Incidents" view

## Proposed Rules Changes

### Phase 1: Add User Subcollections (Immediate)

```javascript
// New subcollection rules for user alert flags
match /profiles/{profileId}/alertFlags/{alertId} {
  allow read: if isOwner(profileId);
  allow create: if isOwner(profileId) &&
    request.resource.data.keys().hasAll(['createdAt', 'updatedAt']) &&
    validateAlertFlag(request.resource.data);
  allow update: if isOwner(profileId) &&
    !fieldChanged('createdAt') &&
    validateAlertFlag(request.resource.data);
  allow delete: if isOwner(profileId);
}

function validateAlertFlag(data) {
  return data.keys().hasOnly(['favorite', 'bookmark', 'silent', 'hidden', 'lastSeen', 'createdAt', 'updatedAt']) &&
    (!data.keys().hasAny(['favorite']) || data.favorite is bool) &&
    (!data.keys().hasAny(['bookmark']) || data.bookmark is bool) &&
    (!data.keys().hasAny(['silent']) || data.silent is bool) &&
    (!data.keys().hasAny(['hidden']) || data.hidden is bool) &&
    (!data.keys().hasAny(['lastSeen']) || data.lastSeen is number) &&
    data.createdAt is number &&
    data.updatedAt is number;
}

// New subcollection rules for filter groups
match /profiles/{profileId}/filterGroups/{filterGroupId} {
  allow read: if isOwner(profileId);
  allow create: if isOwner(profileId) &&
    request.resource.data.keys().hasAll(['name', 'enabled', 'createdAt', 'updatedAt']) &&
    validateFilterGroup(request.resource.data);
  allow update: if isOwner(profileId) &&
    !fieldChanged('createdAt') &&
    validateFilterGroup(request.resource.data);
  allow delete: if isOwner(profileId);
}

function validateFilterGroup(data) {
  return data.keys().hasOnly([
    'name', 'selectedAlertTypes', 'distanceMaxMiles', 'updateMinCount',
    'keywordQuery', 'selectedDepartments', 'enabled', 'createdAt', 'updatedAt'
  ]) &&
    data.name is string &&
    data.name.size() > 0 &&
    data.name.size() <= 100 &&
    data.enabled is bool &&
    (!data.keys().hasAny(['selectedAlertTypes']) || data.selectedAlertTypes is list) &&
    (!data.keys().hasAny(['selectedDepartments']) || data.selectedDepartments is list) &&
    (!data.keys().hasAny(['distanceMaxMiles']) || data.distanceMaxMiles is number) &&
    (!data.keys().hasAny(['updateMinCount']) || data.updateMinCount is number) &&
    (!data.keys().hasAny(['keywordQuery']) || data.keywordQuery is string);
}

// New rules for high alert settings
match /profiles/{profileId}/highAlertSettings/{settingsId} {
  allow read: if isOwner(profileId);
  allow write: if isOwner(profileId) && validateHighAlertSettings(request.resource.data);
}

function validateHighAlertSettings(data) {
  return data.keys().hasOnly([
    'enabled', 'selectedAlertTypes', 'selectedKeywords', 'selectedDepartments',
    'maxDistanceMiles', 'minUpdateCount', 'vibrationEnabled', 'sirenEnabled',
    'flashlightStrobeEnabled', 'createdAt', 'updatedAt'
  ]) &&
    data.enabled is bool &&
    (!data.keys().hasAny(['selectedAlertTypes']) || data.selectedAlertTypes is list) &&
    (!data.keys().hasAny(['selectedKeywords']) || data.selectedKeywords is list) &&
    (!data.keys().hasAny(['selectedDepartments']) || data.selectedDepartments is list) &&
    (!data.keys().hasAny(['maxDistanceMiles']) || data.maxDistanceMiles is number) &&
    (!data.keys().hasAny(['minUpdateCount']) || data.minUpdateCount is number) &&
    (!data.keys().hasAny(['vibrationEnabled']) || data.vibrationEnabled is bool) &&
    (!data.keys().hasAny(['sirenEnabled']) || data.sirenEnabled is bool) &&
    (!data.keys().hasAny(['flashlightStrobeEnabled']) || data.flashlightStrobeEnabled is bool);
}
```

### Phase 2: Restrict PII Access (Pre-Production)

#### Restrict Profile Reads
```javascript
// Current: allow read: if isAuthenticated();
// Proposed:
match /profiles/{profileId} {
  allow read: if isOwner(profileId) || isSupe();
  allow create: if isOwner(profileId);
  allow update: if isAdmin() || (isOwner(profileId) && !isChangingRestrictedProfileFields());
  allow delete: if isAdmin();
}
```

**Impact:**
- Chasers can only read their own profile
- Supes/admins can read all profiles
- Breaks: Public profile views, responder lists

**Mitigation:**
- Add `profiles/{profileId}/public/{publicId}` subcollection with safe fields
- Public fields: name, firstName, lastName, avatarUrl, role, online, lastSeen
- Allow `read: if isAuthenticated()` for public subcollection

#### Restrict Incident Reads to Responders
```javascript
// Current: allow read: if isAuthenticated();
// Proposed:
match /incidents/{incidentId} {
  allow read: if isAuthenticated() && (
    isSupe() ||
    request.auth.uid in resource.data.responderIds ||
    isIncidentInUserArea(incidentId)
  );
  // ... rest unchanged
}

function isIncidentInUserArea(incidentId) {
  // Future: Check if incident is within user's geofence
  // For now: return true to allow all authenticated reads
  return true;
}
```

**Impact:**
- Short-term: No change (isIncidentInUserArea returns true)
- Long-term: Restrict incidents to assigned responders or geofenced users

#### Restrict Activity Writes
```javascript
// Current: allow create: if isAuthenticated();
// Proposed:
match /incidents/{incidentId}/activities/{activityId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && validateActivityWrite(request.resource.data);
  // Note: Updates/deletes not allowed - activities are immutable
}

function validateActivityWrite(data) {
  return data.keys().hasAll(['type', 'description', 'createdAt']) &&
    data.type is string &&
    data.description is string &&
    data.description.size() >= 5 &&
    data.description.size() <= 2000 &&
    data.createdAt is number &&
    (!data.keys().hasAny(['profileId']) || data.profileId == request.auth.uid);
}
```

#### Restrict Notification Creates
```javascript
// Current: allow create: if isAuthenticated();
// Proposed:
match /appNotifications/{notifId} {
  allow read: if isAuthenticated() && resource.data.profileId == request.auth.uid;
  allow create: if false;  // Server-only via Admin SDK
  allow update: if isAuthenticated() && resource.data.profileId == request.auth.uid;
  allow delete: if isAuthenticated() && resource.data.profileId == request.auth.uid;
}
```

**Impact:**
- Clients cannot create notifications for other users
- All notifications created by backend `/api/notifications/send`

### Phase 3: Add Schema Validation (Post-Production)

```javascript
match /incidents/{incidentId} {
  allow create: if isSupe() && validateIncidentCreate(request.resource.data);
  allow update: if (isSupe() || (isAuthenticated() && isResponder() && !isChangingSupeOnlyIncidentFields())) &&
    validateIncidentUpdate(request.resource.data);
  // ... rest unchanged
}

function validateIncidentCreate(data) {
  return data.keys().hasAll([
    'alertId', 'displayId', 'type', 'description', 'location',
    'status', 'responderIds', 'createdAt', 'updatedAt'
  ]) &&
    (data.alertId == null || data.alertId is string) &&
    data.displayId is string &&
    data.displayId.matches('^INC-[0-9]{6}$') &&
    data.type in ['fire', 'flood', 'storm', 'wind', 'hail', 'other'] &&
    data.description is string &&
    data.description.size() >= 10 &&
    validateLocation(data.location) &&
    data.status in ['active', 'closed'] &&
    data.responderIds is list &&
    data.createdAt is number &&
    data.updatedAt is number;
}

function validateLocation(location) {
  return location.keys().hasAll(['lat', 'lng', 'address', 'city', 'state']) &&
    location.lat is number &&
    location.lng is number &&
    location.lat >= -90 && location.lat <= 90 &&
    location.lng >= -180 && location.lng <= 180 &&
    location.address is string &&
    location.address.size() > 0 &&
    location.city is string &&
    location.city.size() > 0 &&
    location.state is string &&
    location.state.size() == 2;
}

function validateIncidentUpdate(data) {
  // Allow partial updates, validate only changed fields
  return (!data.keys().hasAny(['type']) || data.type in ['fire', 'flood', 'storm', 'wind', 'hail', 'other']) &&
    (!data.keys().hasAny(['status']) || data.status in ['active', 'closed']) &&
    (!data.keys().hasAny(['location']) || validateLocation(data.location)) &&
    (!data.keys().hasAny(['displayId']) || data.displayId.matches('^INC-[0-9]{6}$'));
}
```

## Proposed Index Changes

### New Indexes Required (Option A - User Subcollections)

**None required.** Subcollection queries under single user path use auto-created single-field indexes.

### New Indexes Required (Option B - Flat Collections)

If flat collections are chosen instead of subcollections:

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

### New Indexes for Future Features

**If geofencing is implemented:**
```json
{
  "collectionGroup": "profiles",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "geofencingEnabled", "order": "ASCENDING" },
    { "fieldPath": "locationTracking.lat", "order": "ASCENDING" },
    { "fieldPath": "locationTracking.lng", "order": "ASCENDING" }
  ]
}
```

**If commercial display ID is implemented:**
```json
{
  "collectionGroup": "incidents",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "commercialDisplayId", "order": "ASCENDING" }
  ]
}
```
*Note: Single-field index auto-created. Explicit declaration ensures uniqueness constraint visibility.*

## Migration Plan

### Stage 1: Add New Rules (Non-Breaking)
1. Deploy Phase 1 rules (user subcollections)
2. Android starts writing to subcollections
3. Android reads from subcollections, falls back to DataStore
4. Monitor: Write success rate, read latency
5. Duration: 2 weeks

### Stage 2: Backfill Data
1. Background job: Copy DataStore-equivalent data from web to Firestore
2. Copy existing `userIncidents` to new `profiles/{uid}/alertFlags`
3. Verify data integrity
4. Duration: 1 week

### Stage 3: Validate
1. Android verifies cross-device sync works
2. Test offline-online sync behavior
3. Test conflict resolution (Firestore timestamp wins)
4. Duration: 1 week

### Stage 4: Restrict PII Access (Breaking)
1. Deploy Phase 2 rules (PII restrictions)
2. Add `profiles/{uid}/public` subcollection
3. Update responder profile lookups to use public subcollection
4. Test: Ensure Home feed still loads responder names
5. Duration: 2 weeks

### Stage 5: Add Schema Validation (Non-Breaking)
1. Deploy Phase 3 rules (schema validation)
2. Monitor: Rule violation logs
3. Fix any violations found in production
4. Duration: 1 week

### Total Migration Time: 7 weeks

## Rollback Plan

### If Phase 1 Fails
- Revert rules deployment
- Android falls back to DataStore-only
- No data loss

### If Phase 2 Fails
- Revert rules deployment
- Android reverts to reading from flat `userIncidents`
- New writes stay in subcollections for future retry

### If Phase 4 Fails
- Revert rules deployment
- Remove PII restrictions
- Keep subcollections active

## Testing Checklist

### Phase 1 Tests
- [ ] Android can create `profiles/{uid}/alertFlags/{alertId}`
- [ ] Android can update existing alert flags
- [ ] Android can delete alert flags
- [ ] Android cannot write to other user's flags
- [ ] Firestore rejects writes missing required fields
- [ ] Firestore rejects writes with invalid types

### Phase 2 Tests
- [ ] Android can read `profiles/{uid}/public` for responders
- [ ] Android cannot read full `profiles/{otherId}` unless supe
- [ ] Home feed still shows responder names
- [ ] Details screen still shows responder profiles

### Phase 4 Tests
- [ ] Webhook can still create incidents (Admin SDK)
- [ ] Clients cannot create `appNotifications` directly
- [ ] Clients cannot create activities with wrong profileId
- [ ] All existing incident writes still work

### Phase 5 Tests
- [ ] Invalid incident type rejected
- [ ] Invalid displayId format rejected
- [ ] Invalid location coordinates rejected
- [ ] Valid incident updates still work
- [ ] Partial updates still work

## Risk Assessment

### Low Risk
✅ Phase 1 (Add subcollections) - Non-breaking, Android gracefully falls back
✅ Phase 5 (Schema validation) - Non-breaking, validates new writes only

### Medium Risk
⚠️ Phase 3 (Validate cross-device sync) - Sync conflicts possible
⚠️ Phase 4 (PII restrictions) - Could break responder profile displays

### High Risk
❌ Phase 2 (Backfill data) - Data integrity risk if job fails mid-run

### Mitigation
- Stage rollouts with canary users
- Monitor Firestore metrics closely
- Keep rollback scripts ready
- Test in Firebase emulator first
- Dry-run backfill job before production

## Deployment Commands

### Deploy Rules Only
```bash
firebase deploy --only firestore:rules --config firebase/firebase.json --project nfa-alerts-v2
```

### Deploy Indexes Only
```bash
firebase deploy --only firestore:indexes --config firebase/firebase.json --project nfa-alerts-v2
```

### Deploy Both
```bash
firebase deploy --only firestore --config firebase/firebase.json --project nfa-alerts-v2
```

### Verify Deployment
```bash
firebase firestore:databases:list --project nfa-alerts-v2
firebase firestore:indexes --project nfa-alerts-v2
```

## Monitoring

### Key Metrics to Watch
1. Firestore read/write counts per collection
2. Firestore rule denial rate
3. Android sync error rate
4. Cross-device sync latency
5. User flag write latency

### Alert Thresholds
- Rule denial rate > 5% → Investigate immediately
- Sync error rate > 1% → Review Android logs
- Write latency > 2s p95 → Check Firestore performance
- Read latency > 500ms p95 → Check index usage

## Summary

**Current State:**
- Firestore rules allow broad authenticated read access to PII
- Android uses DataStore-only for flags, filters, High Alert settings
- No production persistence for user preferences

**Recommended Changes:**
- Add user-scoped subcollections for flags, filters, High Alert settings
- Restrict PII access to owners and supes
- Add schema validation for incident writes
- No new composite indexes needed for subcollections

**Next Steps:**
1. Review and approve this plan
2. Create Firebase rules PR with Phase 1 changes
3. Create Android PR with Firestore write repository
4. Deploy rules to Firebase emulator for testing
5. Staged production rollout per migration plan
