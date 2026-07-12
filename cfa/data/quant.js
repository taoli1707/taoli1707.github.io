window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["quant"] = {
  name: "Quantitative Methods",
  weight: "6–9%",
  sections: [
    "Rates and Returns",
    "Time Value of Money in Finance",
    "Statistical Measures of Asset Returns",
    "Probability Trees and Conditional Expectations",
    "Portfolio Mathematics",
    "Simulation Methods",
    "Estimation and Inference",
    "Hypothesis Testing",
    "Parametric and Non-Parametric Tests of Independence",
    "Simple Linear Regression",
    "Introduction to Big Data Techniques"
  ],
  questions: [
    {
      id: "quant-q1",
      section: "Rates and Returns",
      q: "An investor buys a stock for $50. One year later she receives a $1.00 dividend and sells the stock for $54. The holding period return is closest to:",
      choices: ["8.0%", "10.0%", "11.0%"],
      answer: 1,
      expl: "HPR = (P1 − P0 + D) ⁄ P0 = (54 − 50 + 1) ⁄ 50 = 5 ⁄ 50 = 10%. The 8% distractor ignores the dividend; 11% incorrectly divides by an average price rather than the beginning price."
    },
    {
      id: "quant-q2",
      section: "Rates and Returns",
      q: "For a series of periodic returns that are not all equal, the geometric mean return is <em>most likely</em>:",
      choices: ["less than the arithmetic mean, with the gap widening as return volatility rises", "equal to the arithmetic mean if the sample is large enough", "greater than the arithmetic mean when returns are negative"],
      answer: 0,
      expl: "Harmonic ≤ geometric ≤ arithmetic, with equality only when every observation is identical. The difference between arithmetic and geometric means grows with the variability of returns; sample size does not close the gap, and negative returns do not reverse the ordering."
    },
    {
      id: "quant-q3",
      section: "Rates and Returns",
      q: "To evaluate the skill of a portfolio manager who has no control over the timing or size of client deposits and withdrawals, the most appropriate performance measure is the:",
      choices: ["money-weighted rate of return", "time-weighted rate of return", "arithmetic average holding period return"],
      answer: 1,
      expl: "The time-weighted return links sub-period returns geometrically, removing the distorting effect of external cash flows the manager does not control. The money-weighted return (an IRR) rewards or punishes the manager for the client's cash-flow timing. A simple arithmetic average ignores compounding."
    },
    {
      id: "quant-q4",
      section: "Time Value of Money",
      q: "A 5-year annual-pay bond has a 4% coupon on a $1,000 face value, and the market discount rate is 6%. The bond's price is closest to:",
      choices: ["$915.75", "$1,000.00", "$1,084.25"],
      answer: 0,
      expl: "N=5, I/Y=6, PMT=40, FV=1000 → CPT PV = −915.75. The coupon (4%) is below the required yield (6%), so the bond must price at a discount. $1,084.25 results from swapping the coupon and discount rates; $1,000 would apply only if coupon equaled yield."
    },
    {
      id: "quant-q5",
      section: "Time Value of Money",
      q: "A preferred stock pays a fixed $5.00 annual dividend forever, with the first payment one year from today. If the required return is 4%, the value of the share today is closest to:",
      choices: ["$100.00", "$125.00", "$130.00"],
      answer: 1,
      expl: "A perpetuity is valued as PMT ⁄ r = 5 ⁄ 0.04 = $125. The $100 distractor divides by 5% instead of 4%; $130 incorrectly adds one extra payment. Remember the PV formula places the value one period before the first payment."
    },
    {
      id: "quant-q6",
      section: "Statistical Measures",
      q: "Asset A has a mean return of 8% with standard deviation 4%. Asset B has a mean return of 12% with standard deviation 5%. Based on the coefficient of variation, it is most accurate to say that:",
      choices: ["Asset A has more risk per unit of return", "Asset B has more risk per unit of return", "the assets cannot be compared because their means differ"],
      answer: 0,
      expl: "CV = s ⁄ mean. CV(A) = 4 ⁄ 8 = 0.50; CV(B) = 5 ⁄ 12 = 0.42. A carries more risk per unit of return even though its standard deviation is lower. The whole point of the CV is to make assets with different means comparable, so the third choice is backward."
    },
    {
      id: "quant-q7",
      section: "Statistical Measures",
      q: "For a unimodal return distribution with positive (right) skew, the most likely ordering is:",
      choices: ["mean < median < mode", "mode < median < mean", "median < mode < mean"],
      answer: 1,
      expl: "The mean is pulled toward the long right tail, so mean > median > mode — equivalently mode < median < mean. The first ordering describes negative skew. The median always sits between mode and mean in a moderately skewed unimodal distribution."
    },
    {
      id: "quant-q8",
      section: "Statistical Measures",
      q: "A return distribution with excess kurtosis greater than zero is best described as:",
      choices: ["platykurtic, with fewer extreme outcomes than a normal distribution", "leptokurtic, with fatter tails than a normal distribution", "mesokurtic, matching the normal distribution's tails"],
      answer: 1,
      expl: "Excess kurtosis = kurtosis − 3. Positive excess kurtosis means leptokurtic: fat tails and more frequent extreme outcomes than the normal distribution — typical of actual asset returns and a reason normal-based risk models understate tail risk. Platykurtic distributions have negative excess kurtosis."
    },
    {
      id: "quant-q9",
      section: "Probability & Bayes",
      q: "Of all funds, 60% are growth funds and 40% are value funds. The probability of outperforming the benchmark is 20% for a growth fund and 35% for a value fund. Given that a randomly selected fund outperformed, the probability that it is a growth fund is closest to:",
      choices: ["12%", "46%", "54%"],
      answer: 1,
      expl: "P(outperform) = 0.60×0.20 + 0.40×0.35 = 0.12 + 0.14 = 0.26. Bayes: P(growth | outperform) = 0.12 ⁄ 0.26 = 0.4615 ≈ 46%. The 12% distractor is the joint probability P(growth and outperform), not the conditional; 54% is the posterior for value funds."
    },
    {
      id: "quant-q10",
      section: "Probability & Bayes",
      q: "An analyst forecasts EPS of $3.00 if the economy expands (probability 60%) and $1.50 if it contracts (probability 40%). The expected EPS is closest to:",
      choices: ["$2.25", "$2.40", "$2.70"],
      answer: 1,
      expl: "E(EPS) = 0.60 × 3.00 + 0.40 × 1.50 = 1.80 + 0.60 = $2.40 — the total probability rule for expected value. $2.25 is the unweighted average of the two outcomes, ignoring the probabilities."
    },
    {
      id: "quant-q11",
      section: "Portfolio Mathematics",
      q: "A portfolio is 50% in Asset X (σ = 10%) and 50% in Asset Y (σ = 20%), and the returns are uncorrelated (ρ = 0). The portfolio standard deviation is closest to:",
      choices: ["11.2%", "15.0%", "12.5%"],
      answer: 0,
      expl: "Variance = (0.5)²(100) + (0.5)²(400) + 0 = 25 + 100 = 125; σ = √125 = 11.18%. The 15% distractor is the weighted average of the standard deviations, which is correct only when ρ = +1; with lower correlation, diversification pushes risk below that average."
    },
    {
      id: "quant-q12",
      section: "Portfolio Mathematics",
      q: "An investor's minimum acceptable return is 2%. Portfolio A has E(R) = 8% and σ = 10%; Portfolio B has E(R) = 11% and σ = 18%. Under Roy's safety-first criterion, the investor should select:",
      choices: ["Portfolio A, because its safety-first ratio is 0.60", "Portfolio B, because its expected return is higher", "Portfolio B, because its safety-first ratio is 0.61"],
      answer: 0,
      expl: "SFRatio = (E(R) − RL) ⁄ σ. A: (8 − 2) ⁄ 10 = 0.60; B: (11 − 2) ⁄ 18 = 0.50. The higher ratio (A) minimizes the probability of falling below the 2% threshold. Choosing on expected return alone ignores shortfall risk, and B's ratio is 0.50, not 0.61."
    },
    {
      id: "quant-q13",
      section: "Simulation Methods",
      q: "A stock price rises from $100 to $120 over one year. The continuously compounded annual return is closest to:",
      choices: ["16.67%", "18.23%", "20.00%"],
      answer: 1,
      expl: "r = ln(120 ⁄ 100) = ln(1.20) = 18.23%. The log return is always below the 20% holding period return. The 16.67% distractor computes 20 ⁄ 120, dividing the gain by the ending rather than beginning price."
    },
    {
      id: "quant-q14",
      section: "Simulation Methods",
      q: "Bootstrap resampling is best described as repeatedly drawing samples:",
      choices: ["from an assumed theoretical distribution such as the normal", "of size n from the observed data, with replacement", "of size n from the observed data, without replacement"],
      answer: 1,
      expl: "The bootstrap treats the observed sample as a stand-in for the population and redraws from it with replacement, so an observation can appear more than once per resample. Drawing from an assumed distribution describes Monte Carlo simulation; drawing without replacement would simply reshuffle the original sample."
    },
    {
      id: "quant-q15",
      section: "Estimation and Inference",
      q: "A population of returns has a standard deviation of 15%. For a random sample of 36 observations, the standard error of the sample mean is closest to:",
      choices: ["0.42%", "2.50%", "15.00%"],
      answer: 1,
      expl: "Standard error = σ ⁄ √n = 15 ⁄ √36 = 15 ⁄ 6 = 2.5%. Dividing by n instead of √n gives 0.42%; 15% confuses the standard deviation of the data with the standard error of the mean."
    },
    {
      id: "quant-q16",
      section: "Estimation and Inference",
      q: "Compared with cluster sampling, stratified random sampling most likely:",
      choices: ["selects entire subgroups at random and uses only those subgroups", "draws observations from every subgroup, improving representativeness", "is cheaper to implement because fewer subgroups must be contacted"],
      answer: 1,
      expl: "Stratified sampling randomly samples within every stratum, guaranteeing each subgroup is represented, which improves precision. Selecting whole subgroups and using only some of them describes cluster sampling — which is the cheaper but less accurate method."
    },
    {
      id: "quant-q17",
      section: "Hypothesis Testing",
      q: "A Type I error is best described as:",
      choices: ["failing to reject a false null hypothesis; its probability is β", "rejecting a true null hypothesis; its probability equals the significance level α", "rejecting a false null hypothesis; its probability equals the power of the test"],
      answer: 1,
      expl: "Type I error = rejecting H0 when it is actually true, and the significance level α is exactly the probability of doing so. Failing to reject a false null is a Type II error (probability β), and correctly rejecting a false null is the test's power (1 − β), not an error."
    },
    {
      id: "quant-q18",
      section: "Hypothesis Testing",
      q: "A sample of 64 monthly observations has a mean return of 4.5% and a sample standard deviation of 6%. To test H<sub>0</sub>: μ = 3%, the t-statistic is closest to:",
      choices: ["0.25", "2.00", "16.00"],
      answer: 1,
      expl: "t = (X̄ − μ0) ⁄ (s ⁄ √n) = (4.5 − 3) ⁄ (6 ⁄ 8) = 1.5 ⁄ 0.75 = 2.0. The 0.25 distractor forgets to divide s by √n; 16.00 divides by s ⁄ n instead of s ⁄ √n."
    },
    {
      id: "quant-q19",
      section: "Tests of Independence",
      q: "A non-parametric test such as the Spearman rank correlation is most appropriate when:",
      choices: ["the data are ranks or the returns depart markedly from normality", "the sample is large and drawn from a normal population", "the analyst needs to test a hypothesis about a population variance"],
      answer: 0,
      expl: "Non-parametric tests are used when distributional assumptions fail (outliers, non-normality), samples are small, or data are ordinal (ranks). With large normal samples, the parametric t-test is preferred because it has more power. A variance test uses the (parametric) chi-square test of a single variance."
    },
    {
      id: "quant-q20",
      section: "Simple Linear Regression",
      q: "A simple linear regression has total sum of squares (SST) of 80 and sum of squared errors (SSE) of 20. The coefficient of determination is closest to:",
      choices: ["0.25", "0.75", "0.87"],
      answer: 1,
      expl: "R² = 1 − SSE ⁄ SST = 1 − 20 ⁄ 80 = 0.75: the independent variable explains 75% of the variation in Y. The 0.25 distractor is SSE ⁄ SST (the unexplained fraction); 0.87 is √0.75, the correlation coefficient rather than R²."
    },
    {
      id: "quant-q21",
      section: "Simple Linear Regression",
      q: "In a simple linear regression estimated over 22 observations, the slope coefficient is 0.90 with a standard error of 0.30. Using a 5% significance level (critical t with df = 20 is ±2.086), the most appropriate conclusion is that the slope is:",
      choices: ["statistically significant, because t = 3.0 exceeds 2.086", "not statistically significant, because t = 0.9 is below 2.086", "statistically significant, because the F-statistic must be negative"],
      answer: 0,
      expl: "t = (0.90 − 0) ⁄ 0.30 = 3.0 > 2.086, so reject H0: b1 = 0 — the slope is significant. Note df = n − 2 = 20 in simple regression. In SLR the F-statistic equals t² = 9 (F is never negative) and gives the identical conclusion."
    },
    {
      id: "quant-q22",
      section: "Big Data Techniques",
      q: "A machine-learning algorithm that groups companies into segments using input data that contain no labeled outcomes is best described as:",
      choices: ["supervised learning, because the analyst supervises the training", "unsupervised learning, such as clustering", "deep learning, because multiple outcomes are produced"],
      answer: 1,
      expl: "With no labeled target outputs, the algorithm must find structure on its own — unsupervised learning, of which clustering is the classic example. Supervised learning requires labeled training data (known outcomes), not analyst oversight. Deep learning refers to multi-layer neural networks, which can be used in either mode."
    }
  ],
  flashcards: [
    { id: "quant-f1", front: "Holding period return (HPR)", back: "HPR = (P1 − P0 + D1) ⁄ P0 — price change plus income, divided by beginning price." },
    { id: "quant-f2", front: "Geometric mean return", back: "[(1+R1)(1+R2)…(1+Rn)]^(1/n) − 1. The compound growth rate per period; ≤ arithmetic mean, equal only if all returns identical." },
    { id: "quant-f3", front: "When is the harmonic mean the right average?", back: "Averaging cost per share when a fixed dollar amount is invested each period (cost averaging), and averaging ratios like P/E. Harmonic ≤ geometric ≤ arithmetic." },
    { id: "quant-f4", front: "Time-weighted vs money-weighted return", back: "TWR: geometric linking of sub-period HPRs; unaffected by cash-flow timing — use to judge managers. MWR: the IRR of all cash flows; reflects the investor's timing decisions." },
    { id: "quant-f5", front: "Exact real return", back: "Real = (1 + nominal) ⁄ (1 + inflation) − 1. Subtracting inflation is only an approximation." },
    { id: "quant-f6", front: "Leveraged portfolio return", back: "RL = RP + (VB ⁄ VE) × (RP − rD). Leverage helps when the portfolio earns more than the borrowing rate, hurts when it earns less." },
    { id: "quant-f7", front: "Effective annual rate (EAR)", back: "EAR = (1 + r/m)^m − 1 for m compounding periods per year; EAR = e^r − 1 with continuous compounding." },
    { id: "quant-f8", front: "PV of a perpetuity", back: "PV = PMT ⁄ r, valued one period before the first payment. Gordon growth extension: P0 = D1 ⁄ (r − g), valid only when r > g." },
    { id: "quant-f9", front: "Annuity due vs ordinary annuity", back: "Annuity due pays at the start of each period and is worth (1 + r) × the ordinary annuity value. BA II Plus: 2ND BGN, 2ND SET — then remember to reset to END." },
    { id: "quant-f10", front: "Coefficient of variation (CV)", back: "CV = s ⁄ mean = risk per unit of return. Lower is better; lets you compare dispersion across assets with different average returns." },
    { id: "quant-f11", front: "Target downside deviation", back: "√[Σ(Xi − B)² ⁄ (n − 1)] summing only observations below target B, but still dividing by n − 1 of the full sample. Measures only downside risk." },
    { id: "quant-f12", front: "Skewness orderings", back: "Positive (right) skew: mean > median > mode. Negative (left) skew: mean < median < mode. The mean is pulled toward the long tail." },
    { id: "quant-f13", front: "Leptokurtic distribution", back: "Excess kurtosis > 0 (kurtosis > 3): fatter tails and more extreme outcomes than the normal distribution. Typical of asset returns; normal-based models understate tail risk." },
    { id: "quant-f14", front: "Spurious correlation", back: "A statistically significant correlation with no economic basis — from chance, a shared third variable, or constructed ratios. Correlation also misses nonlinear links and never proves causation." },
    { id: "quant-f15", front: "Total probability rule", back: "P(A) = Σ P(A | Si) × P(Si) over mutually exclusive, exhaustive scenarios. Same weighting logic gives unconditional expected values from conditional ones." },
    { id: "quant-f16", front: "Bayes' formula", back: "P(Event | Info) = P(Info | Event) × P(Event) ⁄ P(Info). Updates a prior probability to a posterior after observing new information." },
    { id: "quant-f17", front: "Two-asset portfolio variance", back: "σp² = w1²σ1² + w2²σ2² + 2w1w2ρ12σ1σ2. Don't forget the 2, and take the square root for σp. Portfolio σ < weighted-average σ whenever ρ < 1." },
    { id: "quant-f18", front: "Roy's safety-first ratio", back: "SFRatio = (E(Rp) − RL) ⁄ σp using the threshold return RL, not the risk-free rate. Pick the portfolio with the highest ratio to minimize shortfall probability." },
    { id: "quant-f19", front: "Lognormal price model", back: "If continuously compounded returns are normal, the price level is lognormal: bounded below by zero, right-skewed — suitable for prices, which cannot go negative." },
    { id: "quant-f20", front: "Continuously compounded return", back: "rcc = ln(P1 ⁄ P0) = ln(1 + HPR). Log returns add across periods and are always smaller than the matching HPR." },
    { id: "quant-f21", front: "Monte Carlo vs bootstrap", back: "Monte Carlo: draws from an assumed distribution with chosen parameters. Bootstrap: redraws from the observed sample with replacement, no distributional assumption." },
    { id: "quant-f22", front: "Central limit theorem", back: "For any population with finite variance, the sample mean's distribution approaches normal with mean μ and variance σ² ⁄ n as n grows (n ≥ 30 rule of thumb). Standard error = σ ⁄ √n." },
    { id: "quant-f23", front: "Type I vs Type II error; power", back: "Type I: reject a true H0, probability = α (significance level). Type II: fail to reject a false H0, probability = β. Power = 1 − β. Lowering α raises β for a fixed n." },
    { id: "quant-f24", front: "p-value", back: "The smallest significance level at which H0 can be rejected — the probability of a result at least as extreme as observed, if H0 is true. Reject H0 when p < α." },
    { id: "quant-f25", front: "t-test of a correlation coefficient", back: "t = r√(n − 2) ⁄ √(1 − r²), df = n − 2. Significance increases with |r| and with sample size." },
    { id: "quant-f26", front: "Chi-square test of independence", back: "χ² = Σ(O − E)² ⁄ E with E = row total × column total ⁄ grand total; df = (r − 1)(c − 1); always right-tailed. Tests whether two categorical classifications are independent." },
    { id: "quant-f27", front: "Regression ANOVA identities", back: "SST = SSR + SSE; R² = SSR ⁄ SST = 1 − SSE ⁄ SST; SEE = √[SSE ⁄ (n − 2)]; F = MSR ⁄ MSE, and F = t² of the slope in simple regression." },
    { id: "quant-f28", front: "Four assumptions of simple linear regression", back: "Linearity; homoskedasticity (constant error variance); independence of errors (no serial correlation); normally distributed errors." },
    { id: "quant-f29", front: "Supervised vs unsupervised machine learning", back: "Supervised: labeled data with known targets — regression (numbers) and classification (categories). Unsupervised: unlabeled data — clustering and dimension reduction." },
    { id: "quant-f30", front: "Overfitting", back: "The model learns training-set noise: very low training error but high out-of-sample error. Fix by simplifying the model and validating on held-out data." }
  ]
};
