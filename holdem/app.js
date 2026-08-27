// UI for the Hold'em engine. All the poker lives in engine/; this file is
// wiring, rendering, and keeping long computations off the main thread's back
// by running them in slices.

import {
  parseCards, cardToString, rankOf, suitOf, SUIT_SYMBOLS, RANK_CHARS,
  classLabel, classOf, classCombos,
} from './engine/cards.js';
import { equity, mergeEquity } from './engine/equity.js';
import { parseRange, rangeSummary } from './engine/range.js';
import { pushFoldChart, jamEv } from './engine/pushfold.js';
import { CATEGORY_NAMES } from './engine/evaluator.js';
import {
  createHand, legalActions, applyAction, observe, pot, dealDeck,
  BIG_BLIND, STREETS,
} from './engine/game.js';
import { makeRng } from './engine/rng.js';
import { duel, mergeDuels } from './engine/arena.js';
import {
  equityAgent, callingStation, randomAgent, maniac, nit, pushFoldAgent,
  inferOpponentPercent,
} from './engine/agents.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const idle = () => new Promise((r) => setTimeout(r, 0));
const pct = (x, dp = 2) => `${(x * 100).toFixed(dp)}%`;
const bb = (chips) => chips / BIG_BLIND;
const fmtBb = (chips) => {
  const v = bb(chips);
  return Number.isInteger(v) ? `${v} bb` : `${v.toFixed(1)} bb`;
};

// ── Tabs ───────────────────────────────────────────────────────────────
$('#tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  $$('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
  $$('.panel').forEach((p) => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
  if (tab.dataset.tab === 'pushfold') renderPushFold();
});

// ── Shared: 13x13 grid ─────────────────────────────────────────────────

function buildGrid(el) {
  el.innerHTML = '';
  const cells = [];
  for (let i = 0; i < 169; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = classLabel(i);
    el.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

/** Paint a grid from a 169-long array of frequencies in [0, 1]. */
function paintGrid(cells, weights) {
  for (let i = 0; i < 169; i++) {
    const w = weights[i] || 0;
    cells[i].classList.toggle('on', w > 0.98);
    cells[i].classList.toggle('mix', w > 0.02 && w <= 0.98);
    cells[i].title = w > 0 && w < 1 ? `${classLabel(i)}: ${(w * 100).toFixed(0)}%` : classLabel(i);
  }
}

// ── Equity tab ─────────────────────────────────────────────────────────

const eqGrid = buildGrid($('#eq-grid'));
let eqCancel = false;
let eqRunning = false;

function readRange(input) {
  try {
    const text = input.value.trim() || 'random';
    const parsed = parseRange(text);
    if (parsed.combos.length === 0) throw new Error('range is empty');
    input.classList.remove('bad');
    return parsed;
  } catch (err) {
    input.classList.add('bad');
    throw new Error(`${input.previousElementSibling?.textContent || 'Range'}: ${err.message}`);
  }
}

function readCards(input) {
  try {
    const cards = parseCards(input.value);
    input.classList.remove('bad');
    return cards;
  } catch (err) {
    input.classList.add('bad');
    throw err;
  }
}

async function runEquity() {
  if (eqRunning) return;
  const status = $('#eq-status');
  let ranges; let board; let dead;
  try {
    ranges = [readRange($('#eq-hero')), readRange($('#eq-villain'))];
    board = readCards($('#eq-board'));
    dead = readCards($('#eq-dead'));
    if (board.length === 1 || board.length === 2) {
      throw new Error('a board needs 0, 3, 4 or 5 cards');
    }
  } catch (err) {
    status.textContent = err.message;
    return;
  }

  eqRunning = true;
  eqCancel = false;
  $('#eq-run').disabled = true;
  $('#eq-cancel').hidden = false;
  const bar = $('#eq-progress');
  bar.hidden = false;

  const target = Number($('#eq-iters').value);
  const CHUNK = 50_000;
  const runs = [];
  let seed = 1;

  try {
    // The first slice reveals whether the whole spot fits in an exact
    // enumeration; if it does, that result is already the final answer.
    const first = equity({ ranges, board, dead, iters: CHUNK, seed: seed++, exactLimit: 400_000 });
    runs.push(first);

    if (!first.exact) {
      let done = first.iterations;
      while (done < target && !eqCancel) {
        await idle();
        runs.push(equity({ ranges, board, dead, iters: CHUNK, seed: seed++, exactLimit: 0 }));
        done += CHUNK;
        bar.firstElementChild.style.width = `${Math.min(100, (done / target) * 100)}%`;
        status.textContent = `${done.toLocaleString()} of ${target.toLocaleString()} boards`;
      }
    }

    const result = mergeEquity(runs);
    renderEquity(result, ranges, board, dead);
    status.textContent = result.exact
      ? `exact — every one of ${result.iterations.toLocaleString()} runouts`
      : `${result.iterations.toLocaleString()} sampled boards, ±${(result.stdError * 196).toFixed(2)} points`;
  } catch (err) {
    status.textContent = err.message;
    $('#eq-results').hidden = true;
    $('#eq-gridwrap').hidden = true;
  } finally {
    eqRunning = false;
    $('#eq-run').disabled = false;
    $('#eq-cancel').hidden = true;
    bar.hidden = true;
    bar.firstElementChild.style.width = '0';
  }
}

function renderEquity(result, ranges, board, dead) {
  const labels = [$('#eq-hero').value.trim() || 'random', $('#eq-villain').value.trim() || 'random'];
  const bars = $('#eq-bars');
  bars.innerHTML = '';

  result.equity.forEach((eq, i) => {
    const summary = rangeSummary(ranges[i]);
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-head">
        <span class="bar-name">${escape(labels[i])}
          <small style="color:var(--muted);font-weight:400">
            ${summary.combos.toFixed(0)} combo${summary.combos === 1 ? '' : 's'} · ${summary.percent.toFixed(1)}%</small></span>
        <span class="bar-val">${pct(eq)}<small>win ${pct(result.win[i], 1)} · tie ${pct(result.tie[i], 1)}</small></span>
      </div>
      <div class="bar"><u style="width:${result.win[i] * 100}%"></u><s style="width:${result.tie[i] * 100}%"></s></div>`;
    bars.appendChild(row);
  });
  $('#eq-results').hidden = false;

  const table = ['<table class="cats"><thead><tr><th>By the river</th>'
    + labels.map((l) => `<th>${escape(shorten(l))}</th>`).join('') + '</tr></thead><tbody>'];
  for (let c = 8; c >= 0; c--) {
    const anyone = result.categories.some((row) => row[c] > 0.0005);
    if (!anyone) continue;
    table.push(`<tr><td>${CATEGORY_NAMES[c]}</td>`
      + result.categories.map((row) => `<td>${pct(row[c], 1)}</td>`).join('') + '</tr>');
  }
  table.push('</tbody></table>');
  $('#eq-categories').innerHTML = table.join('');

  // Hero range as a grid, weighted by how much of each class survives blockers.
  const weights = new Float64Array(169);
  ranges[0].combos.forEach(([a, b], i) => {
    weights[classOf(a, b)] += ranges[0].weights[i];
  });
  for (let i = 0; i < 169; i++) weights[i] /= classCombos(i);
  paintGrid(eqGrid, weights);
  $('#eq-gridwrap').hidden = false;
}

const shorten = (s) => (s.length > 16 ? `${s.slice(0, 15)}…` : s);
const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

$('#eq-run').addEventListener('click', runEquity);
$('#eq-cancel').addEventListener('click', () => { eqCancel = true; });
$$('.chip').forEach((chip) => chip.addEventListener('click', () => {
  $('#eq-hero').value = chip.dataset.hero;
  $('#eq-villain').value = chip.dataset.villain;
  $('#eq-board').value = chip.dataset.board;
  runEquity();
}));
runEquity();

// ── Push/fold tab ──────────────────────────────────────────────────────

const pfShove = buildGrid($('#pf-grid-shove'));
const pfCall = buildGrid($('#pf-grid-call'));
let pfPending = false;

function currentStack() {
  return Number($('#pf-stack').value) / 10;
}

function renderPushFold() {
  const stack = currentStack();
  $('#pf-stack-label').textContent = `${stack.toFixed(1)} bb`;
  const chart = pushFoldChart(stack);

  paintGrid(pfShove, chart.shove);
  paintGrid(pfCall, chart.call);

  $('#pf-stats').innerHTML = [
    ['Shoves', `${chart.shovePercent.toFixed(1)}%`, 'of all hands'],
    ['Calls', `${chart.callPercent.toFixed(1)}%`, 'facing the shove'],
    ['SB edge', `${chart.sbEv >= 0 ? '+' : ''}${chart.sbEv.toFixed(3)}`, 'bb per hand'],
  ].map(([label, value, sub]) => `<div class="stat"><b>${value}</b><span>${label} — ${sub}</span></div>`).join('');

  renderVerdict(chart);
}

function renderVerdict(chart) {
  const el = $('#pf-verdict');
  const text = $('#pf-hand').value.trim();
  if (!text) { el.textContent = ''; return; }
  let id;
  try {
    const parsed = parseRange(text);
    if (parsed.combos.length === 0) throw new Error('no such hand');
    const [a, b] = parsed.combos[0];
    id = classOf(a, b);
    $('#pf-hand').classList.remove('bad');
  } catch {
    $('#pf-hand').classList.add('bad');
    el.textContent = 'Not a hand I recognise — try A5s, 77 or KTo.';
    return;
  }

  const freq = chart.shove[id];
  const ev = jamEv(id, chart.stack, chart.call);
  const edge = ev + 0.5; // folding is worth -0.5 bb
  const cls = freq > 0.98 ? 'jam' : freq < 0.02 ? 'fold' : 'mix';
  const verb = freq > 0.98 ? 'Shove' : freq < 0.02 ? 'Fold' : `Shove ${(freq * 100).toFixed(0)}% of the time`;
  el.className = `verdict ${cls}`;
  el.innerHTML = `${classLabel(id)} at ${chart.stack.toFixed(1)} bb: <b>${verb}</b>
    <p>Shoving is worth ${ev >= 0 ? '+' : ''}${ev.toFixed(3)} bb against the equilibrium calling range,
    ${edge >= 0 ? 'beating' : 'losing to'} the −0.5 bb you give up by folding
    by ${Math.abs(edge).toFixed(3)} bb.
    Facing a shove instead, the big blind calls this hand
    ${chart.call[id] > 0.98 ? 'always' : chart.call[id] < 0.02 ? 'never' : `${(chart.call[id] * 100).toFixed(0)}% of the time`}.</p>`;
}

$('#pf-stack').addEventListener('input', () => {
  $('#pf-stack-label').textContent = `${currentStack().toFixed(1)} bb`;
  if (pfPending) return;
  pfPending = true;
  requestAnimationFrame(() => { pfPending = false; renderPushFold(); });
});
$('#pf-hand').addEventListener('input', () => renderVerdict(pushFoldChart(currentStack())));

// ── Play tab ───────────────────────────────────────────────────────────

const table = {
  hand: null, bot: null, rng: makeRng(Date.now() & 0xffff), button: 0, lastRead: null,
};

const titleCase = (s) => s[0].toUpperCase() + s.slice(1);

function cardHtml(card, hidden = false) {
  if (card == null) return '<div class="pc slot"></div>';
  if (hidden) return '<div class="pc back"></div>';
  const suit = suitOf(card);
  const red = suit === 1 || suit === 2;
  return `<div class="pc${red ? ' red' : ''}">${RANK_CHARS[rankOf(card)]}<span class="s">${SUIT_SYMBOLS[suit]}</span></div>`;
}

function newHand() {
  const stack = Math.round(Number($('#tb-stack').value) * BIG_BLIND);
  table.bot = equityAgent({
    seed: (Math.random() * 1e9) | 0,
    iters: Number($('#tb-bot').value),
    exactLimit: 200_000,
  });
  table.button = 1 - table.button;
  table.hand = createHand({
    stacks: [stack, stack],
    button: table.button,
    deck: dealDeck(table.rng),
  });
  $('#tb-log').innerHTML = '';
  table.lastRead = null;
  logLine('street', `Preflop — you are ${table.button === 0 ? 'on the button' : 'in the big blind'}`);
  $('#tb-banner').className = 'banner';
  $('#tb-banner').textContent = '';
  step();
}

function logLine(cls, html) {
  const li = document.createElement('li');
  li.className = cls;
  li.innerHTML = html;
  $('#tb-log').appendChild(li);
  $('#tb-log').scrollTop = $('#tb-log').scrollHeight;
}

const YOU = 0;
const BOT = 1;

function renderTable() {
  const s = table.hand;
  $('#tb-you-stack').textContent = fmtBb(s.stacks[YOU]);
  $('#tb-opp-stack').textContent = fmtBb(s.stacks[BOT]);
  $('#tb-pot').textContent = `Pot ${fmtBb(pot(s))}${s.complete ? '' : ` · ${titleCase(STREETS[s.street])}`}`;
  $('#tb-you-cards').innerHTML = s.hole[YOU].map((c) => cardHtml(c)).join('');
  $('#tb-opp-cards').innerHTML = s.hole[BOT]
    .map((c) => cardHtml(c, !s.complete || !s.result.showdown)).join('');
  const board = s.board.concat(new Array(5 - s.board.length).fill(null));
  $('#tb-board').innerHTML = board.map((c) => cardHtml(c)).join('');
}

function step() {
  const s = table.hand;
  renderTable();
  if (s.complete) { finishHand(); return; }

  if (s.toAct === BOT) {
    renderControls(null);
    setTimeout(() => {
      const obs = observe(s, BOT);
      const legal = legalActions(s);
      const action = table.bot(obs, legal);
      const read = Math.round(inferOpponentPercent(obs));
      applyAction(s, action);
      logAction(BOT, action, legal);
      // Only worth saying when it moves; otherwise it is the same line forever.
      if (read !== table.lastRead) {
        table.lastRead = read;
        logLine('think', `the bot now has you on the top ${read}% of hands`);
      }
      if (s.street !== obs.street && !s.complete) {
        logLine('street', `${titleCase(STREETS[s.street])} — ${s.board.map(cardToString).join(' ')}`);
      }
      step();
    }, 420);
    return;
  }

  renderControls(legalActions(s));
}

function logAction(seat, action, legal) {
  const you = seat === YOU;
  const who = you ? 'You' : 'Bot';
  // "You call" but "Bot calls" — the log reads as prose, so conjugate it.
  const verb = (stem) => (you ? stem : `${stem}s`);

  let what;
  if (action.type === 'fold') what = verb('fold');
  else if (action.type === 'check') what = verb('check');
  else if (action.type === 'call') what = `${verb('call')} ${fmtBb(legal.toCall)}`;
  else {
    const to = Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, Math.round(action.amount)));
    const allIn = to >= legal.maxRaiseTo;
    what = legal.toCall > 0
      ? `${verb('raise')} to ${fmtBb(to)}${allIn ? ' — all in' : ''}`
      : `${verb('bet')} ${fmtBb(to)}${allIn ? ' — all in' : ''}`;
  }
  logLine('', `<b>${who}</b> ${what}`);
}

function renderControls(legal) {
  const box = $('#tb-buttons');
  const sizing = $('#tb-sizing');
  box.innerHTML = '';
  sizing.hidden = true;
  if (!legal) {
    box.innerHTML = '<span class="note">Bot is thinking…</span>';
    return;
  }

  const add = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = `act ${cls}`;
    b.textContent = label;
    b.addEventListener('click', fn);
    box.appendChild(b);
    return b;
  };

  const take = (action) => {
    logAction(YOU, action, legal);
    const before = table.hand.street;
    applyAction(table.hand, action);
    if (table.hand.street !== before && !table.hand.complete) {
      logLine('street', `${titleCase(STREETS[table.hand.street])} — ${table.hand.board.map(cardToString).join(' ')}`);
    }
    step();
  };

  if (legal.canFold) add('Fold', 'no', () => take({ type: 'fold' }));
  if (legal.canCheck) add('Check', '', () => take({ type: 'check' }));
  if (legal.canCall) add(`Call ${fmtBb(legal.toCall)}`, '', () => take({ type: 'call' }));

  if (legal.canRaise) {
    const slider = $('#tb-slider');
    const out = $('#tb-amount');
    sizing.hidden = false;
    slider.min = legal.minRaiseTo;
    slider.max = legal.maxRaiseTo;
    slider.step = Math.max(1, Math.round(BIG_BLIND / 10));
    const potSized = Math.min(
      legal.maxRaiseTo,
      Math.max(legal.minRaiseTo, table.hand.committed[YOU] + legal.toCall + legal.potIfCall),
    );
    slider.value = Math.round((legal.minRaiseTo + potSized) / 2);
    const sync = () => {
      const v = Number(slider.value);
      out.textContent = v >= Number(slider.max) ? 'All in' : fmtBb(v);
    };
    slider.oninput = sync;
    sync();
    add(legal.toCall > 0 ? 'Raise' : 'Bet', 'go', () => take({ type: 'raise', amount: Number(slider.value) }));
    add('All in', '', () => take({ type: 'raise', amount: legal.maxRaiseTo }));
  }
}

function finishHand() {
  const s = table.hand;
  const net = s.result.net[YOU];
  const banner = $('#tb-banner');
  if (s.result.showdown) {
    logLine('street', `Showdown — bot had ${s.hole[BOT].map(cardToString).join(' ')}`);
    logLine('', `You: <b>${s.result.descriptions[YOU]}</b> · Bot: <b>${s.result.descriptions[BOT]}</b>`);
  }
  banner.className = `banner ${net > 0 ? 'win' : net < 0 ? 'lose' : ''}`;
  banner.textContent = net > 0 ? `You win ${fmtBb(net)}`
    : net < 0 ? `You lose ${fmtBb(-net)}` : 'Split pot';
  renderControls(null);
  $('#tb-buttons').innerHTML = '';
  const again = document.createElement('button');
  again.className = 'act go';
  again.textContent = 'Next hand';
  again.addEventListener('click', newHand);
  $('#tb-buttons').appendChild(again);
}

$('#tb-new').addEventListener('click', newHand);
newHand();

// ── Arena tab ──────────────────────────────────────────────────────────

const FACTORIES = {
  'Equity bot': (seed) => equityAgent({ seed, iters: 250, exactLimit: 25_000 }),
  'Nash jam/fold': () => pushFoldAgent(),
  Nit: (seed) => nit({ seed }),
  'Calling station': () => callingStation(),
  Maniac: (seed) => maniac({ seed }),
  Random: (seed) => randomAgent({ seed }),
};

for (const [select, initial] of [[$('#ar-a'), 'Equity bot'], [$('#ar-b'), 'Calling station']]) {
  select.innerHTML = Object.keys(FACTORIES)
    .map((name) => `<option${name === initial ? ' selected' : ''}>${name}</option>`).join('');
}

let arCancel = false;
let arRunning = false;

async function runArena() {
  if (arRunning) return;
  arRunning = true;
  arCancel = false;
  $('#ar-run').disabled = true;
  $('#ar-cancel').hidden = false;
  const bar = $('#ar-progress');
  bar.hidden = false;

  const nameA = $('#ar-a').value;
  const nameB = $('#ar-b').value;
  const total = Number($('#ar-deals').value);
  const stackBb = Number($('#ar-stack').value);
  const CHUNK = 50;
  const runs = [];
  let done = 0;
  let seed = 1;

  while (done < total && !arCancel) {
    await idle();
    const deals = Math.min(CHUNK, total - done);
    runs.push(duel({ a: FACTORIES[nameA], b: FACTORIES[nameB], deals, stackBb, seed: seed++ }));
    done += deals;
    bar.firstElementChild.style.width = `${(done / total) * 100}%`;
    $('#ar-status').textContent = `${(done * 2).toLocaleString()} hands`;
    renderArena(mergeDuels(runs), nameA, nameB);
  }

  $('#ar-status').textContent = arCancel ? `stopped after ${(done * 2).toLocaleString()} hands` : '';
  arRunning = false;
  $('#ar-run').disabled = false;
  $('#ar-cancel').hidden = true;
  bar.hidden = true;
  bar.firstElementChild.style.width = '0';
}

function renderArena(r, nameA, nameB) {
  const up = r.bbPer100 >= 0;
  $('#ar-results').hidden = false;
  $('#ar-results').innerHTML = `
    <div class="result-head">
      <span class="result-rate ${up ? 'up' : 'down'}">${up ? '+' : ''}${r.bbPer100.toFixed(1)}</span>
      <span class="result-ci">bb/100 &nbsp;±${r.ci95.toFixed(1)}</span>
      <span class="badge ${r.significant ? 'yes' : 'no'}">
        ${r.significant ? 'clear of the noise' : 'still inside the noise'}</span>
    </div>
    <p class="note">
      <b>${escape(nameA)}</b> against <b>${escape(nameB)}</b> over
      ${r.hands.toLocaleString()} hands (${r.deals.toLocaleString()} duplicated deals).
      ${(r.showdownRate * 100).toFixed(0)}% of hands reached showdown.
      Net ${r.totalBb >= 0 ? '+' : ''}${r.totalBb.toFixed(0)} bb.
    </p>`;
}

$('#ar-run').addEventListener('click', runArena);
$('#ar-cancel').addEventListener('click', () => { arCancel = true; });
