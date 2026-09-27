/* Solo Ledger runtime: theme, menu, case filters (synced to the URL hash), idea filter, TOC highlight. No dependencies. */
(function () {
  "use strict";

  var store = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem("solo." + k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set: function (k, v) { try { localStorage.setItem("solo." + k, JSON.stringify(v)); } catch (e) {} },
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- theme + menu ---------- */
  var themeBtn = $(".theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-theme");
      var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var isDark = current ? current === "dark" : systemDark;
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("theme", next);
    });
  }
  var menuBtn = $(".menu-btn");
  var nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- case filters ---------- */
  var list = $("#cards");
  var filters = $("#filters");
  if (list && filters) {
    var cards = $$(".card", list);
    var q = $("#q");
    var sel = { cat: $("#f-cat"), model: $("#f-model"), channel: $("#f-channel"), band: $("#f-band") };
    var sort = $("#sort");
    var countEl = $("#count");
    var emptyEl = $("#empty");

    var sorters = {
      annual: function (a, b) { return b.dataset.annual - a.dataset.annual; },
      "started-desc": function (a, b) { return b.dataset.started - a.dataset.started || b.dataset.annual - a.dataset.annual; },
      "started-asc": function (a, b) { return a.dataset.started - b.dataset.started || b.dataset.annual - a.dataset.annual; },
      diff: function (a, b) { return a.dataset.diff - b.dataset.diff || b.dataset.annual - a.dataset.annual; },
      name: function (a, b) { return a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent); },
    };

    var readHash = function () {
      var p = new URLSearchParams(location.hash.slice(1));
      Object.keys(sel).forEach(function (k) {
        var v = p.get(k);
        if (sel[k] && v && sel[k].querySelector('option[value="' + CSS.escape(v) + '"]')) sel[k].value = v;
      });
      if (p.get("q")) q.value = p.get("q");
      if (p.get("sort") && sorters[p.get("sort")]) sort.value = p.get("sort");
    };
    var writeHash = function () {
      var p = new URLSearchParams();
      Object.keys(sel).forEach(function (k) { if (sel[k] && sel[k].value !== "all") p.set(k, sel[k].value); });
      if (q.value.trim()) p.set("q", q.value.trim());
      if (sort.value !== "annual") p.set("sort", sort.value);
      var h = p.toString();
      history.replaceState(null, "", h ? "#" + h : location.pathname + location.search);
    };

    var apply = function () {
      var terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      var shown = 0;
      cards.forEach(function (c) {
        var ok = Object.keys(sel).every(function (k) { return !sel[k] || sel[k].value === "all" || c.dataset[k] === sel[k].value; });
        if (ok && terms.length) ok = terms.every(function (t) { return c.dataset.text.indexOf(t) !== -1; });
        c.hidden = !ok;
        if (ok) shown += 1;
      });
      cards.slice().sort(sorters[sort.value] || sorters.annual).forEach(function (c) { list.appendChild(c); });
      countEl.textContent = shown === cards.length ? cards.length + " cases" : shown + " of " + cards.length + " cases";
      emptyEl.hidden = shown !== 0;
      writeHash();
    };

    readHash();
    filters.addEventListener("input", apply);
    filters.addEventListener("change", apply);
    $("#reset").addEventListener("click", function () {
      q.value = "";
      Object.keys(sel).forEach(function (k) { if (sel[k]) sel[k].value = "all"; });
      sort.value = "annual";
      apply();
    });
    window.addEventListener("hashchange", function () { readHash(); apply(); });
    apply();
  }

  /* ---------- idea difficulty chips ---------- */
  var ideas = $("#ideas");
  if (ideas) {
    var chips = $$(".chip[data-diff]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var d = chip.dataset.diff;
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        $$(".idea", ideas).forEach(function (i) { i.hidden = d !== "all" && i.dataset.diff !== d; });
      });
    });
  }

  /* ---------- fit scanner ---------- */
  var scanner = $("#scanner");
  var dataEl = $("#scanner-data");
  if (scanner && dataEl) {
    var CASES = JSON.parse(dataEl.textContent);
    var OWN = ["build-in-public", "twitter-x", "linkedin", "newsletter", "youtube"];
    var SKILL = {
      code: { saas: 3, "dev-tools": 3, "ai-app": 3, "data-api": 1 },
      data: { "data-api": 4, "marketplace-directory": 3, saas: 1 },
      writing: { "content-media": 4, "info-products": 4, "templates-digital": 1 },
      design: { "templates-digital": 4, saas: 1, "ai-app": 1, "info-products": 1 },
    };
    var MODEL = { recurring: ["subscription", "mixed"], once: ["one-time", "mixed"], ads: ["ads", "sponsorship", "mixed"] };
    var PLATFORM_HEAVY = ["ai-app"];
    var SKILL_LABEL = { code: "building apps", data: "data work", writing: "writing and teaching", design: "design" };

    var score = function (c, a) {
      var s = 0, why = [], warn = [];
      var sk = (SKILL[a.skill] || {})[c.cat] || 0;
      s += sk;
      if (sk >= 3) why.push("fits your strength in " + SKILL_LABEL[a.skill]);
      var hours = Number(a.hours);
      if (c.hours > hours) { s -= 3; warn.push("the plan wants " + c.hours + "+ h/week"); }
      else why.push("fits " + (hours >= 25 ? "20+" : hours) + " h/week");
      var own = OWN.indexOf(c.channel) !== -1;
      var aud = { none: -3, small: -1, medium: 1, large: 3 }[a.audience];
      if (own) {
        s += aud + (a.posting === "yes" ? 2 : -2);
        if (aud > 0 && a.posting === "yes") why.push("uses the audience you already have");
        if (aud < 0 || a.posting === "no") warn.push("it grew through the founder's own following");
      } else {
        s += { none: 2, small: 1, medium: 0, large: 0 }[a.audience];
        if (a.audience === "none" || a.audience === "small") why.push("grew without a personal audience");
      }
      if (a.model !== "any") {
        if (MODEL[a.model].indexOf(c.model) !== -1) { s += 2; why.push("matches how you want to get paid"); }
        else s -= 1;
      }
      if (a.platform === "avoid" && PLATFORM_HEAVY.indexOf(c.cat) !== -1) { s -= 2; warn.push("depends on third-party AI APIs"); }
      if (a.speed === "fast") {
        if (c.diff <= 2) { s += 2; why.push("the idea is quick to build"); }
        else if (c.diff >= 4) { s -= 2; warn.push("the idea takes a long build"); }
      } else if (c.diff >= 3) s += 1;
      if (c.potential === "high") s += 1;
      return { c: c, s: s, why: why, warn: warn };
    };

    var escHtml = function (t) { return String(t).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); };

    scanner.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(scanner);
      var a = {};
      ["hours", "skill", "audience", "posting", "model", "platform", "speed"].forEach(function (k) { a[k] = fd.get(k); });
      var missing = Object.keys(a).some(function (k) { return !a[k]; });
      $("#scanner-missing").hidden = !missing;
      if (missing) return;
      var ranked = CASES.map(function (c) { return score(c, a); }).sort(function (x, y) { return y.s - x.s; });
      var top = ranked.slice(0, 3);
      var bottom = ranked.slice(-3).reverse();
      var html = "<h2>Your best-fit playbooks</h2><ol class=\"matches\">" + top.map(function (r, i) {
        return "<li class=\"panel\"><span class=\"n\">" + (i + 1) + "</span><div><h3><a href=\"" + r.c.url + "\">" + escHtml(r.c.name) + "</a> <small>" + escHtml(r.c.rev) + "</small></h3>" +
          (r.why.length ? "<p><strong>Why:</strong> " + escHtml(r.why.slice(0, 3).join("; ")) + ".</p>" : "") +
          (r.warn.length ? "<p class=\"warn\"><strong>Watch out:</strong> " + escHtml(r.warn.join("; ")) + ".</p>" : "") +
          "<p class=\"idea-line\"><strong>Build next:</strong> <a href=\"" + r.c.url + "#rebuild\">" + escHtml(r.c.idea) + "</a></p></div></li>";
      }).join("") + "</ol>" +
        "<h3>Weakest fits for you</h3><p class=\"small\">" + bottom.map(function (r) { return "<a href=\"" + r.c.url + "\">" + escHtml(r.c.name) + "</a>" + (r.warn.length ? " (" + escHtml(r.warn[0]) + ")" : ""); }).join(" · ") + "</p>" +
        "<p class=\"small\">A heuristic score, not a prediction. It weighs skill match, time, audience, payment model, platform risk and build speed.</p>" +
        "<button type=\"button\" class=\"btn btn-ghost\" id=\"scanner-again\">Change answers</button>";
      var out = $("#scanner-result");
      out.innerHTML = html;
      out.hidden = false;
      out.scrollIntoView({ behavior: "smooth", block: "start" });
      $("#scanner-again").addEventListener("click", function () { scanner.scrollIntoView({ behavior: "smooth" }); });
    });
  }

  /* ---------- table of contents highlight ---------- */
  var tocLinks = $$(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove("active"); });
        if (byId[e.target.id]) byId[e.target.id].classList.add("active");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
