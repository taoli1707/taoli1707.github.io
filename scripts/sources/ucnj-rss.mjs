// ucnj-rss.mjs — Union County events via ucnj.org RSS (optional source).
import { fetchText, parseRssText } from "../lib/feeds.mjs";

export async function fetchUcnj(cfg, fetchedAt) {
  if (!cfg.rssUrl) return [];
  return parseRssText(await fetchText(cfg.rssUrl), {
    source: cfg.id,
    defaultVenue: cfg.defaultVenue,
    defaultCategory: cfg.defaultCategory,
    fetchedAt,
  });
}
