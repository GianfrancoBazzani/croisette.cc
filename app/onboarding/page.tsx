"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSession } from "@/lib/auth-client";

/* ─────────────────────────────────────────────
   Step 1 — Horizon options
   ───────────────────────────────────────────── */
const HORIZONS = [
  {
    id: "retire-early",
    icon: "sunny",
    title: "Retire Early",
    description:
      "Maximize current growth to secure independence before traditional milestones.",
  },
  {
    id: "legacy-building",
    icon: "fort",
    title: "Legacy Building",
    description:
      "Multi-generational wealth structures designed for endurance and family impact.",
  },
  {
    id: "passive-income",
    icon: "waterfall_chart",
    title: "Passive Income",
    description:
      "Cashflow-optimized portfolios generating consistent returns for lifestyle freedom.",
  },
] as const;

/* ─────────────────────────────────────────────
   Step 2 — Risk options
   ───────────────────────────────────────────── */
const RISKS = [
  {
    id: "preservation",
    icon: "shield",
    title: "Preservation",
    description: "Priority on principal protection with minimal fluctuation.",
    label: "Low Risk",
    featured: false,
  },
  {
    id: "balanced",
    icon: "balance",
    title: "Balanced",
    description:
      "A steady hand. Seeking consistent returns through market cycles.",
    label: "Medium Risk",
    featured: false,
  },
  {
    id: "aggressive",
    icon: "trending_up",
    title: "Aggressive",
    description:
      "Capitalizing on growth opportunities with higher tolerance.",
    label: "High Risk",
    featured: false,
  },
  {
    id: "full-croissette",
    icon: "auto_awesome",
    title: "Full Croissette",
    description:
      "Optimized for maximum growth using all proprietary AI signals.",
    label: "AI Optimized",
    featured: true,
  },
] as const;

const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID;

/* ═════════════════════════════════════════════
   Main Component
   ═════════════════════════════════════════════ */
export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const [step, setStep] = useState(0);
  const [selectedHorizon, setSelectedHorizon] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      window.location.href = "/";
    }
  }, [isPending, session]);

  if (isPending || !session) {
    return null;
  }

  const canContinue =
    (step === 0 && selectedHorizon !== null) ||
    (step === 1 && selectedRisk !== null) ||
    step === 2;

  return (
    <>
      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 glass shadow-ambient h-20 flex items-center px-8 justify-between">
        <span className="text-2xl font-black text-inverse-surface tracking-tighter">
          Croisette
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs font-label uppercase tracking-widest text-on-surface/40">
            Step {String(step + 1).padStart(2, "0")} / 03
          </span>
          <div className="w-32 h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step + 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── Step Content ── */}
      {step === 0 && (
        <StepHorizons
          selected={selectedHorizon}
          onSelect={setSelectedHorizon}
        />
      )}
      {step === 1 && (
        <StepRisk selected={selectedRisk} onSelect={setSelectedRisk} />
      )}
      {step === 2 && <StepAdvisor />}

      {/* ── Footer ── */}
      <footer className="fixed bottom-0 w-full z-40 bg-inverse-surface flex items-center justify-between px-12 py-8">
        <span className="hidden md:block text-surface-variant/40 text-[10px] font-label uppercase tracking-widest">
          &copy; 2026 Croisette. High-End Editorial Intelligence.
        </span>
        <div className="flex items-center gap-8 w-full md:w-auto justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-surface-variant/60 hover:text-surface text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Previous
            </button>
          ) : (
            <span />
          )}

          {step < 2 ? (
            <button
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="gradient-primary text-on-primary px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Continue
              <span className="material-symbols-outlined text-lg">
                north_east
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                /* TODO: persist & navigate */
              }}
              className="gradient-primary text-on-primary px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg cursor-pointer"
            >
              Finish Setup
              <span className="material-symbols-outlined text-lg">
                north_east
              </span>
            </button>
          )}
        </div>
      </footer>
    </>
  );
}

/* ═════════════════════════════════════════════
   Step 1 — Financial Horizons
   ═════════════════════════════════════════════ */
function StepHorizons({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-28 pb-40">
      {/* Background accents */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-fixed/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-fixed/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-5xl z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface max-w-2xl mx-auto leading-tight">
            What are your Financial Horizons?
          </h1>
          <p className="text-tertiary-fixed-dim font-medium text-lg uppercase tracking-[0.2em]">
            Select your primary investment goal.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HORIZONS.map((h) => {
            const isSelected = selected === h.id;
            return (
              <button
                key={h.id}
                onClick={() => onSelect(h.id)}
                className={`group relative p-10 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col h-full overflow-hidden text-left ${isSelected
                  ? "bg-inverse-surface shadow-[0_30px_60px_rgba(29,27,26,0.12)] ring-4 ring-primary"
                  : "bg-surface-container-lowest shadow-ambient ghost-border"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 p-4">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      check_circle
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${isSelected
                      ? "bg-primary/20 text-primary-fixed"
                      : "bg-surface-container-high text-primary"
                      }`}
                  >
                    <span className="material-symbols-outlined text-4xl">
                      {h.icon}
                    </span>
                  </div>
                </div>

                <h3
                  className={`text-2xl font-bold mb-4 ${isSelected ? "text-surface-bright" : "text-on-surface"
                    }`}
                >
                  {h.title}
                </h3>
                <p
                  className={`leading-relaxed text-[15px] ${isSelected
                    ? "text-surface-variant/80"
                    : "text-on-surface-variant"
                    }`}
                >
                  {h.description}
                </p>

                <div className="mt-auto pt-8">
                  <span
                    className={`material-symbols-outlined transition-colors ${isSelected
                      ? "text-primary"
                      : "text-outline-variant group-hover:text-primary"
                      }`}
                  >
                    north_east
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

/* ═════════════════════════════════════════════
   Step 2 — Risk Architecture
   ═════════════════════════════════════════════ */
function StepRisk({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-40 px-6">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="max-w-6xl w-full z-10">
        {/* Editorial Header */}
        <div className="mb-16 md:mb-24 flex flex-col items-start gap-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-inverse-surface leading-none">
            Your Risk <br />
            <span className="text-primary">Architecture.</span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl font-medium leading-relaxed mt-4">
            How should the AI agents manage your volatility?
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          {RISKS.map((r) => {
            const isSelected = selected === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={`group relative flex flex-col text-left p-8 rounded-xl transition-all duration-300 hover:scale-[1.02] outline-none cursor-pointer ${isSelected
                  ? "bg-inverse-surface text-on-primary scale-[1.02] shadow-[0_20px_40px_rgba(29,27,26,0.12)] ghost-border"
                  : "bg-surface-container-low hover:bg-surface-container-high"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      check_circle
                    </span>
                  </div>
                )}

                <div
                  className={`mb-12 h-12 w-12 flex items-center justify-center rounded-full transition-colors ${isSelected
                    ? "bg-white/10 text-primary"
                    : "bg-surface-container-lowest text-on-surface-variant group-hover:text-primary"
                    }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={
                      r.featured
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {r.icon}
                  </span>
                </div>

                <div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${isSelected ? "text-surface" : "text-inverse-surface"
                      }`}
                  >
                    {r.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed mb-6 ${isSelected
                      ? "text-surface-variant"
                      : "text-on-surface-variant"
                      }`}
                  >
                    {r.description}
                  </p>
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${r.featured && isSelected
                      ? "text-primary"
                      : isSelected
                        ? "text-primary"
                        : "text-on-surface/40"
                      }`}
                  >
                    {r.label}
                  </span>
                </div>

                {/* Radial line art for featured card when selected */}
                {r.featured && isSelected && (
                  <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden rounded-xl">
                    <svg
                      className="absolute -right-20 -bottom-20 w-80 h-80 text-primary"
                      viewBox="0 0 200 200"
                    >
                      <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="100" cy="100" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Editorial quote */}
        <div className="mt-20 max-w-2xl">
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
            <p className="text-sm font-medium italic text-on-surface-variant">
              &ldquo;The Alchemist Engine realigns your risk architecture every
              300 milliseconds, ensuring that market volatility becomes an
              instrument of growth rather than a threat to stability.&rdquo;
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-tighter text-inverse-surface">
              &mdash; Intelligence Protocol A-12
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ═════════════════════════════════════════════
   Step 3 — Croissette Advisor (Chat)
   ═════════════════════════════════════════════ */
function StepAdvisor() {
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat/${AGENT_ID}`,
      body: { sessionId },
    }),
  });

  const isReady = status === "ready";

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && isReady) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <main className="pt-20 pb-28 min-h-screen flex flex-col bg-surface-bright">
      {/* Title */}
      <div className="flex justify-center py-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tighter text-inverse-surface mb-4">
            Croissette Advisor
          </h1>
          <p className="text-on-surface-variant font-medium opacity-70">
            Editorial Wealth Intelligence &amp; Predictive Analysis
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 md:px-12 space-y-10 max-w-4xl mx-auto w-full"
      >
        {messages.map((message) => {
          const hasText = message.parts.some(
            (part) => part.type === "text" && part.text
          );
          const showSpinner =
            !isReady && message.role === "assistant" && !hasText;

          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[70%] space-y-2">
                  <div className="bg-surface-container-lowest text-on-surface px-6 py-4 rounded-2xl rounded-tr-none shadow-ambient ghost-border">
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        <p key={i} className="leading-relaxed text-[15px]">
                          {part.text}
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            );
          }

          /* Assistant message */
          return (
            <div key={message.id} className="flex">
              <div className="max-w-[85%] space-y-4">
                <div className="bg-inverse-surface text-on-primary-container px-8 py-8 rounded-3xl rounded-tl-none shadow-2xl relative overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <svg className="w-full h-full text-primary" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                        Croissete Sailor
                      </span>
                    </div>

                    {showSpinner ? (
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-surface-variant text-sm">
                          Thinking&hellip;
                        </span>
                      </div>
                    ) : (
                      message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <p
                            key={i}
                            className="leading-relaxed text-[15px] opacity-90 whitespace-pre-wrap"
                          >
                            {part.text}
                          </p>
                        ) : null
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Standalone spinner when waiting for first assistant chunk */}
        {!isReady &&
          (messages.length === 0 ||
            messages[messages.length - 1].role === "user") && (
            <div className="flex">
              <div className="max-w-[85%]">
                <div className="bg-inverse-surface text-on-primary-container px-8 py-6 rounded-3xl rounded-tl-none shadow-2xl flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-surface-variant text-sm">
                    Thinking&hellip;
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Input bar */}
      <div className="px-6 md:px-12 pt-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center bg-surface-container-lowest rounded-xl shadow-ambient ghost-border p-2 pl-6 focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isReady}
              placeholder="Ask Croissette about your portfolio..."
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium placeholder:text-on-surface-variant/40 placeholder:font-normal py-4"
            />
            <div className="flex items-center gap-2 pr-2">
              <button
                type="button"
                className="p-3 text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button
                type="submit"
                disabled={!isReady || !input.trim()}
                className="gradient-primary text-on-primary p-4 rounded-lg flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined">north_east</span>
              </button>
            </div>
          </div>
        </form>
        <p className="text-center mt-4 text-[9px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-medium">
          Croissette AI may provide financial modeling that requires human
          verification.
        </p>
      </div>
    </main>
  );
}
