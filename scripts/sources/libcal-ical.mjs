// libcal-ical.mjs — Westfield Memorial Library events via its public LibCal iCal feed.
import { fetchText, parseICalText } from "../lib/feeds.mjs";

export async function fetchLibcal(cfg, fetchedAt) {
  if (!cfg.icalUrl) return [];
  const text = await fetchText(cfg.icalUrl);
  return parseICalText(text, {
    source: cfg.id,
    defaultVenue: cfg.defaultVenue,
    defaultCategory: cfg.defaultCategory,
    fetchedAt,
  });
}
