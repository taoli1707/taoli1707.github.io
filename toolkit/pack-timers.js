/* Pack: timers, focus, display, and party tools */
"use strict";
(() => {
  const { register, el, esc, fmt, store } = TK;

  let _ac = null;
  function beep(freq, dur, vol) {
    try {
      _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
      _ac.resume();
      const o = _ac.createOscillator(), g = _ac.createGain();
      o.frequency.value = freq || 880;
      g.gain.setValueAtTime(vol || 0.3, _ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, _ac.currentTime + (dur || 0.2));
      o.connect(g).connect(_ac.destination);
      o.start(); o.stop(_ac.currentTime + (dur || 0.2) + 0.05);
    } catch (e) {}
  }
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  /* ================= HIIT Interval Timer ================= */
  register({
    id: "hiit", name: "Intervals", icon: "🥊", cat: "Time & Focus", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#ed213a,#93291e)", keywords: "hiit tabata workout rounds rest",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card t-rows">
          <div class="t-row"><label>Work s</label><input type="text" inputmode="numeric" id="hi-work" value="30"></div>
          <div class="t-row"><label>Rest s</label><input type="text" inputmode="numeric" id="hi-rest" value="10"></div>
          <div class="t-row"><label>Rounds</label><input type="text" inputmode="numeric" id="hi-rounds" value="8"></div>
        </div>
        <div class="t-big-display" id="hi-stage" style="border-radius:18px;min-height:200px">
          <div class="dyn-note" id="hi-phase">ready</div>
          <div class="huge" id="hi-time">0:30</div>
          <div class="dyn-note" id="hi-round"></div>
        </div>
        <button class="big-btn" id="hi-go">Start</button>`;
      const stage = body.querySelector("#hi-stage"), phaseEl = body.querySelector("#hi-phase"),
        timeEl = body.querySelector("#hi-time"), roundEl = body.querySelector("#hi-round");
      let timer = null, endAt = 0, phase = "idle", round = 0;
      const val = (id) => Math.max(1, parseInt(body.querySelector(id).value, 10) || 1);
      function setPhase(p, secs) {
        phase = p; endAt = Date.now() + secs * 1000;
        stage.style.background = p === "work" ? "#3d1412" : p === "rest" ? "#0f2d3d" : "var(--card)";
        phaseEl.textContent = p === "work" ? "WORK" : p === "rest" ? "rest" : p;
        beep(p === "work" ? 1200 : 700, 0.25);
      }
      function tick() {
        const left = (endAt - Date.now()) / 1000;
        if (left <= 0) {
          if (phase === "work") {
            if (round >= val("#hi-rounds")) { finish(); return; }
            setPhase("rest", val("#hi-rest"));
          } else if (phase === "rest") { round++; setPhase("work", val("#hi-work")); }
        }
        timeEl.textContent = mmss(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
        roundEl.textContent = `round ${round} / ${val("#hi-rounds")}`;
      }
      function finish() {
        clearInterval(timer); timer = null;
        stage.style.background = "#0f3d22"; phaseEl.textContent = "DONE 🎉"; timeEl.textContent = "0:00";
        beep(880, 0.2); setTimeout(() => beep(1100, 0.2), 250); setTimeout(() => beep(1320, 0.4), 500);
        body.querySelector("#hi-go").textContent = "Start";
      }
      body.querySelector("#hi-go").addEventListener("click", (e) => {
        if (timer) { clearInterval(timer); timer = null; e.target.textContent = "Start"; phaseEl.textContent = "paused"; return; }
        if (phase === "idle" || phase === "DONE 🎉") { round = 1; setPhase("work", val("#hi-work")); }
        timer = setInterval(tick, 200);
        e.target.textContent = "Pause";
      });
      def.exit = () => { clearInterval(timer); timer = null; phase = "idle"; stage.style.background = "var(--card)"; body.querySelector("#hi-go").textContent = "Start"; };
    },
  });

  /* ================= Chess Clock ================= */
  register({
    id: "chess", name: "Chess Clock", icon: "♟️", cat: "Time & Focus", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#232526,#414345)", keywords: "two player game blitz",
    render(body, def) {
      body.innerHTML += `
        <div class="chip-row" id="ch-presets"><button class="chip active" data-m="5" data-i="0">5+0</button><button class="chip" data-m="3" data-i="2">3+2</button><button class="chip" data-m="10" data-i="0">10+0</button><button class="chip" id="ch-reset">Reset</button></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:10px">
          <div id="ch-b" style="flex:1;border-radius:18px;background:var(--card);display:flex;align-items:center;justify-content:center;transform:rotate(180deg);cursor:pointer">
            <span style="font-size:52px;font-weight:800;font-variant-numeric:tabular-nums" id="ch-bt">5:00</span></div>
          <div id="ch-a" style="flex:1;border-radius:18px;background:var(--card);display:flex;align-items:center;justify-content:center;cursor:pointer">
            <span style="font-size:52px;font-weight:800;font-variant-numeric:tabular-nums" id="ch-at">5:00</span></div>
        </div>`;
      let ms = { a: 300000, b: 300000 }, inc = 0, turn = null, last = 0, timer = null, base = 5;
      const els = { a: body.querySelector("#ch-at"), b: body.querySelector("#ch-bt") };
      const zones = { a: body.querySelector("#ch-a"), b: body.querySelector("#ch-b") };
      function draw() {
        for (const k of ["a", "b"]) {
          const s = Math.max(0, ms[k] / 1000);
          els[k].textContent = `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
          zones[k].style.background = ms[k] <= 0 ? "#3d1412" : turn === k ? "#0f3d22" : "var(--card)";
        }
      }
      function tick() {
        if (!turn) return;
        const now = performance.now();
        ms[turn] -= now - last; last = now;
        if (ms[turn] <= 0) { ms[turn] = 0; clearInterval(timer); timer = null; const lost = turn; turn = null; beep(300, 0.6); zones[lost].style.background = "#3d1412"; }
        draw();
      }
      function tap(k) {
        if (ms.a <= 0 || ms.b <= 0) return;
        if (turn === null) { turn = k === "a" ? "b" : "a"; last = performance.now(); timer = setInterval(tick, 100); }
        else if (turn === k) { ms[k] += inc * 1000; turn = k === "a" ? "b" : "a"; last = performance.now(); beep(900, 0.05, 0.15); }
        draw();
      }
      zones.a.addEventListener("click", () => tap("a"));
      zones.b.addEventListener("click", () => tap("b"));
      function reset() { clearInterval(timer); timer = null; turn = null; ms = { a: base * 60000, b: base * 60000 }; draw(); }
      body.querySelector("#ch-presets").addEventListener("click", (e) => {
        const b = e.target.closest("[data-m]");
        if (b) {
          body.querySelectorAll("#ch-presets .chip").forEach((c) => c.classList.remove("active"));
          b.classList.add("active");
          base = +b.dataset.m; inc = +b.dataset.i; reset();
        }
        if (e.target.id === "ch-reset") reset();
      });
      def.exit = () => { clearInterval(timer); timer = null; turn = null; };
      draw();
    },
  });

  /* ================= Kitchen Timers ================= */
  register({
    id: "kitchen", name: "Kitchen Timers", icon: "🍳", cat: "Time & Focus", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#f7b733,#fc4a1a)", keywords: "multiple named cooking simultaneous",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card t-rows">
          <div class="t-row"><label>Name</label><input type="text" id="kt-name" placeholder="Pasta" style="width:40%"></div>
          <div class="t-row"><label>Minutes</label><input type="text" inputmode="decimal" id="kt-min" value="7" style="width:40%"></div>
        </div>
        <button class="big-btn" id="kt-add">Start timer</button>
        <div class="t-list" id="kt-list"></div>`;
      let timers = [];
      const list = body.querySelector("#kt-list");
      let iv = null;
      function draw() {
        list.innerHTML = "";
        timers.forEach((t, i) => {
          const left = Math.ceil((t.end - Date.now()) / 1000);
          const li = el("div", "t-li",
            `<div class="li-main"><strong>${esc(t.name)}</strong><span>${left <= 0 ? "done ✓ 🔔" : mmss(left) + " remaining"}</span></div>` +
            `<button class="li-x" data-i="${i}">×</button>`);
          if (left <= 0) li.style.outline = "2px solid #30d158";
          list.appendChild(li);
        });
        if (!timers.length) list.appendChild(el("p", "dyn-note", "No timers running"));
      }
      function tick() {
        let anyDone = false;
        timers.forEach((t) => {
          if (!t.rung && t.end <= Date.now()) { t.rung = true; anyDone = true; }
        });
        if (anyDone) { beep(1000, 0.3); setTimeout(() => beep(1200, 0.3), 350); if (navigator.vibrate) navigator.vibrate([300, 100, 300]); }
        draw();
      }
      body.querySelector("#kt-add").addEventListener("click", () => {
        const name = body.querySelector("#kt-name").value.trim() || "Timer";
        const min = parseFloat(body.querySelector("#kt-min").value) || 1;
        timers.push({ name, end: Date.now() + min * 60000, rung: false });
        body.querySelector("#kt-name").value = "";
        draw();
      });
      list.addEventListener("click", (e) => {
        if (e.target.dataset && e.target.dataset.i !== undefined) { timers.splice(+e.target.dataset.i, 1); draw(); }
      });
      def.enter = () => { draw(); iv = setInterval(tick, 500); };
      def.exit = () => clearInterval(iv);
    },
  });

  /* ================= Pomodoro ================= */
  register({
    id: "pomodoro", name: "Pomodoro", icon: "🍅", cat: "Time & Focus", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#d31027,#ea384d)", keywords: "focus work break sessions streak",
    render(body, def) {
      let streak = store.get("pomoStreak", 0);
      body.innerHTML += `
        <div class="chip-row"><button class="chip active" data-w="25" data-b="5">25/5</button><button class="chip" data-w="50" data-b="10">50/10</button></div>
        <div class="t-big-display" id="po-stage" style="border-radius:18px;min-height:230px">
          <div class="dyn-note" id="po-phase">focus</div>
          <div class="huge" id="po-time">25:00</div>
          <div class="dyn-note" id="po-streak">streak ${streak} 🔥</div>
        </div>
        <button class="big-btn" id="po-go">Start focus</button>`;
      let work = 25, brk = 5, phase = "focus", endAt = 0, timer = null;
      const timeEl = body.querySelector("#po-time"), phaseEl = body.querySelector("#po-phase"), stage = body.querySelector("#po-stage");
      function tick() {
        const left = Math.ceil((endAt - Date.now()) / 1000);
        if (left <= 0) {
          beep(880, 0.3); setTimeout(() => beep(660, 0.3), 350);
          if (phase === "focus") { streak++; store.set("pomoStreak", streak); body.querySelector("#po-streak").textContent = `streak ${streak} 🔥`; phase = "break"; endAt = Date.now() + brk * 60000; phaseEl.textContent = "break"; stage.style.background = "#0f2d3d"; }
          else { phase = "focus"; endAt = Date.now() + work * 60000; phaseEl.textContent = "focus"; stage.style.background = "#3d1412"; }
        }
        timeEl.textContent = mmss(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
      }
      body.querySelector("#po-go").addEventListener("click", (e) => {
        if (timer) { clearInterval(timer); timer = null; e.target.textContent = "Resume"; return; }
        if (!endAt || endAt < Date.now()) { phase = "focus"; endAt = Date.now() + work * 60000; stage.style.background = "#3d1412"; phaseEl.textContent = "focus"; }
        timer = setInterval(tick, 250);
        e.target.textContent = "Pause";
      });
      body.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => {
        body.querySelectorAll(".chip[data-w]").forEach((c) => c.classList.remove("active"));
        b.classList.add("active");
        work = +b.dataset.w; brk = +b.dataset.b;
        if (!timer) { timeEl.textContent = mmss(work * 60); }
      }));
      def.exit = () => { clearInterval(timer); timer = null; };
    },
  });

  /* ================= Box Breathing ================= */
  register({
    id: "breathe", name: "Breathe", icon: "🫁", cat: "Health", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#134e5e,#71b280)", keywords: "box breathing calm meditation 478",
    render(body, def) {
      body.innerHTML += `
        <div class="chip-row"><button class="chip active" data-p="4,4,4,4">Box 4·4·4·4</button><button class="chip" data-p="4,7,8,0">4-7-8</button></div>
        <div class="t-big-display" style="min-height:300px">
          <div id="br-circle" style="width:110px;height:110px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#a8e6cf,#71b280);transition:transform 1s linear;box-shadow:0 0 40px rgba(113,178,128,0.4)"></div>
          <div class="huge" id="br-phase" style="font-size:26px;margin-top:16px">Press start</div>
          <div class="dyn-note" id="br-count"></div>
        </div>
        <button class="big-btn" id="br-go">Start</button>`;
      const circle = body.querySelector("#br-circle"), phaseEl = body.querySelector("#br-phase"), countEl = body.querySelector("#br-count");
      let pattern = [4, 4, 4, 4], running = false, timeout = null, cycle = 0;
      const NAMES = ["Inhale", "Hold", "Exhale", "Hold"];
      const SCALE = [1.6, 1.6, 1.0, 1.0];
      function step(i) {
        if (!running) return;
        while (pattern[i % 4] === 0) i++;
        const idx = i % 4;
        if (idx === 0) { cycle++; countEl.textContent = "cycle " + cycle; }
        phaseEl.textContent = NAMES[idx] + " " + pattern[idx];
        circle.style.transition = `transform ${pattern[idx]}s ease-in-out`;
        circle.style.transform = `scale(${SCALE[idx]})`;
        if (navigator.vibrate) navigator.vibrate(20);
        timeout = setTimeout(() => step(i + 1), pattern[idx] * 1000);
      }
      body.querySelector("#br-go").addEventListener("click", (e) => {
        running = !running;
        e.target.textContent = running ? "Stop" : "Start";
        if (running) { cycle = 0; step(0); }
        else { clearTimeout(timeout); circle.style.transform = "scale(1)"; phaseEl.textContent = "Press start"; countEl.textContent = ""; }
      });
      body.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
        body.querySelectorAll(".chip[data-p]").forEach((c) => c.classList.remove("active"));
        b.classList.add("active");
        pattern = b.dataset.p.split(",").map(Number);
      }));
      def.exit = () => { running = false; clearTimeout(timeout); circle.style.transform = "scale(1)"; };
    },
  });

  /* ================= Decision Wheel ================= */
  register({
    id: "wheel", name: "Decision Wheel", icon: "🎡", cat: "Party & Fun", mode: "live",
    grad: "linear-gradient(135deg,#f953c6,#b91d73)", keywords: "spinner choose random options",
    render(body) {
      body.innerHTML += `
        <canvas id="wh-canvas" width="300" height="300" style="width:min(78vw,300px);align-self:center;cursor:pointer"></canvas>
        <div class="t-result"><div class="big" id="wh-out" style="font-size:22px">Tap the wheel</div></div>
        <div class="t-card"><textarea id="wh-opts" rows="3" style="width:100%;background:#2c2c34;border:none;border-radius:10px;color:var(--text);font:inherit;padding:10px">Pizza\nSushi\nTacos\nBurgers\nThai\nSalad</textarea></div>`;
      const canvas = body.querySelector("#wh-canvas"), ctx = canvas.getContext("2d");
      const optsEl = body.querySelector("#wh-opts"), out = body.querySelector("#wh-out");
      const COLORS = ["#f953c6", "#0a84ff", "#30d158", "#ffd60a", "#ff9f0a", "#bf5af2", "#64d2ff", "#ff453a"];
      let angle = 0, spinning = false;
      const opts = () => optsEl.value.split("\n").map((s) => s.trim()).filter(Boolean);
      function draw() {
        const o = opts(), n = o.length || 1;
        ctx.clearRect(0, 0, 300, 300);
        ctx.save();
        ctx.translate(150, 150); ctx.rotate(angle);
        o.forEach((label, i) => {
          const a0 = i / n * 2 * Math.PI, a1 = (i + 1) / n * 2 * Math.PI;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 145, a0, a1); ctx.closePath();
          ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill();
          ctx.save();
          ctx.rotate((a0 + a1) / 2);
          ctx.fillStyle = "#fff"; ctx.font = "bold 14px -apple-system,sans-serif"; ctx.textAlign = "right";
          ctx.fillText(label.slice(0, 12), 132, 5);
          ctx.restore();
        });
        ctx.restore();
        ctx.beginPath(); ctx.moveTo(150, 6); ctx.lineTo(140, 26); ctx.lineTo(160, 26); ctx.closePath();
        ctx.fillStyle = "#fff"; ctx.fill();
      }
      function spin() {
        if (spinning || opts().length < 2) return;
        spinning = true; out.textContent = "…";
        const buf = new Uint32Array(1); crypto.getRandomValues(buf);
        const target = angle + 6 * Math.PI + (buf[0] / 0xFFFFFFFF) * 2 * Math.PI;
        const start = angle, t0 = performance.now(), dur = 3200;
        (function anim(now) {
          const t = Math.min(1, (now - t0) / dur);
          const ease = 1 - Math.pow(1 - t, 3);
          angle = start + (target - start) * ease;
          draw();
          if (t < 1) requestAnimationFrame(anim);
          else {
            spinning = false;
            const o = opts(), n = o.length;
            const pointerAngle = ((-Math.PI / 2 - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            out.textContent = "🎉 " + o[Math.floor(pointerAngle / (2 * Math.PI / n))];
            if (navigator.vibrate) navigator.vibrate(60);
          }
        })(t0);
      }
      canvas.addEventListener("click", spin);
      optsEl.addEventListener("input", draw);
      draw();
    },
  });

  /* ================= RPG Dice ================= */
  register({
    id: "rpg", name: "RPG Dice", icon: "🐉", cat: "Party & Fun", mode: "live",
    grad: "linear-gradient(135deg,#42275a,#734b6d)", keywords: "d20 dnd dungeons roll modifier",
    render(body) {
      body.innerHTML += `
        <div class="t-big-display"><div class="huge" id="rp-out">—</div><div class="dyn-note" id="rp-sub">pick a die</div></div>
        <div class="chip-row" id="rp-dice">${[4, 6, 8, 10, 12, 20, 100].map((d) => `<button class="chip${d === 20 ? " active" : ""}" data-d="${d}">d${d}</button>`).join("")}</div>
        <div class="t-card t-rows">
          <div class="t-row"><label>How many</label><input type="text" inputmode="numeric" id="rp-n" value="1"></div>
          <div class="t-row"><label>Modifier</label><input type="text" inputmode="numeric" id="rp-mod" value="0"></div>
        </div>
        <button class="big-btn" id="rp-roll">Roll</button>`;
      let die = 20;
      body.querySelector("#rp-dice").addEventListener("click", (e) => {
        const b = e.target.closest("[data-d]"); if (!b) return;
        body.querySelectorAll("#rp-dice .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active"); die = +b.dataset.d;
      });
      body.querySelector("#rp-roll").addEventListener("click", () => {
        const n = Math.min(20, Math.max(1, parseInt(body.querySelector("#rp-n").value, 10) || 1));
        const mod = parseInt(body.querySelector("#rp-mod").value, 10) || 0;
        const rolls = [];
        for (let i = 0; i < n; i++) {
          const buf = new Uint32Array(1); crypto.getRandomValues(buf);
          rolls.push(buf[0] % die + 1);
        }
        const total = rolls.reduce((a, b) => a + b, 0) + mod;
        body.querySelector("#rp-out").textContent = total;
        let sub = `${n}d${die}${mod ? (mod > 0 ? "+" + mod : mod) : ""} → [${rolls.join(", ")}]`;
        if (die === 20 && n === 1 && rolls[0] === 20) sub += " · NAT 20! ⭐";
        if (die === 20 && n === 1 && rolls[0] === 1) sub += " · nat 1 💀";
        body.querySelector("#rp-sub").textContent = sub;
        if (navigator.vibrate) navigator.vibrate(20);
      });
    },
  });

  /* ================= Buzzer ================= */
  register({
    id: "buzzer", name: "Buzzer", icon: "🚨", cat: "Party & Fun", mode: "live",
    grad: "linear-gradient(135deg,#eb3349,#f45c43)", keywords: "trivia game show quiz first",
    note: "Pass-and-play: whoever slaps first locks it. (Multi-phone sync needs native.)",
    render(body, def) {
      body.innerHTML += `
        <div id="bz-pad" style="flex:1;min-height:320px;border-radius:24px;background:radial-gradient(circle at 50% 35%,#eb3349,#a31226);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 40px rgba(235,51,73,0.35)">
          <span id="bz-msg" style="font-size:34px;font-weight:800;color:#fff;text-align:center;padding:20px">SLAP TO BUZZ</span>
        </div>
        <button class="big-btn" id="bz-reset" style="background:#2c2c34">Reset</button>`;
      const pad = body.querySelector("#bz-pad"), msg = body.querySelector("#bz-msg");
      let locked = false;
      pad.addEventListener("pointerdown", () => {
        if (locked) return;
        locked = true;
        msg.textContent = "🔒 BUZZED!";
        pad.style.background = "radial-gradient(circle at 50% 35%,#30d158,#0f8a3d)";
        beep(1400, 0.4, 0.4);
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      });
      body.querySelector("#bz-reset").addEventListener("click", () => {
        locked = false;
        msg.textContent = "SLAP TO BUZZ";
        pad.style.background = "radial-gradient(circle at 50% 35%,#eb3349,#a31226)";
      });
      def.exit = () => { locked = false; msg.textContent = "SLAP TO BUZZ"; };
    },
  });

  /* ================= Beat Strobe ================= */
  register({
    id: "strobe", name: "Beat Strobe", icon: "🪩", cat: "Party & Fun", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#12c2e9,#c471ed)", keywords: "party flash music mic dance",
    note: "Mic mode flashes to the music around you. Photosensitivity warning: contains flashing lights.",
    render(body, def) {
      body.innerHTML += `
        <div id="st-flash" style="flex:1;min-height:280px;border-radius:20px;background:#101014;transition:background 0.05s"></div>
        <div class="chip-row"><button class="chip active" id="st-mic">🎤 Mic sync</button><button class="chip" id="st-man">Manual BPM</button></div>
        <label class="slider-row">BPM <input type="range" id="st-bpm" min="60" max="180" value="124"><span id="st-bpm-v" style="min-width:34px;text-align:right">124</span></label>
        <button class="big-btn" id="st-go">Start</button>`;
      const flash = body.querySelector("#st-flash");
      const COLORS = ["#ff453a", "#0a84ff", "#30d158", "#ffd60a", "#bf5af2", "#64d2ff"];
      let running = false, mode = "mic", stream = null, analyser = null, raf = null, iv = null;
      let energyAvg = 0, lastFlash = 0, ci = 0;
      function doFlash() {
        flash.style.background = COLORS[ci++ % COLORS.length];
        setTimeout(() => { flash.style.background = "#101014"; }, 90);
      }
      async function startMic() {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false } });
          _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
          _ac.resume();
          analyser = _ac.createAnalyser(); analyser.fftSize = 512;
          _ac.createMediaStreamSource(stream).connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);
          (function loop() {
            if (!running) return;
            analyser.getByteFrequencyData(data);
            let bass = 0;
            for (let i = 1; i < 12; i++) bass += data[i];
            bass /= 11;
            energyAvg = energyAvg * 0.95 + bass * 0.05;
            if (bass > energyAvg * 1.35 && bass > 60 && performance.now() - lastFlash > 180) {
              lastFlash = performance.now(); doFlash();
            }
            raf = requestAnimationFrame(loop);
          })();
        } catch (e) {
          mode = "man"; startManual();
        }
      }
      function startManual() {
        iv = setInterval(doFlash, 60000 / +body.querySelector("#st-bpm").value);
      }
      function stop() {
        running = false;
        cancelAnimationFrame(raf); clearInterval(iv); iv = null;
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
        flash.style.background = "#101014";
        body.querySelector("#st-go").textContent = "Start";
      }
      body.querySelector("#st-go").addEventListener("click", (e) => {
        if (running) { stop(); return; }
        running = true; e.target.textContent = "Stop";
        mode === "mic" ? startMic() : startManual();
      });
      body.querySelector("#st-mic").addEventListener("click", (e) => { mode = "mic"; e.target.classList.add("active"); body.querySelector("#st-man").classList.remove("active"); if (running) { stop(); } });
      body.querySelector("#st-man").addEventListener("click", (e) => { mode = "man"; e.target.classList.add("active"); body.querySelector("#st-mic").classList.remove("active"); if (running) { stop(); } });
      body.querySelector("#st-bpm").addEventListener("input", (e) => {
        body.querySelector("#st-bpm-v").textContent = e.target.value;
        if (running && mode === "man") { clearInterval(iv); startManual(); }
      });
      def.exit = stop;
    },
  });

  /* ================= LED Banner ================= */
  register({
    id: "banner", name: "LED Banner", icon: "💬", cat: "Display", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#000000,#434343)", keywords: "marquee scrolling text sign gate",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card t-rows">
          <div class="t-row"><label>Message</label><input type="text" id="bn-text" value="GATE 4 →" style="width:70%"></div>
        </div>
        <div class="chip-row" id="bn-colors">
          <button class="chip active" data-c="#ffd60a">Amber</button><button class="chip" data-c="#ff453a">Red</button>
          <button class="chip" data-c="#30d158">Green</button><button class="chip" data-c="#ffffff">White</button>
        </div>
        <label class="slider-row">Speed <input type="range" id="bn-speed" min="4" max="20" value="9"></label>
        <button class="big-btn" id="bn-go">Show fullscreen</button>
        <div id="bn-full" style="display:none;position:fixed;inset:0;background:#000;z-index:70;overflow:hidden;cursor:pointer">
          <div id="bn-scroll" style="position:absolute;top:50%;transform:translateY(-50%);white-space:nowrap;font-weight:900;font-family:Menlo,monospace"></div>
        </div>`;
      const full = body.querySelector("#bn-full"), scroll = body.querySelector("#bn-scroll");
      let color = "#ffd60a", raf = null;
      body.querySelector("#bn-colors").addEventListener("click", (e) => {
        const b = e.target.closest("[data-c]"); if (!b) return;
        body.querySelectorAll("#bn-colors .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active"); color = b.dataset.c;
      });
      body.querySelector("#bn-go").addEventListener("click", () => {
        const isLandscapeText = body.querySelector("#bn-text").value || "HELLO";
        scroll.textContent = isLandscapeText + "   ";
        scroll.style.color = color;
        scroll.style.textShadow = `0 0 24px ${color}`;
        scroll.style.fontSize = "38vh";
        full.style.display = "block";
        let x = window.innerWidth;
        const speed = +body.querySelector("#bn-speed").value;
        (function anim() {
          x -= speed;
          if (x < -scroll.offsetWidth) x = window.innerWidth;
          scroll.style.left = x + "px";
          raf = requestAnimationFrame(anim);
        })();
      });
      full.addEventListener("click", () => { full.style.display = "none"; cancelAnimationFrame(raf); });
      def.exit = () => { full.style.display = "none"; cancelAnimationFrame(raf); };
    },
  });

  /* ================= Teleprompter ================= */
  register({
    id: "prompter", name: "Teleprompter", icon: "🎬", cat: "Display", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#ff5a4e,#8a1f16)", keywords: "script scroll video speech mirror",
    render(body, def) {
      const saved = store.get("prompterText", "Welcome to my channel!\n\nToday we're going to cover three things.\n\nFirst — the setup.\nSecond — the demo.\nThird — what I'd do differently.\n\nLet's get into it.");
      body.innerHTML += `
        <div class="t-card"><textarea id="pr-text" rows="6" style="width:100%;background:#2c2c34;border:none;border-radius:10px;color:var(--text);font:inherit;padding:10px">${esc(saved)}</textarea></div>
        <label class="slider-row">Speed <input type="range" id="pr-speed" min="10" max="80" value="30"></label>
        <div class="chip-row"><button class="chip" id="pr-mirror">Mirror</button><button class="chip" id="pr-size">Bigger text</button></div>
        <button class="big-btn" id="pr-go">Start prompting</button>
        <div id="pr-full" style="display:none;position:fixed;inset:0;background:#000;z-index:70;overflow:hidden">
          <div id="pr-scroll" style="position:absolute;left:6%;right:6%;color:#fff;font-size:34px;font-weight:700;line-height:1.5;white-space:pre-wrap;text-align:center"></div>
          <div style="position:absolute;top:0;left:0;right:0;height:14%;background:linear-gradient(#000,transparent)"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;height:14%;background:linear-gradient(transparent,#000)"></div>
          <div style="position:absolute;top:44%;left:0;width:14px;height:3px;background:#ff453a"></div>
        </div>`;
      const full = body.querySelector("#pr-full"), scroll = body.querySelector("#pr-scroll");
      let raf = null, y = 0, paused = false, mirror = false, big = false;
      body.querySelector("#pr-mirror").addEventListener("click", (e) => { mirror = !mirror; e.target.classList.toggle("active", mirror); });
      body.querySelector("#pr-size").addEventListener("click", (e) => { big = !big; e.target.classList.toggle("active", big); });
      body.querySelector("#pr-go").addEventListener("click", () => {
        store.set("prompterText", body.querySelector("#pr-text").value);
        scroll.textContent = body.querySelector("#pr-text").value;
        scroll.style.fontSize = big ? "46px" : "34px";
        full.style.transform = mirror ? "scaleX(-1)" : "none";
        full.style.display = "block";
        y = window.innerHeight * 0.8;
        paused = false;
        (function anim() {
          if (!paused) {
            y -= (+body.querySelector("#pr-speed").value) / 30;
            scroll.style.top = y + "px";
            if (y < -scroll.offsetHeight) y = window.innerHeight * 0.8;
          }
          raf = requestAnimationFrame(anim);
        })();
      });
      full.addEventListener("click", () => { paused = !paused; });
      full.addEventListener("dblclick", () => { full.style.display = "none"; cancelAnimationFrame(raf); });
      body.appendChild(el("p", "dyn-note", "Tap to pause · double-tap to exit"));
      def.exit = () => { full.style.display = "none"; cancelAnimationFrame(raf); };
    },
  });

  /* ================= Speaker Cue Timer ================= */
  register({
    id: "cuetimer", name: "Cue Timer", icon: "🚦", cat: "Display", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#56ccf2,#2f80ed)", keywords: "speaker talk presentation traffic light",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card t-rows">
          <div class="t-row"><label>Talk minutes</label><input type="text" inputmode="numeric" id="cu-min" value="5"></div>
          <div class="t-row"><label>Warn at min left</label><input type="text" inputmode="numeric" id="cu-warn" value="1"></div>
        </div>
        <div class="t-big-display" id="cu-stage" style="border-radius:18px;min-height:240px;background:var(--card)">
          <div class="huge" id="cu-time">5:00</div>
          <div class="dyn-note">visible from the back row</div>
        </div>
        <button class="big-btn" id="cu-go">Start</button>`;
      const stage = body.querySelector("#cu-stage"), timeEl = body.querySelector("#cu-time");
      let endAt = 0, timer = null;
      function tick() {
        const left = (endAt - Date.now()) / 1000;
        timeEl.textContent = left <= 0 ? "TIME" : mmss(Math.ceil(left));
        const warn = (parseFloat(body.querySelector("#cu-warn").value) || 1) * 60;
        stage.style.background = left <= 0 ? "#8a1f16" : left <= warn ? "#8a6d00" : "#0f3d22";
        if (left <= 0 && timer) { beep(500, 0.5); clearInterval(timer); timer = null; body.querySelector("#cu-go").textContent = "Start"; }
      }
      body.querySelector("#cu-go").addEventListener("click", (e) => {
        if (timer) { clearInterval(timer); timer = null; e.target.textContent = "Start"; stage.style.background = "var(--card)"; return; }
        endAt = Date.now() + (parseFloat(body.querySelector("#cu-min").value) || 5) * 60000;
        timer = setInterval(tick, 300);
        e.target.textContent = "Stop";
        tick();
      });
      def.exit = () => { clearInterval(timer); timer = null; stage.style.background = "var(--card)"; };
    },
  });
})();
