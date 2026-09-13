/* Page templates for the Weekend Fixer generator. Pure functions: content in, HTML out. */
"use strict";

const config = require("./config");
const costs = require("./content/costs");
const tools = require("./content/tools");
const checklist = require("./content/checklist");
let diagrams = {};
try { diagrams = require("./content/diagrams"); } catch (e) { diagrams = {}; }

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const DIFF = ["", "Beginner", "Easy", "Moderate", "Advanced", "Expert"];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const strip = (html) => String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const u = (p = "") => config.basePath + p;
const abs = (p = "") => config.siteUrl + p;
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const mid = (arr) => (arr[0] + arr[1]) / 2;
const rangeStr = (lo, hi) => `$${lo}–${hi}`;

function catName(id) { const c = config.categories.find((c) => c.id === id); return c ? c.name : id; }
function proFor(g) { return costs.jobs[g.proCostKey]; }
function proMid(g) { const j = proFor(g); return (j.low + j.high) / 2; }
function savings(g) { return Math.max(0, Math.round((proMid(g) - mid(g.partsCost)) / 10) * 10); }

function amazonUrl(q) {
  const url = new URL("https://www.amazon.com/s");
  url.searchParams.set("k", q);
  if (config.affiliate.amazonTag) url.searchParams.set("tag", config.affiliate.amazonTag);
  return url.toString();
}
function shopLinks(q) {
  return `<span class="shop"><a href="${esc(amazonUrl(q))}" rel="sponsored nofollow noopener" target="_blank">Amazon</a><a href="${esc(config.affiliate.homeDepotUrl(q))}" rel="sponsored nofollow noopener" target="_blank">Home Depot</a></span>`;
}
const DISCLOSURE = `<p class="disclosure">Some links are affiliate links: if you buy through them we may earn a small commission at no extra cost to you. It never changes which products we recommend.</p>`;

function dots(n) {
  return `<span class="wrenches" role="img" aria-label="Difficulty ${n} of 5">${"●".repeat(n)}<span class="off">${"●".repeat(5 - n)}</span></span>`;
}

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="var(--accent)"/><path d="M22.8 8.2a5 5 0 0 0-6.3 6.4L8 23.1 10.9 26l8.5-8.5a5 5 0 0 0 6.4-6.3l-3 3-2.4-.6-.6-2.4z" fill="#fff"/></svg>`;
const SEARCH_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;

function analytics() {
  let s = "";
  if (config.analytics.plausibleDomain) s += `<script defer data-domain="${esc(config.analytics.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>\n`;
  if (config.analytics.gaMeasurementId) {
    const id = esc(config.analytics.gaMeasurementId);
    s += `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');</script>\n`;
  }
  if (config.ads.adsenseClient) s += `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(config.ads.adsenseClient)}" crossorigin="anonymous"></script>\n`;
  return s;
}

function layout({ title, description, path, body, jsonLd = [], current = "", type = "website", bodyClass = "" }) {
  const fullTitle = path === "" ? `${config.siteName} — ${config.tagline}` : `${title} · ${config.siteName}`;
  const canonical = abs(path);
  const nav = [
    ["guides/", "Guides"],
    ["tools/", "Toolkit"],
    ["diy-or-pro/", "DIY or pro?"],
    ["checklist/", "Checklist"],
    ["about/", "About"],
  ].map(([p, label]) => `<a href="${u(p)}"${current === p ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");
  const amazonLine = config.affiliate.amazonTag ? " As an Amazon Associate we earn from qualifying purchases." : "";
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
<meta name="theme-color" content="#f6f3ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15171b" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${u("assets/favicon.svg")}" type="image/svg+xml">
<script>(function(){try{var t=JSON.parse(localStorage.getItem("fixit.theme"));if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${u("assets/site.css")}">
${ld}
${analytics()}</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="${u("")}">${LOGO}<span>Weekend<span class="dot">Fixer</span></span></a>
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
        <p class="small">Repairs shown here are common, low-risk jobs. Gas lines, the main electrical panel, roofing, and anything structural belong to a licensed pro. Follow your local code and permit rules.</p>
      </div>
      <div>
        <strong>Site</strong>
        <ul>
          <li><a href="${u("guides/")}">All guides</a></li>
          <li><a href="${u("tools/")}">Starter toolkit</a></li>
          <li><a href="${u("diy-or-pro/")}">DIY or pro calculator</a></li>
          <li><a href="${u("checklist/")}">Seasonal checklist</a></li>
        </ul>
      </div>
      <div>
        <strong>Fine print</strong>
        <ul>
          <li><a href="${u("about/")}">About</a></li>
          <li><a href="${u("about/#disclosure")}">Affiliate disclosure</a></li>
          <li><a href="${u("about/#privacy")}">Privacy policy</a></li>
          <li><a href="${u("about/#contact")}">Contact</a></li>
        </ul>
      </div>
    </div>
    <p class="fine">© ${new Date().getFullYear()} ${esc(config.siteName)}. Some links on this site are affiliate links; we may earn a commission at no cost to you.${amazonLine} Pro prices are typical U.S. ranges from published cost guides and vary by region.</p>
  </div>
</footer>
<div class="toast" role="status" aria-live="polite"></div>
<script src="${u("assets/site.js")}" defer></script>
</body>
</html>
`;
}

function card(g) {
  return `<li class="card" data-cat="${esc(g.category)}" data-slug="${esc(g.slug)}">
  <span class="done-badge">Done ✓</span>
  <div class="cat">${esc(catName(g.category))}</div>
  <h3><a href="${u(`guides/${g.slug}/`)}">${esc(g.short)}</a></h3>
  <p>${esc(g.blurb)}</p>
  <div class="meta"><span>${dots(g.difficulty)} ${DIFF[g.difficulty]}</span><span>⏱ ${esc(g.time)}</span><span class="saves">Saves ~${money(savings(g))}</span></div>
</li>`;
}

function guideIndex(guides) {
  return guides.map((g) => ({
    slug: g.slug,
    title: g.short,
    url: u(`guides/${g.slug}/`),
    cat: g.category,
    symptoms: g.symptoms.map((s) => s.toLowerCase()),
    keywords: (g.keywords || []).map((s) => s.toLowerCase()),
    proMid: proMid(g),
    partsMid: mid(g.partsCost),
  }));
}

function chips(guides) {
  const counts = {};
  guides.forEach((g) => { counts[g.category] = (counts[g.category] || 0) + 1; });
  return `<div class="chips" role="group" aria-label="Filter by category">
  <button class="chip" type="button" data-cat="all" aria-pressed="true">All (${guides.length})</button>
  ${config.categories.map((c) => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="false">${esc(c.name)} (${counts[c.id] || 0})</button>`).join("\n  ")}
</div>`;
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

function productBlock() {
  if (!config.products.printablePackUrl) return "";
  return `<section class="panel accent product">
  <div>
    <h2>${esc(config.products.printablePackName)}</h2>
    <p>Every checklist and shopping list on this site as clean, printable PDFs, plus a maintenance calendar and an appliance record sheet.</p>
    <a class="btn btn-primary" href="${esc(config.products.printablePackUrl)}" rel="noopener" target="_blank">Get the pack · ${esc(config.products.printablePackPrice)}</a>
  </div>
</section>`;
}

function home(guides) {
  const examples = ["toilet keeps running", "sink drains slowly", "outlet has no power", "door sticks", "hole in the wall"];
  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <h1>Fix it yourself this weekend.</h1>
      <p class="lede">${esc(config.description)} Every guide is written for a first-timer, with honest difficulty ratings and the price a pro would charge.</p>
      <p><a class="btn btn-primary" href="${u("guides/")}">Browse the guides</a> <a class="btn btn-ghost" href="${u("diy-or-pro/")}">DIY or hire a pro?</a></p>
      <div class="stats" id="stats"></div>
    </div>
    <div class="hero-card">
      <h2>What's broken?</h2>
      <div class="search">
        ${SEARCH_ICON}
        <label class="visually-hidden" for="symptom">Describe the problem</label>
        <input id="symptom" type="search" placeholder="Describe it: “toilet keeps running”" autocomplete="off">
      </div>
      <ul class="search-results" id="search-results" aria-live="polite"></ul>
      <p class="examples">Try: ${examples.map((e) => `<button type="button" data-example="${esc(e)}">${esc(e)}</button>`).join(" · ")}</p>
    </div>
  </div>
</section>

<section class="section" id="guides">
  <div class="wrap">
    <div class="section-head"><h2>Repair guides</h2><p>Sorted easiest first. Each one shows what a pro charges, so you can decide with numbers.</p></div>
    ${chips(guides)}
    <ul class="cards" id="cards">
      ${guides.map(card).join("\n")}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>How it works</h2></div>
    <div class="how">
      <div><span class="n">1</span><h3>Diagnose</h3><p>Type the symptom above. Each guide starts with a two-minute check so you fix the actual cause, not the first guess.</p></div>
      <div><span class="n">2</span><h3>Gather</h3><p>Every guide has a copyable shopping list with prices. Most repairs need $5–40 in parts and tools you probably own.</p></div>
      <div><span class="n">3</span><h3>Fix, then check it off</h3><p>Follow numbered steps with photos-in-words, tick them off as you go, and watch your running “saved vs. pro” total grow.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="panel">
      <h2>Should you even DIY this?</h2>
      <p>Sometimes the pro is the right call. The calculator compares parts, your time, and the typical pro price for each job and tells you straight.</p>
      <a class="btn btn-ghost" href="${u("diy-or-pro/")}">Run the numbers</a>
    </div>
    <div class="panel">
      <h2>The $150 starter toolkit</h2>
      <p>Thirteen tools cover 80% of home repairs. No 200-piece sets, no gadgets. Plus a free stud finder simulator and level on this site.</p>
      <a class="btn btn-ghost" href="${u("tools/")}">See the list</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="panel accent">
      <h2>Free seasonal maintenance checklist</h2>
      <p>Ten minutes a month catches the leaks, clogs, and lint fires before they become four-figure repairs. Print it and stick it in a cabinet.</p>
      <a class="btn btn-primary" href="${u("checklist/")}">Open the checklist</a>
    </div>
    ${newsletterBlock() || productBlock() || `<div class="panel"><h2>Not sure where to start?</h2><p>Start with the running toilet or the slow drain. Both take under an hour, need almost no tools, and teach you the most useful skill in home repair: shutting off the water and looking.</p><a class="btn btn-ghost" href="${u("guides/running-toilet/")}">Fix a running toilet</a></div>`}
  </div>
</section>
${newsletterBlock() && productBlock() ? `<section class="section"><div class="wrap">${productBlock()}</div></section>` : ""}
<script type="application/json" id="guide-index">${JSON.stringify(guideIndex(guides)).replace(/</g, "\\u003c")}</script>`;
  return layout({
    title: config.siteName,
    description: config.description,
    path: "",
    body,
    current: "",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebSite", name: config.siteName, url: abs(""), description: config.description }],
  });
}

function guidesIndexPage(guides) {
  const body = `
<section class="section">
  <div class="wrap">
    <div class="crumbs"><a href="${u("")}">Home</a><span>›</span>Guides</div>
    <h1>All repair guides</h1>
    <p class="lede">${guides.length} guides, sorted easiest first. Difficulty is rated for someone who has never done the job.</p>
    <div class="search" style="max-width:520px;margin:14px 0 6px">
      ${SEARCH_ICON}
      <label class="visually-hidden" for="symptom">Describe the problem</label>
      <input id="symptom" type="search" placeholder="Search symptoms: “no power at outlet”" autocomplete="off">
    </div>
    <ul class="search-results" id="search-results" aria-live="polite"></ul>
    ${chips(guides)}
    <ul class="cards" id="cards">
      ${guides.map(card).join("\n")}
    </ul>
  </div>
</section>
<script type="application/json" id="guide-index">${JSON.stringify(guideIndex(guides)).replace(/</g, "\\u003c")}</script>`;
  return layout({ title: "All repair guides", description: `Step-by-step guides to ${guides.length} common home repairs, with tools, parts, costs, and when to call a pro.`, path: "guides/", body, current: "guides/" });
}

function needsList(items, kind) {
  return `<ul>${items.map((t) => `<li><span class="name">${esc(t.name)}</span>${t.optional ? '<span class="opt">optional</span>' : ""}${t.q ? shopLinks(t.q) : ""}${t.note ? `<span class="note">${t.note}</span>` : ""}</li>`).join("")}</ul>`;
}

function callout(kind, title, html) {
  return `<div class="callout ${kind}"><div class="t">${title}</div>${html}</div>`;
}

function qa(items) {
  return `<div class="qa">${items.map((x) => `<details><summary>${esc(x.q)}</summary><div class="a">${x.a}</div></details>`).join("")}</div>`;
}

function guidePage(g, guides) {
  const pro = proFor(g);
  const save = savings(g);
  const related = (g.related || []).map((s) => guides.find((x) => x.slug === s)).filter(Boolean);
  const diagram = g.diagram && diagrams[g.diagram] ? `<figure class="diagram">${diagrams[g.diagram].svg}<figcaption class="cap">${esc(diagrams[g.diagram].caption)}</figcaption></figure>` : "";
  const cta = config.leadGen.url
    ? `<a class="btn btn-primary" href="${esc(config.leadGen.url)}" rel="sponsored nofollow noopener" target="_blank">${esc(config.leadGen.label)}</a>`
    : `<a class="btn btn-ghost" href="${u(`diy-or-pro/?job=${g.slug}`)}">Compare DIY vs pro</a>`;

  const body = `
<article class="wrap" data-slug="${esc(g.slug)}" data-pro-mid="${proMid(g)}" data-parts-mid="${mid(g.partsCost)}" data-title="${esc(g.short)}">
  <div class="crumbs"><a href="${u("")}">Home</a><span>›</span><a href="${u("guides/")}">Guides</a><span>›</span>${esc(g.short)}</div>
  <header class="guide-head narrow">
    <h1>${esc(g.title)}</h1>
    <p class="lede">${esc(g.summary)}</p>
    <p class="updated">Updated ${esc(g.updated)} · ${esc(catName(g.category))}</p>
  </header>
  <div class="narrow">
    <div class="meta-strip">
      <div><div class="k">Difficulty</div><div class="v">${dots(g.difficulty)} ${DIFF[g.difficulty]}</div></div>
      <div><div class="k">Time</div><div class="v">${esc(g.time)}</div><div class="s">first time, no rush</div></div>
      <div><div class="k">Parts</div><div class="v">${rangeStr(g.partsCost[0], g.partsCost[1])}</div><div class="s">tools not included</div></div>
      <div><div class="k">Pro charges</div><div class="v">${rangeStr(pro.low, pro.high)}</div><div class="s saves">you save ~${money(save)}</div></div>
    </div>

    ${g.intro.join("\n")}

    ${callout("safety", "⚠️ Before you start", `<ul>${g.safety.map((s) => `<li>${s}</li>`).join("")}</ul>`)}

    ${g.diagnose ? `<h2>Two-minute diagnosis</h2><div class="table-wrap"><table class="diag-table"><thead><tr><th>If you see…</th><th>It's probably…</th></tr></thead><tbody>${g.diagnose.map((d) => `<tr><td>${d.if}</td><td>${d.then}</td></tr>`).join("")}</tbody></table></div>` : ""}

    <h2>What you need</h2>
    <div class="needs">
      <div class="panel"><h3>Tools</h3>${needsList(g.tools)}</div>
      <div class="panel"><h3>Parts &amp; supplies</h3>${needsList(g.parts)}</div>
    </div>
    ${DISCLOSURE}
    <div class="list-actions"><button class="btn btn-ghost" type="button" id="copy-list">Copy shopping list</button> <a class="btn btn-ghost" href="${u("tools/")}">Starter toolkit</a></div>

    ${diagram}

    <h2 id="steps">Step by step</h2>
    <div class="progress"><span id="progress-text">0 of ${g.steps.length} steps</span><div class="bar"><span id="progress-bar"></span></div></div>
    <ol class="steps" id="step-list">
      ${g.steps.map((s, i) => `<li><h3><label><input type="checkbox" data-step="${i}" aria-label="Mark step ${i + 1} done"><span>${esc(s.title)}</span></label></h3><div class="body">${s.body}</div>${s.tip ? `<div class="tip"><strong>Tip:</strong> ${s.tip}</div>` : ""}${s.warn ? `<div class="warn"><strong>Careful:</strong> ${s.warn}</div>` : ""}</li>`).join("\n      ")}
    </ol>

    <div class="done-box" id="done-box">
      <p><strong>Did it work?</strong> Mark it done and we'll keep a running tally of what you've saved.</p>
      <button class="btn btn-good" type="button" id="done-btn">Mark this fix done</button>
      <p class="msg" id="done-msg"></p>
    </div>

    ${g.troubleshooting && g.troubleshooting.length ? `<h2>Still not working?</h2>${qa(g.troubleshooting)}` : ""}

    <section class="pro-box" id="call-a-pro">
      <div>
        <h3>Call a pro if…</h3>
        <ul>${g.callPro.map((s) => `<li>${s}</li>`).join("")}</ul>
        <p>${esc(pro.label)}: <strong>${rangeStr(pro.low, pro.high)}</strong>. ${esc(pro.note)}</p>
      </div>
      ${cta}
    </section>

    ${g.faq && g.faq.length ? `<h2>Questions people ask</h2>${qa(g.faq)}` : ""}

    <p class="sources">Pro price source${pro.sources.length > 1 ? "s" : ""}: ${pro.sources.map((s) => `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>`).join(", ")} (retrieved ${costs.retrieved}). Prices vary by region; most trades charge a minimum or trip fee.</p>
  </div>

  ${related.length ? `<section class="related"><h2>Related fixes</h2><ul class="cards">${related.map(card).join("")}</ul></section>` : ""}
</article>`;

  const stepsLd = g.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: strip(s.body) }));
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          headline: g.title,
          description: g.summary,
          datePublished: g.published || g.updated,
          dateModified: g.updated,
          author: { "@type": "Organization", name: config.siteName, url: abs("") },
          publisher: { "@type": "Organization", name: config.siteName },
          mainEntityOfPage: abs(`guides/${g.slug}/`),
        },
        {
          "@type": "HowTo",
          name: g.title,
          description: g.summary,
          totalTime: `PT${Math.round(g.timeHours[1] * 60)}M`,
          estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: String(Math.round(mid(g.partsCost))) },
          tool: g.tools.map((t) => ({ "@type": "HowToTool", name: t.name })),
          supply: g.parts.map((t) => ({ "@type": "HowToSupply", name: t.name })),
          step: stepsLd,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs("") },
            { "@type": "ListItem", position: 2, name: "Guides", item: abs("guides/") },
            { "@type": "ListItem", position: 3, name: g.short, item: abs(`guides/${g.slug}/`) },
          ],
        },
      ],
    },
  ];
  return layout({ title: g.title, description: g.summary, path: `guides/${g.slug}/`, body, jsonLd, current: "guides/", type: "article" });
}

function toolsPage() {
  const body = `
<section class="section">
  <div class="wrap narrow">
    <div class="crumbs"><a href="${u("")}">Home</a><span>›</span>Toolkit</div>
    <h1>The starter toolkit</h1>
    <p class="lede">${esc(tools.intro)}</p>
    ${DISCLOSURE}
    ${callout("tip", "Free tools already on this site", `<p>Before buying a stud finder, try the <a href="${config.siblingApps.studFinder}">stud finder simulator</a> to learn how one behaves on a real wall. Your phone can also stand in for a <a href="${config.siblingApps.level}">bubble level</a> and a <a href="${config.siblingApps.paintCalc}">paint calculator</a>.</p>`)}
    ${tools.tiers.map((t) => `
    <section class="tier" id="${t.id}">
      <div class="tier-head"><h2>${esc(t.name)}</h2><span class="price">${esc(t.price)}</span></div>
      <p>${esc(t.blurb)}</p>
      <ul class="tool-list">
        ${t.items.map((i) => `<li><div class="row"><span class="name">${esc(i.name)}</span><span class="price">${esc(i.price)}</span></div><p class="why">${esc(i.why)}${i.note ? ` <em>${esc(i.note)}</em>` : ""}</p>${shopLinks(i.q)}</li>`).join("\n        ")}
      </ul>
    </section>`).join("\n")}
    <h2>Buying advice in four lines</h2>
    <ul>
      <li>Buy mid-range hand tools once. A $20 wrench outlives a $6 one by decades.</li>
      <li>Pick one cordless battery platform and stay on it. The drill is the first tool; every other tool on that platform gets cheaper.</li>
      <li>Skip multi-hundred-piece “mechanic's sets.” You will use nine pieces.</li>
      <li>Store tools in one bag or box you can carry to the job. The tool you cannot find is the tool you do not own.</li>
    </ul>
  </div>
</section>`;
  return layout({ title: "The $150 starter toolkit for home repairs", description: "The thirteen tools that cover 80% of home repairs, what each costs, and what to add later. No 200-piece sets.", path: "tools/", body, current: "tools/" });
}

function checklistPage(guides) {
  const gLink = (slug) => {
    const g = guides.find((x) => x.slug === slug);
    return g ? `<a href="${u(`guides/${slug}/`)}">guide →</a>` : "";
  };
  const list = (items, prefix) => `<ul>${items.map((it, i) => `<li><input type="checkbox" id="${prefix}${i}" data-key="${prefix}${i}"><label for="${prefix}${i}">${esc(it.text)}</label>${it.guide ? gLink(it.guide) : ""}</li>`).join("")}</ul>`;
  const body = `
<section class="section checklist">
  <div class="wrap narrow">
    <div class="crumbs"><a href="${u("")}">Home</a><span>›</span>Checklist</div>
    <h1>Seasonal home maintenance checklist</h1>
    <p class="lede">${esc(checklist.intro)}</p>
    <div class="print-actions no-print">
      <button class="btn btn-primary" type="button" id="print-btn">Print or save as PDF</button>
      <button class="btn btn-ghost" type="button" id="reset-checklist">Clear checkmarks</button>
      ${config.products.printablePackUrl ? `<a class="btn btn-ghost" href="${esc(config.products.printablePackUrl)}" rel="noopener" target="_blank">Get the full printable pack · ${esc(config.products.printablePackPrice)}</a>` : ""}
    </div>
    <p class="small muted no-print">Checkmarks are saved in this browser only.</p>

    <h2>Every month</h2>
    ${list(checklist.monthly, "m")}

    <div class="seasons">
      ${checklist.seasons.map((s, si) => `<div><h2>${esc(s.name)}</h2>${list(s.items, `s${si}-`)}</div>`).join("\n")}
    </div>

    <h2>Once a year</h2>
    ${list(checklist.yearly, "y")}
  </div>
</section>`;
  return layout({ title: "Seasonal home maintenance checklist (printable)", description: "A free printable checklist of monthly, seasonal, and yearly home maintenance tasks that prevent the expensive repairs.", path: "checklist/", body, current: "checklist/" });
}

function calcPage(guides) {
  const jobs = guides.map((g) => {
    const p = proFor(g);
    return {
      slug: g.slug, label: g.short, proLow: p.low, proHigh: p.high, proLabel: p.label,
      partsLow: g.partsCost[0], partsHigh: g.partsCost[1], hoursLow: g.timeHours[0], hoursHigh: g.timeHours[1],
      difficulty: g.difficulty, risk: g.risk || "", toolCost: g.toolCost || 0,
      url: u(`guides/${g.slug}/`), source: p.sources[0],
    };
  });
  const body = `
<section class="section">
  <div class="wrap">
    <div class="crumbs"><a href="${u("")}">Home</a><span>›</span>DIY or pro?</div>
    <h1>DIY or hire a pro?</h1>
    <p class="lede narrow" style="margin-left:0">Pick the job, tell us what your time is worth, and get an honest answer. The pro prices are typical U.S. ranges from published cost guides; parts and time come from the guides on this site.</p>
    <div class="calc">
      <form class="panel" id="calc-form">
        <div class="field">
          <label for="job">The job</label>
          <select id="job">${jobs.map((j) => `<option value="${j.slug}">${esc(j.label)}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label for="hourly">What an hour of your weekend is worth</label>
          <input id="hourly" type="number" min="0" max="500" step="5" value="30">
          <span class="hint">Be honest. If you would otherwise be on the couch, it is low. If you are skipping paid work, use that rate.</span>
        </div>
        <div class="field">
          <label for="skill">Experience</label>
          <select id="skill">
            <option value="1.6">First time doing anything like this</option>
            <option value="1" selected>Done a couple of small repairs</option>
            <option value="0.7">Comfortable with tools</option>
          </select>
        </div>
        <div class="field">
          <label class="check"><input type="checkbox" id="tools"> I don't own basic hand tools yet</label>
          <span class="hint">Adds a one-time tool cost to this job. The tools then cost nothing on the next one.</span>
        </div>
      </form>
      <div class="panel result" id="result" aria-live="polite">
        <div class="verdict" id="verdict">—</div>
        <p id="verdict-note"></p>
        <div class="bars">
          <div class="bar-row"><span>Pro (typical)</span><div class="track"><div class="fill pro" id="bar-pro"></div></div><span class="amt" id="amt-pro"></span></div>
          <div class="bar-row"><span>DIY cash</span><div class="track"><div class="fill diy" id="bar-diy"></div></div><span class="amt" id="amt-diy"></span></div>
          <div class="bar-row"><span>DIY + your time</span><div class="track"><div class="fill time" id="bar-time"></div></div><span class="amt" id="amt-time"></span></div>
        </div>
        <dl>
          <dt>Pro price range</dt><dd id="d-pro"></dd>
          <dt>Parts</dt><dd id="d-parts"></dd>
          <dt>Tools you'd buy</dt><dd id="d-tools"></dd>
          <dt>Your time</dt><dd id="d-hours"></dd>
          <dt>Cash you keep</dt><dd id="d-cash"></dd>
          <dt>Net after valuing your time</dt><dd id="d-net"></dd>
        </dl>
        <p class="note" id="source"></p>
        <p><a class="btn btn-primary" id="go-guide" href="#">Open the guide</a></p>
      </div>
    </div>
    <h2 style="margin-top:36px">How the math works</h2>
    <ul>
      <li><strong>Pro (typical)</strong> is the midpoint of the published range. Real quotes depend on your city and whether the trade has a trip fee.</li>
      <li><strong>DIY cash</strong> is the midpoint of the parts range in the guide, plus tools if you ticked the box.</li>
      <li><strong>Your time</strong> is the guide's first-timer estimate, scaled by experience, multiplied by your hourly figure.</li>
      <li>Jobs with an electrical or water-damage risk get a caution for first-timers. That is not a “don't”; it is a “read the safety box twice.”</li>
    </ul>
    <p class="sources">Pro price sources: ${Object.values(costs.jobs).flatMap((j) => j.sources).filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i).map((s) => `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>`).join(", ")}. Retrieved ${costs.retrieved}.</p>
  </div>
</section>
<script type="application/json" id="calc-data">${JSON.stringify({ jobs, starterKit: 150 }).replace(/</g, "\\u003c")}</script>`;
  return layout({ title: "DIY or hire a pro? Cost calculator", description: "Compare the typical pro price with your parts, tools, and time for common home repairs, and get a straight answer on whether to DIY.", path: "diy-or-pro/", body, current: "diy-or-pro/" });
}

function aboutPage() {
  const contact = config.contactEmail
    ? `<p>Email <a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a>. Corrections to a guide get priority.</p>`
    : `<p>Corrections and questions are welcome. A contact address will be published here shortly; until then, use the repository issue tracker linked from the site's GitHub page.</p>`;
  const body = `
<section class="section legal">
  <div class="wrap narrow">
    <div class="crumbs"><a href="${u("")}">Home</a><span>›</span>About</div>
    <h1>About ${esc(config.siteName)}</h1>
    <p class="lede">A repair manual for people who have never done this before. Written by a homeowner who learned each of these fixes the slow way, then wrote down the fast way.</p>
    <p>Most home-repair content is either a 20-minute video that hides the one step you needed at minute 14, or a page that assumes you already know what a fill valve is. Every guide here is written for the person standing in the bathroom with the water still running: what to check first, what to buy, exactly what to do, and when to stop and call someone.</p>

    <h2 id="standards">How guides are written</h2>
    <ul>
      <li>Each guide covers one common, low-risk repair that a careful first-timer can do with hand tools.</li>
      <li>Difficulty and time are rated for someone doing the job for the first time, with no rush.</li>
      <li>Pro prices are typical U.S. ranges from published cost guides, linked on every page with the date we checked them.</li>
      <li>Safety boxes are not boilerplate. If a step can hurt you or your house, it says so, and the guide tells you when to stop.</li>
    </ul>
    <p><strong>This site is general information, not professional advice.</strong> Building codes, permit rules, and what you are allowed to do yourself vary by state and city. Gas lines, the main electrical panel, roofing, and anything structural belong to a licensed professional. If you are not sure, hire one. You are responsible for your own safety and your own home.</p>

    <h2 id="disclosure">Affiliate disclosure</h2>
    <p>${esc(config.siteName)} is reader-supported. Some links to tools and parts are affiliate links: if you click one and buy something, we may earn a small commission at no extra cost to you. This is disclosed next to every list that contains such links, as the U.S. Federal Trade Commission requires.${config.affiliate.amazonTag ? " As an Amazon Associate we earn from qualifying purchases." : ""}</p>
    <p>Commissions never decide what we recommend. Where a cheaper option works, the guide says so, and several guides recommend buying nothing at all.</p>

    <h2 id="privacy">Privacy policy</h2>
    <p>Last updated ${BUILD_DATE}.</p>
    <h3>What this site stores</h3>
    <p>There are no accounts. Your step checkmarks, completed fixes, checklist ticks, and theme choice are stored in your own browser (localStorage) and never leave it. Clearing site data erases them.</p>
    <h3>Third parties</h3>
    <ul>
      <li><strong>Fonts</strong> load from Google Fonts, which receives your IP address when the page loads.</li>
      <li><strong>Affiliate links</strong> to retailers include a referral tag so the retailer knows you came from here. The retailer's own privacy policy applies once you are on their site.</li>
      ${config.analytics.plausibleDomain ? "<li><strong>Analytics</strong> use Plausible, which is cookie-less and does not track you across sites.</li>" : ""}
      ${config.analytics.gaMeasurementId ? '<li><strong>Analytics</strong> use Google Analytics, which sets cookies. See <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">how Google uses data from sites that use its services</a>.</li>' : ""}
      ${config.ads.adsenseClient ? '<li><strong>Advertising</strong> is served by Google AdSense. Google and its partners use cookies to show ads based on your visits to this and other sites. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads" rel="noopener" target="_blank">Google Ads Settings</a>; see also <a href="https://policies.google.com/technologies/ads" rel="noopener" target="_blank">Google\'s advertising policies</a>.</li>' : "<li>This site currently serves no advertising and runs no analytics.</li>"}
    </ul>
    <h3>Children</h3>
    <p>This site is not directed at children under 13 and does not knowingly collect information from them.</p>
    <h3>Changes</h3>
    <p>If this policy changes, the date above changes with it.</p>

    <h2 id="contact">Contact</h2>
    ${contact}
  </div>
</section>`;
  return layout({ title: "About, disclosures, and privacy", description: `Who writes ${config.siteName}, how guides are checked, the affiliate disclosure, and the privacy policy.`, path: "about/", body, current: "about/" });
}

function sitemap(guides) {
  const pages = [
    { p: "", d: BUILD_DATE }, { p: "guides/", d: BUILD_DATE }, { p: "tools/", d: BUILD_DATE },
    { p: "diy-or-pro/", d: BUILD_DATE }, { p: "checklist/", d: BUILD_DATE }, { p: "about/", d: BUILD_DATE },
    ...guides.map((g) => ({ p: `guides/${g.slug}/`, d: g.updated })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((x) => `  <url><loc>${esc(abs(x.p))}</loc><lastmod>${x.d}</lastmod></url>`).join("\n")}
</urlset>
`;
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="7" fill="#d1521a"/><path d="M22.8 8.2a5 5 0 0 0-6.3 6.4L8 23.1 10.9 26l8.5-8.5a5 5 0 0 0 6.4-6.3l-3 3-2.4-.6-.6-2.4z" fill="#fff"/></svg>`;

module.exports = { home, guidesIndexPage, guidePage, toolsPage, checklistPage, calcPage, aboutPage, sitemap, FAVICON, esc, strip };
