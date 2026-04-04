"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSession } from "@/lib/auth-client";
import { AdvisorSidebar, type FunnelData } from "@/app/_components/advisor-sidebar";
import Markdown from "react-markdown";
import Link from "next/link";
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

  // Deterministic user identifier from email (first 16 bytes of SHA-256)
  const [userHash, setUserHash] = useState<string | null>(null);
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    const encoded = new TextEncoder().encode(email);
    crypto.subtle.digest("SHA-256", encoded).then((digest) => {
      const hex = Array.from(new Uint8Array(digest).slice(0, 8))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setUserHash(hex);
    });
  }, [session?.user?.email]);

  // Wake up prompt
  function generateWakeUpPrompt(): string {
    return `Hello Croissette Portfolio Agent, I am ${profile.name}, a ${profile.age}-year-old investor from ${countries.getName(profile.country, "en")}.
    I have selected the "${HORIZONS.find(h => h.id === selectedHorizon)?.title}" financial horizon and the "${RISKS.find(r => r.id === selectedRisk)?.title}" risk architecture.
    Please use this information to tailor your investment strategies and recommendations for me.
    Let's work together to optimize my portfolio according to my preferences and goals.
    To ensure a easier iteration switch to my natal language during this conversation, do not notify me just doo switch it.
    My unique identifier is ${userHash}.
    `
  }

  // Start the chat connection when we enter step 3 (verification)
  useEffect(() => {
    if (step >= 3) setChatStarted(true);
  }, [step]);

  // Send wakeup prompt once the transport is ready, hash is computed, and we've started
  useEffect(() => {
    if (chatStarted && isReady && userHash && !hasSentWakeUp.current) {
      hasSentWakeUp.current = true;
      sendMessage({ text: generateWakeUpPrompt() });
    }
  }, [chatStarted, isReady, userHash, sendMessage]);

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
      <header className="fixed top-0 w-full z-50 glass shadow-ambient h-16 flex items-center px-6 justify-between">
        <Link href="/" className="text-2xl font-black text-inverse-surface tracking-tighter">
          Croisette
        </Link>
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
          userName={profile.name}
          funnelData={{
            name: profile.name,
            age: profile.age,
            country: countries.getName(profile.country, "en") || profile.country,
            horizon: HORIZONS.find(h => h.id === selectedHorizon)?.title ?? "",
            risk: RISKS.find(r => r.id === selectedRisk)?.title ?? "",
          }}
        />
      )}

      {/* ── Footer (hidden on chat step) ── */}
      {step !== 4 && (
      <footer className="fixed bottom-0 w-full z-40 bg-inverse-surface flex items-center justify-between px-8 py-5">
        <span className="hidden md:block text-[10px] text-surface-variant/40 font-label uppercase tracking-widest">
          &copy; 2026 Croisette. High-End Editorial Intelligence.
        </span>
        <div className="flex items-center gap-8 w-full md:w-auto justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-surface-variant/60 hover:text-surface text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
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
              className="gradient-primary text-on-primary px-6 py-3 rounded-md font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
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
              className="gradient-primary text-on-primary px-6 py-3 rounded-md font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg cursor-pointer"
            >
              Finish Setup
              <span className="material-symbols-outlined text-lg">
                north_east
              </span>
            </button>
          )}
        </div>
      </footer>
      )}
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

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = useMemo(
    () =>
      countrySearch.trim()
        ? COUNTRY_LIST.filter((c) =>
            c.name.toLowerCase().includes(countrySearch.toLowerCase()),
          )
        : COUNTRY_LIST,
    [countrySearch],
  );

  const selectedCountryName = profile.country
    ? countries.getName(profile.country, "en") ?? ""
    : "";

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    if (countryOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [countryOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (countryOpen) searchInputRef.current?.focus();
  }, [countryOpen]);

  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center relative px-6 pt-20 pb-24 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-fixed/10 blur-[120px] rounded-full -translate-y-1/3 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-fixed/10 blur-[100px] rounded-full translate-y-1/3 translate-x-1/3" />

      <div className="w-full max-w-xl z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface leading-tight">
            Tell Us About <span className="text-primary">You.</span>
          </h1>
          <p className="text-tertiary-fixed-dim font-medium text-sm md:text-base uppercase tracking-[0.2em]">
            A few details to personalize your experience.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Julien Delacroix"
              className="w-full bg-surface-container-high rounded-xl px-6 py-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Age
            </label>
            <input
              type="number"
              autoComplete="bday-year"
              value={profile.age}
              onChange={(e) => update("age", e.target.value)}
              placeholder="e.g. 34"
              min="18"
              max="120"
              className="w-full bg-surface-container-high rounded-xl px-6 py-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5" ref={countryRef}>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Country
            </label>
            <div className="relative">
              {/* Trigger */}
              <button
                type="button"
                onClick={() => {
                  setCountryOpen((o) => !o);
                  setCountrySearch("");
                }}
                className={`w-full bg-surface-container-high rounded-xl px-6 py-4 text-sm font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                  countryOpen
                    ? "bg-surface-container-highest ring-1 ring-primary/30"
                    : ""
                } ${selectedCountryName ? "text-on-surface" : "text-on-surface-variant/40"}`}
              >
                <span>{selectedCountryName || "Select your country"}</span>
                <span
                  className={`material-symbols-outlined text-on-surface-variant/40 text-lg transition-transform duration-200 ${
                    countryOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              {countryOpen && (
                <div className="absolute z-50 top-full mt-2 w-full bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(29,27,26,0.10)] overflow-hidden">
                  {/* Search */}
                  <div className="p-3">
                    <div className="flex items-center gap-3 bg-surface-container-high rounded-lg px-4 py-2.5">
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">
                        search
                      </span>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search countries…"
                        className="flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <ul className="max-h-48 overflow-y-auto px-1.5 pb-1.5">
                    {filteredCountries.length === 0 ? (
                      <li className="px-5 py-3 text-sm text-on-surface-variant/40">
                        No countries found
                      </li>
                    ) : (
                      filteredCountries.map((c) => {
                        const isActive = profile.country === c.code;
                        return (
                          <li key={c.code}>
                            <button
                              type="button"
                              onClick={() => {
                                update("country", c.code);
                                setCountryOpen(false);
                                setCountrySearch("");
                              }}
                              className={`w-full text-left px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-on-surface hover:bg-surface-container-high"
                              }`}
                            >
                              {c.name}
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Telegram */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
              Telegram Handle
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/40 font-medium">
                @
              </span>
              <input
                type="text"
                autoComplete="username"
                value={profile.telegram}
                onChange={(e) => update("telegram", e.target.value)}
                placeholder="username"
                className="w-full bg-surface-container-high rounded-xl pl-11 pr-6 py-4 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
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
    detail: "Submitting signed payload to 0G Verification Network for immutable storage.",
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
        <div className="relative h-[280px]">
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
              Powered by 0G Verification Protocol
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
    <main className="h-[100dvh] flex flex-col items-center justify-center relative px-6 pt-20 pb-24 overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 radial-art" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-fixed/10 blur-[120px] rounded-full -translate-y-1/3 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-fixed/10 blur-[100px] rounded-full translate-y-1/3 translate-x-1/3" />

      <div className="w-full max-w-2xl z-10">
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface leading-tight">
            Preparing Your <span className="text-primary">Intelligence.</span>
          </h1>
          <p className="text-tertiary-fixed-dim font-medium text-sm md:text-base uppercase tracking-[0.2em]">
            Building a bespoke experience for you.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {PERSONALIZATION_STEPS.map((step, i) => {
            const isActive = i === activeIndex;
            const isCompleted = i < activeIndex;
            const isHidden = i > activeIndex;

            return (
              <div
                key={i}
                className={`flex items-center gap-4 transition-all duration-500 ${isHidden
                  ? "opacity-0 translate-y-4"
                  : isCompleted
                    ? "opacity-40"
                    : "opacity-100"
                  }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${isActive
                    ? "bg-primary/20 text-primary"
                    : isCompleted
                      ? "bg-surface-container-high text-on-surface-variant"
                      : "bg-surface-container-high text-on-surface-variant"
                    }`}
                >
                  {isCompleted ? (
                    <span
                      className="material-symbols-outlined text-primary text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-xl">
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Text */}
                <span
                  className={`text-base font-medium tracking-tight transition-colors duration-500 ${isActive ? "text-on-surface" : "text-on-surface-variant"
                    }`}
                >
                  {isActive
                    ? step.text.slice(0, charIndex)
                    : isCompleted
                      ? step.text
                      : ""}
                  {isActive && (
                    <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 align-middle animate-pulse" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-10 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
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
  userName,
  funnelData,
}: {
  messages: ReturnType<typeof useChat>["messages"];
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  isReady: boolean;
  hasFirstResponse: boolean;
  userName: string;
  funnelData: FunnelData;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [personalizationDone, setPersonalizationDone] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

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

  // Show sidebar after the user sends their first message
  const userHasReplied = messages.filter((m) => m.role === "user").length > 1; // >1 because first is wakeup prompt
  useEffect(() => {
    if (userHasReplied && !sidebarVisible) {
      const timer = setTimeout(() => setSidebarVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [userHasReplied, sidebarVisible]);

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
    <main className="fixed inset-0 top-16 bottom-0 flex bg-surface-bright">
      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 md:px-12 py-6 space-y-10 max-w-4xl mx-auto w-full"
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
                <div className="max-w-[70%] space-y-1">
                  <p className="text-xs font-semibold text-on-surface-variant text-right mr-1">{userName}</p>
                  <div className="bg-surface-container-lowest text-on-surface px-6 py-4 rounded-2xl rounded-tr-none shadow-ambient ghost-border">
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        <div key={i} className="leading-relaxed text-[15px]">
                          <Markdown>{part.text}</Markdown>
                        </div>
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
              <div className="max-w-[85%] space-y-1">
                <p className="text-xs font-semibold text-secondary ml-1">Croisette Advisor</p>
                <div className="bg-surface-container text-on-surface px-6 py-5 rounded-3xl rounded-tl-none shadow-ambient">
                    {showSpinner ? (
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="text-on-surface-variant text-sm">
                          Thinking&hellip;
                        </span>
                      </div>
                    ) : (
                      message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <div
                            key={i}
                            className="leading-relaxed text-[15px]"
                          >
                            <Markdown>{part.text}</Markdown>
                          </div>
                        ) : null
                      )
                    )}
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
              <div className="max-w-[85%] space-y-1">
                <p className="text-xs font-semibold text-secondary ml-1">Croisette Advisor</p>
                <div className="bg-surface-container text-on-surface px-6 py-5 rounded-3xl rounded-tl-none shadow-ambient flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-on-surface-variant text-sm">
                    Thinking&hellip;
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Input bar */}
      <div className="px-6 md:px-12 pt-6 pb-6 max-w-4xl mx-auto w-full">
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

      </div>{/* end chat panel */}

      {/* Sidebar */}
      <AdvisorSidebar
        funnelData={funnelData}
        conversationFacts={{}}
        allocation={null}
        visible={sidebarVisible}
      />
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
