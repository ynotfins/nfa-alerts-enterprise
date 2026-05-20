import { describe, it, expect } from "vitest";
import { parseNotification } from "../src/lib/webhook/parser";
import {
  extractRawAlertMessage,
  generateCommercialDisplayId,
  normalizeDepartmentCodes,
  normalizeNYCCounty,
} from "../src/lib/webhook/normalization";

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

  it("should default gas leak to other for unknown type", async () => {
    const result = await parseNotification(
      "Gas leak at 100 Test St, Tampa, FL"
    );

    expect(result.incidentType).toBe("other");
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
      "FL| Miami-Dade| Miami| Structure Fire| 100 Test St| working fire | <C> BNN | fl123/fl456 | #202412345"
    );

    expect(result.departmentNumber).toEqual(["fl123", "fl456"]);
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

describe("Webhook Parser contract edge cases", () => {
  const otherIncidentCases = [
    ["gas leak", "Gas leak at 100 Test St, Tampa, FL"],
    ["fuel spill/hazmat", "Fuel spill with hazmat requested at 100 Test St, Tampa, FL"],
    ["utility issue/power lines", "Utility issue with power lines down at 100 Test St, Tampa, FL"],
    ["EMS/medical/injury", "EMS medical call with injury at 100 Test St, Tampa, FL"],
    ["vehicle/MVA/traffic", "Vehicle MVA traffic crash at 100 Test St, Tampa, FL"],
    ["police/law enforcement", "Police law enforcement activity at 100 Test St, Tampa, FL"],
  ] as const;

  it.each(otherIncidentCases)("classifies %s as other", async (_label, message) => {
    const result = await parseNotification(message);

    expect(result.incidentType).toBe("other");
  });

  it("classifies smoke condition as fire", async () => {
    const result = await parseNotification(
      "NY| New York County| Manhattan| Smoke Condition| 123 Broadway| smoke condition in basement | <C> BNN | nyc075 | #1839001"
    );

    expect(result.incidentType).toBe("fire");
  });

  it("classifies working fire as fire", async () => {
    const result = await parseNotification(
      "NY| Kings County| Brooklyn| Fire| 456 Atlantic Ave| working fire in commercial building | <C> BNN | nyb123 | #1839002"
    );

    expect(result.incidentType).toBe("fire");
  });

  it("classifies 10-75 as fire without treating it as alarmLevel", async () => {
    const result = await parseNotification(
      "NY| Westchester| Ossining| 10-75| 12 Still Ct| 10-75 transmitted for a working fire | <C> BNN | nyw123 | #1839003"
    );

    expect(result.incidentType).toBe("fire");
    expect(result.alarmLevel).toBeNull();
  });

  it.each([
    ["All Hands", "all_hands"],
    ["2nd Alarm", "2nd_alarm"],
    ["3rd Alarm", "3rd_alarm"],
  ] as const)("extracts %s alarm levels", async (alarmText, expected) => {
    const result = await parseNotification(
      `NY| Queens| Queens| ${alarmText}| 55 Main St| fire on the 2nd floor | <C> BNN | nyq123 | #1839004`
    );

    expect(result.alarmLevel).toBe(expected);
  });

  it("filters BNNDESK out of departmentNumber", async () => {
    const result = await parseNotification(
      "NY| Richmond County| Staten Island| 10-75| 200 Penn Ave| BC23 reports Natl Grid mitigated leak | <C> BNN | BNNDESK/nyc075 | #1839844"
    );

    expect(result.departmentNumber).toEqual(["nyc075"]);
  });

  it("preserves slash-separated department codes", async () => {
    const result = await parseNotification(
      "NJ| Union| Elizabeth| 4th Alarm| 323 Stiles St| fire placed u/c | <C> BNN | BNNDESK/njk1r/nj159/nyc075 | #1839267"
    );

    expect(result.departmentNumber).toEqual(["njk1r", "nj159", "nyc075"]);
  });

  it("detects updates from U/D prefix", async () => {
    const result = await parseNotification(
      "U/D NJ| Union| Elizabeth| 4th Alarm| 323 Stiles St| fire placed u/c | <C> BNN | njk1r/nj159 | #1839267"
    );

    expect(result.isUpdate).toBe(true);
  });

  it.each([
    ["Manhattan", "New York County", "New York"],
    ["Brooklyn", "Kings County", "Kings"],
    ["Queens", "Queens County", "Queens"],
    ["Bronx", "Bronx County", "Bronx"],
    ["Staten Island", "Richmond County", "Richmond"],
  ] as const)("normalizes NYC borough %s to county base name", (city, county, expected) => {
    expect(normalizeNYCCounty(city, county, "NY")).toBe(expected);
  });
});

describe("Webhook backend normalization helpers", () => {
  it("extracts raw message from supported payload shapes without stringifying objects", () => {
    expect(extractRawAlertMessage({ message: " Fire at 123 Main St " })).toBe(
      "Fire at 123 Main St",
    );
    expect(extractRawAlertMessage({ rawMessage: "Gas leak at 1 Main St" })).toBe(
      "Gas leak at 1 Main St",
    );
    expect(extractRawAlertMessage({ text: "EMS at 1 Main St" })).toBe(
      "EMS at 1 Main St",
    );
    expect(extractRawAlertMessage({ payload: { message: "nested ignored" } })).toBeNull();
  });

  it("normalizes department codes from mixed slash-separated values", () => {
    expect(normalizeDepartmentCodes(["BNNDESK/nyc075", "nj159"])).toEqual([
      "nyc075",
      "nj159",
    ]);
  });

  it("generates commercialDisplayId from valid alert, state, and city", () => {
    expect(generateCommercialDisplayId("1839267", "FL", "Miami")).toBe("09177916413");
  });

  it("uses city code 00 for non-letter city starts", () => {
    expect(generateCommercialDisplayId("1839267", "FL", "123 Main")).toBe("09177916400");
  });

  it("returns null for missing numeric alertId or invalid state/city", () => {
    expect(generateCommercialDisplayId("BNN-ABC", "FL", "Miami")).toBeNull();
    expect(generateCommercialDisplayId("1839267", "XX", "Miami")).toBeNull();
    expect(generateCommercialDisplayId("1839267", "FL", "")).toBeNull();
  });
});
