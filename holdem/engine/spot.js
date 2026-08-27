// spot.js — the shared factual layer under the council.
//
// Every specialist in council.js argues from numbers computed here, never from
// a rule of thumb. Nothing in this file has an opinion: it answers questions
// like "how many of the remaining 1176 hands beat mine right now" and leaves
// the argument to somebody else.

import { rankOf, suitOf, cardToString, RANK_CHARS, classOf as classOfPair } from './cards.js';
import { CLASS_RANK } from '../data/preflop.js';

// Preflop there is no board to rank hands on, so all-in strength stands in.
// CLASS_RANK is 0 for the best class, so flip it into a bigger-is-better key.
const PREFLOP_ORDER = Array.from({ length: 169 }, (_, i) => 168 - CLASS_RANK[i]);
import {
  evaluate, evaluateHand, categoryOf, CATEGORY, CATEGORY_NAMES, describe,
} from './evaluator.js';

// ── Prices ────────────────────────────────────────────────────────────────
// These four are the whole of pot arithmetic. `pot` always means the pot as it
// stands *including* the bet you are facing, which is what the felt shows you.

/** Share of the pot you must win to break even on a call. */
export const requiredEquity = (pot, toCall) => (toCall <= 0 ? 0 : toCall / (pot + toCall));

/** How often a bluff of `bet` into `pot` must fold the opponent out to break even. */
export const bluffBreakEven = (pot, bet) => (bet <= 0 ? 0 : bet / (pot + bet));

/**
 * Minimum defence frequency: the share of your range you must continue with so
 * a bet of `bet` into `pot` cannot print money as a pure bluff. The mirror of
 * bluffBreakEven, and the reason "I fold too much" is a real leak.
 */
export const minDefenceFrequency = (pot, bet) => (bet <= 0 ? 1 : pot / (pot + bet));

/** Stack-to-pot ratio. Below ~1 the hand is already a stack-off. */
export const spr = (effective, pot) => (pot <= 0 ? Infinity : effective / pot);

// ── Card set helpers ──────────────────────────────────────────────────────

const hasStraight = (bits) => {
  const b = ((bits << 1) | ((bits >> 12) & 1)) >>> 0;
  return (b & (b >> 1) & (b >> 2) & (b >> 3) & (b >> 4)) !== 0;
};

function rankMask(cards) {
  let m = 0;
  for (const c of cards) m |= 1 << rankOf(c);
  return m;
}

/** Every card id not in `used`. */
export function unseenCards(used) {
  const blocked = new Uint8Array(52);
  for (const c of used) blocked[c] = 1;
  const out = [];
  for (let c = 0; c < 52; c++) if (!blocked[c]) out.push(c);
  return out;
}

/** Every two-card combination from `cards`. */
export function pairsOf(cards) {
  const out = [];
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) out.push([cards[i], cards[j]]);
  }
  return out;
}

// ── What hero actually holds ──────────────────────────────────────────────

/**
 * Hero's made hand right now, plus how many of the hands still out there beat
 * it. `combosBeating` is the number that matters: "top pair" means nothing
 * until you know whether 3 or 300 combos have you drawing dead-ish.
 */
export function madeHand(hero, board) {
  if (board.length < 3) return null;
  const score = evaluateHand(hero[0], hero[1], board);
  const rest = unseenCards([...hero, ...board]);

  let beating = 0, tying = 0, total = 0;
  let best = score;
  for (const [a, b] of pairsOf(rest)) {
    const s = evaluateHand(a, b, board);
    total++;
    if (s > score) beating++;
    else if (s === score) tying++;
    if (s > best) best = s;
  }
  return {
    score,
    category: categoryOf(score),
    categoryName: CATEGORY_NAMES[categoryOf(score)],
    text: describe(score),
    combosBeating: beating,
    combosTying: tying,
    combosTotal: total,
    /** Share of all remaining hands hero is currently ahead of. */
    absoluteRank: total === 0 ? 1 : (total - beating - tying) / total,
    isNuts: score === best,
    nutText: describe(best),
  };
}

/**
 * Draws hero holds. A draw only counts when hero's own cards make it — a
 * four-flush entirely on the board is everybody's, which is the opposite of an
 * edge.
 */
export function draws(hero, board) {
  if (board.length < 3 || board.length >= 5) {
    return { flushDraw: false, backdoorFlush: false, openEnded: false, gutshot: false, overcards: 0, straightOuts: [] };
  }
  const all = [...hero, ...board];

  const suits = [0, 0, 0, 0];
  for (const c of all) suits[suitOf(c)]++;
  const heroSuits = [0, 0, 0, 0];
  for (const c of hero) heroSuits[suitOf(c)]++;
  let flushDraw = false, backdoorFlush = false;
  for (let s = 0; s < 4; s++) {
    if (heroSuits[s] === 0) continue;
    if (suits[s] === 4) flushDraw = true;
    else if (suits[s] === 3 && board.length === 3) backdoorFlush = true;
  }

  const mask = rankMask(all);
  const boardMask = rankMask(board);
  const straightOuts = [];
  if (!hasStraight(mask)) {
    for (let r = 0; r < 13; r++) {
      if (mask & (1 << r)) continue;
      // Only a draw if hero's cards are part of it: the board alone must not
      // already be one card from a straight everybody shares.
      if (hasStraight(mask | (1 << r)) && !hasStraight(boardMask | (1 << r))) straightOuts.push(r);
    }
  }

  const topBoard = board.reduce((m, c) => Math.max(m, rankOf(c)), -1);
  const overcards = hero.filter((c) => rankOf(c) > topBoard).length;

  return {
    flushDraw,
    backdoorFlush,
    openEnded: straightOuts.length >= 2,
    gutshot: straightOuts.length === 1,
    overcards,
    straightOuts: straightOuts.map((r) => RANK_CHARS[r]),
  };
}

/**
 * Cards that take hero from behind to ahead against a specific range. This is
 * the honest version of counting outs: a nine that pairs you is not an out if
 * the opponent's range is full of nines.
 */
export function outsVsRange(hero, board, villainCombos) {
  if (board.length < 3 || board.length >= 5) return { outs: [], count: 0, aheadNow: null };
  const blocked = new Uint8Array(52);
  for (const c of [...hero, ...board]) blocked[c] = 1;
  const live = villainCombos.filter(([a, b]) => !blocked[a] && !blocked[b]);
  if (live.length === 0) return { outs: [], count: 0, aheadNow: null };

  const aheadShare = (brd) => {
    const mine = evaluateHand(hero[0], hero[1], brd);
    let ahead = 0, n = 0;
    for (const [a, b] of live) {
      // A combo the new card removes is not a hand the opponent can hold, so
      // it leaves the count entirely — dropping it from the numerator alone
      // would quietly understate every out by however much the card blocks.
      if (brd.some((c) => c === a || c === b)) continue;
      n++;
      if (mine > evaluateHand(a, b, brd)) ahead++;
    }
    return n ? ahead / n : 0;
  };

  const aheadNow = aheadShare(board);
  const outs = [];
  if (aheadNow < 0.5) {
    for (let c = 0; c < 52; c++) {
      if (blocked[c]) continue;
      if (aheadShare([...board, c]) > 0.5) outs.push(c);
    }
  }
  return { outs: outs.map(cardToString), count: outs.length, aheadNow };
}

// ── What the board is ─────────────────────────────────────────────────────

/**
 * Texture, measured rather than adjectived. `strongShare` is the fraction of
 * all remaining two-card combinations that already hold two pair or better on
 * this board; `drawShare` the fraction holding a flush draw or open-ender.
 * A board is "wet" when those numbers are big, and now you can say how big.
 */
export function boardTexture(board) {
  if (board.length < 3) return null;

  const suits = [0, 0, 0, 0];
  const counts = new Int32Array(13);
  for (const c of board) { suits[suitOf(c)]++; counts[rankOf(c)]++; }

  const rest = unseenCards(board);
  let strong = 0, drawy = 0, total = 0, best = -1;
  for (const [a, b] of pairsOf(rest)) {
    const s = evaluateHand(a, b, board);
    total++;
    if (categoryOf(s) >= CATEGORY.TWO_PAIR) strong++;
    else {
      const d = draws([a, b], board);
      if (d.flushDraw || d.openEnded) drawy++;
    }
    if (s > best) best = s;
  }

  const paired = counts.some((n) => n >= 2);
  const maxSuit = Math.max(...suits);
  const highCard = board.reduce((m, c) => Math.max(m, rankOf(c)), -1);

  return {
    paired,
    trips: counts.some((n) => n >= 3),
    monotone: maxSuit >= 3 && board.length === 3,
    twoTone: maxSuit === 2,
    rainbow: maxSuit === 1,
    flushPossible: maxSuit >= 3,
    flushDrawPossible: maxSuit >= 2 && board.length < 5,
    highCard: RANK_CHARS[highCard],
    strongShare: total ? strong / total : 0,
    drawShare: total ? drawy / total : 0,
    /** 0 = dry as a bone, 1 = everybody has something. */
    wetness: total ? Math.min(1, (strong + 0.6 * drawy) / total * 2.4) : 0,
    nutText: describe(best),
  };
}

// ── Range shape on this board ─────────────────────────────────────────────

/**
 * How a range connects with a board: what share of it holds a strong made
 * hand, a draw, or nothing. Two ranges of identical raw equity can play
 * completely differently once you know the shape.
 */
export function rangeShape(combos, board) {
  if (board.length < 3) return null;
  const blocked = new Uint8Array(52);
  for (const c of board) blocked[c] = 1;

  let nutted = 0, strong = 0, marginal = 0, drawing = 0, air = 0, n = 0;
  const nutFloor = CATEGORY.STRAIGHT * 1048576;
  for (const [a, b] of combos) {
    if (blocked[a] || blocked[b]) continue;
    n++;
    const s = evaluateHand(a, b, board);
    const cat = categoryOf(s);
    if (s >= nutFloor) nutted++;
    else if (cat >= CATEGORY.TWO_PAIR) strong++;
    else if (cat >= CATEGORY.PAIR) marginal++;
    else {
      const d = draws([a, b], board);
      if (d.flushDraw || d.openEnded || d.gutshot) drawing++;
      else air++;
    }
  }
  const div = n || 1;
  return {
    combos: n,
    nutted: nutted / div,
    strong: strong / div,
    marginal: marginal / div,
    drawing: drawing / div,
    air: air / div,
  };
}

/**
 * How much of the opponent's strong holdings hero's own two cards remove.
 * Blockers are the difference between a bluff that gets through and one that
 * runs into the hand it was representing.
 */
export function blockerEffect(hero, board, villainCombos) {
  if (board.length < 3) {
    // Preflop the useful blockers are ace and king removal: they cut the
    // opponent's premium holdings without needing a board at all.
    const held = new Set(hero.map(rankOf));
    let blocked = 0, totalTop = 0;
    for (const [a, b] of villainCombos) {
      const top = rankOf(a) >= 10 || rankOf(b) >= 10; // Q, K, A
      if (!top) continue;
      totalTop++;
      if (held.has(rankOf(a)) || held.has(rankOf(b))) blocked++;
    }
    return { valueCombos: totalTop, blocked, share: totalTop ? blocked / totalTop : 0, street: 'preflop' };
  }

  const boardSet = new Set(board);
  const strongFloor = CATEGORY.TWO_PAIR * 1048576;
  let valueCombos = 0, blocked = 0;
  const heroSet = new Set(hero);
  for (const [a, b] of villainCombos) {
    if (boardSet.has(a) || boardSet.has(b)) continue;
    if (evaluateHand(a, b, board) < strongFloor) continue;
    valueCombos++;
    if (heroSet.has(a) || heroSet.has(b)) blocked++;
  }
  return { valueCombos, blocked, share: valueCombos ? blocked / valueCombos : 0, street: 'postflop' };
}

export const STREET_NAMES = ['preflop', 'flop', 'turn', 'river'];
export const streetOf = (board) => (board.length >= 5 ? 3 : board.length >= 4 ? 2 : board.length >= 3 ? 1 : 0);

/**
 * The strongest `fraction` of a range on this board — what is left after the
 * rest folds. Preflop there is no board, so hands are ordered by all-in
 * strength instead.
 */
export function topOfRange(combos, board, fraction) {
  const f = Math.max(0, Math.min(1, fraction));
  if (f >= 1) return combos.slice();
  const blocked = new Uint8Array(52);
  for (const c of board) blocked[c] = 1;
  const live = combos.filter(([a, b]) => !blocked[a] && !blocked[b]);
  const keyed = live.map((combo) => ({
    combo,
    key: board.length >= 3
      ? evaluateHand(combo[0], combo[1], board)
      : PREFLOP_ORDER[classOfPair(combo[0], combo[1])],
  }));
  keyed.sort((x, y) => y.key - x.key);
  return keyed.slice(0, Math.max(1, Math.round(keyed.length * f))).map((k) => k.combo);
}
