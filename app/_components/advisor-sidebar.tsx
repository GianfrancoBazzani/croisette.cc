"use client";

import { AllocationChart } from "./allocation-chart";

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

export function AdvisorSidebar({
  funnelData,
  conversationFacts,
  allocation,
  visible,
}: AdvisorSidebarProps) {
  return (
    <div
      className="bg-inverse-surface text-surface flex flex-col gap-5 overflow-hidden shrink-0 transition-all duration-500 ease-in-out"
      style={{
        width: visible ? 340 : 0,
        opacity: visible ? 1 : 0,
        padding: visible ? "1.5rem" : "1.5rem 0",
      }}
    >
      {/* Header */}
      <div className="min-w-[292px]">
        <div
          className="text-xs uppercase font-semibold mb-1"
          style={{ letterSpacing: "0.1em", color: "#8f4c35" }}
        >
          Your Profile
        </div>
        <div className="text-lg font-bold" style={{ letterSpacing: "-0.02em" }}>
          Portfolio Blueprint
        </div>
      </div>

      {/* Funnel facts — pre-filled */}
      <div className="flex flex-col gap-2 min-w-[292px]">
        {FUNNEL_FIELDS.map(({ key, label }) => (
          <div
            key={key}
            className="flex justify-between items-center px-3.5 py-2.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-xs" style={{ color: "rgba(254,248,246,0.5)" }}>
              {label}
            </span>
            <span className="text-sm font-semibold text-primary">
              {funnelData[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px min-w-[292px]" style={{ background: "rgba(254,248,246,0.08)" }} />

      {/* Conversation facts — greyed out until filled */}
      <div className="flex flex-col gap-2 min-w-[292px]">
        {CONVERSATION_FIELDS.map(({ key, label }) => {
          const value = conversationFacts[key];
          const filled = value !== undefined;
          return (
            <div
              key={key}
              className={`flex justify-between items-center px-3.5 py-2.5 rounded-lg transition-all duration-300 ${filled ? "animate-fade-in-up" : ""}`}
              style={{ background: filled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)" }}
            >
              <span className="text-xs" style={{ color: filled ? "rgba(254,248,246,0.5)" : "rgba(254,248,246,0.2)" }}>
                {label}
              </span>
              {filled ? (
                <span className="text-sm font-semibold text-primary">{value}</span>
              ) : (
                <span className="text-sm font-semibold" style={{ color: "rgba(254,248,246,0.12)" }}>—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-px min-w-[292px]" style={{ background: "rgba(254,248,246,0.08)" }} />

      {/* Allocation */}
      <div className="min-w-[292px]">
        <div
          className="text-xs uppercase font-semibold mb-4"
          style={{ letterSpacing: "0.1em", color: allocation ? "rgba(254,248,246,0.4)" : "rgba(254,248,246,0.2)" }}
        >
          Allocation
        </div>
        {allocation ? (
          <AllocationChart allocation={allocation} />
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative w-[120px] h-[120px]">
              <svg viewBox="0 0 36 36" className="w-[120px] h-[120px]" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(254,248,246,0.06)" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(254,248,246,0.03)" strokeWidth="4"
                  strokeDasharray="30 87.96" strokeDashoffset="0" />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-sm font-bold" style={{ color: "rgba(254,248,246,0.12)" }}>—</div>
              </div>
            </div>
            <p className="text-xs" style={{ color: "rgba(254,248,246,0.15)" }}>
              Completes after profiling
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
