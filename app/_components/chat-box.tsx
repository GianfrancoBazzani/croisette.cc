"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import type { VerifyStatus } from "@/app/chat/[agentId]/page";
import { VerifyBanner } from "@/app/_components/verify-banner";

/**
 * Split a message into separate bubble segments:
 * - Paragraphs separated by blank lines become individual bubbles.
 * - Sentences ending with "?" are extracted as their own bubble.
 */
function splitIntoBubbles(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const bubbles: string[] = [];

  for (const para of paragraphs) {
    const parts = para.split(/(?<=\?)\s+/);
    let nonQuestion = "";

    for (const part of parts) {
      if (part.trimEnd().endsWith("?")) {
        if (nonQuestion.trim()) {
          bubbles.push(nonQuestion.trim());
          nonQuestion = "";
        }
        bubbles.push(part.trim());
      } else {
        nonQuestion += (nonQuestion ? " " : "") + part;
      }
    }
    if (nonQuestion.trim()) {
      bubbles.push(nonQuestion.trim());
    }
  }

  return bubbles.length > 0 ? bubbles : [text];
}

interface ChatBoxProps {
  agentId: string;
  sessionId: string;
  agentName: string;
  verifyStatus: VerifyStatus;
}

export function ChatBox({
  agentId,
  sessionId,
  agentName,
  verifyStatus,
}: ChatBoxProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat/${agentId}`,
      body: { sessionId },
    }),
  });
  const [input, setInput] = useState("");

  const isReady = status === "ready";

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">{agentName}</h1>

      <VerifyBanner status={verifyStatus} />

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 mt-4">
        {messages.map((message) => {
          const hasText = message.parts.some(
            (part) => part.type === "text" && part.text
          );
          const showSpinner =
            !isReady && message.role === "assistant" && !hasText;

          const isUser = message.role === "user";
          const fullText = message.parts
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("");
          const bubbles = splitIntoBubbles(fullText);

          return (
            <div
              key={message.id}
              className={`flex flex-col gap-3 ${isUser ? "items-end" : "items-start"}`}
            >
              <p className="text-xs font-semibold mb-0.5">
                {isUser ? "You" : agentName}
              </p>
              {showSpinner ? (
                <div className={`p-3 rounded-lg ${isUser ? "bg-surface-container-high max-w-[80%]" : "bg-surface-container-low max-w-[80%]"}`}>
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-on-surface-variant"
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
                    <span className="text-on-surface-variant text-sm">Thinking...</span>
                  </div>
                </div>
              ) : (
                bubbles.map((bubble, bi) => (
                  <div
                    key={bi}
                    className={`p-3 rounded-lg ${isUser ? "bg-surface-container-high max-w-[80%]" : "bg-surface-container-low max-w-[80%]"}`}
                  >
                    <span>{bubble}</span>
                  </div>
                ))
              )}
            </div>
          );
        })}
        {!isReady &&
          (messages.length === 0 ||
            messages[messages.length - 1].role === "user") && (
            <div className="p-3 rounded-lg bg-surface-container-low mr-auto max-w-[80%] flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-on-surface-variant"
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
              <span className="text-on-surface-variant text-sm">
                Thinking...
              </span>
            </div>
          )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && isReady) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isReady}
          placeholder="Type a message..."
          className="flex-1 bg-surface-container-high rounded-lg px-4 py-2 focus:outline-none focus:bg-surface-container-highest text-on-surface placeholder:text-on-surface-variant/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isReady || !input.trim()}
          className="gradient-primary text-on-primary px-6 py-2 rounded-lg disabled:opacity-50 hover:scale-[1.02] transition-transform"
        >
          Send
        </button>
      </form>
    </div>
  );
}
