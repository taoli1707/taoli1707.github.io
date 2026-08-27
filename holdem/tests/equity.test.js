import test from 'node:test';
import assert from 'node:assert/strict';
import { equity, handVsHand } from '../engine/equity.js';
import { parseCards } from '../engine/cards.js';
import { parseRange } from '../engine/range.js';

const pct = (x) => (x * 100).toFixed(2);

test('AA versus KK matches the published number exactly', () => {
  // All 36 disjoint combo pairings, all 1,712,304 boards each: 81.71% / 0.46%.
  const r = equity({
    ranges: [parseRange('AA'), parseRange('KK')],
    exactLimit: 1e9,
  });
  assert.ok(r.exact);
  assert.equal(r.iterations, 61_642_944);
  assert.ok(Math.abs(r.equity[0] - 0.81946) < 0.0005, `got ${pct(r.equity[0])}%`);
  assert.ok(Math.abs(r.tie[0] - 0.00461) < 0.0005, `tie ${pct(r.tie[0])}%`);
});

test('specific suits change the answer, and the engine notices', () => {
  // Four distinct suits give the underdog more flush outs than a double-suited
  // matchup does, so AA is worth measurably less here.
  const spread = handVsHand(parseCards('AsAd'), parseCards('KcKh'), [], { exactLimit: 1e9 });
  const shared = handVsHand(parseCards('AsAd'), parseCards('KsKd'), [], { exactLimit: 1e9 });
  assert.ok(shared.equity[0] > spread.equity[0]);
  assert.ok(Math.abs(spread.equity[0] - 0.8126) < 0.002, pct(spread.equity[0]));
});

test('classic coin flips land where they should', () => {
  const cases = [
    ['AsKs', 'QcQh', 0.462, 0.006],  // suited overcards vs a pair
    ['AsKd', 'QcQh', 0.431, 0.006],  // offsuit costs about three points
    ['7h2c', 'AsAd', 0.126, 0.006],  // the worst hand in the deck
    // 41.9%, not the 41.0% the class-average table gives for 54s vs AKo: here
    // the spades are live against a red ace-king, so the flush outs are intact.
    ['5s4s', 'AhKd', 0.419, 0.006],
  ];
  for (const [hero, villain, expected, tol] of cases) {
    const r = handVsHand(parseCards(hero), parseCards(villain), [], { exactLimit: 1e9 });
    assert.ok(Math.abs(r.equity[0] - expected) < tol,
      `${hero} vs ${villain}: ${pct(r.equity[0])}% (expected ~${pct(expected)}%)`);
  }
});

test('equities across all players sum to one', () => {
  const r = equity({
    ranges: [parseRange('AA'), parseRange('KK'), parseRange('QQ')],
    iters: 40_000,
    seed: 5,
  });
  const total = r.equity.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(total - 1) < 1e-9, `summed to ${total}`);
  assert.ok(r.equity[0] > r.equity[1] && r.equity[1] > r.equity[2]);
});

test('Monte Carlo converges on the exact answer', () => {
  const board = parseCards('Ah7s2d');
  const exact = handVsHand(parseCards('KsKd'), parseCards('QcJh'), board, { exactLimit: 1e9 });
  const sampled = handVsHand(parseCards('KsKd'), parseCards('QcJh'), board,
    { exactLimit: 0, iters: 200_000, seed: 9 });
  assert.ok(exact.exact && !sampled.exact);
  assert.ok(Math.abs(exact.equity[0] - sampled.equity[0]) < 0.005,
    `exact ${pct(exact.equity[0])}% vs sampled ${pct(sampled.equity[0])}%`);
  // The reported standard error should be honest about that gap.
  assert.ok(sampled.stdError > 0 && sampled.stdError < 0.005);
});

test('a made hand on the river is either ahead or behind, never both', () => {
  const board = parseCards('AhKhQh7s2d');
  const r = handVsHand(parseCards('JhTh'), parseCards('AsAd'), board, { exactLimit: 1e9 });
  assert.equal(r.equity[0], 1); // royal flush
  assert.equal(r.iterations, 1);
});

test('blockers shrink the opposing range', () => {
  // Holding two aces leaves the opponent only one AA combo instead of six.
  const r = equity({
    ranges: [parseRange('AsAd'), parseRange('AA')],
    iters: 5_000,
    seed: 3,
  });
  assert.ok(r.equity[0] > 0.49 && r.equity[0] < 0.51, pct(r.equity[0]));
});

test('impossible spots are rejected, not quietly fudged', () => {
  assert.throws(() => equity({ ranges: [parseRange('AA')] }), /two ranges/);
  assert.throws(() => equity({
    ranges: [parseRange('AsAd'), parseRange('AsKd')],
    board: parseCards('AsKhQh'),
  }), /empty/);
  assert.throws(() => equity({
    ranges: [parseRange('AA'), parseRange('KK')],
    board: parseCards('2h2h3d4c'),
  }));
});

test('ranges beat the hands inside them on average, not always', () => {
  const wide = equity({ ranges: [parseRange('AA'), parseRange('random')], iters: 30_000, seed: 4 });
  const narrow = equity({ ranges: [parseRange('AA'), parseRange('top 5%')], iters: 30_000, seed: 4 });
  assert.ok(wide.equity[0] > narrow.equity[0],
    'aces should do better against everything than against the top 5%');
  assert.ok(Math.abs(wide.equity[0] - 0.852) < 0.01, pct(wide.equity[0]));
});
