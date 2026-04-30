import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const profileDocs = new Map<string, unknown>();
const verifyIdToken = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken,
  },
  adminDb: {
    collection: (collectionName: string) => {
      if (collectionName !== "profiles") {
        throw new Error(`Unexpected collection ${collectionName}`);
      }

      return {
        doc: (id: string) => ({
          get: async () => ({
            exists: profileDocs.has(id),
            id,
            data: () => profileDocs.get(id),
          }),
        }),
      };
    },
  },
}));

describe("server auth helpers", () => {
  beforeEach(() => {
    profileDocs.clear();
    verifyIdToken.mockReset();
  });

  it("rejects missing bearer auth", async () => {
    const { verifyFirebaseBearerToken } = await import("@/lib/server-auth");

    await expect(verifyFirebaseBearerToken(null)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("resolves authenticated profile server-side from verified token uid", async () => {
    const { verifyFirebaseBearerToken } = await import("@/lib/server-auth");
    verifyIdToken.mockResolvedValueOnce({ uid: "real-user" });
    profileDocs.set("real-user", {
      userId: "real-user",
      role: "chaser",
      completedSteps: 4,
      name: "Real User",
      createdAt: 1,
      updatedAt: 1,
    });

    await expect(
      verifyFirebaseBearerToken("Bearer firebase-token"),
    ).resolves.toMatchObject({
      _id: "real-user",
      name: "Real User",
      role: "chaser",
    });
  });

  it("allows internal notification auth token without Firebase auth", async () => {
    const { authorizeInternalOrPrivilegedRequest } = await import(
      "@/lib/server-auth"
    );
    process.env.WEBHOOK_AUTH_TOKEN = "internal-token";

    await expect(
      authorizeInternalOrPrivilegedRequest(
        new NextRequest("https://nfa.test/api/notifications/send", {
          headers: { authorization: "Bearer internal-token" },
        }),
      ),
    ).resolves.toEqual({ type: "internal" });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("allows non-privileged Firebase notification callers after token verification", async () => {
    const { authorizeInternalOrFirebaseRequest } = await import(
      "@/lib/server-auth"
    );
    process.env.WEBHOOK_AUTH_TOKEN = "internal-token";
    verifyIdToken.mockResolvedValueOnce({ uid: "chaser-user" });
    profileDocs.set("chaser-user", {
      userId: "chaser-user",
      role: "chaser",
      completedSteps: 4,
      createdAt: 1,
      updatedAt: 1,
    });

    await expect(
      authorizeInternalOrFirebaseRequest(
        new NextRequest("https://nfa.test/api/notifications/send", {
          headers: { authorization: "Bearer firebase-token" },
        }),
      ),
    ).resolves.toMatchObject({ type: "firebase" });
  });
});
