# TOOLS.md — Portfolio Persistence

## How to Save Portfolios

### Current (Interim): File-based

Save portfolio plans as JSON files in the workspace directory using `file_write`:

```
workspace/portfolio-plan-YYYY-MM-DD.json
```

Each file contains the complete portfolio recommendation for a user session.

### Future: Bun SQL Database

Portfolio data will be persisted to a SQL database via Bun's built-in SQL client. Credentials and connection details will be provided when available. The JSON schema below remains the same — it will map to database tables.

## Portfolio JSON Schema

Every skill interaction that results in a portfolio recommendation MUST conclude with a JSON object following this structure:

```json
{
  "investment": [
    { "asset_class": "stocks", "chain_id": 1, "allocation_percentage": 40, "risk": "medium" },
    { "asset_class": "cash", "chain_id": 1, "allocation_percentage": 30, "risk": "low" },
    { "asset_class": "crypto_blue_chip", "chain_id": 1, "allocation_percentage": 30, "risk": "high" }
  ],
  "emergency_reserve": [
    { "asset_class": "stable_yield", "chain_id": 1, "allocation_percentage": 100, "risk": "very_low" }
  ],
  "strategy": {
    "type": "DCA",
    "frequency": "monthly",
    "monthly_amount": 1000,
    "effort_level": "low"
  },
  "risk_profile": "balanced",
  "fire": {
    "fire_number": 750000,
    "current_portfolio": 25000,
    "years_to_fire": 18,
    "monthly_investment_needed": 1500
  }
}
```

### Required Sections

- `investment` — ALWAYS present. The portfolio allocation.
- `emergency_reserve` — ALWAYS present. Even if fully funded, show the status.

### Optional Sections (include when relevant)

- `strategy` — When DCA, lump sum, or value averaging was configured
- `risk_profile` — When risk assessment was performed
- `fire` — When FIRE calculator was used
- `borrowing` — When advanced liquidity was discussed

### Field Definitions

**investment** array:
- `asset_class`: Valid values: `stocks`, `cash`, `crypto_blue_chip`. **NEVER include `stable_yield`** — it's reserved for emergency_reserve.
- `chain_id`: Always `1` (Ethereum mainnet)
- `allocation_percentage`: Integer. All entries MUST sum to exactly 100.
- `risk`: Fixed per asset class — do not change (stocks=medium, cash=low, crypto_blue_chip=high)

**emergency_reserve** array:
- `asset_class`: ALWAYS `stable_yield`. No other asset class allowed here.
- `chain_id`: Always `1`
- `allocation_percentage`: Integer. All entries MUST sum to exactly 100.
- `risk`: Always `very_low`

## CRITICAL: Validation Rules

**Before outputting ANY JSON, you MUST verify:**

1. `investment` allocation_percentage values sum to exactly 100
2. `emergency_reserve` allocation_percentage values sum to exactly 100
3. `stable_yield` NEVER appears in `investment`
4. Only `stable_yield` appears in `emergency_reserve`
5. Risk values are fixed per asset class — never changed

If the numbers don't add up, DO NOT output. Recalculate and fix first.

## Generation Rules

1. Only generate JSON after the user explicitly confirms the plan
2. Present a plain-language summary FIRST
3. Then present the full JSON as a code block
4. After showing the JSON, explain what happens next
5. Offer to adjust: "If you want to change anything, just tell me"

## Asset Class Reference

| asset_class | Risk | Token | Contract Address (ETH Mainnet) |
|---|---|---|---|
| `stocks` | `medium` | bCSPX | `0x1e2c4fb7ede391d116e6b41cd0608260e8801d59` |
| `cash` | `low` | bIB01 | `0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5` |
| `stable_yield` | `very_low` | USDY | `0x96F6eF951840721AdBF46Ac996b59E0235CB985C` |
| `crypto_blue_chip` | `high` | WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |

The execution layer maps `asset_class` + `chain_id` to the specific token and contract address.
