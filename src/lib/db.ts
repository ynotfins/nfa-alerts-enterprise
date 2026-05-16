import { z } from "zod";

export const profileSchema = z.object({
  userId: z.string(),
  email: z.string().optional(),
  role: z.enum(["chaser", "supe", "admin"]),
  completedSteps: z.number(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
  dob: z.string().optional(),
  legal: z.object({ dob: z.string() }).optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
    .optional(),
  locationTracking: z
    .object({
      enabled: z.boolean(),
      lastUpdate: z.number().optional(),
      accuracy: z.number().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
  geofencingEnabled: z.boolean().optional(),
  geofenceRadius: z.number().optional(),
  online: z.boolean().optional(),
  lastSeen: z.number().optional(),
  pushToken: z.string().optional(),
  signatureUrl: z.string().optional(),
  signedAt: z.number().optional(),
  stats: z
    .object({
      alertsResponded: z.number(),
      alertsWithNotes: z.number().optional(),
      daysActive: z.number(),
    })
    .optional(),
  suspension: z
    .object({
      active: z.boolean(),
      until: z.number().optional(),
      reason: z.string().optional(),
      by: z.string().optional(),
      at: z.number().optional(),
    })
    .optional(),
  ban: z
    .object({
      active: z.boolean(),
      at: z.number(),
      reason: z.string().optional(),
      by: z.string().optional(),
      deviceFingerprints: z.array(z.string()).optional(),
      ipAddresses: z.array(z.string()).optional(),
    })
    .optional(),
  warnings: z
    .array(
      z.object({
        reason: z.string(),
        by: z.string(),
        at: z.number(),
      }),
    )
    .optional(),
  deviceFingerprint: z.string().optional(),
  status: z.string().optional(),
  hasCompletedWalkthrough: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Profile = z.infer<typeof profileSchema>;

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
