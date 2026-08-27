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
  spot.js        situation primitives: pot odds, outs, texture, blockers
  council.js     the multi-agent system — nine specialists and a chair
data/
  preflop-equity.js   GENERATED 169x169 all-in equity table (~40 KB)
  preflop.js          derived tables: card removal, hand ranking
  study.js            GENERATED findings the strategy page reads
tools/
  build-preflop.mjs   regenerates the table (multi-threaded, a few minutes)
  study.mjs           runs the council at scale and writes data/study.js

index.html       the engine: equity, push/fold, play, arena
strategy.html    the council: ask it about a hand, and everything it concluded
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

## The council

`engine/council.js` answers "what should I do with this hand?" with nine
specialists instead of one estimator. Each gets the same situation, looks at it
through exactly one lens, and returns a distribution over the legal actions plus
a confidence — never an action, and never without the numbers it used. A chair
pools the votes weighted by confidence and by how much authority that lens has
in that spot, and a tenth agent then re-runs the whole thing under three worse
assumptions about the opponent and reports whether the answer survives.

```js
import { convene } from './engine/council.js';
import { parseCards } from './engine/cards.js';

const r = convene({
  hero: parseCards('7d6d'),
  board: parseCards('Ah Kc 9s 4d 2c'),
  potBb: 14, toCallBb: 0, effectiveBb: 50,
  profile: 'nit',            // balanced | station | nit | maniac | unknown
});

r.phrase;        // "Bet 4.62bb (33% pot)"
r.confidence;    // 0.64
r.opinions;      // every agent: headline, evidence, reasoning, weight
r.adversary;     // the three scenarios and whether each flips the answer
```

Two design decisions did most of the work:

**Agents may abstain.** Averaging nine opinions never bluffed. Hold seven-six on
an ace-king board against someone folding three times in four and the equity,
texture and stack agents all reported nothing worth betting — each correct about
its own lens, collectively wrong, because none of those lenses can see fold
equity at all. Those agents now vote 50/50 at a confidence of 0.15 and say so in
their headline, handing the question to the one agent that can answer it.

**A close vote is not a frequency.** The playing agent originally sampled its
action from the distribution and lost to the engine's own equity bot at
−283 ± 125 bb/100. Taking the top action instead, with nothing else changed,
brought the same matchup to −32 ± 100. A vote share measures how much the lenses
agree; it is not an equilibrium frequency, and playing it as one is expensive.
The only genuine mixing here is the solver's, which is computed rather than
voted on.

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

**The council — reasoning you can audit, not a solver.** Every number it argues
from is computed here and shown; the arithmetic (pot odds, MDF, outs against a
range, board texture, blockers) is exact and the equity is enumerated or sampled
with stated error. What is *judged* rather than computed is the scaffolding
around it: the authority weights, the confidence curves, the sizing rules and
the five opponent profiles. Those are engineering choices tuned against the
tests and the benchmark, and they are the part most likely to be wrong. Outside
the short-stack preflop game it estimates — carefully, but it estimates.

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
is being handed the pot and never widens to take it. The council below is what
fixed that.

**Nash jam/fold at 10bb** comes out at exactly 0 ± 0, which is the intended
result rather than a broken measurement: below 15bb the equity bot defers to the
same solved chart, both agents then play every hand identically, and duplicate
deals cancel identical play perfectly.

Note on the intervals: per-deal results are heavy-tailed, so the normal
approximation runs slightly narrow at small samples. A result sitting on the
edge of its interval needs more deals, or more seeds.

### The council, playing

Same arena, 3,000 hands per matchup (1,500 duplicated deals), regenerated by
`npm run study`:

| Opponent        | 100bb deep | 20bb deep |
|-----------------|-----------:|----------:|
| Maniac          | +1118 ± 120 | +128 ± 34 |
| Random          |  +728 ± 127 | — |
| Calling station |  +426 ± 45 | +159 ± 32 |
| Nit             |   +28 ± 19 |  +13 ± 12 |
| Equity bot      |   −49 ± 50 |   +2 ± 20 |

The **nit at 100bb** is the row that matters: +28 ± 19 is a real edge where the
equity bot had none. Nothing about hand strength changed — the exploit agent
simply gets loud in proportion to how extreme the read is, so against an
opponent folding 74% of the time it outvotes the lenses that only know how often
the hand wins at showdown. That is the abstention rule earning its place.

Against the **equity bot** the council is even rather than ahead (−49 ± 50 and
+2 ± 20, both inside their intervals). It reasons better and it is roughly forty
times slower per decision; on this evidence that trade has not yet bought
anything against a competent opponent, and saying otherwise would be dishonest.
Two bugs found while measuring this are documented above and in the source: the
pot convention, and sampling actions from the vote share.

## Development

```
npm test               # 55 tests, about 40s
npm run build-preflop  # regenerate data/preflop-equity.js
```

`build-preflop.mjs` takes `--samples` (default 120,000 boards per matchup) and
`--threads`. It runs for a few minutes and prints well-known matchups at the end
so a bad build is obvious immediately.
