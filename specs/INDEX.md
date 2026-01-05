# nara CLI Specification Index

This is the authoritative entry point for all nara specifications.

## Two Repository Modes

nara supports two modes of operation:

| Mode | Command | Narrative Root | Use Case |
|------|---------|----------------|----------|
| **Fresh repo** | `nara init` | `.nara/` directory | New projects built with Narrative Development |
| **Existing codebase** | `nara adopt` | `.nara/` directory | Adding narratives to existing projects |

When onboarding existing codebases, all narrative artifacts live under `.nara/` and existing code is never modified.
Normal project code remains in the repository root.

---

## How to Use This Index

- **Implementing nara?** Start with [cli/commands.md](cli/commands.md) for the command surface, then read individual command specs.
- **Understanding config?** See [config/schema.md](config/schema.md) for file formats and [config/precedence.md](config/precedence.md) for resolution rules.
- **Integrating AI?** See [ai/adapters.md](ai/adapters.md) for the adapter contract and [ai/prompts.md](ai/prompts.md) for prompt envelopes.
- **Working with story files?** See [files/formats.md](files/formats.md) for the canonical format, [files/story-types.md](files/story-types.md) for allowed types, and [files/naming.md](files/naming.md) for ID conventions.
- **Onboarding existing code?** Start with [cli/adopt.md](cli/adopt.md) and review the "As Implemented" rules in [files/formats.md](files/formats.md).

---

## Commands

| Spec | Purpose | v0 Status |
|------|---------|-----------|
| [cli/commands.md](cli/commands.md) | Command surface, flags, exit codes | Required |
| [cli/init.md](cli/init.md) | Fresh repository initialization | Required |
| [cli/adopt.md](cli/adopt.md) | Onboard existing codebase | Required |
| [cli/detect.md](cli/detect.md) | AI tool detection and selection | Required |
| [cli/configure.md](cli/configure.md) | Configuration management | Required |
| [cli/new-story.md](cli/new-story.md) | AI-orchestrated story capture | Required |
| [cli/status.md](cli/status.md) | Narrative health reporting | Required |
| [cli/lint.md](cli/lint.md) | Specification linting | v0.1 |
| [cli/ask.md](cli/ask.md) | Follow-up question flow | v0.1 |

## Configuration

| Spec | Purpose |
|------|---------|
| [config/schema.md](config/schema.md) | Config file schemas and defaults |
| [config/precedence.md](config/precedence.md) | Config resolution rules |

## AI Integration

| Spec | Purpose |
|------|---------|
| [ai/adapters.md](ai/adapters.md) | Adapter contract and built-in adapters |
| [ai/prompts.md](ai/prompts.md) | Prompt envelopes and output parsing |

## File Formats

| Spec | Purpose |
|------|---------|
| [files/formats.md](files/formats.md) | Story file format specification |
| [files/naming.md](files/naming.md) | ID format, path conventions |

---

## Related Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| Manifesto | [/README.md](/README.md) | What Narrative Development is |
| Roadmap | [/ROADMAP.md](/ROADMAP.md) | Version boundaries and future plans |
| Implementation Guide | [/docs/PROJECT-SETUP.md](/docs/PROJECT-SETUP.md) | How to build nara |
| Existing Code Onboarding (Summary) | [/NARA-EXISTING-CODE.md](/NARA-EXISTING-CODE.md) | Pointer to adopted codebase rules |
| Seed Templates | [/nara/seed/](/nara/seed/) | Files created by `nara init` |
| JSON Schemas | [/schemas/](/schemas/) | Machine-readable config schemas |
