# Croisette.cc

Agentic investment platform - ETH Global Cannes 2026

## Commands

Init ZeroClaw agents:
```
zeroclaw onboard --config-dir .zeroclaw/agents/<agent-name>/
```

Create Symbolic links:
```
ln -s /Users/gianfrancobazzani/GitHub/croisette.cc/portfolios /Users/gianfrancobazzani/GitHub/croisette.cc/.zeroclaw/agents/portfolio-builder-deepseek/workspace/portfolios
```
```
ln -s /Users/gianfrancobazzani/GitHub/croisette.cc/sqlite.db /Users/gianfrancobazzani/GitHub/croisette.cc/.zeroclaw/agents/portfolio-builder-deepseek/workspace/sqlite.db
```

To configure allowed roots for portfolio paths:
```
[autonomy]
allowed_roots = [
  "/Users/gianfrancobazzani/GitHub/croisette.cc/portfolios",
]
```

## Tech Stack

TODO

## TODO fill with hackaton application questions