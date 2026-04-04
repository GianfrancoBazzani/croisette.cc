---
name: dca-strategy
description: Teach users the Dollar-Cost Averaging (DCA) investment strategy and help them configure a personalized DCA plan with frequency, amount, and effort level using Ondo Finance assets. Use this skill when users ask about DCA, dollar-cost averaging, recurring investments, automatic investing, investing monthly, regular buying schedule, "how often should I invest", "how much should I invest each month", or want to set up a systematic investment plan. Also trigger when users want to compare DCA with other strategies or ask "what's the best way to invest regularly".
---

# Investment Strategy: Dollar-Cost Averaging (DCA)

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

Dollar-cost averaging is the strategy of investing a fixed amount of money at regular intervals, regardless of what the market is doing. It's the most recommended approach for beginners and the backbone of most long-term wealth building.

## Chatbot Interaction Flow

1. **Confirm prerequisites.** Check that the user has: (a) an emergency fund (route to cash-emergency-fund if not), (b) a portfolio allocation defined (route to portfolio-allocation if not).
2. **Ask about income.** "What is your monthly income after taxes?"
3. **Ask about available savings.** "How much of that can you consistently set aside for investing each month?" If they're unsure, suggest the 20% baseline and work from there.
4. **Ask about frequency preference.** Explain the trade-offs between weekly, biweekly, and monthly, then ask which they prefer.
5. **Ask about effort level.** "How hands-on do you want to be? Set-and-forget, occasional check-ins, or active management?"
6. **Calculate the DCA plan** using their allocation from the portfolio-allocation skill.
7. **Present the plan** with specific amounts per asset per period.
8. **Answer any questions** — "what if I miss a month?", "should I increase over time?", etc.
9. **Summarize the complete plan** in plain language.
10. **Get confirmation** and output the JSON.

## How DCA Works

Instead of trying to pick the perfect moment to invest (which even professionals fail at), you invest the same amount on a fixed schedule — weekly, biweekly, or monthly. This means:

- **When prices drop**, your fixed amount buys more shares/tokens
- **When prices rise**, your fixed amount buys fewer shares/tokens
- **Over time**, this averages out your cost and protects you from the mistake of putting all your money in at a bad moment

### The Math in Action

Consider investing $50 biweekly into an index fund over 10 pay periods:

Using DCA: $500 total invested → 47.71 shares at an average price of $10.48
Using lump sum at period 4: $500 → 45.45 shares at $11.00 per share

DCA resulted in more shares at a lower average price because it automatically bought more when prices were lower.

## Why DCA Works Psychologically

DCA removes the two biggest enemies of the investor:

1. **Emotions:** You don't have to decide whether "now is a good time" — you invest regardless
2. **Market timing:** Nobody can consistently predict market movements. DCA accepts this reality and turns it into an advantage

As Burton Malkiel noted: investing equal dollar amounts at regular intervals reduces (but doesn't avoid) the risks by ensuring your entire portfolio won't be purchased at temporarily inflated prices.

## Configuring a DCA Plan

### Step 1: Determine Your Investment Amount

The baseline recommendation is **20% of your income** dedicated to saving and investing. However, this needs to be adjusted:

- **Emergency fund not complete?** Split contributions between emergency fund (USDY) and investing until the fund is filled
- **High expenses or debt?** Start with whatever percentage you can sustain — even 5% is better than 0%
- **Already have emergency fund?** Direct the full savings amount to your investment portfolio

Ask the user: "What is your monthly income, and what percentage can you commit to investing consistently?"

### Step 2: Choose Your Frequency

| Frequency | Best For | Trade-off |
|---|---|---|
| **Weekly** | Maximizes averaging effect, smoothest cost basis | Higher gas fees (more transactions), more effort |
| **Biweekly** | Aligns with many pay schedules | Good balance of averaging and cost |
| **Monthly** | Simplest to manage, lowest transaction costs | Less averaging benefit, but still effective |

For most users investing in Ondo assets, **monthly** is the sweet spot — frequent enough to benefit from averaging, infrequent enough to keep gas and swap fees low.

### Step 3: Choose Your Target Assets

The user's DCA should go into the assets defined by their portfolio allocation (from the Portfolio Allocation skill). For example, if their allocation is:
- 50% OGM tokenized ETFs
- 30% bIB01 (cash)
- 20% USDY

Then a $1,000/month DCA would mean:
- $500/month into OGM tokenized ETFs
- $300/month into bIB01 (cash)
- $200/month into USDY

### Step 4: Set Your Effort Level

| Effort Level | Description | Who It's For |
|---|---|---|
| **Low effort** | Monthly auto-DCA into 1-2 assets. Set and forget. Review once a year. | Beginners, busy people, "boring investing" believers |
| **Medium effort** | Biweekly into 2-3 assets. Manual review quarterly. Adjust DCA amounts if allocation drifts. | Intermediate investors who want some engagement |
| **High effort** | Weekly into multiple assets. Monthly rebalancing checks. Active monitoring of allocation drift. | Engaged investors comfortable with regular portfolio management |

Recommend low effort as the default. The whole point of DCA is that it runs on autopilot.

## On-Chain DCA Tools

In DeFi, you don't need a brokerage's auto-invest feature. These protocols automate DCA on-chain:

- **Mean Finance** — Set up recurring swaps at your chosen frequency
- **DCA.xyz** — Automated dollar-cost averaging protocol
- **Gnosis Safe modules** — Programmable scheduled transactions for more advanced users

Alternatively, users can set calendar reminders and manually execute swaps on DEXs (Jupiter, 1inch) at their chosen interval. This is more effort but gives full control.

## When DCA Is the Right Choice

- You have a **regular income** and can invest a fixed amount consistently
- You're a **beginner** and want the simplest approach
- You want to **remove emotion** from investing decisions
- You're investing in **volatile markets** (crypto is inherently volatile)
- You don't have a large lump sum to deploy

## When DCA May NOT Be Optimal

- You have a **large sum ready to invest** (lump sum beats DCA ~66% of the time — see Lump Sum Strategy skill)
- Markets are in a **clear sustained uptrend** (DCA means missing some gains while waiting)
- You're an experienced investor comfortable with **value averaging** (which can produce slightly better returns — see Value Averaging Strategy skill)

## DCA vs. Other Strategies: Quick Comparison

| Strategy | Expected Return | Effort | Best For |
|---|---|---|---|
| **DCA** | Good | Low | Beginners, regular income, set-and-forget |
| **Lump Sum** | Higher (~66% of the time) | One-time | Users with capital ready to deploy |
| **Value Averaging** | Slightly better than DCA | Medium-High | Engaged users who want to optimize |

## Output Format

After configuring the DCA plan and getting user confirmation, provide:

1. **Plain-language summary** of the complete DCA plan
2. **JSON output** following the standardized format:

```json
{
  "investment": [
    { "asset_class": "stocks", "chain_id": 1, "allocation_percentage": 50, "risk": "medium" },
    { "asset_class": "cash", "chain_id": 1, "allocation_percentage": 20, "risk": "low" },
    { "asset_class": "crypto_blue_chip", "chain_id": 1, "allocation_percentage": 30, "risk": "high" }
  ],
  "emergency_reserve": {
    "target_amount": 18000,
    "current_amount": 18000,
    "monthly_contribution": 0,
    "months_to_complete": 0,
    "assets": [
      { "asset_class": "stable_yield", "chain_id": 1, "allocation_percentage": 100, "risk": "very_low" }
    ]
  },
  "strategy": {
    "type": "DCA",
    "frequency": "monthly",
    "monthly_amount": 1000,
    "effort_level": "low",
    "per_asset_amount": {
      "OGM_TOKENIZED_ETF": 500,
      "bIB01": 300,
      "USDY": 200
    }
  },
  "risk_profile": "balanced"
}
```

3. **Reminder:** DCA works best when you stick to the plan through ups AND downs
