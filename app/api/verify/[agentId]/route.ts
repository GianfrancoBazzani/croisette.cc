import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { AGENTS } from "@/app/_lib/constants";
import { ZeroClawClient } from "@/app/_lib/acp";
import { getSession, setSession } from "@/app/_lib/session-store";
import { checkIntegrity, type IntegrityResult } from "@/app/_lib/integrity";
import { verifyOnChain, type OnChainVerifyResult } from "@/app/_lib/0g-verify";

export const maxDuration = 30;

export interface VerifyResponse {
  offChain: IntegrityResult;
  onChain: OnChainVerifyResult | null;
  sessionCreated: boolean;
}

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
  const { sessionId }: { sessionId: string } = body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required" },
      { status: 400 }
    );
  }

  // If session already exists, verification already passed
  const existing = getSession(sessionId);
  if (existing) {
    return NextResponse.json({
      offChain: { ok: true, checked: 0, failed: [], missing: [], details: {} },
      onChain: null,
      sessionCreated: false,
    } satisfies VerifyResponse);
  }

  const agentConfigDir = path.resolve(process.cwd(), agent.configDir);
  const workspaceDir = path.join(agentConfigDir, "workspace");

  // --- Off-chain integrity check (fast, synchronous) ---
  const offChain = checkIntegrity(agentConfigDir, workspaceDir);

  if (!offChain.ok) {
    console.error(
      `[verify] Off-chain FAILED for ${agentId}:`,
      JSON.stringify({ failed: offChain.failed, missing: offChain.missing })
    );
    return NextResponse.json({
      offChain,
      onChain: null,
      sessionCreated: false,
    } satisfies VerifyResponse);
  }

  // --- On-chain verification (async, may take a few seconds) ---
  let onChain: OnChainVerifyResult | null = null;

  if (agent.manifestRootHash) {
    console.log(
      `[verify] Starting on-chain check for ${agentId} (manifest: ${agent.manifestRootHash.slice(0, 18)}...)`
    );
    try {
      onChain = await verifyOnChain(agent.manifestRootHash, workspaceDir);
      console.log(
        `[verify] On-chain result for ${agentId}: ${onChain.ok ? "PASS" : "FAIL"} — ${onChain.checked} files checked`
      );
    } catch (err) {
      console.error(
        `[verify] On-chain check error for ${agentId}:`,
        err instanceof Error ? err.message : err
      );
      // Network errors don't block session creation
    }
  } else {
    console.log(
      `[verify] No manifestRootHash configured for ${agentId} — skipping on-chain check`
    );
  }

  // --- Create session (off-chain passed) ---
  const client = new ZeroClawClient(agent);
  setSession(sessionId, client);
  console.log(`[verify] Session created for ${agentId} (${sessionId.slice(0, 8)}...)`);

  return NextResponse.json({
    offChain,
    onChain,
    sessionCreated: true,
  } satisfies VerifyResponse);
}
