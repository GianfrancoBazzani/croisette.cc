---
name: investing-fundamentals
description: Teach users the foundational concepts of investing, including what stocks, cash (bonds/T-bills), and index funds are, how they map to blockchain equivalents (bCSPX, bIB01, USDY, WETH), the Rule of 72, compounding, diversification, and why passive investing beats active management. Use this skill whenever a user asks basic investing questions like "what is a stock", "what is a bond", "what is cash", "what are index funds", "how does investing work", "what is an ETF", "explain investing basics", "what is diversification", "what is compounding", or anything about TradFi concepts and their DeFi equivalents. Also trigger when users seem new to investing or ask beginner-level financial questions.
---

# Investing Fundamentals

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Ask questions one at a time, answer any user questions along the way, challenge inconsistencies, and conclude with the standardized JSON output.

This skill teaches users the core building blocks of investing, bridging traditional finance (TradFi) concepts to their decentralized finance (DeFi) equivalents on Ondo Finance.

## Chatbot Interaction Flow

1. **Gauge the user's knowledge level.** Ask: "How familiar are you with investing? Complete beginner, know the basics, or experienced?" Tailor explanations accordingly.
2. **Walk through concepts one by one.** Don't dump all the information at once. Introduce stocks → cash/bonds → index funds → diversification → compounding, pausing after each to check understanding.
3. **Answer any questions the user has.** If they ask "what's an ETF?" or "why not just buy Bitcoin?", explain thoroughly before continuing.
4. **Connect each concept to Ondo.** As you explain each TradFi concept, immediately show the on-chain equivalent.
5. **Check readiness.** When the user understands the fundamentals, ask if they're ready to design their portfolio. If yes, transition to the portfolio-allocation or cash-emergency-fund skill.
6. **No JSON output from this skill alone** — this is a pure education skill. JSON output is produced when the user progresses to portfolio-allocation, emergency-fund, or a strategy skill.

## What Are Stocks (Equities)?

Stocks are small ownership shares in a company. When you buy stock in Apple, you own a tiny piece of that company. If the company does well, your share becomes worth more. Stocks tend to grow more over time, but they can swing up and down a lot in the short term — they're the higher-risk, higher-reward option.

An "equity investor" is simply someone who buys ownership shares in companies.

**On-chain equivalent:** Ondo Global Markets (OGM) tokenized stocks. These are digital tokens on Ethereum, Solana, or BNB Chain that represent real company shares (like AAPL, TSLA) backed by actual stock held with a licensed custodian. You get the same price exposure as the real stock, but with on-chain settlement, 24/7 transferability, and fractional access.

## What Is Cash / Fixed Income?

In traditional finance, bonds are loans you make to a government or company — they pay you back with interest. Short-term government bonds (T-bills) are so stable and liquid that they're effectively treated as cash equivalents. That's why we call this asset class **cash** in our portfolio framework.

**On-chain equivalents:**
- **bIB01** — Tokenized short-term US Treasury bonds (0-1 year), backed 1:1 by the iShares $ Treasury Bond 0-1yr UCITS ETF. This is the on-chain equivalent of holding cash in a money market fund — very low risk, very stable.
- Note: OUSG is another tokenized Treasury product by Ondo Finance, but in our portfolio framework, bIB01 is the designated cash asset.
- **USDY** — A yield-bearing stablecoin backed by US Treasuries and bank deposits. Accrues daily interest. Reserved for emergency funds.

## What Are Index Funds and ETFs?

An index fund tracks a market index (like the S&P 500) and gives you the market average return. Instead of picking individual stocks, you buy a tiny slice of hundreds or thousands of companies at once. ETFs (Exchange-Traded Funds) are index funds you can trade on stock exchanges.

The key insight: 96% of professional fund managers cannot beat the market average over a 15-year period. So rather than trying to pick winners, just buy the whole market cheaply.

As John C. Bogle (founder of Vanguard) put it: "Don't look for the needle in the haystack. Just buy the haystack."

**On-chain equivalent:** OGM tokenized ETFs from BlackRock, Fidelity, and other major providers — available on Ondo Global Markets. These give you broad market exposure through a single token, just like a traditional ETF but tradeable on-chain.

## The TradFi-to-Ondo Mapping

| TradFi Concept | Ondo Equivalent |
|---|---|
| Government bond ETF / Cash equivalent | **bIB01** (tokenized short-term US Treasury bonds) |
| Money market / savings account | **USDY** (yield-bearing stablecoin — emergency reserve only) |
| Money market / savings account | **USDY** (yield-bearing stablecoin) |
| Accumulating cash ETF | **USDY** (price rises as yield builds) |
| Distributing cash ETF | **rUSDY** (rebasing — supply increases, price stays at $1) |
| Individual stocks | **OGM tokenized stocks** (AAPL, TSLA, etc.) |
| S&P 500 / broad market ETF | **OGM tokenized ETFs** (BlackRock, Fidelity funds) |
| Brokerage account | **Self-custody wallet** (MetaMask, Trust Wallet, Ledger) |
| Trading platform | **DEXs** (Jupiter, 1inch, Uniswap) |

## Why Broad Diversification Matters

Spread your money across many continents, countries, and industries. Concentrating everything in one investment is how people build fortunes, but it's also how they lose them.

The data: Of the Forbes 400 richest people in 1982, only 16% were still on the list 20 years later. They only needed a 4.5% average annual return to stay on — but concentration risk wiped most of them out.

Diversification is about staying rich, not getting rich.

## The Rule of 72

Divide 72 by your annual rate of return to estimate how many years it will take for your money to double.

- At 5% return → money doubles in ~14 years
- At 7% return → money doubles in ~10 years
- At 10% return → money doubles in ~7 years

This works in reverse too — at 2% inflation, your purchasing power halves in ~36 years. This is why leaving money in a savings account slowly destroys its value.

## Compounding: The Core Engine

Compounding means your returns generate their own returns. $100,000 invested at 5% doesn't just earn $5,000/year forever — in year two, you earn 5% on $105,000, and so on. Over 30 years, that $100,000 becomes roughly $432,000 without adding a single dollar.

The earlier you start, the more powerful compounding becomes. Time is the most important variable in investing.

## Why "Boring" Passive Investing Works

The evidence is overwhelming:
- 96% of professional fund managers can't beat the market over 15 years
- Higher fees reliably reduce returns (1% extra in fees = $100,000+ lost over 30 years)
- Emotions cause investors to buy high and sell low
- The greatest enemies of the investor are expenses and emotions

The winning strategy is simple: buy broadly diversified, low-cost index funds (or their on-chain equivalents), invest regularly, and do nothing else. It's boring by design — and that's the feature, not the bug.
