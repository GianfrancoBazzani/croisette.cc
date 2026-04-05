"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

interface AgentInfo {
  botLink: string;
  walletAddress: string;
  agentDir: string;
  status: string;
  gatewayPort: number;
  createdAt: number;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      window.location.href = "/";
    }
  }, [isPending, session]);

  useEffect(() => {
    if (!session) return;

    fetch("/api/provision")
      .then(async (res) => {
        if (res.status === 404) {
          setError("No agent provisioned yet. Complete onboarding first.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load agent info");
        const data = await res.json();
        setAgent(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session]);

  const copyAddress = () => {
    if (!agent) return;
    navigator.clipboard.writeText(agent.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isPending || !session) return null;

  const statusColor =
    agent?.status === "running"
      ? "bg-green-500"
      : agent?.status === "provisioning"
        ? "bg-yellow-500"
        : agent?.status === "error"
          ? "bg-red-500"
          : "bg-gray-400";

  const statusLabel =
    agent?.status === "running"
      ? "Running"
      : agent?.status === "provisioning"
        ? "Provisioning..."
        : agent?.status === "error"
          ? "Error"
          : agent?.status === "stopped"
            ? "Stopped"
            : "Unknown";

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass shadow-ambient h-16 flex items-center px-6 justify-between">
        <span className="text-2xl font-black text-inverse-surface tracking-tighter">
          Croisette
        </span>
        <span className="text-xs font-label uppercase tracking-widest text-on-surface/40">
          Dashboard
        </span>
      </header>

      <main className="min-h-dvh flex flex-col items-center justify-center relative px-6 pt-24 pb-16 overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-fixed/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-fixed/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-2xl z-10">
          {/* Header */}
          <div className="mb-10 flex flex-col items-start gap-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-inverse-surface leading-none">
              Your Portfolio<br />
              <span className="text-primary">Manager.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl font-medium leading-relaxed mt-2">
              Your personal AI agent is ready. Manage your portfolio via Telegram.
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-4 p-8">
              <div className="w-6 h-6 rounded-full bg-primary/20 animate-pulse" />
              <span className="text-on-surface-variant">Loading your agent...</span>
            </div>
          )}

          {error && !agent && (
            <div className="bg-surface-container-low rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">info</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-inverse-surface">No Agent Yet</h3>
                  <p className="text-on-surface-variant text-sm">{error}</p>
                </div>
              </div>
              <a
                href="/onboarding"
                className="inline-flex items-center gap-3 gradient-primary text-on-primary px-6 py-3 rounded-md font-bold text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-lg"
              >
                Start Onboarding
                <span className="material-symbols-outlined text-lg">north_east</span>
              </a>
            </div>
          )}

          {agent && (
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
                    Agent Status
                  </span>
                </div>
                <p className="text-lg font-bold text-inverse-surface">{statusLabel}</p>
              </div>

              {/* Telegram Bot */}
              <div className="bg-inverse-surface rounded-2xl p-8 shadow-[0_30px_60px_rgba(29,27,26,0.12)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-surface-bright">Your Telegram Bot</h3>
                    <p className="text-surface-variant/80 text-sm">Chat with your portfolio manager on Telegram</p>
                  </div>
                </div>
                <a
                  href={agent.botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 gradient-primary text-on-primary px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  Open Your Portfolio Manager
                  <span className="material-symbols-outlined text-xl">north_east</span>
                </a>
              </div>

              {/* Wallet */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-inverse-surface">Managed Wallet</h3>
                    <p className="text-on-surface-variant text-xs">Sepolia Testnet</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-surface-container-high rounded-lg px-4 py-3 text-sm font-mono text-on-surface break-all">
                    {agent.walletAddress}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="shrink-0 p-3 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer"
                    title="Copy address"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">
                      {copied ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Fund instructions */}
              <div className="bg-surface-container-low rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">info</span>
                  <h3 className="text-lg font-bold text-inverse-surface">Fund Your Wallet</h3>
                </div>
                <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
                  <p>
                    Send Sepolia ETH and test tokens to the wallet address above to get started.
                  </p>
                  <p>
                    Use a Sepolia faucet to get free test ETH. Your portfolio manager will start
                    monitoring balances and proposing rebalances once the wallet is funded.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
