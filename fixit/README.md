# Weekend Fixer

A static home-repair site: step-by-step guides for first-timers, a DIY-or-pro cost calculator, a starter toolkit page, and a printable maintenance checklist. Lives at `/fixit/` on this GitHub Pages site. No framework, no build dependencies beyond Node.

The business side (which programs pay what, thresholds, sequencing, compliance) is in [MONETIZATION.md](MONETIZATION.md).

## Layout

```
fixit/
  index.html, guides/, tools/, checklist/, diy-or-pro/, about/   generated pages (commit them; Pages serves them)
  sitemap.xml                                                    generated
  assets/site.css, site.js, favicon.svg                          hand-written runtime
  src/
    build.js          generator: node fixit/src/build.js
    config.js         site name, URLs, every monetization switch
    templates.js      page templates (pure functions)
    content/
      guides/*.js     one file per guide
      costs.js        what a pro charges, with sources and retrieval date
      tools.js        the toolkit page
      checklist.js    the seasonal checklist
      diagrams.js     inline SVG diagrams keyed by name
```

## Build

```
node fixit/src/build.js
```

Rebuild after any change under `src/`, then commit the generated HTML along with the source. The build validates every guide (required fields, category, cost key, related slugs) and warns when a meta description runs long.

## Adding a guide

1. Copy an existing file in `src/content/guides/` and change every field. The schema:

   | Field | Purpose |
   | --- | --- |
   | `slug`, `title`, `short`, `blurb` | URL, H1, card title, card teaser |
   | `category` | one of the ids in `config.categories` |
   | `summary` | meta description and lede, under 160 characters |
   | `symptoms`, `keywords` | what the symptom search matches; write symptoms the way people type them |
   | `difficulty` (1–5), `time`, `timeHours` | shown on cards; `timeHours` feeds the calculator |
   | `partsCost`, `toolCost`, `risk` | calculator inputs; `risk` is a sentence fragment shown to first-timers, empty for safe jobs |
   | `proCostKey` | key into `costs.js` |
   | `safety`, `callPro` | the red box and the "call a pro if" box; HTML allowed |
   | `tools`, `parts` | `{ name, q, optional, note }`; `q` is the retailer search query that builds affiliate links; omit `q` for no links |
   | `diagram` | key in `diagrams.js`, optional |
   | `intro`, `diagnose`, `steps`, `troubleshooting`, `faq`, `related` | body content |

2. Add a matching entry to `src/content/costs.js` with the pro price range and its source URL.
3. Run the build. Guides sort easiest-first automatically.

## Monetization switches (all in `src/config.js`)

Everything is off by default so nothing on the site is broken or misleading before you've been approved.

| Key | Effect when set |
| --- | --- |
| `affiliate.amazonTag` | Amazon links get `?tag=`; the required Associates statement appears in the footer and About page |
| `affiliate.homeDepotUrl` | Function that turns a search query into a Home Depot link; swap in your Impact tracking wrapper |
| `ads.adsenseClient` | AdSense Auto ads script on every page; privacy policy gains the ads section |
| `newsletter.action` | Renders the signup box (Kit form action URL) on the home page |
| `products.printablePackUrl` | Renders the paid printable-pack CTA on the home and checklist pages |
| `leadGen.url` | Turns the "call a pro" box on every guide into an affiliate CTA |
| `analytics.plausibleDomain` / `gaMeasurementId` | Analytics script; privacy policy gains the matching section |
| `siteUrl`, `basePath` | Change both when moving to a custom domain (`https://example.com/` and `/`) |

## Verifying

`scratchpad/verify.js` (kept outside the repo) loads every page in headless Chromium at 1280 px and 400 px, fails on console errors, dead internal links, or horizontal overflow, and exercises search, filters, step progress, the savings tally, the calculator, the checklist, the theme toggle, and the mobile menu. Run it against a local server rooted at the repository:

```
python3 -m http.server 8765 --bind 127.0.0.1      # from the repo root
NODE_PATH=/opt/node22/lib/node_modules node verify.js
```

## Moving to a custom domain

AdSense won't accept a `github.io` subdomain, so this is step one of monetizing with display ads. Either point a domain at this repository (it applies to the whole user site) or move `fixit/` into its own repository with its own domain. In both cases set `siteUrl` and `basePath` in `config.js`, update `siblingApps` if the toolkit apps stay behind, and rebuild.
