# nara CLI Commands

This document defines the v0 command surface, flags, side effects, and exit behavior.

---

## Global Rules

1. All commands MUST fail fast on invalid state
2. All file writes MUST be scoped to the **narrative root** (see below)
3. Exit codes:
   - `0` = success
   - `1` = user or validation error
   - `2` = system or tool failure

---

## Narrative Root Resolution

Commands automatically detect the narrative root:

| Detection | Narrative Root | Mode |
|-----------|----------------|------|
| `nara/NARA.md` exists | `nara/` | Adopted codebase |
| `NARA.md` exists at repo root | Repository root | Fresh repo |
| Neither exists | Error (not a nara project) | — |

All paths (`specs/`, `.nara/`, etc.) are relative to the narrative root.

---

## Commands (v0)

### nara init

Creates a fresh Narrative Development repository.

| Aspect | Value |
|--------|-------|
| Writes | Seed files at repository root |
| Fails if | `NARA.md` already exists |
| Flags | `--name`, `--desc`, `--yes` |

Use for **new projects** where Narrative Development is primary from day one.

---

### nara adopt

Onboards an existing codebase by creating `nara/` narrative layer.

| Aspect | Value |
|--------|-------|
| Writes | All files under `nara/` only |
| Fails if | `nara/` directory already exists (unless `--merge` or `--force`) |
| Flags | `--name`, `--desc`, `--merge`, `--force`, `--inventory` |

Use for **existing projects** to add Narrative Development without touching existing code.

**Safety guarantee:** Never writes outside `nara/`.

---

### nara detect

Detects installed AI CLIs and prompts user to choose if multiple are found.

| Aspect | Value |
|--------|-------|
| Writes | `<narrativeRoot>/.nara/config.json` |
| Flags | `--force` |

---

### nara configure \<key\>=\<value\>

Updates user configuration.

| Aspect | Value |
|--------|-------|
| Writes | `<narrativeRoot>/.nara/config.json` |

---

### nara story [name]

Creates a new story via AI-orchestrated capture.

| Aspect | Value |
|--------|-------|
| Writes | One file under `<narrativeRoot>/specs/stories/**` |
| Fails if | Invalid ID, ID collision, AI validation failure |
| Flags | (none) |

---

### nara status

Reports narrative health.

| Aspect | Value |
|--------|-------|
| Reads | All stories in `<narrativeRoot>/specs/stories/` |
| Writes | Nothing |
| Flags | `--json`, `--verbose` |

---

## Forbidden Operations (v0)

- Modifying conventions
- Writing outside narrative root
- Generating executable code
- Auto-compiling
- Unannounced AI invocation

---

## Summary

- Command surface is intentionally small
- Side effects are tightly scoped to narrative root
- `init` for fresh repos, `adopt` for existing codebases
- v0 is focused on narrative capture, not generation
