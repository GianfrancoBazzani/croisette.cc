#!/bin/sh
# Calculate WETH amount for $667.27
WETH_PRICE=6089.865168
TARGET_USD=667.27
WETH_AMOUNT=$(python3 -c "print($TARGET_USD / $WETH_PRICE)")
WETH_RAW=$(python3 -c "print(int($WETH_AMOUNT * 10**18))")

echo "For $TARGET_USD USDC at $WETH_PRICE USDC/WETH:"
echo "WETH amount: $WETH_AMOUNT"
echo "WETH raw: $WETH_RAW"

# Also calculate USDC amounts for buys
echo ""
echo "Buy amounts:"
echo "WBTC: 490.12 USDC = $(python3 -c "print(int(490.12 * 10**6))") raw"
echo "LINK: 332.15 USDC = $(python3 -c "print(int(332.15 * 10**6))") raw"