# open-context-check

Context window usage analyzer for [OpenCode](https://opencode.ai). Shows how much of your context window is consumed by static overhead (MCP tools, agents, instructions, config) **before you start working**.

## Why?

OpenCode doesn't expose token accounting. You might have 11 MCP servers, 32 agents, and 11 instruction files loaded — but no way to know how much of your 200k context window they're eating before you even say hello.

This tool fills that gap.

## Output

```
  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  Context Usage
                                  64.8k/200.0k tokens (32.4%)

  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  System prompt       8.5k (4.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Built-in tools     15.2k (7.6%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  MCP tools           9.1k (4.5%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Custom agents      14.6k (7.3%)
  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Instructions       13.3k (6.7%)
  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Config overhead     4.0k (2.0%)
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  Free space        135.2k (67.6%)
```

## Install

```bash
cd ~/dev/oc-plugins/open-context-check
npm install
npm run build
```

### As an OpenCode custom command

Copy the command file to your global or project commands directory:

```bash
cp commands/context.md ~/.config/opencode/commands/
```

Then use `/context` in OpenCode:

```
/context              # compact overview
/context standard     # top items per category
/context detailed     # full breakdown
```

### Standalone CLI

```bash
node dist/context-check.js              # compact
node dist/context-check.js standard     # standard
node dist/context-check.js detailed     # detailed
node dist/context-check.js --limit 128k # override context window size
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

Token counts use [tiktoken](https://github.com/dqbd/tiktoken) with the `cl100k_base` encoding (BPE tokenizer used by GPT-4/GPT-4o). This is not the exact tokenizer for any specific model — Claude, Gemini, DeepSeek, etc. all use their own — but modern BPE tokenizers produce counts within ~15% of each other for English prose and code. This makes `cl100k_base` a solid universal estimator that's dramatically more accurate than a simple characters-per-token heuristic, especially for structured content like JSON, YAML, and markdown.

## Known limitations

- **MCP tool token counts are estimates.** We count the config definition + a base overhead per server, but the actual tool schemas (which get injected into the system prompt) aren't accessible from outside OpenCode. The real MCP overhead is likely **higher** than reported.
- **System prompt and built-in tool baselines are hardcoded.** These will drift as OpenCode evolves.
- **Token counts are approximate.** tiktoken `cl100k_base` is a universal estimator, not the exact tokenizer for any specific model. Expect ~15% variance vs actual provider counts.

## License

MIT
