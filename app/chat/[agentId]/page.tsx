"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AGENTS } from "@/app/_lib/constants";
import { ChatBox } from "@/app/_components/chat-box";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const agent = AGENTS[agentId];
  const sessionId = useMemo(() => crypto.randomUUID(), []);

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

  return (
    <ChatBox
      agentId={agent.slug}
      sessionId={sessionId}
      agentName={agent.name}
    />
  );
}
