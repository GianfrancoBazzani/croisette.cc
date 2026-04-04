---
name: understanding-costs
description: Teach users why minimizing investment fees and costs is critical for long-term wealth building, covering both TradFi expense ratios and DeFi-specific costs like gas fees, swap fees, and protocol fees. Use this skill when users ask about fees, costs, expense ratios, gas fees, swap fees, protocol fees, "how much does it cost to invest", "are there hidden fees", total cost of ownership, or when comparing the cost of using Ondo Finance vs traditional brokers. Also trigger when users seem unaware of how fees compound against returns over time.
---

# Understanding Costs

This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, and educate on fee impact. If used during portfolio design, the output contributes to the standardized JSON.

Fees are the silent killer of investment returns. Bogle called them one of the two greatest enemies of the investor (alongside emotions). Paying just 1% more per year in fees can cost over $100,000 over 30 years.

## Conversation Flow

1. **Ask what they're currently paying.** "Do you know what fees you're paying on your current investments?" Most users don't — this creates a teachable moment.
2. **Walk through each cost type** relevant to their situation (gas, swap, protocol fees).
3. **Calculate their estimated annual cost** based on their strategy (DCA frequency, chain, assets).
4. **Compare to the 0.5% benchmark.** Above or below?
5. **Show the long-term projection.** "At your current fee level, you'll pay ~$X over 30 years."
6. **Suggest specific reductions** if above 0.5%.
7. **Answer questions** about any fee type they don't understand.

## Why Fees Matter So Much

The impact compounds over time — working against you.

Starting: $50,000 initial, $300/month contributions, 6% annual return:

| Annual Fee | After 30 Years | Lost to Fees |
|---|---|---|
| 0.1% | ~$488,000 | Baseline |
| 0.5% | ~$458,000 | ~$30,000 |
| 1.0% | ~$418,000 | ~$70,000 |
| 2.0% | ~$355,000 | ~$133,000 |

**The 0.5% rule:** Keep total annual costs below 0.5%, whether TradFi or DeFi. The best TradFi index funds (Vanguard, Fidelity) charge 0.03%–0.08% — that's the benchmark.

## DeFi Costs on Ondo and Related Protocols

### Gas Fees
Cost of executing a transaction on the blockchain. Ethereum is most expensive ($1–$50+), Solana is cheapest (fractions of a cent). Every swap, deposit, or withdrawal costs gas.

**Mitigation:** Batch transactions, use cheaper chains (Solana, BNB), time for low-gas periods.

### Swap Fees
Fee charged by a DEX when exchanging tokens. Typically 0.01%–0.3% per swap. You pay this every time you buy bCSPX, bIB01, or rebalance.

**Mitigation:** Use aggregators (1inch, Jupiter) for best rates, minimize unnecessary trading.

### Slippage
Difference between expected and actual execution price. Matters for large trades in low-liquidity pools — could be 0.1%–2%+.

**Mitigation:** Set slippage tolerance, split large trades, use limit orders where available.

### Protocol Fees
Fees charged by DeFi protocols for their services (Morpho lending, Ondo streaming, Balancer pools). Typically 0.1%–0.5% annually.

**Mitigation:** Compare protocols, choose lowest-fee option meeting your needs.

### Bridging Fees
Cost of moving tokens between blockchains ($1–$20+ per bridge). Pick one chain upfront and avoid unnecessary bridging. Ondo operates on Ethereum, Solana, and BNB Chain.

### MEV (Maximal Extractable Value)
Validators can reorder transactions to extract profit from your trade, resulting in slightly worse prices.

**Mitigation:** Use MEV-protected RPC endpoints, private transaction pools, or DEX aggregators with MEV protection.

## Ondo DeFi vs TradFi Cost Comparison

| Category | TradFi (Best) | Ondo DeFi |
|---|---|---|
| Annual management | 0.03%–0.08% | Protocol fees vary |
| Trading per tx | $0 (commission-free) | Gas + swap ($0.01–$50 by chain) |
| Advisory | 0%–1% | 0% (self-directed) |
| Rebalancing | $0 | Gas + swap per trade |

DeFi can be cheaper for buy-and-hold (no advisory fees, no commissions) but more expensive for frequent traders (gas adds up). The optimal DeFi strategy matches Bogle: trade as little as possible.

## Cost Reduction Checklist

1. **Low-fee assets:** bIB01 and USDY have institutional fee structures. OGM ETFs pass through underlying expense ratios.
2. **Pick your chain wisely:** Solana/BNB for frequent small purchases (DCA). Ethereum for large infrequent trades.
3. **Minimize trading:** Monthly DCA is cheaper than weekly. Yearly rebalancing is cheaper than quarterly.
4. **Use aggregators:** 1inch, Jupiter route through cheapest paths automatically.
5. **Batch operations:** Multiple swaps in one session saves on approval transactions.
6. **Avoid unnecessary bridging:** Pick one chain and stick with it.
7. **Track total costs:** If annual total exceeds 0.5% of portfolio value, find reductions.

## Output Format

When discussing costs:

1. **Estimate annual cost** based on their strategy
2. **Compare to 0.5% benchmark**
3. **Identify biggest cost drivers** with specific reductions
4. **Project long-term impact** over 10, 20, 30 years
5. **Recommend cheapest viable setup** for their situation
