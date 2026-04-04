#!/bin/sh
export $(grep -v '^#' .env | xargs)
WETH=0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
USDC=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
CHAIN=11155111
WALLET=$MANAGED_WALLET_ADDRESS

# Get quote for 1 WETH -> USDC
ONE_WETH=$(python3 -c "print(10**18)")
QUOTE=$(curl -s -X POST "$UNISWAP_API_BASE_URL/quote" \
  -H "x-api-key: $UNISWAP_API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d "{\"tokenIn\":\"$WETH\",\"tokenOut\":\"$USDC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$ONE_WETH\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"]}")

echo "1 WETH -> USDC quote:"
echo "$QUOTE" | python3 -c "
import json,sys
d=json.load(sys.stdin)
output = d.get('quote', {}).get('output', {}).get('amount', '0')
price = int(output) / 10**6
print(f'1 WETH = {price} USDC')
print(f'Full response preview:')
print(json.dumps(d, indent=2)[:800])
"