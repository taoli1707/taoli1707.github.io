/* Toolkit — app logic */
"use strict";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem("toolkit." + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("toolkit." + key, JSON.stringify(value)); } catch (e) {}
  }
};

/* ================= Navigation ================= */

const tools = {}; // id -> {enter, exit}
let currentTool = null;
let wakeLock = null;

async function acquireWakeLock() {
  try {
    if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) { /* not critical */ }
}
function releaseWakeLock() {
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

function route() {
  const id = location.hash.replace("#", "");
  const target = document.getElementById(id);
  const valid = id && target && target.classList.contains("tool");

  if (currentTool && tools[currentTool] && tools[currentTool].exit) tools[currentTool].exit();
  releaseWakeLock();

  $$(".screen").forEach((s) => s.classList.add("hidden"));
  if (valid) {
    target.classList.remove("hidden");
    currentTool = id;
    if (tools[id] && tools[id].enter) tools[id].enter();
  } else {
    $("#home").classList.remove("hidden");
    currentTool = null;
    if (id) history.replaceState(null, "", location.pathname);
  }
}
window.addEventListener("hashchange", route);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && currentTool && tools[currentTool] && tools[currentTool].wake) {
    tools[currentTool].wake();
  }
});

/* ================= Motion permission (iOS 13+) ================= */

async function requestMotionPermission() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      return res === "granted";
    } catch (e) { return false; }
  }
  return true; // no gate on this platform
}

function motionNeedsGate() {
  return typeof DeviceOrientationEvent !== "undefined" &&
         typeof DeviceOrientationEvent.requestPermission === "function" &&
         !store.get("motionGranted", false);
}

/* ================= Flashlight ================= */

(() => {
  const surface = $("#light-surface");
  const chrome = $("#light-chrome");
  const brightness = $("#light-brightness");
  let color = "#ffffff";
  let strobeTimer = null;
  let sosTimer = null;
  let lightOn = true;

  function shade(hex, pct) {
    const n = parseInt(hex.slice(1), 16);
    const f = pct / 100;
    const r = Math.round(((n >> 16) & 255) * f);
    const g = Math.round(((n >> 8) & 255) * f);
    const b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  }
  function paint() {
    surface.style.background = lightOn ? shade(color, +brightness.value) : "#000";
  }
  function stopPatterns() {
    clearInterval(strobeTimer); strobeTimer = null;
    clearTimeout(sosTimer); sosTimer = null;
    $("#light-strobe").classList.remove("active");
    $("#light-sos").classList.remove("active");
    lightOn = true;
    paint();
  }

  brightness.addEventListener("input", paint);

  $("#light-colors").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-color]");
    if (!btn) return;
    $$("#light-colors .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    color = btn.dataset.color;
    paint();
  });

  $("#light-strobe").addEventListener("click", (e) => {
    const wasOn = !!strobeTimer;
    stopPatterns();
    if (!wasOn) {
      e.target.classList.add("active");
      strobeTimer = setInterval(() => { lightOn = !lightOn; paint(); }, 80);
    }
  });

  // SOS: dot=200ms, dash=600ms, gaps per Morse timing
  $("#light-sos").addEventListener("click", (e) => {
    const wasOn = !!sosTimer;
    stopPatterns();
    if (wasOn) return;
    e.target.classList.add("active");
    const unit = 200;
    const pattern = []; // [durationOn, durationOff, ...] built from S O S
    const letters = [[1, 1, 1], [3, 3, 3], [1, 1, 1]];
    letters.forEach((letter, li) => {
      letter.forEach((units, si) => {
        pattern.push(units * unit); // on
        pattern.push(si === letter.length - 1 ? (li === letters.length - 1 ? 7 * unit : 3 * unit) : unit); // off
      });
    });
    let i = 0;
    let on = true;
    function step() {
      lightOn = on;
      paint();
      const dur = pattern[i];
      i = (i + 1) % pattern.length;
      on = !on;
      sosTimer = setTimeout(step, dur);
    }
    step();
  });

  surface.addEventListener("click", () => chrome.classList.toggle("hidden"));

  tools.flashlight = {
    enter() { paint(); acquireWakeLock(); },
    exit() { stopPatterns(); chrome.classList.remove("hidden"); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Ruler ================= */

(() => {
  const canvas = $("#ruler-canvas");
  const ctx = canvas.getContext("2d");
  const lineA = $("#ruler-line-a");
  const lineB = $("#ruler-line-b");
  const readout = $("#ruler-readout");
  // Default calibration: typical iPhone ≈ 6.0 CSS px/mm; desktop ≈ 96dpi
  const defaultPxPerMm = ("ontouchstart" in window) ? 6.0 : 96 / 25.4;
  let pxPerMm = store.get("pxPerMm", defaultPxPerMm);
  let unit = store.get("rulerUnit", "cm");
  let posA = 140, posB = 420;

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#101014";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#8e8e93";
    ctx.fillStyle = "#8e8e93";
    ctx.font = "13px -apple-system, sans-serif";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

    const pxPerUnit = unit === "cm" ? pxPerMm * 10 : pxPerMm * 25.4;
    const subdiv = unit === "cm" ? 10 : 16; // mm ticks / 16ths
    const step = pxPerUnit / subdiv;

    ctx.beginPath();
    for (let i = 0; i * step <= h; i++) {
      const y = i * step;
      let len;
      if (i % subdiv === 0) len = 34;
      else if (unit === "cm" ? i % 5 === 0 : i % 4 === 0) len = 22;
      else len = 12;
      ctx.moveTo(0, y);
      ctx.lineTo(len, y);
      if (i % subdiv === 0 && i > 0) {
        ctx.fillText(String(i / subdiv), 40, y);
      }
    }
    ctx.stroke();
  }

  function updateReadout() {
    const px = Math.abs(posB - posA);
    const mm = px / pxPerMm;
    readout.textContent = unit === "cm"
      ? (mm / 10).toFixed(2) + " cm"
      : (mm / 25.4).toFixed(2) + " in";
    lineA.style.top = posA + "px";
    lineB.style.top = posB + "px";
  }

  function dragify(line, get, set) {
    line.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      line.setPointerCapture(e.pointerId);
      const startY = e.clientY;
      const startPos = get();
      function move(ev) {
        set(clamp(startPos + (ev.clientY - startY), 0, window.innerHeight));
        updateReadout();
      }
      function up() {
        line.removeEventListener("pointermove", move);
        line.removeEventListener("pointerup", up);
      }
      line.addEventListener("pointermove", move);
      line.addEventListener("pointerup", up);
    });
  }
  dragify(lineA, () => posA, (v) => { posA = v; });
  dragify(lineB, () => posB, (v) => { posB = v; });

  function setUnit(u) {
    unit = u;
    store.set("rulerUnit", u);
    $("#ruler-unit-cm").classList.toggle("active", u === "cm");
    $("#ruler-unit-in").classList.toggle("active", u === "in");
    draw();
    updateReadout();
  }
  $("#ruler-unit-cm").addEventListener("click", () => setUnit("cm"));
  $("#ruler-unit-in").addEventListener("click", () => setUnit("in"));

  // Calibration: match on-screen outline to a physical credit card (85.60 mm wide)
  const CARD_MM = 85.6;
  const modal = $("#ruler-cal");
  const card = $("#cal-card");
  const slider = $("#cal-slider");
  function paintCard() {
    const wpx = +slider.value / 10;
    card.style.width = wpx + "px";
    card.style.height = (wpx * 53.98 / CARD_MM) + "px";
  }
  $("#ruler-calibrate").addEventListener("click", () => {
    slider.value = Math.round(pxPerMm * CARD_MM * 10);
    paintCard();
    modal.classList.remove("hidden");
  });
  slider.addEventListener("input", paintCard);
  $("#cal-reset").addEventListener("click", () => {
    slider.value = Math.round(defaultPxPerMm * CARD_MM * 10);
    paintCard();
  });
  $("#cal-done").addEventListener("click", () => {
    pxPerMm = (+slider.value / 10) / CARD_MM;
    store.set("pxPerMm", pxPerMm);
    modal.classList.add("hidden");
    draw();
    updateReadout();
  });

  window.addEventListener("resize", () => {
    if (currentTool === "ruler") { draw(); updateReadout(); }
  });

  tools.ruler = {
    enter() {
      posA = Math.round(window.innerHeight * 0.25);
      posB = Math.round(window.innerHeight * 0.6);
      draw();
      updateReadout();
    }
  };
})();

/* ================= Level ================= */

(() => {
  const bubble = $("#level-bubble");
  const edgeBubble = $("#edge-bubble");
  const flatEl = $("#level-flat");
  const edgeEl = $("#level-edge");
  const readout = $("#level-readout");
  const sub = $("#level-sub");
  const permBtn = $("#level-perm");
  let mode = "auto"; // auto | flat | edge
  let zero = store.get("levelZero", { beta: 0, gamma: 0 });
  let last = { beta: 0, gamma: 0 };
  let listening = false;

  function onOrient(e) {
    if (e.beta === null || e.gamma === null) return;
    // Low-pass filter for a steady bubble
    last.beta = last.beta * 0.85 + e.beta * 0.15;
    last.gamma = last.gamma * 0.85 + e.gamma * 0.15;
    render();
  }

  function render() {
    const beta = last.beta - zero.beta;   // front-back tilt
    const gamma = last.gamma - zero.gamma; // left-right tilt
    const edgeMode = mode === "edge" || (mode === "auto" && Math.abs(last.beta) > 55);

    flatEl.classList.toggle("hidden", edgeMode);
    edgeEl.classList.toggle("hidden", !edgeMode);

    if (edgeMode) {
      // Phone held on its edge: gamma ≈ roll around vertical
      const angle = clamp(gamma, -45, 45);
      const trackW = edgeEl.querySelector(".edge-track").clientWidth;
      edgeBubble.style.transform =
        `translateX(calc(-50% + ${(angle / 45) * (trackW / 2 - 36)}px))`;
      readout.textContent = Math.abs(gamma).toFixed(1) + "°";
      sub.textContent = "edge mode";
      readout.style.color = Math.abs(gamma) < 0.5 ? "#30d158" : "";
    } else {
      const r = flatEl.clientWidth / 2 - 30;
      const dx = clamp(gamma / 45, -1, 1) * r;
      const dy = clamp(beta / 45, -1, 1) * r;
      bubble.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      const tilt = Math.hypot(beta, gamma);
      bubble.classList.toggle("on-level", tilt < 0.7);
      readout.textContent = tilt.toFixed(1) + "°";
      readout.style.color = tilt < 0.7 ? "#30d158" : "";
      sub.textContent = `x ${gamma.toFixed(1)}°   y ${beta.toFixed(1)}°`;
    }
  }

  function start() {
    if (!listening) {
      window.addEventListener("deviceorientation", onOrient);
      listening = true;
    }
  }
  function stop() {
    window.removeEventListener("deviceorientation", onOrient);
    listening = false;
  }

  permBtn.addEventListener("click", async () => {
    const ok = await requestMotionPermission();
    if (ok) {
      store.set("motionGranted", true);
      permBtn.classList.add("hidden");
      start();
    } else {
      $("#level-hint").textContent = "Motion access denied. Enable it in Settings → Safari → Motion & Orientation Access.";
    }
  });

  ["auto", "flat", "edge"].forEach((m) => {
    $("#level-mode-" + (m === "flat" ? "flat" : m === "edge" ? "edge" : "auto"))
      .addEventListener("click", (e) => {
        mode = m;
        $$("#level .chip").forEach((c) => c.classList.remove("active"));
        e.target.classList.add("active");
        render();
      });
  });
  $("#level-zero").addEventListener("click", () => {
    zero = { beta: last.beta, gamma: last.gamma };
    store.set("levelZero", zero);
  });

  tools.level = {
    enter() {
      acquireWakeLock();
      if (motionNeedsGate()) {
        permBtn.classList.remove("hidden");
      } else {
        start();
      }
    },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Compass ================= */

(() => {
  const dial = $("#compass-dial");
  const degEl = $("#compass-deg");
  const dirEl = $("#compass-dir");
  const permBtn = $("#compass-perm");
  const hint = $("#compass-hint");
  const DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  let listening = false;
  let smoothed = null;

  // Build dial face
  (function buildDial() {
    const svg = $("#compass-svg");
    const NS = "http://www.w3.org/2000/svg";
    const cx = 150, cy = 150;
    let parts = `<circle cx="150" cy="150" r="146" fill="#15151c" stroke="#2c2c34" stroke-width="2"/>`;
    for (let d = 0; d < 360; d += 2) {
      const major = d % 30 === 0;
      const len = major ? 16 : (d % 10 === 0 ? 10 : 5);
      const a = (d - 90) * Math.PI / 180;
      const r1 = 138, r2 = 138 - len;
      parts += `<line x1="${cx + r1 * Math.cos(a)}" y1="${cy + r1 * Math.sin(a)}" x2="${cx + r2 * Math.cos(a)}" y2="${cy + r2 * Math.sin(a)}" stroke="${major ? "#8e8e93" : "#3a3a44"}" stroke-width="${major ? 2 : 1}"/>`;
    }
    [["N", 0, "#ff453a"], ["E", 90, "#f2f2f7"], ["S", 180, "#f2f2f7"], ["W", 270, "#f2f2f7"]].forEach(([t, d, color]) => {
      const a = (d - 90) * Math.PI / 180;
      const r = 104;
      parts += `<text x="${cx + r * Math.cos(a)}" y="${cy + r * Math.sin(a)}" fill="${color}" font-size="26" font-weight="700" text-anchor="middle" dominant-baseline="central" transform="rotate(${d} ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)})">${t}</text>`;
    });
    [30, 60, 120, 150, 210, 240, 300, 330].forEach((d) => {
      const a = (d - 90) * Math.PI / 180;
      const r = 108;
      parts += `<text x="${cx + r * Math.cos(a)}" y="${cy + r * Math.sin(a)}" fill="#8e8e93" font-size="13" text-anchor="middle" dominant-baseline="central" transform="rotate(${d} ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)})">${d}</text>`;
    });
    parts += `<line x1="150" y1="14" x2="150" y2="46" stroke="#ff453a" stroke-width="4" stroke-linecap="round"/>`;
    svg.innerHTML = parts;
  })();

  function onOrient(e) {
    let heading = null;
    if (typeof e.webkitCompassHeading === "number" && !isNaN(e.webkitCompassHeading)) {
      heading = e.webkitCompassHeading; // iOS: degrees clockwise from north
    } else if (e.absolute && e.alpha !== null) {
      heading = (360 - e.alpha) % 360;
    } else if (e.alpha !== null) {
      heading = (360 - e.alpha) % 360;
      hint.textContent = "Heading may be relative on this device.";
    }
    if (heading === null) return;

    // Smooth across the 0/360 wrap
    if (smoothed === null) smoothed = heading;
    let delta = heading - smoothed;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    smoothed = (smoothed + delta * 0.25 + 360) % 360;

    dial.style.transform = `rotate(${-smoothed}deg)`;
    degEl.textContent = Math.round(smoothed) + "°";
    dirEl.textContent = DIRS[Math.round(smoothed / 22.5) % 16];
  }

  function start() {
    if (listening) return;
    window.addEventListener("deviceorientationabsolute", onOrient);
    window.addEventListener("deviceorientation", onOrient);
    listening = true;
  }
  function stop() {
    window.removeEventListener("deviceorientationabsolute", onOrient);
    window.removeEventListener("deviceorientation", onOrient);
    listening = false;
    smoothed = null;
  }

  permBtn.addEventListener("click", async () => {
    const ok = await requestMotionPermission();
    if (ok) {
      store.set("motionGranted", true);
      permBtn.classList.add("hidden");
      start();
    } else {
      hint.textContent = "Compass access denied. Enable Motion & Orientation Access in Safari settings.";
    }
  });

  tools.compass = {
    enter() {
      acquireWakeLock();
      if (motionNeedsGate()) {
        permBtn.classList.remove("hidden");
      } else {
        start();
      }
    },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Converter ================= */

(() => {
  // Factors convert TO the base unit of each category
  const CATS = {
    Length: { base: "m", units: { km: 1000, m: 1, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 } },
    Weight: { base: "kg", units: { t: 1000, kg: 1, g: 0.001, mg: 1e-6, lb: 0.45359237, oz: 0.028349523125, st: 6.35029318 } },
    Temp: { special: true, units: ["°C", "°F", "K"] },
    Area: { base: "m²", units: { "km²": 1e6, "m²": 1, "ft²": 0.09290304, "in²": 0.00064516, acre: 4046.8564224, ha: 10000 } },
    Volume: { base: "L", units: { "m³": 1000, L: 1, mL: 0.001, "gal (US)": 3.785411784, "qt (US)": 0.946352946, "cup (US)": 0.2365882365, "fl oz (US)": 0.0295735295625, tbsp: 0.01478676478, tsp: 0.00492892159 } },
    Speed: { base: "m/s", units: { "km/h": 1 / 3.6, "m/s": 1, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 } },
    Data: { base: "MB", units: { TB: 1e6, GB: 1000, MB: 1, KB: 0.001, GiB: 1073.741824, MiB: 1.048576 } }
  };
  const DEFAULTS = { Length: ["m", "ft"], Weight: ["kg", "lb"], Temp: ["°C", "°F"], Area: ["m²", "ft²"], Volume: ["L", "gal (US)"], Speed: ["km/h", "mph"], Data: ["GB", "MB"] };

  const catsRow = $("#conv-cats");
  const fromSel = $("#conv-from");
  const toSel = $("#conv-to");
  const input = $("#conv-input");
  const output = $("#conv-output");
  let cat = "Length";

  Object.keys(CATS).forEach((name, i) => {
    const b = document.createElement("button");
    b.className = "chip" + (i === 0 ? " active" : "");
    b.textContent = name;
    b.addEventListener("click", () => {
      cat = name;
      $$("#conv-cats .chip").forEach((c) => c.classList.remove("active"));
      b.classList.add("active");
      fillUnits();
      convert();
    });
    catsRow.appendChild(b);
  });

  function fillUnits() {
    const c = CATS[cat];
    const names = c.special ? c.units : Object.keys(c.units);
    [fromSel, toSel].forEach((sel) => {
      sel.innerHTML = "";
      names.forEach((u) => {
        const o = document.createElement("option");
        o.value = u;
        o.textContent = u;
        sel.appendChild(o);
      });
    });
    fromSel.value = DEFAULTS[cat][0];
    toSel.value = DEFAULTS[cat][1];
  }

  function convertTemp(v, from, to) {
    let c;
    if (from === "°C") c = v;
    else if (from === "°F") c = (v - 32) * 5 / 9;
    else c = v - 273.15;
    if (to === "°C") return c;
    if (to === "°F") return c * 9 / 5 + 32;
    return c + 273.15;
  }

  function fmt(n) {
    if (!isFinite(n)) return "--";
    const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e9 || abs < 1e-6)) return n.toExponential(4);
    return parseFloat(n.toPrecision(8)).toLocaleString("en-US", { maximumFractionDigits: 8 });
  }

  function convert() {
    const v = parseFloat(input.value.replace(/,/g, ""));
    if (isNaN(v)) { output.textContent = "--"; return; }
    const c = CATS[cat];
    const result = c.special
      ? convertTemp(v, fromSel.value, toSel.value)
      : v * c.units[fromSel.value] / c.units[toSel.value];
    output.textContent = fmt(result);
  }

  input.addEventListener("input", convert);
  fromSel.addEventListener("change", convert);
  toSel.addEventListener("change", convert);
  $("#conv-swap").addEventListener("click", () => {
    const f = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = f;
    convert();
  });

  fillUnits();
  convert();
})();

/* ================= Stopwatch / Timer ================= */

(() => {
  // Tabs
  $("#timer-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    $$("#timer-tabs .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-sw").classList.toggle("hidden", btn.dataset.tab !== "sw");
    $("#tab-tm").classList.toggle("hidden", btn.dataset.tab !== "tm");
  });

  /* --- Stopwatch --- */
  const swDisplay = $("#sw-display");
  const swBtn = $("#sw-startstop");
  const swLapBtn = $("#sw-lap");
  const lapsEl = $("#sw-laps");
  let swRunning = false;
  let swStart = 0;       // epoch when (re)started
  let swElapsed = 0;     // accumulated ms when paused
  let swRaf = null;
  let lastLapAt = 0;

  function swNow() { return swRunning ? swElapsed + (Date.now() - swStart) : swElapsed; }
  function fmtSw(ms) {
    const cs = Math.floor(ms / 10) % 100;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    const mm = String(m).padStart(2, "0"), ss = String(s).padStart(2, "0"), cc = String(cs).padStart(2, "0");
    return (h ? h + ":" : "") + mm + ":" + ss + `<small>.${cc}</small>`;
  }
  function swTick() {
    swDisplay.innerHTML = fmtSw(swNow());
    if (swRunning) swRaf = requestAnimationFrame(swTick);
  }
  swBtn.addEventListener("click", () => {
    if (swRunning) {
      swElapsed = swNow();
      swRunning = false;
      cancelAnimationFrame(swRaf);
      swBtn.textContent = "Start";
      swBtn.classList.remove("running");
      swLapBtn.textContent = "Reset";
    } else {
      swStart = Date.now();
      swRunning = true;
      swBtn.textContent = "Stop";
      swBtn.classList.add("running");
      swLapBtn.textContent = "Lap";
      swTick();
    }
    swDisplay.innerHTML = fmtSw(swNow());
  });
  swLapBtn.addEventListener("click", () => {
    if (swRunning) {
      const t = swNow();
      const li = document.createElement("li");
      const lapTime = t - lastLapAt;
      lastLapAt = t;
      li.innerHTML = `<span>Lap ${lapsEl.children.length + 1}</span><span>+${(lapTime / 1000).toFixed(2)}s</span><span>${(t / 1000).toFixed(2)}s</span>`;
      lapsEl.prepend(li);
    } else {
      swElapsed = 0;
      lastLapAt = 0;
      lapsEl.innerHTML = "";
      swDisplay.innerHTML = fmtSw(0);
      swLapBtn.textContent = "Lap";
    }
  });

  /* --- Timer --- */
  const tmDisplay = $("#tm-display");
  const tmBtn = $("#tm-startstop");
  let tmTotal = store.get("timerSeconds", 300);
  let tmEndAt = 0;
  let tmRunning = false;
  let tmInterval = null;

  function fmtTm(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(s).padStart(2, "0");
  }
  function tmRemaining() { return tmRunning ? (tmEndAt - Date.now()) / 1000 : tmTotal; }
  function tmRender() {
    tmDisplay.textContent = fmtTm(tmRemaining());
  }
  function beep() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      let t = ac.currentTime;
      for (let i = 0; i < 6; i++) {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.frequency.value = 880;
        osc.connect(gain).connect(ac.destination);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.start(t);
        osc.stop(t + 0.25);
        t += 0.35;
      }
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 500]);
  }
  function tmStop(finished) {
    tmRunning = false;
    clearInterval(tmInterval);
    tmBtn.textContent = "Start";
    tmBtn.classList.remove("running");
    if (finished) {
      tmTotal = store.get("timerSeconds", 300);
      tmDisplay.classList.add("done");
      beep();
      setTimeout(() => tmDisplay.classList.remove("done"), 4000);
    } else {
      tmTotal = Math.max(0, Math.round(tmRemaining()));
    }
    tmRender();
  }
  tmBtn.addEventListener("click", () => {
    if (tmRunning) {
      tmStop(false);
    } else if (tmTotal > 0) {
      tmEndAt = Date.now() + tmTotal * 1000;
      tmRunning = true;
      tmBtn.textContent = "Pause";
      tmBtn.classList.add("running");
      tmInterval = setInterval(() => {
        if (tmRemaining() <= 0) tmStop(true);
        else tmRender();
      }, 250);
    }
  });
  $("#tm-reset").addEventListener("click", () => {
    if (tmRunning) tmStop(false);
    tmTotal = store.get("timerSeconds", 300);
    tmDisplay.classList.remove("done");
    tmRender();
  });
  $("#tm-presets").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sec]");
    if (!btn || tmRunning) return;
    tmTotal = +btn.dataset.sec;
    store.set("timerSeconds", tmTotal);
    tmRender();
  });
  $("#tab-tm").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    if (tmRunning) {
      tmEndAt += +btn.dataset.add * 1000;
      if (tmRemaining() <= 0) tmStop(true);
    } else {
      tmTotal = Math.max(0, tmTotal + +btn.dataset.add);
      store.set("timerSeconds", tmTotal);
    }
    tmRender();
  });
  tmRender();

  tools.timer = {
    enter() { acquireWakeLock(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Counter ================= */

(() => {
  const valueEl = $("#counter-value");
  let count = store.get("counter", 0);

  function render() {
    valueEl.textContent = count;
    store.set("counter", count);
  }
  $("#counter-tap").addEventListener("click", () => {
    count++;
    render();
    if (navigator.vibrate) navigator.vibrate(10);
  });
  $("#counter-minus").addEventListener("click", (e) => {
    e.stopPropagation();
    count = Math.max(0, count - 1);
    render();
  });
  $("#counter-reset").addEventListener("click", (e) => {
    e.stopPropagation();
    count = 0;
    render();
  });
  render();
})();

/* ================= Magnifier ================= */

(() => {
  const video = $("#mag-video");
  const freezeCanvas = $("#mag-freeze");
  const zoomSlider = $("#mag-zoom");
  const hint = $("#mag-hint");
  let stream = null;
  let track = null;
  let frozen = false;
  let torchOn = false;

  function applyZoom() {
    const z = +zoomSlider.value;
    video.style.transform = `scale(${z})`;
    freezeCanvas.style.transform = `scale(${z})`;
  }
  zoomSlider.addEventListener("input", applyZoom);

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 } },
        audio: false
      });
      video.srcObject = stream;
      track = stream.getVideoTracks()[0];
      hint.textContent = "Camera magnifier";
      const caps = track.getCapabilities ? track.getCapabilities() : {};
      $("#mag-torch-btn").classList.toggle("hidden", !caps.torch);
    } catch (e) {
      hint.textContent = "Camera unavailable. Allow camera access to use the magnifier.";
    }
  }
  function stop() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      track = null;
    }
    video.srcObject = null;
    unfreeze();
    torchOn = false;
    $("#mag-torch-btn").classList.remove("active");
  }
  function unfreeze() {
    frozen = false;
    freezeCanvas.classList.add("hidden");
    video.classList.remove("hidden");
    $("#mag-freeze-btn").textContent = "Freeze";
    $("#mag-freeze-btn").classList.remove("active");
  }

  $("#mag-freeze-btn").addEventListener("click", () => {
    if (frozen) { unfreeze(); return; }
    if (!video.videoWidth) return;
    freezeCanvas.width = video.videoWidth;
    freezeCanvas.height = video.videoHeight;
    freezeCanvas.getContext("2d").drawImage(video, 0, 0);
    freezeCanvas.classList.remove("hidden");
    video.classList.add("hidden");
    frozen = true;
    $("#mag-freeze-btn").textContent = "Live";
    $("#mag-freeze-btn").classList.add("active");
  });

  $("#mag-torch-btn").addEventListener("click", async (e) => {
    if (!track || !track.getCapabilities || !track.getCapabilities().torch) return;
    torchOn = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: torchOn }] });
      e.target.classList.toggle("active", torchOn);
    } catch (err) { torchOn = false; }
  });

  tools.magnifier = {
    enter() { start(); applyZoom(); acquireWakeLock(); },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Color Picker ================= */

(() => {
  const video = $("#color-video");
  const swatch = $("#color-swatch");
  const hexEl = $("#color-hex");
  const rgbEl = $("#color-rgb");
  const hint = $("#color-hint");
  const copyBtn = $("#color-copy");
  const holdBtn = $("#color-freeze");
  const work = document.createElement("canvas");
  let stream = null, timer = null, held = false;
  let hex = "";

  function toHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, Math.round(l * 100)];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function sample() {
    if (held || !video.videoWidth) return;
    // Average an 11x11 block at the crosshair (center, slightly above middle to match its CSS offset)
    const vw = video.videoWidth, vh = video.videoHeight;
    const cx = Math.round(vw / 2), cy = Math.round(vh * 0.5 - vh * 0.02);
    work.width = 11; work.height = 11;
    const c = work.getContext("2d", { willReadFrequently: true });
    c.drawImage(video, cx - 5, cy - 5, 11, 11, 0, 0, 11, 11);
    const d = c.getImageData(0, 0, 11, 11).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4;
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    const [h, s, l] = toHsl(r, g, b);
    swatch.style.background = hex;
    hexEl.textContent = hex.toUpperCase();
    rgbEl.textContent = `rgb(${r}, ${g}, ${b}) · hsl(${h}°, ${s}%, ${l}%)`;
  }

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false
      });
      video.srcObject = stream;
      hint.textContent = "Aim the crosshair at anything to read its color";
      timer = setInterval(sample, 200);
    } catch (e) {
      hint.textContent = "Camera unavailable. Allow camera access to pick colors.";
    }
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    video.srcObject = null;
    held = false;
    holdBtn.textContent = "Hold";
    holdBtn.classList.remove("active");
  }

  holdBtn.addEventListener("click", () => {
    held = !held;
    holdBtn.textContent = held ? "Resume" : "Hold";
    holdBtn.classList.toggle("active", held);
  });
  copyBtn.addEventListener("click", async () => {
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex.toUpperCase());
      copyBtn.textContent = "Copied!";
    } catch (e) { copyBtn.textContent = "Copy failed"; }
    setTimeout(() => { copyBtn.textContent = "Copy hex"; }, 1500);
  });

  tools.color = {
    enter() { start(); acquireWakeLock(); },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Speedometer ================= */

(() => {
  const valueEl = $("#speed-value");
  const unitEl = $("#speed-unit");
  const accEl = $("#speed-acc");
  const hint = $("#speed-hint");
  let watchId = null;
  let unit = store.get("speedUnit", "kmh"); // kmh | mph
  let last = null; // {lat, lon, t}
  let maxMs = 0, tripM = 0, movingMs = 0;

  const toUnit = (ms) => ms * (unit === "kmh" ? 3.6 : 2.23694);
  const distUnit = () => (unit === "kmh" ? "km" : "mi");

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function renderUnitChips() {
    $("#speed-kmh").classList.toggle("active", unit === "kmh");
    $("#speed-mph").classList.toggle("active", unit === "mph");
    unitEl.textContent = unit === "kmh" ? "km/h" : "mph";
  }

  function renderStats(currentMs) {
    if (currentMs !== null) valueEl.textContent = Math.round(toUnit(currentMs));
    $("#speed-max").textContent = Math.round(toUnit(maxMs));
    const avgMs = movingMs > 0 ? tripM / (movingMs / 1000) : 0;
    $("#speed-avg").textContent = Math.round(toUnit(avgMs));
    const d = tripM / (unit === "kmh" ? 1000 : 1609.344);
    $("#speed-trip").textContent = (d < 10 ? d.toFixed(2) : d.toFixed(1)) + " " + distUnit();
  }

  function onPos(pos) {
    const { latitude, longitude, speed, accuracy } = pos.coords;
    const t = pos.timestamp;
    accEl.textContent = accuracy ? `GPS accuracy ±${Math.round(accuracy)} m` : "";

    let ms = speed;
    if (last && (ms === null || isNaN(ms))) {
      // No native speed (common indoors / on some devices): derive from movement
      const dt = (t - last.t) / 1000;
      if (dt > 0.5) ms = haversine(last.lat, last.lon, latitude, longitude) / dt;
    }
    if (ms === null || isNaN(ms)) { valueEl.textContent = "--"; }
    else {
      if (ms < 0.5) ms = 0; // ignore GPS jitter when standing still
      maxMs = Math.max(maxMs, ms);
      if (last && ms > 0) {
        const dt = t - last.t;
        if (dt > 0 && dt < 10000) { movingMs += dt; tripM += ms * dt / 1000; }
      }
      renderStats(ms);
    }
    last = { lat: latitude, lon: longitude, t };
  }

  function start() {
    if (!("geolocation" in navigator)) {
      hint.textContent = "Location not available on this device.";
      return;
    }
    watchId = navigator.geolocation.watchPosition(onPos, (err) => {
      hint.textContent = err.code === 1
        ? "Location access denied. Allow it in Settings to measure speed."
        : "Waiting for GPS signal…";
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  }
  function stop() {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    last = null;
  }

  function setUnit(u) {
    unit = u;
    store.set("speedUnit", u);
    renderUnitChips();
    renderStats(null);
  }
  $("#speed-kmh").addEventListener("click", () => setUnit("kmh"));
  $("#speed-mph").addEventListener("click", () => setUnit("mph"));
  $("#speed-reset").addEventListener("click", () => {
    maxMs = 0; tripM = 0; movingMs = 0;
    renderStats(0);
  });

  renderUnitChips();
  tools.speed = {
    enter() { start(); acquireWakeLock(); },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Mirror ================= */

(() => {
  const video = $("#mirror-video");
  const freezeCanvas = $("#mirror-freeze");
  const zoomSlider = $("#mirror-zoom");
  const hint = $("#mirror-hint");
  const ring = $("#ring-light");
  let stream = null;
  let frozen = false;

  function applyZoom() {
    const t = `scaleX(-1) scale(${+zoomSlider.value})`;
    video.style.transform = t;
    freezeCanvas.style.transform = t;
  }
  zoomSlider.addEventListener("input", applyZoom);

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false
      });
      video.srcObject = stream;
      hint.textContent = "Front camera mirror";
    } catch (e) {
      hint.textContent = "Camera unavailable. Allow camera access to use the mirror.";
    }
  }
  function stop() {
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    video.srcObject = null;
    unfreeze();
    ring.classList.remove("on");
    $("#mirror-light-btn").classList.remove("active");
  }
  function unfreeze() {
    frozen = false;
    freezeCanvas.classList.add("hidden");
    video.classList.remove("hidden");
    $("#mirror-freeze-btn").textContent = "Freeze";
    $("#mirror-freeze-btn").classList.remove("active");
  }

  $("#mirror-freeze-btn").addEventListener("click", () => {
    if (frozen) { unfreeze(); return; }
    if (!video.videoWidth) return;
    freezeCanvas.width = video.videoWidth;
    freezeCanvas.height = video.videoHeight;
    freezeCanvas.getContext("2d").drawImage(video, 0, 0);
    freezeCanvas.classList.remove("hidden");
    video.classList.add("hidden");
    frozen = true;
    $("#mirror-freeze-btn").textContent = "Live";
    $("#mirror-freeze-btn").classList.add("active");
  });

  $("#mirror-light-btn").addEventListener("click", (e) => {
    const on = ring.classList.toggle("on");
    e.target.classList.toggle("active", on);
  });

  tools.mirror = {
    enter() { start(); applyZoom(); acquireWakeLock(); },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Protractor ================= */

(() => {
  const canvas = $("#prot-canvas");
  const readout = $("#prot-readout");
  let armA = 180, armB = 90; // degrees, 0 = right, counterclockwise
  let dragging = null;

  function geometry() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // Keep the baseline (and the 0°/180° handles) clear of the bottom control panel
    return { w, h, cx: w / 2, cy: h - Math.max(170, h * 0.22), r: Math.min(w * 0.44, h * 0.5) };
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const { w, h, cx, cy, r } = geometry();
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);

    // Protractor body
    c.beginPath();
    c.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    c.closePath();
    c.fillStyle = "#191922";
    c.fill();
    c.strokeStyle = "#2c2c34";
    c.stroke();

    // Degree ticks
    c.fillStyle = "#8e8e93";
    c.strokeStyle = "#8e8e93";
    c.font = "12px -apple-system, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    for (let d = 0; d <= 180; d += 1) {
      const a = Math.PI + (d * Math.PI) / 180;
      const len = d % 10 === 0 ? 16 : d % 5 === 0 ? 10 : 5;
      c.lineWidth = d % 10 === 0 ? 1.5 : 0.75;
      c.beginPath();
      c.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      c.lineTo(cx + (r - len) * Math.cos(a), cy + (r - len) * Math.sin(a));
      c.stroke();
      if (d % 10 === 0) {
        c.fillText(String(d), cx + (r - 30) * Math.cos(a), cy + (r - 30) * Math.sin(a));
      }
    }

    // Angle wedge between arms
    const a1 = Math.PI + (Math.min(armA, armB) * Math.PI) / 180;
    const a2 = Math.PI + (Math.max(armA, armB) * Math.PI) / 180;
    c.beginPath();
    c.moveTo(cx, cy);
    c.arc(cx, cy, r * 0.28, a1, a2);
    c.closePath();
    c.fillStyle = "rgba(33, 147, 176, 0.25)";
    c.fill();

    // Arms
    [[armA, "#0a84ff"], [armB, "#ff9f1a"]].forEach(([deg, color]) => {
      const a = Math.PI + (deg * Math.PI) / 180;
      const ex = cx + (r + 26) * Math.cos(a), ey = cy + (r + 26) * Math.sin(a);
      c.strokeStyle = color;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(ex, ey);
      c.stroke();
      c.fillStyle = color;
      c.beginPath();
      c.arc(ex, ey, 14, 0, 2 * Math.PI);
      c.fill();
      c.fillStyle = "#fff";
      c.beginPath();
      c.arc(ex, ey, 5, 0, 2 * Math.PI);
      c.fill();
    });

    // Center pivot
    c.fillStyle = "#f2f2f7";
    c.beginPath();
    c.arc(cx, cy, 5, 0, 2 * Math.PI);
    c.fill();

    readout.innerHTML = Math.abs(armB - armA).toFixed(1) + "&deg;";
  }

  function pointerAngle(e) {
    const rect = canvas.getBoundingClientRect();
    const { cx, cy } = geometry();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let deg = (Math.atan2(y, x) * 180) / Math.PI; // -180..180, 0 = right
    // Map into protractor space: 0 (left) .. 180 (right) along the top half;
    // touches below the baseline snap to the nearest end
    deg = deg <= 0 ? deg + 180 : deg < 90 ? 180 : 0;
    return clamp(deg, 0, 180);
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const a = pointerAngle(e);
    dragging = Math.abs(a - armA) <= Math.abs(a - armB) ? "a" : "b";
    if (dragging === "a") armA = a; else armB = a;
    draw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const a = pointerAngle(e);
    if (dragging === "a") armA = a; else armB = a;
    draw();
  });
  canvas.addEventListener("pointerup", () => { dragging = null; });

  $("#prot-reset").addEventListener("click", () => { armA = 180; armB = 90; draw(); });
  window.addEventListener("resize", () => { if (currentTool === "protractor") draw(); });

  tools.protractor = { enter() { draw(); } };
})();

/* ================= Sound Meter ================= */

(() => {
  const dbEl = $("#sound-db");
  const descEl = $("#sound-desc");
  const bar = $("#sound-bar");
  const graph = $("#sound-graph");
  const hint = $("#sound-hint");
  const DB_OFFSET = 94; // rough mapping of dBFS to everyday SPL-like values
  const DESCRIPTIONS = [[30, "Very quiet"], [45, "Quiet room"], [60, "Conversation"], [75, "Busy street"], [90, "Loud — shouting"], [110, "Very loud — harmful over time"], [999, "Dangerously loud"]];
  let ac = null, analyser = null, stream = null, raf = null;
  let data = null;
  let history = [];
  let minDb = Infinity, peakDb = -Infinity, sum = 0, count = 0;
  let smooth = 0;

  function describe(db) {
    for (const [max, name] of DESCRIPTIONS) if (db < max) return name;
    return "";
  }
  function resetStats() {
    minDb = Infinity; peakDb = -Infinity; sum = 0; count = 0; history = [];
    $("#sound-min").textContent = $("#sound-avg").textContent = $("#sound-peak").textContent = "--";
  }

  function drawGraph() {
    const dpr = window.devicePixelRatio || 1;
    const w = graph.clientWidth, h = graph.clientHeight;
    if (graph.width !== w * dpr) { graph.width = w * dpr; graph.height = h * dpr; }
    const c = graph.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c.strokeStyle = "#f9d423";
    c.lineWidth = 2;
    c.beginPath();
    const n = history.length;
    for (let i = 0; i < n; i++) {
      const x = w - (n - i) * 2;
      if (x < 0) continue;
      const y = h - clamp((history[i] - 20) / 100, 0, 1) * h;
      i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    c.stroke();
  }

  function tick() {
    analyser.getFloatTimeDomainData(data);
    let s = 0;
    for (let i = 0; i < data.length; i++) s += data[i] * data[i];
    const rms = Math.sqrt(s / data.length);
    const db = Math.max(0, 20 * Math.log10(rms || 1e-7) + DB_OFFSET);
    smooth = smooth * 0.8 + db * 0.2;

    dbEl.textContent = Math.round(smooth);
    descEl.textContent = describe(smooth);
    bar.style.width = clamp((smooth - 20) / 100 * 100, 0, 100) + "%";

    minDb = Math.min(minDb, db);
    peakDb = Math.max(peakDb, db);
    sum += db; count++;
    $("#sound-min").textContent = Math.round(minDb);
    $("#sound-avg").textContent = Math.round(sum / count);
    $("#sound-peak").textContent = Math.round(peakDb);

    history.push(smooth);
    if (history.length > 400) history.shift();
    drawGraph();
    raf = requestAnimationFrame(tick);
  }

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      ac.resume();
      const src = ac.createMediaStreamSource(stream);
      analyser = ac.createAnalyser();
      analyser.fftSize = 2048;
      data = new Float32Array(analyser.fftSize);
      src.connect(analyser);
      hint.textContent = "Approximate level — phone mics aren't calibrated instruments";
      resetStats();
      tick();
    } catch (e) {
      dbEl.textContent = "--";
      hint.textContent = "Microphone unavailable. Allow mic access to measure sound.";
    }
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = null;
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    analyser = null;
  }

  $("#sound-reset").addEventListener("click", resetStats);

  tools.soundmeter = {
    enter() { start(); acquireWakeLock(); },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Metronome ================= */

(() => {
  const bpmEl = $("#metro-bpm");
  const nameEl = $("#metro-name");
  const slider = $("#metro-slider");
  const playBtn = $("#metro-play");
  const dotsEl = $("#metro-dots");
  let bpm = 120, beatsPerBar = 4;
  let ac = null, timer = null;
  let nextBeatTime = 0, beatIndex = 0;
  let taps = [];
  const TEMPO_NAMES = [[40, "Grave"], [60, "Largo"], [76, "Adagio"], [108, "Andante"], [120, "Moderato"], [156, "Allegro"], [200, "Presto"], [241, "Prestissimo"]];

  function tempoName(b) {
    for (const [max, name] of TEMPO_NAMES) if (b < max) return name;
    return "Prestissimo";
  }
  function buildDots() {
    dotsEl.innerHTML = "";
    for (let i = 0; i < beatsPerBar; i++) {
      const d = document.createElement("div");
      d.className = "metro-dot";
      dotsEl.appendChild(d);
    }
  }
  function render() {
    bpmEl.textContent = bpm;
    nameEl.textContent = tempoName(bpm);
    slider.value = bpm;
  }
  function setBpm(b) { bpm = clamp(Math.round(b), 30, 240); render(); }

  function click(time, accent) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.frequency.value = accent ? 1200 : 800;
    gain.gain.setValueAtTime(accent ? 0.5 : 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.connect(gain).connect(ac.destination);
    osc.start(time);
    osc.stop(time + 0.08);
  }
  function flashDot(i, accent) {
    const dots = dotsEl.children;
    if (!dots[i]) return;
    dots[i].classList.add("hit");
    dots[i].classList.toggle("accent", accent);
    setTimeout(() => dots[i] && dots[i].classList.remove("hit", "accent"), 110);
  }
  // Lookahead scheduler: queue audio 100ms ahead so JS timer jitter never lands in the sound
  function schedule() {
    while (nextBeatTime < ac.currentTime + 0.1) {
      const accent = beatIndex % beatsPerBar === 0;
      click(nextBeatTime, accent && beatsPerBar > 1);
      const idx = beatIndex % beatsPerBar;
      const delay = Math.max(0, (nextBeatTime - ac.currentTime) * 1000);
      setTimeout(() => flashDot(idx, accent && beatsPerBar > 1), delay);
      nextBeatTime += 60 / bpm;
      beatIndex++;
    }
  }
  function start() {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    ac.resume();
    beatIndex = 0;
    nextBeatTime = ac.currentTime + 0.05;
    timer = setInterval(schedule, 25);
    playBtn.classList.add("playing");
    playBtn.innerHTML = "&#9632;";
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    playBtn.classList.remove("playing");
    playBtn.innerHTML = "&#9654;";
  }

  playBtn.addEventListener("click", () => (timer ? stop() : start()));
  slider.addEventListener("input", () => setBpm(+slider.value));
  $("#metro-up").addEventListener("click", () => setBpm(bpm + 1));
  $("#metro-down").addEventListener("click", () => setBpm(bpm - 1));
  $("#metro-beats").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-b]");
    if (!btn) return;
    beatsPerBar = +btn.dataset.b;
    $$("#metro-beats .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    beatIndex = 0;
    buildDots();
  });
  $("#metro-tap").addEventListener("click", () => {
    const now = performance.now();
    taps = taps.filter((t) => now - t < 3000);
    taps.push(now);
    if (taps.length >= 2) {
      const intervals = taps.slice(1).map((t, i) => t - taps[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBpm(60000 / avg);
    }
  });

  buildDots();
  render();
  tools.metronome = {
    enter() { acquireWakeLock(); },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Tone Generator ================= */

(() => {
  const slider = $("#tone-slider");
  const volume = $("#tone-volume");
  const freqEl = $("#tone-freq");
  const noteEl = $("#tone-note");
  const playBtn = $("#tone-play");
  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  let ac = null, osc = null, gain = null;
  let wave = "sine";

  // Log scale: slider 0..1000 → 20 Hz .. 20 kHz
  const sliderToFreq = (t) => Math.round(20 * Math.pow(10, 3 * t / 1000));
  const freqToSlider = (f) => Math.round(1000 * Math.log10(f / 20) / 3);

  function noteName(f) {
    if (f < 27 || f > 14000) return "";
    const n = Math.round(12 * Math.log2(f / 440)) + 57; // semitones from C0
    const cents = Math.round(1200 * Math.log2(f / (440 * Math.pow(2, (n - 57) / 12))));
    if (Math.abs(cents) > 40) return "";
    return NOTES[n % 12] + Math.floor(n / 12) + (cents ? ` ${cents > 0 ? "+" : ""}${cents}¢` : "");
  }

  let freq = 440; // exact value; the slider is only an approximate control

  function render() {
    const f = freq;
    freqEl.textContent = f < 1000 ? f + " Hz" : (f / 1000).toFixed(f < 10000 ? 2 : 1) + " kHz";
    noteEl.textContent = noteName(f);
    if (osc) osc.frequency.setTargetAtTime(f, ac.currentTime, 0.01);
  }

  function targetGain() { return Math.pow(+volume.value / 100, 2) * 0.5; }

  function start() {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    ac.resume();
    osc = ac.createOscillator();
    gain = ac.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetGain()), ac.currentTime + 0.05);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    playBtn.classList.add("playing");
    playBtn.innerHTML = "&#9632;";
  }

  function stop() {
    if (osc) {
      const o = osc, g = gain;
      g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.02);
      setTimeout(() => { try { o.stop(); o.disconnect(); g.disconnect(); } catch (e) {} }, 120);
      osc = null; gain = null;
    }
    playBtn.classList.remove("playing");
    playBtn.innerHTML = "&#9654;";
  }

  playBtn.addEventListener("click", () => (osc ? stop() : start()));
  slider.addEventListener("input", () => { freq = sliderToFreq(+slider.value); render(); });
  volume.addEventListener("input", () => {
    if (gain) gain.gain.setTargetAtTime(Math.max(0.0001, targetGain()), ac.currentTime, 0.02);
  });
  $("#tone-waves").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-w]");
    if (!btn) return;
    wave = btn.dataset.w;
    $$("#tone-waves .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    if (osc) osc.type = wave;
  });
  $("#tone-presets").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-f]");
    if (!btn) return;
    freq = +btn.dataset.f;
    slider.value = freqToSlider(freq);
    if (btn.dataset.vol) {
      volume.value = btn.dataset.vol;
      if (gain) gain.gain.setTargetAtTime(Math.max(0.0001, targetGain()), ac.currentTime, 0.02);
    }
    render();
    if (!osc) start();
  });

  render();
  tools.tone = {
    enter() { acquireWakeLock(); },
    exit() { stop(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Tip Calculator ================= */

(() => {
  const bill = $("#tip-bill");
  const slider = $("#tip-slider");
  const people = $("#tip-people");
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function calc() {
    const b = parseFloat(bill.value.replace(/[$,]/g, "")) || 0;
    const pct = +slider.value;
    const n = +people.value;
    const tip = b * pct / 100;
    $("#tip-pct-val").textContent = pct + "%";
    $("#tip-people-val").textContent = n === 1 ? "1 person" : n + " people";
    $("#tip-amount").textContent = money(tip);
    $("#tip-total").textContent = money(b + tip);
    // Round per-person up to the cent so the group never comes up short
    $("#tip-per").textContent = money(Math.ceil((b + tip) * 100 / n) / 100);
  }

  bill.addEventListener("input", calc);
  people.addEventListener("input", calc);
  slider.addEventListener("input", () => {
    $$("#tip-pcts .chip").forEach((c) => c.classList.toggle("active", +c.dataset.pct === +slider.value));
    calc();
  });
  $("#tip-pcts").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pct]");
    if (!btn) return;
    slider.value = btn.dataset.pct;
    $$("#tip-pcts .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    calc();
  });
  calc();
})();

/* ================= Date Calculator ================= */

(() => {
  const dateA = $("#date-a"), dateB = $("#date-b");
  const startEl = $("#date-start"), amountEl = $("#date-amount"), unitEl = $("#date-unit");
  let sign = 1;

  $("#date-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    $$("#date-tabs .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-diff").classList.toggle("hidden", btn.dataset.tab !== "diff");
    $("#tab-add").classList.toggle("hidden", btn.dataset.tab !== "add");
  });

  function isoToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function parseISO(s) {
    const [y, m, d] = s.split("-").map(Number);
    return { y, m, d };
  }
  function fmtLong(y, m, d) {
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  function diff() {
    if (!dateA.value || !dateB.value) return;
    const a = parseISO(dateA.value), b = parseISO(dateB.value);
    // UTC midnights make the day count immune to DST transitions
    const days = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
    const abs = Math.abs(days);
    $("#date-diff-result").textContent = abs === 1 ? "1 day" : abs.toLocaleString("en-US") + " days";

    // Calendar breakdown years/months/days from the earlier date
    let [lo, hi] = days >= 0 ? [a, b] : [b, a];
    let years = hi.y - lo.y, months = hi.m - lo.m, ds = hi.d - lo.d;
    if (ds < 0) { months--; ds += new Date(hi.y, hi.m - 1, 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const parts = [];
    if (years) parts.push(years + (years === 1 ? " year" : " years"));
    if (months) parts.push(months + (months === 1 ? " month" : " months"));
    if (ds) parts.push(ds + (ds === 1 ? " day" : " days"));
    const wk = Math.floor(abs / 7), rem = abs % 7;
    let sub = abs >= 7 ? `${wk} wk ${rem} d` : "";
    if (parts.length > 1 || years || months) sub = parts.join(" ") + (sub ? " · " + sub : "");
    $("#date-diff-sub").textContent = sub || " ";
  }

  function addCalc() {
    if (!startEl.value) return;
    const s = parseISO(startEl.value);
    const n = sign * (parseInt(amountEl.value, 10) || 0);
    const d = new Date(s.y, s.m - 1, s.d);
    const origDay = d.getDate();
    if (unitEl.value === "days") d.setDate(d.getDate() + n);
    else if (unitEl.value === "weeks") d.setDate(d.getDate() + n * 7);
    else {
      if (unitEl.value === "months") d.setMonth(d.getMonth() + n);
      else d.setFullYear(d.getFullYear() + n);
      // Clamp overflow (e.g. Jan 31 + 1 month → Feb 28, not Mar 3)
      if (d.getDate() !== origDay) d.setDate(0);
    }
    $("#date-add-result").textContent = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    $("#date-add-sub").textContent = d.toLocaleDateString("en-US", { weekday: "long" });
  }

  [dateA, dateB].forEach((el) => el.addEventListener("change", diff));
  [startEl, amountEl, unitEl].forEach((el) => {
    el.addEventListener("change", addCalc);
    el.addEventListener("input", addCalc);
  });
  $("#date-plus").addEventListener("click", () => {
    sign = 1;
    $("#date-plus").classList.add("active");
    $("#date-minus").classList.remove("active");
    addCalc();
  });
  $("#date-minus").addEventListener("click", () => {
    sign = -1;
    $("#date-minus").classList.add("active");
    $("#date-plus").classList.remove("active");
    addCalc();
  });

  tools.datecalc = {
    enter() {
      if (!dateA.value) dateA.value = isoToday();
      if (!dateB.value) dateB.value = isoToday();
      if (!startEl.value) startEl.value = isoToday();
      diff();
      addCalc();
    }
  };
})();

/* ================= Random ================= */

(() => {
  function rand(n) { // uniform integer in [0, n)
    const max = Math.floor(0xFFFFFFFF / n) * n;
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= max);
    return buf[0] % n;
  }
  $("#random-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    $$("#random-tabs .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    ["dice", "coin", "number"].forEach((t) =>
      $("#tab-" + t).classList.toggle("hidden", btn.dataset.tab !== t));
  });

  /* Dice */
  const diceRow = $("#dice-row");
  let diceCount = 1;
  $("#dice-count").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-n]");
    if (!btn) return;
    diceCount = +btn.dataset.n;
    $$("#dice-count .chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    roll();
  });
  function roll() {
    diceRow.innerHTML = "";
    let total = 0;
    for (let i = 0; i < diceCount; i++) {
      const v = rand(6) + 1;
      total += v;
      const die = document.createElement("div");
      die.className = "die rolling";
      die.textContent = v;
      diceRow.appendChild(die);
    }
    $("#dice-total").textContent = diceCount > 1 ? "Total: " + total : "";
    if (navigator.vibrate) navigator.vibrate(15);
  }
  $("#dice-roll").addEventListener("click", roll);

  /* Coin */
  const coinFace = $("#coin-face");
  let heads = 0, tails = 0;
  $("#coin-flip").addEventListener("click", () => {
    coinFace.classList.remove("flipping");
    void coinFace.offsetWidth; // restart animation
    coinFace.classList.add("flipping");
    const isHeads = rand(2) === 0;
    setTimeout(() => {
      coinFace.textContent = isHeads ? "Heads" : "Tails";
      if (isHeads) heads++; else tails++;
      $("#coin-tally").textContent = `Heads ${heads} · Tails ${tails}`;
    }, 250);
    if (navigator.vibrate) navigator.vibrate(15);
  });

  /* Number */
  $("#number-go").addEventListener("click", () => {
    let lo = parseInt($("#number-min").value, 10);
    let hi = parseInt($("#number-max").value, 10);
    if (isNaN(lo) || isNaN(hi)) return;
    if (lo > hi) [lo, hi] = [hi, lo];
    $("#number-result").textContent = (lo + rand(hi - lo + 1)).toLocaleString("en-US");
  });

  tools.random = { enter() { if (!diceRow.children.length) roll(); } };
})();

/* ================= QR Scanner ================= */

(() => {
  const video = $("#qr-video");
  const frame = $("#qr-frame");
  const hint = $("#qr-hint");
  const resultBox = $("#qr-result");
  const resultText = $("#qr-text");
  const openLink = $("#qr-open");
  const copyBtn = $("#qr-copy");
  const torchBtn = $("#qr-torch");
  const fileInput = $("#qr-file");
  const workCanvas = document.createElement("canvas");
  let stream = null;
  let track = null;
  let scanTimer = null;
  let scanning = false;
  let torchOn = false;
  let detector = null;

  if ("BarcodeDetector" in window) {
    try { detector = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) { detector = null; }
  }

  function decodeImageData(imgData) {
    if (typeof jsQR !== "function") return null;
    const code = jsQR(imgData.data, imgData.width, imgData.height);
    return code && code.data ? code.data : null;
  }

  function grabFrame(source, sw, sh) {
    // Downscale for decode speed; jsQR handles ~640px well
    const maxDim = 640;
    const scale = Math.min(1, maxDim / Math.max(sw, sh));
    workCanvas.width = Math.round(sw * scale);
    workCanvas.height = Math.round(sh * scale);
    const c = workCanvas.getContext("2d", { willReadFrequently: true });
    c.drawImage(source, 0, 0, workCanvas.width, workCanvas.height);
    return c.getImageData(0, 0, workCanvas.width, workCanvas.height);
  }

  function showResult(text) {
    scanning = false;
    frame.classList.add("found");
    resultBox.classList.remove("hidden");
    resultText.textContent = text;
    const isUrl = /^https?:\/\/\S+$/i.test(text.trim());
    openLink.classList.toggle("hidden", !isUrl);
    if (isUrl) openLink.href = text.trim();
    hint.textContent = "QR code detected";
    if (navigator.vibrate) navigator.vibrate(80);
  }

  async function scanOnce() {
    if (!scanning || !video.videoWidth || document.hidden) return;
    try {
      let text = null;
      if (detector) {
        const codes = await detector.detect(video);
        if (codes.length) text = codes[0].rawValue;
      } else {
        text = decodeImageData(grabFrame(video, video.videoWidth, video.videoHeight));
      }
      if (text && scanning) showResult(text);
    } catch (e) { /* keep scanning */ }
  }

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false
      });
      video.srcObject = stream;
      track = stream.getVideoTracks()[0];
      const caps = track.getCapabilities ? track.getCapabilities() : {};
      torchBtn.classList.toggle("hidden", !caps.torch);
      hint.textContent = "Point the camera at a QR code";
      scanning = true;
      scanTimer = setInterval(scanOnce, 250);
    } catch (e) {
      hint.textContent = "Camera unavailable. Allow camera access, or use “From photo”.";
    }
  }

  function stop() {
    clearInterval(scanTimer);
    scanTimer = null;
    scanning = false;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      track = null;
    }
    video.srcObject = null;
    torchOn = false;
    torchBtn.classList.remove("active");
  }

  function resetResult() {
    resultBox.classList.add("hidden");
    frame.classList.remove("found");
    hint.textContent = stream ? "Point the camera at a QR code" : "Camera unavailable. Allow camera access, or use “From photo”.";
    scanning = !!stream;
  }

  $("#qr-again").addEventListener("click", resetResult);

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resultText.textContent);
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
    } catch (e) {
      copyBtn.textContent = "Copy failed";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
    }
  });

  torchBtn.addEventListener("click", async () => {
    if (!track) return;
    torchOn = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: torchOn }] });
      torchBtn.classList.toggle("active", torchOn);
    } catch (e) { torchOn = false; }
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      let text = null;
      try {
        if (detector) {
          const codes = await detector.detect(img);
          if (codes.length) text = codes[0].rawValue;
        }
      } catch (e) { /* fall through to jsQR */ }
      if (!text) text = decodeImageData(grabFrame(img, img.naturalWidth, img.naturalHeight));
      if (text) showResult(text);
      else hint.textContent = "No QR code found in that photo.";
      fileInput.value = "";
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      hint.textContent = "Couldn't read that image.";
      fileInput.value = "";
    };
    img.src = url;
  });

  tools.qr = {
    enter() { resetResult(); start(); acquireWakeLock(); },
    exit() { stop(); resetResult(); },
    wake() { acquireWakeLock(); }
  };
})();

/* ================= Boot ================= */

// Show install hint in Safari when not already installed
(() => {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && !isStandalone) $("#install-hint").classList.remove("hidden");
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

route();
