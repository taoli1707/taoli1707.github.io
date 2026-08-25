// Heads-up jam/fold Nash equilibrium.
//
// The game: blinds 0.5 / 1, effective stack S big blinds. The small blind
// either shoves all-in or folds; the big blind either calls or folds. That is
// the whole tree, which makes it one of the very few poker decisions with a
// real, computable, unexploitable answer — and at 15bb or less it is most of
// the money in a tournament.
//
// Solved by fictitious play over the 169 hand classes, with exact card removal
// (PAIR_COUNTS) rather than the naive combo weighting most charts use.
//
// Payoffs, in big blinds, from the small blind's seat:
//   SB folds            -0.5
//   SB jams, BB folds   +1
//   SB jams, BB calls   S * (2 * equity - 1)

import { EQUITY, PAIR_COUNTS } from '../data/preflop.js';

const N = 169;

/**
 * @param {number} stack effective stack in big blinds
 * @param {object} [opts]
 * @param {number} [opts.iterations] fictitious play passes
 * @returns {{shove:Float64Array, call:Float64Array, sbEv:number, exploitability:number,
 *            shovePercent:number, callPercent:number, stack:number}}
 */
export function solvePushFold(stack, { iterations = 600, burnIn = 120 } = {}) {
  const S = Math.max(1, stack);

  // Cache the call/fold payoff swing per matchup; it is fixed given the stack.
  // callDelta[i][j] = (SB jam-and-called EV) - (SB jam-and-folded-to EV)
  const jamCalled = new Float64Array(N * N);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      jamCalled[i * N + j] = S * (2 * EQUITY[i * N + j] - 1);
    }
  }

  const shove = new Float64Array(N).fill(0.5);
  const call = new Float64Array(N).fill(0.5);
  const brShove = new Float64Array(N);
  const brCall = new Float64Array(N);

  const sweep = (passes) => {
    for (let t = 0; t < passes; t++) {
      bestResponseBB(brCall, shove, jamCalled);
      bestResponseSB(brShove, call, jamCalled);
      const alpha = 1 / (t + 2);
      for (let k = 0; k < N; k++) {
        shove[k] += alpha * (brShove[k] - shove[k]);
        call[k] += alpha * (brCall[k] - call[k]);
      }
    }
  };

  // Fictitious play keeps its whole history in the average, including the early
  // passes where both players were still reacting to a 50/50 coin-flip
  // opponent. Those leave a percent or two of phantom frequency on hands that
  // are really pure folds. Burning in first and restarting the average from
  // there divides that leftover by the run length a second time.
  sweep(burnIn);
  sweep(iterations);

  // What survives is the averaged-in starting point itself; snap it away. The
  // cutoff sits far below any frequency a genuinely mixed hand settles on.
  for (let k = 0; k < N; k++) {
    if (shove[k] > 0.998) shove[k] = 1; else if (shove[k] < 0.002) shove[k] = 0;
    if (call[k] > 0.998) call[k] = 1; else if (call[k] < 0.002) call[k] = 0;
  }

  // One final pair of best responses measures how much either player still
  // gains by deviating — the residual exploitability of the averaged strategy.
  bestResponseBB(brCall, shove, jamCalled);
  bestResponseSB(brShove, call, jamCalled);
  const value = seatEv(shove, call, jamCalled);
  const sbBest = seatEv(brShove, call, jamCalled);
  const bbBest = seatEv(shove, brCall, jamCalled);
  const exploitability = Math.max(0, (sbBest - value) + (value - bbBest)) / 2;

  return {
    stack: S,
    shove,
    call,
    sbEv: value,
    exploitability,
    shovePercent: frequencyPercent(shove),
    callPercent: frequencyPercent(call),
  };
}

/** BB calls when calling beats folding, given the SB's jamming frequencies. */
function bestResponseBB(out, shove, jamCalled) {
  for (let j = 0; j < N; j++) {
    let edge = 0;
    for (let i = 0; i < N; i++) {
      const w = PAIR_COUNTS[j * N + i] * shove[i];
      if (w === 0) continue;
      // BB's EV calling is -jamCalled (zero sum); folding costs the 1bb blind.
      edge += w * (-jamCalled[i * N + j] + 1);
    }
    out[j] = edge > 0 ? 1 : 0;
  }
}

/** SB jams when jamming beats surrendering the small blind. */
function bestResponseSB(out, call, jamCalled) {
  for (let i = 0; i < N; i++) {
    let ev = 0;
    let weight = 0;
    for (let j = 0; j < N; j++) {
      const w = PAIR_COUNTS[i * N + j];
      if (w === 0) continue;
      const c = call[j];
      ev += w * ((1 - c) * 1 + c * jamCalled[i * N + j]);
      weight += w;
    }
    out[i] = weight > 0 && ev / weight > -0.5 ? 1 : 0;
  }
}

function seatEv(shove, call, jamCalled) {
  let ev = 0;
  let weight = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const w = PAIR_COUNTS[i * N + j];
      if (w === 0) continue;
      const s = shove[i];
      const c = call[j];
      ev += w * (s * ((1 - c) * 1 + c * jamCalled[i * N + j]) + (1 - s) * -0.5);
      weight += w;
    }
  }
  return ev / weight;
}

/** Strategy frequency as a share of all 1326 combos. */
function frequencyPercent(strategy) {
  let combos = 0;
  for (let i = 0; i < N; i++) {
    const row = (i / 13) | 0;
    const col = i % 13;
    const n = row === col ? 6 : col > row ? 4 : 12;
    combos += n * strategy[i];
  }
  return (combos / 1326) * 100;
}

/**
 * EV of jamming a specific class, in big blinds, against a given calling range.
 * Positive relative to -0.5 means jamming beats folding.
 */
export function jamEv(classId, stack, call) {
  const S = Math.max(1, stack);
  let ev = 0;
  let weight = 0;
  for (let j = 0; j < N; j++) {
    const w = PAIR_COUNTS[classId * N + j];
    if (w === 0) continue;
    const c = call[j];
    ev += w * ((1 - c) * 1 + c * S * (2 * EQUITY[classId * N + j] - 1));
    weight += w;
  }
  return ev / weight;
}

const cache = new Map();

/** Memoised solve, rounded to a tenth of a big blind. */
export function pushFoldChart(stack, opts) {
  const key = Math.round(stack * 10) / 10;
  if (!cache.has(key)) cache.set(key, solvePushFold(key, opts));
  return cache.get(key);
}
