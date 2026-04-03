export const ACP_DEFAULTS = {
  command: "zeroclaw",
  maxSessions: 1,
  sessionTimeout: 3600, // seconds
} as const;

export interface AgentConfig {
  slug: string;
  name: string;
  description: string;
  configDir: string; // relative to project root
}

export const AGENTS: Record<string, AgentConfig> = {
  "portfolio-builder": {
    slug: "portfolio-builder",
    name: "Portfolio Builder",
    description: "Portfolio allocation, DCA strategies, FIRE calculator",
    configDir: ".zeroclaw/agents/portfolio-builder",
  }
  //trader: {
  //  slug: "trader",
  //  name: "Trader",
  //  description: "Uniswap trading, hedging, rebalancing",
  //  configDir: ".zeroclaw/agents/trader",
  //},
};
