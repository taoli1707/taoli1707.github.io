window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["portfolio"] = {
  name: "Portfolio Management",
  weight: "8–12%",
  sections: [
    "Portfolio Risk and Return: Part I",
    "Portfolio Risk and Return: Part II",
    "Portfolio Management: An Overview",
    "Basics of Portfolio Planning and Construction",
    "The Behavioral Biases of Individuals",
    "Introduction to Risk Management"
  ],
  questions: [
    {
      id: "portfolio-q1",
      section: "Risk & Return I",
      q: "A portfolio is invested 50% in Asset 1 (σ = 20%) and 50% in Asset 2 (σ = 10%), with a correlation of 0.5 between them. The portfolio's standard deviation is closest to:",
      choices: ["11.2%", "13.2%", "15.0%"],
      answer: 1,
      expl: "σ<sub>p</sub>² = (0.5)²(20)² + (0.5)²(10)² + 2(0.5)(0.5)(0.5)(20)(10) = 100 + 25 + 50 = 175, so σ<sub>p</sub> = √175 ≈ 13.2%. The distractor 15.0% is the simple weighted average of the standard deviations, which is only correct when ρ = +1; 11.2% is what you get if you drop the covariance term (ρ = 0)."
    },
    {
      id: "portfolio-q2",
      section: "Risk & Return I",
      q: "An investor allocates 60% to a fund with E(R) = 10% and 40% to a fund with E(R) = 5%. The portfolio's expected return is closest to:",
      choices: ["7.5%", "8.0%", "8.5%"],
      answer: 1,
      expl: "Expected return is always the weighted average: 0.60 × 10% + 0.40 × 5% = 8.0%. Unlike standard deviation, no correlation adjustment applies to expected return. 7.5% is the unweighted average of the two returns."
    },
    {
      id: "portfolio-q3",
      section: "Risk & Return I",
      q: "Two risky assets can be combined into a portfolio with zero standard deviation only if the correlation between their returns equals:",
      choices: ["−1", "0", "+1"],
      answer: 0,
      expl: "Only with perfect negative correlation (ρ = −1) do the assets' movements fully offset, so appropriate weights drive portfolio risk to zero. With ρ = 0 risk is reduced but not eliminated; with ρ = +1 there is no diversification benefit at all."
    },
    {
      id: "portfolio-q4",
      section: "Risk & Return I",
      q: "The efficient frontier consists of the portfolios that have the:",
      choices: ["lowest risk for each level of expected return, over the entire minimum-variance frontier", "highest expected return for each level of risk, at or above the global minimum-variance portfolio", "highest Sharpe ratio for each level of risk aversion"],
      answer: 1,
      expl: "The efficient frontier is only the top half of the minimum-variance frontier — from the global minimum-variance portfolio upward — giving the highest return per risk level. The full minimum-variance frontier (first choice) includes inefficient lower-half portfolios that are dominated by portfolios with the same risk and higher return."
    },
    {
      id: "portfolio-q5",
      section: "Risk & Return I",
      q: "An investor with utility U = E(R) − ½Aσ² and A = 4 compares a risky portfolio (E(R) = 8%, σ = 20%) with a risk-free asset yielding 3%. The investor will most likely choose the:",
      choices: ["risky portfolio, because its utility of 8% exceeds 3%", "risk-free asset, because the risky portfolio's utility is 0%", "risky portfolio, because its utility of 4% exceeds 3%"],
      answer: 1,
      expl: "U = 0.08 − 0.5 × 4 × (0.20)² = 0.08 − 0.08 = 0, i.e., 0%. The risk-free asset delivers utility of 3% (no variance penalty), which is higher, so the risk-averse investor holds the risk-free asset. Ignoring the variance penalty (first choice) is the classic error."
    },
    {
      id: "portfolio-q6",
      section: "Risk & Return I",
      q: "Each investor's optimal portfolio is found at the point where the investor's:",
      choices: ["indifference curve is tangent to the capital allocation line", "indifference curve is tangent to the efficient frontier of risky assets", "capital allocation line is tangent to the efficient frontier"],
      answer: 0,
      expl: "With a risk-free asset available, all investors hold points on the optimal CAL; each investor's own portfolio is where their highest indifference curve touches that CAL. Tangency of the CAL with the efficient frontier (third choice) identifies the optimal risky portfolio, which is the same for all investors — not the individual's overall optimal portfolio."
    },
    {
      id: "portfolio-q7",
      section: "Risk & Return II",
      q: "The covariance of Stock Z's returns with the market is 0.018, and the market standard deviation is 15%. Stock Z's beta is closest to:",
      choices: ["0.12", "0.80", "1.20"],
      answer: 1,
      expl: "β = Cov(Z,m) ⁄ σ<sub>m</sub>² = 0.018 ⁄ (0.15)² = 0.018 ⁄ 0.0225 = 0.80. Dividing by σ<sub>m</sub> instead of σ<sub>m</sub>² gives the distractor 0.12; beta requires the market's variance in the denominator."
    },
    {
      id: "portfolio-q8",
      section: "Risk & Return II",
      q: "The risk-free rate is 2% and the market risk premium is 7%. Using the CAPM, the required return for a stock with a beta of 1.4 is closest to:",
      choices: ["9.0%", "9.8%", "11.8%"],
      answer: 2,
      expl: "E(R) = R<sub>f</sub> + β × MRP = 2% + 1.4 × 7% = 11.8%. Treating the 7% as the expected market return (so premium = 5%) gives the distractor 9.0%; forgetting to add the risk-free rate gives 9.8%. Always check whether you were given E(R<sub>m</sub>) or the risk premium."
    },
    {
      id: "portfolio-q9",
      section: "Risk & Return II",
      q: "An analyst forecasts a 9.5% return for a stock with β = 0.8 when the risk-free rate is 4% and the market risk premium is 5%. Relative to the SML, the stock is most likely:",
      choices: ["undervalued, because the forecast return exceeds the required return of 8.0%", "overvalued, because its beta is below 1.0", "fairly valued, because it plots on the capital market line"],
      answer: 0,
      expl: "Required return = 4% + 0.8 × 5% = 8.0%. A forecast return of 9.5% plots above the SML: the stock offers more than fair compensation for its systematic risk, so it is undervalued. Beta below 1 says nothing about mispricing, and the CML is irrelevant for pricing individual securities."
    },
    {
      id: "portfolio-q10",
      section: "Risk & Return II",
      q: "A portfolio returned 12% with a beta of 1.2 while the risk-free rate was 3% and the market returned 9%. The portfolio's Jensen's alpha is closest to:",
      choices: ["+1.8%", "+3.0%", "−1.8%"],
      answer: 0,
      expl: "Required return = 3% + 1.2 × (9% − 3%) = 10.2%. Alpha = 12% − 10.2% = +1.8%. The distractor +3.0% is the raw excess over the market (12% − 9%), which ignores the portfolio's higher beta."
    },
    {
      id: "portfolio-q11",
      section: "Risk & Return II",
      q: "When evaluating a fund that will be added to an already well-diversified overall portfolio, the most appropriate risk-adjusted performance measure is the:",
      choices: ["Sharpe ratio", "Treynor measure", "coefficient of variation"],
      answer: 1,
      expl: "In a well-diversified context, only systematic risk matters, so the Treynor measure (excess return per unit of beta) is appropriate. The Sharpe ratio uses total risk and fits when the fund is the investor's entire portfolio. The coefficient of variation is not a risk-adjusted excess-return performance measure."
    },
    {
      id: "portfolio-q12",
      section: "Risk & Return II",
      q: "Which statement about the CML and SML is most accurate?",
      choices: ["A fairly priced, undiversified single stock plots on the SML but below the CML", "The x-axis of the SML is total risk, while the x-axis of the CML is beta", "Only efficient portfolios plot on the SML"],
      answer: 0,
      expl: "All fairly priced assets plot on the SML (beta axis), but only efficient combinations of the risk-free asset and the market portfolio reach the CML (total-risk axis). A single stock carries diversifiable risk, so it sits below the CML even when correctly priced. The second choice reverses the axes; the third describes the CML, not the SML."
    },
    {
      id: "portfolio-q13",
      section: "Overview",
      q: "During which step of the portfolio management process is the asset allocation decision made?",
      choices: ["Planning", "Execution", "Feedback"],
      answer: 1,
      expl: "Execution comprises asset allocation, security analysis, and portfolio construction. Planning produces the IPS; feedback covers monitoring, rebalancing, and performance measurement. A common trap is placing asset allocation in planning because the strategic allocation policy appears in the IPS appendix — the allocation itself is executed in step two."
    },
    {
      id: "portfolio-q14",
      section: "Overview",
      q: "Compared with a defined contribution plan, a defined benefit pension plan most likely:",
      choices: ["places the investment risk on the employee", "places the investment risk on the employer", "makes retirement benefits fully portable between employers"],
      answer: 1,
      expl: "In a DB plan the employer promises a specified benefit and must fund any shortfall, so the employer bears investment risk. In a DC plan the employer's obligation stops at the contribution, the employee directs the investments and bears the risk — and it is the DC account, not DB benefits, that is readily portable."
    },
    {
      id: "portfolio-q15",
      section: "Overview",
      q: "The primary advantage of robo-advisors over traditional advisory services is most likely:",
      choices: ["superior performance in falling markets", "lower cost, making advice accessible to investors with smaller portfolios", "fully customized handling of complex estate and tax situations"],
      answer: 1,
      expl: "Robo-advisors automate questionnaires, allocation, and rebalancing (typically with low-cost ETFs), so fees and minimums are low — extending advice to smaller investors. There is no evidence of superior downside performance, and complex personal situations are precisely where the limited human interaction of robo-advice is weakest."
    },
    {
      id: "portfolio-q16",
      section: "Planning & Construction",
      q: "A 35-year-old surgeon with high stable income and no near-term spending needs says she cannot tolerate any year with a negative return. Her risk tolerance is best described as:",
      choices: ["high ability and low willingness; the adviser should initially adopt the lower of the two", "low ability and high willingness; the adviser should follow her ability", "high ability and low willingness; the adviser should invest according to her ability and disregard stated preferences"],
      answer: 0,
      expl: "Long horizon, secure income, and no liquidity needs give high ability; her stated intolerance of losses is low willingness. When the two conflict, the adviser should go with the lower (here, willingness) while educating the client — never simply override stated preferences, and never invest above ability."
    },
    {
      id: "portfolio-q17",
      section: "Planning & Construction",
      q: "A client must withdraw $150,000 from the portfolio in eight months for a house down payment. In the IPS, this is best classified as a:",
      choices: ["liquidity constraint", "unique circumstance", "return objective"],
      answer: 0,
      expl: "Known upcoming cash withdrawals are liquidity constraints and call for holding cash or short-term instruments. Unique circumstances cover client-specific preferences such as ESG screens or holdings the client refuses to sell; the withdrawal is a cash need, not a target rate of return."
    },
    {
      id: "portfolio-q18",
      section: "Planning & Construction",
      q: "For strategic asset allocation purposes, a well-specified asset class should contain assets that are:",
      choices: ["highly correlated with assets in other classes", "relatively homogeneous, with low correlations with other asset classes", "as heterogeneous as possible to maximize diversification within the class"],
      answer: 1,
      expl: "Assets within a class should behave similarly (relatively high correlation within the class), while the class as a whole should have low correlation with other classes — that is what makes allocating across classes deliver diversification. High cross-class correlation would make separate classes pointless."
    },
    {
      id: "portfolio-q19",
      section: "Planning & Construction",
      q: "A stock rally pushes a portfolio's equity weight from its 60% target to 68%, outside the ±5% policy corridor. According to the IPS rebalancing policy, the manager should most likely:",
      choices: ["sell equities and buy other asset classes to return toward the 60% target", "wait until the next scheduled IPS review before acting", "raise the strategic target to 68% to reflect the market's momentum"],
      answer: 0,
      expl: "Corridor-based rebalancing requires trading back toward target once a band is breached — here selling the appreciated equities. Waiting for an IPS review confuses rebalancing with policy revision, and chasing the drifted weight abandons the discipline that rebalancing exists to enforce."
    },
    {
      id: "portfolio-q20",
      section: "Behavioral Biases",
      q: "An investor refuses to sell a stock for less than the $80 she paid, even though her own analysis now values it at $55. She is most likely exhibiting:",
      choices: ["anchoring bias", "availability bias", "self-control bias"],
      answer: 0,
      expl: "She is anchored on the irrelevant purchase price and fails to adjust to new information — a cognitive information-processing error. Availability would be judging likelihood by easily recalled events; self-control is favoring short-term consumption over long-term goals."
    },
    {
      id: "portfolio-q21",
      section: "Behavioral Biases",
      q: "A client keeps an emergency account earning 1% \"for safety\" while carrying credit-card debt at 20%, and trades speculative stocks with his bonus because it is \"house money.\" This behavior best illustrates:",
      choices: ["framing bias", "mental accounting bias", "endowment bias"],
      answer: 1,
      expl: "He treats money differently depending on the arbitrary bucket it sits in rather than viewing wealth as one portfolio — mental accounting. Framing is responding differently to how a question is worded; endowment is overvaluing an asset merely because it is owned."
    },
    {
      id: "portfolio-q22",
      section: "Behavioral Biases",
      q: "Which bias is classified as emotional rather than cognitive in the CFA curriculum?",
      choices: ["hindsight bias", "loss aversion", "conservatism bias"],
      answer: 1,
      expl: "Loss aversion — the pain of losses outweighing the pleasure of equal gains, producing the disposition effect — is an emotional bias, so it is typically moderated and partly accommodated. Hindsight and conservatism are cognitive (belief perseverance) errors, best addressed with education and disciplined process."
    },
    {
      id: "portfolio-q23",
      section: "Behavioral Biases",
      q: "An investor holds losing positions far too long hoping to break even, but quickly sells stocks that show small gains. This pattern is best described as the:",
      choices: ["disposition effect, driven by loss aversion", "status quo bias, driven by inertia", "illusion of control, driven by overconfidence"],
      answer: 0,
      expl: "Selling winners too early and riding losers too long is the disposition effect, the classic footprint of loss aversion: realizing a loss is emotionally painful, so it is deferred. Status quo bias is generalized inaction (it would not explain the quick selling of winners), and illusion of control concerns believing one can influence outcomes."
    },
    {
      id: "portfolio-q24",
      section: "Risk Management",
      q: "A portfolio has a one-day 5% VaR of $2 million. The most accurate interpretation is that:",
      choices: ["the maximum one-day loss is $2 million", "there is a 5% probability of losing at least $2 million in one day", "the expected daily loss is $2 million, 5% of the time the portfolio loses money"],
      answer: 1,
      expl: "VaR is a minimum loss at a stated probability: 5% of days the loss is expected to be $2 million or more. It is neither a maximum loss (VaR says nothing about how bad the tail beyond it can be) nor an expected loss — the expected loss beyond VaR is conditional VaR."
    },
    {
      id: "portfolio-q25",
      section: "Risk Management",
      q: "A company enters an interest-rate swap to convert its floating-rate debt exposure to fixed. Within the risk management framework, this action is best described as risk:",
      choices: ["transfer", "shifting", "avoidance"],
      answer: 1,
      expl: "Using derivatives (forwards, futures, swaps, options) to change the distribution of outcomes is risk shifting, the standard treatment for financial risks. Risk transfer refers to insurance-type contracts that pass risk to an insurer for a premium; avoidance means not taking the exposure at all."
    },
    {
      id: "portfolio-q26",
      section: "Risk Management",
      q: "Within an organization's risk governance, deciding which risks are acceptable and how much total loss the organization can bear is the definition of setting:",
      choices: ["the risk budget", "risk tolerance", "the risk infrastructure"],
      answer: 1,
      expl: "Risk tolerance — set top-down by the board before a crisis — defines which risks are acceptable and the organization's capacity for loss. The risk budget then allocates that permitted risk across activities, and risk infrastructure is the people and systems used to measure and monitor risk."
    }
  ],
  flashcards: [
    { id: "portfolio-f1", front: "Utility function for portfolio selection", back: "U = E(R) − ½Aσ². A = risk-aversion coefficient (bigger A = more risk averse; A = 0 risk neutral, A < 0 risk seeking). Inputs in decimals." },
    { id: "portfolio-f2", front: "Two-asset portfolio variance formula", back: "σp² = w1²σ1² + w2²σ2² + 2w1w2ρσ1σ2. Portfolio σ = weighted average of σs ONLY when ρ = +1; less for any ρ < 1." },
    { id: "portfolio-f3", front: "Correlation needed for a possible zero-risk two-asset portfolio", back: "ρ = −1 (perfect negative correlation). Diversification benefit exists whenever ρ < +1; negative correlation is not required for a benefit." },
    { id: "portfolio-f4", front: "Efficient frontier vs. minimum-variance frontier", back: "Minimum-variance frontier: lowest σ for each return. Efficient frontier: only the portion at and above the global minimum-variance portfolio — highest return for each σ." },
    { id: "portfolio-f5", front: "Capital allocation line (CAL) — definition and slope", back: "Combinations of the risk-free asset and a risky portfolio. Slope = (E(Rp) − Rf)/σp = the Sharpe ratio. Best CAL is tangent to the efficient frontier at the optimal risky portfolio." },
    { id: "portfolio-f6", front: "Two tangencies in portfolio selection", back: "(1) CAL tangent to efficient frontier → optimal risky portfolio (same for all with same expectations). (2) Investor's indifference curve tangent to CAL → that investor's optimal overall portfolio." },
    { id: "portfolio-f7", front: "Capital market line (CML) equation", back: "E(Rp) = Rf + σp × (E(Rm) − Rf)/σm. The CAL with the market portfolio as the risky asset. Left of M = lending portfolio; right of M = borrowing (leveraged) portfolio." },
    { id: "portfolio-f8", front: "Systematic vs. unsystematic risk", back: "Systematic (market) risk: economy-wide, non-diversifiable, rewarded with a risk premium. Unsystematic (firm-specific): diversifiable with roughly 12–30 stocks, NOT rewarded." },
    { id: "portfolio-f9", front: "Beta — two formulas", back: "β = Cov(Ri, Rm)/σm² = ρi,m × σi/σm. Market beta = 1. Slope of the security characteristic line (regression of asset excess returns on market excess returns)." },
    { id: "portfolio-f10", front: "CAPM equation", back: "E(Ri) = Rf + βi[E(Rm) − Rf]. Watch whether you are given E(Rm) or the market risk premium E(Rm) − Rf." },
    { id: "portfolio-f11", front: "SML vs. CML", back: "SML: x-axis β, prices ALL assets, slope = market risk premium. CML: x-axis total σ, contains only efficient Rf-plus-market portfolios, slope = market Sharpe ratio. Fairly priced single stocks plot on SML but below CML." },
    { id: "portfolio-f12", front: "Stock plots above the SML — valuation conclusion?", back: "Forecast return > CAPM required return → positive alpha → undervalued (buy). Below the SML → overvalued; on the line → fairly valued." },
    { id: "portfolio-f13", front: "Sharpe ratio vs. Treynor measure", back: "Sharpe = (Rp − Rf)/σp (total risk — use when the portfolio is the entire wealth). Treynor = (Rp − Rf)/βp (systematic risk — use when the portfolio is part of a diversified whole)." },
    { id: "portfolio-f14", front: "M-squared (M²) and Jensen's alpha", back: "M² = (Rp − Rf)(σm/σp) + Rf: portfolio levered to market risk, in % — same ranking as Sharpe. Jensen's α = Rp − [Rf + βp(Rm − Rf)]: excess over CAPM — same risk basis as Treynor." },
    { id: "portfolio-f15", front: "Three steps of the portfolio management process", back: "1) Planning: understand client, write IPS with benchmark. 2) Execution: asset allocation, security analysis, portfolio construction. 3) Feedback: monitor/rebalance, measure and report performance." },
    { id: "portfolio-f16", front: "DB vs. DC pension plans", back: "DB: employer promises the retirement benefit and bears investment risk. DC: employer only promises contributions; employee directs investments, bears risk; account is portable." },
    { id: "portfolio-f17", front: "Major components of an IPS", back: "Introduction; purpose; duties; procedures; investment objectives (risk and return); constraints (liquidity, time horizon, tax, legal/regulatory, unique); guidelines; evaluation/benchmark; appendices (SAA, rebalancing policy)." },
    { id: "portfolio-f18", front: "Ability vs. willingness to take risk", back: "Ability: objective — horizon, wealth vs. needs, income security, liquidity needs. Willingness: subjective attitudes. When they conflict, use the LOWER of the two and educate the client; never exceed ability." },
    { id: "portfolio-f19", front: "The five IPS constraint categories", back: "Liquidity (cash needs), Time horizon, Tax concerns, Legal/regulatory, Unique circumstances (ESG screens, concentrated holdings, special needs)." },
    { id: "portfolio-f20", front: "Strategic vs. tactical asset allocation", back: "SAA: long-run target class weights matching IPS objectives; explains most of a diversified portfolio's return variability. TAA: deliberate short-term deviations from SAA to exploit perceived opportunities." },
    { id: "portfolio-f21", front: "Cognitive errors vs. emotional biases", back: "Cognitive: faulty reasoning/processing — easier to correct with education and process (belief perseverance + information-processing errors). Emotional: from feelings/impulse — harder to correct; often accommodated. Note: overconfidence is classified as emotional." },
    { id: "portfolio-f22", front: "Name the 5 belief perseverance and 4 information-processing biases", back: "Belief perseverance: conservatism, confirmation, representativeness, illusion of control, hindsight. Processing: anchoring & adjustment, mental accounting, framing, availability." },
    { id: "portfolio-f23", front: "Loss aversion and the disposition effect", back: "Losses hurt about twice as much as equal gains please → investors sell winners too early and hold losers too long (disposition effect). Emotional bias; feeds momentum and bubble dynamics." },
    { id: "portfolio-f24", front: "Value at risk (VaR) — correct interpretation", back: "The minimum loss expected over a period with a given probability. \"One-day 5% VaR of $1m\" = 5% chance of losing AT LEAST $1m in a day. Not a maximum loss, not an expected loss; complement with conditional VaR, scenarios, stress tests." },
    { id: "portfolio-f25", front: "Four methods of modifying risk", back: "Prevention/avoidance (don't take the exposure); acceptance (bear it — self-insure, diversify); transfer (insurance, for a premium); shifting (change the outcome distribution with derivatives)." },
    { id: "portfolio-f26", front: "Financial vs. non-financial risks", back: "Financial: market risk (prices/rates), credit/default risk, liquidity risk (price concession to sell). Non-financial: operational, legal, compliance/regulatory, solvency, model, settlement; individuals also face mortality and longevity risk." },
    { id: "portfolio-f27", front: "Risk governance vs. risk budgeting", back: "Governance: board-level, top-down — sets risk tolerance (which risks, how much loss is bearable), enterprise-wide view. Risk budgeting: allocates the permitted total risk across assets, factors, or desks (e.g., VaR limits)." }
  ]
};
