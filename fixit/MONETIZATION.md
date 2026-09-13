# Weekend Fixer: monetization playbook

Researched 2026-09-13. Every number below came from the linked source on that date. Programs change their rates and thresholds without notice, so re-check a source before you rely on it. Where I've made an assumption instead of citing a fact, it is marked **assumption**.

## The short version

1. Traffic is the only real constraint. Every channel below is a switch you flip once you cross a threshold; none of them creates visitors.
2. Display ads in the home/DIY niche pay roughly $15–45 per thousand pageviews (RPM). Affiliate links pay 3% at Amazon and 1–2% at the big-box stores. Lead generation and a small digital product diversify the base.
3. You need a real domain before display ads are possible. Buy one now.
4. Publish one guide a week, cut each into a 60-second video, submit the sitemap, and apply to Journey by Mediavine the month you pass 1,000 sessions.

## 1. Hosting constraints to settle first

**GitHub Pages terms.** Pages may not be used "as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service." Donation buttons and crowdfunding links are explicitly permitted, and ad-supported content sites are common on Pages. The line to stay on the right side of: sell the printable pack through a checkout hosted elsewhere (Lemon Squeezy, Payhip, Gumroad), never on the Pages site itself. Source: [GitHub Terms for Additional Products and Features](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features).

**Bandwidth.** A soft limit of 100 GB per month ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). Pages here are 20–30 KB of HTML plus about 40 KB of shared CSS/JS, so 100 GB is on the order of a million page views a month. Not a concern until it's a very good problem to have.

**AdSense needs a root domain.** AdSense accounts are set up on a domain you own; a `username.github.io` subdomain cannot be added ([AdSense community thread](https://support.google.com/adsense/thread/120486831/how-to-add-my-github-website-domain-in-adsense-its-not-accepting-subdomain-of-my-github-page?hl=en)). Mediavine and Raptive also expect a domain you control. GitHub Pages supports custom domains ([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)), so the fix is a $10–15/year domain.

**Decision to make:** a custom domain on this repository applies to the entire `taoli1707.github.io` site (CFA app, toolkit, everything). If you'd rather keep those separate, move `fixit/` into its own repository with its own domain; `config.js` makes that a two-line change (`siteUrl`, `basePath`) plus the `siblingApps` links. **Assumption:** you'll want the separate repo once the domain is bought; I built the site so either works.

**Brand and domain.** "Weekend Handyman" is taken (weekendhandyman.com and a YouTube channel), as is "The Handy Manual" (YouTube). "Weekend Fixer" returned no matches in search. I could not query a domain registry from this environment (the egress proxy blocks RDAP), so **check that weekendfixer.com is available before printing anything**. Fallback names: fixitmanual.com, homefixmanual.com.

## 2. Channels, thresholds, and the config switch for each

| Channel | Program | Entry bar | Payout | Switch in `config.js` | Flip it when |
| --- | --- | --- | --- | --- | --- |
| Affiliate | Amazon Associates | No traffic minimum. You must make 3 qualifying sales within 180 days of joining or the account is closed (you can reapply). | 3% on Tools & Home Improvement, 24-hour cookie | `affiliate.amazonTag` | Now. Amazon reviews the site, so have the 12 guides live first. |
| Affiliate | Home Depot (via Impact) | Application reviewed on traffic | 1% on most products, 8% on select décor, 1-day cookie | `affiliate.homeDepotUrl` | After ~1,000 visits/month |
| Affiliate | Lowe's (via Impact/CJ) | Application | 2% (some sources say 2–4%), 24-hour cookie | add a link builder like Home Depot's | Same time as Home Depot |
| Display | Journey by Mediavine | 1,000+ monthly sessions | 70% revenue share | Journey gives you a script tag; add it in `analytics()` in `templates.js` | The month you pass 1,000 sessions |
| Display | Raptive | 25,000 monthly pageviews (lowered Oct 2025) | Higher RPMs than Journey typically | Same | At 25k pageviews |
| Display | Mediavine (full) | No flat session minimum; evaluated on ~$5,000/yr ad revenue | Premium RPMs | Same | When Journey earnings approach that |
| Display | Google AdSense | No minimum, needs a root domain | Lowest RPMs of the group | `ads.adsenseClient` | Only as a stopgap before Journey, or skip |
| Display | Ezoic | Raised to 250,000 monthly users in Feb 2026 | n/a | none | Skip |
| Lead gen | Angi (via Impact) | Application | 10% of completed service value, per one program listing | `leadGen.url` | As soon as approved: the "call a pro if" box is on every guide |
| Lead gen | Networx affiliate program | Application; forms and an API for sending referrals | Pay per lead; rates not public | `leadGen.url` | Compare against Angi over 60 days, keep the better one |
| Product | Printable pack ($9) | None | Lemon Squeezy 5% + $0.50; Payhip free plan 5% + processing; Gumroad 10% + $0.50 | `products.printablePackUrl` | When the email list passes ~200 or traffic passes ~5k pageviews |
| Email | Kit (formerly ConvertKit) | Free to 10,000 subscribers (1 form, 1 landing page, 1 automation, Kit branding) | Owns the audience; sells the pack | `newsletter.action` | Now |
| Video | YouTube Partner Program | 1,000 subs + 4,000 watch hours in 12 months, or 10M Shorts views in 90 days. Early-access tier at 500 subs, 3 videos, 3,000 hours or 3M Shorts views. Thresholds rise to 8,000 hours / 20M views on 2027-02-01. | Ad share, plus the site gets the traffic | none | In parallel from day one if you can film |

Sources for the table: [Amazon rates (Geniuslink)](https://geniuslink.com/blog/amazon-affiliate-commission-rates/), [Amazon rates (Lasso)](https://getlasso.co/amazon-affiliate-commission-rate/), [Home Depot program (Geniuslink)](https://geniuslink.com/blog/home-depot-affiliate-program/), [Home Depot FAQ](https://www.homedepot.com/c/SF_MS_Affiliate_Program_FAQs), [Lowe's (Lasso)](https://getlasso.co/affiliate/lowes/), [Lowe's (Niche Pursuits)](https://www.nichepursuits.com/lowes-affiliate-program/), [Mediavine requirements 2026](https://www.jupiter.co/blog/mediavine-requirements-2026-how-to-qualify), [Journey by Mediavine](https://www.productiveblogging.com/everything-you-need-to-know-about-journey-by-mediavine/), [Mediavine and Raptive requirement changes](https://thisweekinblogging.com/mediavine-raptive-requirements/), [Ad networks ranked by RPM 2026](https://newormedia.com/blog/best-ad-networks-for-publishers-2026/), [Angi affiliate program](https://linkclicky.com/affiliate-program/angi/), [Networx affiliates](https://affiliates.networx.com/), [Gumroad vs Payhip vs Lemon Squeezy 2026](https://www.wearefounders.uk/best-platforms-for-selling-digital-products-in-2026/), [Kit free plan](https://www.passivekit.com/kit-free-plan/), [YouTube Partner Program 2026](https://air.io/en/monetization/youtube-partner-program-requirements-2026-the-complete-guide).

## 3. What the numbers look like

Display revenue is the only line that can be estimated from published data. Everything else you measure once it's running.

| Monthly pageviews | Display at $20 RPM | Display at $35 RPM |
| --- | --- | --- |
| 10,000 | $200 | $350 |
| 50,000 | $1,000 | $1,750 |
| 200,000 | $4,000 | $7,000 |

RPM range source: [Newor Media](https://newormedia.com/blog/best-ad-networks-for-publishers-2026/) ($15–45 depending on niche); home and DIY sit in the upper half of lifestyle niches (**assumption** based on how ad networks describe the category, not a measured figure for this site).

Two data points from published income reports, for calibration only: one DIY blogger reported roughly $7,000/month from Amazon links and $7,000/month from display ads; another at ~290,000 monthly pageviews earned 87% of income from Mediavine display and 2% from affiliates ([Blogging Guide's list of income reports](https://bloggingguide.com/blog-income-reports/), [Minimize My Mess five-year report](https://www.minimizemymess.com/blog/5-year-blog-income-report)). The spread between those two is the point: affiliate income depends entirely on how product-focused the content is. Repair guides with a parts list on every page lean toward the first case.

Affiliate arithmetic to keep expectations honest: a $40 Amazon order at 3% is $1.20. The links earn on everything in the cart for 24 hours, which is where most Associates income actually comes from.

## 4. Compliance, already built in

- **FTC Endorsement Guides** (16 CFR Part 255, updated 2023): affiliate relationships must be disclosed clearly and conspicuously, near the links and before them, not only in a footer. The site prints a disclosure directly above every parts-and-tools list, in the footer, and on the About page. Sources: [FTC's Endorsement Guides: What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking), [16 CFR Part 255](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255), [Davis Wright Tremaine summary of the 2023 update](https://www.dwt.com/insights/2023/07/ftc-advertising-endorsement-and-testimonial-guides).
- **Amazon's required statement** ("As an Amazon Associate we earn from qualifying purchases") appears automatically in the footer and About page once `amazonTag` is set.
- **Privacy policy**: required by AdSense and most affiliate programs. The About page carries one that rewrites itself to mention ads and analytics only when those switches are on.
- **`rel="sponsored nofollow"`** on every affiliate link, as Google asks.
- **Safety disclaimer** on every page footer and the About page. **Assumption, not legal advice:** once there's real revenue, an LLC and a general-liability policy are the normal step for a site that tells people to open electrical boxes.

## 5. Traffic: the actual work

**Search.** Each guide targets a symptom query the way people type it ("toilet keeps running", "outlet has no power but breaker is on"), with a unique title, meta description, canonical URL, and Article + HowTo + BreadcrumbList structured data. Note that Google removed HowTo rich results in September 2023 and FAQ rich results in May 2026 ([Search Engine Journal](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/)), so the structured data is there for machine understanding and AI answer engines, not for special result boxes. Submit `fixit/sitemap.xml` in Google Search Console and Bing Webmaster Tools the day the domain is live.

**Video.** Home repair is a video-native niche. Every guide's step list is a 60-second Short script. Embedding the video on the guide page lifts time-on-page, and the channel is a second monetization track with its own thresholds (table above).

**Pinterest.** DIY and home content is one of Pinterest's largest categories and DIY bloggers routinely cite it as a top referrer ([Anastasia Blogger on Pinterest for DIY](https://anastasiablogger.com/blogging/pinterest-diy-crafts-home-decor/)). **Assumption:** worth one pin per guide; verify with your own analytics after 90 days.

**Cadence.** One guide per week. Seasonal timing matters: dryer vent and gutter content in early fall, AC and outdoor faucet content in spring, frozen pipe content in December.

**Cross-promotion inside your own site.** The stud finder simulator, the level, and the paint calculator already exist here and are linked from the guides and the toolkit page.

### Next 12 guides, by search intent

Replace a toilet fill valve (split from the running-toilet guide) · Unclog a toilet without a plunger · Replace an outlet · Replace a smoke or CO alarm · Fix a wobbly toilet (shims, not the wax ring) · Replace a door lock or deadbolt · Clean gutters safely · Flush a water heater · Replace weatherstripping and a door sweep · Replace a furnace filter and understand MERV · Fix low water pressure at one fixture · Replace a thermostat. Each has a published pro price to put in `costs.js`.

## 6. Sequence

**Week 1.** Buy the domain. Decide repo placement. Set `siteUrl`/`basePath`, rebuild, deploy. Search Console and Bing verification, submit the sitemap. Open a Kit account, paste the form action into `newsletter.action`. Apply to Amazon Associates; set `amazonTag` when approved. Read the safety boxes on the electrical guides one more time with a local code check for your state.

**Weeks 2–8.** One new guide a week with a Short. Pin each guide. Watch Search Console for the queries that are getting impressions and write the next guide toward them.

**Month 3.** Apply to Journey by Mediavine (1,000 sessions). Apply to Angi/Impact and Networx; set `leadGen.url`. Build the printable pack (the checklist page is the free version) and list it on Lemon Squeezy; set `products.printablePackUrl`.

**Months 4–12.** Apply to Home Depot and Lowe's once traffic is respectable. Move from Journey to Raptive at 25k pageviews. Start replacing Amazon search links with product-specific links for the tools that convert (Associates reports tell you which). Consider tool-brand sponsorships once the video channel has an audience.

## 7. Things I decided so you didn't have to (and why)

- **Amazon search links instead of product links.** Product links convert better but rot when listings change, and I can't verify live ASINs from here. Search links with your tag earn on whatever the visitor buys. Swap the top 10 tools to product links once Associates data shows which ones move.
- **No ad slots rendered until configured.** Empty ad boxes look broken and hurt trust; AdSense Auto ads and Journey both inject themselves from a single script tag.
- **Newsletter box hidden until configured.** A form that goes nowhere is worse than no form. The checklist page is the free lead magnet in the meantime.
- **Light theme by default.** Content sites monetize better in light mode (ads and product images read as intended) and the guides get read in bathrooms and garages in daylight. Dark mode follows the system setting and a toggle.
- **Pro prices as ranges with sources and a retrieval date** on every page. A single made-up number is the fastest way to lose a reader who just got a real quote.
