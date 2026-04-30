import { beforeEach, describe, expect, it, vi } from "vitest";

const adminDbMock = vi.hoisted(() => ({
  collection: vi.fn(),
}));

const sendNotificationToSupesMock = vi.hoisted(() => vi.fn());
const sendAppNotificationMock = vi.hoisted(() => vi.fn());

const getAuthenticatedProfileMock = vi.hoisted(() => vi.fn());
const requireSupeMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/firebase-admin", () => ({
  adminDb: adminDbMock,
}));

vi.mock("@/actions/notifications", () => ({
  sendNotificationToSupes: sendNotificationToSupesMock,
  sendAppNotification: sendAppNotificationMock,
}));

vi.mock("@/lib/server-auth", () => ({
  getAuthenticatedProfile: getAuthenticatedProfileMock,
  requireSupe: requireSupeMock,
}));

function collectionFor(mapping: Record<string, unknown>) {
  adminDbMock.collection.mockImplementation((name: string) => mapping[name]);
}

describe("change request server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates requests with authenticated profile identity", async () => {
    const setMock = vi.fn();
    const changeRequestDoc = { id: "request-1", set: setMock };
    const incidentDoc = {
      get: vi.fn().mockResolvedValue({ data: () => ({ displayId: "INC-1" }) }),
    };
    const changeRequests = {
      doc: vi.fn(() => changeRequestDoc),
    };
    const incidents = {
      doc: vi.fn(() => incidentDoc),
    };

    collectionFor({ changeRequests, incidents });
    getAuthenticatedProfileMock.mockResolvedValue({
      _id: "real-requester",
      userId: "real-requester",
      role: "chaser",
      name: "Real Requester",
    });

    const { createChangeRequestAction } = await import(
      "@/actions/change-requests"
    );

    await createChangeRequestAction({
      authToken: "verified-token",
      incidentId: "incident-1",
      field: "phone",
      fieldLabel: "Phone",
      currentValue: "old",
      proposedValue: "new",
    });

    expect(getAuthenticatedProfileMock).toHaveBeenCalledWith("verified-token");
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterId: "real-requester",
        requesterName: "Real Requester",
        status: "pending",
      }),
    );
    expect(sendNotificationToSupesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining("Real Requester"),
      }),
    );
  });

  it("requires supe role and records authenticated reviewer on approval", async () => {
    const requestUpdate = vi.fn();
    const incidentUpdate = vi.fn();
    const changeRequests = {
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            incidentId: "incident-1",
            requesterId: "requester-1",
            field: "phone",
            fieldLabel: "Phone",
            proposedValue: "new",
          }),
        }),
        update: requestUpdate,
      })),
    };
    const incidents = {
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({
          data: () => ({ homeowner: {} }),
        }),
        update: incidentUpdate,
      })),
    };

    collectionFor({ changeRequests, incidents });
    getAuthenticatedProfileMock.mockResolvedValue({
      _id: "real-reviewer",
      userId: "real-reviewer",
      role: "supe",
      name: "Real Reviewer",
    });

    const { approveChangeRequestAction } = await import(
      "@/actions/change-requests"
    );

    await approveChangeRequestAction("request-1", "verified-reviewer-token");

    expect(requireSupeMock).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "real-reviewer", role: "supe" }),
    );
    expect(requestUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "approved",
        reviewedBy: "real-reviewer",
      }),
    );
    expect(incidentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ "homeowner.phone": "new" }),
    );
    expect(sendAppNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "requester-1",
        body: expect.stringContaining("Real Reviewer"),
      }),
    );
  });
});
