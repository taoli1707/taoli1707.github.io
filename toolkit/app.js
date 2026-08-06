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
