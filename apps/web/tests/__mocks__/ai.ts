import { vi } from "vitest";

// Mock response generator based on input text
function generateMockResponse(prompt: string) {
  // Extract just the input text from the prompt (between <input> and </input>)
  const inputMatch = prompt.match(/<input>([\s\S]*?)<\/input>/i);
  const inputText = inputMatch ? inputMatch[1] : prompt;
  const text = inputText.toLowerCase();
  const bnnParts = inputText.split("|").map((part) => part.trim());
  
  // Determine source - check for specific patterns
  let source = "Manual";
  // BNN format uses pipe-delimited fields (e.g., "FL| Miami-Dade| Miami| Structure Fire| 123 Main Street")
  // Check for multiple pipes which indicates BNN format
  const pipeCount = (text.match(/\|/g) || []).length;
  const isBnnFormat = pipeCount >= 3;
  if (isBnnFormat) {
    source = "BNN";
  } else if (text.includes("pulsepoint:") || text.includes("pulsepoint ")) {
    source = "PulsePoint";
  } else if (text.includes("active911")) {
    source = "Active911";
  } else if (text.includes("scanner") || text.includes("engine") || text.includes("responding")) {
    source = "Scanner";
  }
  
  // Determine if update - be more specific about what constitutes an update
  // "Fire at X" is NOT an update, but "FD arrived at X" IS an update
  const isUpdate = text.includes("u/d") || 
    text.includes("update") || 
    text.includes("fd arrived") ||
    text.includes("pd on scene") ||
    text.includes("pd arrived") ||
    text.includes("ems arrived") ||
    text.includes("fire cleared") ||
    text.includes("cleared at") ||
    text.includes("secured") || 
    text.includes("restored") ||
    text.includes("all clear") ||
    text.includes("evacuation");
  
  // Determine incident type - check flood/storm BEFORE fire
  let incidentType: "fire" | "flood" | "storm" | "wind" | "hail" | "other" = "other";
  if (
    text.includes("gas leak") ||
    text.includes("natl grid") ||
    text.includes("fuel spill") ||
    text.includes("hazmat") ||
    text.includes("haz mat") ||
    text.includes("utility") ||
    text.includes("power line") ||
    text.includes("power outage") ||
    text.includes("ems") ||
    text.includes("medical") ||
    text.includes("injury") ||
    text.includes("injured") ||
    text.includes("vehicle") ||
    text.includes("mva") ||
    text.includes("traffic") ||
    text.includes("police") ||
    text.includes("law enforcement")
  ) {
    incidentType = "other";
  } else if (text.includes("flood") || text.includes("water rescue")) {
    incidentType = "flood";
  } else if (text.includes("storm") || text.includes("tornado") || text.includes("severe weather")) {
    incidentType = "storm";
  } else if (text.includes("wind") || text.includes("downed power")) {
    incidentType = "wind";
  } else if (text.includes("hail")) {
    incidentType = "hail";
  } else if (
    text.includes("fire") ||
    text.includes("structure fire") ||
    text.includes("smoke") ||
    text.includes("10-75")
  ) {
    incidentType = "fire";
  }
  
  // Extract state - look for specific state patterns
  let state = "FL"; // Default to FL
  if (isBnnFormat) {
    const stateMatch = bnnParts[0].match(/(?:^|\s)([A-Z]{2})$/i);
    if (stateMatch) {
      state = stateMatch[1].toUpperCase();
    }
  }
  
  // First check for explicit state names
  if (text.includes("florida") || text.includes(", fl")) {
    state = "FL";
  } else if (text.includes("new york") || text.includes(", ny")) {
    state = "NY";
  } else if (text.includes("california") || text.includes(", ca")) {
    state = "CA";
  } else if (text.includes("texas") || text.includes(", tx")) {
    state = "TX";
  } else if (!isBnnFormat) {
    // Look for 2-letter state codes at the end of location strings
    const stateMatch = text.match(/,\s*([a-z]{2})(?:\s|$|\.)/i);
    if (stateMatch) {
      state = stateMatch[1].toUpperCase();
    }
  }
  
  // For "Fire in Miami FL" pattern, extract FL specifically
  const miamiFlMatch = text.match(/miami\s+fl\b/i);
  if (miamiFlMatch) {
    state = "FL";
  }
  
  // Extract city
  let city = "Miami";
  if (isBnnFormat && bnnParts[2] && !/^(?:all hands|\d+(?:st|nd|rd|th)? alarm|10-\d+)/i.test(bnnParts[2])) {
    city = bnnParts[2];
  } else if (isBnnFormat && bnnParts[1]) {
    city = bnnParts[1];
  }
  if (text.includes("tampa")) city = "Tampa";
  if (text.includes("orlando")) city = "Orlando";
  if (text.includes("jacksonville")) city = "Jacksonville";
  if (text.includes("fort myers")) city = "Fort Myers";
  if (text.includes("tallahassee")) city = "Tallahassee";
  if (text.includes("fort lauderdale")) city = "Fort Lauderdale";
  if (text.includes("houston")) city = "Houston";
  if (text.includes("los angeles")) city = "Los Angeles";
  if (text.includes("new york")) city = "New York";
  if (text.includes("manhattan")) city = "Manhattan";
  if (text.includes("brooklyn")) city = "Brooklyn";
  if (text.includes("queens")) city = "Queens";
  if (text.includes("bronx")) city = "Bronx";
  if (text.includes("staten island")) city = "Staten Island";
  
  // Extract county if present
  let county: string | null = null;
  if (isBnnFormat && bnnParts[1] && bnnParts[1] !== city) county = bnnParts[1];
  if (text.includes("miami-dade")) county = "Miami-Dade";
  if (text.includes("broward")) county = "Broward";
  if (text.includes("new york county")) county = "New York County";
  if (text.includes("kings county")) county = "Kings County";
  if (text.includes("richmond county")) county = "Richmond County";
  
  // Extract address
  let address = "123 Main St";
  const addressMatch = text.match(/(\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|ln|lane|ct|court|blvd|boulevard|way|dr|drive))/i);
  if (addressMatch) {
    address = addressMatch[1];
  }
  if (isBnnFormat) {
    const addressPart = bnnParts.find((part) =>
      /\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|ln|lane|ct|court|blvd|boulevard|way|dr|drive)/i.test(part),
    );
    if (addressPart) {
      address = addressPart;
    }
  }
  
  // For "Unknown location" pattern
  if (text.includes("unknown location") || text.includes("location unknown")) {
    address = "Unknown location";
  }
  
  // Generate description
  let description = "Emergency incident reported at location";
  const addressPartIndex = bnnParts.findIndex((part) => part === address);
  const bnnEventPart =
    isBnnFormat && addressPartIndex >= 0
      ? bnnParts[addressPartIndex + 1]?.replace(/\s*<C>.*/i, "").trim()
      : null;
  if (bnnEventPart) {
    description = bnnEventPart;
  } else if (text.includes("structure fire")) {
    description = "Structure fire reported with multiple units responding";
  } else if (text.includes("fire")) {
    description = "Fire incident reported at location";
  } else if (text.includes("flood")) {
    description = "Flooding reported with water rescue in progress";
  } else if (text.includes("tornado") || text.includes("storm")) {
    description = "Severe weather alert issued for area";
  } else if (text.includes("gas leak")) {
    description = "Gas leak detected, area evacuated";
  } else if (text.includes("medical")) {
    description = "Medical emergency reported";
  } else if (text.includes("cleared")) {
    description = "Incident cleared, all units available";
  } else if (text.includes("arrived") || text.includes("on scene")) {
    description = "Emergency units arrived on scene";
  } else if (text.includes("hail")) {
    description = "Hail damage reported with multiple vehicles damaged";
  } else if (text.includes("wind") || text.includes("power lines")) {
    description = "High winds with downed power lines reported";
  } else if (text.includes("evacuation")) {
    description = "Evacuation ordered for affected area";
  } else if (text.includes("all clear")) {
    description = "All clear issued, scene is safe";
  } else if (text.includes("restored")) {
    description = "Power restored after storm damage";
  } else if (text.includes("contained") || text.includes("secured")) {
    description = "Incident contained, area secured";
  }
  
  // Determine activity type for updates - be more specific
  let activityType: string | null = null;
  if (isUpdate) {
    if (text.includes("fd arrived")) {
      activityType = "fire_arrived";
    } else if (text.includes("pd on scene") || text.includes("pd arrived") || (text.includes("pd") && !text.includes("fire"))) {
      activityType = "police_arrived";
    } else if (text.includes("ems arrived") || text.includes("ambulance")) {
      activityType = "ems_arrived";
    } else if (text.includes("fire cleared") || text.includes("cleared at")) {
      activityType = "fire_cleared";
    } else if (text.includes("all clear")) {
      activityType = "all_clear";
    } else if (text.includes("power restored")) {
      activityType = "power_restored";
    } else if (text.includes("gas") && (text.includes("secured") || text.includes("contained"))) {
      activityType = "gas_secured";
    } else if (text.includes("evacuation")) {
      activityType = "evacuation_ordered";
    }
  }
  
  // Extract department numbers from the BNN code section after the <C> org marker.
  const cMarkerIndex = bnnParts.findIndex((part) => /^<C>/i.test(part));
  const departmentNumber =
    cMarkerIndex >= 0 && bnnParts[cMarkerIndex + 1]
      ? bnnParts[cMarkerIndex + 1].split("/").map((code) => code.trim())
      : null;

  const alertId = inputText.match(/#(\d+)/)?.[1] ?? null;
  const alarmText = text.replace(/10-\d+/g, "");
  let alarmLevel: string | null = null;
  if (alarmText.includes("all hands") || alarmText.includes("1st alarm")) {
    alarmLevel = "all_hands";
  } else if (alarmText.includes("2nd alarm")) {
    alarmLevel = "2nd_alarm";
  } else if (alarmText.includes("3rd alarm")) {
    alarmLevel = "3rd_alarm";
  } else if (alarmText.includes("4th alarm")) {
    alarmLevel = "4th_alarm";
  } else if (alarmText.includes("5th alarm")) {
    alarmLevel = "5th_alarm";
  }
  
  return {
    source,
    alertId,
    isUpdate,
    incidentType,
    location: {
      address,
      city,
      county,
      state,
    },
    description,
    departmentNumber,
    alarmLevel,
    activityType,
    activityDescription: isUpdate ? description : null,
  };
}

export const generateObject = vi.fn().mockImplementation(async ({ prompt }: { prompt: string }) => {
  return {
    object: generateMockResponse(prompt),
  };
});
