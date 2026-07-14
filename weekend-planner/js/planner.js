// planner.js — the weather-aware planning engine.
// Pure functions: given a day's hourly forecast + the family profile + scored
// activities, produce a structured plan. Kept side-effect free so a future
// notification/weather-watch loop can reuse evaluateAfternoon() directly.

import {
  MORNING_HOURS,
  AFTERNOON_HOURS,
  NAP_HOURS,
  sliceWindow,
  summarizeWindow,
  dominantCode,
} from "./weather.js";
import {
  pickActiveMorning,
  pickQuietOutdoor,
  pickQuietIndoor,
  pickIndoorBackup,
} from "./activities.js";

// Default family profile (matches the user's situation). A future settings form
// can persist overrides to localStorage; the engine only reads these fields.
export const DEFAULT_PROFILE = {
  comfort: { minTempF: 50, maxTempF: 82 }, // comfortable band for an outdoor nap
  afternoonPrecipThreshold: 50, // % chance that triggers Plan B / storm warning
};

function tempComfortable(temp, comfort) {
  return temp != null && temp >= comfort.minTempF && temp <= comfort.maxTempF;
}

// MORNING — active block for the 5yo. Bad weather flips to an indoor pick.
export function evaluateMorning(dayHours, activities, profile) {
  const w = summarizeWindow(sliceWindow(dayHours, MORNING_HOURS));
  const wet = w.maxPrecip >= profile.afternoonPrecipThreshold;
  const uncomfortable =
    w.maxTemp != null &&
    (w.maxTemp > profile.comfort.maxTempF || w.minTemp < profile.comfort.minTempF);
  const preferIndoor = wet || uncomfortable;

  const planA = pickActiveMorning(activities, { preferIndoor });
  // Plan B only matters when Plan A is an outdoor pick that rain could spoil.
  const planB =
    planA && planA.indoorOutdoor === "outdoor" && wet
      ? pickIndoorBackup(activities)
      : null;

  return {
    window: w,
    code: dominantCode(sliceWindow(dayHours, MORNING_HOURS)),
    preferIndoor,
    reason: buildMorningReason(w, wet, uncomfortable, profile),
    planA,
    planB,
  };
}

function buildMorningReason(w, wet, uncomfortable, profile) {
  if (!w.hasData) return "No morning forecast available — pick your favorite spot.";
  if (wet)
    return `Rain likely this morning (${w.maxPrecip}% chance) — leaning toward an indoor pick for the morning.`;
  if (uncomfortable)
    return `Temps around ${w.maxTemp}°F are outside the comfy ${profile.comfort.minTempF}–${profile.comfort.maxTempF}°F range — an indoor option may be easier.`;
  return `Looks pleasant this morning (${w.maxTemp}°F, ${w.maxPrecip}% rain) — great for an active outdoor spot.`;
}

// AFTERNOON / NAP — the toddler's nap decision: Outdoor vs Car vs Indoor.
// This is the function a notification loop would re-run on a fresh forecast.
export function evaluateAfternoon(dayHours, activities, profile) {
  const napW = summarizeWindow(sliceWindow(dayHours, NAP_HOURS));
  const afternoonW = summarizeWindow(sliceWindow(dayHours, AFTERNOON_HOURS));

  const dry = napW.maxPrecip < profile.afternoonPrecipThreshold;
  const comfy = tempComfortable(napW.avgTemp, profile.comfort);

  const outdoorSpot = pickQuietOutdoor(activities);
  const indoorSpot = pickQuietIndoor(activities);

  let type, place, reason;
  if (dry && comfy && outdoorSpot) {
    type = "outdoor";
    place = outdoorSpot;
    reason = `Nap window looks calm and ${napW.avgTemp}°F — comfortable for a quiet outdoor nap (e.g. ${outdoorSpot.name}, shaded).`;
  } else if (!dry) {
    type = "car";
    place = null;
    reason = `Rain in the nap window (${napW.maxPrecip}% chance) — a car nap on the way to the next stop keeps him asleep and dry.`;
  } else if (!comfy) {
    const tooHot = napW.avgTemp != null && napW.avgTemp > profile.comfort.maxTempF;
    type = "car";
    place = null;
    reason = `Afternoon is ${napW.avgTemp}°F — ${tooHot ? "too warm" : "too cool"} for an outdoor nap. A climate-controlled car nap is the comfortable call.`;
  } else {
    type = "indoor";
    place = indoorSpot;
    reason = `Conditions are rough for outdoors — settle him somewhere quiet indoors${indoorSpot ? ` (e.g. ${indoorSpot.name})` : ""}.`;
  }

  // Plan B for the broader afternoon (drives the storm banner + backup card).
  const stormRisk = afternoonW.maxPrecip >= profile.afternoonPrecipThreshold;
  const planB = stormRisk ? pickIndoorBackup(activities) : null;

  return {
    napWindow: napW,
    afternoonWindow: afternoonW,
    code: dominantCode(sliceWindow(dayHours, AFTERNOON_HOURS)),
    nap: { type, place, reason },
    stormRisk,
    stormChance: afternoonW.maxPrecip,
    planB,
  };
}

// Top-level: build the full plan for one day.
export function buildDayPlan(dayHours, activities, profile = DEFAULT_PROFILE) {
  return {
    morning: evaluateMorning(dayHours, activities, profile),
    afternoon: evaluateAfternoon(dayHours, activities, profile),
  };
}
