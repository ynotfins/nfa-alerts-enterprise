import { z } from "zod";

export const userRoleSchema = z.enum(["chaser", "supe", "admin"]);
export const userStatusSchema = z.enum(["pending", "approved", "rejected"]);

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;

export const profileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  status: userStatusSchema,
  name: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  legal: z.object({
    dob: z.date(),
  }),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }),
  locationTracking: z.object({
    enabled: z.boolean().default(false),
    lastUpdate: z.date().optional(),
    accuracy: z.number().optional(),
  }),
  online: z.boolean().default(false),
  lastSeen: z.date().optional(),
  pushToken: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Profile = z.infer<typeof profileSchema>;

export const updateProfileSchema = profileSchema.partial().required({ uid: true });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
