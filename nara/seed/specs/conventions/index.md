# Conventions Index

This is the entry point for all project conventions. AI tools should read this file first.

## Convention Files

| File | Purpose |
|------|---------|
| [atomic-stories.md](atomic-stories.md) | How to write atomic stories |
| [rfc-keywords.md](rfc-keywords.md) | Normative language (MUST, SHOULD, MAY) |
| [naming-and-ids.md](naming-and-ids.md) | ID format and naming rules |

## Quick Reference

### Story Structure

Every story MUST have: ID, Purpose, Inputs, Outputs, Behavior, Errors

Every story SHOULD have: Constraints, Tests, Open Questions

### ID Format

`story.<subsystem>.<verb>` — lowercase, letters/numbers/hyphens only

### Normative Keywords

- **MUST** — absolute requirement
- **SHOULD** — recommended, exceptions need justification
- **MAY** — optional

## Adding Conventions

To add a new convention:
1. Create a new `.md` file in this directory
2. Add it to the table above
3. Use clear, imperative language
