export interface Profile {
  userId: string;
  email?: string;
  role: "chaser" | "supe" | "admin";
  completedSteps: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  dob?: string;
  legal?: { dob: string };
  emergencyContact?: { name: string; phone: string; relationship: string };
  locationTracking?: {
    enabled: boolean;
    lastUpdate?: number;
    accuracy?: number;
    lat?: number;
    lng?: number;
  };
  geofencingEnabled?: boolean;
  geofenceRadius?: number;
  online?: boolean;
  lastSeen?: number;
  pushToken?: string;
  signatureUrl?: string;
  signedAt?: number;
  stats?: {
    alertsResponded: number;
    alertsWithNotes?: number;
    daysActive: number;
  };
  suspension?: {
    active: boolean;
    until?: number;
    reason?: string;
    by?: string;
    at?: number;
  };
  ban?: {
    active: boolean;
    at: number;
    reason?: string;
    by?: string;
    deviceFingerprints?: string[];
    ipAddresses?: string[];
  };
  warnings?: Array<{
    reason: string;
    by: string;
    at: number;
  }>;
  deviceFingerprint?: string;
  status?: string;
  hasCompletedWalkthrough?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Incident {
  alertId?: string;
  displayId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    county?: string;
    state: string;
  };
  type: "fire" | "flood" | "storm" | "wind" | "hail" | "other";
  description: string;
  departmentNumber?: string[];
  alarmLevel?:
    | "all_hands"
    | "2nd_alarm"
    | "3rd_alarm"
    | "4th_alarm"
    | "5th_alarm";
  emergencyServicesStatus?: "dispatched" | "on-scene" | "cleared";
  responderIds?: string[];
  respondedAt?: number;
  securedById?: string;
  securedAt?: number;
  status?: "active" | "closed";
  closedAt?: number;
  closedById?: string;
  homeowner?: {
    name?: string;
    contact?: string;
    phone?: string;
    email?: string;
    address?: string;
    insurance?: {
      policyNumber?: string;
      carrier?: string;
      claimsPhone?: string;
    };
    description?: string;
    adjuster?: { name?: string; phone?: string };
    notes?: string;
  };
  activityCount?: number;
  responderCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Thread {
  type: "direct" | "chaser_to_supes";
  participants: string[];
  chaserIds?: string[];
  lastMessage?: string;
  lastMessageAt?: number;
  lastMessageSenderId?: string;
  typingUsers: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  senderId: string;
  text: string;
  readBy: string[];
  replyTo?: string;
  voice?: { storagePath: string; duration: number };
  attachment?: {
    storagePath: string;
    name: string;
    type: string;
    size: number;
  };
  reactions: Array<{ emoji: string; profileId: string }>;
  createdAt: number;
}

export interface Note {
  text: string;
  authorId: string;
  createdAt: number;
}

export interface Document {
  name: string;
  storagePath: string;
  type: string;
  size: number;
  uploaderId: string;
  createdAt: number;
}

export interface Signature {
  type: "homeowner" | "employee";
  storagePath: string;
  signerId: string;
  createdAt: number;
}

export interface AppNotification {
  profileId: string;
  type:
    | "incident_new"
    | "incident_responded"
    | "incident_activity"
    | "message_new"
    | "change_request"
    | "change_request_approved"
    | "change_request_rejected";
  title: string;
  body: string;
  read: boolean;
  url?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export interface Activity {
  type: string;
  description: string;
  incidentId?: string;
  createdAt: number;
}

export interface Location {
  lat: number;
  lng: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  createdAt: number;
}

export interface IncidentActivity {
  type:
    | "custom"
    | "responded"
    | "note"
    | "document"
    | "signature"
    | "closed"
    | "reopened";
  description: string;
  profileId?: string;
  createdAt: number;
}

export interface UserIncident {
  odm_profileId: string;
  odm_incidentId: string;
  odm_action: "favorite" | "bookmark" | "hide" | "mute" | "view";
  createdAt: number;
}

export interface ChaserSubmission {
  chaserId: string;
  incidentId: string;
  documents: Array<{
    _id: string;
    name: string;
    storagePath: string;
    type: string;
    uploadedAt: number;
  }>;
  signedDocuments: Array<{
    _id: string;
    documentId: string;
    documentTitle: string;
    homeownerSignature: string;
    chaserSignature: string;
    signedAt: number;
  }>;
  fingerprint?: {
    dataUrl: string;
    capturedAt: number;
  };
  submittedAt: number;
}

export interface FingerprintMatch {
  chaserId: string;
  chaserName: string;
  fingerprintDataUrl: string;
  capturedAt: number;
  matchedAt?: number;
  matchedBy?: string;
  isMatch?: boolean;
}

export interface ChangeRequest {
  incidentId: string;
  requesterId: string;
  requesterName: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  proposedValue: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: number;
  createdAt: number;
}

export type WithId<T> = T & { _id: string };
