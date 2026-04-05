import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { provisionAgent, buildBotLink } from "@/lib/provision";
import { db } from "@/lib/db";

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

  try {
    const result = provisionAgent(userId, userName, telegramHandle);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provisioning failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
