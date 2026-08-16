/* Pack: reference data + personal trackers */
"use strict";
(() => {
  const { register, el, esc, fmt, store } = TK;

  /* ---- searchable reference list engine ---- */
  function reference(def) {
    def.render = (body) => {
      const search = el("input", "home-search");
      search.type = "search";
      search.placeholder = "Filter…";
      search.style.marginTop = "0";
      body.appendChild(search);
      const list = el("div", "t-list");
      body.appendChild(list);
      function draw(q) {
        q = (q || "").toLowerCase();
        list.innerHTML = "";
        def.items
          .filter((it) => !q || it.search.toLowerCase().includes(q))
          .slice(0, 200)
          .forEach((it) => {
            const li = el("div", "t-li",
              `<div class="li-main"><strong>${it.title}</strong><span>${it.sub}</span></div>` +
              (it.right ? `<span style="font-weight:800;font-variant-numeric:tabular-nums;text-align:right">${it.right}</span>` : ""));
            list.appendChild(li);
          });
        if (!list.children.length) list.appendChild(el("p", "dyn-note", "No matches"));
      }
      search.addEventListener("input", () => draw(search.value));
      draw();
    };
    register(def);
  }

  /* ---- localStorage CRUD tracker engine ---- */
  function tracker(def) {
    def.render = (body) => {
      const items = () => store.get("trk." + def.id, []);
      const save = (arr) => store.set("trk." + def.id, arr);
      const form = el("div", "t-card t-rows");
      const inputs = {};
      def.fields.forEach((f) => {
        const row = el("div", "t-row");
        row.appendChild(el("label", "", esc(f.label)));
        const inp = el("input");
        inp.type = f.type || "text";
        if (f.type === "num") { inp.type = "text"; inp.inputMode = "decimal"; }
        inputs[f.k] = inp;
        row.appendChild(inp);
        form.appendChild(row);
      });
      const addBtn = el("button", "big-btn", "Add");
      const summary = el("p", "dyn-note", "");
      const list = el("div", "t-list");
      body.appendChild(form);
      body.appendChild(addBtn);
      body.appendChild(summary);
      body.appendChild(list);
      function draw() {
        const arr = items();
        if (def.sort) arr.sort(def.sort);
        list.innerHTML = "";
        arr.forEach((item, i) => {
          const line = def.line(item);
          const li = el("div", "t-li",
            `<div class="li-main"><strong>${esc(line.title)}</strong><span>${esc(line.sub)}</span></div>` +
            (line.badge ? `<span class="mode-badge ${line.badgeCls || "live"}">${esc(line.badge)}</span>` : "") +
            `<button class="li-x" data-i="${i}">×</button>`);
          list.appendChild(li);
        });
        summary.textContent = def.footer ? def.footer(arr) : (arr.length ? arr.length + " saved" : "Nothing saved yet");
      }
      list.addEventListener("click", (e) => {
        if (e.target.dataset && e.target.dataset.i !== undefined) {
          const arr = items(); arr.splice(+e.target.dataset.i, 1); save(arr); draw();
        }
      });
      addBtn.addEventListener("click", () => {
        const item = {};
        let ok = true;
        def.fields.forEach((f) => {
          const v = inputs[f.k].value.trim();
          if (!v) ok = false;
          item[f.k] = f.type === "num" ? parseFloat(v) : v;
        });
        if (!ok) return;
        const arr = items(); arr.push(item); save(arr);
        def.fields.forEach((f) => { inputs[f.k].value = ""; });
        draw();
      });
      draw();
      def.enter = draw;
    };
    register(def);
  }

  const daysUntil = (iso) => Math.ceil((new Date(iso + "T23:59:59") - new Date()) / 86400000);

  /* ================= Reference ================= */
  const ELEMENTS = "H Hydrogen 1.008|He Helium 4.003|Li Lithium 6.94|Be Beryllium 9.012|B Boron 10.81|C Carbon 12.011|N Nitrogen 14.007|O Oxygen 15.999|F Fluorine 18.998|Ne Neon 20.18|Na Sodium 22.99|Mg Magnesium 24.305|Al Aluminium 26.982|Si Silicon 28.085|P Phosphorus 30.974|S Sulfur 32.06|Cl Chlorine 35.45|Ar Argon 39.948|K Potassium 39.098|Ca Calcium 40.078|Sc Scandium 44.956|Ti Titanium 47.867|V Vanadium 50.942|Cr Chromium 51.996|Mn Manganese 54.938|Fe Iron 55.845|Co Cobalt 58.933|Ni Nickel 58.693|Cu Copper 63.546|Zn Zinc 65.38|Ga Gallium 69.723|Ge Germanium 72.63|As Arsenic 74.922|Se Selenium 78.971|Br Bromine 79.904|Kr Krypton 83.798|Rb Rubidium 85.468|Sr Strontium 87.62|Y Yttrium 88.906|Zr Zirconium 91.224|Nb Niobium 92.906|Mo Molybdenum 95.95|Tc Technetium 98|Ru Ruthenium 101.07|Rh Rhodium 102.906|Pd Palladium 106.42|Ag Silver 107.868|Cd Cadmium 112.414|In Indium 114.818|Sn Tin 118.71|Sb Antimony 121.76|Te Tellurium 127.6|I Iodine 126.904|Xe Xenon 131.293|Cs Caesium 132.905|Ba Barium 137.327|La Lanthanum 138.905|Ce Cerium 140.116|Pr Praseodymium 140.908|Nd Neodymium 144.242|Pm Promethium 145|Sm Samarium 150.36|Eu Europium 151.964|Gd Gadolinium 157.25|Tb Terbium 158.925|Dy Dysprosium 162.5|Ho Holmium 164.93|Er Erbium 167.259|Tm Thulium 168.934|Yb Ytterbium 173.045|Lu Lutetium 174.967|Hf Hafnium 178.486|Ta Tantalum 180.948|W Tungsten 183.84|Re Rhenium 186.207|Os Osmium 190.23|Ir Iridium 192.217|Pt Platinum 195.084|Au Gold 196.967|Hg Mercury 200.592|Tl Thallium 204.38|Pb Lead 207.2|Bi Bismuth 208.98|Po Polonium 209|At Astatine 210|Rn Radon 222|Fr Francium 223|Ra Radium 226|Ac Actinium 227|Th Thorium 232.038|Pa Protactinium 231.036|U Uranium 238.029|Np Neptunium 237|Pu Plutonium 244|Am Americium 243|Cm Curium 247|Bk Berkelium 247|Cf Californium 251|Es Einsteinium 252|Fm Fermium 257|Md Mendelevium 258|No Nobelium 259|Lr Lawrencium 266|Rf Rutherfordium 267|Db Dubnium 268|Sg Seaborgium 269|Bh Bohrium 270|Hs Hassium 277|Mt Meitnerium 278|Ds Darmstadtium 281|Rg Roentgenium 282|Cn Copernicium 285|Nh Nihonium 286|Fl Flerovium 289|Mc Moscovium 290|Lv Livermorium 293|Ts Tennessine 294|Og Oganesson 294"
    .split("|").map((s, i) => { const [sym, name, mass] = s.split(" "); return { n: i + 1, sym, name, mass }; });
  reference({
    id: "periodic", name: "Periodic Table", icon: "⚗️", cat: "Reference", mode: "live",
    grad: "linear-gradient(135deg,#4776e6,#8e54e9)", keywords: "elements chemistry atomic",
    items: ELEMENTS.map((e) => ({
      title: `${e.n} · ${e.sym} — ${e.name}`, sub: `atomic mass ${e.mass}`, right: e.sym,
      search: `${e.n} ${e.sym} ${e.name}`,
    })),
  });

  reference({
    id: "knots", name: "Knot Guide", icon: "🪢", cat: "Reference", mode: "live",
    grad: "linear-gradient(135deg,#b79891,#94716b)", keywords: "rope tying camping sailing",
    items: [
      ["Bowline", "Fixed loop that won't slip", "Rabbit out of the hole, around the tree, back down the hole."],
      ["Clove hitch", "Fast tie-off to a post", "Two loops over the post, second tucked under itself."],
      ["Figure 8", "Stopper knot / climbing tie-in", "Make an 8, then retrace it through your harness."],
      ["Sheet bend", "Joins two ropes of different size", "Thick rope makes a bight; thin rope wraps and tucks under itself."],
      ["Taut-line hitch", "Adjustable tension (tent guylines)", "Two wraps inside the loop, one outside, slide to tension."],
      ["Square knot", "Ties two same-size ends (non-critical)", "Right over left, then left over right."],
      ["Trucker's hitch", "3:1 tension for lashing loads", "Fixed loop mid-line, run the end through the anchor and back through the loop, haul tight."],
      ["Prusik", "Slide-and-grip loop on a rope", "Girth-hitch a loop around the rope three times; slides when loose, grips under load."],
    ].map(([t, u, s]) => ({ title: t, sub: u + " — " + s, search: t + " " + u })),
  });

  reference({
    id: "firstaid", name: "First Aid", icon: "⛑️", cat: "Reference", mode: "live",
    grad: "linear-gradient(135deg,#ee0979,#ff6a00)", keywords: "emergency cpr choking burns",
    note: "Quick memory-jogger only, not medical advice. In an emergency call your local emergency number first.",
    items: [
      ["CPR (adult)", "Call emergency services. 30 chest compressions (5–6 cm deep, 100–120/min, center of chest) then 2 breaths. Repeat. Use an AED as soon as one arrives."],
      ["Choking (adult)", "5 back blows between shoulder blades, then 5 abdominal thrusts. Repeat. If they pass out, start CPR."],
      ["Severe bleeding", "Direct firm pressure with cloth. Don't remove soaked layers — add more. Elevate. Tourniquet only for life-threatening limb bleeding."],
      ["Burns", "Cool under running water 20 minutes. No ice, butter, or creams. Cover loosely with cling film. Seek care if larger than a palm, or on face/hands."],
      ["Suspected sprain", "RICE: rest, ice 20 min on/off, compression, elevation. If you can't bear weight, get an X-ray."],
      ["Shock", "Lay them down, raise legs ~30 cm, keep warm, nothing to eat or drink, reassure until help arrives."],
      ["Nosebleed", "Sit forward, pinch the soft part of the nose 10 minutes. Don't tilt back. Persisting past 20 min: seek care."],
      ["Suspected heart attack", "Call emergency services immediately. Sit them down, loosen clothing. If not allergic, chew one adult aspirin."],
    ].map(([t, s]) => ({ title: t, sub: s, search: t })),
  });

  reference({
    id: "plugs", name: "Plugs & Voltage", icon: "🔌", cat: "Reference", mode: "live",
    grad: "linear-gradient(135deg,#7f7fd5,#86a8e7)", keywords: "travel adapter country outlet",
    items: [
      ["United States", "A/B", "120 V · 60 Hz"], ["Canada", "A/B", "120 V · 60 Hz"], ["Mexico", "A/B", "127 V · 60 Hz"],
      ["United Kingdom", "G", "230 V · 50 Hz"], ["Ireland", "G", "230 V · 50 Hz"], ["France", "C/E", "230 V · 50 Hz"],
      ["Germany", "C/F", "230 V · 50 Hz"], ["Spain", "C/F", "230 V · 50 Hz"], ["Italy", "C/F/L", "230 V · 50 Hz"],
      ["Switzerland", "C/J", "230 V · 50 Hz"], ["Netherlands", "C/F", "230 V · 50 Hz"], ["Portugal", "C/F", "230 V · 50 Hz"],
      ["Japan", "A/B", "100 V · 50/60 Hz"], ["China", "A/C/I", "220 V · 50 Hz"], ["South Korea", "C/F", "220 V · 60 Hz"],
      ["India", "C/D/M", "230 V · 50 Hz"], ["Singapore", "G", "230 V · 50 Hz"], ["Thailand", "A/B/C/O", "230 V · 50 Hz"],
      ["Vietnam", "A/C", "220 V · 50 Hz"], ["Indonesia", "C/F", "230 V · 50 Hz"], ["Philippines", "A/B/C", "220 V · 60 Hz"],
      ["Australia", "I", "230 V · 50 Hz"], ["New Zealand", "I", "230 V · 50 Hz"],
      ["Brazil", "C/N", "127/220 V · 60 Hz"], ["Argentina", "C/I", "220 V · 50 Hz"], ["Chile", "C/L", "220 V · 50 Hz"],
      ["South Africa", "C/M/N", "230 V · 50 Hz"], ["Egypt", "C/F", "220 V · 50 Hz"], ["Morocco", "C/E", "220 V · 50 Hz"],
      ["Turkey", "C/F", "230 V · 50 Hz"], ["UAE", "G", "230 V · 50 Hz"], ["Israel", "C/H", "230 V · 50 Hz"],
      ["Russia", "C/F", "230 V · 50 Hz"], ["Iceland", "C/F", "230 V · 50 Hz"], ["Norway", "C/F", "230 V · 50 Hz"],
      ["Sweden", "C/F", "230 V · 50 Hz"], ["Denmark", "C/E/K", "230 V · 50 Hz"], ["Greece", "C/F", "230 V · 50 Hz"],
    ].map(([c, p, v]) => ({ title: c, sub: "Plug type " + p, right: v, search: c + " " + p })),
  });

  reference({
    id: "nato", name: "Phonetic ABC", icon: "🔠", cat: "Reference", mode: "live",
    grad: "linear-gradient(135deg,#606c88,#3f4c6b)", keywords: "nato alphabet morse alfa bravo spelling",
    items: "Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey Xray Yankee Zulu".split(" ").map((w, i) => {
      const MORSE = ".- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --..".split(" ");
      return { title: w[0] + " — " + w, sub: "Morse " + MORSE[i].replace(/\./g, "·").replace(/-/g, "–"), right: w[0], search: w };
    }),
  });

  reference({
    id: "doneness", name: "Doneness Temps", icon: "🥩", cat: "Kitchen", mode: "live",
    grad: "linear-gradient(135deg,#cb2d3e,#ef473a)", keywords: "meat temperature cooking steak chicken",
    items: [
      ["Beef — rare", "52 °C / 125 °F · rest 8 min"], ["Beef — medium rare", "54 °C / 130 °F · rest 8 min"],
      ["Beef — medium", "60 °C / 140 °F"], ["Beef — well done", "68 °C / 155 °F"],
      ["Ground beef", "71 °C / 160 °F — no pink"], ["Pork chops / roast", "63 °C / 145 °F · rest 3 min"],
      ["Chicken & turkey", "74 °C / 165 °F — always"], ["Duck breast", "57 °C / 135 °F (medium rare)"],
      ["Salmon & fish", "52 °C / 125 °F (moist) – 63 °C safe"], ["Shrimp", "opaque throughout · ~50 °C"],
      ["Lamb — medium rare", "54 °C / 130 °F"], ["Eggs (custards)", "71 °C / 160 °F"],
    ].map(([t, s]) => ({ title: t, sub: s, search: t })),
  });

  /* ---- Resistor decoder (interactive) ---- */
  register({
    id: "resistor", name: "Resistor Codes", icon: "🎚️", cat: "Reference", mode: "live",
    grad: "linear-gradient(135deg,#276873,#1fa2ff)", keywords: "electronics bands ohms color",
    render(body) {
      const COLORS = [["black", 0, "#000"], ["brown", 1, "#7b4a12"], ["red", 2, "#e33"], ["orange", 3, "#f80"], ["yellow", 4, "#fd0"], ["green", 5, "#2a2"], ["blue", 6, "#36f"], ["violet", 7, "#96f"], ["grey", 8, "#999"], ["white", 9, "#fff"]];
      const TOL = [["gold", 5, "#cfa136"], ["silver", 10, "#ccc"], ["brown", 1, "#7b4a12"]];
      body.innerHTML += `
        <div class="t-card t-rows">
          <div class="t-row"><label>Band 1</label><select id="rz-1"></select></div>
          <div class="t-row"><label>Band 2</label><select id="rz-2"></select></div>
          <div class="t-row"><label>Multiplier</label><select id="rz-3"></select></div>
          <div class="t-row"><label>Tolerance</label><select id="rz-4"></select></div>
        </div>
        <div style="display:flex;justify-content:center;gap:6px;padding:14px;background:var(--card);border-radius:14px">
          <div style="width:110px;height:26px;border-radius:13px;background:#d8c49a;position:relative;display:flex;justify-content:space-evenly;align-items:stretch;padding:0 12px">
            <span id="rz-b1" style="width:10px"></span><span id="rz-b2" style="width:10px"></span><span id="rz-b3" style="width:10px"></span><span id="rz-b4" style="width:10px"></span>
          </div>
        </div>
        <div class="t-result"><div class="big" id="rz-out">—</div><div class="sub" id="rz-sub"></div></div>`;
      const sels = [1, 2, 3, 4].map((i) => body.querySelector("#rz-" + i));
      COLORS.forEach(([name, v]) => {
        [0, 1, 2].forEach((i) => { const o = el("option", "", `${name} (${i === 2 ? "×10^" + v : v})`); o.value = v; sels[i].appendChild(o.cloneNode(true)); });
      });
      TOL.forEach(([name, v]) => { const o = el("option", "", `${name} ±${v}%`); o.value = v; sels[3].appendChild(o); });
      sels[0].value = 1; sels[1].value = 0; sels[2].value = 2; sels[3].value = 5;
      function draw() {
        const [a, b, m, t] = sels.map((s) => +s.value);
        const ohms = (a * 10 + b) * Math.pow(10, m);
        const disp = ohms >= 1e6 ? fmt(ohms / 1e6) + " MΩ" : ohms >= 1e3 ? fmt(ohms / 1e3) + " kΩ" : fmt(ohms) + " Ω";
        body.querySelector("#rz-out").textContent = disp;
        body.querySelector("#rz-sub").textContent = `±${t}% → ${fmt(ohms * (1 - t / 100), 0)}–${fmt(ohms * (1 + t / 100), 0)} Ω`;
        const cs = [COLORS[a][2], COLORS[b][2], COLORS[m][2], (TOL.find(([, v]) => v === t) || TOL[0])[2]];
        [1, 2, 3, 4].forEach((i) => { body.querySelector("#rz-b" + i).style.background = cs[i - 1]; });
      }
      sels.forEach((s) => s.addEventListener("change", draw));
      draw();
    },
  });

  /* ================= Trackers ================= */
  tracker({
    id: "subs", name: "Subscriptions", icon: "🔁", cat: "Trackers", mode: "live",
    grad: "linear-gradient(135deg,#2bb8a3,#0f766e)", keywords: "renewals monthly cost",
    fields: [
      { k: "name", label: "Service" },
      { k: "price", label: "Price / month", type: "num" },
      { k: "renew", label: "Renews", type: "date" },
    ],
    sort: (a, b) => (a.renew || "").localeCompare(b.renew || ""),
    line: (it) => ({
      title: it.name, sub: `renews ${it.renew}`,
      badge: "$" + fmt(it.price), badgeCls: "live",
    }),
    footer: (arr) => arr.length ? `Total $${fmt(arr.reduce((s, x) => s + (x.price || 0), 0))}/month · $${fmt(arr.reduce((s, x) => s + (x.price || 0), 0) * 12, 0)}/year` : "Add your subscriptions",
  });

  tracker({
    id: "warranty", name: "Warranty Box", icon: "🧾", cat: "Trackers", mode: "live",
    grad: "linear-gradient(135deg,#136a8a,#267871)", keywords: "receipts expiry guarantee",
    fields: [{ k: "name", label: "Item" }, { k: "exp", label: "Warranty ends", type: "date" }],
    sort: (a, b) => (a.exp || "").localeCompare(b.exp || ""),
    line: (it) => {
      const d = daysUntil(it.exp);
      return {
        title: it.name, sub: `until ${it.exp}`,
        badge: d < 0 ? "expired" : d + " d",
        badgeCls: d < 0 ? "sim" : d < 30 ? "sim" : "live",
      };
    },
  });

  tracker({
    id: "pantry", name: "Use By", icon: "🥫", cat: "Trackers", mode: "live",
    grad: "linear-gradient(135deg,#f2994a,#f2c94c)", keywords: "food expiry fridge pantry",
    fields: [{ k: "name", label: "Food" }, { k: "exp", label: "Use by", type: "date" }],
    sort: (a, b) => (a.exp || "").localeCompare(b.exp || ""),
    line: (it) => {
      const d = daysUntil(it.exp);
      return {
        title: it.name, sub: it.exp,
        badge: d < 0 ? "toss it" : d === 0 ? "today ❗" : d + " d",
        badgeCls: d <= 1 ? "sim" : "live",
      };
    },
  });

  tracker({
    id: "countdown", name: "Countdowns", icon: "🎉", cat: "Trackers", mode: "live",
    grad: "linear-gradient(135deg,#ff6a88,#ff99ac)", keywords: "events days until birthday trip",
    fields: [{ k: "name", label: "Event" }, { k: "date", label: "Date", type: "date" }],
    sort: (a, b) => (a.date || "").localeCompare(b.date || ""),
    line: (it) => {
      const d = daysUntil(it.date);
      return { title: it.name, sub: it.date, badge: d < 0 ? "passed" : d === 0 ? "today 🎉" : "in " + d + " d", badgeCls: d >= 0 && d < 8 ? "sim" : "live" };
    },
  });

  /* ---- Clip Stack (custom, with copy) ---- */
  register({
    id: "clips", name: "Clip Stack", icon: "📋", cat: "Trackers", mode: "live",
    grad: "linear-gradient(135deg,#8360c3,#2ebf91)", keywords: "clipboard snippets copy paste",
    note: "Web apps can't watch the system clipboard — save snippets here, tap to copy.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card"><div class="t-row"><label>Snippet</label><input type="text" id="cl-in" style="width:72%" placeholder="paste or type"></div></div>
        <button class="big-btn" id="cl-add">Save snippet</button>
        <div class="t-list" id="cl-list"></div>`;
      const list = body.querySelector("#cl-list");
      const items = () => store.get("clips", []);
      function draw() {
        list.innerHTML = "";
        items().forEach((text, i) => {
          const li = el("div", "t-li",
            `<div class="li-main" style="cursor:pointer" data-copy="${i}"><strong style="overflow-wrap:anywhere">${esc(text.length > 60 ? text.slice(0, 60) + "…" : text)}</strong><span>tap to copy</span></div>` +
            `<button class="li-x" data-del="${i}">×</button>`);
          list.appendChild(li);
        });
        if (!list.children.length) list.appendChild(el("p", "dyn-note", "No snippets yet"));
      }
      body.querySelector("#cl-add").addEventListener("click", () => {
        const v = body.querySelector("#cl-in").value.trim();
        if (!v) return;
        const arr = items(); arr.unshift(v); store.set("clips", arr.slice(0, 50));
        body.querySelector("#cl-in").value = ""; draw();
      });
      list.addEventListener("click", async (e) => {
        const del = e.target.closest("[data-del]");
        if (del) { const arr = items(); arr.splice(+del.dataset.del, 1); store.set("clips", arr); draw(); return; }
        const cp = e.target.closest("[data-copy]");
        if (cp) {
          try { await navigator.clipboard.writeText(items()[+cp.dataset.copy]); cp.querySelector("span").textContent = "copied ✓"; }
          catch (err) { cp.querySelector("span").textContent = "copy failed"; }
          setTimeout(draw, 900);
        }
      });
      draw();
      def.enter = draw;
    },
  });

  /* ---- Loyalty cards (custom, fullscreen display) ---- */
  register({
    id: "cards", name: "Card Keep", icon: "💳", cat: "Trackers", mode: "live",
    grad: "linear-gradient(135deg,#11998e,#38ef7d)", keywords: "loyalty barcode membership wallet",
    note: "Stores card numbers on this device only. Tap a card for a big bright display to scan at the register.",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card t-rows">
          <div class="t-row"><label>Store</label><input type="text" id="cd-name"></div>
          <div class="t-row"><label>Card number</label><input type="text" id="cd-num" inputmode="numeric"></div>
        </div>
        <button class="big-btn" id="cd-add">Add card</button>
        <div class="t-list" id="cd-list"></div>
        <div id="cd-show" class="modal hidden"><div class="modal-body" style="background:#fff;color:#000">
          <h3 id="cd-show-name" style="color:#000"></h3>
          <div id="cd-bars" style="margin:14px 0;height:80px;display:flex;align-items:stretch;justify-content:center"></div>
          <div id="cd-show-num" style="font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:2px;color:#000"></div>
          <p style="margin-top:10px">Show this at the register — most scanners can key the number.</p>
          <div class="chip-row"><button class="chip active" id="cd-close">Done</button></div>
        </div></div>`;
      const list = body.querySelector("#cd-list");
      const items = () => store.get("loyalty", []);
      function draw() {
        list.innerHTML = "";
        items().forEach((c, i) => {
          const li = el("div", "t-li",
            `<div class="li-main" style="cursor:pointer" data-show="${i}"><strong>${esc(c.name)}</strong><span>•••• ${esc(String(c.num).slice(-4))}</span></div>` +
            `<button class="li-x" data-del="${i}">×</button>`);
          list.appendChild(li);
        });
        if (!list.children.length) list.appendChild(el("p", "dyn-note", "No cards saved"));
      }
      body.querySelector("#cd-add").addEventListener("click", () => {
        const name = body.querySelector("#cd-name").value.trim();
        const num = body.querySelector("#cd-num").value.trim();
        if (!name || !num) return;
        const arr = items(); arr.push({ name, num }); store.set("loyalty", arr);
        body.querySelector("#cd-name").value = body.querySelector("#cd-num").value = "";
        draw();
      });
      list.addEventListener("click", (e) => {
        const del = e.target.closest("[data-del]");
        if (del) { const arr = items(); arr.splice(+del.dataset.del, 1); store.set("loyalty", arr); draw(); return; }
        const show = e.target.closest("[data-show]");
        if (show) {
          const c = items()[+show.dataset.show];
          body.querySelector("#cd-show-name").textContent = c.name;
          body.querySelector("#cd-show-num").textContent = c.num;
          // decorative code-39-style bars from digits (visual aid, numbers do the work)
          const bars = body.querySelector("#cd-bars");
          bars.innerHTML = "";
          String(c.num).split("").forEach((d) => {
            for (let i = 0; i < 3; i++) {
              const w = ((+d + i) % 3) + 1;
              bars.appendChild(el("span", "", "")).style.cssText = `width:${w}px;background:#000;margin-right:2px`;
            }
          });
          body.querySelector("#cd-show").classList.remove("hidden");
        }
      });
      body.querySelector("#cd-close").addEventListener("click", () => body.querySelector("#cd-show").classList.add("hidden"));
      draw();
      def.enter = draw;
    },
  });

  /* ---- Team picker (custom) ---- */
  register({
    id: "teams", name: "Team Picker", icon: "👥", cat: "Party & Fun", mode: "live",
    grad: "linear-gradient(135deg,#00b4db,#0083b0)", keywords: "random names groups draw straws",
    render(body) {
      body.innerHTML += `
        <div class="t-card"><textarea id="tm-names" rows="4" style="width:100%;background:#2c2c34;border:none;border-radius:10px;color:var(--text);font:inherit;padding:10px" placeholder="One name per line">Alex\nSam\nRiley\nJo\nCasey\nDrew</textarea></div>
        <div class="chip-row"><button class="chip active" id="tm-draw">Draw one</button><button class="chip" data-n="2">2 teams</button><button class="chip" data-n="3">3 teams</button><button class="chip" id="tm-order">Random order</button></div>
        <div class="t-result"><div class="big" id="tm-out" style="font-size:20px;white-space:pre-wrap;text-align:left">—</div></div>`;
      const namesEl = body.querySelector("#tm-names"), out = body.querySelector("#tm-out");
      const names = () => namesEl.value.split("\n").map((s) => s.trim()).filter(Boolean);
      const shuffled = () => {
        const a = names().slice();
        for (let i = a.length - 1; i > 0; i--) {
          const buf = new Uint32Array(1); crypto.getRandomValues(buf);
          const j = buf[0] % (i + 1); [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };
      body.querySelector("#tm-draw").addEventListener("click", () => {
        const a = shuffled(); out.textContent = a.length ? "🎉 " + a[0] : "—";
      });
      body.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => {
        const n = +b.dataset.n, a = shuffled();
        if (!a.length) return;
        const teams = Array.from({ length: n }, () => []);
        a.forEach((name, i) => teams[i % n].push(name));
        out.textContent = teams.map((t, i) => `Team ${i + 1}: ${t.join(", ")}`).join("\n");
      }));
      body.querySelector("#tm-order").addEventListener("click", () => {
        out.textContent = shuffled().map((nm, i) => `${i + 1}. ${nm}`).join("\n");
      });
    },
  });

  /* ---- Itemized bill splitter (custom) ---- */
  register({
    id: "billsplit", name: "Who Had What", icon: "🧾", cat: "Money", mode: "live",
    grad: "linear-gradient(135deg,#1d976c,#93f9b9)", keywords: "split dinner itemized share",
    render(body, def) {
      body.innerHTML += `
        <div class="t-card t-rows">
          <div class="t-row"><label>Person</label><input type="text" id="bs-who" style="width:40%"></div>
          <div class="t-row"><label>Item cost</label><input type="text" inputmode="decimal" id="bs-amt" style="width:40%"></div>
        </div>
        <button class="big-btn" id="bs-add">Add item</button>
        <div class="t-card t-rows">
          <div class="t-row"><label>Tax %</label><input type="text" inputmode="decimal" id="bs-tax" value="8.875"></div>
          <div class="t-row"><label>Tip %</label><input type="text" inputmode="decimal" id="bs-tip" value="18"></div>
        </div>
        <div class="t-result"><div class="big" id="bs-out" style="font-size:18px;white-space:pre-wrap;text-align:left">—</div></div>
        <div class="t-list" id="bs-list"></div>
        <button class="big-btn" id="bs-clear" style="background:#3d1412;color:#ff453a">Clear all</button>`;
      const items = () => store.get("billsplit", []);
      const list = body.querySelector("#bs-list"), out = body.querySelector("#bs-out");
      function draw() {
        list.innerHTML = "";
        items().forEach((it, i) => {
          list.appendChild(el("div", "t-li",
            `<div class="li-main"><strong>${esc(it.who)}</strong><span>$${fmt(it.amt)}</span></div><button class="li-x" data-i="${i}">×</button>`));
        });
        const mult = 1 + (parseFloat(body.querySelector("#bs-tax").value) || 0) / 100 + (parseFloat(body.querySelector("#bs-tip").value) || 0) / 100;
        const per = {};
        items().forEach((it) => { per[it.who] = (per[it.who] || 0) + it.amt; });
        const lines = Object.entries(per).map(([w, a]) => `${w}: $${fmt(a * mult)}`);
        const total = items().reduce((s, x) => s + x.amt, 0);
        out.textContent = lines.length ? lines.join("\n") + `\n— total $${fmt(total * mult)} incl. tax & tip` : "—";
      }
      body.querySelector("#bs-add").addEventListener("click", () => {
        const who = body.querySelector("#bs-who").value.trim();
        const amt = parseFloat(body.querySelector("#bs-amt").value);
        if (!who || !amt) return;
        const arr = items(); arr.push({ who, amt }); store.set("billsplit", arr);
        body.querySelector("#bs-amt").value = ""; draw();
      });
      list.addEventListener("click", (e) => {
        if (e.target.dataset && e.target.dataset.i !== undefined) {
          const arr = items(); arr.splice(+e.target.dataset.i, 1); store.set("billsplit", arr); draw();
        }
      });
      ["#bs-tax", "#bs-tip"].forEach((s) => body.querySelector(s).addEventListener("input", draw));
      body.querySelector("#bs-clear").addEventListener("click", () => { store.set("billsplit", []); draw(); });
      draw();
      def.enter = draw;
    },
  });
})();
