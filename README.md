# open-context-check

Live context-window usage analyzer for [OpenCode](https://opencode.ai). Reads OpenCode's own token telemetry from `opencode export`, then prints current session usage.

---

### `/context` — compact

Quick live check. Fits in a glance.

```text
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

### `/context standard` / `/context detailed`

Live usage plus session metadata.

```text
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  Context Usage (live)
                                  93.6k/200.0k tokens (46.8%)
                                  from opencode export latest API call

  Fresh input / cache / output / reasoning rows...

  Session: ses_...
  Model: openai/gpt-5.5 (high)
  Latest call: 2026-05-03T23:04:27.371Z
  Message: msg_...
  Completed API calls: 10
```

`detailed` is kept as a familiar alias for metadata output. Static estimates were removed because they are not live telemetry.

---

## Why?

OpenCode records token telemetry per API call, but does not expose it as a compact `/context` view. This tool prints that live telemetry without guessing at prompt/tool overhead.

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

The bundled command defaults to `$HOME/dev/oc-plugins/open-context-check`. If you cloned elsewhere, set `OPEN_CONTEXT_CHECK` to your built script path or edit the command file.

Then use `/context` inside OpenCode:

```text
/context              # compact live usage
/context standard     # live usage with session details
/context detailed     # live usage with session details
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
| **Context limit** | Configured model context limit when present, otherwise known model-family defaults |

## Known limitations

- **Latest completed API call only.** In-flight assistant responses appear after completion.
- **Provider telemetry split only.** Rows show fresh input/cache/output/reasoning, not system-vs-tools-vs-instructions.
- **No static estimates.** The tool avoids guessed MCP/agent/instruction overhead.

## Contributing

PRs welcome. Codebase is small:

```text
src/
├── context-check.ts   # CLI entry point
├── config.ts          # Config discovery for context-limit detection
├── report.ts          # Live report formatting
├── session.ts         # Live session telemetry from opencode export
└── tokens.ts          # Formatting helpers + tokenizer cleanup
commands/
└── context.md         # OpenCode /context custom command
```

## License

MIT
