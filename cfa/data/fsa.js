window.CFA_DATA = window.CFA_DATA || {};
window.CFA_DATA["fsa"] = {
  name: "Financial Statement Analysis",
  weight: "11–14%",
  sections: [
    "Introduction to Financial Statement Analysis",
    "Analyzing Income Statements",
    "Analyzing Balance Sheets",
    "Analyzing Statements of Cash Flows I",
    "Analyzing Statements of Cash Flows II",
    "Analysis of Inventories",
    "Analysis of Long-Term Assets",
    "Topics in Long-Term Liabilities and Equity",
    "Analysis of Income Taxes",
    "Financial Reporting Quality",
    "Financial Analysis Techniques",
    "Introduction to Financial Statement Modeling"
  ],
  questions: [
    {
      id: "fsa-q1",
      section: "Introduction",
      q: "An auditor concludes that a company's financial statements are fairly presented except for a single material departure from IFRS that is confined to identifiable accounts. The auditor most likely issues a(n):",
      choices: ["adverse opinion", "qualified opinion", "disclaimer of opinion"],
      answer: 1,
      expl: "A material but not pervasive departure results in a qualified (\"except for\") opinion. An adverse opinion requires misstatements that are both material and pervasive; a disclaimer means the auditor could not gather enough evidence to form any opinion."
    },
    {
      id: "fsa-q2",
      section: "Introduction",
      q: "The first step in the financial statement analysis framework is most accurately described as:",
      choices: ["collecting the company's financial statements and industry data", "articulating the purpose and context of the analysis", "processing the data into ratios and common-size statements"],
      answer: 1,
      expl: "The framework begins by defining the purpose and context (what question, for whom, with what resources). Data collection is step 2 and processing is step 3 — a common exam distractor is putting data collection first."
    },
    {
      id: "fsa-q3",
      section: "Income Statements",
      q: "Under the converged five-step revenue recognition model, revenue is recognized when (or as):",
      choices: ["cash is collected from the customer", "the contract with the customer is signed", "the entity satisfies a performance obligation by transferring control"],
      answer: 2,
      expl: "Step 5 recognizes revenue when or as each performance obligation is satisfied, i.e., when control of the good or service transfers to the customer. Accrual accounting does not wait for cash collection, and signing the contract is only step 1."
    },
    {
      id: "fsa-q4",
      section: "Income Statements",
      q: "A firm has net income of $400,000, preferred dividends of $40,000, 100,000 shares outstanding all year, and issued 20,000 new shares on 1 October. Basic EPS is closest to:",
      choices: ["$3.00", "$3.43", "$3.60"],
      answer: 1,
      expl: "Weighted-average shares = 100,000 + 20,000 × (3/12) = 105,000. Basic EPS = (400,000 − 40,000) / 105,000 = $3.43. Using 120,000 shares gives $3.00 and ignoring the new shares gives $3.60 — both are weighting errors."
    },
    {
      id: "fsa-q5",
      section: "Income Statements",
      q: "A company has 10,000 options outstanding with an exercise price of $30; the average market price of the stock during the year was $40. Under the treasury stock method, the incremental shares added to the diluted EPS denominator are closest to:",
      choices: ["2,500", "7,500", "10,000"],
      answer: 0,
      expl: "Assumed proceeds = 10,000 × $30 = $300,000, which repurchases 300,000 / 40 = 7,500 shares. Incremental shares = 10,000 − 7,500 = 2,500. Answering 7,500 (the repurchased shares) or 10,000 (gross options) are the classic mistakes."
    },
    {
      id: "fsa-q6",
      section: "Income Statements",
      q: "If including a convertible bond in the diluted EPS calculation would increase EPS above basic EPS, the security is:",
      choices: ["antidilutive and excluded from diluted EPS", "dilutive and included at half weight", "included, because diluted EPS must reflect all convertibles"],
      answer: 0,
      expl: "Securities that would increase EPS are antidilutive and are excluded. Diluted EPS can never exceed basic EPS. There is no half-weight convention."
    },
    {
      id: "fsa-q7",
      section: "Income Statements",
      q: "A component of a company that has been disposed of during the year is most likely reported:",
      choices: ["net of tax, below income from continuing operations", "pre-tax, within operating income", "as an extraordinary item below net income"],
      answer: 0,
      expl: "Discontinued operations are shown separately, net of tax, below income from continuing operations under both IFRS and US GAAP. Unusual-but-continuing items stay within continuing operations pre-tax; the \"extraordinary item\" category no longer exists under either framework."
    },
    {
      id: "fsa-q8",
      section: "Balance Sheets",
      q: "Which statement about goodwill is most accurate?",
      choices: ["Internally generated goodwill is capitalized when its value is reliably measurable", "Purchased goodwill is amortized over 10 years or less", "Purchased goodwill is not amortized but is tested for impairment"],
      answer: 2,
      expl: "Goodwill arises only from acquisitions (price paid minus fair value of identifiable net assets); it is not amortized and is tested at least annually for impairment. Internally generated goodwill is never recognized."
    },
    {
      id: "fsa-q9",
      section: "Balance Sheets",
      q: "A firm has cash $40, short-term marketable securities $60, receivables $100, inventory $150, and current liabilities $160. Its quick ratio is closest to:",
      choices: ["1.25", "2.19", "0.63"],
      answer: 0,
      expl: "Quick ratio = (40 + 60 + 100) / 160 = 200 / 160 = 1.25. Including inventory (2.19) computes the current ratio; 0.63 (100/160) wrongly drops cash and securities."
    },
    {
      id: "fsa-q10",
      section: "Balance Sheets",
      q: "Under IFRS 9, unrealized gains and losses on a debt security measured at fair value through other comprehensive income (FVOCI) are reported in:",
      choices: ["the income statement", "equity via OCI, bypassing the income statement", "the cash flow statement"],
      answer: 1,
      expl: "FVOCI securities are carried at fair value with unrealized gains/losses in OCI (accumulated in equity), analogous to available-for-sale debt under US GAAP. FVTPL securities put those changes in profit or loss."
    },
    {
      id: "fsa-q11",
      section: "Cash Flows I",
      q: "Under US GAAP, interest paid and dividends paid are classified, respectively, as:",
      choices: ["operating; financing", "financing; financing", "operating; operating"],
      answer: 0,
      expl: "US GAAP mandates interest paid in CFO and dividends paid in CFF. Under IFRS, both may be classified as either CFO or CFF — the flexibility exists only under IFRS."
    },
    {
      id: "fsa-q12",
      section: "Cash Flows I",
      q: "Net income is $100. Depreciation is $30, accounts receivable increased $20, inventory decreased $10, accounts payable increased $5, and there was a $15 gain on sale of equipment. CFO under the indirect method is closest to:",
      choices: ["$110", "$140", "$120"],
      answer: 0,
      expl: "CFO = 100 + 30 − 20 + 10 + 5 − 15 = 110. The gain must be subtracted (the proceeds belong in CFI); forgetting that gives 125–140 depending on other sign errors. Remember: operating asset up → subtract; operating liability up → add."
    },
    {
      id: "fsa-q13",
      section: "Cash Flows I",
      q: "COGS is $400, inventory increased by $25, and accounts payable increased by $10. Cash paid to suppliers is closest to:",
      choices: ["$415", "$435", "$385"],
      answer: 0,
      expl: "Purchases = COGS + increase in inventory = 400 + 25 = 425; cash paid = purchases − increase in AP = 425 − 10 = 415. Adding the AP change instead of subtracting gives 435; subtracting the inventory change gives 385 — sign discipline is the whole question."
    },
    {
      id: "fsa-q14",
      section: "Cash Flows II",
      q: "A US GAAP firm reports CFO of $250, interest expense of $40, a 30% tax rate, and capital expenditures of $100. FCFF is closest to:",
      choices: ["$178", "$190", "$150"],
      answer: 0,
      expl: "FCFF = CFO + interest × (1 − t) − FCInv = 250 + 40 × 0.70 − 100 = 250 + 28 − 100 = 178. Adding back the full $40 of interest (giving 190) ignores the tax shield; 150 forgets the interest add-back entirely."
    },
    {
      id: "fsa-q15",
      section: "Cash Flows II",
      q: "Using CFO of $250, capex of $100, new debt issued of $50, and debt repaid of $20, FCFE is closest to:",
      choices: ["$180", "$200", "$130"],
      answer: 0,
      expl: "FCFE = CFO − FCInv + net borrowing = 250 − 100 + (50 − 20) = 180. Using gross issuance ($50) gives 200; omitting net borrowing gives 150-ish variants. Net borrowing means issuance minus repayment."
    },
    {
      id: "fsa-q16",
      section: "Inventories",
      q: "During a period of rising prices and stable inventory quantities, compared with FIFO, a firm using LIFO most likely reports:",
      choices: ["higher net income and higher inventory", "lower COGS and lower inventory", "higher COGS and lower net income"],
      answer: 2,
      expl: "LIFO expenses the newest (most expensive) units, so COGS is higher and net income lower; ending inventory carries old, cheap costs so it is lower too. The upside: lower taxable income means lower taxes and higher CFO."
    },
    {
      id: "fsa-q17",
      section: "Inventories",
      q: "A LIFO firm reports ending inventory of $900 and a LIFO reserve of $150. Its inventory on a FIFO basis is closest to:",
      choices: ["$750", "$900", "$1,050"],
      answer: 2,
      expl: "FIFO inventory = LIFO inventory + LIFO reserve = 900 + 150 = 1,050. Subtracting the reserve (750) reverses the adjustment — the reserve measures how much higher FIFO inventory would be."
    },
    {
      id: "fsa-q18",
      section: "Inventories",
      q: "A LIFO firm's reserve rose from $400 to $600 during the year. Relative to LIFO, its FIFO COGS for the year is:",
      choices: ["$200 lower", "$200 higher", "$600 lower"],
      answer: 0,
      expl: "FIFO COGS = LIFO COGS − change in LIFO reserve = LIFO COGS − 200. A rising reserve means LIFO charged more to COGS than FIFO would have. Using the full ending reserve ($600) instead of the change is the standard error."
    },
    {
      id: "fsa-q19",
      section: "Inventories",
      q: "Regarding inventory writedowns, which statement is most accurate?",
      choices: ["IFRS permits reversal of a prior writedown; US GAAP does not", "US GAAP permits reversal of a prior writedown; IFRS does not", "Neither framework permits reversal of inventory writedowns"],
      answer: 0,
      expl: "IFRS carries inventory at the lower of cost or NRV and allows reversals up to the original writedown; US GAAP prohibits reversals. Also recall LIFO itself is prohibited under IFRS."
    },
    {
      id: "fsa-q20",
      section: "Inventories",
      q: "A declining LIFO reserve accompanied by a spike in gross margin most likely indicates:",
      choices: ["a LIFO liquidation producing an unsustainable boost to earnings", "an inventory writedown under lower of cost or market", "a change from LIFO to FIFO applied prospectively"],
      answer: 0,
      expl: "Selling more units than purchased dips into old low-cost LIFO layers, temporarily depressing COGS and inflating margin — a one-time, unsustainable effect analysts strip out. A writedown would compress margin, and accounting-method changes are applied retrospectively."
    },
    {
      id: "fsa-q21",
      section: "Long-Term Assets",
      q: "In the year a large cost is incurred, capitalizing it rather than expensing it most likely results in:",
      choices: ["lower net income and higher CFO", "higher net income and higher CFO", "higher net income and lower CFO"],
      answer: 1,
      expl: "Capitalizing removes the cost from the income statement (higher NI) and classifies the outflow as investing rather than operating (higher CFO, lower CFI). Total cash flow is unchanged — only classification and timing differ."
    },
    {
      id: "fsa-q22",
      section: "Long-Term Assets",
      q: "Equipment costs $90,000 with a $10,000 salvage value and a 5-year life. Under double-declining balance, year 2 depreciation is closest to:",
      choices: ["$21,600", "$36,000", "$12,960"],
      answer: 0,
      expl: "DDB rate = 2/5 = 40%, applied to beginning book value ignoring salvage. Year 1 = 0.40 × 90,000 = 36,000; year 2 = 0.40 × (90,000 − 36,000) = 21,600. Choosing 36,000 stops at year 1; 12,960 is year 3."
    },
    {
      id: "fsa-q23",
      section: "Long-Term Assets",
      q: "Under IFRS, an asset is impaired when its carrying amount exceeds its recoverable amount, defined as:",
      choices: ["the undiscounted expected future cash flows", "the higher of fair value less costs to sell and value in use", "fair value less accumulated depreciation"],
      answer: 1,
      expl: "IFRS uses a one-step test against the recoverable amount — the higher of (fair value − costs to sell) and value in use (the PV of expected cash flows). Undiscounted cash flows belong to the US GAAP step-1 recoverability screen, not IFRS."
    },
    {
      id: "fsa-q24",
      section: "Long-Term Assets",
      q: "Which action is permitted under IFRS but prohibited under US GAAP?",
      choices: ["Reporting PP&E using the revaluation model", "Testing goodwill for impairment annually", "Using the units-of-production depreciation method"],
      answer: 0,
      expl: "Only IFRS allows carrying PP&E at fair value under the revaluation model, with upward revaluations normally credited to OCI (revaluation surplus). Goodwill impairment testing and units-of-production depreciation exist under both frameworks."
    },
    {
      id: "fsa-q25",
      section: "Long-Term Liabilities and Equity",
      q: "A company issues a 3-year, $1,000,000 face value, 4% annual-pay bond priced to yield 5% (issue price $972,768). Year-1 interest expense under the effective interest method is closest to:",
      choices: ["$40,000", "$48,638", "$50,000"],
      answer: 1,
      expl: "Interest expense = carrying amount × market rate at issuance = 972,768 × 5% = 48,638. The $40,000 coupon is the cash paid, not the expense; $50,000 wrongly applies the market rate to face value."
    },
    {
      id: "fsa-q26",
      section: "Long-Term Liabilities and Equity",
      q: "For a bond issued at a discount, over the bond's life the carrying amount and annual interest expense will, respectively:",
      choices: ["rise toward face value; increase", "fall toward face value; decrease", "rise toward face value; stay constant"],
      answer: 0,
      expl: "Discount amortization adds to the carrying amount each period until it reaches face at maturity, and since expense = carrying amount × constant yield, expense grows each year and always exceeds the coupon. Premium bonds show the mirror image."
    },
    {
      id: "fsa-q27",
      section: "Long-Term Liabilities and Equity",
      q: "Under IFRS, a lessee with a 5-year equipment lease most likely reports:",
      choices: ["a single straight-line lease expense within operating expenses", "depreciation of a right-of-use asset plus interest on a lease liability", "no balance sheet recognition if the lease is classified as operating"],
      answer: 1,
      expl: "IFRS uses a single lessee model: virtually all leases (except short-term and low-value) create an ROU asset and lease liability, with depreciation plus interest expense (front-loaded). The single straight-line expense describes a US GAAP operating lease — which is still on the balance sheet."
    },
    {
      id: "fsa-q28",
      section: "Long-Term Liabilities and Equity",
      q: "In a defined contribution pension plan, the investment risk of the plan assets is borne by:",
      choices: ["the employer", "the employee", "the plan trustee"],
      answer: 1,
      expl: "In a DC plan the employer's obligation ends with the contribution; the employee owns the account and bears investment risk. In a defined benefit plan the employer promises the benefit and therefore bears the risk, reporting the plan's funded status on its balance sheet."
    },
    {
      id: "fsa-q29",
      section: "Income Taxes",
      q: "A firm uses straight-line depreciation for financial reporting and accelerated depreciation for tax. In the asset's early years this most likely creates a:",
      choices: ["deferred tax asset, because taxes payable exceed tax expense", "deferred tax liability, because taxable income is temporarily below accounting profit", "permanent difference that changes the effective tax rate"],
      answer: 1,
      expl: "Accelerated tax depreciation makes taxable income lower than accounting profit now; the difference reverses later, so taxes are deferred — a DTL. A DTA would arise from the opposite pattern (e.g., warranty accruals). Depreciation timing differences are temporary, not permanent."
    },
    {
      id: "fsa-q30",
      section: "Income Taxes",
      q: "At year-end an asset has a carrying amount of $40,000 and a tax base of $30,000. The tax rate is 30%. The deferred tax item is closest to:",
      choices: ["a $3,000 deferred tax liability", "a $3,000 deferred tax asset", "a $10,000 deferred tax liability"],
      answer: 0,
      expl: "For an asset, carrying amount greater than tax base creates a DTL = (40,000 − 30,000) × 30% = 3,000. Choosing a DTA reverses the rule; $10,000 forgets to multiply by the tax rate."
    },
    {
      id: "fsa-q31",
      section: "Income Taxes",
      q: "Under US GAAP, a company that concludes it is more likely than not that part of a deferred tax asset will not be realized should:",
      choices: ["derecognize the DTA directly", "record a valuation allowance against the DTA", "reclassify the DTA as a deferred tax liability"],
      answer: 1,
      expl: "US GAAP recognizes the full DTA and offsets doubtful amounts with a valuation allowance (increasing tax expense). Under IFRS there is no allowance account — the DTA is simply recognized only to the extent realization is probable."
    },
    {
      id: "fsa-q32",
      section: "Reporting Quality",
      q: "A firm ships excess product to distributors just before year-end to hit its revenue target, knowing much of it will be returned. This practice is best described as:",
      choices: ["channel stuffing, a form of aggressive revenue recognition", "a big bath, a form of conservative accounting", "bill-and-hold, which is always fraudulent"],
      answer: 0,
      expl: "Shipping ahead of real demand to pull revenue forward is channel stuffing — aggressive earnings management that later reverses through returns. A big bath understates current income to inflate future income. Bill-and-hold can be legitimate in narrow circumstances, though it is a warning sign."
    },
    {
      id: "fsa-q33",
      section: "Reporting Quality",
      q: "Which observation is the strongest warning sign of low-quality earnings?",
      choices: ["Net income persistently growing faster than operating cash flow", "A current ratio that declines from 2.1 to 1.9", "Depreciation lives identical to industry norms"],
      answer: 0,
      expl: "Earnings persistently outrunning CFO suggests income is being manufactured through accruals (premature revenue, under-accrued expenses). A small liquidity dip is routine, and industry-standard depreciation lives are reassuring, not alarming."
    },
    {
      id: "fsa-q34",
      section: "Analysis Techniques",
      q: "A firm has a net profit margin of 5%, asset turnover of 1.2, and financial leverage of 2.5. Its ROE is closest to:",
      choices: ["8.5%", "15.0%", "6.0%"],
      answer: 1,
      expl: "3-way DuPont: ROE = 0.05 × 1.2 × 2.5 = 0.15 = 15%. Adding the components (8.5%) or multiplying only margin and turnover (6%) are the standard distractors."
    },
    {
      id: "fsa-q35",
      section: "Analysis Techniques",
      q: "In the 5-way DuPont decomposition, a company's interest burden ratio falls from 0.95 to 0.80 while other components are unchanged. This most likely reflects:",
      choices: ["a lower effective tax rate", "higher interest expense relative to EBIT", "improved operating efficiency"],
      answer: 1,
      expl: "Interest burden = EBT/EBIT — the share of operating profit kept after interest. A decline means interest is consuming more of EBIT, typically from higher leverage or borrowing costs. Tax effects show up in the tax burden (NI/EBT), and operating efficiency in the EBIT margin or turnover."
    },
    {
      id: "fsa-q36",
      section: "Financial Statement Modeling",
      q: "An analyst forecasts a retailer's revenue by multiplying projected industry sales by the company's expected market share. This approach is best described as:",
      choices: ["bottom-up", "top-down", "hybrid"],
      answer: 1,
      expl: "Starting from the macro or market level (industry size) and working down to the firm via market share is top-down. Bottom-up builds from firm-level drivers such as price × volume or store count; a hybrid combines the two."
    },
    {
      id: "fsa-q37",
      section: "Financial Statement Modeling",
      q: "An analyst who keeps her original earnings forecast largely unchanged despite significant new negative information about the company is most likely exhibiting:",
      choices: ["conservatism (anchoring) bias", "representativeness bias", "illusion of control"],
      answer: 0,
      expl: "Conservatism/anchoring is the failure to update prior estimates adequately when new information arrives. Representativeness ignores base rates when classifying; illusion of control is overrating the accuracy gained from model complexity."
    }
  ],
  flashcards: [
    { id: "fsa-f1", front: "Four audit opinions (best to worst)", back: "Unqualified (clean) → Qualified (\"except for\" a material issue) → Adverse (materially and pervasively misstated) → Disclaimer (no opinion possible). Audits give reasonable assurance, not a guarantee." },
    { id: "fsa-f2", front: "Six steps of the FSA framework", back: "1) State purpose & context, 2) Collect data, 3) Process data, 4) Analyze/interpret, 5) Conclude & communicate, 6) Follow up." },
    { id: "fsa-f3", front: "Five-step revenue recognition model", back: "1) Identify contract, 2) Identify performance obligations, 3) Determine transaction price, 4) Allocate price to obligations, 5) Recognize revenue when/as obligations are satisfied (control transfers)." },
    { id: "fsa-f4", front: "Basic EPS formula", back: "(Net income − preferred dividends) ÷ weighted-average common shares outstanding. Splits/stock dividends applied retroactively; mid-year issues weighted by months outstanding." },
    { id: "fsa-f5", front: "Treasury stock method (diluted EPS)", back: "Incremental shares = options − (options × exercise price ÷ average market price). Dilutive only if average market price > exercise price. Diluted EPS can never exceed basic." },
    { id: "fsa-f6", front: "If-converted method", back: "Convertible bond: add back after-tax interest to numerator, add conversion shares to denominator. Convertible preferred: do NOT subtract the preferred dividend, add conversion shares. Exclude if antidilutive." },
    { id: "fsa-f7", front: "Policy change vs. estimate change vs. error", back: "Accounting policy change → retrospective restatement. Estimate change (e.g., useful life) → prospective only. Prior-period error → restate; red flag for quality." },
    { id: "fsa-f8", front: "Current / quick / cash ratios", back: "Current = CA ÷ CL. Quick = (cash + ST securities + receivables) ÷ CL (excludes inventory). Cash = (cash + ST securities) ÷ CL." },
    { id: "fsa-f9", front: "Goodwill accounting", back: "Purchase price − fair value of identifiable net assets acquired. Recognized only when purchased; never amortized; impairment-tested at least annually. Internally generated goodwill is never recognized." },
    { id: "fsa-f10", front: "IFRS 9 security categories", back: "Amortized cost (hold to collect; no unrealized G/L), FVOCI (fair value, unrealized G/L to OCI ≈ US AFS debt), FVTPL (fair value, unrealized G/L to income ≈ trading; US GAAP equities generally FVTPL)." },
    { id: "fsa-f11", front: "IFRS vs. GAAP: cash flow classification of interest & dividends", back: "US GAAP: interest paid/received and dividends received = CFO; dividends paid = CFF. IFRS choice: interest/dividends paid = CFO or CFF; interest/dividends received = CFO or CFI." },
    { id: "fsa-f12", front: "Indirect CFO adjustments", back: "NI + non-cash charges (D&A) − gains (+ losses) on investing items − increases in operating assets + increases in operating liabilities." },
    { id: "fsa-f13", front: "Cash collected from customers / cash paid to suppliers", back: "Collections = revenue − ΔAR. Purchases = COGS + ΔInventory; cash to suppliers = purchases − ΔAP (Δ = increase)." },
    { id: "fsa-f14", front: "FCFF and FCFE from CFO", back: "FCFF = CFO + interest × (1 − t) − FCInv. FCFE = CFO − FCInv + net borrowing. Add-back is AFTER-tax interest; skip it if the firm (IFRS) already classifies interest paid in CFF." },
    { id: "fsa-f15", front: "FCFF from net income", back: "FCFF = NI + non-cash charges + interest × (1 − t) − FCInv − WCInv." },
    { id: "fsa-f16", front: "LIFO vs. FIFO in rising prices", back: "LIFO: higher COGS, lower NI, lower inventory/equity, lower taxes, higher CFO, higher inventory turnover. LIFO is US GAAP only — prohibited under IFRS. Effects reverse when prices fall." },
    { id: "fsa-f17", front: "LIFO reserve conversions", back: "FIFO inventory = LIFO inventory + LIFO reserve. FIFO COGS = LIFO COGS − ΔLIFO reserve. FIFO NI ≈ LIFO NI + ΔReserve × (1 − t). FIFO retained earnings ≈ + Reserve × (1 − t)." },
    { id: "fsa-f18", front: "LIFO liquidation", back: "Selling down old cheap LIFO layers → temporarily low COGS and inflated margins; unsustainable one-time profit with a real tax cost. Signaled by a declining LIFO reserve." },
    { id: "fsa-f19", front: "Inventory writedowns: IFRS vs. GAAP", back: "IFRS: lower of cost or NRV; reversals allowed up to original writedown. US GAAP: lower of cost or NRV (FIFO/WAC) but lower of cost or market for LIFO/retail (market = replacement cost within NRV ceiling / NRV − normal profit floor); reversals prohibited." },
    { id: "fsa-f20", front: "Capitalizing vs. expensing (year 1 effects)", back: "Capitalizing → higher NI, assets, equity, CFO (outflow moved to CFI), smoother earnings; lower NI in later years via depreciation. Lifetime totals identical." },
    { id: "fsa-f21", front: "Depreciation formulas", back: "SL = (cost − salvage)/life. DDB = (2/life) × beginning book value (ignore salvage in rate; never depreciate below salvage). UOP = (cost − salvage) × output/total expected output." },
    { id: "fsa-f22", front: "Asset age estimates from disclosures", back: "Total life ≈ gross PP&E ÷ depreciation expense. Average age ≈ accumulated depreciation ÷ depreciation expense. Remaining life ≈ net PP&E ÷ depreciation expense." },
    { id: "fsa-f23", front: "Impairment: IFRS vs. US GAAP", back: "IFRS (1 step): loss = carrying − recoverable amount (higher of FV − costs to sell, value in use); reversals allowed (not goodwill). US GAAP (2 steps): screen vs. undiscounted cash flows, then loss = carrying − fair value; no reversals for held-for-use assets." },
    { id: "fsa-f24", front: "Revaluation model", back: "IFRS only. Upward revaluation → OCI (revaluation surplus), unless reversing a prior loss (then income). Downward → income, unless reversing a prior surplus (then OCI). US GAAP: cost model only." },
    { id: "fsa-f25", front: "Bond discount/premium amortization", back: "Interest expense = beginning carrying amount × market yield at issuance. Discount: expense > coupon, carrying value rises to face. Premium: expense < coupon, carrying value falls to face. Effective interest method required by IFRS." },
    { id: "fsa-f26", front: "Lessee accounting: IFRS vs. US GAAP", back: "IFRS: single model — ROU asset + lease liability for nearly all leases; depreciation + interest (front-loaded). Exemptions: ≤12 months, low value. US GAAP: dual model — finance leases like IFRS; operating leases on balance sheet but single straight-line expense, all payments in CFO." },
    { id: "fsa-f27", front: "DC vs. DB pension plans", back: "DC: employer expense = contribution; employee bears investment risk. DB: employer promises benefit and bears risk; balance sheet shows funded status = plan assets − obligation. IFRS: remeasurements to OCI, not recycled; US GAAP uses expected return on assets and may amortize OCI amounts." },
    { id: "fsa-f28", front: "Share-based compensation", back: "Measured at grant-date fair value, expensed over vesting period; non-cash (added back in CFO) but dilutive (treasury stock method). Equity-classified awards not remeasured; cash-settled awards remeasured each period." },
    { id: "fsa-f29", front: "DTL vs. DTA", back: "DTL: taxable income temporarily < accounting profit (asset carrying > tax base) — e.g., accelerated tax depreciation. DTA: the reverse — warranties, loss carryforwards. Tax expense = taxes payable + ΔDTL − ΔDTA. Deferred item = (carrying − tax base) × rate." },
    { id: "fsa-f30", front: "Valuation allowance & permanent differences", back: "US GAAP: valuation allowance offsets a DTA when realization more-likely-than-not fails; IFRS recognizes DTA directly only if probable. Permanent differences (tax-exempt interest, fines) create no deferred taxes — they move the effective rate away from the statutory rate." },
    { id: "fsa-f31", front: "Financial reporting quality spectrum", back: "1) Compliant + decision-useful + sustainable returns, 2) compliant but low earnings quality, 3) compliant but biased choices (earnings management), 4) non-compliant, 5) fraudulent. Reporting quality ≠ earnings quality." },
    { id: "fsa-f32", front: "Earnings-management warning signs", back: "Receivables growing faster than revenue; NI outrunning CFO; Q4 surges; heavy non-GAAP emphasis; rising capitalization or long depreciation lives vs. peers; related-party deals; auditor changes; big baths and cookie-jar reserves." },
    { id: "fsa-f33", front: "DuPont: 3-way and 5-way", back: "3-way: ROE = net margin × asset turnover × leverage (avg assets/avg equity). 5-way: ROE = (NI/EBT) × (EBT/EBIT) × (EBIT/revenue) × turnover × leverage = tax burden × interest burden × EBIT margin × turnover × leverage." },
    { id: "fsa-f34", front: "Cash conversion cycle", back: "CCC = days of inventory on hand (365 ÷ inventory turnover) + days sales outstanding (365 ÷ receivables turnover) − days payable (365 ÷ payables turnover). Shorter = less cash tied up." },
    { id: "fsa-f35", front: "Forecasting approaches & biases", back: "Revenue: top-down (market × share), bottom-up (price × volume), hybrid. Biases: overconfidence (narrow ranges), conservatism/anchoring (slow updates), representativeness (ignore base rates), illusion of control (complexity ≠ accuracy), confirmation. Scenario analysis moves correlated inputs together." }
  ]
};
