---
name: advanced-liquidity-strategies
description: Teach users how to use their Ondo Finance portfolio as collateral to access low-interest loans in DeFi instead of selling investments, preserving compound growth and tax efficiency. Use this skill when users ask about borrowing against their portfolio, collateralized loans, DeFi lending, "I need cash but don't want to sell", leveraged investing, Morpho, Aave, Compound, loan-to-value, liquidation, using crypto as collateral, or when they need liquidity without disrupting their investment strategy. Also trigger when users ask about advanced DeFi strategies, capital efficiency, or how to access cash without selling their holdings.
---

# Advanced Liquidity Strategies: Collateralized Borrowing

> **Before using this skill, read the interaction guide:** `references/interaction-guide.md`
> This skill operates as a chatbot conversation. Carefully assess the user's understanding and readiness before discussing borrowing strategies. Challenge users who may not be ready for advanced strategies. Output the standardized JSON if a borrowing plan is configured.

Sometimes you need cash but selling your investments is the wrong move. Every time you sell, you break the compounding cycle, potentially trigger taxable events, and have to time your re-entry. Collateralized borrowing offers an alternative: borrow against your assets instead.

This is an advanced skill. Users should have a solid understanding of portfolio allocation, risk management, and DeFi mechanics before using these strategies.

## Chatbot Interaction Flow

1. **Gate check.** Ask: "Do you have an emergency fund and a portfolio already set up?" If no to either, route them to the appropriate skill. This is not for beginners.
2. **Assess understanding.** Ask: "Can you explain what liquidation means in DeFi lending?" If they can't, educate them before proceeding. Never set up a borrowing plan for someone who doesn't understand liquidation.
3. **Understand the need.** "Why do you need liquidity? What's the money for?" Legitimate needs: home repair, tax bill, opportunity. Red flags: "I want to buy more crypto with it" (leveraged speculation).
4. **Challenge speculation.** If they want to borrow to buy more volatile assets: "That's leveraged investing. If both your collateral and your purchased assets drop, you face liquidation cascades. I'd strongly recommend against this. Want me to explain why?"
5. **Calculate safe parameters.** Based on their collateral assets, calculate the maximum safe borrow amount (50% LTV for stable, 30% for volatile).
6. **Present the borrowing plan** with exact numbers: collateral, borrow amount, LTV, estimated interest, repayment schedule.
7. **Walk through the worst case.** "If your collateral dropped X%, here's what would happen to your position."
8. **Set up monitoring plan.** How often to check, what alerts to set.
9. **Summarize and get confirmation.**
10. **Output the JSON** with the borrowing plan included.

### Borrowing JSON Output

When a borrowing plan is configured, extend the standard JSON:

```json
{
  "investment": [
    { "asset_class": "stocks", "chain_id": 1, "allocation_percentage": 50, "risk": "medium" },
    { "asset_class": "cash", "chain_id": 1, "allocation_percentage": 20, "risk": "low" },
    { "asset_class": "crypto_blue_chip", "chain_id": 1, "allocation_percentage": 30, "risk": "high" }
  ],
  "emergency_reserve": {
    "target_amount": 18000,
    "current_amount": 18000,
    "monthly_contribution": 0,
    "months_to_complete": 0,
    "assets": [
      { "asset_class": "stable_yield", "chain_id": 1, "allocation_percentage": 100, "risk": "very_low" }
    ]
  },
  "borrowing": {
    "collateral_asset": "bIB01",
    "collateral_amount": 25000,
    "borrow_asset": "USDC",
    "borrow_amount": 10000,
    "ltv_percentage": 40,
    "liquidation_threshold": 80,
    "estimated_apr": 4.5,
    "protocol": "Morpho",
    "repayment_plan": {
      "monthly_payment": 1750,
      "duration_months": 6
    }
  }
}
```

## The Core Concept

Instead of selling your investments when you need cash:

1. **Deposit** your assets (bIB01, USDY, bCSPX, WETH) as collateral in a lending protocol
2. **Borrow** stablecoins (USDC, DAI) at low interest rates
3. **Use** the borrowed stablecoins for whatever you need
4. **Repay** the loan when convenient — your investments remain intact and growing the entire time

Your portfolio keeps compounding while you access liquidity. When you repay the loan, you get your collateral back unchanged.

## Why Borrow Instead of Sell?

| Selling | Borrowing Against |
|---|---|
| Breaks compounding | Portfolio keeps growing |
| May trigger taxes on gains | Borrowing is generally not a taxable event |
| Need to time re-entry to market | No re-entry problem — you never left |
| Permanent reduction in position | Temporary — repay and get collateral back |
| Simple, no ongoing risk | Ongoing: interest payments, liquidation risk |

The trade-off is clear: borrowing preserves your position but introduces new risks (liquidation, interest). It's not always the right choice — but for users with stable portfolios and clear repayment plans, it can be powerful.

## Key Concepts

### Loan-to-Value (LTV) Ratio
The ratio of your loan amount to your collateral value.

```
LTV = Loan Amount ÷ Collateral Value × 100
```

Example: Deposit $10,000 in bIB01 (cash), borrow $5,000 in USDC → LTV = 50%

### Liquidation Threshold
The LTV at which the protocol automatically sells your collateral to repay the loan. This protects the lender but is devastating for you.

Example: If the liquidation threshold is 80% and your collateral drops in value (or your loan accrues enough interest) to push your LTV above 80%, your collateral gets liquidated — sold at a discount, and you lose it.

### Health Factor
A number that represents how safe your loan is:
- **Above 1.5:** Healthy, safe margin
- **1.0–1.5:** Getting risky, consider repaying some or adding collateral
- **Below 1.0:** Liquidation imminent or happening

### Interest Rate
The cost of borrowing. In DeFi, rates are variable and change based on supply and demand. Typical stablecoin borrowing rates range from 2-8% APR depending on market conditions.

## DeFi Lending Protocols for Ondo Assets

### Morpho
- OGM tokenized assets can be used as collateral in Morpho lending vaults
- Optimized rates — Morpho matches lenders and borrowers for better rates than traditional pool-based protocols
- Integrated with Ondo's ecosystem

### Aave
- Major DeFi lending protocol
- Well-established, audited, high liquidity
- Variable and stable rate options
- Suitable for borrowing against stablecoins and established assets

### Compound
- Another established DeFi lending protocol
- Simple interface, transparent rates
- Good for straightforward borrow/repay operations

## Strategy Scenarios

### Scenario 1: "I Need Cash but Don't Want to Sell"
**Situation:** You have $50,000 in bIB01 (cash) and bCSPX (stocks). You need $10,000 for a home repair.

**Action:**
1. Deposit $25,000 in bIB01 (cash) as collateral (using only a portion, not your whole portfolio)
2. Borrow $10,000 USDC (40% LTV — safely below liquidation)
3. Use the USDC for the repair
4. Repay over 6-12 months from income
5. Retrieve your bIB01 collateral — which has been earning yield the entire time

**Result:** You got the cash you needed, your bIB01 kept earning ~3.75%, and you never disrupted your investment strategy.

### Scenario 2: "Emergency Liquidity Backup"
**Situation:** You have a funded emergency fund in USDY, but face an expense that exceeds it.

**Action:**
1. Use your USDY emergency fund first
2. If more is needed, borrow against bIB01/bCSPX holdings
3. Repay the borrowed amount as priority, then refill the emergency fund

This is a last resort — only for genuine emergencies that exceed the emergency fund.

### Scenario 3: "Tax-Efficient Cash Access"
**Situation:** You have significant unrealized gains in OGM tokenized ETFs. Selling would trigger a large tax bill.

**Action:**
1. Deposit OGM ETFs as collateral
2. Borrow the needed amount
3. The loan is not a taxable event — you access cash without realizing gains
4. Repay from future income

**Important:** Tax treatment varies by jurisdiction. This is a general principle, not tax advice. Users should consult a tax professional for their specific situation.

## Safe Borrowing Guidelines

### The Golden Rules

1. **Never borrow more than 50% of your collateral value (50% LTV max)**
   - For stable collateral (bIB01, USDY): max 50% LTV
   - For volatile collateral (OGM stocks): max 30% LTV
   - Lower LTV = bigger safety buffer against liquidation

2. **Always have a repayment plan before borrowing**
   - Know exactly how and when you'll repay
   - Monthly repayment schedule is ideal
   - Don't borrow hoping your collateral will go up enough to repay

3. **Monitor your health factor weekly**
   - Set up alerts for when health factor drops below 1.5
   - Use DeFi dashboards (Zerion, Zapper, DeBank) to track positions
   - If health factor approaches 1.2, take action immediately (repay or add collateral)

4. **Use stable assets as collateral when possible**
   - bIB01 and USDY are much safer collateral than volatile OGM stocks
   - Stable collateral means your LTV barely changes, so liquidation risk is very low
   - If using OGM stocks as collateral, use much lower LTV (30% or less)

5. **Never use borrowed funds to buy more volatile assets**
   - This is leveraged investing and can cause liquidation cascades
   - If the assets you bought with borrowed money drop, AND your collateral drops, you get liquidated and lose everything
   - Only borrow for genuine needs, not for speculation

## Risks Specific to DeFi Borrowing

### Smart Contract Risk
Lending protocols are software. Software has bugs. Unlike a bank, there's no guarantee you'll get your collateral back if the protocol is exploited. Only use well-established, audited protocols.

### Interest Rate Risk
DeFi borrowing rates are variable. A loan at 3% today could be 8% next month if market conditions change. Budget for rate increases.

### Liquidation Cascades
In extreme market events, many positions get liquidated simultaneously, which drives prices down further, causing more liquidations. This cascade effect can be devastating. Maintaining low LTV is the best protection.

### Oracle Risk
Lending protocols rely on price oracles (like Chainlink) to value your collateral. If the oracle reports an incorrect price, it could trigger an unjustified liquidation. This is rare but has happened.

### Protocol Governance Risk
DeFi protocols can change parameters (liquidation thresholds, supported collateral, interest rate models) through governance votes. Stay informed about protocol changes that could affect your position.

## Who Should NOT Use This Skill

- **Beginners** — Master basic investing first. Collateralized borrowing adds complexity and risk.
- **Users without emergency funds** — Build the safety net before adding leverage to your life.
- **Users who don't understand liquidation** — If you can't explain liquidation risk to someone else, don't borrow.
- **Anyone who would borrow to speculate** — Borrowing to buy more volatile assets is gambling with amplified risk.

## Output Format

When advising a user on collateralized borrowing:

1. **Assess eligibility:** Do they have an emergency fund? Do they understand the risks? Are they borrowing for a legitimate need?
2. **Recommend collateral:** Which Ondo assets to use (prefer bIB01/USDY for stability)
3. **Calculate safe LTV:** Never above 50% for stable, 30% for volatile
4. **Estimate costs:** Interest rate range and total cost over repayment period
5. **Repayment plan:** Monthly amount and timeline
6. **Risk warnings:** Liquidation threshold, what happens in a worst-case scenario
7. **Monitoring plan:** How often to check, what alerts to set
