// Range notation parser.
//
// Accepts the notation people actually type at a table or in a forum post:
//
//   AA, AKs, AKo, AK            class tokens (bare "AK" = suited + offsuit)
//   77+, A2s+, KTo+             open-ended runs
//   77-TT, A2s-A5s, T9s-65s     closed runs (pairs, same ace/king, same gap)
//   AhKd, AsAc                  exact combos
//   top 15%, 15%                strongest N% by all-in equity vs a random hand
//   random, any, all            all 1326 combos
//   AA:0.5                      partial weight on any token above
//
// Tokens are separated by commas or whitespace. Output is a weighted combo
// list, which is what the equity engine consumes.

import { RANK_CHARS, makeCard, parseCards, classOf, combosOfClass, classCombos, classLabel, ALL_CLASS_IDS } from './cards.js';
import { EQUITY_VS_RANDOM } from '../data/preflop.js';

const rankIndex = (ch) => RANK_CHARS.indexOf(ch.toUpperCase());

/** Class ids sorted strongest-first by heads-up all-in equity vs a random hand. */
export const CLASS_STRENGTH_ORDER = ALL_CLASS_IDS
  .slice()
  .sort((a, b) => EQUITY_VS_RANDOM[b] - EQUITY_VS_RANDOM[a]);

function classId(hi, lo, suitedness) {
  const a = makeCard(hi, 0);
  const b = suitedness === 's' ? makeCard(lo, 0) : makeCard(lo, 1);
  if (hi === lo) return classOf(makeCard(hi, 0), makeCard(hi, 1));
  return classOf(a, b);
}

function classesForToken(token) {
  const t = token.trim();
  if (t === '') return [];

  const lower = t.toLowerCase();
  if (lower === 'random' || lower === 'any' || lower === 'all') return ALL_CLASS_IDS.slice();

  const pct = lower.match(/^(?:top\s*)?(\d+(?:\.\d+)?)\s*%$/);
  if (pct) return topPercentClasses(parseFloat(pct[1]));

  const closed = t.match(/^([2-9TJQKA])([2-9TJQKA])([so]?)\s*-\s*([2-9TJQKA])([2-9TJQKA])([so]?)$/i);
  if (closed) return closedRun(closed);

  const open = t.match(/^([2-9TJQKA])([2-9TJQKA])([so]?)\+$/i);
  if (open) return openRun(open);

  const plain = t.match(/^([2-9TJQKA])([2-9TJQKA])([so]?)$/i);
  if (plain) {
    const hi = Math.max(rankIndex(plain[1]), rankIndex(plain[2]));
    const lo = Math.min(rankIndex(plain[1]), rankIndex(plain[2]));
    const suitedness = plain[3].toLowerCase();
    if (hi === lo) return [classId(hi, lo, '')];
    if (suitedness) return [classId(hi, lo, suitedness)];
    return [classId(hi, lo, 's'), classId(hi, lo, 'o')];
  }
  return null; // caller falls back to explicit-combo parsing
}

function openRun(m) {
  const hi = Math.max(rankIndex(m[1]), rankIndex(m[2]));
  const lo = Math.min(rankIndex(m[1]), rankIndex(m[2]));
  const suitedness = m[3].toLowerCase();
  const out = [];
  if (hi === lo) {
    for (let r = hi; r <= 12; r++) out.push(classId(r, r, ''));
    return out;
  }
  // Non-pair: hold the high card, walk the kicker up to one below it.
  for (let k = lo; k < hi; k++) {
    if (suitedness) out.push(classId(hi, k, suitedness));
    else out.push(classId(hi, k, 's'), classId(hi, k, 'o'));
  }
  return out;
}

function closedRun(m) {
  const hi1 = Math.max(rankIndex(m[1]), rankIndex(m[2]));
  const lo1 = Math.min(rankIndex(m[1]), rankIndex(m[2]));
  const hi2 = Math.max(rankIndex(m[4]), rankIndex(m[5]));
  const lo2 = Math.min(rankIndex(m[4]), rankIndex(m[5]));
  const suitedness = (m[3] || m[6]).toLowerCase();
  const push = (h, l, out) => {
    if (h === l) out.push(classId(h, h, ''));
    else if (suitedness) out.push(classId(h, l, suitedness));
    else out.push(classId(h, l, 's'), classId(h, l, 'o'));
  };
  const out = [];

  if (hi1 === lo1 && hi2 === lo2) {
    for (let r = Math.min(hi1, hi2); r <= Math.max(hi1, hi2); r++) push(r, r, out);
    return out;
  }
  if (hi1 === hi2) {
    // Same high card: A5s-A2s.
    for (let k = Math.min(lo1, lo2); k <= Math.max(lo1, lo2); k++) push(hi1, k, out);
    return out;
  }
  if (hi1 - lo1 === hi2 - lo2) {
    // Same gap: T9s-65s walks both cards down together.
    const from = Math.min(hi1, hi2);
    const to = Math.max(hi1, hi2);
    const gap = hi1 - lo1;
    for (let h = from; h <= to; h++) push(h, h - gap, out);
    return out;
  }
  throw new Error(`cannot interpret run "${m[0]}"`);
}

export function topPercentClasses(percent) {
  const target = (Math.max(0, Math.min(100, percent)) / 100) * 1326;
  const out = [];
  let combos = 0;
  for (const id of CLASS_STRENGTH_ORDER) {
    if (combos >= target) break;
    out.push(id);
    combos += classCombos(id);
  }
  return out;
}

/**
 * Parse a range string.
 * @returns {{combos: Array<[number,number]>, weights: Float64Array, classes: Set<number>}}
 */
export function parseRange(text, { dead = [] } = {}) {
  const blocked = new Uint8Array(52);
  for (const c of dead) blocked[c] = 1;

  const weightByCombo = new Map(); // key a*52+b (a<b) -> weight
  const classes = new Set();

  const tokens = String(text).split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  // "top 15%" arrives as two tokens; stitch it back together.
  const merged = [];
  for (let i = 0; i < tokens.length; i++) {
    if (/^top$/i.test(tokens[i]) && i + 1 < tokens.length) merged.push(`top ${tokens[++i]}`);
    else merged.push(tokens[i]);
  }

  for (const raw of merged) {
    let weight = 1;
    let token = raw;
    const wm = token.match(/^(.*?):(\d*\.?\d+)$/);
    if (wm) { token = wm[1]; weight = parseFloat(wm[2]); }
    if (token === '') continue;

    const ids = classesForToken(token);
    if (ids && ids.length) {
      for (const id of ids) {
        classes.add(id);
        for (const [a, b] of combosOfClass(id)) {
          if (blocked[a] || blocked[b]) continue;
          const lo = Math.min(a, b), hi = Math.max(a, b);
          weightByCombo.set(lo * 52 + hi, weight);
        }
      }
      continue;
    }

    // Explicit combo(s), e.g. "AhKd".
    const cards = parseCards(token);
    if (cards.length !== 2) throw new Error(`cannot parse range token "${raw}"`);
    const [a, b] = cards;
    if (blocked[a] || blocked[b]) continue;
    const lo = Math.min(a, b), hi = Math.max(a, b);
    weightByCombo.set(lo * 52 + hi, weight);
    classes.add(classOf(a, b));
  }

  const combos = [];
  const weights = [];
  for (const [key, w] of weightByCombo) {
    if (w <= 0) continue;
    combos.push([(key / 52) | 0, key % 52]);
    weights.push(w);
  }
  return { combos, weights: Float64Array.from(weights), classes };
}

/** Total combos in a parsed range, and that as a share of all 1326. */
export function rangeSummary(range) {
  const total = range.weights.reduce((a, b) => a + b, 0);
  return { combos: total, percent: (total / 1326) * 100 };
}

/** Compact notation for a set of class ids, collapsing runs the way a human would write them. */
export function formatClasses(classIds) {
  const present = new Set(classIds);
  const labels = [];
  for (const id of ALL_CLASS_IDS) if (present.has(id)) labels.push(classLabel(id));
  return labels.join(', ');
}
