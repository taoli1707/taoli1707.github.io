// Deterministic RNG. Seeded so every simulation, match and solve is reproducible:
// a result you cannot reproduce is a result you cannot debug.

/** mulberry32 — small, fast, good enough equidistribution for Monte Carlo. */
export function makeRng(seed = 1) {
  let a = seed >>> 0;
  if (a === 0) a = 0x9e3779b9;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform integer in [0, n). */
export function randInt(rng, n) {
  return (rng() * n) | 0;
}

/**
 * Partial Fisher-Yates: shuffles only the first `count` slots of `deck`
 * (an Int8Array/array of card ids). O(count) instead of O(52) per deal.
 */
export function partialShuffle(deck, count, rng) {
  const n = deck.length;
  for (let i = 0; i < count; i++) {
    const j = i + ((rng() * (n - i)) | 0);
    const t = deck[i];
    deck[i] = deck[j];
    deck[j] = t;
  }
}
