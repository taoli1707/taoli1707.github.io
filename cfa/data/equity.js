window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["equity"] = {
  name: "Equity Investments",
  weight: "11–14%",
  sections: [
    "Market Organization and Structure",
    "Security Market Indexes",
    "Market Efficiency",
    "Overview of Equity Securities",
    "Company Analysis: Past and Present",
    "Industry and Competitive Analysis",
    "Company Analysis: Forecasting",
    "Equity Valuation: Concepts and Basic Tools"
  ],
  questions: [
    {
      id: "equity-q1",
      section: "Market Organization",
      q: "An investor buys shares at $36 on margin. The initial margin requirement is 50% and the maintenance margin requirement is 30%. The price below which the investor will receive a margin call is <em>closest to</em>:",
      choices: ["$25.71", "$18.00", "$30.86"],
      answer: 0,
      expl: "Margin call price = P₀ × (1 − initial margin) ⁄ (1 − maintenance margin) = 36 × 0.50 ⁄ 0.70 = $25.71. $18.00 is just the loan per share (36 × 0.5); $30.86 comes from wrongly using (1 − 0.30) ⁄ (1 − 0.50) × ... i.e., mixing up which margin goes where."
    },
    {
      id: "equity-q2",
      section: "Market Organization",
      q: "If the initial margin requirement is 40%, the maximum leverage ratio for a margin purchase is <em>closest to</em>:",
      choices: ["1.67", "2.5", "4.0"],
      answer: 1,
      expl: "Maximum leverage ratio = 1 ⁄ initial margin = 1 ⁄ 0.40 = 2.5: a $100 position can be carried with $40 of equity. 1.67 uses 1 ⁄ (1 − 0.40); 4.0 has no basis in the formula."
    },
    {
      id: "equity-q3",
      section: "Market Organization",
      q: "A stock trades at $30. A trader wants to buy the stock, but only if its price falls to $25 or lower. The trader should <em>most likely</em> place a:",
      choices: ["stop order to buy at $25", "market order to buy", "limit order to buy at $25"],
      answer: 2,
      expl: "A limit buy at $25 executes only at $25 or better (lower) — exactly the instruction. A stop buy at $25 would be invalid here in spirit: stop-buy orders trigger when the price RISES to the stop and are used to cover shorts or chase momentum. A market order executes immediately at about $30."
    },
    {
      id: "equity-q4",
      section: "Market Organization",
      q: "A publicly traded company sells additional new shares to investors, with an investment bank guaranteeing the sale price by committing to buy any unsold shares. This transaction is <em>best</em> described as:",
      choices: ["an underwritten seasoned offering in the primary market", "a best-efforts offering in the secondary market", "a private placement in the primary market"],
      answer: 0,
      expl: "New shares sold by the issuer = primary market; the firm is already public, so it is a seasoned (not initial) offering; the bank's guarantee makes it underwritten, not best-efforts. Secondary market trades are between investors and raise no money for the issuer."
    },
    {
      id: "equity-q5",
      section: "Market Organization",
      q: "In which market structure do customers trade at prices quoted by dealers who trade from their own inventory?",
      choices: ["Order-driven market", "Quote-driven market", "Brokered market"],
      answer: 1,
      expl: "Quote-driven (dealer/OTC) markets are exactly this — most bond and currency trading. Order-driven markets match public orders against each other using precedence rules; brokered markets rely on brokers to find counterparties for unique, illiquid assets."
    },
    {
      id: "equity-q6",
      section: "Market Indexes",
      q: "A price-weighted index contains two stocks: Stock X (price $40 → $44) and Stock Y (price $60 → $63). The index return for the period is <em>closest to</em>:",
      choices: ["7.5%", "5.0%", "7.0%"],
      answer: 2,
      expl: "Price-weighted return = change in the sum of prices: (44 + 63) ⁄ (40 + 60) − 1 = 107 ⁄ 100 − 1 = 7.0%. 7.5% is the equal-weighted answer (average of +10% and +5%); 5.0% is just Y's return. The higher-priced stock dominates a price-weighted index."
    },
    {
      id: "equity-q7",
      section: "Market Indexes",
      q: "Which index weighting scheme requires the <em>most frequent</em> rebalancing?",
      choices: ["Market-capitalization weighting", "Equal weighting", "Price weighting"],
      answer: 1,
      expl: "Equal weights drift away from 1/n as soon as constituent prices diverge, so they must be reset regularly. A cap-weighted index is largely self-rebalancing (weights move with prices automatically). Price-weighted indexes need divisor adjustments for splits, not routine rebalancing."
    },
    {
      id: "equity-q8",
      section: "Market Indexes",
      q: "The <em>most likely</em> reason index providers adjust market-cap weights for free float is to:",
      choices: ["reflect only the shares actually available for purchase by public investors", "reduce the weight of stocks that have recently outperformed", "eliminate the need for reconstitution"],
      answer: 0,
      expl: "Float adjustment excludes shares held by controlling shareholders, governments, and cross-holdings, making the index more investable. It does not target recent performance (that is closer to fundamental weighting's effect) and has nothing to do with reconstitution, which is the changing of constituents."
    },
    {
      id: "equity-q9",
      section: "Market Indexes",
      q: "Over the same period and with identical constituents, a total return index compared with the corresponding price return index will <em>most likely</em> show:",
      choices: ["the same value, because both hold the same securities", "a lower value, because fees are deducted", "a higher value, because it includes reinvested dividends and interest"],
      answer: 2,
      expl: "The total return version adds all cash distributions, assumed reinvested, so it grows faster than the price-only version from the same inception value, and the gap compounds. Indexes do not deduct management fees; that is a fund characteristic."
    },
    {
      id: "equity-q10",
      section: "Market Efficiency",
      q: "If markets are semi-strong-form efficient, which activity is <em>most likely</em> to generate consistent abnormal returns?",
      choices: ["Trading on material nonpublic information", "Fundamental analysis of published financial statements", "Technical analysis of past prices and volume"],
      answer: 0,
      expl: "Semi-strong efficiency means prices already reflect all PUBLIC information, so neither technical analysis (past market data) nor fundamental analysis of public statements can consistently beat the market. Only private (inside) information could — which is why it is illegal in most jurisdictions."
    },
    {
      id: "equity-q11",
      section: "Market Efficiency",
      q: "Researchers document that corporate insiders earn consistent abnormal profits trading their own companies' shares. This evidence <em>most directly</em> rejects:",
      choices: ["semi-strong-form market efficiency", "strong-form market efficiency", "weak-form market efficiency"],
      answer: 1,
      expl: "Only the strong form claims prices reflect private information; insider profits contradict it. Semi-strong and weak forms concern public information and past market data respectively, and insider profits are fully consistent with both holding."
    },
    {
      id: "equity-q12",
      section: "Market Efficiency",
      q: "The January effect — abnormally high small-cap returns in early January — is <em>best</em> classified as a:",
      choices: ["cross-sectional anomaly", "violation of strong-form efficiency", "time-series (calendar) anomaly"],
      answer: 2,
      expl: "Calendar patterns are time-series anomalies. Cross-sectional anomalies compare securities to each other at a point in time (size effect, value effect). The January effect involves only public/past information, so it bears on weak/semi-strong efficiency, not the strong form; it has also largely faded since publication."
    },
    {
      id: "equity-q13",
      section: "Market Efficiency",
      q: "Which change would <em>most likely</em> reduce a market's informational efficiency?",
      choices: ["New restrictions that make short selling more difficult", "An increase in the number of analysts covering the market", "A reduction in transaction costs"],
      answer: 0,
      expl: "Short-selling limits are an impediment to arbitrage: pessimistic investors cannot act, so overpricing persists longer. More participants and cheaper trading both speed the incorporation of information into prices, increasing efficiency."
    },
    {
      id: "equity-q14",
      section: "Equity Securities",
      q: "A company with cumulative preference shares outstanding skipped its preferred dividend for two years. Before it can pay any dividend to common shareholders, it must <em>most likely</em>:",
      choices: ["pay only the current year's preferred dividend", "pay all preferred dividends in arrears in full", "obtain a waiver vote from the preferred shareholders"],
      answer: 1,
      expl: "Cumulative preference shares accrue unpaid dividends as dividends in arrears, all of which must be paid before any common dividend. With non-cumulative shares the skipped dividends would simply be lost. No waiver mechanism is part of the standard cumulative feature."
    },
    {
      id: "equity-q15",
      section: "Equity Securities",
      q: "Compared with a sponsored depository receipt, an unsponsored DR <em>most likely</em> differs in that:",
      choices: ["the depository bank, not the investor, retains the voting rights", "the receipts are denominated in the issuer's home currency", "the issuing company bears the arrangement costs"],
      answer: 0,
      expl: "In an unsponsored DR the depository bank creates the program without the company's participation and keeps the votes; sponsored DRs give investors voting rights and involve the issuer directly (with greater disclosure). DRs trade in the local market's currency (e.g., USD for ADRs), and in an unsponsored program the company is not involved in the costs."
    },
    {
      id: "equity-q16",
      section: "Equity Securities",
      q: "A firm reports net income of $150 million. Shareholders' equity was $900 million at the beginning of the year and $1,100 million at the end. Using average equity, ROE is <em>closest to</em>:",
      choices: ["16.7%", "13.6%", "15.0%"],
      answer: 2,
      expl: "Average equity = (900 + 1,100) ⁄ 2 = 1,000, so ROE = 150 ⁄ 1,000 = 15.0%. 16.7% uses beginning equity only (150/900) and 13.6% uses ending equity only (150/1,100) — both are the standard distractors when the question specifies AVERAGE equity."
    },
    {
      id: "equity-q17",
      section: "Equity Securities",
      q: "Relative to otherwise identical non-callable common shares, callable common shares <em>most likely</em>:",
      choices: ["are riskier for investors and offer a higher expected return", "are less risky for investors because the issuer guarantees a buyback price", "have identical risk because the call only affects the issuer"],
      answer: 0,
      expl: "The call option belongs to the ISSUER, which will call the shares when the market price exceeds the call price — capping investors' upside. Investors therefore pay less and require higher expected compensation. It is putable shares (holder's option to sell back at a floor price) that reduce investor risk."
    },
    {
      id: "equity-q18",
      section: "Company Analysis",
      q: "A firm has revenue of $800, variable costs of $480, and fixed operating costs of $240. Its degree of operating leverage is <em>closest to</em>:",
      choices: ["10.0", "4.0", "2.5"],
      answer: 1,
      expl: "Contribution margin = 800 − 480 = 320; operating income = 320 − 240 = 80; DOL = 320 ⁄ 80 = 4.0, meaning a 1% revenue change moves operating income about 4%. 10.0 wrongly uses revenue ⁄ operating income; 2.5 wrongly uses revenue ⁄ contribution margin — only contribution margin over operating income is correct."
    },
    {
      id: "equity-q19",
      section: "Company Analysis",
      q: "A company's days sales outstanding is 45, days of inventory on hand is 60, and days payables outstanding is 30. Its cash conversion cycle is <em>closest to</em>:",
      choices: ["135 days", "15 days", "75 days"],
      answer: 2,
      expl: "CCC = DSO + DOH − DPO = 45 + 60 − 30 = 75 days. 135 adds all three (forgetting that payables are financing PROVIDED to the firm and are subtracted); 15 subtracts inventory instead of payables."
    },
    {
      id: "equity-q20",
      section: "Industry Analysis",
      q: "Which of the following is <em>least likely</em> one of Porter's five forces?",
      choices: ["Regulatory environment", "Threat of substitute products", "Bargaining power of suppliers"],
      answer: 0,
      expl: "The five forces are: threat of new entrants, bargaining power of suppliers, bargaining power of buyers, threat of substitutes, and rivalry among existing competitors. Regulation belongs to PESTLE analysis (and can act as an entry barrier), but it is not itself one of the five forces."
    },
    {
      id: "equity-q21",
      section: "Industry Analysis",
      q: "An industry has slowing growth, excess capacity, intense price competition, and weaker firms exiting or being acquired. This industry is <em>most likely</em> in which life-cycle stage?",
      choices: ["Mature", "Shakeout", "Growth"],
      answer: 1,
      expl: "Shakeout is defined by decelerating growth colliding with capacity built for faster growth: price cutting, margin compression, and consolidation of weak players. The mature stage features little growth but stable shares and pricing discipline among survivors; the growth stage has rapid demand growth and limited competitive pressure."
    },
    {
      id: "equity-q22",
      section: "Industry Analysis",
      q: "An industry with high barriers to entry will <em>most likely</em>:",
      choices: ["not necessarily earn high returns, because pricing power may still be weak", "always earn high returns, because new competitors cannot enter", "have low exit barriers as well"],
      answer: 0,
      expl: "High entry barriers do not guarantee profitability — capital-intensive industries such as airlines have high entry barriers yet fierce price competition and poor returns, partly because high EXIT barriers keep excess capacity in the market. Entry and exit barriers are distinct and often move together in capital-intensive industries."
    },
    {
      id: "equity-q23",
      section: "Forecasting",
      q: "An analyst forecasts a company's revenue by estimating national GDP growth, deriving industry sales from its historical relationship to GDP, and applying the company's expected market share. This approach is <em>best</em> described as:",
      choices: ["bottom-up", "time-series extrapolation", "top-down"],
      answer: 2,
      expl: "Starting from the macro economy and narrowing to industry and then company is the definition of top-down forecasting. Bottom-up starts from company-level drivers (stores, units, customers) and aggregates upward; extrapolating the firm's own historical growth is a bottom-up technique."
    },
    {
      id: "equity-q24",
      section: "Forecasting",
      q: "A firm expects unit volume to grow 4% and average selling prices to rise 2% next year. Expected revenue growth is <em>closest to</em>:",
      choices: ["6.0%", "6.1%", "8.0%"],
      answer: 1,
      expl: "Growth compounds multiplicatively: (1.04)(1.02) − 1 = 6.08% ≈ 6.1%. Simply adding 4% + 2% = 6.0% ignores the interaction term (higher prices apply to the additional volume); 8.0% double-counts."
    },
    {
      id: "equity-q25",
      section: "Equity Valuation",
      q: "A stock just paid a dividend of $2.00. Dividends are expected to grow at 4% indefinitely and the required return is 9%. Using the Gordon growth model, the stock's value is <em>closest to</em>:",
      choices: ["$41.60", "$40.00", "$52.00"],
      answer: 0,
      expl: "D₁ = 2.00 × 1.04 = 2.08; V₀ = 2.08 ⁄ (0.09 − 0.04) = 2.08 ⁄ 0.05 = $41.60. $40.00 is the classic error of using D₀ instead of D₁ (2.00/0.05); $52.00 divides by g instead of (r − g)."
    },
    {
      id: "equity-q26",
      section: "Equity Valuation",
      q: "A firm's dividend payout ratio is 50%, its required return on equity is 10%, and its expected constant growth rate is 6%. The justified forward P/E is <em>closest to</em>:",
      choices: ["25.0", "8.3", "12.5"],
      answer: 2,
      expl: "Justified forward P/E = payout ⁄ (r − g) = 0.50 ⁄ (0.10 − 0.06) = 0.50 ⁄ 0.04 = 12.5. 25.0 forgets the payout ratio (1/0.04); 8.3 divides the payout by g (0.50/0.06) instead of by r − g."
    },
    {
      id: "equity-q27",
      section: "Equity Valuation",
      q: "A perpetual, non-callable preference share has a $100 par value and pays a 6% annual dividend. If investors require an 8% return, the share's value is <em>closest to</em>:",
      choices: ["$100.00", "$75.00", "$60.00"],
      answer: 1,
      expl: "The share is a perpetuity: V = D ⁄ r = (100 × 0.06) ⁄ 0.08 = 6 ⁄ 0.08 = $75.00. $100 is par (correct only if required return equals the 6% stated rate); $60.00 comes from dividing the dividend by 10% or multiplying par by the dividend rate incorrectly."
    },
    {
      id: "equity-q28",
      section: "Equity Valuation",
      q: "A company has 50 million shares trading at $20, debt with a market value of $400 million, no preferred stock, and cash and short-term investments of $100 million. With EBITDA of $125 million, its EV/EBITDA multiple is <em>closest to</em>:",
      choices: ["10.4×", "11.2×", "8.0×"],
      answer: 0,
      expl: "EV = equity + debt − cash = (50 × 20) + 400 − 100 = 1,300; EV/EBITDA = 1,300 ⁄ 125 = 10.4×. 11.2× forgets to subtract cash (1,400/125); 8.0× forgets to add debt (1,000/125). EV must capture the cost of buying ALL the capital, net of the cash acquired."
    },
    {
      id: "equity-q29",
      section: "Equity Valuation",
      q: "In a two-stage DDM with a three-year high-growth stage, the terminal value computed as P₃ = D₄ ⁄ (r − g) should be discounted to the present over:",
      choices: ["4 periods", "3 periods", "the length of the stable-growth stage"],
      answer: 1,
      expl: "P₃ is the value AT time 3 of all dividends from time 4 onward, so it is discounted 3 periods, together with D₃. Discounting it 4 periods (because D₄ appears in the numerator) is the most common exam error; the stable stage is infinite and already captured inside the perpetuity formula."
    },
    {
      id: "equity-q30",
      section: "Equity Valuation",
      q: "Asset-based valuation is <em>most appropriate</em> for valuing:",
      choices: ["a fast-growing software firm whose main assets are developer talent and internally built code", "a mature consumer brand whose value derives chiefly from trademarks and customer loyalty", "a closely held shipping company whose fleet has readily determinable market values"],
      answer: 2,
      expl: "Asset-based valuation works when assets are tangible, separable, and have observable market values — ships, real estate, securities portfolios — or in liquidation. It badly understates firms whose value lies in intangibles (software, brands, human capital) because those rarely appear at fair value, or at all, on the balance sheet."
    }
  ],
  flashcards: [
    { id: "equity-f1", front: "Margin call price for a long position (formula)", back: "P = P₀ × (1 − initial margin) ⁄ (1 − maintenance margin). Below this price, equity/position value < maintenance margin → margin call." },
    { id: "equity-f2", front: "Leverage ratio and maximum leverage", back: "Leverage ratio = position value ⁄ equity. Maximum leverage = 1 ⁄ initial margin requirement (e.g., 50% initial margin → 2× max leverage). Leverage magnifies gains AND losses." },
    { id: "equity-f3", front: "Limit order vs. market order vs. stop order", back: "Limit: executes only at limit price or better — price certainty, execution uncertainty. Market: executes now at best available price — execution certainty, price uncertainty. Stop: becomes executable only after price touches the stop (sell-stops trigger on declines, buy-stops on rises); stops reinforce price momentum." },
    { id: "equity-f4", front: "Primary vs. secondary market", back: "Primary: issuer sells NEW securities (IPO, seasoned offering, private placement, rights offering) and receives the proceeds. Secondary: investors trade existing securities with each other; liquidity here lowers issuers' cost of capital." },
    { id: "equity-f5", front: "Quote-driven vs. order-driven vs. brokered markets", back: "Quote-driven: trade with dealers at their quotes (bonds, FX). Order-driven: rules match public orders — price priority, then time; continuous markets use discriminatory pricing (the standing order's price). Brokered: brokers find counterparties for unique/illiquid assets." },
    { id: "equity-f6", front: "Short sale mechanics: what does the short seller owe?", back: "Borrow shares, sell, repurchase later to return them. Must pay the lender all dividends (payments-in-lieu) and post the proceeds as collateral, earning the short rebate rate. Max gain = 100% of sale price; potential loss unlimited." },
    { id: "equity-f7", front: "Objectives of market regulation (list)", back: "Control fraud and agency problems; promote fairness (insider trading rules); set common standards (e.g., financial reporting); protect unsophisticated investors via competence/disclosure minimums; ensure banks/insurers can meet liabilities (capital requirements)." },
    { id: "equity-f8", front: "Price-weighted index: return and split effect", back: "Index = Σ prices ⁄ divisor; return driven by high-priced stocks. A stock split forces a downward divisor adjustment (index value unchanged) but permanently reduces that stock's weight. Examples: DJIA, Nikkei 225." },
    { id: "equity-f9", front: "Equal-weighted index: return and main drawback", back: "Single-period return = simple average of constituent returns. Drawbacks: underweights large companies and requires the most frequent rebalancing, since weights drift as soon as prices diverge." },
    { id: "equity-f10", front: "Float-adjusted market-cap weighting: why adjust for float?", back: "Weights use only shares available to public investors — excluding controlling holders, cross-holdings, government stakes. Makes the index more investable. Cap-weighted indexes are self-rebalancing but develop a momentum/concentration tilt." },
    { id: "equity-f11", front: "Fundamental weighting: what tilt does it create?", back: "Weights by earnings, book value, sales, dividends, or cash flow instead of price — breaking the price-weight link. Result: a value/contrarian tilt, overweighting stocks that are cheap relative to fundamentals." },
    { id: "equity-f12", front: "Price return index vs. total return index", back: "Price return: constituent prices only. Total return: prices plus all dividends/interest, reinvested. Same inception value; total return version grows faster and the gap compounds over time." },
    { id: "equity-f13", front: "Rebalancing vs. reconstitution", back: "Rebalancing: restoring constituent WEIGHTS to target (matters most for equal weighting). Reconstitution: changing the constituent LIST (additions rise, deletions fall on announcement as index funds trade)." },
    { id: "equity-f14", front: "Three forms of market efficiency and the information set of each", back: "Weak: all past market data (prices, volume) → technical analysis useless. Semi-strong: all public information → fundamental analysis of public data also useless. Strong: all information including private → even insiders couldn't profit (empirically rejected)." },
    { id: "equity-f15", front: "If markets are semi-strong efficient, what should investors do?", back: "Prefer passive/index investing — active management underperforms on average after fees. Managers still add value via risk-return objectives, diversification, asset allocation, tax management, and rebalancing." },
    { id: "equity-f16", front: "Name three documented market anomalies and the curriculum's verdict", back: "Time-series: January/calendar effects, momentum-overreaction. Cross-sectional: size effect, value effect. Other: closed-end fund discounts, post-earnings-announcement drift, IPO underpricing. Verdict: mostly vanish after discovery/costs — not reliable trading strategies." },
    { id: "equity-f17", front: "Key behavioral finance biases (list)", back: "Loss aversion (losses hurt more than gains please), overconfidence, herding and information cascades, representativeness, mental accounting, conservatism (slow belief updating), narrow framing. They explain deviations, but markets can be efficient even if individuals are not rational." },
    { id: "equity-f18", front: "Cumulative vs. participating preference shares", back: "Cumulative: skipped dividends accrue as arrears and must be paid in full before any common dividend. Participating: receives stated dividend PLUS extra dividends if profits exceed a threshold (and possibly extra liquidation value); common in smaller, riskier firms." },
    { id: "equity-f19", front: "Callable vs. putable shares: who holds the option and who bears the risk?", back: "Callable: ISSUER may repurchase at the call price — caps investor upside → riskier for investors, higher required return, lower price. Putable: HOLDER may sell back at a floor price → less risky, lower required return, higher price, lower cost of capital for the issuer." },
    { id: "equity-f20", front: "ADR vs. GDR; sponsored vs. unsponsored", back: "ADR: USD security trading in the US. GDR: trades outside the issuer's home country and outside the US (often London/Luxembourg). Sponsored: company participates, investor gets votes, fuller disclosure. Unsponsored: bank acts alone and keeps the voting rights." },
    { id: "equity-f21", front: "ROE formula and the leverage caveat", back: "ROE = net income ⁄ average total equity (or beginning equity). Caveat: ROE can rise simply because debt replaces equity — decompose (DuPont) before concluding performance improved. Value is created when ROE exceeds the cost of equity." },
    { id: "equity-f22", front: "Book value vs. market value of equity", back: "Book value = assets − liabilities (balance sheet; backward-looking, management can influence directly). Market value = market's PV of expected future cash flows (forward-looking). P/B compares them; high-growth firms trade at high P/B." },
    { id: "equity-f23", front: "Degree of operating leverage (DOL): formula and meaning", back: "DOL = %Δ operating income ⁄ %Δ revenue = contribution margin ⁄ operating income, where contribution margin = revenue − variable costs. High fixed costs → high DOL → operating income swings amplified in both directions. DOL varies with the sales level." },
    { id: "equity-f24", front: "Cash conversion cycle (formula)", back: "CCC = DSO + DOH − DPO (days receivables + days inventory − days payables). Shorter/negative cycle → suppliers and customers finance operations; a lengthening cycle absorbs cash." },
    { id: "equity-f25", front: "Porter's five forces (list)", back: "1) Threat of new entrants; 2) Bargaining power of suppliers; 3) Bargaining power of buyers; 4) Threat of substitute products; 5) Rivalry among existing competitors. Stronger forces → lower long-run industry profitability. (Regulation is PESTLE, not a force.)" },
    { id: "equity-f26", front: "Industry life cycle stages (in order) and the danger stage", back: "Embryonic → Growth → Shakeout → Mature → Decline. Shakeout: growth slows, overcapacity, price wars, weak firms exit — margins compress. Mature: GDP-like growth, consolidation, pricing discipline, cash cows." },
    { id: "equity-f27", front: "Top-down vs. bottom-up vs. hybrid forecasting", back: "Top-down: economy → industry (growth vs. GDP or market size × share) → company. Bottom-up: aggregate company-level drivers (units × price, stores × sales/store); includes time-series extrapolation. Hybrid: combine both — most common, exposes inconsistencies." },
    { id: "equity-f28", front: "Gordon growth model: formula, assumptions, and sustainable growth", back: "V₀ = D₁ ⁄ (r − g) = D₀(1+g) ⁄ (r − g). Requires constant g forever and r > g; fits mature dividend payers. Sustainable growth g = b × ROE, where b = 1 − payout ratio. Value is highly sensitive to (r − g)." },
    { id: "equity-f29", front: "FCFE: definition and formula", back: "Free cash flow to equity = cash available for distribution to shareholders = CFO − fixed capital investment (capex) + net borrowing. Value equity as PV of FCFE at the required return on equity; useful when dividends are absent or unrelated to capacity to pay." },
    { id: "equity-f30", front: "Justified forward P/E (formula and drivers)", back: "P₀/E₁ = payout ratio p ⁄ (r − g). Rises with g and payout (directly), falls with r. Watch the offset: higher payout lowers retention b, which lowers g = b × ROE — the net effect depends on ROE vs. r." },
    { id: "equity-f31", front: "Enterprise value: components and why EV/EBITDA is useful", back: "EV = market value of common equity + preferred + debt − cash & short-term investments. EV/EBITDA compares firms with different capital structures (EBITDA accrues to all capital providers) and works when EPS < 0; but EBITDA ignores capex and working capital needs." },
    { id: "equity-f32", front: "Preferred stock valuation (perpetual, non-callable)", back: "V = Dₚ ⁄ r, where Dₚ = par × stated dividend rate. Trades below par when required return exceeds the stated rate. Call feature lowers value to investors; put feature raises it." }
  ]
};
