#!/bin/sh
export $(grep -v '^#' .env | xargs)
CAST=./bin/cast
RPC=$ETHEREUM_SEPOLIA_RPC_URL
WALLET=$MANAGED_WALLET_ADDRESS

echo "ETH balance:"
$CAST balance $WALLET --rpc-url $RPC

echo "WETH balance:"
$CAST call 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14 "balanceOf(address)(uint256)" $WALLET --rpc-url $RPC

echo "USDC balance:"
$CAST call 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 "balanceOf(address)(uint256)" $WALLET --rpc-url $RPC