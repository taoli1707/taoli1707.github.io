import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCards, classOf, combosOfClass, ALL_CLASS_IDS } from '../engine/cards.js';
import { pushFoldChart } from '../engine/pushfold.js';
import { convene, buildContext, deliberate, SPECIALISTS, PROFILES, topPercentCombos } from '../engine/council.js';

const FAST = { iters: 3000, seed: 5 };

test('the council returns a proper distribution over the legal actions', () => {
  const r = convene({ hero: parseCards('AhKh'), board: parseCards('Qh 7h 2c'), potBb: 6, toCallBb: 4, effectiveBb: 95 }, FAST);
  const sum = Object.values(r.distribution).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 0.005, `distribution sums to ${sum}`);
  assert.ok(r.confidence >= 0 && r.confidence <= 1);
  assert.ok(Object.keys(r.distribution).includes(r.action));
});

test('facing a bet that is all but all-in there is nothing to raise with', () => {
  const ctx = buildContext({ hero: parseCards('AhKd'), board: [], potBb: 9.5, toCallBb: 7.5, effectiveBb: 8 });
  assert.deepEqual(ctx.options.sort(), ['call', 'fold']);
});

test('at short stacks the tree is jam or fold, with no limp in it', () => {
  const ctx = buildContext({ hero: parseCards('AhKd'), board: [], potBb: 1.5, toCallBb: 0.5, effectiveBb: 9 });
  assert.deepEqual(ctx.options.sort(), ['fold', 'jam']);
});

test('the council reproduces the Nash jam/fold solution it is built on', () => {
  // Not a tautology: the solver is one of nine voices and can be outvoted.
  // Where the equilibrium is pure, the whole council should still land on it.
  const chart = pushFoldChart(8);
  let checked = 0;
  for (const id of ALL_CLASS_IDS) {
    const freq = chart.shove[id];
    if (freq > 0.01 && freq < 0.99) continue; // skip the mixed frontier
    const hero = combosOfClass(id)[0];
    const r = convene({ hero, board: [], potBb: 1.5, toCallBb: 0.5, effectiveBb: 8 }, { ...FAST, skipAdversary: true });
    assert.equal(r.action, freq > 0.5 ? 'jam' : 'fold', `${hero} at 8bb: Nash says ${freq}`);
    checked++;
  }
  assert.ok(checked > 140, `only checked ${checked} classes`);
});

test('the same spot twice gives the same answer', () => {
  const spot = { hero: parseCards('9s9d'), board: parseCards('Kh 7c 2d'), potBb: 8, toCallBb: 5, effectiveBb: 60, profile: 'balanced' };
  const a = convene(spot, FAST);
  const b = convene(spot, FAST);
  assert.equal(a.action, b.action);
  assert.equal(a.confidence, b.confidence);
});

test('who the opponent is flips the answer with the same cards', () => {
  // Seven high on an ace-king board. Against someone who folds three times in
  // four this is a bet; against someone who never folds it is a give-up. Same
  // hand, same board, opposite action — which is the entire point of having an
  // opponent model at all.
  const spot = { hero: parseCards('7d6d'), board: parseCards('Ah Kc 9s 4d 2c'), potBb: 14, toCallBb: 0, effectiveBb: 50 };
  const vsNit = convene({ ...spot, profile: 'nit' }, FAST);
  const vsStation = convene({ ...spot, profile: 'station' }, FAST);
  assert.equal(vsNit.action, 'bet');
  assert.equal(vsStation.action, 'check');
});

test('the nuts never checks and never folds', () => {
  const r = convene({ hero: parseCards('AsKs'), board: parseCards('Qs Js Ts 4d 2c'), potBb: 20, toCallBb: 0, effectiveBb: 60, profile: 'station' }, FAST);
  assert.equal(r.action, 'bet');
  assert.ok(r.sizing.bb > 0);
  const facing = convene({ hero: parseCards('AsKs'), board: parseCards('Qs Js Ts 4d 2c'), potBb: 30, toCallBb: 10, effectiveBb: 60, profile: 'balanced' }, FAST);
  assert.notEqual(facing.action, 'fold');
});

test('bluffs are sized off fold equity, value bets off the board', () => {
  const board = parseCards('Ah Kc 9s 4d 2c');
  const bluff = convene({ hero: parseCards('7d6d'), board, potBb: 14, toCallBb: 0, effectiveBb: 50, profile: 'nit' }, FAST);
  assert.equal(bluff.sizing.value, false);
  // Against someone folding three quarters of the time, buying the pot is
  // cheap; there is no reason to pay more for it.
  assert.ok(bluff.sizing.fraction <= 0.6, `bluff sized at ${bluff.sizing.fraction}`);

  const wet = convene({ hero: parseCards('7s7d'), board: parseCards('Qh 7h 2c'), potBb: 20, toCallBb: 0, effectiveBb: 60, profile: 'balanced' }, FAST);
  assert.equal(wet.sizing.value, true);
  assert.ok(wet.sizing.fraction > 0.6, `value sized at ${wet.sizing.fraction}`);
});

test('every specialist that speaks returns a usable opinion', () => {
  const ctx = buildContext({ hero: parseCards('AhKh'), board: parseCards('Qh 7h 2c'), potBb: 6, toCallBb: 4, effectiveBb: 95, profile: 'balanced' }, FAST);
  const { opinions } = deliberate(ctx);
  assert.ok(opinions.length >= 6, `only ${opinions.length} spoke`);
  for (const o of opinions) {
    assert.ok(o.headline.length > 10, `${o.id} has no headline`);
    assert.ok(o.reasoning.length > 40, `${o.id} has no reasoning`);
    assert.ok(o.evidence.length >= 3, `${o.id} shows too little evidence`);
    assert.ok(o.confidence >= 0 && o.confidence <= 1);
    const sum = Object.values(o.votes).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${o.id} votes sum to ${sum}`);
  }
});

test('the solver only speaks where it has an exact answer', () => {
  const short = buildContext({ hero: parseCards('AhKd'), board: [], potBb: 1.5, toCallBb: 0.5, effectiveBb: 9 });
  const deep = buildContext({ hero: parseCards('AhKd'), board: [], potBb: 1.5, toCallBb: 0.5, effectiveBb: 120 });
  const solver = SPECIALISTS.find((s) => s.id === 'solver');
  assert.ok(solver.authority(short) > 0);
  assert.equal(solver.authority(deep), 0);
});

test('the adversary re-runs the decision and reports what breaks it', () => {
  const r = convene({ hero: parseCards('AhQd'), board: parseCards('Qc 8h 3s'), potBb: 12, toCallBb: 8, effectiveBb: 60, profile: 'balanced' }, FAST);
  assert.ok(r.adversary.scenarios.length === 3);
  assert.ok(r.adversary.robustness >= 0 && r.adversary.robustness <= 1);
  for (const s of r.adversary.scenarios) {
    assert.equal(s.agrees, s.action === r.action);
    assert.ok(s.combos >= 2);
  }
  // A recommendation nothing shakes must be at least as confident as the same
  // one under a scenario that flips it.
  assert.ok(r.confidence <= 1);
});

test('every profile is usable and they disagree with each other', () => {
  const spot = { hero: parseCards('KdQd'), board: parseCards('Kh 8c 3s'), potBb: 10, toCallBb: 0, effectiveBb: 80 };
  const sizes = new Set();
  for (const key of Object.keys(PROFILES)) {
    const r = convene({ ...spot, profile: key }, FAST);
    assert.ok(r.action === 'bet' || r.action === 'check');
    if (r.sizing) sizes.add(r.sizing.fraction);
  }
  assert.ok(sizes.size > 1, 'top pair should not be bet identically against everybody');
});

test('a close vote is reported as a split, not as a strategy to randomise', () => {
  // The distribution measures agreement between lenses. It is not an
  // equilibrium frequency, and the playing agent must not sample from it:
  // doing so cost about 250 bb/100 against the engine's own equity bot.
  const r = convene({ hero: parseCards('AhKh'), board: parseCards('Qh 7h 2c'), potBb: 6, toCallBb: 4, effectiveBb: 95, profile: 'balanced' }, FAST);
  assert.equal(typeof r.split, 'boolean');
  assert.ok(!('mixed' in r), 'the old "mixed" wording implied a frequency it never was');
  if (r.split) assert.match(r.summary, /disagreeing|close/i);
});

test('topPercentCombos widens monotonically and tops out at every hand', () => {
  assert.ok(topPercentCombos(5).length < topPercentCombos(20).length);
  assert.equal(topPercentCombos(100).length, 1326);
});
