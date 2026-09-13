/*
 * Typical U.S. professional prices used for "what a pro charges" and the
 * DIY-or-pro calculator. These are national ranges from published cost guides,
 * captured 2026-09-13 from search summaries of the linked pages. Regional
 * prices vary a lot (big metros run higher) and most trades have a minimum
 * charge or trip fee, so ranges are shown, never a single number.
 * Re-verify roughly yearly; the source URLs are kept so you can.
 */
"use strict";

module.exports = {
  retrieved: "2026-09-13",
  handyman: {
    label: "Handyman hourly rate",
    low: 60,
    high: 125,
    note: "Self-employed handymen commonly charge $50–80/hr, franchises $75–125/hr; most have a $60–100+ minimum per visit.",
    sources: [
      { title: "HomeGuide: Handyman prices 2026", url: "https://homeguide.com/costs/handyman-prices" },
      { title: "Angi: Common handyman prices 2026", url: "https://www.angi.com/articles/what-are-common-handyman-prices.htm" },
    ],
  },
  jobs: {
    "running-toilet": {
      label: "Plumber fixes a running toilet",
      low: 145,
      high: 270,
      note: "Parts and labor to adjust or replace tank parts such as the flapper or fill valve.",
      sources: [{ title: "Angi: Toilet repair cost 2026", url: "https://www.angi.com/articles/how-much-should-toilet-repairs-cost.htm" }],
    },
    "slow-drain": {
      label: "Plumber clears a simple sink or tub clog",
      low: 100,
      high: 275,
      note: "Simple sink, tub, or toilet clog. Main-line clogs and camera inspections cost far more.",
      sources: [{ title: "HomeGuide: Cost to unclog or snake a drain 2026", url: "https://homeguide.com/costs/cost-to-unclog-snake-a-drain" }],
    },
    "leaky-faucet": {
      label: "Plumber fixes a dripping faucet",
      low: 100,
      high: 400,
      note: "Most homeowners pay around $270; the cartridge itself is usually $15–60.",
      sources: [{ title: "Angi: Cost to fix a leaky faucet 2026", url: "https://www.angi.com/articles/plumber-cost-to-fix-leaky-faucet.htm" }],
    },
    showerhead: {
      label: "Plumber replaces a showerhead",
      low: 150,
      high: 220,
      note: "Labor and a basic fixture. Corroded shower arms or specialty heads add more.",
      sources: [{ title: "Angi: Cost to replace a shower head 2026", url: "https://www.angi.com/articles/cost-replace-shower-head.htm" }],
    },
    "drywall-hole": {
      label: "Handyman patches a doorknob-sized hole",
      low: 150,
      high: 350,
      note: "Medium holes (5–12 in). Tiny nail holes are cheap but still cost a service-call minimum.",
      sources: [
        { title: "Angi: Drywall repair cost 2026", url: "https://www.angi.com/articles/how-much-does-drywall-repair-cost-small-holes.htm" },
        { title: "HomeGuide: Drywall repair cost 2026", url: "https://homeguide.com/costs/drywall-repair-cost" },
      ],
    },
    "sticking-door": {
      label: "Handyman fixes a sticking door",
      low: 95,
      high: 150,
      note: "Simple adjustments. Planing or re-hanging a door runs $130–375.",
      sources: [{ title: "Angi: Door repair cost 2026", url: "https://www.angi.com/articles/cost-fix-door.htm" }],
    },
    "hang-heavy": {
      label: "Handyman mounts a TV on drywall",
      low: 158,
      high: 360,
      note: "National average about $259 for a standard drywall install; brick, fireplaces, and cable concealment add $50–200.",
      sources: [
        { title: "Angi: Cost to mount a TV 2026", url: "https://www.angi.com/articles/how-much-does-buying-and-repairing-tv-cost.htm" },
        { title: "HomeGuide: TV mount installation cost 2026", url: "https://homeguide.com/costs/tv-mount-installation-cost" },
      ],
    },
    "light-switch": {
      label: "Electrician replaces a light switch",
      low: 100,
      high: 203,
      note: "Average about $152. The switch itself is $2–15; you are paying for the trip and the hour minimum.",
      sources: [{ title: "Angi: Cost to replace a light switch 2026", url: "https://www.angi.com/articles/how-much-does-it-cost-replace-light-switch.htm" }],
    },
    "gfci-outlet": {
      label: "Electrician replaces a GFCI outlet",
      low: 90,
      high: 200,
      note: "Labor is 70–80% of the bill; the outlet is $15–25. Many electricians charge a one-hour minimum plus a trip fee.",
      sources: [{ title: "HomeGuide: GFCI outlet cost 2026", url: "https://homeguide.com/costs/gfci-outlet-cost" }],
    },
    "recaulk-tub": {
      label: "Handyman re-caulks a tub or shower",
      low: 105,
      high: 290,
      note: "Depends on tub size and how much old caulk has to come out.",
      sources: [{ title: "Angi: Cost of caulking 2026", url: "https://www.angi.com/articles/cost-to-caulk.htm" }],
    },
    "garbage-disposal": {
      label: "Plumber repairs a garbage disposal",
      low: 140,
      high: 310,
      note: "Average about $230. A jammed disposal often needs no parts at all.",
      sources: [{ title: "Angi: Garbage disposal repair cost 2026", url: "https://www.angi.com/articles/garbage-disposal-repair-cost.htm" }],
    },
    "dryer-vent": {
      label: "Pro cleans a dryer vent",
      low: 104,
      high: 188,
      note: "Average about $145; roof vents run $150–250.",
      sources: [{ title: "Angi: Dryer vent cleaning cost 2026", url: "https://www.angi.com/articles/how-much-does-dryer-vent-cleaning-cost.htm" }],
    },
  },
};
