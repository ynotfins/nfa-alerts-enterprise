# Firestore Security Rules Testing Guide

This document describes how to verify the Firestore security rules locally using the Firebase Emulator Suite.

## Prerequisites

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Ensure you have Java 11+ installed (required for Firestore emulator)

## Running the Emulator

```bash
# Start the Firestore emulator
firebase emulators:start --only firestore

# The emulator UI will be available at http://localhost:4000
# Firestore emulator runs on port 8080 by default
```

## Testing Profile Rules

### Test 1: Owner can update own profile (non-restricted fields)

**Expected: ALLOW**

```javascript
// Simulate authenticated user updating their own profile
const userAuth = { uid: 'user123' };
const profileRef = db.collection('profiles').doc('user123');

// This should succeed - updating allowed fields
await profileRef.update({
  name: 'New Name',
  phone: '555-1234',
  address: '123 Main St'
});
```

### Test 2: Owner cannot change their own role

**Expected: DENY**

```javascript
// Simulate authenticated user trying to change their role
const userAuth = { uid: 'user123' };
const profileRef = db.collection('profiles').doc('user123');

// This should FAIL - role is a restricted field
await profileRef.update({
  role: 'supe'  // Attempting to upgrade self to supe
});
```

### Test 3: Owner cannot change suspension/ban/warnings

**Expected: DENY**

```javascript
// Simulate authenticated user trying to remove their suspension
const userAuth = { uid: 'user123' };
const profileRef = db.collection('profiles').doc('user123');

// This should FAIL - suspension is a restricted field
await profileRef.update({
  suspension: { active: false }
});
```

### Test 4: Admin can change any user's role

**Expected: ALLOW**

```javascript
// Simulate admin user changing another user's role
const adminAuth = { uid: 'admin123' };
// Admin profile must exist with role: 'admin'
const profileRef = db.collection('profiles').doc('user123');

// This should succeed - admin can update restricted fields
await profileRef.update({
  role: 'supe'
});
```

## Testing Incident Rules

### Test 5: Supe can update any incident field

**Expected: ALLOW**

```javascript
// Simulate supe updating incident
const supeAuth = { uid: 'supe123' };
// Supe profile must exist with role: 'supe'
const incidentRef = db.collection('incidents').doc('incident123');

// This should succeed - supe can update any field
await incidentRef.update({
  status: 'closed',
  closedAt: Date.now(),
  closedById: 'supe123'
});
```

### Test 6: Responder can update operational fields

**Expected: ALLOW**

```javascript
// Simulate responder (chaser assigned to incident) updating operational fields
const chaserAuth = { uid: 'chaser123' };
// Incident must have chaser123 in responderIds array
const incidentRef = db.collection('incidents').doc('incident123');

// This should succeed - responder can update operational fields
await incidentRef.update({
  homeowner: { name: 'John Doe', phone: '555-1234' },
  emergencyServicesStatus: 'on-scene',
  updatedAt: Date.now()
});
```

### Test 7: Responder cannot update supervisor-only fields

**Expected: DENY**

```javascript
// Simulate responder trying to close incident
const chaserAuth = { uid: 'chaser123' };
// Incident must have chaser123 in responderIds array
const incidentRef = db.collection('incidents').doc('incident123');

// This should FAIL - status is a supervisor-only field
await incidentRef.update({
  status: 'closed'
});
```

### Test 8: Non-responder cannot update incident

**Expected: DENY**

```javascript
// Simulate non-responder trying to update incident
const chaserAuth = { uid: 'chaser456' };
// Incident does NOT have chaser456 in responderIds array
const incidentRef = db.collection('incidents').doc('incident123');

// This should FAIL - user is not a responder
await incidentRef.update({
  homeowner: { name: 'Jane Doe' }
});
```

## Manual Console Verification

If you cannot run the emulator, you can verify rules manually in the Firebase Console:

1. Go to Firebase Console > Firestore Database > Rules
2. Click "Rules Playground" tab
3. Set up test scenarios:
   - **Location**: Select collection path (e.g., `profiles/user123`)
   - **Method**: Select operation (get, create, update, delete)
   - **Authenticated**: Toggle on and set custom UID
   - **Custom Claims**: Add if needed
   - **Request Data**: Add the data being written (for create/update)
   - **Resource Data**: Add existing document data (for update/delete)

4. Click "Run" to test each scenario

## Field Reference

### Profile Restricted Fields (admin-only)
- `role` - User role (chaser, supe, admin)
- `suspension` - Suspension status and details
- `ban` - Ban status and details
- `warnings` - Warning history

### Incident Supervisor-Only Fields
- `status` - Incident status (active, closed)
- `closedAt` - Timestamp when closed
- `closedById` - User who closed
- `securedById` - User who secured
- `securedAt` - Timestamp when secured
- `displayId` - Display identifier
- `location` - Incident location
- `type` - Incident type
- `description` - Incident description
- `alarmLevel` - Alarm level
- `departmentNumber` - Department numbers

### Incident Operational Fields (responder-allowed)
- `homeowner` - Homeowner information
- `emergencyServicesStatus` - Emergency services status
- `responderIds` - List of responder IDs
- `respondedAt` - Response timestamp
- `updatedAt` - Last update timestamp
- `activityCount` - Activity counter
- `responderCount` - Responder counter
