// app.js — entry point. Orchestrates: fetch forecast -> build plan -> render.
// Runs in the browser (GitHub Pages), loaded as <script type="module">.

import {
  fetchForecast,
  groupByDay,
  describeCode,
  sliceWindow,
  AFTERNOON_HOURS,
  MORNING_HOURS,
} from "./weather.js";
import { loadActivities, withDistance, loadEvents, distanceMiles } from "./activities.js";
import { buildDayPlan, DEFAULT_PROFILE } from "./planner.js";
import { makeDemoDay } from "./demo.js";

const HOME = { lat: 40.6510, lon: -74.3473, city: "Westfield", state: "NJ", zip: "07090" };

const state = {
  days: {},        // date -> hourly array
  weekend: [],     // [{date, label}] for upcoming Sat/Sun
  activities: [],  // distance-annotated
  events: [],      // live local events (data/events.json)
  selectedDate: null,
};

const el = (id) => document.getElementById(id);

async function init() {
  const params = new URLSearchParams(location.search);
  const demo = params.get("demo"); // hot | rain | mild | storm-pm

  try {
    const data = await loadActivities();
    state.activities = withDistance(data.activities, HOME);

    // Live events load independently; failure here must not break the planner.
    const ev = await loadEvents();
    state.events = (ev.events || []).map((e) => ({
      ...e,
      distanceMiles: e.location && e.location.lat != null ? Math.round(distanceMiles(HOME, e.location) * 10) / 10 : null,
    }));

    if (demo) {
      // Verification mode: synthesize a day's forecast so nap logic / Plan B
      // can be exercised without waiting for real weather.
      const date = "2026-06-27";
      state.days = { [date]: makeDemoDay(demo) };
      state.weekend = [{ date, label: `Demo: ${demo}` }];
      el("data-note").textContent = `Demo mode (${demo}) — using a synthetic forecast.`;
    } else {
      const forecast = await fetchForecast(HOME.lat, HOME.lon, 7);
      state.days = groupByDay(forecast);
      state.weekend = upcomingWeekend(Object.keys(state.days));
      el("data-note").textContent =
        "Live forecast via Open-Meteo. Plan is a suggestion — you know your kids best.";
    }

    if (!state.weekend.length) {
      showError("No weekend days found in the forecast window.");
      return;
    }
    state.selectedDate = state.weekend[0].date;
    renderDayTabs();
    renderDay();
    el("loading").classList.add("d-none");
    el("planner").classList.remove("d-none");
  } catch (err) {
    showError(`Couldn't load the forecast: ${err.message}`);
    console.error(err);
  }
}

// From the available forecast dates, return the upcoming Saturday + Sunday
// (including today if today is Sat/Sun).
function upcomingWeekend(dates) {
  const out = [];
  for (const d of dates.sort()) {
    const dow = new Date(d + "T12:00:00").getDay(); // 0 Sun .. 6 Sat
    if (dow === 6) out.push({ date: d, label: "Saturday" });
    else if (dow === 0) out.push({ date: d, label: "Sunday" });
    if (out.length === 2) break;
  }
  // If neither found early (rare), fall back to the first two dates.
  return out.length ? out : dates.slice(0, 2).map((d) => ({ date: d, label: d }));
}

function renderDayTabs() {
  const wrap = el("day-tabs");
  wrap.innerHTML = "";
  state.weekend.forEach(({ date, label }) => {
    const btn = document.createElement("button");
    btn.className =
      "btn mr-2 mb-2 " + (date === state.selectedDate ? "btn-primary" : "btn-outline-primary");
    btn.textContent = `${label}${label.length > 3 ? " · " + prettyDate(date) : ""}`;
    btn.onclick = () => {
      state.selectedDate = date;
      renderDayTabs();
      renderDay();
    };
    wrap.appendChild(btn);
  });
}

function renderDay() {
  const dayHours = state.days[state.selectedDate] || [];
  const plan = buildDayPlan(dayHours, state.activities, DEFAULT_PROFILE);

  renderForecastStrip(dayHours);
  renderStormBanner(plan.afternoon);
  renderMorning(plan.morning);
  renderNap(plan.afternoon.nap);
  renderAfternoon(plan.afternoon);
  renderEvents(state.selectedDate);
}

// Live local events that fall on the selected day, nearest first.
function renderEvents(date) {
  const list = el("events-list");
  const note = el("events-note");
  const todays = state.events
    .filter((e) => e.start && e.start.slice(0, 10) === date)
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (!state.events.length) {
    note.textContent =
      "No live events loaded yet — they populate automatically once the daily refresh is configured.";
    list.innerHTML = "";
    return;
  }
  note.textContent = "Live local events (library, town & county) for the day you picked.";
  if (!todays.length) {
    list.innerHTML = `<div class="text-muted">Nothing listed for this day yet — check the other day or back soon.</div>`;
    return;
  }
  list.innerHTML = todays.map(eventCard).join("");
}

function eventCard(e) {
  const time = e.start ? fmtClock(e.start) : "";
  const io = { outdoor: "Outdoor", indoor: "Indoor", mixed: "Indoor + Outdoor", unknown: "" }[e.indoorOutdoor] || "";
  const age = e.ageRange ? `ages ${e.ageRange.min}–${e.ageRange.max}` : "";
  const dist = e.distanceMiles != null ? `${e.distanceMiles} mi` : "";
  const meta = [time, io, age, dist, costLabel(e.cost)].filter(Boolean).join(" · ");
  const link = e.url ? `<a href="${e.url}" target="_blank" rel="noopener">Details ↗</a>` : "";
  return `
    <div class="wp-activity">
      <div class="wp-activity-head"><strong>${e.title}</strong></div>
      <div class="wp-activity-meta text-muted">${meta}</div>
      <div class="wp-activity-notes">${e.venue || ""}</div>
      <div class="wp-activity-link">${link}</div>
    </div>`;
}

function fmtClock(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  // Local events are in NJ; pin display to Eastern so it's right for any viewer.
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

function renderForecastStrip(dayHours) {
  const strip = el("forecast-strip");
  strip.innerHTML = "";
  const hours = dayHours.filter((h) => h.hour >= 8 && h.hour <= 19);
  hours.forEach((h) => {
    const c = describeCode(h.code);
    const cell = document.createElement("div");
    cell.className = "wp-hour text-center";
    cell.innerHTML =
      `<div class="wp-hour-time">${fmtHour(h.hour)}</div>` +
      `<div class="wp-hour-icon">${c.icon}</div>` +
      `<div class="wp-hour-temp">${h.tempF != null ? Math.round(h.tempF) + "°" : "—"}</div>` +
      `<div class="wp-hour-rain ${h.precipProb >= 50 ? "text-danger font-weight-bold" : "text-muted"}">${h.precipProb ?? 0}%</div>`;
    strip.appendChild(cell);
  });
}

function renderStormBanner(afternoon) {
  const banner = el("storm-banner");
  if (afternoon.stormRisk) {
    banner.className = "alert alert-warning d-flex align-items-center";
    banner.innerHTML =
      `<span class="wp-banner-icon mr-2">⛈️</span>` +
      `<div><strong>Heads up:</strong> ${afternoon.stormChance}% chance of rain this afternoon. ` +
      `A <strong>Plan B</strong> is ready below.</div>`;
    banner.classList.remove("d-none");
  } else {
    banner.classList.add("d-none");
  }
}

function renderMorning(m) {
  const c = describeCode(m.code);
  el("morning-weather").textContent =
    `${c.icon} ${c.label}` +
    (m.window.maxTemp != null ? ` · ${m.window.maxTemp}°F · ${m.window.maxPrecip}% rain` : "");
  el("morning-reason").textContent = m.reason;
  el("morning-plan-a").innerHTML = activityCard(m.planA, "Plan A");
  const bWrap = el("morning-plan-b");
  if (m.planB) {
    bWrap.innerHTML = planBBlock(m.planB);
    bWrap.classList.remove("d-none");
  } else {
    bWrap.classList.add("d-none");
  }
}

const NAP_META = {
  outdoor: { icon: "🌳", title: "Quiet Outdoor Nap" },
  car: { icon: "🚗", title: "Car Nap" },
  indoor: { icon: "🏠", title: "Indoor Quiet Nap" },
};

function renderNap(nap) {
  const meta = NAP_META[nap.type];
  el("nap-title").textContent = `${meta.icon} ${meta.title}`;
  el("nap-reason").textContent = nap.reason;
  const placeWrap = el("nap-place");
  if (nap.place) {
    placeWrap.innerHTML = activityCard(nap.place, "Suggested spot");
    placeWrap.classList.remove("d-none");
  } else {
    placeWrap.classList.add("d-none");
  }
}

function renderAfternoon(a) {
  const wrap = el("afternoon-plan-b");
  if (a.planB) {
    wrap.innerHTML =
      `<h6 class="text-muted">If the weather turns — Plan B</h6>` + activityCard(a.planB, "Indoor backup");
    wrap.classList.remove("d-none");
  } else {
    wrap.classList.add("d-none");
  }
}

// ---- small render helpers ----

function activityCard(a, badge) {
  if (!a) return `<div class="text-muted">No matching spot found.</div>`;
  const io = { outdoor: "Outdoor", indoor: "Indoor", mixed: "Indoor + Outdoor" }[a.indoorOutdoor];
  const link = a.url ? `<a href="${a.url}" target="_blank" rel="noopener">Details ↗</a>` : "";
  return `
    <div class="wp-activity">
      <div class="wp-activity-head">
        <span class="badge badge-light mr-2">${badge}</span>
        <strong>${a.name}</strong>
      </div>
      <div class="wp-activity-meta text-muted">
        ${io} · ${a.distanceMiles} mi · ${costLabel(a.cost)}
      </div>
      <div class="wp-activity-notes">${a.notes || ""}</div>
      <div class="wp-activity-link">${link}</div>
    </div>`;
}

function planBBlock(a) {
  return `<h6 class="text-muted mt-3">If it rains — Plan B</h6>` + activityCard(a, "Indoor backup");
}

function costLabel(c) {
  return c === "free" ? "Free" : c;
}

function prettyDate(d) {
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtHour(h) {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

function showError(msg) {
  el("loading").classList.add("d-none");
  const e = el("error");
  e.textContent = msg;
  e.classList.remove("d-none");
}

init();
