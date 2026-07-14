window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["fixed-income"] = {
  name: "Fixed Income",
  weight: "11–14%",
  sections: [
    "Fixed-Income Instrument Features",
    "Cash Flows and Types of Issuers",
    "Issuance, Trading, and Funding Markets",
    "Bond Valuation: Prices and Yields",
    "Yield and Yield Spread Measures",
    "The Term Structure of Interest Rates",
    "Interest Rate Risk and Return",
    "Duration and Convexity",
    "Credit Risk Fundamentals",
    "Credit Analysis of Governments and Corporates",
    "Securitization and ABS",
    "Mortgage-Backed Securities"
  ],
  questions: [
    {
      id: "fixed-income-q1",
      section: "Instrument Features",
      q: "A bond indenture includes a clause prohibiting the issuer from pledging assets as collateral to new lenders if doing so would subordinate existing bondholders. This clause is best described as:",
      choices: ["an affirmative covenant", "a negative covenant", "a cross-default provision"],
      answer: 1,
      expl: "A negative pledge restricts what the issuer may do, so it is a negative (restrictive) covenant. Affirmative covenants are \"must do\" promises such as paying interest on time; a cross-default provision (an affirmative-covenant feature) triggers default on this bond if the issuer defaults on other debt."
    },
    {
      id: "fixed-income-q2",
      section: "Instrument Features",
      q: "Relative to an otherwise identical bullet bond, a bond with a sinking fund provision most likely has:",
      choices: ["lower credit risk and higher reinvestment risk for the investor", "higher credit risk and lower reinvestment risk for the investor", "lower credit risk and lower reinvestment risk for the investor"],
      answer: 0,
      expl: "Retiring principal on a schedule reduces the amount at risk of default (lower credit risk), but investors may have bonds redeemed at par — often when rates have fallen — creating reinvestment risk. The trade-off runs in opposite directions, so choices claiming both risks fall are wrong."
    },
    {
      id: "fixed-income-q3",
      section: "Instrument Features",
      q: "A floating-rate note pays MRR + 100 bps with a 5% cap and a 2% floor. The party that benefits from the cap is most likely:",
      choices: ["the investor, who is protected against falling coupons", "the issuer, whose interest cost cannot exceed the cap", "neither party, because the cap and floor offset"],
      answer: 1,
      expl: "A cap limits how high the coupon can go, protecting the issuer from rising rates; the investor is worse off versus an uncapped FRN and requires compensation. The floor is the investor-friendly feature. The cap and floor protect different parties, so they do not \"offset.\""
    },
    {
      id: "fixed-income-q4",
      section: "Types of Issuers",
      q: "Compared with an otherwise identical option-free bond, a callable bond most likely offers a:",
      choices: ["higher yield and higher price", "higher yield and lower price", "lower yield and higher price"],
      answer: 1,
      expl: "The call is the issuer's option, exercised against investors when rates fall. Investors pay less for the callable bond (price of callable = straight minus call value), which means a higher yield. A putable bond is the reverse: higher price, lower yield."
    },
    {
      id: "fixed-income-q5",
      section: "Types of Issuers",
      q: "A convertible bond with $1,000 par has a conversion ratio of 20. The issuer's shares trade at $55. The bond's conversion value is closest to:",
      choices: ["$1,000", "$1,100", "$1,375"],
      answer: 1,
      expl: "Conversion value = conversion ratio × share price = 20 × $55 = $1,100. $1,000 is just par, and $1,375 would result from dividing par by a wrong figure — the conversion price here is $1,000 ⁄ 20 = $50, not an input to conversion value beyond determining the ratio."
    },
    {
      id: "fixed-income-q6",
      section: "Issuance, Trading, Funding",
      q: "A dealer enters a 30-day repurchase agreement, delivering $5,000,000 (market value) of government bonds subject to a 4% haircut, at a repo rate of 2.5% (360-day year). The interest the dealer pays is closest to:",
      choices: ["$10,000", "$10,417", "$12,500"],
      answer: 0,
      expl: "Cash borrowed = 5,000,000 × (1 − 0.04) = $4,800,000. Interest = 4,800,000 × 0.025 × 30⁄360 = $10,000. $10,417 ignores the haircut (5,000,000 × 0.025 × 30⁄360), and $12,500 also uses a 36-day error or wrong day count."
    },
    {
      id: "fixed-income-q7",
      section: "Issuance, Trading, Funding",
      q: "In a single-price (uniform price) Treasury auction, winning competitive bidders pay:",
      choices: ["the price each bidder individually bid", "the same price, set by the highest accepted yield", "the average of all accepted bid prices"],
      answer: 1,
      expl: "US Treasury auctions are single-price: every successful bidder — competitive or non-competitive — pays the price implied by the highest accepted (stop-out) yield. Paying one's own bid describes a multiple-price (discriminatory) auction."
    },
    {
      id: "fixed-income-q8",
      section: "Issuance, Trading, Funding",
      q: "A corporation that issues commercial paper most likely maintains a backup line of credit primarily to mitigate:",
      choices: ["rollover risk if it cannot issue new paper to repay maturing paper", "interest rate risk on the paper's coupon resets", "the credit risk of the investors who bought the paper"],
      answer: 0,
      expl: "CP is short term and routinely rolled over; if market access closes, the issuer must still repay maturing paper. Backup lines provide that liquidity. CP is typically a discount instrument with no coupon resets, and the buyers' credit risk is irrelevant to the issuer."
    },
    {
      id: "fixed-income-q9",
      section: "Bond Valuation",
      q: "A 4-year bond pays a 5% annual coupon on $1,000 par. If the market discount rate is 6%, the bond's price is closest to:",
      choices: ["$950.00", "$965.35", "$1,036.30"],
      answer: 1,
      expl: "N=4, I/Y=6, PMT=50, FV=1000 → CPT PV = −965.35 (PV coupons 50 × 3.4651 = 173.26 plus PV par 792.09). $1,036.30 results from discounting at 4% (swapping coupon and yield roles); coupon below yield must give a discount price."
    },
    {
      id: "fixed-income-q10",
      section: "Bond Valuation",
      q: "A bond pays a 6% coupon semiannually on $1,000 par and uses 30/360 day count. It is sold 60 days after the last coupon date at a flat price of $980. The full (invoice) price the buyer pays is closest to:",
      choices: ["$970.00", "$980.00", "$990.00"],
      answer: 2,
      expl: "Accrued interest = (60⁄180) × $30 = $10. Full price = flat + AI = 980 + 10 = $990. Subtracting AI ($970) reverses the relationship, and $980 is only the quoted (clean) price, not what changes hands."
    },
    {
      id: "fixed-income-q11",
      section: "Bond Valuation",
      q: "An analyst must value an infrequently traded 3-year corporate bond. Comparable bonds of the same rating yield 3.0% at 2 years and 4.5% at 5 years. Using matrix pricing, the estimated yield for the 3-year bond is closest to:",
      choices: ["3.50%", "3.75%", "4.00%"],
      answer: 0,
      expl: "Linear interpolation: 3.0% + [(3 − 2)⁄(5 − 2)] × (4.5% − 3.0%) = 3.0% + (1⁄3)(1.5%) = 3.50%. Using the midpoint of 3.75% ignores that 3 years is only one-third of the way from 2 to 5 years."
    },
    {
      id: "fixed-income-q12",
      section: "Bond Valuation",
      q: "Holding its yield to maturity constant as time passes, the price of a bond trading at a premium will most likely:",
      choices: ["rise toward par as maturity approaches", "fall toward par as maturity approaches", "stay constant until the final coupon date"],
      answer: 1,
      expl: "This is the pull to par (constant-yield price trajectory): premium bond prices decline toward par and discount bond prices rise toward par as maturity nears, even with no change in yield. Prices are not constant between coupon dates."
    },
    {
      id: "fixed-income-q13",
      section: "Yield and Spread Measures",
      q: "A bond's yield is 6.00% quoted on a semiannual bond basis (periodicity 2). Its effective annual yield is closest to:",
      choices: ["5.91%", "6.00%", "6.09%"],
      answer: 2,
      expl: "EAY = (1 + 0.06⁄2)² − 1 = 1.03² − 1 = 6.09%. Converting to a periodicity of 1 always raises the stated annual number when compounding is more frequent; 5.91% is the error of converting in the wrong direction."
    },
    {
      id: "fixed-income-q14",
      section: "Yield and Spread Measures",
      q: "A 180-day commercial paper issue is quoted at a 4.00% discount rate (360-day year). Its bond-equivalent yield (add-on, 365-day year) is closest to:",
      choices: ["4.00%", "4.06%", "4.14%"],
      answer: 2,
      expl: "Price = 100 × (1 − (180⁄360) × 0.04) = 98.00. Add-on yield = (365⁄180) × (100 − 98)⁄98 = 2.02778 × 0.020408 = 4.14%. It exceeds the 4.00% discount rate because the return is divided by the price paid (98), not face value, and annualized over 365 days."
    },
    {
      id: "fixed-income-q15",
      section: "Yield and Spread Measures",
      q: "An FRN was issued at par with a quoted margin of 80 bps over MRR. The issuer's credit quality has since deteriorated, and the market now requires a 120 bp margin. On the next reset date the FRN will most likely price:",
      choices: ["at par", "below par", "above par"],
      answer: 1,
      expl: "The discount (required) margin, 120 bps, exceeds the quoted margin of 80 bps: the note pays less than investors demand, so it trades at a discount. It would reset to par only if DM = QM, and above par if credit had improved (DM < QM)."
    },
    {
      id: "fixed-income-q16",
      section: "Yield and Spread Measures",
      q: "For a callable corporate bond, the option-adjusted spread (OAS) is most likely:",
      choices: ["greater than its Z-spread", "less than its Z-spread", "equal to its G-spread"],
      answer: 1,
      expl: "OAS = Z-spread − option cost. A call option has positive cost to the investor, so OAS < Z-spread for callables. (For a putable bond, OAS > Z-spread.) The G-spread is a yield-curve-based measure unrelated to removing option value."
    },
    {
      id: "fixed-income-q17",
      section: "Term Structure",
      q: "The 1-year spot rate is 3.00% and the 2-year spot rate is 4.00%. The implied 1-year forward rate one year from now (1y1y) is closest to:",
      choices: ["3.50%", "5.01%", "7.00%"],
      answer: 1,
      expl: "(1.04)² ⁄ 1.03 − 1 = 1.0816 ⁄ 1.03 − 1 = 5.01%. The quick approximation 2 × 4% − 3% = 5% confirms it. 3.50% is the average of the spots and 7.00% is their sum minus nothing meaningful — both classic distractors."
    },
    {
      id: "fixed-income-q18",
      section: "Term Structure",
      q: "Under the liquidity preference theory, an upward-sloping yield curve is most consistent with:",
      choices: ["a market expectation that short-term rates must rise", "expected future short-term rates plus a premium that increases with maturity", "markets for each maturity setting rates independently"],
      answer: 1,
      expl: "Liquidity preference says long rates embed a growing risk premium, so the curve can slope upward even if rates are expected to stay flat. Choice A is pure expectations theory; choice C is segmented markets theory."
    },
    {
      id: "fixed-income-q19",
      section: "Term Structure",
      q: "When the government spot curve is upward sloping, for a given maturity the ordering of rates is most likely:",
      choices: ["forward > spot > par", "par > spot > forward", "spot > forward > par"],
      answer: 0,
      expl: "With an upward slope, forwards sit above spots (they are the marginal rates pulling the average up), and par rates sit below spots (a par bond's early coupons are discounted at lower short-maturity spots). The ordering reverses for an inverted curve."
    },
    {
      id: "fixed-income-q20",
      section: "Interest Rate Risk and Return",
      q: "An investor buys a 10-year bond and plans to sell it in 3 years. The bond's Macaulay duration is 7.2. The investor's duration gap and dominant risk are most likely:",
      choices: ["gap of +4.2; higher market interest rates", "gap of −4.2; lower market interest rates", "gap of +4.2; lower market interest rates"],
      answer: 0,
      expl: "Duration gap = MacDur − horizon = 7.2 − 3 = +4.2. With a positive gap the horizon is shorter than the duration, so price risk dominates and the investor is hurt by rising rates. A negative gap (long horizon) would make falling rates the danger via reinvestment risk."
    },
    {
      id: "fixed-income-q21",
      section: "Interest Rate Risk and Return",
      q: "An investor buys a 5% annual coupon bond at par and holds it to maturity. Immediately after purchase, yields fall to 4% and remain there. The investor's realized annual return will most likely be:",
      choices: ["equal to 5%, because the bond was held to maturity", "below 5%, because coupons are reinvested at 4%", "above 5%, because the bond's price rose when yields fell"],
      answer: 1,
      expl: "Held to maturity there is no capital gain or loss versus par, but reinvestment income falls when coupons compound at 4% instead of 5%, dragging the realized return below the original YTM. The temporary price rise is irrelevant to a hold-to-maturity investor."
    },
    {
      id: "fixed-income-q22",
      section: "Duration and Convexity",
      q: "A bond is priced at 95.00. When its yield falls 50 bps the price rises to 97.50; when its yield rises 50 bps the price falls to 92.60. The bond's approximate modified duration is closest to:",
      choices: ["4.90", "5.16", "10.31"],
      answer: 1,
      expl: "ApproxModDur = (PV− − PV+) ⁄ (2 × PV0 × Δy) = (97.50 − 92.60) ⁄ (2 × 95 × 0.005) = 4.90 ⁄ 0.95 = 5.16. Forgetting the 2 in the denominator gives 10.31; 4.90 is just the price difference, not a duration."
    },
    {
      id: "fixed-income-q23",
      section: "Duration and Convexity",
      q: "A bond has modified duration 6.0 and annual convexity 45. For a 100 bp decrease in yield, the estimated percentage price change is closest to:",
      choices: ["+5.78%", "+6.00%", "+6.23%"],
      answer: 2,
      expl: "%ΔP = −(−6.0 × 0.01) + ½ × 45 × 0.01² = +6.00% + 0.225% = +6.23%. The convexity term is added for both up and down yield moves because (Δy)² is always positive; subtracting it (+5.78%) is the classic sign error, and +6.00% ignores convexity."
    },
    {
      id: "fixed-income-q24",
      section: "Duration and Convexity",
      q: "Holding maturity and yield constant, the bond with the highest Macaulay duration is most likely the one with the:",
      choices: ["highest coupon rate", "lowest coupon rate", "largest issue size"],
      answer: 1,
      expl: "Lower coupons push more of the bond's value into the final principal payment, lengthening the weighted-average time to receipt of cash. A zero-coupon bond is the limiting case, with duration equal to maturity. Issue size does not affect duration."
    },
    {
      id: "fixed-income-q25",
      section: "Duration and Convexity",
      q: "The most appropriate duration measure for a callable bond is:",
      choices: ["modified duration based on its yield to maturity", "effective duration based on shifts in the benchmark yield curve", "Macaulay duration based on its yield to worst"],
      answer: 1,
      expl: "A callable bond's cash flows change when rates change, so yield-based (Macaulay/modified) measures are unreliable. Effective duration reprices the bond off parallel shifts of the benchmark curve, capturing how the option alters cash flows."
    },
    {
      id: "fixed-income-q26",
      section: "Duration and Convexity",
      q: "For high-yield corporate bonds during a flight to quality, empirical duration is most likely to be:",
      choices: ["lower than analytical duration, because falling benchmark yields coincide with widening credit spreads", "higher than analytical duration, because credit spreads amplify rate moves", "equal to analytical duration, because both measure the same bond"],
      answer: 0,
      expl: "In stress periods government yields fall while high-yield spreads widen, so HY prices move less (or opposite) to what benchmark-yield duration predicts. Regressing actual returns on benchmark yield changes therefore produces a lower empirical duration than the analytical figure."
    },
    {
      id: "fixed-income-q27",
      section: "Credit Risk Fundamentals",
      q: "A $2,000,000 bond position has a one-year probability of default of 3% and an expected recovery rate of 30%. The one-year expected loss is closest to:",
      choices: ["$18,000", "$42,000", "$60,000"],
      answer: 1,
      expl: "Loss given default = 2,000,000 × (1 − 0.30) = $1,400,000; expected loss = 0.03 × 1,400,000 = $42,000. Using the recovery rate in place of LGD gives $18,000 (0.03 × 0.30 × 2m); $60,000 ignores recovery entirely."
    },
    {
      id: "fixed-income-q28",
      section: "Credit Risk Fundamentals",
      q: "The lowest credit rating that still qualifies as investment grade is:",
      choices: ["Ba1/BB+", "Baa3/BBB−", "A3/A−"],
      answer: 1,
      expl: "Investment grade runs down to Baa3 (Moody's) / BBB− (S&P and Fitch); one notch lower (Ba1/BB+) is high yield. The boundary matters because many mandates force sales when an issuer falls below it (a \"fallen angel\")."
    },
    {
      id: "fixed-income-q29",
      section: "Credit Analysis",
      q: "In assessing a sovereign's creditworthiness, the factor most likely classified as qualitative is:",
      choices: ["the ratio of government debt to GDP", "the strength and credibility of political institutions", "the level of foreign exchange reserves relative to external debt"],
      answer: 1,
      expl: "Institutional and governance strength (rule of law, policy credibility) is a qualitative judgment. Debt/GDP and reserve adequacy are measurable quantitative factors. Sovereign analysis also weighs willingness to pay, since creditors cannot seize a country's assets."
    },
    {
      id: "fixed-income-q30",
      section: "Credit Analysis",
      q: "A holding company and its operating subsidiary both have bonds outstanding with cross-default provisions. Compared with the subsidiary's bonds, the holding company's bonds most likely have:",
      choices: ["a higher probability of default and lower expected recovery", "the same probability of default but lower expected recovery", "the same probability of default and the same expected recovery"],
      answer: 1,
      expl: "Cross-default clauses mean both entities' bonds effectively default together, so PODs are essentially equal. But holding-company creditors are structurally subordinated — they are paid only from what remains after the subsidiary's own creditors — so expected recovery is lower, and the issue is typically notched down."
    },
    {
      id: "fixed-income-q31",
      section: "Securitization and ABS",
      q: "The special purpose entity in a securitization is structured to be bankruptcy remote primarily so that:",
      choices: ["the ABS investors are protected if the seller/originator becomes insolvent", "the originator can retain the securitized loans on its balance sheet", "the ABS automatically receives the originator's credit rating"],
      answer: 0,
      expl: "A true sale to a bankruptcy-remote SPE puts the assets beyond the reach of the originator's creditors, so ABS payments continue even if the originator fails. That separation is exactly why the ABS can be rated higher — not merely equal — to the originator, and the assets leave the originator's balance sheet."
    },
    {
      id: "fixed-income-q32",
      section: "Securitization and ABS",
      q: "An ABS is backed by a $100 million pool with a senior tranche of $86 million, a mezzanine tranche of $10 million, and a $4 million first-loss (equity) tranche. If pool credit losses total $6 million, the mezzanine tranche loses closest to:",
      choices: ["0% of its principal", "20% of its principal", "60% of its principal"],
      answer: 1,
      expl: "Losses are allocated bottom-up: the $4m equity tranche is wiped out first, leaving $2m to hit the mezzanine — 2⁄10 = 20% of its principal. The senior tranche is untouched until losses exceed $14m. 60% incorrectly charges the full $6m to the mezzanine."
    },
    {
      id: "fixed-income-q33",
      section: "Securitization and ABS",
      q: "Compared with an ABS backed by the same assets, a covered bond most likely offers investors:",
      choices: ["dual recourse to the issuing bank and to the cover pool", "higher yield due to greater prepayment risk", "a claim on assets that have been sold to a special purpose entity"],
      answer: 0,
      expl: "Covered bond assets remain on the bank's balance sheet in a segregated, actively replenished cover pool, and investors have recourse to both the bank and the pool — hence lower yields, not higher. The sale to an SPE is the defining feature of securitization, not covered bonds."
    },
    {
      id: "fixed-income-q34",
      section: "Mortgage-Backed Securities",
      q: "Mortgage rates decline sharply. The holder of an agency mortgage pass-through security is most exposed to:",
      choices: ["extension risk, as principal repayments slow", "contraction risk, as refinancing accelerates principal repayments", "default risk, as borrowers walk away from their loans"],
      answer: 1,
      expl: "Falling rates trigger refinancing: principal returns sooner than expected (contraction), must be reinvested at low rates, and the security's price appreciation is compressed (negative convexity). Extension risk arises when rates rise; agency guarantees make default risk minimal."
    },
    {
      id: "fixed-income-q35",
      section: "Mortgage-Backed Securities",
      q: "Within a CMO containing a planned amortization class (PAC) tranche and a support tranche, the support tranche most likely:",
      choices: ["absorbs prepayment variability, bearing both more contraction and more extension risk than the PAC", "receives principal on a fixed schedule regardless of prepayment speeds", "eliminates prepayment risk for the structure as a whole"],
      answer: 0,
      expl: "The support (companion) tranche takes excess principal when prepayments are fast and waits when they are slow, giving the PAC its schedule stability within the collar. In exchange the support earns a higher yield. No CMO structure eliminates prepayment risk — it only redistributes it."
    },
    {
      id: "fixed-income-q36",
      section: "Mortgage-Backed Securities",
      q: "The risk that a commercial mortgage borrower cannot refinance the large principal payment due at loan maturity is best described as:",
      choices: ["contraction risk", "balloon risk", "curtailment risk"],
      answer: 1,
      expl: "Most commercial mortgages are balloon loans; if refinancing is unavailable the loan extends or defaults — balloon risk, a form of extension risk in CMBS. Contraction risk is early repayment (rare in CMBS due to strong call protection such as lockouts and defeasance), and curtailment is a partial voluntary prepayment on residential loans."
    }
  ],
  flashcards: [
    { id: "fixed-income-f1", front: "Indenture (trust deed)", back: "The legal contract specifying a bond's features, the issuer's obligations, covenants, collateral, and credit enhancements; enforced by a trustee on behalf of bondholders." },
    { id: "fixed-income-f2", front: "Affirmative vs negative covenants", back: "Affirmative = must do (pay on time, cross-default, pari passu). Negative/restrictive = must not do (limits on debt, negative pledge, dividend restrictions) — these constrain the issuer and protect creditors." },
    { id: "fixed-income-f3", front: "Seniority ranking (highest to lowest)", back: "First lien/senior secured → senior unsecured → senior subordinated → subordinated → junior subordinated. Higher seniority → higher recovery in default → lower yield." },
    { id: "fixed-income-f4", front: "Bullet vs fully amortizing vs sinking fund", back: "Bullet: all principal at maturity. Fully amortizing: principal repaid gradually through level payments. Sinking fund: issuer must retire part of the issue on a schedule — cuts credit risk, adds reinvestment risk." },
    { id: "fixed-income-f5", front: "PIK (payment-in-kind) bond", back: "Issuer may pay coupons with more bonds or added principal instead of cash. Used by highly leveraged issuers; investors demand higher yields for the cash flow risk." },
    { id: "fixed-income-f6", front: "Who benefits: call, put, conversion?", back: "Call = issuer's option → higher yield, lower price. Put = investor's option → lower yield, higher price. Conversion = investor's option (equity upside) → lower yield than straight debt." },
    { id: "fixed-income-f7", front: "Conversion price / ratio / value", back: "Conversion price = par ⁄ conversion ratio. Conversion value = ratio × share price. Convertible price ≥ max(straight value, conversion value)." },
    { id: "fixed-income-f8", front: "Repo and haircut", back: "Repo = sell a security, agree to repurchase at a higher price — a collateralized loan; seller is the cash borrower. Haircut = collateral value − cash lent, protecting the cash lender. Interest = principal × repo rate × days⁄360." },
    { id: "fixed-income-f9", front: "Eurobond", back: "A bond issued outside the jurisdiction of any single country, named for its currency (e.g., Eurodollar bond); traditionally bearer form. Contrast: foreign bond = foreign issuer in a local market and currency." },
    { id: "fixed-income-f10", front: "Full price vs flat price", back: "Full (dirty, invoice) price = flat (clean, quoted) price + accrued interest. AI = (t⁄T) × coupon. Full price = PV at last coupon date × (1 + r)^(t/T). Dealers quote flat to strip out the mechanical AI buildup." },
    { id: "fixed-income-f11", front: "Matrix pricing", back: "Estimating an illiquid bond's yield by linearly interpolating yields of comparable (same rating/sector) bonds with bracketing maturities, then discounting cash flows at that yield." },
    { id: "fixed-income-f12", front: "Discount vs premium vs par pricing rule", back: "Coupon < yield → discount; coupon > yield → premium; coupon = yield → par. Constant-yield prices are pulled to par as maturity approaches." },
    { id: "fixed-income-f13", front: "Periodicity conversion formula", back: "(1 + APRm⁄m)^m = (1 + APRn⁄n)^n. Annualized yield falls as quoted periodicity rises; the periodicity-1 rate is the effective annual yield." },
    { id: "fixed-income-f14", front: "Yield to worst (YTW)", back: "The lowest of the yield to maturity and all yields to call for a callable bond — the conservative assumption about which redemption occurs." },
    { id: "fixed-income-f15", front: "Quoted margin vs discount margin (FRN)", back: "QM = contractual spread over MRR. DM = spread the market currently requires. DM = QM → par; DM > QM (credit worsened) → discount; DM < QM → premium." },
    { id: "fixed-income-f16", front: "Discount rate vs add-on rate (money market)", back: "Discount rate applies to face value: PV = FV(1 − days⁄year × DR); it understates return. Add-on rate applies to price: AOR = (year⁄days) × (FV − PV)⁄PV. Bond-equivalent = add-on, 365 days." },
    { id: "fixed-income-f17", front: "G-spread, I-spread, Z-spread, OAS", back: "G = YTM − interpolated government yield. I = YTM − swap rate. Z = constant spread over the whole government spot curve equating PV to price. OAS = Z-spread − option cost (callable: OAS < Z; putable: OAS > Z)." },
    { id: "fixed-income-f18", front: "Forward rate from spot rates", back: "(1 + zA)^A × (1 + IFR(A,B))^B = (1 + z(A+B))^(A+B). Example: z1 = 4%, z2 = 5% → 1y1y = 1.05²⁄1.04 − 1 = 6.01%." },
    { id: "fixed-income-f19", front: "Bootstrapping", back: "Extracting spot (zero) rates one maturity at a time from coupon bond prices: discount known early coupons at known spots, solve for the one unknown spot at each step." },
    { id: "fixed-income-f20", front: "Term structure theories", back: "Pure expectations: forwards = expected future spots. Liquidity preference: plus a maturity-increasing risk premium. Segmented markets: each maturity independent. Preferred habitat: investors leave preferred maturities only for extra yield." },
    { id: "fixed-income-f21", front: "Three sources of bond return", back: "(1) Coupon and principal payments, (2) reinvestment income on coupons, (3) capital gain/loss if sold before maturity versus constant-yield carrying value." },
    { id: "fixed-income-f22", front: "Duration gap", back: "Macaulay duration − investment horizon. Positive gap → price risk dominates → hurt by rising rates. Negative gap → reinvestment risk dominates → hurt by falling rates. Zero gap ≈ immunized." },
    { id: "fixed-income-f23", front: "Macaulay vs modified duration", back: "MacDur = weighted-average time to cash flows (years); ModDur = MacDur ⁄ (1 + r). %ΔPrice ≈ −ModDur × Δy. Zero-coupon bond: MacDur = maturity." },
    { id: "fixed-income-f24", front: "Approximate modified duration and convexity", back: "ApproxModDur = (PV− − PV+) ⁄ (2 × PV0 × Δy). ApproxCon = (PV− + PV+ − 2PV0) ⁄ (PV0 × Δy²). Full estimate: %ΔP ≈ −ModDur × Δy + ½ × Con × Δy²." },
    { id: "fixed-income-f25", front: "Money duration and PVBP", back: "Money duration = ModDur × full price (currency change per 100% yield change). PVBP = money duration × 0.0001 = price change for one basis point." },
    { id: "fixed-income-f26", front: "Duration properties", back: "Duration rises with maturity (generally), falls with higher coupon, falls with higher yield. Callables/MBS need effective duration (curve-based) and can show negative convexity at low rates." },
    { id: "fixed-income-f27", front: "Key rate duration; empirical duration", back: "Key rate duration = sensitivity to a shift at one curve maturity (captures non-parallel moves); they sum to effective duration. Empirical duration (from return regressions) < analytical for high yield because benchmark yields and spreads move inversely in stress." },
    { id: "fixed-income-f28", front: "Expected loss formula", back: "Expected loss = probability of default × loss given default, where LGD = exposure × (1 − recovery rate). The credit spread exceeds expected loss due to uncertainty, liquidity, and tax premiums." },
    { id: "fixed-income-f29", front: "Investment grade boundary", back: "Baa3 (Moody's) / BBB− (S&P, Fitch) is the lowest investment-grade rating; Ba1/BB+ and below is high yield. Issuers downgraded across the line are \"fallen angels.\"" },
    { id: "fixed-income-f30", front: "Four Cs of corporate credit analysis", back: "Capacity (ability to pay — the core: industry via Porter's five forces, ratios like debt/EBITDA and EBIT/interest), Collateral, Covenants, Character." },
    { id: "fixed-income-f31", front: "Structural subordination", back: "Holding-company debt is effectively junior to operating-subsidiary debt: op-co creditors are paid from operating assets/cash flows first. Same POD (cross-default), lower recovery → issue notched down." },
    { id: "fixed-income-f32", front: "SPE bankruptcy remoteness", back: "A true sale moves the asset pool to a legally separate SPE, beyond the reach of the originator's creditors — so the ABS can be rated higher than the originator itself." },
    { id: "fixed-income-f33", front: "Credit tranching (waterfall)", back: "Subordination: losses flow bottom-up (equity/first-loss → mezzanine → senior); cash flows top-down. Junior tranches are internal credit enhancement, along with overcollateralization and excess spread." },
    { id: "fixed-income-f34", front: "Covered bond vs ABS", back: "Covered bond: assets stay on the bank's balance sheet in a dynamic cover pool; dual recourse (bank + pool); no tranching; lower yield. ABS: true sale to SPE, pool-only recourse, tranched." },
    { id: "fixed-income-f35", front: "Contraction vs extension risk", back: "Contraction: rates fall → prepayments speed up → principal early at low reinvestment rates, price gain capped (negative convexity). Extension: rates rise → prepayments slow → duration lengthens at the worst time." },
    { id: "fixed-income-f36", front: "PAC vs support tranche; WAL", back: "PAC receives principal on schedule while prepayments stay within its collar; the support tranche absorbs the variability (more contraction AND extension risk, higher yield). WAL = weighted-average time to principal receipt; shortens as prepayments speed up." },
    { id: "fixed-income-f37", front: "CMBS credit metrics and balloon risk", back: "Underwritten on DSCR (NOI ⁄ debt service, want > 1×) and LTV. Strong call protection (lockout, defeasance, yield maintenance, penalty points); main tail risk is balloon risk — inability to refinance principal due at maturity." }
  ]
};
