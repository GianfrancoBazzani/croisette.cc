"use client";

import { AllocationChart } from "./allocation-chart";
import type { Portfolio } from "@/lib/portfolio";

export interface FunnelData {
  name: string;
  age: string;
  country: string;
  horizon: string;
  risk: string;
}

export interface ConversationFacts {
  emergency_fund?: string;
  primary_goal?: string;
  strategy?: string;
}

interface AdvisorSidebarProps {
  funnelData: FunnelData;
  conversationFacts: ConversationFacts;
  allocation: Array<{ asset: string; pct: number }> | null;
  portfolio: Portfolio | null;
  visible: boolean;
}

const FUNNEL_FIELDS: { key: keyof FunnelData; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "country", label: "Country" },
  { key: "horizon", label: "Financial Horizon" },
  { key: "risk", label: "Risk Architecture" },
];

const CONVERSATION_FIELDS: { key: keyof ConversationFacts; label: string }[] = [
  { key: "emergency_fund", label: "Emergency Fund" },
  { key: "primary_goal", label: "Primary Goal" },
  { key: "strategy", label: "Strategy" },
];

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatStrategy(type: string): string {
  switch (type) {
    case "DCA": return "Dollar-Cost Avg";
    case "LUMP_SUM": return "Lump Sum";
    case "HYBRID": return "Hybrid";
    default: return type;
  }
}

function formatFrequency(freq: string): string {
  switch (freq) {
    case "weekly": return "Weekly";
    case "biweekly": return "Bi-weekly";
    case "monthly": return "Monthly";
    default: return freq;
  }
}

export function AdvisorSidebar({
  funnelData,
  conversationFacts,
  allocation,
  portfolio,
  visible,
}: AdvisorSidebarProps) {
  return (
    <div
      className="bg-inverse-surface text-inverse-on-surface flex flex-col overflow-hidden shrink-0 transition-all duration-500 ease-in-out overflow-y-auto"
      style={{
        width: visible ? 340 : 0,
        opacity: visible ? 1 : 0,
        padding: visible ? "1.5rem" : "1.5rem 0",
      }}
    >
      {/* Header */}
      <div className="min-w-[292px] mb-7">
        <div className="text-[10px] uppercase font-semibold mb-1.5 tracking-[0.15em] text-inverse-on-surface/30">
          Your Profile
        </div>
        <div className="text-xl font-bold tracking-[-0.02em]">
          Portfolio Blueprint
        </div>
      </div>

      {/* Funnel facts */}
      <div className="flex flex-col gap-2 min-w-[292px]">
        {FUNNEL_FIELDS.map(({ key, label }) => (
          <div
            key={key}
            className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.05]"
          >
            <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">
              {label}
            </span>
            <span className="text-sm font-semibold text-primary">
              {funnelData[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Tonal spacing */}
      <div className="py-4" />

      {/* Conversation insights */}
      <div className="min-w-[292px]">
        <div className={`text-[10px] uppercase font-semibold tracking-[0.15em] mb-2.5 transition-colors duration-500 ${
          portfolio ? "text-inverse-on-surface/35" : "text-inverse-on-surface/25"
        }`}>
          Conversation Insights
        </div>
        <div className="flex flex-col gap-2">
          {CONVERSATION_FIELDS.map(({ key, label }) => {
            const value = conversationFacts[key];
            const filled = value !== undefined;
            return (
              <div
                key={key}
                className={`flex justify-between items-center px-3.5 py-2.5 rounded-lg transition-all duration-500 ${filled
                  ? "bg-white/[0.07] animate-fade-in-up"
                  : "bg-white/[0.02]"
                  }`}
              >
                <span
                  className={`text-[11px] uppercase tracking-[0.06em] transition-colors duration-500 ${filled
                    ? "text-inverse-on-surface/40"
                    : "text-inverse-on-surface/15"
                    }`}
                >
                  {label}
                </span>
                {filled ? (
                  <span className="text-sm font-semibold text-primary">
                    {value}
                  </span>
                ) : (
                  <span className="text-[11px] text-inverse-on-surface/10">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tonal spacing */}
      <div className="py-4" />

      {/* Allocation */}
      <div className="min-w-[292px]">
        <div
          className={`text-[10px] uppercase font-semibold tracking-[0.15em] mb-4 transition-colors duration-500 ${allocation
            ? "text-inverse-on-surface/35"
            : "text-inverse-on-surface/15"
            }`}
        >
          Allocation
        </div>
        {allocation ? (
          <AllocationChart allocation={allocation} />
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative w-[200px] h-[200px]">
              <svg viewBox="0 0 36 36" className="w-[200px] h-[200px] -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-inverse-on-surface/6" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-inverse-on-surface/[0.03]" strokeWidth="4"
                  strokeDasharray="30 87.96" strokeDashoffset="0" />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-sm font-bold text-inverse-on-surface/10">—</div>
              </div>
            </div>
            <p className="text-[11px] tracking-[0.04em] text-inverse-on-surface/18">
              Completes after profiling
            </p>
          </div>
        )}
      </div>

      {/* FIRE Summary — only shown when portfolio is hydrated */}
      {portfolio?.fire && (
        <>
          <div className="py-4" />
          <div className="min-w-[292px] animate-fade-in-up">
            <div className="text-[10px] uppercase font-semibold tracking-[0.15em] text-inverse-on-surface/35 mb-2.5">
              FIRE Projection
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">FIRE Number</span>
                <span className="text-sm font-semibold text-primary">{formatCurrency(portfolio.fire.fire_number)}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">Target Age</span>
                <span className="text-sm font-semibold text-primary">{portfolio.fire.target_age}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">Years to FIRE</span>
                <span className="text-sm font-semibold text-primary">{portfolio.fire.years_to_fire}y</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">Variant</span>
                <span className="text-sm font-semibold text-primary capitalize">{portfolio.fire.fire_variant}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">Withdrawal</span>
                <span className="text-sm font-semibold text-primary">{(portfolio.fire.withdrawal_rate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Strategy — only shown when portfolio is hydrated */}
      {portfolio?.strategy && (
        <>
          <div className="py-4" />
          <div className="min-w-[292px] animate-fade-in-up">
            <div className="text-[10px] uppercase font-semibold tracking-[0.15em] text-inverse-on-surface/35 mb-2.5">
              Investment Strategy
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">Method</span>
                <span className="text-sm font-semibold text-primary">{formatStrategy(portfolio.strategy.type)}</span>
              </div>
              {portfolio.strategy.dca_amount > 0 && (
                <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                  <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">DCA Amount</span>
                  <span className="text-sm font-semibold text-primary">{formatCurrency(portfolio.strategy.dca_amount)}</span>
                </div>
              )}
              {portfolio.strategy.dca_frequency && (
                <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                  <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">Frequency</span>
                  <span className="text-sm font-semibold text-primary">{formatFrequency(portfolio.strategy.dca_frequency)}</span>
                </div>
              )}
              <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-white/[0.07]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-inverse-on-surface/40">Effort</span>
                <span className="text-sm font-semibold text-primary capitalize">{portfolio.strategy.effort_level}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
