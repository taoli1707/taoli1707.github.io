/* Pack: calculators, converters, everyday logic */
"use strict";
(() => {
  const { register, el, esc, fmt, store } = TK;

  /* ---- spec-driven calculator engine ---- */
  function calc(def) {
    def.render = (body) => {
      const card = el("div", "t-card");
      const rows = el("div", "t-rows");
      const inputs = {};
      def.fields.forEach((f) => {
        const row = el("div", "t-row");
        row.appendChild(el("label", "", esc(f.label)));
        let inp;
        if (f.type === "select") {
          inp = el("select");
          f.opts.forEach(([v, t]) => {
            const o = el("option", "", esc(t)); o.value = v; inp.appendChild(o);
          });
          if (f.def !== undefined) inp.value = f.def;
        } else {
          inp = el("input");
          inp.type = f.type === "date" ? "date" : "text";
          if (f.type === "num") inp.inputMode = "decimal";
          if (f.def !== undefined) inp.value = f.def;
        }
        inputs[f.k] = inp;
        row.appendChild(inp);
        rows.appendChild(row);
      });
      card.appendChild(rows);
      const result = el("div", "t-result", '<div class="big">—</div><div class="sub"></div>');
      body.appendChild(card);
      body.appendChild(result);
      function run() {
        const vals = {};
        for (const k in inputs) {
          const f = def.fields.find((x) => x.k === k);
          vals[k] = f.type === "num" ? parseFloat(String(inputs[k].value).replace(/[$,]/g, "")) : inputs[k].value;
        }
        try {
          const out = def.compute(vals) || {};
          result.querySelector(".big").textContent = out.big || "—";
          result.querySelector(".sub").textContent = out.sub || "";
        } catch (e) {
          result.querySelector(".big").textContent = "—";
          result.querySelector(".sub").textContent = "";
        }
      }
      for (const k in inputs) {
        inputs[k].addEventListener("input", run);
        inputs[k].addEventListener("change", run);
      }
      run();
    };
    register(def);
  }

  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ================= Money ================= */
  calc({
    id: "loan", name: "Loan", icon: "🏦", cat: "Money", mode: "live",
    grad: "linear-gradient(135deg,#0ba360,#3cba92)", keywords: "mortgage payment interest",
    fields: [
      { k: "p", label: "Amount", type: "num", def: "320000" },
      { k: "r", label: "Rate % APR", type: "num", def: "5.9" },
      { k: "y", label: "Years", type: "num", def: "30" },
    ],
    compute({ p, r, y }) {
      const i = r / 100 / 12, n = y * 12;
      const m = i === 0 ? p / n : p * i / (1 - Math.pow(1 + i, -n));
      return { big: money(m) + "/mo", sub: `total interest ${money(m * n - p)} over ${fmt(n, 0)} payments` };
    },
  });
  calc({
    id: "savings", name: "Savings", icon: "🌱", cat: "Money", mode: "live",
    grad: "linear-gradient(135deg,#96fbc4,#0ba360)", keywords: "compound interest growth invest",
    fields: [
      { k: "p", label: "Starting", type: "num", def: "10000" },
      { k: "m", label: "Monthly add", type: "num", def: "500" },
      { k: "r", label: "Return % /yr", type: "num", def: "7" },
      { k: "y", label: "Years", type: "num", def: "10" },
    ],
    compute({ p, m, r, y }) {
      const i = r / 100 / 12, n = y * 12;
      const fv = p * Math.pow(1 + i, n) + (i === 0 ? m * n : m * ((Math.pow(1 + i, n) - 1) / i));
      const put = p + m * n;
      return { big: money(fv), sub: `you put in ${money(put)} — growth ${money(fv - put)}` };
    },
  });
  calc({
    id: "discount", name: "Discount", icon: "🏷️", cat: "Money", mode: "live",
    grad: "linear-gradient(135deg,#f5576c,#f093fb)", keywords: "sale percent off tax",
    fields: [
      { k: "p", label: "Price", type: "num", def: "129" },
      { k: "d", label: "Discount %", type: "num", def: "30" },
      { k: "t", label: "Tax %", type: "num", def: "8.875" },
    ],
    compute({ p, d, t }) {
      const after = p * (1 - d / 100), final = after * (1 + t / 100);
      return { big: money(final), sub: `you save ${money(p - after)} · pre-tax ${money(after)}` };
    },
  });
  calc({
    id: "unitprice", name: "Price/Unit", icon: "🛒", cat: "Money", mode: "live",
    grad: "linear-gradient(135deg,#38ef7d,#11998e)", keywords: "grocery compare cheaper per ounce",
    fields: [
      { k: "pa", label: "A price", type: "num", def: "4.99" },
      { k: "qa", label: "A quantity", type: "num", def: "12" },
      { k: "pb", label: "B price", type: "num", def: "7.49" },
      { k: "qb", label: "B quantity", type: "num", def: "20" },
    ],
    compute({ pa, qa, pb, qb }) {
      const a = pa / qa, b = pb / qb;
      const win = a === b ? "Same price" : a < b ? "A is cheaper" : "B is cheaper";
      return { big: win, sub: `A ${(a * 100).toFixed(1)}¢/unit · B ${(b * 100).toFixed(1)}¢/unit` };
    },
  });
  calc({
    id: "salary", name: "Pay Convert", icon: "💼", cat: "Money", mode: "live",
    grad: "linear-gradient(135deg,#c2e59c,#64b3f4)", keywords: "hourly salary wage annual",
    fields: [
      { k: "mode", label: "Convert", type: "select", opts: [["h2y", "hourly → yearly"], ["y2h", "yearly → hourly"]] },
      { k: "v", label: "Amount", type: "num", def: "38.50" },
      { k: "h", label: "Hours/week", type: "num", def: "40" },
    ],
    compute({ mode, v, h }) {
      const yearly = mode === "h2y" ? v * h * 52 : v;
      const hourly = mode === "h2y" ? v : v / (h * 52);
      return { big: mode === "h2y" ? money(yearly) + "/yr" : money(hourly) + "/hr", sub: `${money(hourly)}/hr · ${money(hourly * h)}/wk · ${money(yearly / 12)}/mo` };
    },
  });

  /* ================= Health ================= */
  calc({
    id: "bmi", name: "BMI & BMR", icon: "⚖️", cat: "Health", mode: "live",
    grad: "linear-gradient(135deg,#ff9a9e,#fecfef)", keywords: "body mass calories metabolic",
    fields: [
      { k: "h", label: "Height cm", type: "num", def: "175" },
      { k: "w", label: "Weight kg", type: "num", def: "72" },
      { k: "a", label: "Age", type: "num", def: "32" },
      { k: "s", label: "Sex", type: "select", opts: [["m", "Male"], ["f", "Female"]] },
    ],
    compute({ h, w, a, s }) {
      const bmi = w / Math.pow(h / 100, 2);
      const cls = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obese";
      const bmr = 10 * w + 6.25 * h - 5 * a + (s === "m" ? 5 : -161);
      return { big: "BMI " + bmi.toFixed(1), sub: `${cls} · BMR ${fmt(bmr, 0)} kcal/day (Mifflin-St Jeor)` };
    },
  });
  calc({
    id: "pace", name: "Run Pace", icon: "🏃", cat: "Health", mode: "live",
    grad: "linear-gradient(135deg,#fa709a,#fee140)", keywords: "running marathon finish time",
    fields: [
      { k: "d", label: "Distance km", type: "num", def: "10" },
      { k: "t", label: "Time h:m:s", type: "text", def: "0:48:00" },
    ],
    compute({ d, t }) {
      const parts = String(t).split(":").map(Number);
      let sec = 0; parts.forEach((p) => { sec = sec * 60 + (p || 0); });
      if (!d || !sec) return {};
      const pk = sec / d, pm = pk * 1.609344;
      const f = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
      const riegel = (dist) => sec * Math.pow(dist / d, 1.06);
      const ft = (s) => { s = Math.round(s); return `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
      return { big: f(pk) + " /km", sub: `${f(pm)} /mi · predicts half ${ft(riegel(21.0975))} · full ${ft(riegel(42.195))}` };
    },
  });
  calc({
    id: "onerm", name: "One-Rep Max", icon: "🏋️", cat: "Health", mode: "live",
    grad: "linear-gradient(135deg,#f83600,#f9d423)", keywords: "lifting 1rm strength epley",
    fields: [
      { k: "w", label: "Weight kg", type: "num", def: "100" },
      { k: "r", label: "Reps", type: "num", def: "5" },
    ],
    compute({ w, r }) {
      if (!w || !r) return {};
      const orm = r === 1 ? w : w * (1 + r / 30);
      return { big: fmt(orm, 1) + " kg", sub: `Epley · 90% ${fmt(orm * 0.9, 0)} · 80% ${fmt(orm * 0.8, 0)} · 70% ${fmt(orm * 0.7, 0)} kg` };
    },
  });

  /* ================= Kitchen ================= */
  calc({
    id: "recipe", name: "Recipe Scaler", icon: "🍲", cat: "Kitchen", mode: "live",
    grad: "linear-gradient(135deg,#f6d365,#fda085)", keywords: "servings scale cooking",
    fields: [
      { k: "o", label: "Recipe serves", type: "num", def: "4" },
      { k: "n", label: "You need", type: "num", def: "7" },
      { k: "q", label: "Any quantity", type: "num", def: "250" },
    ],
    compute({ o, n, q }) {
      if (!o || !n) return {};
      const f = n / o;
      return { big: "× " + fmt(f, 3), sub: q ? `${fmt(q)} becomes ${fmt(q * f, 1)}` : "multiply every ingredient by this" };
    },
  });
  calc({
    id: "coffee", name: "Coffee Ratio", icon: "☕", cat: "Kitchen", mode: "live",
    grad: "linear-gradient(135deg,#c79081,#dfa579)", keywords: "brew pour over beans water",
    fields: [
      { k: "w", label: "Water ml", type: "num", def: "320" },
      { k: "r", label: "Ratio", type: "select", def: "16", opts: [["14", "1:14 strong"], ["15", "1:15"], ["16", "1:16 classic"], ["17", "1:17 light"]] },
    ],
    compute({ w, r }) {
      if (!w) return {};
      return { big: fmt(w / +r, 1) + " g beans", sub: `1:${r} · yields ≈ ${fmt(w * 0.85, 0)} ml brewed` };
    },
  });
  const DENSITY = { "Flour (AP)": 120, "Sugar (white)": 200, "Brown sugar": 220, "Butter": 227, "Cocoa powder": 100, "Honey": 340, "Rice (raw)": 185, "Oats": 90, "Powdered sugar": 120 };
  calc({
    id: "baking", name: "Baking Grams", icon: "🧁", cat: "Kitchen", mode: "live",
    grad: "linear-gradient(135deg,#fddb92,#d1fdff)", keywords: "cups grams convert flour sugar butter",
    fields: [
      { k: "i", label: "Ingredient", type: "select", opts: Object.keys(DENSITY).map((k) => [k, k]) },
      { k: "c", label: "Cups", type: "num", def: "2" },
    ],
    compute({ i, c }) {
      if (!c) return {};
      const g = DENSITY[i] * c;
      return { big: fmt(g, 0) + " g", sub: `${i} · ${DENSITY[i]} g per cup · ${fmt(g / 28.3495, 1)} oz` };
    },
  });

  /* ================= Measure ================= */
  calc({
    id: "slope", name: "Slope", icon: "⛰️", cat: "Measure", mode: "live",
    grad: "linear-gradient(135deg,#8BC6EC,#9599E2)", keywords: "grade angle roof pitch ramp rise run",
    fields: [
      { k: "rise", label: "Rise", type: "num", def: "1" },
      { k: "run", label: "Run", type: "num", def: "8" },
    ],
    compute({ rise, run }) {
      if (!run) return {};
      const grade = rise / run * 100, ang = Math.atan2(rise, run) * 180 / Math.PI;
      const ada = grade <= 8.33 ? "ADA-ramp OK (≤1:12)" : "steeper than ADA 1:12";
      return { big: ang.toFixed(1) + "°", sub: `${grade.toFixed(1)}% grade · 1:${fmt(run / rise, 1)} · ${ada}` };
    },
  });
  calc({
    id: "paint", name: "Paint Calc", icon: "🎨", cat: "Measure", mode: "live",
    grad: "linear-gradient(135deg,#a8edea,#fed6e3)", keywords: "wall room liters gallons diy",
    fields: [
      { k: "l", label: "Room length m", type: "num", def: "4" },
      { k: "w", label: "Room width m", type: "num", def: "3" },
      { k: "h", label: "Wall height m", type: "num", def: "2.4" },
      { k: "o", label: "Doors+windows m²", type: "num", def: "3" },
      { k: "c", label: "Coats", type: "num", def: "2" },
    ],
    compute({ l, w, h, o, c }) {
      const area = Math.max(0, 2 * (l + w) * h - o) * c;
      return { big: fmt(area / 11, 1) + " L", sub: `${fmt(area, 1)} m² to cover · at 11 m²/L · ≈ ${fmt(area / 11 / 3.785, 1)} gal` };
    },
  });
  calc({
    id: "lumber", name: "Board Feet", icon: "🪵", cat: "Measure", mode: "live",
    grad: "linear-gradient(135deg,#d4a373,#a98467)", keywords: "wood lumber diy woodworking",
    fields: [
      { k: "t", label: "Thickness in", type: "num", def: "1" },
      { k: "w", label: "Width in", type: "num", def: "6" },
      { k: "l", label: "Length ft", type: "num", def: "8" },
      { k: "n", label: "Pieces", type: "num", def: "10" },
    ],
    compute({ t, w, l, n }) {
      const bf = t * w * l / 12 * n;
      return { big: fmt(bf, 1) + " bd ft", sub: `${fmt(bf / n, 2)} per piece · at $6/bf ≈ ${money(bf * 6)}` };
    },
  });

  /* ================= Base converter ================= */
  calc({
    id: "base", name: "Number Base", icon: "🔟", cat: "Calculators", mode: "live",
    grad: "linear-gradient(135deg,#30cfd0,#5b86e5)", keywords: "hex binary decimal octal dev",
    fields: [
      { k: "v", label: "Value", type: "text", def: "255" },
      { k: "b", label: "Input base", type: "select", def: "10", opts: [["2", "Binary"], ["8", "Octal"], ["10", "Decimal"], ["16", "Hex"]] },
    ],
    compute({ v, b }) {
      const n = parseInt(String(v).replace(/^0[xb]/i, ""), +b);
      if (isNaN(n)) return {};
      return { big: "0x" + n.toString(16).toUpperCase(), sub: `dec ${n.toLocaleString("en-US")} · bin ${n.toString(2)} · oct ${n.toString(8)}` };
    },
  });

  /* ================= Password (custom) ================= */
  register({
    id: "password", name: "Password", icon: "🔐", cat: "Essentials", mode: "live",
    grad: "linear-gradient(135deg,#434343,#8e9eab)", keywords: "generator secure random",
    render(body) {
      body.innerHTML += `
        <div class="t-result"><div class="big" id="pw-out" style="font-size:20px">—</div>
        <div class="sub" id="pw-sub"></div></div>
        <div class="t-card">
          <label class="slider-row">Length <input type="range" id="pw-len" min="8" max="40" value="20"><span id="pw-len-v" style="min-width:28px;text-align:right">20</span></label>
          <div class="chip-row">
            <button class="chip active" id="pw-sym">Symbols</button>
            <button class="chip active" id="pw-num">Digits</button>
            <button class="chip" id="pw-easy">No look-alikes</button>
          </div>
        </div>
        <button class="big-btn" id="pw-gen">Generate</button>
        <button class="big-btn" id="pw-copy" style="background:#2c2c34">Copy</button>`;
      const out = body.querySelector("#pw-out"), sub = body.querySelector("#pw-sub");
      const lenEl = body.querySelector("#pw-len");
      function on(id) { return body.querySelector(id).classList.contains("active"); }
      function gen() {
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (on("#pw-num")) chars += "0123456789";
        if (on("#pw-sym")) chars += "!@#$%^&*-_=+?";
        if (on("#pw-easy")) chars = chars.replace(/[Il1O0o]/g, "");
        const len = +lenEl.value;
        const buf = new Uint32Array(len);
        crypto.getRandomValues(buf);
        out.textContent = Array.from(buf, (v) => chars[v % chars.length]).join("");
        sub.textContent = `${len} chars · ~${Math.round(len * Math.log2(chars.length))} bits of entropy`;
      }
      lenEl.addEventListener("input", () => { body.querySelector("#pw-len-v").textContent = lenEl.value; gen(); });
      ["#pw-sym", "#pw-num", "#pw-easy"].forEach((id) =>
        body.querySelector(id).addEventListener("click", (e) => { e.target.classList.toggle("active"); gen(); }));
      body.querySelector("#pw-gen").addEventListener("click", gen);
      body.querySelector("#pw-copy").addEventListener("click", async (e) => {
        try { await navigator.clipboard.writeText(out.textContent); e.target.textContent = "Copied!"; }
        catch (err) { e.target.textContent = "Copy failed"; }
        setTimeout(() => { e.target.textContent = "Copy"; }, 1200);
      });
      gen();
    },
  });

  /* ================= World Clock (custom) ================= */
  register({
    id: "worldclock", name: "World Clock", icon: "🌍", cat: "Time & Focus", mode: "live",
    grad: "linear-gradient(135deg,#2b5876,#4e4376)", keywords: "timezone cities time",
    render(body, def) {
      const ZONES = [["New York", "America/New_York"], ["Los Angeles", "America/Los_Angeles"], ["London", "Europe/London"], ["Berlin", "Europe/Berlin"], ["Dubai", "Asia/Dubai"], ["Mumbai", "Asia/Kolkata"], ["Singapore", "Asia/Singapore"], ["Tokyo", "Asia/Tokyo"], ["Sydney", "Australia/Sydney"], ["São Paulo", "America/Sao_Paulo"]];
      let cities = store.get("worldclock", ["America/New_York", "Europe/London", "Asia/Tokyo"]);
      body.innerHTML += `<div class="t-list" id="wc-list"></div>
        <div class="t-row" style="margin-top:4px"><label>Add city</label><select id="wc-add"><option value="">choose…</option>${ZONES.map(([n, z]) => `<option value="${z}">${n}</option>`).join("")}</select></div>`;
      const list = body.querySelector("#wc-list");
      function draw() {
        list.innerHTML = "";
        cities.forEach((z) => {
          const name = (ZONES.find(([, zz]) => zz === z) || [z.split("/").pop().replace(/_/g, " ")])[0];
          const t = new Intl.DateTimeFormat("en-US", { timeZone: z, hour: "numeric", minute: "2-digit" }).format(new Date());
          const day = new Intl.DateTimeFormat("en-US", { timeZone: z, weekday: "short" }).format(new Date());
          const li = el("div", "t-li",
            `<div class="li-main"><strong>${esc(name)}</strong><span>${day}</span></div>` +
            `<span style="font-size:20px;font-weight:800;font-variant-numeric:tabular-nums">${t}</span>` +
            `<button class="li-x" data-z="${esc(z)}">×</button>`);
          list.appendChild(li);
        });
      }
      list.addEventListener("click", (e) => {
        const z = e.target.dataset && e.target.dataset.z;
        if (!z) return;
        cities = cities.filter((c) => c !== z);
        store.set("worldclock", cities); draw();
      });
      body.querySelector("#wc-add").addEventListener("change", (e) => {
        if (e.target.value && !cities.includes(e.target.value)) {
          cities.push(e.target.value); store.set("worldclock", cities);
        }
        e.target.value = ""; draw();
      });
      def._tick = null;
      def.enter = () => { draw(); def._tick = setInterval(draw, 15000); };
      def.exit = () => clearInterval(def._tick);
      draw();
    },
  });

  /* ================= Morse (custom) ================= */
  register({
    id: "morse", name: "Morse Code", icon: "📶", cat: "Display", mode: "live",
    grad: "linear-gradient(135deg,#414d0b,#727a17)", keywords: "sos flash beep translate",
    render(body, def) {
      const MAP = { a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.", 0: "-----" };
      body.innerHTML += `
        <div class="t-card"><div class="t-row"><label>Text</label><input type="text" id="mo-in" value="SOS" style="width:70%"></div></div>
        <div class="t-result"><div class="big" id="mo-out" style="letter-spacing:3px">··· ––– ···</div><div class="sub">tap Flash to blink the screen</div></div>
        <div class="chip-row"><button class="chip" id="mo-flash">⚡ Flash it</button><button class="chip" id="mo-beep">🔊 Beep it</button></div>
        <div id="mo-screen" style="position:fixed;inset:0;background:#fff;z-index:60;display:none"></div>`;
      const input = body.querySelector("#mo-in"), out = body.querySelector("#mo-out");
      const flashEl = body.querySelector("#mo-screen");
      let playing = false;
      function code() {
        return String(input.value).toLowerCase().split("").map((ch) => ch === " " ? "/" : MAP[ch] || "").filter(Boolean).join(" ");
      }
      function draw() { out.textContent = code().replace(/\./g, "·").replace(/-/g, "–") || "—"; }
      input.addEventListener("input", draw);
      async function play(mode) {
        if (playing) { playing = false; return; }
        playing = true;
        const unit = 140;
        const ac = mode === "beep" ? new (window.AudioContext || window.webkitAudioContext)() : null;
        for (const sym of code()) {
          if (!playing) break;
          if (sym === "/" || sym === " ") { await wait(unit * 3); continue; }
          for (const c of sym) {
            if (!playing) break;
            const dur = c === "." ? unit : unit * 3;
            if (mode === "flash") flashEl.style.display = "block";
            if (ac) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 700; g.gain.value = 0.3; o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur / 1000); }
            await wait(dur);
            flashEl.style.display = "none";
            await wait(unit);
          }
          await wait(unit * 2);
        }
        flashEl.style.display = "none";
        playing = false;
      }
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      body.querySelector("#mo-flash").addEventListener("click", () => play("flash"));
      body.querySelector("#mo-beep").addEventListener("click", () => play("beep"));
      def.exit = () => { playing = false; flashEl.style.display = "none"; };
      draw();
    },
  });

  /* ================= Reaction test (custom) ================= */
  register({
    id: "reaction", name: "Reaction", icon: "⚡", cat: "Party & Fun", mode: "live",
    grad: "linear-gradient(135deg,#f7971e,#ffd200)", keywords: "reflex speed test game",
    render(body, def) {
      body.innerHTML += `<div class="t-big-display" id="rx-stage" style="border-radius:18px;background:var(--card);cursor:pointer;min-height:340px">
        <div class="huge" id="rx-msg" style="font-size:26px">Tap to start</div>
        <div class="dyn-note" id="rx-sub">wait for green, then tap fast</div></div>`;
      const stage = body.querySelector("#rx-stage"), msg = body.querySelector("#rx-msg"), sub = body.querySelector("#rx-sub");
      let state = "idle", t0 = 0, timer = null;
      let best = store.get("reactionBest", null);
      if (best) sub.textContent = `best ${best} ms — wait for green, then tap`;
      stage.addEventListener("click", () => {
        if (state === "idle") {
          state = "wait"; stage.style.background = "#3d1412"; msg.textContent = "Wait for it…";
          timer = setTimeout(() => { state = "go"; t0 = performance.now(); stage.style.background = "#0f3d22"; msg.textContent = "TAP!"; }, 900 + Math.random() * 2200);
        } else if (state === "wait") {
          clearTimeout(timer); state = "idle"; stage.style.background = "";
          msg.textContent = "Too soon!"; sub.textContent = "tap to try again";
        } else if (state === "go") {
          const ms = Math.round(performance.now() - t0);
          state = "idle"; stage.style.background = "";
          msg.textContent = ms + " ms";
          if (!best || ms < best) { best = ms; store.set("reactionBest", best); }
          sub.textContent = `best ${best} ms · tap to go again`;
        }
      });
      def.exit = () => { clearTimeout(timer); state = "idle"; stage.style.background = ""; msg.textContent = "Tap to start"; };
    },
  });

  /* ================= Age clock (custom) ================= */
  register({
    id: "ageclock", name: "Age Clock", icon: "⏳", cat: "Party & Fun", mode: "live",
    grad: "linear-gradient(135deg,#5f2c82,#49a09d)", keywords: "birthday seconds alive",
    render(body, def) {
      const saved = store.get("birthdate", "");
      body.innerHTML += `
        <div class="t-card"><div class="t-row"><label>Birth date</label><input type="date" id="ac-date" value="${esc(saved)}"></div></div>
        <div class="t-big-display"><div class="huge" id="ac-secs" style="font-size:44px">—</div>
        <div class="dyn-note" id="ac-sub">seconds alive</div></div>`;
      const dateEl = body.querySelector("#ac-date"), secsEl = body.querySelector("#ac-secs"), subEl = body.querySelector("#ac-sub");
      function tick() {
        if (!dateEl.value) { secsEl.textContent = "—"; return; }
        const b = new Date(dateEl.value + "T00:00:00");
        const s = Math.floor((Date.now() - b.getTime()) / 1000);
        if (s < 0) { secsEl.textContent = "not yet!"; return; }
        secsEl.textContent = s.toLocaleString("en-US");
        const days = s / 86400;
        subEl.textContent = `seconds alive · ${fmt(days, 0)} days · ${fmt(days / 365.2425, 1)} years`;
      }
      dateEl.addEventListener("change", () => { store.set("birthdate", dateEl.value); tick(); });
      def.enter = () => { tick(); def._t = setInterval(tick, 1000); };
      def.exit = () => clearInterval(def._t);
    },
  });

  /* ================= Lightning distance (custom) ================= */
  register({
    id: "lightning", name: "Storm Range", icon: "⛈️", cat: "Outdoors", mode: "live",
    grad: "linear-gradient(135deg,#141e30,#c94b4b)", keywords: "thunder flash distance weather",
    note: "Tap at the flash, tap again at the thunder — sound travels ~343 m/s.",
    render(body, def) {
      body.innerHTML += `<div class="t-big-display" id="lt-stage" style="border-radius:18px;background:var(--card);cursor:pointer;min-height:320px">
        <div style="font-size:56px" id="lt-icon">⚡</div>
        <div class="huge" id="lt-val" style="font-size:34px">Tap at the flash</div>
        <div class="dyn-note" id="lt-sub"></div></div>`;
      const stage = body.querySelector("#lt-stage"), val = body.querySelector("#lt-val"), sub = body.querySelector("#lt-sub"), icon = body.querySelector("#lt-icon");
      let t0 = null, raf = null;
      function live() {
        if (t0 === null) return;
        const s = (performance.now() - t0) / 1000;
        val.textContent = s.toFixed(1) + " s…";
        raf = requestAnimationFrame(live);
      }
      stage.addEventListener("click", () => {
        if (t0 === null) {
          t0 = performance.now(); icon.textContent = "👂"; sub.textContent = "now tap when you hear thunder"; live();
        } else {
          cancelAnimationFrame(raf);
          const s = (performance.now() - t0) / 1000;
          const km = 0.343 * s;
          t0 = null; icon.textContent = "⚡";
          val.textContent = km < 1 ? Math.round(km * 1000) + " m away" : km.toFixed(1) + " km away";
          sub.textContent = `${s.toFixed(1)} s flash→thunder · ${(km / 1.609).toFixed(1)} mi · tap to measure again`;
        }
      });
      def.exit = () => { cancelAnimationFrame(raf); t0 = null; };
    },
  });

  /* ================= Hydration (custom) ================= */
  register({
    id: "hydrate", name: "Hydrate", icon: "💧", cat: "Health", mode: "live",
    grad: "linear-gradient(135deg,#43cea2,#185a9d)", keywords: "water intake tracker drink",
    render(body, def) {
      function today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
      let data = store.get("hydrate", { day: today(), ml: 0, goal: 2400 });
      body.innerHTML += `
        <div class="t-big-display"><div class="huge"><span id="hy-ml">0</span><small> / <span id="hy-goal">2400</span> ml</small></div>
        <div class="meter-track" style="width:80%;height:10px;border-radius:5px;background:#2c2c34;overflow:hidden"><div id="hy-bar" style="height:100%;background:#43cea2;border-radius:5px;width:0%"></div></div>
        <div class="dyn-note" id="hy-sub"></div></div>
        <div class="chip-row"><button class="chip" data-add="250">+250 ml</button><button class="chip" data-add="500">+500 ml</button><button class="chip" data-add="-250">−250</button><button class="chip" id="hy-reset">Reset day</button></div>
        <div class="t-card"><div class="t-row"><label>Daily goal ml</label><input type="text" inputmode="numeric" id="hy-goal-in" value="${data.goal}"></div></div>`;
      const mlEl = body.querySelector("#hy-ml"), barEl = body.querySelector("#hy-bar"), subEl = body.querySelector("#hy-sub");
      function draw() {
        if (data.day !== today()) { data = { day: today(), ml: 0, goal: data.goal }; }
        mlEl.textContent = data.ml.toLocaleString("en-US");
        body.querySelector("#hy-goal").textContent = data.goal.toLocaleString("en-US");
        const pct = Math.min(100, data.ml / data.goal * 100);
        barEl.style.width = pct + "%";
        subEl.textContent = pct >= 100 ? "Goal reached 🎉" : `${Math.round(pct)}% of today's goal`;
        store.set("hydrate", data);
      }
      body.addEventListener("click", (e) => {
        const add = e.target.dataset && e.target.dataset.add;
        if (add) { data.ml = Math.max(0, data.ml + +add); draw(); }
      });
      body.querySelector("#hy-reset").addEventListener("click", () => { data.ml = 0; draw(); });
      body.querySelector("#hy-goal-in").addEventListener("input", (e) => {
        const g = parseInt(e.target.value, 10); if (g > 0) { data.goal = g; draw(); }
      });
      def.enter = draw;
      draw();
    },
  });

  /* ================= Meeting planner (custom) ================= */
  register({
    id: "meeting", name: "Meeting Planner", icon: "🕘", cat: "Time & Focus", mode: "live",
    grad: "linear-gradient(135deg,#5ac8fa,#2b5876)", keywords: "timezone overlap schedule call",
    note: "Green hours = 8am–6pm for everyone. Pick a slot where rows overlap.",
    render(body) {
      const ZONES = [["New York", "America/New_York"], ["Los Angeles", "America/Los_Angeles"], ["London", "Europe/London"], ["Berlin", "Europe/Berlin"], ["Dubai", "Asia/Dubai"], ["Mumbai", "Asia/Kolkata"], ["Singapore", "Asia/Singapore"], ["Tokyo", "Asia/Tokyo"], ["Sydney", "Australia/Sydney"]];
      body.innerHTML += `
        <div class="t-card t-rows" id="mt-selects"></div>
        <div class="t-card" style="overflow-x:auto"><div id="mt-grid" style="min-width:480px"></div></div>`;
      const selWrap = body.querySelector("#mt-selects"), grid = body.querySelector("#mt-grid");
      const picks = store.get("meetingZones", ["America/New_York", "Europe/Berlin", "Asia/Tokyo"]);
      for (let i = 0; i < 3; i++) {
        const row = el("div", "t-row");
        row.appendChild(el("label", "", "Person " + (i + 1)));
        const sel = el("select");
        ZONES.forEach(([n, z]) => { const o = el("option", "", n); o.value = z; sel.appendChild(o); });
        sel.value = picks[i];
        sel.addEventListener("change", draw);
        row.appendChild(sel);
        selWrap.appendChild(row);
      }
      function offsetHours(zone) {
        const now = new Date();
        const inZone = new Date(now.toLocaleString("en-US", { timeZone: zone }));
        return Math.round((inZone - now) / 3600000);
      }
      function draw() {
        const zones = Array.from(selWrap.querySelectorAll("select")).map((s) => s.value);
        let html = `<div style="display:grid;grid-template-columns:90px repeat(24,1fr);gap:2px;font-size:10px">`;
        html += `<div></div>` + Array.from({ length: 24 }, (_, h) => `<div style="text-align:center;color:#8e8e93">${h}</div>`).join("");
        const rows = zones.map((z) => {
          const off = offsetHours(z);
          const name = (ZONES.find(([, zz]) => zz === z) || ["?"])[0];
          return { name, cells: Array.from({ length: 24 }, (_, utcH) => { const local = ((utcH + off) % 24 + 24) % 24; return local >= 8 && local < 18; }) };
        });
        rows.forEach((r) => {
          html += `<div style="color:#f2f2f7;font-weight:700;font-size:11px;align-self:center">${esc(r.name)}</div>`;
          r.cells.forEach((ok) => { html += `<div style="height:22px;border-radius:4px;background:${ok ? "#1d7a46" : "#2c2c34"}"></div>`; });
        });
        html += `<div style="color:#8e8e93;font-size:11px;align-self:center">Overlap</div>`;
        for (let h = 0; h < 24; h++) {
          const all = rows.every((r) => r.cells[h]);
          html += `<div style="height:22px;border-radius:4px;background:${all ? "#30d158" : "transparent"};border:1px solid #2c2c34"></div>`;
        }
        html += `</div><p class="dyn-note" style="margin-top:8px">columns are UTC hours</p>`;
        grid.innerHTML = html;
        store.set("meetingZones", zones);
      }
      draw();
    },
  });
})();
