# Parsing and Normalization Contract

Last updated: 2026-05-19

## Backend Parser Architecture

### Current Parser Files

**Primary parsing:**
- `apps/web/src/lib/webhook/parser.ts` - OpenAI structured parsing with Zod schema
- `apps/web/src/lib/webhook/geocoder.ts` - Google Maps Geocoding API
- `apps/web/src/app/api/webhook/route.ts` - Webhook ingestion and Firestore writes

**Support files:**
- `apps/web/tests/webhook-parser.test.ts` - Parser unit tests
- `apps/web/tests/__mocks__/ai.ts` - Mock AI responses for tests
- `apps/web/src/app/api/admin/cleanup-promo-codes/route.ts` - Department code filtering
- `apps/web/src/app/api/admin/merge-duplicates/route.ts` - Duplicate detection by alertId

### Normalization Flow

```
External Alert
    ↓
[Webhook Route] extractRawAlertMessage() → sanitizeInput() → remove control chars, limit 10k
    ↓
[Parser] parseNotification() → OpenAI gpt-4o-mini structured output
    ↓
[Geocoder] geocodeAddress() → Google Maps Geocoding API
    ↓
[Webhook Route] Check existing by alertId
    ↓
[Firestore] Create incident OR append activity
    ↓
[Webhook Logs] Audit log with parsed data
```

`POST /api/webhook` parses only supported raw message fields: `message`, `rawMessage`, or `text`.
It no longer passes `JSON.stringify(body)` into the parser. If none of those top-level fields contains
a non-empty string, the route returns `400` and does not attempt a JSON-object fallback.

Original BNN-style alert streams carry the alert type in the field immediately before the alert message.
The backend parser owns converting that source field into normalized `incidentType` / Firestore `type`
and any future category field. Android must not infer alert type from the message body, must not parse raw
alerts, and must display only normalized Firestore fields. Emoji hints are additive presentation only and
must never replace text labels. `BNNDESK` must not show in UI, but valid fire department codes after it
must be preserved.

## Alert Type Bug Root Cause

### Fixed Issue
Android is displaying many alert types as "Fire" when they should be other types.

### Root Cause Analysis

**Parser output:** `incidentType` field
- Values: `"fire" | "flood" | "storm" | "wind" | "hail" | "other"`
- Source: OpenAI structured parsing with prompt guidance

**Firestore field:** `type` field
- Values: Same enum as parser
- Written by: `apps/web/src/app/api/webhook/route.ts:263`
```typescript
type: parsed.incidentType
```

**Android reads:** `incident.type`
- DTO: `FirestoreIncidentDto.type` (String)
- Domain: `Incident.type` (String)
- Display: `HomeFeedCardFormatter.kt` humanizes type

**Diagnosis:** Parser is over-classifying incidents as "fire"

**Evidence from parser.ts lines 99-101:**
```
<incident_type>
fire, flood, storm, wind, hail, other
Map: "Smoke Condition" → fire, "Fuel Spill" → other
</incident_type>
```

**Probable causes:**
1. Prompt guidance insufficient for edge cases
2. OpenAI model defaults to "fire" for ambiguous emergency text
3. Gas leaks, utility issues, traffic incidents all classified as "other" in examples
4. No explicit guidance for: medical, police, EMS, hazmat, gas leak, utility, traffic

**Fix implemented:** Parser prompt now explicitly defaults ambiguous/non-fire incidents to `other`,
and tests cover gas leaks, hazmat/fuel spills, utility/power-line incidents, EMS/medical/injury,
vehicle/MVA/traffic incidents, and police/law-enforcement incidents.

### Recommended Parser Prompt Enhancement

Add to `<incident_type>` section:
```
<incident_type>
Classification rules (in priority order):
1. fire: Structure fire, vehicle fire, brush fire, smoke condition, 10-75 signal
2. flood: Flooding, water rescue, flash flood, high water
3. storm: Severe weather, tornado, hurricane, storm damage, wind damage
4. wind: High winds (standalone), downed trees from wind
5. hail: Hail damage, hail storm
6. other: Gas leak, utility issue, traffic accident, medical, EMS, police, hazmat, fuel spill, power outage, water main break, building collapse, any non-weather emergency

IMPORTANT: Default to "other" if incident type is unclear. Do NOT default to "fire".

Examples:
- "BC23 reports Natl Grid mitigated leak" → other (utility/gas)
- "10-75 transmitted" → fire (FDNY working fire signal)
- "EMS responding to cardiac arrest" → other (medical)
- "Vehicle accident with injuries" → other (traffic)
- "Smoke condition in building" → fire
- "Water rescue in progress" → flood
- "High winds downed power lines" → wind (if wind is primary) OR other (if utility is primary)
</incident_type>
```

## Normalized Firestore Fields for Android

### Android Must Use These Exact Firestore Fields

**Alert identity:**
- `alertId` - External source alert ID (nullable)
- `displayId` - Human-readable INC-000001
- `commercialDisplayId` - Optional backend-generated public/commercial reference for valid new incidents only
- `id` - Firestore document ID (Android-local field)

**Alert classification:**
- `type` - Incident type enum string
- `description` - Event summary text
- `alarmLevel` - Fire alarm level (nullable)
- `emergencyServicesStatus` - Dispatch status (nullable)

**Location (backend-geocoded):**
- `location.lat` - Latitude
- `location.lng` - Longitude
- `location.address` - Street address
- `location.city` - City name
- `location.county` - County name (nullable)
- County values are stored as base names without repeated `County` suffix, e.g. `New York`, not `New York County County`
- `location.state` - Two-letter state code

**Department/source:**
- `departmentNumber` - Array of department codes (filtered)
- `source` - Always stored in activity metadata, not incident root

**Timeline:**
- `createdAt` - Incident created epoch millis
- `updatedAt` - Last activity epoch millis
- `activityCount` - Number of activities

**Response tracking:**
- `responderIds` - Array of profile IDs
- `respondedAt` - First response epoch millis
- `responderCount` - Count of responders
- `securedById` - Profile ID who secured
- `securedAt` - Secured epoch millis

**Status:**
- `status` - "active" or "closed"
- `closedAt` - Closed epoch millis
- `closedById` - Profile ID who closed

**Homeowner (optional):**
- `homeowner.name`
- `homeowner.contact`
- `homeowner.phone`
- `homeowner.email`
- `homeowner.address`
- `homeowner.insurance.policyNumber`
- `homeowner.insurance.carrier`
- `homeowner.insurance.claimsPhone`
- `homeowner.description`
- `homeowner.adjuster.name`
- `homeowner.adjuster.phone`
- `homeowner.notes`

### Fields Android Must NOT Use

❌ `alertFlags` - Does not exist in Firestore
❌ Raw webhook message text - Not stored in incidents
❌ Parser confidence scores - Not exposed
❌ Geocoding metadata - Not stored

### Distance Calculation
Android calculates miles locally:
- Input: Device location + `incident.location.lat/lng`
- Method: Haversine formula (same as web)
- Storage: Display-only, not written to Firestore

## NYC Borough Normalization Strategy

### Problem
NYC borough names are colloquial and differ from county names:
- Manhattan = New York County
- Brooklyn = Kings County
- Queens = Queens County
- Bronx = Bronx County
- Staten Island = Richmond County

### Current State
Parser extracts `location.city` and `location.county` from webhook text.
Borough names may appear in either field depending on source format.

### Normalization Strategy

#### Backend (Webhook Route)
County normalization runs after parsing/geocoding and before Firestore writes:

```typescript
const NYC_BOROUGH_TO_COUNTY: Record<string, string> = {
  manhattan: "New York",
  brooklyn: "Kings",
  queens: "Queens",
  bronx: "Bronx",
  "staten island": "Richmond"
};

function normalizeNYCCounty(city: string, county: string | null, state: string): string | null {
  if (state !== "NY") return county;

  const cityLower = city.toLowerCase().trim();
  const normalizedCounty = NYC_BOROUGH_TO_COUNTY[cityLower];

  if (normalizedCounty) {
    return normalizedCounty;
  }

  // Check if county is actually a borough name
  if (county) {
    const countyLower = county.toLowerCase().trim();
    const normalizedFromCounty = NYC_BOROUGH_TO_COUNTY[countyLower];
    if (normalizedFromCounty) return normalizedFromCounty;
  }

  return county;
}
```

**Implementation location:** `apps/web/src/lib/webhook/normalization.ts`, called by `apps/web/src/app/api/webhook/route.ts` after geocoding.
The helper also strips repeated trailing `County` suffixes for all states before writing `location.county`.

**Usage:**
```typescript
const normalizedCounty = normalizeNYCCounty(
  parsed.location.city,
  parsed.location.county,
  parsed.location.state
);

const incidentData = {
  // ...
  location: {
    ...coords,
    address: parsed.location.address,
    city: parsed.location.city,
    county: normalizedCounty,
    state: parsed.location.state
  }
};
```

#### Android Display
Preserve borough display for UI:
```kotlin
fun Location.displayName(): String {
  if (state == "NY" && county != null) {
    val borough = when (county) {
      "New York" -> "Manhattan"
      "Kings" -> "Brooklyn"
      "Queens" -> "Queens"
      "Bronx" -> "Bronx"
      "Richmond" -> "Staten Island"
      else -> null
    }
    if (borough != null) {
      return "$borough, $city, NY"
    }
  }
  return if (county != null) "$county County, $city, $state" else "$city, $state"
}
```

### Rationale
- **Consistent queries:** Filter/search by county works across all NYC incidents
- **User familiarity:** Display preserves "Manhattan" instead of "New York County"
- **Geocoding accuracy:** Google Maps returns official county names
- **Regional parity:** Queens works naturally for both borough and county

## AdjustLeads Future Source Integration

### Context
AdjustLeads is a potential future alert source for property damage leads.

Do not create AdjustLeads ingestion in the current parser contract. The future path should add a
separate structured parser/validator and then write through the same normalized incident contract.

### Expected Data Format (Hypothetical)
```json
{
  "adjustLeadsId": "AL-2024-0512",
  "incidentType": "storm_damage",
  "address": "742 Evergreen Terrace",
  "city": "Springfield",
  "county": "Sangamon",
  "state": "IL",
  "description": "Roof damage from severe storm, missing shingles",
  "estimatedDamage": "$15,000",
  "homeowner": {
    "name": "Homer Simpson",
    "phone": "555-0123"
  },
  "timestamp": "2024-05-19T14:30:00Z",
  "mapsUrl": "https://maps.google.com/?q=742+Evergreen+Terrace+Springfield+IL",
  "adjustLeadsUrl": "https://adjustleads.com/lead/AL-2024-0512"
}
```

### Normalization Fields

**Current incident fields that map cleanly:**
- `type` ← "storm" (map "storm_damage" → "storm")
- `description` ← "Roof damage from severe storm, missing shingles"
- `location.address` ← "742 Evergreen Terrace"
- `location.city` ← "Springfield"
- `location.county` ← "Sangamon"
- `location.state` ← "IL"
- `homeowner.name` ← "Homer Simpson"
- `homeowner.phone` ← "555-0123"

**Future normalized source object:**
```typescript
interface NormalizedIncidentSource {
  type: "bnn" | "pulsepoint" | "active911" | "adjustleads" | "manual";
  externalId?: string;  // alertId for BNN, adjustLeadsId for AdjustLeads
  url?: string;         // source detail URL when provided
  mapsUrl?: string;     // source map URL when provided
  timestamp?: number;   // source event timestamp in epoch millis
  rawSource?: string;   // source label, not raw alert text
}
```

**Backend Firestore write:**
```typescript
const incidentData = {
  alertId: data.adjustLeadsId,
  displayId: await getNextIncidentNumber(),
  type: normalizeIncidentType(data.incidentType), // "storm_damage" → "storm"
  description: data.description,
  location: {
    lat: coords.lat,
    lng: coords.lng,
    address: data.address,
    city: data.city,
    county: data.county,
    state: data.state
  },
  source: {
    type: "adjustleads",
    externalId: data.adjustLeadsId,
    url: data.adjustLeadsUrl,
    timestamp: new Date(data.timestamp).getTime()
  },
  homeowner: {
    name: data.homeowner.name,
    phone: data.homeowner.phone
  },
  estimatedDamage: data.estimatedDamage,
  mapsUrl: data.mapsUrl,
  status: "active",
  responderIds: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
};
```

**Android reads existing fields, ignores unknown fields**

### Parser Strategy
Create separate parser for AdjustLeads webhook:
- `apps/web/src/lib/webhook/adjustleads-parser.ts`
- No OpenAI parsing needed - structured JSON input
- Validate with Zod schema
- Reuse geocoder if lat/lng not provided

**Route detection:**
```typescript
// apps/web/src/app/api/webhook/route.ts
const body = await request.json();

if (body.adjustLeadsId) {
  // AdjustLeads webhook
  const parsed = parseAdjustLeadsNotification(body);
  // ... process AdjustLeads-specific flow
} else if (body.message) {
  // BNN/text webhook
  const parsed = await parseNotification(sanitizeInput(body.message));
  // ... existing flow
}
```

## Commercial Display ID Strategy

### Purpose
Generate deterministic public-safe display IDs for commercial/marketing without exposing internal Firestore IDs or sequential incident numbers.

### Format Specification
```
{STATE_CODE}{ALERT_ID_SUFFIX}{CITY_CODE}
```

**Components:**
1. `STATE_CODE` - Two-digit code 01-50 (Alabama=01, Wyoming=50)
2. `ALERT_ID_SUFFIX` - Last 6 digits of alertId + 939897
3. `CITY_CODE` - Two-digit code A=01, Z=26 (first letter of city)

**Example:**
- State: FL (Florida = 09)
- Alert ID: 1839267 → Last 6 digits: 839267 + 939897 = 1779164
- City: Miami → First letter M = 13
- Commercial Display ID: `09177916413`

### State Code Mapping
```typescript
const STATE_TO_CODE: Record<string, string> = {
  AL: "01", AK: "02", AZ: "03", AR: "04", CA: "05",
  CO: "06", CT: "07", DE: "08", FL: "09", GA: "10",
  HI: "11", ID: "12", IL: "13", IN: "14", IA: "15",
  KS: "16", KY: "17", LA: "18", ME: "19", MD: "20",
  MA: "21", MI: "22", MN: "23", MS: "24", MO: "25",
  MT: "26", NE: "27", NV: "28", NH: "29", NJ: "30",
  NM: "31", NY: "32", NC: "33", ND: "34", OH: "35",
  OK: "36", OR: "37", PA: "38", RI: "39", SC: "40",
  SD: "41", TN: "42", TX: "43", UT: "44", VT: "45",
  VA: "46", WA: "47", WV: "48", WI: "49", WY: "50"
};
```

### City Code Mapping
```typescript
function cityFirstLetterCode(city: string): string {
  const first = city.charAt(0).toUpperCase();
  const code = first.charCodeAt(0) - 64; // A=1, Z=26
  if (code < 1 || code > 26) return "00"; // Non-letter fallback
  return code.toString().padStart(2, "0");
}
```

### Backend Implementation
**Location:** `apps/web/src/lib/webhook/normalization.ts`

```typescript
export function generateCommercialDisplayId(
  alertId: string | null | undefined,
  state: string,
  city: string
): string | null {
  const stateCode = STATE_TO_CODE[state.toUpperCase()];
  if (!stateCode || !city.trim()) return null;

  // Extract last 6 digits of alertId
  const alertDigits = alertId?.replace(/\D/g, "") ?? ""; // Remove non-digits
  if (!alertDigits) return null;
  const last6 = alertDigits.slice(-6).padStart(6, "0");
  const alertSuffix = (parseInt(last6, 10) + 939897).toString();

  const cityCode = cityFirstLetterCode(city);

  return `${stateCode}${alertSuffix}${cityCode}`;
}
```

**Integration:**
```typescript
// apps/web/src/app/api/webhook/route.ts
const commercialDisplayId = generateCommercialDisplayId(
  parsed.alertId,
  parsed.location.state,
  parsed.location.city
);

const incidentData = {
  alertId: parsed.alertId ?? null,
  displayId: await getNextIncidentNumber(), // INC-000001
  ...(commercialDisplayId ? { commercialDisplayId } : {}),
  // ... rest of incident
};
```

### Guardrails

- `commercialDisplayId` is optional and written only for new incidents when `alertId`, state, and city are valid.
- Missing or non-numeric `alertId` returns `null`.
- Unknown state returns `null`.
- Non-letter city first characters use city code `00`; blank city returns `null`.
- Do not use `commercialDisplayId` as the Firestore document ID.
- Do not use `commercialDisplayId` for authorization, tenant isolation, or other security decisions.
- Do not rely on `commercialDisplayId` uniqueness unless a future dedicated uniqueness strategy is implemented.

### Android Display
```kotlin
data class Incident(
  // ...
  val displayId: String,  // INC-000001 for internal use
  val commercialDisplayId: String?  // 1017791643 for public display
)

fun Incident.publicDisplayId(): String {
  return commercialDisplayId ?: displayId
}
```

**Use cases:**
- Marketing materials
- Public incident tracking
- Customer-facing URLs
- Shareable incident references
- Print media

**DO NOT use for:**
- Internal operations
- Firestore document identity (use Firestore ID)
- Security-sensitive operations

## Parser Test Recommendations

### Current Coverage
`apps/web/tests/webhook-parser.test.ts` has basic parser tests.

### Missing Test Cases
1. Alert type edge cases (gas leak, medical, traffic → "other")
2. NYC borough normalization
3. BNNDESK/promo code filtering
4. Department code deduplication
5. Alarm level vs. signal code distinction (10-75 is NOT an alarm level)
6. Update detection accuracy (isUpdate flag)
7. Multiple department codes with slashes
8. County field nullable handling
9. Description field does not contain location fields
10. Alert ID extraction from different formats

### Recommended Test Suite

```typescript
describe("Parser edge cases", () => {
  it("classifies gas leak as other, not fire", async () => {
    const result = await parseNotification(
      "NY| Staten Island| 200 Penn Ave| BC23 reports Natl Grid mitigated leak | <C> BNN | BNNDESK/nyc075 | #1839844"
    );
    expect(result.incidentType).toBe("other");
  });

  it("classifies 10-75 as fire without alarm level", async () => {
    const result = await parseNotification(
      "NY | Westchester | Ossining | Still Ct | Fire | 10-75 transmitted for a working fire."
    );
    expect(result.incidentType).toBe("fire");
    expect(result.alarmLevel).toBeNull();
  });

  it("filters BNNDESK from department codes", () => {
    const filtered = filterPromoCodes(["BNNDESK", "nyc075", "BNN"]);
    expect(filtered).toEqual(["nyc075"]);
  });

  it("normalizes Manhattan to New York County", () => {
    const normalized = normalizeNYCCounty("Manhattan", null, "NY");
    expect(normalized).toBe("New York");
  });

  it("preserves non-NYC county unchanged", () => {
    const normalized = normalizeNYCCounty("Chicago", "Cook", "IL");
    expect(normalized).toBe("Cook");
  });
});
```

## Summary of Changes Required

### Backend (Webhook/Parser)
1. ✅ Parser prompt explicitly defaults ambiguous/non-fire incidents to `other`
2. ✅ Webhook route sends raw alert message strings to `parseNotification`, not `JSON.stringify(body)`
3. ✅ NYC borough/county-base normalization exists in backend helpers
4. ✅ Backend-only commercial display ID generator exists for valid new incidents
5. ⏳ AdjustLeads parser remains future work
6. ✅ Extended parser/helper test coverage added

### Firestore Schema
1. ✅ Current incident fields support requirements
2. ✅ `commercialDisplayId` is optional on incident writes and TypeScript/Android DTOs
3. ⏳ Normalized `source` metadata object remains future work
4. ⏳ `estimatedDamage` remains future AdjustLeads work
5. ⏳ `mapsUrl` remains future AdjustLeads work

### Android
1. ✅ Current DTOs tolerate nullable fields and optional `commercialDisplayId`
2. ✅ Distance calculation is client-side
3. ⏳ Borough-friendly display formatting remains optional follow-up
4. ✅ `commercialDisplayId` support is optional/tolerant and not used for security
5. ✅ Alert type humanization already implemented
