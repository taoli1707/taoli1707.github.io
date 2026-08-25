import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHand, legalActions, applyAction, playHand, dealDeck, pot, observe,
  BIG_BLIND, SMALL_BLIND,
} from '../engine/game.js';
import { makeRng } from '../engine/rng.js';
import { randomAgent, callingStation, maniac } from '../engine/agents.js';

const START = 100 * BIG_BLIND;

test('blinds are posted and the button acts first preflop', () => {
  const s = createHand({ stacks: [START, START], button: 0, seed: 1 });
  assert.equal(s.committed[0], SMALL_BLIND);
  assert.equal(s.committed[1], BIG_BLIND);
  assert.equal(pot(s), SMALL_BLIND + BIG_BLIND);
  assert.equal(s.toAct, 0);
  assert.equal(legalActions(s).toCall, SMALL_BLIND);
});

test('the big blind still has the option after a call', () => {
  const s = createHand({ stacks: [START, START], button: 0, seed: 1 });
  applyAction(s, { type: 'call' });
  assert.equal(s.toAct, 1);
  assert.equal(s.street, 0, 'a limp must not end the street');
  const legal = legalActions(s);
  assert.ok(legal.canCheck && legal.canRaise);
  applyAction(s, { type: 'check' });
  assert.equal(s.street, 1);
  assert.equal(s.board.length, 3);
  assert.equal(s.toAct, 1, 'the big blind acts first postflop');
});

test('minimum raises are enforced and grow with each reraise', () => {
  const s = createHand({ stacks: [START, START], button: 0, seed: 2 });
  assert.equal(legalActions(s).minRaiseTo, 2 * BIG_BLIND);
  applyAction(s, { type: 'raise', amount: 3 * BIG_BLIND });
  // A raise to 3bb over 1bb is a 2bb increment, so the next min raise is 5bb.
  assert.equal(legalActions(s).minRaiseTo, 5 * BIG_BLIND);
  assert.throws(() => applyAction(s, { type: 'check' }), /cannot check/);
});

test('chips are conserved across thousands of random hands', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 3000; i++) {
    const stacks = [
      BIG_BLIND * (1 + Math.floor(rng() * 120)),
      BIG_BLIND * (1 + Math.floor(rng() * 120)),
    ];
    const before = stacks[0] + stacks[1];
    const s = createHand({ stacks, button: i % 2, deck: dealDeck(rng) });
    playHand(s, [randomAgent({ seed: i }), randomAgent({ seed: i + 1 })]);
    assert.ok(s.complete);
    assert.equal(s.stacks[0] + s.stacks[1], before, `hand ${i} leaked chips`);
    assert.ok(s.stacks[0] >= 0 && s.stacks[1] >= 0);
    assert.equal(s.result.net[0] + s.result.net[1], 0);
  }
});

test('an uncalled all-in overbet is refunded, not won', () => {
  // Deep stack shoves into a short stack; only the matched part is at risk.
  const s = createHand({ stacks: [START, 10 * BIG_BLIND], button: 0, seed: 3 });
  applyAction(s, { type: 'raise', amount: legalActions(s).maxRaiseTo });
  assert.equal(s.contributed[0], START, 'the shove goes in at full size');
  applyAction(s, { type: 'call' });
  assert.ok(s.complete);
  assert.equal(s.stacks[0] + s.stacks[1], START + 10 * BIG_BLIND);
  assert.equal(Math.abs(s.result.net[0]), 10 * BIG_BLIND,
    'only the effective stack was ever at risk; the rest came back');
  assert.equal(s.result.net[0] + s.result.net[1], 0);
});

test('folding gives the whole pot to the other player', () => {
  const s = createHand({ stacks: [START, START], button: 0, seed: 4 });
  applyAction(s, { type: 'raise', amount: 3 * BIG_BLIND });
  applyAction(s, { type: 'fold' });
  assert.ok(s.complete);
  assert.equal(s.result.showdown, false);
  assert.equal(s.result.winner, 0);
  assert.equal(s.result.net[0], BIG_BLIND);
  assert.equal(s.result.net[1], -BIG_BLIND);
});

test('an all-in preflop runs the board out with no further betting', () => {
  const s = createHand({ stacks: [20 * BIG_BLIND, 20 * BIG_BLIND], button: 0, seed: 6 });
  applyAction(s, { type: 'raise', amount: legalActions(s).maxRaiseTo });
  applyAction(s, { type: 'call' });
  assert.ok(s.complete);
  assert.equal(s.board.length, 5);
  assert.ok(s.result.showdown);
  assert.equal(Math.abs(s.result.net[0]), 20 * BIG_BLIND);
});

test('a split pot returns both players to even', () => {
  const rng = makeRng(11);
  let chops = 0;
  for (let i = 0; i < 2000 && chops < 5; i++) {
    const s = createHand({ stacks: [START, START], button: 0, deck: dealDeck(rng) });
    playHand(s, [callingStation(), callingStation()]);
    if (s.result.showdown && s.result.winner === -1) {
      chops++;
      assert.equal(s.stacks[0], START);
      assert.equal(s.stacks[1], START);
    }
  }
  assert.ok(chops > 0, 'expected at least one chopped pot');
});

test('agents only ever see their own cards', () => {
  const s = createHand({ stacks: [START, START], button: 0, seed: 8 });
  const view = observe(s, 0);
  assert.deepEqual(view.hole, s.hole[0]);
  assert.ok(typeof view.hole[0] === 'number', 'one seat\'s cards, not both seats');
  assert.ok(!JSON.stringify(view).includes(JSON.stringify(s.hole[1])),
    'the opponent\'s hole cards must not appear anywhere in the view');
  assert.equal(view.board.length, 0, 'no board is visible preflop');
});

test('betting always terminates, even against a maniac', () => {
  const rng = makeRng(13);
  for (let i = 0; i < 500; i++) {
    const s = createHand({
      stacks: [START, START], button: i % 2, deck: dealDeck(rng),
    });
    playHand(s, [maniac({ seed: i, raiseFrequency: 0.95 }), maniac({ seed: i * 3, raiseFrequency: 0.95 })]);
    assert.ok(s.complete);
    assert.equal(s.stacks[0] + s.stacks[1], 2 * START);
  }
});
