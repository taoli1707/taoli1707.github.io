// ticketmaster.mjs — family-classified ticketed events near home via the
// Ticketmaster Discovery API. Key comes from process.env.TICKETMASTER_API_KEY.
import { makeEvent } from "../lib/normalize.mjs";
import { HOME } from "../config.mjs";

export async function fetchTicketmaster(cfg, fetchedAt) {
  if (!cfg.apiKey) return [];
  const params = new URLSearchParams({
    apikey: cfg.apiKey,
    classificationName: cfg.classification, // "family"
    latlong: `${HOME.lat},${HOME.lon}`,
    radius: String(cfg.radiusMiles),
    unit: "miles",
    sort: "date,asc",
    size: "50",
  });
  const res = await fetch(`${cfg.endpoint}?${params}`);
  if (!res.ok) throw new Error(`Ticketmaster HTTP ${res.status}`);
  const data = await res.json();
  const events = data?._embedded?.events || [];
  return events.map((e) => mapTmEvent(e, cfg, fetchedAt));
}

// Map a Discovery API event to the normalized schema.
export function mapTmEvent(e, cfg, fetchedAt) {
  const venue = e?._embedded?.venues?.[0];
  const loc = venue?.location;
  const start = e?.dates?.start?.dateTime || isoFromLocal(e?.dates?.start?.localDate, e?.dates?.start?.localTime);
  const price = e?.priceRanges?.[0];
  return {
    ...makeEvent({
      source: cfg.id,
      sourceId: e.id,
      title: e.name,
      start,
      end: null,
      venue: venue?.name,
      address: venue?.address?.line1,
      category: "show",
      url: e.url,
      fetchedAt,
    }),
    // Prefer Ticketmaster's own venue coordinates when present.
    location: {
      address: venue?.address?.line1 || venue?.name || null,
      lat: loc?.latitude ? Number(loc.latitude) : null,
      lon: loc?.longitude ? Number(loc.longitude) : null,
    },
    cost: price ? `$${Math.round(price.min)}-${Math.round(price.max)}` : "$$",
  };
}

function isoFromLocal(date, time) {
  if (!date) return null;
  return `${date}T${time || "00:00:00"}`;
}
