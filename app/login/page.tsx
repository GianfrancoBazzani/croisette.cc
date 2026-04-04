"use client";

import { useState } from "react";
import { signIn, signUp, authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please provide an email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Try to sign in via passkey first
      const { data, error: passkeyError } = await signIn.passkey();
      
      if (passkeyError) {
        // If login fails (user not found, canceled, etc), fallback to automated registration flow
        const generatedName = email.split("@")[0] + "-" + Math.random().toString(36).substring(2, 6);
        const secureRandomPassword = crypto.randomUUID() + crypto.randomUUID();
        
        // 1. Sign up the user anonymously using the email/password provider behind the scenes
        const signUpRes = await signUp.email({
          email,
          name: generatedName,
          password: secureRandomPassword,
        });
        
        if (signUpRes.error) {
          setError(signUpRes.error.message || "Failed to authenticate or create account");
          return;
        }
        
        // 2. Immediately attach a passkey to their new session
        const passkeyRes = await authClient.passkey.addPasskey({
          name: "Primary Device Passkey"
        });
        
        if (passkeyRes.error) {
          setError((passkeyRes.error.message as string) || passkeyRes.error.statusText || "Account created, but failed to register passkey. Please try again from your profile.");
        } else {
          // Successfully created user & passkey, we can redirect or show success
          window.location.href = "/onboarding";
        }
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface">
      {/* Decorative Radial Line Art Background Element */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
        <svg fill="none" height="1200" viewBox="0 0 1200 1200" width="1200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="600" cy="600" r="100" stroke="#32302f" strokeWidth="0.5"></circle>
          <circle cx="600" cy="600" r="200" stroke="#32302f" strokeWidth="0.5"></circle>
          <circle cx="600" cy="600" r="300" stroke="#32302f" strokeWidth="0.5"></circle>
          <circle cx="600" cy="600" r="400" stroke="#32302f" strokeWidth="0.5"></circle>
          <circle cx="600" cy="600" r="500" stroke="#32302f" strokeWidth="0.5"></circle>
          <circle cx="600" cy="600" r="600" stroke="#32302f" strokeWidth="0.5"></circle>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Brand Header - Editorial Anchor */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-inverse-surface tracking-tighter mb-2 font-headline">Alchemist Wealth</h1>
          <p className="text-secondary font-medium tracking-wide uppercase text-[10px]">The Predictive Concierge</p>
        </div>

        {/* Authentication Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-10 md:p-12 transition-transform duration-300 hover:scale-[1.005]">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-inverse-surface tracking-tight mb-3 font-headline">Intelligence Awaits</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Access your bespoke wealth management engine. Effortless precision for the modern capital allocator.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email Input Group */}
            <div className="relative group">
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1 font-label">
                Email Address
              </label>
              <div className="bg-surface-container-high rounded-lg p-0.5 transition-all duration-200 group-focus-within:bg-outline-variant/30">
                <input
                  className="w-full bg-surface-container-high border-none rounded-[calc(0.5rem-2px)] py-3 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary focus:bg-surface-container-highest transition-all outline-none text-sm"
                  placeholder="name@domain.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
               <div className="text-[11px] font-semibold text-error text-center p-2 rounded bg-error-container/20">
                 {error}
               </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col gap-4">
              <button 
                onClick={handleLogin}
                disabled={loading}
                className="gradient-primary text-on-primary font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 group transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-ambient font-label"
              >
                <span>{loading ? "Authenticating..." : "Continue via Passkey"}</span>
                {!loading && (
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">north_east</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Secondary Information */}
        <div className="mt-8 flex justify-center gap-8 px-4">
          <div className="flex items-center gap-2 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="text-[10px] font-medium tracking-wide uppercase">256-Bit Intelligence</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-sm">public</span>
            <span className="text-[10px] font-medium tracking-wide uppercase">Global Strategy</span>
          </div>
        </div>
      </div>

      {/* Branding Element: Asymmetric Image Card */}
      <div className="hidden lg:block absolute bottom-12 right-12 w-64 h-80 z-20 pointer-events-none">
        <div className="relative w-full h-full transform rotate-2">
          <div className="absolute inset-0 bg-inverse-surface rounded-xl overflow-hidden shadow-ambient">
            <img 
                alt="abstract digital art" 
                className="w-full h-full object-cover opacity-60" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0IKly5zCmSbirUDStQ2LdNk8L33RGvSuNCLTcdE_SYlOOfXEpbbmPZYEFVBf7Fkwr36fS3q1_8rcz4MDPh1v6j7N1puqX6NvN1NnOZkkxSZ1gX04O6IUkwbCydDyC0Vtoy4AnYuSgkWmMUZoybZhSnOeL5PBw6yR4LuUyIwur2TNrn8aS5iDryIbzCZpxpj86Vt11iuw8UX4diu9tXlFLnE2T07GziDMcSSLK9q766Hk_UeAsDzE7n8gaWZBt1GJiLsonKp-2vLo"
            />
          </div>
          <div className="absolute -top-4 -left-4 bg-surface-container-lowest p-4 rounded-lg shadow-ambient">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white text-xs font-bold leading-tight tracking-tight">"The best way to predict the future is to architect it."</p>
            <div className="h-0.5 w-8 bg-primary mt-2"></div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none">
        <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">© 2026 Croisette. High-End Editorial Intelligence.</p>
      </footer>
    </main>
  );
}
