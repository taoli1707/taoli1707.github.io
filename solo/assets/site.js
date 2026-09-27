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
