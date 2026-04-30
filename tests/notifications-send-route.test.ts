import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setNotification = vi.fn();
const updateProfile = vi.fn();
const getProfile = vi.fn();
const doc = vi.fn((id?: string) => ({
  id: id ?? "notification-id",
  set: setNotification,
  get: getProfile,
  update: updateProfile,
}));
const collection = vi.fn(() => ({ doc }));
const sendNotification = vi.fn();
const authorizeInternalOrFirebaseRequest = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  adminDb: { collection },
  sendNotification,
}));

vi.mock("@/lib/server-auth", async () => {
  const actual = await import("@/lib/server-auth");

  return {
    AuthError: actual.AuthError,
    authorizeInternalOrFirebaseRequest,
  };
});

function createRequest(body: unknown) {
  return new NextRequest("http://localhost/api/notifications/send", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("/api/notifications/send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfile.mockResolvedValue({ data: () => ({}) });
    authorizeInternalOrFirebaseRequest.mockResolvedValue({ type: "internal" });
  });

  it("rejects unauthenticated callers before creating notifications", async () => {
    const { POST } = await import("@/app/api/notifications/send/route");
    const { AuthError } = await import("@/lib/server-auth");
    authorizeInternalOrFirebaseRequest.mockRejectedValue(
      new AuthError("Unauthorized", 401),
    );

    const response = await POST(
      createRequest({
        profileId: "profile-1",
        type: "message_new",
        title: "Title",
        body: "Body",
      }),
    );

    expect(response.status).toBe(401);
    expect(setNotification).not.toHaveBeenCalled();
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("creates notification and sends FCM for internal callers", async () => {
    const { POST } = await import("@/app/api/notifications/send/route");
    getProfile.mockResolvedValue({ data: () => ({ pushToken: "fcm-token" }) });

    const response = await POST(
      createRequest({
        profileId: "profile-1",
        type: "message_new",
        title: "Title",
        body: "Body",
        metadata: { threadId: "thread-1", count: 2 },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, id: "notification-id" });
    expect(setNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "profile-1",
        type: "message_new",
        read: false,
      }),
    );
    expect(sendNotification).toHaveBeenCalledWith(
      "fcm-token",
      expect.objectContaining({
        data: expect.objectContaining({
          type: "message_new",
          threadId: "thread-1",
          count: "2",
        }),
      }),
    );
  });

  it("allows Firebase callers to send their own message notifications", async () => {
    const { POST } = await import("@/app/api/notifications/send/route");
    authorizeInternalOrFirebaseRequest.mockResolvedValue({
      type: "firebase",
      profile: { _id: "sender-1", role: "chaser" },
    });

    const response = await POST(
      createRequest({
        profileId: "profile-1",
        type: "message_new",
        title: "Title",
        body: "Body",
        metadata: { threadId: "thread-1", senderId: "sender-1" },
      }),
    );

    expect(response.status).toBe(200);
    expect(setNotification).toHaveBeenCalled();
  });

  it("blocks Firebase callers from forging privileged notification types", async () => {
    const { POST } = await import("@/app/api/notifications/send/route");
    authorizeInternalOrFirebaseRequest.mockResolvedValue({
      type: "firebase",
      profile: { _id: "sender-1", role: "chaser" },
    });

    const response = await POST(
      createRequest({
        profileId: "profile-1",
        type: "incident_new",
        title: "Title",
        body: "Body",
        metadata: { senderId: "sender-1" },
      }),
    );

    expect(response.status).toBe(403);
    expect(setNotification).not.toHaveBeenCalled();
  });

  it("rejects invalid notification payloads", async () => {
    const { POST } = await import("@/app/api/notifications/send/route");

    const response = await POST(
      createRequest({
        profileId: "profile-1",
        type: "chat",
        title: "Title",
        body: "Body",
      }),
    );

    expect(response.status).toBe(400);
    expect(setNotification).not.toHaveBeenCalled();
  });
});
