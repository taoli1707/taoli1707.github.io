// Heads-up no-limit Hold'em rules engine.
//
// Chips are integers so pot arithmetic is exact; a big blind is BIG_BLIND
// units, which leaves room for fractional-bb bet sizing without float drift.
// The engine enforces real rules — min-raise increments, short all-ins that do
// not reopen the betting, uncalled-bet refunds — because a bot tested against
// sloppy rules learns sloppy poker.

import { evaluateHand, describe } from './evaluator.js';
import { makeRng, partialShuffle } from './rng.js';
import { fullDeck } from './cards.js';

export const BIG_BLIND = 100;
export const SMALL_BLIND = 50;

export const STREETS = ['preflop', 'flop', 'turn', 'river', 'showdown'];
const BOARD_BY_STREET = [0, 3, 4, 5, 5];

/**
 * Start a hand. Seat 0 and seat 1 are fixed; `button` says which seat has the
 * button (and therefore posts the small blind and acts first preflop).
 */
export function createHand({
  stacks = [BIG_BLIND * 100, BIG_BLIND * 100],
  button = 0,
  deck = null,
  seed = 1,
  bigBlind = BIG_BLIND,
  smallBlind = SMALL_BLIND,
} = {}) {
  let cards = deck;
  if (!cards) {
    cards = fullDeck();
    partialShuffle(cards, 9, makeRng(seed));
  }

  const s = {
    button,
    bigBlind,
    smallBlind,
    deck: cards,
    stacks: stacks.slice(),
    startingStacks: stacks.slice(),
    hole: [[cards[0], cards[2]], [cards[1], cards[3]]],
    boardCards: [cards[4], cards[5], cards[6], cards[7], cards[8]],
    board: [],
    street: 0,
    committed: [0, 0],      // chips in front of each player this street
    contributed: [0, 0],    // chips put in across the whole hand
    folded: [false, false],
    hasActed: [false, false],
    currentBet: 0,
    minRaiseIncrement: bigBlind,
    reopened: true,
    toAct: button,
    complete: false,
    log: [],
    result: null,
  };

  post(s, button, smallBlind, 'small blind');
  post(s, 1 - button, bigBlind, 'big blind');
  s.currentBet = Math.max(s.committed[0], s.committed[1]);
  s.hasActed = [false, false];
  s.toAct = button;
  // A player already all-in from posting cannot act.
  if (s.stacks[s.toAct] === 0) advance(s);
  return s;
}

function post(s, seat, amount, label) {
  const chips = Math.min(amount, s.stacks[seat]);
  s.stacks[seat] -= chips;
  s.committed[seat] += chips;
  s.contributed[seat] += chips;
  s.log.push({ street: 0, seat, type: 'post', amount: chips, label });
}

export const pot = (s) => s.contributed[0] + s.contributed[1];

/** What the player to act may legally do. All amounts are "raise to" totals. */
export function legalActions(s) {
  const seat = s.toAct;
  const toCall = Math.min(s.currentBet - s.committed[seat], s.stacks[seat]);
  // The ceiling is this player's own stack, not what the opponent can cover.
  // Capping at the opponent's stack looks tidier but is wrong: it can leave a
  // deep player with no legal raise at all when a min-raise would put in more
  // than the short stack can call. Real no-limit lets the bet stand and
  // refunds the uncalled part at showdown, which finish() already does.
  const cap = s.committed[seat] + s.stacks[seat];

  const canCheck = toCall === 0;
  const rawMin = s.currentBet + s.minRaiseIncrement;
  const minRaiseTo = Math.min(rawMin, cap);
  const canRaise = s.reopened && cap > s.currentBet && s.stacks[seat] > toCall;

  return {
    seat,
    toCall,
    canFold: !canCheck,
    canCheck,
    canCall: toCall > 0,
    canRaise,
    minRaiseTo,
    maxRaiseTo: cap,
    potIfCall: pot(s) + toCall,
  };
}

/**
 * Apply an action.
 * @param {object} s
 * @param {{type:'fold'|'check'|'call'|'raise', amount?:number}} action
 *        `amount` for a raise is the total this player will have in front of
 *        them on this street. Bets and raises share the same shape.
 */
export function applyAction(s, action) {
  if (s.complete) throw new Error('hand is already complete');
  const seat = s.toAct;
  const legal = legalActions(s);

  switch (action.type) {
    case 'fold': {
      s.folded[seat] = true;
      s.log.push({ street: s.street, seat, type: 'fold' });
      finish(s);
      return s;
    }
    case 'check': {
      if (!legal.canCheck) throw new Error('cannot check facing a bet');
      s.hasActed[seat] = true;
      s.log.push({ street: s.street, seat, type: 'check' });
      break;
    }
    case 'call': {
      if (legal.toCall <= 0) throw new Error('nothing to call');
      commit(s, seat, legal.toCall);
      s.hasActed[seat] = true;
      s.log.push({ street: s.street, seat, type: 'call', amount: legal.toCall });
      break;
    }
    case 'raise': {
      if (!legal.canRaise) throw new Error('raising is not available');
      let target = Math.round(action.amount);
      target = Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, target));
      const add = target - s.committed[seat];
      if (add <= 0) throw new Error('raise must increase the bet');
      const increment = target - s.currentBet;
      const allIn = add >= s.stacks[seat];

      commit(s, seat, add);
      // A short all-in does not reopen betting for a player who already acted.
      if (increment >= s.minRaiseIncrement) {
        s.minRaiseIncrement = increment;
        s.reopened = true;
        s.hasActed = [false, false];
      } else if (!allIn) {
        throw new Error('raise is below the minimum');
      } else {
        s.reopened = false;
      }
      s.currentBet = Math.max(s.currentBet, s.committed[seat]);
      s.hasActed[seat] = true;
      s.log.push({
        street: s.street, seat, type: 'raise', amount: add, to: s.committed[seat], allIn,
      });
      break;
    }
    default:
      throw new Error(`unknown action "${action.type}"`);
  }

  advance(s);
  return s;
}

function commit(s, seat, chips) {
  const paid = Math.min(chips, s.stacks[seat]);
  s.stacks[seat] -= paid;
  s.committed[seat] += paid;
  s.contributed[seat] += paid;
}

function bettingClosed(s) {
  const live = [0, 1].filter((i) => !s.folded[i]);
  if (live.length < 2) return true;
  const canAct = live.filter((i) => s.stacks[i] > 0);
  if (canAct.length === 0) return true;
  if (canAct.length === 1) {
    const i = canAct[0];
    return s.hasActed[i] && s.committed[i] >= s.currentBet;
  }
  return live.every((i) => s.hasActed[i] && s.committed[i] === s.currentBet);
}

function advance(s) {
  if (s.folded[0] || s.folded[1]) { finish(s); return; }
  if (bettingClosed(s)) { closeStreet(s); return; }
  const next = 1 - s.toAct;
  // If the opponent has no chips left they cannot act, and bettingClosed()
  // would already have caught it — so reaching here means the street is done.
  if (s.stacks[next] > 0) { s.toAct = next; return; }
  closeStreet(s);
}

function closeStreet(s) {
  const allIn = s.stacks[0] === 0 || s.stacks[1] === 0;

  while (s.street < 3) {
    s.street++;
    s.board = s.boardCards.slice(0, BOARD_BY_STREET[s.street]);
    s.committed = [0, 0];
    s.currentBet = 0;
    s.minRaiseIncrement = s.bigBlind;
    s.reopened = true;
    s.hasActed = [false, false];
    // Postflop the big blind acts first.
    s.toAct = 1 - s.button;
    if (!allIn) return;
  }
  s.street = 4;
  s.board = s.boardCards.slice(0, 5);
  finish(s);
}

function finish(s) {
  if (s.complete) return;
  s.complete = true;

  const contributed = s.contributed.slice();
  const payouts = [0, 0];

  if (s.folded[0] || s.folded[1]) {
    const winner = s.folded[0] ? 1 : 0;
    payouts[winner] = contributed[0] + contributed[1];
    s.result = { winner, showdown: false, payouts };
  } else {
    // Refund the uncalled portion of the larger all-in before splitting.
    const cap = Math.min(contributed[0], contributed[1]);
    for (const i of [0, 1]) {
      const excess = contributed[i] - cap;
      if (excess > 0) { payouts[i] += excess; contributed[i] -= excess; }
    }
    const board = s.boardCards.slice(0, 5);
    const scores = [
      evaluateHand(s.hole[0][0], s.hole[0][1], board),
      evaluateHand(s.hole[1][0], s.hole[1][1], board),
    ];
    const live = contributed[0] + contributed[1];
    let winner;
    if (scores[0] > scores[1]) { payouts[0] += live; winner = 0; }
    else if (scores[1] > scores[0]) { payouts[1] += live; winner = 1; }
    else {
      payouts[0] += Math.floor(live / 2);
      payouts[1] += live - Math.floor(live / 2);
      winner = -1;
    }
    s.board = board;
    s.result = {
      winner,
      showdown: true,
      payouts,
      scores,
      descriptions: scores.map(describe),
    };
  }

  for (const i of [0, 1]) s.stacks[i] += payouts[i];
  s.result.net = [
    s.stacks[0] - s.startingStacks[0],
    s.stacks[1] - s.startingStacks[1],
  ];
}

/** Deal a fresh shuffled deck; hand it to createHand to replay identical cards. */
export function dealDeck(rng) {
  const deck = fullDeck();
  partialShuffle(deck, 9, rng);
  return deck;
}

/**
 * What one seat is allowed to see. Agents are handed this rather than the raw
 * state so a buggy agent cannot accidentally read its opponent's cards and
 * flatter itself in the arena.
 */
export function observe(s, seat) {
  return {
    seat,
    hole: s.hole[seat],
    board: s.board.slice(),
    street: s.street,
    streetName: STREETS[s.street],
    pot: pot(s),
    stacks: s.stacks.slice(),
    committed: s.committed.slice(),
    contributed: s.contributed.slice(),
    button: s.button,
    inPosition: s.button === seat,
    bigBlind: s.bigBlind,
    effectiveStack: Math.min(
      s.stacks[0] + s.committed[0],
      s.stacks[1] + s.committed[1],
    ),
    log: s.log,
  };
}

/** Play a whole hand out with two agent callbacks. Returns the finished state. */
export function playHand(state, agents) {
  let guard = 0;
  while (!state.complete) {
    if (++guard > 400) throw new Error('betting did not terminate');
    const legal = legalActions(state);
    const action = agents[state.toAct](observe(state, state.toAct), legal);
    applyAction(state, action);
  }
  return state;
}
