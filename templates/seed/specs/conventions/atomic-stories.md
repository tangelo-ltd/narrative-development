# Atomic Stories

Stories are the fundamental unit of specification in Narrative Development.

## Principle

A story describes **one capability** with clear boundaries: purpose, inputs, outputs, and behavior.

## Why Atomic?

- AI assistance works best on narrow, well-defined units
- Smaller stories are easier to review and discuss
- Changes are isolated and traceable
- Code generation preserves clear boundaries

## Rules

### One Capability Per Story

Each story file describes exactly one operation or behavior.

**Good:**
```
specs/stories/storage/read.md
specs/stories/storage/write.md
specs/stories/storage/delete.md
```

**Bad:**
```
specs/stories/storage.md  # (contains read, write, delete, list...)
```

### Fixed Interface

Every story MUST define:
- Stable ID
- Inputs (with types)
- Outputs (with types)
- Error conditions

### Explicit Composition

Complex operations are expressed by composing simpler stories.

**Good:** A `create-order` story that references `validate-inventory` and `charge-payment`

**Bad:** A monolithic `process-order` story that does everything

### When NOT to Be Atomic

Some operations are inherently non-atomic:
- Transactions across multiple resources
- Streaming interfaces
- Batch operations
- Performance-critical combined operations

In these cases, the story MUST explain why atomicity is not appropriate.

## Story Template

See `specs/stories/_template.md` for the canonical format.
