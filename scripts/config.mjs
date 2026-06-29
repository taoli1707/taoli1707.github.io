// config.mjs — central configuration for the events pipeline.
// Feed URLs are read from environment variables (set as GitHub Secrets / repo
// variables) with documented defaults, so URLs can be corrected without code
// changes. Any source whose URL/key is missing is simply skipped at runtime.

export const HOME = { lat: 40.6510, lon: -74.3473, zip: "07090", city: "Westfield", state: "NJ" };

// How far ahead to keep events, and how far from home to include them.
export const WINDOW_DAYS = 21;
export const MAX_RADIUS_MILES = 25;

export const OUTPUT_PATH = "weekend-planner/data/events.json";

// Per-source configuration. `enabled` is derived from whether the URL/key exists.
export const SOURCES = {
  libcal: {
    id: "wmlnj-libcal",
    label: "Westfield Memorial Library",
    // LibCal exposes a public iCal feed per calendar/category. Capture the exact
    // "Add to calendar / iCal" URL from https://events.wmlnj.org and set it here.
    icalUrl: process.env.LIBCAL_ICAL_URL || "",
    defaultVenue: "Westfield Memorial Library",
    defaultCategory: "library",
  },
  westfield: {
    id: "westfield-civicengage",
    label: "Town of Westfield",
    // CivicEngage iCalendar.aspx (optionally scoped with ?CID=). Capture from
    // https://www.westfieldnj.gov/iCalendar.aspx
    icalUrl: process.env.WESTFIELD_ICAL_URL || "",
    rssUrl: process.env.WESTFIELD_RSS_URL || "",
    defaultVenue: "Town of Westfield",
    defaultCategory: "rec",
  },
  ucnj: {
    id: "ucnj-rss",
    label: "Union County",
    rssUrl: process.env.UCNJ_RSS_URL || "",
    defaultVenue: "Union County",
    defaultCategory: "festival",
  },
  ticketmaster: {
    id: "ticketmaster",
    label: "Ticketmaster",
    apiKey: process.env.TICKETMASTER_API_KEY || "",
    // Discovery API: family-classified events near home.
    endpoint: "https://app.ticketmaster.com/discovery/v2/events.json",
    radiusMiles: 25,
    classification: "family",
  },
};

export function isEnabled(src) {
  if (src.apiKey !== undefined) return !!src.apiKey;
  return !!(src.icalUrl || src.rssUrl);
}
