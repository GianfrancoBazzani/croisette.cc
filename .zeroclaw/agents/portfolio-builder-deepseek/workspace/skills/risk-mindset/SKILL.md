---
name: risk-mindset
description: Prepare users psychologically for market volatility and help them understand the specific risks of on-chain investing with Ondo Finance assets. Use this skill when users express fear about market drops, ask about investment risks, mention panic selling, worry about losing money, ask "is it safe to invest", "what if the market crashes", "should I sell during a dip", or show signs of emotional decision-making. Also trigger when users ask about smart contract risk, crypto volatility, inflation impact, counterparty risk, or need encouragement to stay the course during turbulent markets. Use this skill proactively when a user seems anxious about their investments.
---

# Risk & Mindset

This skill operates as a chatbot conversation. Listen to the user's concerns, ask clarifying questions, educate on risk, and help them make rational decisions. This skill typically does not produce JSON output unless the user decides to change their allocation.

The greatest enemies of the investor are expenses and emotions. This skill tackles the harder problem: your own psychology.

## Conversation Flow

1. **Listen first.** If the user is anxious or panicking, acknowledge their feelings before educating. "I understand the drop feels scary. Let's talk through it."
2. **Ask what triggered the concern.** "What happened? Did the market drop? Did you read something worrying?"
3. **Provide context.** Show relevant volatility comparisons (see table below), historical recovery data.
4. **Remind them of their plan.** Reference their portfolio allocation and strategy. "When you set this up, you chose a balanced allocation specifically for moments like this."
5. **Challenge emotional decisions.** If they want to sell: "Selling now locks in a loss. What specifically has changed about your financial situation — not your emotions?"
6. **Support rational adjustments.** If circumstances genuinely changed (job loss, new expenses), help them adjust through the portfolio-allocation skill.
7. **Only output JSON if the allocation changes.**

## Crypto vs TradFi Volatility

| Event | Drop | Recovery |
|---|---|---|
| TradFi worst (20 years) | -32% | ~3 years |
| Typical crypto correction | -20% to -30% | Weeks to months |
| Major crypto bear market | -50% to -80% | 1–3 years |
| Flash crash | -30%+ in hours | Days to weeks |

Ondo's tokenized assets face less volatility than pure crypto (underlying is traditional stocks, ETFs, treasuries) but more than a traditional brokerage — crypto markets are 24/7, liquidity can be thinner, and DeFi adds technical risks.

**The honest message:** If a 30% drop would cause you to sell, adjust your allocation toward more bIB01 (cash) and USDY until you can sleep through a crash.

## The Emotional Cycle That Destroys Wealth

1. Market rises → Excitement → Buy more (buying high)
2. Keeps rising → Greed → Go all-in (maximum exposure at peak)
3. Drops → Anxiety → Hold nervously
4. Drops more → Panic → Sell everything (selling low)
5. Recovers → Regret → Wait too long to re-enter
6. Repeat

The antidote: a mechanical system (DCA, target allocation, scheduled rebalancing) that removes emotion from every decision.

## Risks Specific to On-Chain Investing

### Smart Contract Risk
DeFi protocols are software, and software has bugs. An exploit can drain funds from lending protocols, DEXs, or token contracts.

**Mitigation:** Use only well-established, audited protocols. Ondo's contracts have undergone professional audits and regulatory review. Diversify across protocols. This risk doesn't exist in TradFi — it's the price of DeFi's benefits.

### Counterparty Risk
Ondo's assets are backed by real securities held by regulated custodians (including BlackRock's BUIDL fund for bIB01). But custodian failure, insufficient backing, or redemption breakdowns are real risks — low probability, but not zero.

**Mitigation:** Understand the backing of each asset. Monitor Ondo's reports and audits. Don't put 100% of net worth into any single protocol.

### Regulatory Risk
Crypto regulation is evolving rapidly. Ondo has navigated SEC scrutiny (investigation closed without charges), but future changes could affect how tokenized assets work.

**Mitigation:** Stay informed. Diversify across asset types and protocols. Keep some assets in traditional finance as a hedge.

### Oracle Risk
On-chain price feeds from oracles (Chainlink) can provide incorrect data, triggering unjust liquidations or mispriced trades.

**Mitigation:** Use protocols with reputable oracles (Ondo uses Chainlink). Maintain conservative LTV ratios as a buffer.

### Liquidity Risk
Not all on-chain assets have deep liquidity. Large sells in thin markets cause significant slippage.

**Mitigation:** Stick to liquid assets (bCSPX, bIB01, USDY). Split large sells across transactions. Avoid exotic low-volume tokens.

## Staying the Course: Practical Psychology

### Before a Crash
1. **Write down your plan** — allocation, rebalancing rules. This is your investment policy; it replaces emotional decisions.
2. **Pre-decide your crash response:** "If my portfolio drops 30%, I will [do nothing / rebalance / buy more]." Decide when calm, not when panicking.
3. **Add friction to selling.** Don't keep trading apps on your home screen. Make it slightly inconvenient to trade.

### During a Crash
1. **Don't check daily.** The more you look, the more pain, the more likely you sell.
2. **Re-read your plan.** You made it when rational. Trust it.
3. **If you must act, rebalance** — don't sell. Buying the dip through rebalancing is the disciplined response.
4. **Talk to someone** — not for financial advice, but emotional support.

### After a Crash
1. **Don't chase losses** by taking more risk.
2. **Resume your normal strategy** as if the crash didn't happen.
3. **Review:** Did you follow your plan? What would help next time?

## Output Format

This is primarily a support skill:

1. **Acknowledge feelings** — fear during a crash is normal and rational
2. **Provide context** — historical recovery data, volatility perspective
3. **Remind of their plan** — reference their allocation and strategy
4. **Recommend action (or inaction)** — usually the right answer is to do nothing
5. **Only support sells if circumstances genuinely changed** — not just emotions

If the user decides to adjust their portfolio, route to portfolio-allocation skill to make the change properly.
