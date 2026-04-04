---
name: fire-calculator
description: Calculate the user's path to Financial Independence and Retiring Early (FIRE) using Ondo Finance assets. Use this skill when users mention FIRE, financial independence, early retirement, "when can I retire", "how much do I need to retire", "retirement calculator", "4% rule", "25x expenses", the Trinity study, LeanFIRE, FatFIRE, or ask questions like "how long until I'm financially free", "what's my FIRE number", or "can I retire early with my current savings". Also trigger when users want to calculate how long it takes to reach financial independence at their current savings rate.
---

# FIRE Calculator

This skill operates as a chatbot conversation. Ask questions one at a time, wait for each answer, respond to user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

FIRE — Financial Independence, Retire Early — is saving and investing aggressively enough that your portfolio can sustain your living expenses indefinitely, freeing you from dependence on employment income. The core idea isn't unconditionally quitting work — it's attaining the freedom to pursue meaningful activities without relying on a paycheck.

## The Two Fundamental Rules

### The 4% Rule (Trinity Study)
Withdraw 4% of your portfolio in the first year of retirement, adjust for inflation each year, and your savings have a high likelihood of lasting 30 years. This comes from the Trinity study analyzing historical US market returns.

For very early retirement (age 35–40), consider a more conservative 3–3.5% rate — you may need 50+ years of withdrawals, not 30.

### The 25x Formula
Flip the 4% rule: you need **25 times your annual expenses** invested to be financially independent.

- $30,000/year → FIRE number = $750,000
- $50,000/year → FIRE number = $1,250,000
- $80,000/year → FIRE number = $2,000,000

## Conversation Flow

1. **Understand the user's motivation.** Ask: "What does financial independence mean to you — quitting work entirely, switching to passion work, or just having the security of knowing you could?" This sets the tone and helps determine their FIRE variant.

2. **Explain the 4% rule and 25x formula** before asking for numbers — make sure they understand the foundation.

3. **Gather financial inputs one at a time:**
   - "What are your current monthly expenses?" (walk through categories if needed)
   - "What would your monthly expenses be in retirement?" (may differ from current)
   - "What's your current total invested portfolio value?"
   - "How much can you invest per month?"
   - "What's your current age?"
   - "What's your target retirement age?" (or "as soon as possible")

4. **Determine the expected return assumption** based on their risk tolerance:
   - Conservative (4%): heavy cash/bIB01 allocation
   - Moderate (5–6%): balanced allocation
   - Aggressive (7–8%): heavy equity/OGM ETF allocation
   - Crypto portfolios have higher potential but also higher volatility — use conservative estimates.

5. **Calculate and present the FIRE number.** Explain it in plain language. Include:
   - FIRE number (annual retirement expenses × 25)
   - Gap (FIRE number − current portfolio)
   - Years to FIRE (using compound growth with monthly contributions)
   - Monthly investment needed to hit target age
   - FIRE progress percentage
   - Coast FIRE age — the age at which your current portfolio, growing with zero contributions, reaches your FIRE number by 65

6. **Run 2–3 what-if scenarios** without being asked — this builds trust and shows sensitivity:
   - "What if you save 10% more per month?" (often dramatically reduces timeline)
   - "What if returns are only 3%?" (stress test)
   - "What if expenses increase 20%?" (lifestyle creep adds $250k per $10k/year increase)

7. **Challenge unrealistic expectations.** If someone wants FIRE in 5 years but saves 10% of a modest income, be direct: "At your current rate, FIRE would take ~X years. Here's what it would take to hit 5 years..."

8. **Connect to portfolio allocation** — suggest how the portfolio should evolve across phases:

   | Phase | Stocks (OGM ETFs) | Cash (bIB01) | Yield (USDY) |
   |---|---|---|---|
   | Accumulation | 60–70% | 20–30% | 10% |
   | Transition (5yr before FIRE) | 40–50% | 30–40% | 20% |
   | Withdrawal | 30–40% | 30–40% | 20–30% |

   In withdrawal, draw from USDY first and replenish from bIB01/bCSPX during rebalancing.

9. **Summarize and get explicit confirmation** before generating JSON.

10. **Output the JSON.**

## FIRE Variants

| Variant | Annual Expenses | FIRE Number | Lifestyle |
|---|---|---|---|
| LeanFIRE | $20k–$40k | $500k–$1M | Minimal, frugal, often LCOL areas |
| Regular FIRE | $40k–$80k | $1M–$2M | Comfortable middle-class |
| FatFIRE | $80k–$200k+ | $2M–$5M+ | Premium, no compromises |

## Compound Growth Formula

```
Future Value = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
```

Where PV = current portfolio, r = monthly return (annual / 12), n = months, PMT = monthly contribution. Solve for n (months to FIRE) or PMT (required monthly contribution).

## Be Honest About the Challenges

FIRE requires years of discipline and aggressive saving. Be upfront about:
- **Market risk** — downturns delay the timeline, especially with crypto exposure
- **Loss of purpose** — many people derive identity from work; plan for this
- **Healthcare** — early retirement may mean decades without employer insurance
- **Longevity risk** — retiring at 35 means 50+ years of withdrawals; use 3–3.5% rate
- **Crypto-specific risk** — smart contract failures, regulatory changes, extreme volatility

## Output Format

After running calculations and getting user confirmation, provide:

1. **Plain-language summary** of FIRE number, years to FIRE, and key scenarios
2. **Honest assessment** — is the timeline realistic given their income and expenses?
3. **JSON output:**

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

4. **Save the JSON immediately** using `file_write` to `portfolio-plan.json` in the workspace root — the frontend dashboard reads this file to display the portfolio visualization.
5. **Next steps** — route to the appropriate strategy skill (DCA, Lump Sum, or Value Averaging) for implementation.
