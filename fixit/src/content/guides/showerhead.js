"use strict";
module.exports = {
  slug: "showerhead",
  title: "How to Replace a Showerhead (and Fix Low Pressure)",
  short: "Replace a showerhead",
  blurb: "Ten minutes, one wrench, a roll of tape. Also the fix for a head that sprays sideways.",
  category: "plumbing",
  summary: "Replace a showerhead in 10–20 minutes: unscrew the old one, clean the arm threads, wrap PTFE tape, hand-tighten the new head. Includes descaling for low pressure.",
  symptoms: ["showerhead leaks", "showerhead drips", "low water pressure in shower", "showerhead sprays sideways", "showerhead clogged", "replace shower head", "shower head leaking at the arm", "install handheld shower", "shower head loose", "hard water buildup shower"],
  keywords: ["shower arm", "ptfe tape", "teflon tape", "flow restrictor", "descale", "vinegar", "handheld", "thread"],
  difficulty: 1,
  time: "10–20 min",
  timeHours: [0.2, 0.4],
  partsCost: [15, 60],
  toolCost: 0,
  risk: "",
  proCostKey: "showerhead",
  published: "2026-09-13",
  updated: "2026-09-13",
  safety: [
    "Don't lean on the shower arm. It's a short pipe threaded into a fitting inside the wall, and cranking on it can break that fitting, which is a wall-opening repair.",
    "Wrap the wrench jaws in a rag or tape so the finish doesn't get chewed.",
  ],
  callPro: [
    "The shower arm turns along with the head, or spins freely: the fitting behind the wall is loose or broken.",
    "Water shows up behind the wall or on the ceiling below after your change.",
    "Low pressure is house-wide, not just the shower; that's a supply or pressure-regulator problem.",
  ],
  tools: [
    { name: "Adjustable wrench", q: "adjustable wrench" },
    { name: "Tongue-and-groove pliers", q: "tongue and groove pliers", note: "To hold the arm still while you turn the head." },
    { name: "Rag or painter's tape", note: "Protects the finish." },
    { name: "Old toothbrush" },
  ],
  parts: [
    { name: "New showerhead", q: "high pressure shower head", note: "Every U.S. shower arm is 1/2 in NPT, so any head fits. Handheld kits include the hose and holder." },
    { name: "PTFE thread tape", q: "ptfe thread seal tape" },
    { name: "White vinegar and a zip-top bag", q: "white vinegar", note: "For descaling instead of replacing." },
    { name: "New shower arm and flange", q: "shower arm and flange", optional: true, note: "Only if the old arm is corroded or the flange is rusted." },
  ],
  intro: [
    `<p>Every showerhead in the country screws onto the same half-inch threaded arm, which is why this is the easiest plumbing job there is. Three things bring people here: replacing an ugly or leaky head, a head that sprays sideways because half its holes are plugged with scale, and low pressure. The first two are below; the third is usually the second in disguise.</p>`,
  ],
  diagnose: [
    { if: "Sprays sideways or some holes are dead", then: "Scale. Descale (step 6) or replace." },
    { if: "Drips from the head when the shower is off", then: "Not the head. The valve cartridge in the wall is worn; see the dripping faucet guide." },
    { if: "Leaks where the head meets the arm", then: "Thread seal. Re-tape (steps 1–5)." },
    { if: "Weak flow everywhere in the house", then: "Supply or pressure regulator. Call a pro." },
  ],
  steps: [
    {
      title: "Unscrew the old head",
      body: `<p>Turn it counterclockwise by hand. If it's stuck, hold the arm still with the pliers (jaws wrapped) and turn the head's nut with the wrench. Mineral crust often lets go with one firm quarter turn.</p>`,
    },
    {
      title: "Clean the arm threads",
      body: `<p>Peel off the old tape and scrub the threads with the toothbrush. Wipe them dry. Look at the arm: rust or cracks mean replace it now while everything's apart.</p>`,
    },
    {
      title: "Wrap PTFE tape",
      body: `<p>Hold the end of the arm facing you. Wrap the tape three or four times <em>clockwise</em>, pulling it snug so it takes the shape of the threads. Clockwise matters: the head threads on clockwise, so the tape tightens instead of unwinding.</p>`,
      tip: "Leave the first thread bare so no tape ends up inside the head.",
    },
    {
      title: "Thread on the new head",
      body: `<p>Hand-tighten until it stops. Many heads include a rubber washer and only need hand-tight; the tape is insurance. Point the head where you want it. If it needs to go a bit further to aim right, a quarter turn with the wrench is fine.</p>`,
    },
    {
      title: "Test",
      body: `<p>Run the shower and look at the joint. A seep means an eighth of a turn more, not a big crank. Still seeping: remove, re-tape with more wraps, reinstall.</p>`,
    },
    {
      title: "Descale instead (if you're keeping the head)",
      body: `<p>Fill a zip-top bag with vinegar, put it over the head so the face is submerged, and rubber-band it to the arm for a few hours or overnight. Scrub the nozzles with the toothbrush, poke stubborn ones with a pin, and run hot water. Removable heads can go straight into a bowl of vinegar.</p>`,
      warn: "Brass, bronze, and nickel finishes can spot with long vinegar soaks. Limit those to a couple of hours and rinse well.",
    },
  ],
  troubleshooting: [
    { q: "It still leaks at the arm", a: `<p>More tape (five or six wraps) or the arm threads are damaged. Replacing the arm is the same idea one joint further back: unscrew it from the wall fitting counterclockwise, slowly and without side pressure, tape the new one, and thread it in.</p>` },
    { q: "The head leaks at its swivel ball", a: `<p>Tighten the collar around the ball slightly, or replace the small washer inside it (often included in the box).</p>` },
    { q: "Pressure is worse with the new head", a: `<p>Check for debris behind the small screen washer in the head's inlet, and make sure you didn't leave tape across the opening.</p>` },
  ],
  faq: [
    { q: "Can I remove the flow restrictor?", a: `<p>Federal rules cap showerheads at 2.5 gallons per minute, and several states cap them lower, so restrictors are there on purpose. Descale first: nearly all “low pressure” complaints are scale. If the head is genuinely bad, buy a better-designed one at the same flow rate.</p>` },
    { q: "Which way do I wrap the tape?", a: `<p>Face the open end of the pipe and wrap clockwise. If you'd screw the head on with a right-hand twist, the tape should lie in the same direction.</p>` },
    { q: "I want a handheld with a slide bar", a: `<p>The head part is identical to this guide. The bar needs two holes in tile: use a carbide or diamond bit at low speed with tape over the spot, aim for grout lines when you can, and use anchors rated for tile. Check for pipes behind the wall first: the valve and arm are right there.</p>` },
  ],
  related: ["leaky-faucet", "recaulk-tub", "running-toilet"],
};
