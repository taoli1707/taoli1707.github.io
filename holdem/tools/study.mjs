// Run the council at scale and write down what it found.
//
// Three kinds of output, and they are not equally trustworthy — the page says
// which is which:
//
//   1. Solved.   Nash jam/fold thresholds per hand class. Exact.
//   2. Computed. Pot odds, board texture, blocker counts. Arithmetic.
//   3. Measured. The council playing actual hands against the baselines,
//                with confidence intervals, because this one can be wrong.
//
//   node tools/study.mjs [--deals 800] [--threads 4] [--quick]

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { ALL_CLASS_IDS, classLabel, combosOfClass, parseCards } from '../engine/cards.js';
import { pushFoldChart } from '../engine/pushfold.js';
import { convene, PROFILES } from '../engine/council.js';
import { boardTexture, requiredEquity, minDefenceFrequency, bluffBreakEven } from '../engine/spot.js';
import { EQUITY_VS_RANDOM } from '../data/preflop.js';
import { duel } from '../engine/arena.js';
import * as agents from '../engine/agents.js';

const self = fileURLToPath(import.meta.url);

// The matchups the benchmark runs. `stack` matters more than it looks: the
// council plays a solved game at 20bb and an improvised one at 100bb, and the
// gap between those two rows is the honest measure of how much of this is real.
const MATCHUPS = [
  ['Calling station', 'station', 100], ['Calling station', 'station', 20],
  ['Nit', 'nit', 100], ['Nit', 'nit', 20],
  ['Maniac', 'maniac', 100], ['Maniac', 'maniac', 20],
  ['Random', 'random', 100],
  ['Equity bot', 'equity', 100], ['Equity bot', 'equity', 20],
];

function makeOpponent(key) {
  const f = agents.AGENTS[key];
  return (seed) => f({ seed });
}

// ── Worker: one benchmark matchup ─────────────────────────────────────────

if (!isMainThread) {
  const { indices, deals, seed } = workerData;
  const out = [];
  for (const i of indices) {
    const [name, key, stack] = MATCHUPS[i];
    const r = duel({
      a: (s) => agents.councilAgent({ seed: s }),
      b: makeOpponent(key),
      deals, stackBb: stack, seed: seed + i * 977,
    });
    out.push({
      index: i, opponent: name, stackBb: stack, deals,
      bbPer100: r.bbPer100, ci95: r.ci95, showdownRate: r.showdownRate,
    });
    parentPort.postMessage({ progress: name + ' @ ' + stack + 'bb' });
  }
  parentPort.postMessage({ done: true, out });
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const arg = (flag, dflt) => {
    const i = process.argv.indexOf(flag);
    return i >= 0 ? Number(process.argv[i + 1]) : dflt;
  };
  const quick = process.argv.includes('--quick');
  const deals = arg('--deals', quick ? 60 : 800);
  const threads = Math.max(1, Math.min(arg('--threads', 4), os.cpus().length));

  // ── 1. Solved: how deep each hand stays a jam, and a call ────────────────
  process.stderr.write('solving push/fold 1..25bb ');
  const depths = [];
  for (let s = 1; s <= 25; s += 0.5) depths.push(Math.round(s * 10) / 10);
  const jamThreshold = new Array(169).fill(0);
  const callThreshold = new Array(169).fill(0);
  for (const s of depths) {
    const c = pushFoldChart(s);
    for (const id of ALL_CLASS_IDS) {
      if (c.shove[id] > 0.5) jamThreshold[id] = s;
      if (c.call[id] > 0.5) callThreshold[id] = s;
    }
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  const chartDepths = quick ? [10] : [5, 8, 10, 15, 20];
  const charts = {};
  for (const s of chartDepths) {
    const c = pushFoldChart(s);
    charts[s] = {
      shove: Array.from(c.shove, (x) => Math.round(x * 100) / 100),
      call: Array.from(c.call, (x) => Math.round(x * 100) / 100),
      shovePercent: Math.round(c.shovePercent * 10) / 10,
      callPercent: Math.round(c.callPercent * 10) / 10,
      exploitability: c.exploitability,
    };
  }

  // ── 2. Computed: prices and boards ───────────────────────────────────────
  const potOdds = [0.25, 0.33, 0.5, 0.66, 0.75, 1, 1.5, 2].map((f) => ({
    label: `${Math.round(f * 100)}% pot`,
    required: requiredEquity(1 + f, f),
    mdf: minDefenceFrequency(1, f),
    bluffBreakEven: bluffBreakEven(1, f),
  }));

  const BOARDS = [
    ['Kd 7c 2h', 'dry, disconnected, one high card'],
    ['Ah Kd Qc', 'high and connected'],
    ['Jh Th 9h', 'monotone and connected — the wettest board in the deck'],
    ['Kd Kc 2h', 'paired'],
    ['8h 7h 6d', 'low and coordinated'],
    ['Ad 8c 3s', 'ace high, rainbow, disconnected'],
    ['Qs Jd 4h', 'two broadway cards'],
    ['2c 2d 2h', 'the board plays itself'],
  ];
  const textures = BOARDS.map(([b, note]) => {
    const t = boardTexture(parseCards(b));
    return {
      board: b, note,
      strongShare: t.strongShare, drawShare: t.drawShare, wetness: t.wetness,
      paired: t.paired, flushPossible: t.flushPossible, nutText: t.nutText,
    };
  });

  // ── 3. What the council recommends, hand by hand ─────────────────────────
  process.stderr.write('council preflop grid ');
  const iters = quick ? 800 : 2500;
  const preflopGrid = [];
  for (const id of ALL_CLASS_IDS) {
    const hero = combosOfClass(id)[0];
    const deep = convene(
      { hero, board: [], potBb: 1.5, toCallBb: 0.5, effectiveBb: 100, position: 'ip', profile: 'unknown' },
      { iters, seed: 3, skipAdversary: true },
    );
    preflopGrid.push({
      id, label: classLabel(id),
      equity: Math.round(EQUITY_VS_RANDOM[id] * 1000) / 1000,
      action: deep.action,
      share: Math.round((deep.distribution[deep.action] || 0) * 100) / 100,
      jamTo: jamThreshold[id],
      callTo: callThreshold[id],
    });
    if (id % 20 === 0) process.stderr.write('.');
  }
  process.stderr.write('\n');

  // ── 4. What each profile is worth on the same river ──────────────────────
  const riverBoard = parseCards('Ah Kc 9s 4d 2c');
  const profileTable = Object.keys(PROFILES).map((key) => {
    const air = convene({ hero: parseCards('7d6d'), board: riverBoard, potBb: 14, toCallBb: 0, effectiveBb: 50, profile: key },
      { iters, seed: 3, skipAdversary: true });
    const value = convene({ hero: parseCards('AsQd'), board: riverBoard, potBb: 14, toCallBb: 0, effectiveBb: 50, profile: key },
      { iters, seed: 3, skipAdversary: true });
    const p = PROFILES[key];
    return {
      key, name: p.name, foldToBet: p.foldToBet, note: p.note,
      airAction: air.phrase, valueAction: value.phrase,
    };
  });

  // ── 5. Measured: the council actually playing ────────────────────────────
  process.stderr.write(`benchmarking ${MATCHUPS.length} matchups x ${deals} deals on ${threads} threads\n`);
  const benchmark = await runBenchmark(threads, deals);
  benchmark.sort((a, b) => a.index - b.index);

  const body = `// GENERATED by tools/study.mjs — do not edit by hand.
//
// Three tiers of trust, kept separate on purpose:
//   solved   — exact, from the push/fold equilibrium
//   computed — arithmetic and enumeration, no sampling
//   measured — the council playing real hands, with intervals

export const STUDY = ${JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    deals,
    jamThreshold, callThreshold, charts,
    potOdds, textures, preflopGrid, profileTable, benchmark,
  }, null, 1)};
`;
  const out = new URL('../data/study.js', import.meta.url);
  writeFileSync(out, body);
  process.stderr.write(`\nwrote data/study.js (${(body.length / 1024).toFixed(0)} KB)\n\n`);

  for (const b of benchmark) {
    const sig = Math.abs(b.bbPer100) > b.ci95 ? '' : '   (not significant)';
    process.stderr.write(`  vs ${b.opponent.padEnd(16)} ${String(b.stackBb).padStart(3)}bb  `
      + `${b.bbPer100 >= 0 ? '+' : ''}${b.bbPer100.toFixed(1)} ± ${b.ci95.toFixed(1)} bb/100${sig}\n`);
  }
}

function runBenchmark(threads, deals) {
  return new Promise((resolve, reject) => {
    const results = [];
    let live = 0;
    for (let t = 0; t < threads; t++) {
      const indices = MATCHUPS.map((_, i) => i).filter((i) => i % threads === t);
      if (!indices.length) continue;
      live++;
      const w = new Worker(self, { workerData: { indices, deals, seed: 4242 } });
      w.on('message', (m) => {
        if (m.progress) process.stderr.write(`  done: ${m.progress}\n`);
        if (m.done) { results.push(...m.out); w.terminate(); }
      });
      w.on('error', reject);
      w.on('exit', () => { if (--live === 0) resolve(results); });
    }
    if (live === 0) resolve(results);
  });
}

if (isMainThread) main().catch((e) => { console.error(e); process.exit(1); });
