---
name: swap-execution
description: Execute user-approved Uniswap swaps on-chain. Ensures token approvals for Permit2, gets fresh quotes, calls /swap, signs and broadcasts. Handles slippage by checking real balances before each swap.
---

# Swap Execution

Executes approved swaps on-chain. Process each swap **one at a time, sequentially**.

## CRITICAL: Loading secrets

Zeroclaw REDACTS secrets when you read .env via file_read. Generated scripts must load .env at runtime:
```bash
export $(grep -v '^#' .env | xargs)
```

## CRITICAL: Token approval flow

Before ANY ERC-20 swap, the input token must be approved for Permit2. Two layers:
1. **Token → Permit2:** `token.approve(Permit2, maxUint256)`
2. **Permit2 → Router:** `Permit2.approve(token, router, amount, expiration)`

Both must be set. Without either, swaps revert with `TRANSFER_FROM_FAILED`.

## CRITICAL: Do NOT use generatePermitAsTransaction

Do NOT include `generatePermitAsTransaction: true` or `permitAmount: EXACT` in quotes. Handle approvals manually instead.

## CRITICAL: Use actual balances, not pre-calculated amounts

Slippage means you get less than expected. When executing multiple swaps in sequence (e.g., sell WETH for USDC, then buy WBTC and LINK with USDC):
- **Before each BUY swap:** query the ACTUAL current balance of the input token
- **Use the real balance** (or a proportion of it), not the amount calculated during proposal
- This prevents "insufficient balance" failures when earlier swaps returned less than expected

## Execution order matters

Always execute in this order:
1. **WRAP** first (ETH → WETH) — value-neutral, no API needed
2. **SELL** next (over-allocated → USDC) — generates USDC for buys
3. **BUY** last (USDC → under-allocated) — uses the USDC from sells

For multiple BUY actions, split the available USDC proportionally based on the target allocation ratios, not fixed USD amounts.

## For each approved ERC-20 swap: assemble and execute a script

Write `tmp_swap_N.sh` via file_write:

```bash
#!/bin/sh
set -e
export $(grep -v '^#' .env | xargs)
CAST=./bin/cast
CHAIN=11155111
RPC=$ETHEREUM_SEPOLIA_RPC_URL
PERMIT2=0x000000000022D473030F116dDEE9F6B43aC78BA3
ROUTER=0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b

TOKEN_IN=<token_in_address>
TOKEN_OUT=<token_out_address>

# IMPORTANT: For BUY swaps, query the actual balance instead of hardcoding
# AMOUNT=$($CAST call $TOKEN_IN "balanceOf(address)(uint256)" $MANAGED_WALLET_ADDRESS --rpc-url $RPC | tr -d ' ')
# Then compute the proportion: e.g., for 60% of USDC balance:
# AMOUNT=$(python3 -c "print(int($FULL_BALANCE * 0.6))")
AMOUNT=<amount_raw_string>

# Step 1: Ensure token is approved for Permit2
echo ">>> Checking token approval for Permit2..."
ALLOWANCE=$($CAST call $TOKEN_IN "allowance(address,address)(uint256)" $MANAGED_WALLET_ADDRESS $PERMIT2 --rpc-url $RPC | tr -d ' ')
if [ "$ALLOWANCE" = "0" ]; then
  echo ">>> Approving token for Permit2..."
  $CAST send $TOKEN_IN "approve(address,uint256)" $PERMIT2 \
    "115792089237316195423570985008687907853269984665640564039457584007913129639935" \
    --private-key $MANAGED_WALLET_PRIVATE_KEY --rpc-url $RPC 2>&1 | grep -E "status|transactionHash"
  sleep 2
fi

# Step 2: Ensure Permit2 allowance to router
echo ">>> Checking Permit2 allowance to router..."
P2_RESULT=$($CAST call $PERMIT2 "allowance(address,address,address)(uint160,uint48,uint48)" \
  $MANAGED_WALLET_ADDRESS $TOKEN_IN $ROUTER --rpc-url $RPC 2>&1)
P2_AMOUNT=$(echo "$P2_RESULT" | head -1 | tr -d ' ')
if [ "$P2_AMOUNT" = "0" ]; then
  echo ">>> Setting Permit2 allowance to router..."
  $CAST send $PERMIT2 "approve(address,address,uint160,uint48)" \
    $TOKEN_IN $ROUTER \
    "1461501637330902918203684832716283019655932542975" \
    "4294967295" \
    --private-key $MANAGED_WALLET_PRIVATE_KEY --rpc-url $RPC 2>&1 | grep -E "status|transactionHash"
  sleep 2
fi

# Step 3: Get fresh quote (NO generatePermitAsTransaction)
echo ">>> Getting fresh quote..."
QUOTE=$(curl -s -X POST "$UNISWAP_API_BASE_URL/quote" \
  -H "x-api-key: $UNISWAP_API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d "{\"tokenIn\":\"$TOKEN_IN\",\"tokenOut\":\"$TOKEN_OUT\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$AMOUNT\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$MANAGED_WALLET_ADDRESS\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"]}")

ROUTING=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('routing','ERROR'))")
OUTPUT=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('quote',{}).get('output',{}).get('amount','?'))")
IMPACT=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('quote',{}).get('priceImpact','?'))")
echo ">>> Routing: $ROUTING | Output: $OUTPUT | Impact: ${IMPACT}%"

if [ "$ROUTING" != "CLASSIC" ] && [ "$ROUTING" != "WRAP" ] && [ "$ROUTING" != "UNWRAP" ]; then
  echo ">>> REJECTED: unsupported routing $ROUTING"
  exit 1
fi

# Step 4: Get unsigned swap tx (no simulation on testnet)
echo ">>> Calling /swap..."
SWAP=$(echo "$QUOTE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(json.dumps({'quote': d['quote'], 'simulateTransaction': False}))
" | curl -s -X POST "$UNISWAP_API_BASE_URL/swap" \
  -H "x-api-key: $UNISWAP_API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d @-)

HAS_SWAP=$(echo "$SWAP" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if 'swap' in d else 'no')")
if [ "$HAS_SWAP" != "yes" ]; then
  echo ">>> FAILED: /swap error"
  echo "$SWAP" | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin), indent=2)[:500])"
  exit 1
fi

# Step 5: Sign and broadcast
SWAP_TO=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['to'])")
SWAP_DATA=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['data'])")
SWAP_VALUE=$(echo "$SWAP" | python3 -c "import json,sys; print(int(json.load(sys.stdin)['swap'].get('value','0x0'), 16))")

echo ">>> Broadcasting swap..."
$CAST send "$SWAP_TO" "$SWAP_DATA" --value "${SWAP_VALUE}wei" \
  --private-key $MANAGED_WALLET_PRIVATE_KEY --rpc-url $RPC --gas-limit 500000 \
  2>&1 | grep -E "status|transactionHash|gasUsed"
echo ">>> SWAP DONE"
```

Then execute: `bash tmp_swap_N.sh`

## WRAP (ETH → WETH) — special case

No API needed, no approvals needed. Skip if ETH balance is less than 0.01 ETH (not enough after gas reserve):

```bash
#!/bin/sh
set -e
export $(grep -v '^#' .env | xargs)
CAST=./bin/cast
RPC=$ETHEREUM_SEPOLIA_RPC_URL
WETH=0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
GAS_RESERVE=10000000000000000  # 0.01 ETH

ETH_BALANCE=$($CAST balance $MANAGED_WALLET_ADDRESS --rpc-url $RPC | tr -d ' ')
WRAP_AMOUNT=$(python3 -c "
bal = int('$ETH_BALANCE')
reserve = $GAS_RESERVE
wrap = bal - reserve
if wrap <= 0:
    print('SKIP')
else:
    print(wrap)
")

if [ "$WRAP_AMOUNT" = "SKIP" ]; then
  echo ">>> SKIP: ETH balance ($ETH_BALANCE wei) too low to wrap after gas reserve"
else
  echo ">>> Wrapping $WRAP_AMOUNT wei ETH to WETH..."
  $CAST send $WETH "deposit()" \
    --value "${WRAP_AMOUNT}wei" \
    --private-key $MANAGED_WALLET_PRIVATE_KEY \
    --rpc-url $RPC 2>&1 | grep -E "status|transactionHash|gasUsed"
  echo ">>> WRAP DONE"
fi
```

## BUY swaps: proportional splitting

When multiple BUY swaps need USDC, do NOT use pre-calculated amounts. Instead:

1. Query the actual USDC balance before each buy
2. If this is the LAST buy: use the full remaining USDC balance
3. If there are more buys after this: use a proportional share

Example for WBTC (30% target) and LINK (20% target):
- WBTC share = 30 / (30 + 20) = 60% of available USDC
- LINK share = 20 / (30 + 20) = 40% of available USDC (or just use remaining balance)

In the generated script:
```bash
# For the first BUY (e.g., WBTC at 60% of USDC):
USDC_BALANCE=$($CAST call $USDC "balanceOf(address)(uint256)" $MANAGED_WALLET_ADDRESS --rpc-url $RPC | tr -d ' ')
AMOUNT=$(python3 -c "print(int(int('$USDC_BALANCE') * 0.6))")

# For the last BUY (e.g., LINK — use all remaining USDC):
USDC_BALANCE=$($CAST call $USDC "balanceOf(address)(uint256)" $MANAGED_WALLET_ADDRESS --rpc-url $RPC | tr -d ' ')
AMOUNT=$USDC_BALANCE
```

## Key rules

- **NEVER hardcode secrets** — always `export $(grep -v '^#' .env | xargs)`
- **NEVER use `generatePermitAsTransaction: true`** — handle approvals manually
- **NEVER use pre-calculated amounts for BUY swaps** — always check actual balance first
- **ALWAYS ensure two-layer approval** before swapping: Token→Permit2 AND Permit2→Router
- **ALWAYS use `simulateTransaction: false`** on testnet
- **ALWAYS use `--gas-limit 500000`** on testnet
- **ALWAYS skip WRAP** if ETH balance < gas reserve (0.01 ETH)
- Execute in order: WRAP → SELL → BUY
- Process swaps ONE AT A TIME
- Only `CLASSIC`, `WRAP`, `UNWRAP` routing accepted
- Router on Sepolia: `0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b`
- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- Clean up temp files after execution
