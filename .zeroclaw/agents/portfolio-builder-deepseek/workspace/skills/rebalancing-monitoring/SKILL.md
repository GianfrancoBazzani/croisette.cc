---
name: rebalancing-monitoring
description: Teach users how and when to rebalance their portfolio to stay aligned with their target allocation, and which tools to use for monitoring. Use this skill when users ask about rebalancing, portfolio drift, "when should I adjust my portfolio", "how to rebalance", monitoring investments, portfolio tracking tools, Zerion, Zapper, DeBank, Ghostfolio, or when they say "my portfolio is out of balance" or "one asset grew too much". Also trigger when users are approaching their annual rebalancing check or ask about maintaining their investment plan over time.
---

# Rebalancing & Monitoring

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions about the user's current portfolio state, guide them through the rebalancing process, and output an updated JSON if the allocation needs adjustment.

Markets fluctuate differently across asset classes. Over time, your actual allocation drifts away from your target. Rebalancing means bringing it back. This is one of the most important maintenance tasks for any investor — and one of the easiest to neglect.

## Chatbot Interaction Flow

1. **Ask for current holdings.** "What does your portfolio look like right now? What percentage is in each asset?" If they don't know, recommend a tracking tool.
2. **Ask for target allocation.** "What was your original target allocation?" If they have a previous JSON from portfolio-allocation, reference that.
3. **Calculate drift.** Show them exactly how far each asset has drifted from target.
4. **Explain whether rebalancing is needed.** If drift is <5%, tell them they're fine. If >5%, walk through the required trades.
5. **Ask about life changes.** "Has anything changed in your life since you last set your allocation? New job, new expenses, change in goals?"
6. **If life changes warrant it**, suggest a new target allocation (route to portfolio-allocation skill).
7. **Present the rebalancing trades** needed with estimated costs.
8. **Get confirmation** before outputting the updated JSON.
9. **Output the updated JSON** with the rebalanced allocation.

### Rebalancing JSON Output

When rebalancing results in an updated allocation, output the standardized JSON reflecting the new state:

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
  }
}
```

## Why Rebalancing Matters

### The Drift Problem

Suppose your target allocation is:
- 50% OGM tokenized ETFs (stocks)
- 30% bIB01 (cash)
- 20% USDY (stable yield)

After a year where stocks surge and cash is flat, your actual allocation might be:
- 65% OGM tokenized ETFs
- 22% bIB01
- 13% USDY

You're now taking significantly more risk than you planned. If a crash hits, it will hurt more than your target allocation was designed to handle.

Rebalancing fixes this by selling the overweight asset and buying the underweight ones, returning to your planned risk level.

### The Counterintuitive Benefit

Rebalancing forces you to **sell high and buy low** — the opposite of what emotions tell you to do. When stocks surge, you trim them. When they crash, you buy more. This disciplined approach improves risk-adjusted returns over time.

## When to Rebalance

### Option 1: Calendar-Based (Recommended for Most Users)
**Rebalance once per year.** Pick a date (birthday, New Year's, tax season — whatever you'll remember) and check your portfolio on that date.

- Simple, low effort, minimal trading costs
- Works well for most passive investors
- Aligns with the Bogle philosophy of minimal intervention

### Option 2: Threshold-Based
Rebalance whenever any asset class drifts more than **5 percentage points** from target.

- Example: Target 50% stocks, rebalance if stocks exceed 55% or drop below 45%
- More responsive than calendar-based
- Requires periodic checking (monthly or quarterly glances)
- Can generate more trades and costs

### Option 3: Contribution-Based (Smartest for DCA Users)
Don't sell anything — instead, redirect your DCA contributions to underweight assets until balance is restored.

- Zero selling, zero tax events, minimal fees
- Only works if contributions are large relative to portfolio
- Slower to rebalance but cheapest method
- Best combined with annual calendar check as a backstop

## How to Rebalance: Step by Step

### Step 1: Check Current Allocation
Open your portfolio tracker and note the current percentage of each asset:
- OGM tokenized ETFs: X%
- bIB01 (cash): Y%
- USDY: Z%

### Step 2: Compare to Target
| Asset | Target | Current | Drift |
|---|---|---|---|
| OGM ETFs | 50% | 62% | +12% (overweight) |
| bIB01 (cash) | 30% | 24% | -6% (underweight) |
| USDY | 20% | 14% | -6% (underweight) |

### Step 3: Calculate Required Trades
If total portfolio is $100,000:
- OGM ETFs: have $62,000, need $50,000 → sell $12,000
- bIB01 (cash): have $24,000, need $30,000 → buy $6,000
- USDY: have $14,000, need $20,000 → buy $6,000

### Step 4: Execute
Sell the overweight assets and buy the underweight ones. Or, if using the contribution method, direct your next several DCA contributions entirely to bIB01 (cash) and USDY until balanced.

### Step 5: Record and Set Next Reminder
Note the date, what you did, and set a reminder for the next rebalancing check.

## Special Rebalancing Situations

### After a Major Market Crash
If stocks drop 30%+, your allocation will shift heavily toward cash/stables. This is actually a buying opportunity — rebalancing means buying stocks at a discount. This is psychologically the hardest but most rewarding time to rebalance.

### Approaching FIRE or a Major Goal
As you get within 5 years of your target date, gradually shift allocation toward more conservative (more bIB01 (cash)/USDY, less bCSPX). This is a deliberate allocation change, not rebalancing — but it happens during rebalancing checks.

### After a Life Change
Marriage, divorce, children, job change, inheritance — any major life event should trigger a portfolio review. Your risk tolerance and time horizon may have changed.

## Monitoring Tools

### On-Chain Portfolio Trackers

**Zerion**
- Tracks all assets across multiple chains
- Clean interface, easy to see allocation percentages
- Free tier available

**Zapper**
- Comprehensive DeFi position tracking
- Shows lending positions, LP positions, and token holdings
- Good for users with Morpho/Aave positions from the Advanced Liquidity skill

**DeBank**
- Detailed portfolio analytics
- Tracks historical performance
- Cross-chain support

### Dedicated Portfolio Software

**Ghostfolio**
- Open-source wealth management software
- Specifically built for long-term investors
- Includes a FIRE calculator
- Tracks performance over time with detailed analytics
- Can monitor both crypto and traditional assets

## What to Monitor (and How Often)

| Check | Frequency | What to Look For |
|---|---|---|
| Allocation drift | Yearly (or threshold-triggered) | Any asset >5% from target |
| Emergency fund level | Every 6 months | Still covers recommended months of expenses |
| Total portfolio value | Monthly at most | General direction (don't obsess daily) |
| DeFi position health | Weekly (if borrowing) | Health factor above 1.5 |
| FIRE progress | Quarterly | Percentage of FIRE number achieved |
| Cost check | Yearly | Total fees still under 0.5% |

### The Anti-Monitoring Rule

**Do not check your portfolio daily.** Daily checking leads to emotional decisions. The more frequently you check, the more likely you are to see (temporary) losses, and the more tempted you'll be to act on them. Checking monthly is fine for curiosity. Acting should only happen during scheduled rebalancing.

## The Rebalancing Checklist (Annual)

Use this checklist once a year:

1. What is my current allocation? (Check portfolio tracker)
2. How far has each asset drifted from target? (Calculate drift)
3. Do I need to rebalance? (Drift >5% in any asset class → yes)
4. Has my life situation changed? (Risk tolerance, time horizon, goals)
5. Is my emergency fund still adequate? (Expenses may have changed)
6. Are my costs still under 0.5%? (Review fees)
7. If pursuing FIRE: what's my progress? (Update FIRE calculator)
8. Execute rebalancing trades if needed
9. Set reminder for next year

## Output Format

When helping a user rebalance:

1. **Current vs. target allocation** — show the drift clearly
2. **Required trades** — exactly what to sell and buy, with amounts
3. **Cost estimate** — gas and swap fees for the rebalancing trades
4. **Alternative approach** — can they use DCA redirection instead of selling?
5. **Next check date** — when to review again
