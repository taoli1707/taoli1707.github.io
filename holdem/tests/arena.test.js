import test from 'node:test';
import assert from 'node:assert/strict';
import { duel } from '../engine/arena.js';
import {
  equityAgent, callingStation, randomAgent, maniac, nit, pushFoldAgent,
  inferOpponentPercent,
} from '../engine/agents.js';

const hero = (seed) => equityAgent({ seed, iters: 200, exactLimit: 25_000 });

test('a deterministic strategy mirrored against itself scores exactly zero', () => {
  const r = duel({ a: () => callingStation(), b: () => callingStation(), deals: 400, seed: 21 });
  assert.equal(r.bbPer100, 0, `the seat swap is not a true mirror: ${r.bbPer100}`);
  assert.equal(r.hands, 800);
});

test('a randomised strategy mirrored against itself has no systematic edge', () => {
  // Duplicate deals cancel the cards but not the agent's own coin flips, and
  // per-deal results are heavy-tailed enough that any single run can wander
  // outside a normal-approximation interval. What must hold is that the drift
  // has no preferred direction, and that it is small next to a real edge.
  const seeds = [101, 202, 303, 404, 505];
  const mirror = seeds.map((seed) => duel({ a: hero, b: hero, deals: 600, seed }).bbPer100);
  const mean = mirror.reduce((a, b) => a + b, 0) / mirror.length;
  assert.ok(Math.abs(mean) < 40,
    `mirrored bot drifts ${mean.toFixed(1)} bb/100 on average: ${mirror.map((v) => v.toFixed(0))}`);

  const real = duel({ a: hero, b: () => callingStation(), deals: 600, seed: 101 }).bbPer100;
  assert.ok(real > Math.abs(mean) * 4,
    `the noise floor (${Math.abs(mean).toFixed(1)}) is too close to the measured edge (${real.toFixed(1)})`);
});

test('the equity bot beats every baseline 100bb deep', () => {
  const opponents = {
    'calling station': () => callingStation(),
    random: (s) => randomAgent({ seed: s }),
    maniac: (s) => maniac({ seed: s }),
  };
  for (const [name, factory] of Object.entries(opponents)) {
    const r = duel({ a: hero, b: factory, deals: 900, stackBb: 100, seed: 33 });
    assert.ok(r.bbPer100 > 0 && r.significant,
      `vs the ${name}: ${r.bbPer100.toFixed(1)} +/- ${r.ci95.toFixed(1)} bb/100`);
  }
});

test('the equity bot beats every baseline 10bb deep, including the nit', () => {
  const opponents = {
    'calling station': () => callingStation(),
    random: (s) => randomAgent({ seed: s }),
    maniac: (s) => maniac({ seed: s }),
    nit: (s) => nit({ seed: s }),
  };
  for (const [name, factory] of Object.entries(opponents)) {
    const r = duel({ a: hero, b: factory, deals: 900, stackBb: 10, seed: 34 });
    assert.ok(r.bbPer100 > 0 && r.significant,
      `vs the ${name}: ${r.bbPer100.toFixed(1)} +/- ${r.ci95.toFixed(1)} bb/100`);
  }
});

test('postflop play is worth something: the equity bot beats pure jam/fold when deep', () => {
  const r = duel({ a: hero, b: () => pushFoldAgent(), deals: 1600, stackBb: 100, seed: 35 });
  assert.ok(r.bbPer100 > 0 && r.significant,
    `only ${r.bbPer100.toFixed(1)} +/- ${r.ci95.toFixed(1)} bb/100 over jam-or-fold`);
});

test('short-stacked, the equity bot and the jam/fold solver agree', () => {
  // Below 15bb the equity bot defers to the same solved chart, so there should
  // be nothing left to win. A real edge here would mean one of them is wrong.
  const r = duel({ a: hero, b: () => pushFoldAgent(), deals: 600, stackBb: 10, seed: 36 });
  assert.ok(Math.abs(r.bbPer100) < 5,
    `expected near-identical play, saw ${r.bbPer100.toFixed(1)} bb/100`);
});

test('the confidence interval shrinks as the sample grows', () => {
  const small = duel({ a: hero, b: () => callingStation(), deals: 150, seed: 55 });
  const large = duel({ a: hero, b: () => callingStation(), deals: 1200, seed: 55 });
  assert.ok(large.ci95 < small.ci95);
  // Both should still agree on the sign of a large edge.
  assert.ok(small.bbPer100 > 0 && large.bbPer100 > 0);
});

test('the opponent model tightens as the opponent puts in money', () => {
  const base = { seat: 0, street: 1, log: [] };
  const wide = inferOpponentPercent(base);
  const raised = inferOpponentPercent({ ...base, log: [{ seat: 1, street: 0, type: 'raise' }] });
  const threeBet = inferOpponentPercent({
    ...base,
    log: [{ seat: 1, street: 0, type: 'raise' }, { seat: 1, street: 0, type: 'raise' }],
  });
  const barrelled = inferOpponentPercent({
    ...base,
    log: [{ seat: 1, street: 0, type: 'raise' }, { seat: 1, street: 1, type: 'raise' }],
  });
  assert.ok(wide > raised && raised > threeBet);
  assert.ok(barrelled < raised, 'a continuation bet should narrow the range further');
  // Our own actions must not move our read on them.
  assert.equal(
    inferOpponentPercent({ ...base, log: [{ seat: 0, street: 0, type: 'raise' }] }),
    wide,
  );
});
