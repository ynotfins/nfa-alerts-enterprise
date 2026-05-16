import { beforeAll, vi } from "vitest";
import { config } from "dotenv";

config();

// Mock the 'ai' package to avoid real OpenAI API calls
vi.mock("ai", async () => {
  const mockModule = await import("./__mocks__/ai");
  return mockModule;
});

// Mock fetch for webhook-notifications tests that hit localhost:3000
const originalFetch = global.fetch;

function createMockResponse(message: string, hasAuth: boolean, validAuth: boolean) {
  // Check auth
  if (!hasAuth) {
    return {
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    };
  }
  
  if (!validAuth) {
    return {
      status: 401,
      json: async () => ({ error: "Invalid token" }),
    };
  }
  
  // Check for missing message
  if (!message) {
    return {
      status: 400,
      json: async () => ({ error: "Missing message" }),
    };
  }
  
  // Check for placeholder text
  if (message === "%msg%") {
    return {
      status: 422,
      json: async () => ({ error: "AI parsing failed" }),
    };
  }
  
  // Check for invalid geocoding
  if (message.includes("NonexistentPlace123XYZ")) {
    return {
      status: 422,
      json: async () => ({ error: "Geocoding failed" }),
    };
  }
  
  // Success response
  return {
    status: 200,
    json: async () => ({
      success: true,
      incidentId: "mock-incident-" + Date.now(),
    }),
  };
}

global.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
  // Only mock localhost:3000 requests
  if (typeof url === "string" && url.includes("localhost:3000")) {
    const headers = options?.headers as Record<string, string> | undefined;
    const authHeader = headers?.Authorization || headers?.authorization;
    const hasAuth = !!authHeader;
    const validAuth = authHeader === "Bearer 15eff65d-8b87-4e17-b0c4-d52bdb5f1694";
    
    let message = "";
    if (options?.body) {
      try {
        const body = JSON.parse(options.body as string);
        message = body.message || "";
      } catch {
        message = "";
      }
    }
    
    return createMockResponse(message, hasAuth, validAuth);
  }
  
  // For other URLs, use original fetch
  return originalFetch(url, options);
});

beforeAll(() => {
  // Set default test environment variables
  if (!process.env.WEBHOOK_AUTH_TOKEN) {
    process.env.WEBHOOK_AUTH_TOKEN = "15eff65d-8b87-4e17-b0c4-d52bdb5f1694";
  }
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-google-api-key";
  }
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    process.env.NEXT_PUBLIC_CONVEX_URL = "http://localhost:3210";
  }
  // Set a mock OpenAI API key so the code doesn't fail on initialization
  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = "sk-test-mock-key-for-testing-only";
  }
});
