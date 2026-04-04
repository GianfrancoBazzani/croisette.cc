# Uniswap Trading API Reference

Scoped reference for the portfolio manager's proposal-mode Uniswap integration. This agent only uses `/check_approval` and `/quote`. It never calls `/swap`.

## Base URL and Authentication

Read from `.env`:

- `UNISWAP_API_BASE_URL` (default: `https://trade-api.gateway.uniswap.org/v1`)
- `UNISWAP_API_KEY`

Required headers for every request:

```
x-api-key: <UNISWAP_API_KEY>
Content-Type: application/json
Accept: application/json
x-universal-router-version: 2.0
```

## USDC Addresses by Network

| Network | Chain ID | USDC Address | Decimals |
|---|---|---|---|
| Ethereum Mainnet | 1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0Ce3606eB48` | 6 |
| Sepolia Testnet | 11155111 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | 6 |

## Endpoint: POST /check_approval

Determines whether the managed wallet needs to approve a token for spending via Permit2.

### Request

```json
{
  "token": "<token_address>",
  "amount": "<raw_amount_string>",
  "chainId": <chain_id>,
  "walletAddress": "<wallet_address>"
}
```

### Response

- `approval.isRequired`: boolean — whether an approval transaction is needed
- `approval.txData`: object — the approval transaction if needed (to, data, value)

### When to skip

- WRAP actions (native ETH -> WETH): no approval needed
- UNWRAP actions (WETH -> native ETH): no approval needed
- Native ETH as input: no approval needed

## Endpoint: POST /quote

Fetches a swap quote with routing and price data.

### Request

```json
{
  "tokenIn": "<token_in_address>",
  "tokenOut": "<token_out_address>",
  "tokenInChainId": <chain_id>,
  "tokenOutChainId": <chain_id>,
  "amount": "<raw_amount_string>",
  "type": "EXACT_INPUT",
  "swapper": "<wallet_address>",
  "routingPreference": "BEST_PRICE",
  "protocols": ["V2", "V3", "V4"]
}
```

For native ETH as input, use the zero address: `0x0000000000000000000000000000000000000000`.

### Slippage options

- **Mainnet default:** `"slippageTolerance": "0.80"` (0.8% = 80 basis points). Override with strategy `max_slippage_bps` if tighter.
- **Testnet:** `"autoSlippage": "DEFAULT"` or an explicit loose ceiling from strategy constraints.

### Response fields used

- `requestId` — unique identifier for the quote request
- `routing` — route type: `CLASSIC`, `WRAP`, `UNWRAP`, or others
- `quote.quoteId` — unique quote identifier (present for market trades)
- `quote.output.amount` — raw output amount string
- `quote.output.recipient` — should be the swapper address
- `quote.gasFeeUSD` — estimated gas in USD
- `quote.priceImpact` — price impact as a decimal (e.g., 0.0123 = 1.23%)
- `txFailureReasons` — array of failure reasons (empty = good)

## Routing Constraints

### Allowed

| Routing | Description |
|---|---|
| `CLASSIC` | Standard DEX routing through V2, V3, V4 pools |
| `WRAP` | Native ETH -> WETH (1:1, no DEX) |
| `UNWRAP` | WETH -> Native ETH (1:1, no DEX) |

### Rejected — do not use

| Routing | Why rejected |
|---|---|
| `DUTCH_V2` | Auction-based, non-deterministic |
| `DUTCH_V3` | Auction-based, non-deterministic |
| `PRIORITY` | MEV-aware ordering, non-deterministic |
| `BRIDGE` | Cross-chain, out of scope |

## Quote Validation Checklist

A quote passes validation when ALL of these hold:

1. `requestId` is present and non-empty
2. `quote.quoteId` is present (for CLASSIC trades; WRAP/UNWRAP may not have one)
3. `routing` is `CLASSIC`, `WRAP`, or `UNWRAP`
4. `txFailureReasons` is empty (mainnet) or treated as warning-only (testnet)
5. Price impact <= `constraints.max_price_impact_pct` (default 5% mainnet)
6. `quote.gasFeeUSD` <= `constraints.max_gas_cost_usd`
7. Quote age <= `constraints.quote_ttl_sec` at proposal assembly time
8. No unexpected fee recipients in the route
9. Output amount is non-zero and parseable

## Rate Limiting

- Space sequential requests by **150ms minimum**.
- On HTTP `429`, apply exponential backoff: start at 1s, double each retry, cap at 30s, add random jitter (0-500ms).
- Cache `/check_approval` results within the same heartbeat run (approval status doesn't change within seconds).
- Approximate limit: ~10 requests per second per endpoint.

## Endpoint: POST /swap (REFERENCE ONLY)

**This agent NEVER calls /swap.** Documented here only so the agent understands the full 3-step Trading API flow conceptually.

The `/swap` endpoint generates a signable transaction from a quote. It requires the quote object from `/quote` plus signing parameters. In a future execution phase (outside this agent's scope), the flow would be:

1. Refresh `/check_approval`
2. Refresh `/quote`
3. Call `/swap` with `simulateTransaction: true` for preflight
4. Sign and broadcast only after user approval

This agent stops at step 2. Steps 3-4 are not part of the heartbeat cycle.
