import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ── Top Navigation Bar (Glassmorphic) ── */}
      <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl shadow-ambient h-20">
        <div className="flex justify-between items-center px-8 h-full max-w-7xl mx-auto">
          <div className="text-2xl font-black text-inverse-surface tracking-tighter">
            Croisette
          </div>
          <div className="hidden md:flex gap-10 items-center font-headline tracking-tight font-semibold">
            <a
              className="text-inverse-surface/60 hover:text-primary transition-colors duration-300"
              href="#advisor"
            >
              Advisor
            </a>
            <a
              className="text-inverse-surface/60 hover:text-primary transition-colors duration-300"
              href="#dashboard"
            >
              Dashboard
            </a>
            <a
              className="text-inverse-surface/60 hover:text-primary transition-colors duration-300"
              href="#portfolio"
            >
              Portfolio
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="material-symbols-outlined text-inverse-surface/60 cursor-pointer hover:text-primary transition-colors">
              notifications
            </span>
            <span className="material-symbols-outlined text-inverse-surface/60 cursor-pointer hover:text-primary transition-colors">
              account_circle
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="relative pt-40 pb-32 px-8 overflow-hidden">
        <div className="absolute inset-0 radial-art opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left — Headline & CTA */}
          <div className="lg:col-span-7 z-10">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8 text-on-surface">
              Investing, minus the headache.
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed mb-12">
              Over half of us (55%) are watching our money lose value to
              inflation. We built Croisette because investing is intimidating.
              Our AI agents are awake 24/7/365 to keep your money growing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="gradient-primary text-on-primary px-8 py-5 rounded-md font-semibold text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] shadow-lg cursor-pointer">
                Get Started
                <span className="material-symbols-outlined">north_east</span>
              </Link>
              <button className="bg-surface-container-low text-on-surface-variant px-8 py-5 rounded-md font-semibold text-lg hover:bg-surface-container-high transition-colors cursor-pointer">
                Explore Strategies
              </button>
            </div>
          </div>

          {/* Right — Hero Visual */}
          <div className="lg:col-span-5 relative">
            {/* Logo above the card */}
            <div className="mb-6">
              <img alt="Croisette" className="h-20 md:h-32" src="/croissete.svg" />
            </div>
            <div className="aspect-square bg-inverse-surface rounded-3xl overflow-hidden shadow-2xl relative p-10 flex flex-col justify-between">
              {/* Radial art background texture */}
              <div className="absolute inset-0 radial-art opacity-[0.06] pointer-events-none" />

              {/* Top spacer */}
              <div className="z-10" />

              {/* Center — Key metric */}
              <div className="z-10 flex flex-col items-start">
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
                  Portfolio Performance
                </span>
                <div className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2">
                  +12.4%
                </div>
                <span className="text-primary font-semibold text-sm tracking-tight">
                  annualized return
                </span>
              </div>

              {/* Bottom — Status bar */}
              <div className="z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                      Engine Active
                    </span>
                  </div>
                  <span className="text-white/40 text-xs tracking-tight">
                    24/7 monitoring
                  </span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[89%]" />
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>Optimization Level</span>
                  <span className="text-white/70 font-semibold">89.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── The Hard Truth Section ── */}
      <section className="py-32 px-8 bg-surface-container-low relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">
                The Context
              </span>
              <h2 className="text-5xl font-black tracking-tighter leading-tight text-on-surface">
                The Hard Truth
              </h2>
            </div>
            <p className="text-on-surface-variant text-lg max-w-md">
              Traditional banking is no longer a storage solution; it&apos;s a
              slow leak for your purchasing power.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest p-10 rounded-xl transition-transform hover:-translate-y-2">
              <div className="text-primary mb-6">
                <span className="material-symbols-outlined text-4xl">
                  trending_down
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">
                Inflation Erosion
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                While you sleep, the global economy shifts. Standard savings
                accounts offer yields that often trail the real rate of
                inflation.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-surface-container-lowest p-10 rounded-xl transition-transform hover:-translate-y-2">
              <div className="text-primary mb-6">
                <span className="material-symbols-outlined text-4xl">
                  lock_clock
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">
                The Time Gap
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                Individual investors lose an average of 4.2% annually simply due
                to delayed reactions to market volatility.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-surface-container-lowest p-10 rounded-xl transition-transform hover:-translate-y-2">
              <div className="text-primary mb-6">
                <span className="material-symbols-outlined text-4xl">
                  psychology_alt
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">
                Complexity Barrier
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                The modern financial landscape is designed to be confusing,
                locking out 70% of potential high-growth earners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Real Kicker Section (Asymmetric Bento) ── */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Dark "Engine" card */}
            <div className="lg:col-span-8 bg-inverse-surface text-on-primary p-12 rounded-2xl flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <span className="material-symbols-outlined text-[12rem]">
                  warning
                </span>
              </div>
              <div className="z-10">
                <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">
                  Insight #02
                </span>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-8">
                  The Real Kicker
                </h2>
                <p className="text-white/70 text-xl max-w-xl leading-relaxed">
                  It&apos;s not just about what you lose; it&apos;s about what
                  you never gain. Compounded over a decade, a &quot;safe&quot;
                  1% yield versus an AI-optimized strategy can mean a difference
                  of hundreds of thousands.
                </p>
              </div>
              <div className="mt-12 z-10">
                <div className="flex items-center gap-4 text-primary font-semibold cursor-pointer hover:gap-6 transition-all">
                  <span>View the Opportunity Gap Analysis</span>
                  <span className="material-symbols-outlined">north_east</span>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="lg:col-span-4 grid grid-rows-2 gap-6">
              <div className="bg-surface-container-high p-8 rounded-2xl flex flex-col justify-center">
                <div className="text-4xl font-black text-primary mb-2">
                  55%
                </div>
                <p className="text-on-surface-variant font-medium">
                  Of global households are currently losing wealth in real
                  terms.
                </p>
              </div>
              <div className="bg-surface-container-high p-8 rounded-2xl flex flex-col justify-center">
                <div className="text-4xl font-black text-primary mb-2">
                  24/7
                </div>
                <p className="text-on-surface-variant font-medium">
                  The market never closes, and neither does our neural network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Fix Section (Editorial Layout) ── */}
      <section className="py-32 px-8 bg-surface relative overflow-visible">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left — Image + Quote */}
          <div className="relative overflow-visible">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="The AI Engine — 3D organic shape"
              className="w-[130%] max-w-none -ml-[15%] -mt-[10%] -mb-[10%]"
              src="/organic_shape_croisette.png"
            />
          </div>

          {/* Right — Solution Copy */}
          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">
              Our Solution
            </span>
            <h2 className="text-6xl font-black tracking-tighter leading-tight mb-8">
              The Fix.
            </h2>
            <div className="space-y-12">
              {/* Feature 1 */}
              <div className="flex gap-6">
                <div className="shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">insights</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    Predictive Rebalancing
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    Our AI doesn&apos;t just react — it anticipates. Using
                    billions of data points, it adjusts your portfolio before the
                    wave hits.
                  </p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="flex gap-6">
                <div className="shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">fluid</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    Effortless Custody
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    We handle the plumbing. Taxes, fees, and transfers are
                    optimized automatically so you can focus on your life.
                  </p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="flex gap-6">
                <div className="shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">
                    verified_user
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    Institutional Grade Security
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    Encryption and oversight protocols that meet the highest
                    regulatory standards of high-net-worth management.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-16">
              <Link href="/login" className="bg-primary text-on-primary px-10 py-5 rounded-md font-bold tracking-tight shadow-xl hover:bg-primary-container transition-all flex items-center gap-3 cursor-pointer">
                START YOUR EVOLUTION
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-inverse-surface w-full py-24 text-surface/40">
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="text-surface font-bold text-2xl tracking-tighter">
              Croisette
            </div>
            <p className="text-sm leading-relaxed">
              Bridging the gap between human intuition and synthetic
              intelligence. Providing high-end editorial wealth management for
              the modern era.
            </p>
            <div className="text-xs uppercase tracking-widest pt-4">
              © 2026 Croisette. High-End Editorial Intelligence.
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:flex gap-16 font-label text-xs uppercase tracking-widest">
            <div className="space-y-4">
              <p className="text-surface font-bold mb-6">Explore</p>
              <a
                className="block hover:text-surface transition-colors"
                href="#"
              >
                Terms
              </a>
              <a
                className="block hover:text-surface transition-colors"
                href="#"
              >
                Privacy
              </a>
            </div>
            <div className="space-y-4">
              <p className="text-surface font-bold mb-6">Company</p>
              <a
                className="block hover:text-surface transition-colors"
                href="#"
              >
                Disclosure
              </a>
              <a
                className="block hover:text-surface transition-colors"
                href="#"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <p className="text-surface font-bold text-xs uppercase tracking-widest mb-6">
              Stay Intelligence Informed
            </p>
            <div className="flex bg-white/5 p-1 rounded-md border border-white/10">
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs w-full px-4 text-white placeholder:text-white/40"
                placeholder="YOUR EMAIL"
                type="email"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-sm text-xs font-bold hover:bg-primary-container transition-all cursor-pointer">
                JOIN
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
