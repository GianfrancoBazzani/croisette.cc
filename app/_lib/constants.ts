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
  manifestRootHash?: string; // 0G Storage root hash - on-chain verification
}

export const AGENTS: Record<string, AgentConfig> = {
  "portfolio-builder-og": {
    slug: "portfolio-builder-og",
    name: "Portfolio Builder (OG Compute)",
    description: "Portfolio allocation, DCA strategies, FIRE calculator",
    configDir: ".zeroclaw/agents/portfolio-builder-og",
    manifestRootHash: "0xe7f826b3dbe8c619eda9411c82851e87dd92f949bdb5cf84b614731b712ff9a8",
  },
  "portfolio-builder-deepseek": {
    slug: "portfolio-builder-deepseek",
    name: "Portfolio Builder (DeepSeek)",
    description: "Portfolio allocation, DCA strategies, FIRE calculator",
    configDir: ".zeroclaw/agents/portfolio-builder-deepseek",
    manifestRootHash: "0xc417eaa3773c6340aa4d144ec3dfa02d2f5c934e8927ae76bd4f27d4620fed2d",

  },
};
