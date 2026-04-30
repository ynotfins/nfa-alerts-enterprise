import { beforeEach, describe, expect, it, vi } from "vitest";

const changeRequestSet = vi.fn();
const changeRequestUpdate = vi.fn();
const incidentUpdate = vi.fn();
const verifyFirebaseBearerToken = vi.fn();
const sendNotificationToSupes = vi.fn();
const sendAppNotification = vi.fn();

const docs = {
  changeRequests: new Map<string, unknown>(),
  incidents: new Map<string, unknown>(),
};

function docRef(collectionName: "changeRequests" | "incidents", id: string) {
  return {
    get: vi.fn(async () => ({
      exists: docs[collectionName].has(id),
      data: () => docs[collectionName].get(id),
    })),
    set: collectionName === "changeRequests" ? changeRequestSet : vi.fn(),
    update:
      collectionName === "changeRequests" ? changeRequestUpdate : incidentUpdate,
  };
}

vi.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: (collectionName: "changeRequests" | "incidents") => ({
      doc: (id?: string) => docRef(collectionName, id ?? "new-request"),
    }),
  },
}));

vi.mock("@/lib/server-auth", () => ({
  isPrivilegedRole: (role: string) => role === "supe" || role === "admin",
  verifyFirebaseBearerToken,
}));

vi.mock("@/actions/notifications", () => ({
  sendNotificationToSupes,
  sendAppNotification,
}));

describe("change request actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    docs.changeRequests.clear();
    docs.incidents.clear();
    docs.incidents.set("incident-1", { displayId: "101" });
  });

  it("creates requests with authenticated profile identity", async () => {
    const { createChangeRequestAction } = await import(
      "@/actions/change-requests"
    );
    verifyFirebaseBearerToken.mockResolvedValue({
      _id: "real-user",
      role: "chaser",
      name: "Real User",
    });

    await createChangeRequestAction({
      incidentId: "incident-1",
      field: "name",
      fieldLabel: "Homeowner Name",
      currentValue: "Old",
      proposedValue: "New",
      authToken: "token",
    });

    expect(verifyFirebaseBearerToken).toHaveBeenCalledWith("Bearer token");
    expect(changeRequestSet).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterId: "real-user",
        requesterName: "Real User",
      }),
    );
    expect(sendNotificationToSupes).toHaveBeenCalled();
  });

  it("rejects non-privileged approvals", async () => {
    const { approveChangeRequestAction } = await import(
      "@/actions/change-requests"
    );
    verifyFirebaseBearerToken.mockResolvedValue({
      _id: "chaser-1",
      role: "chaser",
    });

    await expect(
      approveChangeRequestAction("request-1", "token"),
    ).rejects.toThrow("Forbidden");
    expect(changeRequestUpdate).not.toHaveBeenCalled();
  });

  it("approves pending requests with authenticated reviewer identity", async () => {
    const { approveChangeRequestAction } = await import(
      "@/actions/change-requests"
    );
    docs.changeRequests.set("request-1", {
      incidentId: "incident-1",
      requesterId: "requester-1",
      field: "phone",
      fieldLabel: "Phone",
      proposedValue: "555",
      status: "pending",
    });
    verifyFirebaseBearerToken.mockResolvedValue({
      _id: "supe-1",
      role: "supe",
      name: "Supe One",
    });

    await approveChangeRequestAction("request-1", "token");

    expect(changeRequestUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "approved",
        reviewedBy: "supe-1",
      }),
    );
    expect(incidentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        "homeowner.phone": "555",
      }),
    );
    expect(sendAppNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "requester-1",
        body: expect.stringContaining("Supe One"),
      }),
    );
  });
});
