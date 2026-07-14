// weather.js — Open-Meteo forecast fetch + parsing.
// Open-Meteo is free, needs no API key, and allows direct browser (CORS) requests.
// Docs: https://open-meteo.com/

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

// Morning block for the active 5yo; afternoon block covers the toddler's nap window.
export const MORNING_HOURS = { start: 9, end: 12 };   // 9:00–11:59
export const AFTERNOON_HOURS = { start: 12, end: 18 }; // 12:00–17:59
export const NAP_HOURS = { start: 13, end: 15 };       // 13:00–14:59

// Fetch hourly temperature + precipitation probability for the next `days` days.
// Returns the raw Open-Meteo JSON. Throws on network/HTTP failure.
export async function fetchForecast(lat, lon, days = 7) {
  const url =
    `${OPEN_METEO}?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation_probability,weather_code` +
    `&temperature_unit=fahrenheit&timezone=America/New_York&forecast_days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  return res.json();
}

// Group the parallel hourly arrays into a map keyed by date (YYYY-MM-DD),
// each value an array of { hour, tempF, precipProb, code }.
export function groupByDay(forecast) {
  const h = forecast.hourly || {};
  const times = h.time || [];
  const days = {};
  for (let i = 0; i < times.length; i++) {
    const iso = times[i];               // e.g. "2026-06-27T14:00"
    const date = iso.slice(0, 10);
    const hour = parseInt(iso.slice(11, 13), 10);
    (days[date] ||= []).push({
      hour,
      tempF: h.temperature_2m ? h.temperature_2m[i] : null,
      precipProb: h.precipitation_probability ? h.precipitation_probability[i] : null,
      code: h.weather_code ? h.weather_code[i] : null,
    });
  }
  return days;
}

// Slice a day's hourly array to a [start, end) hour window.
export function sliceWindow(dayHours, window) {
  return dayHours.filter((h) => h.hour >= window.start && h.hour < window.end);
}

// Summarize a window: max precip probability, average + max temperature.
export function summarizeWindow(windowHours) {
  if (!windowHours.length) {
    return { maxPrecip: 0, avgTemp: null, maxTemp: null, hasData: false };
  }
  const precs = windowHours.map((h) => h.precipProb ?? 0);
  const temps = windowHours.map((h) => h.tempF).filter((t) => t != null);
  const avg = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
  return {
    maxPrecip: Math.max(...precs),
    avgTemp: avg != null ? Math.round(avg) : null,
    maxTemp: temps.length ? Math.round(Math.max(...temps)) : null,
    minTemp: temps.length ? Math.round(Math.min(...temps)) : null,
    hasData: true,
  };
}

// WMO weather_code -> short label + emoji, for friendly display.
// Reference: https://open-meteo.com/en/docs (WMO weather interpretation codes)
export function describeCode(code) {
  if (code == null) return { label: "—", icon: "❓" };
  if (code === 0) return { label: "Clear", icon: "☀️" };
  if (code <= 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Cloudy", icon: "☁️" };
  if (code <= 48) return { label: "Foggy", icon: "🌫️" };
  if (code <= 57) return { label: "Drizzle", icon: "🌦️" };
  if (code <= 67) return { label: "Rain", icon: "🌧️" };
  if (code <= 77) return { label: "Snow", icon: "🌨️" };
  if (code <= 82) return { label: "Rain showers", icon: "🌧️" };
  if (code <= 86) return { label: "Snow showers", icon: "🌨️" };
  return { label: "Thunderstorm", icon: "⛈️" };
}

// Most representative code across a window (the worst/highest code seen).
export function dominantCode(windowHours) {
  const codes = windowHours.map((h) => h.code).filter((c) => c != null);
  return codes.length ? Math.max(...codes) : null;
}
