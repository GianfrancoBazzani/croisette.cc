# 0G Integration — Croisette.cc

> **Croisette.cc** is an AI-powered wealth management platform where autonomous agents manage crypto portfolios by reacting to real-world events. Built at ETHGlobal Cannes 2026.

## Overview

Croisette.cc integrates **three layers of the 0G stack** — the intelligent Layer 1 for on-chain AI:

| 0G Layer | What we use it for | Integration point |
|----------|-------------------|-------------------|
| **Compute Network** | LLM inference for the agent's brain | ZeroClaw provider → 0G inference API |
| **Storage Network** | Agent identity files, skills, decision audit logs | Upload/download via `@0gfoundation/0g-ts-sdk` |
| **Chain** | Integrity verification, on-chain provable agent state | Merkle root hashes stored on 0G Galileo testnet |

---

## 1. 0G Compute — The Agent's Brain

Each Croisette.cc agent runs on [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw), a Rust-based AI agent framework (<5MB RAM per agent). Instead of using centralized LLM providers, the agents use **0G's decentralized Compute Network** for inference.

### How it works

0G Compute exposes an **OpenAI-compatible API** (`/v1/chat/completions`). ZeroClaw's custom provider system connects to it directly:

```toml
# .zeroclaw/agents/portfolio-builder-og/config.toml
default_provider = "custom:http://localhost:8000/v1"
default_model = "qwen/qwen-2.5-7b-instruct"
```

The 0G Compute CLI runs a local proxy that routes requests to decentralized inference providers:

```bash
0g-compute-cli inference serve --provider <PROVIDER_ADDRESS>
# Proxy runs on localhost:8000 → routes to 0G Compute Network
```

### Why it matters

- **Decentralized inference** — no single point of failure, no centralized provider dependency
- **TEE-verified** — responses are signed by Trusted Execution Environments, making inference provably correct
- **Cost-efficient** — pay-per-use model with on-chain fee settlement

### Models available

| Model | Type | Network |
|-------|------|---------|
| `qwen-2.5-7b-instruct` | Chatbot | Testnet |
| `deepseek-chat-v3` | Chatbot | Mainnet |
| `gpt-oss-120b` | Chatbot | Mainnet |
| `whisper-large-v3` | Speech-to-text | Mainnet |

---

## 2. 0G Storage — Decentralized Agent Identity & Audit Trail

Every agent's core identity files (SOUL.md, IDENTITY.md, AGENTS.md, TOOLS.md, USER.md, BOOTSTRAP.md) are uploaded to **0G Storage** at agent creation time. This creates an immutable, content-addressed record of who the agent is and how it behaves.

### Architecture

```
┌─ AGENT REGISTRATION ──────────────────────────────────┐
│                                                        │
│  Workspace files (SOUL.md, IDENTITY.md, ...)           │
│         │                                              │
│         ▼                                              │
│  Upload each file to 0G Storage (Log Layer)            │
│  Each file → SHA-256 hash + 0G Merkle root hash        │
│         │                                              │
│         ▼                                              │
│  Create manifest.json:                                 │
│  {                                                     │
│    "SOUL.md": { rootHash: "0xaaa...", sha256: "..." }, │
│    "IDENTITY.md": { rootHash: "0xbbb...", sha256: "..."}│
│  }                                                     │
│         │                                              │
│         ▼                                              │
│  Upload manifest to 0G → get manifestRootHash          │
│  (This single hash is the agent's on-chain identity)   │
└────────────────────────────────────────────────────────┘
```

### Implementation

**Registration** (`scripts/register-agent.ts`):
```bash
bun run agent:register portfolio-builder-og
# Uploads 8 workspace files to 0G Storage
# Creates manifest.json with all root hashes
# Outputs manifestRootHash for on-chain reference
```

**Storage SDK usage** (`scripts/lib/0g-storage.ts`):
- `uploadFile()` — Upload individual files with Merkle tree generation
- `downloadFile()` — Download by root hash with proof verification
- `uploadData()` — Upload JSON/strings as in-memory data (MemData)
- `computeRootHash()` — Compute 0G Merkle root locally without uploading
- `checkFileExistsOnChain()` — Verify file exists on 0G storage nodes

### Data stored on 0G

| File | Purpose | 0G Layer |
|------|---------|----------|
| `SOUL.md` | Agent personality, values, boundaries | Log (immutable) |
| `IDENTITY.md` | Agent name and identity | Log (immutable) |
| `AGENTS.md` | Behavioral guidelines and orchestration | Log (immutable) |
| `TOOLS.md` | Available tools and usage | Log (immutable) |
| `USER.md` | User profile and preferences | Log (immutable) |
| `BOOTSTRAP.md` | First-time setup instructions | Log (immutable) |
| `manifest.json` | Hash manifest (maps files → root hashes) | Log (immutable) |

---

## 3. Integrity Verification — Provable Agent Integrity

The core innovation: **every message to the agent triggers a cryptographic integrity check** that verifies the agent's identity files haven't been tampered with since they were registered on 0G Storage.

### Two-tier verification system

```
User sends message
       │
       ▼
┌──────────────────────────┐
│ Tier 1: LOCAL CHECK      │  ← Synchronous, blocks request
│ SHA-256(local file) vs   │
│ SHA-256(manifest)        │
│                          │
│ PASS → continue          │
│ FAIL → HTTP 403          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Tier 2: ON-CHAIN CHECK   │  ← Async, runs in parallel
│ MerkleRoot(local file)   │
│ vs rootHash from 0G      │
│                          │
│ Fetches manifest from 0G │
│ by manifestRootHash      │
│ Computes local Merkle    │
│ roots, compares          │
│                          │
│ PASS → logged            │
│ FAIL → warning appended  │
└──────────────────────────┘
```

### Why two tiers?

- **Tier 1 (local)** is fast (<1ms) and catches any file modification instantly. It uses SHA-256 hashes stored in `manifest.json` on disk. But a sophisticated attacker could modify both the file AND the manifest.

- **Tier 2 (on-chain)** is trustless. It fetches the manifest from 0G Storage using a content-addressed hash (`manifestRootHash`) stored in the application code. Even if an attacker modifies local files AND the local manifest, the on-chain manifest is immutable — the check will fail.

### Implementation

**Local integrity** (`app/_lib/integrity.ts`):
```typescript
checkIntegrity(agentConfigDir, workspaceDir)
// Returns: { ok: boolean, checked: number, failed: string[], missing: string[] }
```

**On-chain verification** (`app/_lib/0g-verify.ts`):
```typescript
verifyOnChain(manifestRootHash, workspaceDir)
// Downloads manifest from 0G by hash
// Computes local Merkle roots using 0G SDK
// Compares against on-chain root hashes
```

**API route integration** (`app/api/chat/[agentId]/route.ts`):
- Local check runs synchronously before the request is processed
- On-chain check runs in parallel during the LLM response
- If local check fails → 403 Forbidden (request blocked)
- If on-chain check fails → warning appended to response

### CLI tools

```bash
# Local integrity check (fast, offline)
bun run agent:check portfolio-builder-og

# On-chain integrity check (trustless, fetches from 0G)
bun run agent:check portfolio-builder-og --on-chain

# On-chain + verify files exist on storage nodes
bun run agent:check portfolio-builder-og --on-chain --check-existence
```

---

## Technical Stack

| Component | Technology |
|-----------|-----------|
| Agent framework | [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw) (Rust, <5MB RAM) |
| LLM inference | 0G Compute Network (OpenAI-compatible API) |
| File storage | 0G Storage Network (Log Layer, Turbo mode) |
| Integrity hashing | SHA-256 (local) + 0G Merkle roots (on-chain) |
| Storage SDK | `@0gfoundation/0g-ts-sdk` v1.2.1 |
| Blockchain | 0G Galileo Testnet (Chain ID: 16602) |
| Frontend | Next.js 16 + React 19 + Tailwind v4 |
| Protocol | Agent Client Protocol (ACP) via `@agentclientprotocol/sdk` |

## Network Configuration

| Endpoint | URL |
|----------|-----|
| EVM RPC (testnet) | `https://evmrpc-testnet.0g.ai` |
| Storage Indexer (turbo) | `https://indexer-storage-testnet-turbo.0g.ai` |
| Chain Explorer | `https://chainscan-galileo.0g.ai` |
| Storage Explorer | `https://storagescan-galileo.0g.ai` |
| Flow Contract | `0x22E03a6A89B950F1c82ec5e74F8eCa321a105296` |

## Contract Addresses & On-Chain References

| Agent | Manifest Root Hash |
|-------|-------------------|
| `portfolio-builder-deepseek` | `0xc417eaa3773c6340aa4d144ec3dfa02d2f5c934e8927ae76bd4f27d4620fed2d` |
| `portfolio-builder-og` | *(pending registration)* |

Manifest viewable on explorer: `https://storagescan-galileo.0g.ai/file/<manifestRootHash>`

---

## Prize Track Alignment

This integration targets **three 0G prize tracks**:

### Best OpenClaw Agent on 0G — $6,000
> *"Build applications integrating OpenClaw (or alternative Claw agents) with 0G infrastructure, using Compute for inference, Storage for memory, Chain for actions."*

**How we qualify:**
- ZeroClaw (alternative Claw agent, Rust-based) as agent framework
- 0G Compute for decentralized LLM inference
- 0G Storage for persistent agent identity and memory
- On-chain integrity verification via Merkle root hashes
- Agent personality (SOUL.md) and identity files stored immutably on 0G

### Best DeFi App on 0G — $6,000
> *"AI-native DeFi experiences that are autonomous, verifiable, and economically self-sustaining."*

**How we qualify:**
- Autonomous portfolio management agents that react to market events
- Verifiable agent behavior — on-chain proof that the agent hasn't been tampered with
- DeFi execution via Uniswap API for portfolio rebalancing
- Agent decision audit trail stored on 0G Storage (immutable logs)

### Wildcard on 0G — $3,000
> *"Creative projects showcasing 0G's AI-native L1 in novel categories."*

**How we qualify:**
- Novel integrity verification system — cryptographic proof that an AI agent is running the exact code it claims to
- Multi-tier trust: local SHA-256 + on-chain Merkle roots
- Every message verified before execution — trustless AI agent operations

---

## Demo Flow

1. **Show agent registration** — workspace files uploaded to 0G, manifest created
2. **Normal operation** — user sends message, integrity check passes, agent responds
3. **Tamper detection** — modify SOUL.md, send message, get 403 "integrity failed"
4. **On-chain proof** — show manifest on 0G Storage Explorer, verify root hashes match
5. **Restore & recover** — fix the file, integrity passes again, agent resumes

---

## Repository Structure

```
croisette.cc/
├── app/
│   ├── _lib/
│   │   ├── integrity.ts          # Local SHA-256 integrity checking
│   │   ├── 0g-verify.ts          # On-chain Merkle root verification
│   │   ├── acp.ts                # ZeroClaw ACP client
│   │   ├── constants.ts          # Agent configs + manifestRootHash
│   │   └── session-store.ts      # Session management
│   └── api/chat/[agentId]/
│       └── route.ts              # Chat API with integrity check
├── scripts/
│   ├── register-agent.ts         # Upload workspace to 0G + create manifest
│   ├── check-integrity.ts        # CLI integrity verification
│   └── lib/
│       ├── 0g-config.ts          # Network configuration
│       ├── 0g-storage.ts         # Upload/download/hash functions
│       └── 0g-verify.ts          # On-chain verification logic
└── .zeroclaw/agents/
    ├── portfolio-builder-og/
    │   ├── config.toml            # 0G Compute provider config
    │   ├── manifest.json          # Integrity manifest
    │   └── workspace/*.md         # Agent identity files
    └── portfolio-builder-deepseek/
        ├── config.toml
        ├── manifest.json
        └── workspace/*.md
```
