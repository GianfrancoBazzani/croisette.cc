// app/_lib/agent-response.ts

export interface AgentResponseEnvelope {
  text: string;
  options?: string[];
  profile_update?: Record<string, string>;
  insight?: string;
  allocation?: Array<{ asset: string; pct: number }>;
}

function tryParseEnvelope(jsonStr: string): AgentResponseEnvelope | null {
  try {
    const parsed = JSON.parse(jsonStr);
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
    // Not valid JSON
  }
  return null;
}

/**
 * Parse a raw agent response string into a structured envelope.
 * Tries multiple strategies:
 * 1. Direct JSON parse
 * 2. Extract JSON from markdown code blocks (```json ... ```)
 * 3. Extract first JSON object using brace matching
 * Falls back to plain text if nothing works.
 */
export function parseAgentResponse(raw: string): AgentResponseEnvelope {
  const trimmed = raw.trim();

  // Strategy 1: Direct parse
  const direct = tryParseEnvelope(trimmed);
  if (direct) return direct;

  // Strategy 2: JSON in markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    const result = tryParseEnvelope(codeBlockMatch[1].trim());
    if (result) return result;
  }

  // Strategy 3: Find first { ... } that parses as valid JSON with "text" field
  const braceStart = trimmed.indexOf("{");
  if (braceStart >= 0) {
    let depth = 0;
    for (let i = braceStart; i < trimmed.length; i++) {
      if (trimmed[i] === "{") depth++;
      else if (trimmed[i] === "}") depth--;
      if (depth === 0) {
        const candidate = trimmed.slice(braceStart, i + 1);
        const result = tryParseEnvelope(candidate);
        if (result) return result;
        break;
      }
    }
  }

  return { text: trimmed };
}
