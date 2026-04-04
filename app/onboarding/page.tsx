"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSession } from "@/lib/auth-client";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const COUNTRY_LIST = Object.entries(countries.getNames("en"))
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

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
  const [profile, setProfile] = useState({ name: "", age: "", country: "", telegram: "" });
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  /* ── Chat: initialize early (step 3) so the response is ready by step 5 ── */
  const [chatStarted, setChatStarted] = useState(false);
  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/chat/${AGENT_ID}`,
        body: { sessionId },
      }),
    [sessionId],
  );
  const { messages, sendMessage, status } = useChat({ transport: chatTransport });
  const isReady = status === "ready";
  const hasSentWakeUp = useRef(false);

  const wakeUpPrompt = "Hello Croissette my name is Jonathan";

  // Start the chat connection when we enter step 3 (verification)
  useEffect(() => {
    if (step >= 3) setChatStarted(true);
  }, [step]);

  // Send wakeup prompt once the transport is ready and we've started
  useEffect(() => {
    if (chatStarted && isReady && !hasSentWakeUp.current) {
      hasSentWakeUp.current = true;
      sendMessage({ text: wakeUpPrompt });
    }
  }, [chatStarted, isReady, sendMessage, wakeUpPrompt]);

  const hasFirstResponse = messages.some(
    (m) => m.role === "assistant" && m.parts.some((p) => p.type === "text" && p.text),
  );

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
    (step === 2 && profile.name.trim() !== "" && profile.age.trim() !== "" && profile.country.trim() !== "") ||
    step === 3 ||
    step === 4;

  return (
    <>
      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 glass shadow-ambient h-20 flex items-center px-8 justify-between">
        <span className="text-2xl font-black text-inverse-surface tracking-tighter">
          Croisette
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs font-label uppercase tracking-widest text-on-surface/40">
            Step {String(step + 1).padStart(2, "0")} / 05
          </span>
          <div className="w-32 h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step + 1) / 5) * 100}%` }}
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
      {step === 2 && (
        <StepProfile profile={profile} onChange={setProfile} />
      )}
      {step === 3 && (
        <StepVerification onComplete={() => setStep(4)} />
      )}
      {step === 4 && (
        <StepAdvisor
          messages={messages}
          sendMessage={sendMessage}
          isReady={isReady}
          hasFirstResponse={hasFirstResponse}
        />
      )}

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

          {step < 3 ? (
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
          ) : step === 3 ? (
            /* Step 4 (verification) auto-advances — hide the button */
            <span />
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
              &ldquo;The Croisette  Engine realigns your risk architecture every
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
   Step 3 — Profile Details
   ═════════════════════════════════════════════ */
function StepProfile({
  profile,
  onChange,
}: {
  profile: { name: string; age: string; country: string; telegram: string };
  onChange: (p: { name: string; age: string; country: string; telegram: string }) => void;
}) {
  const update = (field: keyof typeof profile, value: string) =>
    onChange({ ...profile, [field]: value });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-28 pb-40">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-fixed/10 blur-[120px] rounded-full -translate-y-1/3 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-fixed/10 blur-[100px] rounded-full translate-y-1/3 translate-x-1/3" />

      <div className="w-full max-w-xl z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface leading-tight">
            Tell Us About <span className="text-primary">You.</span>
          </h1>
          <p className="text-tertiary-fixed-dim font-medium text-lg uppercase tracking-[0.2em]">
            A few details to personalize your experience.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Julien Delacroix"
              className="w-full bg-surface-container-high rounded-xl px-6 py-5 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Age
            </label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => update("age", e.target.value)}
              placeholder="e.g. 34"
              min="18"
              max="120"
              className="w-full bg-surface-container-high rounded-xl px-6 py-5 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Country
            </label>
            <select
              value={profile.country}
              onChange={(e) => update("country", e.target.value)}
              className={`w-full bg-surface-container-high rounded-xl px-6 py-5 text-sm font-medium appearance-none focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all ${profile.country ? "text-on-surface" : "text-on-surface-variant/40"
                }`}
            >
              <option value="" disabled>
                Select your country
              </option>
              {COUNTRY_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Telegram */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Telegram Handle
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/40 font-medium">
                @
              </span>
              <input
                type="text"
                value={profile.telegram}
                onChange={(e) => update("telegram", e.target.value)}
                placeholder="username"
                className="w-full bg-surface-container-high rounded-xl pl-11 pr-6 py-5 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
/* ═════════════════════════════════════════════
   Step 4 — Agent Verification (OG Storage)
   ═════════════════════════════════════════════ */
const VERIFICATION_CARDS = [
  {
    icon: "enhanced_encryption",
    title: "Hashing Parameters",
    detail: "SHA-256 agent fingerprint generated from your risk profile and horizon preferences.",
    hash: "0xa7f3…c91d",
  },
  {
    icon: "cloud_upload",
    title: "Blockchain Upload",
    detail: "Submitting signed payload to OG Verification Network for immutable storage.",
    hash: "0x3e8b…f402",
  },
  {
    icon: "verified_user",
    title: "On-Chain Verification",
    detail: "Consensus reached. Agent integrity confirmed across 128 validator nodes.",
    hash: "0xd04c…88ae",
  },
  {
    icon: "shield_lock",
    title: "OG Storage Secured",
    detail: "Your agent is now tamper-proof and permanently anchored to the OG ledger.",
    hash: "0x91fa…2b77",
  },
  {
    icon: "check_circle",
    title: "Verification Complete",
    detail: "Agent identity sealed. Ready to deploy your personalized intelligence.",
    hash: "VERIFIED",
  },
];

const CARD_DURATION = 1500; // ms each card is shown

function StepVerification({ onComplete }: { onComplete: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardState, setCardState] = useState<"entering" | "visible" | "exiting">("entering");

  useEffect(() => {
    if (activeIndex >= VERIFICATION_CARDS.length) {
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }

    // Enter
    setCardState("entering");
    const enterTimer = setTimeout(() => setCardState("visible"), 50);

    // Hold, then exit
    const exitTimer = setTimeout(() => {
      setCardState("exiting");
    }, CARD_DURATION);

    // Advance to next card after exit animation
    const advanceTimer = setTimeout(() => {
      setActiveIndex((i) => i + 1);
    }, CARD_DURATION + 400);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(advanceTimer);
    };
  }, [activeIndex, onComplete]);

  const card = VERIFICATION_CARDS[activeIndex];
  const isLast = activeIndex === VERIFICATION_CARDS.length - 1;
  const progress =
    activeIndex >= VERIFICATION_CARDS.length
      ? 100
      : ((activeIndex + (cardState === "exiting" ? 1 : 0.5)) / VERIFICATION_CARDS.length) * 100;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-28 pb-40">
      {/* Background accents */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-fixed/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-xl z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface leading-tight">
            Agent <span className="text-primary">Verification.</span>
          </h1>
          <p className="text-tertiary-fixed-dim font-medium text-lg uppercase tracking-[0.2em]">
            Securely hashed &amp; verified via OG Blockchain.
          </p>
        </div>

        {/* Card area — fixed height to prevent layout shift */}
        <div className="relative h-[260px]">
          {card && (
            <div
              key={activeIndex}
              className="absolute inset-0 transition-all duration-[400ms]"
              style={{
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                opacity: cardState === "entering" ? 0 : cardState === "exiting" ? 0 : 1,
                transform:
                  cardState === "entering"
                    ? "scale(0.85) translateY(40px)"
                    : cardState === "exiting"
                      ? "scale(0.9) translateY(-30px)"
                      : "scale(1) translateY(0)",
              }}
            >
              <div
                className={`h-full rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_40px_rgba(29,27,26,0.06)] ${isLast && cardState === "visible"
                  ? "bg-inverse-surface"
                  : "bg-surface-container-lowest"
                  }`}
              >
                {/* Radial line art */}
                <div className="absolute -right-16 -top-16 w-64 h-64 opacity-[0.06] pointer-events-none">
                  <svg className="w-full h-full text-primary" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>

                {/* Top: icon + title */}
                <div>
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${isLast && cardState === "visible"
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container-high text-primary"
                      }`}
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={
                        isLast
                          ? { fontVariationSettings: "'FILL' 1" }
                          : undefined
                      }
                    >
                      {card.icon}
                    </span>
                  </div>

                  <h3
                    className={`text-2xl font-bold tracking-tight mb-3 ${isLast && cardState === "visible"
                      ? "text-surface-bright"
                      : "text-on-surface"
                      }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-[15px] leading-relaxed ${isLast && cardState === "visible"
                      ? "text-surface-variant/80"
                      : "text-on-surface-variant"
                      }`}
                  >
                    {card.detail}
                  </p>
                </div>

                {/* Bottom: hash */}
                <div className="flex items-center justify-between mt-6">
                  <span
                    className={`text-xs font-mono tracking-wider ${isLast && cardState === "visible"
                      ? "text-primary"
                      : "text-on-surface-variant/40"
                      }`}
                  >
                    {card.hash}
                  </span>
                  <span className="material-symbols-outlined text-primary text-lg animate-pulse">
                    {isLast ? "verified" : "pending"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-3 mt-10">
          {VERIFICATION_CARDS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex
                ? "w-8 bg-primary"
                : i < activeIndex
                  ? "w-1.5 bg-primary/40"
                  : "w-1.5 bg-surface-container-highest"
                }`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* OG Blockchain badge */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 bg-surface-container-low px-6 py-3 rounded-xl">
            <span className="material-symbols-outlined text-primary text-lg">
              token
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
              Powered by OG Verification Protocol
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ═════════════════════════════════════════════
   Personalization Loader
   ═════════════════════════════════════════════ */
const PERSONALIZATION_STEPS = [
  { icon: "psychology", text: "Initializing Croisette  Engine…" },
  { icon: "fingerprint", text: "Reading your investor profile…" },
  { icon: "tune", text: "Calibrating risk architecture…" },
  { icon: "hub", text: "Connecting to live market signals…" },
  { icon: "insights", text: "Building predictive models…" },
  { icon: "auto_awesome", text: "Personalizing your Croissette experience…" },
];

function StepPersonalizing({ onComplete }: { onComplete: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  // Typewriter per step
  useEffect(() => {
    if (activeIndex >= PERSONALIZATION_STEPS.length) {
      setDone(true);
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
    const text = PERSONALIZATION_STEPS[activeIndex].text;
    if (charIndex < text.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 22);
      return () => clearTimeout(t);
    }
    // Pause at end of step, then advance
    const t = setTimeout(() => {
      setActiveIndex((i) => i + 1);
      setCharIndex(0);
    }, 700);
    return () => clearTimeout(t);
  }, [activeIndex, charIndex, onComplete]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-28 pb-40">
      {/* Background accents */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-fixed/10 blur-[120px] rounded-full -translate-y-1/3 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-fixed/10 blur-[100px] rounded-full translate-y-1/3 translate-x-1/3" />

      <div className="w-full max-w-2xl z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface leading-tight">
            Preparing Your <span className="text-primary">Intelligence.</span>
          </h1>
          <p className="text-tertiary-fixed-dim font-medium text-lg uppercase tracking-[0.2em]">
            Building a bespoke experience for you.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {PERSONALIZATION_STEPS.map((step, i) => {
            const isActive = i === activeIndex;
            const isCompleted = i < activeIndex;
            const isHidden = i > activeIndex;

            return (
              <div
                key={i}
                className={`flex items-center gap-5 transition-all duration-500 ${isHidden
                  ? "opacity-0 translate-y-4"
                  : isCompleted
                    ? "opacity-40"
                    : "opacity-100"
                  }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${isActive
                    ? "bg-primary/20 text-primary"
                    : isCompleted
                      ? "bg-surface-container-high text-on-surface-variant"
                      : "bg-surface-container-high text-on-surface-variant"
                    }`}
                >
                  {isCompleted ? (
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined">
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Text */}
                <span
                  className={`text-lg font-medium tracking-tight transition-colors duration-500 ${isActive ? "text-on-surface" : "text-on-surface-variant"
                    }`}
                >
                  {isActive
                    ? step.text.slice(0, charIndex)
                    : isCompleted
                      ? step.text
                      : ""}
                  {isActive && (
                    <span className="inline-block w-[2px] h-5 bg-primary ml-0.5 align-middle animate-pulse" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-16 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{
              width: `${done ? 100 : (activeIndex / PERSONALIZATION_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </main>
  );
}

/* ═════════════════════════════════════════════
   Croissette Advisor (Chat)
   ═════════════════════════════════════════════ */
function StepAdvisor({
  messages,
  sendMessage,
  isReady,
  hasFirstResponse,
}: {
  messages: ReturnType<typeof useChat>["messages"];
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  isReady: boolean;
  hasFirstResponse: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [personalizationDone, setPersonalizationDone] = useState(false);

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

  // Phase 1: Personalization loader (always runs its full animation)
  if (!personalizationDone) {
    return <StepPersonalizing onComplete={() => setPersonalizationDone(true)} />;
  }

  // Phase 2: Personalization done but first response hasn't arrived yet — waiting animation
  if (!hasFirstResponse) {
    return <StepWaitingForAgent />;
  }

  // Phase 3: Chat is ready
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
        {messages.slice(1).map((message) => { // Hide the wakeup prompt message
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

/* ═════════════════════════════════════════════
   Waiting for Agent (shown after personalization
   if the first chat response hasn't arrived yet)
   ═════════════════════════════════════════════ */
function StepWaitingForAgent() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-28 pb-40">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-fixed/10 blur-[120px] rounded-full -translate-y-1/3 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-fixed/10 blur-[100px] rounded-full translate-y-1/3 translate-x-1/3" />

      <div className="w-full max-w-md z-10 flex flex-col items-center text-center">
        {/* Pulsing icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-10 animate-pulse">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface mb-4">
          Almost There&hellip;
        </h2>
        <p className="text-on-surface-variant font-medium text-lg mb-12">
          Your advisor is preparing a personalized briefing.
        </p>

        {/* Animated loading bar */}
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full w-2/5 bg-primary rounded-full loading-sweep" />
        </div>

        {/* eslint-disable-next-line react/no-unknown-property */}
        <style>{`
          @keyframes loadingSweep {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(250%); }
            100% { transform: translateX(-100%); }
          }
          .loading-sweep {
            animation: loadingSweep 1.8s ease-in-out infinite;
          }
        `}</style>
      </div>
    </main>
  );
}
