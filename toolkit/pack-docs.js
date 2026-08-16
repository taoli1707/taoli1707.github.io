/* Pack: documents & dev tools */
"use strict";
(() => {
  const { register, el, esc, fmt, store } = TK;

  /* ================= QR Maker ================= */
  register({
    id: "qrmaker", name: "QR Maker", icon: "🧾", cat: "Documents", mode: "live",
    grad: "linear-gradient(135deg,#232526,#7a7d81)", keywords: "generate qr wifi url vcard code",
    render(body) {
      body.innerHTML += `
        <div class="chip-row" id="qm-tabs">
          <button class="chip active" data-t="text">Text / URL</button>
          <button class="chip" data-t="wifi">Wi-Fi</button>
          <button class="chip" data-t="vcard">Contact</button>
        </div>
        <div class="t-card t-rows" id="qm-fields"></div>
        <div id="qm-out" style="align-self:center;background:#fff;padding:14px;border-radius:14px;min-width:120px;min-height:120px;display:flex;align-items:center;justify-content:center"></div>
        <p class="dyn-note">long-press the code to save or share it</p>`;
      const fields = body.querySelector("#qm-fields"), out = body.querySelector("#qm-out");
      let tab = "text";
      const FORMS = {
        text: [["v", "Text or URL", "https://taoli1707.github.io/toolkit/"]],
        wifi: [["ssid", "Network", "HomeNet"], ["pass", "Password", ""], ["enc", "Security", "WPA"]],
        vcard: [["name", "Name", ""], ["tel", "Phone", ""], ["email", "Email", ""]],
      };
      function payload(vals) {
        if (tab === "text") return vals.v || "";
        if (tab === "wifi") return `WIFI:T:${vals.enc || "WPA"};S:${vals.ssid || ""};P:${vals.pass || ""};;`;
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vals.name || ""}\nTEL:${vals.tel || ""}\nEMAIL:${vals.email || ""}\nEND:VCARD`;
      }
      function build() {
        fields.innerHTML = "";
        FORMS[tab].forEach(([k, label, def]) => {
          const row = el("div", "t-row");
          row.appendChild(el("label", "", esc(label)));
          const inp = el("input");
          inp.type = "text"; inp.value = def; inp.dataset.k = k; inp.style.width = "62%";
          inp.addEventListener("input", draw);
          row.appendChild(inp);
          fields.appendChild(row);
        });
        draw();
      }
      function draw() {
        const vals = {};
        fields.querySelectorAll("input").forEach((i) => { vals[i.dataset.k] = i.value; });
        const data = payload(vals);
        out.innerHTML = "";
        if (!data) { out.textContent = "…"; return; }
        try {
          const qr = qrcode(0, "M");
          qr.addData(data);
          qr.make();
          out.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2 });
          out.querySelector("svg").style.cssText = "width:220px;height:220px";
        } catch (e) { out.textContent = "too much data"; }
      }
      body.querySelector("#qm-tabs").addEventListener("click", (e) => {
        const b = e.target.closest("[data-t]"); if (!b) return;
        body.querySelectorAll("#qm-tabs .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active"); tab = b.dataset.t; build();
      });
      build();
    },
  });

  /* ================= PDF Tools ================= */
  register({
    id: "pdftools", name: "PDF Tools", icon: "📑", cat: "Documents", mode: "live",
    grad: "linear-gradient(135deg,#514a9d,#24c6dc)", keywords: "merge split sign pages combine",
    note: "Everything runs on-device — files never leave your phone.",
    render(body) {
      body.innerHTML += `
        <div class="chip-row" id="pf-tabs">
          <button class="chip active" data-t="merge">Merge</button>
          <button class="chip" data-t="split">Extract pages</button>
          <button class="chip" data-t="sign">Sign</button>
        </div>
        <input type="file" id="pf-file" accept="application/pdf" multiple class="hidden">
        <div id="pf-merge">
          <button class="big-btn" id="pf-pick-m">Choose PDFs to merge</button>
          <div class="t-list" id="pf-list"></div>
          <button class="big-btn hidden" id="pf-do-merge">Merge ➞ download</button>
        </div>
        <div id="pf-split" class="hidden">
          <button class="big-btn" id="pf-pick-s">Choose a PDF</button>
          <div class="t-card t-rows"><div class="t-row"><label>Pages (e.g. 1-3,5)</label><input type="text" id="pf-range" value="1"></div></div>
          <button class="big-btn hidden" id="pf-do-split">Extract ➞ download</button>
        </div>
        <div id="pf-sign" class="hidden">
          <button class="big-btn" id="pf-pick-g">Choose a PDF</button>
          <p class="dyn-note">Draw your signature:</p>
          <canvas id="pf-sig" width="600" height="200" style="width:100%;height:110px;background:#fff;border-radius:12px;touch-action:none"></canvas>
          <div class="chip-row"><button class="chip" id="pf-sig-clear">Clear</button></div>
          <button class="big-btn hidden" id="pf-do-sign">Stamp on last page ➞ download</button>
        </div>
        <p class="dyn-note" id="pf-status"></p>
        <div id="pf-result"></div>`;
      const status = body.querySelector("#pf-status");
      let files = [], singleFile = null, libLoading = null;
      function lib() {
        if (window.PDFLib) return Promise.resolve();
        if (!libLoading) {
          libLoading = new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "vendor/pdf-lib.min.js";
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
          status.textContent = "loading PDF engine…";
        }
        return libLoading;
      }
      function offerDownload(bytes, name) {
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const res = body.querySelector("#pf-result");
        res.innerHTML = "";
        const a = el("a", "big-btn", `⬇ ${esc(name)} (${(blob.size / 1024).toFixed(0)} KB)`);
        a.href = url; a.download = name; a.style.cssText = "display:block;text-decoration:none;text-align:center";
        res.appendChild(a);
        status.textContent = "done ✓";
      }
      /* tabs */
      body.querySelector("#pf-tabs").addEventListener("click", (e) => {
        const b = e.target.closest("[data-t]"); if (!b) return;
        body.querySelectorAll("#pf-tabs .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active");
        ["merge", "split", "sign"].forEach((t) => body.querySelector("#pf-" + t).classList.toggle("hidden", b.dataset.t !== t));
        body.querySelector("#pf-result").innerHTML = "";
      });
      /* file pick plumbing */
      const fileInput = body.querySelector("#pf-file");
      let pickMode = "m";
      body.querySelector("#pf-pick-m").addEventListener("click", () => { pickMode = "m"; fileInput.multiple = true; fileInput.click(); });
      body.querySelector("#pf-pick-s").addEventListener("click", () => { pickMode = "s"; fileInput.multiple = false; fileInput.click(); });
      body.querySelector("#pf-pick-g").addEventListener("click", () => { pickMode = "g"; fileInput.multiple = false; fileInput.click(); });
      fileInput.addEventListener("change", () => {
        if (pickMode === "m") {
          files = Array.from(fileInput.files);
          const list = body.querySelector("#pf-list");
          list.innerHTML = "";
          files.forEach((f) => list.appendChild(el("div", "t-li", `<div class="li-main"><strong>${esc(f.name)}</strong><span>${(f.size / 1024).toFixed(0)} KB</span></div>`)));
          body.querySelector("#pf-do-merge").classList.toggle("hidden", files.length < 2);
        } else {
          singleFile = fileInput.files[0] || null;
          status.textContent = singleFile ? "loaded " + singleFile.name : "";
          body.querySelector("#pf-do-split").classList.toggle("hidden", !singleFile);
          body.querySelector("#pf-do-sign").classList.toggle("hidden", !singleFile);
        }
        fileInput.value = "";
      });
      /* merge */
      body.querySelector("#pf-do-merge").addEventListener("click", async () => {
        try {
          await lib();
          status.textContent = "merging…";
          const outDoc = await PDFLib.PDFDocument.create();
          for (const f of files) {
            const src = await PDFLib.PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
            const pages = await outDoc.copyPages(src, src.getPageIndices());
            pages.forEach((p) => outDoc.addPage(p));
          }
          offerDownload(await outDoc.save(), "merged.pdf");
        } catch (e) { status.textContent = "merge failed: " + e.message; }
      });
      /* split */
      body.querySelector("#pf-do-split").addEventListener("click", async () => {
        try {
          await lib();
          status.textContent = "extracting…";
          const src = await PDFLib.PDFDocument.load(await singleFile.arrayBuffer(), { ignoreEncryption: true });
          const total = src.getPageCount();
          const wanted = [];
          body.querySelector("#pf-range").value.split(",").forEach((part) => {
            const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
            if (!m) return;
            const a = +m[1], b = m[2] ? +m[2] : a;
            for (let i = a; i <= b; i++) if (i >= 1 && i <= total) wanted.push(i - 1);
          });
          if (!wanted.length) { status.textContent = "no valid pages in range"; return; }
          const outDoc = await PDFLib.PDFDocument.create();
          const pages = await outDoc.copyPages(src, wanted);
          pages.forEach((p) => outDoc.addPage(p));
          offerDownload(await outDoc.save(), "extracted.pdf");
        } catch (e) { status.textContent = "extract failed: " + e.message; }
      });
      /* signature pad */
      const sig = body.querySelector("#pf-sig");
      const sctx = sig.getContext("2d");
      sctx.lineWidth = 4; sctx.lineCap = "round"; sctx.strokeStyle = "#1a2b8f";
      let drawing = false, hasInk = false;
      function pos(e) {
        const r = sig.getBoundingClientRect();
        return [(e.clientX - r.left) / r.width * sig.width, (e.clientY - r.top) / r.height * sig.height];
      }
      sig.addEventListener("pointerdown", (e) => { drawing = true; hasInk = true; sig.setPointerCapture(e.pointerId); const [x, y] = pos(e); sctx.beginPath(); sctx.moveTo(x, y); });
      sig.addEventListener("pointermove", (e) => { if (!drawing) return; const [x, y] = pos(e); sctx.lineTo(x, y); sctx.stroke(); });
      sig.addEventListener("pointerup", () => { drawing = false; });
      body.querySelector("#pf-sig-clear").addEventListener("click", () => { sctx.clearRect(0, 0, sig.width, sig.height); hasInk = false; });
      /* sign */
      body.querySelector("#pf-do-sign").addEventListener("click", async () => {
        if (!hasInk) { status.textContent = "draw a signature first"; return; }
        try {
          await lib();
          status.textContent = "stamping…";
          const src = await PDFLib.PDFDocument.load(await singleFile.arrayBuffer(), { ignoreEncryption: true });
          const png = await src.embedPng(sig.toDataURL("image/png"));
          const page = src.getPage(src.getPageCount() - 1);
          const w = 180, h = w * (png.height / png.width);
          page.drawImage(png, { x: page.getWidth() - w - 40, y: 50, width: w, height: h });
          offerDownload(await src.save(), "signed.pdf");
        } catch (e) { status.textContent = "sign failed: " + e.message; }
      });
    },
  });

  /* ================= Dev Kit ================= */
  register({
    id: "devkit", name: "Dev Kit", icon: "🛠️", cat: "Documents", mode: "live",
    grad: "linear-gradient(135deg,#283048,#859398)", keywords: "json base64 hash uuid regex developer",
    render(body) {
      body.innerHTML += `
        <div class="chip-row" id="dk-tabs">
          <button class="chip active" data-t="json">JSON</button>
          <button class="chip" data-t="b64">Base64</button>
          <button class="chip" data-t="hash">Hash</button>
          <button class="chip" data-t="uuid">UUID</button>
        </div>
        <div class="t-card"><textarea id="dk-in" rows="5" style="width:100%;background:#2c2c34;border:none;border-radius:10px;color:var(--text);font:13px Menlo,monospace;padding:10px" placeholder='{"hello":"world"}'></textarea></div>
        <div class="chip-row" id="dk-actions"></div>
        <div class="t-card"><pre id="dk-out" style="font:12.5px Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--text);min-height:60px"></pre></div>`;
      const input = body.querySelector("#dk-in"), out = body.querySelector("#dk-out"), actions = body.querySelector("#dk-actions");
      const TABS = {
        json: [
          ["Format", (v) => JSON.stringify(JSON.parse(v), null, 2)],
          ["Minify", (v) => JSON.stringify(JSON.parse(v))],
          ["Validate", (v) => { JSON.parse(v); return "✓ valid JSON"; }],
        ],
        b64: [
          ["Encode", (v) => btoa(unescape(encodeURIComponent(v)))],
          ["Decode", (v) => decodeURIComponent(escape(atob(v.trim())))],
        ],
        hash: [
          ["SHA-256", async (v) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)))],
          ["SHA-1", async (v) => hex(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(v)))],
        ],
        uuid: [
          ["Generate v4", () => crypto.randomUUID()],
          ["Generate 5×", () => Array.from({ length: 5 }, () => crypto.randomUUID()).join("\n")],
        ],
      };
      const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      let tab = "json";
      function buildActions() {
        actions.innerHTML = "";
        TABS[tab].forEach(([label, fn]) => {
          const b = el("button", "chip", esc(label));
          b.addEventListener("click", async () => {
            try { out.textContent = await fn(input.value); }
            catch (e) { out.textContent = "✗ " + e.message; }
          });
          actions.appendChild(b);
        });
      }
      body.querySelector("#dk-tabs").addEventListener("click", (e) => {
        const b = e.target.closest("[data-t]"); if (!b) return;
        body.querySelectorAll("#dk-tabs .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active"); tab = b.dataset.t; buildActions(); out.textContent = "";
      });
      buildActions();
    },
  });

  /* ================= Whiteboard ================= */
  register({
    id: "whiteboard", name: "Whiteboard", icon: "✏️", cat: "Documents", mode: "live",
    grad: "linear-gradient(135deg,#fffbd5,#b20a2c)", keywords: "draw sketch notes doodle",
    render(body, def) {
      body.innerHTML += `
        <canvas id="wb-canvas" style="flex:1;min-height:340px;border-radius:16px;background:#fffdf5;touch-action:none;width:100%"></canvas>
        <div class="chip-row" id="wb-colors">
          <button class="chip active" data-c="#1c1c22">Ink</button>
          <button class="chip" data-c="#e33">Red</button>
          <button class="chip" data-c="#36f">Blue</button>
          <button class="chip" data-c="#2a2">Green</button>
          <button class="chip" data-c="#fffdf5">Eraser</button>
        </div>
        <div class="chip-row">
          <button class="chip" id="wb-clear">Clear</button>
          <a class="chip" id="wb-save" style="text-decoration:none">Save PNG</a>
        </div>`;
      const canvas = body.querySelector("#wb-canvas");
      let ctx = null, drawing = false, color = "#1c1c22", sized = false;
      function ensureSize() {
        if (sized) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.fillStyle = "#fffdf5";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        sized = true;
      }
      function pos(e) {
        const r = canvas.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
      }
      canvas.addEventListener("pointerdown", (e) => {
        ensureSize();
        drawing = true;
        canvas.setPointerCapture(e.pointerId);
        const [x, y] = pos(e);
        ctx.strokeStyle = color;
        ctx.lineWidth = color === "#fffdf5" ? 24 : 4;
        ctx.beginPath(); ctx.moveTo(x, y);
      });
      canvas.addEventListener("pointermove", (e) => {
        if (!drawing) return;
        const [x, y] = pos(e);
        ctx.lineTo(x, y); ctx.stroke();
      });
      canvas.addEventListener("pointerup", () => { drawing = false; });
      body.querySelector("#wb-colors").addEventListener("click", (e) => {
        const b = e.target.closest("[data-c]"); if (!b) return;
        body.querySelectorAll("#wb-colors .chip").forEach((c) => c.classList.remove("active"));
        b.classList.add("active"); color = b.dataset.c;
      });
      body.querySelector("#wb-clear").addEventListener("click", () => {
        ensureSize();
        ctx.fillStyle = "#fffdf5";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      });
      body.querySelector("#wb-save").addEventListener("click", (e) => {
        ensureSize();
        e.target.href = canvas.toDataURL("image/png");
        e.target.download = "whiteboard.png";
      });
      def.enter = () => setTimeout(ensureSize, 80);
    },
  });
})();
