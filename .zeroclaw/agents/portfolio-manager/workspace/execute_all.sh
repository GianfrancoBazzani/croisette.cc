#!/bin/sh
set -e

# Load environment variables
WALLET="0xbe536053673900caD61bA6305D0c3A163c5891A6"
PRIVATE_KEY="1ee71eb3404f04132d423425ea11f77bc65da694c6db676eee764563ec1c9f7d"
RPC="https://ethereum-sepolia-rpc.publicnode.com"
API_KEY="KKmI*[REDACTED]"
API_BASE="https://trade-api.gateway.uniswap.org/v1"
CAST="./bin/cast"
CHAIN=11155111

# Token addresses
ETH="0x0000000000000000000000000000000000000000"
WETH="0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
WBTC="0x835ef3b3d6fb94b98bf0a3f5390668e4b83731c5"
USDC="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
LINK="0x779877A7B0D9E8603169DdbD7836e478b4624789"

echo "=== Portfolio Execution Started ==="

# Step 1: WRAP ETH → WETH
echo ">>> Executing WRAP (ETH → WETH)..."
ETH_BALANCE=$(./bin/cast balance $WALLET --rpc-url $RPC)
echo "ETH balance: $ETH_BALANCE"
# WRAP all ETH except 0.01 ETH for gas
WRAP_AMOUNT=$(echo "$ETH_BALANCE - 10000000000000000" | bc)
echo "WRAP amount: $WRAP_AMOUNT"

$CAST send $WETH "deposit()" \
  --value "${WRAP_AMOUNT}wei" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC --gas-limit 500000 2>&1 | grep -E "status|transactionHash|gasUsed"

echo ">>> WRAP completed"

# Step 2: SELL WETH → USDC
echo ">>> Getting quote for WETH → USDC..."
WETH_BALANCE=$(./bin/cast call $WETH "balanceOf(address)(uint256)" $WALLET --rpc-url $RPC)
echo "WETH balance: $WETH_BALANCE"
# Sell approximately $667 worth of WETH - need to get quote first
SELL_AMOUNT="100000000000000000"  # 0.1 WETH (~$300) as test amount

QUOTE=$(curl -s -X POST "$API_BASE/quote" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d "{\"tokenIn\":\"$WETH\",\"tokenOut\":\"$USDC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$SELL_AMOUNT\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"],\"permitAmount\":\"EXACT\",\"generatePermitAsTransaction\":true}")

echo "Quote routing: $(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('routing','ERROR'))")"

# Execute permit transaction if present
HAS_PERMIT=$(echo "$QUOTE" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if d.get('permitTransaction') else 'no')")
if [ "$HAS_PERMIT" = "yes" ]; then
  PERMIT_TO=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin)['permitTransaction']['to'])")
  PERMIT_DATA=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin)['permitTransaction']['data'])")
  echo ">>> Executing permit tx..."
  $CAST send "$PERMIT_TO" "$PERMIT_DATA" --value 0 --private-key $PRIVATE_KEY --rpc-url $RPC 2>&1 | grep -E "status|transactionHash"
fi

# Get unsigned swap tx
echo ">>> Calling /swap..."
SWAP=$(echo "$QUOTE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(json.dumps({'quote': d.get('quote'), 'simulateTransaction': False}))
" | curl -s -X POST "$API_BASE/swap" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d @-)

SWAP_TO=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['to'])")
SWAP_DATA=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['data'])")
SWAP_VALUE=$(echo "$SWAP" | python3 -c "import json,sys; print(int(json.load(sys.stdin)['swap'].get('value','0x0'), 16))")

echo ">>> Broadcasting swap..."
$CAST send "$SWAP_TO" "$SWAP_DATA" --value "${SWAP_VALUE}wei" --private-key $PRIVATE_KEY --rpc-url $RPC --gas-limit 500000 2>&1 | grep -E "status|transactionHash|gasUsed"

echo ">>> SELL completed"

# Step 3: BUY USDC → WBTC
echo ">>> Getting quote for USDC → WBTC..."
BUY_AMOUNT="50000000"  # 50 USDC as test amount

QUOTE=$(curl -s -X POST "$API_BASE/quote" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d "{\"tokenIn\":\"$USDC\",\"tokenOut\":\"$WBTC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$BUY_AMOUNT\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"],\"permitAmount\":\"EXACT\",\"generatePermitAsTransaction\":true}")

echo "Quote routing: $(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('routing','ERROR'))")"

# Execute permit transaction if present
HAS_PERMIT=$(echo "$QUOTE" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if d.get('permitTransaction') else 'no')")
if [ "$HAS_PERMIT" = "yes" ]; then
  PERMIT_TO=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin)['permitTransaction']['to'])")
  PERMIT_DATA=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin)['permitTransaction']['data'])")
  echo ">>> Executing permit tx..."
  $CAST send "$PERMIT_TO" "$PERMIT_DATA" --value 0 --private-key $PRIVATE_KEY --rpc-url $RPC 2>&1 | grep -E "status|transactionHash"
fi

# Get unsigned swap tx
echo ">>> Calling /swap..."
SWAP=$(echo "$QUOTE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(json.dumps({'quote': d.get('quote'), 'simulateTransaction': False}))
" | curl -s -X POST "$API_BASE/swap" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d @-)

SWAP_TO=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['to'])")
SWAP_DATA=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['data'])")
SWAP_VALUE=$(echo "$SWAP" | python3 -c "import json,sys; print(int(json.load(sys.stdin)['swap'].get('value','0x0'), 16))")

echo ">>> Broadcasting swap..."
$CAST send "$SWAP_TO" "$SWAP_DATA" --value "${SWAP_VALUE}wei" --private-key $PRIVATE_KEY --rpc-url $RPC --gas-limit 500000 2>&1 | grep -E "status|transactionHash|gasUsed"

echo ">>> BUY WBTC completed"

# Step 4: BUY USDC → LINK
echo ">>> Getting quote for USDC → LINK..."
BUY_AMOUNT="30000000"  # 30 USDC as test amount

QUOTE=$(curl -s -X POST "$API_BASE/quote" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d "{\"tokenIn\":\"$USDC\",\"tokenOut\":\"$LINK\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$BUY_AMOUNT\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"],\"permitAmount\":\"EXACT\",\"generatePermitAsTransaction\":true}")

echo "Quote routing: $(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('routing','ERROR'))")"

# Execute permit transaction if present
HAS_PERMIT=$(echo "$QUOTE" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if d.get('permitTransaction') else 'no')")
if [ "$HAS_PERMIT" = "yes" ]; then
  PERMIT_TO=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin)['permitTransaction']['to'])")
  PERMIT_DATA=$(echo "$QUOTE" | python3 -c "import json,sys; print(json.load(sys.stdin)['permitTransaction']['data'])")
  echo ">>> Executing permit tx..."
  $CAST send "$PERMIT_TO" "$PERMIT_DATA" --value 0 --private-key $PRIVATE_KEY --rpc-url $RPC 2>&1 | grep -E "status|transactionHash"
fi

# Get unsigned swap tx
echo ">>> Calling /swap..."
SWAP=$(echo "$QUOTE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(json.dumps({'quote': d.get('quote'), 'simulateTransaction': False}))
" | curl -s -X POST "$API_BASE/swap" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d @-)

SWAP_TO=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['to'])")
SWAP_DATA=$(echo "$SWAP" | python3 -c "import json,sys; print(json.load(sys.stdin)['swap']['data'])")
SWAP_VALUE=$(echo "$SWAP" | python3 -c "import json,sys; print(int(json.load(sys.stdin)['swap'].get('value','0x0'), 16))")

echo ">>> Broadcasting swap..."
$CAST send "$SWAP_TO" "$SWAP_DATA" --value "${SWAP_VALUE}wei" --private-key $PRIVATE_KEY --rpc-url $RPC --gas-limit 500000 2>&1 | grep -E "status|transactionHash|gasUsed"

echo ">>> BUY LINK completed"

echo "=== Portfolio Execution Completed ==="
echo "All 4 swaps have been executed"
