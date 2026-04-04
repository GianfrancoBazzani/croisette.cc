import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/app/_lib/constants";
import { getSession, setSession } from "@/app/_lib/session-store";
import { ZeroClawClient } from "@/app/_lib/acp";
import { parseAgentResponse } from "@/app/_lib/agent-response";

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
      // Buffer the full response from the agent
      let fullResponse = "";
      await session!.client.prompt(prompt, (chunk) => {
        fullResponse += chunk;
      });

      // Parse the JSON envelope
      const envelope = parseAgentResponse(fullResponse);

      // Send structured message with metadata
      writer.write({
        type: "start",
        messageMetadata: {
          options: envelope.options ?? null,
          profile_update: envelope.profile_update ?? null,
          insight: envelope.insight ?? null,
          allocation: envelope.allocation ?? null,
        },
      });

      const textId = crypto.randomUUID();
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: envelope.text });
      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
