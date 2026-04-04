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
  "portfolio-builder-og": {
    slug: "portfolio-builder-og",
    name: "Portfolio Builder (OG Compute)",
    description: "Portfolio allocation, DCA strategies, FIRE calculator",
    configDir: ".zeroclaw/agents/portfolio-builder-og",
  },
  "portfolio-builder-deepseek": {
    slug: "portfolio-builder-deepseek",
    name: "Portfolio Builder (DeepSeek)",
    description: "Portfolio allocation, DCA strategies, FIRE calculator",
    configDir: ".zeroclaw/agents/portfolio-builder-deepseek",
  },
};
