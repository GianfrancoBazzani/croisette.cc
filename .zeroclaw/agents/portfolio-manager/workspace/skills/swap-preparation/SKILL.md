---
name: swap-preparation
description: Convert rebalance actions into validated Uniswap quote packages. Takes an action list from the orchestrator, checks token approvals, fetches quotes via the Uniswap Trading API, validates routing and conditions, and returns proposal-ready swap data. Proposal-mode only — never calls /swap, never signs, never broadcasts.
---

# Swap Preparation

This skill turns allocation-gap actions into Uniswap-ready proposal artifacts.

## Load This Reference

- `references/uniswap-trading-api.md`

## Inputs

Provided by the orchestrator:

- `actions` — array of swap actions, each with: action_type (BUY/SELL/WRAP/UNWRAP), token_in, token_out, amount_raw, amount_usdc, chain_id
- `chain_id` — `1` (mainnet) or `11155111` (sepolia)
- `valuation_asset` — USDC address for the active network
- `uniswap_api_key` — Trading API authentication
- `uniswap_api_base_url` — Trading API base URL
- `wallet_address` — the managed wallet's public address
- `constraints` — from strategy: max_slippage_bps, max_price_impact_pct, max_gas_cost_usd, quote_ttl_sec

## Sequential Pipeline

### Phase 1. Check Approvals

Entry criteria:
- action list is available

Actions:
1. For each action where `token_in` is an ERC-20 token (not native ETH, not a WRAP/UNWRAP):
   - Call `POST {base_url}/check_approval` with:
     ```
     token: token_in address
     amount: amount_raw (string)
     chainId: chain_id
     walletAddress: wallet_address
     ```
   - Record whether approval is needed and the approval transaction data if so.
2. For WRAP actions (native ETH -> WETH): mark approval as not required.
3. For UNWRAP actions (WETH -> native ETH): mark approval as not required.

Exit criteria:
- approval status is known for every action

### Phase 2. Fetch Quotes

Entry criteria:
- Phase 1 completed

Actions:
1. For each action, call `POST {base_url}/quote` with:
   ```
   tokenIn: token_in address
   tokenOut: token_out address
   tokenInChainId: chain_id
   tokenOutChainId: chain_id
   amount: amount_raw (string)
   type: EXACT_INPUT
   swapper: wallet_address
   routingPreference: BEST_PRICE
   protocols: [V2, V3, V4]
   ```
   - Do NOT include `generatePermitAsTransaction` or `permitAmount` — the execution phase handles approvals separately via Permit2.
   - On mainnet: set `slippageTolerance` from `constraints.max_slippage_bps`. Default: `80` (0.8%).
   - On testnet: omit slippageTolerance (use auto).
2. Space requests by 150ms to respect rate limits. On HTTP 429, apply exponential backoff (1s initial, 30s max, with jitter).
3. Accept only quotes with `routing` in: `CLASSIC`, `WRAP`, `UNWRAP`.

Exit criteria:
- each action has a fresh quote or an explicit rejection

### Phase 3. Validate and Build Proposal

Entry criteria:
- Phase 2 completed

Actions:
1. For each quote response, validate:
   - `requestId` is present
   - `quote.quoteId` is present (for market trades, not WRAP/UNWRAP)
   - `routing` is `CLASSIC`, `WRAP`, or `UNWRAP`
   - No `txFailureReasons` on mainnet. On testnet, treat `txFailureReasons` as a warning, not a rejection.
   - Price impact does not exceed `constraints.max_price_impact_pct` (default: 5% mainnet, relaxed on testnet)
   - Gas estimate does not exceed `constraints.max_gas_cost_usd`
   - Quote age is within `constraints.quote_ttl_sec` at proposal assembly time
   - No unexpected fee recipients in the route
2. For valid quotes, build a proposal artifact per action:
   ```
   {
     action_id: deterministic hash of (token_in, token_out, amount_raw, chain_id),
     action_type: BUY | SELL | WRAP | UNWRAP,
     token_in: { address, symbol, decimals },
     token_out: { address, symbol, decimals },
     amount_in_raw: string,
     amount_in_human: number,
     expected_output_raw: string,
     expected_output_human: number,
     min_output_after_slippage: number,
     slippage_bps: number,
     price_impact_pct: number,
     gas_estimate_usd: number,
     routing: CLASSIC | WRAP | UNWRAP,
     quote_request_id: string,
     quote_id: string,
     quote_timestamp: ISO string,
     approval_required: boolean,
     approval_tx: object (if needed)
   }
   ```
3. Place rejected actions in `rejected_actions` with explicit reason.

Exit criteria:
- only validated proposal quotes remain in the output

## Output

Return:

```
{
  swap_actions: [...],
  rejected_actions: [{ action, reason }]
}
```

## Hard Rules

- **NEVER** call the `/swap` endpoint. This skill is proposal-mode only.
- **NEVER** sign transactions or produce signable data.
- **NEVER** broadcast anything.
- Only accept `CLASSIC`, `WRAP`, `UNWRAP` routing. Reject `DUTCH_V2`, `DUTCH_V3`, `PRIORITY`, `BRIDGE`, and any order-based routing.
- All swaps are denominated against the network's USDC.
- Do not quote assets outside the supported list from the database.
- Do not mutate quote response objects.
- Respect Uniswap API rate limits (150ms spacing, exponential backoff on 429).
