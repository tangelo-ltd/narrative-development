# nara

Narrative Development CLI - intent-first specs for human + AI collaboration.

## Installation

```bash
npm install -g @tangeloltd/narrative-development
```

Aliases:

- `@tangeloltd/nara`
- `@tangeloltd/nara-cli`

Or run directly with npx:

```bash
npx @tangeloltd/narrative-development init
```

## Quickstart

```bash
nara init
nara story storage.read
```

`nara` will prompt you for any missing details (AI tool selection, settings, and story inputs).

## Commands

Most commands are interactive by default. If you skip flags or config, `nara` will prompt you for anything it needs.
Using external AI providers may incur usage costs depending on your configured tool and account (e.g. Gemini, Claude, Codex).

### Initialize a project

```bash
nara init
nara init --name "My Project" --desc "A description"
```

This creates a `.nara/` directory in the project root that contains all narrative artifacts.

### Detect AI tools

```bash
nara detect
```

Scans for installed AI CLI tools (codex, claude, gemini) and sets your preference.
Optional: if you skip this, `nara` will still prompt you when it needs an AI tool.

To re-select interactively at any time:

```bash
nara --config
```

### Configure settings

```bash
nara configure ai.provider=claude
nara configure ai.command=/path/to/custom-ai
```

Optional: use this if you prefer setting values directly instead of answering prompts.

### Create a story

```bash
nara story storage.read
```

Creates a new story via AI-orchestrated capture.

### Check status

```bash
nara status
nara status --json
```

Reports narrative health: story counts, open questions, incomplete stories.

## What is Narrative Development?

Narrative Development treats specifications as the source of truth and code as a derived artifact. Instead of writing code first and documenting later, you:

1. Write stories that describe capabilities
2. Review and refine specifications
3. Generate code from clear intent

See the full manifesto on GitHub: https://github.com/tangelo-ltd/narrative-development

## Narrative Development Protocol (NDP)

The Narrative Development Protocol (NDP) defines how narrative intent is captured, structured, and evolved so humans and tools can interoperate safely.

The term "Narrative Development" was coined by Ramazan Yavuz and developed by Tangelo Bilişim Ltd.

The protocol uses RFC 2119 keywords (MUST, SHOULD, MAY) to express requirements.

Protocol spec: https://github.com/tangelo-ltd/narrative-development/blob/main/specs/protocol.md

Short forms:

- Narrative Development = ND
- Narrative Development Protocol = NDP
- `nara` = the canonical CLI for ND/NDP workflows

Core protocol expectations:

- Publish a manifest that declares intent, scope, and non-goals.
- Maintain a shared glossary for domain terms.
- Define stories with stable identifiers, explicit inputs/outputs, constraints, and error cases.
- Keep stories atomic and composable when possible.
- Treat code as a provisional interpretation of the narrative.

The protocol is path-agnostic; `nara` provides defaults, but the contract is the structure and meaning of the artifacts.

## Development

```bash
npm install
npm test
npm run lint
```

## License

MIT
