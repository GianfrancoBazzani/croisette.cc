#!/bin/sh
WALLET=0xbe536053673900caD61bA6305D0c3A163c5891A6
RPC=https://ethereum-sepolia-rpc.publicnode.com
CAST=./bin/cast
echo "["
echo "{\"ticker\":\"SEP_ETH\",\"decimals\":18,\"balance\":\"$($CAST balance $WALLET --rpc-url $RPC)\"},"
echo "{\"ticker\":\"SEP_WETH\",\"decimals\":18,\"balance\":\"$($CAST call 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14 \"balanceOf(address)(uint256)\" $WALLET --rpc-url $RPC)\"},"
echo "{\"ticker\":\"SEP_WBTC\",\"decimals\":8,\"balance\":\"$($CAST call 0x835ef3b3d6fb94b98bf0a3f5390668e4b83731c5 \"balanceOf(address)(uint256)\" $WALLET --rpc-url $RPC)\"},"
echo "{\"ticker\":\"SEP_LINK\",\"decimals\":18,\"balance\":\"$($CAST call 0x779877A7B0D9E8603169DdbD7836e478b4624789 \"balanceOf(address)(uint256)\" $WALLET --rpc-url $RPC)\"},"
echo "{\"ticker\":\"SEP_USDC\",\"decimals\":6,\"balance\":\"$($CAST call 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \"balanceOf(address)(uint256)\" $WALLET --rpc-url $RPC)\"}"
echo "]"