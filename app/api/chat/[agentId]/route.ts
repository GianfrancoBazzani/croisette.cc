import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { AGENTS } from "@/app/_lib/constants";
import { ZeroClawClient } from "@/app/_lib/acp";
import { getSession, setSession } from "@/app/_lib/session-store";
import { checkIntegrity } from "@/app/_lib/integrity";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const agent = AGENTS[agentId];

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const body = await req.json();
  const { messages, sessionId }: { messages: UIMessage[]; sessionId: string } =
    body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required" },
      { status: 400 }
    );
  }

  // Reuse existing session — integrity was already checked at creation time
  let session = getSession(sessionId);

  if (!session) {
    // First message for this session — run integrity check once, then create session
    const agentConfigDir = path.resolve(process.cwd(), agent.configDir);
    const workspaceDir = path.join(agentConfigDir, "workspace");
    const integrity = checkIntegrity(agentConfigDir, workspaceDir);

    if (!integrity.ok) {
      console.error(
        `[integrity] FAILED for ${agentId}:`,
        JSON.stringify({ failed: integrity.failed, missing: integrity.missing })
      );
      return NextResponse.json(
        {
          error: "Agent integrity check failed",
          tampered: integrity.failed,
          missing: integrity.missing,
        },
        { status: 403 }
      );
    }

    const client = new ZeroClawClient(agent);
    setSession(sessionId, client);
    session = getSession(sessionId)!;
    console.log(`[chat] Session created for ${agentId} (${sessionId.slice(0, 8)}...)`);
  }

  // Build prompt string from messages
  const promptParts: string[] = [];
  for (const msg of messages) {
    const prefix = msg.role === "user" ? "" : `[${msg.role}]: `;
    for (const part of msg.parts) {
      if (part.type === "text") {
        promptParts.push(`${prefix}${part.text}`);
      }
    }
  }
  const prompt = promptParts.join("\n\n");

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const textId = crypto.randomUUID();

      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: textId });

      await session!.client.prompt(prompt, (chunk) => {
        writer.write({ type: "text-delta", id: textId, delta: chunk });
      });

      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
