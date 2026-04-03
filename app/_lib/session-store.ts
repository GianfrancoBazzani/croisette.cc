import type { ZeroClawClient } from "./acp";
import { ACP_DEFAULTS } from "./constants";

interface Session {
  client: ZeroClawClient;
  lastAccessed: number;
}

const sessions = new Map<string, Session>();

export function getSession(sessionId: string): Session | undefined {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastAccessed = Date.now();
  }
  return session;
}

export function setSession(sessionId: string, client: ZeroClawClient): void {
  sessions.set(sessionId, { client, lastAccessed: Date.now() });
}

function cleanupExpiredSessions(): void {
  const now = Date.now();
  const timeoutMs = ACP_DEFAULTS.sessionTimeout * 1000;
  for (const [id, session] of sessions) {
    if (now - session.lastAccessed > timeoutMs) {
      session.client.destroy();
      sessions.delete(id);
    }
  }
}

setInterval(cleanupExpiredSessions, 60_000);
