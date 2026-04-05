---
name: usdc-bridge
description: Bridge USDC between Sepolia and Arc Testnet using Circle CCTP. Supports both directions. Burns USDC on the source chain, mints on the destination chain via attestation.
---

# USDC Bridge — Bidirectional Sepolia ↔ Arc

Bridges USDC in either direction using Circle CCTP v2.

## CRITICAL: Loading secrets

```bash
export $(grep -v '^#' .env | xargs)
```

## Contract Addresses (same on both chains)

| Contract | Address |
|---|---|
| TokenMessengerV2 | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |

## Chain Configuration

| | Sepolia | Arc Testnet |
|---|---|---|
| Chain ID | 11155111 | 5042002 |
| CCTP Domain | `0` | `26` |
| USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | `0x3600000000000000000000000000000000000000` |
| RPC env var | `$ETHEREUM_SEPOLIA_RPC_URL` | `$ARC_RPC_URL` |

## Assemble bridge script

Write `tmp_bridge.sh` via file_write. Set the direction by choosing source/destination:

```bash
#!/bin/sh
set -e
export $(grep -v '^#' .env | xargs)
CAST=./bin/cast
TOKEN_MESSENGER=0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA

# === SET DIRECTION ===
# For Arc → Sepolia:
SOURCE_RPC=$ARC_RPC_URL
SOURCE_USDC=0x3600000000000000000000000000000000000000
DEST_DOMAIN=0

# For Sepolia → Arc:
# SOURCE_RPC=$ETHEREUM_SEPOLIA_RPC_URL
# SOURCE_USDC=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
# DEST_DOMAIN=26

AMOUNT=<bridge_amount_raw>  # USDC raw (6 decimals, e.g., 50000000 = $50)
RECIPIENT="0x000000000000000000000000${MANAGED_WALLET_ADDRESS#0x}"

# Step 1: Approve USDC for TokenMessenger on source chain
echo ">>> Approving USDC for TokenMessenger..."
$CAST send $SOURCE_USDC "approve(address,uint256)" $TOKEN_MESSENGER $AMOUNT \
  --private-key $MANAGED_WALLET_PRIVATE_KEY --rpc-url $SOURCE_RPC \
  2>&1 | grep -E "status|transactionHash"

sleep 2

# Step 2: Burn USDC via depositForBurn
echo ">>> Bridging $AMOUNT USDC (domain $DEST_DOMAIN)..."
$CAST send $TOKEN_MESSENGER \
  "depositForBurn(uint256,uint32,bytes32,address,bytes32,uint256,uint32)" \
  $AMOUNT \
  $DEST_DOMAIN \
  $RECIPIENT \
  $SOURCE_USDC \
  "0x0000000000000000000000000000000000000000000000000000000000000000" \
  0 \
  1000 \
  --private-key $MANAGED_WALLET_PRIVATE_KEY --rpc-url $SOURCE_RPC \
  2>&1 | grep -E "status|transactionHash"

echo ">>> BRIDGE DONE (attestation + mint in ~2-5 min)"
```

Execute: `bash tmp_bridge.sh`

## Important notes

- CCTP attestation and minting happen automatically (Circle relayer)
- Mint takes **2-5 minutes** on testnet
- The agent should note that bridged USDC will arrive shortly but may not be immediately available
- `minFinalityThreshold: 1000` enables fast transfer mode
- `destinationCaller: 0x00...00` means anyone can relay the attestation (permissionless)

## Hard rules

- NEVER hardcode secrets — load from .env at runtime
- ALWAYS approve the exact amount, never unlimited
- ALWAYS verify source USDC balance before bridging
- Domain 0 = Sepolia, Domain 26 = Arc Testnet
- TokenMessengerV2 address is the same on both chains
- Clean up: `rm tmp_bridge.sh` after execution
