import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

// ── Types ──────────────────────────────────────────────────────────

export interface McpServer {
  name: string;
  type: string;
  url?: string;
  command?: string[];
  enabled: boolean;
}

export interface AgentDef {
  name: string;
  source: "json" | "markdown";
  location: "global" | "project";
  content: string;
}

export interface InstructionFile {
  path: string;
  content: string;
}

export interface OpenCodeConfig {
  globalConfigPath: string | null;
  projectConfigPath: string | null;
  mcpServers: McpServer[];
  agents: AgentDef[];
  instructions: InstructionFile[];
  rawGlobalConfig: string;
  rawProjectConfig: string;
}

// ── Helpers ────────────────────────────────────────────────────────

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function safeReadFile(path: string): Promise<string> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return "";
  }
}

function expandHome(p: string): string {
  if (p.startsWith("~/") || p === "~") {
    return join(homedir(), p.slice(1));
  }
  return p;
}

/**
 * Strip JSONC comments (// and /* ... *​/) so JSON.parse works.
 */
function stripJsonComments(text: string): string {
  let result = "";
  let i = 0;
  let inString = false;
  let escape = false;

  while (i < text.length) {
    const ch = text[i];

    if (inString) {
      result += ch;
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      i++;
      continue;
    }

    // Start of string
    if (ch === '"') {
      inString = true;
      result += ch;
      i++;
      continue;
    }

    // Line comment
    if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }

    // Block comment
    if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/"))
        i++;
      i += 2;
      continue;
    }

    // Trailing commas before } or ]
    if (ch === ",") {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j++;
      if (text[j] === "}" || text[j] === "]") {
        i++;
        continue;
      }
    }

    result += ch;
    i++;
  }

  return result;
}

function parseJsonc(text: string): unknown {
  if (!text.trim()) return {};
  return JSON.parse(stripJsonComments(text));
}

// ── Config discovery ───────────────────────────────────────────────

function findProjectRoot(startDir: string): string | null {
  let dir = resolve(startDir);
  const root = resolve("/");

  while (dir !== root) {
    // OpenCode looks for opencode.json or .opencode/ or .git/
    // We check for any of these as project root indicators
    const candidates = [
      join(dir, "opencode.json"),
      join(dir, "opencode.jsonc"),
      join(dir, ".opencode"),
      join(dir, ".git"),
    ];

    for (const c of candidates) {
      try {
        // Synchronous existence check is fine for startup
        const fs = require("node:fs");
        fs.statSync(c);
        return dir;
      } catch {
        // continue
      }
    }

    dir = resolve(dir, "..");
  }

  return null;
}

// ── MCP servers ────────────────────────────────────────────────────

function extractMcpServers(config: Record<string, unknown>): McpServer[] {
  const mcp = config.mcp as Record<string, Record<string, unknown>> | undefined;
  if (!mcp || typeof mcp !== "object") return [];

  return Object.entries(mcp).map(([name, def]) => ({
    name,
    type: String(def.type ?? "unknown"),
    url: def.url as string | undefined,
    command: def.command as string[] | undefined,
    enabled: def.enabled !== false, // default true
  }));
}

// ── Agents ─────────────────────────────────────────────────────────

async function loadMarkdownAgents(
  dir: string,
  location: "global" | "project",
): Promise<AgentDef[]> {
  const agents: AgentDef[] = [];
  try {
    const entries = await readdir(dir);
    for (const entry of entries) {
      if (entry.endsWith(".md")) {
        const content = await safeReadFile(join(dir, entry));
        agents.push({
          name: entry.replace(/\.md$/, ""),
          source: "markdown",
          location,
          content,
        });
      }
    }
  } catch {
    // directory doesn't exist
  }
  return agents;
}

function extractJsonAgents(
  config: Record<string, unknown>,
  location: "global" | "project",
): AgentDef[] {
  const agent = config.agent as Record<string, unknown> | undefined;
  if (!agent || typeof agent !== "object") return [];

  return Object.entries(agent).map(([name, def]) => ({
    name,
    source: "json" as const,
    location,
    content: JSON.stringify(def, null, 2),
  }));
}

// ── Instructions ───────────────────────────────────────────────────

async function loadInstructions(
  paths: string[],
  configDir: string,
): Promise<InstructionFile[]> {
  const results: InstructionFile[] = [];

  for (const rawPath of paths) {
    const expanded = expandHome(rawPath);
    const resolved = resolve(configDir, expanded);
    const content = await safeReadFile(resolved);
    if (content) {
      results.push({ path: resolved, content });
    }
  }

  return results;
}

// ── Main loader ────────────────────────────────────────────────────

export async function loadOpenCodeConfig(
  cwd: string = process.cwd(),
): Promise<OpenCodeConfig> {
  const globalDir = join(homedir(), ".config", "opencode");
  const globalConfigPath = join(globalDir, "opencode.json");
  const globalConfigcPath = join(globalDir, "opencode.jsonc");

  const projectRoot = findProjectRoot(cwd);
  const projectConfigPath = projectRoot
    ? join(projectRoot, "opencode.json")
    : null;
  const projectConfigcPath = projectRoot
    ? join(projectRoot, "opencode.jsonc")
    : null;

  // Read raw configs
  let rawGlobal = "";
  if (await fileExists(globalConfigPath)) {
    rawGlobal = await safeReadFile(globalConfigPath);
  } else if (await fileExists(globalConfigcPath)) {
    rawGlobal = await safeReadFile(globalConfigcPath);
  }

  let rawProject = "";
  if (projectConfigPath && (await fileExists(projectConfigPath))) {
    rawProject = await safeReadFile(projectConfigPath);
  } else if (projectConfigcPath && (await fileExists(projectConfigcPath))) {
    rawProject = await safeReadFile(projectConfigcPath);
  }

  const globalConfig = parseJsonc(rawGlobal) as Record<string, unknown>;
  const projectConfig = parseJsonc(rawProject) as Record<string, unknown>;

  // MCP servers (merged: project overrides global)
  const globalMcp = extractMcpServers(globalConfig);
  const projectMcp = extractMcpServers(projectConfig);
  const mcpMap = new Map<string, McpServer>();
  for (const s of globalMcp) mcpMap.set(s.name, s);
  for (const s of projectMcp) mcpMap.set(s.name, s);
  const mcpServers = [...mcpMap.values()];

  // Agents
  const agents: AgentDef[] = [];
  agents.push(...extractJsonAgents(globalConfig, "global"));
  agents.push(
    ...(await loadMarkdownAgents(join(globalDir, "agents"), "global")),
  );
  if (projectRoot) {
    agents.push(...extractJsonAgents(projectConfig, "project"));
    agents.push(
      ...(await loadMarkdownAgents(
        join(projectRoot, ".opencode", "agents"),
        "project",
      )),
    );
  }

  // Instructions
  const instructionPaths: string[] = [];
  if (Array.isArray(globalConfig.instructions)) {
    instructionPaths.push(
      ...(globalConfig.instructions as string[]),
    );
  }
  if (Array.isArray(projectConfig.instructions)) {
    instructionPaths.push(
      ...(projectConfig.instructions as string[]),
    );
  }

  // Also check for AGENTS.md in project root
  if (projectRoot) {
    const agentsMd = join(projectRoot, "AGENTS.md");
    if (await fileExists(agentsMd)) {
      instructionPaths.push(agentsMd);
    }
  }

  const instructions = await loadInstructions(instructionPaths, globalDir);

  return {
    globalConfigPath: rawGlobal ? globalConfigPath : null,
    projectConfigPath:
      rawProject && projectConfigPath ? projectConfigPath : null,
    mcpServers,
    agents,
    instructions,
    rawGlobalConfig: rawGlobal,
    rawProjectConfig: rawProject,
  };
}
