"use client";

import type { VerifyStatus } from "@/app/chat/[agentId]/page";

export function VerifyBanner({ status }: { status: VerifyStatus }) {
  if (status.phase === "verifying") {
    return (
      <div className="bg-surface-container-low rounded-xl px-5 py-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-4 w-4 text-on-surface-variant shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Verifying agent integrity
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Checking workspace files against on-chain manifest...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status.phase === "passed") {
    return (
      <div className="bg-surface-container-low rounded-xl px-5 py-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-[#1a7a3a] flex items-center justify-center shrink-0">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Integrity verified
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {status.onChainOk === true
                ? "All workspace files match the on-chain manifest."
                : status.onChainOk === null
                  ? "Off-chain verification passed. On-chain check not configured."
                  : "Off-chain verification passed."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed
  const allAffected = [
    ...status.tampered.map((f) => `${f} (tampered)`),
    ...status.missing.map((f) => `${f} (missing)`),
    ...status.onChainFailed
      .filter(
        (f) => !status.tampered.includes(f) && !status.missing.includes(f)
      )
      .map((f) => `${f} (on-chain mismatch)`),
  ];

  return (
    <div className="bg-error-container rounded-xl px-5 py-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 rounded-full bg-error flex items-center justify-center shrink-0 mt-0.5">
          <svg
            className="h-3 w-3 text-on-error"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-on-error-container">
            Integrity check failed
          </p>
          <p className="text-xs text-on-error-container/80 mt-0.5">
            Agent workspace files may have been tampered with since
            registration.
          </p>
          {allAffected.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {allAffected.map((file) => (
                <li
                  key={file}
                  className="text-xs text-on-error-container/70 font-mono"
                >
                  {file}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
