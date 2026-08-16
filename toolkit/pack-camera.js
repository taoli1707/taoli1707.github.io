/* Pack: camera & vision tools */
"use strict";
(() => {
  const { register, el, esc, fmt, store } = TK;

  function camStart(video, facing) {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing || "environment", width: { ideal: 1280 } },
      audio: false,
    }).then((stream) => { video.srcObject = stream; return stream; });
  }
  function camStop(video, streamRef) {
    if (streamRef.s) { streamRef.s.getTracks().forEach((t) => t.stop()); streamRef.s = null; }
    video.srcObject = null;
  }
  const videoCss = "flex:1;min-height:300px;border-radius:16px;object-fit:cover;background:#000;width:100%";

  /* ================= Color-Blind Lens ================= */
  register({
    id: "cblens", name: "Color-Blind Lens", icon: "👁️", cat: "Camera", mode: "live",
    grad: "linear-gradient(135deg,#654ea3,#eaafc8)", keywords: "colorblind deuteranopia protanopia simulate accessibility",
    render(body, def) {
      body.innerHTML += `
        <svg width="0" height="0" style="position:absolute">
          <filter id="flt-deut"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/></filter>
          <filter id="flt-prot"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/></filter>
          <filter id="flt-trit"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/></filter>
          <filter id="flt-mono"><feColorMatrix type="saturate" values="0"/></filter>
        </svg>
        <video id="cb-video" autoplay playsinline muted style="${videoCss}"></video>
        <div class="chip-row" id="cb-modes">
          <button class="chip active" data-f="none">Normal</button>
          <button class="chip" data-f="flt-deut">Deutan</button>
          <button class="chip" data-f="flt-prot">Protan</button>
          <button class="chip" data-f="flt-trit">Tritan</button>
          <button class="chip" data-f="flt-mono">Mono</button>
        </div>
        <p class="dyn-note" id="cb-sub">See the world as different color vision types do</p>`;
      const video = body.querySelector("#cb-video");
      const ref = { s: null };
      body.querySelector("#cb-modes").addEventListener("click", (e) => {
        const b = e.target.closest("[data-f]"); if (!b) return;
        body.querySelectorAll("#cb-modes .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active");
        video.style.filter = b.dataset.f === "none" ? "" : `url(#${b.dataset.f})`;
      });
      def.enter = () => {
        camStart(video).then((s) => { ref.s = s; })
          .catch(() => { body.querySelector("#cb-sub").textContent = "Camera unavailable — allow camera access."; });
      };
      def.exit = () => camStop(video, ref);
    },
  });

  /* ================= Photo Protractor ================= */
  register({
    id: "photoangle", name: "Photo Angle", icon: "📸", cat: "Camera", mode: "live",
    grad: "linear-gradient(135deg,#136a8a,#8360c3)", keywords: "measure angle picture image guides",
    note: "Load a photo, then drag the three dots — the angle at the middle dot is measured.",
    render(body, def) {
      body.innerHTML += `
        <input type="file" id="pa-file" accept="image/*" class="hidden">
        <div id="pa-stage" style="flex:1;min-height:320px;border-radius:16px;background:var(--card);position:relative;overflow:hidden;touch-action:none">
          <img id="pa-img" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:none">
          <svg id="pa-svg" style="position:absolute;inset:0;width:100%;height:100%"></svg>
        </div>
        <div class="t-result"><div class="big" id="pa-out">—</div></div>
        <button class="big-btn" id="pa-load">Choose photo</button>`;
      const stage = body.querySelector("#pa-stage"), svg = body.querySelector("#pa-svg"), out = body.querySelector("#pa-out");
      let pts = [[0.2, 0.7], [0.5, 0.35], [0.8, 0.7]];
      let dragging = -1;
      function draw() {
        const w = stage.clientWidth, h = stage.clientHeight;
        const P = pts.map(([x, y]) => [x * w, y * h]);
        svg.innerHTML =
          `<line x1="${P[1][0]}" y1="${P[1][1]}" x2="${P[0][0]}" y2="${P[0][1]}" stroke="#0a84ff" stroke-width="3"/>` +
          `<line x1="${P[1][0]}" y1="${P[1][1]}" x2="${P[2][0]}" y2="${P[2][1]}" stroke="#ff9f1a" stroke-width="3"/>` +
          P.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="14" fill="${i === 1 ? "#ff453a" : "#fff"}" opacity="0.85"/>`).join("");
        const a1 = Math.atan2(P[0][1] - P[1][1], P[0][0] - P[1][0]);
        const a2 = Math.atan2(P[2][1] - P[1][1], P[2][0] - P[1][0]);
        let deg = Math.abs((a1 - a2) * 180 / Math.PI);
        if (deg > 180) deg = 360 - deg;
        out.textContent = deg.toFixed(1) + "°";
      }
      stage.addEventListener("pointerdown", (e) => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        let best = 0.06, bi = -1;
        pts.forEach(([px, py], i) => {
          const d = Math.hypot(px - x, py - y);
          if (d < best) { best = d; bi = i; }
        });
        dragging = bi;
        stage.setPointerCapture(e.pointerId);
      });
      stage.addEventListener("pointermove", (e) => {
        if (dragging < 0) return;
        const r = stage.getBoundingClientRect();
        pts[dragging] = [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
        draw();
      });
      stage.addEventListener("pointerup", () => { dragging = -1; });
      body.querySelector("#pa-load").addEventListener("click", () => body.querySelector("#pa-file").click());
      body.querySelector("#pa-file").addEventListener("change", (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const img = body.querySelector("#pa-img");
        img.src = URL.createObjectURL(f);
        img.style.display = "block";
      });
      def.enter = () => setTimeout(draw, 60);
    },
  });

  /* ================= Doc Snap ================= */
  register({
    id: "docsnap", name: "Doc Snap", icon: "📄", cat: "Camera", mode: "live",
    grad: "linear-gradient(135deg,#8e9eab,#eef2f3)", keywords: "document scan page capture contrast",
    note: "Captures a page with document-style contrast boost. Multi-page PDF export needs the native app.",
    render(body, def) {
      body.innerHTML += `
        <video id="ds-video" autoplay playsinline muted style="${videoCss}"></video>
        <canvas id="ds-out" class="hidden" style="${videoCss}"></canvas>
        <div class="chip-row">
          <button class="chip active" id="ds-shoot">📸 Capture</button>
          <button class="chip" id="ds-boost">Doc contrast</button>
          <button class="chip hidden" id="ds-back">↩ Retake</button>
        </div>
        <p class="dyn-note" id="ds-sub">Fill the frame with the page</p>`;
      const video = body.querySelector("#ds-video"), canvas = body.querySelector("#ds-out");
      const ref = { s: null };
      let boost = false, frozen = false;
      function capture() {
        if (!video.videoWidth) return;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const c = canvas.getContext("2d");
        if (boost) c.filter = "grayscale(1) contrast(1.9) brightness(1.15)";
        c.drawImage(video, 0, 0);
        canvas.classList.remove("hidden");
        video.classList.add("hidden");
        frozen = true;
        body.querySelector("#ds-back").classList.remove("hidden");
        body.querySelector("#ds-sub").textContent = "Long-press the image to save/share it";
      }
      body.querySelector("#ds-shoot").addEventListener("click", () => { if (!frozen) capture(); });
      body.querySelector("#ds-boost").addEventListener("click", (e) => { boost = !boost; e.target.classList.toggle("active", boost); });
      body.querySelector("#ds-back").addEventListener("click", (e) => {
        frozen = false;
        canvas.classList.add("hidden");
        video.classList.remove("hidden");
        e.target.classList.add("hidden");
      });
      def.enter = () => {
        camStart(video).then((s) => { ref.s = s; })
          .catch(() => { body.querySelector("#ds-sub").textContent = "Camera unavailable."; });
      };
      def.exit = () => { camStop(video, ref); };
    },
  });

  /* ================= Barcode Scanner ================= */
  register({
    id: "barcode", name: "Barcodes", icon: "🏷️", cat: "Camera", mode: "live",
    grad: "linear-gradient(135deg,#c33764,#1d2671)", keywords: "upc ean product scan",
    note: "Reads all barcode formats where the browser has BarcodeDetector; QR everywhere.",
    render(body, def) {
      body.innerHTML += `
        <video id="bc-video" autoplay playsinline muted style="${videoCss}"></video>
        <div class="t-result"><div class="big" id="bc-out" style="font-size:20px;overflow-wrap:anywhere">—</div><div class="sub" id="bc-fmt"></div></div>`;
      const video = body.querySelector("#bc-video"), out = body.querySelector("#bc-out"), fmtEl = body.querySelector("#bc-fmt");
      const ref = { s: null };
      let timer = null, detector = null;
      if ("BarcodeDetector" in window) {
        try { detector = new BarcodeDetector(); } catch (e) { detector = null; }
      }
      const work = document.createElement("canvas");
      async function scan() {
        if (!video.videoWidth) return;
        try {
          if (detector) {
            const codes = await detector.detect(video);
            if (codes.length) { out.textContent = codes[0].rawValue; fmtEl.textContent = codes[0].format; if (navigator.vibrate) navigator.vibrate(50); }
          } else if (typeof jsQR === "function") {
            const scale = Math.min(1, 640 / video.videoWidth);
            work.width = video.videoWidth * scale; work.height = video.videoHeight * scale;
            const c = work.getContext("2d", { willReadFrequently: true });
            c.drawImage(video, 0, 0, work.width, work.height);
            const d = c.getImageData(0, 0, work.width, work.height);
            const code = jsQR(d.data, d.width, d.height);
            if (code && code.data) { out.textContent = code.data; fmtEl.textContent = "qr_code (QR-only fallback)"; }
          }
        } catch (e) {}
      }
      def.enter = () => {
        camStart(video).then((s) => { ref.s = s; timer = setInterval(scan, 350); })
          .catch(() => { out.textContent = "Camera unavailable"; });
      };
      def.exit = () => { clearInterval(timer); camStop(video, ref); };
    },
  });

  /* ================= Speed Gun (slow-mo frame stepper) ================= */
  register({
    id: "speedgun", name: "Speed Gun", icon: "⚾", cat: "Camera", mode: "live",
    grad: "linear-gradient(135deg,#396afc,#2948ff)", keywords: "pitch ball velocity slow motion video frames",
    note: "Record a slow-mo video passing two known points, load it, and mark the two crossing moments.",
    render(body) {
      body.innerHTML += `
        <input type="file" id="sg-file" accept="video/*" class="hidden">
        <video id="sg-video" playsinline muted style="${videoCss}"></video>
        <div class="t-card t-rows">
          <div class="t-row"><label>Distance between marks m</label><input type="text" inputmode="decimal" id="sg-dist" value="5"></div>
        </div>
        <div class="chip-row">
          <button class="chip" data-step="-0.033">−1 fr</button>
          <button class="chip" data-step="0.033">+1 fr</button>
          <button class="chip active" id="sg-a">Mark A</button>
          <button class="chip" id="sg-b">Mark B</button>
        </div>
        <div class="t-result"><div class="big" id="sg-out">—</div><div class="sub" id="sg-sub">load a video to begin</div></div>
        <button class="big-btn" id="sg-load">Choose video</button>`;
      const video = body.querySelector("#sg-video");
      let tA = null, tB = null;
      body.querySelector("#sg-load").addEventListener("click", () => body.querySelector("#sg-file").click());
      body.querySelector("#sg-file").addEventListener("change", (e) => {
        const f = e.target.files[0];
        if (f) { video.src = URL.createObjectURL(f); video.pause(); body.querySelector("#sg-sub").textContent = "step frames, mark A then B"; }
      });
      body.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
        video.currentTime = Math.max(0, video.currentTime + parseFloat(b.dataset.step));
      }));
      function compute() {
        if (tA === null || tB === null) return;
        const dt = Math.abs(tB - tA);
        const d = parseFloat(body.querySelector("#sg-dist").value) || 0;
        if (!dt || !d) return;
        const ms = d / dt;
        body.querySelector("#sg-out").textContent = (ms * 3.6).toFixed(1) + " km/h";
        body.querySelector("#sg-sub").textContent = `${(ms * 2.23694).toFixed(1)} mph · ${dt.toFixed(3)} s over ${d} m (slow-mo: times scale with playback rate)`;
      }
      body.querySelector("#sg-a").addEventListener("click", () => { tA = video.currentTime; compute(); });
      body.querySelector("#sg-b").addEventListener("click", () => { tB = video.currentTime; compute(); });
    },
  });

  /* ================= Image Converter ================= */
  register({
    id: "imgconvert", name: "Image Convert", icon: "🖼️", cat: "Documents", mode: "live",
    grad: "linear-gradient(135deg,#6e7dd1,#8360c3)", keywords: "heic jpg png webp exif strip resize",
    note: "Re-encodes on-device — metadata (EXIF/GPS) is stripped automatically. HEIC input works on Safari.",
    render(body, def) {
      body.innerHTML += `
        <input type="file" id="ic-file" accept="image/*" multiple class="hidden">
        <div class="chip-row" id="ic-fmt">
          <button class="chip active" data-f="image/jpeg" data-x="jpg">JPG</button>
          <button class="chip" data-f="image/png" data-x="png">PNG</button>
          <button class="chip" data-f="image/webp" data-x="webp">WebP</button>
        </div>
        <button class="big-btn" id="ic-pick">Choose photos</button>
        <div class="t-list" id="ic-list"></div>`;
      const list = body.querySelector("#ic-list");
      let mime = "image/jpeg", ext = "jpg";
      body.querySelector("#ic-fmt").addEventListener("click", (e) => {
        const b = e.target.closest("[data-f]"); if (!b) return;
        body.querySelectorAll("#ic-fmt .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active"); mime = b.dataset.f; ext = b.dataset.x;
      });
      body.querySelector("#ic-pick").addEventListener("click", () => body.querySelector("#ic-file").click());
      body.querySelector("#ic-file").addEventListener("change", async (e) => {
        for (const f of e.target.files) {
          const li = el("div", "t-li", `<div class="li-main"><strong>${esc(f.name)}</strong><span>converting…</span></div>`);
          list.prepend(li);
          try {
            const img = new Image();
            const url = URL.createObjectURL(f);
            await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            canvas.getContext("2d").drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.9));
            const outName = f.name.replace(/\.[^.]+$/, "") + "." + ext;
            const outUrl = URL.createObjectURL(blob);
            li.querySelector("span").innerHTML = `✓ EXIF stripped · ${(blob.size / 1024).toFixed(0)} KB`;
            const a = el("a", "chip", "Save");
            a.href = outUrl; a.download = outName; a.style.textDecoration = "none";
            li.appendChild(a);
          } catch (err) {
            li.querySelector("span").textContent = "couldn't decode this format here";
          }
        }
        e.target.value = "";
      });
    },
  });

  /* ================= Text Grabber (OCR) ================= */
  register({
    id: "ocr", name: "Text Grabber", icon: "🔤", cat: "Camera",
    mode: ("TextDetector" in window) ? "live" : "sim",
    grad: "linear-gradient(135deg,#4568dc,#b06ab3)", keywords: "ocr copy read scan text",
    note: ("TextDetector" in window)
      ? "Point at text and capture to extract it."
      : "No browser OCR API here — this shows the flow; real extraction uses the native Vision framework (or iOS's built-in Live Text in the camera).",
    render(body, def) {
      body.innerHTML += `
        <video id="oc-video" autoplay playsinline muted style="${videoCss}"></video>
        <button class="big-btn" id="oc-shoot">Capture text</button>
        <div class="t-result"><div class="big" id="oc-out" style="font-size:16px;text-align:left;white-space:pre-wrap">—</div></div>`;
      const video = body.querySelector("#oc-video"), out = body.querySelector("#oc-out");
      const ref = { s: null };
      body.querySelector("#oc-shoot").addEventListener("click", async () => {
        if ("TextDetector" in window) {
          try {
            const det = new TextDetector();
            const found = await det.detect(video);
            out.textContent = found.map((t) => t.rawValue).join("\n") || "No text found — get closer";
          } catch (e) { out.textContent = "Detection failed: " + e.message; }
        } else {
          out.textContent = "[Simulated result]\nOn a native build this frame would OCR via Vision:\n“Gate 4 boarding begins at 5:40 PM”";
        }
      });
      def.enter = () => {
        camStart(video).then((s) => { ref.s = s; }).catch(() => { out.textContent = "Camera unavailable."; });
      };
      def.exit = () => camStop(video, ref);
    },
  });

  /* ================= Heart Rate (simulated) ================= */
  register({
    id: "heart", name: "Heart Rate", icon: "❤️", cat: "Health", mode: "sim",
    grad: "linear-gradient(135deg,#ed213a,#93291e)", keywords: "pulse bpm ppg finger",
    note: "Real finger-PPG needs torch control (native only). This simulates the measuring flow.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:260px">
          <div style="font-size:64px" id="hr-icon">🫀</div>
          <div class="huge"><span id="hr-bpm">—</span><small> bpm</small></div>
          <div class="dyn-note" id="hr-sub">place a finger over the rear camera and lens (simulated)</div>
        </div>
        <button class="big-btn" id="hr-go">Start measuring</button>`;
      let iv = null, t = 0, target = 0;
      const bpmEl = body.querySelector("#hr-bpm"), icon = body.querySelector("#hr-icon"), sub = body.querySelector("#hr-sub");
      body.querySelector("#hr-go").addEventListener("click", (e) => {
        if (iv) { clearInterval(iv); iv = null; e.target.textContent = "Start measuring"; return; }
        t = 0;
        const buf = new Uint32Array(1); crypto.getRandomValues(buf);
        target = 62 + buf[0] % 26;
        e.target.textContent = "Stop";
        sub.textContent = "hold still… reading pulse";
        iv = setInterval(() => {
          t++;
          icon.style.transform = t % 2 ? "scale(1.15)" : "scale(1)";
          if (t < 8) bpmEl.textContent = "…";
          else bpmEl.textContent = target + Math.round(Math.sin(t / 3) * 2);
          if (t === 8) sub.textContent = "simulated reading — native app reads real blood-flow flicker";
        }, 500);
      });
      def.exit = () => { clearInterval(iv); iv = null; };
    },
  });
})();
