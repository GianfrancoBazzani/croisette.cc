---
name: cash-emergency-fund
description: Help users design and build a proper cash emergency fund using yield-bearing stablecoins (USDY/rUSDY) on Ondo Finance before they start investing. Use this skill when users ask about emergency funds, safety nets, "how much cash should I keep", "should I have savings before investing", rainy day fund, cash reserves, or when portfolio allocation reveals they don't have an emergency fund. Also trigger when users ask about keeping money safe, liquid savings, or how to protect against unexpected expenses. This skill should be used BEFORE any investment strategy — never let a user invest without an emergency fund.
---

# Cash Emergency Fund Designer

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

An emergency fund is money set aside to cover unexpected expenses or income loss — and it's the single most important financial foundation. Without it, any market downturn could force you to sell investments at a loss just to pay rent.

## Chatbot Interaction Flow

1. **Explain why this comes first.** If the user wants to skip to investing, push back: "I understand you're eager to invest, but without an emergency fund, a single unexpected expense could force you to sell investments at a loss. Let's build your safety net first — it won't take long."
2. **Gather expenses ONE CATEGORY AT A TIME.** Don't ask for "total monthly expenses" — walk through each category: rent, food, utilities, insurance, transport, debt payments, subscriptions, healthcare. This helps users not forget things.
3. **Ask about employment stability.** "How would you describe your income? Stable salary, freelance/variable, or currently between jobs?" This determines the number of months.
4. **Ask about existing savings.** "Do you have any savings already set aside for emergencies? How much?"
5. **Challenge if needed.** If the user says "I don't need an emergency fund" or "I'll just sell investments if something happens", explain why that's risky.
6. **Present the calculation** — target amount, gap, monthly contribution plan.
7. **Recommend the asset** — explain why USDY or rUSDY, and the difference between them.
8. **Summarize the plan** in plain language.
9. **Get confirmation** before generating the JSON.
10. **Output the JSON** and transition to portfolio-allocation skill.

The rule from experienced investors: **your money reserve should last at least 6 months before you have to touch your stocks.**

## Why You Need an Emergency Fund BEFORE Investing

Investing without an emergency fund is like building a house without a foundation:

1. **Forced selling at the worst time:** If you lose your job during a market crash, you'll need to sell investments at a loss to cover expenses
2. **Emotional pressure:** Knowing you have no safety net makes every market dip feel like an emergency
3. **Compounding interruption:** Every time you withdraw from investments to cover emergencies, you reset the compounding clock

Inflation erodes uninvested cash — $50,000 in a savings account becomes roughly $30,000 in purchasing power over 20 years at 2% inflation. But the solution isn't to invest your emergency fund in volatile assets. It's to park it in yield-bearing stablecoins that maintain purchasing power.

## How Much Do You Need?

### Inputs to Gather from the User

**Monthly essential expenses:**
- Rent/mortgage
- Food and groceries
- Utilities (electricity, water, internet, phone)
- Insurance (health, home, car)
- Transport (fuel, public transit, car payments)
- Minimum debt payments
- Any other non-negotiable recurring costs

**Monthly important but non-essential expenses:**
- Subscriptions
- Healthcare (regular medications, checkups)
- Pet care
- Childcare

**Total monthly expenses** = essentials + important non-essentials

### How Many Months to Save

| Employment Situation | Recommended Months | Reasoning |
|---|---|---|
| **Stable salaried job** | 3-6 months | Regular paycheck, likely severance if laid off |
| **Variable income / freelancer** | 6-9 months | Income fluctuates, no guaranteed next paycheck |
| **Between jobs** | 9-12 months | Need maximum runway while job searching |
| **Single income with dependents** | 9-12 months | Others rely on your income, higher stakes |
| **Dual income household, no dependents** | 3-4 months | Partner's income provides backup |

### The Calculation

```
Target Emergency Fund = Monthly Expenses × Recommended Months
Current Savings = [ask user]
Gap = Target - Current Savings
```

## Where to Park Your Emergency Fund: Ondo Assets

An emergency fund has three requirements: **safe, liquid, and inflation-resistant.** Here's how Ondo assets fit:

### Primary Recommendation: USDY
- **What it is:** Yield-bearing stablecoin backed by US Treasuries and bank deposits
- **Why it works:** Earns daily interest while maintaining stability — your emergency fund grows instead of shrinking to inflation
- **Liquidity:** Accessible anytime
- **Risk:** Very low — backed by US government securities

### Alternative: rUSDY (Rebasing)
- **What it is:** Same backing as USDY, but the token price stays at $1 while your balance increases
- **Why some prefer it:** The $1 price makes it easier to mentally track how much you have. If your emergency fund target is $15,000, you can see exactly 15,000 rUSDY in your wallet.

### What NOT to Use for Emergency Funds

| Asset | Why Not |
|---|---|
| **OGM tokenized ETFs/stocks** | Too volatile — could be down 30% when you need the money |
| **bIB01** | Less immediately liquid than USDY, designed for longer-term holding |
| **Volatile crypto (BTC, ETH, etc.)** | Far too volatile — could lose half its value overnight |
| **Regular stablecoins (USDC, USDT)** | Safe and liquid, but earn zero yield — inflation still erodes them |

USDY gives you the safety and liquidity of a stablecoin PLUS the yield to fight inflation. It's the best of both worlds for emergency funds.

## Building the Emergency Fund: The Plan

### If Starting from Zero

1. **Pause all investing** until the emergency fund is at least 50% funded
2. Direct all available savings to USDY
3. Once 50% funded, split new savings: 60% to emergency fund, 40% to investments
4. Once fully funded, redirect 100% of savings to investments

### If Partially Funded

1. Calculate the gap
2. Determine monthly contribution needed to fill it within a target timeframe
3. Split contributions: majority to emergency fund, minority to investments
4. Once filled, redirect entirely to investments

### If Already Funded

1. Verify the fund is in a yield-bearing asset (USDY/rUSDY)
2. Check that the amount still covers the recommended months (expenses may have changed)
3. Proceed to portfolio allocation and investment strategy skills

## Monthly Contribution Calculation

```
Gap = Target Emergency Fund - Current Savings
Target Months to Complete = 6-12 months (suggest based on urgency)
Monthly Contribution = Gap ÷ Target Months to Complete
```

Example:
- Monthly expenses: $3,000
- Recommended: 6 months = $18,000 target
- Current savings: $5,000
- Gap: $13,000
- Target to complete in 10 months: $1,300/month to USDY

## Important Reminders

- **Don't touch the emergency fund for investments.** No matter how good an opportunity looks, the emergency fund is off-limits. Its purpose is to be there when everything goes wrong.
- **Replenish after using it.** If you dip into the fund for a genuine emergency, pause investing and refill it before resuming.
- **Review annually.** Expenses change. If your rent increased or you added a dependent, recalculate.
- **Keep it separate.** Use a different wallet or clearly label this allocation. Mixing emergency funds with investment capital leads to confusion and temptation.

## Output Format

After calculating the emergency fund and getting user confirmation, provide:

1. **Plain-language summary** of the emergency fund plan
2. **JSON output** following the standardized format:

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

Note: The `investment` array is empty if the user hasn't yet designed their portfolio. It will be populated when they progress to the portfolio-allocation skill.

3. **Next steps** — once the fund is complete or building, route to Portfolio Allocation skill
