import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { provisionAgent, buildBotLink } from "@/lib/provision";
import { db } from "@/lib/db";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const agent = db
    .prepare(`
      SELECT ua.*, tb.botUsername, tb.botToken
      FROM user_agent ua
      JOIN telegram_bot tb ON tb.id = ua.telegramBotId
      WHERE ua.userId = ?
    `)
    .get(userId) as {
      walletAddress: string;
      botUsername: string;
      botToken: string;
      agentDirName: string;
      status: string;
      gatewayPort: number;
      daemonPid: number | null;
      createdAt: number;
    } | undefined;

  if (!agent) {
    return NextResponse.json({ error: "No agent provisioned" }, { status: 404 });
  }

  return NextResponse.json({
    botLink: buildBotLink(agent.botToken),
    walletAddress: agent.walletAddress,
    agentDir: agent.agentDirName,
    status: agent.status,
    gatewayPort: agent.gatewayPort,
    createdAt: agent.createdAt,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userName = session.user.name || "Investor";

  let body: { telegramHandle?: string } = {};
  try {
    body = await req.json();
  } catch {
    // body is optional
  }
  const telegramHandle = body.telegramHandle || "";

  // Bridge portfolio JSON → ideal_portfolio DB tables
  try {
    const email = session.user.email;
    if (email) {
      const hash = createHash("sha256").update(email).digest("hex").slice(0, 16);
      const filePath = path.join(process.cwd(), "portfolios", `${hash}-portfolio.json`);

      try {
        const raw = await readFile(filePath, "utf-8");
        const portfolio = JSON.parse(raw);

        if (portfolio.investments?.length > 0) {
          const now = Date.now();
          const portfolioId = randomUUID();

          // Upsert ideal_portfolio
          db.prepare(`
            INSERT INTO ideal_portfolio (id, userId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(userId) DO UPDATE SET updatedAt = excluded.updatedAt
          `).run(portfolioId, userId, now, now);

          // Get the actual portfolio ID (in case it already existed)
          const existing = db.prepare("SELECT id FROM ideal_portfolio WHERE userId = ?").get(userId) as { id: string } | undefined;
          const actualPortfolioId = existing?.id ?? portfolioId;

          // Clear old entries
          db.prepare("DELETE FROM ideal_portfolio_entry WHERE portfolioId = ?").run(actualPortfolioId);

          // Insert new entries
          const insertEntry = db.prepare(`
            INSERT INTO ideal_portfolio_entry (id, portfolioId, assetId, allocation, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          for (const inv of portfolio.investments) {
            const asset = db.prepare("SELECT id FROM asset WHERE ticker = ?").get(inv.asset.ticker) as { id: string } | undefined;
            if (asset) {
              insertEntry.run(randomUUID(), actualPortfolioId, asset.id, inv.allocation_percentage, now, now);
            }
          }
        }
      } catch {
        // Portfolio file doesn't exist yet or is invalid — continue with provisioning
      }
    }
  } catch {
    // Non-fatal — provisioning can proceed without portfolio data
  }

  try {
    const result = provisionAgent(userId, userName, telegramHandle);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provisioning failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
