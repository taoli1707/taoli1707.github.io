// fetch-events.mjs — orchestrator. Fetches every configured source, normalizes,
// dedupes, filters to the date window + radius, and writes events.json.
// Each source is isolated: a failure (network blocked, bad feed, missing key)
// logs a warning and contributes zero events rather than failing the whole run.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { HOME, SOURCES, WINDOW_DAYS, MAX_RADIUS_MILES, OUTPUT_PATH, isEnabled } from "./config.mjs";
import { dedupe, filterWindowAndRadius } from "./lib/normalize.mjs";
import { fetchLibcal } from "./sources/libcal-ical.mjs";
import { fetchWestfield } from "./sources/civicengage.mjs";
import { fetchUcnj } from "./sources/ucnj-rss.mjs";
import { fetchTicketmaster } from "./sources/ticketmaster.mjs";

const now = new Date();
const fetchedAt = now.toISOString();

const TASKS = [
  { cfg: SOURCES.libcal, run: fetchLibcal },
  { cfg: SOURCES.westfield, run: fetchWestfield },
  { cfg: SOURCES.ucnj, run: fetchUcnj },
  { cfg: SOURCES.ticketmaster, run: fetchTicketmaster },
];

async function main() {
  const all = [];
  const report = [];

  for (const { cfg, run } of TASKS) {
    if (!isEnabled(cfg)) {
      report.push({ source: cfg.id, status: "skipped (not configured)", count: 0 });
      continue;
    }
    try {
      const events = await run(cfg, fetchedAt);
      all.push(...events);
      report.push({ source: cfg.id, status: "ok", count: events.length });
    } catch (err) {
      report.push({ source: cfg.id, status: `error: ${err.message}`, count: 0 });
    }
  }

  const merged = filterWindowAndRadius(dedupe(all), {
    home: HOME,
    windowDays: WINDOW_DAYS,
    maxRadiusMiles: MAX_RADIUS_MILES,
    now,
  });

  const payload = {
    generatedAt: fetchedAt,
    home: HOME,
    windowDays: WINDOW_DAYS,
    sources: report,
    count: merged.length,
    events: merged,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + "\n");

  console.log(`Wrote ${merged.length} events to ${OUTPUT_PATH}`);
  for (const r of report) console.log(`  - ${r.source}: ${r.status} (${r.count})`);
}

main().catch((err) => {
  console.error("fetch-events failed:", err);
  process.exit(1);
});
