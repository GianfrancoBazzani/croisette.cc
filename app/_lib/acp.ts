import { spawn, type ChildProcess } from "node:child_process";
import { Readable, Writable } from "node:stream";
import {
  ClientSideConnection,
  ndJsonStream,
  PROTOCOL_VERSION,
  type Client,
} from "@agentclientprotocol/sdk";
import { AgentConfig, ACP_DEFAULTS } from "./constants";
import path from "path";

interface ZeroClawEvent {
  content: string;
  sessionId: string;
  type: string;
}

/**
 * Manages a single zeroclaw ACP connection: process, connection, and session.
 */
export class ZeroClawClient {
  private process: ChildProcess | null = null;
  private connection: ClientSideConnection | null = null;
  private acpSessionId: string | null = null;
  private eventHandler: ((event: ZeroClawEvent) => void) | null = null;

  constructor(private agent: AgentConfig) {}

  async ensureConnected(): Promise<void> {
    if (this.connection && this.acpSessionId) return;

    const configDir = path.resolve(process.cwd(), this.agent.configDir);

    this.process = spawn(
      ACP_DEFAULTS.command,
      [
        "acp",
        "--max-sessions",
        String(ACP_DEFAULTS.maxSessions),
        "--session-timeout",
        String(ACP_DEFAULTS.sessionTimeout),
        "--config-dir",
        configDir,
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
      }
    );

    this.process.stderr?.on("data", () => {
      // Silence stderr logs from zeroclaw
    });

    const input = Writable.toWeb(
      this.process.stdin!
    ) as WritableStream<Uint8Array>;
    const output = Readable.toWeb(
      this.process.stdout!
    ) as ReadableStream<Uint8Array>;

    const getEventHandler = () => this.eventHandler;
    const client: Partial<Client> & {
      extNotification?: (method: string, params: unknown) => Promise<void>;
    } = {
      async requestPermission() {
        return {
          outcome: { outcome: "cancelled" as const },
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async sessionUpdate(params: any) {
        // Standard ACP session/update — forward to event handler
        const update = params?.update;
        if (
          update?.sessionUpdate === "agent_message_chunk" &&
          update?.content?.type === "text" &&
          update?.content?.text
        ) {
          getEventHandler()?.({
            content: update.content.text,
            sessionId: params.sessionId ?? "",
            type: "chunk",
          });
        }
      },
      async extNotification(method: string, params: unknown) {
        // Zeroclaw v0.6.8 sends session/event instead of session/update
        if (method === "session/event") {
          const event = params as ZeroClawEvent;
          if (event.type === "chunk" && event.content) {
            getEventHandler()?.(event);
          }
        }
      },
    };

    const stream = ndJsonStream(input, output);
    this.connection = new ClientSideConnection(
      () => client as Client,
      stream
    );

    await this.connection.initialize({
      protocolVersion: PROTOCOL_VERSION,
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        terminal: false,
      },
    });

    const session = await this.connection.newSession({
      cwd: process.cwd(),
      mcpServers: [],
    });

    this.acpSessionId = session.sessionId;
  }

  async prompt(
    text: string,
    onUpdate: (chunk: string) => void
  ): Promise<string> {
    await this.ensureConnected();

    this.eventHandler = (event) => {
      if (event.type === "chunk" && event.content) {
        onUpdate(event.content);
      }
    };

    // zeroclaw v0.6.8 expects prompt as a string, not an array of content blocks.
    // We cast to satisfy the SDK types while sending the format zeroclaw expects.
    await this.connection!.prompt({
      sessionId: this.acpSessionId!,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prompt: text as any,
    });

    this.eventHandler = null;
    return "stop";
  }

  destroy(): void {
    this.process?.kill();
    this.process = null;
    this.connection = null;
    this.acpSessionId = null;
  }
}

