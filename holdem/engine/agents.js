// Playing agents.
//
// `equityAgent` is the one that actually plays poker: it estimates its equity
// against a modelled opponent range by Monte Carlo on the real board, compares
// that to the pot odds it is being laid, and sizes accordingly. It is a strong
// heuristic, not a solved strategy — see README for exactly where it is
// exploitable.
//
// The others exist to be beaten. A bot that cannot beat a calling station by a
// wide margin is broken, and a bot whose edge over one baseline does not show
// up against the others is overfitted to that baseline.

import { makeRng } from './rng.js';
import { classOf, combosOfClass } from './cards.js';
import { equity } from './equity.js';
import { topPercentClasses } from './range.js';
import { pushFoldChart } from './pushfold.js';
import { convene } from './council.js';
import { BIG_BLIND } from './game.js';

// ---------------------------------------------------------------------------
// Opponent modelling
// ---------------------------------------------------------------------------

const rangeCache = new Map();

/** Combos making up the strongest `percent` of starting hands. */
function topPercentCombos(percent) {
  const key = Math.round(percent);
  if (!rangeCache.has(key)) {
    const combos = [];
    for (const id of topPercentClasses(key)) combos.push(...combosOfClass(id));
    rangeCache.set(key, { combos, weights: Float64Array.from(combos, () => 1) });
  }
  return rangeCache.get(key);
}

/**
 * Read the betting so far and guess how wide the opponent still is. Crude by
 * design: a range model that reacts to aggression at all beats one that does
 * not, and elaborate models overfit to whoever you tested against.
 */
export function inferOpponentPercent(obs) {
  const opp = 1 - obs.seat;
  let preflopRaises = 0;
  let postflopBets = 0;
  let sawPreflopCall = false;

  for (const e of obs.log) {
    if (e.seat !== opp) continue;
    if (e.type === 'raise') {
      if (e.street === 0) preflopRaises++; else postflopBets++;
    } else if (e.type === 'call' && e.street === 0) {
      sawPreflopCall = true;
    }
  }

  let percent;
  if (preflopRaises >= 3) percent = 6;
  else if (preflopRaises === 2) percent = 14;
  else if (preflopRaises === 1) percent = 40;
  else if (sawPreflopCall) percent = 62;
  else percent = 100;

  for (let i = 0; i < postflopBets; i++) percent *= 0.62;
  return Math.max(3, Math.min(100, percent));
}

// ---------------------------------------------------------------------------
// Sizing helpers
// ---------------------------------------------------------------------------

/** Raise to `fraction` of the pot as it would stand after the call. */
function raiseTo(obs, legal, fraction) {
  const potAfterCall = obs.pot + legal.toCall;
  const target = obs.committed[obs.seat] + legal.toCall + Math.round(fraction * potAfterCall);
  return Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, target));
}

const fold = { type: 'fold' };
const check = { type: 'check' };
const call = { type: 'call' };

/** Fold is never right when checking is free. */
function passive(legal) {
  return legal.canCheck ? check : fold;
}

// ---------------------------------------------------------------------------
// The real agent
// ---------------------------------------------------------------------------

export function equityAgent({
  seed = 1,
  iters = 600,
  exactLimit = 60_000,
  bluffFrequency = 0.26,
  valueThreshold = 0.66,
  jamStack = 15,
  name = 'Equity bot',
} = {}) {
  const rng = makeRng(seed);
  let evalSeed = seed;

  function estimateEquity(obs) {
    const villain = topPercentCombos(inferOpponentPercent(obs));
    const hero = { combos: [obs.hole], weights: Float64Array.of(1) };
    evalSeed = (evalSeed * 1103515245 + 12345) >>> 0;
    const r = equity({
      ranges: [hero, villain],
      board: obs.board,
      iters,
      seed: evalSeed || 1,
      exactLimit,
    });
    return r.equity[0];
  }

  const act = (obs, legal) => {
    const bb = obs.bigBlind;
    const stackBb = obs.effectiveStack / bb;

    // --- Short-stack preflop: play the solved jam/fold game outright. -------
    if (obs.street === 0 && stackBb <= jamStack) {
      const chart = pushFoldChart(Math.max(1, Math.round(stackBb * 10) / 10));
      const id = classOf(obs.hole[0], obs.hole[1]);
      const opponentAllIn = obs.stacks[1 - obs.seat] === 0 && legal.toCall > 0;

      if (opponentAllIn || legal.toCall > bb) {
        return chart.call[id] > rng() ? call : passive(legal);
      }
      if (legal.canRaise && chart.shove[id] > rng()) {
        return { type: 'raise', amount: legal.maxRaiseTo };
      }
      return passive(legal);
    }

    const eq = estimateEquity(obs);
    const potOdds = legal.toCall > 0 ? legal.toCall / legal.potIfCall : 0;

    // --- Facing a bet ------------------------------------------------------
    if (legal.toCall > 0) {
      if (legal.canRaise && eq > valueThreshold + 0.06) {
        return { type: 'raise', amount: raiseTo(obs, legal, 0.85 + rng() * 0.35) };
      }
      if (eq > potOdds + 0.015) return call;
      // Semi-bluff raise: enough equity to survive being called, little enough
      // that folding out the better half of their range is where the value is.
      if (legal.canRaise && eq > 0.34 && eq < 0.50 && rng() < bluffFrequency * 0.45) {
        return { type: 'raise', amount: raiseTo(obs, legal, 0.7) };
      }
      return fold;
    }

    // --- Checked to / first in --------------------------------------------
    if (obs.street === 0) {
      // Deep preflop: open or three-bet the top of the range, otherwise take
      // the free card. Sizing is standard rather than solved.
      if (legal.canRaise && eq > 0.60) {
        const open = obs.committed[obs.seat] + Math.round(bb * (2.5 + rng()));
        return { type: 'raise', amount: Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, open)) };
      }
      return passive(legal);
    }

    if (legal.canRaise && eq > valueThreshold) {
      return { type: 'raise', amount: raiseTo(obs, legal, 0.55 + rng() * 0.25) };
    }
    if (legal.canRaise && eq > 0.55 && obs.street >= 2 && rng() < 0.5) {
      return { type: 'raise', amount: raiseTo(obs, legal, 0.4) };
    }
    if (legal.canRaise && eq < 0.38 && rng() < bluffFrequency) {
      return { type: 'raise', amount: raiseTo(obs, legal, 0.5) };
    }
    return passive(legal);
  };

  act.agentName = name;
  return act;
}

// ---------------------------------------------------------------------------
// Baselines
// ---------------------------------------------------------------------------

/** Never folds, never raises. The purest measure of whether you can value bet. */
export function callingStation({ name = 'Calling station' } = {}) {
  const act = (obs, legal) => (legal.canCheck ? check : call);
  act.agentName = name;
  return act;
}

/** Uniformly random over the legal actions. Beating it should be effortless. */
export function randomAgent({ seed = 2, name = 'Random' } = {}) {
  const rng = makeRng(seed);
  const act = (obs, legal) => {
    const options = [];
    if (legal.canCheck) options.push(check); else options.push(fold, call);
    if (legal.canCall && legal.canCheck) options.push(call);
    if (legal.canRaise) {
      options.push({
        type: 'raise',
        amount: legal.minRaiseTo + Math.floor(rng() * (legal.maxRaiseTo - legal.minRaiseTo + 1)),
      });
    }
    return options[(rng() * options.length) | 0];
  };
  act.agentName = name;
  return act;
}

/** Raises relentlessly. Punishes anything that folds too much. */
export function maniac({ seed = 3, raiseFrequency = 0.6, name = 'Maniac' } = {}) {
  const rng = makeRng(seed);
  const act = (obs, legal) => {
    if (legal.canRaise && rng() < raiseFrequency) {
      return { type: 'raise', amount: raiseTo(obs, legal, 0.75) };
    }
    return legal.canCheck ? check : call;
  };
  act.agentName = name;
  return act;
}

/** Only ever has it. Punishes anything that pays off too wide. */
export function nit({ seed = 4, openPercent = 9, name = 'Nit' } = {}) {
  const rng = makeRng(seed);
  let evalSeed = seed * 7919;
  const act = (obs, legal) => {
    if (obs.street === 0) {
      const id = classOf(obs.hole[0], obs.hole[1]);
      const strong = new Set(topPercentClasses(openPercent));
      if (!strong.has(id)) return passive(legal);
      if (legal.canRaise && rng() < 0.85) return { type: 'raise', amount: raiseTo(obs, legal, 1) };
      return legal.canCheck ? check : call;
    }
    evalSeed = (evalSeed * 1103515245 + 12345) >>> 0;
    const r = equity({
      ranges: [{ combos: [obs.hole], weights: Float64Array.of(1) }, topPercentCombos(50)],
      board: obs.board,
      iters: 300,
      seed: evalSeed || 1,
      exactLimit: 40_000,
    });
    const eq = r.equity[0];
    if (legal.toCall > 0) return eq > 0.68 ? call : fold;
    if (legal.canRaise && eq > 0.75) return { type: 'raise', amount: raiseTo(obs, legal, 0.6) };
    return passive(legal);
  };
  act.agentName = name;
  return act;
}

/** Pure solved jam-or-fold, at any stack depth. */
export function pushFoldAgent({ seed = 5, name = 'Nash jam/fold' } = {}) {
  const rng = makeRng(seed);
  const act = (obs, legal) => {
    const stackBb = Math.max(1, obs.effectiveStack / obs.bigBlind);
    const chart = pushFoldChart(Math.round(stackBb * 10) / 10);
    const id = classOf(obs.hole[0], obs.hole[1]);
    if (obs.street > 0) return passive(legal);
    if (legal.toCall > obs.bigBlind || obs.stacks[1 - obs.seat] === 0) {
      return chart.call[id] > rng() ? call : passive(legal);
    }
    if (legal.canRaise && chart.shove[id] > rng()) {
      return { type: 'raise', amount: legal.maxRaiseTo };
    }
    return passive(legal);
  };
  act.agentName = name;
  return act;
}

// ---------------------------------------------------------------------------
// The council, playing
// ---------------------------------------------------------------------------

/**
 * Wraps the multi-agent council into something that can sit at the table.
 * Slower than the other agents by an order of magnitude — it runs eight
 * specialists and several equity calculations per decision — but it is the only
 * way to find out whether the reasoning on the page survives contact with an
 * opponent.
 */
export function councilAgent({
  seed = 11, iters = 250, exactLimit = 20_000, profile = 'unknown', mix = false, name = 'Council',
} = {}) {
  const rng = makeRng(seed);

  const act = (obs, legal) => {
    const bb = obs.bigBlind;
    let verdict;
    try {
      verdict = convene({
        hero: obs.hole,
        board: obs.board,
        // obs.pot is everything contributed so far, which already includes the
        // bet hero is facing — that is exactly the council's convention, and
        // adding toCall on top of it quietly hands hero a better price than
        // the table is offering.
        potBb: obs.pot / bb,
        toCallBb: legal.toCall / bb,
        // What can still be wagered, not what has been wagered: SPR and every
        // commitment threshold are about the money behind.
        effectiveBb: Math.min(obs.stacks[obs.seat], obs.stacks[1 - obs.seat] + legal.toCall) / bb,
        position: obs.seat === obs.button ? 'ip' : 'oop',
        profile,
        villainRange: `top ${inferOpponentPercent(obs).toFixed(1)}%`,
      }, { iters, exactLimit, seed: seed + obs.log.length * 31, skipAdversary: true });
    } catch {
      return passive(legal);
    }

    // Take the council's answer, not a sample from it. The distribution is a
    // measure of how much the nine lenses agree, and agreement is not the same
    // thing as an optimal frequency: a quarter of the weight on "fold" means a
    // quarter of the argument leaned that way, not that folding is right one
    // time in four. Playing it as though it were a mixed strategy costs about
    // 250 bb/100 against the engine's own equity bot, which is how this was
    // found. Pass mix:true to reproduce that.
    let choice = verdict.action;
    if (mix) {
      let roll = rng();
      for (const [action, weight] of Object.entries(verdict.distribution)) {
        roll -= weight;
        if (roll <= 0) { choice = action; break; }
      }
    }

    switch (choice) {
      case 'fold': return passive(legal);
      case 'check': return legal.canCheck ? check : call;
      case 'call': return legal.toCall > 0 ? call : check;
      case 'jam':
        return legal.canRaise ? { type: 'raise', amount: legal.maxRaiseTo } : (legal.toCall > 0 ? call : passive(legal));
      case 'bet':
      case 'raise': {
        if (!legal.canRaise) return legal.toCall > 0 ? call : check;
        const fraction = verdict.sizing ? verdict.sizing.fraction : 0.66;
        return { type: 'raise', amount: raiseTo(obs, legal, fraction) };
      }
      default: return passive(legal);
    }
  };
  act.agentName = name;
  return act;
}

export const AGENTS = {
  equity: equityAgent,
  council: councilAgent,
  station: callingStation,
  random: randomAgent,
  maniac,
  nit,
  pushfold: pushFoldAgent,
};
