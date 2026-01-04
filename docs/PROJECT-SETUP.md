# Project Setup

Implementation guide for building the nara CLI.

**Author:** Ramazan Yavuz

---

## Goal

Implement nara as a cross-platform CLI tool using Node.js and JavaScript, published to npm so anyone can install and use it. The package should expose three commands: nara (canonical), plus aliases nd and narra.

---

## Technology Choices

| Category | Choice | Notes |
|----------|--------|-------|
| Runtime | Node.js (LTS) | 18+ recommended, 20+ for fewer polyfills |
| Language | JavaScript (ESM) | `"type": "module"` in package.json |
| CLI framework | commander | Simple, widely used |
| Process execution | execa | Reliable subprocess execution |
| Interactive prompts | @inquirer/prompts | Modern, minimal |
| Config validation | zod | Recommended to avoid config drift |
| File operations | Node built-ins | `fs/promises`, `path` |
| Diff display | git diff | Shell out when available |
| Testing | vitest | Fast, simple, good for snapshots |
| Linting | eslint + prettier | Standard tooling |

---

## Distribution Strategy (npm)

Primary distribution via npm package that installs global binaries: `nara`, `nd`, `narra`.

```bash
npm i -g nara
npx nara init
```

**Naming note:** If `nara` is taken on npm, use a scope: `@ramazanyavuz/nara` but still expose the binary as `nara` via the bin field.

---

## Minimum Supported Environments

- **Node.js:** 18+ (recommended 20+)
- **OS:** Windows, macOS, Linux
- **Shell:** any (nara must not assume bash)

---

## Project Structure

```
src/
  cli.js                    # entrypoint, command registration
  commands/
    init.js
    newStory.js
    detect.js
    configure.js
    status.js
  core/
    paths.js                # repo root discovery, path conventions
    config.js               # load/merge/validate config
    templates.js            # seed templates for init
    fs.js                   # safe file read/write helpers
  ai/
    adapters/
      codex.js
      claude.js
      gemini.js
      custom.js
    invoke.js               # execute adapter, capture stdout
  spec/
    id.js                   # story id rules
    naming.js               # name validation
    storyTemplate.js        # template rendering

seed/                       # the init skeleton, copied into new projects
  AGENTS.md
  NARA.md
  specs/
    manifest.md
    glossary.md
    conventions/
      index.md
      atomic-stories.md
      rfc-keywords.md
      naming-and-ids.md
    stories/
      _template.md
  .gitignore

tests/
  init.test.js              # golden file checks
  detect.test.js            # mock PATH
  newStory.test.js          # file placement and content

README.md                   # tool repo README
LICENSE
```

**Note:** Keeping `seed/` checked in makes `nara init` deterministic and easy to test.

---

## npm Package Configuration

### package.json requirements

```json
{
  "name": "@ramazanyavuz/nara",
  "version": "0.0.1",
  "type": "module",
  "description": "Narrative Development CLI (nara)",
  "author": "Ramazan Yavuz",
  "license": "MIT",
  "bin": {
    "nara": "src/cli.js",
    "nd": "src/cli.js",
    "narra": "src/cli.js"
  },
  "files": ["src", "seed", "LICENSE", "README.md"],
  "keywords": ["cli", "spec-first", "narrative-development", "documentation", "ai"]
}
```

Entrypoint file (`src/cli.js`) must start with:
```
#!/usr/bin/env node
```

---

## Development Commands

```json
{
  "scripts": {
    "lint": "eslint src/ tests/",
    "format": "prettier --write .",
    "test": "vitest run"
  }
}
```

---

## Publishing Workflow

### One-time setup
```bash
npm login
# If using a scope:
npm publish --access public
```

### Release steps (manual, v0)
```bash
npm version patch|minor|major
npm test
npm run lint
npm publish
```

---

## CLI Behavior Expectations

1. **nara must work without any AI tool installed** — AI CLIs are optional integrations
2. **User choice when multiple AI CLIs detected** — prompt and persist to `.nara/config.json`
3. **Token efficiency** — pass minimal context, point to conventions
4. **Scoped file writes per command:**
   - `init`: writes seed skeleton only
   - `new story`: writes only the new story file
   - `detect`/`configure`: writes config only

---

## Next Implementation Milestones

1. Implement `nara init` using seed/ copy + small substitutions (project name/desc)
2. Implement `nara detect` (PATH scanning, prompt if multiple, persist config)
3. Implement `nara configure` (write config fields safely)
4. Implement `nara new story` interactive capture (no AI required initially)
5. Implement `nara status` (list stories, open questions)

This is sufficient to ship an installable v0 to npm and start getting real user feedback.
