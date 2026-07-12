window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["derivatives"] = {
  name: "Derivatives",
  weight: "5–8%",
  sections: [
    "Derivative Instrument and Market Features",
    "Forward Commitments vs Contingent Claims",
    "Benefits, Risks, and Uses of Derivatives",
    "Arbitrage, Replication, and Cost of Carry",
    "Pricing and Valuation of Forwards and Futures",
    "Interest Rate and Other Swaps",
    "Pricing and Valuation of Options",
    "Option Replication Using Put–Call Parity",
    "One-Period Binomial Valuation"
  ],
  questions: [
    {
      id: "derivatives-q1",
      section: "Market features",
      q: "Compared with over-the-counter derivatives, exchange-traded derivatives are <em>most likely</em> characterized by:",
      choices: [
        "customized contract terms and direct counterparty credit exposure",
        "standardized contract terms and a central counterparty guarantee",
        "lower transparency but mandatory trade reporting"
      ],
      answer: 1,
      expl: "Exchange-traded derivatives are standardized by the exchange and guaranteed through a central counterparty (CCP), which nearly eliminates counterparty credit risk. Customization and direct counterparty exposure describe OTC contracts, and it is OTC markets — not exchanges — that are less transparent yet now subject to post-crisis reporting rules."
    },
    {
      id: "derivatives-q2",
      section: "Market features",
      q: "The notional amount of a derivative contract <em>most accurately</em> represents:",
      choices: [
        "the quantity of the underlying covered by the contract, used to scale payments",
        "the maximum amount either party can lose on the contract",
        "the cash each party must deposit at initiation"
      ],
      answer: 0,
      expl: "Notional is the size of the underlying exposure on which payments are calculated; for a single-currency interest rate swap it is never even exchanged. It overstates the money actually at risk, so it is not a maximum loss, and the deposit required at initiation is margin, not notional."
    },
    {
      id: "derivatives-q3",
      section: "Forwards & futures mechanics",
      q: "A trader is long one futures contract on 1,000 barrels of oil at $75.00. Initial margin is $4,000 and maintenance margin is $3,000. The settlement price falls to $73.80 the next day. The variation margin the trader must deposit is <em>closest</em> to:",
      choices: ["$200", "$1,200", "$3,000"],
      answer: 1,
      expl: "The loss is (75.00 − 73.80) × 1,000 = $1,200, leaving a balance of $2,800, which is below the $3,000 maintenance level and triggers a margin call. Futures margin calls require restoring the balance to the INITIAL margin: 4,000 − 2,800 = $1,200. Depositing only $200 (back to maintenance) is the securities-account rule, a classic trap."
    },
    {
      id: "derivatives-q4",
      section: "Options basics",
      q: "A put option has an exercise price of $30 while the underlying trades at $27. The option is <em>best</em> described as:",
      choices: ["in the money", "out of the money", "at the money"],
      answer: 0,
      expl: "A put is in the money when S < X because the holder can sell at 30 something worth 27, giving intrinsic value of $3. Candidates who apply the call rule (S > X for ITM) pick out of the money — the directions reverse for puts. Moneyness ignores the premium paid."
    },
    {
      id: "derivatives-q5",
      section: "Forward commitments vs contingent claims",
      q: "Which of the following is <em>most accurately</em> classified as a contingent claim?",
      choices: ["An interest rate swap", "A futures contract on gold", "A put option on a stock index"],
      answer: 2,
      expl: "Options are contingent claims: the payoff occurs only if exercise is worthwhile, and the holder has a right, not an obligation. Swaps, forwards, and futures are forward commitments — both parties are obligated to perform, and payoffs are symmetric and linear."
    },
    {
      id: "derivatives-q6",
      section: "Benefits, risks, uses",
      q: "An airline hedges expected jet fuel purchases using crude oil futures. The risk that jet fuel and crude oil prices do not move together is <em>best</em> described as:",
      choices: ["basis risk", "counterparty credit risk", "systemic risk"],
      answer: 0,
      expl: "Basis risk arises when the hedge instrument's underlying (or its maturity) differs from the exposure being hedged, so the two prices can diverge. Counterparty risk concerns default by the other party — minimal for exchange-traded futures — and systemic risk concerns contagion across the financial system."
    },
    {
      id: "derivatives-q7",
      section: "Benefits, risks, uses",
      q: "Which statement about the benefits of derivatives is <em>least likely</em> accurate?",
      choices: [
        "Option prices reveal the market's expectation of the underlying's future volatility",
        "Derivatives typically allow short positions to be established more easily than cash markets",
        "Derivatives eliminate risk from the financial system by offsetting exposures"
      ],
      answer: 2,
      expl: "Derivatives transfer and reallocate risk to parties more willing to bear it; they cannot eliminate risk from the system — derivatives are zero-sum between counterparties. Implied volatility (information discovery) and easier shorting (an operational advantage) are genuine, frequently cited benefits."
    },
    {
      id: "derivatives-q8",
      section: "Cost of carry",
      q: "A non-dividend-paying stock trades at $100 and the risk-free rate is 5% per year. The no-arbitrage price of a two-year forward contract on the stock is <em>closest</em> to:",
      choices: ["$110.00", "$110.25", "$90.70"],
      answer: 1,
      expl: "F₀ = S₀(1 + r)ᵀ = 100 × (1.05)² = $110.25. Using simple rather than compound interest gives $110.00, and $90.70 comes from discounting instead of compounding — the forward price must exceed spot for an asset with no carry benefits."
    },
    {
      id: "derivatives-q9",
      section: "Cost of carry",
      q: "A stock trades at $60, will pay a $1.50 dividend at the end of one year (just before delivery), and the risk-free rate is 3%. The one-year forward price is <em>closest</em> to:",
      choices: ["$61.80", "$60.30", "$63.30"],
      answer: 1,
      expl: "F₀ = S₀(1 + r)ᵀ − FV(dividend) = 60 × 1.03 − 1.50 = 61.80 − 1.50 = $60.30. Dividends are a benefit of carrying the stock, so they reduce the forward price. $61.80 ignores the dividend; $63.30 adds it — the wrong sign."
    },
    {
      id: "derivatives-q10",
      section: "Forward valuation",
      q: "An investor is long a forward contract with a delivery price of $100. Three months before expiration the underlying (no income) trades at $104 and the risk-free rate is 4%. The value of the contract to the long is <em>closest</em> to:",
      choices: ["$2.99", "$4.00", "$4.98"],
      answer: 2,
      expl: "Vₜ = Sₜ − F₀/(1 + r)^(T−t) = 104 − 100/(1.04)^0.25 = 104 − 99.02 = $4.98. Taking 104 − 100 = $4.00 ignores the discounting of the delivery price; discounting the spot instead of the forward price gives $2.99. Discount F₀ over the time REMAINING."
    },
    {
      id: "derivatives-q11",
      section: "Forward valuation",
      q: "At the initiation of a forward contract priced at its no-arbitrage level, the value of the contract to the long is <em>most likely</em>:",
      choices: ["zero", "positive, because the long benefits from leverage", "equal to the present value of the forward price"],
      answer: 0,
      expl: "The forward price is set precisely so that the contract has zero value to both parties at initiation — no money changes hands. Value only becomes positive or negative afterward as the spot price moves. The forward PRICE is fixed for the contract's life; the VALUE fluctuates."
    },
    {
      id: "derivatives-q12",
      section: "Swaps",
      q: "After an interest rate swap is initiated, market swap rates rise. The value of the swap <em>most likely</em>:",
      choices: [
        "increases for the fixed-rate payer",
        "increases for the fixed-rate receiver",
        "remains zero because the swap rate is fixed"
      ],
      answer: 0,
      expl: "The pay-fixed party is locked into paying a now below-market fixed rate while receiving floating, so its position gains value when rates rise. The receive-fixed side is like owning a fixed-rate bond, which loses value as rates rise. Only at initiation is the swap's value zero."
    },
    {
      id: "derivatives-q13",
      section: "Swaps",
      q: "Discount factors from the current spot curve are 0.97 (year 1) and 0.93 (year 2). The fixed rate on a two-year annual-settlement interest rate swap is <em>closest</em> to:",
      choices: ["3.50%", "3.68%", "7.00%"],
      answer: 1,
      expl: "Swap rate = (1 − D_N)/(ΣD) = (1 − 0.93)/(0.97 + 0.93) = 0.07/1.90 = 3.68%. This is the par rate that gives the swap zero initial value. Forgetting to divide by the sum of discount factors leaves 7.00%; 3.50% is a simple average unrelated to the formula."
    },
    {
      id: "derivatives-q14",
      section: "Option valuation factors",
      q: "All else equal, an increase in the risk-free interest rate <em>most likely</em> causes the value of a European call and a European put, respectively, to:",
      choices: [
        "increase; decrease",
        "decrease; increase",
        "increase; increase"
      ],
      answer: 0,
      expl: "A call defers paying the exercise price, and a higher rate lowers the present value of that payment — good for the call. A put defers receiving X, so a higher rate hurts it. \"Increase; increase\" describes volatility, the only factor that raises both option types."
    },
    {
      id: "derivatives-q15",
      section: "Option bounds",
      q: "A stock trades at $50 and the risk-free rate is 4%. The minimum value of a one-year European call with an exercise price of $45 is <em>closest</em> to:",
      choices: ["$3.20", "$5.00", "$6.73"],
      answer: 2,
      expl: "Lower bound = max(0, S₀ − X/(1 + r)ᵀ) = 50 − 45/1.04 = 50 − 43.27 = $6.73. The bound uses the DISCOUNTED strike, so it exceeds simple intrinsic value of 50 − 45 = $5.00. Compounding the strike instead of discounting it produces $3.20."
    },
    {
      id: "derivatives-q16",
      section: "Put–call parity",
      q: "A non-dividend stock trades at $52. A one-year European call with X = $50 trades at $5.00 and the risk-free rate is 5%. Using put–call parity, the price of the one-year European put with X = $50 is <em>closest</em> to:",
      choices: ["$0.62", "$2.38", "$3.00"],
      answer: 0,
      expl: "p₀ = c₀ − S₀ + X/(1 + r)ᵀ = 5.00 − 52 + 50/1.05 = 5.00 − 52 + 47.62 = $0.62. Using the undiscounted strike gives $3.00, the classic parity error; $2.38 is merely the discount on the strike (50 − 47.62), not the put value."
    },
    {
      id: "derivatives-q17",
      section: "Put–call parity",
      q: "Using European options with the same exercise price and expiration, a synthetic long position in the underlying stock is <em>best</em> created by:",
      choices: [
        "buying the call, selling the put, and lending the present value of the exercise price",
        "buying the call, buying the put, and borrowing the present value of the exercise price",
        "selling the call, buying the put, and lending the present value of the exercise price"
      ],
      answer: 0,
      expl: "Rearranging parity: S₀ = c₀ − p₀ + X/(1 + r)ᵀ, so long call + short put + lend PV(X) replicates the stock. Buying both options creates a straddle-like position, not stock, and selling the call while buying the put is a synthetic SHORT exposure combined with lending."
    },
    {
      id: "derivatives-q18",
      section: "Binomial valuation",
      q: "A stock trades at $30 and in one year will be either $36 (u = 1.2) or $27 (d = 0.9). The risk-free rate is 6%. The value of a one-year European call with X = $30 is <em>closest</em> to:",
      choices: ["$2.83", "$3.02", "$3.20"],
      answer: 1,
      expl: "π = (1 + 0.06 − 0.9)/(1.2 − 0.9) = 0.16/0.30 = 0.5333. Payoffs: cᵤ = 6, c_d = 0. c₀ = (0.5333 × 6 + 0.4667 × 0)/1.06 = 3.20/1.06 = $3.02. Forgetting to discount gives $3.20; using a real-world probability of 0.5 instead of π gives $2.83."
    },
    {
      id: "derivatives-q19",
      section: "Binomial valuation",
      q: "In a one-period binomial model, a call's payoffs are $6 in the up state and $0 in the down state, while the stock's terminal values are $36 and $27. The hedge ratio (units of stock per call to form a riskless portfolio) is <em>closest</em> to:",
      choices: ["0.50", "0.67", "0.75"],
      answer: 1,
      expl: "h = (cᵤ − c_d)/(Sᵤ − S_d) = (6 − 0)/(36 − 27) = 6/9 = 0.67. This is the option's delta: holding 0.67 shares against each written call gives the same portfolio value in both states. The other figures do not equate the two terminal portfolio values."
    }
  ],
  flashcards: [
    { id: "derivatives-f1", front: "Definition: derivative", back: "A contract between two parties whose value derives from an underlying asset or variable; created at initiation, expires at maturity, and is zero-sum between the long and the short." },
    { id: "derivatives-f2", front: "Forward commitment vs contingent claim", back: "Forward commitment (forward, futures, swap): both parties OBLIGATED, linear payoff, zero value at start. Contingent claim (option): holder has a right, not an obligation; one-sided payoff; premium paid at start." },
    { id: "derivatives-f3", front: "Futures margin call — how much must be deposited?", back: "Enough variation margin to restore the account to the INITIAL margin level (not just to maintenance). Triggered when daily mark-to-market losses push the balance below maintenance margin." },
    { id: "derivatives-f4", front: "Central counterparty (CCP) and novation", back: "Through novation the CCP becomes buyer to every seller and seller to every buyer, so each trader faces the CCP. Nearly eliminates counterparty credit risk but concentrates risk in the CCP." },
    { id: "derivatives-f5", front: "Moneyness rules", back: "Call: ITM if S > X, OTM if S < X. Put: ITM if S < X, OTM if S > X. ATM when S = X. Moneyness ignores the premium." },
    { id: "derivatives-f6", front: "Intrinsic value vs time value", back: "Option price = intrinsic + time value. Call intrinsic = max(0, S − X); put intrinsic = max(0, X − S). Time value ≥ 0, largest at the money, decays to zero at expiration." },
    { id: "derivatives-f7", front: "Option profit diagrams — breakevens", back: "Long call breakeven: X + premium; max loss = premium, gain unlimited. Long put breakeven: X − premium; max gain = X − premium. Short positions are mirror images; short call loss is unlimited." },
    { id: "derivatives-f8", front: "Basis risk", back: "Risk that the hedge instrument's price and the hedged exposure's price do not move together — because the underlying or the maturity of the hedge differs from the exposure (e.g., jet fuel hedged with crude futures)." },
    { id: "derivatives-f9", front: "Hedge accounting: three designations", back: "Cash flow hedge (variability of future cash flows, e.g., float-to-fixed swap); fair value hedge (value of an existing asset/liability); net investment hedge (currency risk of a foreign subsidiary)." },
    { id: "derivatives-f10", front: "Forward price — cost of carry formula", back: "F₀ = [S₀ − PV(income) + PV(costs)] × (1 + r)ᵀ. Carry benefits (dividends, coupons, convenience yield) LOWER F₀; carry costs (interest, storage) RAISE F₀." },
    { id: "derivatives-f11", front: "Why derivatives are priced with the risk-free rate", back: "A position hedged with its derivative is riskless (long asset + short forward), so by no-arbitrage it must earn the risk-free rate. Investor risk preferences and expected returns never enter the pricing." },
    { id: "derivatives-f12", front: "Value of a forward during its life (long)", back: "Vₜ = Sₜ − F₀/(1 + r)^(T−t), adjusted by PV of any REMAINING income (subtract) or cost (add). Value is 0 at initiation and Sₜ − F₀ at expiration. Short's value = −long's." },
    { id: "derivatives-f13", front: "Futures vs forward prices when rates are correlated with the underlying", back: "Positive correlation between futures prices and interest rates → daily settlement favors the long → futures price > forward price. Negative correlation → futures price < forward price. Zero/constant rates → equal." },
    { id: "derivatives-f14", front: "FRA: who gains when rates rise?", back: "The LONG (fixed-rate payer position) gains when the market reference rate sets above the FRA rate. Settlement occurs at the start of the loan period, so the payoff is discounted. A 3×9 FRA covers months 3 to 9." },
    { id: "derivatives-f15", front: "Swap rate formula from discount factors", back: "s = (1 − D_N) ÷ (D₁ + D₂ + … + D_N) per period. It is the par rate: the fixed rate making the swap's value zero at initiation; economically a weighted average of forward rates." },
    { id: "derivatives-f16", front: "A swap is equivalent to…", back: "A series of forward contracts (FRAs), one per settlement date, all written at the same off-market fixed rate — some start with positive value, some negative, netting to zero. Also: receive-fixed swap ≈ long fixed-rate bond + short floating-rate note." },
    { id: "derivatives-f17", front: "Option value factor directions (increase in each input)", back: "S↑: call↑ put↓. X↑: call↓ put↑. r↑: call↑ put↓. Volatility↑: BOTH↑. Income (dividends)↑: call↓ put↑. Time↑: call↑, put usually↑ (exception: deep ITM European put can fall)." },
    { id: "derivatives-f18", front: "European call lower bound", back: "c₀ ≥ max(0, S₀ − X/(1 + r)ᵀ) — the DISCOUNTED strike, so the bound exceeds intrinsic value S − X. Upper bound: c₀ ≤ S₀." },
    { id: "derivatives-f19", front: "Put–call parity", back: "S₀ + p₀ = c₀ + X/(1 + r)ᵀ (European, same X and T). Protective put = fiduciary call. Synthetic stock: +c − p + lend PV(X). Long call + short put = synthetic long forward at X." },
    { id: "derivatives-f20", front: "Put–call–forward parity", back: "F₀/(1 + r)ᵀ + p₀ = c₀ + X/(1 + r)ᵀ, i.e., c₀ − p₀ = (F₀ − X)/(1 + r)ᵀ. If X = F₀, the call and put have equal prices." },
    { id: "derivatives-f21", front: "One-period binomial: risk-neutral probability and value", back: "π = (1 + r − d)/(u − d); option value = [π × up-payoff + (1 − π) × down-payoff]/(1 + r). The REAL probability of an up move is irrelevant. Hedge ratio h = (cᵤ − c_d)/(Sᵤ − S_d)." },
    { id: "derivatives-f22", front: "American vs European options — early exercise", back: "American ≥ European always. Never exercise an American call on a non-dividend stock early (its value = European's). Early exercise can pay for calls just before large dividends and for deep ITM puts (receive X sooner)." }
  ]
};
