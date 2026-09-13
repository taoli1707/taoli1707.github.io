#!/usr/bin/env node
/*
 * Weekend Fixer static site generator. Zero dependencies.
 *   node fixit/src/build.js
 * Reads config.js and content/, writes HTML into fixit/ (the folder GitHub Pages serves).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const config = require("./config");
const costs = require("./content/costs");
const T = require("./templates");

const ROOT = path.resolve(__dirname, "..");
const GUIDES_DIR = path.join(__dirname, "content", "guides");

function loadGuides() {
  const files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".js")).sort();
  const guides = files.map((f) => require(path.join(GUIDES_DIR, f)));
  const slugs = new Set(guides.map((g) => g.slug));
  const required = ["slug", "title", "short", "blurb", "category", "summary", "symptoms", "difficulty", "time", "timeHours", "partsCost", "proCostKey", "updated", "safety", "callPro", "tools", "parts", "intro", "steps"];
  for (const g of guides) {
    for (const k of required) if (g[k] === undefined) throw new Error(`Guide ${g.slug || "?"} is missing "${k}"`);
    if (!config.categories.some((c) => c.id === g.category)) throw new Error(`Guide ${g.slug}: unknown category ${g.category}`);
    if (!costs.jobs[g.proCostKey]) throw new Error(`Guide ${g.slug}: no pro cost entry for ${g.proCostKey}`);
    for (const r of g.related || []) if (!slugs.has(r)) throw new Error(`Guide ${g.slug}: related slug ${r} does not exist`);
    if (g.summary.length > 170) console.warn(`  warn: ${g.slug} summary is ${g.summary.length} chars (meta description should be under ~160)`);
    if (!g.steps.length) throw new Error(`Guide ${g.slug} has no steps`);
  }
  // Easiest first, then shortest.
  guides.sort((a, b) => a.difficulty - b.difficulty || a.timeHours[1] - b.timeHours[1] || a.short.localeCompare(b.short));
  return guides;
}

function write(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`  ${rel} (${(content.length / 1024).toFixed(1)} KB)`);
}

function main() {
  const guides = loadGuides();
  console.log(`Building ${config.siteName} → ${ROOT}`);
  write("index.html", T.home(guides));
  write("guides/index.html", T.guidesIndexPage(guides));
  for (const g of guides) write(`guides/${g.slug}/index.html`, T.guidePage(g, guides));
  write("tools/index.html", T.toolsPage());
  write("checklist/index.html", T.checklistPage(guides));
  write("diy-or-pro/index.html", T.calcPage(guides));
  write("about/index.html", T.aboutPage());
  write("sitemap.xml", T.sitemap(guides));
  write("assets/favicon.svg", T.FAVICON);
  console.log(`Done: ${guides.length} guides, ${guides.length + 6} pages.`);
}

main();
