export interface UserProfile {
  email?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    carrier: string;
    policyNumber: string;
  };
  signatureURL?: string;
  profileCompleted?: boolean;
}

/**
 * Determine which signup step user should be on
 * Returns null if profile is complete
 */
export function getSignupStep(profile: UserProfile | null): string | null {
  if (!profile) {
    return "/signup";
  }

  if (profile.profileCompleted) {
    return null;
  }

  if (!profile.photoURL) {
    return "/signup/profile";
  }

  if (
    !profile.firstName ||
    !profile.lastName ||
    !profile.dob
  ) {
    return "/signup/legal";
  }

  if (
    !profile.emergencyContact?.name ||
    !profile.emergencyContact?.phone ||
    !profile.emergencyContact?.relationship
  ) {
    return "/signup/emergency";
  }

  if (!profile.signatureURL) {
    return "/signup/signature";
  }

  return null;
}

/**
 * Check if profile is complete
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  return profile?.profileCompleted === true;
}
