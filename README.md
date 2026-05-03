# open-context-check

Context window usage analyzer for [OpenCode](https://opencode.ai). Shows live context usage from `opencode export` token telemetry, with an optional static config-overhead estimate for MCP tools, agents, instructions, and config.

---

### `/context` — compact

Quick live check. Fits in a glance.

```
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  Context Usage (live)
                                  93.6k/200.0k tokens (46.8%)
                                  from opencode export latest API call

  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Fresh input          849 (0.4%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  Cache read         92.7k (46.3%)
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Cache write            0 (0.0%)
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Output                50 (0.0%)
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Reasoning              0 (0.0%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░  Free space        106.4k (53.2%)
```

### `/context standard` — top items per category

See session metadata with live usage.

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

### `/context detailed` — live usage plus static estimate

Live usage plus every static estimate item, disabled servers, optimization recommendations, config sources. Static estimate sections are labeled as estimates, not live telemetry.

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

OpenCode records token telemetry per API call, but it is not exposed as a compact `/context` view. You might also have many MCP servers, agents, and instruction files configured, and need a quick estimate of their static overhead.

This tool fills both gaps: live current usage first, optional static overhead estimate second.

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

The bundled command defaults to `$HOME/dev/oc-plugins/open-context-check`. If
you cloned elsewhere, set `OPEN_CONTEXT_CHECK` to your built script path or edit
the command file.

Then use `/context` inside OpenCode:

```
/context              # compact overview
/context standard     # live usage with session details
/context detailed     # live usage plus static config estimate
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
| **Live context usage** | `opencode export <session> --sanitize` latest completed assistant token telemetry |
| **Session ID** | `$OPENCODE_SESSION_ID`, explicit `--session`, or newest `opencode session list` entry |
| **MCP servers** | `opencode.json` → `mcp` (global + project, merged) |
| **Custom agents** | JSON config + `.opencode/agents/*.md` + `~/.config/opencode/agents/*.md` |
| **Instructions** | `opencode.json` → `instructions[]` + `AGENTS.md` |
| **Config overhead** | Raw config file sizes |
| **System prompt** | Static estimate baseline (~8.5k tokens) |
| **Built-in tools** | Static estimate baseline (~15.2k tokens) |

## Token counting

Token counts use [tiktoken](https://github.com/dqbd/tiktoken) with the `cl100k_base` encoding (BPE tokenizer used by GPT-4/GPT-4o). This is not the exact tokenizer for any specific model — Claude, Gemini, DeepSeek, etc. all use their own — but modern BPE tokenizers produce counts within ~15% of each other for English prose and code. This makes `cl100k_base` a solid universal estimator, especially for structured content like JSON, YAML, and markdown where simple character-ratio heuristics fall apart.

## Known limitations

- **Live total is authoritative for latest completed API call.** It comes from OpenCode token telemetry.
- **Live category split is provider telemetry split only.** It shows fresh input/cache/output/reasoning, not system-vs-tools-vs-instructions.
- **Static MCP/tool/instruction buckets are estimates.** We count config/instruction/agent text and use hardcoded baselines for system prompt + built-in tools. Actual tool schemas are not fully exposed outside OpenCode.
- **Static token counts are approximate.** Static estimates use `cl100k_base`, not each provider's exact tokenizer.

## Contributing

PRs welcome. The codebase is small:

```
src/
├── context-check.ts   # CLI entry point
├── config.ts          # Config discovery (global + project)
├── report.ts          # Report formatting (compact/standard/detailed)
├── session.ts         # Live session telemetry from opencode export
└── tokens.ts          # tiktoken cl100k_base wrapper
commands/
└── context.md         # OpenCode /context custom command
```

## License

MIT
