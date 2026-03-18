# open-context-check

Context window usage analyzer for [OpenCode](https://opencode.ai). Shows how much of your context window is consumed by static overhead (MCP tools, agents, instructions, config) **before you start working**.

---

### `/context` — compact

Quick pre-session check. Fits in a glance.

```
  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░  Context Usage
                                  78.4k/200.0k tokens (39.2%)

  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  System prompt       8.5k (4.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Built-in tools     15.2k (7.6%)
  ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░  MCP tools          32.1k (16.1%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Custom agents       8.2k (4.1%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Instructions       11.6k (5.8%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Config overhead     2.8k (1.4%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  Free space        121.6k (60.8%)
```

### `/context standard` — top items per category

See what's eating the most tokens without the full firehose.

```
  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░  Context Usage
                                  78.4k/200.0k tokens (39.2%)

  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  System prompt       8.5k (4.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Built-in tools     15.2k (7.6%)
  ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░  MCP tools          32.1k (16.1%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Custom agents       8.2k (4.1%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Instructions       11.6k (5.8%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Config overhead     2.8k (1.4%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  Free space        121.6k (60.8%)

  MCP tools (8)
    └ context7: 825 tokens
    └ firecrawl: 825 tokens
    └ grep-app: 825 tokens
    └ lgrep: 825 tokens
    └ sentry: 825 tokens
    ... and 3 more

  Custom agents (6)
    └ build (global): 2.4k tokens
    └ plan (global): 1.8k tokens
    └ general (global): 1.5k tokens
    └ explore (global): 1.2k tokens
    └ code-reviewer (project): 820 tokens
    ... and 1 more

  Instructions (4)
    └ ~/.config/opencode/instructions/coding-standards.md: 4.2k tokens
    └ ~/my-project/AGENTS.md: 3.8k tokens
    └ ~/.config/opencode/instructions/git-conventions.md: 2.1k tokens
    └ ~/.config/opencode/instructions/testing-policy.md: 1.5k tokens
```

### `/context detailed` — full breakdown

Every item, disabled servers, optimization recommendations, config sources.

```
  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░  Context Usage
                                  78.4k/200.0k tokens (39.2%)

  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  System prompt       8.5k (4.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Built-in tools     15.2k (7.6%)
  ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░  MCP tools          32.1k (16.1%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Custom agents       8.2k (4.1%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Instructions       11.6k (5.8%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Config overhead     2.8k (1.4%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  Free space        121.6k (60.8%)

  MCP tools (8)
    └ context7: 825 tokens
    └ firecrawl: 825 tokens
    └ grep-app: 825 tokens
    └ lgrep: 825 tokens
    └ sentry: 825 tokens
    └ github: 824 tokens
    └ fetch: 823 tokens
    └ filesystem: 822 tokens

  Custom agents (6)
    └ build (global): 2.4k tokens
    └ plan (global): 1.8k tokens
    └ general (global): 1.5k tokens
    └ explore (global): 1.2k tokens
    └ code-reviewer (project): 820 tokens
    └ docs-writer (project): 480 tokens

  Instructions (4)
    └ ~/.config/opencode/instructions/coding-standards.md: 4.2k tokens
    └ ~/my-project/AGENTS.md: 3.8k tokens
    └ ~/.config/opencode/instructions/git-conventions.md: 2.1k tokens
    └ ~/.config/opencode/instructions/testing-policy.md: 1.5k tokens

  Disabled MCP servers (3)
    └ playwright (disabled)
    └ brave-web-search (disabled)
    └ arxiv-mcp (disabled)

  Config sources:
    Global: ~/.config/opencode/opencode.json
    Project: ~/my-project/opencode.json
```

---

## Why?

OpenCode doesn't expose token accounting. You might have 8 MCP servers, 6 agents, and 4 instruction files loaded — but no way to know how much of your 200k context window they're eating before you even say hello.

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
