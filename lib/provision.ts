import { randomUUID } from "crypto";
import { execSync, spawn } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, cpSync, chmodSync } from "fs";
import path from "path";
import { db } from "./db";

const PROJECT_ROOT = process.cwd();
const TEMPLATE_DIR = path.join(PROJECT_ROOT, ".zeroclaw/templates/portfolio-manager");
const AGENTS_DIR = path.join(PROJECT_ROOT, ".zeroclaw/agents");

interface BotInfo {
  botId: string;
  botUsername: string;
  botToken: string;
}

/** Extract the numeric bot ID from a token like "8778242388:AAHV8..." */
function botIdFromToken(token: string): string {
  return token.split(":")[0];
}

/** Build a working Telegram web link from a bot token */
export function buildBotLink(botToken: string): string {
  return `https://web.telegram.org/a/#${botIdFromToken(botToken)}`;
}

interface WalletInfo {
  address: string;
  privateKey: string;
}

export interface ProvisionResult {
  botLink: string;
  walletAddress: string;
  agentDir: string;
  status: string;
}

export function assignBot(userId: string): BotInfo {
  const bot = db
    .prepare("SELECT id, botUsername, botToken FROM telegram_bot WHERE userId IS NULL LIMIT 1")
    .get() as { id: string; botUsername: string; botToken: string } | undefined;

  if (!bot) {
    throw new Error("No bots available. Seed more bots via scripts/seed-bots.ts.");
  }

  db.prepare("UPDATE telegram_bot SET userId = ? WHERE id = ?").run(userId, bot.id);

  return { botId: bot.id, botUsername: bot.botUsername, botToken: bot.botToken };
}

export function generateWallet(): WalletInfo {
  const output = execSync("cast wallet new", { encoding: "utf-8" });

  // Parse cast wallet new output format:
  // Successfully created new keypair.
  // Address:     0x...
  // Private key: 0x...
  const addressMatch = output.match(/Address:\s+(0x[0-9a-fA-F]{40})/);
  const keyMatch = output.match(/Private key:\s+(0x[0-9a-fA-F]{64})/);

  if (!addressMatch || !keyMatch) {
    throw new Error(`Failed to parse cast wallet new output:\n${output}`);
  }

  return {
    address: addressMatch[1],
    privateKey: keyMatch[1],
  };
}

export function createAgentDirectory(params: {
  userId: string;
  userName: string;
  telegramHandle: string;
  botToken: string;
  walletAddress: string;
  privateKey: string;
  gatewayPort: number;
}): string {
  const dirName = `pm-${params.userId}`;
  const agentDir = path.join(AGENTS_DIR, dirName);

  // 1. Create the agent directory
  mkdirSync(agentDir, { recursive: true });

  // 2. Read and template config.toml
  let configTemplate = readFileSync(
    path.join(TEMPLATE_DIR, "config.template.toml"),
    "utf-8"
  );
  configTemplate = configTemplate
    .replace("{{OPENROUTER_API_KEY}}", process.env.OPENROUTER_API_KEY || "")
    .replace("{{BOT_TOKEN}}", params.botToken)
    .replace("{{GATEWAY_PORT}}", String(params.gatewayPort))
    .replace("{{TELEGRAM_HANDLE}}", params.telegramHandle || "*");

  writeFileSync(path.join(agentDir, "config.toml"), configTemplate);

  // 3. Write .env with wallet and shared secrets
  const envContent = [
    `MANAGED_WALLET_PRIVATE_KEY=${params.privateKey.replace(/^0x/, "")}`,
    `MANAGED_WALLET_ADDRESS=${params.walletAddress}`,
    `ETHEREUM_RPC_URL=${process.env.ETHEREUM_RPC_URL || "https://ethereum-rpc.publicnode.com"}`,
    `ETHEREUM_SEPOLIA_RPC_URL=${process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"}`,
    `ARC_RPC_URL=${process.env.ARC_RPC_URL || "https://arc-testnet.drpc.org"}`,
    `UNISWAP_API_KEY=${process.env.UNISWAP_API_KEY || ""}`,
    `UNISWAP_API_BASE_URL=${process.env.UNISWAP_API_BASE_URL || "https://trade-api.gateway.uniswap.org/v1"}`,
    `OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY || ""}`,
    "",
  ].join("\n");

  writeFileSync(path.join(agentDir, ".env"), envContent);
  chmodSync(path.join(agentDir, ".env"), 0o600);

  // 4. Copy workspace from template
  const workspaceDir = path.join(agentDir, "workspace");
  cpSync(path.join(TEMPLATE_DIR, "workspace"), workspaceDir, { recursive: true });

  // 5. Template USER.md from USER.template.md
  const userTemplatePath = path.join(workspaceDir, "USER.template.md");
  let userTemplate = readFileSync(userTemplatePath, "utf-8");
  userTemplate = userTemplate
    .replaceAll("{{USER_NAME}}", params.userName)
    .replaceAll("{{TELEGRAM_HANDLE}}", params.telegramHandle || "unknown");
  writeFileSync(path.join(workspaceDir, "USER.md"), userTemplate);

  // Template BOOTSTRAP.md
  const bootstrapPath = path.join(workspaceDir, "BOOTSTRAP.md");
  let bootstrap = readFileSync(bootstrapPath, "utf-8");
  bootstrap = bootstrap.replaceAll("{{USER_NAME}}", params.userName);
  writeFileSync(bootstrapPath, bootstrap);

  // Remove the template file (leave clean USER.md)
  try {
    const { unlinkSync } = require("fs");
    unlinkSync(userTemplatePath);
  } catch {
    // ignore if removal fails
  }

  // 6. Create the agent's own sqlite.db with schema + seed data
  createAgentDatabase(agentDir, params.userId);

  // 7. Create empty directories
  mkdirSync(path.join(workspaceDir, "memory"), { recursive: true });
  mkdirSync(path.join(workspaceDir, "sessions"), { recursive: true });
  mkdirSync(path.join(workspaceDir, "state"), { recursive: true });
  mkdirSync(path.join(workspaceDir, "cron"), { recursive: true });

  return agentDir;
}

function createAgentDatabase(agentDir: string, userId: string) {
  const Database = require("better-sqlite3");
  const agentDb = new Database(path.join(agentDir, "workspace", "sqlite.db"));

  // Create the same schema as the main app (asset + portfolio tables)
  agentDb.exec(`
    CREATE TABLE IF NOT EXISTS asset (
      id TEXT PRIMARY KEY,
      ticker TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL,
      chainId INTEGER NOT NULL,
      description TEXT,
      decimals INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('stocks', 'crypto', 'cash', 'commodities', 'precious_metals', 'bonds')),
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ideal_portfolio (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ideal_portfolio_entry (
      id TEXT PRIMARY KEY,
      portfolioId TEXT NOT NULL REFERENCES ideal_portfolio(id),
      assetId TEXT NOT NULL REFERENCES asset(id),
      allocation REAL NOT NULL CHECK(allocation > 0 AND allocation <= 100),
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      UNIQUE(portfolioId, assetId)
    );
  `);

  // Copy assets from main DB
  const assets = db
    .prepare("SELECT * FROM asset")
    .all() as Array<Record<string, unknown>>;

  const insertAsset = agentDb.prepare(`
    INSERT OR IGNORE INTO asset (id, ticker, address, chainId, description, decimals, type, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAssets = agentDb.transaction((rows: Array<Record<string, unknown>>) => {
    for (const a of rows) {
      insertAsset.run(a.id, a.ticker, a.address, a.chainId, a.description, a.decimals, a.type, a.createdAt, a.updatedAt);
    }
  });
  insertAssets(assets);

  // Copy user's ideal_portfolio + entries from main DB
  const portfolio = db
    .prepare("SELECT * FROM ideal_portfolio WHERE userId = ?")
    .get(userId) as Record<string, unknown> | undefined;

  if (portfolio) {
    agentDb
      .prepare("INSERT OR IGNORE INTO ideal_portfolio (id, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?)")
      .run(portfolio.id, portfolio.userId, portfolio.createdAt, portfolio.updatedAt);

    const entries = db
      .prepare("SELECT * FROM ideal_portfolio_entry WHERE portfolioId = ?")
      .all(portfolio.id as string) as Array<Record<string, unknown>>;

    const insertEntry = agentDb.prepare(`
      INSERT OR IGNORE INTO ideal_portfolio_entry (id, portfolioId, assetId, allocation, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertEntries = agentDb.transaction((rows: Array<Record<string, unknown>>) => {
      for (const e of rows) {
        insertEntry.run(e.id, e.portfolioId, e.assetId, e.allocation, e.createdAt, e.updatedAt);
      }
    });
    insertEntries(entries);
  }

  agentDb.close();
}

export function startDaemon(configDir: string): number {
  const child = spawn("zeroclaw", ["daemon", "--config-dir", configDir], {
    detached: true,
    stdio: "ignore",
    cwd: configDir,
  });

  child.unref();

  return child.pid ?? 0;
}

export function provisionAgent(userId: string, userName: string, telegramHandle: string): ProvisionResult {
  // Check if already provisioned
  const existing = db
    .prepare(`
      SELECT ua.*, tb.botUsername, tb.botToken
      FROM user_agent ua
      JOIN telegram_bot tb ON tb.id = ua.telegramBotId
      WHERE ua.userId = ?
    `)
    .get(userId) as { walletAddress: string; botUsername: string; botToken: string; agentDirName: string; status: string } | undefined;

  if (existing) {
    return {
      botLink: buildBotLink(existing.botToken),
      walletAddress: existing.walletAddress,
      agentDir: existing.agentDirName,
      status: existing.status,
    };
  }

  // 1. Assign a bot
  const bot = assignBot(userId);

  // 2. Generate a wallet
  const wallet = generateWallet();

  // 3. Allocate a port
  const portRow = db
    .prepare("SELECT COALESCE(MAX(gatewayPort), 42999) + 1 AS nextPort FROM user_agent")
    .get() as { nextPort: number };
  const gatewayPort = portRow.nextPort;

  // 4. Create the agent directory
  const agentDir = createAgentDirectory({
    userId,
    userName,
    telegramHandle,
    botToken: bot.botToken,
    walletAddress: wallet.address,
    privateKey: wallet.privateKey,
    gatewayPort,
  });

  // 5. Start the daemon
  const pid = startDaemon(agentDir);

  // 6. Record in DB
  const now = Date.now();
  const dirName = `pm-${userId}`;

  db.prepare(`
    INSERT INTO user_agent (id, userId, agentDirName, walletAddress, telegramBotId, gatewayPort, daemonPid, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'running', ?, ?)
  `).run(randomUUID(), userId, dirName, wallet.address, bot.botId, gatewayPort, pid, now, now);

  return {
    botLink: buildBotLink(bot.botToken),
    walletAddress: wallet.address,
    agentDir: dirName,
    status: "running",
  };
}
