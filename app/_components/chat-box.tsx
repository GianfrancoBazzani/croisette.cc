"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

interface ChatBoxProps {
  agentId: string;
  sessionId: string;
  agentName: string;
}

export function ChatBox({ agentId, sessionId, agentName }: ChatBoxProps) {
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

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => {
          const hasText = message.parts.some(
            (part) => part.type === "text" && part.text
          );
          const showSpinner =
            !isReady && message.role === "assistant" && !hasText;

          return (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%]"
                  : "bg-gray-100 mr-auto max-w-[80%]"
              }`}
            >
              {showSpinner ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-gray-400"
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
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold mb-1">
                    {message.role === "user" ? "You" : agentName}
                  </p>
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={index}>{part.text}</span>
                    ) : null
                  )}
                </>
              )}
            </div>
          );
        })}
        {!isReady &&
          (messages.length === 0 ||
            messages[messages.length - 1].role === "user") && (
            <div className="p-3 rounded-lg bg-gray-100 mr-auto max-w-[80%] flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-gray-400"
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
              <span className="text-gray-400 text-sm">Thinking...</span>
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
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!isReady || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
