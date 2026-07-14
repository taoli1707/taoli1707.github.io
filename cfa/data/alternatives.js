window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["alternatives"] = {
  name: "Alternative Investments",
  weight: "7–10%",
  sections: [
    "Features, Methods, and Structures",
    "Performance Calculation and Appraisal",
    "Private Capital",
    "Real Estate and Infrastructure",
    "Natural Resources",
    "Hedge Funds",
    "Digital Assets"
  ],
  questions: [
    {
      id: "alternatives-q1",
      section: "Features & Structures",
      q: "Which of the following is <em>least likely</em> a common characteristic of alternative investments relative to traditional investments?",
      choices: [
        "Lower fees due to passive management",
        "Lower liquidity and restrictions on redemptions",
        "Less regulation and transparency"
      ],
      answer: 0,
      expl: "Alternatives typically carry HIGHER fees (management plus performance/incentive fees), not lower — active, specialized management is the norm. Illiquidity and lighter regulation/transparency are both classic characteristics of the asset class."
    },
    {
      id: "alternatives-q2",
      section: "Features & Structures",
      q: "An institutional investor buys a stake in a private equity fund and also invests directly in a portfolio company alongside the fund at the GP's invitation. The additional investment is best described as:",
      choices: ["Direct investing", "Co-investing", "Fund investing"],
      answer: 1,
      expl: "Co-investing means investing alongside a fund in specific deals the GP offers, usually at reduced or zero fees on the co-invested amount. Direct investing would involve no fund relationship at all; the fund stake itself is fund investing. The main co-investment risk is adverse selection in the deals offered."
    },
    {
      id: "alternatives-q3",
      section: "Features & Structures",
      q: "A distribution waterfall in which the general partner receives carried interest only after limited partners have received back all of their contributed capital is <em>most accurately</em> described as:",
      choices: [
        "A deal-by-deal (American) waterfall, which favors the GP",
        "A whole-of-fund (European) waterfall, which favors the LPs",
        "A clawback arrangement, which favors the GP"
      ],
      answer: 1,
      expl: "The whole-of-fund (European) waterfall returns all LP capital (plus any preferred return) before any carry is paid, so it is LP-friendly. A deal-by-deal (American) waterfall pays carry on each exited deal and favors the GP. A clawback is a separate provision requiring the GP to return excess carry after later losses — it protects LPs, not the GP."
    },
    {
      id: "alternatives-q4",
      section: "Features & Structures",
      q: "During a private equity fund's investment period, the management fee is <em>most likely</em> charged on:",
      choices: ["Invested capital", "Committed capital", "Net asset value"],
      answer: 1,
      expl: "Private capital funds typically charge the management fee on total committed capital during the investment period — LPs pay fees even on capital not yet called — often stepping down to invested capital afterward. Fees on AUM/NAV are the hedge fund convention, a frequent distractor."
    },
    {
      id: "alternatives-q5",
      section: "Performance & Fees",
      q: "A hedge fund database adds a newly reporting fund and includes that fund's returns from the years before it joined. The resulting distortion to index returns is <em>best</em> described as:",
      choices: [
        "Backfill bias, which biases reported returns upward",
        "Survivorship bias, which biases reported returns downward",
        "Appraisal smoothing, which biases reported volatility upward"
      ],
      answer: 0,
      expl: "Importing a fund's pre-inclusion history is backfill (self-selection) bias; since funds join databases after strong runs, it inflates index returns. Survivorship bias (dropping dead funds) also biases returns UPWARD, not downward. Appraisal smoothing understates — not overstates — volatility."
    },
    {
      id: "alternatives-q6",
      section: "Performance & Fees",
      q: "An LP has paid in $50 million to a fund, has received cumulative distributions of $30 million, and holds a remaining NAV of $45 million. The fund's TVPI is <em>closest to</em>:",
      choices: ["0.60×", "1.50×", "1.67×"],
      answer: 1,
      expl: "TVPI = (distributions + NAV) ⁄ paid-in = (30 + 45) ⁄ 50 = 1.50×. DPI is 0.60× (the first choice measures only realized value); 1.67× results from wrongly dividing by distributions or mixing up numerator terms. TVPI = DPI (0.60) + RVPI (0.90)."
    },
    {
      id: "alternatives-q7",
      section: "Performance & Fees",
      q: "A hedge fund begins the year with $100 million and earns a 20% gross return. It charges a 2% management fee on end-of-year AUM and a 20% incentive fee on gains net of the management fee, with no hurdle. The investor's net return is <em>closest to</em>:",
      choices: ["13.6%", "14.1%", "16.0%"],
      answer: 1,
      expl: "Year-end AUM = 120. Management fee = 2% × 120 = 2.4. Net gain = 120 − 2.4 − 100 = 17.6; incentive fee = 20% × 17.6 = 3.52. Investor value = 120 − 2.4 − 3.52 = 114.08, a 14.1% net return. 13.6% wrongly computes the incentive fee independent of (not net of) the management fee AND uses it with the stated terms; 16.0% ignores the management fee in the incentive calculation."
    },
    {
      id: "alternatives-q8",
      section: "Performance & Fees",
      q: "A fund with a high-water mark provision suffers a losing year. In the following year, the manager earns an incentive fee only if the fund's value:",
      choices: [
        "Rises above its value at the start of that year",
        "Rises above the highest after-fee value on which an incentive fee was previously paid",
        "Rises above the fund's original subscription value plus the hurdle"
      ],
      answer: 1,
      expl: "The high-water mark is the highest net-of-fee value previously reached; incentive fees accrue only on gains above it, so investors do not pay twice for the same performance. Beating just the year's starting value is not enough after a drawdown, and the HWM resets to the highest after-fee peak, not the original investment."
    },
    {
      id: "alternatives-q9",
      section: "Performance & Fees",
      q: "The J-curve in private equity fund performance is <em>most likely</em> explained by:",
      choices: [
        "Fees on committed capital and conservative early valuations, followed by value realization at exit",
        "Survivorship bias in private equity benchmarks",
        "The use of leverage in buyout transactions"
      ],
      answer: 0,
      expl: "Early in a fund's life, management fees are charged on full committed capital while investments are immature and conservatively appraised, producing negative net returns; exits in later years drive returns positive — the J shape. Survivorship bias distorts index data, not an individual fund's return path, and leverage affects magnitude of returns, not their characteristic time pattern."
    },
    {
      id: "alternatives-q10",
      section: "Private Capital",
      q: "Compared with a venture capital investment, a leveraged buyout investment <em>most likely</em> involves:",
      choices: [
        "A minority equity stake in a company with unproven cash flows",
        "A controlling stake in an established company with stable cash flows",
        "A subordinated loan with attached equity warrants"
      ],
      answer: 1,
      expl: "Buyouts acquire control (usually 100%) of mature companies whose predictable cash flows can support heavy debt financing. VC takes minority stakes in young, often pre-profit companies. A subordinated loan with warrants describes mezzanine debt, a private debt instrument rather than an equity buyout."
    },
    {
      id: "alternatives-q11",
      section: "Private Capital",
      q: "A private equity sponsor has a portfolio company borrow money to pay the fund a large special dividend while the sponsor retains its ownership stake. This transaction is <em>best</em> described as:",
      choices: [
        "A secondary sale",
        "A recapitalization, which is not a full exit",
        "A trade sale"
      ],
      answer: 1,
      expl: "A (dividend) recapitalization returns capital to the sponsor early via new debt but leaves the sponsor in control — it is not a true exit. A secondary sale transfers the company to another financial sponsor and a trade sale to a strategic buyer; both end the fund's ownership."
    },
    {
      id: "alternatives-q12",
      section: "Private Capital",
      q: "Which form of private debt is <em>most likely</em> to be subordinated to senior loans and to include warrants giving the lender participation in the borrower's equity upside?",
      choices: ["Mezzanine debt", "Unitranche direct lending", "Distressed debt"],
      answer: 0,
      expl: "Mezzanine debt sits between senior debt and equity in the capital structure and typically carries equity kickers (warrants or conversion rights) to compensate for its junior ranking. Unitranche lending blends senior and subordinated debt into a single loan without equity participation; distressed debt is existing debt of troubled companies bought at a discount."
    },
    {
      id: "alternatives-q13",
      section: "Real Estate & Infrastructure",
      q: "A property is expected to produce effective gross income of $3.8 million, operating expenses of $0.8 million, and mortgage interest of $0.5 million next year. Comparable properties sell at a 6% capitalization rate. Using direct capitalization, the property's value is <em>closest to</em>:",
      choices: ["$41.7 million", "$50.0 million", "$63.3 million"],
      answer: 1,
      expl: "NOI = 3.8 − 0.8 = $3.0M; financing costs (mortgage interest) are excluded from NOI. Value = NOI ⁄ cap rate = 3.0 ⁄ 0.06 = $50.0M. $41.7M wrongly deducts the interest ((3.0 − 0.5) ⁄ 0.06); $63.3M capitalizes gross income without subtracting operating expenses."
    },
    {
      id: "alternatives-q14",
      section: "Real Estate & Infrastructure",
      q: "Within the four quadrants of real estate investing, residential mortgage-backed securities are <em>best</em> classified as:",
      choices: ["Public real estate debt", "Private real estate debt", "Public real estate equity"],
      answer: 0,
      expl: "MBS are securitized mortgage loans traded in public markets — public debt. Whole mortgage loans held directly are private debt; REITs and REOCs are public equity. Debt holders earn interest secured by the property but do not share in appreciation."
    },
    {
      id: "alternatives-q15",
      section: "Real Estate & Infrastructure",
      q: "An infrastructure fund invests in a toll road that is still to be constructed. This investment is <em>best</em> described as:",
      choices: [
        "Brownfield economic infrastructure",
        "Greenfield economic infrastructure",
        "Greenfield social infrastructure"
      ],
      answer: 1,
      expl: "Assets yet to be built are greenfield (construction and demand risk, higher expected return); existing assets are brownfield. A toll road supports economic activity and charges users, so it is economic infrastructure — social infrastructure (schools, hospitals, prisons) serves communities and is typically paid by governments."
    },
    {
      id: "alternatives-q16",
      section: "Natural Resources",
      q: "Spot gold is $1,800/oz and the 3-month futures contract trades at $1,780. An investor buys the futures contract and holds to expiry, when spot is $1,830 and the futures price has converged to spot. The roll yield component of the return is <em>closest to</em>:",
      choices: ["−1.1%", "+1.1%", "+2.8%"],
      answer: 1,
      expl: "Futures return = (1,830 − 1,780) ⁄ 1,780 = +2.81%; spot return = (1,830 − 1,800) ⁄ 1,800 = +1.67%. Roll yield ≈ 2.81% − 1.67% = +1.1%, positive because the market was in backwardation (futures below spot) and the futures price pulled up toward spot. −1.1% reverses the sign (the contango case); +2.8% is the total futures return, not the roll component."
    },
    {
      id: "alternatives-q17",
      section: "Natural Resources",
      q: "Relative to farmland, an investment in timberland <em>most likely</em> offers:",
      choices: [
        "Greater flexibility in the timing of harvest",
        "Higher current income from annual crop sales",
        "Lower sensitivity to commodity prices"
      ],
      answer: 0,
      expl: "Timberland's distinguishing feature is optionality: harvest can be deferred when lumber prices are low while the trees continue to grow in volume and value. Farm crops must be harvested when ripe, which is where the annual income comes from. Both assets remain sensitive to the prices of their output commodities."
    },
    {
      id: "alternatives-q18",
      section: "Hedge Funds",
      q: "In a stock-for-stock merger, a merger arbitrage hedge fund would <em>most likely</em>:",
      choices: [
        "Buy the acquirer's shares and short the target's shares",
        "Buy the target's shares and short the acquirer's shares",
        "Buy both companies' shares to capture the deal premium"
      ],
      answer: 1,
      expl: "The classic trade is long the target (trading below the offer value) and short the acquirer's shares (which fund the stock consideration), locking in the deal spread if the merger closes. Reversing the legs — the first choice — is the standard trap. The strategy's key risk is the deal breaking, which produces large losses."
    },
    {
      id: "alternatives-q19",
      section: "Hedge Funds",
      q: "A hedge fund moves a hard-to-value private position into a separate account from which redeeming investors cannot withdraw until the asset is sold. This mechanism is <em>best</em> described as a:",
      choices: ["Gate", "Side pocket", "Soft lockup"],
      answer: 1,
      expl: "Side pockets segregate illiquid or hard-to-value assets so that redeeming investors keep only a claim payable when the asset is realized. A gate limits the percentage of capital that can be redeemed on a given redemption date; a soft lockup permits early redemption but charges a fee."
    },
    {
      id: "alternatives-q20",
      section: "Digital Assets",
      q: "Compared with proof-of-work consensus, proof-of-stake validation <em>most likely</em>:",
      choices: [
        "Consumes more energy because validators must pledge computing power",
        "Consumes less energy because validators pledge their own coins rather than compute puzzle solutions",
        "Eliminates the need for a consensus mechanism entirely"
      ],
      answer: 1,
      expl: "Proof of stake selects validators who stake their own coins as collateral (forfeited for misbehavior), avoiding the energy-intensive computational race of proof-of-work mining, and typically processing transactions faster. PoS is still a consensus mechanism — decentralized networks always need one to validate transactions without a central authority."
    },
    {
      id: "alternatives-q21",
      section: "Digital Assets",
      q: "An investor compares a spot Bitcoin ETP with a futures-based Bitcoin ETP. If Bitcoin futures trade in persistent contango, the futures-based ETP is <em>most likely</em> to:",
      choices: [
        "Underperform the spot ETP because of negative roll yield",
        "Outperform the spot ETP because futures embed positive carry",
        "Match the spot ETP because futures converge to spot at expiry"
      ],
      answer: 0,
      expl: "In contango the fund repeatedly rolls into higher-priced contracts whose premium decays toward spot — a negative roll yield that drags returns below the spot price path, the same mechanics as commodity futures indexes. Convergence at expiry is exactly what destroys the premium paid, so it does not make the two products equivalent."
    }
  ],
  flashcards: [
    { id: "alternatives-f1", front: "Three methods of investing in alternatives (in order of decreasing fees / increasing required expertise)", back: "Fund investing (pay full fees, manager does everything) → co-investing (alongside a fund in specific deals, reduced fees, adverse-selection risk) → direct investing (no fund, full control, most expertise and capital required)." },
    { id: "alternatives-f2", front: "GP vs LP in a limited partnership", back: "GP = general partner: manages the fund, theoretically unlimited liability. LP = limited partner: passive investor, liability limited to committed capital, must usually be an accredited investor. Terms set in the LPA; investor-specific terms in side letters." },
    { id: "alternatives-f3", front: "Committed capital vs drawdown / capital call", back: "Committed capital = total the LP has pledged. The GP calls (draws down) portions over the investment period (~first 3–5 years) as deals are found. PE management fees are typically charged on COMMITTED capital during that period." },
    { id: "alternatives-f4", front: "Hard hurdle vs soft hurdle vs catch-up clause", back: "Hard hurdle: incentive fee only on gains ABOVE the hurdle. Soft hurdle: fee on ALL gains once the hurdle is cleared. Catch-up: after the hurdle, GP takes 100% of gains until it has its full profit share, then normal split resumes." },
    { id: "alternatives-f5", front: "High-water mark (HWM)", back: "Highest after-fee value on which an incentive fee has been paid. New incentive fees accrue only on gains above the HWM, so investors never pay twice for the same performance. Management fees are still charged in loss years." },
    { id: "alternatives-f6", front: "American vs European waterfall; clawback", back: "American = deal-by-deal carry, GP-friendly. European = whole-of-fund: LPs get all contributed capital (plus preferred return) back before any carry, LP-friendly. Clawback: GP must repay excess carry if later losses show it was overpaid." },
    { id: "alternatives-f7", front: "Survivorship bias vs backfill bias", back: "Survivorship: failed funds drop out of databases → reported returns overstated, risk understated. Backfill (self-selection): a joining fund's good pre-inclusion history is added → returns overstated. Both flatter the index." },
    { id: "alternatives-f8", front: "Why do appraisal-based valuations understate risk?", back: "Appraisals adjust slowly, smoothing reported returns → measured volatility, drawdowns, and correlation with public markets are all understated, overstating diversification and risk-adjusted performance." },
    { id: "alternatives-f9", front: "DPI, RVPI, TVPI formulas", back: "DPI = cumulative distributions ⁄ paid-in capital (realized). RVPI = remaining NAV ⁄ paid-in capital (unrealized). TVPI = DPI + RVPI. All are net of fees and carry; denominator is paid-in, not committed, capital." },
    { id: "alternatives-f10", front: "MOIC vs IRR", back: "MOIC (money multiple) = total value ⁄ invested capital: simple, but ignores timing. IRR is money-weighted and captures timing, but assumes reinvestment at the IRR and can be gamed (early exits, credit lines delaying capital calls). Use both." },
    { id: "alternatives-f11", front: "J-curve", back: "Private fund net returns are negative early (fees on committed capital, immature/conservatively valued deals) and rise later as exits realize value — cumulative return plot looks like a J. Makes interim IRRs of young funds unreliable." },
    { id: "alternatives-f12", front: "Private equity financing stages", back: "Venture capital (pre-seed/angel → seed → early stage → later stage): minority stakes, young pre-profit firms. Growth equity: minority stakes in expanding, maturing firms. Buyout/LBO: controlling stake in an established firm, debt-financed; MBO = management participates." },
    { id: "alternatives-f13", front: "Private equity exit routes", back: "IPO (highest potential value, costly, market-dependent); trade sale (to strategic buyer, synergy premium); secondary sale (to another PE firm); recapitalization (debt-funded dividend — returns cash but NOT a full exit); write-off/liquidation." },
    { id: "alternatives-f14", front: "Private debt: direct lending, mezzanine, distressed", back: "Direct lending: senior secured loans to mid-size firms (unitranche = blended senior+junior loan) — lowest risk. Mezzanine: subordinated, with warrants/equity kicker — higher yield. Distressed: buy debt of troubled firms at a discount — highest risk, needs restructuring expertise." },
    { id: "alternatives-f15", front: "Four quadrants of real estate", back: "Private equity: direct property ownership. Public equity: REITs, REOCs. Private debt: whole mortgage loans. Public debt: MBS/CMBS. Public = liquid, more equity-like short-term correlation; private = illiquid, appraisal-smoothed." },
    { id: "alternatives-f16", front: "Net operating income (NOI)", back: "Rental income (after vacancy/collection losses) + other income − operating expenses. EXCLUDES mortgage interest, income taxes, and depreciation. The numerator for direct capitalization." },
    { id: "alternatives-f17", front: "Direct capitalization formula and cap rate intuition", back: "Value = first-year stabilized NOI ⁄ cap rate; cap rate = NOI ⁄ comparable sale price. Higher cap rate → lower value. Conceptually cap rate ≈ discount rate − growth. Use DCF instead when cash flows are not stable." },
    { id: "alternatives-f18", front: "Greenfield vs brownfield; economic vs social infrastructure", back: "Greenfield: to be built — construction/demand risk, higher expected return. Brownfield: existing asset — operating history, immediate stable yield. Economic: user-paid (toll roads, airports, utilities, pipelines). Social: government-paid (schools, hospitals, prisons)." },
    { id: "alternatives-f19", front: "Contango vs backwardation and roll yield for a long futures investor", back: "Contango: futures > spot → NEGATIVE roll yield (buy dear, converge down). Backwardation: futures < spot → POSITIVE roll yield (buy cheap, converge up). Backwardation is linked to high convenience yield / net-short hedging pressure." },
    { id: "alternatives-f20", front: "Components of a commodity futures total return", back: "Total return ≈ spot (price) return + roll return + collateral return (interest on cash/T-bills posted as collateral). Roll return can dominate for fully collateralized indexes." },
    { id: "alternatives-f21", front: "Timberland vs farmland", back: "Timberland: harvest timing is FLEXIBLE — defer cutting when prices are low while trees keep growing (embedded option). Farmland: harvest is INFLEXIBLE (row crops annual, permanent crops fixed); income from crops/leases plus land appreciation. Both: illiquid inflation hedges." },
    { id: "alternatives-f22", front: "Four hedge fund strategy groups", back: "Equity hedge (long/short, market neutral, short bias); event-driven (merger arb: long target/short acquirer; distressed; activist); relative value (convertible arb, fixed-income arb — levered convergence); opportunistic (global macro, managed futures/CTA trend following)." },
    { id: "alternatives-f23", front: "Hedge fund liquidity terms: lockup, notice, gate, side pocket", back: "Lockup: no redemptions for an initial period (soft lockup = exit allowed for a fee). Notice period: advance warning (30–90 days) before redeeming. Gate: caps redemptions per date (e.g., 25%/quarter). Side pocket: segregates illiquid assets — paid out only when realized." },
    { id: "alternatives-f24", front: "Master–feeder structure", back: "Onshore feeder (domestic taxable investors) + offshore feeder (foreign/tax-exempt investors) both invest in a single master fund that holds the portfolio — one strategy, multiple tax wrappers." },
    { id: "alternatives-f25", front: "Proof of work vs proof of stake; permissioned vs permissionless", back: "PoW: miners race to solve puzzles — secure, energy-intensive, slow. PoS: validators stake coins, forfeited for misbehavior — efficient, faster. Permissionless: open to anyone (Bitcoin). Permissioned: participation restricted (institutional networks)." },
    { id: "alternatives-f26", front: "Tokenization, NFTs, DeFi, stablecoins", back: "Tokenization: blockchain tokens representing ownership of real/financial assets → fractional ownership, cheaper transfer. NFT: unique, non-interchangeable token proving ownership of a specific item. DeFi: financial services via smart contracts, no intermediaries. Stablecoin: token pegged to an asset (e.g., USD) — only as sound as its reserves." },
    { id: "alternatives-f27", front: "Key risks of digital assets", back: "Extreme volatility with no cash flows to anchor value; fraud and market manipulation; custody/hacking risk (irreversible transactions, lost keys = lost assets); shifting regulation; correlations with equities rise in stress, weakening the diversification case." }
  ]
};
