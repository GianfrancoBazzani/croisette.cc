# TOOLS.md — Local Notes

## Assets Database

- Path: sqlite.db (project root)
- Access via: `sqlite3 -header -column sqlite.db '<SQL>'`
- For JSON output: `sqlite3 -json sqlite.db '<SQL>'`
- Check schema: `sqlite3 sqlite.db '.schema'`
- Read available assets: `sqlite3 -json sqlite.db 'SELECT ticker, type, description FROM asset'`
- Asset types: stocks, crypto, cash, commodities, precious_metals, bonds
- All asset and portfolio data lives here — never use flat files for structured data
- DB schema is defined in `lib/db.ts` — refer to it for table definitions and constraints

## Portfolio Database

- Tables: `ideal_portfolio` and `ideal_portfolio_entry` (see `lib/db.ts` for full schema)
- One portfolio per user: `ideal_portfolio` has a UNIQUE constraint on `userId`
- Each entry links a portfolio to an asset with an allocation percentage (0–100)
- Read a user's target portfolio: `sqlite3 -json sqlite.db 'SELECT a.ticker, a.type, e.allocation FROM ideal_portfolio p JOIN ideal_portfolio_entry e ON e.portfolioId = p.id JOIN asset a ON a.id = e.assetId WHERE p.userId = "<USER_ID>"'`
- Create a portfolio: `sqlite3 sqlite.db "INSERT INTO ideal_portfolio (id, userId, createdAt, updatedAt) VALUES ('<UUID>', '<USER_ID>', <NOW_MS>, <NOW_MS>)"`
- Add an entry: `sqlite3 sqlite.db "INSERT INTO ideal_portfolio_entry (id, portfolioId, assetId, allocation, createdAt, updatedAt) VALUES ('<UUID>', '<PORTFOLIO_ID>', '<ASSET_ID>', <ALLOCATION>, <NOW_MS>, <NOW_MS>)"`
- Update an entry: `sqlite3 sqlite.db "UPDATE ideal_portfolio_entry SET allocation = <ALLOCATION>, updatedAt = <NOW_MS> WHERE portfolioId = '<PORTFOLIO_ID>' AND assetId = '<ASSET_ID>'"`
- Delete an entry: `sqlite3 sqlite.db "DELETE FROM ideal_portfolio_entry WHERE portfolioId = '<PORTFOLIO_ID>' AND assetId = '<ASSET_ID>'"`
- Constraints: allocation must be > 0 and <= 100; each (portfolioId, assetId) pair must be unique
- Generate UUIDs for `id` fields; use millisecond timestamps for `createdAt`/`updatedAt`

## Portfolio Design Skills

- **cash-emergency-fund** — Guide users through building a 3–6 month emergency fund using yield-bearing stablecoins (USDY/rUSDY) on Ondo Finance. Walks through expense categories one at a time. **Always run before any investing skill.**
- **fire-calculator** — Calculate the user's path to Financial Independence / Retire Early (FIRE) using the 4% rule / 25x formula. Runs scenario analysis and connects to portfolio allocation for accumulation → withdrawal phases.
- **investing-fundamentals** — Teach core investing concepts (stocks, bonds, index funds, compounding, diversification) and map each TradFi concept to its Ondo Finance on-chain equivalent (bCSPX, bIB01, USDY, WETH). Pure education, no JSON output.
- **investment-strategy** — Help users choose and configure a deployment strategy: Dollar-Cost Averaging (DCA), Lump Sum, or Hybrid. Produces a specific per-asset, per-period investment plan.
- **portfolio-allocation** — The primary portfolio design skill. Assess risk tolerance, time horizon, and goals to recommend an asset allocation using Ondo Finance tokens. Checks for an emergency fund first, challenges inconsistencies, and outputs a structured JSON plan.
- **risk-mindset** — Prepare users psychologically for market volatility. Handle panic-selling impulses, explain crypto vs TradFi drawdown history, and help users stay rational. Only outputs JSON if the user decides to change their allocation.
- **understanding-costs** — Educate on how fees (gas, swap, protocol, expense ratios) compound against returns over time. Calculate estimated annual costs, compare to a 0.5% benchmark, and suggest optimizations.


## Built-in Tools

- **shell** — Execute terminal commands
- Use when: running local checks, build/test commands, or diagnostics.
- Don't use when: a safer dedicated tool exists, or command is destructive without approval.
- **file_read** — Read file contents
- Use when: inspecting project files, configs, or logs.
- Don't use when: you only need a quick string search (prefer targeted search first).
- **file_write** — Write file contents
- Use when: applying focused edits, scaffolding files, or updating docs/code.
- Don't use when: unsure about side effects or when the file should remain user-owned.
- **memory_store** — Save to memory
- Use when: preserving durable preferences, decisions, or key context.
- Don't use when: info is transient, noisy, or sensitive without explicit need.
- **memory_recall** — Search memory
- Use when: you need prior decisions, user preferences, or historical context.
- Don't use when: the answer is already in current files/conversation.
- **memory_forget** — Delete a memory entry
- Use when: memory is incorrect, stale, or explicitly requested to be removed.
- Don't use when: uncertain about impact; verify before deleting.

