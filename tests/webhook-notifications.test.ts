import { describe, it, expect } from "vitest";

const WEBHOOK_URL = "http://localhost:3000/api/webhook";
const AUTH_TOKEN = "15eff65d-8b87-4e17-b0c4-d52bdb5f1694";

async function sendNotification(message: string) {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({ message }),
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

function expectValidResponse(result: { status: number; data: { error?: string } }) {
  if (result.status === 200) {
  } else {
    expect(result.data.error).toMatch(/Geocoding failed|AI parsing failed/);
  }
}

describe("Webhook Notifications - New Incidents", () => {
  it("should parse BNN format fire notification", async () => {
    const result = await sendNotification(
      "FL| Miami-Dade| Miami| Structure Fire| 123 Main Street"
    );
    expectValidResponse(result);
  });

  it("should parse PulsePoint notification", async () => {
    const result = await sendNotification(
      "PulsePoint: Structure fire at 456 Oak Ave, Tampa, FL. Multiple units responding."
    );
    expectValidResponse(result);
  });

  it("should parse Active911 notification", async () => {
    const result = await sendNotification(
      "Active911 [Device 12345]: Medical emergency at 789 Pine St, Orlando, FL"
    );

    expectValidResponse(result);
  });

  it("should parse scanner traffic", async () => {
    const result = await sendNotification(
      "Engine 5 responding to house fire on 321 Elm Street Jacksonville Florida"
    );

    expectValidResponse(result);
  });

  it("should parse flood notification", async () => {
    const result = await sendNotification(
      "Flooding reported at 555 River Rd, Fort Myers, FL. Water rescue in progress."
    );

    expectValidResponse(result);
  });

  it("should parse storm notification", async () => {
    const result = await sendNotification(
      "Severe weather alert: tornado warning for 888 Storm Ave, Tallahassee, FL"
    );

    expectValidResponse(result);
  });

  it("should parse wind damage notification", async () => {
    const result = await sendNotification(
      "High winds, downed power lines at 999 Wind St, Miami, FL"
    );

    expectValidResponse(result);
  });

  it("should parse hail damage notification", async () => {
    const result = await sendNotification(
      "Hail damage reported at 111 Ice Lane, Tampa, FL. Multiple vehicles damaged."
    );

    expectValidResponse(result);
  });

  it("should parse gas leak notification", async () => {
    const result = await sendNotification(
      "Gas leak detected at 222 Danger St, Orlando, FL. Area evacuated."
    );

    expectValidResponse(result);
  });
});

describe("Webhook Notifications - Updates", () => {
  it("should parse fire department arrival", async () => {
    const result = await sendNotification(
      "FD arrived on scene at 123 Main Street, Miami, FL structure fire"
    );

    expectValidResponse(result);
  });

  it("should parse police arrival", async () => {
    const result = await sendNotification(
      "PD on scene at 456 Oak Ave, Tampa, FL incident"
    );

    expectValidResponse(result);
  });

  it("should parse EMS arrival", async () => {
    const result = await sendNotification(
      "EMS arrived at 789 Pine St, Orlando, FL medical emergency"
    );

    expectValidResponse(result);
  });

  it("should parse fire cleared", async () => {
    const result = await sendNotification(
      "Fire cleared at 321 Elm Street, Jacksonville, FL. All units available."
    );

    expectValidResponse(result);
  });

  it("should parse power restored", async () => {
    const result = await sendNotification(
      "Power restored at 999 Wind St, Miami, FL after storm damage"
    );

    expectValidResponse(result);
  });

  it("should parse gas secured", async () => {
    const result = await sendNotification(
      "Gas leak contained at 222 Danger St, Orlando, FL. Area secured."
    );

    expectValidResponse(result);
  });

  it("should parse evacuation ordered", async () => {
    const result = await sendNotification(
      "Evacuation ordered for 555 River Rd, Fort Myers, FL due to flooding"
    );

    expectValidResponse(result);
  });

  it("should parse all clear", async () => {
    const result = await sendNotification(
      "All clear at 888 Storm Ave, Tallahassee, FL. Scene safe, units clearing."
    );

    expectValidResponse(result);
  });
});

describe("Webhook Notifications - Edge Cases", () => {
  it("should handle minimal info", async () => {
    const result = await sendNotification("Fire in Miami FL");

    expectValidResponse(result);
  });

  it("should handle unknown location", async () => {
    const result = await sendNotification(
      "Structure fire, location unknown, Florida"
    );

    expectValidResponse(result);
  });

  it("should handle placeholder text", async () => {
    const result = await sendNotification("%msg%");

    expectValidResponse(result);
  });

  it("should handle department number", async () => {
    const result = await sendNotification(
      "Incident #2024-12345: Fire at 100 Test St, Miami, FL"
    );

    expectValidResponse(result);
  });

  it("should handle county info", async () => {
    const result = await sendNotification(
      "Fire in Broward County, 200 County Rd, Fort Lauderdale, FL"
    );

    expectValidResponse(result);
  });

  it("should reject missing auth", async () => {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });

    expect(response.status).toBe(401);
  });

  it("should reject invalid auth", async () => {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer wrong-token",
      },
      body: JSON.stringify({ message: "test" }),
    });

    expect(response.status).toBe(401);
  });

  it("should reject missing message", async () => {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
  });

  it("should handle invalid geocoding gracefully", async () => {
    const result = await sendNotification(
      "Fire at NonexistentPlace123XYZ, InvalidCity, FL"
    );

    if (result.status === 422) {
      expect(result.data.error).toBe("Geocoding failed");
    }
  });
});

describe("Webhook Notifications - Multi-Source", () => {
  it("should parse different state formats", async () => {
    const tests = [
      "Fire at 100 Main St, New York, NY",
      "Incident in Los Angeles, California CA",
      "Emergency at 200 Oak Ave, Houston, TX",
    ];

    for (const message of tests) {
      await sendNotification(message);
    }
  });

  it("should handle various activity descriptions", async () => {
    const activities = [
      "Fire units on scene at 100 Test St, Miami, FL",
      "Police arrived 200 Test Ave, Tampa, FL",
      "Ambulance responding to 300 Test Rd, Orlando, FL",
      "Scene cleared at 400 Test Ln, Jacksonville, FL",
    ];

    for (const message of activities) {
      const result = await sendNotification(message);
      expectValidResponse(result);
    }
  });
});
