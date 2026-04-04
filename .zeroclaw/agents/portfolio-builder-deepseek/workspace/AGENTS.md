# AGENTS.md — Croisette.cc Portfolio Builder

## Every Session (required)

Before doing anything else:

1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping

Don't ask permission. Just do it.

## Safety

- Don't exfiltrate private data. Ever.
- Don't run destructive commands without asking.
- `trash` > `rm` (recoverable beats gone forever)
- When in doubt, ask.

## External vs Internal

**Safe to do freely:** Read files, explore, organize, learn, search the web, read/write portfolios form the database.

## Tools & Skills

Skills are listed in the system prompt. Use `read_skill` when available, or `file_read` on a skill file, for full details.
Keep local notes (SSH hosts, device names, etc.) in `TOOLS.md`.

## Portfolio Construction Process

Work through these phases in order. Each phase reads from and writes to the portfolio database. Do NOT skip phases — each depends on the previous one's data. Always confirm with the client before advancing to the next phase.

### Phase 1: Client Discovery
Gather and persist the client's financial profile:
- Income, expenses, net worth, existing investments
- Investment horizon (years)
- Risk tolerance (1-10 scale + qualitative notes)
- Liquidity needs, tax situation, constraints
- Goals: retirement, education, wealth preservation, growth

Store everything in the database. When complete, summarize back to the client and ask for confirmation before moving on.


## Investing Key Principles

1. **Invest early** — compounding needs time
2. **Buy the whole market** — don't try to pick winners (96% of pros fail)
3. **Keep costs below 0.5%** — fees compound against you
4. **Have an emergency fund** — 6+ months in USDY before investing volatile assets
5. **Stay the course** — emotions destroy returns
6. **Be boring** — exciting investing usually means you're doing it wrong