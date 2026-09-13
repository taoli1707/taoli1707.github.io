/*
 * The printable seasonal maintenance checklist. This page is the free lead
 * magnet; the paid printable pack is a nicer, expanded version of it.
 * `guide` links an item to a guide slug on this site.
 */
"use strict";

module.exports = {
  intro:
    "Most expensive home repairs start as cheap ones nobody noticed. Ten minutes a month and an hour each season catches them early. Print this, stick it inside a cabinet door, and check things off.",
  monthly: [
    { text: "Check the HVAC filter; replace if gray (every 1–3 months)." },
    { text: "Press TEST then RESET on every GFCI outlet.", guide: "gfci-outlet" },
    { text: "Look under every sink with a flashlight for drips or water stains.", guide: "leaky-faucet" },
    { text: "Run water in guest bathrooms and floor drains so traps do not dry out.", guide: "slow-drain" },
    { text: "Clean the range hood filter (dishwasher safe on most)." },
    { text: "Grind a tray of ice cubes in the garbage disposal to scour the chamber.", guide: "garbage-disposal" },
    { text: "Drop food coloring in each toilet tank; if the bowl tints in 15 minutes, the flapper leaks.", guide: "running-toilet" },
  ],
  seasons: [
    {
      name: "Spring",
      items: [
        { text: "Clean gutters and downspouts; make sure water discharges 4–6 ft from the foundation." },
        { text: "Test the sump pump by pouring a bucket of water into the pit." },
        { text: "Inspect exterior caulk around windows, doors, and where pipes enter the house." },
        { text: "Turn on outdoor faucets and check for leaks from winter freeze damage." },
        { text: "Clear leaves and debris from around the AC condenser; hose the fins gently from the inside out." },
        { text: "Clean the dryer vent from the dryer to the outside hood.", guide: "dryer-vent" },
        { text: "Test smoke and CO alarms; replace batteries and any unit older than 10 years." },
        { text: "Set ceiling fans to spin counterclockwise (push air down)." },
      ],
    },
    {
      name: "Summer",
      items: [
        { text: "Check deck boards and railings for rot and loose fasteners." },
        { text: "Walk the yard and look at the roof from the ground for lifted or missing shingles." },
        { text: "Repair or replace torn window screens." },
        { text: "Vacuum refrigerator coils (behind or beneath the fridge)." },
        { text: "Inspect washing machine hoses; replace rubber hoses with braided stainless every 5 years." },
        { text: "Re-caulk the tub or shower if the old bead is cracked, black, or peeling.", guide: "recaulk-tub" },
        { text: "Tighten loose doorknobs, hinges, and cabinet pulls.", guide: "sticking-door" },
        { text: "Patch nail holes and dings before summer paint touch-ups.", guide: "drywall-hole" },
      ],
    },
    {
      name: "Fall",
      items: [
        { text: "Replace the furnace filter and schedule a heating tune-up if you have not in 2 years." },
        { text: "Clean gutters again after the leaves drop." },
        { text: "Shut off and drain outdoor faucets; disconnect and store hoses." },
        { text: "Replace worn weatherstripping and door sweeps; a lit candle held near the frame finds drafts." },
        { text: "Have the chimney inspected if you use a fireplace." },
        { text: "Drain a few gallons from the water heater to flush sediment; check the temperature is around 120°F." },
        { text: "Set ceiling fans to spin clockwise (pull air up)." },
        { text: "Test smoke and CO alarms when the clocks change." },
      ],
    },
    {
      name: "Winter",
      items: [
        { text: "Watch for ice dams; keep the attic cold and ventilated rather than heating the roof." },
        { text: "Open cabinet doors under sinks on exterior walls during hard freezes." },
        { text: "Check that the dryer vent hood outside is not blocked by snow or a stuck flap.", guide: "dryer-vent" },
        { text: "Replace the furnace filter mid-season; heating runs the fan the most." },
        { text: "Test the sump pump before the spring thaw." },
        { text: "Check attic insulation depth (10–14 in of loose fill is typical) and that soffit vents are clear." },
        { text: "Replace any showerhead that sprays sideways or has lost pressure to scale.", guide: "showerhead" },
      ],
    },
  ],
  yearly: [
    { text: "Service the HVAC system (spring for cooling, fall for heating)." },
    { text: "Check the fire extinguisher gauge and expiration; every kitchen should have one." },
    { text: "Replace the water filter in the fridge and any whole-house filter." },
    { text: "Have the septic tank inspected (pumped every 3–5 years) if you have one." },
    { text: "Photograph the electrical panel directory and every appliance model plate; store the photos in the cloud." },
  ],
};
