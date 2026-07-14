// civicengage.mjs — Town of Westfield events via CivicEngage iCalendar.aspx
// (preferred) or rss.aspx (fallback). Whichever URL is configured is used.
import { fetchText, parseICalText, parseRssText } from "../lib/feeds.mjs";

export async function fetchWestfield(cfg, fetchedAt) {
  const opts = {
    source: cfg.id,
    defaultVenue: cfg.defaultVenue,
    defaultCategory: cfg.defaultCategory,
    fetchedAt,
  };
  if (cfg.icalUrl) {
    return parseICalText(await fetchText(cfg.icalUrl), opts);
  }
  if (cfg.rssUrl) {
    return parseRssText(await fetchText(cfg.rssUrl), opts);
  }
  return [];
}
