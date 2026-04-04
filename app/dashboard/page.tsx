"use client";

import Link from "next/link";
import { AllocationChart } from "@/app/_components/allocation-chart";

const MOCK_PORTFOLIO = {
  riskProfile: "Growth",
  strategy: "DCA",
  createdAt: "2026-03-15",
  updatedAt: "2026-04-01",
  allocation: [
    { asset: "Stocks (SPYon)", pct: 55, type: "stocks" },
    { asset: "WETH", pct: 30, type: "crypto" },
    { asset: "Cash (ARC_USYC)", pct: 15, type: "cash" },
  ],
};

const TYPE_LABELS: Record<string, string> = {
  stocks: "Equities",
  crypto: "Crypto",
  cash: "Stable / Cash",
};

export default function DashboardPage() {
  const { riskProfile, strategy, createdAt, updatedAt, allocation } =
    MOCK_PORTFOLIO;

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass shadow-ambient h-16 flex items-center px-6 justify-between">
        <Link
          href="/"
          className="text-2xl font-black text-inverse-surface tracking-tighter"
        >
          Croisette
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-widest text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/onboarding"
            className="text-xs font-bold uppercase tracking-widest text-inverse-surface/60 hover:text-primary transition-colors"
          >
            Advisor
          </Link>
        </nav>
      </header>

      <main className="min-h-screen bg-surface pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-inverse-surface">
              Portfolio Dashboard
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm">
              Your designed allocation and portfolio tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Allocation Chart + Metadata */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Chart Card */}
              <div className="bg-inverse-surface text-surface rounded-xl p-8 shadow-ambient">
                <div
                  className="text-xs uppercase font-semibold mb-6"
                  style={{ letterSpacing: "0.1em", color: "#8f4c35" }}
                >
                  Ideal Allocation
                </div>
                <AllocationChart allocation={allocation} />
              </div>

              {/* Metadata Card */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
                <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-4">
                  Portfolio Info
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">
                      Risk Profile
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {riskProfile}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">
                      Strategy
                    </span>
                    <span className="text-sm font-semibold text-on-surface">
                      {strategy}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">
                      Created
                    </span>
                    <span className="text-sm text-on-surface">{createdAt}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">
                      Last Updated
                    </span>
                    <span className="text-sm text-on-surface">{updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Asset Breakdown + Comparison */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Asset Breakdown */}
              <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
                <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-6">
                  Asset Breakdown
                </div>
                <div className="space-y-4">
                  {allocation.map((item) => (
                    <div
                      key={item.asset}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-lg">
                            {item.type === "stocks"
                              ? "trending_up"
                              : item.type === "crypto"
                                ? "currency_bitcoin"
                                : "account_balance"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {item.asset}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {TYPE_LABELS[item.type] ?? item.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-on-surface">
                          {item.pct}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real vs Ideal Comparison — placeholder */}
              <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
                <div className="text-xs uppercase font-semibold text-on-surface-variant/50 tracking-widest mb-6">
                  Real vs Ideal Allocation
                </div>
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl">
                      account_balance_wallet
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant/40 text-center max-w-sm">
                    Connect your wallet to compare your real portfolio
                    distribution with your ideal allocation.
                  </p>
                  <button
                    disabled
                    className="mt-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
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
