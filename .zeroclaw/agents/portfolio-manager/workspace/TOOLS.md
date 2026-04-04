# TOOLS.md — Local Notes

## CRITICAL: Dynamic script assembly

The sandbox blocks multi-line commands, `source`, and variable assignments in shell. The workaround:
1. **file_write** a shell script (e.g., `tmp_balances.sh`) with all commands and values baked in
2. **shell** `bash tmp_balances.sh` to execute it
3. **shell** `rm tmp_balances.sh` to clean up

## CRITICAL: Never hardcode secrets

Zeroclaw REDACTS API keys and private keys when you read `.env` via file_read. You will see `KKmI*[REDACTED]` instead of the real value. **NEVER copy redacted values into scripts.**

Instead, every generated script must load `.env` at runtime:
```bash
export $(grep -v '^#' .env | xargs)
```
Then use the environment variables: `$UNISWAP_API_KEY`, `$MANAGED_WALLET_PRIVATE_KEY`, `$MANAGED_WALLET_ADDRESS`, `$ETHEREUM_SEPOLIA_RPC_URL`, `$UNISWAP_API_BASE_URL`.

Only hardcode non-secret values in scripts: token addresses, chain IDs, amounts.

### Pattern: assemble balance-fetching script

After querying the DB for assets, write `tmp_balances.sh` via file_write:

```bash
#!/bin/sh
WALLET=0xbe536053673900caD61bA6305D0c3A163c5891A6
RPC=https://ethereum-sepolia-rpc.publicnode.com
CAST=./bin/cast
echo "["
echo "{\"ticker\":\"SEP_ETH\",\"decimals\":18,\"balance\":\"$($CAST balance $WALLET --rpc-url $RPC)\"},"
echo "{\"ticker\":\"SEP_WETH\",\"decimals\":18,\"balance\":\"$($CAST call 0xfFf... \"balanceOf(address)(uint256)\" $WALLET --rpc-url $RPC)\"},"
# ... one line per asset from DB query results
echo "]"
```

The key: the asset list comes from the DB query, not from a hardcoded list. You dynamically generate one `echo` line per asset.

### Pattern: assemble price-fetching script

After filtering held assets (balance > 0), write `tmp_prices.sh` via file_write:

```bash
#!/bin/sh
API_KEY=<actual_key_from_env>
API_BASE=<actual_base_from_env>
WALLET=<actual_wallet_from_env>
USDC=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
CHAIN=11155111
quote() {
  curl -s -X POST "$API_BASE/quote" -H "x-api-key: $API_KEY" -H "Content-Type: application/json" -H "x-universal-router-version: 2.0" -d "{\"tokenIn\":\"$1\",\"tokenOut\":\"$USDC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$2\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"]}"
}
echo "["
echo "{\"ticker\":\"SEP_ETH\",\"quote\":$(quote "0x000...000" "419664755266191903")},"
# ... one line per held asset
echo "]"
```

### Pattern: assemble swap execution script

See the `swap-execution` skill for the full template.

## On-chain cast

Always use `./bin/cast` (wrapper to foundry), never bare `cast`:
- `./bin/cast balance <ADDR> --rpc-url <RPC>`
- `./bin/cast call <CONTRACT> "balanceOf(address)(uint256)" <ADDR> --rpc-url <RPC>`
- `./bin/cast send <TO> --data <DATA> --value <VALUE> --private-key <KEY> --rpc-url <RPC>`

## Assets Database

- Path: `sqlite.db` (symlink in workspace root)
- Access: `sqlite3 -json sqlite.db '<SQL>'`

### Schema (do NOT run .schema — use these directly):

```sql
CREATE TABLE asset (
    id TEXT PRIMARY KEY,
    ticker TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    chainId INTEGER NOT NULL,
    description TEXT,
    decimals INTEGER NOT NULL,
    type TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

CREATE TABLE ideal_portfolio (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

CREATE TABLE ideal_portfolio_entry (
    id TEXT PRIMARY KEY,
    portfolioId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    allocation REAL NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    UNIQUE(portfolioId, assetId)
);
```

### Key queries:

```bash
# Sepolia assets
sqlite3 -json sqlite.db "SELECT ticker, address, chainId, decimals, type FROM asset WHERE chainId = 11155111"

# Target portfolio
sqlite3 -json sqlite.db "SELECT a.ticker, a.type, e.allocation FROM ideal_portfolio p JOIN ideal_portfolio_entry e ON e.portfolioId = p.id JOIN asset a ON a.id = e.assetId WHERE p.userId = 'test-user-001'"
```

### Test user: `test-user-001` — target: WETH 50%, WBTC 30%, LINK 20%

## Built-in Tools

- **shell** — Execute commands. Use `bash <script>` for assembled scripts.
- **file_read** — Read files (auto-approved)
- **file_write** — Write files including temp scripts (auto-approved)
- **memory_store** / **memory_recall** / **memory_forget** — Agent memory
