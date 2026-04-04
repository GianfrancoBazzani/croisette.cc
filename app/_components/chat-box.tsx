"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBoxProps {
  agentId: string;
  sessionId: string;
  agentName: string;
}

interface ParsedMessage {
  body: string;
  options: { label: string; text: string }[];
}

function parseMessageWithOptions(text: string): ParsedMessage {
  const lines = text.split("\n");

  // Match both "A) Option" and "- Option" formats
  const letterPattern = /^([A-Z])\)\s*(.+)$/;
  const dashPattern = /^-\s+(.+)$/;

  // Find the last contiguous group of option lines
  // (agent may list multiple question groups; we want the final one)
  let lastGroupStart = -1;
  let lastGroupEnd = -1;
  let currentGroupStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const isOption = letterPattern.test(trimmed) || dashPattern.test(trimmed);

    if (isOption) {
      if (currentGroupStart === -1) currentGroupStart = i;
      lastGroupEnd = i;
    } else {
      if (currentGroupStart !== -1) {
        lastGroupStart = currentGroupStart;
        lastGroupEnd = i - 1;
      }
      currentGroupStart = -1;
    }
  }
  // Handle case where options go to the end of the message
  if (currentGroupStart !== -1) {
    lastGroupStart = currentGroupStart;
  }

  if (lastGroupStart === -1) {
    return { body: text, options: [] };
  }

  // Extract options from the last group
  const options: { label: string; text: string }[] = [];
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let labelIndex = 0;

  for (let i = lastGroupStart; i <= lastGroupEnd; i++) {
    const trimmed = lines[i].trim();
    const letterMatch = trimmed.match(letterPattern);
    const dashMatch = trimmed.match(dashPattern);

    if (letterMatch) {
      options.push({ label: letterMatch[1], text: letterMatch[2] });
      labelIndex++;
    } else if (dashMatch) {
      options.push({ label: labels[labelIndex] || String(labelIndex + 1), text: dashMatch[1] });
      labelIndex++;
    }
  }

  if (options.length < 2) {
    return { body: text, options: [] };
  }

  // Body is everything except the last option group
  const bodyLines = [
    ...lines.slice(0, lastGroupStart),
    ...lines.slice(lastGroupEnd + 1),
  ];
  const body = bodyLines.join("\n").trimEnd();
  return { body, options };
}

export function ChatBox({ agentId, sessionId, agentName }: ChatBoxProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat/${agentId}`,
      body: { sessionId },
    }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isReady = status === "ready";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const handleOptionClick = (label: string, text: string) => {
    if (!isReady) return;
    sendMessage({ text: `${label}) ${text}` });
  };

  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-surface">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-inverse-surface">
          {agentName}
        </h1>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 space-y-6">
        {messages.map((message, msgIndex) => {
          const hasText = message.parts.some(
            (part) => part.type === "text" && part.text
          );
          const showSpinner =
            !isReady && message.role === "assistant" && !hasText;

          const fullText = message.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("");

          const isLastAssistant = msgIndex === lastAssistantIndex;
          const parsed =
            message.role === "assistant"
              ? parseMessageWithOptions(fullText)
              : null;
          const isInteractive = isLastAssistant && isReady;

          const displayOptions = parsed?.options ?? [];

          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="bg-surface-container-low rounded-xl px-5 py-3 max-w-[80%]">
                  <p className="text-sm font-semibold text-on-surface-variant mb-1">
                    You
                  </p>
                  <p className="text-on-surface leading-relaxed">{fullText}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="max-w-[90%]">
              {showSpinner ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-on-surface-variant text-sm">
                    Thinking...
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                    {agentName}
                  </p>
                  <div className="text-on-surface leading-relaxed prose prose-sm max-w-none prose-headings:text-inverse-surface prose-headings:tracking-tight prose-strong:text-on-surface prose-p:text-on-surface prose-li:text-on-surface">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed?.body || fullText}</ReactMarkdown>
                  </div>

                  {displayOptions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {displayOptions.map((option) => (
                        <button
                          key={option.label}
                          disabled={!isInteractive}
                          onClick={() =>
                            handleOptionClick(option.label, option.text)
                          }
                          className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200 ${
                            isInteractive
                              ? "bg-surface-container-low hover:bg-surface-container-high hover:scale-[1.02] cursor-pointer active:scale-[0.98]"
                              : "bg-surface-container-low opacity-60 cursor-default"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                              isInteractive
                                ? "bg-surface-container-highest text-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="text-on-surface text-sm leading-snug">
                            {option.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {!isReady &&
          (messages.length === 0 ||
            messages[messages.length - 1].role === "user") && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-on-surface-variant text-sm">
                Thinking...
              </span>
            </div>
          )}

        <div className="h-4" />
      </div>

      <div className="px-6 py-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && isReady) {
              sendMessage({ text: input });
              setInput("");
            }
          }}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isReady}
            placeholder="Type your answer..."
            className="flex-1 bg-surface-container-high rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <button
            type="submit"
            disabled={!isReady || !input.trim()}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-3.5 rounded-md font-semibold text-sm disabled:opacity-40 hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center gap-2"
          >
            Send
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
