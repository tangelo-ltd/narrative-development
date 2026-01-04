# Story File Format

This document defines the authoritative format for story files.

---

## File Location

Stories live under `specs/stories/` by default (configurable via `storiesRoot`).

```
specs/stories/<subsystem>/<verb>.md
```

Example: `specs/stories/storage/read.md`

---

## Required Sections

Every story file MUST include these core sections:

| Section | Heading | Purpose |
|---------|---------|---------|
| ID | `## ID` | Unique stable identifier |
| Type | `## Type` | Story type (see story types) |
| Purpose | `## Purpose` | One-sentence description |
| Behavior | `## Behavior` | Step-by-step operation |

Additional required sections depend on the story type. See [story-types.md](story-types.md).

---

## Optional Sections

These sections are recommended but not required:

| Section | Heading | Purpose |
|---------|---------|---------|
| Existing Implementation | `## Existing Implementation` | Code paths and notes that ground the story in real files |
| Constraints | `## Constraints` | Limits, invariants, preconditions |
| Dependencies | `## Dependencies` | Other stories this depends on |
| Tests | `## Tests` | Given/When/Then examples |
| As Implemented | `## As Implemented` | What the code does today (required during onboarding) |
| Intended Behavior | `## Intended Behavior` | Target behavior when different from today |
| Open Questions | `## Open Questions` | Unresolved uncertainties |

---

## Section Format Details

### ID

Single line, format: `story.<subsystem>.<verb>`

```markdown
## ID

story.storage.read
```

**Regex:** `^story\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$`

### Type

Single line value matching a known story type.

```markdown
## Type

operation
```

Allowed types are defined in [story-types.md](story-types.md).

### Purpose

One sentence describing what this operation does.

```markdown
## Purpose

Retrieves a value from the key-value store by its key.
```

### Inputs

List of parameters. Each line: `- name: type` or `- name: type — description`

```markdown
## Inputs

- key: string — the lookup key
- tenantId: string — tenant context
```

**Allowed types:** `string`, `number`, `boolean`, `object`, `array`, `null`, or compound types like `string | null`, `string[]`.

### Outputs

Same format as Inputs. Include success and error return shapes.

```markdown
## Outputs

- value: string | null — the stored value, or null if not found
```

### Behavior

Numbered or bulleted steps describing the operation.

```markdown
## Behavior

1. Validate that key is non-empty
2. Look up key in the store for the given tenant
3. If found, return the value
4. If not found, return null
```

### Errors

List of error conditions. Format: `- ErrorName: when condition`

```markdown
## Errors

- InvalidKey: when key is empty or malformed
- TenantNotFound: when tenantId does not exist
```

### Existing Implementation

List concrete code locations and notes.

```markdown
## Existing Implementation

Paths:
- src/storage/read.js
- src/storage/index.js

Notes:
- Mirrors current behavior, including quirks.
```

### As Implemented

Describe what the code does today. Use this during onboarding.

```markdown
## As Implemented

Reads from Redis first, then falls back to the SQL cache if missing.
```

### Intended Behavior

Describe the desired behavior when it differs from today.

```markdown
## Intended Behavior

Use SQL as the source of truth and invalidate Redis on write.
```

### Constraints

Limits, invariants, or preconditions.

```markdown
## Constraints

- Key length MUST NOT exceed 256 characters
- Operation MUST be idempotent
```

### Dependencies

References to other stories by ID.

```markdown
## Dependencies

- story.auth.validate-token
- story.storage.exists
```

### Tests

Given/When/Then format.

```markdown
## Tests

### Happy path
- Given: key "user:123" exists with value "Alice"
- When: read is called with key "user:123"
- Then: returns "Alice"

### Key not found
- Given: key "missing" does not exist
- When: read is called with key "missing"
- Then: returns null
```

### Open Questions

Numbered list of unresolved items.

```markdown
## Open Questions

- Q1: Should read return metadata (created_at, version)?
- Q2: What happens if the store is temporarily unavailable?
```

---

## Existing Codebases

When onboarding an existing project:

- `## As Implemented` MUST be present in each story created during onboarding
- `## Intended Behavior` MAY be added later when the desired behavior differs
- `## Existing Implementation` SHOULD list concrete paths and notes

Stories must describe what the code **appears to do**, not what it should do.

---

## Heading Rules

- Headings MUST be exactly as specified (case-sensitive)
- Use `##` (h2) for all section headings
- No variations: `Input` is not valid, only `Inputs`
- Order SHOULD follow the sequence above but is not enforced

---

## Unknown Values

If a section value is unknown, use:

```markdown
## Inputs

Unknown. See Open Questions Q1.
```

Do NOT use `TODO`, `TBD`, or leave sections empty without explanation.

---

## Complete Example

```markdown
## ID

story.storage.read

## Type

operation

## Purpose

Retrieves a value from the key-value store by its key.

## Inputs

- key: string — the lookup key
- tenantId: string — tenant context

## Outputs

- value: string | null — the stored value, or null if not found

## Behavior

1. Validate that key is non-empty
2. Look up key in the store for the given tenant
3. If found, return the value
4. If not found, return null

## Constraints

- Key length MUST NOT exceed 256 characters
- Operation MUST be idempotent

## Errors

- InvalidKey: when key is empty or malformed
- TenantNotFound: when tenantId does not exist

## Dependencies

- story.auth.validate-token

## Tests

### Happy path
- Given: key "user:123" exists with value "Alice"
- When: read is called with key "user:123"
- Then: returns "Alice"

### Key not found
- Given: key "missing" does not exist
- When: read is called with key "missing"
- Then: returns null

## Open Questions

- Q1: Should we support batch reads?
```
