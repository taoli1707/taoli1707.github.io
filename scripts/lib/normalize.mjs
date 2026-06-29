// normalize.mjs — shared helpers to turn raw feed entries into the unified
// event schema, infer age/category/indoor-outdoor, resolve coordinates, and
// dedupe / window / radius filter.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const VENUES = JSON.parse(readFileSync(join(__dir, "..", "venues.json"), "utf8")).venues;

// ---- coordinate resolution ----
export function resolveLocation(venueOrAddress, fallbackVenue) {
  const hay = `${venueOrAddress || ""} ${fallbackVenue || ""}`.toLowerCase();
  for (const v of VENUES) {
    if (hay.includes(v.match)) {
      return { address: v.address, lat: v.lat, lon: v.lon, matchedVenue: v.venue };
    }
  }
  return { address: venueOrAddress || null, lat: null, lon: null, matchedVenue: null };
}

// ---- age inference from free text ----
const AGE_RULES = [
  { re: /\b(baby|babies|infant|lapsit|0-2|birth)\b/, min: 0, max: 2 },
  { re: /\b(toddler|tot|2s|twos|2-3|2 ?-? ?5)\b/, min: 1, max: 4 },
  { re: /\b(preschool|pre-?k|3-5|ages 3|storytime|story time)\b/, min: 2, max: 5 },
  { re: /\b(kids|children|family|all ages|grade|elementary)\b/, min: 2, max: 10 },
  { re: /\b(tween|teen|young adult|ya|middle school)\b/, min: 10, max: 17 },
  { re: /\b(adult|18\+|21\+)\b/, min: 18, max: 99 },
];
export function inferAgeRange(text) {
  const t = (text || "").toLowerCase();
  for (const r of AGE_RULES) if (r.re.test(t)) return { min: r.min, max: r.max };
  return null;
}

// ---- category inference ----
// Event-nature words take priority over generic venue words (e.g. a "concert
// in the park" is a show, not a park). park is the last, weakest match.
const CAT_RULES = [
  { re: /\b(storytime|story time|library|book|read)\b/, cat: "library" },
  { re: /\b(festival|fair|fest|parade|market|craft)\b/, cat: "festival" },
  { re: /\b(concert|show|theater|theatre|music|performance|magic)\b/, cat: "show" },
  { re: /\b(museum|science|nature|zoo|exhibit)\b/, cat: "museum" },
  { re: /\b(rec|sports|class|workshop|camp|swim)\b/, cat: "rec" },
  { re: /\b(park|playground|trail|hike|outdoor)\b/, cat: "park" },
];
export function inferCategory(text, fallback) {
  const t = (text || "").toLowerCase();
  for (const r of CAT_RULES) if (r.re.test(t)) return r.cat;
  return fallback || "other";
}

const OUTDOOR_RE = /\b(park|trail|outdoor|festival|fair|parade|garden|playground|hike)\b/;
const INDOOR_RE = /\b(library|museum|theater|theatre|indoor|gym|center|hall|storytime)\b/;
export function inferIndoorOutdoor(text) {
  const t = (text || "").toLowerCase();
  const out = OUTDOOR_RE.test(t);
  const ind = INDOOR_RE.test(t);
  if (out && !ind) return "outdoor";
  if (ind && !out) return "indoor";
  if (out && ind) return "mixed";
  return "unknown";
}

// ---- build a normalized event ----
export function makeEvent({ source, sourceId, title, start, end, venue, address, category, cost, url, fetchedAt }) {
  const text = `${title || ""} ${venue || ""}`;
  const loc = resolveLocation(address || venue, venue);
  return {
    id: `${source}-${sourceId || hash(`${url || ""}${start || ""}${title || ""}`)}`,
    title: (title || "Untitled event").trim(),
    start: start || null,
    end: end || null,
    venue: venue || loc.matchedVenue || null,
    location: { address: loc.address, lat: loc.lat, lon: loc.lon },
    category: inferCategory(text, category),
    ageRange: inferAgeRange(text),
    indoorOutdoor: inferIndoorOutdoor(text),
    cost: cost || (source === "ticketmaster" ? "$$" : "free"),
    url: url || null,
    source,
    fetchedAt,
  };
}

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// ---- distance (haversine, miles) ----
export function distanceMiles(a, b) {
  if (a.lat == null || b.lat == null) return null;
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// ---- merge / dedupe / filter ----
export function dedupe(events) {
  const seen = new Map();
  for (const e of events) {
    // Same title + same day = duplicate across feeds; keep the one with a URL/coords.
    const key = `${(e.title || "").toLowerCase().slice(0, 40)}|${(e.start || "").slice(0, 10)}`;
    const prev = seen.get(key);
    if (!prev || score(e) > score(prev)) seen.set(key, e);
  }
  return [...seen.values()];
}
function score(e) {
  return (e.url ? 1 : 0) + (e.location.lat != null ? 1 : 0) + (e.ageRange ? 1 : 0);
}

export function filterWindowAndRadius(events, { home, windowDays, maxRadiusMiles, now }) {
  const start = now;
  const end = new Date(now.getTime() + windowDays * 86400000);
  return events
    .filter((e) => {
      if (!e.start) return false;
      const d = new Date(e.start);
      if (isNaN(d)) return false;
      if (d < start || d > end) return false;
      const dist = distanceMiles(home, e.location);
      // Keep events with unknown coords (civic feeds are inherently local).
      if (dist != null && dist > maxRadiusMiles) return false;
      return true;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));
}
