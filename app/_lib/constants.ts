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
    manifestRootHash: "0xa711a57eac03f6ea2a53ef365859c4f79097a4a007bb0d59012e5f1486b79225",

  },
};
