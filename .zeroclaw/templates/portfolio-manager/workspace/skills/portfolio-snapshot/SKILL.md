---
name: portfolio-snapshot
description: Fetch the current on-chain portfolio state for the managed wallet. Reads balances for all supported assets from the database, prices held assets via the Uniswap Trading API against USDC, and computes allocation percentages. Works on both Ethereum mainnet and Sepolia testnet.
---

# Portfolio Snapshot

This skill establishes the current portfolio state for the heartbeat run.

## Inputs

Provided by the orchestrator:

- `wallet_address` — the managed wallet's public address
- `chain_id` — `1` (mainnet) or `11155111` (sepolia)
- `supported_assets` — array of assets from the database, each with: ticker, contract address, decimals, type, section
- `valuation_asset` — USDC address and decimals for the active network
- `rpc_url` — Ethereum JSON-RPC endpoint
- `uniswap_api_key` — Trading API authentication
- `uniswap_api_base_url` — Trading API base URL

## Sequential Pipeline

### Phase 1. Fetch Balances

Entry criteria:
- all inputs are available

Actions:
1. For each asset in the supported list:
   - If the asset address is the zero address (`0x0000...0000`) or the asset is flagged as native: fetch the wallet's native ETH balance via `eth_getBalance`.
   - Otherwise: encode `balanceOf(wallet_address)` and call `eth_call` on the asset's contract address via the RPC endpoint.
2. Also fetch the balance of the valuation asset (USDC) on the same chain. This is a deployable funding balance available for buying under-allocated assets.
3. Parse each hex response into a raw balance integer.
4. Normalize to human-readable units: `normalized_balance = raw_balance / 10^decimals` using the pinned decimals from the database.
5. Filter: keep only assets where `raw_balance > 0`.

Exit criteria:
- every supported asset has a balance result (zero or positive)
- only assets with positive balance proceed to pricing

### Phase 2. Price via Uniswap

Entry criteria:
- Phase 1 completed, at least one asset has balance > 0

Actions:
1. For each held asset (balance > 0):
   - If the asset IS the valuation asset (USDC): value at par (`total_value_usdc = normalized_balance`), skip the Uniswap quote.
   - Otherwise: call `POST {uniswap_api_base_url}/quote` with:
     ```
     tokenIn: asset contract address (use zero address for native ETH)
     tokenOut: valuation asset (USDC) address
     tokenInChainId: chain_id
     tokenOutChainId: chain_id
     amount: raw balance (full held amount as string)
     type: EXACT_INPUT
     routingPreference: BEST_PRICE
     protocols: [V2, V3, V4]
     swapper: wallet_address
     ```
   - Headers: `x-api-key`, `Content-Type: application/json`, `x-universal-router-version: 2.0`
2. From each quote response, extract:
   - `total_value_usdc = quote.output.amount / 10^6` (USDC has 6 decimals)
   - `unit_price_usdc = total_value_usdc / normalized_balance`
   - `quote_request_id = requestId`
   - `routing` (must be CLASSIC, WRAP, or UNWRAP)
3. If a quote call fails or returns unsupported routing:
   - Log a warning with the asset ticker and error.
   - Mark the asset as `unpriced`.
   - Mark the overall snapshot as `degraded`.
4. Rate limit: space quote calls by 150ms. On HTTP 429, apply exponential backoff (1s initial, 30s max).

Exit criteria:
- every held asset is either priced or explicitly marked as unpriced

### Phase 3. Compute Allocations

Entry criteria:
- Phase 2 completed

Actions:
1. Sum `total_value_usdc` across all priced held assets (including USDC balance) to get `total_portfolio_value_usdc`.
2. For each priced asset: `allocation_pct = (total_value_usdc / total_portfolio_value_usdc) * 100`.
3. Aggregate by asset type/section to compute section-level allocation percentages.

Exit criteria:
- asset-level and section-level allocation percentages are computed

## Output

Return a structured snapshot:

```
{
  wallet_address,
  chain_id,
  snapshot_timestamp,
  status: "healthy" | "degraded",
  total_portfolio_value_usdc,
  positions: [
    {
      asset,
      address,
      chain_id,
      decimals,
      section,
      raw_balance,
      normalized_balance,
      unit_price_usdc,
      total_value_usdc,
      allocation_pct,
      quote_request_id (optional),
      routing (optional)
    }
  ],
  unpriced_positions: [...],
  section_allocations: { section: pct }
}
```

## Hard Rules

- Only query assets from the database-provided supported list. Never scan for arbitrary tokens.
- Do not price assets with zero balance.
- Do not substitute external reference prices for Uniswap quotes.
- If any held asset fails to price, mark the snapshot as degraded — do not silently ignore it.
- Use the full held balance for the quote amount, not a sample 1-token amount.
- All values are denominated in USDC.
