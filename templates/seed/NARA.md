# nara Project Configuration

This file documents the nara project structure for humans and tooling.

## Canonical Paths

| Path | Purpose |
|------|---------|
| `INDEX.md` | Single entry point for narrative artifacts |
| `specs/` | All specifications (source of truth) |
| `specs/manifest.md` | Project intent and scope |
| `specs/glossary.md` | Shared vocabulary |
| `specs/conventions/` | Rules and constraints |
| `specs/stories/` | Atomic capability specifications |

## Non-Determinism Disclaimer

AI-assisted operations (story capture, clarification, code generation) are non-deterministic. Different runs may produce different outputs. Generated artifacts are interpretations, not guarantees.

## File Ownership

| Path | Editable By |
|------|-------------|
| `specs/**` | Humans (AI may propose, humans approve) |
| `AGENTS.md` | Humans only |
| `.nara/` | nara CLI (gitignored) |

## Extension Points

- Custom conventions: add files to `specs/conventions/`
- Domain glossary: extend `specs/glossary.md`
- Story templates: modify `specs/stories/_template.md`
