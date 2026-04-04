---
name: lump-sum-strategy
description: Teach users the lump sum investing strategy — deploying all available capital at once — and help them decide when it's appropriate versus DCA. Use this skill when users mention receiving a large sum of money (inheritance, bonus, business sale, crypto gains, savings), ask about investing a lump sum, say "I have X amount to invest", "should I invest all at once", "lump sum vs DCA", or ask whether to invest everything now or spread it out. Also trigger when users mention selling an asset and wanting to reinvest the proceeds.
---

# Investment Strategy: Lump Sum Investing

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

Lump sum investing means deploying all your available capital into your target allocation at once, rather than spreading purchases over time. Research consistently shows this approach beats DCA approximately two-thirds of the time — but it requires stronger nerves.

## Chatbot Interaction Flow

1. **Confirm prerequisites.** Emergency fund funded? Portfolio allocation defined? If not, route accordingly.
2. **Understand the source of funds.** Ask: "Where is this money coming from?" (inheritance, bonus, business sale, savings, crypto gains). This helps assess whether lump sum is appropriate.
3. **Ask the total amount available.** "How much are you looking to invest?"
4. **Test risk tolerance specifically for lump sum.** Ask: "If you invested all of this today and it dropped 30% next week, what would you do?" Be direct. If they say sell, recommend DCA or hybrid instead.
5. **Confirm time horizon.** "How long can you leave this money invested without needing it?"
6. **Challenge if needed.** If the user has a short time horizon but wants lump sum into aggressive assets, push back.
7. **Present the deployment plan** — exact amounts per Ondo asset.
8. **Offer the hybrid alternative** if appropriate (50% lump sum + 50% DCA).
9. **Summarize and get confirmation.**
10. **Output the JSON.**

## Why Lump Sum Beats DCA Most of the Time

Markets tend to go up over time. This means that, statistically, the sooner your money is invested, the more time it has to grow. When you DCA, the portion waiting to be invested sits earning little or nothing while the market (on average) climbs higher.

Studies show lump sum investing outperforms DCA roughly 66% of the time across historical market data. The 34% where DCA wins are periods where the market drops after the lump sum investment — and those drops feel terrible.

## The Psychological Trade-Off

This is the critical point: lump sum has higher expected returns but is psychologically much harder.

- **If the market rises after you invest:** You feel great — you got in at a lower price than you would have with DCA
- **If the market drops 20-30% right after:** You feel terrible — your entire investment is underwater immediately

In crypto, the second scenario is not rare. A 30% drop can happen within days. The user needs to honestly assess whether they can hold through that without panic selling.

**The question to ask:** "If your entire investment dropped 30% next week, would you hold or sell?" If the answer is sell, DCA is the better choice regardless of what the math says.

## When Lump Sum Makes Sense

- You received a **windfall**: inheritance, bonus, business sale, large crypto gain
- You have a **long time horizon** (10+ years) — plenty of time to recover from a bad entry
- Your **emergency fund is fully funded** (critical — never lump sum invest money you might need)
- You have **conviction in your allocation** and won't second-guess it during drawdowns
- You understand that temporary losses are the price of statistically higher returns

## When Lump Sum Does NOT Make Sense

- **No emergency fund** → Build that first (route to Cash Emergency Fund Designer)
- **You might need the money within 1-3 years** → Too risky for short time horizons
- **You're new to investing** → The emotional shock of a drop can cause permanent bad habits
- **Markets are at extreme valuations with high uncertainty** → DCA hedges this risk
- **You can't sleep at night thinking about a 30% drop** → DCA is the right answer for you

## Hybrid Approach: Split the Difference

For users who want the benefits of lump sum but can't handle full exposure immediately:

- **Deploy 50% immediately** as a lump sum into your target allocation
- **DCA the remaining 50%** over 3-6 months
- This captures most of the statistical advantage while reducing the psychological pain of a bad entry

This is often the most practical real-world recommendation.

## Executing a Lump Sum with Ondo Assets

### Step 1: Confirm Emergency Fund
Verify the user has 3-6 months of expenses in USDY or equivalent. If not, carve that out first.

### Step 2: Apply Portfolio Allocation
Use the percentages from the Portfolio Allocation skill. For example, with $50,000 and a Balanced profile:
- $25,000 → OGM tokenized broad-market ETFs (50%)
- $15,000 → bIB01 cash (30%)
- $10,000 → USDY yield-bearing stablecoin (20%)

### Step 3: Execute in One Session
Deploy all capital into the target assets in a single trading session to avoid drift and overthinking. Once done, walk away and don't check for at least a month.

### Step 4: Set Rebalancing Reminder
Set a calendar reminder to review the allocation in 12 months (route to Rebalancing & Monitoring skill).

## Lump Sum vs. DCA Decision Framework

Ask these questions in order:

1. Do you have an emergency fund? **No** → Build it first, no investing yet
2. Is this money you can leave invested for 7+ years? **No** → DCA is safer for shorter horizons
3. Can you handle seeing a 30% drop right after investing? **No** → DCA or hybrid approach
4. Answered yes to all three? → **Lump sum is statistically the better choice**

## Output Format

After configuring the plan and getting user confirmation, provide:

1. **Plain-language summary** of the deployment plan
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
    "type": "LUMP_SUM",
    "total_amount": 50000,
    "per_asset_amount": {
      "OGM_TOKENIZED_ETF": 25000,
      "bIB01": 15000,
      "USDY": 10000
    }
  },
  "risk_profile": "balanced"
}
```

For hybrid approach (50% lump sum + 50% DCA), include both strategy types:

```json
{
  "strategy": {
    "type": "HYBRID",
    "lump_sum_amount": 25000,
    "dca_amount": 25000,
    "dca_frequency": "monthly",
    "dca_duration_months": 6
  }
}
```

3. **Next steps** — set rebalancing reminder, don't check portfolio daily
