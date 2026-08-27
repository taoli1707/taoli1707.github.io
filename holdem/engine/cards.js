// Card encoding.
//
// A card is an integer 0..51 with  card = rank * 4 + suit.
//   rank 0..12 -> 2 3 4 5 6 7 8 9 T J Q K A
//   suit 0..3  -> c d h s
// Integer cards keep the evaluator allocation-free, which is the whole game
// when you are doing hundreds of millions of showdowns.

export const RANK_CHARS = '23456789TJQKA';
export const SUIT_CHARS = 'cdhs';
export const SUIT_SYMBOLS = ['♣', '♦', '♥', '♠']; // c d h s

export const rankOf = (card) => card >> 2;
export const suitOf = (card) => card & 3;
export const makeCard = (rank, suit) => (rank << 2) | suit;

export function cardToString(card) {
  return RANK_CHARS[rankOf(card)] + SUIT_CHARS[suitOf(card)];
}

export function cardsToString(cards) {
  return Array.from(cards, cardToString).join(' ');
}

export function parseCard(text) {
  const s = String(text).trim();
  if (s.length !== 2) throw new Error(`bad card: "${text}"`);
  const rank = RANK_CHARS.indexOf(s[0].toUpperCase());
  const suit = SUIT_CHARS.indexOf(s[1].toLowerCase());
  if (rank < 0 || suit < 0) throw new Error(`bad card: "${text}"`);
  return makeCard(rank, suit);
}

/** Parse "AhKd 7c" or "AhKd7c" into an array of card ids. Rejects duplicates. */
export function parseCards(text) {
  const compact = String(text).replace(/[\s,]+/g, '');
  if (compact === '') return [];
  if (compact.length % 2 !== 0) throw new Error(`bad card list: "${text}"`);
  const out = [];
  const seen = new Set();
  for (let i = 0; i < compact.length; i += 2) {
    const card = parseCard(compact.slice(i, i + 2));
    if (seen.has(card)) throw new Error(`duplicate card: ${cardToString(card)}`);
    seen.add(card);
    out.push(card);
  }
  return out;
}

export function fullDeck() {
  const deck = new Int8Array(52);
  for (let i = 0; i < 52; i++) deck[i] = i;
  return deck;
}

/** A deck with `dead` removed, as an Int8Array. */
export function deckWithout(dead) {
  const blocked = new Uint8Array(52);
  for (const c of dead) blocked[c] = 1;
  const out = new Int8Array(52 - dead.length);
  let n = 0;
  for (let c = 0; c < 52; c++) if (!blocked[c]) out[n++] = c;
  return out.subarray(0, n);
}

// ---------------------------------------------------------------------------
// The 169 preflop hand classes: 13 pairs, 78 suited, 78 offsuit.
// Index layout matches the classic 13x13 grid read row-major from AA:
//   row = higher rank, col = lower rank; suited above the diagonal.
// ---------------------------------------------------------------------------

/** Grid coordinates: row 0 = aces .. row 12 = deuces. */
export const gridIndex = (row, col) => row * 13 + col;

/** Class id 0..168 from grid coordinates. */
export const classFromGrid = gridIndex;

export function classLabel(id) {
  const row = (id / 13) | 0;
  const col = id % 13;
  const hi = RANK_CHARS[12 - Math.min(row, col)];
  const lo = RANK_CHARS[12 - Math.max(row, col)];
  if (row === col) return hi + lo;
  return hi + lo + (col > row ? 's' : 'o');
}

/** Class id for a two-card hand. */
export function classOf(a, b) {
  const ra = rankOf(a);
  const rb = rankOf(b);
  const hi = Math.max(ra, rb);
  const lo = Math.min(ra, rb);
  const hiRow = 12 - hi;
  const loRow = 12 - lo;
  if (ra === rb) return gridIndex(hiRow, hiRow);
  const suited = suitOf(a) === suitOf(b);
  return suited ? gridIndex(hiRow, loRow) : gridIndex(loRow, hiRow);
}

/** Number of distinct 2-card combos in a class: 6 pairs, 4 suited, 12 offsuit. */
export function classCombos(id) {
  const row = (id / 13) | 0;
  const col = id % 13;
  if (row === col) return 6;
  return col > row ? 4 : 12;
}

/** Every combo (as [a,b] pairs) belonging to a class. */
export function combosOfClass(id) {
  const row = (id / 13) | 0;
  const col = id % 13;
  const hi = 12 - Math.min(row, col);
  const lo = 12 - Math.max(row, col);
  const out = [];
  if (row === col) {
    for (let s1 = 0; s1 < 4; s1++)
      for (let s2 = s1 + 1; s2 < 4; s2++) out.push([makeCard(hi, s1), makeCard(hi, s2)]);
  } else if (col > row) {
    for (let s = 0; s < 4; s++) out.push([makeCard(hi, s), makeCard(lo, s)]);
  } else {
    for (let s1 = 0; s1 < 4; s1++)
      for (let s2 = 0; s2 < 4; s2++) if (s1 !== s2) out.push([makeCard(hi, s1), makeCard(lo, s2)]);
  }
  return out;
}

/** All 1326 starting combos. */
export function allCombos() {
  const out = [];
  for (let a = 0; a < 52; a++) for (let b = a + 1; b < 52; b++) out.push([a, b]);
  return out;
}

export const ALL_CLASS_IDS = Array.from({ length: 169 }, (_, i) => i);
