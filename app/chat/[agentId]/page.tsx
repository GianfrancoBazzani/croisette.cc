"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import { AGENTS } from "@/app/_lib/constants";
import { ChatBox } from "@/app/_components/chat-box";
import { VerifyBanner } from "@/app/_components/verify-banner";
import Link from "next/link";
import type { VerifyResponse } from "@/app/api/verify/[agentId]/route";

export type VerifyStatus =
  | { phase: "verifying" }
  | { phase: "passed"; onChainOk: boolean | null }
  | { phase: "failed"; tampered: string[]; missing: string[]; onChainFailed: string[] };

export default function ChatPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const agent = AGENTS[agentId];
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>({
    phase: "verifying",
  });

  const runVerification = useCallback(async () => {
    try {
      const res = await fetch(`/api/verify/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data: VerifyResponse = await res.json();

      if (!data.offChain.ok) {
        setVerifyStatus({
          phase: "failed",
          tampered: data.offChain.failed,
          missing: data.offChain.missing,
          onChainFailed: [],
        });
        return;
      }

      // Off-chain passed — check on-chain results
      const onChainFailed = data.onChain
        ? [...data.onChain.failed, ...data.onChain.missing]
        : [];

      if (onChainFailed.length > 0) {
        setVerifyStatus({
          phase: "failed",
          tampered: data.onChain?.failed ?? [],
          missing: data.onChain?.missing ?? [],
          onChainFailed,
        });
        return;
      }

      setVerifyStatus({
        phase: "passed",
        onChainOk: data.onChain?.ok ?? null,
      });
    } catch {
      setVerifyStatus({
        phase: "failed",
        tampered: [],
        missing: [],
        onChainFailed: ["Network error during verification"],
      });
    }
  }, [agentId, sessionId]);

  useEffect(() => {
    if (agent) {
      runVerification();
    }
  }, [agent, runVerification]);

  if (!agent) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-xl font-bold mb-4">Agent not found</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to agents
        </Link>
      </main>
    );
  }

  // Don't mount ChatBox (and its useChat hook) until verification passes.
  // This prevents useChat from hitting /api/chat before the session exists.
  if (verifyStatus.phase !== "passed") {
    return (
      <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">{agent.name}</h1>
        <VerifyBanner status={verifyStatus} />
      </div>
    );
  }

  return (
    <ChatBox
      agentId={agent.slug}
      sessionId={sessionId}
      agentName={agent.name}
      verifyStatus={verifyStatus}
    />
  );
}
