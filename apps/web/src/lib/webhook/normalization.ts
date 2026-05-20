const STATE_TO_COMMERCIAL_CODE: Record<string, string> = {
  AL: "01",
  AK: "02",
  AZ: "03",
  AR: "04",
  CA: "05",
  CO: "06",
  CT: "07",
  DE: "08",
  FL: "09",
  GA: "10",
  HI: "11",
  ID: "12",
  IL: "13",
  IN: "14",
  IA: "15",
  KS: "16",
  KY: "17",
  LA: "18",
  ME: "19",
  MD: "20",
  MA: "21",
  MI: "22",
  MN: "23",
  MS: "24",
  MO: "25",
  MT: "26",
  NE: "27",
  NV: "28",
  NH: "29",
  NJ: "30",
  NM: "31",
  NY: "32",
  NC: "33",
  ND: "34",
  OH: "35",
  OK: "36",
  OR: "37",
  PA: "38",
  RI: "39",
  SC: "40",
  SD: "41",
  TN: "42",
  TX: "43",
  UT: "44",
  VT: "45",
  VA: "46",
  WA: "47",
  WV: "48",
  WI: "49",
  WY: "50",
};

const NYC_BOROUGH_TO_COUNTY: Record<string, string> = {
  manhattan: "New York",
  brooklyn: "Kings",
  queens: "Queens",
  bronx: "Bronx",
  "staten island": "Richmond",
};

const PROMO_DEPARTMENT_CODES = [
  "BNN",
  "BNDESK",
  "BNNDESK",
  "BNN DESK",
  "BNNDSK",
  "BN DESK",
];

export function extractRawAlertMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;

  const payload = body as Record<string, unknown>;
  const candidateKeys = ["message", "rawMessage", "text"];
  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }

  return null;
}

export function normalizeCountyBaseName(county: string | null | undefined): string | null {
  const trimmed = county?.trim();
  if (!trimmed) return null;

  const withoutCountySuffix = trimmed.replace(/(?:\s+county)+$/i, "").trim();
  return withoutCountySuffix || null;
}

export function normalizeNYCCounty(
  city: string,
  county: string | null | undefined,
  state: string,
): string | null {
  const normalizedCounty = normalizeCountyBaseName(county);
  if (state.trim().toUpperCase() !== "NY") return normalizedCounty;

  const normalizedCityKey = normalizeCountyBaseName(city)?.toLowerCase();
  if (normalizedCityKey && NYC_BOROUGH_TO_COUNTY[normalizedCityKey]) {
    return NYC_BOROUGH_TO_COUNTY[normalizedCityKey];
  }

  const normalizedCountyKey = normalizedCounty?.toLowerCase();
  if (normalizedCountyKey && NYC_BOROUGH_TO_COUNTY[normalizedCountyKey]) {
    return NYC_BOROUGH_TO_COUNTY[normalizedCountyKey];
  }

  return normalizedCounty;
}

export function normalizeDepartmentCodes(codes: string[] | null | undefined): string[] {
  if (!codes) return [];

  return codes
    .flatMap((code) => code.split("/"))
    .map((code) => code.trim())
    .filter((code) => code.length > 0)
    .filter((code) => {
      const normalizedCode = code.toUpperCase().replace(/\s+/g, "");
      return !PROMO_DEPARTMENT_CODES.some(
        (promo) => normalizedCode === promo.replace(/\s+/g, ""),
      );
    });
}

function cityFirstLetterCode(city: string): string | null {
  const trimmed = city.trim();
  if (!trimmed) return null;

  const code = trimmed.charAt(0).toUpperCase().charCodeAt(0) - 64;
  if (code < 1 || code > 26) return "00";
  return code.toString().padStart(2, "0");
}

export function generateCommercialDisplayId(
  alertId: string | null | undefined,
  state: string,
  city: string,
): string | null {
  const stateCode = STATE_TO_COMMERCIAL_CODE[state.trim().toUpperCase()];
  const cityCode = cityFirstLetterCode(city);
  const digits = alertId?.replace(/\D/g, "") ?? "";

  if (!stateCode || !cityCode || digits.length === 0) return null;

  const alertSuffix = Number.parseInt(digits.slice(-6).padStart(6, "0"), 10) + 939897;
  return `${stateCode}${alertSuffix}${cityCode}`;
}
