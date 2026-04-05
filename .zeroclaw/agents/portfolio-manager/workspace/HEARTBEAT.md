# HEARTBEAT.md

Run the full portfolio management cycle on Sepolia testnet (chainId 11155111) and Arc testnet (chainId 5042002).
Use dynamically assembled scripts — never hardcode asset lists or secrets. Read TOOLS.md for DB schema and emergency target.

## Step 1: Load configuration

Read `.env` via file_read. Then query the DB in one shell call:
```bash
sqlite3 -json sqlite.db "SELECT ticker, address, chainId, decimals, type FROM asset WHERE chainId IN (11155111, 5042002)" && echo '---' && sqlite3 -json sqlite.db "SELECT a.ticker, a.type, e.allocation FROM ideal_portfolio p JOIN ideal_portfolio_entry e ON e.portfolioId = p.id JOIN asset a ON a.id = e.assetId WHERE p.userId = 'test-user-001'"
```

## Step 2: Fetch balances on BOTH chains

Dynamically assemble `tmp_balances.sh` that fetches:
- **Sepolia balances:** using `$ETHEREUM_SEPOLIA_RPC_URL` for each Sepolia asset
- **Arc balances:** using `$ARC_RPC_URL` for each Arc asset (ARC_USDC, ARC_EURC, ARC_USYC)

Then: `bash tmp_balances.sh`

## Step 3: Fetch Uniswap prices (Sepolia only)

For Sepolia held assets (balance > 0), assemble `tmp_prices.sh` with Uniswap quotes.
Arc assets are valued at par (ARC_USDC = $1 per unit, ARC_EURC = $1 per unit for testnet).

Then: `bash tmp_prices.sh`

## Step 4: Compute allocations + compare strategy

**Investing (Sepolia):**
Compute `value_usdc = value_usdc_raw / 1000000`, `total = sum(all)`, `pct = value/total*100`.
Compare vs target allocations from Step 1.

**Rebalance threshold: ±5%.** If ALL Sepolia assets have |drift| < 5%, investing portfolio is aligned.

Only if at least one Sepolia asset exceeds ±5% drift, build swap action list:
- WRAP: native ETH → WETH if ETH held and WETH in target
- SELL: assets with drift > +5% → USDC
- BUY: USDC → assets with drift < -5%
- Filter dust (< $1)

**Emergency liquidity (Arc):**
Check ARC_USDC balance vs emergency target ($500 — see TOOLS.md).
If `ARC_USDC < target`: add a BRIDGE action (Sepolia USDC → Arc USDC).
If `ARC_USDC >= target`: emergency is sufficient, no bridge needed.

If investing is aligned AND no bridge needed: output "Portfolio aligned, no rebalance needed" and STOP.

## Step 5: Get swap quotes + propose

For each Sepolia swap action, get a Uniswap quote. Format numbered proposal including both swap actions AND bridge action (if any):

```
📊 Rebalance Proposal

INVESTING (Sepolia):
• [asset table with balances, values, %]
Target: WETH 50% | WBTC 30% | LINK 20%

EMERGENCY (Arc):
• ARC_USDC: $X / $500 target

Proposed actions:
1️⃣ [swap/bridge description]
2️⃣ [swap/bridge description]

Reply: "approve all", "approve 1,2", or "reject all"
```

## Step 6: Parse approval

Wait for user reply. Map approved numbers to actions.

## Step 7: Execute approved actions

Execute in order: WRAP → SELL → BUY → BRIDGE

For Sepolia swaps: use `swap-execution` skill (assemble tmp_swap_N.sh).
For BRIDGE: use `usdc-bridge` skill (assemble tmp_bridge.sh using the pattern from usdc-bridge/SKILL.md).

Bridge uses the `usdc-bridge` skill. See `skills/usdc-bridge/SKILL.md` for the full script template.

Key details:
- TokenMessengerV2: `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` (same on both chains)
- Sepolia domain: 0, Arc domain: 26
- Arc→Sepolia: source RPC = `$ARC_RPC_URL`, source USDC = `0x3600...0000`, dest domain = 0
- Sepolia→Arc: source RPC = `$ETHEREUM_SEPOLIA_RPC_URL`, source USDC = `0x1c7D...7238`, dest domain = 26
- Mint takes ~2-5 minutes after burn

Report all results with tx hashes.

Clean up: `rm tmp_balances.sh tmp_prices.sh tmp_swap_*.sh tmp_bridge.sh`
