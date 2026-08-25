// Exact hand evaluator for 5, 6 or 7 cards.
//
// Returns a single integer score; higher is strictly better, and two hands are
// tied if and only if their scores are equal. Layout, base 16 so it stays in
// int32 range and comparisons are one machine op:
//
//   category * 16^5 + k1 * 16^4 + k2 * 16^3 + k3 * 16^2 + k4 * 16 + k5
//
// No allocation anywhere on the hot path: scratch buffers live at module scope,
// which is what makes ~10^9 showdowns tractable.

export const CATEGORY = {
  HIGH_CARD: 0,
  PAIR: 1,
  TWO_PAIR: 2,
  TRIPS: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  QUADS: 7,
  STRAIGHT_FLUSH: 8,
};

export const CATEGORY_NAMES = [
  'High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight',
  'Flush', 'Full house', 'Four of a kind', 'Straight flush',
];

const rankCount = new Int32Array(13);
const suitCount = new Int32Array(4);
const suitMask = new Int32Array(4);

const score = (cat, k1 = 0, k2 = 0, k3 = 0, k4 = 0, k5 = 0) =>
  cat * 1048576 + k1 * 65536 + k2 * 4096 + k3 * 256 + k4 * 16 + k5;

export const categoryOf = (s) => (s / 1048576) | 0;

/**
 * Highest card rank of a straight inside a 13-bit rank mask, or -1.
 * Bit 12 is an ace; the ace is duplicated below the deuce so the wheel
 * (A-2-3-4-5) falls out of the same shift-and test.
 */
function straightTop(bits) {
  const b = ((bits << 1) | ((bits >> 12) & 1)) >>> 0;
  const s = b & (b >> 1) & (b >> 2) & (b >> 3) & (b >> 4);
  if (s === 0) return -1;
  return (31 - Math.clz32(s)) + 3;
}

/**
 * @param {ArrayLike<number>} cards card ids
 * @param {number} n how many of `cards` to read (default: all)
 */
export function evaluate(cards, n = cards.length) {
  rankCount.fill(0);
  suitCount.fill(0);
  suitMask.fill(0);
  let rankBits = 0;

  for (let i = 0; i < n; i++) {
    const c = cards[i];
    const r = c >> 2;
    const s = c & 3;
    rankCount[r]++;
    suitCount[s]++;
    suitMask[s] |= 1 << r;
    rankBits |= 1 << r;
  }

  // Flush first. With 7 cards a flush cannot coexist with quads or a full
  // house (that would need 8 cards), so an early return here is safe.
  for (let s = 0; s < 4; s++) {
    if (suitCount[s] >= 5) {
      const mask = suitMask[s];
      const sf = straightTop(mask);
      if (sf >= 0) return score(CATEGORY.STRAIGHT_FLUSH, sf);
      let k1 = -1, k2 = -1, k3 = -1, k4 = -1, k5 = -1;
      for (let r = 12; r >= 0; r--) {
        if (((mask >> r) & 1) === 0) continue;
        if (k1 < 0) k1 = r; else if (k2 < 0) k2 = r; else if (k3 < 0) k3 = r;
        else if (k4 < 0) k4 = r; else { k5 = r; break; }
      }
      return score(CATEGORY.FLUSH, k1, k2, k3, k4, k5);
    }
  }

  let quad = -1, trip1 = -1, trip2 = -1, pair1 = -1, pair2 = -1;
  for (let r = 12; r >= 0; r--) {
    const c = rankCount[r];
    if (c === 4) { if (quad < 0) quad = r; }
    else if (c === 3) { if (trip1 < 0) trip1 = r; else if (trip2 < 0) trip2 = r; }
    else if (c === 2) { if (pair1 < 0) pair1 = r; else if (pair2 < 0) pair2 = r; }
  }

  if (quad >= 0) {
    let k = 0;
    for (let r = 12; r >= 0; r--) if (r !== quad && rankCount[r] > 0) { k = r; break; }
    return score(CATEGORY.QUADS, quad, k);
  }

  // Two trips: the lower one plays as the pair.
  if (trip1 >= 0 && (trip2 >= 0 || pair1 >= 0)) {
    // Absent ranks are -1, and at least one of the two is set here.
    return score(CATEGORY.FULL_HOUSE, trip1, Math.max(trip2, pair1));
  }

  const st = straightTop(rankBits);
  if (st >= 0) return score(CATEGORY.STRAIGHT, st);

  if (trip1 >= 0) {
    let k1 = 0, k2 = 0, got = 0;
    for (let r = 12; r >= 0 && got < 2; r--) {
      if (rankCount[r] !== 1) continue;
      if (got === 0) k1 = r; else k2 = r;
      got++;
    }
    return score(CATEGORY.TRIPS, trip1, k1, k2);
  }

  if (pair2 >= 0) {
    let k = 0;
    for (let r = 12; r >= 0; r--) {
      if (r !== pair1 && r !== pair2 && rankCount[r] > 0) { k = r; break; }
    }
    return score(CATEGORY.TWO_PAIR, pair1, pair2, k);
  }

  if (pair1 >= 0) {
    let k1 = 0, k2 = 0, k3 = 0, got = 0;
    for (let r = 12; r >= 0 && got < 3; r--) {
      if (rankCount[r] !== 1) continue;
      if (got === 0) k1 = r; else if (got === 1) k2 = r; else k3 = r;
      got++;
    }
    return score(CATEGORY.PAIR, pair1, k1, k2, k3);
  }

  let k1 = 0, k2 = 0, k3 = 0, k4 = 0, k5 = 0, got = 0;
  for (let r = 12; r >= 0 && got < 5; r--) {
    if (rankCount[r] !== 1) continue;
    if (got === 0) k1 = r; else if (got === 1) k2 = r; else if (got === 2) k3 = r;
    else if (got === 3) k4 = r; else k5 = r;
    got++;
  }
  return score(CATEGORY.HIGH_CARD, k1, k2, k3, k4, k5);
}

const board7 = new Int32Array(7);

/** Convenience: score two hole cards against a 3-5 card board. */
export function evaluateHand(holeA, holeB, board) {
  board7[0] = holeA;
  board7[1] = holeB;
  const n = board.length;
  for (let i = 0; i < n; i++) board7[2 + i] = board[i];
  return evaluate(board7, n + 2);
}

/** Human-readable description, e.g. "Full house, kings full of nines". */
export function describe(scoreValue) {
  const cat = categoryOf(scoreValue);
  const k = [];
  let rest = scoreValue % 1048576;
  for (let i = 4; i >= 0; i--) {
    const div = 16 ** i;
    k.push((rest / div) | 0);
    rest %= div;
  }
  const R = '23456789TJQKA';
  const N = ['deuce', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'jack', 'queen', 'king', 'ace'];
  const P = ['deuces', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights',
    'nines', 'tens', 'jacks', 'queens', 'kings', 'aces'];
  switch (cat) {
    case CATEGORY.STRAIGHT_FLUSH:
      return k[0] === 12 ? 'Royal flush' : `Straight flush, ${N[k[0]]} high`;
    case CATEGORY.QUADS: return `Four of a kind, ${P[k[0]]}`;
    case CATEGORY.FULL_HOUSE: return `Full house, ${P[k[0]]} full of ${P[k[1]]}`;
    case CATEGORY.FLUSH: return `Flush, ${N[k[0]]} high`;
    case CATEGORY.STRAIGHT: return `Straight, ${N[k[0]]} high`;
    case CATEGORY.TRIPS: return `Three of a kind, ${P[k[0]]}`;
    case CATEGORY.TWO_PAIR: return `Two pair, ${P[k[0]]} and ${P[k[1]]}`;
    case CATEGORY.PAIR: return `Pair of ${P[k[0]]}, ${R[k[1]]} kicker`;
    default: return `${N[k[0]][0].toUpperCase()}${N[k[0]].slice(1)} high`;
  }
}
