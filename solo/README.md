# Solo Ledger

Case studies of one-person businesses, in the spirit of [loot-drop.io](https://www.loot-drop.io/) but for businesses that work instead of startups that died. Each case has a sourced, dated revenue figure, the origin story, pricing, growth drivers, a timeline, moat and risks, reusable lessons, and an adjacent "build next" idea with a 30-day MVP path. Lives at `/solo/` on this GitHub Pages site. No framework and no build dependencies beyond Node.

## Layout

```
solo/
  index.html, cases/, ideas/, lists/, scanner/,
  patterns/, about/                                generated pages (commit them; Pages serves them)
  cases.json, sitemap.xml                          generated
  assets/site.css, site.js, favicon.svg            hand-written runtime (favicon is generated)
  src/
    build.js          generator: node solo/src/build.js
    config.js         site name, URLs, taxonomies, newsletter/analytics switches
    templates.js      page templates (pure functions)
    content/
      cases/*.json    one file per case; file name = slug
      patterns.js     hand-written takeaways for the Patterns page
```

## Build

```
node solo/src/build.js
```

Rebuild after any change under `src/`, then commit the generated HTML along with the source. The build validates every case (required fields, known category/model/channel, revenue shape, rebuild difficulty 1–5, at least one source).

## Adding a case

Copy an existing file in `src/content/cases/`, rename it to the new slug, and change every field.

| Field | Purpose |
| --- | --- |
| `slug`, `name`, `founder`, `url`, `tagline` | identity; `slug` must match the file name |
| `category`, `model`, `channel` | ids from `config.js`; drive the filters and Patterns tables |
| `started` | launch year |
| `revenue` | `{ amount, period: "month"\|"year"\|"total", label, asOf: "YYYY-MM", kind: "self-reported"\|"estimate"\|"disclosed-sale", source }` |
| `team`, `startupCost`, `timeToFirstDollar`, `stack` | fact strip; use `null`/`[]` when unknown, never guess |
| `summary`, `origin`, `howItMakesMoney`, `moat`, `risks` | body paragraphs |
| `growth`, `lessons` | bullet lists |
| `timeline` | `[{ date, event }]` |
| `status` | optional `{ state: "active"\|"sold"\|"shut-down", date, note }`; omitted means active |
| `rebuild` | `{ idea, why, mvp: [...], difficulty: 1-5, weeklyHours, fit, stack: [...], pricing, potential: "high"\|"medium"\|"low", market }` |
| `sources` | `[{ title, url }]`, every number must be traceable to one of these |

Sourcing rule: no number without a link. If only an estimate exists, set `kind: "estimate"`.
