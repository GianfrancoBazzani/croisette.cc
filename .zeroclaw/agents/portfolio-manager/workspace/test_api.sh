#!/bin/sh
API_KEY="KKmI*[REDACTED]"
API_BASE="https://trade-api.gateway.uniswap.org/v1"
WALLET="0xbe536053673900caD61bA6305D0c3A163c5891A6"
USDC="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
WETH="0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
CHAIN=11155111

echo "Testing Uniswap API key..."
curl -s -X POST "$API_BASE/quote" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-universal-router-version: 2.0" \
  -d "{\"tokenIn\":\"$WETH\",\"tokenOut\":\"$USDC\",\"tokenInChainId\":$CHAIN,\"tokenOutChainId\":$CHAIN,\"amount\":\"1000000000000000000\",\"type\":\"EXACT_INPUT\",\"swapper\":\"$WALLET\",\"routingPreference\":\"BEST_PRICE\",\"protocols\":[\"V2\",\"V3\",\"V4\"]}" | python3 -c "
import json,sys
try:
    data = json.load(sys.stdin)
    if 'requestId' in data:
        print('API key works! Request ID:', data['requestId'])
        if 'quote' in data:
            print('Quote ID:', data['quote']['quoteId'])
        if 'routing' in data:
            print('Routing:', data['routing'])
    elif 'error' in data:
        print('Error:', data['error'])
    else:
        print('Unexpected response:', data)
except Exception as e:
    print('Parse error:', e)
"