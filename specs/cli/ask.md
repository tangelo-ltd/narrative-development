# nara ask

**Status:** v0.1 (not in initial release)

Re-opens an existing story to drive Open Questions toward resolution.

---

## Command

```
nara ask story <id>
```

### Example

```bash
nara ask story storage.read
```

---

## Purpose

Takes a story with Open Questions and:
1. Presents questions to the user interactively
2. Records answers in the story
3. Updates relevant sections based on answers
4. Removes resolved questions

---

## Reads

| File | Purpose |
|------|---------|
| Target story file | Current state |
| `specs/conventions/index.md` | Context for AI |

---

## Writes

| File | Action |
|------|--------|
| Target story file | Update with answers |

Only the specified story file is modified.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Questions resolved (or none existed) |
| 1 | Story not found or invalid ID |
| 2 | AI invocation failed |

---

## Flow

1. Load story by ID
2. Parse Open Questions section
3. If no questions, exit with message
4. For each question:
   - Present to user
   - Capture answer
   - If AI enabled, propose updates to story sections
5. Write updated story
6. Report remaining questions (if any)

---

## AI Behavior

When AI is enabled, it may propose updates to:
- Inputs/Outputs (add fields mentioned in answers)
- Behavior (add steps)
- Errors (add conditions)
- Constraints (add limits)

All proposals require user confirmation before writing.

---

## Implementation Notes

Deferred to v0.1. Requires:
- Story parser (shared with lint/status)
- Interactive prompt loop
- AI integration (optional)
