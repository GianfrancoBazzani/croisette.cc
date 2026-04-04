---
name: risk-mindset
description: Prepare users psychologically for market volatility and help them understand the specific risks of on-chain investing with Ondo Finance assets. Use this skill when users express fear about market drops, ask about investment risks, mention panic selling, worry about losing money, ask "is it safe to invest", "what if the market crashes", "should I sell during a dip", or show signs of emotional decision-making. Also trigger when users ask about smart contract risk, crypto volatility, inflation impact, counterparty risk, or need encouragement to stay the course during turbulent markets. Use this skill proactively when a user seems anxious about their investments.
---

# Risk & Mindset

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Listen to the user's concerns, ask clarifying questions, educate on risk, and help them make rational decisions. This skill typically does not produce JSON output unless the user decides to change their allocation based on the conversation.

The greatest enemies of the investor are expenses and emotions. We covered expenses in the Understanding Costs skill. This skill tackles the harder problem: your own psychology.

## Chatbot Interaction Flow

1. **Listen first.** If the user is anxious or panicking, acknowledge their feelings before educating. "I understand the drop feels scary. Let's talk through it."
2. **Ask what triggered the concern.** "What happened that's making you think about this? Did the market drop? Did you read something worrying?"
3. **Provide context.** Show relevant volatility comparisons (TradFi vs. crypto), historical recovery data.
4. **Remind them of their plan.** Reference their portfolio allocation and strategy. "When you set this up, you chose a balanced allocation specifically to handle moments like this."
5. **Challenge emotional decisions.** If they want to sell: "Selling now would lock in a loss. Your plan was designed for exactly this scenario. What specifically has changed about your financial situation — not your emotions?"
6. **Support rational adjustments.** If their life circumstances genuinely changed (job loss, new expenses), help them adjust rationally through portfolio-allocation skill.
7. **Only output JSON if the allocation changes.** If the user decides to adjust their portfolio based on the conversation, output an updated JSON. Otherwise, the goal is simply to help them stay the course.

## Crypto Volatility vs. TradFi Reality Check

The "Boringly Getting Rich" guide notes that the worst drop in traditional markets over the last 20 years was -32%, and it took 3 years to recover. That's the benchmark investors are trained to endure.

In crypto, the reality is much more extreme:

| Event | Drop | Recovery Time |
|---|---|---|
| TradFi worst case (20 years) | -32% | ~3 years |
| Typical crypto correction | -20% to -30% | Weeks to months |
| Major crypto bear market | -50% to -80% | 1-3 years |
| Flash crash events | -30%+ in hours | Days to weeks |

Users investing in Ondo's tokenized assets face LESS volatility than pure crypto (since the underlying assets are traditional stocks, ETFs, and treasuries), but MORE volatility than holding those assets in a traditional brokerage — because crypto markets are open 24/7, liquidity can be thinner, and DeFi adds technical risks.

**The honest message:** If a 30% drop in your portfolio would cause you to sell, adjust your allocation to include more bIB01 (cash) and USDY until you find a mix where you can sleep at night during a crash.

## The Enemies of the Investor

### Enemy 1: Emotions

The pattern that destroys wealth:
1. Market rises → Excitement → Buy more (buying high)
2. Market keeps rising → Greed → Go all-in (maximum exposure at peak)
3. Market drops → Anxiety → Hold nervously
4. Market drops more → Panic → Sell everything (selling low)
5. Market recovers → Regret → Wait too long to get back in
6. Repeat

This cycle reliably destroys returns. The antidote is a mechanical system (DCA, target allocation, scheduled rebalancing) that removes emotion from every decision.

### Enemy 2: Expenses

Covered in the Understanding Costs skill, but the reminder: fees compound against you over decades. A 1% fee difference over 30 years costs $100,000+ on a modest portfolio. Keep total costs below 0.5%.

### Enemy 3: Timing

Nobody can consistently time the market. Not hedge fund managers, not algorithms, not your friend who "called" the last crash. The data: 96% of professional fund managers cannot beat a simple index fund over 15 years. If the best in the world can't do it, you probably can't either — and that's perfectly fine.

The strategy that wins: buy regularly, hold patiently, rebalance annually.

## Inflation: The Invisible Enemy

Inflation doesn't feel like a risk because it's slow and invisible. But it's relentless:

- $50,000 today → ~$30,000 in purchasing power after 20 years (at 2% inflation)
- At 3% inflation, that same $50,000 buys only ~$27,000 worth in 20 years

This is why "keeping money safe in a savings account" is actually losing money. The purchasing power of your savings erodes every year you don't invest.

The Rule of 72 works for inflation too: at 2% inflation, your money's purchasing power halves in 36 years. At 3%, it halves in 24 years.

**The solution:** Invest in assets that grow faster than inflation. Historically, broad stock market returns (5-7% after inflation) outpace inflation significantly. bIB01 earns Treasury yields, and USDY at minimum preserves purchasing power.

## Risks Specific to On-Chain Investing

### Smart Contract Risk
DeFi protocols are software, and software has bugs. A smart contract exploit can drain funds from lending protocols, DEXs, or even token contracts.

**Mitigation:**
- Use only well-established, audited protocols
- Ondo's contracts have undergone professional audits and regulatory review
- Diversify across protocols rather than putting everything in one
- Understand that this risk doesn't exist in TradFi — it's the price of DeFi's benefits

### Counterparty Risk
Ondo's tokenized assets are backed by real securities held by regulated custodians. But what happens if:
- The custodian fails?
- The backing becomes insufficient?
- The redemption process breaks down?

These are real risks, even though Ondo uses institutional-grade custody (including BlackRock's BUIDL fund for bIB01). The risk is low, but it's not zero.

**Mitigation:**
- Understand the backing of each asset you hold
- Monitor Ondo's published reports and audits
- Don't put 100% of your net worth into any single protocol

### Regulatory Risk
Crypto regulation is evolving rapidly. Rules that apply today may change tomorrow. Ondo has navigated SEC scrutiny successfully (the SEC closed its investigation without charges), but future regulatory changes could affect how tokenized assets work.

**Mitigation:**
- Stay informed about regulatory developments
- Diversify across asset types and protocols
- Keep some assets in traditional finance as a hedge

### Oracle Risk
On-chain price feeds come from oracles (like Chainlink). If an oracle provides incorrect pricing data, it can trigger unjust liquidations or mispriced trades.

**Mitigation:**
- Use protocols that rely on reputable oracles (Ondo uses Chainlink)
- Be aware this risk exists, especially for lending positions
- Maintain conservative LTV ratios as a buffer

### Liquidity Risk
Not all on-chain assets have deep liquidity. Trying to sell a large position in a thin market can result in significant slippage.

**Mitigation:**
- Stick to well-liquid assets (bCSPX, bIB01, USDY)
- Split large sells across multiple transactions
- Avoid exotic or low-volume tokenized assets

## Staying the Course: Practical Psychology

### Before a Crash (Preparation)
1. **Set your allocation and write it down.** Include your rebalancing rules. This is your investment policy statement — it replaces emotional decision-making with a plan.
2. **Decide in advance what you'll do during a 30% drop.** Write it down: "If my portfolio drops 30%, I will [do nothing / rebalance / buy more]." Making this decision when you're calm prevents panic decisions later.
3. **Remove easy selling access.** Don't keep your trading app on your phone's home screen. Make it slightly inconvenient to trade — friction prevents impulsive sells.

### During a Crash (Execution)
1. **Do NOT check your portfolio daily.** The more you look, the more pain you feel, the more likely you are to sell.
2. **Re-read your investment policy.** You made this plan when you were rational. Trust it.
3. **Remember the math:** Every historical market crash has recovered — eventually. The worst TradFi crash of the last 20 years recovered in 3 years.
4. **If you must act, rebalance** — don't sell. Buying the dip through rebalancing is the disciplined response.
5. **Talk to someone** — not for financial advice, but for emotional support. Investing during a crash is lonely and scary.

### After a Crash (Recovery)
1. **Do not try to "make up" losses by taking more risk.** This leads to a worse outcome.
2. **Resume your normal strategy** (DCA, rebalancing) as if the crash didn't happen.
3. **Review what you learned** — did you follow your plan? If not, what would help next time?

## The Boring Investing Manifesto

From everything we've learned across all the source material:

1. **Invest early.** Time is the most powerful variable.
2. **Buy the whole market.** Don't try to pick winners.
3. **Keep costs below 0.5%.** Fees are the guaranteed drag on returns.
4. **Invest regularly.** DCA removes emotion and timing from the equation.
5. **Don't try to beat the market.** 96% of pros can't do it over 15 years.
6. **Rebalance yearly.** Stay aligned with your risk tolerance.
7. **Have an emergency fund.** 6+ months in USDY before investing in anything volatile.
8. **Ignore the noise.** Daily news, market predictions, and hot tips are distractions.
9. **Stay the course.** The hardest and most important rule.
10. **Be bored.** If your investing feels exciting, you're probably doing it wrong.

## Output Format

When supporting a user's mindset:

1. **Acknowledge their feelings** — fear during a crash is normal and rational
2. **Provide context** — historical recovery data, perspective on volatility
3. **Remind them of their plan** — refer back to their allocation and strategy
4. **Recommend action (or inaction)** — usually the right answer is to do nothing
5. **Only support sells if they've genuinely changed their circumstances** — not just their emotions
