# nara configure

Updates user configuration.

---

## Command

```
nara configure <key>=<value>
```

### Examples

```bash
nara configure ai.provider=claude
nara configure ai.command=/usr/local/bin/claude
nara configure ai.promptMode=stdin
```

---

## Supported Keys

| Key | Type | Description |
|-----|------|-------------|
| `ai.provider` | string | `codex`, `claude`, `gemini`, `custom`, `none` |
| `ai.command` | string | Executable name or path |
| `ai.args` | string | Comma-separated arguments |
| `ai.promptMode` | string | `stdin` or `arg` |
| `ai.outputMode` | string | `json`, `sections`, `raw` |

---

## Writes

| File | Action |
|------|--------|
| `.nara/config.json` | Create or update |

Creates `.nara/` directory if it doesn't exist.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Configuration updated |
| 1 | Invalid key or value |
| 2 | Write failed |

---

## Validation

- Unknown keys are rejected with error
- Invalid enum values are rejected with error
- Path values are not validated (user responsibility)

---

## See Also

- [../config/schema.md](../config/schema.md) — Configuration schema
- [../config/precedence.md](../config/precedence.md) — Resolution rules
