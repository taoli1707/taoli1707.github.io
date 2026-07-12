window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["econ"] = {
  name: "Economics",
  weight: "6–9%",
  sections: [
    "Firms and Market Structures",
    "Understanding Business Cycles",
    "Fiscal Policy",
    "Monetary Policy",
    "Introduction to Geopolitics",
    "International Trade",
    "Capital Flows and the FX Market",
    "Exchange Rate Calculations"
  ],
  questions: [
    {
      id: "econ-q1",
      section: "Market structures",
      q: "An industry has many sellers offering differentiated products, low barriers to entry, and heavy advertising. In the long run, firms in this industry <em>most likely</em> earn:",
      choices: ["positive economic profit, because differentiation confers pricing power", "zero economic profit, because entry by new firms erodes profits", "zero accounting profit, because competition drives revenue down to variable cost"],
      answer: 1,
      expl: "The description is monopolistic competition. Differentiation gives short-run pricing power, but low entry barriers mean new competitors keep entering until economic profit is zero. Zero economic profit is not zero accounting profit — owners still earn their required (normal) return."
    },
    {
      id: "econ-q2",
      section: "Market structures",
      q: "A monopolist faces demand P = 120 − Q and constant marginal cost of $40. Its profit-maximizing price is <em>closest to</em>:",
      choices: ["$40", "$60", "$80"],
      answer: 2,
      expl: "With linear demand, MR has twice the slope: MR = 120 − 2Q. Set MR = MC: 120 − 2Q = 40, so Q = 40; price from the demand curve is P = 120 − 40 = $80. Choosing $40 comes from setting P = MC, which is the perfectly competitive outcome, not the monopoly optimum."
    },
    {
      id: "econ-q3",
      section: "Market structures",
      q: "A firm sells at a market price of $8. At its optimal output, average variable cost is $7 and average total cost is $10. In the short run the firm should <em>most likely</em>:",
      choices: ["shut down, because price is below average total cost", "continue operating, because price exceeds average variable cost", "raise price until it covers average total cost"],
      answer: 1,
      expl: "Since P ($8) is above AVC ($7), each unit contributes $1 toward the fixed costs the firm must pay anyway, so operating minimizes the loss. Shutdown applies only when P falls below AVC. In the long run, with P below ATC, the firm should exit. A price taker cannot simply raise its price."
    },
    {
      id: "econ-q4",
      section: "Market structures",
      q: "Four firms have market shares of 40%, 30%, 20%, and 10%. The Herfindahl–Hirschman Index for the industry is <em>closest to</em>:",
      choices: ["100", "3,000", "10,000"],
      answer: 1,
      expl: "HHI = 40² + 30² + 20² + 10² = 1,600 + 900 + 400 + 100 = 3,000. Summing the unsquared shares gives 100 (the concentration-ratio logic), and 10,000 is the HHI of a pure monopoly. Unlike the concentration ratio, the HHI rises sharply when large firms merge."
    },
    {
      id: "econ-q5",
      section: "Business cycles",
      q: "Which of the following is <em>most likely</em> classified as a leading economic indicator?",
      choices: ["Average duration of unemployment", "Building permits for new private housing", "Industrial production"],
      answer: 1,
      expl: "Building permits reflect construction activity that will occur months ahead, so they lead the cycle. Average duration of unemployment is a lagging indicator, and industrial production moves with the economy (coincident). Remember: unemployment claims are leading, payroll employment coincident, unemployment duration lagging."
    },
    {
      id: "econ-q6",
      section: "Business cycles",
      q: "A rise in the number of discouraged workers, holding all else constant, <em>most likely</em> causes the reported unemployment rate to:",
      choices: ["fall, because discouraged workers leave the labor force", "rise, because discouraged workers are counted as unemployed", "stay unchanged, because discouraged workers remain in the working-age population"],
      answer: 0,
      expl: "Discouraged workers have stopped actively seeking work, so they drop out of the labor force — the denominator and numerator both shrink, and since they were counted as unemployed, the measured rate falls. The headline rate therefore understates labor market weakness when discouragement is rising."
    },
    {
      id: "econ-q7",
      section: "Business cycles",
      q: "Central banks focus on core rather than headline inflation <em>most likely</em> because core inflation:",
      choices: ["includes food and energy, the items households notice most", "excludes volatile food and energy prices whose swings often reverse", "is measured from producer prices, which lead consumer prices"],
      answer: 1,
      expl: "Core inflation strips out food and energy so that policy does not overreact to temporary commodity spikes that tend to reverse. Headline inflation is the measure that includes food and energy. PPI is a separate producer-level index, not the definition of core."
    },
    {
      id: "econ-q8",
      section: "Business cycles",
      q: "An economy is operating above potential output with high capacity utilization, and inflation is accelerating. This inflation is <em>best</em> described as:",
      choices: ["cost-push, driven by rising unit labor costs", "demand-pull, driven by aggregate demand exceeding capacity", "disinflation, driven by a closing output gap"],
      answer: 1,
      expl: "A positive output gap and stretched capacity are the classic signatures of demand-pull inflation — too much demand chasing limited capacity. Cost-push inflation originates from input costs (wages, commodities) shifting supply, and its telltale indicator is unit labor costs. Disinflation means a falling inflation rate, the opposite of what is described."
    },
    {
      id: "econ-q9",
      section: "Fiscal policy",
      q: "The marginal propensity to consume is 0.75 and the tax rate is 20%. If government spending rises by $200 billion, the total eventual increase in aggregate demand is <em>closest to</em>:",
      choices: ["$200 billion", "$500 billion", "$800 billion"],
      answer: 1,
      expl: "Fiscal multiplier = 1 ⁄ [1 − MPC(1 − t)] = 1 ⁄ [1 − 0.75 × 0.80] = 1 ⁄ 0.40 = 2.5, so the total impact is $200b × 2.5 = $500 billion. Using 1/(1 − MPC) = 4 and getting $800 billion ignores the tax leakage from each spending round."
    },
    {
      id: "econ-q10",
      section: "Fiscal policy",
      q: "Compared with discretionary fiscal policy, automatic stabilizers are <em>most likely</em> to be more effective at stabilizing the economy because they:",
      choices: ["avoid the recognition and action lags", "have a larger multiplier per dollar", "do not increase the budget deficit in a downturn"],
      answer: 0,
      expl: "Automatic stabilizers (progressive taxes, unemployment benefits) respond immediately as incomes change — no one must recognize the downturn or pass legislation, eliminating the recognition and action lags. They do widen the deficit in a downturn; that is precisely how they cushion demand. Their multiplier is not inherently larger."
    },
    {
      id: "econ-q11",
      section: "Fiscal policy",
      q: "If Ricardian equivalence holds, a debt-financed tax cut will <em>most likely</em>:",
      choices: ["raise aggregate demand by the tax cut times the multiplier", "leave aggregate demand unchanged as households save the tax cut", "reduce aggregate demand by crowding out private investment"],
      answer: 1,
      expl: "Under Ricardian equivalence, households anticipate that today's borrowing means higher future taxes, so they save the entire tax cut to pay them — private saving rises one-for-one and demand is unchanged. Crowding out is a different (interest-rate) channel that dampens, rather than reverses, fiscal stimulus."
    },
    {
      id: "econ-q12",
      section: "Monetary policy",
      q: "The reserve requirement is 20%. A new cash deposit of $5,000 is made into the banking system. The maximum increase in the money supply is <em>closest to</em>:",
      choices: ["$4,000", "$20,000", "$25,000"],
      answer: 2,
      expl: "Money multiplier = 1 ⁄ 0.20 = 5, so maximum new money = $5,000 × 5 = $25,000. The $4,000 figure is only the first-round loan (80% of the deposit), and $20,000 is the new lending excluding the original deposit. The full multiplier effect counts the entire deposit chain."
    },
    {
      id: "econ-q13",
      section: "Monetary policy",
      q: "An economy has trend real growth of 2.5% and an inflation target of 2%. The central bank sets its policy rate at 3.5%. Its monetary policy stance is <em>best</em> described as:",
      choices: ["expansionary, because the policy rate is below the neutral rate", "contractionary, because the policy rate exceeds trend growth", "neutral, because the real policy rate equals the inflation target"],
      answer: 0,
      expl: "Neutral rate = trend growth + inflation target = 2.5% + 2% = 4.5%. At 3.5% the policy rate is below neutral, so policy is expansionary. Comparing the policy rate to trend growth alone, or juggling the real rate against the target, are the standard wrong approaches — the benchmark is the neutral rate."
    },
    {
      id: "econ-q14",
      section: "Monetary policy",
      q: "Short-term interest rates are near zero, and further increases in the money supply are absorbed as idle cash balances without lowering rates or boosting lending. This situation is <em>best</em> described as:",
      choices: ["a liquidity trap", "crowding out", "a wage-price spiral"],
      answer: 0,
      expl: "In a liquidity trap, demand for money becomes highly elastic at near-zero rates, so monetary expansion fails to stimulate the economy — the motivation for quantitative easing. Crowding out is a fiscal-policy phenomenon (government borrowing raising rates), and a wage-price spiral is an inflation dynamic."
    },
    {
      id: "econ-q15",
      section: "Geopolitics",
      q: "A country engages actively in global trade and capital markets but routinely acts unilaterally, using its market size to influence other nations rather than binding itself to international rules. Under the geopolitics framework this country is <em>best</em> classified as pursuing:",
      choices: ["autarky", "hegemony", "multilateralism"],
      answer: 1,
      expl: "High globalization combined with low cooperation defines hegemony — engaged with the world, but on its own terms. Autarky is low on both dimensions (self-sufficiency), and multilateralism is high on both (extensive engagement through rules and international organizations)."
    },
    {
      id: "econ-q16",
      section: "Geopolitics",
      q: "A surprise military invasion disrupts a portfolio's emerging-market holdings overnight. Within the geopolitical risk framework, this is <em>best</em> classified as:",
      choices: ["event risk, because conflicts follow the political calendar", "exogenous risk, because it is a sudden shock that could not be scheduled", "thematic risk, because great-power rivalry evolves over decades"],
      answer: 1,
      expl: "Exogenous risks are sudden, unanticipated shocks such as invasions or coups. Event risk is tied to known calendar dates (elections, leadership transitions) where only the outcome is uncertain. Thematic risks are slow structural forces like climate change or cyber threats. This shock is also high-velocity: it hits asset prices immediately."
    },
    {
      id: "econ-q17",
      section: "International trade",
      q: "With one unit of resources, Country X can produce 4 units of cloth or 2 barrels of wine; Country Y can produce 3 units of cloth or 3 barrels of wine. Comparative advantage in wine belongs to:",
      choices: ["Country X, because its wine output per unit of resources is lower", "Country Y, because its opportunity cost of wine is 1 unit of cloth versus 2 for X", "neither country, because Y has an absolute advantage in wine"],
      answer: 1,
      expl: "Opportunity cost of 1 wine: for X, 4⁄2 = 2 cloth; for Y, 3⁄3 = 1 cloth. Y gives up less cloth per barrel, so Y has the comparative advantage in wine (and X in cloth, at 0.5 wine versus 1). Absolute advantage (Y also makes more wine per unit) is not what determines the pattern of trade — relative opportunity cost is."
    },
    {
      id: "econ-q18",
      section: "International trade",
      q: "Compared with an import tariff that restricts imports by the same quantity, a voluntary export restraint (VER) <em>most likely</em>:",
      choices: ["results in a lower domestic price", "transfers the quota rents to foreign exporters instead of generating government revenue", "imposes a smaller welfare loss on the importing country"],
      answer: 1,
      expl: "A tariff and an equivalent quantity restriction raise the domestic price by the same amount; the difference is who captures the value. A tariff yields government revenue, while under a VER the foreign exporters keep the quota rents (they sell less but at the higher price). That makes the VER the costlier restriction for the importing nation, not the cheaper one."
    },
    {
      id: "econ-q19",
      section: "International trade",
      q: "A trading bloc whose members trade freely with each other and impose a common external tariff, but do not allow free movement of labor and capital among members, is <em>best</em> described as a:",
      choices: ["free trade area", "customs union", "common market"],
      answer: 1,
      expl: "A customs union = free internal trade + common external trade policy. A free trade area lacks the common external tariff (members keep their own policies toward non-members), and a common market adds free movement of labor and capital on top of the customs union."
    },
    {
      id: "econ-q20",
      section: "Capital flows and FX",
      q: "A country runs a persistent current account deficit. It <em>most likely</em> also has:",
      choices: ["a financial account surplus, because domestic investment exceeds domestic saving", "a financial account deficit, because capital flows out to pay for imports", "a matching capital account deficit, because the accounts must offset"],
      answer: 0,
      expl: "The BoP accounts sum to zero: a current account deficit is financed by net capital inflows — a financial account surplus. Economically, CA ≈ S − I + (T − G): the country invests more than it saves and imports the difference as foreign capital. Capital flows in, not out; the small capital account does not do the offsetting."
    },
    {
      id: "econ-q21",
      section: "Capital flows and FX",
      q: "The USD/EUR exchange rate rises from 1.0800 to 1.1300. It is <em>most accurate</em> to say that the:",
      choices: ["USD has appreciated, because the quote increased", "EUR has appreciated, because the base currency buys more dollars", "EUR has depreciated, because more dollars are needed per euro"],
      answer: 1,
      expl: "In a price/base quote, USD is the price currency and EUR is the base. A rising quote means each euro buys more dollars, so the EUR (base) appreciated and the USD depreciated. Needing more dollars per euro is dollar weakness, not euro weakness — the wording of the third choice reverses the conclusion."
    },
    {
      id: "econ-q22",
      section: "FX calculations",
      q: "Spot quotes are USD/EUR = 1.2000 and CHF/USD = 0.9000. The CHF/EUR cross rate is <em>closest to</em>:",
      choices: ["0.7500", "1.0800", "1.3333"],
      answer: 1,
      expl: "CHF/EUR = CHF/USD × USD/EUR = 0.9000 × 1.2000 = 1.0800 — the USD cancels. Dividing instead (1.2000 ⁄ 0.9000 = 1.3333) leaves the units as USD²/(EUR·CHF), which is meaningless; 0.7500 comes from dividing the other way. Always check that the common currency cancels."
    },
    {
      id: "econ-q23",
      section: "FX calculations",
      q: "The spot USD/GBP rate is 1.2500. One-year interest rates are 4.0% in USD and 6.0% in GBP. The one-year forward USD/GBP rate is <em>closest to</em>:",
      choices: ["1.2264", "1.2500", "1.2740"],
      answer: 0,
      expl: "F = S × (1 + i_price) ⁄ (1 + i_base) = 1.2500 × 1.04 ⁄ 1.06 = 1.2264. USD is the price currency (numerator rate); GBP is the base. The GBP, with the higher interest rate, must trade at a forward discount — 1.2740 comes from flipping the ratio and would create a covered-interest arbitrage."
    },
    {
      id: "econ-q24",
      section: "FX calculations",
      q: "Spot USD/EUR is 1.1000 and the 3-month forward is quoted at +30 points. A currency dealer would compute the forward rate as:",
      choices: ["1.1030", "1.1003", "1.1300"],
      answer: 0,
      expl: "Each forward point is one unit of the 4th decimal place (0.0001), so +30 points = 30 ⁄ 10,000 = 0.0030 and the forward = 1.1000 + 0.0030 = 1.1030. Treating a point as 0.00001 gives 1.1003, and adding 0.03 gives 1.1300 — both scale errors. Positive points mean the base currency (EUR) is at a forward premium."
    }
  ],
  flashcards: [
    { id: "econ-f1", front: "Profit-maximizing rule for ALL market structures", back: "Produce where MR = MC. Under perfect competition P = MR, so P = MC; price searchers have MR < P. For linear demand P = a − bQ, MR = a − 2bQ (twice the slope)." },
    { id: "econ-f2", front: "Short-run shutdown point vs breakeven point", back: "Shut down (short run) when P < minimum AVC. Breakeven when P = minimum ATC. Between AVC and ATC: operate at a loss in the short run, exit in the long run." },
    { id: "econ-f3", front: "Herfindahl–Hirschman Index (HHI)", back: "Sum of squared market shares of the largest firms. Max 10,000 (monopoly, shares in %). Rises sharply on mergers — unlike the N-firm concentration ratio, which just sums shares." },
    { id: "econ-f4", front: "Long-run economic profit by market structure", back: "Perfect competition: zero. Monopolistic competition: zero (entry erodes it). Oligopoly: possible. Monopoly: possible. Zero economic profit still means investors earn their required (normal) return." },
    { id: "econ-f5", front: "Natural monopoly", back: "Economies of scale so large relative to demand that one firm can supply the market at lower average cost than two or more could. Typically regulated (average-cost or marginal-cost pricing)." },
    { id: "econ-f6", front: "Business cycle phases (in order)", back: "Recovery (trough to trend) → Expansion (above trend) → Slowdown (peak, decelerating) → Contraction (below trend). Recession rule of thumb: two consecutive quarters of falling real GDP." },
    { id: "econ-f7", front: "Classify: initial claims, payroll employment, unemployment duration", back: "Initial unemployment claims = LEADING. Payroll employment and industrial production = COINCIDENT. Average duration of unemployment (and the unemployment rate) = LAGGING." },
    { id: "econ-f8", front: "Discouraged worker / underemployed — effect on unemployment rate", back: "Discouraged workers stop searching, leave the labor force, and make the rate look BETTER (understates weakness). Underemployed count as employed. Both mean the headline rate flatters the labor market." },
    { id: "econ-f9", front: "Headline vs core inflation; CPI vs PPI", back: "Core = headline minus volatile food and energy; central banks watch core. CPI prices a consumer basket; PPI measures producer prices and tends to LEAD CPI. Fixed-basket (Laspeyres) CPI overstates inflation: substitution, quality, new-goods biases." },
    { id: "econ-f10", front: "Demand-pull vs cost-push inflation — what to watch", back: "Demand-pull: demand exceeds capacity — watch the output gap and capacity utilization. Cost-push: rising input costs — watch unit labor costs and unemployment vs its natural rate (NAIRU)." },
    { id: "econ-f11", front: "Fiscal multiplier formula", back: "1 ⁄ [1 − MPC × (1 − t)]. Total demand impact = ΔG × multiplier. Balanced-budget multiplier is positive (spending impact > equal tax impact, since part of a tax cut is saved)." },
    { id: "econ-f12", front: "Automatic stabilizers vs discretionary fiscal policy", back: "Automatic (progressive taxes, unemployment benefits) act with no new legislation — no recognition or action lag. Discretionary policy suffers recognition, action, and impact lags and can end up procyclical." },
    { id: "econ-f13", front: "Crowding out", back: "Deficit-financed government borrowing raises interest rates and displaces private investment, shrinking the net fiscal stimulus. Strongest near full capacity; weak in deep recessions with idle resources." },
    { id: "econ-f14", front: "Ricardian equivalence", back: "Households anticipate future taxes to repay government debt and save the entire tax cut today — so debt-financed fiscal stimulus leaves aggregate demand unchanged. An argument that deficits do not matter." },
    { id: "econ-f15", front: "Money multiplier", back: "1 ⁄ reserve requirement. Max new money = new deposit × multiplier. Smaller in practice: banks hold excess reserves and the public holds cash. Quantity theory: MV = PY." },
    { id: "econ-f16", front: "Neutral policy rate and policy stance", back: "Neutral rate = trend real growth + inflation target. Policy rate above neutral = contractionary; below = expansionary. Three pillars of an effective central bank: independence, credibility, transparency." },
    { id: "econ-f17", front: "Monetary transmission channels (rate hike)", back: "Four channels, all reducing demand and inflation: (1) higher bank lending rates, (2) lower asset prices, (3) expectations of slower growth/inflation, (4) currency appreciation hurting exports." },
    { id: "econ-f18", front: "Why target ~2% inflation, not 0%?", back: "Measured inflation overstates true inflation (basket biases), and a buffer above zero reduces the risk of deflation — which is hard to fight because policy rates cannot go meaningfully below zero (liquidity trap, QE)." },
    { id: "econ-f19", front: "Four geopolitics archetypes (cooperation × globalization)", back: "Autarky: low/low. Hegemony: low cooperation/high globalization. Multilateralism: high/high. Bilateralism: high cooperation/low globalization (one-on-one deals)." },
    { id: "econ-f20", front: "Three types of geopolitical risk + assessment dimensions", back: "Event (known timing — elections), exogenous (sudden shocks — invasions), thematic (slow structural — climate, cyber). Assess by likelihood, velocity (speed of portfolio impact), and impact size." },
    { id: "econ-f21", front: "Comparative vs absolute advantage", back: "Absolute: fewer resources per unit. Comparative: lower OPPORTUNITY cost — this determines trade. A country with absolute advantage in everything still gains by specializing where its relative cost advantage is greatest (Ricardo: technology; Heckscher–Ohlin: factor endowments)." },
    { id: "econ-f22", front: "Trading bloc ladder (each level adds one feature)", back: "Free trade area → + common external tariff = customs union → + free movement of labor/capital = common market → + common economic policies = economic union → + single currency = monetary union." },
    { id: "econ-f23", front: "Balance of payments identity", back: "Current + capital + financial accounts = 0. CA ≈ (S − I) + (T − G): a current account deficit means investment exceeds saving, financed by a financial account surplus (net capital inflows)." },
    { id: "econ-f24", front: "Covered interest rate parity (forward rate)", back: "F = S × (1 + i_price × days⁄360) ⁄ (1 + i_base × days⁄360), quote = price/base. The HIGHER-interest-rate currency trades at a forward DISCOUNT. Forward points = (F − S) × 10,000 for 4-decimal quotes." }
  ]
};
