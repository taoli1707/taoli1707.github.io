import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, evaluateHand, categoryOf, describe, CATEGORY } from '../engine/evaluator.js';
import { parseCards } from '../engine/cards.js';

const score = (s) => evaluate(parseCards(s));

test('every 5-card hand lands in the right category', () => {
  // 2,598,960 hands against the textbook frequencies. If the evaluator has a
  // hole anywhere, exactly one of these counts moves.
  const counts = new Array(9).fill(0);
  const hand = new Int32Array(5);
  for (let a = 0; a < 52; a++)
    for (let b = a + 1; b < 52; b++)
      for (let c = b + 1; c < 52; c++)
        for (let d = c + 1; d < 52; d++)
          for (let e = d + 1; e < 52; e++) {
            hand[0] = a; hand[1] = b; hand[2] = c; hand[3] = d; hand[4] = e;
            counts[categoryOf(evaluate(hand, 5))]++;
          }
  assert.deepEqual(counts, [1302540, 1098240, 123552, 54912, 10200, 5108, 3744, 624, 40]);
});

test('categories rank in the right order', () => {
  const ordered = [
    'AsQd9c5h3s', 'AsAd7c4h2s', 'AsAdKsKd9c', '7s7d7cKs2d',
    '9d8c7h6s5d', 'As9s7s4s2s', 'KsKdKcQsQd', 'AsAdAcAh2s', 'AsKsQsJsTs',
  ];
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(score(ordered[i]) > score(ordered[i - 1]),
      `${ordered[i]} should beat ${ordered[i - 1]}`);
  }
});

test('the wheel is the worst straight and the ace plays low', () => {
  assert.equal(categoryOf(score('5s4d3c2hAs')), CATEGORY.STRAIGHT);
  assert.ok(score('5s4d3c2hAs') < score('6s5d4c3h2d'));
  assert.equal(categoryOf(score('5s4s3s2sAs')), CATEGORY.STRAIGHT_FLUSH);
  assert.ok(score('5s4s3s2sAs') < score('6s5s4s3s2s'));
});

test('kickers decide, and only the top five cards count', () => {
  assert.ok(score('AsAdKcQh9s') > score('AsAdKcJh9s'));
  // The sixth and seventh cards fall outside the best five and cannot matter:
  // both hands are aces with a K-Q-9 kicker.
  assert.equal(
    evaluate(parseCards('AsAdKcQh9s4d3c'), 7),
    evaluate(parseCards('AsAdKcQh9s5d3c'), 7),
  );
  // But a card that makes a second pair does change the hand.
  assert.ok(
    evaluate(parseCards('AsAdKcQh9s2d2h'), 7) > evaluate(parseCards('AsAdKcQh9s4d3c'), 7),
  );
});

test('seven cards pick the best five', () => {
  // Board pairs the deuce; the hand is a full house, not trips.
  const s = evaluateHand(...parseCards('7s7d'), parseCards('7c2h2d'));
  assert.equal(categoryOf(s), CATEGORY.FULL_HOUSE);
  assert.equal(describe(s), 'Full house, sevens full of deuces');
});

test('a flush on the board is beaten by a bigger card in hand', () => {
  const board = parseCards('Ks9s7s4s2h');
  const withAce = evaluateHand(...parseCards('AsQd'), board);
  const withQueen = evaluateHand(...parseCards('QsJd'), board);
  assert.ok(withAce > withQueen);
  assert.equal(describe(withAce), 'Flush, ace high');
});

test('two pair can be counterfeited by the board', () => {
  // 5-4 on a board that pairs higher twice: both players play the board's
  // two pair with an ace kicker and chop.
  const board = parseCards('KcKd9h9sAc');
  assert.equal(
    evaluateHand(...parseCards('5s4d'), board),
    evaluateHand(...parseCards('3s2d'), board),
  );
});

test('quads with a pair keeps the highest kicker', () => {
  const s = evaluateHand(...parseCards('2s2d'), parseCards('2c2hAsAd9c'));
  assert.equal(categoryOf(s), CATEGORY.QUADS);
  assert.equal(describe(s), 'Four of a kind, deuces');
  // Ace kicker beats the same quads with a nine.
  assert.ok(s > evaluate(parseCards('2s2d2c2h9c'), 5));
});

test('two sets make a full house using the higher trips', () => {
  const s = evaluate(parseCards('9s9d9cKsKdKc4h'), 7);
  assert.equal(describe(s), 'Full house, kings full of nines');
});
