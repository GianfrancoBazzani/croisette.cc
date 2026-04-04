---
name: portfolio-allocation
description: Design a personalized investment portfolio using tokenized assets based on the user's risk tolerance, time horizon, and financial goals. Use this skill whenever a user asks about portfolio design, asset allocation, how to split their investments, what percentage to put in stocks vs cash vs crypto, risk tolerance, conservative vs aggressive portfolios, or how to structure their crypto portfolio. Also trigger when users say things like "help me build a portfolio", "how should I invest my money", "what allocation should I use", "I want to start investing", or ask about core-satellite strategy, barbell strategy, or yield laddering. This is the primary portfolio design skill — use it before any strategy skill.
---

# Portfolio Allocation Based on Risk Profile

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

This skill helps users design a personalized portfolio using Ondo Finance assets. Asset allocation — how you split your money between different types of investments — determines approximately 94% of the differences in portfolio returns (according to research cited by John C. Bogle). Getting this right matters more than picking individual assets.

## Chatbot Interaction Flow

1. **Check emergency fund first.** Ask: "Do you have an emergency fund that covers at least 3-6 months of expenses?" If no → route to cash-emergency-fund skill before continuing. If yes → proceed.
2. **Ask risk profile questions ONE AT A TIME.** Do not present all 4 questions at once. Ask one, wait for the answer, then ask the next.
3. **Challenge inconsistencies.** If someone says they want aggressive growth but would sell during a 20% dip, point this out: "You mentioned wanting aggressive growth, but you'd also sell during a dip — those don't align. Let me explain why, and let's find your true comfort level."
4. **Explain each concept when relevant.** If the user asks "what's bIB01?" or "what does allocation mean?", pause and explain before continuing.
5. **Present the recommended portfolio.** Show the model portfolio that matches their risk profile, explain why each asset is included and in what proportion.
6. **Invite adjustments.** Ask: "Does this allocation feel right to you? Would you like to adjust anything?"
7. **Summarize the full plan** in plain language before generating the JSON.
8. **Get explicit confirmation.** Only generate the JSON after the user says they're happy with the plan.
9. **Output the JSON** following the format in `references/interaction-guide.md`.

## Response Format

CRITICAL: Always respond with a single JSON object. Do not include any text outside the JSON object. The JSON must contain these fields:

```json
{
  "text": "your conversational message (always required)",
  "options": ["choice 1", "choice 2"],
  "profile_update": { "key": "value" },
  "insight": "contextual takeaway sentence",
  "allocation": [{ "asset": "Asset Name", "pct": 55 }]
}
```

Field rules:
- `text` — ALWAYS required. Your conversational message to the user.
- `options` — Include when asking a question with predefined choices. Omit for open-ended follow-ups.
- `profile_update` — Include when the user's previous answer resolves a profile fact. Use these keys: `emergency_fund`, `time_horizon`, `risk_tolerance`, `primary_goal`, `strategy`. Value is the user's answer. Omit on your very first message.
- `insight` — Include a brief contextual takeaway from the user's last answer. Omit when there's nothing meaningful to add.
- `allocation` — Include ONLY in your final response with the recommended portfolio. Array of `{ "asset": "Display Name (Ticker)", "pct": number }` objects.

Example first message:
```json
{
  "text": "Great to meet you! Before we design your portfolio, do you have an emergency fund covering at least 3-6 months of expenses?",
  "options": ["Yes, I'm covered", "No, not yet", "I'm not sure"]
}
```

Example mid-conversation message:
```json
{
  "text": "With a 15+ year runway, you can ride out market cycles and go after real growth. Now, imagine your portfolio drops 30% in a single month. What's your gut reaction?",
  "options": ["Sell everything", "Sell some", "Wait it out", "Buy more"],
  "profile_update": { "time_horizon": "15+ years" },
  "insight": "A long time horizon opens up growth-heavy allocations — time is your biggest asset."
}
```

Example final message:
```json
{
  "text": "Here's your recommended Growth portfolio. 55% in diversified stocks via OGM tokenized ETFs, 30% in WETH for crypto blue-chip exposure, and 15% in bIB01 short-term Treasuries for stability.",
  "profile_update": { "strategy": "DCA" },
  "insight": "This growth-heavy allocation suits your long horizon and aggressive risk tolerance. DCA smooths out your entry points over time.",
  "allocation": [
    { "asset": "Stocks (OGM)", "pct": 55 },
    { "asset": "WETH", "pct": 30 },
    { "asset": "Cash (bIB01)", "pct": 15 }
  ]
}
```

## Core Principle

The mix you choose and the discipline to stick with it over a long period of time is your key to success. It's not your age that should determine the mix, but rather your time horizon, your financial goals, and whether you've ever lived through a financial crisis.

## Risk Profile Assessment

Before recommending an allocation, assess the user's risk profile by asking these questions:

### Question 1: Investment Time Horizon
- **1-3 years** → Very conservative (you may need this money soon)
- **3-7 years** → Moderate (some room for volatility)
- **7-15 years** → Growth-oriented (time to recover from downturns)
- **15+ years** → Aggressive-capable (maximum compounding runway)

### Question 2: Reaction to a 30% Portfolio Drop
- **"I'd sell everything"** → Conservative allocation needed
- **"I'd sell some to reduce risk"** → Balanced allocation
- **"I'd do nothing and wait"** → Growth allocation possible
- **"I'd buy more at the discount"** → Aggressive allocation possible

Note: In crypto, a 30% drop isn't a worst-case scenario — it's a regular occurrence. Be honest with users about this. A -32% drop was the worst in 20 years for TradFi; in crypto, that can happen in a single week.

### Question 3: Primary Goal
- **Preserve capital** → Conservative
- **Steady growth with low stress** → Balanced
- **Maximize long-term growth** → Growth
- **Achieve FIRE (Financial Independence)** → Aggressive (route to FIRE Calculator skill)

### Question 4: Emergency Fund Status
- If the user does NOT have an emergency fund → Route to the Cash Emergency Fund Designer skill first. Never invest before having a safety net.

## Model Portfolios Using Ondo Assets

### Conservative Portfolio (Low Risk)
| Asset | Allocation | Ondo Product |
|---|---|---|
| Stable yield | 30% | USDY (yield-bearing stablecoin) |
| Cash | 50% | bIB01 (cash — short-term US Treasury bonds) |
| Broad market ETFs | 20% | OGM tokenized ETFs (BlackRock/Fidelity) |

Best for: Short time horizons (1-5 years), users who can't stomach volatility, capital preservation goals. Expect lower returns but much smoother ride.

### Balanced Portfolio (Medium Risk)
| Asset | Allocation | Ondo Product |
|---|---|---|
| Stable yield | 20% | USDY |
| Cash | 30% | bIB01 |
| Broad market ETFs | 50% | OGM tokenized ETFs |

Best for: Medium time horizons (5-10 years), users comfortable with moderate swings. This is the closest equivalent to the classic 50/50 stock/cash allocation recommended in traditional investing guides.

### Growth Portfolio (Higher Risk)
| Asset | Allocation | Ondo Product |
|---|---|---|
| Stable yield | 10% | USDY |
| Cash | 20% | bIB01 |
| Broad market ETFs | 70% | OGM tokenized ETFs |

Best for: Long time horizons (10+ years), users who understand volatility is the price of higher returns.

### Aggressive Portfolio (High Risk)
| Asset | Allocation | Ondo Product |
|---|---|---|
| Stable yield | 5% | USDY |
| Cash | 10% | bIB01 |
| Broad market ETFs | 65% | OGM tokenized ETFs |
| Individual tokenized stocks | 20% | OGM individual stocks (AAPL, TSLA, etc.) |

Best for: Very long time horizons (15+ years), FIRE pursuers, users who truly won't panic sell. The individual stock portion adds concentration risk but also higher potential upside.

## Accumulating vs. Rebasing: USDY vs. rUSDY

Ondo offers two versions of its yield-bearing stablecoin:

- **USDY (accumulating):** The token price rises over time as yield builds. If you buy at $1.00, it might be worth $1.04 after a year. Your token count stays the same, but each token is worth more. Best for long-term holders who want simple tracking.

- **rUSDY (rebasing):** The token price stays at $1.00, but you receive more tokens as yield accrues. Your balance grows in quantity, not price. Best for users who want a stable unit price (easier to mentally budget) or for use as collateral.

Choose based on preference — the economic outcome is the same.

## Advanced Allocation Approaches

### Core-Satellite Strategy
Put 80% of your portfolio into boring, diversified assets (the "core") and 20% into higher-conviction individual picks (the "satellite").

- **Core (80%):** bCSPX broad-market ETFs + bIB01 cash
- **Satellite (20%):** Individual OGM tokenized stocks (like AAPL, TSLA), sector ETFs, or crypto-native tokens

This satisfies the urge to be active without putting the whole portfolio at risk. The critical rule: never put more in the satellite than you can afford to lose entirely. When the satellite grows beyond 20%, trim it back to target.

### Barbell Strategy
Split your portfolio between very safe assets and very risky ones, with nothing in the middle:
- **Safe end (50-60%):** USDY + bIB01
- **Risky end (40-50%):** Individual OGM stocks, volatile crypto tokens

The logic: the safe portion protects your downside, while the risky portion gives unlimited upside. You accept that the risky portion might lose significantly, but the safe portion ensures you're never wiped out.

### Yield Laddering
Spread your stable allocation across different products to balance yield and accessibility:
- **Immediately accessible:** USDY (liquid, withdraw anytime)
- **Medium-term:** bIB01 (cash — short-term Treasury exposure)

This mirrors how TradFi investors "ladder" cash across different maturities. The goal is to always have some portion that's immediately available while the rest earns higher yields.

## Output Format

After assessing the user's risk profile and getting their confirmation, provide:

1. **Plain-language summary** of the allocation with reasoning
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
    "current_amount": 5000,
    "monthly_contribution": 1300,
    "months_to_complete": 10,
    "assets": [
      { "asset_class": "stable_yield", "chain_id": 1, "allocation_percentage": 100, "risk": "very_low" }
    ]
  },
  "risk_profile": "balanced"
}
```

3. **Next steps** — route to the appropriate strategy skill (DCA, Lump Sum, or Value Averaging) for implementation
