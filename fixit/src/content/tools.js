/*
 * The toolkit page. `q` is the retailer search query used to build affiliate
 * links, so keep it generic and specific enough to land on the right product
 * type. Prices are typical street prices in 2026 and are shown as ranges.
 */
"use strict";

module.exports = {
  intro:
    "You do not need a garage full of tools. Every guide on this site can be done with the starter kit below plus one or two job-specific items. Buy the starter kit once, then add tools only when a job calls for them.",
  tiers: [
    {
      id: "starter",
      name: "The starter kit",
      price: "about $150",
      blurb: "Covers roughly 80% of the small repairs in a typical home. Mid-range brands are fine; skip the bargain-bin sets with 200 pieces you will never use.",
      items: [
        { name: "16 oz claw hammer", price: "$15–25", why: "Nail holes, tapping anchors, persuading stuck things.", q: "16 oz claw hammer" },
        { name: "Multi-bit screwdriver (6-in-1 or 11-in-1)", price: "$10–20", why: "Phillips, flat, and square bits in one handle. Lives in the kitchen drawer.", q: "11-in-1 multi-bit screwdriver" },
        { name: "10 in adjustable wrench", price: "$12–20", why: "Supply lines, shower arms, nuts of every size.", q: "10 inch adjustable wrench" },
        { name: "10 in tongue-and-groove pliers", price: "$12–20", why: "The plumber's pliers. Grips P-trap nuts and anything round.", q: "10 inch tongue and groove pliers" },
        { name: "Needle-nose pliers", price: "$10–15", why: "Pulling clips, fishing hair out of drains, bending wire.", q: "needle nose pliers" },
        { name: "25 ft tape measure", price: "$12–25", why: "Measure twice. Get one with a wide blade that stands out on its own.", q: "25 ft tape measure" },
        { name: "Utility knife with spare blades", price: "$8–15", why: "Caulk removal, drywall, packaging, everything.", q: "retractable utility knife" },
        { name: "Non-contact voltage tester", price: "$15–25", why: "The one tool that keeps you alive on electrical jobs. Non-negotiable.", q: "non-contact voltage tester" },
        { name: "Putty knife set (1.5, 3, and 6 in)", price: "$10–15", why: "Spackle, joint compound, scraping old caulk.", q: "putty knife set" },
        { name: "Torpedo level", price: "$8–15", why: "Shelves, mounts, and checking your toilet is not rocking. Your phone can substitute in a pinch.", q: "9 inch torpedo level" },
        { name: "Headlamp", price: "$10–20", why: "Under-sink and attic work needs both hands.", q: "LED headlamp" },
        { name: "Safety glasses and nitrile gloves", price: "$10–15", why: "Drywall dust, drain gunk, and caulk solvent all want to be on your skin and in your eyes.", q: "safety glasses nitrile gloves" },
        { name: "Painter's tape, rags, a 2-gallon bucket", price: "$10–15", why: "Catches drips, keeps lines clean, holds parts so they do not roll away.", q: "painters tape" },
      ],
    },
    {
      id: "level-up",
      name: "Level up",
      price: "$150–300 more",
      blurb: "Add these once you have done a couple of repairs and know you will do more. The drill alone turns hour-long jobs into ten-minute jobs.",
      items: [
        { name: "Cordless drill/driver kit (12V or 18V)", price: "$70–150", why: "Driving lag screws for a TV mount, drywall anchors, dryer vent brush kits, everything faster.", q: "cordless drill driver kit" },
        { name: "Stud finder", price: "$20–40", why: "Required for hanging anything heavy. Magnetic ones are cheap and never lie.", q: "stud finder", note: "Try the stud finder simulator on this site first to learn how one behaves." },
        { name: "Dripless caulk gun", price: "$10–20", why: "A cheap gun keeps oozing after you release the trigger and ruins the bead.", q: "dripless caulk gun" },
        { name: "Hex (Allen) key set, SAE and metric", price: "$8–15", why: "Faucet handles, disposals, furniture, bikes.", q: "hex key set sae metric" },
        { name: "Plastic drain-cleaning strip and a 25 ft hand auger", price: "$30–50", why: "Solves 90% of sink and tub clogs without chemicals.", q: "drain snake hand auger 25 ft" },
        { name: "Flange plunger", price: "$10–20", why: "The one with the fold-out flap seals a toilet. Cup plungers are for sinks.", q: "flange toilet plunger" },
        { name: "6 in drywall taping knife and sanding sponge", price: "$10–15", why: "The starter putty knives work for small holes; the wide knife feathers bigger patches invisibly.", q: "6 inch drywall taping knife" },
        { name: "Wire stripper/cutter", price: "$15–25", why: "Clean strips for switch and outlet work. Do not use a knife.", q: "wire stripper cutter" },
      ],
    },
    {
      id: "when-needed",
      name: "Buy only when the job needs it",
      price: "$10–40 each",
      blurb: "Job-specific tools. Each guide tells you which of these it needs, so buy them with the parts.",
      items: [
        { name: "Faucet cartridge puller", price: "$15–25", why: "Only for stubborn cartridges (Moen 1225 especially). Try without it first.", q: "faucet cartridge puller" },
        { name: "Basin wrench", price: "$15–25", why: "The only way to reach nuts behind a sink. Needed for faucet replacement, not cartridge repair.", q: "basin wrench" },
        { name: "Dryer vent cleaning brush kit", price: "$15–30", why: "Flexible rods that chuck into a drill. Cleans 12–20 ft of duct.", q: "dryer vent cleaning kit drill" },
        { name: "PTFE (Teflon) thread tape", price: "$2–5", why: "Showerheads, supply lines, any threaded water joint.", q: "ptfe thread seal tape" },
        { name: "Plumber's silicone grease", price: "$5–8", why: "O-rings and cartridges go in smoothly and last longer.", q: "plumbers silicone grease" },
        { name: "Caulk removal tool", price: "$5–10", why: "Faster and safer than a razor for stripping old tub caulk.", q: "caulk removal tool" },
        { name: "Self-adhesive drywall patch (4, 6, or 8 in)", price: "$5–10", why: "The fast fix for doorknob holes.", q: "self adhesive drywall repair patch" },
        { name: "Snap toggle anchors", price: "$10–15", why: "When there is no stud where you need one. Far stronger than plastic anchors.", q: "snap toggle drywall anchors" },
      ],
    },
  ],
};
