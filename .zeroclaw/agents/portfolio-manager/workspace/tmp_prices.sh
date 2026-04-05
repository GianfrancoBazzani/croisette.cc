#!/bin/sh
API_KEY=KKmI*[REDACTED]
API_BASE=https://trade-api.gateway.uniswap.org/v1
WALLET=0xbe536053673900caD61bA6305D0c3A163c5891A6
USDC=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
CHAIN=11155111

quote() {
  curl -s -X POST "$API_BASE/quote" \
    -H "x-api-key: $API_KEY" \
    -H "Content-Type: application/json" \
    -H "x-universal-router-version: 2.0" \
    -d "{\"tokenIn\":\"$1\",\"tokenOut\":\"$USDC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"$2\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"]}"
}

echo "["
echo "{\"ticker\":\"SEP_ETH\",\"quote\":$(quote "0x0000000000000000000000000000000000000000" "9956809740292616")},"
echo "{\"ticker\":\"SEP_WETH\",\"quote\":$(quote "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" "263269753895320212")},"
echo "{\"ticker\":\"SEP_WBTC\",\"quote\":$(quote "0x835ef3b3d6fb94b98bf0a3f5390668e4b83731c5" "2586112969049118")},"
echo "{\"ticker\":\"SEP_LINK\",\"quote\":$(quote "0x779877A7B0D9E8603169DdbD7836e478b4624789" "31186937771696058906")}"
echo "]"