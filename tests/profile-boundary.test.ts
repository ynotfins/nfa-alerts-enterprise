import { describe, expect, it } from "vitest";
import { parseProfile } from "@/lib/profile-boundary";

describe("parseProfile", () => {
  it("preserves existing Firestore profile fields while normalizing required fields", () => {
    const parsed = parseProfile("profile-1", {
      userId: "stored-user",
      role: "chaser",
      completedSteps: 4,
      createdAt: 10,
      updatedAt: 20,
      email: "user@example.com",
      stats: { alertsResponded: 2, daysActive: 3 },
      locationTracking: { enabled: true, lat: 25, lng: -80 },
      customFutureField: { nested: true },
    });

    expect(parsed).toEqual({
      _id: "profile-1",
      userId: "stored-user",
      role: "chaser",
      completedSteps: 4,
      createdAt: 10,
      updatedAt: 20,
      email: "user@example.com",
      stats: { alertsResponded: 2, daysActive: 3 },
      locationTracking: { enabled: true, lat: 25, lng: -80 },
      customFutureField: { nested: true },
    });
  });

  it("defaults missing required fields without dropping optional data", () => {
    const parsed = parseProfile("profile-1", {
      role: "supe",
      name: "Supe",
    });

    expect(parsed).toMatchObject({
      _id: "profile-1",
      userId: "profile-1",
      role: "supe",
      completedSteps: 0,
      createdAt: 0,
      updatedAt: 0,
      name: "Supe",
    });
  });
});
