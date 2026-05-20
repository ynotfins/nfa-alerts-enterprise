import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { normalizeDepartmentCodes } from "./normalization";

const activityTypes = [
  "fire_arrived",
  "police_arrived",
  "ems_arrived",
  "fire_cleared",
  "police_cleared",
  "ems_cleared",
  "utilities_notified",
  "power_restored",
  "gas_secured",
  "water_secured",
  "road_cleared",
  "road_closed",
  "evacuation_ordered",
  "evacuation_lifted",
  "shelter_opened",
  "shelter_closed",
  "hazmat_cleared",
  "structural_engineer_arrived",
  "insurance_adjuster_arrived",
  "building_condemned",
  "area_secured",
  "traffic_diverted",
  "power_outage",
  "water_main_break",
  "gas_leak_detected",
  "gas_leak_contained",
  "search_rescue_active",
  "search_rescue_complete",
  "casualties_reported",
  "all_clear",
  "alarm_all_hands",
  "alarm_2nd",
  "alarm_3rd",
  "alarm_4th",
  "alarm_5th",
  "custom",
] as const;

export const notificationSchema = z.object({
  source: z.string().min(1).max(50),
  alertId: z.string().min(1).max(100).nullable().optional(),
  isUpdate: z.boolean(),
  incidentType: z.enum(["fire", "flood", "storm", "wind", "hail", "other"]),
  location: z.object({
    address: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    county: z.string().min(1).max(100).nullable().optional(),
    state: z.string().length(2),
  }),
  description: z.string().min(10).max(2000),
  departmentNumber: z.array(z.string()).nullable().optional(),
  alarmLevel: z
    .enum(["all_hands", "2nd_alarm", "3rd_alarm", "4th_alarm", "5th_alarm"])
    .nullable()
    .optional(),
  activityType: z.enum(activityTypes).nullable().optional(),
  activityDescription: z.string().min(5).max(1000).nullable().optional(),
});

export type ParsedNotification = z.infer<typeof notificationSchema>;

export async function parseNotification(
  text: string,
  retryAttempt = 0
): Promise<ParsedNotification> {
  const maxRetries = 3;

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      mode: "json",
      schema: notificationSchema,
      temperature: 0.1,
      prompt: `<task>Parse emergency notification into structured data</task>

<input>${text}</input>

<format_spec>
BNN Format: [Type] [State]| [County]| [City]| [Alarm]| [Address]| [Event] | <C> [Org] | [Codes] | #[ID]
Example: "U/D NJ| Union| Elizabeth| 4th Alarm| 323 Stiles St| fire placed u/c | <C> BNN | njk1r/nj159 | #1839267"
</format_spec>

<extraction_rules>
<source>
- "BNN" if contains "|" and "<C>"
- "PulsePoint"/"Active911"/"Scanner" if contains those terms
- "Manual" otherwise
</source>

<is_update>
true if starts with "U/D"/"Update" OR contains: arrived, on scene, cleared, secured, restored
</is_update>

<incident_type>
Classification rules, in priority order:
- fire: structure fire, working fire, vehicle fire, brush fire, smoke condition, 10-75 signal
- flood: flooding, water rescue, flash flood, high water
- storm: severe weather, tornado, hurricane, broad storm damage
- wind: high winds or wind damage when wind is the primary incident
- hail: hail damage or hail storm
- other: gas leak, utility issue, power lines, power outage, fuel spill, hazmat, medical, EMS, injury, vehicle/MVA/traffic crash, police/law enforcement, water main break, building collapse, or any unclear/non-weather emergency
IMPORTANT: Default ambiguous or non-fire incidents to "other". Do NOT default to "fire".
</incident_type>

<location>
BNN pipe-delimited fields:
- state: 1st field after type (NJ, NY, FL)
- county: 2nd field (Union, Westchester) [optional]
- city: 3rd field (Elizabeth, Ossining)
- address: address field (323 Stiles St, Still Ct)
</location>

<description>
CRITICAL: Extract ONLY event detail text. NEVER include state/county/city/address.
Good: "fire placed u/c", "10-75 transmitted for a working fire"
Bad: "NJ| Union| Elizabeth| fire placed u/c"
</description>

<optional_fields>
- alertId: Number after final # (e.g., "1839267" from "#1839267")
- departmentNumber: Array of codes between "| <C> [ORG] |" and "| #", split by "/"
  Include ONLY: state prefix (2 lowercase) + alphanumeric (njk1r, ny548, nj159)
  Exclude: alert IDs (pure numbers), org names (BNNDESK, BNN)
- alarmLevel: ONLY these exact values or null:
  "all_hands" (for "All Hands" or "1st Alarm")
  "2nd_alarm" (for "2nd Alarm")
  "3rd_alarm" (for "3rd Alarm")
  "4th_alarm" (for "4th Alarm")
  "5th_alarm" (for "5th Alarm")
  IMPORTANT: Fire signal codes like "10-75", "10-76" are NOT alarm levels. Set null if no alarm level.
- activityType: (ONLY if isUpdate=true)
  Arrivals: fire_arrived, police_arrived, ems_arrived
  Cleared: fire_cleared, police_cleared, ems_cleared, all_clear
  Alarms: alarm_all_hands, alarm_2nd, alarm_3rd, alarm_4th, alarm_5th
  Utilities: utilities_notified, power_restored, gas_secured, water_secured
  Other: hazmat_cleared, building_condemned, custom
- activityDescription: (ONLY if isUpdate=true)
</optional_fields>
</extraction_rules>

<examples>
Input: "U/D NJ| Union| Elizabeth| 4th Alarm| 323 Stiles St| fire placed u/c | <C> BNN | BNNDESK/njk1r/nj159 | #1839267"
Output: {source:"BNN", location:{state:"NJ", county:"Union", city:"Elizabeth", address:"323 Stiles St"}, description:"fire placed u/c", alarmLevel:"4th_alarm", departmentNumber:["njk1r","nj159"], alertId:"1839267", isUpdate:true, incidentType:"fire"}

Input: "NY | Westchester | Ossining | Still Ct | Fire | 10-75 transmitted for a working fire."
Output: {source:"BNN", location:{state:"NY", county:"Westchester", city:"Ossining", address:"Still Ct"}, description:"10-75 transmitted for a working fire", incidentType:"fire", isUpdate:false, alarmLevel:null}

Input: "U/D NY| Staten Island| 10-75| SI-2616| 200 Penn Ave| BC23 reports Natl Grid mitigated leak | <C> BNN | BNNDESK/nyc075 | #1839844"
Output: {source:"BNN", location:{state:"NY", county:null, city:"Staten Island", address:"200 Penn Ave"}, description:"BC23 reports Natl Grid mitigated leak", incidentType:"other", isUpdate:true, alarmLevel:null, departmentNumber:["nyc075"], alertId:"1839844", activityType:"custom"}

Input: "NJ| Bergen| Hackensack| Fuel Spill| 70 River St| fuel spill with hazmat requested | <C> BNN | BNNDESK/nj125 | #1840001"
Output: {source:"BNN", location:{state:"NJ", county:"Bergen", city:"Hackensack", address:"70 River St"}, description:"fuel spill with hazmat requested", incidentType:"other", isUpdate:false, alarmLevel:null, departmentNumber:["nj125"], alertId:"1840001"}

Input: "NY| Queens| Queens| All Hands| 55 Main St| fire on the 2nd floor | <C> BNN | nyq123 | #1840002"
Output: {source:"BNN", location:{state:"NY", county:"Queens", city:"Queens", address:"55 Main St"}, description:"fire on the 2nd floor", incidentType:"fire", isUpdate:false, alarmLevel:"all_hands", departmentNumber:["nyq123"], alertId:"1840002"}
</examples>`,
    });

    const departmentNumber = normalizeDepartmentCodes(result.object.departmentNumber);
    const parsed = {
      ...result.object,
      departmentNumber: departmentNumber.length > 0 ? departmentNumber : null,
    };

    if (!parsed.location?.address || parsed.location.address.length < 3) {
      throw new Error("Invalid address extracted");
    }

    if (!parsed.description || parsed.description.length < 5) {
      throw new Error("Invalid description extracted");
    }

    if (parsed.description.includes("|") || parsed.description.includes(parsed.location.city)) {
      throw new Error("Description contains location fields");
    }

    return parsed;
  } catch (error) {
    if (retryAttempt < maxRetries) {
      console.warn(`[PARSER] Retry ${retryAttempt + 1}/${maxRetries}:`, error);
      await new Promise((resolve) => setTimeout(resolve, 500 * (retryAttempt + 1)));
      return parseNotification(text, retryAttempt + 1);
    }
    throw error;
  }
}
