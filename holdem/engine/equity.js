// Equity engine: how often each range wins the pot.
//
// Two paths, chosen automatically:
//   * exact enumeration when the remaining tree is small (river/turn spots,
//     narrow ranges) — no sampling error at all;
//   * Monte Carlo with a seeded RNG otherwise, reporting a 95% confidence
//     interval so you know when to stop trusting the third decimal.

import { makeRng, partialShuffle } from './rng.js';
import { evaluate, categoryOf } from './evaluator.js';

const DEFAULT_EXACT_LIMIT = 2_000_000;

function combinations(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

function cumulative(weights) {
  const c = new Float64Array(weights.length);
  let s = 0;
  for (let i = 0; i < weights.length; i++) { s += weights[i]; c[i] = s; }
  return c;
}

function sampleIndex(cum, u) {
  const target = u * cum[cum.length - 1];
  let lo = 0, hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1; else hi = mid;
  }
  return lo;
}

function emptyResult(playerCount) {
  return {
    equity: new Array(playerCount).fill(0),
    win: new Array(playerCount).fill(0),
    tie: new Array(playerCount).fill(0),
    categories: Array.from({ length: playerCount }, () => new Array(9).fill(0)),
    iterations: 0,
    exact: false,
    stdError: 0,
    // Raw first and second moments of player 1's pot share, kept so separate
    // runs can be merged without losing the ability to recompute the interval.
    moments: { sum: 0, sumSq: 0 },
  };
}

/**
 * @param {object} opts
 * @param {Array<{combos:Array<[number,number]>, weights:Float64Array|number[]}>} opts.ranges
 * @param {number[]} [opts.board]   0, 3, 4 or 5 community cards
 * @param {number[]} [opts.dead]    cards removed from the deck (mucked, exposed)
 * @param {number}   [opts.iters]   Monte Carlo sample count
 * @param {number}   [opts.seed]
 * @param {number}   [opts.exactLimit] enumerate instead of sampling below this work estimate
 * @param {(done:number,total:number)=>boolean} [opts.onProgress] return false to cancel
 */
export function equity(opts) {
  const {
    ranges, board = [], dead = [], iters = 100_000, seed = 1,
    exactLimit = DEFAULT_EXACT_LIMIT, onProgress,
  } = opts;

  if (!ranges || ranges.length < 2) throw new Error('need at least two ranges');
  if (board.length > 5) throw new Error('board cannot hold more than five cards');

  const blocked = new Uint8Array(52);
  for (const c of board) {
    if (blocked[c]) throw new Error('duplicate card on the board');
    blocked[c] = 1;
  }
  for (const c of dead) {
    if (blocked[c]) throw new Error('dead card is already in play');
    blocked[c] = 1;
  }

  // Drop combos that clash with the board or dead cards.
  const live = ranges.map((r) => {
    const combos = [];
    const weights = [];
    for (let i = 0; i < r.combos.length; i++) {
      const [a, b] = r.combos[i];
      if (blocked[a] || blocked[b]) continue;
      const w = r.weights ? r.weights[i] : 1;
      if (w <= 0) continue;
      combos.push([a, b]);
      weights.push(w);
    }
    return { combos, weights: Float64Array.from(weights) };
  });

  for (let i = 0; i < live.length; i++) {
    if (live[i].combos.length === 0) {
      throw new Error(`player ${i + 1}'s range is empty once blockers are removed`);
    }
  }

  const missing = 5 - board.length;
  const deckSize = 52 - board.length - dead.length - 2 * live.length;
  let work = combinations(deckSize, missing);
  for (const r of live) work *= r.combos.length;

  if (work > 0 && work <= exactLimit) return enumerateExact(live, board, blocked, missing, onProgress);
  return monteCarlo(live, board, blocked, missing, iters, seed, onProgress);
}

// ---------------------------------------------------------------------------

function showdown(scores, res, weight) {
  let best = -1;
  let winners = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > best) { best = scores[i]; winners = 1; }
    else if (scores[i] === best) winners++;
  }
  const share = weight / winners;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] !== best) continue;
    res.equity[i] += share;
    if (winners === 1) res.win[i] += weight; else res.tie[i] += weight;
  }
  return best;
}

function enumerateExact(live, board, blockedBase, missing, onProgress) {
  const n = live.length;
  const res = emptyResult(n);
  res.exact = true;

  const hand = new Int32Array(7);
  const scores = new Float64Array(n);
  const blocked = Uint8Array.from(blockedBase);
  const chosen = new Array(n);
  const fullBoard = new Array(5);
  for (let i = 0; i < board.length; i++) fullBoard[i] = board[i];

  let totalWeight = 0;
  let cancelled = false;

  const runBoards = (comboWeight) => {
    // Deck of everything still unseen, given the hole cards just assigned.
    const deck = [];
    for (let c = 0; c < 52; c++) if (!blocked[c]) deck.push(c);

    const idx = new Array(missing).fill(0);
    const walk = (depth, start) => {
      if (cancelled) return;
      if (depth === missing) {
        for (let i = 0; i < missing; i++) fullBoard[board.length + i] = deck[idx[i]];
        for (let p = 0; p < n; p++) {
          hand[0] = chosen[p][0];
          hand[1] = chosen[p][1];
          for (let i = 0; i < 5; i++) hand[2 + i] = fullBoard[i];
          scores[p] = evaluate(hand, 7);
          res.categories[p][categoryOf(scores[p])] += comboWeight;
        }
        showdown(scores, res, comboWeight);
        totalWeight += comboWeight;
        res.iterations++;
        if (onProgress && (res.iterations & 8191) === 0 && onProgress(res.iterations, 0) === false) {
          cancelled = true;
        }
        return;
      }
      for (let i = start; i < deck.length; i++) {
        idx[depth] = i;
        walk(depth + 1, i + 1);
        if (cancelled) return;
      }
    };
    walk(0, 0);
  };

  const assign = (p, weightSoFar) => {
    if (cancelled) return;
    if (p === n) { runBoards(weightSoFar); return; }
    const { combos, weights } = live[p];
    for (let i = 0; i < combos.length; i++) {
      const [a, b] = combos[i];
      if (blocked[a] || blocked[b]) continue;
      blocked[a] = 1; blocked[b] = 1;
      chosen[p] = combos[i];
      assign(p + 1, weightSoFar * weights[i]);
      blocked[a] = 0; blocked[b] = 0;
      if (cancelled) return;
    }
  };

  assign(0, 1);
  finish(res, totalWeight);
  return res;
}

function monteCarlo(live, board, blockedBase, missing, iters, seed, onProgress) {
  const n = live.length;
  const res = emptyResult(n);
  const rng = makeRng(seed);
  const cums = live.map((r) => cumulative(r.weights));

  const hand = new Int32Array(7);
  const scores = new Float64Array(n);
  const blocked = new Uint8Array(52);
  const chosen = new Array(n);
  const avail = new Int8Array(52);
  const fullBoard = new Array(5);
  for (let i = 0; i < board.length; i++) fullBoard[i] = board[i];

  // Running sum of squares on player 0's equity share drives the reported CI.
  let sum0 = 0;
  let sumSq0 = 0;
  let done = 0;

  outer:
  for (let it = 0; it < iters; it++) {
    blocked.set(blockedBase);

    for (let p = 0; p < n; p++) {
      let combo = null;
      for (let attempt = 0; attempt < 64; attempt++) {
        const c = live[p].combos[sampleIndex(cums[p], rng())];
        if (!blocked[c[0]] && !blocked[c[1]]) { combo = c; break; }
      }
      if (combo === null) continue outer; // ranges collide this deal; resample
      blocked[combo[0]] = 1;
      blocked[combo[1]] = 1;
      chosen[p] = combo;
    }

    let k = 0;
    for (let c = 0; c < 52; c++) if (!blocked[c]) avail[k++] = c;
    partialShuffle(avail.subarray(0, k), missing, rng);
    for (let i = 0; i < missing; i++) fullBoard[board.length + i] = avail[i];

    for (let p = 0; p < n; p++) {
      hand[0] = chosen[p][0];
      hand[1] = chosen[p][1];
      for (let i = 0; i < 5; i++) hand[2 + i] = fullBoard[i];
      scores[p] = evaluate(hand, 7);
      res.categories[p][categoryOf(scores[p])]++;
    }

    const before = res.equity[0];
    showdown(scores, res, 1);
    const share = res.equity[0] - before;
    sum0 += share;
    sumSq0 += share * share;

    done++;
    if (onProgress && (done & 16383) === 0 && onProgress(done, iters) === false) break;
  }

  res.iterations = done;
  res.moments = { sum: sum0, sumSq: sumSq0 };
  finish(res, done);
  res.stdError = standardError(sum0, sumSq0, done);
  return res;
}

function standardError(sum, sumSq, n) {
  if (n < 2) return 0;
  const mean = sum / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  return Math.sqrt(variance / n);
}

/**
 * Combine independent runs of the same spot into one result. The UI samples in
 * slices so the page stays responsive; this stitches the slices back together
 * without pretending the total is more precise than it is.
 */
export function mergeEquity(results) {
  const live = results.filter((r) => r && r.iterations > 0);
  if (live.length === 0) throw new Error('nothing to merge');
  if (live.length === 1) return live[0];

  const players = live[0].equity.length;
  const out = emptyResult(players);
  out.exact = live.every((r) => r.exact);

  let total = 0;
  for (const r of live) {
    const n = r.iterations;
    total += n;
    for (let i = 0; i < players; i++) {
      out.equity[i] += r.equity[i] * n;
      out.win[i] += r.win[i] * n;
      out.tie[i] += r.tie[i] * n;
      for (let c = 0; c < 9; c++) out.categories[i][c] += r.categories[i][c] * n;
    }
    out.moments.sum += r.moments.sum;
    out.moments.sumSq += r.moments.sumSq;
  }

  out.iterations = total;
  finish(out, total);
  out.stdError = out.exact ? 0 : standardError(out.moments.sum, out.moments.sumSq, total);
  return out;
}

function finish(res, total) {
  if (total <= 0) return;
  for (let i = 0; i < res.equity.length; i++) {
    res.equity[i] /= total;
    res.win[i] /= total;
    res.tie[i] /= total;
    for (let c = 0; c < 9; c++) res.categories[i][c] /= total;
  }
}

/** Equity of one specific hand against one specific hand — the common case. */
export function handVsHand(heroCards, villainCards, board = [], opts = {}) {
  return equity({
    ranges: [
      { combos: [heroCards], weights: Float64Array.of(1) },
      { combos: [villainCards], weights: Float64Array.of(1) },
    ],
    board,
    ...opts,
  });
}
