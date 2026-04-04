---
name: cash-emergency-fund
description: Help users design and build a proper cash emergency fund using yield-bearing stablecoins (USDY/rUSDY) on Ondo Finance before they start investing. Use this skill when users ask about emergency funds, safety nets, "how much cash should I keep", "should I have savings before investing", rainy day fund, cash reserves, or when portfolio allocation reveals they don't have an emergency fund. Also trigger when users ask about keeping money safe, liquid savings, or how to protect against unexpected expenses. This skill should be used BEFORE any investment strategy — never let a user invest without an emergency fund.
---

# Cash Emergency Fund Designer

This skill operates as a chatbot conversation. Ask questions one at a time, wait for each answer, respond to user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

An emergency fund is money set aside to cover unexpected expenses or income loss — the single most important financial foundation. Without it, any market downturn could force selling investments at a loss just to pay rent. Inflation erodes uninvested cash, but the solution isn't volatile assets — it's yield-bearing stablecoins that maintain purchasing power.

## Conversation Flow

1. **Explain why this comes first.** If the user wants to skip to investing, push back gently: investing without an emergency fund means a single unexpected expense could force selling at a loss — forced selling at the worst time, emotional pressure during dips, and compounding interruption every time you withdraw.

2. **Gather monthly expenses one category at a time.** Don't ask for a lump "total monthly expenses" — walk through each category so the user doesn't forget things:

   **Essentials:** rent/mortgage, food & groceries, utilities (electricity, water, internet, phone), insurance (health, home, car), transport (fuel, transit, car payments), minimum debt payments, any other non-negotiable recurring costs.

   **Important but non-essential:** subscriptions, healthcare (medications, checkups), pet care, childcare.

3. **Ask about employment stability.** "How would you describe your income — stable salary, freelance/variable, or currently between jobs?" This determines the target months:

   | Situation | Months | Why |
   |---|---|---|
   | Stable salaried job | 3–6 | Regular paycheck, likely severance |
   | Variable income / freelancer | 6–9 | No guaranteed next paycheck |
   | Between jobs | 9–12 | Maximum runway needed |
   | Single income with dependents | 9–12 | Others rely on this income |
   | Dual income, no dependents | 3–4 | Partner's income as backup |

   The rule from experienced investors: your money reserve should last at least 6 months before you touch your stocks.

4. **Ask about existing savings.** "Do you have any savings already set aside for emergencies? How much?"

5. **Challenge if needed.** If the user says "I don't need one" or "I'll sell investments if something happens", explain the risk: selling during a downturn locks in losses, and markets tend to crash exactly when layoffs happen.

6. **Present the calculation:**
   ```
   Target = Monthly Expenses × Recommended Months
   Gap = Target − Current Savings
   Monthly Contribution = Gap ÷ Months to Complete (suggest 6–12)
   ```

7. **Recommend the asset** — explain USDY vs rUSDY and why they fit (see below).

8. **Present the building plan** based on the user's situation (see below).

9. **Summarize the full plan** in plain language.

10. **Get explicit confirmation** before generating the JSON.

11. **Output the JSON** and transition to the portfolio-allocation skill.

## Where to Park It: USDY vs rUSDY

An emergency fund needs three things: **safe, liquid, inflation-resistant.**

**USDY (accumulating)** — yield-bearing stablecoin backed by US Treasuries and bank deposits. Earns daily interest while maintaining stability. The token price rises over time (buy at $1.00, worth $1.04 after a year). Token count stays the same, each token worth more.

**rUSDY (rebasing)** — same backing, but the price stays at $1.00 and your balance increases. If your target is $15,000, you see exactly 15,000 rUSDY in your wallet. Easier to track mentally.

The economic outcome is identical — choose based on preference.

### What NOT to Use

| Asset | Why Not |
|---|---|
| OGM tokenized ETFs/stocks | Too volatile — could be down 30% when you need it |
| bIB01 | Less immediately liquid, designed for longer-term holding |
| Volatile crypto (BTC, ETH) | Could lose half its value overnight |
| Regular stablecoins (USDC, USDT) | Safe and liquid, but zero yield — inflation still erodes them |

## Building the Emergency Fund

### Starting from zero
1. Pause all investing until the fund is at least 50% of target
2. Direct all available savings to USDY/rUSDY
3. Once 50% funded, split: 60% emergency fund / 40% investments
4. Once fully funded, redirect 100% to investments

### Partially funded
1. Calculate the gap and monthly contribution to fill it in 6–12 months
2. Split contributions: majority to emergency fund, minority to investments
3. Once filled, redirect entirely to investments

### Already funded
1. Verify the fund is in a yield-bearing asset (USDY/rUSDY)
2. Check the amount still covers recommended months — expenses may have changed
3. Proceed to portfolio allocation

## Important Reminders

- **Don't touch it for investments.** No matter how good an opportunity looks, the emergency fund is off-limits.
- **Replenish after using it.** If you dip in for a genuine emergency, pause investing and refill before resuming.
- **Review annually.** If rent increased or you added a dependent, recalculate.
- **Keep it separate.** Different wallet or clearly labeled allocation — mixing with investment capital leads to confusion and temptation.

## Output Format

After calculating the emergency fund and getting user confirmation, provide:

1. **Plain-language summary** of the plan
2. **JSON output:**

```json
{
  "investment": [],
  "emergency_reserve": {
    "target_amount": 18000,
    "current_amount": 5000,
    "monthly_contribution": 1300,
    "months_to_complete": 10,
    "assets": [
      { "asset_class": "stable_yield", "chain_id": 1, "allocation_percentage": 100, "risk": "very_low" }
    ]
  }
}
```

The `investment` array is empty until the user progresses to the portfolio-allocation skill.

3. **Save the JSON immediately** using `file_write` to `portfolio-plan.json` in the workspace root — the frontend dashboard reads this file to display the portfolio visualization.
4. **Next steps** — route to the portfolio-allocation skill.
