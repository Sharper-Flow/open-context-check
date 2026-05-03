import type { LiveContextTelemetry } from "./session.js";
import { formatTokens, pct } from "./tokens.js";

const BAR_WIDTH = 30;
const FILLED = "\u2593"; // ▓
const EMPTY = "\u2591"; // ░

function bar(fraction: number): string {
  const filled = Math.round(fraction * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  return FILLED.repeat(filled) + EMPTY.repeat(empty);
}

export function generateLiveReport(
  telemetry: LiveContextTelemetry,
  contextLimit: number,
  mode: "compact" | "standard" | "detailed" = "compact",
): string {
  const lines: string[] = [];
  const usageFraction = telemetry.total / contextLimit;
  const freeSpace = Math.max(0, contextLimit - telemetry.total);
  const completedAt = telemetry.completedAt
    ? new Date(telemetry.completedAt).toISOString()
    : "unknown";
  const model = `${telemetry.providerID}/${telemetry.modelID}${telemetry.variant ? ` (${telemetry.variant})` : ""}`;

  lines.push("");
  lines.push(`  ${bar(usageFraction)}  Context Usage (live)`);
  lines.push(
    `  ${" ".repeat(BAR_WIDTH)}  ${formatTokens(telemetry.total)}/${formatTokens(contextLimit)} tokens (${pct(telemetry.total, contextLimit)})`,
  );
  lines.push(
    `  ${" ".repeat(BAR_WIDTH)}  from opencode export latest API call`,
  );
  lines.push("");

  const maxLabelLen = "Completed API calls".length;
  const rows = [
    ["Fresh input", telemetry.freshInput],
    ["Cache read", telemetry.cacheRead],
    ["Cache write", telemetry.cacheWrite],
    ["Output", telemetry.output],
    ["Reasoning", telemetry.reasoning],
    ["Free space", freeSpace],
  ] as const;

  for (const [label, tokens] of rows) {
    lines.push(
      `  ${bar(tokens / contextLimit)}  ${label.padEnd(maxLabelLen)}  ${formatTokens(tokens).padStart(7)} (${pct(tokens, contextLimit)})`,
    );
  }

  if (mode === "standard" || mode === "detailed") {
    lines.push("");
    lines.push(`  Session: ${telemetry.sessionID}`);
    lines.push(`  Model: ${model}`);
    lines.push(`  Latest call: ${completedAt}`);
    lines.push(`  Message: ${telemetry.messageID}`);
    lines.push(`  Completed API calls: ${telemetry.completedApiCalls}`);
  }

  lines.push("");
  return lines.join("\n");
}
