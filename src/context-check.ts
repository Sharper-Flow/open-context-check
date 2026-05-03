#!/usr/bin/env node

import { loadOpenCodeConfig } from "./config.js";
import { generateLiveReport } from "./report.js";
import { loadLiveContextTelemetry } from "./session.js";
import { freeEncoder } from "./tokens.js";

// ── Known context limits by model family ───────────────────────────

const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "gpt-5.5": 200_000,
  "gpt-5.2": 272_000,
  "gpt-5.1": 272_000,
  "claude-sonnet-4": 200_000,
  "claude-opus-4": 200_000,
  "claude-haiku-4": 200_000,
  "claude-3.5-sonnet": 200_000,
  "claude-3-opus": 200_000,
  "gpt-4o": 128_000,
  "gpt-4-turbo": 128_000,
  "gpt-4.1": 1_000_000,
  "gpt-5": 200_000,
  "o3": 200_000,
  "o4-mini": 200_000,
  "gemini-2.5-pro": 1_000_000,
  "gemini-2.5-flash": 1_000_000,
  "deepseek-r1": 128_000,
  "deepseek-v3": 128_000,
  "qwen-3": 128_000,
};

function findConfiguredContextLimit(
  configText: string,
  modelID?: string,
): number | null {
  if (!modelID) return null;
  const escaped = modelID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = configText.match(
    new RegExp(
      `"${escaped}"\\s*:\\s*\\{[\\s\\S]*?"limit"\\s*:\\s*\\{[\\s\\S]*?"context"\\s*:\\s*(\\d+)`,
    ),
  );
  return match ? Number(match[1]) : null;
}

function guessContextLimit(configText: string, modelID?: string): number {
  const configured = findConfiguredContextLimit(configText, modelID);
  if (configured) return configured;

  if (modelID) {
    const lowerModelID = modelID.toLowerCase();
    for (const [pattern, limit] of Object.entries(MODEL_CONTEXT_LIMITS)) {
      if (lowerModelID.includes(pattern)) return limit;
    }
  }

  // Try to find model from config
  const modelMatch = configText.match(/"model"\s*:\s*"([^"]+)"/);
  if (modelMatch) {
    const modelId = modelMatch[1].toLowerCase();
    for (const [pattern, limit] of Object.entries(MODEL_CONTEXT_LIMITS)) {
      if (modelId.includes(pattern)) return limit;
    }
  }
  // Default to 200k (common OpenCode high-context baseline)
  return 200_000;
}

// ── CLI ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  let mode: "compact" | "standard" | "detailed" = "compact";
  let contextLimit: number | null = null;
  let sessionID: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "standard" || arg === "s") mode = "standard";
    else if (arg === "detailed" || arg === "d") mode = "detailed";
    else if (arg === "compact" || arg === "c") mode = "compact";
    else if (arg === "--static" || arg === "--with-static") {
      console.error(
        `Unsupported option ${arg}: static estimates were removed; use live /context output instead.`,
      );
      process.exit(1);
    }
    else if (arg === "--session") {
      sessionID = args[i + 1];
      i++;
    }
    else if (arg === "--help" || arg === "-h") {
      console.log(`
open-context-check — Context window usage analyzer for OpenCode

Usage:
  open-context-check [mode] [--session ID] [--limit N]

Modes:
  compact   (default) Live context overview
  standard  Live overview with session details
  detailed  Live overview with session details

Options:
  --session ID     Analyze a specific OpenCode session
  --limit N        Override context window size (default: auto-detect from model)
  --help           Show this help
`);
      process.exit(0);
    } else if (arg === "--limit" || arg === "-l") {
      const val = args[i + 1];
      if (val) {
        contextLimit = val.toLowerCase().endsWith("k")
          ? parseInt(val) * 1000
          : parseInt(val);
        i++;
      }
    } else if (contextLimit === null && /^\d+k?$/i.test(arg)) {
      contextLimit = arg.toLowerCase().endsWith("k")
        ? parseInt(arg) * 1000
        : parseInt(arg);
    }
  }

  try {
    const config = await loadOpenCodeConfig(process.cwd());
    const configText = config.rawGlobalConfig + config.rawProjectConfig;

    const telemetry = await loadLiveContextTelemetry(sessionID);
    if (!telemetry) {
      console.error(
        "No live session telemetry found. OpenCode export has no completed assistant API call for this session.",
      );
      process.exit(1);
    }

    const limit = contextLimit ?? guessContextLimit(configText, telemetry.modelID);
    console.log(generateLiveReport(telemetry, limit, mode));
  } catch (err) {
    console.error("Error analyzing context:", err);
    process.exit(1);
  } finally {
    freeEncoder();
  }
}

main();
