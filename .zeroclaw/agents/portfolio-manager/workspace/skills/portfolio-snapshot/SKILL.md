---
name: portfolio-snapshot
description: Fetch the current on-chain portfolio state across Sepolia (investing) and Arc (emergency liquidity). Dynamically assembles scripts from DB data. Never hardcodes secrets.
---

# Portfolio Snapshot

Fetches the current portfolio state across **two chains** in ~4 rounds.

## CRITICAL: Loading secrets

Zeroclaw REDACTS secrets when you read .env via file_read. Generated scripts must start with:
```bash
export $(grep -v '^#' .env | xargs)
```

## Round 1: Query DB for all assets (1 shell)

Query both Sepolia and Arc assets in one call:
```bash
sqlite3 -json sqlite.db "SELECT ticker, address, chainId, decimals, type FROM asset WHERE chainId IN (11155111, 5042002)"
```

## Round 2: Assemble and run balance-fetching script (1 file_write + 1 shell)

From the DB results, write `tmp_balances.sh` that fetches balances on BOTH chains:

```bash
#!/bin/sh
export $(grep -v '^#' .env | xargs)
CAST=./bin/cast
WALLET=$MANAGED_WALLET_ADDRESS

echo "{"
echo "\"sepolia\": ["
# For each Sepolia asset (chainId 11155111), use $ETHEREUM_SEPOLIA_RPC_URL:
echo "{\"ticker\":\"SEP_ETH\",\"chainId\":11155111,\"decimals\":18,\"address\":\"0x000...000\",\"balance\":\"$($CAST balance $WALLET --rpc-url $ETHEREUM_SEPOLIA_RPC_URL)\"},"
echo "{\"ticker\":\"SEP_WETH\",\"chainId\":11155111,\"decimals\":18,\"address\":\"0xfFf...\",\"balance\":\"$($CAST call 0xfFf... 'balanceOf(address)(uint256)' $WALLET --rpc-url $ETHEREUM_SEPOLIA_RPC_URL)\"},"
# ... one line per Sepolia asset from the DB ...
echo "],"

echo "\"arc\": ["
# For each Arc asset (chainId 5042002), use $ARC_RPC_URL:
echo "{\"ticker\":\"ARC_USDC\",\"chainId\":5042002,\"decimals\":6,\"address\":\"0x3600000000000000000000000000000000000000\",\"balance\":\"$($CAST call 0x3600000000000000000000000000000000000000 'balanceOf(address)(uint256)' $WALLET --rpc-url $ARC_RPC_URL)\"},"
echo "{\"ticker\":\"ARC_EURC\",\"chainId\":5042002,\"decimals\":6,\"address\":\"0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a\",\"balance\":\"$($CAST call 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a 'balanceOf(address)(uint256)' $WALLET --rpc-url $ARC_RPC_URL)\"},"
# ... one line per Arc asset from the DB ...
echo "]"
echo "}"
```

Execute: `bash tmp_balances.sh`

## Round 3: Assemble and run price-fetching script (1 file_write + 1 shell)

Only for **Sepolia** held assets with balance > 0. Arc assets (USDC, EURC) are valued at par — no Uniswap quotes needed.

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
# For each Sepolia held asset (balance > 0, NOT USDC):
echo "{\"ticker\":\"SEP_WETH\",\"quote\":$(quote '0xfFf...' '<RAW_BALANCE>')},"
# ... one line per held Sepolia asset ...
# Sepolia USDC at par:
echo "{\"ticker\":\"SEP_USDC\",\"value_usdc_raw\":\"<RAW>\",\"routing\":\"PAR\"}"
echo "]"
```

Execute: `bash tmp_prices.sh`

## Round 4: Compute allocations (no shell — just math)

**Investing portfolio (Sepolia):**
- From Uniswap quotes: `value_usdc = output_amount / 1000000`
- `total_investing = sum(all Sepolia values)`
- `pct = (value / total_investing) * 100`

**Emergency liquidity (Arc):**
- ARC_USDC valued at par: `value_usdc = balance / 1000000`
- ARC_EURC valued at par: `value_usdc = balance / 1000000` (approximate, EUR ≈ USD for testnet)

Present two tables:

```
INVESTING PORTFOLIO (Sepolia):
| Asset | Balance | USD Value | Allocation |
|-------|---------|-----------|------------|
| WETH  | 0.263   | $1,603    | 50.3%      |
| WBTC  | 0.0133  | $961      | 30.2%      |
| LINK  | 18.20   | $339      | 17.6%      |
Target: WETH 50% | WBTC 30% | LINK 20%

EMERGENCY LIQUIDITY (Arc):
| Asset    | Balance | USD Value |
|----------|---------|-----------|
| ARC_USDC | 100     | $100.00   |
| ARC_EURC | 20      | $20.00    |
Total emergency: $120.00
```

## Key rules

- **NEVER hardcode secrets** — always `export $(grep -v '^#' .env | xargs)`
- NEVER guess prices — use Uniswap quotes for Sepolia, par for Arc stablecoins
- Arc assets are valued at par (no Uniswap quotes)
- Use `$ETHEREUM_SEPOLIA_RPC_URL` for Sepolia, `$ARC_RPC_URL` for Arc
- On Sepolia: `SIMULATION_ERROR` in quotes is normal, ignore it
- Clean up: `rm tmp_balances.sh tmp_prices.sh`
