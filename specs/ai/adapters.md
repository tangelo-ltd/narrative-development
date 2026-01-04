# AI Adapters

This document defines the adapter contract for AI CLI integration.

---

## Overview

nara delegates AI work to external CLI tools. An **adapter** describes how to invoke a specific tool and parse its output.

nara does not:
- Bundle or manage AI models
- Store API keys
- Make network requests directly

All AI interaction goes through user-installed CLI tools.

---

## Adapter Interface

Each adapter defines:

```typescript
interface Adapter {
  name: string;           // "codex" | "claude" | "gemini" | "custom"
  command: string;        // executable name or path
  promptMode: PromptMode; // how to send the prompt
  outputMode: OutputMode; // how to parse the response
  args?: string[];        // additional CLI arguments
}

type PromptMode = "stdin" | "arg";
type OutputMode = "json" | "sections" | "raw";
```

---

## Built-in Adapters

### codex

| Property | Value |
|----------|-------|
| command | `codex` |
| promptMode | `stdin` |
| outputMode | `json` |
| args | `[]` |

### claude

| Property | Value |
|----------|-------|
| command | `claude` |
| promptMode | `stdin` |
| outputMode | `json` |
| args | `[]` |

### gemini

| Property | Value |
|----------|-------|
| command | `gemini` |
| promptMode | `stdin` |
| outputMode | `json` |
| args | `[]` |

**Note:** Built-in adapters use default configurations. Users can override any property via `.nara/config.json`.

---

## Custom Adapters

Users can define arbitrary tools:

```json
{
  "ai": {
    "provider": "custom",
    "command": "/path/to/my-ai-cli",
    "args": ["--format", "markdown"],
    "promptMode": "stdin",
    "outputMode": "sections"
  }
}
```

Custom adapters are treated as opaque processes. nara makes no assumptions about their behavior beyond the defined interface.

---

## Prompt Modes

### stdin

Prompt is written to the process's standard input.

```javascript
const child = spawn(command, args);
child.stdin.write(prompt);
child.stdin.end();
```

### arg

Prompt is passed as a command-line argument.

```javascript
spawn(command, [...args, prompt]);
```

**Note:** `arg` mode has length limits on some platforms. Prefer `stdin` for long prompts.

---

## Output Modes

### sections

Expect markdown with specific headers:

```markdown
### STORY
(content)

### OPEN_QUESTIONS
(content)

### NOTES
(content)
```

Parsing: split on `### ` prefix, extract section content.

### json

Expect a JSON object:

```json
{
  "story": "...",
  "openQuestions": ["..."],
  "notes": "..."
}
```

Parsing: `JSON.parse(stdout)`

### raw

No parsing. Pass through as-is.

---

## Invocation Contract

### Input

1. Build prompt using envelope from [prompts.md](prompts.md)
2. Spawn process with configured command and args
3. Write prompt to stdin (or append to args)
4. Wait for process to exit

### Output

1. Read stdout
2. Parse according to outputMode
3. If parsing fails, report error and exit 2
4. If process exits non-zero, report error and exit 2

### Error Handling

| Condition | nara Behavior |
|-----------|---------------|
| Command not found | Error: "AI command not found: {command}" |
| Non-zero exit | Error: "AI command failed with exit code {code}" |
| Output parse failure | Error: "Could not parse AI output" + show raw output |
| Timeout (30s default) | Error: "AI command timed out" |

---

## Environment

nara passes through the user's environment to the AI process. It does not inject or modify environment variables.

If an AI CLI requires authentication (API keys), that is the user's responsibility to configure in their shell environment.

---

## Detection

See [../cli/detect.md](../cli/detect.md) for how nara discovers available AI tools.

---

## Implementation Notes

- Use `execa` or similar for reliable cross-platform subprocess handling
- Capture both stdout and stderr
- Set reasonable timeout (30 seconds, configurable later)
- Log invocation details in verbose mode for debugging
