// test-parsers.mjs — offline checks for the feed parsers + normalize/filter
// pipeline against text fixtures. No network. Run: node scripts/test-parsers.mjs
import assert from "node:assert";
import { parseICalText, parseRssText } from "./lib/feeds.mjs";
import { mapTmEvent } from "./sources/ticketmaster.mjs";
import { dedupe, filterWindowAndRadius, inferAgeRange, inferCategory } from "./lib/normalize.mjs";

let pass = 0;
const ok = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++; };

// --- iCal fixture (LibCal-style storytime at the library) ---
const ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:evt-100@wmlnj
SUMMARY:Toddler Storytime
DTSTART:20260704T103000Z
DTEND:20260704T111500Z
LOCATION:Westfield Memorial Library
URL:https://events.wmlnj.org/event/100
END:VEVENT
BEGIN:VEVENT
UID:evt-101@wmlnj
SUMMARY:Family Craft Afternoon
DTSTART:20260705T140000Z
LOCATION:Westfield Memorial Library
END:VEVENT
END:VCALENDAR`;

ok("iCal parses VEVENTs into normalized events", () => {
  const evs = parseICalText(ICS, { source: "wmlnj-libcal", defaultVenue: "Westfield Memorial Library", defaultCategory: "library", fetchedAt: "now" });
  assert.equal(evs.length, 2);
  const st = evs[0];
  assert.equal(st.title, "Toddler Storytime");
  assert.ok(st.start.startsWith("2026-07-04"));
  assert.equal(st.source, "wmlnj-libcal");
  assert.equal(st.url, "https://events.wmlnj.org/event/100");
  // coordinates resolved from venue lookup
  assert.ok(st.location.lat && st.location.lon, "library coords resolved");
  // age inferred from "toddler"
  assert.deepEqual(st.ageRange, { min: 1, max: 4 });
});

// --- RSS fixture (town feed) ---
const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>Westfield</title>
<item><title>Summer Concert in Mindowaskin Park</title><link>https://westfieldnj.gov/e/1</link><guid>w1</guid><pubDate>Sat, 04 Jul 2026 18:00:00 GMT</pubDate></item>
</channel></rss>`;

ok("RSS parses items into normalized events", async () => {});
{
  const evs = await parseRssText(RSS, { source: "westfield-civicengage", defaultVenue: "Town of Westfield", defaultCategory: "rec", fetchedAt: "now" });
  assert.equal(evs.length, 1);
  assert.equal(evs[0].title, "Summer Concert in Mindowaskin Park");
  assert.equal(evs[0].category, "show"); // inferred from "concert"
  assert.ok(evs[0].location.lat, "park coords resolved from title");
  console.log("  ✓ RSS item fields + inference");
  pass++;
}

// --- Ticketmaster mapping ---
const TM = {
  id: "G5v0Z", name: "Disney On Ice", url: "https://tm.com/e/G5v0Z",
  dates: { start: { dateTime: "2026-07-11T19:00:00Z" } },
  priceRanges: [{ min: 25, max: 80 }],
  _embedded: { venues: [{ name: "Prudential Center", address: { line1: "25 Lafayette St" }, location: { latitude: "40.7336", longitude: "-74.1711" } }] },
};
ok("Ticketmaster event maps with venue coords + price", () => {
  const e = mapTmEvent(TM, { id: "ticketmaster" }, "now");
  assert.equal(e.title, "Disney On Ice");
  assert.equal(e.location.lat, 40.7336);
  assert.equal(e.cost, "$25-80");
  assert.equal(e.source, "ticketmaster");
});

// --- dedupe ---
ok("dedupe collapses same title+day, keeps richer entry", () => {
  const a = { title: "Toddler Storytime", start: "2026-07-04T10:30:00Z", url: null, location: { lat: null }, ageRange: null };
  const b = { title: "Toddler Storytime", start: "2026-07-04T11:00:00Z", url: "x", location: { lat: 40.6 }, ageRange: { min: 1, max: 4 } };
  const out = dedupe([a, b]);
  assert.equal(out.length, 1);
  assert.equal(out[0].url, "x");
});

// --- window + radius filter ---
ok("filter drops past, too-far, and out-of-window events", () => {
  const home = { lat: 40.651, lon: -74.347 };
  const now = new Date("2026-07-01T00:00:00Z");
  const evs = [
    { title: "soon-near", start: "2026-07-04T10:00:00Z", location: { lat: 40.66, lon: -74.34 } },
    { title: "past", start: "2026-06-01T10:00:00Z", location: { lat: 40.66, lon: -74.34 } },
    { title: "too-far", start: "2026-07-04T10:00:00Z", location: { lat: 41.9, lon: -73.0 } },
    { title: "way-future", start: "2026-09-01T10:00:00Z", location: { lat: 40.66, lon: -74.34 } },
    { title: "near-no-coords", start: "2026-07-05T10:00:00Z", location: { lat: null, lon: null } },
  ];
  const out = filterWindowAndRadius(evs, { home, windowDays: 21, maxRadiusMiles: 25, now });
  const titles = out.map((e) => e.title);
  assert.deepEqual(titles.sort(), ["near-no-coords", "soon-near"]);
});

ok("inference helpers", () => {
  assert.deepEqual(inferAgeRange("Baby Lapsit"), { min: 0, max: 2 });
  assert.equal(inferCategory("Farmers Market downtown", null), "festival");
});

console.log(`\n${pass} checks passed.`);
