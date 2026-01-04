# Naming and IDs

Rules for story identifiers and file naming.

## Story ID Format

**Pattern:** `story.<subsystem>.<verb>`

**Regex:** `^story\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$`

### Rules

- All lowercase
- Letters, numbers, hyphens only (no underscores)
- Must start with a letter
- Exactly three parts

### Examples

| Valid | Invalid | Why |
|-------|---------|-----|
| `story.storage.read` | `story.Storage.read` | uppercase |
| `story.auth-v2.login` | `story.auth_v2.login` | underscore |
| `story.cache.get` | `story.cache` | missing verb |

## File Paths

Stories live at: `specs/stories/<subsystem>/<verb>.md`

The path SHOULD match the ID:
- `story.storage.read` → `specs/stories/storage/read.md`
- `story.auth-v2.login` → `specs/stories/auth-v2/login.md`

## ID Stability

IDs are **permanent**. Once assigned:
- Do not change the ID when renaming files
- Do not reuse IDs from deleted stories
- Reference stories by ID, not by file path

## Subsystem Names

- Use singular nouns: `storage`, `auth`, `user`
- Use hyphens for multi-word: `user-profile`, `api-gateway`
- Avoid version suffixes unless necessary

## Verb Names

- Use imperative verbs: `read`, `create`, `validate`
- Use hyphens for compound: `get-by-id`, `send-email`
- Be specific over generic
