import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const setMock = vi.fn();
const getMock = vi.fn();
const updateMock = vi.fn();
const verifyIdTokenMock = vi.fn();
const sendNotificationMock = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn((collectionName: string) => ({
      doc: vi.fn((docId?: string) => {
        if (collectionName === "profiles") {
          return {
            get: getMock,
            update: updateMock,
          };
        }

        return {
          id: docId ?? "notification-1",
          set: setMock,
        };
      }),
    })),
  },
  adminAuth: {
    verifyIdToken: verifyIdTokenMock,
  },
  sendNotification: sendNotificationMock,
}));

async function postNotification(headers?: HeadersInit, body?: unknown) {
  const { POST } = await import("@/app/api/notifications/send/route");

  return POST(
    new NextRequest("http://localhost/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(
        body ?? {
          profileId: "recipient-1",
          type: "message_new",
          title: "New message",
          body: "Hello",
        },
      ),
    }),
  );
}

describe("/api/notifications/send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBHOOK_AUTH_TOKEN = "internal-token";
    verifyIdTokenMock.mockResolvedValue({ uid: "sender-1" });
    getMock.mockResolvedValue({
      exists: true,
      data: () => ({
        userId: "sender-1",
        role: "chaser",
        completedSteps: 4,
        createdAt: 1,
        updatedAt: 1,
      }),
    });
  });

  it("rejects unauthenticated callers before writing notifications", async () => {
    const response = await postNotification();

    expect(response.status).toBe(401);
    expect(setMock).not.toHaveBeenCalled();
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads before writing notifications", async () => {
    const response = await postNotification(
      { Authorization: "Bearer internal-token" },
      { profileId: "recipient-1", type: "message_new", title: "New message" },
    );

    expect(response.status).toBe(400);
    expect(setMock).not.toHaveBeenCalled();
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it("accepts internal bearer token requests", async () => {
    getMock.mockResolvedValueOnce({
      exists: true,
      data: () => ({}),
    });

    const response = await postNotification({
      Authorization: "Bearer internal-token",
    });

    expect(response.status).toBe(200);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "recipient-1",
        type: "message_new",
        title: "New message",
        body: "Hello",
        read: false,
      }),
    );
  });

  it("accepts Firebase bearer token requests with a valid profile", async () => {
    getMock
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          userId: "sender-1",
          role: "supe",
          completedSteps: 4,
          createdAt: 1,
          updatedAt: 1,
        }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({}),
      });

    const response = await postNotification({
      Authorization: "Bearer firebase-token",
    });

    expect(response.status).toBe(200);
    expect(verifyIdTokenMock).toHaveBeenCalledWith("firebase-token");
    expect(setMock).toHaveBeenCalled();
  });
});
