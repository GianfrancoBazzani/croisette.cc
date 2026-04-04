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
import { verifyOnChain } from "@/app/_lib/0g-verify";

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
  // --- Integrity check: verify workspace files before processing ---
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
  // --- End integrity check ---

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

  // Start on-chain verification in parallel (non-blocking)
  const hasOnChain = !!agent.manifestRootHash;
  if (hasOnChain) {
    console.log(`[integrity] Starting on-chain check for ${agentId} (manifest: ${agent.manifestRootHash!.slice(0, 18)}...)`);
  } else {
    console.log(`[integrity] No manifestRootHash configured for ${agentId} — skipping on-chain check`);
  }
  const onChainPromise = hasOnChain
    ? verifyOnChain(agent.manifestRootHash!, workspaceDir)
        .catch((err) => {
          console.error(
            `[integrity] On-chain check error for ${agentId}:`,
            err instanceof Error ? err.message : err
          );
          return null; // network errors don't block the response
        })
    : Promise.resolve(null);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const textId = crypto.randomUUID();

      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: textId });

      await session!.client.prompt(prompt, (chunk) => {
        writer.write({ type: "text-delta", id: textId, delta: chunk });
      });

      // Wait for on-chain check to finish (likely already done by now)
      const onChainResult = await onChainPromise;
      if (onChainResult) {
        console.log(
          `[integrity] On-chain result for ${agentId}: ${onChainResult.ok ? "PASS" : "FAIL"} — ${onChainResult.checked} files checked`
        );
      }
      if (onChainResult && !onChainResult.ok) {
        console.error(
          `[integrity] ON-CHAIN FAILED for ${agentId}:`,
          JSON.stringify({
            failed: onChainResult.failed,
            missing: onChainResult.missing,
          })
        );
        writer.write({
          type: "text-delta",
          id: textId,
          delta:
            "\n\n---\n**Integrity Warning:** On-chain verification failed for this agent. " +
            "The workspace files may have been tampered with since registration. " +
            `Affected files: ${[...onChainResult.failed, ...onChainResult.missing].join(", ")}`,
        });
      }

      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
