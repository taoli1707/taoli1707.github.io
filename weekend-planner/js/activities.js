// activities.js — load the curated activity list and provide filtering/scoring helpers.
// The single loadActivities() source can later be swapped for a live API / serverless
// proxy without touching planner.js, as long as it returns the same shape.

let _cache = null;
let _eventsCache = null;

export async function loadActivities() {
  if (_cache) return _cache;
  const res = await fetch("data/activities.json");
  if (!res.ok) throw new Error(`activities.json HTTP ${res.status}`);
  _cache = await res.json();
  return _cache;
}

// Live local events, refreshed daily into data/events.json by the GitHub Action.
// Returns { events: [...] } even if the file is missing/empty so callers don't
// have to special-case the pre-population state.
export async function loadEvents() {
  if (_eventsCache) return _eventsCache;
  try {
    const res = await fetch("data/events.json");
    if (!res.ok) throw new Error(`events.json HTTP ${res.status}`);
    _eventsCache = await res.json();
  } catch (err) {
    console.warn("No live events available:", err.message);
    _eventsCache = { events: [], count: 0, sources: [] };
  }
  return _eventsCache;
}

// Haversine distance in miles between two lat/lon points.
export function distanceMiles(a, b) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Annotate each activity with its distance from home (mutates a shallow copy).
export function withDistance(activities, home) {
  return activities.map((a) => ({
    ...a,
    distanceMiles: Math.round(distanceMiles(home, a.location) * 10) / 10,
  }));
}

const INDOORISH = new Set(["indoor", "mixed"]);
const OUTDOORISH = new Set(["outdoor", "mixed"]);

// Pick the best "active morning" activity for the 5yo.
// preferIndoor flips the indoor/outdoor preference when weather is bad.
export function pickActiveMorning(activities, { preferIndoor }) {
  const pool = activities.filter(
    (a) => a.activeRating >= 2 && a.ageSuitability.child5 >= 2
  );
  const matchSet = preferIndoor ? INDOORISH : OUTDOORISH;
  return rank(pool, matchSet);
}

// Pick the best quiet/nap-friendly OUTDOOR spot for the toddler.
export function pickQuietOutdoor(activities) {
  const pool = activities.filter(
    (a) => OUTDOORISH.has(a.indoorOutdoor) && a.napFriendly >= 2
  );
  return rank(pool, OUTDOORISH, (a) => a.napFriendly);
}

// Pick the best quiet INDOOR spot for the toddler (library/home/etc.).
export function pickQuietIndoor(activities) {
  const pool = activities.filter(
    (a) => a.indoorOutdoor === "indoor" && a.napFriendly >= 2
  );
  return rank(pool, INDOORISH, (a) => a.napFriendly);
}

// Pick the best INDOOR alternative for a Plan B (rainy backup), favoring the 5yo.
export function pickIndoorBackup(activities) {
  const pool = activities.filter(
    (a) => INDOORISH.has(a.indoorOutdoor) && a.ageSuitability.child5 >= 2
  );
  return rank(pool, INDOORISH);
}

// Rank a pool: in-preference first, then by primary score (default activeRating),
// then closest. Returns the top match or null.
function rank(pool, preferSet, primary = (a) => a.activeRating) {
  const sorted = [...pool].sort((x, y) => {
    const px = preferSet.has(x.indoorOutdoor) ? 0 : 1;
    const py = preferSet.has(y.indoorOutdoor) ? 0 : 1;
    if (px !== py) return px - py;
    const sx = primary(x);
    const sy = primary(y);
    if (sx !== sy) return sy - sx;
    return (x.distanceMiles ?? 0) - (y.distanceMiles ?? 0);
  });
  return sorted[0] || null;
}
