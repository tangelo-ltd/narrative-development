# nara status

Reports the current health of the narrative repository.

---

## Command

```
nara status
```

No arguments. Operates on the current repository.

### Flags

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON for tooling |
| `--verbose` | Show full file paths and details |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Status reported successfully |
| 2 | Not in a nara repository |

---

## Output

### Default (human-readable)

```
nara status

Stories: 12
  Complete: 8
  With Open Questions: 3
  Incomplete: 1

Open Questions (3 stories):
  storage.read (2 questions)
  auth.login (1 question)
  cache.invalidate (3 questions)

Incomplete Stories:
  api.healthcheck - missing Errors section

AI Provider: claude (configured)

Suggestion: nara story homepage
Reason: You have no stories yet and the manifest describes a single marketing page.
```

### JSON (`--json`)

```json
{
  "stories": {
    "total": 12,
    "complete": 8,
    "withOpenQuestions": 3,
    "incomplete": 1
  },
  "openQuestions": [
    { "id": "story.storage.read", "count": 2 },
    { "id": "story.auth.login", "count": 1 },
    { "id": "story.cache.invalidate", "count": 3 }
  ],
  "incomplete": [
    { "id": "story.api.healthcheck", "missing": ["Errors"] }
  ],
  "ai": {
    "provider": "claude",
    "configured": true
  }
}
```

---

## Definitions

### Complete Story

A story is **complete** when:
- All required sections for its type are present (see `specs/files/story-types.md`)
- Open Questions section is empty or absent

### Incomplete Story

A story is **incomplete** when any required section is missing.

### Story with Open Questions

A story that has all required sections but has entries in Open Questions.

---

## Reads

| File/Directory | Purpose |
|----------------|---------|
| `specs/stories/**/*.md` | All story files |
| `.nara/config.json` | AI provider status |
| `nara.json` | Project configuration |
| `specs/manifest.md` | Context for AI suggestions |
| `.nara/state.json` | Last intent (if available) |

---

## Writes

None. Status is read-only.

---

## AI Suggestions

If an AI provider is configured, `nara status` MAY generate a single suggested next action.

- The suggestion MUST be printed with the exact command to run
- The suggestion MUST include a short reason
- The AI call MUST be announced (no silent invocation)

---

## Implementation Notes

- Reuse the same parser as `nara lint` for section detection
- Count Open Questions by matching `Q1:`, `Q2:`, etc. or bullet points
- AI provider status: check if `ai.provider` is set and not `"none"`
