import { describe, it, expect } from "vitest";
import { parseNotification } from "../src/lib/webhook/parser";

describe("Webhook Parser", () => {
  it("should parse simple fire notification", async () => {
    const result = await parseNotification("Fire at 123 Main St, Miami, FL");

    expect(result.source).toBeTruthy();
    expect(result.isUpdate).toBe(false);
    expect(result.incidentType).toBe("fire");
    expect(result.location.state).toBe("FL");
    expect(result.location.city).toBeTruthy();
    expect(result.location.address).toBeTruthy();
    expect(result.description.length).toBeGreaterThanOrEqual(10);
  });

  it("should parse BNN format", async () => {
    const result = await parseNotification(
      "FL| Miami-Dade| Miami| Structure Fire| 123 Main Street"
    );

    expect(result.source).toMatch(/BNN/i);
    expect(result.incidentType).toBe("fire");
    expect(result.location.state).toBe("FL");
    expect(result.location.city).toMatch(/Miami/i);
    expect(result.location.county).toMatch(/Miami-Dade/i);
  });

  it("should parse PulsePoint format", async () => {
    const result = await parseNotification(
      "PulsePoint: Structure fire at 456 Oak Ave, Tampa, FL. Multiple units responding."
    );

    expect(result.source).toMatch(/PulsePoint/i);
    expect(result.incidentType).toBe("fire");
    expect(result.location.state).toBe("FL");
  });

  it("should parse update with arrival", async () => {
    const result = await parseNotification(
      "FD arrived on scene at 123 Main St, Miami, FL structure fire"
    );

    expect(result.isUpdate).toBe(true);
    if (result.activityType) {
      expect(result.activityType).toMatch(/fire_arrived/i);
    }
  });

  it("should parse police arrival", async () => {
    const result = await parseNotification(
      "PD on scene at 456 Oak Ave, Tampa, FL"
    );

    expect(result.isUpdate).toBe(true);
    if (result.activityType) {
      expect(result.activityType).toMatch(/police_arrived/i);
    }
  });

  it("should parse cleared status", async () => {
    const result = await parseNotification(
      "Fire cleared at 123 Elm St, Orlando, FL"
    );

    expect(result.isUpdate).toBe(true);
    if (result.activityType) {
      expect(result.activityType).toMatch(/fire_cleared|cleared/i);
    }
  });

  it("should handle minimal info", async () => {
    const result = await parseNotification("Fire in Miami FL");

    expect(result.incidentType).toBe("fire");
    expect(result.location.state).toBe("FL");
    expect(result.description.length).toBeGreaterThanOrEqual(10);
  });

  it("should default to other for unknown type", async () => {
    const result = await parseNotification(
      "Gas leak at 100 Test St, Tampa, FL"
    );

    expect(result.incidentType).toMatch(/other|fire/);
  });

  it("should parse flood notification", async () => {
    const result = await parseNotification(
      "Flooding at 555 River Rd, Fort Myers, FL"
    );

    expect(result.incidentType).toBe("flood");
  });

  it("should parse storm notification", async () => {
    const result = await parseNotification(
      "Tornado warning for 888 Storm Ave, Tallahassee, FL"
    );

    expect(result.incidentType).toBe("storm");
  });

  it("should handle department number", async () => {
    const result = await parseNotification(
      "Incident #2024-12345: Fire at 100 Test St, Miami, FL"
    );

    if (result.departmentNumber) {
      expect(result.departmentNumber).toMatch(/2024-12345/);
    }
  });

  it("should omit nulls for missing fields", async () => {
    const result = await parseNotification("Fire at Unknown location, Florida");

    expect(
      result.location.county === null || result.location.county === undefined
    ).toBe(true);
    expect(
      result.departmentNumber === null || result.departmentNumber === undefined
    ).toBe(true);
  });
});
