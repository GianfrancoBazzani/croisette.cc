import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/app/_lib/constants";
import { ZeroClawClient } from "@/app/_lib/acp";
import { getSession, setSession } from "@/app/_lib/session-store";

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

  let session = getSession(sessionId);
  if (!session) {
    const client = new ZeroClawClient(agent);
    setSession(sessionId, client);
    session = getSession(sessionId)!;
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
