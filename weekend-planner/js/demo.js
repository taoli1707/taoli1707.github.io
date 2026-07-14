// demo.js — synthetic forecasts for verifying the planning engine without
// waiting for real weather. Activate via ?demo=hot | rain | mild | storm-pm.
// Each scenario returns an array of { hour, tempF, precipProb, code } for 0..23.

function buildDay({ temp, precip, code }) {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    hours.push({
      hour: h,
      tempF: typeof temp === "function" ? temp(h) : temp,
      precipProb: typeof precip === "function" ? precip(h) : precip,
      code: typeof code === "function" ? code(h) : code,
    });
  }
  return hours;
}

const SCENARIOS = {
  // Hot all day -> outdoor nap too warm -> expect Car Nap.
  hot: { temp: 90, precip: 5, code: 0 },
  // Rainy afternoon -> nap window wet -> expect Car Nap + storm banner + Plan B.
  rain: {
    temp: 68,
    precip: (h) => (h >= 12 ? 70 : 10),
    code: (h) => (h >= 12 ? 61 : 1),
  },
  // Mild and dry -> expect Quiet Outdoor Nap, no storm banner.
  mild: { temp: 70, precip: 5, code: 1 },
  // Pleasant morning, storm rolls in after lunch -> the "headed out, storm comes" case.
  "storm-pm": {
    temp: (h) => (h < 13 ? 74 : 71),
    precip: (h) => (h >= 14 ? 80 : 10),
    code: (h) => (h >= 14 ? 95 : 0),
  },
};

export function makeDemoDay(name) {
  return buildDay(SCENARIOS[name] || SCENARIOS.mild);
}
