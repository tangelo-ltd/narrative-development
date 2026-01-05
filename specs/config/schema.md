# Configuration Schema

This document defines the configuration file formats for nara.

See [precedence.md](precedence.md) for resolution rules.

---

## Configuration Files

nara uses two configuration layers.

### Project Configuration (committed)

| Property | Value |
|----------|-------|
| File | `nara.json` |
| Location | `.nara/` directory |
| Versioned | YES |
| Purpose | project-wide conventions and paths |

### User Configuration (local)

| Property | Value |
|----------|-------|
| File | `config.json` |
| Location | `.nara/` directory |
| Versioned | NO (gitignored) |
| Purpose | user-specific preferences (AI tools) |

---

## Narrative Root

The **narrative root** is the base directory for all narrative artifacts. It is always `.nara/`, so normal project code stays in the repository root.

| Mode | Narrative Root | Config Location |
|------|----------------|-----------------|
| Fresh repo (`nara init`) | `.nara/` directory | `.nara/nara.json` |
| Existing codebase (`nara adopt`) | `.nara/` directory | `.nara/nara.json` |

All paths in configuration are **relative to the narrative root**, not the repository root.

---

## Project Configuration Schema

```json
{
  "narrativeRoot": ".nara",
  "specRoot": "specs",
  "conventionsIndex": "specs/conventions/index.md",
  "storiesRoot": "specs/stories",
  "tokenPolicy": {
    "maxFiles": 6,
    "maxBytes": 120000,
    "includeGlossary": true
  }
}
```

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `narrativeRoot` | string | `".nara"` | Base directory for narrative artifacts (auto-detected) |
| `specRoot` | string | `"specs"` | Canonical root of all specifications (relative to narrativeRoot) |
| `conventionsIndex` | string | `"specs/conventions/index.md"` | Single entry point for all rules |
| `storiesRoot` | string | `"specs/stories"` | Default location for story files |
| `tokenPolicy` | object | see below | Governs AI context assembly |

**Note:** `narrativeRoot` is typically auto-detected and should not be set manually.

### tokenPolicy

Token policy is **advisory**. nara truncates context at these limits but cannot control what AI CLIs do with the content.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `maxFiles` | number | `6` | Maximum files to include in context |
| `maxBytes` | number | `120000` | Maximum total bytes for context |
| `includeGlossary` | boolean | `true` | Whether to include glossary in context |

---

## User Configuration Schema

```json
{
  "ai": {
    "provider": "claude",
    "command": "claude",
    "args": [],
    "promptMode": "stdin",
    "outputMode": "json"
  }
}
```

### ai Fields

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `provider` | string | `"codex"` \| `"claude"` \| `"gemini"` \| `"custom"` \| `"none"` | Selected AI provider |
| `command` | string | — | Executable name or absolute path |
| `args` | string[] | `[]` | Arguments appended to invocation |
| `promptMode` | string | `"stdin"` \| `"arg"` | How prompt is passed to CLI |
| `outputMode` | string | `"json"` \| `"sections"` \| `"raw"` | Expected output format |

### outputMode Values

| Value | Description |
|-------|-------------|
| `sections` | Expect markdown headers (`### STORY`, `### OPEN_QUESTIONS`, etc.) |
| `json` | Expect JSON object matching defined schema |
| `raw` | Pass through as-is, no parsing |

---

## Validation Rules

1. Unknown fields SHOULD be ignored with a warning (forward compatibility)
2. Missing required fields MUST fall back to defaults
3. Invalid paths (non-existent directories) MUST cause a hard error
4. User config MUST NOT override structural paths (`specRoot`, `storiesRoot`)

---

## Defaults Summary

All defaults in one place for implementation reference:

```json
{
  "narrativeRoot": ".nara",
  "specRoot": "specs",
  "conventionsIndex": "specs/conventions/index.md",
  "storiesRoot": "specs/stories",
  "tokenPolicy": {
    "maxFiles": 6,
    "maxBytes": 120000,
    "includeGlossary": true
  },
  "ai": {
    "provider": "none",
    "command": null,
    "args": [],
    "promptMode": "stdin",
    "outputMode": "json"
  }
}
```
