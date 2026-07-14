/* ===== CFA Level 1 Interactive Learning — shared engine =====
   Handles: top nav, TOC generation, section progress tracking,
   inline quizzes, spaced-repetition flashcards, mock exam builder.
   All state lives in localStorage — no server needed. */

(function () {
  "use strict";

  var LS_PROGRESS = "cfa-progress-v1";   // { slug: { done: [secId,...] } }
  var LS_QUIZ = "cfa-quizbest-v1";       // { slug: { correct, total, when } }
  var LS_CARDS = "cfa-cards-v1";         // { cardId: { box, due } }
  var LS_EXAMS = "cfa-exams-v1";         // [ { when, correct, total, byTopic } ]

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  }
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  // Allow a small whitelist of inline formatting in authored strings
  // (questions/explanations are authored by us, not user input, but keep it tidy).
  function fmt(s) { return s == null ? "" : String(s); }

  var LETTERS = ["A", "B", "C", "D"];

  /* ---------- Top navigation ---------- */
  function buildNav() {
    var mount = document.getElementById("topnav");
    if (!mount) return;
    var root = mount.getAttribute("data-root") || ".";
    var here = mount.getAttribute("data-here") || "";
    var links = [
      ["index.html", "Dashboard"],
      ["study-guide.html", "How to Study"],
      ["flashcards.html", "Flashcards"],
      ["exam.html", "Mock Exam"],
      ["formulas.html", "Formula Sheet"]
    ];
    var html = '<div class="topnav-inner"><a class="brand" href="' + root + '/index.html">📈 CFA Level 1 Prep</a><nav class="navlinks">';
    links.forEach(function (l) {
      var active = here === l[0] ? ' class="active"' : "";
      html += '<a href="' + root + "/" + l[0] + '"' + active + ">" + l[1] + "</a>";
    });
    html += "</nav></div>";
    mount.innerHTML = html;
  }

  /* ---------- Topic pages: TOC + progress + section completion ---------- */
  function currentSlug() {
    var main = document.querySelector("main[data-topic]");
    return main ? main.getAttribute("data-topic") : null;
  }

  function initTopicPage() {
    var slug = currentSlug();
    if (!slug) return;
    var sections = Array.prototype.slice.call(document.querySelectorAll("section.lm"));
    var progress = load(LS_PROGRESS, {});
    var mine = progress[slug] || { done: [] };

    // Build TOC
    var toc = document.getElementById("toc-list");
    if (toc) {
      sections.forEach(function (sec) {
        var h2 = sec.querySelector("h2");
        if (!h2 || !sec.id) return;
        var li = document.createElement("li");
        li.id = "toc-" + sec.id;
        if (mine.done.indexOf(sec.id) >= 0) li.className = "toc-done";
        var a = document.createElement("a");
        a.href = "#" + sec.id;
        a.textContent = h2.textContent;
        li.appendChild(a);
        toc.appendChild(li);
      });
      var quizLi = document.createElement("li");
      quizLi.innerHTML = '<a href="#quiz"><strong>Practice quiz</strong></a>';
      toc.appendChild(quizLi);
    }

    // Mark-complete buttons
    sections.forEach(function (sec) {
      if (!sec.id) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mark-complete";
      function render() {
        var done = mine.done.indexOf(sec.id) >= 0;
        btn.classList.toggle("done", done);
        btn.innerHTML = done ? "✓ Section complete — click to unmark" : "○ Mark section complete";
        var tocLi = document.getElementById("toc-" + sec.id);
        if (tocLi) tocLi.classList.toggle("toc-done", done);
      }
      btn.addEventListener("click", function () {
        var i = mine.done.indexOf(sec.id);
        if (i >= 0) mine.done.splice(i, 1); else mine.done.push(sec.id);
        progress[slug] = mine;
        save(LS_PROGRESS, progress);
        render();
        renderTopicProgressBar(slug, sections.length, mine.done.length);
      });
      render();
      sec.appendChild(btn);
    });

    renderTopicProgressBar(slug, sections.length, mine.done.length);

    // Record section count so the dashboard can compute % without visiting DOM
    var meta = load("cfa-sectioncounts-v1", {});
    meta[slug] = sections.length;
    save("cfa-sectioncounts-v1", meta);

    // Render quiz from data file
    var data = window.CFA_DATA && window.CFA_DATA[slug];
    if (data && data.questions) renderQuiz(slug, data.questions);
  }

  function renderTopicProgressBar(slug, total, done) {
    var bar = document.getElementById("topic-progress");
    if (!bar || !total) return;
    var pct = Math.round((done / total) * 100);
    bar.innerHTML = '<div class="progress-label">' + done + " / " + total +
      ' sections complete (' + pct + '%)</div><div class="progressbar"><span style="width:' + pct + '%"></span></div>';
  }

  /* ---------- Quiz engine ---------- */
  function renderQuiz(slug, questions, opts) {
    opts = opts || {};
    var mount = document.getElementById(opts.mountId || "quiz");
    if (!mount) return;
    var answered = 0, correct = 0;

    var head = document.createElement("div");
    head.innerHTML = "<h2 id='quiz'>Practice quiz — " + esc(questions.length) + " questions</h2>" +
      "<p class='muted'>Answer from memory before peeking. Retrieval practice — actually committing to an answer — is what makes this stick.</p>";
    mount.appendChild(head);

    var scoreBox = document.createElement("div");
    scoreBox.className = "quiz-score";

    questions.forEach(function (q, qi) {
      var wrapper = document.createElement("div");
      wrapper.className = "quiz-q card";
      var meta = q.section ? '<div class="qmeta">' + fmt(q.section) + "</div>" : "";
      wrapper.innerHTML = meta + '<div class="qtext">' + (qi + 1) + ". " + fmt(q.q) + "</div>";
      var choicesDiv = document.createElement("div");
      choicesDiv.className = "choices";
      var expl = document.createElement("div");
      expl.className = "quiz-expl";

      q.choices.forEach(function (c, ci) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.innerHTML = '<span class="letter">' + LETTERS[ci] + ".</span><span>" + fmt(c) + "</span>";
        b.addEventListener("click", function () {
          if (b.disabled) return;
          var buttons = choicesDiv.querySelectorAll("button");
          for (var k = 0; k < buttons.length; k++) buttons[k].disabled = true;
          var isRight = ci === q.answer;
          b.classList.add(isRight ? "correct" : "incorrect");
          buttons[q.answer].classList.add("correct");
          answered++;
          if (isRight) correct++;
          expl.innerHTML = '<span class="verdict ' + (isRight ? "ok" : "no") + '">' +
            (isRight ? "Correct. " : "Not quite — the answer is " + LETTERS[q.answer] + ". ") +
            "</span> " + fmt(q.expl);
          expl.classList.add("show");
          scoreBox.textContent = "Score: " + correct + " / " + answered + " answered (" + questions.length + " total)";
          if (answered === questions.length) {
            scoreBox.textContent += " — final: " + Math.round((correct / questions.length) * 100) + "%";
            if (slug) {
              var best = load(LS_QUIZ, {});
              var prev = best[slug];
              if (!prev || correct / questions.length >= prev.correct / prev.total) {
                best[slug] = { correct: correct, total: questions.length, when: new Date().toISOString().slice(0, 10) };
                save(LS_QUIZ, best);
              }
            }
          }
        });
        choicesDiv.appendChild(b);
      });

      wrapper.appendChild(choicesDiv);
      wrapper.appendChild(expl);
      mount.appendChild(wrapper);
    });
    mount.appendChild(scoreBox);
  }

  /* ---------- Dashboard ---------- */
  function initDashboard() {
    var grid = document.getElementById("topic-grid");
    if (!grid) return;
    var progress = load(LS_PROGRESS, {});
    var counts = load("cfa-sectioncounts-v1", {});
    var quizBest = load(LS_QUIZ, {});
    var totalDone = 0, totalSecs = 0;

    window.CFA_TOPICS.forEach(function (t) {
      var data = window.CFA_DATA && window.CFA_DATA[t.slug];
      var nSecs = (data && data.sections && data.sections.length) || counts[t.slug] || 0;
      var done = (progress[t.slug] && progress[t.slug].done.length) || 0;
      if (done > nSecs) done = nSecs;
      totalDone += done; totalSecs += nSecs;
      var pct = nSecs ? Math.round((done / nSecs) * 100) : 0;
      var best = quizBest[t.slug];
      var bestTxt = best ? "Best quiz: " + Math.round((best.correct / best.total) * 100) + "%" : "Quiz not attempted";
      var nQ = (data && data.questions && data.questions.length) || 0;

      var card = document.createElement("div");
      card.className = "card topic-card";
      card.innerHTML =
        '<h3><a class="stretch" href="topics/' + t.slug + '.html">' + esc(t.name) + "</a></h3>" +
        '<div class="weight">Exam weight: ' + esc(t.weight) + (nQ ? " · " + nQ + " practice questions" : "") + "</div>" +
        '<div class="progressbar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="progress-label">' + done + "/" + nSecs + " sections · " + bestTxt + "</div>";
      grid.appendChild(card);
    });

    var overall = document.getElementById("overall-progress");
    if (overall && totalSecs) {
      var pctAll = Math.round((totalDone / totalSecs) * 100);
      overall.innerHTML = '<div class="progress-label">Overall curriculum progress: ' + totalDone + " / " + totalSecs +
        ' sections (' + pctAll + '%)</div><div class="progressbar"><span style="width:' + pctAll + '%"></span></div>';
    }

    // Flashcards due today
    var dueBox = document.getElementById("cards-due");
    if (dueBox) {
      var due = countDueCards();
      dueBox.innerHTML = due.total === 0
        ? "No flashcards seen yet — <a href='flashcards.html'>start a review session</a>."
        : "<strong>" + due.due + "</strong> flashcards due for review (" + due.total + " seen so far). <a href='flashcards.html'>Review now →</a>";
    }
  }

  /* ---------- Flashcards: Leitner-style spaced repetition ----------
     Boxes 0..5 with intervals in days. "Again" resets to box 0 (due in 10 min),
     "Hard" keeps box (due in 1 day), "Good" moves up one, "Easy" moves up two. */
  var BOX_DAYS = [0, 1, 3, 7, 16, 35];
  function allCards() {
    var cards = [];
    window.CFA_TOPICS.forEach(function (t) {
      var d = window.CFA_DATA && window.CFA_DATA[t.slug];
      if (d && d.flashcards) d.flashcards.forEach(function (c) {
        cards.push({ id: c.id, front: c.front, back: c.back, topic: t.slug, topicName: t.name });
      });
    });
    return cards;
  }
  function countDueCards() {
    var state = load(LS_CARDS, {});
    var now = Date.now(), due = 0, total = 0;
    Object.keys(state).forEach(function (id) {
      total++;
      if (state[id].due <= now) due++;
    });
    return { due: due, total: total };
  }

  function initFlashcards() {
    var mount = document.getElementById("flashcard-app");
    if (!mount) return;
    var state = load(LS_CARDS, {});
    var cards = allCards();
    var byTopic = {};
    cards.forEach(function (c) { (byTopic[c.topic] = byTopic[c.topic] || []).push(c); });

    // Topic picker
    var picker = document.createElement("div");
    picker.className = "card";
    var pickHtml = "<h3 style='margin-top:0'>Choose decks</h3><div class='btnrow' style='margin:0'>";
    window.CFA_TOPICS.forEach(function (t) {
      var n = (byTopic[t.slug] || []).length;
      if (!n) return;
      pickHtml += "<label style='display:inline-flex;align-items:center;gap:0.35rem;font-size:0.9rem'>" +
        "<input type='checkbox' checked data-deck='" + t.slug + "'> " + esc(t.name) + " (" + n + ")</label>";
    });
    pickHtml += "</div><div class='btnrow'><button class='btn' id='start-due'>Review due cards</button>" +
      "<button class='btn secondary' id='start-all'>Study all selected (incl. new)</button></div>" +
      "<p class='muted' style='margin:0;font-size:0.88rem'>Cards you rate move through 6 spaced boxes (review after 1, 3, 7, 16, 35 days). " +
      "“Again” sends a card back to the start; “Easy” jumps it two boxes.</p>";
    picker.innerHTML = pickHtml;
    mount.appendChild(picker);

    var stage = document.createElement("div");
    stage.style.marginTop = "1.2rem";
    mount.appendChild(stage);

    function selectedDecks() {
      var out = [];
      picker.querySelectorAll("input[data-deck]:checked").forEach(function (i) { out.push(i.getAttribute("data-deck")); });
      return out;
    }

    function startSession(mode) {
      state = load(LS_CARDS, {});
      var decks = selectedDecks();
      var now = Date.now();
      var pool = cards.filter(function (c) {
        if (decks.indexOf(c.topic) < 0) return false;
        var st = state[c.id];
        if (mode === "due") return st && st.due <= now;
        return !st || st.due <= now; // all = due + never-seen
      });
      // Shuffle (Fisher-Yates)
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      if (pool.length > 40) pool = pool.slice(0, 40); // digestible sessions
      runSession(pool, mode);
    }

    function runSession(pool, mode) {
      stage.innerHTML = "";
      if (!pool.length) {
        stage.innerHTML = "<div class='card'><p style='margin:0'>🎉 Nothing " +
          (mode === "due" ? "due right now" : "to study in the selected decks") +
          ". Come back later — spacing out reviews is the point.</p></div>";
        return;
      }
      var idx = 0, flipped = false, reviewed = 0;

      var holder = document.createElement("div");
      holder.className = "flashcard-holder";
      var cardEl = document.createElement("div");
      cardEl.className = "flashcard";
      holder.appendChild(cardEl);
      var rates = document.createElement("div");
      rates.className = "rate-row";
      rates.innerHTML =
        "<button class='btn again' data-rate='again'>Again</button>" +
        "<button class='btn hard' data-rate='hard'>Hard</button>" +
        "<button class='btn good' data-rate='good'>Good</button>" +
        "<button class='btn easy' data-rate='easy'>Easy</button>";
      var stats = document.createElement("div");
      stats.className = "deck-stats";
      stage.appendChild(holder);
      stage.appendChild(rates);
      stage.appendChild(stats);

      function show() {
        if (idx >= pool.length) {
          stage.innerHTML = "<div class='card'><h3 style='margin-top:0'>Session complete ✅</h3><p>You reviewed " +
            reviewed + " cards. They're now scheduled into future days automatically.</p>" +
            "<button class='btn' id='again-session'>Start another session</button></div>";
          document.getElementById("again-session").addEventListener("click", function () { startSession(mode); });
          return;
        }
        var c = pool[idx];
        flipped = false;
        cardEl.innerHTML = "<span class='side-label'>" + esc(c.topicName) + " · card " + (idx + 1) + "/" + pool.length +
          " · QUESTION (click to flip)</span><div>" + fmt(c.front) + "</div>";
        rates.style.visibility = "hidden";
        stats.textContent = "Click the card (or press space) to reveal the answer, then rate how well you recalled it.";
      }
      function flip() {
        if (flipped || idx >= pool.length) return;
        var c = pool[idx];
        flipped = true;
        cardEl.innerHTML = "<span class='side-label'>" + esc(c.topicName) + " · ANSWER</span><div>" + fmt(c.back) + "</div>";
        rates.style.visibility = "visible";
        stats.textContent = "How well did you recall it?";
      }
      cardEl.addEventListener("click", flip);
      document.addEventListener("keydown", function (e) {
        if (e.code === "Space" && stage.contains(cardEl)) { e.preventDefault(); flip(); }
      });

      rates.addEventListener("click", function (e) {
        var rate = e.target && e.target.getAttribute && e.target.getAttribute("data-rate");
        if (!rate || !flipped) return;
        var c = pool[idx];
        var st = state[c.id] || { box: 0, due: 0 };
        if (rate === "again") { st.box = 0; st.due = Date.now() + 10 * 60 * 1000; pool.push(c); }
        else if (rate === "hard") { st.due = Date.now() + BOX_DAYS[Math.max(1, st.box)] * 864e5; }
        else if (rate === "good") { st.box = Math.min(st.box + 1, BOX_DAYS.length - 1); st.due = Date.now() + BOX_DAYS[st.box] * 864e5; }
        else { st.box = Math.min(st.box + 2, BOX_DAYS.length - 1); st.due = Date.now() + BOX_DAYS[st.box] * 864e5; }
        state[c.id] = st;
        save(LS_CARDS, state);
        reviewed++;
        idx++;
        show();
      });

      show();
    }

    document.getElementById("start-due").addEventListener("click", function () { startSession("due"); });
    document.getElementById("start-all").addEventListener("click", function () { startSession("all"); });

    var due = countDueCards();
    var note = document.createElement("p");
    note.className = "muted";
    note.textContent = due.total ? due.due + " cards due · " + due.total + " cards in rotation." : "New here? “Study all selected” introduces new cards.";
    picker.appendChild(note);
  }

  /* ---------- Mock exam ---------- */
  function initExam() {
    var mount = document.getElementById("exam-app");
    if (!mount) return;

    var setup = document.createElement("div");
    setup.className = "card";
    setup.innerHTML =
      "<h3 style='margin-top:0'>Build a mock exam</h3>" +
      "<p>Questions are sampled from every topic's bank in proportion to real exam weights (Ethics ~17%, FSA/Equity/Fixed Income ~12% each, ...). Real exam pacing is ~90 seconds per question.</p>" +
      "<div class='btnrow'>" +
      "<label>Length: <select id='exam-len'><option value='30'>30 questions (~45 min)</option><option value='60'>60 questions (~90 min)</option><option value='90' selected>90 questions — half exam (~135 min)</option></select></label>" +
      "<label><input type='checkbox' id='exam-timed' checked> Timed</label>" +
      "<button class='btn' id='exam-start'>Start exam</button></div>" +
      "<div id='exam-history'></div>";
    mount.appendChild(setup);

    renderHistory();

    function renderHistory() {
      var hist = load(LS_EXAMS, []);
      var box = document.getElementById("exam-history");
      if (!hist.length) { box.innerHTML = ""; return; }
      var rows = hist.slice(-8).reverse().map(function (h) {
        return "<tr><td>" + esc(h.when) + "</td><td>" + h.correct + "/" + h.total + "</td><td>" + Math.round(h.correct / h.total * 100) + "%</td></tr>";
      }).join("");
      box.innerHTML = "<h4>Past attempts</h4><div class='tablewrap'><table><tr><th>Date</th><th>Score</th><th>%</th></tr>" + rows + "</table></div>";
    }

    document.getElementById("exam-start").addEventListener("click", function () {
      var n = parseInt(document.getElementById("exam-len").value, 10);
      var timed = document.getElementById("exam-timed").checked;
      var qs = sampleWeighted(n);
      if (!qs.length) { alert("No question banks loaded."); return; }
      runExam(qs, timed);
    });

    function sampleWeighted(n) {
      var banks = [], totalW = 0;
      window.CFA_TOPICS.forEach(function (t) {
        var d = window.CFA_DATA && window.CFA_DATA[t.slug];
        if (d && d.questions && d.questions.length) { banks.push({ t: t, qs: d.qs || d.questions }); totalW += t.w; }
      });
      var out = [];
      banks.forEach(function (b) {
        var want = Math.max(1, Math.round(n * b.t.w / totalW));
        var pool = b.qs.slice();
        for (var i = pool.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
        }
        pool.slice(0, want).forEach(function (q) { out.push({ q: q, topic: b.t }); });
      });
      // Trim/shuffle to exactly n
      for (var i = out.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
      }
      return out.slice(0, n);
    }

    function runExam(items, timed) {
      mount.innerHTML = "";
      var answers = new Array(items.length).fill(null);
      var seconds = items.length * 90;
      var timerEl = document.createElement("div");
      timerEl.className = "card";
      timerEl.style.position = "sticky";
      timerEl.style.top = "64px";
      timerEl.style.zIndex = "10";
      timerEl.innerHTML = "<span class='exam-timer' id='exam-clock'></span> <span class='muted' id='exam-count'></span> <button class='btn' style='float:right' id='exam-submit'>Submit exam</button>";
      mount.appendChild(timerEl);

      var timerId = null;
      function tick() {
        var el = document.getElementById("exam-clock");
        if (!el) { clearInterval(timerId); return; }
        if (timed) {
          var m = Math.floor(seconds / 60), s = seconds % 60;
          el.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s;
          if (seconds <= 0) { grade(); return; }
          seconds--;
        } else {
          el.textContent = "Untimed";
        }
        var a = answers.filter(function (x) { return x !== null; }).length;
        var cnt = document.getElementById("exam-count");
        if (cnt) cnt.textContent = " · " + a + "/" + items.length + " answered";
      }
      tick();
      timerId = setInterval(tick, 1000);

      items.forEach(function (item, qi) {
        var w = document.createElement("div");
        w.className = "quiz-q card";
        w.innerHTML = '<div class="qtext">' + (qi + 1) + ". " + fmt(item.q.q) + "</div>";
        var choicesDiv = document.createElement("div");
        choicesDiv.className = "choices";
        item.q.choices.forEach(function (c, ci) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "choice";
          b.innerHTML = '<span class="letter">' + LETTERS[ci] + ".</span><span>" + fmt(c) + "</span>";
          b.addEventListener("click", function () {
            answers[qi] = ci;
            choicesDiv.querySelectorAll(".choice").forEach(function (x) { x.style.borderColor = ""; x.style.background = ""; });
            b.style.borderColor = "var(--accent)";
            b.style.background = "var(--accent-soft)";
          });
          choicesDiv.appendChild(b);
        });
        w.appendChild(choicesDiv);
        mount.appendChild(w);
      });

      var bottomSubmit = document.createElement("button");
      bottomSubmit.className = "btn";
      bottomSubmit.textContent = "Submit exam";
      bottomSubmit.addEventListener("click", grade);
      mount.appendChild(bottomSubmit);
      document.getElementById("exam-submit").addEventListener("click", grade);

      var graded = false;
      function grade() {
        if (graded) return;
        graded = true;
        clearInterval(timerId);
        var correct = 0, byTopic = {};
        items.forEach(function (item, qi) {
          var t = item.topic.name;
          byTopic[t] = byTopic[t] || { c: 0, n: 0 };
          byTopic[t].n++;
          if (answers[qi] === item.q.answer) { correct++; byTopic[t].c++; }
        });
        var hist = load(LS_EXAMS, []);
        hist.push({ when: new Date().toISOString().slice(0, 10), correct: correct, total: items.length });
        save(LS_EXAMS, hist);

        var pct = Math.round(correct / items.length * 100);
        var res = document.createElement("div");
        res.className = "card";
        var rows = Object.keys(byTopic).map(function (t) {
          var b = byTopic[t];
          var p = Math.round(b.c / b.n * 100);
          var cls = p >= 70 ? "pct-good" : (p < 60 ? "pct-bad" : "");
          return "<tr><td>" + esc(t) + "</td><td>" + b.c + "/" + b.n + "</td><td class='" + cls + "'>" + p + "%</td></tr>";
        }).join("");
        res.innerHTML = "<h3 style='margin-top:0'>Result: " + correct + "/" + items.length + " (" + pct + "%)</h3>" +
          "<p>" + (pct >= 70 ? "Strong — recent passing candidates typically score ≥70% on practice exams." :
            pct >= 60 ? "Close — MPS is usually estimated in the 60s. Push weak topics below to 70%+." :
            "Below the likely passing zone. Focus review on the red topics, then re-test.") + "</p>" +
          "<div class='tablewrap'><table class='exam-topic-breakdown'><tr><th>Topic</th><th>Score</th><th>%</th></tr>" + rows + "</table></div>" +
          "<p class='muted'>Scroll up to review each question — correct answers are now highlighted.</p>" +
          "<a class='btn' href='exam.html'>New exam</a>";
        mount.insertBefore(res, mount.children[1]);

        // Reveal answers
        var qDivs = mount.querySelectorAll(".quiz-q");
        items.forEach(function (item, qi) {
          var choices = qDivs[qi].querySelectorAll(".choice");
          choices.forEach(function (btn) { btn.disabled = true; btn.style.borderColor = ""; btn.style.background = ""; });
          choices[item.q.answer].classList.add("correct");
          if (answers[qi] !== null && answers[qi] !== item.q.answer) choices[answers[qi]].classList.add("incorrect");
          var expl = document.createElement("div");
          expl.className = "quiz-expl show";
          expl.innerHTML = "<span class='verdict " + (answers[qi] === item.q.answer ? "ok'>Correct." : "no'>" + (answers[qi] === null ? "Unanswered." : "Incorrect.")) + "</span> " + fmt(item.q.expl);
          qDivs[qi].appendChild(expl);
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildNav();
    initTopicPage();
    initDashboard();
    initFlashcards();
    initExam();
  });
})();
