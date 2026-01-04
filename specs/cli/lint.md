# nara lint

**Status:** v0.1 (not in initial release)

Validates story files for structural correctness and consistency.

---

## Purpose

`nara lint` checks the machine-verifiable parts of specifications:
- Required sections are present
- IDs are valid and unique
- References resolve
- Structured blocks parse correctly

It does **not** validate English prose or semantic correctness.

---

## Command

```
nara lint [path]
```

| Argument | Default | Description |
|----------|---------|-------------|
| `path` | `specs/stories/` | Directory or file to lint |

### Flags

| Flag | Description |
|------|-------------|
| `--fix` | Auto-fix trivial issues (normalize headings) |
| `--format json` | Output as JSON for tooling |
| `--ai` | Enable AI advisory checks (v0.2+) |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No errors (warnings allowed) |
| 1 | Errors found |
| 2 | Lint could not run (invalid path, parse failure) |

---

## Checks (v0.1)

### E1xx: Structure Errors

| Code | Check | Severity |
|------|-------|----------|
| E101 | Missing required section | error |
| E102 | Duplicate section heading | error |
| E103 | Unknown section heading | warning |

**Required sections:** `ID`, `Type`, `Purpose`, `Behavior`, plus type-specific requirements (see `specs/files/story-types.md`)

**Optional sections:** `Constraints`, `Dependencies`, `Tests`, `Open Questions`, `Existing Implementation`, `As Implemented`, `Intended Behavior`

### E2xx: ID Errors

| Code | Check | Severity |
|------|-------|----------|
| E201 | Missing ID | error |
| E202 | Invalid ID format | error |
| E203 | Duplicate ID (across repo) | error |
| E204 | ID does not match file path | warning |

**Valid ID format:** `^story\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$`

### E3xx: Reference Errors

| Code | Check | Severity |
|------|-------|----------|
| E301 | Dependency ID does not exist | error |
| E302 | Circular dependency detected | warning |

### E4xx: Field Errors

| Code | Check | Severity |
|------|-------|----------|
| E401 | Inputs field unparseable | error |
| E402 | Outputs field unparseable | error |
| E403 | Test references undefined input | warning |
| E404 | Test references undefined output | warning |

### W5xx: Style Warnings

| Code | Check | Severity |
|------|-------|----------|
| W501 | Lowercase normative keyword (`must` instead of `MUST`) | warning |
| W502 | Empty Open Questions section | info |
| W503 | No test cases defined | warning |

---

## Output Format

### Default (human-readable)

```
E101 Missing section: Errors (specs/stories/storage/read.md)
E203 Duplicate ID: story.storage.read (specs/stories/cache/read.md)
W501 Lowercase "must" found, use "MUST" (specs/stories/auth/login.md:42)

2 errors, 1 warning
```

### JSON (`--format json`)

```json
{
  "errors": [
    {
      "code": "E101",
      "message": "Missing section: Errors",
      "file": "specs/stories/storage/read.md",
      "line": null
    }
  ],
  "warnings": [...],
  "summary": { "errors": 2, "warnings": 1 }
}
```

---

## AI Advisory Mode (v0.2+)

`nara lint --ai` adds non-blocking suggestions:

- Ambiguous language ("fast", "secure", "soon")
- Missing edge cases
- Inconsistent terminology vs glossary
- Unstated assumptions

AI checks **never fail the lint**. They produce `info` level messages only.

---

## Implementation Notes

- Parse markdown with a simple heading-based splitter (no full AST needed)
- ID regex: `/^story\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/`
- Inputs/Outputs: match lines like `- name: type` or `name: type`
- Build ID index first, then check references in second pass
