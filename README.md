# open-context-check

Context window usage analyzer for [OpenCode](https://opencode.ai). Shows how much of your context window is consumed by static overhead (MCP tools, agents, instructions, config) **before you start working**.

---

### `/context` — compact

Quick pre-session check. Fits in a glance.

```
  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░  Context Usage
                                  62.2k/200.0k tokens (31.1%)

  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  System prompt       8.5k (4.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Built-in tools     15.2k (7.6%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  MCP tools           9.1k (4.5%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Custom agents      14.6k (7.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Instructions       10.7k (5.4%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Config overhead     4.0k (2.0%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  Free space        137.8k (68.9%)
```

### `/context standard` — top items per category

See what's eating the most tokens without the full firehose.

```
  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░  Context Usage
                                  62.2k/200.0k tokens (31.1%)

  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  System prompt       8.5k (4.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Built-in tools     15.2k (7.6%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  MCP tools           9.1k (4.5%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Custom agents      14.6k (7.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Instructions       10.7k (5.4%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Config overhead     4.0k (2.0%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  Free space        137.8k (68.9%)

  MCP tools (11)
    └ pokeedge-data-ops: 828 tokens
    └ pokeedge-sync-ops: 828 tokens
    └ svelte-mcp: 827 tokens
    └ context7: 825 tokens
    └ kagi: 825 tokens
    ... and 6 more

  Custom agents (32)
    └ orca (global): 2.5k tokens
    └ scout (global): 1.6k tokens
    └ prioritizer (global): 1.5k tokens
    └ refine (global): 1.4k tokens
    └ mechanic (global): 1.3k tokens
    ... and 27 more

  Instructions (11)
    └ ~/dev/oc-plugins/advance/ADV_INSTRUCTIONS.md: 3.6k tokens
    └ ~/.config/opencode/instructions/rules.yaml: 1.6k tokens
    └ ~/.config/opencode/instructions/mcp-tools.md: 1.3k tokens
    └ ~/.config/opencode/instructions/shell_strategy.md: 888 tokens
    └ ~/.config/opencode/instructions/worktree-guide.md: 809 tokens
    ... and 6 more
```

### `/context detailed` — full breakdown

Every item, disabled servers, optimization recommendations, config sources.

```
  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░  Context Usage
                                  62.2k/200.0k tokens (31.1%)

  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  System prompt       8.5k (4.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Built-in tools     15.2k (7.6%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  MCP tools           9.1k (4.5%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Custom agents      14.6k (7.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Instructions       10.7k (5.4%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Config overhead     4.0k (2.0%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  Free space        137.8k (68.9%)

  MCP tools (11)
    └ pokeedge-data-ops: 828 tokens
    └ pokeedge-sync-ops: 828 tokens
    └ svelte-mcp: 827 tokens
    └ context7: 825 tokens
    └ kagi: 825 tokens
    └ firecrawl: 825 tokens
    └ grep-app: 825 tokens
    └ sentry: 825 tokens
    └ lgrep: 825 tokens
    └ playwright: 825 tokens
    └ vision: 824 tokens

  Custom agents (32)
    └ orca (global): 2.5k tokens
    └ scout (global): 1.6k tokens
    └ prioritizer (global): 1.5k tokens
    └ refine (global): 1.4k tokens
    └ mechanic (global): 1.3k tokens
    └ tron (global): 1.2k tokens
    └ adv-researcher (global): 1.1k tokens
    └ build (global): 957 tokens
    └ librarian (global): 688 tokens
    └ general (global): 589 tokens
    └ plan (global): 580 tokens
    └ explore (global): 508 tokens
    ...

  Instructions (11)
    └ ~/dev/oc-plugins/advance/ADV_INSTRUCTIONS.md: 3.6k tokens
    └ ~/.config/opencode/instructions/rules.yaml: 1.6k tokens
    └ ~/.config/opencode/instructions/mcp-tools.md: 1.3k tokens
    └ ~/.config/opencode/instructions/shell_strategy.md: 888 tokens
    └ ~/.config/opencode/instructions/worktree-guide.md: 809 tokens
    └ ~/.config/opencode/instructions/temp_directory.md: 602 tokens
    └ ~/.config/opencode/instructions/morph-tools.md: 537 tokens
    └ ~/.config/opencode/instructions/lgrep-tools.md: 479 tokens
    └ ~/.config/opencode/instructions/lbp.md: 411 tokens
    └ ~/.config/opencode/instructions/test_resource_guardrails.md: 306 tokens
    └ ~/.config/opencode/instructions/identity.md: 262 tokens

  Disabled MCP servers (6)
    └ arxiv-mcp (disabled)
    └ time (disabled)
    └ basic-memory (disabled)
    └ figma-mcp (disabled)
    └ sonarqube (disabled)
    └ brave-web-search (disabled)

  Config sources:
    Global: ~/.config/opencode/opencode.json
```

---

## Why?

OpenCode doesn't expose token accounting. You might have 11 MCP servers, 32 agents, and 11 instruction files loaded — but no way to know how much of your 200k context window they're eating before you even say hello.

This tool fills that gap.

## Install

```bash
git clone https://github.com/Sharper-Flow/open-context-check.git
cd open-context-check
npm install
npm run build
```

### As an OpenCode `/context` command

Copy the command file to your global commands directory:

```bash
cp commands/context.md ~/.config/opencode/commands/
```

Then use `/context` inside OpenCode:

```
/context              # compact overview
/context standard     # top items per category
/context detailed     # full breakdown
```

### Standalone CLI

Run directly from anywhere:

```bash
node /path/to/open-context-check/dist/context-check.js              # compact
node /path/to/open-context-check/dist/context-check.js standard     # standard
node /path/to/open-context-check/dist/context-check.js detailed     # detailed
node /path/to/open-context-check/dist/context-check.js --limit 128k # override context window size
```

## What it analyzes

| Component | Source |
|-----------|--------|
| **MCP servers** | `opencode.json` → `mcp` (global + project, merged) |
| **Custom agents** | JSON config + `.opencode/agents/*.md` + `~/.config/opencode/agents/*.md` |
| **Instructions** | `opencode.json` → `instructions[]` + `AGENTS.md` |
| **Config overhead** | Raw config file sizes |
| **System prompt** | Estimated baseline (~8.5k tokens) |
| **Built-in tools** | Estimated baseline (~15.2k tokens) |

## Token counting

Token counts use [tiktoken](https://github.com/dqbd/tiktoken) with the `cl100k_base` encoding (BPE tokenizer used by GPT-4/GPT-4o). This is not the exact tokenizer for any specific model — Claude, Gemini, DeepSeek, etc. all use their own — but modern BPE tokenizers produce counts within ~15% of each other for English prose and code. This makes `cl100k_base` a solid universal estimator, especially for structured content like JSON, YAML, and markdown where simple character-ratio heuristics fall apart.

## Known limitations

- **MCP tool token counts are estimates.** We count the config definition + a base overhead per server, but the actual tool schemas (which get injected into the system prompt) aren't accessible from outside OpenCode. The real MCP overhead is likely **higher** than reported.
- **System prompt and built-in tool baselines are hardcoded.** These will drift as OpenCode evolves.
- **Token counts are approximate.** tiktoken `cl100k_base` is a universal estimator, not the exact tokenizer for any specific model. Expect ~15% variance vs actual provider counts.

## Contributing

PRs welcome. The codebase is small:

```
src/
├── context-check.ts   # CLI entry point
├── config.ts          # Config discovery (global + project)
├── report.ts          # Report formatting (compact/standard/detailed)
└── tokens.ts          # tiktoken cl100k_base wrapper
commands/
└── context.md         # OpenCode /context custom command
```

## License

MIT
