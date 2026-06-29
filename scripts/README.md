# Live events pipeline

A scheduled GitHub Action (`.github/workflows/refresh-events.yml`) fetches local
family events **server-side**, normalizes them, and commits
`weekend-planner/data/events.json`. The static site just reads that file — no API
keys in the browser, no CORS, no backend.

## One-time setup

Add these as **repository secrets** (Settings → Secrets and variables → Actions).
Every source is optional; whatever isn't set is skipped, so you can start with one.

| Secret | What it is | How to get it |
| --- | --- | --- |
| `LIBCAL_ICAL_URL` | Westfield Library (LibCal) iCal feed — storytimes & kids' programs | On https://events.wmlnj.org open the calendar (ideally a kids/children category) and copy the **"Add to calendar / iCal"** URL. |
| `WESTFIELD_ICAL_URL` | Town of Westfield (CivicEngage) iCal | From https://www.westfieldnj.gov/iCalendar.aspx (optionally scope with a `?CID=` category id). |
| `WESTFIELD_RSS_URL` | Town of Westfield RSS (fallback if no iCal) | From https://www.westfieldnj.gov/rss.aspx |
| `UCNJ_RSS_URL` | Union County RSS (optional) | From https://ucnj.org/newsevents/rss-feeds/ |
| `TICKETMASTER_API_KEY` | Ticketmaster Discovery key — ticketed **family** shows near 07090 | Free key at https://developer.ticketmaster.com (Discovery API). |

Then run the workflow once manually: **Actions → "Refresh local events" → Run
workflow**. It writes/commits `events.json`; the site shows the events on the
matching weekend day. After that it refreshes daily (~6–7am ET).

## Local run

```bash
npm ci
LIBCAL_ICAL_URL="https://…" TICKETMASTER_API_KEY="…" npm run fetch-events
npm run test-parsers   # offline parser/normalize checks
```

## How it fits together

- `scripts/config.mjs` — sources + window/radius (URLs/keys from env).
- `scripts/sources/*.mjs` — one fetcher per source (iCal / RSS / Ticketmaster).
- `scripts/lib/feeds.mjs` — iCal & RSS parsing (`node-ical`, `rss-parser`).
- `scripts/lib/normalize.mjs` — unified schema, age/category/indoor inference,
  venue→coords lookup (`scripts/venues.json`), dedupe + window/radius filter.
- `scripts/fetch-events.mjs` — orchestrates all of the above, writes `events.json`.

Each source is isolated: a missing key or a broken feed logs a warning and
contributes zero events instead of failing the whole run. The output's `sources`
array records per-source status so you can see what ran.

## Notes / limitations

- **Refresh cadence:** daily, not per-second. Fine for weekend planning; GitHub
  cron runs can be delayed 10–30 min under load.
- **Macaroni KID / Mommy Poppins** have no public feed/API — use them as manual
  research, not pipeline sources.
- To switch to true real-time later, a Cloudflare Worker proxy could front the
  same source modules; not needed for weekend planning.
