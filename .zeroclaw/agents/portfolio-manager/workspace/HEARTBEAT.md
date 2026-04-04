# HEARTBEAT.md

Run the full portfolio management cycle on Sepolia testnet (chainId 11155111).
Use dynamically assembled scripts — never hardcode asset lists. Read TOOLS.md for DB schema.

## Step 1: Load configuration

Read `.env` via file_read. Then query the DB in one shell call:
```bash
sqlite3 -json sqlite.db "SELECT ticker, address, chainId, decimals, type FROM asset WHERE chainId = 11155111" && echo '---' && sqlite3 -json sqlite.db "SELECT a.ticker, a.type, e.allocation FROM ideal_portfolio p JOIN ideal_portfolio_entry e ON e.portfolioId = p.id JOIN asset a ON a.id = e.assetId WHERE p.userId = 'test-user-001'"
```

## Step 2: Fetch balances

From Step 1 results, dynamically assemble `tmp_balances.sh` via file_write. The script should:
- Set WALLET and RPC from .env values
- For each asset from the DB query: call `./bin/cast balance` (native) or `./bin/cast call balanceOf` (ERC-20)
- Output JSON with all balances

Then run: `bash tmp_balances.sh`

## Step 3: Fetch Uniswap prices

From Step 2 results, filter assets with balance > 0. Dynamically assemble `tmp_prices.sh` via file_write. The script should:
- Set API_KEY, API_BASE, WALLET from .env values
- Define a `quote()` function that calls the Uniswap `/quote` API
- For each held asset: call `quote(tokenAddress, rawBalance)` against USDC
- Value USDC at par
- Output JSON with all USD values

Then run: `bash tmp_prices.sh`

## Step 4: Compute allocations + compare strategy

From the prices, compute: `value_usdc = value_usdc_raw / 1000000`, `total = sum(all)`, `pct = value/total*100`.
Compare current vs target allocations from Step 1. Compute drift per asset.

**Rebalance threshold: ±5%.** If ALL assets have |drift| < 5%, output "Portfolio aligned, no rebalance needed" and STOP. Do not propose any swaps.

Only if at least one asset exceeds ±5% drift, build action list:
- WRAP: native ETH → WETH if ETH held and WETH in target
- SELL: assets with drift > +5% → USDC
- BUY: USDC → assets with drift < -5%
- Filter dust (< $1)

## Step 5: Get swap quotes + propose

For each action, assemble `tmp_quote.sh` to get a Uniswap quote showing expected output. Run it. Format numbered proposal:

```
📊 Rebalance Proposal

Current: [asset table with balances, values, %]
Target: WETH 50% | WBTC 30% | LINK 20%

Proposed swaps:
1️⃣ [action] — expected: [output], impact: [X]%
2️⃣ [action] — expected: [output], impact: [X]%

Reply: "approve all", "approve 1,2", or "reject all"
```

## Step 6: Parse approval

Wait for user reply. Map approved numbers to swap actions.

## Step 7: Execute approved swaps

For each approved swap, assemble `tmp_swap.sh` via file_write with the full execution pipeline (check approval → fresh quote → /swap → cast send). Run it. Report tx hash to user:

```
✅ Execution Report
1️⃣ [swap] — ✅ tx: sepolia.etherscan.io/tx/0x...
```

Clean up: `rm tmp_balances.sh tmp_prices.sh tmp_quote.sh tmp_swap.sh`
