// council.js — a multi-agent system for "what should I do with this hand?"
//
// One agent that tries to answer that question end to end has to collapse
// everything it knows into a single number, and the moment it does, you can no
// longer see *why* it wants to fold. So this is eight specialists instead, each
// with one lens, each arguing only from numbers computed in spot.js, plus a
// ninth agent whose entire job is to attack whatever the other eight decided.
//
//   solver     the sub-game that is actually solved (short-stack jam/fold)
//   equity     how often this hand wins against that range
//   price      pot odds, implied odds, minimum defence frequency
//   forensics  what the opponent's bet size says about the opponent's range
//   texture    the board, hero's place on it, and what the turn can do to it
//   ranges     range vs range: who is favoured, who holds the nuts
//   blockers   which of the opponent's hands hero's own cards remove
//   exploit    the EV of betting, given a concrete read on this opponent
//   adversary  the critic; re-runs the decision under assumptions it prefers
//
// Specialists do not return an action. They return a *distribution* over the
// legal actions, and a confidence in it. The chair adds those up weighted by
// confidence and by how much authority the lens has in this particular spot —
// the solver's word is close to final at 8bb and worth nothing at 100bb.
//
// The pooled distribution measures how much the lenses agree. It is not an
// equilibrium frequency and must not be played as one: sampling actions from it
// costs about 250 bb/100 against the engine's own equity bot. A close vote is a
// flag that the answer turns on the read, not an instruction to randomise.

import { classOf, classLabel, cardsToString, combosOfClass } from './cards.js';
import { evaluateHand } from './evaluator.js';
import { equity as equityOf } from './equity.js';
import { parseRange, topPercentClasses } from './range.js';
import { pushFoldChart } from './pushfold.js';
import { EQUITY_VS_RANDOM } from '../data/preflop.js';
import {
  requiredEquity, minDefenceFrequency, spr,
  madeHand, draws, boardTexture, rangeShape, blockerEffect, outsVsRange,
  topOfRange, streetOf, STREET_NAMES,
} from './spot.js';

// ── Actions ───────────────────────────────────────────────────────────────

export const ACTIONS = ['fold', 'check', 'call', 'bet', 'raise', 'jam'];
const AGGRESSIVE = new Set(['bet', 'raise', 'jam']);

// ── Opponent profiles ─────────────────────────────────────────────────────
//
// foldToBet is the number that does most of the work: it is the single stat
// that decides whether bluffing is a business or a donation.

export const PROFILES = {
  balanced: { key: 'balanced', name: 'Solid regular', foldToBet: 0.45, aggression: 1.0, defaultRange: 'top 30%',
    note: 'Bets and folds at roughly the frequencies the maths asks for.' },
  station: { key: 'station', name: 'Calling station', foldToBet: 0.08, aggression: 0.35, defaultRange: 'top 62%',
    note: 'Almost never folds. Value bet thin, never bluff.' },
  nit: { key: 'nit', name: 'Nit', foldToBet: 0.74, aggression: 0.7, defaultRange: 'top 12%',
    note: 'Folds far too much, but the hands they keep are real.' },
  maniac: { key: 'maniac', name: 'Maniac', foldToBet: 0.24, aggression: 2.2, defaultRange: 'top 58%',
    note: 'Bets everything. Let them bluff into you, then call wider.' },
  unknown: { key: 'unknown', name: 'Unknown', foldToBet: 0.40, aggression: 1.0, defaultRange: 'top 35%',
    note: 'No read yet: assume something close to balanced and stay cheap.' },
};

// ── Small maths helpers ───────────────────────────────────────────────────

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Smooth 0..1 ramp: 0.5 at x=0, saturating over roughly ±2k. */
const ramp = (x, k) => clamp01(0.5 + x / (2 * k));
const round = (x, n = 3) => Number(x.toFixed(n));

function normalise(votes, options) {
  const out = {};
  let sum = 0;
  for (const a of options) { const v = Math.max(0, votes[a] || 0); out[a] = v; sum += v; }
  if (sum <= 0) { for (const a of options) out[a] = 1 / options.length; return out; }
  for (const a of options) out[a] /= sum;
  return out;
}

function softmax(entries, temperature) {
  const max = Math.max(...entries.map((e) => e.ev));
  const out = {};
  let sum = 0;
  for (const e of entries) { const w = Math.exp((e.ev - max) / temperature); out[e.action] = w; sum += w; }
  for (const k of Object.keys(out)) out[k] /= sum;
  return out;
}

// ── Context: everything the specialists share ─────────────────────────────

function rangeFor(spot, profile) {
  if (spot.villainCombos && spot.villainCombos.length) {
    return {
      text: spot.villainLabel || 'custom range',
      combos: spot.villainCombos,
      weights: Float64Array.from(spot.villainCombos, () => 1),
      classes: new Set(spot.villainCombos.map(([a, b]) => classOf(a, b))),
    };
  }
  const raw = (spot.villainRange && String(spot.villainRange).trim()) || PROFILES[profile].defaultRange;
  return { text: raw, ...parseRange(raw) };
}

/** Every combo in the strongest `percent` of all starting hands. */
export function topPercentCombos(percent) {
  const out = [];
  for (const id of topPercentClasses(percent)) out.push(...combosOfClass(id));
  return out;
}

/**
 * @param {object} spot
 * @param {number[]} spot.hero            two card ids
 * @param {number[]} [spot.board]         0, 3, 4 or 5 card ids
 * @param {number}   [spot.potBb]         pot including any bet hero faces
 * @param {number}   [spot.toCallBb]      0 when hero is first to act
 * @param {number}   [spot.effectiveBb]   the shorter of the two stacks
 * @param {'ip'|'oop'} [spot.position]
 * @param {string}   [spot.villainRange]
 * @param {string}   [spot.heroRange]     hero's whole range, for range-vs-range
 * @param {keyof PROFILES} [spot.profile]
 */
export function buildContext(spot, opts = {}) {
  const { iters = 8000, seed = 7, exactLimit = 400_000 } = opts;
  const hero = spot.hero;
  const board = spot.board || [];
  const profileKey = spot.profile && PROFILES[spot.profile] ? spot.profile : 'unknown';
  const profile = PROFILES[profileKey];

  const pot = Math.max(0.01, spot.potBb ?? 1.5);
  const toCall = Math.max(0, spot.toCallBb ?? 0);
  const effective = Math.max(0, spot.effectiveBb ?? 100);
  const street = streetOf(board);

  const villain = rangeFor(spot, profileKey);
  const heroRangeText = (spot.heroRange && String(spot.heroRange).trim())
    || (spot.position === 'ip' ? 'top 38%' : 'top 24%');
  const heroRange = { text: heroRangeText, ...parseRange(heroRangeText) };

  // At short stacks preflop the hand really is jam-or-fold: limping into a
  // 10bb pot leaves a stack that cannot fold and cannot pressure anybody, and
  // it is the one branch the solver does not model. Facing a jam the tree is
  // narrower still — call or fold, there is nothing left to raise with.
  const facingAllIn = toCall > 0 && toCall >= effective * 0.8;
  const jamFold = street === 0 && effective <= 25 && pot <= 3.5 && !facingAllIn;

  const options = [];
  if (facingAllIn) options.push('fold', 'call');
  else if (jamFold) options.push('fold', 'jam');
  else if (toCall > 0) {
    options.push('fold', 'call');
    if (effective > toCall) options.push('raise');
  } else {
    options.push('check');
    if (effective > 0) options.push('bet');
  }

  const heroSingle = { combos: [[hero[0], hero[1]]], weights: Float64Array.of(1) };
  const eqResult = equityOf({
    ranges: [heroSingle, { combos: villain.combos, weights: villain.weights }],
    board, iters, seed, exactLimit,
  });

  const ctx = {
    spot, hero, board, street, streetName: STREET_NAMES[street],
    pot, toCall, effective, options,
    position: spot.position === 'ip' ? 'ip' : 'oop',
    profileKey, profile,
    villain, heroRange,
    iters, seed, exactLimit,
    heroEquity: eqResult.equity[0],
    heroEquityError: eqResult.stdError * 1.96,
    heroEquityExact: eqResult.exact,
    classId: classOf(hero[0], hero[1]),
    made: madeHand(hero, board),
    draw: draws(hero, board),
    texture: boardTexture(board),
    villainShape: rangeShape(villain.combos, board),
    heroShape: rangeShape(heroRange.combos, board),
    blockers: blockerEffect(hero, board, villain.combos),
    need: requiredEquity(pot, toCall),
    mdf: toCall > 0 ? minDefenceFrequency(pot - toCall, toCall) : 1,
    spr: spr(effective, pot),
  };
  ctx.label = classLabel(ctx.classId);
  ctx.heroText = cardsToString(hero);
  ctx.boardText = board.length ? cardsToString(board) : '(preflop)';
  return ctx;
}

// ── The specialists ───────────────────────────────────────────────────────
//
// authority(ctx) is how much this lens is worth *here*, before the agent's own
// confidence in what it found. Zero means the agent stays out of it.

const SOLVER = {
  id: 'solver', name: 'Solver', lens: 'The one sub-game with an exact answer',
  authority: (ctx) => (ctx.street === 0 && ctx.effective <= 25 && ctx.pot <= 3.5 ? 3.0 : 0),
  analyze(ctx) {
    const chart = pushFoldChart(Math.max(1, Math.min(25, ctx.effective)));
    const facingJam = ctx.toCall >= ctx.effective * 0.8;
    const freq = facingJam ? chart.call[ctx.classId] : chart.shove[ctx.classId];
    const votes = facingJam
      ? { call: freq, fold: 1 - freq }
      : { jam: freq, fold: 1 - freq };
    const pure = freq > 0.99 || freq < 0.01;
    return {
      votes,
      confidence: pure ? 1 : 0.85,
      headline: facingJam
        ? (freq > 0.5 ? `Call the jam — ${ctx.label} is inside the Nash calling range` : `Fold — ${ctx.label} is outside the Nash calling range`)
        : (freq > 0.5 ? `Jam — ${ctx.label} is a Nash shove at ${round(ctx.effective, 1)}bb` : `Fold — jamming ${ctx.label} loses money at this depth`),
      evidence: [
        { label: 'Nash frequency', value: `${(freq * 100).toFixed(0)}%` },
        { label: facingJam ? 'BB calls' : 'SB jams', value: `${(facingJam ? chart.callPercent : chart.shovePercent).toFixed(1)}% of hands` },
        { label: 'Exploitability', value: `${chart.exploitability.toExponential(1)} bb/hand` },
      ],
      reasoning: `At ${round(ctx.effective, 1)} big blinds the hand is jam-or-fold, and jam-or-fold heads-up is small enough to solve outright. `
        + `This is not an estimate: the equilibrium here is exploitable for ${chart.exploitability.toExponential(1)} big blinds per hand, which is zero for any practical purpose.`,
    };
  },
};

const EQUITY = {
  id: 'equity', name: 'Equity', lens: 'How often this hand simply wins',
  // Facing a bet, showdown equity *is* the question. First to act it is only
  // half of it — a bet can also win by making a better hand fold, and this
  // lens cannot see that at all. Saying so is more useful than guessing.
  authority: (ctx) => (ctx.toCall > 0 ? 2.0 : 1.0),
  analyze(ctx) {
    const eq = ctx.heroEquity;
    const votes = {};
    if (ctx.toCall > 0) {
      const edge = eq - ctx.need;
      const cont = ramp(edge, 0.06);
      votes.fold = 1 - cont;
      votes.call = cont * (eq > 0.66 ? 0.45 : 1);
      const rk = ctx.options.includes('jam') ? 'jam' : 'raise';
      if (ctx.options.includes(rk)) votes[rk] = cont * (eq > 0.66 ? 0.55 : eq > 0.55 ? 0.18 : 0);
    } else {
      // Below a third of the pot's worth of equity the hand is not betting for
      // value and not checking for showdown — it is choosing between a bluff
      // and a give-up, and that choice belongs to whoever knows the opponent.
      const aggro = eq < 0.35 ? 0.5 : ramp(eq - 0.52, 0.1);
      votes.check = 1 - aggro;
      const bk = ctx.options.includes('jam') ? 'jam' : 'bet';
      votes[bk] = aggro;
    }
    const abstaining = ctx.toCall === 0 && eq < 0.35;
    const margin = ctx.toCall > 0 ? Math.abs(eq - ctx.need) : Math.abs(eq - 0.52);
    return {
      votes,
      confidence: abstaining ? 0.15 : clamp01(0.45 + margin * 4),
      headline: abstaining
        ? `${(eq * 100).toFixed(1)}% equity — too little to bet for value, so this is a bluff-or-give-up decision and equity cannot settle it`
        : ctx.toCall > 0
          ? `${(eq * 100).toFixed(1)}% equity against a price that needs ${(ctx.need * 100).toFixed(1)}%`
          : `${(eq * 100).toFixed(1)}% equity against the range as given`,
      evidence: [
        { label: 'Hand vs range', value: `${(eq * 100).toFixed(1)}%${ctx.heroEquityExact ? ' (exact)' : ` ±${(ctx.heroEquityError * 100).toFixed(2)}`}` },
        { label: 'Villain range', value: `${ctx.villain.combos.length} combos — ${ctx.villain.text}` },
        ctx.toCall > 0
          ? { label: 'Break-even equity', value: `${(ctx.need * 100).toFixed(1)}%` }
          : { label: 'Equity vs random hand', value: `${(EQUITY_VS_RANDOM[ctx.classId] * 100).toFixed(1)}%` },
      ],
      reasoning: ctx.toCall > 0
        ? `Calling ${round(ctx.toCall, 2)} into ${round(ctx.pot, 2)} needs ${(ctx.need * 100).toFixed(1)}% to break even and the hand has ${(eq * 100).toFixed(1)}%, `
          + `${eq >= ctx.need ? `a surplus of ${((eq - ctx.need) * 100).toFixed(1)} points` : `a shortfall of ${((ctx.need - eq) * 100).toFixed(1)} points`}.`
        : `Nobody has bet, so this lens can only answer whether the hand is good enough to bet for value — ${(eq * 100).toFixed(1)}% ${eq > 0.55 ? 'is' : 'is not'}. `
          + `Whether it should bet as a bluff is a question about the opponent, not about equity, and this agent has nothing to say about it.`,
    };
  },
};

const PRICE = {
  id: 'price', name: 'Price', lens: 'Pot odds, implied odds, and what you are forced to defend',
  authority: (ctx) => (ctx.toCall > 0 ? 1.6 : 0),
  analyze(ctx) {
    const drawing = ctx.draw && (ctx.draw.flushDraw || ctx.draw.openEnded || ctx.draw.gutshot);
    const room = Math.max(0, ctx.effective - ctx.toCall);
    // Implied odds are the money you win *later* when you hit. Charging the
    // full remaining stack is a fantasy; half a pot-sized bet, only when the
    // hand can actually improve into something that gets paid, is not.
    const implied = ctx.street < 3 && drawing ? Math.min(room, ctx.pot * 0.9) * 0.5 : 0;
    const impliedNeed = ctx.toCall / (ctx.pot + ctx.toCall + implied);
    const edge = ctx.heroEquity - impliedNeed;
    const cont = ramp(edge, 0.055);
    const votes = { fold: 1 - cont, call: cont };
    const rk = ctx.options.includes('jam') ? 'jam' : 'raise';
    if (ctx.options.includes(rk)) votes[rk] = cont * 0.12;
    return {
      votes,
      confidence: clamp01(0.4 + Math.abs(edge) * 4.5),
      headline: implied > 0
        ? `Price is ${(ctx.need * 100).toFixed(1)}%, but implied odds bring it to ${(impliedNeed * 100).toFixed(1)}%`
        : `Price is ${(ctx.need * 100).toFixed(1)}% with nothing to add for later streets`,
      evidence: [
        { label: 'Pot odds', value: `${round(ctx.toCall, 2)} to win ${round(ctx.pot, 2)} — needs ${(ctx.need * 100).toFixed(1)}%` },
        { label: 'Implied odds', value: implied > 0 ? `+${round(implied, 2)}bb expected later → ${(impliedNeed * 100).toFixed(1)}%` : 'none — the hand does not improve' },
        { label: 'Min defence frequency', value: `${(ctx.mdf * 100).toFixed(0)}% of your range must continue` },
      ],
      reasoning: `Against this bet size a range that folds more than ${((1 - ctx.mdf) * 100).toFixed(0)}% of the time can be bluffed at a profit with any two cards. `
        + (implied > 0
          ? `The draw is worth another ${round(implied, 2)}bb of implied value when it comes in, which is what turns a ${(ctx.need * 100).toFixed(1)}% price into a ${(impliedNeed * 100).toFixed(1)}% one.`
          : `There is no draw here to collect implied odds with, so the raw price is the whole story.`),
    };
  },
};

const FORENSICS = {
  id: 'forensics', name: 'Forensics', lens: 'What the bet size confesses about the range behind it',
  authority: (ctx) => (ctx.toCall > 0 && ctx.street > 0 && ctx.villainShape ? 1.4 : 0),
  analyze(ctx) {
    const bet = ctx.toCall;
    const before = Math.max(0.01, ctx.pot - bet);
    // For hero to be indifferent, villain's betting range must be this share
    // bluffs. Any more and calling prints; any less and folding does.
    const balanced = bet / (before + 2 * bet);
    const s = ctx.villainShape;
    const agg = ctx.profile.aggression;
    const bluffWeight = s.air * 0.35 * agg + s.drawing * 0.7 * agg;
    const valueWeight = s.nutted + s.strong + s.marginal * 0.25;
    const actual = bluffWeight + valueWeight > 0 ? bluffWeight / (bluffWeight + valueWeight) : 0;
    const gap = actual - balanced;
    const cont = ramp(gap, 0.14);
    const votes = { fold: 1 - cont, call: cont };
    const rk = ctx.options.includes('jam') ? 'jam' : 'raise';
    if (ctx.options.includes(rk)) votes[rk] = cont * 0.15;
    return {
      votes,
      confidence: clamp01(0.35 + Math.abs(gap) * 2.4),
      headline: gap > 0
        ? `That size needs ${(balanced * 100).toFixed(0)}% bluffs to be honest; this range has about ${(actual * 100).toFixed(0)}%`
        : `That size needs ${(balanced * 100).toFixed(0)}% bluffs and this range only has about ${(actual * 100).toFixed(0)}%`,
      evidence: [
        { label: 'Bet', value: `${round(bet, 2)} into ${round(before, 2)} — ${(bet / before * 100).toFixed(0)}% pot` },
        { label: 'Balanced bluff share', value: `${(balanced * 100).toFixed(0)}%` },
        { label: 'This range holds', value: `${(s.nutted * 100).toFixed(1)}% nutted, ${(s.strong * 100).toFixed(1)}% strong, ${(s.drawing * 100).toFixed(1)}% drawing, ${(s.air * 100).toFixed(1)}% air` },
      ],
      reasoning: `A ${(bet / before * 100).toFixed(0)}%-pot bet risks ${round(bet, 2)} to win ${round(before, 2)}, so it needs to be bluffing ${(balanced * 100).toFixed(0)}% of the time for you to be indifferent. `
        + `Sorting this opponent's range on this board and betting it the way a ${ctx.profile.name.toLowerCase()} would gives about ${(actual * 100).toFixed(0)}% bluffs, `
        + `${gap > 0 ? 'more than the size can support — the call gains.' : 'less than the size can support — the fold gains.'}`,
    };
  },
};

const TEXTURE = {
  id: 'texture', name: 'Texture', lens: 'The board, hero\'s place on it, and what the next card does',
  authority: (ctx) => (ctx.street > 0 ? 1.8 : 0),
  analyze(ctx) {
    const t = ctx.texture;
    const m = ctx.made;
    const d = ctx.draw;
    const strong = m.absoluteRank;

    // Vulnerability: the share of next cards after which hero is no longer
    // ahead of most of the range. This is the number that decides whether a
    // good hand should protect itself or slow down, and it is measurable.
    let vulnerability = 0;
    if (ctx.street < 3) {
      const o = outsVsRange(ctx.hero, ctx.board, ctx.villain.combos);
      vulnerability = o.aheadNow != null && o.aheadNow > 0.5 ? scaryCardShare(ctx) : 0;
    }

    const hasDraw = d.flushDraw || d.openEnded;
    const votes = {};
    const aggKey = ctx.options.includes('jam') ? 'jam' : ctx.toCall > 0 ? 'raise' : 'bet';
    const passiveKey = ctx.toCall > 0 ? 'call' : 'check';

    // Strong and vulnerable wants money in now; strong and safe can wait;
    // weak with a draw wants fold equity; weak and dry gives up.
    // A hand with no showdown value either bluffs or gives up, and the board
    // cannot tell you which — that depends entirely on whether the opponent
    // folds. So this agent abstains there instead of voting to check, which is
    // what it used to do and what cost it every profitable bluff.
    const noShowdown = strong < 0.25 && !hasDraw && !d.gutshot && ctx.toCall === 0;

    let aggression;
    if (noShowdown) aggression = 0.5;
    else if (strong > 0.8) aggression = 0.55 + vulnerability * 0.4;
    else if (strong > 0.55) aggression = 0.3 + vulnerability * 0.3;
    else if (hasDraw) aggression = 0.45;
    else if (d.gutshot || d.overcards === 2) aggression = 0.25;
    else aggression = 0.08;

    votes[passiveKey] = 1 - aggression;
    if (ctx.options.includes(aggKey)) votes[aggKey] = aggression;
    if (ctx.toCall > 0 && strong < 0.35 && !hasDraw) { votes.fold = 0.75; votes.call = 0.2; votes[aggKey] = 0.05; }

    const parts = [];
    if (d.flushDraw) parts.push('flush draw');
    if (d.openEnded) parts.push('open-ender');
    else if (d.gutshot) parts.push('gutshot');
    if (d.overcards === 2 && m.category === 0) parts.push('two overcards');

    return {
      votes,
      confidence: noShowdown ? 0.2 : clamp01(0.4 + Math.abs(strong - 0.5) * 1.1),
      headline: noShowdown
        ? `${m.text} has no showdown value — this hand bluffs or gives up, and the board cannot decide which`
        : `${m.text} — ahead of ${(strong * 100).toFixed(0)}% of everything, with ${m.combosBeating} combos still beating it`,
      evidence: [
        { label: 'Hand', value: `${m.text}${parts.length ? ` + ${parts.join(' + ')}` : ''}` },
        { label: 'Board', value: `${(t.strongShare * 100).toFixed(1)}% of hands have two pair+, ${(t.drawShare * 100).toFixed(1)}% are drawing — wetness ${(t.wetness * 100).toFixed(0)}%` },
        { label: 'Beaten by', value: m.isNuts ? 'nothing — this is the nuts' : `${m.combosBeating} of ${m.combosTotal} combos (best possible: ${m.nutText.toLowerCase()})` },
        ctx.street < 3
          ? { label: 'Vulnerability', value: `${(vulnerability * 100).toFixed(0)}% of next cards materially hurt this hand` }
          : { label: 'Street', value: 'river — no more cards, the hand is what it is' },
      ],
      reasoning: strong > 0.8
        ? `This is near the top of the possible hands. ${vulnerability > 0.25 ? `${(vulnerability * 100).toFixed(0)}% of turn cards change that, so the money should go in while the hand is still good.` : 'Very little can go wrong, so there is no rush and slow-playing costs less than usual.'}`
        : hasDraw
          ? `The made hand is not worth much yet, but the draw is: this plays as a semi-bluff, which wins two ways — the opponent folds now, or the card comes.`
          : `On a board where ${(t.strongShare * 100).toFixed(1)}% of hands already have two pair or better, ${m.text.toLowerCase()} is not something to build a pot with.`,
    };
  },
};

/** Share of unseen cards that drop hero below 60% of the range. */
function scaryCardShare(ctx) {
  const blocked = new Uint8Array(52);
  for (const c of [...ctx.hero, ...ctx.board]) blocked[c] = 1;
  const live = ctx.villain.combos.filter(([a, b]) => !blocked[a] && !blocked[b]);
  if (!live.length) return 0;
  let scary = 0, seen = 0;
  for (let c = 0; c < 52; c++) {
    if (blocked[c]) continue;
    seen++;
    const brd = [...ctx.board, c];
    const mine = evaluateHand(ctx.hero[0], ctx.hero[1], brd);
    let ahead = 0, n = 0;
    for (const [a, b] of live) {
      if (a === c || b === c) continue;
      n++;
      if (mine > evaluateHand(a, b, brd)) ahead++;
    }
    if (n && ahead / n < 0.6) scary++;
  }
  return seen ? scary / seen : 0;
}

const RANGES = {
  id: 'ranges', name: 'Ranges', lens: 'Range against range, before anybody looks at their cards',
  authority: (ctx) => (ctx.street > 0 ? 1.5 : 0.8),
  analyze(ctx) {
    const r = equityOf({
      ranges: [
        { combos: ctx.heroRange.combos, weights: ctx.heroRange.weights },
        { combos: ctx.villain.combos, weights: ctx.villain.weights },
      ],
      board: ctx.board, iters: Math.max(2000, ctx.iters >> 1), seed: ctx.seed + 11, exactLimit: ctx.exactLimit,
    });
    const rangeEq = r.equity[0];
    const hs = ctx.heroShape, vs = ctx.villainShape;
    const nutEdge = hs && vs ? hs.nutted - vs.nutted : 0;
    const advantage = (rangeEq - 0.5) + nutEdge * 0.8;

    const aggKey = ctx.options.includes('jam') ? 'jam' : ctx.toCall > 0 ? 'raise' : 'bet';
    const passiveKey = ctx.toCall > 0 ? 'call' : 'check';
    const aggression = ramp(advantage, 0.09) * (ctx.toCall > 0 ? 0.35 : 1);
    const votes = { [passiveKey]: 1 - aggression };
    if (ctx.options.includes(aggKey)) votes[aggKey] = aggression;
    if (ctx.toCall > 0) votes.fold = clamp01(0.5 - advantage * 3) * 0.5;

    return {
      votes,
      confidence: clamp01(0.35 + Math.abs(advantage) * 3),
      headline: `Your whole range has ${(rangeEq * 100).toFixed(1)}% here${nutEdge !== 0 ? `, and ${nutEdge > 0 ? 'more' : 'less'} of the nuts` : ''}`,
      evidence: [
        { label: 'Range vs range', value: `${(rangeEq * 100).toFixed(1)}% for ${ctx.heroRange.text}` },
        hs ? { label: 'Your range', value: `${(hs.nutted * 100).toFixed(1)}% nutted, ${(hs.strong * 100).toFixed(1)}% strong, ${(hs.air * 100).toFixed(1)}% air` }
           : { label: 'Your range', value: `${ctx.heroRange.text}` },
        vs ? { label: 'Their range', value: `${(vs.nutted * 100).toFixed(1)}% nutted, ${(vs.strong * 100).toFixed(1)}% strong, ${(vs.air * 100).toFixed(1)}% air` }
           : { label: 'Their range', value: `${ctx.villain.text}` },
      ],
      reasoning: advantage > 0.03
        ? `The board favours the range you would be here with, not theirs. Range advantage is permission to bet often and cheaply — the individual hand matters less than the fact that most of your hands are fine here.`
        : advantage < -0.03
          ? `The board favours their range. Betting into the range that connects better is how good hands turn into medium ones; check more than feels natural.`
          : `Neither range has a real edge on this board, which usually means smaller bets and more checking from both seats.`,
    };
  },
};

const BLOCKERS = {
  id: 'blockers', name: 'Blockers', lens: 'The hands your own two cards make impossible',
  authority: (ctx) => (ctx.street > 0 ? 0.9 : 0.5),
  analyze(ctx) {
    const b = ctx.blockers;
    // A random two cards remove this share of any range, by counting alone.
    const live = 52 - ctx.board.length;
    const baseline = 1 - ((live - 2) * (live - 3)) / (live * (live - 1));
    const edge = b.share - baseline;
    const aggKey = ctx.options.includes('jam') ? 'jam' : ctx.toCall > 0 ? 'raise' : 'bet';
    const passiveKey = ctx.toCall > 0 ? 'call' : 'check';
    const aggression = clamp01(0.35 + edge * 2.2);
    const votes = { [passiveKey]: 1 - aggression };
    if (ctx.options.includes(aggKey)) votes[aggKey] = aggression;
    if (ctx.toCall > 0) votes.fold = clamp01(0.35 - edge * 2) * 0.6;

    return {
      votes,
      confidence: clamp01(0.25 + Math.abs(edge) * 3.5),
      headline: b.valueCombos === 0
        ? 'Nothing in their range to block'
        : `Your cards remove ${b.blocked} of their ${b.valueCombos} ${b.street === 'preflop' ? 'broadway' : 'value'} combos (${(b.share * 100).toFixed(0)}%, random would be ${(baseline * 100).toFixed(0)}%)`,
      evidence: [
        { label: 'Value combos in range', value: String(b.valueCombos) },
        { label: 'Blocked by your hand', value: `${b.blocked} (${(b.share * 100).toFixed(1)}%)` },
        { label: 'Random hand blocks', value: `${(baseline * 100).toFixed(1)}%` },
      ],
      reasoning: edge > 0.02
        ? `Holding these cards makes it measurably less likely they have the hand that beats you, which is exactly when a bluff or a thin value bet gets through.`
        : edge < -0.02
          ? `These cards block almost nothing they would call with, and unblocking their strong hands is the quiet reason bluffs get snapped off.`
          : `Card removal is close to neutral here; this is not the lens that decides the hand.`,
    };
  },
};

const EXPLOIT = {
  id: 'exploit', name: 'Exploit', lens: 'What this specific opponent actually does',
  authority: (ctx) => (ctx.profileKey === 'unknown' ? 0.8 : 1.5 + 5 * Math.abs(ctx.profile.foldToBet - 0.45)),
  analyze(ctx) {
    const p = ctx.profile;
    const foldNow = p.foldToBet;
    const continuing = topOfRange(ctx.villain.combos, ctx.board, 1 - foldNow);
    const eqCalled = continuing.length
      ? equityOf({
        ranges: [
          { combos: [[ctx.hero[0], ctx.hero[1]]], weights: Float64Array.of(1) },
          { combos: continuing, weights: Float64Array.from(continuing, () => 1) },
        ],
        board: ctx.board, iters: Math.max(2000, ctx.iters >> 1), seed: ctx.seed + 23, exactLimit: ctx.exactLimit,
      }).equity[0]
      : ctx.heroEquity;

    const P = ctx.pot;
    const entries = [];
    if (ctx.toCall > 0) {
      entries.push({ action: 'fold', ev: 0 });
      entries.push({ action: 'call', ev: ctx.heroEquity * P - (1 - ctx.heroEquity) * ctx.toCall });
      const rk = ctx.options.includes('jam') ? 'jam' : 'raise';
      if (ctx.options.includes(rk)) {
        const R = Math.min(ctx.effective, rk === 'jam' ? ctx.effective : ctx.toCall + P * 0.85);
        const foldToRaise = Math.min(0.92, foldNow * 1.35);
        entries.push({
          action: rk,
          ev: foldToRaise * P + (1 - foldToRaise) * (eqCalled * (P + R - ctx.toCall) - (1 - eqCalled) * R),
        });
      }
    } else {
      entries.push({ action: 'check', ev: ctx.heroEquity * P * 0.82 });
      const bk = ctx.options.includes('jam') ? 'jam' : 'bet';
      const B = Math.min(ctx.effective, bk === 'jam' ? ctx.effective : P * 0.66);
      entries.push({
        action: bk,
        ev: foldNow * P + (1 - foldNow) * (eqCalled * (P + B) - (1 - eqCalled) * B),
      });
    }

    const best = entries.reduce((a, b) => (b.ev > a.ev ? b : a));
    const worst = entries.reduce((a, b) => (b.ev < a.ev ? b : a));
    return {
      votes: softmax(entries, Math.max(0.12, P * 0.16)),
      confidence: clamp01(0.4 + (best.ev - worst.ev) / Math.max(1, P) * 0.9),
      headline: `Against a ${p.name.toLowerCase()}, ${best.action} is worth ${best.ev >= 0 ? '+' : ''}${round(best.ev, 2)}bb`,
      evidence: [
        { label: 'Folds to a bet', value: `${(foldNow * 100).toFixed(0)}% of the time` },
        { label: 'Equity when called', value: `${(eqCalled * 100).toFixed(1)}% (vs their strongest ${((1 - foldNow) * 100).toFixed(0)}%)` },
        ...entries.map((e) => ({ label: `EV ${e.action}`, value: `${e.ev >= 0 ? '+' : ''}${round(e.ev, 2)}bb` })),
      ],
      reasoning: `${p.note} Folding ${(foldNow * 100).toFixed(0)}% means a pot-sized bluff needs to beat a ${(50).toFixed(0)}% break-even and does not, `
        + `while the ${((1 - foldNow) * 100).toFixed(0)}% they keep is strong enough that your equity against it drops to ${(eqCalled * 100).toFixed(1)}%. `
        + `Those two numbers, not the hand, decide most of what is profitable against this player.`,
    };
  },
};

const STACK = {
  id: 'stack', name: 'Stack', lens: 'Stack-to-pot ratio, and whether this hand is already all-in',
  authority: (ctx) => (ctx.street > 0 ? 1.1 : 0.7),
  analyze(ctx) {
    const s = ctx.spr;
    const afterCall = ctx.toCall > 0 ? (ctx.effective - ctx.toCall) / (ctx.pot + ctx.toCall) : s;
    const strength = ctx.made ? ctx.made.absoluteRank : EQUITY_VS_RANDOM[ctx.classId];
    const committed = afterCall < 1;

    const aggKey = ctx.options.includes('jam') ? 'jam' : ctx.toCall > 0 ? 'raise' : 'bet';
    const passiveKey = ctx.toCall > 0 ? 'call' : 'check';
    // Low SPR turns good-but-not-great into a stack-off; high SPR turns it
    // into a pot-control hand, because there is enough money behind for the
    // opponent's better hands to actually charge you.
    const noShowdown = strength < 0.25 && ctx.toCall === 0;
    const aggression = noShowdown
      ? 0.5
      : committed
        ? clamp01(strength * 1.15)
        : clamp01(strength - Math.min(0.3, Math.log10(Math.max(1.1, s)) * 0.28));
    const votes = { [passiveKey]: 1 - aggression };
    if (ctx.options.includes(aggKey)) votes[aggKey] = aggression;
    if (ctx.toCall > 0 && strength < 0.4 && committed) { votes.fold = 0.6; votes[passiveKey] = 0.3; votes[aggKey] = 0.1; }

    return {
      votes,
      confidence: noShowdown ? 0.15 : clamp01(0.3 + Math.abs(strength - 0.5)),
      headline: noShowdown
        ? `SPR ${round(s, 1)}, but with no showdown value the stack only matters if you are betting it`
        : committed
        ? `SPR ${round(s, 1)} — after calling there is barely a pot left behind; this is a stack-off decision`
        : `SPR ${round(s, 1)} — deep enough that a single pair is a pot-control hand`,
      evidence: [
        { label: 'Effective stack', value: `${round(ctx.effective, 1)}bb` },
        { label: 'SPR now', value: round(s, 2) },
        { label: 'SPR after calling', value: ctx.toCall > 0 ? round(afterCall, 2) : '—' },
        { label: 'Plan', value: committed ? 'commit or fold now — nothing to save' : s > 6 ? 'keep the pot small unless the hand is very strong' : 'one more bet gets it in' },
      ],
      reasoning: committed
        ? `There is ${round(ctx.effective - ctx.toCall, 1)}bb behind into a ${round(ctx.pot + ctx.toCall, 1)}bb pot. Calling and folding later is the worst branch available; decide now.`
        : `At SPR ${round(s, 1)} there is room for three more bets, which is exactly how one pair loses a stack. Strong hands can build; medium hands should aim to reach showdown cheaply.`,
    };
  },
};

export const SPECIALISTS = [SOLVER, EQUITY, PRICE, FORENSICS, TEXTURE, RANGES, BLOCKERS, EXPLOIT, STACK];

// ── The chair ─────────────────────────────────────────────────────────────

/** Run every specialist that has standing in this spot and pool their votes. */
export function deliberate(ctx) {
  const opinions = [];
  const pooled = {};
  for (const a of ctx.options) pooled[a] = 0;
  let totalWeight = 0;

  for (const agent of SPECIALISTS) {
    const authority = agent.authority(ctx);
    if (authority <= 0) continue;
    const raw = agent.analyze(ctx);
    const votes = normalise(raw.votes, ctx.options);
    const weight = authority * clamp01(raw.confidence);
    totalWeight += weight;
    for (const a of ctx.options) pooled[a] += weight * votes[a];
    opinions.push({
      id: agent.id, name: agent.name, lens: agent.lens,
      authority: round(authority, 2), confidence: round(clamp01(raw.confidence), 3),
      weight: round(weight, 3), votes,
      wants: bestOf(votes),
      headline: raw.headline, evidence: raw.evidence, reasoning: raw.reasoning,
    });
  }

  const distribution = {};
  for (const a of ctx.options) distribution[a] = totalWeight > 0 ? pooled[a] / totalWeight : 1 / ctx.options.length;
  return { opinions, distribution, totalWeight };
}

const bestOf = (dist) => Object.keys(dist).reduce((a, b) => (dist[b] > dist[a] ? b : a));

// ── Sizing ────────────────────────────────────────────────────────────────

/**
 * How much. Value bets are sized off the board — the wetter it is, the more it
 * costs to let a draw see the next card. Bluffs are sized off the opponent
 * instead: the biggest bet whose break-even is still under the share of their
 * range that folds. Betting more than that is buying folds above cost.
 */
export function recommendSize(ctx, action) {
  if (!AGGRESSIVE.has(action)) return null;
  if (action === 'jam') {
    return { fraction: ctx.effective / ctx.pot, bb: round(ctx.effective, 2), note: 'all in' };
  }

  const value = ctx.heroEquity >= 0.58 || (ctx.made && ctx.made.absoluteRank > 0.75);
  const shape = ctx.villainShape;
  const foldShare = shape
    ? clamp01(shape.air + shape.drawing * 0.35 + shape.marginal * 0.12)
    : ctx.profile.foldToBet;

  let fraction;
  let note;
  if (value) {
    const wet = ctx.texture ? ctx.texture.wetness : 0.3;
    const nutty = ctx.made && ctx.made.absoluteRank > 0.95;
    // The board says how much protection the hand needs; the opponent says how
    // much they will actually pay. Betting a nit the size you would bet a
    // station only folds out the hands you were being paid by.
    const elasticity = 1 + (0.45 - ctx.profile.foldToBet) * 0.9;
    fraction = (nutty ? 0.9 + wet * 0.35 : 0.45 + wet * 0.55) * elasticity;
    fraction = Math.max(0.25, Math.min(1.6, fraction));
    note = `${nutty ? 'big — the hand can take the pressure' : wet > 0.35 ? 'large — the board is wet and draws must pay' : 'small — nothing to protect against'}`
      + (Math.abs(elasticity - 1) > 0.08
        ? `, and ${elasticity > 1 ? 'wider still because this opponent calls too much' : 'trimmed because this opponent folds out the hands you beat'}`
        : '');
  } else {
    // Largest size whose break-even sits under the share that actually folds.
    const cap = foldShare >= 0.95 ? 2 : (foldShare / (1 - foldShare));
    fraction = Math.max(0.33, Math.min(1.0, cap * 0.85));
    note = `sized so it only needs ${(bluffBreakEvenFraction(fraction) * 100).toFixed(0)}% folds against the ~${(foldShare * 100).toFixed(0)}% that fold`;
  }

  const bb = Math.min(ctx.effective, ctx.pot * fraction);
  return { fraction: round(bb / ctx.pot, 3), bb: round(bb, 2), note, value };
}

const bluffBreakEvenFraction = (f) => f / (1 + f);

// ── The adversary ─────────────────────────────────────────────────────────
//
// Everything above depends on the range hero assumed. So before the answer is
// handed over, one more agent re-runs the whole council against the ranges
// hero would least like to be facing, and reports whether the answer survives.

const SCENARIOS = [
  { key: 'tighter', title: 'They are tighter than you assumed',
    build: (ctx) => topOfRange(ctx.villain.combos, ctx.board, 0.5) },
  { key: 'wider', title: 'They are wider than you assumed',
    build: (ctx) => topPercentCombos(Math.min(100, (ctx.villain.combos.length / 1326) * 100 * 2)) },
  { key: 'nutted', title: 'They have the top of their range',
    build: (ctx) => topOfRange(ctx.villain.combos, ctx.board, 0.25) },
];

export function challenge(ctx, chairAction, opts = {}) {
  const scenarios = [];
  for (const s of SCENARIOS) {
    let combos;
    try { combos = s.build(ctx); } catch { continue; }
    if (!combos || combos.length < 2) continue;
    const variant = buildContext(
      { ...ctx.spot, villainCombos: combos, villainLabel: s.title },
      { iters: Math.max(1500, Math.round(ctx.iters / 3)), seed: ctx.seed + 101, exactLimit: ctx.exactLimit },
    );
    const { distribution } = deliberate(variant);
    const action = bestOf(distribution);
    scenarios.push({
      key: s.key, title: s.title,
      combos: combos.length,
      action,
      share: round(distribution[action], 3),
      heroEquity: round(variant.heroEquity, 4),
      agrees: action === chairAction,
    });
  }
  const agreed = scenarios.filter((s) => s.agrees).length;
  const robustness = scenarios.length ? agreed / scenarios.length : 1;
  const broken = scenarios.filter((s) => !s.agrees);
  return {
    scenarios,
    robustness,
    verdict: broken.length === 0
      ? `The answer does not move. ${chairAction} stays best under every assumption worth worrying about, so there is nothing here to be wrong about except the hand itself.`
      : `${broken.length === scenarios.length ? 'Every' : `${broken.length} of ${scenarios.length}`} alternative reads flip the answer: `
        + broken.map((s) => `${s.title.toLowerCase()} → ${s.action}`).join('; ')
        + `. That is not a reason to ignore the recommendation, but it is the thing to have an opinion about before acting on it.`,
  };
}

// ── Convene ───────────────────────────────────────────────────────────────

const PHRASE = {
  fold: 'Fold', check: 'Check', call: 'Call', bet: 'Bet', raise: 'Raise', jam: 'Jam all in',
};

/**
 * The whole system, end to end.
 * @returns {{action:string, split:boolean, distribution:object, sizing:object|null,
 *            confidence:number, opinions:object[], adversary:object, summary:string}}
 */
export function convene(spot, opts = {}) {
  const ctx = buildContext(spot, opts);
  const { opinions, distribution } = deliberate(ctx);

  const ranked = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const [action, share] = ranked[0];
  const runnerUp = ranked[1] || null;
  // Two actions inside ten points of each other means the lenses disagree, not
  // that the equilibrium mixes. Those are different things and conflating them
  // is expensive — see councilAgent. What a close vote marks is a spot whose
  // answer is sensitive to the read, which is a reason to think rather than a
  // frequency to obey. Real mixing exists in exactly one place here, and the
  // solver reports it directly.
  const split = !!runnerUp && share - runnerUp[1] < 0.10;

  const sizing = recommendSize(ctx, action);
  const adversary = opts.skipAdversary ? null : challenge(ctx, action, opts);

  const agreement = opinions.length
    ? opinions.reduce((s, o) => s + o.weight * o.votes[action], 0) / opinions.reduce((s, o) => s + o.weight, 0)
    : 0;
  const confidence = clamp01(agreement * (adversary ? 0.6 + 0.4 * adversary.robustness : 1));

  const dissent = opinions
    .filter((o) => o.wants !== action)
    .sort((a, b) => b.weight - a.weight)[0] || null;

  return {
    spot: {
      hand: ctx.heroText, label: ctx.label, board: ctx.boardText, street: ctx.streetName,
      pot: round(ctx.pot, 2), toCall: round(ctx.toCall, 2), effective: round(ctx.effective, 1),
      position: ctx.position, profile: ctx.profile.name, villainRange: ctx.villain.text,
      villainCombos: ctx.villain.combos.length,
    },
    facts: {
      heroEquity: round(ctx.heroEquity, 4),
      requiredEquity: round(ctx.need, 4),
      mdf: round(ctx.mdf, 4),
      spr: round(ctx.spr, 2),
      made: ctx.made ? ctx.made.text : null,
      absoluteRank: ctx.made ? round(ctx.made.absoluteRank, 3) : null,
      wetness: ctx.texture ? round(ctx.texture.wetness, 3) : null,
    },
    action,
    phrase: sizing
      ? `${PHRASE[action]} ${sizing.bb}bb${action === 'jam' ? '' : ` (${Math.round(sizing.fraction * 100)}% pot)`}`
      : PHRASE[action],
    split,
    splitWith: split && runnerUp
      ? `${PHRASE[action].toLowerCase()} ${Math.round(share * 100)} / ${PHRASE[runnerUp[0]].toLowerCase()} ${Math.round(runnerUp[1] * 100)}`
      : null,
    distribution: Object.fromEntries(ranked.map(([k, v]) => [k, round(v, 3)])),
    sizing,
    confidence: round(confidence, 3),
    opinions,
    dissent: dissent && { name: dissent.name, wants: dissent.wants, headline: dissent.headline },
    adversary,
    summary: summarise(ctx, action, share, split, runnerUp, sizing, dissent, adversary),
  };
}

function summarise(ctx, action, share, split, runnerUp, sizing, dissent, adversary) {
  const lines = [];
  lines.push(
    split && runnerUp
      ? `${PHRASE[action]}${sizing ? ` ${sizing.bb}bb` : ''}, but only just: the council splits ${Math.round(share * 100)}/${Math.round(runnerUp[1] * 100)} with ${PHRASE[runnerUp[0]].toLowerCase()}. `
        + `That is the lenses disagreeing, not an instruction to alternate — a vote this close means the answer turns on the read you gave it, so the thing to check is the read.`
      : `${PHRASE[action]}${sizing ? ` ${sizing.bb}bb (${Math.round(sizing.fraction * 100)}% of the pot)` : ''}. ${Math.round(share * 100)}% of the weighted vote lands there.`,
  );
  if (sizing && sizing.note) lines.push(`Size: ${sizing.note}.`);
  if (dissent) lines.push(`${dissent.name} disagrees and wants to ${dissent.wants}: ${dissent.headline}.`);
  if (adversary) lines.push(adversary.verdict);
  return lines.join(' ');
}
