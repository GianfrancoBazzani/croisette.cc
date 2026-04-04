---
name: understanding-costs
description: Teach users why minimizing investment fees and costs is critical for long-term wealth building, covering both TradFi expense ratios and DeFi-specific costs like gas fees, swap fees, and protocol fees. Use this skill when users ask about fees, costs, expense ratios, gas fees, swap fees, protocol fees, "how much does it cost to invest", "are there hidden fees", total cost of ownership, or when comparing the cost of using Ondo Finance vs traditional brokers. Also trigger when users seem unaware of how fees compound against returns over time.
---

# Understanding Costs

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, and educate the user on fee impact. If this skill is used during portfolio design, the final output contributes to the standardized JSON.

Fees are the silent killer of investment returns. John C. Bogle called them one of the two greatest enemies of the investor (alongside emotions). The math is brutal: paying just 1% more per year in fees can cost you over $100,000 over 30 years.

## Chatbot Interaction Flow

1. **Ask what they're currently paying.** "Do you know what fees you're paying on your current investments?" Most users don't — this creates a teachable moment.
2. **Walk through each cost type** relevant to their situation (gas, swap, protocol fees).
3. **Calculate their estimated annual cost** based on their strategy (DCA frequency, chain, assets).
4. **Compare to the 0.5% benchmark.** Are they above or below?
5. **Show the long-term projection.** "At your current fee level, you'll pay approximately $X over 30 years."
6. **Suggest specific reductions** if they're above 0.5%.
7. **Answer questions** about any fee type they don't understand.
8. **If part of a portfolio design session**, update the JSON with cost-optimized asset choices.

## Why Fees Matter So Much

The impact of fees compounds over time, just like returns — but working against you.

### The $100,000 Fee Difference

Starting conditions: $50,000 initial capital, $300/month contributions, 6% annual return.

| Annual Fee | Portfolio After 30 Years | Money Lost to Fees |
|---|---|---|
| 0.1% | ~$488,000 | Baseline |
| 0.5% | ~$458,000 | ~$30,000 lost |
| 1.0% | ~$418,000 | ~$70,000 lost |
| 1.1% (just 1% more than 0.1%) | ~$411,000 | ~$77,000 lost |
| 2.0% | ~$355,000 | ~$133,000 lost |

That 1% difference between 0.1% and 1.1% costs $77,000 — money that could have been compounding for you.

### The 0.5% Rule

Keep your total annual costs below 0.5%. This applies whether you're investing in TradFi or DeFi. Anything above that is eating too much of your returns.

## TradFi Costs (For Reference)

| Cost Type | What It Is | Typical Range |
|---|---|---|
| **Expense ratio** | Annual fee charged by the fund, deducted from returns | 0.03%–1.5% |
| **Brokerage commission** | Fee per trade | $0–$10 |
| **Advisory fee** | Annual fee paid to a financial advisor | 0.5%–1.5% |
| **Load fees** | One-time purchase or sale charges on some funds | 0%–5% |

The best TradFi funds (Vanguard, Fidelity index funds) charge 0.03%–0.08%. That's the benchmark to compare against.

## DeFi Costs on Ondo and Related Protocols

### Gas Fees
- **What:** The cost of executing a transaction on the blockchain
- **Varies by chain:** Ethereum is most expensive ($1–$50+ per transaction), Solana is cheapest (fractions of a cent)
- **Impact:** Every swap, deposit, withdrawal, or claim costs gas. Frequent small transactions on Ethereum can eat into returns.
- **Mitigation:** Batch transactions, use cheaper chains (Solana, BNB), time transactions for low-gas periods

### Swap Fees
- **What:** The fee charged by a DEX when you exchange one token for another
- **Typical range:** 0.01%–0.3% per swap
- **Impact:** Every time you buy bCSPX, bIB01, or rebalance your portfolio, you pay a swap fee
- **Mitigation:** Use DEXs with competitive fees (1inch aggregates for best rates), minimize unnecessary trading

### Slippage
- **What:** The difference between the expected price and the actual execution price
- **When it matters:** Large trades in low-liquidity pools can move the price against you
- **Impact:** Could be 0.1%–2%+ on large or illiquid trades
- **Mitigation:** Set slippage tolerance, split large trades, use limit orders where available

### Protocol Fees
- **What:** Fees charged by DeFi protocols for their services
- **Examples:** Morpho lending fees, Ondo streaming fees, Balancer pool fees
- **Typical range:** 0.1%–0.5% annually
- **Mitigation:** Compare protocols, choose the lowest-fee option that meets your needs

### Bridging Fees
- **What:** Cost of moving tokens between blockchains (e.g., Ethereum → Solana)
- **Impact:** $1–$20+ per bridge transaction depending on the bridge and network
- **Mitigation:** Choose your chain upfront and avoid unnecessary bridging. Ondo operates on Ethereum, Solana, and BNB Chain — pick one and stay.

### MEV (Maximal Extractable Value)
- **What:** Miners/validators can reorder transactions to extract profit from your trade
- **Impact:** You might get a slightly worse price than expected
- **Mitigation:** Use MEV-protected RPC endpoints, private transaction pools, or DEX aggregators that mitigate MEV

## Cost Comparison: Ondo DeFi vs. TradFi

| Cost Category | TradFi (Best Case) | Ondo DeFi (Estimated) |
|---|---|---|
| Annual management fee | 0.03%–0.08% (Vanguard/Fidelity ETFs) | Protocol fees vary, bIB01 has fund-level costs |
| Trading cost per transaction | $0 (commission-free brokers) | Gas + swap fee ($0.01–$50 depending on chain) |
| Advisory fee | 0%–1% (if using an advisor) | 0% (self-directed) |
| Rebalancing cost | $0 (commission-free) | Gas + swap fees per rebalance trade |
| Currency conversion | 0.1%–0.5% (for non-USD investors) | Swap fee for stablecoin conversion |

### Key Insight
DeFi can be cheaper than TradFi for buy-and-hold investors (no advisory fees, no commissions) but MORE expensive for frequent traders (gas fees add up). The optimal DeFi strategy matches the Bogle philosophy: trade as little as possible.

## Practical Cost Reduction Checklist

1. **Choose low-fee assets:** bIB01 and USDY have institutional-grade fee structures. OGM tokenized ETFs pass through the underlying fund's expense ratio.

2. **Pick your chain wisely:** Solana and BNB Chain have far lower gas costs than Ethereum. If you're making frequent small purchases (DCA), cheaper chains save significantly.

3. **Minimize trading frequency:** Every trade costs gas + swap fees. Monthly DCA is cheaper than weekly. Yearly rebalancing is cheaper than quarterly.

4. **Use aggregators:** 1inch, Jupiter, and similar DEX aggregators route your trade through the cheapest path automatically.

5. **Batch operations:** If you need to make multiple swaps, do them in one session to save on approval transactions.

6. **Avoid unnecessary bridging:** Pick one chain and stick with it. Each bridge operation costs money and adds risk.

7. **Track your total costs:** Add up gas, swap fees, protocol fees, and any other costs over a year. If the total exceeds 0.5% of your portfolio value, look for ways to reduce.

## Output Format

When discussing costs with users:

1. **Estimate their annual cost** based on their chosen strategy (DCA frequency, chain, assets)
2. **Compare to the 0.5% benchmark** — are they above or below?
3. **Identify the biggest cost drivers** and suggest specific reductions
4. **Project the long-term impact** — show how much their fees will cost over 10, 20, 30 years
5. **Recommend the cheapest viable setup** for their specific situation
