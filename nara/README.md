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

## Commands

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

Scans for installed AI CLI tools (codex, claude, gemini) and configures your preference.

To re-select interactively at any time:

```bash
nara --config
```

### Configure settings

```bash
nara configure ai.provider=claude
nara configure ai.command=/path/to/custom-ai
```

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

See the [README.md](../README.md) in the parent directory for the full manifesto.

## Development

```bash
npm install
npm test
npm run lint
```

## License

MIT
