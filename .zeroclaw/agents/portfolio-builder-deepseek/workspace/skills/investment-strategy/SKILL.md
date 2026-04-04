---
name: investment-strategy
description: Teach users investment deployment strategies (DCA, Lump Sum, or Hybrid) and help them configure a personalized plan. Use this skill when users ask about DCA, dollar-cost averaging, recurring investments, automatic investing, investing monthly, regular buying schedule, "how often should I invest", "how much should I invest each month", lump sum investing, "I have X amount to invest", "should I invest all at once", "lump sum vs DCA", receiving a windfall (inheritance, bonus, sale), or want to set up any systematic investment plan.
---

# Investment Strategies: DCA, Lump Sum & Hybrid

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

---

## Part 1: Dollar-Cost Averaging (DCA)

Dollar-cost averaging is the strategy of investing a fixed amount of money at regular intervals, regardless of what the market is doing. It's the most recommended approach for beginners and the backbone of most long-term wealth building.

### DCA Chatbot Interaction Flow

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

### How DCA Works

Instead of trying to pick the perfect moment to invest (which even professionals fail at), you invest the same amount on a fixed schedule — weekly, biweekly, or monthly. This means:

- **When prices drop**, your fixed amount buys more shares/tokens
- **When prices rise**, your fixed amount buys fewer shares/tokens
- **Over time**, this averages out your cost and protects you from the mistake of putting all your money in at a bad moment

#### The Math in Action

Consider investing $50 biweekly into an index fund over 10 pay periods:

Using DCA: $500 total invested → 47.71 shares at an average price of $10.48
Using lump sum at period 4: $500 → 45.45 shares at $11.00 per share

DCA resulted in more shares at a lower average price because it automatically bought more when prices were lower.

### Why DCA Works Psychologically

DCA removes the two biggest enemies of the investor:

1. **Emotions:** You don't have to decide whether "now is a good time" — you invest regardless
2. **Market timing:** Nobody can consistently predict market movements. DCA accepts this reality and turns it into an advantage

As Burton Malkiel noted: investing equal dollar amounts at regular intervals reduces (but doesn't avoid) the risks by ensuring your entire portfolio won't be purchased at temporarily inflated prices.

### Configuring a DCA Plan

#### Step 1: Determine Your Investment Amount

The baseline recommendation is **20% of your income** dedicated to saving and investing. However, this needs to be adjusted:

- **Emergency fund not complete?** Split contributions between emergency fund (USDY) and investing until the fund is filled
- **High expenses or debt?** Start with whatever percentage you can sustain — even 5% is better than 0%
- **Already have emergency fund?** Direct the full savings amount to your investment portfolio

Ask the user: "What is your monthly income, and what percentage can you commit to investing consistently?"

#### Step 2: Choose Your Frequency

| Frequency | Best For | Trade-off |
|---|---|---|
| **Weekly** | Maximizes averaging effect, smoothest cost basis | Higher gas fees (more transactions), more effort |
| **Biweekly** | Aligns with many pay schedules | Good balance of averaging and cost |
| **Monthly** | Simplest to manage, lowest transaction costs | Less averaging benefit, but still effective |

For most users investing in Ondo assets, **monthly** is the sweet spot — frequent enough to benefit from averaging, infrequent enough to keep gas and swap fees low.

#### Step 3: Choose Your Target Assets

The user's DCA should go into the assets defined by their portfolio allocation (from the Portfolio Allocation skill). For example, if their allocation is:
- 50% OGM tokenized ETFs
- 30% bIB01 (cash)
- 20% USDY

Then a $1,000/month DCA would mean:
- $500/month into OGM tokenized ETFs
- $300/month into bIB01 (cash)
- $200/month into USDY

#### Step 4: Set Your Effort Level

| Effort Level | Description | Who It's For |
|---|---|---|
| **Low effort** | Monthly auto-DCA into 1-2 assets. Set and forget. Review once a year. | Beginners, busy people, "boring investing" believers |
| **Medium effort** | Biweekly into 2-3 assets. Manual review quarterly. Adjust DCA amounts if allocation drifts. | Intermediate investors who want some engagement |
| **High effort** | Weekly into multiple assets. Monthly rebalancing checks. Active monitoring of allocation drift. | Engaged investors comfortable with regular portfolio management |

Recommend low effort as the default. The whole point of DCA is that it runs on autopilot.

### On-Chain DCA Tools

In DeFi, you don't need a brokerage's auto-invest feature. These protocols automate DCA on-chain:

- **Mean Finance** — Set up recurring swaps at your chosen frequency
- **DCA.xyz** — Automated dollar-cost averaging protocol
- **Gnosis Safe modules** — Programmable scheduled transactions for more advanced users

Alternatively, users can set calendar reminders and manually execute swaps on DEXs (Jupiter, 1inch) at their chosen interval. This is more effort but gives full control.

### When DCA Is the Right Choice

- You have a **regular income** and can invest a fixed amount consistently
- You're a **beginner** and want the simplest approach
- You want to **remove emotion** from investing decisions
- You're investing in **volatile markets** (crypto is inherently volatile)
- You don't have a large lump sum to deploy

---

## Part 2: Lump Sum Investing

Lump sum investing means deploying all your available capital into your target allocation at once, rather than spreading purchases over time. Research consistently shows this approach beats DCA approximately two-thirds of the time — but it requires stronger nerves.

### Lump Sum Chatbot Interaction Flow

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

### Why Lump Sum Beats DCA Most of the Time

Markets tend to go up over time. This means that, statistically, the sooner your money is invested, the more time it has to grow. When you DCA, the portion waiting to be invested sits earning little or nothing while the market (on average) climbs higher.

Studies show lump sum investing outperforms DCA roughly 66% of the time across historical market data. The 34% where DCA wins are periods where the market drops after the lump sum investment — and those drops feel terrible.

### The Psychological Trade-Off

This is the critical point: lump sum has higher expected returns but is psychologically much harder.

- **If the market rises after you invest:** You feel great — you got in at a lower price than you would have with DCA
- **If the market drops 20-30% right after:** You feel terrible — your entire investment is underwater immediately

In crypto, the second scenario is not rare. A 30% drop can happen within days. The user needs to honestly assess whether they can hold through that without panic selling.

**The question to ask:** "If your entire investment dropped 30% next week, would you hold or sell?" If the answer is sell, DCA is the better choice regardless of what the math says.

### When Lump Sum Makes Sense

- You received a **windfall**: inheritance, bonus, business sale, large crypto gain
- You have a **long time horizon** (10+ years) — plenty of time to recover from a bad entry
- Your **emergency fund is fully funded** (critical — never lump sum invest money you might need)
- You have **conviction in your allocation** and won't second-guess it during drawdowns
- You understand that temporary losses are the price of statistically higher returns

### When Lump Sum Does NOT Make Sense

- **No emergency fund** → Build that first (route to Cash Emergency Fund Designer)
- **You might need the money within 1-3 years** → Too risky for short time horizons
- **You're new to investing** → The emotional shock of a drop can cause permanent bad habits
- **Markets are at extreme valuations with high uncertainty** → DCA hedges this risk
- **You can't sleep at night thinking about a 30% drop** → DCA is the right answer for you

### Executing a Lump Sum with Ondo Assets

#### Step 1: Confirm Emergency Fund
Verify the user has 3-6 months of expenses in USDY or equivalent. If not, carve that out first.

#### Step 2: Apply Portfolio Allocation
Use the percentages from the Portfolio Allocation skill. For example, with $50,000 and a Balanced profile:
- $25,000 → OGM tokenized broad-market ETFs (50%)
- $15,000 → bIB01 cash (30%)
- $10,000 → USDY yield-bearing stablecoin (20%)

#### Step 3: Execute in One Session
Deploy all capital into the target assets in a single trading session to avoid drift and overthinking. Once done, walk away and don't check for at least a month.

#### Step 4: Set Rebalancing Reminder
Set a calendar reminder to review the allocation in 12 months (route to Rebalancing & Monitoring skill).

---

## Part 3: Hybrid Approach

For users who want the benefits of lump sum but can't handle full exposure immediately:

- **Deploy 50% immediately** as a lump sum into your target allocation
- **DCA the remaining 50%** over 3-6 months
- This captures most of the statistical advantage while reducing the psychological pain of a bad entry

This is often the most practical real-world recommendation.

---

## Strategy Comparison

| Strategy | Expected Return | Effort | Best For |
|---|---|---|---|
| **DCA** | Good | Low | Beginners, regular income, set-and-forget |
| **Lump Sum** | Higher (~66% of the time) | One-time | Users with capital ready to deploy |
| **Hybrid** | Between DCA and Lump Sum | Medium | Users who want balance between math and comfort |

### Lump Sum vs. DCA Decision Framework

Ask these questions in order:

1. Do you have an emergency fund? **No** → Build it first, no investing yet
2. Is this money you can leave invested for 7+ years? **No** → DCA is safer for shorter horizons
3. Can you handle seeing a 30% drop right after investing? **No** → DCA or hybrid approach
4. Answered yes to all three? → **Lump sum is statistically the better choice**

---

## Output Formats

After configuring the plan and getting user confirmation, provide:

1. **Plain-language summary** of the complete plan
2. **JSON output** following the appropriate format:

### DCA Output

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

### Lump Sum Output

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

### Hybrid Output

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

3. **Reminder:** Stick to the plan through ups AND downs. Set a rebalancing reminder and don't check your portfolio daily.
