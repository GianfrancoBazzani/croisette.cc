---
name: portfolio-manager
description: Heartbeat-driven portfolio manager. Triggered periodically to snapshot the on-chain portfolio, compare it against the target strategy, prepare Uniswap swap quotes, propose changes via Telegram with per-swap approval, and execute approved swaps on-chain.
---

# Portfolio Manager

Single entry point for every heartbeat cycle. Executes a strict 7-step pipeline.

## Active Skills

- `portfolio-snapshot` — fetches balances on Sepolia + Arc
- `swap-preparation` — gets Uniswap quotes for Sepolia swaps
- `swap-execution` — executes approved Sepolia swaps
- `usdc-bridge` — bridges USDC from Sepolia to Arc via CCTP

## Data Sources

All structured data lives in the SQLite database. See `TOOLS.md` for access patterns.

- **Supported assets:** `SELECT * FROM asset` — returns ticker, type, description, contract address, chain_id, decimals.
- **Target portfolio:** `SELECT a.ticker, a.type, e.allocation FROM ideal_portfolio p JOIN ideal_portfolio_entry e ON e.portfolioId = p.id JOIN asset a ON a.id = e.assetId WHERE p.userId = "<USER_ID>"` — returns per-asset target allocation percentages.

The database is the single source of truth. The target portfolio is written by the portfolio-builder agent during onboarding. This agent only reads it.

## Supported Networks

The active network is determined by the chain_id of the assets in the database.

- chain_id `1` -> mainnet, RPC from `ETHEREUM_RPC_URL`
- chain_id `11155111` -> Sepolia testnet, RPC from `ETHEREUM_SEPOLIA_RPC_URL`

### Mainnet Reference (chain_id: 1)

Valuation asset: USDC `0xA0b86991c6218b36c1d19D4a2e9Eb0Ce3606eB48` (6 decimals)

Supported asset types: stocks (Ondo tokenized equities, 18 decimals), crypto_bluechips (WBTC 8 decimals, WETH 18 decimals).

### Sepolia Testnet Reference (chain_id: 11155111)

Valuation asset: USDC `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (6 decimals)

Supported assets with verified Uniswap pool liquidity and executable swap routes:

| Asset | Address | Decimals | Buy (USDC→) | Sell (→USDC) |
|---|---|---|---|---|
| ETH | `0x0000000000000000000000000000000000000000` | 18 | WRAP | UNWRAP |
| WETH | `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14` | 18 | ✅ 0.44% impact | ✅ 1% impact |
| WBTC | `0x835ef3b3d6fb94b98bf0a3f5390668e4b83731c5` | 8 | ✅ 0.08% impact | ⚠️ sell via WETH only |
| LINK | `0x779877A7B0D9E8603169DdbD7836e478b4624789` | 18 | ✅ 0.42% impact | ✅ 2.09% impact |
| USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | 6 | — (valuation asset) | — |

**Routing note:** WBTC cannot be sold directly to USDC on Sepolia (no route). When selling WBTC, route through WETH first (WBTC→WETH at 0.05% impact, then WETH→USDC).

**Demo strategy:** WETH 50% / WBTC 30% / LINK 20% (set via portfolio-builder onboarding).

**Testnet swap note:** On Sepolia, Uniswap `/swap` simulation (`simulateTransaction: true`) fails due to Permit2 signature requirements. Use `simulateTransaction: false` on testnet to get the unsigned transaction directly. On mainnet, simulation should work normally.

## Sequential Pipeline

### Step 1. Heartbeat Trigger

Entry criteria:
- heartbeat invocation has started

Actions:
1. Read `.env` for `MANAGED_WALLET_ADDRESS`, the RPC URL for the active network, `UNISWAP_API_KEY`, and `UNISWAP_API_BASE_URL`.
2. Determine the active network from the chain_id of the assets in the database.
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
1. Invoke the `portfolio-snapshot` skill to fetch balances on **both chains**:
   - **Sepolia (investing):** all Sepolia assets from the DB
   - **Arc (emergency liquidity):** ARC_USDC, ARC_EURC, ARC_USYC from the DB
2. Receive back: per-asset balances and USD valuations for both chains.
3. If Sepolia total portfolio value is zero or the snapshot is degraded, log the issue and exit the cycle early.

Exit criteria:
- investing portfolio snapshot (Sepolia) with allocation percentages exists
- emergency liquidity snapshot (Arc) with USD values exists

### Step 3. Strategy Comparison

Entry criteria:
- Step 2 completed

Actions:

**3a. Investing portfolio (Sepolia):**
1. Use the target portfolio allocations from the database (loaded in Step 1). Each entry has an asset and an allocation percentage (0-100) representing the overall target for that asset.
2. For each asset, compute drift:
   `drift = current_allocation_pct - target_allocation_pct`
3. **Apply rebalance threshold (±5%).** If ALL Sepolia assets have `|drift| < 5%`, mark the investing portfolio as "aligned".
4. Build the action list only for assets that exceed the threshold:
   - **WRAP candidates:** If native ETH has a 0% target but WETH has a positive target, generate a WRAP action.
   - **BUY candidates:** For assets where `drift < -5%`, generate a buy action from USDC into the under-allocated asset.
   - **SELL candidates:** For assets where `drift > +5%`, generate a sell action from the over-allocated asset into USDC.
5. Filter out dust actions (< $1 on testnet, < $10 on mainnet).

**3b. Emergency liquidity (Arc):**
6. Check the ARC_USDC balance from the snapshot.
7. Compare against the emergency liquidity target (from TOOLS.md — default $50 ARC_USDC).
8. **If `ARC_USDC > emergency_target` (surplus on Arc):**
   - Calculate surplus: `surplus = ARC_USDC_balance - emergency_target`
   - Add a **BRIDGE Arc→Sepolia** action: bridge `surplus` USDC from Arc to Sepolia for investing
   - This generates USDC on Sepolia that can be used for BUY swaps
9. **If `ARC_USDC < emergency_target` (deficit on Arc):**
   - Calculate gap: `gap = emergency_target - ARC_USDC_balance`
   - Add a **BRIDGE Sepolia→Arc** action: bridge `gap` USDC from Sepolia to Arc
10. **If `ARC_USDC == emergency_target`:** no bridge needed.

**3c. Combined decision:**
10. If the investing portfolio is "aligned" AND no bridge is needed: output "portfolio aligned, no rebalance needed" and exit the cycle.
11. If any actions exist: proceed to Step 4.

Exit criteria:
- a deterministic action list exists (swaps + optional bridge), or a no-action decision is explicit

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
1. Format a structured Telegram message with **numbered actions** for per-action approval:

   ```
   📊 Rebalance Proposal

   INVESTING PORTFOLIO (Sepolia):
   • WETH: 0.263 ($1,603) — 50.3%
   • WBTC: 0.013 ($961) — 30.2%
   • LINK: 18.2 ($339) — 10.6%
   Target: WETH 50% | WBTC 30% | LINK 20%

   EMERGENCY LIQUIDITY (Arc):
   • ARC_USDC: $100 / $500 target (needs $400 bridge)

   Proposed actions:
   1️⃣ SELL 0.116 WETH → ~700 USDC — impact 0.1%
   2️⃣ BUY ~467 USDC → WBTC — impact 0.4%
   3️⃣ BUY ~301 USDC → LINK — impact 1.2%
   4️⃣ BRIDGE ~400 USDC Sepolia → Arc (emergency liquidity)

   Reply: "approve all", "approve 1,2,3", or "reject all"
   ```

2. Wait for user reply.

Exit criteria:
- proposal sent, awaiting user response

### Step 6. Parse Approval

Entry criteria:
- user replied via Telegram

Actions:
1. Parse the user's reply:
   - `approve all` → all numbered swaps are approved
   - `approve 1,3` or `approve 1, 3` → only the specified swap numbers are approved
   - `approve 1` → only swap 1 is approved
   - `reject all` or `reject` → no swaps approved, cycle ends
   - Anything else → reply "I didn't understand. Reply with 'approve all', 'approve 1,2', or 'reject all'" and wait again
2. Map approved numbers back to the swap action objects from Step 4.
3. If all swaps were rejected, send a confirmation message and exit the cycle.

Exit criteria:
- a list of approved swap actions exists, or the cycle is explicitly cancelled

### Step 7. Execute Approved Swaps

Entry criteria:
- Step 6 produced at least one approved swap

Actions:
1. **Sort approved actions in execution order:**
   - BRIDGE Arc→Sepolia first (if Arc has surplus) — generates USDC on Sepolia
   - WRAP next (ETH → WETH) — value-neutral, no API
   - SELL next (over-allocated → USDC) — generates more USDC for buys
   - BUY next (USDC → under-allocated) — uses USDC from bridge + sells
   - BRIDGE Sepolia→Arc last (if Arc has deficit) — tops up emergency fund

2. **For WRAP:** Skip if ETH balance < 0.01 ETH. Otherwise wrap all ETH minus 0.01 gas reserve.

3. **For SELL swaps:** Use the pre-calculated amount from the proposal.

4. **For BUY swaps:** Do NOT use pre-calculated USD amounts. Instead:
   - Before each BUY, query the actual USDC balance on-chain
   - If there are more BUYs or a BRIDGE after this one, reserve the appropriate portion
   - If multiple BUYs remain, split proportionally based on target allocation ratios
     - Example: WBTC target 30%, LINK target 20% → WBTC gets 60% of USDC, LINK gets 40%
   - If this is the last BUY (and no BRIDGE pending), use the full remaining USDC balance
   - This handles slippage from earlier swaps automatically

5. **For BRIDGE:** Use the `usdc-bridge` skill to bridge USDC from Sepolia to Arc.
   - The bridge script: approve USDC for TokenMessengerV2, call `depositForBurn`, wait for attestation
   - Query actual USDC balance before bridging (don't use pre-calculated amounts)
   - Use the full remaining USDC if that's less than the proposed bridge amount
   - See `usdc-bridge/SKILL.md` for the full bridge flow and contract addresses

6. **Execute each action** using the appropriate skill (one script per action).

6. **Send execution report:**

   ```
   ✅ Execution Report

   1️⃣ WRAP 0.009 ETH → WETH — ⏭️ Skipped (insufficient ETH)
   2️⃣ SELL 0.116 WETH → 709 USDC — ✅ tx: sepolia.etherscan.io/tx/0x...
   3️⃣ BUY 425 USDC → WBTC — ✅ tx: sepolia.etherscan.io/tx/0x...
   4️⃣ BUY 284 USDC → LINK — ✅ tx: sepolia.etherscan.io/tx/0x...

   Total: 3/4 swaps executed
   ```

Exit criteria:
- all approved swaps have been attempted and reported
- the heartbeat cycle is complete

## Hard Rules

- Never execute a swap without explicit user approval via Telegram.
- Never reuse proposal-phase quotes for execution — always refresh.
- Never widen the asset universe beyond the assets in the database.
- Never propose a swap for an asset that failed to price.
- If strategy math or asset identity is ambiguous, fail closed rather than guess.
- All valuations are in USDC terms.
- Always read asset and portfolio data from the database, never from hardcoded lists.
- Execute swaps sequentially, one at a time, never in parallel.
