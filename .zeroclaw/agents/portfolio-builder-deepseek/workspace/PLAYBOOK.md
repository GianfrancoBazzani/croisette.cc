# Financial Advisor Skills — Ondo Finance DeFi Portfolio

A comprehensive set of educational skills that teach users how to invest using Ondo Finance's tokenized real-world assets (RWAs). These skills bridge traditional finance (TradFi) investing wisdom to decentralized finance (DeFi) execution.

## Source Material

These skills synthesize insights from three core resources:
1. **"Boringly Getting Rich"** (gherget.com) — Passive index fund investing guide by Gabor Herget
2. **"Exploring the Path to FIRE"** (Ghostfolio) — Financial Independence, Retire Early overview
3. **"Dollar-Cost Averaging"** (Investopedia) — DCA strategy explanation and examples

## TradFi-to-Ondo Asset Mapping

| TradFi Asset | Ondo Equivalent |
|---|---|
| Cash equivalent (T-Bills) | **bIB01** (tokenized short-term US Treasury bonds) |
| Money market / savings account | **USDY** (yield-bearing stablecoin) |
| Accumulating cash ETF | **USDY** (price rises with yield) |
| Distributing cash ETF | **rUSDY** (rebasing, price stays $1) |
| Individual stocks | **OGM tokenized stocks** (AAPL, TSLA, etc.) |
| S&P 500 / broad market ETF | **OGM tokenized ETFs** (BlackRock, Fidelity) |
| Brokerage account | Self-custody wallet (MetaMask, Trust Wallet, Ledger) |
| Trading platform | DEXs (Jupiter, 1inch, Uniswap) |

## Skills Overview

### Foundation Skills (Start Here)
| # | Skill | Purpose |
|---|---|---|
| 1 | `investing-fundamentals` | Core concepts: stocks, cash, index funds, Rule of 72, compounding, diversification |
| 2 | `cash-emergency-fund` | Design a safety net in USDY/rUSDY before investing |
| 3 | `portfolio-allocation` | Build a personalized portfolio based on risk profile |

### Strategy Skills (Choose One)
| # | Skill | Purpose |
|---|---|---|
| 4 | `dca-strategy` | Dollar-Cost Averaging: fixed amount at regular intervals |
| 5 | `lump-sum-strategy` | Deploy all capital at once (statistically better 66% of the time) |
| 6 | `value-averaging-strategy` | Adjustable DCA that invests more when prices drop |

### Goal Skills
| # | Skill | Purpose |
|---|---|---|
| 7 | `fire-calculator` | Calculate path to Financial Independence / Early Retirement |

### Maintenance Skills
| # | Skill | Purpose |
|---|---|---|
| 8 | `understanding-costs` | Why fees matter and how to minimize them |
| 9 | `rebalancing-monitoring` | Annual rebalancing and portfolio tracking |
| 10 | `risk-mindset` | Psychological preparation for volatility |

### Advanced Skills
| # | Skill | Purpose |
|---|---|---|
| 11 | `advanced-liquidity` | Collateralized borrowing against portfolio (Morpho, Aave) |

## Recommended User Journey

```
1. investing-fundamentals     → Learn the basics
2. cash-emergency-fund        → Build safety net in USDY
3. portfolio-allocation       → Design portfolio based on risk profile
4. [dca / lump-sum / value-avg] → Choose and configure investment strategy
5. understanding-costs        → Optimize for minimal fees
6. fire-calculator            → (Optional) Set FIRE target
7. rebalancing-monitoring     → Maintain portfolio over time
8. risk-mindset               → Prepare for market volatility
9. advanced-liquidity         → (Advanced) Borrow against holdings
```

## Key Principles Across All Skills

1. **Invest early** — compounding needs time
2. **Buy the whole market** — don't try to pick winners (96% of pros fail)
3. **Keep costs below 0.5%** — fees compound against you
4. **Have an emergency fund** — 6+ months in USDY before investing volatile assets
5. **Stay the course** — emotions destroy returns
6. **Be boring** — exciting investing usually means you're doing it wrong

## Interaction Pattern

All skills operate as a **chatbot conversation**. The agent:

1. **Asks one question at a time** — never overwhelms the user with a wall of questions
2. **Educates along the way** — pauses to explain any concept the user doesn't understand
3. **Challenges inconsistencies** — pushes back when user answers conflict (e.g., wanting aggressive growth but panic-selling at 20% drops)
4. **Answers any related question** — never refuses a tangent; explains, then returns to the flow
5. **Summarizes before finalizing** — presents the full plan in plain language for user review
6. **Gets explicit confirmation** — only generates the final output after the user approves

See `references/interaction-guide.md` for the full interaction protocol.

## JSON Output Format

Every skill interaction that results in a portfolio recommendation concludes with a standardized JSON object. This JSON is consumed by the execution layer.

```json
{
  "investment": [
    { "asset_class": "stocks", "chain_id": 1, "allocation_percentage": 40, "risk": "medium" },
    { "asset_class": "cash", "chain_id": 1, "allocation_percentage": 30, "risk": "low" },
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
  "strategy": { "type": "DCA", "frequency": "monthly", "monthly_amount": 1000 },
  "risk_profile": "balanced",
  "fire": { "fire_number": 750000, "years_to_fire": 18 },
  "borrowing": { "collateral_asset": "bIB01", "borrow_amount": 10000, "ltv_percentage": 40 }
}
```

- `investment` and `emergency_reserve` are **always** included
- `strategy`, `risk_profile`, `fire`, and `borrowing` are included only when relevant to the conversation

See `references/interaction-guide.md` for field definitions and generation rules.
