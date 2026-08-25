# Hold'em Engine

A local Texas Hold'em analysis engine: an exact hand evaluator, range-vs-range
equity, a Nash push/fold solver, a rules-complete heads-up game, playing agents
and a benchmarking arena. No dependencies, no network, no build step — plain ES
modules that run identically in Node and the browser.

Open `index.html` from any static server for the UI, or import from `engine/`
directly.

## Scope

This analyses poker away from the table. It is not connected to any poker site
and is not built to be. Reading another site's screen and acting for you breaks
the terms of every real-money room and takes money from people who believe they
are playing a human — that is cheating, not engineering, and it generally ends
with a seized balance. The mathematics is the legitimate part, and it is also
the part that actually improves your play.

## Layout

```
engine/
  cards.js       card encoding, the 169 starting-hand classes
  evaluator.js   exact 5-, 6- and 7-card evaluator
  range.js       range notation: 77+, A2s+, T9s-65s, top 15%, AA:0.5
  equity.js      exact enumeration or seeded Monte Carlo, with error bars
  pushfold.js    heads-up jam/fold Nash equilibrium by fictitious play
  game.js        heads-up no-limit rules: min-raises, short all-ins, refunds
  agents.js      the equity bot plus the baselines it has to beat
  arena.js       duplicate-deal benchmarking with paired confidence intervals
  rng.js         seeded RNG so every result reproduces
data/
  preflop-equity.js   GENERATED 169x169 all-in equity table (~40 KB)
  preflop.js          derived tables: card removal, hand ranking
tools/
  build-preflop.mjs   regenerates the table (multi-threaded, a few minutes)
```

## Using it

```js
import { parseRange } from './engine/range.js';
import { equity } from './engine/equity.js';
import { parseCards } from './engine/cards.js';

const r = equity({
  ranges: [parseRange('8h7h'), parseRange('top 12%')],
  board: parseCards('9h6c2h'),
});
r.equity[0];  // 0.599 — and r.exact is true, so that is not an estimate
```

```js
import { solvePushFold } from './engine/pushfold.js';

const chart = solvePushFold(10);   // 10 big blinds
chart.shovePercent;                // 58.4
chart.callPercent;                 // 37.4
chart.shove[/* class id */];       // 0..1, mixed on the frontier
```

```js
import { duel } from './engine/arena.js';
import { equityAgent, callingStation } from './engine/agents.js';

duel({
  a: (seed) => equityAgent({ seed }),
  b: () => callingStation(),
  deals: 5000,
});  // { bbPer100: 245.7, ci95: 26.1, significant: true, ... }
```

## How far to trust each piece

**Evaluator — exact.** Verified against all 2,598,960 five-card hands: every
category count matches the textbook frequencies exactly. Roughly 4M seven-card
evaluations per second, allocation-free.

**Equity — exact where it can be.** If the remaining tree fits inside
`exactLimit`, every runout is enumerated and there is no sampling error at all;
otherwise it samples with a seeded RNG and reports the standard error. Checked
against published equities: AA vs KK enumerates to 81.71% / 17.82% / 0.46%,
AKs vs QQ to 46.2%, AA vs a random hand to 85.2%.

**Push/fold — a real equilibrium.** Fictitious play over all 169 classes, using
exact card removal rather than the naive combo weighting most charts use.
Residual exploitability across 2–25bb stays under 1e-5 bb, and the frontier
comes out genuinely thin: at any given stack only a couple of hands mix, the
rest are pure. The output reproduces the published Nash charts (10bb: shove
58%, call 37%) including the known result that jam-or-fold stops being
profitable for the small blind at around 7bb.

**The bot — a strong heuristic, and no more than that.** It estimates equity
against a modelled opponent range and prices its decisions properly, which is
enough to beat every baseline here by a wide margin. It is not solved poker.
Its bluff frequency is a fixed constant, its bet sizing is conventional rather
than derived, and its opponent model only reacts to aggression — so it never
adjusts to an opponent who folds too much, and a thinking human will find lines
against it. Below 15bb preflop it defers to the solved push/fold chart, which
is why it and the jam/fold agent are indistinguishable at that depth.

## Benchmarks

Equity bot against each baseline, 8,000 hands per matchup (4,000 duplicated
deals), bb/100 with 95% intervals:

| Opponent        | 100bb deep | 10bb deep |
|-----------------|-----------:|----------:|
| Calling station |  +226 ± 16 |  +63 ± 9 |
| Random          |  +744 ± 74 |  +51 ± 9 |
| Maniac          | +1263 ± 71 |  +37 ± 11 |
| Nit             |    +7 ± 15 |  +27 ± 4 |
| Nash jam/fold   |   +28 ± 19 |   0 ± 0 |

Two rows are worth reading closely.

The **nit**, 100bb deep, is where the bot stops working: +7 ± 15 is no edge at
all against an opponent that folds almost everything. The bot bluffs at a fixed
rate and its opponent model only reacts to aggression, so it never notices it
is being handed the pot and never widens to take it. That is the single
clearest thing to fix.

**Nash jam/fold at 10bb** comes out at exactly 0 ± 0, which is the intended
result rather than a broken measurement: below 15bb the equity bot defers to the
same solved chart, both agents then play every hand identically, and duplicate
deals cancel identical play perfectly.

Note on the intervals: per-deal results are heavy-tailed, so the normal
approximation runs slightly narrow at small samples. A result sitting on the
edge of its interval needs more deals, or more seeds.

## Development

```
npm test               # 55 tests, about 40s
npm run build-preflop  # regenerate data/preflop-equity.js
```

`build-preflop.mjs` takes `--samples` (default 120,000 boards per matchup) and
`--threads`. It runs for a few minutes and prints well-known matchups at the end
so a bad build is obvious immediately.
