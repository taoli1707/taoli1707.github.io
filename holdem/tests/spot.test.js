import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCards, classOf, classLabel } from '../engine/cards.js';
import { parseRange } from '../engine/range.js';
import {
  requiredEquity, bluffBreakEven, minDefenceFrequency, spr,
  madeHand, draws, boardTexture, rangeShape, blockerEffect, outsVsRange, topOfRange,
} from '../engine/spot.js';

test('pot arithmetic is the textbook arithmetic', () => {
  // Half-pot bet: call 5 to win 15 → 25%.
  assert.equal(requiredEquity(15, 5), 0.25);
  // A pot-sized bluff risks 10 to win 10 → must work half the time.
  assert.equal(bluffBreakEven(10, 10), 0.5);
  // ... which is the same as saying the other player may not fold more than half.
  assert.equal(minDefenceFrequency(10, 10), 0.5);
  assert.equal(minDefenceFrequency(10, 5), 10 / 15);
  assert.equal(spr(100, 10), 10);
});

test('the nuts is the nuts and knows nothing beats it', () => {
  const m = madeHand(parseCards('AsKs'), parseCards('Qs Js Ts 4d 2c'));
  assert.equal(m.text, 'Royal flush');
  assert.equal(m.combosBeating, 0);
  assert.equal(m.isNuts, true);
  assert.equal(m.absoluteRank, 1);
});

test('made hand counts every combo that beats it', () => {
  const board = parseCards('Qh 7h 2c');
  const m = madeHand(parseCards('Ac Qd'), board);
  assert.equal(m.categoryName, 'Pair');
  // Top pair top kicker on this board: only sets and two pair are ahead.
  assert.ok(m.combosBeating > 0 && m.combosBeating < 60, `unexpected ${m.combosBeating}`);
  assert.equal(m.combosBeating + m.combosTying + Math.round(m.absoluteRank * m.combosTotal), m.combosTotal);
});

test('a draw only counts when your own cards make it', () => {
  const board = parseCards('Qh 7h 2c');
  const mine = draws(parseCards('AhKh'), board);
  assert.equal(mine.flushDraw, true);
  assert.equal(mine.overcards, 2);

  // Two hearts on the board and none in hand is not a flush draw.
  const not = draws(parseCards('AcKd'), board);
  assert.equal(not.flushDraw, false);

  // 98 on a J-T-2 board is an open-ender; 9 alone would be a gutshot.
  const oesd = draws(parseCards('9c8c'), parseCards('Jh Td 2s'));
  assert.equal(oesd.openEnded, true);
  // AQ on J-T-2 needs exactly one card, the king: a gutshot.
  const gut = draws(parseCards('AcQc'), parseCards('Jh Td 2s'));
  assert.equal(gut.gutshot, true);
  assert.equal(gut.openEnded, false);
  // 94 on the same board needs two cards, so it is not a draw at all.
  assert.deepEqual(draws(parseCards('9c4c'), parseCards('Jh Td 2s')).straightOuts, []);
});

test('outs are counted against the range, not against the imagination', () => {
  // The classic 15-outer: nut flush draw plus two overcards, against a range
  // wide enough that pairing up is genuinely good enough.
  const wide = parseRange('22+, A2s+, KTs+, QJs, AJo+, KQo');
  const o = outsVsRange(parseCards('AhKh'), parseCards('Qh 7h 2c'), wide.combos);
  assert.equal(o.count, 15);
  assert.ok(o.outs.includes('Th') && o.outs.includes('Ks') && o.outs.includes('Ad'));

  // Against a range full of sets and queens the same hand has nine outs, not
  // fifteen: an ace gives the AQ combos two pair and a king gives KQ two pair,
  // so pairing up improves the opponent faster than it improves hero. Only the
  // flush is a real out, which is exactly the kind of thing counting outs off
  // the hand instead of off the range gets wrong.
  const strong = parseRange('QQ, 77, 22, AQo, KQs');
  const tight = outsVsRange(parseCards('AhKh'), parseCards('Qh 7h 2c'), strong.combos);
  assert.equal(tight.count, 9);
  assert.ok(!tight.outs.includes('Ks') && !tight.outs.includes('Ad'));
  assert.ok(tight.outs.every((c) => c.endsWith('h')));
  assert.equal(tight.aheadNow, 0);
});

test('board texture separates a dry board from a soaking one', () => {
  const dry = boardTexture(parseCards('Kd 7c 2h'));
  const wet = boardTexture(parseCards('Jh Th 9h'));
  assert.equal(dry.rainbow, true);
  assert.equal(dry.flushPossible, false);
  assert.equal(wet.monotone, true);
  assert.equal(wet.flushPossible, true);
  assert.ok(wet.wetness > dry.wetness * 2, `${wet.wetness} vs ${dry.wetness}`);

  const paired = boardTexture(parseCards('Kd Kc 2h'));
  assert.equal(paired.paired, true);
  assert.ok(paired.strongShare > dry.strongShare, 'a paired board makes more strong hands');
});

test('range shape adds up and reflects the board', () => {
  const r = parseRange('22+, AJs+, KQs, AQo+');
  const s = rangeShape(r.combos, parseCards('Qh 7h 2c'));
  const total = s.nutted + s.strong + s.marginal + s.drawing + s.air;
  assert.ok(Math.abs(total - 1) < 1e-9, `shares sum to ${total}`);
  assert.ok(s.marginal > 0.3, 'a broadway-heavy range pairs this board often');
});

test('blockers count the value combos your own cards remove', () => {
  const board = parseCards('Qh 7h 2c');
  const villain = parseRange('QQ, 77, 22');
  // Holding two queens removes every remaining queen-set combo.
  const withQ = blockerEffect(parseCards('Qs Qd'), board, villain.combos);
  const without = blockerEffect(parseCards('As Kd'), board, villain.combos);
  assert.ok(withQ.share > without.share);
  assert.equal(without.blocked, 0);
});

test('topOfRange orders by board strength, and by all-in strength preflop', () => {
  const r = parseRange('22+, A2s+, KTs+, AJo+');
  const pre = topOfRange(r.combos, [], 0.05).map(([a, b]) => classLabel(classOf(a, b)));
  assert.ok(pre.every((l) => l === 'AA' || l === 'KK'), `got ${[...new Set(pre)]}`);

  const board = parseCards('Qh 7h 2c');
  const post = topOfRange(r.combos, board, 0.04);
  // The strongest hands on a queen-high board are the sets.
  const labels = new Set(post.map(([a, b]) => classLabel(classOf(a, b))));
  assert.ok(labels.has('QQ') || labels.has('77') || labels.has('22'), `got ${[...labels]}`);
});
