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
