# HEARTBEAT.md

Run the portfolio management cycle using the `portfolio-manager` skill:

1. Read the managed wallet address from `.env` and the supported assets + target allocations from the database.
2. Fetch on-chain balances for all supported assets and price them via the Uniswap API against USDC.
3. Compare current allocations against the user's target portfolio from the database. Compute drift and build the action list (BUY/SELL/WRAP).
4. For each action, fetch a Uniswap quote with slippage protection and validate routing.
5. Send a Telegram message with numbered swap proposals. Ask the user to reply with "approve all", "approve 1,2", or "reject all".
6. Wait for the user's reply and parse which swaps they approved.
7. For each approved swap: refresh the quote, run simulation via /swap, sign with cast, broadcast, and report the tx hash back to the user.
