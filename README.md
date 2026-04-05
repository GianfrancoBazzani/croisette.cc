# 🌴 Croisette.cc

![Croisette Finance logo](public/croissete-white.svg)

Agentic investment platform - ETH Global Cannes 2026



## Tech Stack

Next.js frontend 

[ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw) Agents with 0Gs LLMs using [0G-Compute-Adapter](https://github.com/claraverse-space/0G-Compute-Adapter)

Portfolio Manager Agent



0G Agent Verification technology






## Useful Commands

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

