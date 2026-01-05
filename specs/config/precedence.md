# Configuration Precedence

This document defines how nara resolves configuration values.

---

## Resolution Order

From highest to lowest priority:

1. **CLI flags** — explicit command-line arguments
2. **User config** — `.nara/config.json`
3. **Project config** — `.nara/nara.json`
4. **Built-in defaults** — hardcoded in nara

Later layers override earlier ones **field-by-field** (shallow merge).

---

## Example

Given:

```json
// .nara/nara.json (project)
{
  "specRoot": "specifications",
  "tokenPolicy": { "maxFiles": 10 }
}

// .nara/config.json (user)
{
  "ai": { "provider": "claude" }
}
```

And CLI invocation:

```
nara story auth.login --ai gemini
```

Resolved configuration:

| Field | Value | Source |
|-------|-------|--------|
| `specRoot` | `"specifications"` | project config |
| `tokenPolicy.maxFiles` | `10` | project config |
| `tokenPolicy.maxBytes` | `120000` | default |
| `ai.provider` | `"gemini"` | CLI flag |
| `ai.command` | `"gemini"` | inferred from provider |

---

## Constraints

- User config cannot override `specRoot` or `storiesRoot` (structural paths are project-level)
- CLI flags always win
- Missing values inherit from the next layer down
