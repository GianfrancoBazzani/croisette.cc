---
name: portfolio-allocation
description: Design a personalized investment portfolio using tokenized assets based on the user's risk tolerance, time horizon, and financial goals. Use this skill whenever a user asks about portfolio design, asset allocation, how to split their investments, what percentage to put in stocks vs cash vs crypto, risk tolerance, conservative vs aggressive portfolios, or how to structure their crypto portfolio. Also trigger when users say things like "help me build a portfolio", "how should I invest my money", "what allocation should I use", "I want to start investing", or ask about core-satellite strategy, barbell strategy, or yield laddering. This is the primary portfolio design skill — use it before any strategy skill.
---

# Portfolio Allocation Based on Risk Profile

This skill operates as a chatbot conversation. Ask questions one at a time, wait for each answer, respond to user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

Asset allocation — how you split your money between different types of investments — determines approximately 94% of the differences in portfolio returns (Bogle). Getting this right matters more than picking individual assets.

## Conversation Flow

1. **Check emergency fund first.** Ask: "Do you have an emergency fund that covers at least 3–6 months of expenses?" If no → route to cash-emergency-fund skill. If yes → proceed.

2. **Ask risk profile questions one at a time** (see below). Do not present all questions at once.

3. **Challenge inconsistencies.** If someone wants aggressive growth but would sell during a 20% dip: "You mentioned wanting aggressive growth, but you'd also sell during a dip — those don't align. Let's find your true comfort level."

4. **Explain concepts when asked.** If the user asks "what's bIB01?" or "what does allocation mean?", pause and explain before continuing.

5. **Present the recommended portfolio.** Show the model portfolio matching their risk profile, explain why each asset is included and in what proportion.

6. **Invite adjustments.** "Does this allocation feel right? Would you like to adjust anything?"

7. **Summarize the full plan** in plain language.

8. **Get explicit confirmation** before generating JSON.

9. **Output the JSON.**

## Risk Profile Assessment

Ask these questions one at a time:

### Question 1: Time Horizon
- **1–3 years** → Very conservative (may need money soon)
- **3–7 years** → Moderate (some room for volatility)
- **7–15 years** → Growth-oriented (time to recover from downturns)
- **15+ years** → Aggressive-capable (maximum compounding runway)

### Question 2: Reaction to a 30% Drop
- **"I'd sell everything"** → Conservative
- **"I'd sell some"** → Balanced
- **"I'd wait"** → Growth
- **"I'd buy more"** → Aggressive

Note: In crypto, a 30% drop isn't worst-case — it's a regular occurrence. Be honest about this.

### Question 3: Primary Goal
- **Preserve capital** → Conservative
- **Steady growth, low stress** → Balanced
- **Maximize long-term growth** → Growth
- **Achieve FIRE** → Aggressive (route to fire-calculator skill)

## Model Portfolios

These portfolios use three asset classes from the investment schema: **stocks** (OGM tokenized ETFs), **cash** (bIB01 short-term Treasuries), and **crypto_blue_chip** (WETH). The emergency reserve (USDY) is handled separately by the cash-emergency-fund skill and is not part of the investment allocation.

### Conservative (Low Risk)
| Asset Class | Allocation | Ondo Product |
|---|---|---|
| Cash | 60% | bIB01 (short-term US Treasury bonds) |
| Stocks | 30% | OGM tokenized ETFs (BlackRock/Fidelity) |
| Crypto blue chip | 10% | WETH |

Best for: Short time horizons (1–5 years), capital preservation. Lower returns, smoother ride.

### Balanced (Medium Risk)
| Asset Class | Allocation | Ondo Product |
|---|---|---|
| Cash | 30% | bIB01 |
| Stocks | 50% | OGM tokenized ETFs |
| Crypto blue chip | 20% | WETH |

Best for: Medium time horizons (5–10 years), moderate volatility tolerance. Closest to the classic 60/40 stock/bond split.

### Growth (Higher Risk)
| Asset Class | Allocation | Ondo Product |
|---|---|---|
| Cash | 15% | bIB01 |
| Stocks | 55% | OGM tokenized ETFs |
| Crypto blue chip | 30% | WETH |

Best for: Long time horizons (10+ years), users who understand volatility is the price of higher returns.

### Aggressive (High Risk)
| Asset Class | Allocation | Ondo Product |
|---|---|---|
| Cash | 10% | bIB01 |
| Stocks | 50% | OGM tokenized ETFs |
| Crypto blue chip | 40% | WETH |

Best for: Very long time horizons (15+ years), FIRE pursuers, users who truly won't panic sell.

## Core Principle

The mix you choose and the discipline to stick with it matters more than anything else. It's not your age that determines the mix — it's your time horizon, goals, and whether you've lived through a financial crisis.

## Advanced Approaches

### Core-Satellite Strategy
80% in boring diversified assets (core), 20% in higher-conviction picks (satellite).

- **Core (80%):** OGM broad-market ETFs + bIB01
- **Satellite (20%):** Individual OGM stocks (AAPL, TSLA), sector ETFs

Never put more in the satellite than you can afford to lose. When it grows beyond 20%, trim back to target.

### Barbell Strategy
Split between very safe and very risky, nothing in the middle:
- **Safe (50–60%):** bIB01
- **Risky (40–50%):** Individual OGM stocks, WETH

The safe portion protects downside; the risky portion gives upside. Accept the risky portion might lose significantly.

### Yield Laddering
Spread stable allocation across products for different access speeds:
- **Immediate:** USDY (liquid, withdraw anytime) — for emergency reserve
- **Medium-term:** bIB01 (short-term Treasury exposure) — for investment cash allocation

## Output Format

After assessing risk profile and getting confirmation, provide:

1. **Plain-language summary** of the allocation with reasoning
2. **JSON output:**

```json
{
  "investment": [
    { "asset_class": "stocks", "chain_id": 1, "allocation_percentage": 50, "risk": "medium" },
    { "asset_class": "cash", "chain_id": 1, "allocation_percentage": 30, "risk": "low" },
    { "asset_class": "crypto_blue_chip", "chain_id": 1, "allocation_percentage": 20, "risk": "high" }
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
  "risk_profile": "balanced"
}
```

The `investment` array uses only `stocks`, `cash`, and `crypto_blue_chip`. The `stable_yield` asset class is reserved for `emergency_reserve`.

3. **Save the JSON immediately** using `file_write` to `portfolio-plan.json` in the workspace root — the frontend dashboard reads this file to display the portfolio visualization.
4. **Next steps** — route to the appropriate strategy skill (DCA, Lump Sum, or Hybrid) for implementation.
