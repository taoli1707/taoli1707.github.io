window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["corporate"] = {
  name: "Corporate Issuers",
  weight: "6–9%",
  sections: [
    "Organizational Forms, Corporate Issuer Features, and Ownership",
    "Investors and Other Stakeholders",
    "Corporate Governance: Conflicts, Mechanisms, and Risks",
    "Working Capital and Liquidity",
    "Capital Investments and Capital Allocation",
    "Capital Structure",
    "Business Models"
  ],
  questions: [
    {
      id: "corporate-q1",
      section: "Organizational Forms",
      q: "An investor wants to fund a friend's restaurant but is unwilling to risk more than her invested capital and does not want any role in operations. Which organizational form and role is most appropriate?",
      choices: [
        "General partner in a general partnership",
        "Limited partner in a limited partnership",
        "Sole trader providing a personal guarantee"
      ],
      answer: 1,
      expl: "A limited partner's liability is capped at the invested amount, and limited partners do not manage the business — exactly her requirements. A general partner manages but bears unlimited liability, including for the other partners' business actions. A sole trader also bears unlimited personal liability."
    },
    {
      id: "corporate-q2",
      section: "Organizational Forms",
      q: "The feature that most likely distinguishes a public company from a private company is:",
      choices: [
        "The number of employees and total revenue of the company",
        "Whether its shares trade on an exchange, with associated disclosure requirements",
        "Whether the company has ever completed an initial public offering"
      ],
      answer: 1,
      expl: "The defining difference is exchange listing: public company shares trade between investors in the secondary market and the issuer faces ongoing disclosure and listing rules. Size is irrelevant — many private firms are enormous. An IPO is not required: direct listings and SPAC mergers also make a company public."
    },
    {
      id: "corporate-q3",
      section: "Organizational Forms",
      q: "A founder holds Class B shares carrying 10 votes each while public investors hold Class A shares with 1 vote each. The most likely consequence of this dual-class structure is that the founder:",
      choices: [
        "retains voting control while holding a minority of the company's economic interest",
        "bears unlimited liability for the company's obligations",
        "receives dividend payments before Class A shareholders in liquidation"
      ],
      answer: 0,
      expl: "Super-voting shares separate control from cash-flow rights: the founder can control board elections with a small fraction of the economics, which is the main minority-shareholder concern with dual-class structures. Liability remains limited for all shareholders, and voting rights say nothing about liquidation priority."
    },
    {
      id: "corporate-q4",
      section: "Investors and Stakeholders",
      q: "Compared with the company's shareholders, its debtholders most likely have:",
      choices: [
        "greater potential upside and lower priority of claims",
        "limited potential upside and higher priority of claims",
        "limited potential upside and lower priority of claims"
      ],
      answer: 1,
      expl: "Debtholders hold a contractual claim: the best case is receiving the promised interest and principal (capped upside), and they rank ahead of equity in liquidation. Shareholders are residual claimants — paid last but with unlimited upside. The distractors mix up one leg of each comparison."
    },
    {
      id: "corporate-q5",
      section: "Investors and Stakeholders",
      q: "Shortly after a large bond issue, a firm's shareholders approve shifting corporate assets into much riskier ventures and paying a special dividend. This behavior best illustrates a conflict between:",
      choices: [
        "managers and the board of directors",
        "shareholders and debtholders",
        "controlling and minority shareholders"
      ],
      answer: 1,
      expl: "Adding asset risk raises the option-like value of equity while increasing default risk borne by lenders, and the dividend moves cash beyond creditors' reach — a classic wealth transfer from debtholders to shareholders. Covenants restricting leverage, dividends, and asset dispositions exist to limit exactly this conflict."
    },
    {
      id: "corporate-q6",
      section: "Investors and Stakeholders",
      q: "Which statement about ESG integration is most accurate?",
      choices: [
        "It incorporates material environmental, social, and governance factors into investment analysis and valuation",
        "It requires excluding all companies in controversial industries from a portfolio",
        "It applies only to equity investors, because bondholders are protected by covenants"
      ],
      answer: 0,
      expl: "ESG integration means reflecting financially material ESG factors in analysis — e.g., adjusting cash flow forecasts or discount rates for climate or governance risk. Exclusionary screening is a separate, values-based approach, not a requirement of integration. ESG factors matter to lenders too: environmental fines or governance failures raise default risk."
    },
    {
      id: "corporate-q7",
      section: "Corporate Governance",
      q: "The board committee for which independence from management is most critical is the:",
      choices: ["audit committee", "nomination committee", "investment committee"],
      answer: 0,
      expl: "The audit committee oversees financial reporting, internal controls, and the external auditor — the areas where management has the greatest incentive and ability to misreport, so independence matters most there. Nomination-committee independence is desirable but secondary; investment committees are not universally required."
    },
    {
      id: "corporate-q8",
      section: "Corporate Governance",
      q: "Which voting arrangement most benefits minority shareholders seeking board representation?",
      choices: ["Straight (statutory) voting", "Cumulative voting", "Proxy voting"],
      answer: 1,
      expl: "Cumulative voting lets a shareholder pool all votes (shares × seats up for election) on a single candidate, so a large-enough minority can guarantee one seat. Under straight voting a 50%+ holder wins every seat. Proxy voting is merely a way to cast votes without attending — it does not change voting power."
    },
    {
      id: "corporate-q9",
      section: "Corporate Governance",
      q: "A 'say on pay' provision most likely gives shareholders:",
      choices: [
        "a binding vote that sets the CEO's total compensation each year",
        "an advisory (typically non-binding) vote on executive compensation",
        "the right to negotiate compensation directly with executives"
      ],
      answer: 1,
      expl: "In most jurisdictions say on pay is an advisory vote: it signals shareholder sentiment and pressures the compensation committee but does not set pay levels. It is not usually binding, and shareholders never negotiate pay directly — that is the board's (compensation committee's) job."
    },
    {
      id: "corporate-q10",
      section: "Corporate Governance",
      q: "A company adopts a staggered (classified) board, with one-third of directors standing for election each year. The most likely governance effect is:",
      choices: [
        "stronger shareholder ability to replace the full board quickly",
        "reduced vulnerability to hostile takeover and greater director entrenchment",
        "improved independence of the audit committee"
      ],
      answer: 1,
      expl: "With only a fraction of seats contestable each year, an acquirer or activist needs multiple annual meetings to gain board control, so staggered boards deter takeovers and entrench incumbents — weakening a key external discipline on management. It is often defended as providing continuity, but it does not strengthen shareholder power and has no direct link to committee independence."
    },
    {
      id: "corporate-q11",
      section: "Working Capital",
      q: "A firm has days of inventory on hand of 45, days sales outstanding of 30, and days payables outstanding of 30. Its cash conversion cycle is closest to:",
      choices: ["45 days", "75 days", "105 days"],
      answer: 0,
      expl: "CCC = DOH + DSO − DPO = 45 + 30 − 30 = 45 days. Adding all three (105) or stopping at the operating cycle DOH + DSO = 75 are the classic sign errors — payables days are subtracted because supplier credit finances part of the cycle."
    },
    {
      id: "corporate-q12",
      section: "Working Capital",
      q: "Which of the following is best described as a secondary source of liquidity?",
      choices: [
        "Drawing on a committed bank line of credit",
        "Selling long-term operating assets to raise cash",
        "Collecting accounts receivable"
      ],
      answer: 1,
      expl: "Secondary sources — renegotiating debt, selling assets, bankruptcy filings — raise cash at the cost of disrupting the firm's normal financial or operating position and signal stress. Committed credit lines, operating cash flows, and receivable collections are primary sources used in the ordinary course of business."
    },
    {
      id: "corporate-q13",
      section: "Working Capital",
      q: "An increase in obsolete inventory that cannot be sold is best described as:",
      choices: [
        "a pull on liquidity",
        "a drag on liquidity",
        "a primary source of liquidity"
      ],
      answer: 1,
      expl: "A drag on liquidity delays or reduces cash inflows — uncollectible receivables and unsalable inventory are the standard examples. A pull on liquidity accelerates cash outflows, such as suppliers demanding earlier payment. Obsolete inventory is obviously not a source of liquidity."
    },
    {
      id: "corporate-q14",
      section: "Working Capital",
      q: "A supplier offers terms of 2/10 net 30. The annualized cost to a customer of forgoing the discount and paying on day 30 is closest to:",
      choices: ["2.0%", "24.5%", "44.6%"],
      answer: 2,
      expl: "Forgoing the discount means paying 2/98 ≈ 2.04% to use the funds 20 more days: (1 + 2/98)^(365/20) − 1 ≈ 44.6%. Simply reading off 2% ignores annualization; 24.5% comes from using simple rather than compound annualization over the wrong period. At ~45%, the firm should borrow at normal rates to take the discount."
    },
    {
      id: "corporate-q15",
      section: "Capital Allocation",
      q: "A project costs $100,000 and produces $40,000 at the end of each year for 4 years. At a 10% required return, the project's NPV is closest to:",
      choices: ["$26,795", "$60,000", "−$13,400"],
      answer: 0,
      expl: "NPV = 40,000 × [1 − 1.10^−4]/0.10 − 100,000 = 40,000 × 3.1699 − 100,000 ≈ +$26,795. The $60,000 distractor ignores discounting (160,000 − 100,000); the negative figure comes from discounting errors. Positive NPV → accept."
    },
    {
      id: "corporate-q16",
      section: "Capital Allocation",
      q: "Two mutually exclusive projects have conflicting NPV and IRR rankings because they differ greatly in scale. The firm should most likely choose the project with the:",
      choices: [
        "higher IRR, because IRR is independent of the required return",
        "higher NPV, because NPV measures the wealth added in currency terms",
        "shorter payback period, to break the tie objectively"
      ],
      answer: 1,
      expl: "When rankings conflict — due to scale or cash-flow timing differences — NPV governs: it measures dollars of value created and assumes reinvestment at the realistic required return, whereas IRR assumes reinvestment at the IRR itself. A big NPV on a large base beats a high percentage on a small base. Payback ignores time value and post-payback cash flows."
    },
    {
      id: "corporate-q17",
      section: "Capital Allocation",
      q: "A project's cash flows are −$50 million today, +$40 million in each of years 1 and 2, and −$45 million in year 3 for site remediation. Which statement is most accurate?",
      choices: [
        "The project must have exactly one IRR because it has an initial outflow",
        "The project may have multiple IRRs or no IRR because its cash flows change sign more than once",
        "The project cannot be evaluated with NPV because of the negative final cash flow"
      ],
      answer: 1,
      expl: "The sign pattern (−, +, +, −) changes twice, so there can be up to two IRRs — or none. Uniqueness of IRR requires conventional cash flows (one sign change). NPV remains perfectly usable: discount every cash flow, whatever its sign, and accept if NPV > 0. This is precisely why NPV is preferred for unconventional projects."
    },
    {
      id: "corporate-q18",
      section: "Capital Allocation",
      q: "Before evaluating a new plant, a firm spent $3 million on consulting studies. The plant would also occupy land the firm owns that could otherwise be leased out. In the capital budgeting analysis, the firm should:",
      choices: [
        "include the $3 million study and include the forgone lease income",
        "exclude the $3 million study and include the forgone lease income",
        "exclude both, because neither is a cash outlay for the plant itself"
      ],
      answer: 1,
      expl: "The consulting fee is a sunk cost — already spent regardless of the decision — so it is excluded. The forgone lease income is an opportunity cost of using the land and must be included as an incremental cash flow. Mixing these up (including sunk costs, omitting opportunity costs) is the most heavily tested capital allocation pitfall."
    },
    {
      id: "corporate-q19",
      section: "Capital Allocation",
      q: "A mining company structures a project so it can shut the mine and sell the equipment for salvage value if metal prices fall. This flexibility is best described as:",
      choices: ["an abandonment option", "a timing option", "a flexibility (price-setting) option"],
      answer: 0,
      expl: "The right to exit and recover salvage value if conditions deteriorate is an abandonment option — a sizing-type real option that adds value beyond static NPV. A timing option is the right to delay investing; flexibility options involve changing prices or production processes while continuing to operate."
    },
    {
      id: "corporate-q20",
      section: "Capital Structure",
      q: "A firm targets 30% debt, 10% preferred stock, and 60% common equity at market values. Pre-tax cost of debt is 6%, cost of preferred 7%, cost of equity 11%, and the marginal tax rate is 25%. Its WACC is closest to:",
      choices: ["8.65%", "9.10%", "8.13%"],
      answer: 0,
      expl: "WACC = 0.30 × 6% × (1 − 0.25) + 0.10 × 7% + 0.60 × 11% = 1.35% + 0.70% + 6.60% = 8.65%. The 9.10% distractor omits the tax shield on debt; 8.13% wrongly applies (1 − t) to preferred as well. Only interest on debt is tax-deductible."
    },
    {
      id: "corporate-q21",
      section: "Capital Structure",
      q: "Under Modigliani–Miller Proposition II with no taxes, as a firm substitutes debt for equity, its WACC most likely:",
      choices: [
        "falls, because debt is cheaper than equity",
        "stays constant, because the cost of equity rises to offset the cheaper debt",
        "rises, because financial distress costs increase"
      ],
      answer: 1,
      expl: "Without taxes, r_e = r_0 + (r_0 − r_d)(D/E): leverage makes the remaining equity riskier, and the higher cost of equity exactly offsets the greater weight on cheaper debt, leaving WACC — and firm value — unchanged. 'Debt is cheaper so WACC falls' is the intuitive trap MM refutes; distress costs are assumed away in the MM framework."
    },
    {
      id: "corporate-q22",
      section: "Capital Structure",
      q: "According to the static trade-off theory, a firm's optimal capital structure is the debt level at which:",
      choices: [
        "the tax shield is maximized, implying financing with as much debt as lenders allow",
        "the marginal benefit of the interest tax shield equals the marginal expected cost of financial distress",
        "internal financing is exhausted and the firm must issue new equity"
      ],
      answer: 1,
      expl: "Trade-off theory: V_L = V_U + tD − PV(expected distress costs). Value rises with debt while the tax shield dominates, then falls as distress costs grow; the optimum — where WACC is minimized — is where marginal benefit equals marginal cost. Maximizing debt is the (wrong) literal implication of MM-with-taxes alone; the internal-then-debt-then-equity ordering is pecking order theory, not trade-off."
    },
    {
      id: "corporate-q23",
      section: "Capital Structure",
      q: "Pecking order theory implies that, other things equal, managers prefer to finance new investment first with:",
      choices: [
        "new common equity, to strengthen the balance sheet",
        "internally generated funds, then debt, issuing new equity only as a last resort",
        "debt, because the interest tax shield always maximizes firm value"
      ],
      answer: 1,
      expl: "Because of information asymmetry, financing choices send signals: equity issuance suggests managers think shares are overvalued and tends to depress the price, so it comes last. Internal funds reveal nothing and come first, then debt. One implication: highly profitable firms may carry little debt simply because they rarely need external financing."
    },
    {
      id: "corporate-q24",
      section: "Capital Structure",
      q: "A firm sells units at $50 with variable costs of $30 per unit, fixed operating costs of $100,000, and interest expense of $40,000. At sales of 10,000 units, its degree of total leverage (DTL) is closest to:",
      choices: ["2.00", "3.33", "1.67"],
      answer: 1,
      expl: "EBIT = 10,000 × (50 − 30) − 100,000 = 100,000. DOL = 200,000/100,000 = 2.0; DFL = 100,000/(100,000 − 40,000) = 1.667; DTL = DOL × DFL = 3.33, so a 1% change in sales moves EPS about 3.33%. The distractors are DOL and DFL alone — read whether the question asks operating, financial, or total leverage."
    },
    {
      id: "corporate-q25",
      section: "Business Models",
      q: "A software firm offers a free basic version of its product and charges for premium features. This pricing model is best described as:",
      choices: ["penetration pricing", "freemium", "hidden revenue"],
      answer: 1,
      expl: "Freemium gives the basic product away and monetizes upgrades. Penetration pricing charges a low (but nonzero) price across the board to build share quickly. A hidden-revenue model charges users nothing at all and earns revenue from third parties such as advertisers."
    },
    {
      id: "corporate-q26",
      section: "Business Models",
      q: "A marketplace app becomes more valuable to buyers as more sellers join, and more attractive to sellers as more buyers join. This is best described as:",
      choices: [
        "economies of scale",
        "a two-sided network effect",
        "a razor-and-blades pricing model"
      ],
      answer: 1,
      expl: "When each side's value grows with participation on the other side, the platform exhibits two-sided network effects, which tend to produce winner-take-most dynamics. Economies of scale are about unit costs falling with output — a supply-side phenomenon, not user-value reinforcement. Razor-and-blades is a pricing model (cheap device, high-margin consumables)."
    }
  ],
  flashcards: [
    { id: "corporate-f1", front: "Liability of a sole trader vs. a shareholder in a limited company", back: "Sole trader: unlimited personal liability — business debts can claim personal assets. Shareholder: limited liability — maximum loss = amount invested in the shares." },
    { id: "corporate-f2", front: "Limited partnership: who manages, who has limited liability?", back: "The general partner(s) manage and bear unlimited liability. Limited partners contribute capital only, do not manage, and can lose no more than their investment." },
    { id: "corporate-f3", front: "Three ways a private company can become public", back: "1) IPO (new/existing shares sold to public); 2) direct listing (existing shares start trading, no capital raised); 3) acquisition by a listed company, including a SPAC merger." },
    { id: "corporate-f4", front: "Debt vs. equity: claim, priority, upside", back: "Debt: contractual claim (interest + principal), senior to equity, upside capped at promised payments. Equity: residual claim, paid last, unlimited upside, loss capped at investment." },
    { id: "corporate-f5", front: "Why can shareholders favor riskier projects than debtholders want?", back: "Equity is like a call option on firm assets: volatility adds upside while limited liability caps the downside. Debtholders gain nothing from extra risk but bear more default risk — hence covenants." },
    { id: "corporate-f6", front: "Principal–agent problem (definition + root causes)", back: "An agent hired to act for a principal pursues their own interests instead. Root causes: diverging incentives plus information asymmetry (the agent knows more than the principal)." },
    { id: "corporate-f7", front: "Shareholder theory vs. stakeholder theory", back: "Shareholder theory: the corporate objective is maximizing shareholder value. Stakeholder theory: management should balance interests of all stakeholders (employees, customers, creditors, society), at some cost in clarity and accountability." },
    { id: "corporate-f8", front: "Straight vs. cumulative voting", back: "Straight: one vote per share per board seat — a majority holder wins every seat. Cumulative: votes (shares × seats) can be concentrated on one candidate — helps minority shareholders win representation." },
    { id: "corporate-f9", front: "Three key board committees and their jobs", back: "Audit: financial reporting, internal controls, external auditor (independence most critical). Compensation: executive pay design. Nomination: director recruitment and CEO succession." },
    { id: "corporate-f10", front: "Say on pay", back: "A shareholder vote on executive compensation — typically advisory (non-binding), but a failed vote pressures the board and compensation committee." },
    { id: "corporate-f11", front: "Tunneling / related-party transaction risk", back: "A controlling shareholder extracts private benefits at minority expense, e.g., the company transacts with the controller's other businesses at off-market prices. Defenses: independent director approval, disclosure, minority-vote requirements." },
    { id: "corporate-f12", front: "Cash conversion cycle formula", back: "CCC = DOH + DSO − DPO (days inventory + days receivables − days payables). Shorter is generally better; some retailers achieve a negative CCC." },
    { id: "corporate-f13", front: "Primary vs. secondary sources of liquidity", back: "Primary (routine, non-disruptive): cash and securities, operating cash flow, committed credit lines, trade credit. Secondary (disruptive, signals stress): renegotiating debt, asset sales, bankruptcy filing." },
    { id: "corporate-f14", front: "Drag vs. pull on liquidity", back: "Drag: cash inflows delayed/reduced (bad receivables, obsolete inventory). Pull: cash outflows accelerated (suppliers demand earlier payment, credit lines cut)." },
    { id: "corporate-f15", front: "Cost of forgoing a trade discount '2/10 net 30'", back: "(1 + 2/98)^(365/20) − 1 ≈ 44.6% annualized — usually far above borrowing rates, so take the discount." },
    { id: "corporate-f16", front: "NPV and IRR decision rules", back: "NPV = Σ CF_t/(1+r)^t; accept if NPV > 0. IRR = rate making NPV = 0; accept if IRR > required return. For conflicts between mutually exclusive projects, follow NPV." },
    { id: "corporate-f17", front: "Why NPV beats IRR when rankings conflict", back: "NPV measures wealth added in currency and assumes reinvestment at the required return; IRR assumes reinvestment at the IRR and is distorted by scale and timing differences. Nonconventional cash flows can produce multiple or no IRRs." },
    { id: "corporate-f18", front: "Capital budgeting: sunk cost vs. opportunity cost", back: "Sunk cost: already incurred, unrecoverable — EXCLUDE. Opportunity cost: value of a resource in its next-best use (e.g., forgone lease income on land used) — INCLUDE. Also include externalities like cannibalization." },
    { id: "corporate-f19", front: "Four types of real options", back: "Timing (delay investment); sizing (abandonment, growth/expansion); flexibility (change price or production process); fundamental (payoff driven by an underlying price, e.g., a mine)." },
    { id: "corporate-f20", front: "WACC formula", back: "WACC = w_d × r_d × (1 − t) + w_p × r_p + w_e × r_e, using target capital-structure weights at market values. Only debt gets the (1 − t) tax adjustment." },
    { id: "corporate-f21", front: "MM Proposition I and II without taxes", back: "Prop I: V_L = V_U — capital structure is irrelevant in perfect markets. Prop II: r_e = r_0 + (r_0 − r_d)(D/E) — cost of equity rises with leverage, keeping WACC constant." },
    { id: "corporate-f22", front: "MM with corporate taxes", back: "V_L = V_U + t × D: the interest tax shield adds value, so WACC falls as debt rises. Taken alone it implies ~100% debt — corrected by adding financial distress costs (trade-off theory)." },
    { id: "corporate-f23", front: "Static trade-off theory of capital structure", back: "V_L = V_U + tD − PV(expected distress costs). Optimal debt level: marginal tax benefit = marginal distress cost; WACC is minimized and firm value maximized there." },
    { id: "corporate-f24", front: "Pecking order of financing", back: "Internal funds → debt → new equity last. Driven by information asymmetry: equity issues signal possible overvaluation and depress the share price." },
    { id: "corporate-f25", front: "DOL, DFL, DTL formulas", back: "DOL = Q(P−V) / [Q(P−V) − F]; DFL = EBIT / (EBIT − I); DTL = DOL × DFL = %ΔEPS / %Δsales. Operating breakeven Q = F/(P−V); total breakeven Q = (F+I)/(P−V)." },
    { id: "corporate-f26", front: "Network effect vs. economies of scale", back: "Network effect: product value to each USER rises as more users join (demand side). Economies of scale: unit COSTS fall as output rises (supply side). Platforms with two-sided network effects tend toward winner-take-most." },
    { id: "corporate-f27", front: "Freemium vs. hidden revenue vs. penetration pricing", back: "Freemium: basic free, pay to upgrade. Hidden revenue: users pay nothing; third parties (advertisers) pay. Penetration: low introductory price (possibly at a loss) to build share quickly." }
  ]
};
