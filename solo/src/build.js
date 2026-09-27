#!/usr/bin/env node
/*
 * Solo Ledger static site generator. Zero dependencies.
 *   node solo/src/build.js
 * Reads config.js and content/cases/*.json, writes HTML into solo/ (the folder GitHub Pages serves).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const config = require("./config");
const T = require("./templates");

const ROOT = path.resolve(__dirname, "..");
const CASES_DIR = path.join(__dirname, "content", "cases");

const REQUIRED = ["slug", "name", "founder", "url", "tagline", "category", "model", "channel", "started", "revenue", "team", "summary", "origin", "howItMakesMoney", "growth", "moat", "risks", "timeline", "lessons", "rebuild", "sources"];

// "total" is a one-off sum (a launch week, a sale); it sorts as if it were a year.
function annualized(r) {
  return r.period === "month" ? r.amount * 12 : r.amount;
}

function loadCases() {
  const files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".json")).sort();
  const cases = files.map((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(CASES_DIR, f), "utf8"));
    for (const k of REQUIRED) if (c[k] === undefined || c[k] === null) throw new Error(`${f}: missing "${k}"`);
    if (c.slug + ".json" !== f) throw new Error(`${f}: slug "${c.slug}" does not match file name`);
    if (!config.categories.some((x) => x.id === c.category)) throw new Error(`${f}: unknown category ${c.category}`);
    if (!config.models[c.model]) throw new Error(`${f}: unknown model ${c.model}`);
    if (!config.channels[c.channel]) throw new Error(`${f}: unknown channel ${c.channel}`);
    const r = c.revenue;
    if (typeof r.amount !== "number" || !["month", "year", "total"].includes(r.period) || !r.label || !r.asOf || !r.source) throw new Error(`${f}: revenue needs amount, period, label, asOf, source`);
    if (!["self-reported", "estimate", "disclosed-sale"].includes(r.kind)) throw new Error(`${f}: unknown revenue kind ${r.kind}`);
    const d = c.rebuild.difficulty;
    if (!(d >= 1 && d <= 5)) throw new Error(`${f}: rebuild.difficulty must be 1-5`);
    if (!c.sources.length) throw new Error(`${f}: needs at least one source`);
    c.annual = annualized(r);
    c.band = config.bands.find((b) => c.annual >= b.min && c.annual < b.max).id;
    c.stack = c.stack || [];
    return c;
  });
  // Biggest first; the home page re-sorts client-side.
  cases.sort((a, b) => b.annual - a.annual || a.name.localeCompare(b.name));
  return cases;
}

function write(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`  ${rel} (${(content.length / 1024).toFixed(1)} KB)`);
}

function main() {
  const cases = loadCases();
  console.log(`Building ${config.siteName} → ${ROOT}`);
  write("index.html", T.home(cases));
  for (const c of cases) write(`cases/${c.slug}/index.html`, T.casePage(c, cases));
  write("ideas/index.html", T.ideasPage(cases));
  write("patterns/index.html", T.patternsPage(cases));
  write("about/index.html", T.aboutPage(cases));
  write("cases.json", JSON.stringify(cases.map(T.publicRecord), null, 1));
  write("sitemap.xml", T.sitemap(cases));
  write("assets/favicon.svg", T.FAVICON);
  console.log(`Done: ${cases.length} cases, ${cases.length + 4} pages.`);
}

main();
