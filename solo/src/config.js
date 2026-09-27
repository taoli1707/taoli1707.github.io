/*
 * Solo Ledger site configuration. Re-run `node solo/src/build.js` after any change.
 */
"use strict";

module.exports = {
  siteName: "Solo Ledger",
  tagline: "Real one-person businesses, taken apart.",
  description:
    "Case studies of one-person businesses with sourced revenue, how they grew, what protects them, and an adjacent idea you could build next.",

  // Change these two when you move to a custom domain (e.g. https://soloLedger.com/ and "/").
  siteUrl: "https://taoli1707.github.io/solo/",
  basePath: "/solo/",

  contactEmail: "", // shown on the About page when set

  analytics: {
    plausibleDomain: "", // e.g. "taoli1707.github.io"
    gaMeasurementId: "", // e.g. "G-XXXXXXX"
  },

  newsletter: {
    // Form action URL from Kit/Beehiiv/Buttondown. Empty = the signup block is hidden.
    action: "",
    headline: "One new solo business teardown every week",
    blurb: "Sourced numbers, the growth channel that worked, and an idea to build next. No hype.",
  },

  categories: [
    { id: "ai-app", name: "AI apps" },
    { id: "saas", name: "SaaS" },
    { id: "dev-tools", name: "Dev tools" },
    { id: "data-api", name: "Data & APIs" },
    { id: "content-media", name: "Content & media" },
    { id: "info-products", name: "Courses & info" },
    { id: "templates-digital", name: "Templates" },
    { id: "marketplace-directory", name: "Directories & job boards" },
    { id: "ecommerce", name: "E-commerce" },
  ],

  models: {
    subscription: "Subscription",
    "one-time": "One-time sale",
    "usage-based": "Usage-based",
    ads: "Ads",
    sponsorship: "Sponsorship",
    mixed: "Mixed",
  },

  channels: {
    "build-in-public": "Build in public",
    seo: "SEO",
    "twitter-x": "X / Twitter",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    newsletter: "Newsletter",
    "product-hunt": "Product Hunt",
    "word-of-mouth": "Word of mouth",
    marketplace: "Marketplace",
    "paid-ads": "Paid ads",
  },

  // Annualized revenue bands for the filter.
  bands: [
    { id: "lt100k", name: "Under $100k/yr", min: 0, max: 100000 },
    { id: "100k-1m", name: "$100k–$1M/yr", min: 100000, max: 1000000 },
    { id: "gt1m", name: "$1M+/yr", min: 1000000, max: Infinity },
  ],
};
