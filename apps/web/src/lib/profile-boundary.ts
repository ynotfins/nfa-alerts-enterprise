import type { Profile, WithId } from "@/lib/db";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProfileRole(value: unknown): value is Profile["role"] {
  return value === "chaser" || value === "supe" || value === "admin";
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

export function parseProfile(id: string, value: unknown): WithId<Profile> {
  if (!isRecord(value) || !isProfileRole(value.role)) {
    throw new Error("Invalid profile data");
  }

  const userId = optionalString(value.userId) ?? id;
  const completedSteps = optionalNumber(value.completedSteps) ?? 0;
  const createdAt = optionalNumber(value.createdAt) ?? 0;
  const updatedAt = optionalNumber(value.updatedAt) ?? 0;

  return {
    ...value,
    _id: id,
    userId,
    role: value.role,
    completedSteps,
    createdAt,
    updatedAt,
    email: optionalString(value.email),
    name: optionalString(value.name),
    firstName: optionalString(value.firstName),
    lastName: optionalString(value.lastName),
    phone: optionalString(value.phone),
    address: optionalString(value.address),
    avatarUrl: optionalString(value.avatarUrl),
    pushToken: optionalString(value.pushToken),
  };
}
