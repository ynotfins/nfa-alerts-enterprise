import { z } from "zod";

// Sign in schema
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;

// Sign up schema - Step 1: Credentials
export const signUpCredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpCredentialsInput = z.infer<typeof signUpCredentialsSchema>;

// Step 2: Profile photo
export const profilePhotoSchema = z.object({
  photoURL: z.string().url("Invalid image URL").optional(),
  photoFile: z.instanceof(File).optional(),
}).refine((data) => data.photoURL || data.photoFile, {
  message: "Please upload a profile photo",
});

export type ProfilePhotoInput = z.infer<typeof profilePhotoSchema>;

// Step 3: Legal info
export const legalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.date({ message: "Date of birth is required" }),
});

export type LegalInfoInput = z.infer<typeof legalInfoSchema>;

// Step 4: Emergency contact
export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Emergency contact name is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .refine(
      (val) => /^[+]?[\d\s\-().]+$/.test(val) && val.replace(/\D/g, "").length >= 10,
      { message: "Invalid phone number format" }
    ),
  relationship: z.string().min(1, "Relationship is required"),
});

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

// Step 5: Insurance
export const insuranceSchema = z.object({
  carrier: z.string().min(1, "Insurance carrier is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
});

export type InsuranceInput = z.infer<typeof insuranceSchema>;

// Step 6: Liability signature
export const liabilitySignatureSchema = z.object({
  signature: z.string().min(1, "Signature is required"),
  agreed: z.literal(true, { message: "You must agree to the terms" }),
});

export type LiabilitySignatureInput = z.infer<typeof liabilitySignatureSchema>;

// Complete signup data
export const completeSignUpSchema = signUpCredentialsSchema
  .merge(profilePhotoSchema)
  .merge(legalInfoSchema)
  .merge(emergencyContactSchema)
  .merge(insuranceSchema)
  .merge(liabilitySignatureSchema);

export type CompleteSignUpInput = z.infer<typeof completeSignUpSchema>;
