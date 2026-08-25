import test from 'node:test';
import assert from 'node:assert/strict';
import { solvePushFold, jamEv } from '../engine/pushfold.js';
import { classOf, classLabel, parseCards } from '../engine/cards.js';
import { EQUITY, EQUITY_VS_RANDOM, PAIR_COUNTS, CLASS_RANK } from '../data/preflop.js';

const idOf = (text) => {
  const [a, b] = parseCards(text);
  return classOf(a, b);
};

test('the equity matrix is internally consistent', () => {
  for (let i = 0; i < 169; i++) {
    assert.equal(EQUITY[i * 169 + i], 0.5, `${classLabel(i)} vs itself must be a coin flip`);
    for (let j = 0; j < 169; j++) {
      const sum = EQUITY[i * 169 + j] + EQUITY[j * 169 + i];
      assert.ok(Math.abs(sum - 1) < 1e-6, `${classLabel(i)}/${classLabel(j)} summed to ${sum}`);
    }
  }
});

test('card removal is exact, so hands block themselves', () => {
  const aa = idOf('AsAd');
  const aks = idOf('AsKs');
  // Both players hold aces only one way: each takes two of the four, so six
  // hero combos leave exactly one villain combo apiece.
  assert.equal(PAIR_COUNTS[aa * 169 + aa], 6);
  // AKs against AKs must use different suits: 4 x 3.
  assert.equal(PAIR_COUNTS[aks * 169 + aks], 12);
  // Ranks that do not overlap at all block nothing: every pairing is legal.
  assert.equal(PAIR_COUNTS[aks * 169 + idOf('QsJs')], 16);
});

test('equity against a random hand matches the published table', () => {
  const expected = { AA: 0.852, KK: 0.824, QQ: 0.799, AKs: 0.671, AKo: 0.653, '72o': 0.346, '32o': 0.323 };
  for (const [label, value] of Object.entries(expected)) {
    const got = EQUITY_VS_RANDOM[idOf(label === '72o' ? '7h2c' : label === '32o' ? '3h2c'
      : label === 'AKs' ? 'AsKs' : label === 'AKo' ? 'AsKd' : label[0] + 's' + label[1] + 'd')];
    assert.ok(Math.abs(got - value) < 0.004, `${label}: ${(got * 100).toFixed(1)}% vs ${value * 100}%`);
  }
  assert.equal(CLASS_RANK[idOf('AsAd')], 1, 'aces are the best starting hand');
});

test('the solved jam and call ranges match published Nash charts', () => {
  // Tolerances are wide enough to absorb sampling noise in the equity table
  // but narrow enough that a broken solver cannot slip through.
  const cases = [
    { stack: 5, jam: 72, call: 62 },
    { stack: 8, jam: 62, call: 45 },
    { stack: 10, jam: 58, call: 37 },
    { stack: 15, jam: 46, call: 29 },
    { stack: 20, jam: 40, call: 22 },
  ];
  for (const { stack, jam, call } of cases) {
    const r = solvePushFold(stack);
    assert.ok(Math.abs(r.shovePercent - jam) < 4,
      `${stack}bb jam ${r.shovePercent.toFixed(1)}% (expected ~${jam}%)`);
    assert.ok(Math.abs(r.callPercent - call) < 4,
      `${stack}bb call ${r.callPercent.toFixed(1)}% (expected ~${call}%)`);
  }
});

test('the equilibrium is actually an equilibrium', () => {
  for (const stack of [5, 10, 20]) {
    const r = solvePushFold(stack);
    assert.ok(r.exploitability < 1e-4,
      `${stack}bb still exploitable for ${r.exploitability.toExponential(2)} bb`);
  }
});

test('ranges tighten as stacks get deeper', () => {
  let previousJam = 101;
  let previousCall = 101;
  for (const stack of [3, 5, 8, 10, 13, 16, 20, 25]) {
    const r = solvePushFold(stack);
    assert.ok(r.shovePercent <= previousJam + 1, `jam range widened at ${stack}bb`);
    assert.ok(r.callPercent <= previousCall + 1, `call range widened at ${stack}bb`);
    previousJam = r.shovePercent;
    previousCall = r.callPercent;
  }
});

test('jam or fold stops being profitable for the small blind around 7bb', () => {
  assert.ok(solvePushFold(5).sbEv > 0, 'shallow: forcing an all-in is good for the SB');
  assert.ok(solvePushFold(15).sbEv < 0, 'deep: giving up every other line costs the SB');
});

test('always jam aces, never jam the worst hand at 20bb', () => {
  const r = solvePushFold(20);
  assert.equal(r.shove[idOf('AsAd')], 1);
  assert.equal(r.call[idOf('AsAd')], 1);
  assert.equal(r.shove[idOf('3h2c')], 0);
  assert.equal(r.call[idOf('3h2c')], 0);
  // Hands on the boundary are genuinely mixed, not snapped to pure.
  const mixed = Array.from(r.shove).filter((v) => v > 0.02 && v < 0.98);
  assert.ok(mixed.length > 0, 'a Nash jam range should have a mixed frontier');
});

test('jam EV ranks hands the way the chart does', () => {
  const r = solvePushFold(10);
  const aces = jamEv(idOf('AsAd'), 10, r.call);
  const trash = jamEv(idOf('3h2c'), 10, r.call);
  assert.ok(aces > trash);
  assert.ok(aces > -0.5, 'jamming aces beats folding');
  assert.ok(trash < -0.5, 'jamming 32o does not');
});
