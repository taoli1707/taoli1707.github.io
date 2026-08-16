/* Pack: audio tools — tuner, spectrum, hearing, recorder, dose, speech */
"use strict";
(() => {
  const { register, el, esc, fmt, store } = TK;
  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  function micStart(onCtx) {
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    }).then((stream) => {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      ac.resume();
      const src = ac.createMediaStreamSource(stream);
      onCtx(ac, src, stream);
      return stream;
    });
  }

  /* ================= Instrument Tuner ================= */
  register({
    id: "tuner", name: "Tuner", icon: "🎸", cat: "Sound & Music", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#11998e,#38ef7d)", keywords: "pitch guitar violin chromatic cents",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:260px">
          <div class="huge" id="tu-note" style="font-size:84px">—</div>
          <div style="width:82%;height:52px;position:relative">
            <div style="position:absolute;left:50%;top:0;bottom:14px;width:2px;background:#30d158"></div>
            <div id="tu-needle" style="position:absolute;left:50%;top:4px;width:4px;height:26px;border-radius:2px;background:#f2f2f7;transition:transform 0.1s"></div>
            <div style="position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;font-size:10px;color:var(--muted)"><span>-50¢</span><span>0</span><span>+50¢</span></div>
          </div>
          <div class="dyn-note" id="tu-sub">allow microphone access</div>
        </div>`;
      const noteEl = body.querySelector("#tu-note"), needle = body.querySelector("#tu-needle"), sub = body.querySelector("#tu-sub");
      let ac = null, analyser = null, stream = null, raf = null, buf = null;
      function autoCorrelate(data, rate) {
        // trim silence
        let rms = 0;
        for (let i = 0; i < data.length; i++) rms += data[i] * data[i];
        rms = Math.sqrt(rms / data.length);
        if (rms < 0.008) return -1;
        const SIZE = data.length;
        const c = new Float32Array(SIZE);
        for (let lag = 0; lag < SIZE; lag++) {
          let sum = 0;
          for (let i = 0; i < SIZE - lag; i++) sum += data[i] * data[i + lag];
          c[lag] = sum;
        }
        let d = 0;
        while (d < SIZE - 1 && c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < SIZE; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
        if (maxpos <= 0) return -1;
        // parabolic interpolation
        const x1 = c[maxpos - 1] || 0, x2 = c[maxpos], x3 = c[maxpos + 1] || 0;
        const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
        const shift = a ? -b / (2 * a) : 0;
        return rate / (maxpos + shift);
      }
      function loop() {
        analyser.getFloatTimeDomainData(buf);
        const f = autoCorrelate(buf, ac.sampleRate);
        if (f > 50 && f < 2000) {
          const n = Math.round(12 * Math.log2(f / 440)) + 57;
          const target = 440 * Math.pow(2, (n - 57) / 12);
          const cents = Math.round(1200 * Math.log2(f / target));
          noteEl.textContent = NOTES[((n % 12) + 12) % 12] + Math.floor(n / 12);
          noteEl.style.color = Math.abs(cents) < 5 ? "#30d158" : "#f2f2f7";
          needle.style.transform = `translateX(${Math.max(-50, Math.min(50, cents)) / 50 * 41}vw) `;
          needle.style.left = "calc(50% - 2px)";
          needle.style.transform = `translateX(${Math.max(-50, Math.min(50, cents)) * 0.82 * (body.clientWidth * 0.82 / 2) / 50}px)`;
          sub.textContent = `${f.toFixed(1)} Hz · ${cents > 0 ? "+" : ""}${cents} cents`;
        }
        raf = requestAnimationFrame(loop);
      }
      def.enter = () => {
        micStart((a, src, s) => {
          ac = a; stream = s;
          analyser = ac.createAnalyser();
          analyser.fftSize = 2048;
          buf = new Float32Array(analyser.fftSize);
          src.connect(analyser);
          sub.textContent = "play a note…";
          loop();
        }).catch(() => { sub.textContent = "Microphone unavailable — allow mic access to tune."; });
      };
      def.exit = () => {
        cancelAnimationFrame(raf);
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
        noteEl.textContent = "—";
      };
    },
  });

  /* ================= Spectrum Analyzer ================= */
  register({
    id: "spectrum", name: "Spectrum", icon: "🌊", cat: "Sound & Music", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#00c6ff,#0072ff)", keywords: "fft frequency analyzer rta audio",
    render(body, def) {
      body.innerHTML += `
        <canvas id="sp-canvas" style="flex:1;min-height:300px;border-radius:16px;background:#14141a;width:100%"></canvas>
        <div class="dyn-note" id="sp-sub">allow microphone access</div>`;
      const canvas = body.querySelector("#sp-canvas"), sub = body.querySelector("#sp-sub");
      let ac = null, analyser = null, stream = null, raf = null, data = null;
      function loop() {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
        const c = canvas.getContext("2d");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        analyser.getByteFrequencyData(data);
        c.clearRect(0, 0, w, h);
        const bars = 64;
        let peakI = 0, peakV = 0;
        for (let b = 0; b < bars; b++) {
          // log-spaced bins
          const i0 = Math.floor(Math.pow(data.length, b / bars));
          const i1 = Math.max(i0 + 1, Math.floor(Math.pow(data.length, (b + 1) / bars)));
          let v = 0;
          for (let i = i0; i < i1; i++) v = Math.max(v, data[i]);
          if (v > peakV) { peakV = v; peakI = i0; }
          const bh = v / 255 * (h - 8);
          const hue = 200 - v / 255 * 160;
          c.fillStyle = `hsl(${hue} 80% 55%)`;
          c.beginPath();
          c.roundRect(b * (w / bars) + 1, h - bh, w / bars - 2, bh, 2);
          c.fill();
        }
        const peakHz = peakI * ac.sampleRate / analyser.fftSize;
        sub.textContent = peakV > 30 ? `peak ${peakHz < 1000 ? Math.round(peakHz) + " Hz" : (peakHz / 1000).toFixed(1) + " kHz"}` : "listening…";
        raf = requestAnimationFrame(loop);
      }
      def.enter = () => {
        micStart((a, src, s) => {
          ac = a; stream = s;
          analyser = ac.createAnalyser();
          analyser.fftSize = 4096;
          analyser.smoothingTimeConstant = 0.7;
          data = new Uint8Array(analyser.frequencyBinCount);
          src.connect(analyser);
          loop();
        }).catch(() => { sub.textContent = "Microphone unavailable."; });
      };
      def.exit = () => {
        cancelAnimationFrame(raf);
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
      };
    },
  });

  /* ================= Hearing Test ================= */
  register({
    id: "hearing", name: "Hearing Test", icon: "👂", cat: "Sound & Music", mode: "live",
    grad: "linear-gradient(135deg,#7f00ff,#e100ff)", keywords: "frequency sweep ear age khz",
    note: "Fun screening, not a medical test. Use headphones at a comfortable volume.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:220px">
          <div class="huge"><span id="he-freq">—</span><small> kHz</small></div>
          <div class="dyn-note" id="he-sub">sweep rises from 8 kHz — tap stop when the sound disappears</div>
        </div>
        <button class="big-btn" id="he-go">Start sweep</button>
        <div class="t-result hidden" id="he-result"><div class="big" id="he-limit">—</div><div class="sub" id="he-age"></div></div>`;
      let ac = null, osc = null, gain = null, raf = null, f = 8000, t0 = 0;
      const freqEl = body.querySelector("#he-freq");
      function stopTone() {
        cancelAnimationFrame(raf);
        if (osc) { try { osc.stop(); } catch (e) {} osc = null; }
      }
      body.querySelector("#he-go").addEventListener("click", (e) => {
        if (osc) {
          // user says "can't hear it anymore" — record limit
          stopTone();
          const khz = f / 1000;
          body.querySelector("#he-result").classList.remove("hidden");
          body.querySelector("#he-limit").textContent = khz.toFixed(1) + " kHz";
          const age = khz >= 17.5 ? "under 20" : khz >= 16.5 ? "~20s" : khz >= 15 ? "~30s" : khz >= 13.5 ? "~40s" : khz >= 12 ? "~50s" : "60+";
          body.querySelector("#he-age").textContent = `typical of hearing age ${age} · phone speakers roll off above ~17 kHz`;
          e.target.textContent = "Start sweep";
          return;
        }
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        ac.resume();
        osc = ac.createOscillator(); gain = ac.createGain();
        gain.gain.value = 0.25;
        osc.connect(gain).connect(ac.destination);
        f = 8000; osc.frequency.value = f;
        osc.start();
        t0 = performance.now();
        e.target.textContent = "I can't hear it — stop";
        (function sweep() {
          const t = (performance.now() - t0) / 1000;
          f = 8000 * Math.pow(20000 / 8000, Math.min(1, t / 25)); // 25s sweep 8k→20k
          osc.frequency.setTargetAtTime(f, ac.currentTime, 0.02);
          freqEl.textContent = (f / 1000).toFixed(1);
          if (t < 25.5) raf = requestAnimationFrame(sweep);
          else body.querySelector("#he-go").click();
        })();
      });
      def.exit = () => { stopTone(); body.querySelector("#he-go").textContent = "Start sweep"; };
    },
  });

  /* ================= Voice Recorder ================= */
  register({
    id: "recorder", name: "Voice Memo", icon: "🎙️", cat: "Sound & Music", mode: "live",
    grad: "linear-gradient(135deg,#606c88,#b06ab3)", keywords: "record audio memo playback",
    note: "Recordings stay in this session — play back or download before closing.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:150px">
          <div class="huge" id="re-time" style="font-size:48px">0:00</div>
          <div class="dyn-note" id="re-sub">tap record to start</div>
        </div>
        <button class="big-btn" id="re-go" style="background:#3d1412;color:#ff453a">● Record</button>
        <div class="t-list" id="re-list"></div>`;
      let rec = null, stream = null, chunks = [], t0 = 0, iv = null, count = 0;
      const timeEl = body.querySelector("#re-time"), sub = body.querySelector("#re-sub"), list = body.querySelector("#re-list");
      body.querySelector("#re-go").addEventListener("click", async (e) => {
        if (rec && rec.state === "recording") {
          rec.stop();
          e.target.textContent = "● Record";
          clearInterval(iv);
          return;
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          rec = new MediaRecorder(stream);
          chunks = [];
          rec.ondataavailable = (ev) => chunks.push(ev.data);
          rec.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
            const url = URL.createObjectURL(blob);
            count++;
            const li = el("div", "t-li",
              `<div class="li-main"><strong>Memo ${count}</strong><span>${timeEl.textContent} · ${(blob.size / 1024).toFixed(0)} KB</span></div>`);
            const audio = el("audio");
            audio.controls = true;
            audio.src = url;
            audio.style.cssText = "height:32px;max-width:170px";
            li.insertBefore(audio, null);
            list.prepend(li);
            sub.textContent = "saved below";
          };
          rec.start();
          t0 = Date.now();
          iv = setInterval(() => {
            const s = Math.floor((Date.now() - t0) / 1000);
            timeEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
          }, 250);
          e.target.textContent = "■ Stop";
          sub.textContent = "recording…";
        } catch (err) {
          sub.textContent = "Microphone unavailable — allow mic access.";
        }
      });
      def.exit = () => {
        if (rec && rec.state === "recording") rec.stop();
        clearInterval(iv);
      };
    },
  });

  /* ================= Noise Dose ================= */
  register({
    id: "dose", name: "Noise Dose", icon: "🔔", cat: "Sound & Music", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#f83600,#fe8c00)", keywords: "exposure loud hearing safety niosh",
    note: "Approximate NIOSH-style daily dose from the mic while this tool is open.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:200px">
          <div class="huge"><span id="do-pct">0</span><small> % dose</small></div>
          <div class="meter-track" style="width:80%;height:10px;border-radius:5px;background:#2c2c34;overflow:hidden"><div id="do-bar" style="height:100%;background:linear-gradient(90deg,#30d158,#ffd60a,#ff453a);border-radius:5px;width:0%"></div></div>
          <div class="dyn-note" id="do-sub">current — dB · measuring while open</div>
        </div>
        <button class="big-btn" id="do-reset" style="background:#2c2c34">Reset dose</button>`;
      let ac = null, analyser = null, stream = null, raf = null, buf = null;
      let dose = store.get("noiseDose", 0), lastT = 0;
      const pctEl = body.querySelector("#do-pct"), bar = body.querySelector("#do-bar"), sub = body.querySelector("#do-sub");
      function loop(now) {
        analyser.getFloatTimeDomainData(buf);
        let s = 0;
        for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        const db = Math.max(0, 20 * Math.log10(Math.sqrt(s / buf.length) || 1e-7) + 94);
        if (lastT) {
          const dt = (now - lastT) / 1000;
          // NIOSH: 100% dose = 8h @ 85 dB, 3 dB exchange rate
          if (db > 75) dose += dt / (8 * 3600 / Math.pow(2, (db - 85) / 3)) * 100;
        }
        lastT = now;
        pctEl.textContent = dose.toFixed(dose < 10 ? 1 : 0);
        bar.style.width = Math.min(100, dose) + "%";
        sub.textContent = `current ${Math.round(db)} dB · ${dose >= 100 ? "daily limit reached — give your ears a rest" : "100% = 8h at 85 dB"}`;
        store.set("noiseDose", dose);
        raf = requestAnimationFrame(loop);
      }
      body.querySelector("#do-reset").addEventListener("click", () => { dose = 0; store.set("noiseDose", 0); });
      def.enter = () => {
        lastT = 0;
        micStart((a, src, s) => {
          ac = a; stream = s;
          analyser = ac.createAnalyser();
          analyser.fftSize = 2048;
          buf = new Float32Array(analyser.fftSize);
          src.connect(analyser);
          raf = requestAnimationFrame(loop);
        }).catch(() => { sub.textContent = "Microphone unavailable."; });
      };
      def.exit = () => {
        cancelAnimationFrame(raf);
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
      };
    },
  });

  /* ================= Speak (TTS) ================= */
  register({
    id: "speak", name: "Read Aloud", icon: "🗣️", cat: "Sound & Music", mode: "live",
    grad: "linear-gradient(135deg,#00b09b,#96c93d)", keywords: "text to speech tts voice",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card"><textarea id="tt-text" rows="4" style="width:100%;background:#2c2c34;border:none;border-radius:10px;color:var(--text);font:inherit;padding:10px" placeholder="Type something to read aloud">The quick brown fox jumps over the lazy dog.</textarea></div>
        <label class="slider-row">Speed <input type="range" id="tt-rate" min="0.5" max="2" step="0.1" value="1"></label>
        <button class="big-btn" id="tt-go">🔊 Speak</button>`;
      body.querySelector("#tt-go").addEventListener("click", (e) => {
        if (speechSynthesis.speaking) { speechSynthesis.cancel(); e.target.textContent = "🔊 Speak"; return; }
        const u = new SpeechSynthesisUtterance(body.querySelector("#tt-text").value);
        u.rate = +body.querySelector("#tt-rate").value;
        u.onend = () => { e.target.textContent = "🔊 Speak"; };
        speechSynthesis.speak(u);
        e.target.textContent = "■ Stop";
      });
      def.exit = () => speechSynthesis.cancel();
    },
  });

  /* ================= Live Captions (STT) ================= */
  register({
    id: "captions", name: "Live Captions", icon: "💬", cat: "Sound & Music", mode: "live",
    grad: "linear-gradient(135deg,#360033,#0b8793)", keywords: "speech to text transcribe accessibility deaf",
    note: "Uses on-device speech recognition where the browser provides it.",
    render(body, def) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      body.innerHTML += `
        <div id="cp-text" style="flex:1;min-height:280px;border-radius:16px;background:var(--card);padding:18px;font-size:26px;font-weight:700;line-height:1.45;overflow-y:auto"></div>
        <button class="big-btn" id="cp-go">Start listening</button>`;
      const textEl = body.querySelector("#cp-text"), btn = body.querySelector("#cp-go");
      if (!SR) {
        textEl.innerHTML = '<span style="color:var(--muted);font-size:16px;font-weight:400">Speech recognition isn\'t available in this browser. On iPhone it works in Safari on recent iOS; otherwise this needs the native Speech framework.</span>';
        btn.disabled = true;
        btn.style.opacity = 0.5;
      } else {
        let rec = null, running = false;
        btn.addEventListener("click", () => {
          if (running) { running = false; rec.stop(); btn.textContent = "Start listening"; return; }
          rec = new SR();
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = (ev) => {
            let final = "", interim = "";
            for (let i = 0; i < ev.results.length; i++) {
              (ev.results[i].isFinal ? (final += ev.results[i][0].transcript + " ") : (interim += ev.results[i][0].transcript));
            }
            textEl.innerHTML = esc(final) + `<span style="color:var(--muted)">${esc(interim)}</span>`;
            textEl.scrollTop = textEl.scrollHeight;
          };
          rec.onend = () => { if (running) try { rec.start(); } catch (e) {} };
          try { rec.start(); running = true; btn.textContent = "■ Stop"; textEl.textContent = ""; }
          catch (e) { textEl.textContent = "Couldn't start recognition."; }
        });
        def.exit = () => { running = false; if (rec) try { rec.stop(); } catch (e) {} };
      }
    },
  });
})();
