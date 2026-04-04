---
name: portfolio-snapshot
description: Fetch the current on-chain portfolio state. Dynamically assembles scripts from DB data. Never hardcodes secrets.
---

# Portfolio Snapshot

Fetches the current portfolio state in **3 rounds**.

## CRITICAL: Loading secrets

Zeroclaw REDACTS secrets when you read .env via file_read. Generated scripts must NEVER hardcode API keys or private keys. Instead, every script must start with:

```bash
export $(grep -v '^#' .env | xargs)
```

Then use `$MANAGED_WALLET_ADDRESS`, `$ETHEREUM_SEPOLIA_RPC_URL`, `$UNISWAP_API_KEY`, `$UNISWAP_API_BASE_URL`, etc.

## Round 1: Query DB for assets (1 shell)

```bash
sqlite3 -json sqlite.db "SELECT ticker, address, chainId, decimals, type FROM asset WHERE chainId = 11155111"
```

## Round 2: Assemble and run balance-fetching script (1 file_write + 1 shell)

From the DB results, write `tmp_balances.sh` via file_write. **Load env at runtime, don't hardcode secrets:**

```bash
#!/bin/sh
export $(grep -v '^#' .env | xargs)
CAST=./bin/cast
RPC=$ETHEREUM_SEPOLIA_RPC_URL
WALLET=$MANAGED_WALLET_ADDRESS
echo "["
# For EACH asset from the DB query, add one line:
# Native ETH (address 0x000...000):
echo "{\"ticker\":\"SEP_ETH\",\"decimals\":18,\"address\":\"0x0000000000000000000000000000000000000000\",\"balance\":\"$($CAST balance $WALLET --rpc-url $RPC)\"},"
# ERC-20 tokens:
echo "{\"ticker\":\"SEP_WETH\",\"decimals\":18,\"address\":\"0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14\",\"balance\":\"$($CAST call 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14 'balanceOf(address)(uint256)' $WALLET --rpc-url $RPC)\"},"
# ... one echo line per asset from the DB ...
echo "]"
```

Execute: `bash tmp_balances.sh`

## Round 3: Assemble and run price-fetching script (1 file_write + 1 shell)

From Round 2 results, filter assets with balance > 0. Write `tmp_prices.sh`:

```bash
#!/bin/sh
export $(grep -v '^#' .env | xargs)
USDC=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
CHAIN=11155111
WALLET=$MANAGED_WALLET_ADDRESS

quote() {
  curl -s -X POST "$UNISWAP_API_BASE_URL/quote" \
    -H "x-api-key: $UNISWAP_API_KEY" \
    -H "Content-Type: application/json" \
    -H "x-universal-router-version: 2.0" \
    -d "{\"tokenIn\":\"$1\",\"tokenOut\":\"$USDC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$2\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"]}"
}

echo "["
# For each held asset with balance > 0 (NOT USDC):
echo "{\"ticker\":\"SEP_ETH\",\"quote\":$(quote '0x0000000000000000000000000000000000000000' '<RAW_BALANCE>')},"
echo "{\"ticker\":\"SEP_WETH\",\"quote\":$(quote '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' '<RAW_BALANCE>')},"
# USDC at par:
echo "{\"ticker\":\"SEP_USDC\",\"value_usdc_raw\":\"<USDC_RAW_BALANCE>\",\"routing\":\"PAR\"}"
echo "]"
```

Execute: `bash tmp_prices.sh`

## Round 4: Compute allocations (no shell — just math)

From each quote, extract `quote.output.amount`:
- `value_usdc = output_amount / 1000000`
- `total = sum(all values)`
- `pct = (value / total) * 100`

Present as a table.

## Key rules

- **NEVER hardcode secrets** in scripts — always use `export $(grep -v '^#' .env | xargs)`
- NEVER guess prices — always use real Uniswap quotes
- On Sepolia: `SIMULATION_ERROR` in quotes is normal, ignore it
- Only pass assets with balance > 0 to the price script
- Clean up: `rm tmp_balances.sh tmp_prices.sh`
