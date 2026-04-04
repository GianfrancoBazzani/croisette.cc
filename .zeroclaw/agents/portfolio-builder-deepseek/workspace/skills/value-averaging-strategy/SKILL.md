---
name: value-averaging-strategy
description: Teach users the value averaging investment strategy — a more sophisticated alternative to DCA that adjusts investment amounts based on portfolio performance to potentially achieve better returns. Use this skill when users ask about value averaging, "better than DCA", "smarter DCA", "adjust my investment based on market", "invest more when prices are low", advanced investment strategies, or want to optimize their recurring investment approach. Also trigger when experienced users say they want more control than basic DCA provides.
---

# Investment Strategy: Value Averaging

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

Value averaging is a disciplined investment approach that adjusts how much you invest each period based on your portfolio's performance. Think of it as DCA's smarter, more demanding sibling — it can produce slightly better returns, but requires more attention and variable cash flow.

## Chatbot Interaction Flow

1. **Assess experience level.** Ask: "Have you invested before? Are you comfortable with DCA?" If they're beginners, recommend starting with DCA first and graduating to value averaging later.
2. **Confirm prerequisites.** Emergency fund, portfolio allocation, understanding of DCA basics.
3. **Explain the concept** with a simple example before asking for any numbers.
4. **Ask about monthly investment capacity.** "What's the maximum you could invest in a single month if needed?" (Value averaging requires variable amounts.)
5. **Set the value growth target.** Based on their normal monthly investment amount.
6. **Discuss the cash buffer.** "You'll need 2-3x your normal monthly amount in reserve for months when prices drop. Can you set that aside?"
7. **Walk through a mock month** together to make sure they understand the calculation.
8. **Challenge if they seem uncertain.** "This requires monthly attention and variable cash. Are you sure you don't want the simplicity of DCA?"
9. **Summarize and get confirmation.**
10. **Output the JSON.**

## How Value Averaging Works

Instead of investing a fixed amount each period (like DCA), you set a **target portfolio value** that increases by a fixed amount each month. Then you invest whatever is needed to hit that target.

### The Core Mechanic

1. Set a target: "I want my portfolio to grow by $500 every month"
2. Month 1: Portfolio is $0, target is $500 → Invest $500
3. Month 2: Target is $1,000. Portfolio grew to $600 → Invest $400 (only need $400 to reach $1,000)
4. Month 3: Target is $1,500. Portfolio dropped to $800 → Invest $700 (need more to reach $1,500)
5. Month 4: Target is $2,000. Portfolio surged to $1,900 → Invest only $100
6. Rare case: Target is $2,500. Portfolio is at $2,600 → Sell $100 (you're above target)

### The Key Insight

Value averaging **automatically** makes you invest more when prices are low (your portfolio is below target) and invest less when prices are high (your portfolio is near or above target). This is the opposite of what emotional investors do — they buy more when prices are rising and sell when prices drop.

## Value Averaging vs. DCA

| Aspect | DCA | Value Averaging |
|---|---|---|
| Amount invested per period | Fixed ($500 every month) | Variable (whatever it takes to hit target) |
| When prices drop | Buy same amount | Buy MORE (portfolio below target) |
| When prices rise | Buy same amount | Buy LESS (portfolio near target) |
| Sometimes requires selling | No | Yes (when portfolio exceeds target) |
| Cash flow predictability | Predictable | Unpredictable |
| Expected returns | Good | Slightly better than DCA |
| Effort required | Low | Medium to High |
| Best for | Beginners, autopilot | Engaged users, optimizers |

## Configuring a Value Averaging Plan

### Step 1: Set Your Monthly Value Growth Target

This is the amount you want your portfolio to grow in value each month. A reasonable starting point:

- Take your planned monthly DCA amount as the baseline
- Your value growth target should be approximately equal to that amount
- Example: If you'd normally DCA $1,000/month, set your value target growth at $1,000/month

### Step 2: Determine Your Target Assets

Apply the same portfolio allocation from the Portfolio Allocation skill. Value average into each asset proportionally.

For a Balanced allocation ($1,000/month target):
- OGM tokenized ETFs target growth: $500/month (50%)
- bIB01 (cash) target growth: $300/month (30%)
- USDY target growth: $200/month (20%)

### Step 3: Monthly Calculation

Each month, for each asset:
1. Check the current value of your holding
2. Calculate the target value (previous target + monthly growth amount)
3. Invest the difference (or sell if above target)

### Step 4: Maintain a Cash Buffer

Because value averaging requires variable amounts, keep a cash buffer (in USDY) equal to 2-3x your normal monthly investment. This ensures you have enough to invest during down months when the required amount is higher than usual.

## Practical Example with Ondo Assets

**Setup:** $1,000/month value growth target, Balanced allocation

| Month | OGM ETF Target | OGM ETF Actual Value | Amount to Invest |
|---|---|---|---|
| 1 | $500 | $0 | $500 (buy) |
| 2 | $1,000 | $450 (market dropped) | $550 (buy more) |
| 3 | $1,500 | $1,200 (market recovered) | $300 (buy less) |
| 4 | $2,000 | $2,100 (market surged) | -$100 (sell $100) |

Notice how value averaging naturally buys more during dips and less during surges — the opposite of emotional investing.

## When Value Averaging Is the Right Choice

- You're an **experienced investor** comfortable with variable monthly contributions
- You have **irregular income** or cash reserves that can absorb higher-than-usual investment months
- You're willing to **actively manage** your investments monthly
- You want to **optimize returns** beyond what basic DCA provides
- You understand that selling when above target is a feature, not a problem

## When Value Averaging Is NOT the Right Choice

- You're a **beginner** — start with DCA, graduate to value averaging later
- You have a **tight budget** with no flexibility for variable monthly amounts
- You want **set-and-forget** investing — value averaging requires monthly attention
- You're investing in **very volatile assets** where the required investment can swing wildly
- Gas fees are high — more variable trading means more transactions and higher costs

## Risks and Considerations

- **Cash flow variability:** Some months you'll need to invest significantly more than others. Budget for this.
- **Transaction costs:** More variable buying/selling means more gas fees. Factor these in.
- **Tax implications:** Selling when above target may create taxable events depending on jurisdiction.
- **Emotional discipline:** When the market drops and the system tells you to invest MORE, you need to actually do it. This is when it matters most.

## Output Format

After configuring the plan and getting user confirmation, provide:

1. **Plain-language summary** including the monthly checklist
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
    "type": "VALUE_AVERAGING",
    "monthly_value_growth_target": 1000,
    "cash_buffer_amount": 3000,
    "per_asset_growth_target": {
      "OGM_TOKENIZED_ETF": 500,
      "bIB01": 300,
      "USDY": 200
    },
    "effort_level": "high"
  },
  "risk_profile": "growth"
}
```

3. **Upgrade path reminder:** "Start with DCA for 3-6 months if unsure. Switch to value averaging once comfortable."
