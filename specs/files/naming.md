# Naming and ID Conventions

This document defines naming rules for story IDs, files, and directories.

---

## Story ID Format

Every story has a unique, stable identifier.

**Format:** `story.<subsystem>.<verb>`

**Regex:** `^story\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$`

### Rules

| Rule | Valid | Invalid |
|------|-------|---------|
| Lowercase only | `story.storage.read` | `story.Storage.Read` |
| Letters, numbers, hyphens | `story.auth-v2.login` | `story.auth_v2.login` |
| Must start with letter | `story.cache.get` | `story.2cache.get` |
| Exactly 3 parts | `story.storage.read` | `story.read`, `story.a.b.c` |

### Examples

```
story.storage.read       # valid
story.storage.write      # valid
story.auth.login         # valid
story.auth-v2.refresh    # valid (hyphen allowed)
story.cache.invalidate   # valid

story.Storage.read       # INVALID (uppercase)
story.storage            # INVALID (missing verb)
story.storage.read.v2    # INVALID (too many parts)
```

---

## File Path Convention

Story files SHOULD be placed at:

```
specs/stories/<subsystem>/<verb>.md
```

The path SHOULD match the ID:

| ID | Expected Path |
|----|---------------|
| `story.storage.read` | `specs/stories/storage/read.md` |
| `story.auth-v2.login` | `specs/stories/auth-v2/login.md` |

This is a SHOULD, not a MUST. The ID is authoritative; path is organizational.

---

## Subsystem Naming

Subsystem names (the middle part of an ID) represent logical groupings.

### Guidelines

- Use singular nouns: `storage`, `auth`, `cache` (not `storages`)
- Use hyphens for multi-word: `user-management`, `api-gateway`
- Keep short but meaningful
- No version suffixes unless necessary: prefer `auth` over `auth-v1`

### Reserved Subsystem Names

These subsystem names have special meaning:

| Name | Purpose |
|------|---------|
| `_internal` | Implementation details, not public API |
| `_flow` | Composition/orchestration stories |
| `_contract` | Shared contracts (auth, validation) |

---

## Verb Naming

Verbs (the last part of an ID) describe the operation.

### Guidelines

- Use imperative verbs: `read`, `write`, `delete`, `validate`
- Use hyphens for compound: `validate-token`, `send-email`
- Be specific: `get-by-id` over `get`

### Common Verbs

| Verb | Meaning |
|------|---------|
| `create` | Add new entity |
| `read` / `get` | Retrieve entity |
| `update` | Modify existing entity |
| `delete` | Remove entity |
| `list` | Enumerate entities |
| `validate` | Check correctness |
| `exists` | Check presence |

---

## Directory Structure

```
specs/
  stories/
    <subsystem>/
      <verb>.md
      <verb>.md
    <subsystem>/
      ...
```

### Creating New Subsystems

`nara story` creates the subsystem directory automatically if it doesn't exist.

### Index Files (Optional)

Subsystem directories MAY contain `_index.md` for overview documentation:

```
specs/stories/storage/
  _index.md      # optional: subsystem overview
  read.md
  write.md
  delete.md
```

---

## ID Stability

IDs are **stable identifiers**. Once assigned, they should not change.

- If you rename a file, keep the ID the same
- If you refactor a subsystem, update file paths but preserve IDs
- Use `lint --fix` to detect ID/path mismatches

---

## References

Stories reference each other by ID in the Dependencies section:

```markdown
## Dependencies

- story.auth.validate-token
- story.storage.exists
```

References MUST use the full ID, not file paths.
