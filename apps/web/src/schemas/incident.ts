import { z } from "zod";

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  city: z.string(),
  county: z.string().optional(),
  state: z.string(),
});

export type Location = z.infer<typeof locationSchema>;

export const homeownerSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  insurance: z.object({
    policyNumber: z.string().optional(),
    carrier: z.string().optional(),
    claimsPhone: z.string().optional(),
  }).optional(),
  description: z.string().optional(),
  adjuster: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export type Homeowner = z.infer<typeof homeownerSchema>;

export const incidentTypeSchema = z.enum([
  "fire",
  "flood",
  "storm",
  "wind",
  "hail",
  "other",
]);

export type IncidentType = z.infer<typeof incidentTypeSchema>;

export const emergencyServicesStatusSchema = z.enum([
  "dispatched",
  "on-scene",
  "cleared",
]);

export type EmergencyServicesStatus = z.infer<
  typeof emergencyServicesStatusSchema
>;

export const noteSchema = z.object({
  id: z.string(),
  text: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  createdAt: z.date(),
});

export type Note = z.infer<typeof noteSchema>;

export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.string(), // mime type
  size: z.number(),
  uploaderId: z.string(),
  uploaderName: z.string(),
  createdAt: z.date(),
});

export type Document = z.infer<typeof documentSchema>;

export const signatureSchema = z.object({
  id: z.string(),
  type: z.enum(["homeowner", "employee"]),
  imageUrl: z.string().url(),
  signedBy: z.string(), // name of signer
  signerId: z.string().optional(), // user ID if app user
  createdAt: z.date(),
});

export type Signature = z.infer<typeof signatureSchema>;

export const activityLogEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  userId: z.string(),
  userName: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type ActivityLogEntry = z.infer<typeof activityLogEntrySchema>;

export const incidentSchema = z.object({
  id: z.string(),
  location: locationSchema,
  type: incidentTypeSchema,
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  emergencyServicesStatus: emergencyServicesStatusSchema.optional(),
  responderId: z.string().optional(),
  responderName: z.string().optional(),
  notes: z.array(noteSchema).default([]),
  documents: z.array(documentSchema).default([]),
  signatures: z.array(signatureSchema).default([]),
  activityLog: z.array(activityLogEntrySchema).default([]),
  homeowner: homeownerSchema.optional(),
});

export type Incident = z.infer<typeof incidentSchema>;

// Create incident schema (for new incidents)
export const createIncidentSchema = incidentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  notes: true,
  documents: true,
  signatures: true,
  activityLog: true,
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

// Add note schema
export const addNoteSchema = z.object({
  incidentId: z.string(),
  text: z.string().min(1, "Note cannot be empty"),
});

export type AddNoteInput = z.infer<typeof addNoteSchema>;
