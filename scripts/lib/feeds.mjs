// feeds.mjs — generic iCal and RSS parsing into normalized events.
// Network fetch is isolated here so source modules stay tiny and the parsers
// can be unit-tested against text fixtures (no network).

import ical from "node-ical";
import RssParser from "rss-parser";
import { makeEvent } from "./normalize.mjs";

const rss = new RssParser();

export async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "weekend-planner-bot/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Parse an iCalendar (.ics) string into normalized events.
export function parseICalText(text, { source, defaultVenue, defaultCategory, fetchedAt }) {
  const data = ical.sync.parseICS(text);
  const out = [];
  for (const k of Object.keys(data)) {
    const v = data[k];
    if (!v || v.type !== "VEVENT") continue;
    out.push(
      makeEvent({
        source,
        sourceId: v.uid || k,
        title: v.summary,
        start: v.start ? new Date(v.start).toISOString() : null,
        end: v.end ? new Date(v.end).toISOString() : null,
        venue: v.location || defaultVenue,
        address: v.location,
        category: defaultCategory,
        url: typeof v.url === "string" ? v.url : v.url?.val || null,
        fetchedAt,
      })
    );
  }
  return out;
}

// Parse an RSS/Atom feed string into normalized events.
export async function parseRssText(text, { source, defaultVenue, defaultCategory, fetchedAt }) {
  const feed = await rss.parseString(text);
  return (feed.items || []).map((it) =>
    makeEvent({
      source,
      sourceId: it.guid || it.id || it.link,
      title: it.title,
      // RSS often only has a publish date; use it as the event start best-effort.
      start: it.isoDate || (it.pubDate ? new Date(it.pubDate).toISOString() : null),
      end: null,
      venue: defaultVenue,
      address: defaultVenue,
      category: defaultCategory,
      url: it.link,
      fetchedAt,
    })
  );
}
