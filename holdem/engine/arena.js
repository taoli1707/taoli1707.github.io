// Bot-vs-bot benchmarking with duplicate deals.
//
// Poker variance is brutal: a 10 bb/100 edge is invisible under the noise of a
// few thousand hands played straight. So every deal is played twice, with the
// seats swapped and the identical deck — whatever one agent got dealt, the
// other gets too. The cards cancel and what is left is the decisions.
//
// The reported interval is a paired 95% CI over the per-deal differences,
// which is the number to look at before believing any strategy change helped.
// Treat it as a guide, not a guarantee: per-deal results are heavy-tailed
// (most pots are small, a few are the whole stack), so the normal
// approximation runs slightly narrow at small sample sizes. If a result sits
// near the edge of the interval, run more deals or more seeds.

import { createHand, playHand, dealDeck, BIG_BLIND } from './game.js';
import { makeRng } from './rng.js';

/**
 * @param {object} opts
 * @param {(seed:number)=>Function} opts.a  factory for the agent under test
 * @param {(seed:number)=>Function} opts.b  factory for the opponent
 * @param {number} [opts.deals]    each deal is played twice (seats swapped)
 * @param {number} [opts.stackBb]  starting stack, reset every hand
 * @param {(done:number,total:number)=>boolean} [opts.onProgress] false cancels
 */
export function duel({
  a, b, deals = 2000, stackBb = 100, seed = 1, bigBlind = BIG_BLIND, onProgress,
} = {}) {
  const rng = makeRng(seed);
  const stack = Math.round(stackBb * bigBlind);
  const samples = new Float64Array(deals);

  let played = 0;
  let sum = 0;
  let sumSq = 0;
  let showdowns = 0;
  let aAllIn = 0;

  for (let d = 0; d < deals; d++) {
    const deck = dealDeck(rng);
    const button = d % 2;
    // Fresh agents per deal, seeded identically for both seatings, so the
    // mirror really is a mirror and not two different random walks.
    const seedA = seed * 7919 + d;
    const seedB = seed * 104729 + d;

    const first = createHand({ stacks: [stack, stack], button, deck, bigBlind });
    playHand(first, [a(seedA), b(seedB)]);

    const second = createHand({ stacks: [stack, stack], button, deck, bigBlind });
    playHand(second, [b(seedB), a(seedA)]);

    const won = first.result.net[0] + second.result.net[1];
    samples[d] = won;
    sum += won;
    sumSq += won * won;
    played += 2;
    if (first.result.showdown) showdowns++;
    if (second.result.showdown) showdowns++;
    if (first.stacks[0] === 0 || second.stacks[1] === 0) aAllIn++;

    if (onProgress && (d & 63) === 0 && onProgress(d, deals) === false) {
      return summarise(samples.subarray(0, d), d, played, showdowns, bigBlind, sum, sumSq);
    }
  }

  return summarise(samples, deals, played, showdowns, bigBlind, sum, sumSq);
}

function summarise(samples, deals, hands, showdowns, bigBlind, sum, sumSq) {
  if (deals === 0) {
    return { hands: 0, deals: 0, bbPer100: 0, ci95: 0, showdownRate: 0, totalBb: 0 };
  }
  const meanPerDeal = sum / deals;
  const variance = Math.max(0, sumSq / deals - meanPerDeal * meanPerDeal);
  const stdErrPerDeal = Math.sqrt(variance / deals);

  // Two hands per deal, so per-hand rate is half the per-deal rate.
  const bbPer100 = (meanPerDeal / 2 / bigBlind) * 100;
  const ci95 = (1.96 * stdErrPerDeal / 2 / bigBlind) * 100;

  return {
    hands,
    deals,
    bbPer100,
    ci95,
    totalBb: sum / bigBlind,
    showdownRate: showdowns / hands,
    significant: Math.abs(bbPer100) > ci95,
    // Kept so independent runs can be pooled; see mergeDuels.
    moments: { sum, sumSq, showdowns, bigBlind },
  };
}

/**
 * Pool independent duels of the same matchup. Chunking a long run into
 * differently seeded pieces keeps the browser responsive, and pooling the raw
 * moments gives exactly the interval a single long run would have produced.
 */
export function mergeDuels(results) {
  const live = results.filter((r) => r && r.deals > 0);
  if (live.length === 0) return summarise([], 0, 0, 0, BIG_BLIND, 0, 0);
  const bigBlind = live[0].moments.bigBlind;
  let deals = 0; let hands = 0; let showdowns = 0; let sum = 0; let sumSq = 0;
  for (const r of live) {
    deals += r.deals;
    hands += r.hands;
    showdowns += r.moments.showdowns;
    sum += r.moments.sum;
    sumSq += r.moments.sumSq;
  }
  return summarise([], deals, hands, showdowns, bigBlind, sum, sumSq);
}

/** Round-robin every agent against every other. */
export function tournament({ agents, deals = 500, stackBb = 100, seed = 1, onProgress } = {}) {
  const names = Object.keys(agents);
  const rows = [];
  const total = (names.length * (names.length - 1)) / 2;
  let done = 0;

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const result = duel({
        a: agents[names[i]], b: agents[names[j]], deals, stackBb, seed: seed + done,
      });
      rows.push({ a: names[i], b: names[j], ...result });
      done++;
      if (onProgress && onProgress(done, total) === false) return rows;
    }
  }
  return rows;
}
