---
name: usdc-bridge
description: Bridge USDC from Ethereum Sepolia to Arc Testnet using Circle's CCTP (Cross-Chain Transfer Protocol) via cast. Burns USDC on Sepolia and mints native USDC on Arc Testnet. Used for funding the Arc emergency-liquidity sleeve on testnet.
---

# USDC Bridge — Sepolia to Arc Testnet

Bridges USDC from Ethereum Sepolia (chain_id 11155111) to Arc Testnet (chain_id 5042002) using Circle's CCTP v2.

## Load This Reference

- `references/cctp-bridge.md`

## Contract Addresses

| Contract | Network | Address |
|---|---|---|
| USDC | Sepolia | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| TokenMessengerV2 | Sepolia | `0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa` |
| USDC (native) | Arc Testnet | `0x3600000000000000000000000000000000000000` |

| Domain | CCTP Domain ID |
|---|---|
| Ethereum Sepolia | `0` |
| Arc Testnet | `7` |

## Inputs

- `amount` — USDC amount to bridge (human-readable, e.g., `10.0`)
- `recipient` — destination address on Arc Testnet (defaults to same managed wallet)

Read from `.env`:
- `MANAGED_WALLET_PRIVATE_KEY`
- `MANAGED_WALLET_ADDRESS`
- `ETHEREUM_SEPOLIA_RPC_URL`

## Sequential Pipeline

### Step 1. Validate Inputs

Entry criteria:
- amount and recipient are provided

Actions:
1. Convert human amount to raw: `amount_raw = amount * 10^6` (USDC has 6 decimals).
2. Check that `amount_raw > 0`.
3. Resolve `recipient` — if not provided, use `MANAGED_WALLET_ADDRESS`.
4. Pad `recipient` to bytes32: `0x000000000000000000000000<address_without_0x>`.

Exit criteria:
- raw amount and padded recipient address are ready

### Step 2. Check USDC Balance

Entry criteria:
- Step 1 completed

Actions:
1. Query Sepolia USDC balance:
   ```
   cast call 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \
     "balanceOf(address)(uint256)" \
     $MANAGED_WALLET_ADDRESS \
     --rpc-url $ETHEREUM_SEPOLIA_RPC_URL
   ```
2. Verify balance >= amount_raw. If insufficient, abort with error.

Exit criteria:
- balance is sufficient for the bridge

### Step 3. Approve USDC for TokenMessengerV2

Entry criteria:
- Step 2 completed

Actions:
1. Approve the TokenMessengerV2 contract to spend the exact amount:
   ```
   cast send 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \
     "approve(address,uint256)" \
     0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa \
     $AMOUNT_RAW \
     --private-key $MANAGED_WALLET_PRIVATE_KEY \
     --rpc-url $ETHEREUM_SEPOLIA_RPC_URL
   ```
2. Wait for the approval transaction to be mined.

Exit criteria:
- approval transaction is confirmed

### Step 4. Burn USDC via depositForBurn

Entry criteria:
- Step 3 completed

Actions:
1. Call `depositForBurn` on TokenMessengerV2:
   ```
   cast send 0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa \
     "depositForBurn(uint256,uint32,bytes32,address,bytes32,uint256,uint32)" \
     $AMOUNT_RAW \
     7 \
     $RECIPIENT_BYTES32 \
     0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \
     0x0000000000000000000000000000000000000000000000000000000000000000 \
     0 \
     1000 \
     --private-key $MANAGED_WALLET_PRIVATE_KEY \
     --rpc-url $ETHEREUM_SEPOLIA_RPC_URL
   ```

   Parameters:
   - `amount`: raw USDC amount
   - `destinationDomain`: `7` (Arc Testnet)
   - `mintRecipient`: recipient address padded to bytes32
   - `burnToken`: Sepolia USDC address
   - `destinationCaller`: zero bytes32 (anyone can relay)
   - `maxFee`: `0` (no fee cap)
   - `minFinalityThreshold`: `1000` (fast transfer mode)

2. Capture the transaction hash.

Exit criteria:
- burn transaction is confirmed on Sepolia

### Step 5. Wait for Attestation and Mint

Entry criteria:
- Step 4 completed

Actions:
1. CCTP attestation and minting on Arc Testnet happen automatically. The Circle relayer picks up the burn event, generates an attestation, and mints USDC on Arc.
2. This typically takes 1-5 minutes on testnet.
3. Optionally verify the mint by checking the Arc USDC balance:
   ```
   cast call 0x3600000000000000000000000000000000000000 \
     "balanceOf(address)(uint256)" \
     $RECIPIENT \
     --rpc-url $ARC_RPC_URL
   ```

Exit criteria:
- USDC balance on Arc Testnet has increased (or a reasonable wait time has passed)

## Output

Return:
```
{
  source_chain: "ethereum_sepolia",
  destination_chain: "arc_testnet",
  amount_usdc: number,
  burn_tx_hash: string,
  recipient: string,
  status: "burn_confirmed" | "mint_confirmed" | "pending"
}
```

## Hard Rules

- This skill is for **Sepolia testnet only**. Do not use on mainnet without updating contract addresses and domain IDs.
- Always approve the exact amount, never unlimited allowances.
- Always verify USDC balance before attempting the bridge.
- The `destinationCaller` is set to zero (permissionless relay). For production, this should be restricted.
- Do not proceed if balance check or approval fails.
