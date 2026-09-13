"use strict";
module.exports = {
  slug: "dryer-vent",
  title: "How to Clean a Dryer Vent (Before It Starts a Fire)",
  short: "Clean a dryer vent",
  blurb: "Clothes taking two cycles? That's lint in the duct. A $20 brush kit and 45 minutes fixes it and removes a real fire risk.",
  category: "kitchen-bath-laundry",
  summary: "Clean a clogged dryer vent from the dryer to the outside hood with a drill-powered brush kit, fix the flapper, and replace foil duct with metal. 45–90 minutes, $15–40.",
  symptoms: ["clothes take too long to dry", "dryer takes two cycles", "dryer hot on top", "burning smell from dryer", "lint outside vent", "dryer vent clogged", "dryer not drying", "laundry room humid", "dryer overheating shuts off", "lint behind dryer", "vent flap stuck", "dryer vent cleaning"],
  keywords: ["lint", "duct", "transition duct", "foil duct", "rigid metal duct", "vent hood", "flapper", "brush kit", "drill", "bird nest", "foil tape", "thermal fuse"],
  difficulty: 1,
  time: "45–90 min",
  timeHours: [0.75, 1.5],
  partsCost: [15, 40],
  toolCost: 25,
  risk: "",
  proCostKey: "dryer-vent",
  published: "2026-09-13",
  updated: "2026-09-13",
  safety: [
    "Unplug an electric dryer before moving it. For a gas dryer, turn off the gas valve behind it as well, and don't disconnect the gas line itself. If the flexible gas connector won't let you pull the dryer far enough to reach the duct, stop and call a pro.",
    "Lint is flammable. No smoking, no open flame, and vacuum lint up as you go rather than piling it.",
    "If the vent exits through the roof, work from inside; leave the roof to a pro or someone with fall protection.",
  ],
  callPro: [
    "A gas dryer where the flex gas connector has to be disconnected to reach the duct.",
    "The duct runs more than 25 feet, has more than two elbows, or exits through the roof and you can't reach the hood.",
    "You find the duct crushed, disconnected inside a wall or ceiling, or made of plastic or foil inside the wall. It needs replacing, often with wall access.",
    "The dryer still runs hot, or trips its thermal fuse, after a complete cleaning. That's the appliance, not the vent.",
  ],
  tools: [
    { name: "Dryer vent brush kit with drill attachment", q: "dryer vent cleaning kit drill", note: "Flexible rods that screw together and chuck into a drill. Get one with at least 12 ft of rods." },
    { name: "Cordless drill", q: "cordless drill driver kit" },
    { name: "Vacuum with a hose and crevice tool", q: "shop vac", note: "A shop vac is ideal; a household vacuum works." },
    { name: "5/16 in nut driver or flat screwdriver", q: "5/16 nut driver", note: "For the duct clamps." },
    { name: "Flashlight, gloves, dust mask", q: "dust mask n95" },
  ],
  parts: [
    { name: "4 in semi-rigid aluminum transition duct (or rigid metal)", q: "4 inch semi rigid dryer duct", note: "Replace any foil “accordion” duct and any plastic duct. Both are fire hazards; plastic is prohibited by every appliance manufacturer." },
    { name: "4 in worm-drive duct clamps", q: "4 inch duct clamps" },
    { name: "UL 181 foil tape", q: "ul 181 foil tape", note: "Not cloth duct tape, which dries out. And no screws: screw tips catch lint inside the duct." },
    { name: "Exterior vent hood with a flapper or louvers", q: "4 inch dryer vent hood exterior", optional: true, note: "If yours is broken, missing, or has a mesh screen (screens trap lint and aren't allowed on dryer vents)." },
  ],
  intro: [
    `<p>The U.S. Fire Administration counts about 2,900 home clothes-dryer fires a year, and “failure to clean” is the leading factor in a third of them. The mechanism is simple: lint builds up in the duct, airflow drops, the dryer runs hotter and longer, and eventually lint near the heating element ignites. The warning sign is clothes that need two cycles.</p>`,
    `<p>Cleaning the duct is a once-a-year job with a $20 kit. While you're back there, replace the flimsy foil duct most dryers were installed with; smooth metal duct moves more air and doesn't hold lint.</p>`,
  ],
  diagnose: [
    { if: "Clothes are hot but still damp after a full cycle", then: "Restricted duct. This guide." },
    { if: "The outside flap doesn't open while the dryer runs", then: "Clog, stuck flap, or a nest in the hood. Steps 4–5." },
    { if: "Lint on the floor behind the dryer", then: "Transition duct leaking or disconnected. Step 6." },
    { if: "Dryer runs but makes no heat", then: "Thermal fuse or heating element. Clean the vent first (a clogged vent blows the fuse), then it's an appliance repair." },
  ],
  steps: [
    {
      title: "Unplug the dryer and pull it out",
      body: `<p>Unplug (and close the gas valve on a gas dryer). Slide the dryer out far enough to work behind it; a piece of cardboard under the feet protects the floor. Vacuum the lint on the floor and the back of the dryer.</p>`,
    },
    {
      title: "Disconnect the transition duct",
      body: `<p>Loosen the clamp at the dryer's exhaust port and at the wall pipe, and pull the short duct off. Look at it: foil accordion or plastic goes straight in the trash. Rigid or semi-rigid metal can be cleaned and reused if it's not crushed.</p>`,
    },
    {
      title: "Clean the dryer itself",
      body: `<p>Vacuum the exhaust port on the back of the dryer with the crevice tool. Pull the lint screen from the top and vacuum down inside its slot as far as the hose reaches; the small brush from the kit helps. A surprising amount of lint lives here.</p>`,
    },
    {
      title: "Brush the duct from the inside",
      body: `<p>Screw two rods together, attach the brush, and chuck the other end in the drill. Wrap a turn of foil tape around each rod joint so they can't unscrew in the duct. Push the brush into the wall pipe and run the drill slowly <em>clockwise only</em> (reverse unscrews the rods), feeding it in as it spins. Add rods as you go until you reach the outside or the brush stops advancing. Pull it back out, still spinning slowly, and vacuum the lint that comes with it. Repeat until it comes out clean.</p>`,
      warn: "Never run the drill in reverse with rods in the duct. A lost brush inside a wall is a wall repair.",
    },
    {
      title: "Go outside: clean the hood and brush from that end",
      body: `<p>Find the vent hood. Pull off any mesh screen (and throw it away; it's a lint trap that shouldn't be there). Clear lint, leaves, or nests from the hood and check that the flap or louvers swing freely. Run the brush in from this end too, especially if the run is long or has an elbow. Vacuum.</p>`,
    },
    {
      title: "Reconnect with metal duct",
      body: `<p>Cut the transition duct to the shortest length that reaches without kinks; a gentle curve, not a sharp bend. Clamp one end to the dryer port and the other to the wall pipe, then wrap each joint with foil tape. Push the dryer back slowly so the duct doesn't crush; leave a few inches of space.</p>`,
    },
    {
      title: "Test the airflow",
      body: `<p>Plug in, turn on air-fluff (no heat), and go outside: you should feel a strong, steady blast at the hood and see the flap fully open. Run a normal load and note the dry time; it should be dramatically shorter.</p>`,
    },
  ],
  troubleshooting: [
    { q: "The brush got stuck", a: `<p>Don't reverse the drill. Stop, pull back gently while wiggling, and try again with the drill spinning slowly forward. Work from the other end if you can. A stuck brush usually means an elbow or a crushed section.</p>` },
    { q: "Rods came apart inside the duct", a: `<p>Retrieve from the other end with a hook or the vacuum. Next time, tape every joint.</p>` },
    { q: "Still slow to dry after cleaning", a: `<p>The duct may be crushed or disconnected inside a wall, or longer than the dryer can push through. A pro can measure back pressure and camera the run. Also check the dryer: a weak blower or a bad cycling thermostat produces the same symptom.</p>` },
    { q: "Birds keep nesting in the hood", a: `<p>Install a hood with a spring-loaded flapper or louvers that close when the dryer is off. Not a screen.</p>` },
  ],
  faq: [
    { q: "How often should the vent be cleaned?", a: `<p>Once a year for a typical short run; every six months for a big family, a long run, or pets. The lint screen gets cleaned every single load.</p>` },
    { q: "Can I use a leaf blower instead?", a: `<p>Some people blow the duct out from the dryer end. It works on short, straight runs and blasts lint everywhere on the outside. The brush kit is cheap and more thorough.</p>` },
    { q: "Do I need a booster fan for a long run?", a: `<p>Runs over about 35 ft equivalent (each elbow counts as 5 ft) can need one, and there are code rules about where it goes. That's an installer's job.</p>` },
    { q: "Is dryer sheet residue a thing?", a: `<p>Yes. Fabric softener sheets leave a film on the lint screen that blocks airflow even when it looks clean. Wash the screen with soap and a brush every few months; water should pour through it, not bead up.</p>` },
  ],
  related: ["gfci-outlet", "garbage-disposal", "recaulk-tub"],
};
