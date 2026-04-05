# Circle CCTP v2 Bridge Reference — Sepolia ↔ Arc Testnet

Bidirectional USDC bridge using Circle's Cross-Chain Transfer Protocol.

## How CCTP Works

1. **Approve** — sender approves TokenMessengerV2 to spend USDC on the source chain
2. **Burn** — `depositForBurn` burns USDC on the source chain
3. **Attest** — Circle's attestation service produces a signed attestation (automatic)
4. **Mint** — relayer mints USDC on the destination chain (automatic)

Steps 3-4 happen automatically. The sender only executes steps 1-2.

## Contract Addresses

TokenMessengerV2 is deployed at the **same address on both chains:**

`0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`

## Chain Config

| | Sepolia | Arc Testnet |
|---|---|---|
| Chain ID | 11155111 | 5042002 |
| CCTP Domain | **0** | **26** |
| USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | `0x3600000000000000000000000000000000000000` |
| RPC | `$ETHEREUM_SEPOLIA_RPC_URL` | `$ARC_RPC_URL` |

## depositForBurn Parameters

```solidity
function depositForBurn(
    uint256 amount,
    uint32  destinationDomain,
    bytes32 mintRecipient,
    address burnToken,
    bytes32 destinationCaller,
    uint256 maxFee,
    uint32  minFinalityThreshold
) external
```

| Parameter | Arc → Sepolia | Sepolia → Arc |
|---|---|---|
| `amount` | raw USDC amount | raw USDC amount |
| `destinationDomain` | `0` | `26` |
| `mintRecipient` | wallet padded to bytes32 | wallet padded to bytes32 |
| `burnToken` | Arc USDC `0x3600...0000` | Sepolia USDC `0x1c7D...7238` |
| `destinationCaller` | `0x00...00` (permissionless) | `0x00...00` |
| `maxFee` | `0` | `0` |
| `minFinalityThreshold` | `1000` (fast) | `1000` (fast) |

## Verified Transactions

- **Arc → Sepolia ($5):** [Arc tx 0x69a4989b...](https://testnet.arcscan.app/tx/0x69a4989baa33f5c6a8dce48d2b58e6c29d84262f545729d3d733e0e2e0ce05ce) ✅
- **Sepolia → Arc ($5):** [Sepolia tx 0xa34dcb85...](https://sepolia.etherscan.io/tx/0xa34dcb85fbf88853af83ce2471474474b848adaacc4d9d761826a6a909840627) ✅

## Timing

- Burn confirmation: ~5-15 seconds
- Attestation + mint: **2-5 minutes** on testnet
