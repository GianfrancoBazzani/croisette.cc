---
name: fire-calculator
description: Calculate the user's path to Financial Independence and Retiring Early (FIRE) using Ondo Finance assets. Use this skill when users mention FIRE, financial independence, early retirement, "when can I retire", "how much do I need to retire", "retirement calculator", "4% rule", "25x expenses", the Trinity study, LeanFIRE, FatFIRE, or ask questions like "how long until I'm financially free", "what's my FIRE number", or "can I retire early with my current savings". Also trigger when users want to calculate how long it takes to reach financial independence at their current savings rate.
---

# FIRE Calculator

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

FIRE — Financial Independence, Retire Early — is the goal of saving and investing aggressively enough that your investment portfolio can sustain your living expenses indefinitely, freeing you from dependence on employment income.

The core idea is not unconditionally quitting work. It's attaining the freedom to pursue meaningful activities without relying on a paycheck.

## Chatbot Interaction Flow

1. **Understand the user's motivation.** Ask: "What does financial independence mean to you? Quitting work entirely, switching to passion work, or just having the security of knowing you could?" This sets the tone.
2. **Explain the 4% rule and 25x formula** before asking for any numbers. Make sure they understand the foundation.
3. **Gather financial inputs ONE AT A TIME:**
   - "What are your current monthly expenses?" (walk through categories if needed)
   - "What would your monthly expenses be in retirement?"
   - "What's your current total invested portfolio value?"
   - "How much can you invest per month?"
   - "What's your current age?"
   - "What's your target retirement age?" (or "as soon as possible")
4. **Calculate and present the FIRE number.** Explain what it means in plain language.
5. **Run scenario analysis.** Show 2-3 what-if scenarios without being asked — this builds trust and shows the user the sensitivity of their plan.
6. **Challenge unrealistic expectations.** If someone wants to FIRE in 5 years but saves 10% of a modest income, be honest: "At your current rate, FIRE would take approximately X years. Here's what it would take to reach 5 years..."
7. **Connect to portfolio allocation.** Suggest how the portfolio should evolve from accumulation → transition → withdrawal phase.
8. **Summarize and get confirmation.**
9. **Output the JSON.**

## The Two Fundamental Rules

### Rule 1: The 4% Rule (Trinity Study)
If you withdraw 4% of your investment portfolio in the first year of retirement and adjust that amount for inflation each year, your savings have a high likelihood of lasting for a 30-year retirement period.

This comes from the Trinity study, which analyzed historical market returns and found that a 4% initial withdrawal rate had a very high success rate across nearly all 30-year periods in US market history.

### Rule 2: The 25x Formula
Flip the 4% rule around: you need **25 times your annual expenses** saved and invested to be financially independent.

- Annual expenses of $30,000 → FIRE number = $750,000
- Annual expenses of $50,000 → FIRE number = $1,250,000
- Annual expenses of $80,000 → FIRE number = $2,000,000

This is your FIRE number — the portfolio value at which you can stop working.

## FIRE Variants

### LeanFIRE
- Annual expenses: $20,000–$40,000
- FIRE number: $500,000–$1,000,000
- Lifestyle: Minimal, frugal, often in low cost-of-living areas
- Reachable faster but requires significant lifestyle constraints

### Regular FIRE
- Annual expenses: $40,000–$80,000
- FIRE number: $1,000,000–$2,000,000
- Lifestyle: Comfortable middle-class standard of living
- The most common target

### FatFIRE
- Annual expenses: $80,000–$200,000+
- FIRE number: $2,000,000–$5,000,000+
- Lifestyle: Premium living, travel, no compromises
- Takes longer but provides maximum comfort and buffer

## FIRE Calculator: Required Inputs

Gather these from the user:

### Personal Information
1. **Current age**
2. **Target retirement age** (or "as soon as possible")

### Financial Snapshot
3. **Monthly expenses (current)** — rent, food, utilities, insurance, transport, everything
4. **Expected monthly expenses in retirement** (may be lower or higher than current)
5. **Current total invested portfolio value** (across all accounts)
6. **Monthly amount available to invest**

### Assumptions
7. **Expected annual return** — suggest 5% as a conservative inflation-adjusted default
   - Conservative: 4% (heavy cash/bIB01 allocation)
   - Moderate: 5-6% (balanced allocation)
   - Aggressive: 7-8% (heavy equity/OGM ETF allocation)
   - Important: Crypto portfolios have higher potential returns but also higher volatility and risk. Use conservative estimates.

## FIRE Calculations

### Core Calculation
```
FIRE Number = Annual Retirement Expenses × 25
Gap = FIRE Number - Current Portfolio Value
Years to FIRE = calculated using compound growth formula with monthly contributions
Monthly Investment Needed = calculated to reach FIRE Number by target age
```

### Compound Growth Formula
Future Value = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

Where:
- PV = current portfolio value
- r = monthly rate of return (annual rate / 12)
- n = number of months
- PMT = monthly contribution

Solve for n (months to FIRE) or PMT (required monthly contribution).

### FIRE Progress
- **Percentage complete:** (Current Portfolio / FIRE Number) × 100
- **Estimated years remaining**
- **Coast FIRE age:** The age at which your current portfolio, if left to grow with zero additional contributions, would reach your FIRE number by age 65. If you've hit Coast FIRE, you only need to earn enough to cover current expenses — no more saving required.

## Mapping FIRE to Ondo Assets

### Accumulation Phase (Building to FIRE Number)
Prioritize growth while maintaining stability:
- 60-70% OGM tokenized ETFs (growth engine)
- 20-30% bIB01 (cash — stable ballast)
- 10% USDY (accessible reserve)

Use DCA or value averaging to build systematically.

### Transition Phase (5 years before FIRE)
Gradually shift toward capital preservation:
- 40-50% OGM tokenized ETFs
- 30-40% bIB01 (cash)
- 20% USDY

Reduce risk as you approach the withdrawal phase.

### Withdrawal Phase (Living off your portfolio)
Prioritize income and stability:
- 30-40% OGM tokenized ETFs (maintain some growth to outpace inflation)
- 30-40% bIB01 (cash)
- 20-30% USDY (immediate liquidity for living expenses)

Withdraw from USDY first, replenish from bIB01/bCSPX during rebalancing.

## Scenario Modeling

Present these scenarios to help the user understand sensitivity:

### "What if I save 10% more per month?"
Recalculate years to FIRE. Often, a modest increase in savings rate dramatically reduces the timeline. Show the difference.

### "What if returns are only 3% instead of 5%?"
Stress test with lower returns. This is especially important for crypto portfolios where volatility can reduce effective returns.

### "What if my expenses increase 20%?"
Lifestyle creep is the biggest FIRE killer. Show how a $10,000/year increase in expenses adds $250,000 to the FIRE number and potentially years to the timeline.

### "What if there's a major crash midway?"
Model a 40% drop at the halfway point. Show recovery time based on historical data. The key message: crashes delay FIRE but don't prevent it if you stay invested and keep contributing.

## Benefits and Challenges of FIRE

### Benefits
- **Freedom** to make choices based on personal values, not financial constraints
- **Time** to pursue passions, spend with loved ones, explore new paths
- **Reduced stress** from knowing your basic needs are permanently covered
- **Autonomy** over your schedule and life direction

### Challenges (Be Honest with Users)
- **Years of discipline** — strict budgeting, aggressive saving, deferred gratification
- **Market risk** — downturns can delay the timeline, especially in crypto
- **Loss of purpose** — many people derive identity and social connections from work. Plan for this.
- **Healthcare costs** — retiring early may mean decades without employer-provided insurance
- **Longevity risk** — the 4% rule is tested for 30 years. Retiring at 35 means potentially 50+ years of withdrawals. Consider a 3.5% or 3% rate for very early retirement.
- **Crypto-specific risk** — smart contract failures, regulatory changes, and extreme volatility add risk layers that don't exist in TradFi FIRE planning

## Output Format

After running the FIRE calculations and getting user confirmation, provide:

1. **Plain-language summary** of FIRE number, years to FIRE, and key scenarios
2. **JSON output** following the standardized format:

```json
{
  "investment": [
    { "asset_class": "stocks", "chain_id": 1, "allocation_percentage": 50, "risk": "medium" },
    { "asset_class": "cash", "chain_id": 1, "allocation_percentage": 15, "risk": "low" },
    { "asset_class": "crypto_blue_chip", "chain_id": 1, "allocation_percentage": 35, "risk": "high" }
  ],
  "emergency_reserve": {
    "target_amount": 24000,
    "current_amount": 24000,
    "monthly_contribution": 0,
    "months_to_complete": 0,
    "assets": [
      { "asset_class": "stable_yield", "chain_id": 1, "allocation_percentage": 100, "risk": "very_low" }
    ]
  },
  "strategy": {
    "type": "DCA",
    "frequency": "monthly",
    "monthly_amount": 2000,
    "effort_level": "low"
  },
  "risk_profile": "growth",
  "fire": {
    "fire_number": 1250000,
    "fire_variant": "regular",
    "annual_expenses_retirement": 50000,
    "current_portfolio": 150000,
    "years_to_fire": 15,
    "monthly_investment_needed": 2000,
    "coast_fire_age": 42,
    "withdrawal_rate": 0.04
  }
}
```

3. **Honest assessment** — is the timeline realistic given their income and expenses?
