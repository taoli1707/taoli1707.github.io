/* Weekend Fixer runtime: theme, menu, symptom search, step progress, savings tally, checklist, calculator. No dependencies. */
(function () {
  "use strict";

  var store = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem("fixit." + k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set: function (k, v) { try { localStorage.setItem("fixit." + k, JSON.stringify(v)); } catch (e) {} },
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };

  var toastEl = $(".toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

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

  /* ---------- done tally (home + index + cards everywhere) ---------- */
  var done = store.get("done", {});
  var indexEl = $("#guide-index");
  var index = indexEl ? JSON.parse(indexEl.textContent) : null;

  $$(".card").forEach(function (c) {
    if (done[c.getAttribute("data-slug")]) c.classList.add("is-done");
  });

  var stats = $("#stats");
  if (stats && index) {
    var n = 0, saved = 0;
    index.forEach(function (g) {
      if (done[g.slug]) { n += 1; saved += Math.max(0, g.proMid - g.partsMid); }
    });
    if (n > 0) {
      stats.textContent = "You have finished " + n + (n === 1 ? " fix" : " fixes") + " and skipped about " + money(saved) + " in pro bills.";
      stats.classList.add("show");
    }
  }

  /* ---------- symptom search + category chips ---------- */
  var input = $("#symptom");
  var results = $("#search-results");
  var cards = $$("#cards .card");
  var activeCat = "all";

  function tokens(s) { return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(function (t) { return t.length > 1; }); }
  function score(g, q, qTokens) {
    var s = 0;
    var title = g.title.toLowerCase();
    if (title.indexOf(q) >= 0) s += 6;
    g.symptoms.forEach(function (sym) { if (sym.indexOf(q) >= 0) s += 5; });
    qTokens.forEach(function (t) {
      if (title.indexOf(t) >= 0) s += 3;
      g.symptoms.forEach(function (sym) { if (sym.indexOf(t) >= 0) s += 2; });
      g.keywords.forEach(function (k) { if (k.indexOf(t) >= 0) s += 1; });
    });
    return s;
  }
  function applyFilters() {
    var q = input ? input.value.trim().toLowerCase() : "";
    var qTokens = tokens(q);
    var scored = {};
    if (index && q.length >= 2) index.forEach(function (g) { scored[g.slug] = score(g, q, qTokens); });
    cards.forEach(function (c) {
      var slug = c.getAttribute("data-slug");
      var catOk = activeCat === "all" || c.getAttribute("data-cat") === activeCat;
      var qOk = q.length < 2 || (scored[slug] || 0) > 0;
      c.classList.toggle("hidden", !(catOk && qOk));
    });
    if (results && index) {
      if (q.length < 2) { results.classList.remove("show"); results.innerHTML = ""; return; }
      var top = index.map(function (g) { return { g: g, s: scored[g.slug] || 0 }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 5);
      results.innerHTML = top.length
        ? top.map(function (x) { return '<li><a href="' + x.g.url + '"><span>' + escapeHtml(x.g.title) + '</span><span class="muted small">saves ~' + money(x.g.proMid - x.g.partsMid) + "</span></a></li>"; }).join("")
        : '<li class="none">No guide matches that yet. Try fewer words, or browse the categories below.</li>';
      results.classList.add("show");
    }
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  if (input) {
    input.addEventListener("input", applyFilters);
    $$("[data-example]").forEach(function (b) {
      b.addEventListener("click", function () { input.value = b.getAttribute("data-example"); input.focus(); applyFilters(); });
    });
  }
  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeCat = chip.getAttribute("data-cat");
      $$(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      applyFilters();
    });
  });

  /* ---------- guide page: steps, progress, done, copy list ---------- */
  var article = $("article[data-slug]");
  if (article) {
    var slug = article.getAttribute("data-slug");
    var proMid = parseFloat(article.getAttribute("data-pro-mid"));
    var partsMid = parseFloat(article.getAttribute("data-parts-mid"));
    var boxes = $$("#step-list input[type=checkbox]");
    var stepState = store.get("steps." + slug, []);
    var progressText = $("#progress-text");
    var progressBar = $("#progress-bar");

    function renderSteps() {
      var doneCount = 0;
      boxes.forEach(function (b, i) {
        var on = !!stepState[i];
        b.checked = on;
        b.closest("li").classList.toggle("done", on);
        if (on) doneCount += 1;
      });
      if (progressText) progressText.textContent = doneCount + " of " + boxes.length + " steps";
      if (progressBar) progressBar.style.width = (boxes.length ? (doneCount / boxes.length) * 100 : 0) + "%";
    }
    boxes.forEach(function (b, i) {
      b.addEventListener("change", function () {
        stepState[i] = b.checked;
        store.set("steps." + slug, stepState);
        renderSteps();
      });
    });
    renderSteps();

    var doneBox = $("#done-box");
    var doneBtn = $("#done-btn");
    var doneMsg = $("#done-msg");
    function renderDone() {
      var isDone = !!done[slug];
      doneBox.classList.toggle("is-done", isDone);
      doneBtn.textContent = isDone ? "Undo: mark as not done" : "Mark this fix done";
      doneMsg.textContent = isDone ? "Nice work. That is roughly " + money(proMid - partsMid) + " you did not pay a pro." : "";
    }
    if (doneBtn) {
      doneBtn.addEventListener("click", function () {
        if (done[slug]) { delete done[slug]; } else { done[slug] = new Date().toISOString().slice(0, 10); toast("Saved to your tally"); }
        store.set("done", done);
        renderDone();
      });
      renderDone();
    }

    var copyBtn = $("#copy-list");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var lines = [article.getAttribute("data-title") + " — shopping list"];
        $$(".needs .panel").forEach(function (p) {
          lines.push("");
          lines.push($("h3", p).textContent + ":");
          $$("li", p).forEach(function (li) { lines.push("- " + $(".name", li).textContent + ($(".opt", li) ? " (optional)" : "")); });
        });
        var text = lines.join("\n");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { toast("Shopping list copied"); }, function () { fallbackCopy(text); });
        } else { fallbackCopy(text); }
      });
    }
    function fallbackCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.left = "-999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("Shopping list copied"); } catch (e) { toast("Select and copy the list manually"); }
      document.body.removeChild(ta);
    }
  }

  /* ---------- checklist ---------- */
  var checklist = $(".checklist");
  if (checklist) {
    var ticks = store.get("checklist", {});
    var items = $$(".checklist input[type=checkbox]");
    items.forEach(function (b) {
      b.checked = !!ticks[b.getAttribute("data-key")];
      b.addEventListener("change", function () {
        ticks[b.getAttribute("data-key")] = b.checked;
        store.set("checklist", ticks);
      });
    });
    var printBtn = $("#print-btn");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    var resetBtn = $("#reset-checklist");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      ticks = {}; store.set("checklist", ticks);
      items.forEach(function (b) { b.checked = false; });
      toast("Checklist cleared");
    });
  }

  /* ---------- DIY-or-pro calculator ---------- */
  var calcData = $("#calc-data");
  if (calcData) {
    var data = JSON.parse(calcData.textContent);
    var jobSel = $("#job"), hourlyIn = $("#hourly"), skillSel = $("#skill"), toolsChk = $("#tools");
    var params = new URLSearchParams(location.search);
    if (params.get("job") && data.jobs.some(function (j) { return j.slug === params.get("job"); })) jobSel.value = params.get("job");

    function calc() {
      var job = data.jobs.filter(function (j) { return j.slug === jobSel.value; })[0];
      var hourly = Math.max(0, parseFloat(hourlyIn.value) || 0);
      var skill = parseFloat(skillSel.value) || 1;
      var proMid = (job.proLow + job.proHigh) / 2;
      var parts = (job.partsLow + job.partsHigh) / 2;
      var toolCost = toolsChk.checked ? (job.toolCost || 0) + 60 : 0; // $60 ≈ the hand tools every job needs; job-specific tools on top
      var hours = ((job.hoursLow + job.hoursHigh) / 2) * skill;
      var timeValue = hours * hourly;
      var diyCash = parts + toolCost;
      var diyTotal = diyCash + timeValue;
      var cash = proMid - diyCash;
      var net = proMid - diyTotal;
      var firstTimer = skill > 1.2;

      var verdict = $("#verdict"), note = $("#verdict-note");
      verdict.className = "verdict";
      if (net > 0) {
        verdict.classList.add("diy");
        verdict.textContent = "Do it yourself. You come out " + money(net) + " ahead.";
        note.textContent = job.risk && firstTimer
          ? "Worth doing, and " + job.risk + " Read the safety box in the guide twice and stop if anything looks different from what it describes."
          : "Even after paying yourself " + money(hourly) + "/hr for " + hours.toFixed(1) + " hours, DIY wins. The next time you do this job it will take half as long.";
      } else if (cash > 0) {
        verdict.classList.add("pro");
        verdict.textContent = "Toss-up. You keep " + money(cash) + " in cash, but it costs you " + hours.toFixed(1) + " hours.";
        note.textContent = "If the weekend is free anyway, do it; the skill pays off on every future repair. If you are skipping paid work, hire it out.";
      } else {
        verdict.classList.add("pro");
        verdict.textContent = "Hire it out this time.";
        note.textContent = "Between tools and your time, a pro is cheaper here. Buy the tools once and this flips on the next job.";
      }
      var max = Math.max(proMid, diyTotal, 1);
      $("#bar-pro").style.width = (proMid / max) * 100 + "%";
      $("#bar-diy").style.width = (diyCash / max) * 100 + "%";
      $("#bar-time").style.width = (diyTotal / max) * 100 + "%";
      $("#amt-pro").textContent = money(proMid);
      $("#amt-diy").textContent = money(diyCash);
      $("#amt-time").textContent = money(diyTotal);
      $("#d-pro").textContent = "$" + job.proLow + "–" + job.proHigh;
      $("#d-parts").textContent = "$" + job.partsLow + "–" + job.partsHigh;
      $("#d-tools").textContent = toolCost ? money(toolCost) + " (one-time)" : "$0";
      $("#d-hours").textContent = hours.toFixed(1) + " h × " + money(hourly) + " = " + money(timeValue);
      $("#d-cash").textContent = money(cash);
      $("#d-net").textContent = (net >= 0 ? "+" : "−") + money(Math.abs(net));
      $("#source").innerHTML = escapeHtml(job.proLabel) + ". Source: <a href=\"" + escapeHtml(job.source.url) + "\" rel=\"noopener\" target=\"_blank\">" + escapeHtml(job.source.title) + "</a>.";
      $("#go-guide").setAttribute("href", job.url);
      $("#go-guide").textContent = "Open the guide: " + job.label;
    }
    [jobSel, hourlyIn, skillSel, toolsChk].forEach(function (el) { el.addEventListener("input", calc); el.addEventListener("change", calc); });
    calc();
  }
})();
