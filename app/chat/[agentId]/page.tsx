// app/chat/[agentId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { AGENTS } from "@/app/_lib/constants";
import { ChatBox } from "@/app/_components/chat-box";
import { SummaryPanel, labelForKey } from "@/app/_components/summary-panel";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

interface ProfileFact {
  key: string;
  label: string;
  value: string;
}

interface AgentMetadata {
  options: string[] | null;
  profile_update: Record<string, string> | null;
  insight: string | null;
  allocation: Array<{ asset: string; pct: number }> | null;
}

export default function ChatPage() {
  const params = useParams<{ agentId: string }>();
  const { data: session } = useSession();
  const agentId = params.agentId;
  const agent = AGENTS[agentId];
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const [profileFacts, setProfileFacts] = useState<ProfileFact[]>([]);
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<
    Array<{ asset: string; pct: number }> | null
  >(null);

  const handleMetadata = useCallback((metadata: AgentMetadata) => {
    if (metadata.profile_update) {
      setProfileFacts((prev) => {
        const updated = [...prev];
        for (const [key, value] of Object.entries(metadata.profile_update!)) {
          const existing = updated.findIndex((f) => f.key === key);
          if (existing >= 0) {
            updated[existing] = { key, label: labelForKey(key), value };
          } else {
            updated.push({ key, label: labelForKey(key), value });
          }
        }
        return updated;
      });
    }
    if (metadata.insight) {
      setCurrentInsight(metadata.insight);
    }
    if (metadata.allocation) {
      setAllocation(metadata.allocation);
    }
  }, []);

  if (!agent) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-xl font-bold mb-4">Agent not found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to agents
        </Link>
      </main>
    );
  }

  return (
    <div className="flex h-screen">
      <ChatBox
        agentId={agent.slug}
        sessionId={sessionId}
        agentName={agent.name}
        userName={session?.user.name ?? undefined}
        onMetadata={handleMetadata}
      />
      <SummaryPanel
        profileFacts={profileFacts}
        currentInsight={currentInsight}
        allocation={allocation}
      />
    </div>
  );
}
