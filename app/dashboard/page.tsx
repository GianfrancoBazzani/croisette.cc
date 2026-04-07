"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AllocationChart } from "@/app/_components/allocation-chart";

interface AgentInfo {
  botLink: string;
  walletAddress: string;
  agentDir: string;
  status: string;
  gatewayPort: number;
  createdAt: number;
}

interface PortfolioData {
  investments: Array<{
    asset: { ticker: string; type: string; description: string };
    allocation_percentage: number;
  }>;
  risk_level: string;
  emergency_reserve: Array<{ ticker: string; type: string; description: string }>;
  strategy: {
    type: string;
    initial_investment: number;
    dca_amount: number;
    dca_frequency: string;
    dca_duration_months: number;
    monthly_investment_after_dca: number;
    effort_level: string;
  };
  fire: {
    fire_number: number;
    fire_variant: string;
    annual_expenses_retirement: number;
    current_portfolio: number;
    target_age: number;
    years_to_fire: number;
    monthly_investment_needed: number;
    expected_annual_return: number;
    withdrawal_rate: number;
    note: string;
  };
  user_profile: {
    age: number;
    country: string;
    monthly_expenses: number;
    investment_horizon: string;
    risk_profile: string;
  };
  created_at: string;
  last_updated: string;
}

const TYPE_LABELS: Record<string, string> = {
  stocks: "Equities",
  crypto: "Crypto",
  cash: "Stable / Cash",
  bonds: "Bonds",
  commodities: "Commodities",
  precious_metals: "Precious Metals",
};

const TYPE_ICONS: Record<string, string> = {
  stocks: "trending_up",
  crypto: "currency_bitcoin",
  cash: "account_balance",
  bonds: "receipt_long",
  commodities: "inventory_2",
  precious_metals: "diamond",
};

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      window.location.href = "/";
    }
  }, [isPending, session]);

  // Fetch agent info
  useEffect(() => {
    if (!session) return;
    fetch("/api/provision")
      .then(async (res) => {
        if (res.status === 404) {
          setError("No agent provisioned yet. Complete onboarding first.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load agent info");
        setAgent(await res.json());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session]);

  // Fetch portfolio
  useEffect(() => {
    if (!session?.user?.email) return;
    crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(session.user.email))
      .then((buf) => {
        const hex = Array.from(new Uint8Array(buf).slice(0, 8))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        return fetch(`/api/portfolio/${hex}`);
      })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && !data.error) setPortfolio(data); })
      .catch(() => {});
  }, [session?.user?.email]);

  const copyAddress = () => {
    if (!agent) return;
    navigator.clipboard.writeText(agent.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isPending || !session) return null;

  const statusColor =
    agent?.status === "running" ? "bg-green-500"
      : agent?.status === "provisioning" ? "bg-yellow-500"
        : agent?.status === "error" ? "bg-red-500"
          : "bg-gray-400";

  const statusLabel =
    agent?.status === "running" ? "Running"
      : agent?.status === "provisioning" ? "Provisioning..."
        : agent?.status === "error" ? "Error"
          : agent?.status === "stopped" ? "Stopped"
            : "Unknown";

  const allocation = portfolio?.investments.map((inv) => ({
    asset: inv.asset.ticker,
    pct: inv.allocation_percentage,
    type: inv.asset.type,
    description: inv.asset.description,
  }));

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass shadow-ambient h-16 flex items-center px-6 justify-between">
        <Link href="/" className="text-2xl font-black text-inverse-surface tracking-tighter">
          Croisette
        </Link>
        <span className="text-xs font-label uppercase tracking-widest text-on-surface/40">
          Dashboard
        </span>
      </header>

      <main className="min-h-dvh relative px-6 pt-24 pb-16 overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-fixed/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-fixed/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto z-10 relative">
          {/* Page Title */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-inverse-surface leading-none">
              Your Portfolio<br />
              <span className="text-primary">Manager.</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl font-medium leading-relaxed mt-2">
              Your personal AI agent is ready. Manage your portfolio via Telegram.
            </p>
          </div>

          {/* Agent Section */}
          {loading && (
            <div className="flex items-center gap-4 p-8">
              <div className="w-6 h-6 rounded-full bg-primary/20 animate-pulse" />
              <span className="text-on-surface-variant">Loading your agent...</span>
            </div>
          )}

          {error && !agent && (
            <div className="bg-surface-container-low rounded-2xl p-8 max-w-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">info</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-inverse-surface">No Agent Yet</h3>
                  <p className="text-on-surface-variant text-sm">{error}</p>
                </div>
              </div>
              <a href="/onboarding" className="inline-flex items-center gap-3 gradient-primary text-on-primary px-6 py-3 rounded-md font-bold text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-lg">
                Start Onboarding
                <span className="material-symbols-outlined text-lg">north_east</span>
              </a>
            </div>
          )}

          {agent && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-16">
              {/* Status */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface/40">Agent Status</span>
                </div>
                <p className="text-lg font-bold text-inverse-surface">{statusLabel}</p>
              </div>

              {/* Telegram Bot */}
              <div className="bg-inverse-surface rounded-2xl p-6 shadow-[0_30px_60px_rgba(29,27,26,0.12)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  <div>
                    <h3 className="text-base font-bold text-surface-bright">Telegram Bot</h3>
                    <p className="text-surface-variant/80 text-xs">Chat with your manager</p>
                  </div>
                </div>
                <a href={agent.botLink} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 gradient-primary text-on-primary px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-lg">
                  Open Bot <span className="material-symbols-outlined text-base">north_east</span>
                </a>
              </div>

              {/* Wallet */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
                  <div>
                    <h3 className="text-base font-bold text-inverse-surface">Wallet</h3>
                    <p className="text-on-surface-variant text-xs">Sepolia Testnet</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-surface-container-high rounded-lg px-3 py-2 text-xs font-mono text-on-surface truncate">
                    {agent.walletAddress}
                  </code>
                  <button onClick={copyAddress} className="shrink-0 p-2 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer" title="Copy">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">{copied ? "check" : "content_copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Portfolio Section ── */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tighter text-inverse-surface">
              Designed Portfolio
            </h2>
            <p className="text-on-surface-variant mt-1 text-sm">
              Your ideal allocation designed with the Croisette Advisor.
            </p>
          </div>

          {portfolio && allocation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Chart + Metadata */}
              <div className="flex flex-col gap-6">
                {/* Allocation Chart */}
                <div className="bg-inverse-surface text-surface rounded-xl p-8 shadow-ambient">
                  <div className="text-xs uppercase font-semibold mb-6" style={{ letterSpacing: "0.1em", color: "#8f4c35" }}>
                    Ideal Allocation
                  </div>
                  <AllocationChart allocation={allocation} />
                </div>

                {/* Portfolio Info */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
                  <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-4">Portfolio Info</div>
                  <div className="space-y-3">
                    {[
                      ["Risk Level", titleCase(portfolio.risk_level), true],
                      ["Strategy", portfolio.strategy.type, false],
                      ["Horizon", titleCase(portfolio.user_profile.investment_horizon), false],
                      ["Effort", titleCase(portfolio.strategy.effort_level), false],
                      ["Created", new Date(portfolio.created_at).toLocaleDateString(), false],
                      ["Updated", new Date(portfolio.last_updated).toLocaleDateString(), false],
                    ].map(([label, value, isPrimary]) => (
                      <div key={label as string} className="flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant">{label as string}</span>
                        <span className={`text-sm font-semibold ${isPrimary ? "text-primary" : "text-on-surface"}`}>{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Reserve */}
                {portfolio.emergency_reserve.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
                    <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-4">Emergency Reserve</div>
                    {portfolio.emergency_reserve.map((asset) => (
                      <div key={asset.ticker} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-lg">shield</span>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{asset.ticker}</p>
                          <p className="text-xs text-on-surface-variant">{asset.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Breakdown + Strategy + FIRE */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Asset Breakdown */}
                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
                  <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-6">Asset Breakdown</div>
                  <div className="space-y-4">
                    {allocation.map((item) => (
                      <div key={item.asset} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">
                              {TYPE_ICONS[item.type] ?? "token"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{item.asset}</p>
                            <p className="text-xs text-on-surface-variant">{TYPE_LABELS[item.type] ?? item.type}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-on-surface">{item.pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investment Strategy */}
                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
                  <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-6">Investment Strategy</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      ["Method", portfolio.strategy.type],
                      ["DCA Amount", formatCurrency(portfolio.strategy.dca_amount)],
                      ["Frequency", titleCase(portfolio.strategy.dca_frequency)],
                      ["Duration", `${portfolio.strategy.dca_duration_months} months`],
                      ["Monthly After DCA", formatCurrency(portfolio.strategy.monthly_investment_after_dca)],
                      ["Effort Level", titleCase(portfolio.strategy.effort_level)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-on-surface-variant mb-1">{label}</p>
                        <p className="text-base font-bold text-on-surface">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FIRE Projection */}
                <div className="bg-inverse-surface text-surface rounded-xl p-8 shadow-ambient">
                  <div className="text-xs uppercase font-semibold mb-6" style={{ letterSpacing: "0.1em", color: "#8f4c35" }}>
                    FIRE Projection
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      ["FIRE Number", formatCurrency(portfolio.fire.fire_number)],
                      ["Target Age", String(portfolio.fire.target_age)],
                      ["Years to FIRE", String(portfolio.fire.years_to_fire)],
                      ["Variant", titleCase(portfolio.fire.fire_variant)],
                      ["Withdrawal Rate", `${(portfolio.fire.withdrawal_rate * 100).toFixed(0)}%`],
                      ["Expected Return", `${portfolio.fire.expected_annual_return}%`],
                      ["Monthly Needed", formatCurrency(portfolio.fire.monthly_investment_needed)],
                      ["Annual Expenses", formatCurrency(portfolio.fire.annual_expenses_retirement)],
                      ["Current Portfolio", formatCurrency(portfolio.fire.current_portfolio)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs mb-1" style={{ color: "rgba(254,248,246,0.4)" }}>{label}</p>
                        <p className="text-base font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                  {portfolio.fire.note && (
                    <p className="mt-6 text-sm leading-relaxed" style={{ color: "rgba(254,248,246,0.6)" }}>
                      {portfolio.fire.note}
                    </p>
                  )}
                </div>

                {/* Real vs Ideal — placeholder */}
                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
                  <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-6">Real vs Ideal Allocation</div>
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl">account_balance_wallet</span>
                    </div>
                    <p className="text-sm text-on-surface-variant/40 text-center max-w-sm">
                      Connect your wallet to compare your real portfolio distribution with your ideal allocation.
                    </p>
                    <button disabled className="mt-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest bg-surface-container text-on-surface-variant/40 cursor-not-allowed">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-8 text-center max-w-2xl">
              <div className="w-16 h-16 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl">pie_chart</span>
              </div>
              <p className="text-sm text-on-surface-variant/50">
                Complete the onboarding advisor to see your designed portfolio here.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface flex justify-center px-8 py-5">
        <span className="text-[10px] text-surface-variant/40 font-label uppercase tracking-widest">
          &copy; 2026 Croisette. High-End Editorial Intelligence.
        </span>
      </footer>
    </>
  );
}
