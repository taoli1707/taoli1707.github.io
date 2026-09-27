/*
 * Hand-written takeaways for the Patterns page. `body` may be a function of the
 * case list so counts stay correct as cases are added.
 */
"use strict";

const OWN_AUDIENCE = ["build-in-public", "twitter-x", "linkedin", "newsletter", "youtube"];
const n = (cases, pred) => cases.filter(pred).length;

module.exports = {
  takeaways: [
    {
      title: "Most sell to an audience the founder built.",
      body: (cs) => `${n(cs, (c) => OWN_AUDIENCE.includes(c.channel))} of ${cs.length} got most customers from the founder's own following (build in public, X, LinkedIn, a newsletter), not from ads. None used paid ads as the main channel. Start posting before you have something to sell.`,
    },
    {
      title: "The AI apps grew fastest.",
      body: (cs) => `${cs.filter((c) => c.category === "ai-app").map((c) => c.name).join(", ")} all launched in 2023 and within about two years were among the largest businesses here. Arriving early on a new capability mattered more than polish. The cost is a moat that erodes as models get cheaper and competitors arrive.`,
    },
    {
      title: "Seed the supply side before you charge.",
      body: () => "Remote OK aggregated jobs from other boards, Nomad List started as a public Google Sheet, and BuiltWith crawled the web before it sold a lookup. They charged only once the data existed. This is the playbook that best suits a data engineer.",
    },
    {
      title: "Boring tech is not a handicap.",
      body: () => "Remote OK and Nomad List run on plain PHP. Carrd and Photopea are one developer's hand-written code. None of the cases lists technical sophistication as the reason it won. Distribution and a niche did the work.",
    },
    {
      title: "Platform risk ends businesses.",
      body: () => "GummySearch shut down at about $35k MRR after changes to Reddit's API access. TypingMind depends on model providers and Photopea on ad rates. If one company's policy change can end your revenue, price that into the decision.",
    },
    {
      title: "\"Solo\" tends to be a stage, not a final state.",
      body: (cs) => `${n(cs, (c) => !/^solo$/i.test(c.team.trim()))} of ${cs.length} added contractors or hires once revenue allowed it. The cases were solo while they found product-market fit, not always afterwards.`,
    },
  ],
};
