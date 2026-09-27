/* Page templates for the Solo Ledger generator. Pure functions: content in, HTML out. */
"use strict";

const config = require("./config");
let patterns = { takeaways: [] };
try { patterns = require("./content/patterns"); } catch (e) { patterns = { takeaways: [] }; }

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const DIFF = ["", "Weekend project", "Easy", "Moderate", "Hard", "Very hard"];
const KIND = {
  "self-reported": ["Self-reported", "The founder published this number. Nobody audited it."],
  estimate: ["Estimate", "A third-party or back-of-envelope estimate, not a founder disclosure."],
  "disclosed-sale": ["Sale price", "The disclosed price the business sold for."],
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const u = (p = "") => config.basePath + p;
const abs = (p = "") => config.siteUrl + p;

function compact(n) {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
  return "$" + Math.round(n);
}
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function catName(id) { const c = config.categories.find((c) => c.id === id); return c ? c.name : id; }
const modelName = (id) => config.models[id] || id;
const channelName = (id) => config.channels[id] || id;
function monthLabel(asOf) {
  const [y, m] = String(asOf).split("-");
  if (!m) return y;
  return new Date(Date.UTC(+y, +m - 1, 1)).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
function issueUrl(title, body) {
  return `${config.issuesUrl}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
const SUGGEST_URL = issueUrl("Case suggestion: <business name>", "Business:\nFounder:\nWhy it counts as one-person:\nPublic revenue figure and link:\n");
const POTENTIAL = { high: "High potential", medium: "Medium potential", low: "Low potential" };
function host(url) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; } }

function dots(n) {
  return `<span class="dots" role="img" aria-label="Difficulty ${n} of 5">${"●".repeat(n)}<span class="off">${"●".repeat(5 - n)}</span></span>`;
}
function kindBadge(kind) {
  const [label, title] = KIND[kind];
  return `<span class="kind kind-${kind}" title="${esc(title)}">${label}</span>`;
}

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="var(--accent)"/><path d="M9 22V10m0 12h14M13 19v-4m4 4v-7m4 7v-9" stroke="var(--accent-ink)" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`;
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f6f54"/><path d="M9 22V10m0 12h14M13 19v-4m4 4v-7m4 7v-9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`;

function analytics() {
  let s = "";
  if (config.analytics.plausibleDomain) s += `<script defer data-domain="${esc(config.analytics.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>\n`;
  if (config.analytics.gaMeasurementId) {
    const id = esc(config.analytics.gaMeasurementId);
    s += `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');</script>\n`;
  }
  return s;
}

function layout({ title, description, path, body, jsonLd = [], current = "", type = "website" }) {
  const fullTitle = path === "" ? `${config.siteName}: ${config.tagline}` : `${title} · ${config.siteName}`;
  const canonical = abs(path);
  const nav = [
    ["", "Cases"],
    ["ideas/", "Ideas"],
    ["lists/", "Top lists"],
    ["scanner/", "Fit scanner"],
    ["patterns/", "Patterns"],
    ["about/", "Method"],
  ].map(([p, label]) => `<a href="${u(p)}"${current === p ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(config.siteName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#f5f3ec" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121614" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${u("assets/favicon.svg")}" type="image/svg+xml">
<script>(function(){try{var t=JSON.parse(localStorage.getItem("solo.theme"));if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<link rel="stylesheet" href="${u("assets/site.css")}">
${ld}
${analytics()}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="${u("")}">${LOGO}<span>Solo<span class="dot">Ledger</span></span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Site">
      ${nav}
      <button class="theme-btn" type="button" aria-label="Toggle dark mode" title="Toggle dark mode"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg></button>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <strong>${esc(config.siteName)}</strong>
        <p>${esc(config.description)}</p>
      </div>
      <div>
        <strong>Browse</strong>
        <ul>
          <li><a href="${u("")}">All cases</a></li>
          <li><a href="${u("ideas/")}">Ideas to build</a></li>
          <li><a href="${u("lists/")}">Top lists</a></li>
          <li><a href="${u("scanner/")}">Fit scanner</a></li>
          <li><a href="${u("patterns/")}">Patterns</a></li>
          <li><a href="${u("cases.json")}">Raw data (JSON)</a></li>
        </ul>
      </div>
      <div>
        <strong>Fine print</strong>
        <ul>
          <li><a href="${u("about/")}">How we source numbers</a></li>
          <li><a href="${u("about/#corrections")}">Corrections</a></li>
          <li><a href="${esc(SUGGEST_URL)}" rel="noopener" target="_blank">Suggest a case</a></li>
          <li><a href="${u("about/#privacy")}">Privacy</a></li>
        </ul>
      </div>
    </div>
    <p class="fine">© ${new Date().getFullYear()} ${esc(config.siteName)}. Revenue figures are mostly self-reported by founders and dated; each one links to its source. Cases are researched with AI assistance from public sources and can contain errors; check the linked source before relying on a number. Nothing here is financial advice. Not affiliated with any business profiled.</p>
  </div>
</footer>
<script src="${u("assets/site.js")}" defer></script>
</body>
</html>
`;
}

/* ---------- shared blocks ---------- */

function card(c) {
  return `<li class="card" data-slug="${esc(c.slug)}" data-cat="${esc(c.category)}" data-model="${esc(c.model)}" data-channel="${esc(c.channel)}" data-band="${esc(c.band)}" data-annual="${c.annual}" data-started="${c.started}" data-diff="${c.rebuild.difficulty}" data-text="${esc([c.name, c.founder, c.tagline, c.rebuild.idea, ...c.stack].join(" ").toLowerCase())}">
  <div class="card-top"><span class="cat">${esc(catName(c.category))}</span><span class="year">since ${c.started}</span></div>
  <h3><a href="${u(`cases/${c.slug}/`)}">${esc(c.name)}</a></h3>
  <p class="founder">${esc(c.founder)}</p>
  <p class="tagline">${esc(c.tagline)}</p>
  <div class="rev"><span class="num">${esc(c.revenue.label)}</span>${kindBadge(c.revenue.kind)}</div>
  <div class="meta"><span>${esc(modelName(c.model))}</span><span>via ${esc(channelName(c.channel))}</span></div>
</li>`;
}

function select(id, label, options) {
  return `<label class="field"><span>${label}</span><select id="${id}"><option value="all">All</option>${options.map(([v, n, count]) => `<option value="${esc(v)}">${esc(n)}${count !== undefined ? ` (${count})` : ""}</option>`).join("")}</select></label>`;
}
function countBy(cases, key) {
  const m = {};
  cases.forEach((c) => { m[c[key]] = (m[c[key]] || 0) + 1; });
  return m;
}

function newsletterBlock() {
  if (!config.newsletter.action) return "";
  return `<section class="panel newsletter">
  <h2>${esc(config.newsletter.headline)}</h2>
  <p>${esc(config.newsletter.blurb)}</p>
  <form action="${esc(config.newsletter.action)}" method="post" target="_blank">
    <label class="visually-hidden" for="nl-email">Email address</label>
    <input id="nl-email" type="email" name="email_address" placeholder="you@example.com" required autocomplete="email">
    <button class="btn btn-primary" type="submit">Subscribe</button>
  </form>
</section>`;
}

/* ---------- pages ---------- */

function home(cases) {
  const total = cases.reduce((s, c) => s + c.annual, 0);
  const cats = countBy(cases, "category");
  const models = countBy(cases, "model");
  const chans = countBy(cases, "channel");
  const bands = countBy(cases, "band");
  const body = `
<section class="hero">
  <div class="wrap">
    <p class="eyebrow">One founder. No team. Real numbers.</p>
    <h1>How one-person businesses actually make money.</h1>
    <p class="lede">${cases.length} teardowns of businesses run by a single person: the revenue they disclosed and where it came from, how they started, the channel that brought customers, what protects them, and an adjacent idea you could build with the same playbook.</p>
    <dl class="stats">
      <div><dt>Cases</dt><dd>${cases.length}</dd></div>
      <div><dt>Combined revenue, annualized</dt><dd>${compact(total)}</dd></div>
      <div><dt>Median case</dt><dd>${compact(median(cases.map((c) => c.annual)))}/yr</dd></div>
      <div><dt>Founder-reported figures</dt><dd>${cases.filter((c) => c.revenue.kind === "self-reported").length} of ${cases.length}</dd></div>
    </dl>
    <nav class="tiles" aria-label="Explore">
      <a href="${u("ideas/")}"><span>Ideas to build</span><strong>${cases.length} rebuild plans</strong><em>What to build, market, steps, stack, pricing</em></a>
      <a href="${u("scanner/")}"><span>Fit scanner</span><strong>Which playbook fits you?</strong><em>7 questions, 3 matched cases</em></a>
      <a href="${u("lists/")}"><span>Top lists</span><strong>${LISTS.length} curated lists</strong><em>Biggest, newest, easiest, data-first…</em></a>
      <a href="${u("patterns/")}"><span>Patterns</span><strong>What the cases share</strong><em>Channels, models, takeaways</em></a>
    </nav>
  </div>
</section>

<section class="section" id="cases">
  <div class="wrap">
    <form class="toolbar" id="filters" role="search" onsubmit="return false">
      <label class="field grow"><span>Search</span><input id="q" type="search" placeholder="Name, founder, stack, idea…" autocomplete="off"></label>
      ${select("f-cat", "Category", config.categories.filter((c) => cats[c.id]).map((c) => [c.id, c.name, cats[c.id]]))}
      ${select("f-model", "Model", Object.keys(config.models).filter((k) => models[k]).map((k) => [k, config.models[k], models[k]]))}
      ${select("f-channel", "Channel", Object.keys(config.channels).filter((k) => chans[k]).map((k) => [k, config.channels[k], chans[k]]))}
      ${select("f-band", "Revenue", config.bands.filter((b) => bands[b.id]).map((b) => [b.id, b.name, bands[b.id]]))}
      <label class="field"><span>Sort</span><select id="sort">
        <option value="annual">Highest revenue</option>
        <option value="started-desc">Newest</option>
        <option value="started-asc">Oldest</option>
        <option value="diff">Easiest idea to build</option>
        <option value="name">A–Z</option>
      </select></label>
    </form>
    <p class="count" id="count" aria-live="polite">${cases.length} cases</p>
    <ul class="cards" id="cards">
${cases.map(card).join("\n")}
    </ul>
    <p class="empty" id="empty" hidden>No case matches those filters. <button type="button" class="linkish" id="reset">Clear filters</button></p>
    <p class="note">Revenue is annualized for sorting (monthly × 12; one-off totals such as a launch week count as one year). Each figure is dated and linked to its source on the case page. <a href="${u("about/")}">How we source numbers →</a></p>
  </div>
</section>
${newsletterBlock() ? `<section class="section"><div class="wrap">${newsletterBlock()}</div></section>` : ""}`;
  return layout({
    title: config.siteName,
    description: config.description,
    path: "",
    body,
    current: "",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebSite", name: config.siteName, url: abs(""), description: config.description }],
  });
}

function section(id, title, inner) {
  return `<section class="block" id="${id}"><h2>${title}</h2>${inner}</section>`;
}
const ul = (xs, cls = "") => `<ul${cls ? ` class="${cls}"` : ""}>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;

function casePage(c, cases) {
  const r = c.revenue;
  const i = cases.indexOf(c);
  const prev = cases[(i - 1 + cases.length) % cases.length];
  const next = cases[(i + 1) % cases.length];
  const similar = cases
    .filter((x) => x !== c)
    .map((x) => ({ x, score: (x.category === c.category ? 2 : 0) + (x.channel === c.channel ? 1 : 0) + (x.model === c.model ? 1 : 0) }))
    .filter((o) => o.score > 0)
    .sort((a, b) => b.score - a.score || b.x.annual - a.x.annual)
    .slice(0, 3)
    .map((o) => o.x);
  const facts = [
    ["Revenue", `<span class="num">${esc(r.label)}</span> ${kindBadge(r.kind)}<small>as of ${esc(monthLabel(r.asOf))} · <a href="${esc(r.source)}" rel="noopener" target="_blank">source</a></small>`],
    ["Founded", esc(c.started)],
    ["Team", esc(c.team)],
    ["Startup cost (approx.)", esc(c.startupCost || "Not disclosed")],
    ["First dollar", esc(c.timeToFirstDollar || "Not disclosed")],
    ["Model", esc(modelName(c.model))],
    ["Main channel", esc(channelName(c.channel))],
    ["Stack", c.stack.length ? c.stack.map(esc).join(", ") : "Not disclosed"],
  ];
  const rb = c.rebuild;
  const toc = [["overview", "Overview"], ["origin", "Origin"], ["money", "How it makes money"], ["growth", "What drove growth"], ["timeline", "Timeline"], ["moat", "Moat & risks"], ["lessons", "Lessons"], ["rebuild", "Build next"], ["sources", "Sources"]];
  const body = `
<article class="case">
  <header class="case-head">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${u("")}">Cases</a> / <a href="${u("")}#cat=${esc(c.category)}">${esc(catName(c.category))}</a></nav>
      <h1>${esc(c.name)}</h1>
      <p class="lede">${esc(c.tagline)}</p>
      <p class="byline">Built by <strong>${esc(c.founder)}</strong> · <a href="${esc(c.url)}" rel="noopener" target="_blank">${esc(host(c.url))} ↗</a></p>
      <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
    </div>
  </header>
  <div class="wrap case-grid">
    <aside class="toc" aria-label="On this page"><strong>On this page</strong><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol></aside>
    <div class="case-body">
      ${section("overview", "Overview", `<p>${esc(c.summary)}</p>`)}
      ${section("origin", "Origin", `<p>${esc(c.origin)}</p>`)}
      ${section("money", "How it makes money", `<p>${esc(c.howItMakesMoney)}</p>`)}
      ${section("growth", "What drove growth", ul(c.growth, "ticks"))}
      ${section("timeline", "Timeline", `<ol class="timeline">${c.timeline.map((t) => `<li><time>${esc(t.date)}</time><span>${esc(t.event)}</span></li>`).join("")}</ol>`)}
      ${section("moat", "Moat & risks", `<div class="two"><div class="panel good"><h3>What protects it</h3><p>${esc(c.moat)}</p></div><div class="panel bad"><h3>What could hurt it</h3><p>${esc(c.risks)}</p></div></div>`)}
      ${section("lessons", "Lessons you can reuse", `<ol class="lessons">${c.lessons.map((l) => `<li>${esc(l)}</li>`).join("")}</ol>`)}
      <section class="block rebuild" id="rebuild">
        <p class="eyebrow">Rebuild plan · idea to build next</p>
        <h2>${esc(rb.idea)}</h2>
        <dl class="mini">
          <div><dt>Difficulty</dt><dd>${dots(rb.difficulty)} ${DIFF[rb.difficulty]}</dd></div>
          <div><dt>Hours / week</dt><dd>${esc(rb.weeklyHours)}</dd></div>
          ${rb.potential ? `<div><dt>Market potential</dt><dd><span class="pot pot-${esc(rb.potential)}">${esc(POTENTIAL[rb.potential] || rb.potential)}</span></dd></div>` : ""}
          <div><dt>Best fit</dt><dd>${esc(rb.fit)}</dd></div>
        </dl>
        <div class="plan">
          <div class="part"><span class="n">01</span><h3>What to build</h3><p>${esc(rb.why)}</p></div>
          ${rb.market ? `<div class="part"><span class="n">02</span><h3>Market</h3><p>${esc(rb.market)}</p></div>` : ""}
          <div class="part"><span class="n">${rb.market ? "03" : "02"}</span><h3>30-day path to a first paying customer</h3><ol class="steps">${rb.mvp.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
          ${rb.stack && rb.stack.length ? `<div class="part"><span class="n">04</span><h3>Tech stack</h3><ul class="tags">${rb.stack.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
          ${rb.pricing ? `<div class="part"><span class="n">05</span><h3>Revenue model</h3><p>${esc(rb.pricing)}</p></div>` : ""}
        </div>
        <p class="small">This plan is our idea, not the founder's, and the market notes are our judgment. We haven't validated the demand: talk to 10 potential buyers before you write code.</p>
      </section>
      ${section("sources", "Sources", `<ol class="sources">${c.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a> <span class="host">${esc(host(s.url))}</span></li>`).join("")}</ol><p class="small">Figures are ${esc(KIND[r.kind][0].toLowerCase())} and dated ${esc(monthLabel(r.asOf))}. Spotted something out of date? <a href="${esc(issueUrl(`Correction: ${c.name}`, `Page: ${abs(`cases/${c.slug}/`)}\nWhat is wrong:\nNewer or better source (link):\n`))}" rel="noopener" target="_blank">Send a correction</a>.</p>`)}
      ${similar.length ? `<section class="block"><h2>Similar cases</h2><ul class="cards small-cards">${similar.map(card).join("")}</ul></section>` : ""}
      <nav class="pager" aria-label="More cases"><a href="${u(`cases/${prev.slug}/`)}">← ${esc(prev.name)}</a><a href="${u(`cases/${next.slug}/`)}">${esc(next.name)} →</a></nav>
    </div>
  </div>
</article>`;
  const description = `${c.name} by ${c.founder}: ${r.label} (${KIND[r.kind][0].toLowerCase()}, ${monthLabel(r.asOf)}). How it started, grew, and an idea to build next.`;
  return layout({
    title: `${c.name} case study (${r.label})`,
    description,
    path: `cases/${c.slug}/`,
    body,
    type: "article",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${c.name}: one-person business case study`,
      description,
      about: { "@type": "Organization", name: c.name, url: c.url, founder: { "@type": "Person", name: c.founder } },
      dateModified: BUILD_DATE,
      publisher: { "@type": "Organization", name: config.siteName },
      mainEntityOfPage: abs(`cases/${c.slug}/`),
    }],
  });
}

function ideasPage(cases) {
  const sorted = [...cases].sort((a, b) => a.rebuild.difficulty - b.rebuild.difficulty || a.name.localeCompare(b.name));
  const body = `
<section class="hero slim"><div class="wrap">
  <p class="eyebrow">Ideas to build</p>
  <h1>${cases.length} ideas borrowed from businesses that already work.</h1>
  <p class="lede">Each idea reuses a proven playbook in a niche the original doesn't serve. Easiest first. Every one links back to the case it came from, so you can see the evidence before you commit a weekend.</p>
  <div class="chips" role="group" aria-label="Filter by difficulty">
    <button class="chip" type="button" data-diff="all" aria-pressed="true">All</button>
    ${[1, 2, 3, 4, 5].filter((d) => cases.some((c) => c.rebuild.difficulty === d)).map((d) => `<button class="chip" type="button" data-diff="${d}" aria-pressed="false">${DIFF[d]}</button>`).join("")}
  </div>
</div></section>
<section class="section"><div class="wrap">
  <ol class="ideas" id="ideas">
${sorted.map((c) => `<li class="idea" data-diff="${c.rebuild.difficulty}">
  <div class="idea-meta">${dots(c.rebuild.difficulty)} <span>${DIFF[c.rebuild.difficulty]}</span><span>${esc(c.rebuild.weeklyHours.replace(/\s*\(.*\)\s*$/, ""))} h/wk</span>${c.rebuild.potential ? `<span class="pot pot-${esc(c.rebuild.potential)}">${esc(POTENTIAL[c.rebuild.potential] || c.rebuild.potential)}</span>` : ""}</div>
  <h3>${esc(c.rebuild.idea)}</h3>
  <p>${esc(c.rebuild.why)}</p>
  <p class="fit"><strong>Best fit:</strong> ${esc(c.rebuild.fit)}</p>
  ${c.rebuild.stack && c.rebuild.stack.length ? `<ul class="tags">${c.rebuild.stack.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
  <p class="from">Playbook from <a href="${u(`cases/${c.slug}/#rebuild`)}">${esc(c.name)}</a> · ${esc(c.revenue.label)}</p>
</li>`).join("\n")}
  </ol>
</div></section>`;
  return layout({ title: "Ideas to build", description: `${cases.length} one-person business ideas adapted from businesses with published revenue, sorted by difficulty.`, path: "ideas/", body, current: "ideas/" });
}

function groupTable(cases, key, nameOf, heading) {
  const groups = {};
  cases.forEach((c) => { (groups[c[key]] = groups[c[key]] || []).push(c); });
  const rows = Object.entries(groups)
    .map(([k, xs]) => ({ k, n: xs.length, med: median(xs.map((x) => x.annual)), names: xs.map((x) => x.name) }))
    .sort((a, b) => b.n - a.n || b.med - a.med);
  const max = Math.max(...rows.map((r) => r.n));
  return `<div class="table-wrap"><table class="bars">
<caption>${heading}</caption>
<thead><tr><th scope="col">${heading.split(" ")[0]}</th><th scope="col">Cases</th><th scope="col">Median revenue/yr</th><th scope="col">Examples</th></tr></thead>
<tbody>${rows.map((r) => `<tr><th scope="row">${esc(nameOf(r.k))}</th><td><span class="bar" style="--w:${(r.n / max) * 100}%"></span><span class="num">${r.n}</span></td><td class="num">${compact(r.med)}</td><td class="small">${esc(r.names.slice(0, 3).join(", "))}${r.names.length > 3 ? "…" : ""}</td></tr>`).join("")}</tbody>
</table></div>`;
}

function patternsPage(cases) {
  const ages = cases.map((c) => Number(String(c.revenue.asOf).slice(0, 4)) - c.started);
  const body = `
<section class="hero slim"><div class="wrap">
  <p class="eyebrow">Patterns</p>
  <h1>What ${cases.length} one-person businesses have in common.</h1>
  <p class="lede">Counts and medians computed from the cases on this site. It's a small sample of survivors that chose to publish their numbers, so read it as a map of what has worked, not as odds of success.</p>
  <dl class="stats">
    <div><dt>Median years from launch to the quoted figure</dt><dd>${median(ages)}</dd></div>
    <div><dt>Median revenue/yr</dt><dd>${compact(median(cases.map((c) => c.annual)))}</dd></div>
    <div><dt>Cases at $1M+/yr</dt><dd>${cases.filter((c) => c.annual >= 1e6).length} of ${cases.length}</dd></div>
  </dl>
</div></section>
<section class="section"><div class="wrap narrow">
  ${patterns.takeaways.length ? `<h2>Takeaways</h2><ol class="lessons">${patterns.takeaways.map((t) => `<li><strong>${esc(t.title)}</strong> ${esc(typeof t.body === "function" ? t.body(cases) : t.body)}</li>`).join("")}</ol>` : ""}
  <h2>By acquisition channel</h2>
  ${groupTable(cases, "channel", channelName, "Channel that brought most customers")}
  <h2>By business model</h2>
  ${groupTable(cases, "model", modelName, "Model and how it charges")}
  <h2>By category</h2>
  ${groupTable(cases, "category", catName, "Category of business")}
</div></section>`;
  return layout({ title: "Patterns across one-person businesses", description: `Channels, business models, and categories across ${cases.length} one-person businesses with published revenue.`, path: "patterns/", body, current: "patterns/" });
}

function aboutPage(cases) {
  const body = `
<section class="hero slim"><div class="wrap">
  <p class="eyebrow">Method</p>
  <h1>How we pick cases and source numbers.</h1>
</div></section>
<section class="section"><div class="wrap narrow prose">
  <h2>What counts as a one-person business</h2>
  <p>One founder does the building, selling, and support, with no full-time employees. Freelance help (a designer for a week, a contractor for support) is fine and shows up in the Team field. Businesses that were solo for the period we describe and later hired are marked as such.</p>
  <h2>Where the numbers come from</h2>
  <p>Every revenue figure links to a public source: the founder's own posts, an interview, a podcast, a public revenue dashboard, or press coverage. Each is labeled with one of:</p>
  <ul>
    <li>${kindBadge("self-reported")} the founder published it. Nobody audited it.</li>
    <li>${kindBadge("estimate")} a third party estimated it. Treat it as a rough order of magnitude.</li>
    <li>${kindBadge("disclosed-sale")} the price the business sold for, as disclosed by the buyer or seller.</li>
  </ul>
  <p>Numbers carry the month they were true. Revenue in these businesses moves fast, in both directions. For sorting we annualize monthly figures (× 12) and treat one-off totals, such as a launch week, as a year. Annualizing a monthly figure overstates a business that is shrinking and understates one that is growing.</p>
  <h2>Survivorship bias</h2>
  <p>These are businesses that worked and whose founders chose to publish numbers. For every one of them there are many that didn't make money. The "Ideas to build" section is meant to shorten your path to a first test, not to promise a result.</p>
  <h2>AI assistance</h2>
  <p>Cases are researched and drafted with AI assistance from public sources: founders' posts, interviews, podcasts, and press. Every figure carries its source link so you can check it. AI can misread a source; if you find an error, please report it.</p>
  <h2>The ideas are ours</h2>
  <p>Each case ends with an adjacent idea that reuses its playbook. The founders didn't suggest them and we haven't validated demand for them.</p>
  <h2 id="corrections">Corrections</h2>
  <p>If a figure is out of date or wrong, use the "Send a correction" link at the bottom of the case page, or <a href="${esc(SUGGEST_URL)}" rel="noopener" target="_blank">suggest a business we missed</a>. Send the newer source and we'll update the page and its date.${config.contactEmail ? ` Email <a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a>.` : " Open an issue on the <a href=\"https://github.com/taoli1707/taoli1707.github.io/issues\">site's GitHub repository</a>."}</p>
  <h2 id="privacy">Privacy</h2>
  <p>The site sets no cookies. Your theme choice is kept in your browser's local storage and never leaves your device.${config.analytics.plausibleDomain ? " We use Plausible for cookieless, aggregate page-view counts." : ""}${config.analytics.gaMeasurementId ? " We use Google Analytics, which sets cookies, to count visits." : ""}</p>
  <h2>Data</h2>
  <p>All ${cases.length} cases are available as <a href="${u("cases.json")}">JSON</a>. Last built ${BUILD_DATE}.</p>
</div></section>`;
  return layout({ title: "Method", description: "How Solo Ledger picks one-person business cases and sources their revenue figures.", path: "about/", body, current: "about/" });
}

/* ---------- top lists ---------- */

const OWN_AUDIENCE = ["build-in-public", "twitter-x", "linkedin", "newsletter", "youtube"];
const DATA_RE = /\b(data|dataset|scrap\w*|crawl\w*|ETL|pipeline|API|aggregat\w*|index)\b/i;
const hoursLo = (c) => Number((String(c.rebuild.weeklyHours).match(/\d+/) || [99])[0]);
const byAnnual = (a, b) => b.annual - a.annual;
const byDiff = (a, b) => a.rebuild.difficulty - b.rebuild.difficulty || b.annual - a.annual;
const revStat = (c) => `${c.revenue.label}`;
const ideaStat = (c) => c.rebuild.idea;

const LISTS = [
  { id: "biggest", title: "Biggest one-person businesses", blurb: "Ranked by annualized revenue. Estimates are labeled.", pick: (cs) => [...cs].sort(byAnnual), stat: revStat },
  { id: "newest", title: "Newest businesses already earning", blurb: "Launched in 2021 or later, ranked by revenue. Evidence that the window is still open.", pick: (cs) => cs.filter((c) => c.started >= 2021).sort(byAnnual), stat: revStat },
  { id: "no-audience", title: "Grew without a personal audience", blurb: "The main channel was SEO, word of mouth, a marketplace or a launch site, not the founder's following.", pick: (cs) => cs.filter((c) => !OWN_AUDIENCE.includes(c.channel)).sort(byAnnual), stat: (c) => `${channelName(c.channel)} · ${c.revenue.label}` },
  { id: "audience-first", title: "Audience-first businesses", blurb: "The founder's own following brought most customers. Build the audience and the product together.", pick: (cs) => cs.filter((c) => OWN_AUDIENCE.includes(c.channel)).sort(byAnnual), stat: (c) => `${channelName(c.channel)} · ${c.revenue.label}` },
  { id: "data-first", title: "Best playbooks for data engineers", blurb: "Businesses and ideas built on collecting, cleaning or indexing data.", pick: (cs) => cs.filter((c) => ["data-api", "marketplace-directory"].includes(c.category) || DATA_RE.test(c.rebuild.idea + " " + c.rebuild.fit)).sort(byDiff), stat: ideaStat },
  { id: "easiest", title: "Easiest ideas to build", blurb: "Lowest difficulty first. Good first projects for nights and weekends.", pick: (cs) => [...cs].sort(byDiff), stat: ideaStat },
  { id: "side-hustle", title: "Ideas that fit under 10 hours a week", blurb: "Plans whose weekly time estimate starts at 8 hours or less.", pick: (cs) => cs.filter((c) => hoursLo(c) <= 8).sort(byDiff), stat: (c) => `${c.rebuild.weeklyHours.replace(/\s*\(.*\)\s*$/, "")} h/wk · ${c.rebuild.idea}` },
  { id: "high-potential", title: "Highest-potential ideas", blurb: "Ideas we rate high potential for a solo founder, easiest first. Our judgment, not a forecast.", pick: (cs) => cs.filter((c) => c.rebuild.potential === "high").sort(byDiff), stat: ideaStat },
  { id: "recurring", title: "Biggest subscription businesses", blurb: "Recurring revenue: slower to start, easier to live on.", pick: (cs) => cs.filter((c) => c.model === "subscription").sort(byAnnual), stat: revStat },
  { id: "one-time", title: "Pay-once products that worked", blurb: "Templates, courses, boilerplates and credit packs. No churn to fight, but you need new buyers every month.", pick: (cs) => cs.filter((c) => c.model === "one-time").sort(byAnnual), stat: revStat },
  { id: "oldest", title: "Longest-running", blurb: "Oldest first. Durable niches and what kept them alive.", pick: (cs) => [...cs].sort((a, b) => a.started - b.started), stat: (c) => `Since ${c.started} · ${c.revenue.label}` },
];

function listsPage(cases) {
  const lists = LISTS.map((l) => ({ ...l, items: l.pick(cases).slice(0, 10) })).filter((l) => l.items.length >= 3);
  const body = `
<section class="hero slim"><div class="wrap">
  <p class="eyebrow">Top lists</p>
  <h1>${lists.length} curated lists of one-person businesses.</h1>
  <p class="lede">Computed from the case data on each build, so they update when a case is added or corrected. Up to 10 entries each.</p>
  <nav class="chips" aria-label="Jump to a list">${lists.map((l) => `<a class="chip" href="#${l.id}">${esc(l.title)}</a>`).join("")}</nav>
</div></section>
<section class="section"><div class="wrap lists">
${lists.map((l) => `<section class="list panel" id="${l.id}">
  <h2>${esc(l.title)}</h2>
  <p class="small">${esc(l.blurb)}</p>
  <ol>${l.items.map((c) => `<li><a href="${u(`cases/${c.slug}/`)}">${esc(c.name)}</a><span>${esc(l.stat(c))}</span></li>`).join("")}</ol>
</section>`).join("\n")}
</div></section>`;
  return layout({ title: "Top lists", description: `${lists.length} curated lists of one-person businesses: biggest, newest, no-audience-needed, best for data engineers, easiest ideas and more.`, path: "lists/", body, current: "lists/" });
}

/* ---------- fit scanner ---------- */

const SCANNER = [
  { id: "hours", q: "How many hours a week can you give it?", opts: [["3", "Under 5"], ["8", "5–10"], ["15", "10–20"], ["25", "20+"]] },
  { id: "skill", q: "What's your strongest skill?", opts: [["code", "Building web apps"], ["data", "Data: pipelines, scraping, analysis"], ["writing", "Writing or teaching"], ["design", "Design or templates"]] },
  { id: "audience", q: "How many people follow you somewhere (X, LinkedIn, newsletter, YouTube)?", opts: [["none", "Almost nobody"], ["small", "Under 1,000"], ["medium", "1,000–10,000"], ["large", "10,000+"]] },
  { id: "posting", q: "Would you post about your work in public every week?", opts: [["yes", "Yes, happily"], ["no", "I'd rather not"]] },
  { id: "model", q: "How do you want to get paid?", opts: [["recurring", "Monthly subscriptions"], ["once", "One-time sales"], ["ads", "Ads or sponsors"], ["any", "No preference"]] },
  { id: "platform", q: "Would you build on top of another company's API or platform (OpenAI, Reddit, Notion…)?", opts: [["fine", "Fine, if it's fast"], ["avoid", "I'd rather own the whole thing"]] },
  { id: "speed", q: "How soon do you need the first dollar?", opts: [["fast", "Within a month"], ["slow", "I can build for months"]] },
];

function scannerData(cases) {
  return cases.map((c) => ({
    slug: c.slug, name: c.name, url: u(`cases/${c.slug}/`), cat: c.category, model: c.model, channel: c.channel,
    rev: c.revenue.label, diff: c.rebuild.difficulty, hours: hoursLo(c), idea: c.rebuild.idea, potential: c.rebuild.potential || "",
  }));
}

function scannerPage(cases) {
  const body = `
<section class="hero slim"><div class="wrap">
  <p class="eyebrow">Fit scanner</p>
  <h1>Which one-person playbook fits you?</h1>
  <p class="lede">Seven questions. We score every case against your time, skills, audience and appetite for risk, then show the three playbooks that fit best and the ones to avoid. Nothing you answer leaves your browser.</p>
</div></section>
<section class="section"><div class="wrap narrow">
  <form id="scanner" class="scanner">
${SCANNER.map((q, i) => `    <fieldset class="panel q">
      <legend><span class="n">${String(i + 1).padStart(2, "0")}</span> ${esc(q.q)}</legend>
      <div class="opts">${q.opts.map(([v, label]) => `<label><input type="radio" name="${q.id}" value="${v}" required> <span>${esc(label)}</span></label>`).join("")}</div>
    </fieldset>`).join("\n")}
    <button class="btn btn-primary" type="submit">Show my matches</button>
    <p class="small" id="scanner-missing" hidden>Answer all seven questions first.</p>
  </form>
  <div id="scanner-result" class="scanner-result" hidden aria-live="polite"></div>
  <script type="application/json" id="scanner-data">${JSON.stringify(scannerData(cases)).replace(/</g, "\\u003c")}</script>
</div></section>`;
  return layout({ title: "Fit scanner", description: "Answer seven questions to find the one-person business playbooks that fit your time, skills and audience.", path: "scanner/", body, current: "scanner/" });
}

function publicRecord(c) {
  const { annual, band, ...rest } = c;
  return rest;
}

function sitemap(cases) {
  const paths = ["", "ideas/", "lists/", "scanner/", "patterns/", "about/", ...cases.map((c) => `cases/${c.slug}/`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${esc(abs(p))}</loc><lastmod>${BUILD_DATE}</lastmod></url>`).join("\n")}
</urlset>
`;
}

module.exports = { home, casePage, ideasPage, listsPage, scannerPage, patternsPage, aboutPage, publicRecord, sitemap, FAVICON };
