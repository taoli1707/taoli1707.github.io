import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRange, rangeSummary, topPercentClasses } from '../engine/range.js';
import { parseCards, classLabel, classOf } from '../engine/cards.js';

const combos = (text, opts) => parseRange(text, opts).combos.length;

test('class tokens expand to the right number of combos', () => {
  assert.equal(combos('AA'), 6);
  assert.equal(combos('AKs'), 4);
  assert.equal(combos('AKo'), 12);
  assert.equal(combos('AK'), 16);      // bare token means both
});

test('open-ended runs walk the right axis', () => {
  assert.equal(combos('QQ+'), 18);      // QQ KK AA
  assert.equal(combos('A2s+'), 48);     // A2s..AKs, twelve classes
  assert.equal(combos('KTo+'), 36);     // KTo KJo KQo
  assert.equal(combos('AKs+'), 4);      // nothing above it
});

test('closed runs handle pairs, shared high cards and shared gaps', () => {
  assert.equal(combos('77-TT'), 24);
  assert.equal(combos('A2s-A5s'), 16);
  assert.equal(combos('T9s-65s'), 20);  // T9s 98s 87s 76s 65s
  assert.equal(combos('55-22'), 24);    // order does not matter
});

test('explicit combos and mixed lists parse', () => {
  assert.equal(combos('AhKd'), 1);
  assert.equal(combos('AA, KK, AhKd, 72o'), 6 + 6 + 1 + 12);
  // Listing a combo already covered by a class does not double count.
  assert.equal(combos('AA, AsAd'), 6);
});

test('dead cards are removed from the range', () => {
  const dead = parseCards('AsAd');
  assert.equal(combos('AA', { dead }), 1);         // only AhAc survives
  assert.equal(combos('AKs', { dead }), 2);        // AsKs and AdKd are blocked
});

test('the full range is 1326 combos and percentages are consistent', () => {
  const all = parseRange('random');
  assert.equal(all.combos.length, 1326);
  assert.equal(Math.round(rangeSummary(all).percent), 100);

  const twenty = parseRange('top 20%');
  const pct = rangeSummary(twenty).percent;
  assert.ok(pct > 17 && pct <= 21, `top 20% came out at ${pct.toFixed(1)}%`);
});

test('top percent is ordered by real equity, strongest first', () => {
  const top = topPercentClasses(5).map(classLabel);
  assert.ok(top.includes('AA'));
  assert.ok(top.includes('KK'));
  assert.ok(!top.includes('72o'));
  // Tightening can only remove hands, never add them.
  const wide = new Set(topPercentClasses(20));
  for (const id of topPercentClasses(5)) assert.ok(wide.has(id));
});

test('weights ride along with the token', () => {
  const r = parseRange('AA:0.5, KK');
  assert.equal(rangeSummary(r).combos, 6 * 0.5 + 6);
  // Zero weight drops the hand entirely.
  assert.equal(parseRange('AA:0').combos.length, 0);
});

test('garbage is rejected rather than silently ignored', () => {
  assert.throws(() => parseRange('XX'));
  assert.throws(() => parseRange('AsAs'));
  assert.throws(() => parseRange('A'));
});

test('class labels round-trip through classOf', () => {
  const r = parseRange('AKs');
  for (const [a, b] of r.combos) assert.equal(classLabel(classOf(a, b)), 'AKs');
});
