# Portfolio Chat Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/chat/[agentId]` page into a split-panel layout with agent-driven clickable options on the left and a progressive summary panel with pie chart on the right.

**Architecture:** The zeroclaw agent returns structured JSON envelopes. The API route buffers the full response, parses it, and sends text + metadata to the frontend. The frontend renders text as chat bubbles, options as clickable pills, and metadata as a progressively-revealed summary panel with an SVG donut chart at the end.

**Tech Stack:** Next.js 16, React 19, AI SDK v6 (`@ai-sdk/react`), Tailwind CSS v4, SVG (chart), zeroclaw ACP (agent)

**Design spec:** `docs/superpowers/specs/2026-04-04-portfolio-chat-redesign-design.md`

**Note on testing:** This codebase has no test runner configured (no vitest/jest in package.json). Tasks include manual verification steps. A testing infrastructure task is out of scope for this feature.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `app/_lib/agent-response.ts` (create) | TypeScript types and JSON parsing utility for agent response envelope |
| `app/_components/option-pills.tsx` (create) | Clickable pill-shaped option buttons |
| `app/_components/allocation-chart.tsx` (create) | SVG donut chart with legend |
| `app/_components/summary-panel.tsx` (create) | Right-side dark panel: profile facts, insight, chart |
| `app/api/chat/[agentId]/route.ts` (modify) | Buffer agent response, parse JSON envelope, send text + metadata |
| `app/_components/chat-box.tsx` (modify) | Refactor: render structured messages, option pills, new styling |
| `app/chat/[agentId]/page.tsx` (modify) | Split layout, state management for profile/options/allocation |
| `.zeroclaw/agents/portfolio-builder-deepseek/workspace/skills/portfolio-allocation/SKILL.md` (modify) | Add JSON response format instructions |

---

### Task 1: Agent Response Types and Parser

**Files:**
- Create: `app/_lib/agent-response.ts`

- [ ] **Step 1: Create the types and parser module**

```typescript
// app/_lib/agent-response.ts

export interface AgentResponseEnvelope {
  text: string;
  options?: string[];
  profile_update?: Record<string, string>;
  insight?: string;
  allocation?: Array<{ asset: string; pct: number }>;
}

/**
 * Parse a raw agent response string into a structured envelope.
 * If the response is not valid JSON or missing `text`, falls back to treating
 * the entire string as plain text with no structured data.
 */
export function parseAgentResponse(raw: string): AgentResponseEnvelope {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object" && parsed !== null && typeof parsed.text === "string") {
      return {
        text: parsed.text,
        options: Array.isArray(parsed.options) ? parsed.options : undefined,
        profile_update:
          typeof parsed.profile_update === "object" && parsed.profile_update !== null
            ? parsed.profile_update
            : undefined,
        insight: typeof parsed.insight === "string" ? parsed.insight : undefined,
        allocation: Array.isArray(parsed.allocation) ? parsed.allocation : undefined,
      };
    }
  } catch {
    // Not JSON — fall through to plain text
  }
  return { text: trimmed };
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `agent-response.ts`

- [ ] **Step 3: Commit**

```bash
git add app/_lib/agent-response.ts
git commit -m "feat: add agent response envelope types and parser"
```

---

### Task 2: Update API Route to Buffer and Parse

**Files:**
- Modify: `app/api/chat/[agentId]/route.ts`
- Depends on: Task 1

- [ ] **Step 1: Rewrite the route to buffer the full response and send structured data**

Replace the entire contents of `app/api/chat/[agentId]/route.ts` with:

```typescript
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/app/_lib/constants";
import { getSession, setSession } from "@/app/_lib/session-store";
import { ZeroClawClient } from "@/app/_lib/acp";
import { parseAgentResponse } from "@/app/_lib/agent-response";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const agent = AGENTS[agentId];

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const body = await req.json();
  const { messages, sessionId }: { messages: UIMessage[]; sessionId: string } =
    body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required" },
      { status: 400 }
    );
  }

  let session = getSession(sessionId);
  if (!session) {
    const client = new ZeroClawClient(agent);
    setSession(sessionId, client);
    session = getSession(sessionId)!;
  }

  // Build prompt string from messages
  const promptParts: string[] = [];
  for (const msg of messages) {
    const prefix = msg.role === "user" ? "" : `[${msg.role}]: `;
    for (const part of msg.parts) {
      if (part.type === "text") {
        promptParts.push(`${prefix}${part.text}`);
      }
    }
  }
  const prompt = promptParts.join("\n\n");

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Buffer the full response from the agent
      let fullResponse = "";
      await session!.client.prompt(prompt, (chunk) => {
        fullResponse += chunk;
      });

      // Parse the JSON envelope
      const envelope = parseAgentResponse(fullResponse);

      // Send structured message with metadata
      writer.write({
        type: "start",
        messageMetadata: {
          options: envelope.options ?? null,
          profile_update: envelope.profile_update ?? null,
          insight: envelope.insight ?? null,
          allocation: envelope.allocation ?? null,
        },
      });

      const textId = crypto.randomUUID();
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: envelope.text });
      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

Key changes from the original:
- Buffers full response instead of streaming chunks
- Parses JSON envelope via `parseAgentResponse`
- Sends `messageMetadata` on the `start` chunk containing options, profile_update, insight, allocation
- Text is sent as a single delta (appears instantly after buffering)

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `route.ts`

- [ ] **Step 3: Commit**

```bash
git add app/api/chat/[agentId]/route.ts
git commit -m "feat: buffer agent response and send structured metadata"
```

---

### Task 3: Option Pills Component

**Files:**
- Create: `app/_components/option-pills.tsx`

- [ ] **Step 1: Create the option pills component**

```tsx
// app/_components/option-pills.tsx
"use client";

interface OptionPillsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function OptionPills({ options, onSelect, disabled }: OptionPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium rounded-full
            bg-white text-on-surface
            hover:bg-primary hover:text-on-primary
            active:bg-primary active:text-on-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors cursor-pointer"
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/_components/option-pills.tsx
git commit -m "feat: add clickable option pills component"
```

---

### Task 4: Allocation Chart Component

**Files:**
- Create: `app/_components/allocation-chart.tsx`

- [ ] **Step 1: Create the SVG donut chart component**

```tsx
// app/_components/allocation-chart.tsx
"use client";

interface AllocationItem {
  asset: string;
  pct: number;
}

interface AllocationChartProps {
  allocation: AllocationItem[];
}

const SLICE_COLORS = [
  "#af1c57",                  // Data Pink — largest
  "#d4956a",                  // Warm tan — second
  "rgba(254,248,246,0.35)",   // Muted surface — third
  "#6b4c3b",                  // Dark warm — fourth (if needed)
  "#c47a8a",                  // Soft rose — fifth (if needed)
];

export function AllocationChart({ allocation }: AllocationChartProps) {
  const RADIUS = 14;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Sort descending by pct so largest slice gets the primary color
  const sorted = [...allocation].sort((a, b) => b.pct - a.pct);

  // Calculate dash offsets
  let cumulativeOffset = 0;
  const slices = sorted.map((item, i) => {
    const dashLength = CIRCUMFERENCE * (item.pct / 100);
    const offset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return {
      ...item,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      dashLength,
      offset,
    };
  });

  return (
    <div className="animate-fade-in-up">
      {/* Donut chart */}
      <div className="flex justify-center mb-5">
        <div className="relative w-[180px] h-[180px]">
          <svg
            viewBox="0 0 36 36"
            className="w-[180px] h-[180px]"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Background track */}
            <circle
              cx="18" cy="18" r={RADIUS}
              fill="none"
              stroke="rgba(254,248,246,0.05)"
              strokeWidth="4"
            />
            {/* Slices */}
            {slices.map((slice) => (
              <circle
                key={slice.asset}
                cx="18" cy="18" r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth="4"
                strokeDasharray={`${slice.dashLength} ${CIRCUMFERENCE}`}
                strokeDashoffset={slice.offset}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-xl font-bold tracking-tight text-surface">
              100%
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(254,248,246,0.4)" }}>
              Allocated
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5">
        {slices.map((slice) => (
          <div key={slice.asset} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: slice.color }}
              />
              <span className="text-sm" style={{ color: "rgba(254,248,246,0.75)" }}>
                {slice.asset}
              </span>
            </div>
            <span className="text-sm font-semibold text-surface">
              {slice.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the fade-in-up animation to globals.css**

Add the following at the end of `app/globals.css`, inside the existing `@theme` block or after it:

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/_components/allocation-chart.tsx app/globals.css
git commit -m "feat: add SVG donut allocation chart component"
```

---

### Task 5: Summary Panel Component

**Files:**
- Create: `app/_components/summary-panel.tsx`
- Depends on: Task 4

- [ ] **Step 1: Create the summary panel component**

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/_components/summary-panel.tsx
git commit -m "feat: add summary panel with progressive profile and insights"
```

---

### Task 6: Refactor Chat Box for Structured Messages

**Files:**
- Modify: `app/_components/chat-box.tsx`
- Depends on: Tasks 2, 3

- [ ] **Step 1: Rewrite chat-box.tsx with structured message rendering and option pills**

Replace the entire contents of `app/_components/chat-box.tsx` with:

```tsx
// app/_components/chat-box.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback } from "react";
import { OptionPills } from "./option-pills";

interface AgentMetadata {
  options: string[] | null;
  profile_update: Record<string, string> | null;
  insight: string | null;
  allocation: Array<{ asset: string; pct: number }> | null;
}

interface ChatBoxProps {
  agentId: string;
  sessionId: string;
  agentName: string;
  onMetadata?: (metadata: AgentMetadata) => void;
}

export function ChatBox({
  agentId,
  sessionId,
  agentName,
  onMetadata,
}: ChatBoxProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat/${agentId}`,
      body: { sessionId },
    }),
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedIdRef = useRef<string | null>(null);

  const isReady = status === "ready";

  // Notify parent of metadata when a new assistant message completes
  useEffect(() => {
    if (!onMetadata || !isReady || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant") return;
    if (lastMsg.id === lastProcessedIdRef.current) return;
    lastProcessedIdRef.current = lastMsg.id;

    const meta = lastMsg.metadata as AgentMetadata | undefined;
    if (meta) {
      onMetadata(meta);
    }
  }, [messages, isReady, onMetadata]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim() || !isReady) return;
      sendMessage({ text });
      setInput("");
    },
    [isReady, sendMessage]
  );

  // Find the latest assistant message's options (only if it's the last message)
  const lastMessage = messages[messages.length - 1];
  const activeOptions =
    isReady &&
    lastMessage?.role === "assistant" &&
    (lastMessage.metadata as AgentMetadata | undefined)?.options
      ? (lastMessage.metadata as AgentMetadata).options!
      : null;

  return (
    <div className="flex flex-col h-full flex-1 bg-surface">
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div
          className="text-xs uppercase font-semibold"
          style={{ letterSpacing: "0.08em", color: "#8f4c35" }}
        >
          {agentName}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => {
          const hasText = message.parts.some(
            (part) => part.type === "text" && part.text
          );
          const showSpinner =
            !isReady && message.role === "assistant" && !hasText;

          return (
            <div key={message.id}>
              <div
                className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-primary text-on-primary ml-auto max-w-[70%]"
                    : "bg-surface-container-low text-on-surface mr-auto max-w-[85%]"
                }`}
              >
                {showSpinner ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-outline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span className="text-outline text-sm">Thinking...</span>
                  </div>
                ) : (
                  <>
                    {message.role === "assistant" && (
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: "#8f4c35" }}
                      >
                        Croisette
                      </p>
                    )}
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <span key={index}>{part.text}</span>
                      ) : null
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Spinner when waiting for first response or after user sends */}
        {!isReady &&
          (messages.length === 0 ||
            messages[messages.length - 1].role === "user") && (
            <div className="px-4 py-3 rounded-xl bg-surface-container-low mr-auto max-w-[85%] flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-outline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-outline text-sm">Thinking...</span>
            </div>
          )}

        {/* Option pills for the latest agent message */}
        {activeOptions && (
          <OptionPills
            options={activeOptions}
            onSelect={handleSend}
            disabled={!isReady}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2 items-center"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isReady}
            placeholder={activeOptions ? "Or type your own answer..." : "Type a message..."}
            className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface
              placeholder:text-outline focus:outline-none"
          />
          <button
            type="submit"
            disabled={!isReady || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center
              text-on-primary disabled:opacity-50 cursor-pointer shrink-0"
            style={{
              background: "linear-gradient(135deg, #af1c57, #8f4c35)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
```

Key changes from the original:
- New `onMetadata` callback prop — fires when an assistant message completes with metadata
- Renders `OptionPills` below the latest assistant message when `options` are present
- Croisette design system styling (surface backgrounds, primary user bubbles, no borders)
- Auto-scrolls to bottom on new messages
- Input placeholder changes when options are available

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/_components/chat-box.tsx
git commit -m "feat: refactor chat box with structured messages and option pills"
```

---

### Task 7: Wire Up the Split Layout in ChatPage

**Files:**
- Modify: `app/chat/[agentId]/page.tsx`
- Depends on: Tasks 5, 6

- [ ] **Step 1: Rewrite the chat page with split layout and state management**

Replace the entire contents of `app/chat/[agentId]/page.tsx` with:

```tsx
// app/chat/[agentId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { AGENTS } from "@/app/_lib/constants";
import { ChatBox } from "@/app/_components/chat-box";
import { SummaryPanel } from "@/app/_components/summary-panel";
import { labelForKey } from "@/app/_components/summary-panel";
import Link from "next/link";

interface ProfileFact {
  key: string;
  label: string;
  value: string;
}

interface AgentMetadata {
  options: string[] | null;
  profile_update: Record<string, string> | null;
  insight: string | null;
  allocation: Array<{ asset: string; pct: number }> | null;
}

export default function ChatPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const agent = AGENTS[agentId];
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const [profileFacts, setProfileFacts] = useState<ProfileFact[]>([]);
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<
    Array<{ asset: string; pct: number }> | null
  >(null);

  const handleMetadata = useCallback((metadata: AgentMetadata) => {
    if (metadata.profile_update) {
      setProfileFacts((prev) => {
        const updated = [...prev];
        for (const [key, value] of Object.entries(metadata.profile_update!)) {
          const existing = updated.findIndex((f) => f.key === key);
          if (existing >= 0) {
            updated[existing] = { key, label: labelForKey(key), value };
          } else {
            updated.push({ key, label: labelForKey(key), value });
          }
        }
        return updated;
      });
    }
    if (metadata.insight) {
      setCurrentInsight(metadata.insight);
    }
    if (metadata.allocation) {
      setAllocation(metadata.allocation);
    }
  }, []);

  if (!agent) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-xl font-bold mb-4">Agent not found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to agents
        </Link>
      </main>
    );
  }

  return (
    <div className="flex h-screen">
      <ChatBox
        agentId={agent.slug}
        sessionId={sessionId}
        agentName={agent.name}
        onMetadata={handleMetadata}
      />
      <SummaryPanel
        profileFacts={profileFacts}
        currentInsight={currentInsight}
        allocation={allocation}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Run dev server and manually verify the layout**

Run: `npm run dev`

Open `http://localhost:3000/chat/portfolio-builder-deepseek` in a browser. Verify:
- Split layout: chat on left, dark summary panel on right
- Agent sends first message (may be plain text if SKILL.md not yet updated)
- Summary panel shows "Your profile will build up as we talk."

- [ ] **Step 4: Commit**

```bash
git add app/chat/[agentId]/page.tsx
git commit -m "feat: wire up split layout with summary panel state management"
```

---

### Task 8: Update Agent SKILL.md for JSON Response Format

**Files:**
- Modify: `.zeroclaw/agents/portfolio-builder-deepseek/workspace/skills/portfolio-allocation/SKILL.md`

- [ ] **Step 1: Add the response format instruction block**

Insert the following section right after the `## Conversation Flow` section (after step 9, before `## Risk Profile Assessment`):

```markdown
## Response Format

CRITICAL: Always respond with a single JSON object. Do not include any text outside the JSON object. The JSON must contain these fields:

```json
{
  "text": "your conversational message (always required)",
  "options": ["choice 1", "choice 2"],
  "profile_update": { "key": "value" },
  "insight": "contextual takeaway sentence",
  "allocation": [{ "asset": "Asset Name", "pct": 55 }]
}
```

Field rules:
- `text` — ALWAYS required. Your conversational message to the user.
- `options` — Include when asking a question with predefined choices. Omit for open-ended follow-ups.
- `profile_update` — Include when the user's previous answer resolves a profile fact. Use these keys: `emergency_fund`, `time_horizon`, `risk_tolerance`, `primary_goal`, `strategy`. Value is the user's answer. Omit on your very first message.
- `insight` — Include a brief contextual takeaway from the user's last answer. Omit when there's nothing meaningful to add.
- `allocation` — Include ONLY in your final response with the recommended portfolio. Array of `{ "asset": "Display Name (Ticker)", "pct": number }` objects.

Example first message:
```json
{
  "text": "Great to meet you! Before we design your portfolio, do you have an emergency fund covering at least 3-6 months of expenses?",
  "options": ["Yes, I'm covered", "No, not yet", "I'm not sure"]
}
```

Example mid-conversation message:
```json
{
  "text": "With a 15+ year runway, you can ride out market cycles and go after real growth. Now, imagine your portfolio drops 30% in a single month. What's your gut reaction?",
  "options": ["Sell everything", "Sell some", "Wait it out", "Buy more"],
  "profile_update": { "time_horizon": "15+ years" },
  "insight": "A long time horizon opens up growth-heavy allocations — time is your biggest asset."
}
```

Example final message:
```json
{
  "text": "Here's your recommended Growth portfolio. 55% in diversified stocks via OGM tokenized ETFs, 30% in WETH for crypto blue-chip exposure, and 15% in bIB01 short-term Treasuries for stability.",
  "profile_update": { "strategy": "DCA" },
  "insight": "This growth-heavy allocation suits your long horizon and aggressive risk tolerance. DCA smooths out your entry points over time.",
  "allocation": [
    { "asset": "Stocks (OGM)", "pct": 55 },
    { "asset": "WETH", "pct": 30 },
    { "asset": "Cash (bIB01)", "pct": 15 }
  ]
}
```
```

- [ ] **Step 2: Commit**

```bash
git add .zeroclaw/agents/portfolio-builder-deepseek/workspace/skills/portfolio-allocation/SKILL.md
git commit -m "feat: instruct agent to return structured JSON envelope"
```

---

### Task 9: Mobile Responsiveness

**Files:**
- Modify: `app/_components/summary-panel.tsx`
- Modify: `app/chat/[agentId]/page.tsx`

- [ ] **Step 1: Add mobile bottom sheet behavior to the summary panel**

Replace the entire contents of `app/_components/summary-panel.tsx` with:

```tsx
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
  mobileOpen: boolean;
  onMobileClose: () => void;
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

function PanelContent({
  profileFacts,
  currentInsight,
  allocation,
}: Pick<SummaryPanelProps, "profileFacts" | "currentInsight" | "allocation">) {
  const isEmpty = profileFacts.length === 0 && !currentInsight && !allocation;

  return (
    <>
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

      {/* Profile Facts */}
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

      {profileFacts.length > 0 && (
        <div className="h-px" style={{ background: "rgba(254,248,246,0.08)" }} />
      )}

      {/* Insight */}
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

      {/* Allocation Chart */}
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
    </>
  );
}

export function SummaryPanel({
  profileFacts,
  currentInsight,
  allocation,
  mobileOpen,
  onMobileClose,
}: SummaryPanelProps) {
  return (
    <>
      {/* Desktop: fixed sidebar */}
      <div className="hidden md:flex w-[340px] bg-inverse-surface text-surface p-6 flex-col gap-5 overflow-y-auto shrink-0">
        <PanelContent
          profileFacts={profileFacts}
          currentInsight={currentInsight}
          allocation={allocation}
        />
      </div>

      {/* Mobile: bottom sheet overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-inverse-surface text-surface p-6 flex flex-col gap-5 rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            {/* Drag handle */}
            <div className="flex justify-center">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(254,248,246,0.2)" }} />
            </div>
            <PanelContent
              profileFacts={profileFacts}
              currentInsight={currentInsight}
              allocation={allocation}
            />
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Add slide-up animation to globals.css**

Append to `app/globals.css`:

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

- [ ] **Step 3: Update ChatPage to manage mobile sheet state**

Replace the entire contents of `app/chat/[agentId]/page.tsx` with:

```tsx
// app/chat/[agentId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useCallback, useEffect } from "react";
import { AGENTS } from "@/app/_lib/constants";
import { ChatBox } from "@/app/_components/chat-box";
import { SummaryPanel, labelForKey } from "@/app/_components/summary-panel";
import Link from "next/link";

interface ProfileFact {
  key: string;
  label: string;
  value: string;
}

interface AgentMetadata {
  options: string[] | null;
  profile_update: Record<string, string> | null;
  insight: string | null;
  allocation: Array<{ asset: string; pct: number }> | null;
}

export default function ChatPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const agent = AGENTS[agentId];
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const [profileFacts, setProfileFacts] = useState<ProfileFact[]>([]);
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<
    Array<{ asset: string; pct: number }> | null
  >(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Auto-open mobile sheet when allocation arrives
  useEffect(() => {
    if (allocation) {
      setMobileSheetOpen(true);
    }
  }, [allocation]);

  const handleMetadata = useCallback((metadata: AgentMetadata) => {
    if (metadata.profile_update) {
      setProfileFacts((prev) => {
        const updated = [...prev];
        for (const [key, value] of Object.entries(metadata.profile_update!)) {
          const existing = updated.findIndex((f) => f.key === key);
          if (existing >= 0) {
            updated[existing] = { key, label: labelForKey(key), value };
          } else {
            updated.push({ key, label: labelForKey(key), value });
          }
        }
        return updated;
      });
    }
    if (metadata.insight) {
      setCurrentInsight(metadata.insight);
    }
    if (metadata.allocation) {
      setAllocation(metadata.allocation);
    }
  }, []);

  if (!agent) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-xl font-bold mb-4">Agent not found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to agents
        </Link>
      </main>
    );
  }

  const hasContent = profileFacts.length > 0 || currentInsight || allocation;

  return (
    <div className="flex h-screen">
      <ChatBox
        agentId={agent.slug}
        sessionId={sessionId}
        agentName={agent.name}
        onMetadata={handleMetadata}
      />
      <SummaryPanel
        profileFacts={profileFacts}
        currentInsight={currentInsight}
        allocation={allocation}
        mobileOpen={mobileSheetOpen}
        onMobileClose={() => setMobileSheetOpen(false)}
      />

      {/* Mobile: floating "View Profile" button */}
      {hasContent && !mobileSheetOpen && (
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="fixed bottom-20 right-4 z-40 md:hidden
            px-4 py-2.5 rounded-full text-sm font-medium
            text-on-primary cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #af1c57, #8f4c35)",
            boxShadow: "0 4px 12px rgba(175,28,87,0.3)",
          }}
        >
          View Profile
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Manual verification**

Run: `npm run dev`

Desktop (> 768px): Verify split layout with fixed sidebar.
Mobile (resize browser < 768px): Verify sidebar hides, "View Profile" button appears when profile has content, clicking it opens bottom sheet.

- [ ] **Step 6: Commit**

```bash
git add app/_components/summary-panel.tsx app/chat/[agentId]/page.tsx app/globals.css
git commit -m "feat: add mobile responsiveness with bottom sheet summary panel"
```

---

### Task 10: End-to-End Verification

- [ ] **Step 1: Run the full build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors in modified/new files.

- [ ] **Step 3: Manual end-to-end test**

Run: `npm run dev`

Open `http://localhost:3000/chat/portfolio-builder-deepseek`. Walk through a full conversation:

1. Agent asks first question with predefined options → verify pills render
2. Click an option → verify it sends as user message, pills disappear
3. Agent responds with next question → verify new pills, profile fact appears on right panel
4. Continue through all questions → verify insights update, facts accumulate
5. Agent sends final allocation → verify pie chart appears with correct colors and legend
6. Resize to mobile → verify "View Profile" button, bottom sheet, auto-open on allocation

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during e2e verification"
```
