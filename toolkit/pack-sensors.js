/* Pack: sensor, motion, and outdoors tools */
"use strict";
(() => {
  const { register, el, esc, fmt, store } = TK;
  const videoCss = "flex:1;min-height:300px;border-radius:16px;object-fit:cover;background:#000;width:100%";

  function needsMotionGate() {
    return typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function";
  }
  async function askMotion() {
    try {
      if (needsMotionGate()) return (await DeviceMotionEvent.requestPermission()) === "granted";
      return true;
    } catch (e) { return false; }
  }

  /* ================= Seismometer ================= */
  register({
    id: "seismo", name: "Seismometer", icon: "📈", cat: "Measure", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#0f2027,#2c5364)", keywords: "vibration accelerometer earthquake shake",
    render(body, def) {
      body.innerHTML += `
        <canvas id="se-canvas" style="flex:1;min-height:280px;border-radius:16px;background:#14141a;width:100%"></canvas>
        <div class="t-result"><div class="big"><span id="se-val">0.00</span> g</div><div class="sub" id="se-sub">peak <span id="se-peak">0.00</span> g</div></div>
        <button class="big-btn hidden" id="se-perm">Enable motion access</button>`;
      const canvas = body.querySelector("#se-canvas");
      let hist = [], peak = 0, raf = null, listening = false;
      function onMotion(e) {
        const a = e.acceleration || {};
        const g = Math.hypot(a.x || 0, a.y || 0, a.z || 0) / 9.81;
        hist.push(g); if (hist.length > 400) hist.shift();
        peak = Math.max(peak, g);
        body.querySelector("#se-val").textContent = g.toFixed(2);
        body.querySelector("#se-peak").textContent = peak.toFixed(2);
      }
      function draw() {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
        const c = canvas.getContext("2d");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, w, h);
        c.strokeStyle = "#2c5364"; c.beginPath(); c.moveTo(0, h - 10); c.lineTo(w, h - 10); c.stroke();
        c.strokeStyle = "#64d2ff"; c.lineWidth = 2; c.beginPath();
        hist.forEach((g, i) => {
          const x = i / 400 * w;
          const y = h - 10 - Math.min(1, g) * (h - 30);
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        });
        c.stroke();
        raf = requestAnimationFrame(draw);
      }
      body.querySelector("#se-perm").addEventListener("click", async () => {
        if (await askMotion()) { body.querySelector("#se-perm").classList.add("hidden"); start(); }
      });
      function start() {
        if (!listening) { window.addEventListener("devicemotion", onMotion); listening = true; }
        draw();
      }
      def.enter = () => {
        peak = 0; hist = [];
        if (needsMotionGate() && !store.get("motionGranted", false)) body.querySelector("#se-perm").classList.remove("hidden");
        else start();
      };
      def.exit = () => {
        window.removeEventListener("devicemotion", onMotion);
        listening = false;
        cancelAnimationFrame(raf);
      };
    },
  });

  /* ================= G-Force / 0-60 ================= */
  register({
    id: "gforce", name: "Launch Timer", icon: "🏁", cat: "Outdoors", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#3a1c71,#d76d77)", keywords: "0-60 acceleration car g force gps",
    note: "GPS 0–100 km/h timer with live g-force. Passenger use only — eyes on the road.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:220px">
          <div class="huge"><span id="gf-time">—</span><small> s 0–100</small></div>
          <div class="dyn-note">current <span id="gf-speed">0</span> km/h · <span id="gf-g">0.00</span> g</div>
          <div class="dyn-note" id="gf-status">press arm, then launch</div>
        </div>
        <button class="big-btn" id="gf-arm">Arm</button>`;
      let watch = null, armed = false, t0 = null, motionOn = false, lastG = 0;
      function onMotion(e) {
        const a = e.acceleration || {};
        lastG = Math.hypot(a.x || 0, a.y || 0, a.z || 0) / 9.81;
        body.querySelector("#gf-g").textContent = lastG.toFixed(2);
      }
      function onPos(pos) {
        const kmh = (pos.coords.speed || 0) * 3.6;
        body.querySelector("#gf-speed").textContent = Math.round(kmh);
        if (armed) {
          if (t0 === null && kmh > 2) { t0 = pos.timestamp; body.querySelector("#gf-status").textContent = "GO!"; }
          if (t0 !== null && kmh >= 100) {
            body.querySelector("#gf-time").textContent = ((pos.timestamp - t0) / 1000).toFixed(2);
            body.querySelector("#gf-status").textContent = "0–100 done 🏁";
            armed = false;
          }
        }
      }
      body.querySelector("#gf-arm").addEventListener("click", async (e) => {
        armed = !armed; t0 = null;
        e.target.textContent = armed ? "Armed — waiting for launch" : "Arm";
        if (armed && await askMotion() && !motionOn) { window.addEventListener("devicemotion", onMotion); motionOn = true; }
      });
      def.enter = () => {
        if ("geolocation" in navigator) watch = navigator.geolocation.watchPosition(onPos, () => {
          body.querySelector("#gf-status").textContent = "GPS unavailable — allow location access";
        }, { enableHighAccuracy: true });
      };
      def.exit = () => {
        if (watch !== null) navigator.geolocation.clearWatch(watch);
        window.removeEventListener("devicemotion", onMotion);
        motionOn = false; armed = false;
      };
    },
  });

  /* ================= GPS Altimeter ================= */
  register({
    id: "altimeter", name: "Altimeter", icon: "🏔️", cat: "Outdoors", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#1488cc,#2b32b2)", keywords: "elevation altitude height gps barometer",
    note: "GPS altitude (±10–30 m outdoors). The precise barometric version needs the native CMAltimeter.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:240px">
          <div class="huge"><span id="al-val">—</span><small> <span id="al-unit">m</span></small></div>
          <div class="dyn-note" id="al-acc">waiting for GPS…</div>
          <div class="dyn-note">min <span id="al-min">—</span> · max <span id="al-max">—</span></div>
        </div>
        <div class="chip-row"><button class="chip active" id="al-m">meters</button><button class="chip" id="al-ft">feet</button></div>`;
      let watch = null, unit = "m", min = Infinity, max = -Infinity;
      const conv = (m) => unit === "m" ? m : m * 3.28084;
      function onPos(pos) {
        const alt = pos.coords.altitude;
        if (alt === null) { body.querySelector("#al-acc").textContent = "no altitude from this GPS fix — try outdoors"; return; }
        min = Math.min(min, alt); max = Math.max(max, alt);
        body.querySelector("#al-val").textContent = Math.round(conv(alt));
        body.querySelector("#al-min").textContent = Math.round(conv(min));
        body.querySelector("#al-max").textContent = Math.round(conv(max));
        body.querySelector("#al-acc").textContent = pos.coords.altitudeAccuracy ? `±${Math.round(conv(pos.coords.altitudeAccuracy))} ${unit}` : "";
      }
      body.querySelector("#al-m").addEventListener("click", (e) => { unit = "m"; body.querySelector("#al-unit").textContent = "m"; e.target.classList.add("active"); body.querySelector("#al-ft").classList.remove("active"); });
      body.querySelector("#al-ft").addEventListener("click", (e) => { unit = "ft"; body.querySelector("#al-unit").textContent = "ft"; e.target.classList.add("active"); body.querySelector("#al-m").classList.remove("active"); });
      def.enter = () => {
        if ("geolocation" in navigator) watch = navigator.geolocation.watchPosition(onPos, () => {
          body.querySelector("#al-acc").textContent = "Location unavailable — allow access";
        }, { enableHighAccuracy: true });
      };
      def.exit = () => { if (watch !== null) navigator.geolocation.clearWatch(watch); };
    },
  });

  /* ================= Bearing / Qibla compass ================= */
  register({
    id: "bearing", name: "Bearing", icon: "🕋", cat: "Outdoors", mode: "live",
    grad: "linear-gradient(135deg,#136a8a,#267871)", keywords: "qibla direction target coordinate point",
    note: "Arrow points the way when you rotate the phone. Qibla preset targets the Kaaba.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:260px">
          <div id="be-arrow" style="font-size:96px;transition:transform 0.15s">⬆️</div>
          <div class="huge" id="be-deg" style="font-size:34px">—</div>
          <div class="dyn-note" id="be-sub">choose a target</div>
        </div>
        <div class="chip-row">
          <button class="chip" data-lat="21.4225" data-lon="39.8262" data-n="Qibla (Kaaba)">🕋 Qibla</button>
          <button class="chip" data-lat="90" data-lon="0" data-n="North Pole">🧭 True north</button>
          <button class="chip" data-lat="40.6892" data-lon="-74.0445" data-n="Statue of Liberty">🗽 NYC</button>
        </div>
        <button class="big-btn hidden" id="be-perm">Enable compass access</button>`;
      let me = null, target = null, heading = null, watch = null, listening = false;
      function bearingTo(lat1, lon1, lat2, lon2) {
        const r = Math.PI / 180;
        const dLon = (lon2 - lon1) * r;
        const y = Math.sin(dLon) * Math.cos(lat2 * r);
        const x = Math.cos(lat1 * r) * Math.sin(lat2 * r) - Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos(dLon);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }
      function haversineKm(lat1, lon1, lat2, lon2) {
        const r = Math.PI / 180, R = 6371;
        const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
      }
      function draw() {
        if (!me || !target) return;
        const brg = bearingTo(me.lat, me.lon, target.lat, target.lon);
        const dist = haversineKm(me.lat, me.lon, target.lat, target.lon);
        body.querySelector("#be-deg").textContent = Math.round(brg) + "°";
        body.querySelector("#be-sub").textContent = `${target.n} · ${dist < 1 ? Math.round(dist * 1000) + " m" : fmt(dist, 0) + " km"} away` + (heading === null ? " · rotate phone (compass needed)" : "");
        const rot = heading === null ? brg : brg - heading;
        body.querySelector("#be-arrow").style.transform = `rotate(${rot}deg)`;
      }
      function onOrient(e) {
        if (typeof e.webkitCompassHeading === "number") heading = e.webkitCompassHeading;
        else if (e.alpha !== null) heading = (360 - e.alpha) % 360;
        draw();
      }
      body.querySelectorAll("[data-lat]").forEach((b) => b.addEventListener("click", async () => {
        target = { lat: +b.dataset.lat, lon: +b.dataset.lon, n: b.dataset.n };
        body.querySelectorAll(".chip[data-lat]").forEach((c) => c.classList.remove("active"));
        b.classList.add("active");
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function" && !store.get("motionGranted", false)) {
          try { if ((await DeviceOrientationEvent.requestPermission()) === "granted") store.set("motionGranted", true); } catch (e) {}
        }
        if (!listening) { window.addEventListener("deviceorientation", onOrient); listening = true; }
        draw();
      }));
      def.enter = () => {
        if ("geolocation" in navigator) watch = navigator.geolocation.watchPosition((p) => {
          me = { lat: p.coords.latitude, lon: p.coords.longitude };
          draw();
        }, () => { body.querySelector("#be-sub").textContent = "Location unavailable — allow access"; }, { enableHighAccuracy: true });
      };
      def.exit = () => {
        if (watch !== null) navigator.geolocation.clearWatch(watch);
        window.removeEventListener("deviceorientation", onOrient);
        listening = false;
      };
    },
  });

  /* ================= Sun & Moon ================= */
  register({
    id: "suntimes", name: "Sun & Moon", icon: "🌇", cat: "Outdoors", mode: "live",
    grad: "linear-gradient(135deg,#fdc830,#f37335)", keywords: "sunrise sunset golden hour moon phase",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:120px">
          <div style="font-size:64px" id="su-moon">🌙</div>
          <div class="dyn-note" id="su-phase">—</div>
        </div>
        <div class="t-list" id="su-list"></div>
        <p class="dyn-note" id="su-note">uses your location</p>`;
      function calc(lat, lon) {
        const now = new Date();
        const rad = Math.PI / 180;
        // NOAA-simplified solar calc
        const start = Date.UTC(now.getUTCFullYear(), 0, 0);
        const doy = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000);
        const gamma = 2 * Math.PI / 365 * (doy - 1 + (now.getUTCHours() - 12) / 24);
        const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
        const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
        const ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl)) / rad;
        const sunriseUTC = 720 - 4 * (lon + ha) - eqtime; // minutes
        const sunsetUTC = 720 - 4 * (lon - ha) - eqtime;
        const toLocal = (mins) => {
          const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + mins * 60000);
          return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        };
        const toLocalDate = (mins) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + mins * 60000);
        // moon phase
        const synodic = 29.530588853;
        const known = Date.UTC(2000, 0, 6, 18, 14);
        const age = ((Date.now() - known) / 86400000) % synodic;
        const pct = (1 - Math.cos(age / synodic * 2 * Math.PI)) / 2;
        const MOONS = ["🌑 New", "🌒 Waxing crescent", "🌓 First quarter", "🌔 Waxing gibbous", "🌕 Full", "🌖 Waning gibbous", "🌗 Last quarter", "🌘 Waning crescent"];
        const mi = Math.round(age / synodic * 8) % 8;
        body.querySelector("#su-moon").textContent = MOONS[mi].split(" ")[0];
        body.querySelector("#su-phase").textContent = `${MOONS[mi].slice(3)} · ${Math.round(pct * 100)}% lit · ${age.toFixed(1)} days old`;
        const goldenEve = toLocalDate(sunsetUTC - 60);
        const rows = [
          ["🌅 Sunrise", toLocal(sunriseUTC)],
          ["🌇 Golden hour", goldenEve.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) + " – " + toLocal(sunsetUTC)],
          ["🌆 Sunset", toLocal(sunsetUTC)],
          ["☀️ Day length", (() => { const m = (sunsetUTC - sunriseUTC); return `${Math.floor(m / 60)} h ${Math.round(m % 60)} min`; })()],
        ];
        const list = body.querySelector("#su-list");
        list.innerHTML = "";
        rows.forEach(([t, v]) => list.appendChild(el("div", "t-li", `<div class="li-main"><strong>${t}</strong></div><span style="font-weight:800;font-variant-numeric:tabular-nums">${v}</span>`)));
        body.querySelector("#su-note").textContent = `for ${lat.toFixed(2)}, ${lon.toFixed(2)} today`;
      }
      def.enter = () => {
        navigator.geolocation.getCurrentPosition(
          (p) => calc(p.coords.latitude, p.coords.longitude),
          () => { calc(40.71, -74.01); body.querySelector("#su-note").textContent = "location unavailable — showing New York"; },
          { timeout: 8000 });
      };
    },
  });

  /* ================= Grid Reference ================= */
  register({
    id: "gridref", name: "Grid Ref", icon: "🗺️", cat: "Outdoors", mode: "live",
    grad: "linear-gradient(135deg,#00467f,#a5cc82)", keywords: "utm coordinates latitude longitude share",
    render(body, def) {
      body.innerHTML += `
        <div class="t-list" id="gr-list"></div>
        <button class="big-btn" id="gr-copy">Copy coordinates</button>
        <p class="dyn-note" id="gr-note">waiting for GPS…</p>`;
      let lastText = "";
      function toUTM(lat, lon) {
        const a = 6378137, f = 1 / 298.257223563, k0 = 0.9996;
        const e2 = f * (2 - f);
        const zone = Math.floor((lon + 180) / 6) + 1;
        const lon0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;
        const phi = lat * Math.PI / 180, lam = lon * Math.PI / 180;
        const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
        const T = Math.tan(phi) ** 2;
        const C = e2 / (1 - e2) * Math.cos(phi) ** 2;
        const A = Math.cos(phi) * (lam - lon0);
        const M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64) * phi - (3 * e2 / 8 + 3 * e2 * e2 / 32) * Math.sin(2 * phi) + (15 * e2 * e2 / 256) * Math.sin(4 * phi));
        const easting = k0 * N * (A + (1 - T + C) * A ** 3 / 6) + 500000;
        let northing = k0 * (M + N * Math.tan(phi) * (A * A / 2 + (5 - T + 9 * C) * A ** 4 / 24));
        if (lat < 0) northing += 10000000;
        const band = "CDEFGHJKLMNPQRSTUVWX"[Math.floor((lat + 80) / 8)] || "Z";
        return `${zone}${band} ${Math.round(easting)} ${Math.round(northing)}`;
      }
      function draw(p) {
        const { latitude: lat, longitude: lon, accuracy } = p.coords;
        const rows = [
          ["Lat / Lon", `${lat.toFixed(5)}, ${lon.toFixed(5)}`],
          ["UTM", toUTM(lat, lon)],
          ["DMS", `${Math.abs(lat).toFixed(0)}°${((Math.abs(lat) % 1) * 60).toFixed(3)}′${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(0)}°${((Math.abs(lon) % 1) * 60).toFixed(3)}′${lon >= 0 ? "E" : "W"}`],
        ];
        const list = body.querySelector("#gr-list");
        list.innerHTML = "";
        rows.forEach(([t, v]) => list.appendChild(el("div", "t-li", `<div class="li-main"><strong>${t}</strong><span style="font-variant-numeric:tabular-nums;overflow-wrap:anywhere">${v}</span></div>`)));
        body.querySelector("#gr-note").textContent = `GPS ±${Math.round(accuracy)} m`;
        lastText = `${lat.toFixed(5)}, ${lon.toFixed(5)} (UTM ${toUTM(lat, lon)})`;
      }
      body.querySelector("#gr-copy").addEventListener("click", async (e) => {
        if (!lastText) return;
        try { await navigator.clipboard.writeText(lastText); e.target.textContent = "Copied!"; }
        catch (err) { e.target.textContent = "Copy failed"; }
        setTimeout(() => { e.target.textContent = "Copy coordinates"; }, 1200);
      });
      let watch = null;
      def.enter = () => {
        if ("geolocation" in navigator) watch = navigator.geolocation.watchPosition(draw, () => {
          body.querySelector("#gr-note").textContent = "Location unavailable — allow access";
        }, { enableHighAccuracy: true });
      };
      def.exit = () => { if (watch !== null) navigator.geolocation.clearWatch(watch); };
    },
  });

  /* ================= Parking Pin ================= */
  register({
    id: "parking", name: "Parking Pin", icon: "🅿️", cat: "Outdoors", mode: "live",
    grad: "linear-gradient(135deg,#457fca,#5691c8)", keywords: "car saved spot meter find walk back",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:200px">
          <div style="font-size:56px">🅿️</div>
          <div class="huge" id="pk-dist" style="font-size:34px">no pin</div>
          <div class="dyn-note" id="pk-sub">save your spot when you park</div>
        </div>
        <div class="t-card"><div class="t-row"><label>Note</label><input type="text" id="pk-note" placeholder="Level 2, spot B14" style="width:66%"></div></div>
        <button class="big-btn" id="pk-save">📍 Pin my spot</button>
        <button class="big-btn" id="pk-clear" style="background:#2c2c34">Clear pin</button>`;
      let watch = null;
      const distEl = body.querySelector("#pk-dist"), sub = body.querySelector("#pk-sub");
      function havM(lat1, lon1, lat2, lon2) {
        const r = Math.PI / 180, R = 6371000;
        const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
      }
      function onPos(p) {
        const pin = store.get("parkingPin", null);
        if (!pin) { distEl.textContent = "no pin"; return; }
        const d = havM(p.coords.latitude, p.coords.longitude, pin.lat, pin.lon);
        distEl.textContent = d < 1000 ? Math.round(d) + " m" : (d / 1000).toFixed(1) + " km";
        const age = Math.round((Date.now() - pin.at) / 60000);
        sub.textContent = `${pin.note ? pin.note + " · " : ""}parked ${age < 60 ? age + " min" : Math.round(age / 60) + " h"} ago`;
      }
      body.querySelector("#pk-save").addEventListener("click", () => {
        navigator.geolocation.getCurrentPosition((p) => {
          store.set("parkingPin", { lat: p.coords.latitude, lon: p.coords.longitude, at: Date.now(), note: body.querySelector("#pk-note").value.trim() });
          sub.textContent = "pinned ✓ — walk away, I'll count the distance";
        }, () => { sub.textContent = "Location unavailable — allow access"; }, { enableHighAccuracy: true });
      });
      body.querySelector("#pk-clear").addEventListener("click", () => { store.set("parkingPin", null); distEl.textContent = "no pin"; sub.textContent = "save your spot when you park"; });
      def.enter = () => {
        if ("geolocation" in navigator) watch = navigator.geolocation.watchPosition(onPos, () => {}, { enableHighAccuracy: true });
      };
      def.exit = () => { if (watch !== null) navigator.geolocation.clearWatch(watch); };
    },
  });

  /* ================= Steps (foreground pedometer) ================= */
  register({
    id: "steps", name: "Step Counter", icon: "👟", cat: "Health", mode: "live", wakeLock: true,
    grad: "linear-gradient(135deg,#02aab0,#00cdac)", keywords: "pedometer walking count",
    note: "Counts steps from the accelerometer while this screen is open. All-day counting needs native CMPedometer.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:240px">
          <div class="huge" id="sc-count">0</div>
          <div class="dyn-note">steps this session</div>
        </div>
        <button class="big-btn hidden" id="sc-perm">Enable motion access</button>
        <button class="big-btn" id="sc-reset" style="background:#2c2c34">Reset</button>`;
      let steps = 0, smoothed = 0, lastStep = 0, listening = false;
      function onMotion(e) {
        const a = e.accelerationIncludingGravity || {};
        const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
        smoothed = smoothed * 0.8 + mag * 0.2;
        const now = performance.now();
        if (mag - smoothed > 1.6 && now - lastStep > 300) {
          lastStep = now; steps++;
          body.querySelector("#sc-count").textContent = steps;
        }
      }
      function start() {
        if (!listening) { window.addEventListener("devicemotion", onMotion); listening = true; }
      }
      body.querySelector("#sc-perm").addEventListener("click", async () => {
        if (await askMotion()) { store.set("motionGranted", true); body.querySelector("#sc-perm").classList.add("hidden"); start(); }
      });
      body.querySelector("#sc-reset").addEventListener("click", () => { steps = 0; body.querySelector("#sc-count").textContent = 0; });
      def.enter = () => {
        if (needsMotionGate() && !store.get("motionGranted", false)) body.querySelector("#sc-perm").classList.remove("hidden");
        else start();
      };
      def.exit = () => { window.removeEventListener("devicemotion", onMotion); listening = false; };
    },
  });

  /* ================= NFC ================= */
  register({
    id: "nfc", name: "NFC Tags", icon: "📡", cat: "Measure",
    mode: ("NDEFReader" in window) ? "live" : "sim",
    grad: "linear-gradient(135deg,#0f3443,#34e89e)", keywords: "tag read write ndef",
    note: ("NDEFReader" in window)
      ? "Hold a tag to the top of the phone to read it."
      : "iPhones don't expose NFC to web apps — this shows the flow; real reads use Core NFC.",
    render(body) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:180px"><div style="font-size:64px">📡</div><div class="dyn-note" id="nf-sub">—</div></div>
        <button class="big-btn" id="nf-scan">Scan tag</button>
        <div class="t-result"><div class="big" id="nf-out" style="font-size:16px;overflow-wrap:anywhere">—</div></div>`;
      const sub = body.querySelector("#nf-sub"), out = body.querySelector("#nf-out");
      body.querySelector("#nf-scan").addEventListener("click", async () => {
        if ("NDEFReader" in window) {
          try {
            const r = new NDEFReader();
            await r.scan();
            sub.textContent = "hold a tag to the phone…";
            r.onreading = (ev) => {
              const rec = ev.message.records[0];
              const dec = new TextDecoder();
              out.textContent = rec ? `${rec.recordType}: ${dec.decode(rec.data)}` : "empty tag";
              sub.textContent = "tag read ✓";
            };
          } catch (e) { sub.textContent = "NFC scan failed: " + e.message; }
        } else {
          sub.textContent = "simulated scan…";
          setTimeout(() => {
            out.textContent = "[Simulated] NTAG215 · url: https://taoli1707.github.io/toolkit/";
            sub.textContent = "on Android Chrome this reads real tags";
          }, 900);
        }
      });
    },
  });

  /* ================= Lux meter (sim) ================= */
  register({
    id: "lux", name: "Lux Meter", icon: "💡", cat: "Measure", mode: "sim",
    grad: "linear-gradient(135deg,#f7971e,#ffd200)", keywords: "light plant photo brightness",
    note: "No web API exposes light sensing on iPhone; native apps estimate from camera exposure. Explore typical levels:",
    render(body) {
      const SCENES = [["Moonlight", 0.3], ["Candle at 30cm", 10], ["Dim living room", 50], ["Cozy lamp light", 150], ["Office lighting", 400], ["Bright kitchen", 750], ["Overcast day", 1500], ["Shade outdoors", 15000], ["Full daylight", 25000], ["Direct sun", 60000]];
      body.innerHTML += `
        <div class="t-big-display" style="min-height:200px">
          <div class="huge"><span id="lx-val">400</span><small> lx</small></div>
          <div class="dyn-note" id="lx-plant"></div>
        </div>
        <label class="slider-row">Scene <input type="range" id="lx-slider" min="0" max="9" value="4"></label>
        <p class="dyn-note" id="lx-scene">Office lighting</p>`;
      const slider = body.querySelector("#lx-slider");
      function draw() {
        const [name, lx] = SCENES[+slider.value];
        body.querySelector("#lx-val").textContent = lx.toLocaleString("en-US");
        body.querySelector("#lx-scene").textContent = name;
        body.querySelector("#lx-plant").textContent =
          lx < 50 ? "too dark for most plants" :
          lx < 500 ? "low light — pothos, snake plant" :
          lx < 5000 ? "medium — monstera, philodendron happy" :
          lx < 20000 ? "bright indirect — most tropicals thrive" : "full sun — succulents & herbs";
      }
      slider.addEventListener("input", draw);
      draw();
    },
  });

  /* ================= Earbud Finder (sim) ================= */
  register({
    id: "earbuds", name: "Earbud Finder", icon: "🎧", cat: "Measure", mode: "sim",
    grad: "linear-gradient(135deg,#141e30,#243b55)", keywords: "bluetooth lost hot cold signal",
    note: "Web Bluetooth can't read signal strength on iPhone — simulated hot/cold radar; native uses RSSI.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-big-display" style="min-height:260px">
          <div id="eb-ring" style="width:150px;height:150px;border-radius:50%;border:3px solid #243b55;display:flex;align-items:center;justify-content:center;transition:all 0.3s">
            <span style="font-size:52px">🎧</span></div>
          <div class="huge" id="eb-db" style="font-size:32px">—</div>
          <div class="dyn-note" id="eb-sub">walk around — signal rises as you get closer (simulated)</div>
        </div>
        <button class="big-btn" id="eb-go">Start searching</button>`;
      let iv = null, d = 12;
      body.querySelector("#eb-go").addEventListener("click", (e) => {
        if (iv) { clearInterval(iv); iv = null; e.target.textContent = "Start searching"; return; }
        e.target.textContent = "Stop";
        iv = setInterval(() => {
          d = Math.max(0.4, d - 0.5 - Math.random());
          const rssi = Math.round(-40 - 20 * Math.log10(Math.max(0.4, d)));
          body.querySelector("#eb-db").textContent = rssi + " dBm";
          const heat = Math.min(1, (rssi + 85) / 40);
          body.querySelector("#eb-ring").style.borderColor = `rgb(${Math.round(36 + heat * 210)}, ${Math.round(59 + heat * 100)}, 85)`;
          body.querySelector("#eb-ring").style.boxShadow = `0 0 ${heat * 40}px rgba(255,90,80,${heat * 0.5})`;
          body.querySelector("#eb-sub").textContent = heat > 0.9 ? "🔥 burning hot — look around you!" : heat > 0.6 ? "getting warmer…" : "cold — keep moving (simulated)";
          if (d <= 0.5) { clearInterval(iv); iv = null; body.querySelector("#eb-go").textContent = "Start searching"; d = 12; }
        }, 700);
      });
      def.exit = () => { clearInterval(iv); iv = null; d = 12; };
    },
  });

  /* ================= Stud Finder (embed) ================= */
  register({
    id: "stud", name: "Stud Finder", icon: "🧲", cat: "Measure", mode: "sim",
    grad: "linear-gradient(135deg,#780206,#061161)", keywords: "magnetometer wall screws metal",
    note: "Full interactive simulator — magnetometer sensing needs native Core Motion.",
    render(body) {
      body.innerHTML += `<iframe src="../studfinder/" style="flex:1;min-height:460px;border:none;border-radius:16px;background:#101014" title="Stud finder simulator"></iframe>`;
    },
  });

  /* ================= AR Measure (sim) ================= */
  register({
    id: "armeasure", name: "AR Measure", icon: "📐", cat: "Measure", mode: "sim",
    grad: "linear-gradient(135deg,#1e3c72,#2a5298)", keywords: "tape ruler lidar room distance",
    note: "True world-anchored measuring needs ARKit/LiDAR. Tap two points to see the flow.",
    render(body, def) {
      body.innerHTML += `
        <video id="ar-video" autoplay playsinline muted style="${videoCss}"></video>
        <svg id="ar-svg" style="position:absolute;pointer-events:none"></svg>
        <div class="t-result"><div class="big" id="ar-out">tap two points</div><div class="sub">simulated depth — native ARKit measures for real</div></div>`;
      const video = body.querySelector("#ar-video");
      const ref = { s: null };
      let pts = [];
      video.addEventListener("click", (e) => {
        const r = video.getBoundingClientRect();
        pts.push([(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]);
        if (pts.length === 2) {
          const dx = (pts[1][0] - pts[0][0]) * 3.2, dy = (pts[1][1] - pts[0][1]) * 2.2;
          body.querySelector("#ar-out").textContent = Math.hypot(dx, dy).toFixed(2) + " m (simulated)";
          pts = [];
        } else {
          body.querySelector("#ar-out").textContent = "point 1 set — tap the far end";
        }
      });
      def.enter = () => {
        camStartLocal();
        function camStartLocal() {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
            .then((s) => { ref.s = s; video.srcObject = s; })
            .catch(() => { body.querySelector("#ar-out").textContent = "Camera unavailable"; });
        }
      };
      def.exit = () => { if (ref.s) { ref.s.getTracks().forEach((t) => t.stop()); ref.s = null; } video.srcObject = null; pts = []; };
    },
  });

  /* ================= Star Map (sim-lite) ================= */
  register({
    id: "starmap", name: "Star Map", icon: "🌌", cat: "Outdoors", mode: "sim",
    grad: "linear-gradient(135deg,#0f0c29,#302b63)", keywords: "constellation sky night astronomy",
    note: "A full pointable planetarium needs precise sensor fusion — this shows tonight's sky highlights.",
    render(body, def) {
      body.innerHTML += `
        <canvas id="sm-canvas" style="flex:1;min-height:300px;border-radius:16px;background:#0b1026;width:100%"></canvas>
        <div class="t-list" id="sm-list"></div>`;
      const canvas = body.querySelector("#sm-canvas");
      function draw() {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        const c = canvas.getContext("2d");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.fillStyle = "#0b1026"; c.fillRect(0, 0, w, h);
        // deterministic starfield
        let seed = 42;
        const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 140; i++) {
          const x = rand() * w, y = rand() * h, r = rand() * 1.4 + 0.3;
          c.fillStyle = `rgba(255,255,255,${0.4 + rand() * 0.6})`;
          c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
        }
        // Big Dipper sketch
        const dip = [[0.2, 0.3], [0.28, 0.28], [0.36, 0.3], [0.44, 0.34], [0.5, 0.44], [0.6, 0.46], [0.66, 0.38]];
        c.strokeStyle = "rgba(100,210,255,0.6)"; c.lineWidth = 1.5; c.beginPath();
        dip.forEach(([x, y], i) => { i ? c.lineTo(x * w, y * h) : c.moveTo(x * w, y * h); });
        c.stroke();
        dip.forEach(([x, y]) => { c.fillStyle = "#fff"; c.beginPath(); c.arc(x * w, y * h, 2.5, 0, 7); c.fill(); });
        c.fillStyle = "rgba(255,255,255,0.75)"; c.font = "12px -apple-system,sans-serif";
        c.fillText("Big Dipper", 0.22 * w, 0.24 * h);
      }
      const HIGHLIGHTS = [
        ["🌟 Polaris", "due north — find it via the Dipper's pointer stars"],
        ["🪐 Saturn", "evening sky this season, southeast after dark"],
        ["✨ Venus", "brilliant near the horizon at dawn or dusk"],
        ["🌌 Milky Way core", "best on moonless nights away from city lights"],
      ];
      const list = body.querySelector("#sm-list");
      list.innerHTML = "";
      HIGHLIGHTS.forEach(([t, s]) => list.appendChild(el("div", "t-li", `<div class="li-main"><strong>${t}</strong><span>${s}</span></div>`)));
      def.enter = () => setTimeout(draw, 50);
    },
  });
})();
