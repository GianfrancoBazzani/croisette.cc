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
    manifestRootHash: "0x75fc23f4b5307805afae84df2b9600e304038289fa51e7825b03ea6fabb6ae90",
  },
  "portfolio-builder-deepseek": {
    slug: "portfolio-builder-deepseek",
    name: "Portfolio Builder (DeepSeek)",
    description: "Portfolio allocation, DCA strategies, FIRE calculator",
    configDir: ".zeroclaw/agents/portfolio-builder-deepseek",
    manifestRootHash: "0x3fefb1274dd17385e1e00ab72e4961b14a29a3b3d4e87068fed7e957769ab66a",

  },
};
