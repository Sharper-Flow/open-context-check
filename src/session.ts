import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface LiveContextTelemetry {
  sessionID: string;
  providerID: string;
  modelID: string;
  variant?: string;
  messageID: string;
  completedAt?: number;
  total: number;
  freshInput: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
  reasoning: number;
  completedApiCalls: number;
}

interface ExportedMessage {
  info?: {
    id?: string;
    role?: string;
    providerID?: string;
    modelID?: string;
    variant?: string;
    time?: {
      completed?: number;
    };
    tokens?: {
      total?: number;
      input?: number;
      output?: number;
      reasoning?: number;
      cache?: {
        read?: number;
        write?: number;
      };
    };
  };
}

interface ExportedSession {
  messages?: ExportedMessage[];
}

function parseJsonOutput(text: string): unknown {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("opencode export did not return JSON");
  return JSON.parse(text.slice(start));
}

function numberFrom(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  return match ? Number(match[1]) : 0;
}

function latestTelemetryFromMessages(
  sessionID: string,
  messages: ExportedMessage[],
): LiveContextTelemetry | null {
  const completed = messages.filter((message) => {
    const info = message.info;
    return (
      info?.role === "assistant" &&
      typeof info.tokens?.total === "number" &&
      Boolean(info.time?.completed)
    );
  });

  const latest = completed.at(-1)?.info;
  if (!latest?.tokens) return null;

  return {
    sessionID,
    providerID: latest.providerID ?? "unknown",
    modelID: latest.modelID ?? "unknown",
    variant: latest.variant,
    messageID: latest.id ?? "unknown",
    completedAt: latest.time?.completed,
    total: latest.tokens.total ?? 0,
    freshInput: latest.tokens.input ?? 0,
    cacheRead: latest.tokens.cache?.read ?? 0,
    cacheWrite: latest.tokens.cache?.write ?? 0,
    output: latest.tokens.output ?? 0,
    reasoning: latest.tokens.reasoning ?? 0,
    completedApiCalls: completed.length,
  };
}

function latestTelemetryFromRawExport(
  sessionID: string,
  raw: string,
): LiveContextTelemetry | null {
  const blocks = [
    ...raw.matchAll(
      /"role"\s*:\s*"assistant"[\s\S]*?"tokens"\s*:\s*\{([\s\S]*?)\}\s*,\s*"modelID"\s*:\s*"([^"]*)"[\s\S]*?"providerID"\s*:\s*"([^"]*)"[\s\S]*?"time"\s*:\s*\{[\s\S]*?"completed"\s*:\s*(\d+)[\s\S]*?\}[\s\S]*?"id"\s*:\s*"([^"]*)"/g,
    ),
  ];
  const latest = blocks.at(-1);
  if (!latest) return null;

  const fullMatch = latest[0];
  const tokenBlock = latest[1] ?? "";
  return {
    sessionID,
    providerID: latest[3] ?? "unknown",
    modelID: latest[2] ?? "unknown",
    variant: fullMatch.match(/"variant"\s*:\s*"([^"]*)"/)?.[1],
    messageID: latest[5] ?? "unknown",
    completedAt: Number(latest[4]) || undefined,
    total: numberFrom(tokenBlock, /"total"\s*:\s*(\d+)/),
    freshInput: numberFrom(tokenBlock, /"input"\s*:\s*(\d+)/),
    cacheRead: numberFrom(tokenBlock, /"read"\s*:\s*(\d+)/),
    cacheWrite: numberFrom(tokenBlock, /"write"\s*:\s*(\d+)/),
    output: numberFrom(tokenBlock, /"output"\s*:\s*(\d+)/),
    reasoning: numberFrom(tokenBlock, /"reasoning"\s*:\s*(\d+)/),
    completedApiCalls: blocks.length,
  };
}

export async function resolveSessionID(explicit?: string): Promise<string | null> {
  if (explicit?.trim()) return explicit.trim();
  if (process.env.OPENCODE_SESSION_ID?.trim()) {
    return process.env.OPENCODE_SESSION_ID.trim();
  }

  try {
    const { stdout } = await execFileAsync("opencode", ["session", "list"], {
      maxBuffer: 20 * 1024 * 1024,
    });
    return stdout.match(/ses_[A-Za-z0-9]+/)?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function loadLiveContextTelemetry(
  explicitSessionID?: string,
): Promise<LiveContextTelemetry | null> {
  const sessionID = await resolveSessionID(explicitSessionID);
  if (!sessionID) return null;

  const { stdout } = await execFileAsync(
    "opencode",
    ["export", sessionID, "--sanitize"],
    { maxBuffer: 100 * 1024 * 1024 },
  );
  try {
    const exported = parseJsonOutput(stdout) as ExportedSession;
    return latestTelemetryFromMessages(sessionID, exported.messages ?? []);
  } catch {
    // Exporting the currently-running session can end with an incomplete
    // in-flight assistant message. The completed message telemetry before it
    // is still valid, so recover it directly from the raw export text.
    return latestTelemetryFromRawExport(sessionID, stdout);
  }
}
