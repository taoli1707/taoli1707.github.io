// The Council — page controller.
//
// Everything here is presentation. The reasoning lives in engine/council.js and
// the precomputed findings in data/study.js; this file only asks and renders.

import { parseCards, cardToString, classLabel, ALL_CLASS_IDS, SUIT_CHARS } from './engine/cards.js';
import { convene, SPECIALISTS, PROFILES } from './engine/council.js';
import { STUDY } from './data/study.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const pct = (x, d = 0) => `${(x * 100).toFixed(d)}%`;

// ── Card rendering ────────────────────────────────────────────────────────

const SUIT_GLYPH = { c: '♣', d: '♦', h: '♥', s: '♠' };

function cardHtml(cards) {
  const wrap = el('span', 'hand-cards');
  for (const c of cards) {
    const s = cardToString(c);
    const suit = s[1];
    const node = el('span', `pc s-${suit}`, s[0] + SUIT_GLYPH[suit]);
    wrap.appendChild(node);
  }
  return wrap;
}

// ── The console ───────────────────────────────────────────────────────────

const PRESETS = [
  ['Nut flush draw facing a bet', { hand: 'AhKh', board: 'Qh 7h 2c', pot: 10, call: 4, stack: 95, pos: 'ip', profile: 'balanced', range: '' }],
  ['Jam or fold at 8bb', { hand: 'Kd7c', board: '', pot: 1.5, call: 0.5, stack: 8, pos: 'ip', profile: 'unknown', range: '' }],
  ['Facing an 8bb shove', { hand: 'Ad5c', board: '', pot: 9.5, call: 7.5, stack: 8, pos: 'oop', profile: 'unknown', range: '' }],
  ['Air on the river vs a nit', { hand: '7d6d', board: 'Ah Kc 9s 4d 2c', pot: 14, call: 0, stack: 50, pos: 'ip', profile: 'nit', range: '' }],
  ['The same air vs a station', { hand: '7d6d', board: 'Ah Kc 9s 4d 2c', pot: 14, call: 0, stack: 50, pos: 'ip', profile: 'station', range: '' }],
  ['Set on a wet flop, low SPR', { hand: '7s7d', board: 'Qh 7h 2c', pot: 20, call: 0, stack: 24, pos: 'oop', profile: 'balanced', range: '' }],
  ['Top pair facing a river shove', { hand: 'AhQd', board: 'Qc 8h 3s 5d 2c', pot: 40, call: 30, stack: 30, pos: 'oop', profile: 'nit', range: 'top 8%' }],
  ['The nuts vs a station', { hand: 'AsKs', board: 'Qs Js Ts 4d 2c', pot: 20, call: 0, stack: 60, pos: 'ip', profile: 'station', range: '' }],
];

function loadPreset(p) {
  $('in-hand').value = p.hand;
  $('in-board').value = p.board;
  $('in-pot').value = p.pot;
  $('in-call').value = p.call;
  $('in-stack').value = p.stack;
  $('in-pos').value = p.pos;
  $('in-profile').value = p.profile;
  $('in-range').value = p.range;
  run();
}

function readSpot() {
  const hero = parseCards($('in-hand').value);
  if (hero.length !== 2) throw new Error('Give exactly two cards, like "AhKh".');
  const board = $('in-board').value.trim() ? parseCards($('in-board').value) : [];
  if (board.length && (board.length < 3 || board.length > 5)) {
    throw new Error('A board is 3, 4 or 5 cards — or leave it blank for preflop.');
  }
  const seen = new Set([...hero, ...board]);
  if (seen.size !== hero.length + board.length) throw new Error('The same card appears twice.');

  const num = (id, min) => {
    const v = Number($(id).value);
    if (!Number.isFinite(v) || v < min) throw new Error(`"${$(id).previousElementSibling ? '' : ''}" needs a number of at least ${min}.`);
    return v;
  };
  return {
    hero, board,
    potBb: num('in-pot', 0.5),
    toCallBb: num('in-call', 0),
    effectiveBb: num('in-stack', 1),
    position: $('in-pos').value,
    profile: $('in-profile').value,
    villainRange: $('in-range').value.trim() || undefined,
  };
}

let running = false;

async function run() {
  if (running) return;
  running = true;
  $('go').disabled = true;
  $('status').textContent = 'nine agents thinking…';
  $('status').className = 'note';

  // Yield once so the button state paints before the synchronous solve.
  await new Promise((r) => setTimeout(r, 16));

  try {
    const spot = readSpot();
    if (spot.toCallBb > spot.effectiveBb) {
      throw new Error('You cannot be asked to call more than you have — cap the bet at your effective stack.');
    }
    const t0 = performance.now();
    const result = convene(spot, { iters: 12_000, seed: 7 });
    const ms = Math.round(performance.now() - t0);
    renderVerdict(result, spot);
    renderAgents(result);
    renderAdversary(result);
    $('status').textContent = `${result.opinions.length} agents, ${ms} ms`;
  } catch (e) {
    $('status').textContent = e.message;
    $('status').className = 'note err';
    for (const id of ['verdict', 'agents', 'adversary']) $(id).hidden = true;
  } finally {
    running = false;
    $('go').disabled = false;
  }
}

function renderVerdict(r, spot) {
  const box = $('verdict');
  box.innerHTML = '';
  box.hidden = false;

  const card = el('div', 'verdict-card');
  const head = el('div', 'verdict-head');
  head.appendChild(el('span', 'verdict-action', r.phrase));
  head.appendChild(el('span', 'verdict-conf', `confidence ${pct(r.confidence)}`));
  if (r.split) head.appendChild(el('span', 'verdict-conf verdict-mixed', `close — ${r.splitWith}`));
  card.appendChild(head);

  const line = el('div', 'verdict-conf');
  line.append('Holding ');
  line.appendChild(cardHtml(spot.hero));
  if (spot.board.length) { line.append(' on '); line.appendChild(cardHtml(spot.board)); }
  else line.append(' preflop');
  line.append(` — ${r.spot.effective}bb deep against ${r.spot.profile.toLowerCase()} on ${r.spot.villainRange} (${r.spot.villainCombos} combos).`);
  card.appendChild(line);

  const dist = el('div', 'dist');
  for (const [action, weight] of Object.entries(r.distribution)) {
    if (weight < 0.02) continue;
    const seg = el('span', `a-${action}`, weight > 0.12 ? `${action} ${Math.round(weight * 100)}%` : '');
    seg.style.flex = `${weight} 1 0`;
    seg.title = `${action} ${pct(weight, 1)}`;
    dist.appendChild(seg);
  }
  card.appendChild(dist);

  const facts = el('div', 'facts');
  const add = (label, value) => {
    if (value == null) return;
    const d = el('div');
    d.appendChild(el('b', null, label));
    d.append(value);
    facts.appendChild(d);
  };
  add('Your equity', pct(r.facts.heroEquity, 1));
  if (r.spot.toCall > 0) add('Break-even', pct(r.facts.requiredEquity, 1));
  if (r.spot.toCall > 0) add('Must defend', pct(r.facts.mdf));
  add('SPR', r.facts.spr === null ? null : String(r.facts.spr));
  if (r.facts.made) add('You have', r.facts.made);
  if (r.facts.absoluteRank != null) add('Beats', `${pct(r.facts.absoluteRank)} of all hands`);
  if (r.facts.wetness != null) add('Board wetness', pct(r.facts.wetness));
  card.appendChild(facts);

  card.appendChild(el('p', 'verdict-sum', r.summary));
  box.appendChild(card);
}

function renderAgents(r) {
  const box = $('agents');
  box.innerHTML = '';
  box.hidden = false;
  const grid = el('div', 'agent-grid');
  const max = Math.max(...r.opinions.map((o) => o.weight));

  for (const o of [...r.opinions].sort((a, b) => b.weight - a.weight)) {
    const quiet = o.weight < max * 0.35;
    const card = el('div', `agent ${o.wants === r.action ? 'is-loud' : ''} ${quiet ? 'is-quiet' : ''}`);

    const top = el('div', 'agent-top');
    const left = el('div');
    left.appendChild(el('div', 'agent-name', o.name));
    left.appendChild(el('div', 'agent-lens', o.lens));
    top.appendChild(left);
    top.appendChild(el('span', `agent-wants w-${o.wants}`, o.wants));
    card.appendChild(top);

    const bar = el('div', 'agent-bar');
    const fill = el('i');
    fill.style.width = `${(o.weight / max) * 100}%`;
    bar.appendChild(fill);
    card.appendChild(bar);

    card.appendChild(el('p', 'agent-head', o.headline));

    const ul = el('ul', 'agent-ev');
    for (const e of o.evidence) {
      const li = el('li');
      li.appendChild(el('b', null, e.label));
      li.appendChild(el('span', null, String(e.value)));
      ul.appendChild(li);
    }
    card.appendChild(ul);

    const det = el('details');
    det.appendChild(el('summary', null, `Why — weight ${o.weight.toFixed(2)} (authority ${o.authority} × confidence ${o.confidence.toFixed(2)})`));
    det.appendChild(el('p', null, o.reasoning));
    card.appendChild(det);

    grid.appendChild(card);
  }
  box.appendChild(grid);
}

function renderAdversary(r) {
  const box = $('adversary');
  box.innerHTML = '';
  if (!r.adversary) { box.hidden = true; return; }
  box.hidden = false;

  const card = el('div', 'adv');
  card.appendChild(el('div', 'agent-name', 'Adversary'));
  card.appendChild(el('div', 'agent-lens', 'Re-runs the entire council under the assumptions you would least like to be true'));

  const rows = el('div', 'adv-rows');
  for (const s of r.adversary.scenarios) {
    const row = el('div', 'adv-row');
    const l = el('div');
    l.appendChild(el('div', null, s.title));
    l.appendChild(el('div', 'agent-lens', `${s.combos} combos — your equity becomes ${pct(s.heroEquity, 1)}`));
    row.appendChild(l);
    row.appendChild(el('span', `tag ${s.agrees ? 'ok' : 'no'}`, s.agrees ? `still ${s.action}` : `→ ${s.action}`));
    rows.appendChild(row);
  }
  card.appendChild(rows);
  card.appendChild(el('p', 'verdict-sum', r.adversary.verdict));
  box.appendChild(card);
}

// ── Static sections ───────────────────────────────────────────────────────

function buildProfiles() {
  const sel = $('in-profile');
  for (const [key, p] of Object.entries(PROFILES)) {
    const o = el('option', null, `${p.name} — folds to a bet ${pct(p.foldToBet)}`);
    o.value = key;
    sel.appendChild(o);
  }
  sel.value = 'balanced';
}

function buildPresets() {
  const box = $('presets');
  for (const [label, p] of PRESETS) {
    const b = el('button', null, label);
    b.addEventListener('click', () => loadPreset(p));
    box.appendChild(b);
  }
}

const SPEAKS = {
  solver: 'preflop, 25bb or less, before anyone has raised',
  equity: 'always — at full weight facing a bet, half weight otherwise',
  price: 'only when there is a bet to call',
  forensics: 'postflop, facing a bet',
  texture: 'postflop only',
  ranges: 'always, louder postflop',
  blockers: 'always, quietly',
  exploit: 'louder the more extreme the read on the opponent',
  stack: 'always, louder postflop',
};

function buildLensTable() {
  const body = $('lens-table');
  for (const s of SPECIALISTS) {
    const tr = el('tr');
    tr.appendChild(el('td', null, s.name));
    tr.appendChild(el('td', null, s.lens));
    tr.appendChild(el('td', null, SPEAKS[s.id] || ''));
    body.appendChild(tr);
  }
  const tr = el('tr');
  tr.appendChild(el('td', null, 'Adversary'));
  tr.appendChild(el('td', null, 'Whether the answer survives a different read on the opponent'));
  tr.appendChild(el('td', null, 'after the other nine have finished'));
  body.appendChild(tr);
}

// ── The 13×13 grid ────────────────────────────────────────────────────────

const GRID_MODES = {
  jam: {
    values: () => STUDY.jamThreshold,
    max: 25,
    legend: 'Colour is the deepest effective stack at which jamming this hand beats folding it, in big blinds — brighter is deeper. '
      + 'A dark cell is not a hand you never jam; it is one you only jam when the stack is already tiny.',
  },
  call: {
    values: () => STUDY.callThreshold,
    max: 25,
    legend: 'Colour is the deepest stack at which calling an all-in with this hand beats folding — brighter is deeper. '
      + 'Calling ranges are always tighter than jamming ranges: a jam can win uncontested, a call never can.',
  },
  equity: {
    values: () => ALL_CLASS_IDS.map((id) => {
      const row = STUDY.preflopGrid[id];
      return row ? row.equity * 100 : 0;
    }),
    max: 90,
    min: 30,
    legend: 'Raw all-in equity against one uniformly random hand, from the precomputed 169×169 table. '
      + 'Useful as a floor and misleading as a strategy: it takes no account of position, stack depth or the fact that nobody plays every hand.',
  },
};

function renderGrid(mode) {
  const conf = GRID_MODES[mode];
  const vals = conf.values();
  const lo = conf.min ?? 0;
  const box = $('grid169');
  box.innerHTML = '';
  for (const id of ALL_CLASS_IDS) {
    const v = vals[id] || 0;
    const cell = el('i', null, classLabel(id));
    if (v > lo) {
      const t = Math.min(1, (v - lo) / (conf.max - lo));
      cell.style.background = `hsl(${152 - t * 12} ${45 + t * 30}% ${16 + t * 40}%)`;
      if (t > 0.45) cell.dataset.hot = '1';
      cell.title = `${classLabel(id)} — ${mode === 'equity' ? `${v.toFixed(1)}%` : `${v}bb`}`;
    } else {
      cell.title = `${classLabel(id)} — never`;
    }
    box.appendChild(cell);
  }
  $('grid-legend').textContent = conf.legend;
}

function buildGridTabs() {
  for (const tab of document.querySelectorAll('.gridtab')) {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.gridtab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      renderGrid(tab.dataset.grid);
    });
  }
  renderGrid('jam');
}

// ── Findings, computed from the study data rather than asserted ──────────

function buildPreflopFindings() {
  const jam = STUDY.jamThreshold;
  const call = STUDY.callThreshold;
  const labelled = ALL_CLASS_IDS.map((id) => ({ id, label: classLabel(id), jam: jam[id], call: call[id] }));

  const anyTwo = Math.min(...labelled.map((h) => h.jam || 0).filter((x) => x > 0));
  const alwaysJam = labelled.filter((h) => h.jam >= 25).length;
  const neverJam = labelled.filter((h) => !h.jam).map((h) => h.label);
  const jamAt10 = labelled.filter((h) => h.jam >= 10).length;
  const callAt10 = labelled.filter((h) => h.call >= 10).length;

  const chart10 = STUDY.charts[10] || STUDY.charts[Object.keys(STUDY.charts)[0]];
  const deepest = [...labelled].sort((a, b) => b.jam - a.jam).filter((h) => h.jam < 25).slice(0, 6);

  const items = [
    `<b>Every hand is a jam somewhere.</b> ${neverJam.length === 0
      ? `All 169 classes shove profitably at some depth — the worst of them only when the stack is down around ${anyTwo} big blinds, but there is no hand you must fold at every depth.`
      : `All but ${neverJam.length} classes shove profitably somewhere; the exceptions are ${neverJam.join(', ')}.`}`,
    `<b>${alwaysJam} hands are a jam at 25bb and deeper.</b> That is ${pct(alwaysJam / 169)} of the classes — which is also the reason a 25bb stack still has a real postflop game and a 10bb stack does not.`,
    `<b>Jamming is always wider than calling.</b> At ten big blinds ${jamAt10} classes shove and only ${callAt10} call. A shove can win the pot uncontested; a call never can, and that gap is worth roughly the whole small blind.`,
    `<b>At 10bb the equilibrium shoves ${chart10.shovePercent}% of hands and calls ${chart10.callPercent}%.</b> Both numbers are far wider than most players are comfortable with, and the discomfort is exactly the leak — folding into a wide shoving range is how short stacks get blinded out.`,
    `<b>The interesting hands are the marginal ones.</b> ${deepest.map((h) => `${h.label} to ${h.jam}bb`).join(', ')} — these are the hands where an extra big blind of depth genuinely changes the answer, and where a chart memorised at the wrong depth costs money.`,
  ];

  // Read out of the data rather than asserted, so it stays true if the study is
  // regenerated against a different council.
  const actions = {};
  for (const r of STUDY.preflopGrid) actions[r.action] = (actions[r.action] || 0) + 1;
  const [topAction, topCount] = Object.entries(actions).sort((a, b) => b[1] - a[1])[0];
  $('limp-finding').textContent = topCount === STUDY.preflopGrid.length
    ? `the same one for all 169 of them — ${topAction}, every hand, from aces to seven-deuce.`
    : `${topAction} for ${topCount} of the 169 classes, which is very nearly the same answer for everything.`;

  const ul = $('preflop-findings');
  for (const html of items) {
    const li = document.createElement('li');
    li.innerHTML = html;
    ul.appendChild(li);
  }
  $('exploit-fig').textContent = chart10.exploitability.toExponential(1);
}

function buildPriceTable() {
  const body = document.querySelector('#price-table tbody');
  for (const r of STUDY.potOdds) {
    const tr = el('tr');
    tr.appendChild(el('td', null, r.label));
    tr.appendChild(el('td', 'num', pct(r.required, 1)));
    tr.appendChild(el('td', 'num', pct(r.bluffBreakEven, 1)));
    tr.appendChild(el('td', 'num', pct(r.mdf, 1)));
    body.appendChild(tr);
  }
}

function buildBoardTable() {
  const body = document.querySelector('#board-table tbody');
  const sorted = [...STUDY.textures].sort((a, b) => b.wetness - a.wetness);
  for (const t of sorted) {
    const tr = el('tr');
    const first = el('td');
    first.appendChild(cardHtml(parseCards(t.board)));
    first.appendChild(el('div', 'agent-lens', t.note));
    tr.appendChild(first);
    tr.appendChild(el('td', 'num', pct(t.strongShare, 1)));
    tr.appendChild(el('td', 'num', pct(t.drawShare, 1)));
    tr.appendChild(el('td', 'num', pct(t.wetness)));
    tr.appendChild(el('td', null, t.nutText));
    body.appendChild(tr);
  }
}

function buildProfileTable() {
  const body = document.querySelector('#profile-table tbody');
  for (const p of STUDY.profileTable) {
    const tr = el('tr');
    const first = el('td');
    first.appendChild(el('div', null, p.name));
    first.appendChild(el('div', 'agent-lens', p.note));
    tr.appendChild(first);
    tr.appendChild(el('td', 'num', pct(p.foldToBet)));
    tr.appendChild(el('td', null, p.airAction));
    tr.appendChild(el('td', null, p.valueAction));
    body.appendChild(tr);
  }
}

function buildBenchTable() {
  const body = document.querySelector('#bench-table tbody');
  let wins = 0, real = 0;
  for (const b of STUDY.benchmark) {
    const significant = Math.abs(b.bbPer100) > b.ci95;
    const tr = el('tr');
    tr.appendChild(el('td', null, b.opponent));
    tr.appendChild(el('td', 'num', `${b.stackBb}bb`));
    const res = el('td', `num ${significant ? (b.bbPer100 > 0 ? 'pos' : 'neg') : 'meh'}`,
      `${b.bbPer100 >= 0 ? '+' : ''}${b.bbPer100.toFixed(0)} ± ${b.ci95.toFixed(0)}`);
    tr.appendChild(res);
    tr.appendChild(el('td', null, significant
      ? (b.bbPer100 > 0 ? 'a real edge' : 'a real loss')
      : 'inside the noise — no edge shown either way'));
    body.appendChild(tr);
    if (significant) { real++; if (b.bbPer100 > 0) wins++; }
  }
  const deals = STUDY.benchmark[0].deals || STUDY.deals;
  $('bench-note').textContent = `${STUDY.benchmark.length} matchups, ${deals} duplicated deals each — ${deals * 2} hands per row. `
    + `${real} of ${STUDY.benchmark.length} results clear their own interval, and ${wins} of those are wins. `
    + `A row inside its interval means the run was too short to separate the two players, not that the matchup is known to be even. `
    + `Per-deal results are heavy-tailed, so the normal approximation runs slightly narrow at these sample sizes; a result sitting on the edge of its interval needs more deals.`;
}

// ── Boot ──────────────────────────────────────────────────────────────────

buildProfiles();
buildPresets();
buildLensTable();
buildGridTabs();
buildPreflopFindings();
buildPriceTable();
buildBoardTable();
buildProfileTable();
buildBenchTable();
$('gen-date').textContent = STUDY.generated;
$('go').addEventListener('click', run);
for (const id of ['in-hand', 'in-board', 'in-pot', 'in-call', 'in-stack', 'in-range']) {
  $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
}
$('in-profile').addEventListener('change', run);
$('in-pos').addEventListener('change', run);
run();
