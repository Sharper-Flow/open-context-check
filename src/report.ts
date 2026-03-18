import type { OpenCodeConfig } from "./config.js";
import { countTokens, formatTokens, pct } from "./tokens.js";

// ── Known baselines ────────────────────────────────────────────────
// These are rough estimates of OpenCode's built-in system overhead.
// They'll drift as OpenCode evolves — treat as ballpark.

const SYSTEM_PROMPT_TOKENS = 8_500;
const BUILTIN_TOOLS_TOKENS = 15_200;

// ── Bar rendering ──────────────────────────────────────────────────

const BAR_WIDTH = 30;
const FILLED = "\u2593"; // ▓
const EMPTY = "\u2591"; // ░

function bar(fraction: number): string {
  const filled = Math.round(fraction * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  return FILLED.repeat(filled) + EMPTY.repeat(empty);
}

// ── Report generation ──────────────────────────────────────────────

interface CategoryBreakdown {
  label: string;
  tokens: number;
  items: { name: string; tokens: number }[];
}

export function generateReport(
  config: OpenCodeConfig,
  contextLimit: number,
  mode: "compact" | "standard" | "detailed" = "compact",
): string {
  const lines: string[] = [];

  // Calculate token costs per category
  const enabledMcp = config.mcpServers.filter((s) => s.enabled);
  const disabledMcp = config.mcpServers.filter((s) => !s.enabled);

  // MCP: estimate based on config definition size
  // Each MCP tool definition is roughly the JSON config + tool schema overhead
  const mcpCategory: CategoryBreakdown = {
    label: "MCP tools",
    tokens: 0,
    items: enabledMcp.map((s) => {
      // Base overhead per server: name + type + url/command + schema envelope
      const configSize = JSON.stringify(s).length;
      // Each MCP server typically exposes 5-15 tools, each ~200-500 tokens
      // We estimate conservatively from the config definition
      const estimated = countTokens(JSON.stringify(s)) + 800; // base tool overhead
      return { name: s.name, tokens: estimated };
    }),
  };
  mcpCategory.tokens = mcpCategory.items.reduce(
    (sum, i) => sum + i.tokens,
    0,
  );

  // Agents
  const agentCategory: CategoryBreakdown = {
    label: "Custom agents",
    tokens: 0,
    items: config.agents.map((a) => ({
      name: `${a.name} (${a.location})`,
      tokens: countTokens(a.content),
    })),
  };
  agentCategory.tokens = agentCategory.items.reduce(
    (sum, i) => sum + i.tokens,
    0,
  );

  // Instructions
  const instructionCategory: CategoryBreakdown = {
    label: "Instructions",
    tokens: 0,
    items: config.instructions.map((f) => {
      const shortPath = f.path.replace(
        process.env.HOME ?? "/home",
        "~",
      );
      return {
        name: shortPath,
        tokens: countTokens(f.content),
      };
    }),
  };
  instructionCategory.tokens = instructionCategory.items.reduce(
    (sum, i) => sum + i.tokens,
    0,
  );

  // Config files themselves
  const configTokens =
    countTokens(config.rawGlobalConfig) +
    countTokens(config.rawProjectConfig);

  // Totals
  const totalOverhead =
    SYSTEM_PROMPT_TOKENS +
    BUILTIN_TOOLS_TOKENS +
    mcpCategory.tokens +
    agentCategory.tokens +
    instructionCategory.tokens +
    configTokens;

  const freeSpace = Math.max(0, contextLimit - totalOverhead);
  const usageFraction = totalOverhead / contextLimit;

  // ── Header ─────────────────────────────────────────────────────

  lines.push("");
  lines.push(
    `  ${bar(usageFraction)}  Context Usage`,
  );
  lines.push(
    `  ${" ".repeat(BAR_WIDTH)}  ${formatTokens(totalOverhead)}/${formatTokens(contextLimit)} tokens (${pct(totalOverhead, contextLimit)})`,
  );
  lines.push("");

  // ── Category summary ───────────────────────────────────────────

  const categories = [
    {
      label: "System prompt",
      tokens: SYSTEM_PROMPT_TOKENS,
      items: [] as { name: string; tokens: number }[],
    },
    {
      label: "Built-in tools",
      tokens: BUILTIN_TOOLS_TOKENS,
      items: [] as { name: string; tokens: number }[],
    },
    mcpCategory,
    agentCategory,
    instructionCategory,
    {
      label: "Config overhead",
      tokens: configTokens,
      items: [] as { name: string; tokens: number }[],
    },
  ];

  const maxLabelLen = Math.max(...categories.map((c) => c.label.length));

  for (const cat of categories) {
    const catBar = bar(cat.tokens / contextLimit);
    const label = cat.label.padEnd(maxLabelLen);
    lines.push(
      `  ${catBar}  ${label}  ${formatTokens(cat.tokens).padStart(7)} (${pct(cat.tokens, contextLimit)})`,
    );
  }

  // Free space
  const freeBar = bar(freeSpace / contextLimit);
  const freeLabel = "Free space".padEnd(maxLabelLen);
  lines.push(
    `  ${freeBar}  ${freeLabel}  ${formatTokens(freeSpace).padStart(7)} (${pct(freeSpace, contextLimit)})`,
  );

  lines.push("");

  // ── Detailed breakdowns ────────────────────────────────────────

  if (mode === "standard" || mode === "detailed") {
    const maxItems = mode === "detailed" ? Infinity : 5;

    for (const cat of [mcpCategory, agentCategory, instructionCategory]) {
      if (cat.items.length === 0) continue;

      lines.push(`  ${cat.label} (${cat.items.length})`);

      const sorted = [...cat.items].sort((a, b) => b.tokens - a.tokens);
      const shown = sorted.slice(0, maxItems);

      for (const item of shown) {
        lines.push(
          `    \u2514 ${item.name}: ${formatTokens(item.tokens)} tokens`,
        );
      }

      if (sorted.length > maxItems) {
        lines.push(
          `    ... and ${sorted.length - maxItems} more`,
        );
      }

      lines.push("");
    }
  }

  // ── Disabled MCP servers ───────────────────────────────────────

  if (disabledMcp.length > 0 && mode === "detailed") {
    lines.push(`  Disabled MCP servers (${disabledMcp.length})`);
    for (const s of disabledMcp) {
      lines.push(`    \u2514 ${s.name} (disabled)`);
    }
    lines.push("");
  }

  // ── Recommendations ────────────────────────────────────────────

  const recommendations: string[] = [];

  if (usageFraction > 0.85) {
    recommendations.push(
      "CRITICAL: Over 85% context used by overhead alone. Disable unused MCP servers.",
    );
  } else if (usageFraction > 0.7) {
    recommendations.push(
      "WARNING: Over 70% context used by overhead. Consider disabling unused MCP servers.",
    );
  }

  if (mcpCategory.tokens > contextLimit * 0.5) {
    recommendations.push(
      `MCP tools use ${pct(mcpCategory.tokens, contextLimit)} of context. Review which servers you actually need.`,
    );
  }

  if (instructionCategory.tokens > contextLimit * 0.15) {
    recommendations.push(
      `Instructions use ${pct(instructionCategory.tokens, contextLimit)} of context. Consider consolidating or trimming.`,
    );
  }

  const bigAgents = agentCategory.items.filter((a) => a.tokens > 5000);
  if (bigAgents.length > 0) {
    recommendations.push(
      `${bigAgents.length} agent(s) over 5k tokens. Consider trimming: ${bigAgents.map((a) => a.name).join(", ")}`,
    );
  }

  if (recommendations.length > 0) {
    lines.push("  Recommendations:");
    for (const r of recommendations) {
      lines.push(`    - ${r}`);
    }
    lines.push("");
  }

  // ── Sources ────────────────────────────────────────────────────

  if (mode === "detailed") {
    lines.push("  Config sources:");
    if (config.globalConfigPath) {
      lines.push(
        `    Global: ${config.globalConfigPath.replace(process.env.HOME ?? "", "~")}`,
      );
    }
    if (config.projectConfigPath) {
      lines.push(
        `    Project: ${config.projectConfigPath}`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
