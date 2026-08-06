/* ── Noise Machine — everything synthesized live with the Web Audio API ── */
'use strict';

/* ═══════════════════════ Audio engine core ═══════════════════════ */

let ctx = null;          // AudioContext, created lazily (autoplay policy)
let masterGain = null;
let analyser = null;
let playing = false;

function ensureContext() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.value = els.masterVol.value / 100;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.85;
  masterGain.connect(analyser);
  analyser.connect(ctx.destination);
  return ctx;
}

/* Pre-rendered looping noise buffers (4 s each, generated once) */
const bufferCache = {};
function noiseBuffer(color) {
  if (bufferCache[color]) return bufferCache[color];
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (color === 'white') {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } else if (color === 'pink') {
    // Paul Kellet's economy pink noise filter
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else { // brown
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  bufferCache[color] = buf;
  return buf;
}

/* Helpers used by the sound builders */
function loopSource(color) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(color);
  src.loop = true;
  // random start offset so layered copies of the same buffer don't phase-lock
  src.start(0, Math.random() * 3.5);
  return src;
}

function lfo(freq, depth, param, base) {
  // modulates `param` as base ± depth at `freq` Hz
  if (base !== undefined) param.value = base;
  const osc = ctx.createOscillator();
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = depth;
  osc.connect(g).connect(param);
  osc.start();
  return [osc, g];
}

/* ═══════════════════ Sound definitions ═══════════════════
   Each build() wires nodes into `out` and returns handles.
   `h.nodes` are stopped/disconnected on teardown, `h.timers` cleared. */

const SOUNDS = [
  {
    id: 'white', emoji: '📻', name: 'White noise', desc: 'Full-spectrum static — masks everything',
    defaultVol: 55,
    build(out) {
      const src = loopSource('white');
      const g = ctx.createGain(); g.gain.value = 0.25;
      src.connect(g).connect(out);
      return { nodes: [src, g] };
    }
  },
  {
    id: 'pink', emoji: '🌸', name: 'Pink noise', desc: 'Softer, balanced hiss — easy on the ears',
    defaultVol: 60,
    build(out) {
      const src = loopSource('pink');
      const g = ctx.createGain(); g.gain.value = 0.5;
      src.connect(g).connect(out);
      return { nodes: [src, g] };
    }
  },
  {
    id: 'brown', emoji: '🐻', name: 'Brown noise', desc: 'Deep low rumble — like a distant waterfall',
    defaultVol: 65,
    build(out) {
      const src = loopSource('brown');
      const g = ctx.createGain(); g.gain.value = 0.55;
      src.connect(g).connect(out);
      return { nodes: [src, g] };
    }
  },
  {
    id: 'rain', emoji: '🌧️', name: 'Rain', desc: 'Steady rainfall with soft droplets',
    defaultVol: 60,
    build(out) {
      const nodes = [], timers = [];
      // rain body: white noise, band-limited hiss
      const src = loopSource('white');
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
      const g = ctx.createGain(); g.gain.value = 0.22;
      src.connect(hp).connect(lp).connect(g).connect(out);
      // slow density swell
      nodes.push(...lfo(0.05, 0.05, g.gain));
      nodes.push(src, hp, lp, g);
      // droplet plinks: short decaying sine blips at random pitches
      const drop = () => {
        if (!ctx || ctx.state === 'closed') return;
        const o = ctx.createOscillator();
        o.frequency.value = 700 + Math.random() * 2000;
        const eg = ctx.createGain();
        const t = ctx.currentTime;
        eg.gain.setValueAtTime(0.0001, t);
        eg.gain.exponentialRampToValueAtTime(0.008 + Math.random() * 0.015, t + 0.002);
        eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        o.connect(eg).connect(out);
        o.start(t); o.stop(t + 0.08);
        timers.push(setTimeout(drop, 60 + Math.random() * 250));
      };
      timers.push(setTimeout(drop, 200));
      return { nodes, timers };
    }
  },
  {
    id: 'thunder', emoji: '⛈️', name: 'Thunder', desc: 'Distant rumbles rolling through',
    defaultVol: 70,
    build(out) {
      const nodes = [], timers = [];
      const rumble = () => {
        if (!ctx || ctx.state === 'closed') return;
        const src = loopSource('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
        lp.frequency.value = 60 + Math.random() * 60;
        const eg = ctx.createGain();
        const t = ctx.currentTime;
        const dur = 2.5 + Math.random() * 4;
        const peak = 0.5 + Math.random() * 0.5;
        eg.gain.setValueAtTime(0.0001, t);
        eg.gain.exponentialRampToValueAtTime(peak, t + 0.4 + Math.random() * 0.8);
        eg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(lp).connect(eg).connect(out);
        src.stop(t + dur + 0.1);
        timers.push(setTimeout(rumble, 6000 + Math.random() * 18000));
      };
      timers.push(setTimeout(rumble, 800));
      return { nodes, timers };
    }
  },
  {
    id: 'ocean', emoji: '🌊', name: 'Ocean waves', desc: 'Slow swells washing ashore',
    defaultVol: 65,
    build(out) {
      const nodes = [];
      const src = loopSource('brown');
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      const g = ctx.createGain();
      src.connect(lp).connect(g).connect(out);
      // two detuned LFOs make irregular wave sets
      nodes.push(...lfo(0.08, 0.28, g.gain, 0.42));
      nodes.push(...lfo(0.051, 0.12, g.gain));
      nodes.push(...lfo(0.08, 350, lp.frequency, 480));
      // surf hiss on top of the swell
      const hiss = loopSource('white');
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 3500; bp.Q.value = 0.6;
      const hg = ctx.createGain();
      hiss.connect(bp).connect(hg).connect(out);
      nodes.push(...lfo(0.08, 0.05, hg.gain, 0.055));
      nodes.push(src, lp, g, hiss, bp, hg);
      return { nodes };
    }
  },
  {
    id: 'wind', emoji: '💨', name: 'Wind', desc: 'Gusts sweeping past the window',
    defaultVol: 60,
    build(out) {
      const nodes = [];
      const src = loopSource('pink');
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.Q.value = 0.8;
      const g = ctx.createGain();
      src.connect(bp).connect(g).connect(out);
      nodes.push(...lfo(0.06, 220, bp.frequency, 420));   // slow pitch drift
      nodes.push(...lfo(0.17, 90, bp.frequency));          // faster flutter
      nodes.push(...lfo(0.06, 0.22, g.gain, 0.5));         // gusting volume
      nodes.push(...lfo(0.31, 0.07, g.gain));
      nodes.push(src, bp, g);
      return { nodes };
    }
  },
  {
    id: 'stream', emoji: '🏞️', name: 'Stream', desc: 'A brook babbling over stones',
    defaultVol: 55,
    build(out) {
      const nodes = [];
      const mk = (freq, q, vol, lfoF, lfoD) => {
        const src = loopSource('white');
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.Q.value = q;
        const g = ctx.createGain(); g.gain.value = vol;
        src.connect(bp).connect(g).connect(out);
        nodes.push(...lfo(lfoF, lfoD, bp.frequency, freq));
        nodes.push(src, bp, g);
      };
      mk(900, 1.6, 0.16, 0.9, 260);    // low gurgle
      mk(2100, 1.2, 0.11, 1.7, 500);   // mid babble
      mk(4200, 0.9, 0.05, 2.6, 900);   // bright sparkle
      return { nodes };
    }
  },
  {
    id: 'fire', emoji: '🔥', name: 'Campfire', desc: 'Warm crackle and low embers',
    defaultVol: 60,
    build(out) {
      const nodes = [], timers = [];
      // ember bed: quiet low rumble
      const src = loopSource('brown');
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 350;
      const g = ctx.createGain(); g.gain.value = 0.18;
      src.connect(lp).connect(g).connect(out);
      nodes.push(...lfo(0.11, 0.06, g.gain));
      nodes.push(src, lp, g);
      // crackles: tiny bright noise bursts at random intervals
      const crackle = () => {
        if (!ctx || ctx.state === 'closed') return;
        const c = loopSource('white');
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass';
        hp.frequency.value = 1200 + Math.random() * 3000;
        const eg = ctx.createGain();
        const t = ctx.currentTime;
        eg.gain.setValueAtTime(0.0001, t);
        eg.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.25, t + 0.003);
        eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.05);
        c.connect(hp).connect(eg).connect(out);
        c.stop(t + 0.1);
        timers.push(setTimeout(crackle, 40 + Math.random() * 500));
      };
      timers.push(setTimeout(crackle, 300));
      return { nodes, timers };
    }
  },
  {
    id: 'crickets', emoji: '🦗', name: 'Crickets', desc: 'A summer night in the grass',
    defaultVol: 40,
    build(out) {
      const nodes = [], timers = [];
      const chirp = () => {
        if (!ctx || ctx.state === 'closed') return;
        const f = 4100 + Math.random() * 600;
        const t0 = ctx.currentTime + 0.02;
        const pulses = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < pulses; i++) {
          const o = ctx.createOscillator();
          o.frequency.value = f;
          const eg = ctx.createGain();
          const t = t0 + i * 0.055;
          eg.gain.setValueAtTime(0.0001, t);
          eg.gain.exponentialRampToValueAtTime(0.02, t + 0.008);
          eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
          o.connect(eg).connect(out);
          o.start(t); o.stop(t + 0.05);
        }
        timers.push(setTimeout(chirp, 300 + Math.random() * 1200));
      };
      timers.push(setTimeout(chirp, 100));
      return { nodes, timers };
    }
  },
  {
    id: 'train', emoji: '🚂', name: 'Night train', desc: 'Rhythmic clatter on distant rails',
    defaultVol: 55,
    build(out) {
      const nodes = [];
      // rolling body
      const src = loopSource('brown');
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      const g = ctx.createGain(); g.gain.value = 0.3;
      src.connect(lp).connect(g).connect(out);
      // clickety-clack: noise gated by two square-ish LFOs (bogie pairs)
      const clat = loopSource('white');
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 900; bp.Q.value = 1.2;
      const cg = ctx.createGain(); cg.gain.value = 0.0;
      clat.connect(bp).connect(cg).connect(out);
      const mkGate = (freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'square'; osc.frequency.value = freq;
        const gd = ctx.createGain(); gd.gain.value = 0.035;
        osc.connect(gd).connect(cg.gain);
        osc.start();
        nodes.push(osc, gd);
      };
      mkGate(2.4); mkGate(1.2);
      nodes.push(src, lp, g, clat, bp, cg);
      return { nodes };
    }
  },
  {
    id: 'heartbeat', emoji: '💗', name: 'Heartbeat', desc: 'Slow, calm lub-dub — womb-like',
    defaultVol: 50,
    build(out) {
      const nodes = [], timers = [];
      const thump = (t, vol) => {
        const o = ctx.createOscillator();
        o.frequency.setValueAtTime(70, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        const eg = ctx.createGain();
        eg.gain.setValueAtTime(0.0001, t);
        eg.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.connect(eg).connect(out);
        o.start(t); o.stop(t + 0.3);
      };
      const beat = () => {
        if (!ctx || ctx.state === 'closed') return;
        const t = ctx.currentTime + 0.05;
        thump(t, 0.9);          // lub
        thump(t + 0.28, 0.55);  // dub
        timers.push(setTimeout(beat, 1050));  // ~57 bpm
      };
      timers.push(setTimeout(beat, 100));
      return { nodes, timers };
    }
  },
];

/* ═══════════════════ Active-sound management ═══════════════════ */

const active = {};   // id -> { gain, handle }

function startSound(id) {
  ensureContext();
  const def = SOUNDS.find(s => s.id === id);
  if (!def || active[id]) return;
  const g = ctx.createGain();
  const vol = getCardVol(id) / 100;
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.linearRampToValueAtTime(vol * vol, ctx.currentTime + 0.6); // fade-in, squared for perceptual taper
  g.connect(masterGain);
  const handle = def.build(g);
  active[id] = { gain: g, handle };
  autoPlay();
  updateCardUI();
  updateMediaSession();
}

function stopSound(id) {
  const a = active[id];
  if (!a) return;
  delete active[id];
  const { gain, handle } = a;
  (handle.timers || []).forEach(clearTimeout);
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  setTimeout(() => {
    (handle.nodes || []).forEach(n => {
      try { if (n.stop) n.stop(); } catch (e) { /* already stopped */ }
      try { n.disconnect(); } catch (e) { /* already disconnected */ }
    });
    try { gain.disconnect(); } catch (e) { /* noop */ }
  }, 500);
  updateCardUI();
  updateMediaSession();
}

function setSoundVol(id, vol100) {
  const a = active[id];
  if (!a) return;
  const v = vol100 / 100;
  a.gain.gain.cancelScheduledValues(ctx.currentTime);
  a.gain.gain.setTargetAtTime(v * v, ctx.currentTime, 0.08);
}

function stopAll() {
  Object.keys(active).forEach(stopSound);
  stopBinaural();
}

function anythingOn() {
  return Object.keys(active).length > 0 || binaural.on;
}

/* ═══════════════════ Binaural beats ═══════════════════ */

const binaural = { on: false, oscL: null, oscR: null, gain: null };

function startBinaural() {
  ensureContext();
  if (binaural.on) return;
  const g = ctx.createGain();
  const vol = els.binauralVol.value / 100;
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.linearRampToValueAtTime(vol * vol * 0.5, ctx.currentTime + 0.8);
  g.connect(masterGain);
  const mk = (pan) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; o.connect(p).connect(g); }
    else o.connect(g);
    o.start();
    return o;
  };
  binaural.oscL = mk(-1);
  binaural.oscR = mk(1);
  binaural.gain = g;
  binaural.on = true;
  applyBinauralFreqs();
  els.binauralPanel.classList.add('on');
  document.getElementById('binauralToggle').setAttribute('aria-pressed', 'true');
  autoPlay();
  updateMediaSession();
}

function stopBinaural() {
  if (!binaural.on) return;
  const { oscL, oscR, gain } = binaural;
  binaural.on = false;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  setTimeout(() => {
    [oscL, oscR, gain].forEach(n => {
      try { if (n.stop) n.stop(); } catch (e) { /* noop */ }
      try { n.disconnect(); } catch (e) { /* noop */ }
    });
  }, 500);
  binaural.oscL = binaural.oscR = binaural.gain = null;
  els.binauralPanel.classList.remove('on');
  document.getElementById('binauralToggle').setAttribute('aria-pressed', 'false');
  updateMediaSession();
}

function applyBinauralFreqs() {
  if (!binaural.on) return;
  const carrier = +els.carrierFreq.value;
  const beat = +els.beatFreq.value;
  binaural.oscL.frequency.setTargetAtTime(carrier - beat / 2, ctx.currentTime, 0.1);
  binaural.oscR.frequency.setTargetAtTime(carrier + beat / 2, ctx.currentTime, 0.1);
}

const BRAINWAVES = [
  { name: '😴 Delta · sleep', beat: 2 },
  { name: '🧘 Theta · meditate', beat: 6 },
  { name: '🌤️ Alpha · relax', beat: 10 },
  { name: '🎯 Beta · focus', beat: 18 },
];

/* ═══════════════════ Play / pause ═══════════════════ */

function autoPlay() {
  if (!playing && anythingOn()) setPlaying(true);
}

function setPlaying(on) {
  ensureContext();
  playing = on;
  if (on) {
    ctx.resume();
    if (!anythingOn()) applyPreset(PRESETS[0]); // play with empty mix -> start default
  } else {
    ctx.suspend();
  }
  document.body.classList.toggle('playing', on);
  els.brandDot.classList.toggle('live', on);
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
  }
}

function togglePlay() { setPlaying(!playing); }

/* ═══════════════════ Presets ═══════════════════ */

const PRESETS = [
  { name: '🌧️ Rainy night', mix: { rain: 65, thunder: 60, wind: 25 } },
  { name: '😴 Deep sleep', mix: { brown: 70, rain: 25 } },
  { name: '🌊 Ocean escape', mix: { ocean: 70, wind: 30 } },
  { name: '🎯 Focus', mix: { pink: 55, stream: 30 } },
  { name: '🔥 Cabin evening', mix: { fire: 65, wind: 30, crickets: 25 } },
  { name: '🚂 Sleeper car', mix: { train: 60, rain: 35 } },
  { name: '👶 Womb', mix: { heartbeat: 55, brown: 45 } },
];

function currentMix() {
  const mix = {};
  Object.keys(active).forEach(id => { mix[id] = getCardVol(id); });
  return mix;
}

function applyPreset(preset) {
  Object.keys(active).forEach(id => { if (!(id in preset.mix)) stopSound(id); });
  Object.entries(preset.mix).forEach(([id, vol]) => {
    setCardVol(id, vol);
    if (active[id]) setSoundVol(id, vol);
    else startSound(id);
  });
  if (preset.binaural) {
    els.beatFreq.value = preset.binaural.beat;
    els.carrierFreq.value = preset.binaural.carrier;
    els.binauralVol.value = preset.binaural.vol;
    updateBinauralLabels();
    startBinaural();
    applyBinauralFreqs();
  } else {
    stopBinaural();
  }
  autoPlay();
}

function loadUserPresets() {
  try { return JSON.parse(localStorage.getItem('noise.presets') || '[]'); }
  catch (e) { return []; }
}

function saveUserPreset() {
  if (!anythingOn()) { toast('Turn some sounds on first'); return; }
  const name = prompt('Name this mix:', 'My mix');
  if (!name) return;
  const presets = loadUserPresets();
  const p = { name: '⭐ ' + name, mix: currentMix() };
  if (binaural.on) {
    p.binaural = { beat: +els.beatFreq.value, carrier: +els.carrierFreq.value, vol: +els.binauralVol.value };
  }
  presets.push(p);
  localStorage.setItem('noise.presets', JSON.stringify(presets));
  renderPresets();
  toast('Mix saved');
}

function deleteUserPreset(i) {
  const presets = loadUserPresets();
  presets.splice(i, 1);
  localStorage.setItem('noise.presets', JSON.stringify(presets));
  renderPresets();
}

function surpriseMix() {
  const ambient = SOUNDS.filter(s => !['white', 'pink', 'brown'].includes(s.id));
  const picks = ambient.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
  const mix = {};
  picks.forEach(s => { mix[s.id] = 25 + Math.floor(Math.random() * 50); });
  applyPreset({ name: 'surprise', mix });
  toast('🎲 ' + picks.map(s => s.name).join(' + '));
}

/* ═══════════════════ Sleep timer ═══════════════════ */

const timer = { end: 0, interval: null, fading: false };

function startTimer(min) {
  cancelTimer(true);
  timer.end = Date.now() + min * 60000;
  els.timerDisplay.hidden = false;
  els.timerCancel.hidden = false;
  timer.interval = setInterval(tickTimer, 250);
  document.querySelectorAll('#timerChips .chip').forEach(c =>
    c.classList.toggle('on', +c.dataset.min === min));
  autoPlay();
  tickTimer();
}

function tickTimer() {
  const left = timer.end - Date.now();
  if (left <= 0) {
    cancelTimer(true);
    stopAll();
    setPlaying(false);
    if (masterGain) masterGain.gain.setValueAtTime(els.masterVol.value / 100, ctx.currentTime);
    toast('🌙 Good night');
    return;
  }
  // fade master volume over the final 30 s
  if (left < 30000 && masterGain) {
    if (!timer.fading) {
      timer.fading = true;
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + left / 1000);
    }
  }
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  els.timerDisplay.textContent = `${m}:${String(s).padStart(2, '0')}`;
}

function cancelTimer(silent) {
  if (timer.interval) clearInterval(timer.interval);
  timer.interval = null;
  timer.end = 0;
  if (timer.fading && masterGain) {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(els.masterVol.value / 100, ctx.currentTime, 0.2);
  }
  timer.fading = false;
  els.timerDisplay.hidden = true;
  els.timerCancel.hidden = true;
  document.querySelectorAll('#timerChips .chip').forEach(c => c.classList.remove('on'));
  if (!silent) toast('Timer cancelled');
}

/* ═══════════════════ Visualizer ═══════════════════ */

function drawViz() {
  requestAnimationFrame(drawViz);
  const canvas = els.viz;
  const c2d = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = 120 * devicePixelRatio;
  c2d.clearRect(0, 0, w, h);

  const bars = 64;
  const gap = 2 * devicePixelRatio;
  const bw = w / bars - gap;
  const grad = c2d.createLinearGradient(0, h, 0, 0);
  grad.addColorStop(0, '#7c9cff');
  grad.addColorStop(1, '#b48cff');
  c2d.fillStyle = grad;

  let data = null;
  if (analyser && playing) {
    data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
  }
  const t = performance.now() / 1000;
  for (let i = 0; i < bars; i++) {
    let v;
    if (data) {
      v = data[Math.floor(i * data.length / bars * 0.75)] / 255;
    } else {
      // gentle idle wave when silent
      v = 0.05 + 0.04 * Math.sin(t * 1.2 + i * 0.35) + 0.02 * Math.sin(t * 2.1 + i * 0.9);
    }
    const bh = Math.max(2 * devicePixelRatio, v * h * 0.92);
    const x = i * (bw + gap) + gap / 2;
    c2d.globalAlpha = data ? 0.9 : 0.45;
    roundBar(c2d, x, h - bh, bw, bh);
  }
  c2d.globalAlpha = 1;
}

function roundBar(c2d, x, y, w, h) {
  const r = Math.min(w / 2, 3 * devicePixelRatio);
  c2d.beginPath();
  c2d.moveTo(x, y + h);
  c2d.lineTo(x, y + r);
  c2d.arcTo(x, y, x + r, y, r);
  c2d.arcTo(x + w, y, x + w, y + r, r);
  c2d.lineTo(x + w, y + h);
  c2d.closePath();
  c2d.fill();
}

/* ═══════════════════ UI wiring ═══════════════════ */

const els = {};

function $(id) { return document.getElementById(id); }

function getCardVol(id) {
  return +document.querySelector(`.card[data-id="${id}"] input`).value;
}
function setCardVol(id, v) {
  document.querySelector(`.card[data-id="${id}"] input`).value = v;
}

function updateCardUI() {
  document.querySelectorAll('.card').forEach(card => {
    card.classList.toggle('on', card.dataset.id in active);
  });
}

function renderCards() {
  els.soundGrid.innerHTML = '';
  SOUNDS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = s.id;
    card.innerHTML = `
      <div class="card-head">
        <span class="card-emoji">${s.emoji}</span>
        <span class="card-name">${s.name}</span>
        <span class="led"></span>
      </div>
      <p class="card-desc">${s.desc}</p>
      <input type="range" min="0" max="100" value="${s.defaultVol}" aria-label="${s.name} volume">
    `;
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (active[s.id]) stopSound(s.id); else startSound(s.id);
    });
    const slider = card.querySelector('input');
    slider.addEventListener('input', () => {
      if (!active[s.id]) startSound(s.id);
      setSoundVol(s.id, +slider.value);
    });
    els.soundGrid.appendChild(card);
  });
}

function renderPresets() {
  els.presetChips.innerHTML = '';
  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = p.name;
    b.addEventListener('click', () => { applyPreset(p); toast(p.name); });
    els.presetChips.appendChild(b);
  });
  loadUserPresets().forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = p.name;
    const x = document.createElement('span');
    x.className = 'chip-x';
    x.textContent = '✕';
    x.title = 'Delete preset';
    x.addEventListener('click', (e) => { e.stopPropagation(); deleteUserPreset(i); });
    b.appendChild(x);
    b.addEventListener('click', () => { applyPreset(p); toast(p.name); });
    els.presetChips.appendChild(b);
  });
}

function renderBrainwaves() {
  els.brainwaveChips.innerHTML = '';
  BRAINWAVES.forEach(bw => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = bw.name;
    b.addEventListener('click', () => {
      els.beatFreq.value = bw.beat;
      updateBinauralLabels();
      if (!binaural.on) startBinaural();
      applyBinauralFreqs();
      els.brainwaveChips.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
    });
    els.brainwaveChips.appendChild(b);
  });
}

function updateBinauralLabels() {
  els.beatVal.innerHTML = `${els.beatFreq.value}&nbsp;Hz`;
  els.carrierVal.innerHTML = `${els.carrierFreq.value}&nbsp;Hz`;
}

let toastTimeout = null;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { els.toast.hidden = true; }, 2200);
}

function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const names = Object.keys(active)
    .map(id => SOUNDS.find(s => s.id === id).name);
  if (binaural.on) names.push('Binaural beats');
  navigator.mediaSession.metadata = new MediaMetadata({
    title: names.length ? names.join(' + ') : 'Noise Machine',
    artist: 'Noise Machine',
  });
}

function init() {
  ['soundGrid', 'presetChips', 'brainwaveChips', 'masterVol', 'playBtn', 'brandDot',
   'viz', 'toast', 'timerDisplay', 'timerCancel', 'binauralPanel', 'beatFreq',
   'carrierFreq', 'binauralVol', 'beatVal', 'carrierVal'].forEach(id => { els[id] = $(id); });

  renderCards();
  renderPresets();
  renderBrainwaves();
  drawViz();

  els.playBtn.addEventListener('click', togglePlay);
  $('stopAllBtn').addEventListener('click', () => { stopAll(); setPlaying(false); });
  $('savePresetBtn').addEventListener('click', saveUserPreset);
  $('surpriseBtn').addEventListener('click', surpriseMix);

  els.masterVol.addEventListener('input', () => {
    if (masterGain && !timer.fading) {
      masterGain.gain.setTargetAtTime(els.masterVol.value / 100, ctx.currentTime, 0.05);
    }
  });

  const binToggle = $('binauralToggle');
  binToggle.addEventListener('click', () => {
    if (binaural.on) stopBinaural(); else startBinaural();
  });
  binToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); binToggle.click(); }
  });
  els.beatFreq.addEventListener('input', () => { updateBinauralLabels(); applyBinauralFreqs(); });
  els.carrierFreq.addEventListener('input', () => { updateBinauralLabels(); applyBinauralFreqs(); });
  els.binauralVol.addEventListener('input', () => {
    if (binaural.on) {
      const v = els.binauralVol.value / 100;
      binaural.gain.gain.setTargetAtTime(v * v * 0.5, ctx.currentTime, 0.08);
    }
  });

  document.querySelectorAll('#timerChips .chip').forEach(c =>
    c.addEventListener('click', () => startTimer(+c.dataset.min)));
  els.timerCancel.addEventListener('click', () => cancelTimer(false));

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'BUTTON', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      togglePlay();
    }
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
  }

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is best-effort */ });
  }
}

document.addEventListener('DOMContentLoaded', init);
