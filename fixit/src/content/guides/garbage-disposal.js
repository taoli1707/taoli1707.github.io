"use strict";
module.exports = {
  slug: "garbage-disposal",
  title: "How to Fix a Garbage Disposal That Hums, Jams, or Won't Turn On",
  short: "Fix a humming or jammed disposal",
  blurb: "The reset button and the hex key on the bottom fix most disposals in ten minutes, and cost nothing.",
  category: "kitchen-bath-laundry",
  summary: "Fix a disposal that hums, jams, or is dead: press the reset button, free the flywheel with the hex key, pull the jam out with tongs. 10–30 minutes, usually $0.",
  symptoms: ["garbage disposal humming", "disposal won't turn on", "disposal jammed", "disposal hums but doesn't spin", "disposal leaking", "disposal smells", "disposal makes loud noise", "reset button garbage disposal", "sink won't drain on disposal side", "disposal tripped breaker", "disposal stopped working", "something stuck in disposal"],
  keywords: ["reset button", "hex key", "allen wrench", "flywheel", "impeller", "insinkerator", "tongs", "breaker", "splash guard", "dishwasher hose", "jam"],
  difficulty: 1,
  time: "10–30 min",
  timeHours: [0.2, 0.5],
  partsCost: [0, 10],
  toolCost: 0,
  risk: "",
  proCostKey: "garbage-disposal",
  published: "2026-09-13",
  updated: "2026-09-13",
  safety: [
    "Unplug the disposal under the sink before you put anything into it. If it's hardwired with no plug, switch off its breaker. Then flip the wall switch on: nothing should happen. Flip it back off.",
    "Never put your hand in the disposal, even unplugged. Tongs, pliers, or a bent coat hanger.",
    "Never run it dry. Cold water on, always.",
  ],
  callPro: [
    "It trips the breaker or pops its reset button repeatedly after you've freed the jam. The motor is failing.",
    "Water leaks from the bottom of the unit (the internal seal is gone). That's a replacement, not a repair.",
    "It's over ten years old and jams often. A new unit is $100–200 and swapping it is a 1–2 hour job on its own, or a $150–300 install.",
    "It's hardwired and you're not comfortable finding its breaker.",
  ],
  tools: [
    { name: "1/4 in hex (Allen) key", q: "1/4 inch hex key", note: "One came with the disposal, probably taped to it or in the cabinet. Any 1/4 in hex key works." },
    { name: "Tongs or needle-nose pliers", q: "needle nose pliers" },
    { name: "Flashlight or headlamp", q: "LED headlamp" },
    { name: "Wooden spoon or broom handle", note: "For units with no hex socket underneath." },
    { name: "Cup plunger", q: "sink plunger", optional: true },
    { name: "Bucket", optional: true },
  ],
  parts: [
    { name: "Usually nothing" },
    { name: "Splash guard (rubber baffle)", q: "garbage disposal splash guard", optional: true, note: "If yours is shredded or missing; most pop out from the top." },
    { name: "Ice, coarse salt, and citrus peel", note: "For cleaning and deodorizing, not fixing." },
  ],
  intro: [
    `<p>A garbage disposal is a motor spinning a plate with two loose metal lugs on it. Food gets flung against a grind ring by centrifugal force. When something hard wedges between a lug and the ring (a bottle cap, a fruit pit, a fork), the motor can't turn and hums until its thermal overload trips and pops the red reset button on the bottom. Nothing is broken; it's stuck. Unplug it, turn the plate by hand with the hex key, pull out the object, press reset. That's the repair.</p>`,
  ],
  diagnose: [
    { if: "Hums but doesn't spin", then: "Jam. Steps 1, 3–5." },
    { if: "Completely silent when switched on", then: "Reset button tripped, unplugged, or breaker off. Steps 1–2." },
    { if: "Runs fine but the sink won't drain", then: "Clog in the drain or trap, not the disposal. Step 6, then the slow drain guide." },
    { if: "Leaks from the top ring where it meets the sink", then: "Mounting flange loose or plumber's putty failed. Doable, but a longer job; see FAQ." },
    { if: "Leaks from the side where the dishwasher hose connects", then: "Tighten the hose clamp." },
    { if: "Leaks from the bottom", then: "Internal seal failed. Replace the unit." },
  ],
  steps: [
    {
      title: "Kill the power",
      body: `<p>Unplug the disposal's cord from the outlet under the sink, or turn off its breaker if it's hardwired. Flip the wall switch on and off to confirm it's dead.</p>`,
    },
    {
      title: "Press the reset button",
      body: `<p>Feel around the bottom of the unit for a small red or black button. If it's sticking out, it has tripped; push it in until it clicks and stays. Plug back in, run cold water, and try the switch. If it spins, you're done. If it hums, unplug again and go on.</p>`,
      tip: "A reset that trips again right away means the jam is still there, not that the button is broken.",
    },
    {
      title: "Free the flywheel with the hex key",
      body: `<p>Dead center on the bottom of the disposal is a 1/4 in hex socket. Insert the key and work it back and forth. It will resist at first; keep rocking it with more force until it turns a full circle freely in both directions. That's the grinding plate turning and the jam breaking loose.</p><p>No socket on the bottom? Push the wooden spoon handle down into the disposal from the top, brace it against one of the lugs, and lever the plate around.</p>`,
    },
    {
      title: "Remove whatever jammed it",
      body: `<p>Shine the light down the drain and look for the culprit. Fish it out with tongs. Common finds: bottle caps, twist ties, fruit pits, glass, silverware, a dish scrubber. Spin the plate again with the key to be sure nothing else is wedged.</p>`,
      warn: "Tongs. Not fingers. The lugs are blunt but the grind ring is not, and the motor's overload can reset by itself once it cools.",
    },
    {
      title: "Restore power and run it",
      body: `<p>Plug in, press reset once more if it's out, run cold water at full flow, and flip the switch. It should spin up cleanly. Let it run 30 seconds with water to clear debris.</p>`,
    },
    {
      title: "Clear the drain if water still stands",
      body: `<p>If the disposal spins but water sits in the sink, the clog is past it. Clamp or pinch the dishwasher hose (or it will spray into the dishwasher), fill the sink a couple inches, and plunge the disposal side ten times. No luck: the P-trap under the sink is next, exactly as in the slow drain guide.</p>`,
    },
    {
      title: "Clean and deodorize",
      body: `<p>Grind a tray of ice cubes with a handful of coarse salt to scour the chamber, then a few citrus peels. Pull the rubber splash guard up and scrub its underside, which is where the smell lives. Do this monthly; it's on the checklist.</p>`,
    },
  ],
  troubleshooting: [
    { q: "Still hums after freeing it", a: `<p>Something is still wedged, often under the plate where you can't see it. Unplug, spin with the key both directions several full turns, and look again with the light while turning. If the plate turns freely and it still only hums, the motor bearings are seized: replace the unit.</p>` },
    { q: "The reset keeps tripping", a: `<p>The motor overheated. Let it cool 15 minutes with the power off, then try again. If it trips on every use with nothing jammed, the motor is failing.</p>` },
    { q: "A metallic rattle", a: `<p>A foreign object is loose in the chamber, or a lug is bent. Unplug and look. Bent lugs mean a new unit.</p>` },
    { q: "It leaks where it meets the sink", a: `<p>The mounting ring has loosened or the plumber's putty under the sink flange dried out. Tightening the three mounting screws under the flange sometimes fixes it; otherwise the unit comes off, the flange is re-bedded in fresh putty, and it goes back on. About an hour, with the manual open.</p>` },
  ],
  faq: [
    { q: "What shouldn't go in a disposal?", a: `<p>Grease and oil (they solidify in the drain), fibrous things like celery and corn husks (they wrap the lugs), pasta and rice in quantity (they swell), coffee grounds in quantity (sludge), and anything that isn't food. Small bones and eggshells are fine in most units; hard fruit pits are the classic jam.</p>` },
    { q: "Hot or cold water?", a: `<p>Cold. It keeps grease solid so it's chopped and flushed instead of coating the pipe.</p>` },
    { q: "How long do disposals last?", a: `<p>Ten to fifteen years. Frequent jams and a weak spin-up are the signs it's near the end.</p>` },
  ],
  related: ["slow-drain", "gfci-outlet", "leaky-faucet"],
};
