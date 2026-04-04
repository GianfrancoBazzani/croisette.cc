# Circle CCTP v2 Bridge Reference — Sepolia to Arc Testnet

Technical reference for bridging USDC using Circle's Cross-Chain Transfer Protocol.

## How CCTP Works

1. **Approve** — the sender approves TokenMessengerV2 to spend their USDC
2. **Burn** — TokenMessengerV2 burns USDC on the source chain via `depositForBurn`
3. **Attest** — Circle's attestation service observes the burn event and produces a signed attestation
4. **Mint** — a relayer submits the attestation to the destination chain's MessageTransmitter, which mints native USDC to the recipient

Steps 3-4 happen automatically via Circle's relayer infrastructure. The sender only needs to execute steps 1-2.

## Contract Addresses

### Sepolia (Source)

| Contract | Address |
|---|---|
| USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| TokenMessengerV2 | `0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa` |

### Arc Testnet (Destination)

| Contract | Address |
|---|---|
| USDC (native) | `0x3600000000000000000000000000000000000000` |

## CCTP Domain IDs

| Chain | Domain ID |
|---|---|
| Ethereum Sepolia | `0` |
| Arc Testnet | `7` |

Domain IDs are Circle-assigned identifiers that do NOT correspond to chain IDs.

## depositForBurn Function

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

### Parameters

| Parameter | Type | Value for Sepolia -> Arc |
|---|---|---|
| `amount` | uint256 | Raw USDC amount (6 decimals, e.g., 10 USDC = 10000000) |
| `destinationDomain` | uint32 | `7` (Arc Testnet) |
| `mintRecipient` | bytes32 | Recipient address left-padded to 32 bytes |
| `burnToken` | address | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (Sepolia USDC) |
| `destinationCaller` | bytes32 | `0x00...00` (permissionless — anyone can relay) |
| `maxFee` | uint256 | `0` (no fee cap for testnet) |
| `minFinalityThreshold` | uint32 | `1000` (fast transfer attestation) |

### mintRecipient Encoding

The recipient address must be left-padded to 32 bytes:

```
Address:  0xbe536053673900caD61bA6305D0c3A163c5891A6
bytes32:  0x000000000000000000000000be536053673900caD61bA6305D0c3A163c5891A6
```

## Cast Commands

### Check balance
```bash
cast call 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \
  "balanceOf(address)(uint256)" \
  $WALLET_ADDRESS \
  --rpc-url $ETHEREUM_SEPOLIA_RPC_URL
```

### Approve
```bash
cast send 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \
  "approve(address,uint256)" \
  0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa \
  $AMOUNT_RAW \
  --private-key $PRIVATE_KEY \
  --rpc-url $ETHEREUM_SEPOLIA_RPC_URL
```

### Bridge (depositForBurn)
```bash
cast send 0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa \
  "depositForBurn(uint256,uint32,bytes32,address,bytes32,uint256,uint32)" \
  $AMOUNT_RAW \
  7 \
  $RECIPIENT_BYTES32 \
  0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 \
  0x0000000000000000000000000000000000000000000000000000000000000000 \
  0 \
  1000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $ETHEREUM_SEPOLIA_RPC_URL
```

### Verify on Arc
```bash
cast call 0x3600000000000000000000000000000000000000 \
  "balanceOf(address)(uint256)" \
  $WALLET_ADDRESS \
  --rpc-url https://arc-testnet.drpc.org
```

## Timing

- Burn confirmation on Sepolia: ~15-30 seconds
- Attestation + mint on Arc: typically 1-5 minutes on testnet
- Total end-to-end: ~2-6 minutes

## Sources

- [Bridge USDC to Arc - Arc Docs](https://docs.arc.network/arc/tutorials/bridge-usdc-to-arc)
- [Circle CCTP Supported Chains](https://developers.circle.com/cctp/cctp-supported-blockchains)
- [Circle CCTP Transfer Guide](https://developers.circle.com/cctp/transfer-usdc-on-testnet-from-ethereum-to-avalanche)
