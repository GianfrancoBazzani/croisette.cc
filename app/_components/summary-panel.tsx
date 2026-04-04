// app/_components/summary-panel.tsx
"use client";

import { AllocationChart } from "./allocation-chart";

interface ProfileFact {
  key: string;
  label: string;
  value: string;
}

interface SummaryPanelProps {
  profileFacts: ProfileFact[];
  currentInsight: string | null;
  allocation: Array<{ asset: string; pct: number }> | null;
}

const PROFILE_KEY_LABELS: Record<string, string> = {
  emergency_fund: "Emergency Fund",
  time_horizon: "Time Horizon",
  risk_tolerance: "Risk Tolerance",
  primary_goal: "Primary Goal",
  strategy: "Strategy",
};

export function labelForKey(key: string): string {
  return PROFILE_KEY_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SummaryPanel({
  profileFacts,
  currentInsight,
  allocation,
}: SummaryPanelProps) {
  const isEmpty = profileFacts.length === 0 && !currentInsight && !allocation;

  return (
    <div className="w-[340px] bg-inverse-surface text-surface p-6 flex flex-col gap-5 overflow-y-auto shrink-0">
      {/* Header */}
      <div>
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

      {isEmpty && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: "rgba(254,248,246,0.3)" }}>
            Your profile will build up as we talk.
          </p>
        </div>
      )}

      {/* Profile Facts — progressive reveal */}
      {profileFacts.length > 0 && (
        <div className="flex flex-col gap-2">
          {profileFacts.map((fact) => (
            <div
              key={fact.key}
              className="flex justify-between items-center px-3.5 py-2.5 rounded-lg animate-fade-in-up"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <span className="text-xs" style={{ color: "rgba(254,248,246,0.5)" }}>
                {fact.label}
              </span>
              <span className="text-sm font-semibold text-primary">
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Divider — only if there are facts */}
      {profileFacts.length > 0 && (
        <div className="h-px" style={{ background: "rgba(254,248,246,0.08)" }} />
      )}

      {/* Contextual Insight */}
      {currentInsight && (
        <div>
          <div
            className="text-xs uppercase font-semibold mb-2"
            style={{ letterSpacing: "0.1em", color: "rgba(254,248,246,0.4)" }}
          >
            Insight
          </div>
          <div
            className="rounded-lg px-3.5 py-3 text-sm leading-relaxed"
            style={{
              background: "rgba(175,28,87,0.1)",
              color: "rgba(254,248,246,0.75)",
            }}
          >
            {currentInsight}
          </div>
        </div>
      )}

      {/* Allocation Chart — appears at the end */}
      {allocation && (
        <>
          <div className="h-px" style={{ background: "rgba(254,248,246,0.08)" }} />
          <div>
            <div
              className="text-xs uppercase font-semibold mb-4"
              style={{ letterSpacing: "0.1em", color: "rgba(254,248,246,0.4)" }}
            >
              Allocation
            </div>
            <AllocationChart allocation={allocation} />
          </div>
        </>
      )}
    </div>
  );
}
