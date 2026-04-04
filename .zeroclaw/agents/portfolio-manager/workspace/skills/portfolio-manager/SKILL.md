---
name: portfolio-manager
description: Heartbeat-driven portfolio manager. Triggered periodically to snapshot the on-chain portfolio, compare it against the target strategy, prepare Uniswap swap quotes for any needed rebalancing, and propose the changes to the user via Telegram for approval. Never signs or broadcasts transactions.
---

# Portfolio Manager

Single entry point for every heartbeat cycle. Executes a strict 5-step pipeline.

## Active Skills

- `portfolio-snapshot`
- `swap-preparation`

## Data Sources

All structured data lives in the SQLite database. See `TOOLS.md` for access patterns.

- **Supported assets:** `SELECT * FROM asset` — returns ticker, type, description, contract address, chain_id, decimals.
- **Target portfolio:** `SELECT a.ticker, a.type, e.allocation FROM ideal_portfolio p JOIN ideal_portfolio_entry e ON e.portfolioId = p.id JOIN asset a ON a.id = e.assetId WHERE p.userId = "<USER_ID>"` — returns per-asset target allocation percentages.
- **Strategy configuration:** read from the strategy reference file provided by the invoking prompt.

Never use flat JSON files for asset or portfolio data. The database is the single source of truth.

## Supported Networks

The active network is determined by the strategy file's `metadata.mode` field:

- `mainnet` -> chain_id `1`, RPC from `ETHEREUM_RPC_URL`
- `testnet` -> chain_id `11155111`, RPC from `ETHEREUM_SEPOLIA_RPC_URL`

### Mainnet Reference (chain_id: 1)

Valuation asset: USDC `0xA0b86991c6218b36c1d19D4a2e9Eb0Ce3606eB48` (6 decimals)

Supported asset types: stocks (Ondo tokenized equities, 18 decimals), crypto_bluechips (WBTC 8 decimals, WETH 18 decimals).

### Sepolia Testnet Reference (chain_id: 11155111)

Valuation asset: USDC `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (6 decimals)

Supported assets with verified Uniswap pool liquidity:

| Asset | Address | Decimals | Pool Liquidity |
|---|---|---|---|
| ETH | `0x0000000000000000000000000000000000000000` | 18 | native, WRAP to WETH |
| WETH | `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14` | 18 | $8.8M+ |
| UNI | `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` | 18 | $7.74M |
| WBTC | `0x835ef3b3d6fb94b98bf0a3f5390668e4b83731c5` | 8 | $152K |

## Sequential Pipeline

### Step 1. Heartbeat Trigger

Entry criteria:
- heartbeat invocation has started

Actions:
1. Read `.env` for `MANAGED_WALLET_ADDRESS`, the RPC URL for the active network, `UNISWAP_API_KEY`, and `UNISWAP_API_BASE_URL`.
2. Read the strategy file to determine `metadata.mode` (mainnet or testnet) and the user ID.
3. Query the database for the supported asset list: contract addresses, decimals, types, chain_id.
4. Query the database for the user's target portfolio allocations.

Exit criteria:
- wallet address is resolved
- network mode is determined
- supported asset list is loaded from the database
- target portfolio allocations are loaded from the database

### Step 2. Portfolio Snapshot

Entry criteria:
- Step 1 completed

Actions:
1. Invoke the `portfolio-snapshot` skill with: wallet address, chain_id, supported asset list (from DB), valuation asset (USDC), RPC URL, Uniswap API credentials.
2. Receive back: per-asset balances, USD valuations, allocation percentages, total portfolio value.
3. If total portfolio value is zero or the snapshot is degraded, log the issue and exit the cycle early.

Exit criteria:
- a normalized portfolio snapshot with allocation percentages exists

### Step 3. Strategy Comparison

Entry criteria:
- Step 2 completed

Actions:
1. Read the strategy file. Extract strategy type (DCA, Lump Sum), pacing parameters, and constraints.
2. Use the target portfolio allocations from the database (loaded in Step 1). Each entry has an asset and an allocation percentage (0-100) representing the overall target for that asset.
3. For each asset, compute drift:
   `drift = current_allocation_pct - target_allocation_pct`
4. Build the action list:
   - **WRAP candidates:** If native ETH has a 0% target but WETH has a positive target, generate a WRAP action. WRAP is value-neutral and consumes zero notional budget.
   - **BUY candidates:** For assets where `drift < -threshold`, generate a buy action from USDC into the under-allocated asset. The buy amount is the gap in USD terms.
   - **SELL candidates:** For assets where `drift > +threshold`, generate a sell action from the over-allocated asset into USDC.
5. Apply strategy pacing:
   - **DCA:** Close only `rebalance_fraction_per_heartbeat` of each gap, capped by `max_rebalance_notional_usdc` total across all actions.
   - **Lump Sum:** Close the full gap in one cycle, subject to constraints.
6. Filter out dust actions where the USD amount is below `constraints.min_trade_notional_usd`.
7. If no actions remain after filtering, output "portfolio aligned, no rebalance needed" and exit.

Exit criteria:
- a deterministic action list exists, or a no-action decision is explicit

### Step 4. Swap Preparation

Entry criteria:
- Step 3 produced at least one action

Actions:
1. Invoke the `swap-preparation` skill with: the action list, chain_id, valuation asset, Uniswap API credentials, strategy constraints (slippage, price impact, gas limits).
2. Receive back: validated Uniswap quote packages for each action, plus any rejected actions with reasons.

Exit criteria:
- each proposed swap has a validated quote, or is explicitly rejected

### Step 5. Proposal Output

Entry criteria:
- Step 4 completed

Actions:
1. Format a structured Telegram message containing:
   - **Current portfolio:** asset | balance | USD value | current allocation %
   - **Target allocations:** asset | target % | drift
   - **Proposed swaps:** from token | to token | amount | expected output | slippage | price impact | gas estimate
   - **Rejected actions** (if any): action | reason
   - **Strategy note:** DCA status, fraction closed, remaining gap
   - **Total estimated gas cost**
2. Return `awaiting_user_approval`.

Exit criteria:
- the heartbeat cycle ends with a proposal sent to the user

## Hard Rules

- Never sign or broadcast transactions during the heartbeat cycle.
- Never widen the asset universe beyond the assets in the database.
- Never propose a swap for an asset that failed to price.
- If strategy math or asset identity is ambiguous, fail closed rather than guess.
- All valuations are in USDC terms.
- Always read asset and portfolio data from the database, never from hardcoded lists.
