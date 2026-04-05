---
name: swap-execution
description: Execute user-approved Uniswap swaps on-chain. Takes the approved subset of swap actions from the proposal, refreshes quotes, runs simulation preflight via /swap, signs and broadcasts transactions using cast, and reports results. Only runs after explicit per-swap user approval via Telegram.
---

# Swap Execution

This skill executes approved swaps on-chain. It is the **only** skill that calls `/swap`, signs transactions, and broadcasts.

## Load This Reference

- `references/uniswap-trading-api.md`

## Inputs

Provided by the orchestrator after user approval:

- `approved_actions` — array of approved swap actions from the proposal, each with: action_id, action_type, token_in, token_out, amount_raw, chain_id
- `chain_id` — `1` (mainnet) or `11155111` (sepolia)
- `valuation_asset` — USDC address for the active network
- `wallet_address` — the managed wallet's public address
- `constraints` — from strategy: max_slippage_bps, max_price_impact_pct

Read from `.env`:
- `MANAGED_WALLET_PRIVATE_KEY`
- `UNISWAP_API_KEY`
- `UNISWAP_API_BASE_URL`
- RPC URL for the active network (`ETHEREUM_RPC_URL` or `ETHEREUM_SEPOLIA_RPC_URL`)

## Sequential Pipeline

Process each approved action **one at a time, sequentially**. Do not batch or parallelize — each swap must complete before the next begins.

### Phase 1. Refresh Approval

Entry criteria:
- approved action is ready for execution

Actions:
1. Call `POST {base_url}/check_approval` with the token_in address, amount_raw, chain_id, and wallet_address.
2. If `approval.isRequired` is true:
   - Extract the approval transaction data (`to`, `data`, `value`).
   - Execute via cast:
     ```
     cast send $APPROVAL_TO \
       --data $APPROVAL_DATA \
       --value $APPROVAL_VALUE \
       --private-key $MANAGED_WALLET_PRIVATE_KEY \
       --rpc-url $RPC_URL
     ```
   - Wait for the approval tx to be mined.
   - If approval tx fails, mark this action as `failed_approval` and skip to the next action.
3. For WRAP/UNWRAP or native ETH actions: skip approval (not needed).

Exit criteria:
- token is approved for spending, or action is skipped

### Phase 2. Refresh Quote

Entry criteria:
- Phase 1 passed (approval confirmed or not needed)

Actions:
1. Call `POST {base_url}/quote` with the same parameters as swap-preparation:
   - `tokenIn`, `tokenOut`, `tokenInChainId`, `tokenOutChainId`, `amount` (raw string), `type: EXACT_INPUT`, `swapper`, `routingPreference: BEST_PRICE`, `protocols: [V2, V3, V4]`
   - Slippage from constraints
2. Validate the refreshed quote:
   - `routing` must be `CLASSIC`, `WRAP`, or `UNWRAP`
   - `requestId` and `quote.quoteId` present
   - Price impact within limits
   - No `txFailureReasons` (mainnet) or treat as warning (testnet)
3. If the refreshed output dropped more than 10% compared to the proposal quote, warn the user and mark as `output_drift_warning`.
4. If validation fails, mark this action as `failed_quote` and skip to the next action.

Exit criteria:
- a fresh, validated quote exists for this action

### Phase 3. Get Unsigned Transaction

Entry criteria:
- Phase 2 passed

Actions:
1. Call `POST {base_url}/swap` with:
   - **On mainnet (chain_id 1):**
     ```json
     {
       "quote": { /* the full refreshed quote.quote sub-object */ },
       "simulateTransaction": true,
       "refreshGasPrice": true,
       "safetyMode": "SAFE"
     }
     ```
   - **On testnet (chain_id 11155111):**
     ```json
     {
       "quote": { /* the full refreshed quote.quote sub-object */ },
       "simulateTransaction": false
     }
     ```
     Note: Sepolia testnet simulation fails due to Permit2 signature requirements in the simulation environment. Use `simulateTransaction: false` to skip simulation and get the unsigned tx directly.
2. Validate the response:
   - `swap.from` must equal `wallet_address`
   - `swap.chainId` must equal `chain_id`
   - `swap.to` and `swap.data` must be non-empty
   - On mainnet: `simulationError` must be `null`
3. If the call fails or validation fails, mark this action as `failed_swap` and skip to the next action.

Exit criteria:
- unsigned transaction is ready

### Phase 4. Sign and Broadcast

Entry criteria:
- Phase 3 passed

Actions:
1. Extract the unsigned transaction from the /swap response: `to`, `data`, `value`, `chainId`.
2. Execute via cast:
   ```
   cast send $SWAP_TO \
     --data $SWAP_DATA \
     --value $SWAP_VALUE \
     --private-key $MANAGED_WALLET_PRIVATE_KEY \
     --rpc-url $RPC_URL
   ```
3. `cast send` blocks until the transaction is mined and returns the tx hash.
4. If the transaction reverts, mark this action as `failed_broadcast`.

Exit criteria:
- transaction is confirmed on-chain with a tx hash

### Phase 5. Report

Entry criteria:
- Phase 4 completed (success or failure)

Actions:
1. Build an execution result for this action:
   ```
   {
     action_id,
     action_type,
     token_in,
     token_out,
     amount_in,
     expected_output,
     tx_hash (if successful),
     status: "executed" | "failed_approval" | "failed_quote" | "failed_simulation" | "failed_broadcast",
     error_reason (if failed),
     block_explorer_url (if executed)
   }
   ```
2. For Sepolia: block explorer URL is `https://sepolia.etherscan.io/tx/{tx_hash}`
3. For mainnet: block explorer URL is `https://etherscan.io/tx/{tx_hash}`

Exit criteria:
- execution result is recorded, proceed to next approved action

## Output

After all approved actions are processed, return:

```
{
  executed_actions: [...],
  failed_actions: [...],
  total_executed: number,
  total_failed: number
}
```

## Sepolia Routing Notes

- **WBTC sell:** On Sepolia, WBTC has no direct route to USDC. When selling WBTC, set `tokenOut` to WETH instead of USDC. Uniswap will route WBTC→WETH (0.05% impact). If the orchestrator needs USDC, chain a second swap WETH→USDC.
- **Simulation:** On Sepolia testnet, use `simulateTransaction: false` because Permit2 signature simulation fails. On mainnet, always use `simulateTransaction: true`.
- **`txFailureReasons`:** On Sepolia, `SIMULATION_ERROR` in quote responses is expected and not a blocker — the `/swap` endpoint still produces valid unsigned transactions.

## Hard Rules

- **ONLY execute swaps the user explicitly approved.** Never execute rejected or unapproved swaps.
- **ALWAYS refresh the quote** before calling /swap. Never reuse proposal-phase quotes.
- **On mainnet:** always simulate before signing (`simulateTransaction: true`).
- **On testnet:** skip simulation (`simulateTransaction: false`) due to Permit2 limitations.
- **NEVER batch transactions.** Execute one swap at a time, sequentially.
- **Reject** if routing changed from the proposal (e.g., was CLASSIC, now DUTCH_V2).
- **Reject** if `swap.from` doesn't match the managed wallet.
- **Report every result** to the user immediately, including failures.
- Only `CLASSIC`, `WRAP`, `UNWRAP` routing accepted.
- Rate limit: 150ms spacing between API calls, exponential backoff on 429.
- Pass the `quote` sub-object to `/swap`, not the full quote response.
