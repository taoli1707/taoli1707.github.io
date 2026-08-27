// Derived preflop tables.
//
// Everything here is computed at load time from the generated equity matrix in
// preflop-equity.js. It costs a couple of milliseconds and keeps the shipped
// data file to a single source of truth.

import { EQUITY } from './preflop-equity.js';
import { combosOfClass, classCombos } from '../engine/cards.js';

export { EQUITY, PREFLOP_SAMPLES } from './preflop-equity.js';

const CLASSES = 169;
const COMBOS = Array.from({ length: CLASSES }, (_, i) => combosOfClass(i));

/**
 * PAIR_COUNTS[i * 169 + j] = how many ways two players can hold class i and
 * class j simultaneously. This is exact card removal: it is why AA blocks AA
 * (30 pairings, not 36) and why AKs blocks AKs down to 12.
 */
export const PAIR_COUNTS = (() => {
  const m = new Int32Array(CLASSES * CLASSES);
  for (let i = 0; i < CLASSES; i++) {
    for (let j = i; j < CLASSES; j++) {
      let n = 0;
      for (const a of COMBOS[i]) {
        for (const b of COMBOS[j]) {
          if (a[0] === b[0] || a[0] === b[1] || a[1] === b[0] || a[1] === b[1]) continue;
          n++;
        }
      }
      m[i * CLASSES + j] = n;
      m[j * CLASSES + i] = n;
    }
  }
  return m;
})();

/** Prior probability of being dealt each class, ignoring card removal. */
export const CLASS_PRIOR = (() => {
  const p = new Float64Array(CLASSES);
  for (let i = 0; i < CLASSES; i++) p[i] = classCombos(i) / 1326;
  return p;
})();

/**
 * All-in equity of each class against one uniformly random opponent hand,
 * with card removal applied. This is the honest strength ordering that
 * "top 15%" and the preflop hand ranking read from.
 */
export const EQUITY_VS_RANDOM = (() => {
  const out = new Float64Array(CLASSES);
  for (let i = 0; i < CLASSES; i++) {
    let num = 0;
    let den = 0;
    for (let j = 0; j < CLASSES; j++) {
      const w = PAIR_COUNTS[i * CLASSES + j];
      if (w === 0) continue;
      num += w * EQUITY[i * CLASSES + j];
      den += w;
    }
    out[i] = num / den;
  }
  return out;
})();

/** 1 = strongest of the 169 classes. */
export const CLASS_RANK = (() => {
  const order = Array.from({ length: CLASSES }, (_, i) => i)
    .sort((a, b) => EQUITY_VS_RANDOM[b] - EQUITY_VS_RANDOM[a]);
  const rank = new Int32Array(CLASSES);
  order.forEach((id, i) => { rank[id] = i + 1; });
  return rank;
})();
