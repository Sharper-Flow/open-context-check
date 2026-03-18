#!/usr/bin/env node

import { loadOpenCodeConfig } from "./config.js";
import { generateReport } from "./report.js";
import { freeEncoder } from "./tokens.js";

// ── Known context limits by model family ───────────────────────────

const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "claude-sonnet-4": 200_000,
  "claude-opus-4": 200_000,
  "claude-haiku-4": 200_000,
  "claude-3.5-sonnet": 200_000,
  "claude-3-opus": 200_000,
  "gpt-4o": 128_000,
  "gpt-4-turbo": 128_000,
  "gpt-4.1": 1_000_000,
  "gpt-5": 1_000_000,
  "o3": 200_000,
  "o4-mini": 200_000,
  "gemini-2.5-pro": 1_000_000,
  "gemini-2.5-flash": 1_000_000,
  "deepseek-r1": 128_000,
  "deepseek-v3": 128_000,
  "qwen-3": 128_000,
};

function guessContextLimit(configText: string): number {
  // Try to find model from config
  const modelMatch = configText.match(/"model"\s*:\s*"([^"]+)"/);
  if (modelMatch) {
    const modelId = modelMatch[1].toLowerCase();
    for (const [pattern, limit] of Object.entries(MODEL_CONTEXT_LIMITS)) {
      if (modelId.includes(pattern)) return limit;
    }
  }
  // Default to 200k (Claude)
  return 200_000;
}

// ── CLI ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  let mode: "compact" | "standard" | "detailed" = "compact";
  let contextLimit: number | null = null;

  for (const arg of args) {
    if (arg === "standard" || arg === "s") mode = "standard";
    else if (arg === "detailed" || arg === "d") mode = "detailed";
    else if (arg === "compact" || arg === "c") mode = "compact";
    else if (arg === "--help" || arg === "-h") {
      console.log(`
open-context-check — Context window usage analyzer for OpenCode

Usage:
  open-context-check [mode] [--limit N]

Modes:
  compact   (default) Quick overview
  standard  Top items per category
  detailed  Full breakdown with recommendations

Options:
  --limit N   Override context window size (default: auto-detect from model)
  --help      Show this help
`);
      process.exit(0);
    } else if (arg === "--limit" || arg === "-l") {
      // next arg is the limit
    } else if (contextLimit === null && /^\d+k?$/i.test(arg)) {
      contextLimit = arg.toLowerCase().endsWith("k")
        ? parseInt(arg) * 1000
        : parseInt(arg);
    }
  }

  // Handle --limit N
  const limitIdx = args.indexOf("--limit");
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    const val = args[limitIdx + 1];
    contextLimit = val.toLowerCase().endsWith("k")
      ? parseInt(val) * 1000
      : parseInt(val);
  }

  try {
    const config = await loadOpenCodeConfig(process.cwd());

    if (contextLimit === null) {
      contextLimit = guessContextLimit(
        config.rawGlobalConfig + config.rawProjectConfig,
      );
    }

    const report = generateReport(config, contextLimit, mode);
    console.log(report);
  } catch (err) {
    console.error("Error analyzing context:", err);
    process.exit(1);
  } finally {
    freeEncoder();
  }
}

main();
