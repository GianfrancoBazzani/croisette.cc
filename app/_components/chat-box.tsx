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
    console.log("[chat-box] message metadata:", JSON.stringify(meta));
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
                    ? "bg-primary text-on-primary ml-auto max-w-[70%] w-fit"
                    : "bg-surface-container-low text-on-surface mr-auto max-w-[85%] w-fit"
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
            <div className="px-4 py-3 rounded-xl bg-surface-container-low mr-auto max-w-[85%] w-fit flex items-center gap-2">
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
