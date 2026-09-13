/*
 * Site configuration. Every monetization hook is off until you fill it in,
 * so the site never renders broken ad slots, dead affiliate tags, or forms
 * that go nowhere. Re-run `node fixit/src/build.js` after any change.
 */
"use strict";

module.exports = {
  siteName: "Weekend Fixer",
  tagline: "Fix it yourself this weekend. Save the pro for the big stuff.",
  description:
    "Step-by-step home repair guides for first-timers: what to buy, what it costs, exactly what to do, and when to call a pro instead.",

  // Change these two when you move to a custom domain (e.g. https://weekendfixer.com/ and "/").
  siteUrl: "https://taoli1707.github.io/fixit/",
  basePath: "/fixit/",

  // Sibling apps that already live on this GitHub Pages site (absolute paths).
  siblingApps: {
    toolkit: "/toolkit/",
    studFinder: "/studfinder/",
    level: "/toolkit/#level",
    paintCalc: "/toolkit/#paint",
  },

  contactEmail: "", // shown on the About page when set

  affiliate: {
    // Amazon Associates tracking ID, e.g. "weekendfixer-20". Empty = plain (untagged) links.
    amazonTag: "",
    // Home Depot links go through Impact once you are approved. Until then this is a plain search URL.
    homeDepotUrl: (query) => `https://www.homedepot.com/s/${encodeURIComponent(query)}`,
  },

  ads: {
    // Google AdSense publisher ID, e.g. "ca-pub-1234567890123456". Enables Auto ads on every page.
    adsenseClient: "",
  },

  newsletter: {
    // Kit (ConvertKit) form action URL, e.g. "https://app.kit.com/forms/1234567/subscriptions".
    action: "",
    headline: "One fix a week, in your inbox",
    blurb: "A short, seasonal reminder of what to check around the house, plus the newest guide. No spam, unsubscribe any time.",
  },

  products: {
    // Gumroad / Payhip / Lemon Squeezy checkout URL for the printable pack. Empty hides the paid CTA.
    printablePackUrl: "",
    printablePackName: "The Weekend Fixer Printable Pack",
    printablePackPrice: "$9",
  },

  leadGen: {
    // Affiliate URL for a pro-matching service (Networx, Angi, etc.). Empty renders a neutral "call a pro" box.
    url: "",
    label: "Get free quotes from local pros",
  },

  analytics: {
    plausibleDomain: "", // e.g. "weekendfixer.com"
    gaMeasurementId: "", // e.g. "G-XXXXXXXXXX"
  },

  categories: [
    { id: "plumbing", name: "Plumbing", blurb: "Toilets, drains, faucets, showers." },
    { id: "electrical", name: "Electrical", blurb: "Switches and outlets, done safely." },
    { id: "walls-doors", name: "Walls & doors", blurb: "Patches, sticky doors, hanging heavy things." },
    { id: "kitchen-bath-laundry", name: "Kitchen, bath & laundry", blurb: "Caulk, disposals, dryer vents." },
  ],
};
