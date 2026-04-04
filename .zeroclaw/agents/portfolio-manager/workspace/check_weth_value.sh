#!/bin/sh
export $(grep -v '^#' .env | xargs)
WETH=0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
USDC=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
CHAIN=11155111
WALLET=$MANAGED_WALLET_ADDRESS

# Get WETH balance
WETH_BALANCE=$(./bin/cast call $WETH "balanceOf(address)(uint256)" $WALLET --rpc-url $ETHEREUM_SEPOLIA_RPC_URL)

echo "WETH balance raw: $WETH_BALANCE"
echo "WETH balance human: $(python3 -c "print($WETH_BALANCE / 10**18)")"

# Get quote for WETH -> USDC
QUOTE=$(curl -s -X POST "$UNISWAP_API_BASE_URL/quote" \
  -H "x-api-key: $UNISWAP_API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d "{\"tokenIn\":\"$WETH\",\"tokenOut\":\"$USDC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$WETH_BALANCE\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"]}")

echo "Quote response:"
echo "$QUOTE" | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin), indent=2)[:500])"