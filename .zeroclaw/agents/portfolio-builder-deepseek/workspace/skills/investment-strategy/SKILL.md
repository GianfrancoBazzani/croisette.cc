---
name: investment-strategy
description: Teach users investment deployment strategies (DCA, Lump Sum, or Hybrid) and help them configure a personalized plan. Use this skill when users ask about DCA, dollar-cost averaging, recurring investments, automatic investing, investing monthly, regular buying schedule, "how often should I invest", "how much should I invest each month", lump sum investing, "I have X amount to invest", "should I invest all at once", "lump sum vs DCA", receiving a windfall (inheritance, bonus, sale), or want to set up any systematic investment plan.
---

# Investment Strategies: DCA, Lump Sum & Hybrid

This skill operates as a chatbot conversation. Ask questions one at a time, wait for each answer, respond to user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

## Conversation Flow

1. **Confirm prerequisites.** Check that the user has: (a) an emergency fund — route to cash-emergency-fund if not, (b) a portfolio allocation defined — route to portfolio-allocation if not.

2. **Determine which strategy fits.** Use the decision framework:
   - Do they have a lump sum to deploy (inheritance, bonus, savings)? → Consider Lump Sum or Hybrid
   - Are they investing from regular income? → DCA
   - Unsure? → Ask: "Are you investing a one-time amount, or setting up regular ongoing investments?"

3. **For DCA** — gather these one at a time:
   - Monthly income after taxes
   - Amount they can consistently invest each month (suggest 20% baseline)
   - Frequency preference (weekly / biweekly / monthly)
   - Effort level (see below)

4. **For Lump Sum** — gather these one at a time:
   - Source of funds (inheritance, bonus, sale, savings, crypto gains)
   - Total amount to invest
   - Time horizon ("How long can you leave this invested?")
   - Stress test: "If this dropped 30% next week, what would you do?" — if they'd sell, recommend DCA or Hybrid instead

5. **Calculate the plan** using their allocation from the portfolio-allocation skill. Show specific amounts per asset.

6. **Offer Hybrid if appropriate.** For lump sum users who are nervous: deploy 50% immediately, DCA the remaining 50% over 3–6 months. Captures most of the statistical advantage while reducing psychological pain.

7. **Summarize the complete plan** in plain language.

8. **Get explicit confirmation** and output the JSON.

## Dollar-Cost Averaging (DCA)

Invest a fixed amount at regular intervals regardless of market conditions. Instead of picking the perfect moment (which even professionals fail at), you invest the same amount on a fixed schedule:

- **When prices drop**, your fixed amount buys more shares/tokens
- **When prices rise**, it buys fewer
- **Over time**, this averages out your cost and protects from bad timing

DCA removes the two biggest enemies: emotions (no deciding if "now is a good time") and market timing (nobody predicts it consistently).

### Frequency

| Frequency | Best For | Trade-off |
|---|---|---|
| Weekly | Maximum averaging effect | Higher gas fees, more effort |
| Biweekly | Aligns with pay schedules | Good balance |
| Monthly | Simplest, lowest fees | Less averaging, still effective |

For Ondo assets, **monthly** is the sweet spot — frequent enough for averaging, infrequent enough to keep fees low.

### Effort Level

| Level | Description | Who It's For |
|---|---|---|
| Low | Monthly into 1–2 assets. Set and forget. Review yearly. | Beginners, busy people |
| Medium | Biweekly into 2–3 assets. Quarterly review. Adjust if allocation drifts. | Intermediate investors |
| High | Weekly into multiple assets. Monthly rebalancing checks. | Engaged investors |

Recommend low as default — the whole point of DCA is autopilot.

### On-Chain DCA Tools

- **Mean Finance** — Recurring swaps at your chosen frequency
- **DCA.xyz** — Automated dollar-cost averaging protocol
- Or: calendar reminders + manual DEX swaps (Jupiter, 1inch) for full control

## Lump Sum Investing

Deploy all available capital into your target allocation at once. Research shows this beats DCA roughly **66% of the time** because markets tend to go up — the sooner your money is invested, the more time it has to grow.

The 34% where DCA wins are periods where markets drop right after — and those drops feel terrible. This is the trade-off: higher expected returns but psychologically harder.

**The key question:** "If your entire investment dropped 30% next week, would you hold or sell?" If sell → DCA is better regardless of what the math says.

### Lump Sum vs DCA Decision Framework

1. Emergency fund funded? **No** → Build it first
2. Can you leave this invested 7+ years? **No** → DCA is safer
3. Can you handle a 30% drop right after? **No** → DCA or Hybrid
4. Yes to all three? → **Lump sum is statistically better**

### Executing Lump Sum

1. Confirm emergency fund is funded
2. Apply portfolio allocation percentages to the total amount
3. Deploy all capital in a single session — avoid drift and overthinking
4. Walk away. Don't check for at least a month. Set a 12-month rebalancing reminder.

## Strategy Comparison

| Strategy | Expected Return | Effort | Best For |
|---|---|---|---|
| **DCA** | Good | Low | Beginners, regular income, set-and-forget |
| **Lump Sum** | Higher (~66% of time) | One-time | Capital ready to deploy, long horizon |
| **Hybrid** | Between DCA & Lump Sum | Medium | Balance between math and comfort |

## Output Format

After configuring the plan and getting user confirmation, provide:

1. **Plain-language summary** of the complete plan
2. **JSON output:**

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
    "effort_level": "low"
  },
  "risk_profile": "balanced"
}
```

Strategy type values: `"DCA"`, `"LUMP_SUM"`, or `"HYBRID"`. For lump sum, include `total_amount` instead of `monthly_amount`/`frequency`. For hybrid, include both `lump_sum_amount` and `dca_amount`/`dca_frequency`/`dca_duration_months`.

3. **Save the JSON immediately** using `file_write` to `portfolio-plan.json` in the workspace root — the frontend dashboard reads this file to display the portfolio visualization.
4. **Remind the user:** Stick to the plan through ups and downs. Set a rebalancing reminder and don't check daily.
