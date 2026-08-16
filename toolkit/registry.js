/* Toolkit tool registry — packs register tools; app.js builds home + sections */
"use strict";

window.TK = {
  defs: [],
  cats: [
    "Essentials", "Measure", "Sound & Music", "Camera", "Outdoors",
    "Time & Focus", "Calculators", "Kitchen", "Money", "Health",
    "Documents", "Trackers", "Reference", "Display", "Party & Fun",
  ],
  /**
   * def = {
   *   id, name, icon, cat, grad,          // tile
   *   mode: 'live' | 'sim',               // sim = native-only, simulated here
   *   note,                                // one-line hint under tool header
   *   render(body, def),                   // build DOM on first open
   *   enter(), exit(), wake(),             // lifecycle (optional)
   * }
   */
  register(def) { this.defs.push(def); },

  /* tiny DOM helpers shared by packs */
  el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  },
  esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },
  fmt(n, digits) {
    if (!isFinite(n)) return "—";
    return n.toLocaleString("en-US", { maximumFractionDigits: digits === undefined ? 2 : digits });
  },
  store: {
    get(key, fallback) {
      try {
        const v = localStorage.getItem("toolkit." + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("toolkit." + key, JSON.stringify(value)); } catch (e) {}
    },
  },
};

/* ---- The 19 original tools (sections live in index.html) ---- */
[
  ["flashlight", "Flashlight", "🔦", "Essentials", "linear-gradient(135deg,#ffd93d,#ff9f1a)"],
  ["ruler", "Ruler", "📏", "Measure", "linear-gradient(135deg,#4facfe,#00f2fe)"],
  ["level", "Level", "🎯", "Measure", "linear-gradient(135deg,#43e97b,#38f9d7)"],
  ["compass", "Compass", "🧭", "Outdoors", "linear-gradient(135deg,#fa709a,#fee140)"],
  ["converter", "Converter", "🔁", "Calculators", "linear-gradient(135deg,#a18cd1,#fbc2eb)"],
  ["timer", "Stopwatch", "⏱️", "Time & Focus", "linear-gradient(135deg,#f77062,#fe5196)"],
  ["counter", "Counter", "🔢", "Essentials", "linear-gradient(135deg,#30cfd0,#330867)"],
  ["magnifier", "Magnifier", "🔍", "Camera", "linear-gradient(135deg,#667eea,#764ba2)"],
  ["qr", "QR Scanner", "🔳", "Camera", "linear-gradient(135deg,#f857a6,#ff5858)"],
  ["random", "Random", "🎲", "Party & Fun", "linear-gradient(135deg,#56ab2f,#a8e063)"],
  ["datecalc", "Dates", "📅", "Calculators", "linear-gradient(135deg,#ff512f,#dd2476)"],
  ["tip", "Tip Split", "💵", "Money", "linear-gradient(135deg,#11998e,#38ef7d)"],
  ["tone", "Tone", "🎵", "Sound & Music", "linear-gradient(135deg,#00b09b,#96c93d)"],
  ["metronome", "Metronome", "🥁", "Sound & Music", "linear-gradient(135deg,#ee9ca7,#c44569)"],
  ["soundmeter", "Sound Meter", "🎤", "Sound & Music", "linear-gradient(135deg,#f83600,#f9d423)"],
  ["protractor", "Protractor", "📐", "Measure", "linear-gradient(135deg,#2193b0,#6dd5ed)"],
  ["mirror", "Mirror", "🪞", "Camera", "linear-gradient(135deg,#8e9eab,#3f4c6b)"],
  ["speed", "Speed", "🚗", "Outdoors", "linear-gradient(135deg,#7f00ff,#e100ff)"],
  ["color", "Color Picker", "🎨", "Camera", "linear-gradient(135deg,#ff9a9e,#a18cd1)"],
].forEach(([id, name, icon, cat, grad]) =>
  TK.register({ id, name, icon, cat, grad, mode: "live", builtin: true }));
