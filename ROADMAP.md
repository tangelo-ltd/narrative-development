# nara Roadmap

Version boundaries and future plans.

---

## v0.0 — Foundation

**Goal:** Installable CLI that captures narratives without requiring AI.

### Commands

| Command | Status | Notes |
|---------|--------|-------|
| `nara init` | Required | Copy seed files, substitute project name |
| `nara adopt` | Required | Onboard existing codebases under nara/ |
| `nara detect` | Required | Scan PATH for AI CLIs |
| `nara configure` | Required | Write user config |
| `nara new story` | Required | Interactive story capture |
| `nara status` | Required | Report narrative health |

### What Works Without AI

- All commands above function without any AI provider
- `new story` falls back to pure interactive capture
- Stories are valid and lintable

### Deliverable

Published npm package that can:
```bash
npm i -g @ramazanyavuz/nara
nara init
nara new story auth.login
nara status
```

---

## v0.1 — Quality

**Goal:** Validate and improve specifications.

### Commands

| Command | Status | Notes |
|---------|--------|-------|
| `nara lint` | New | Structural validation |
| `nara ask story <id>` | New | Resolve Open Questions |

### Enhancements

- `new story` Phase 3 consistency checks (AI-assisted)
- `lint --ai` advisory mode
- Error code registry for lint

---

## v0.2 — Generation

**Goal:** Translate specifications into code.

### Commands

| Command | Status | Notes |
|---------|--------|-------|
| `nara compile` | New | Generate code from stories |
| `nara diff` | New | Show changes since last compile |

### Scope

- Single-story compilation
- Target: JavaScript/TypeScript (initial)
- Output to `generated/` directory
- No determinism guarantees

---

## Future (Unscheduled)

| Feature | Description |
|---------|-------------|
| `nara watch` | Auto-lint on file change |
| `nara migrate` | Upgrade project structure |
| `nara test` | Generate test cases from stories |
| Multi-language targets | Python, Go, Rust |
| IDE integration | VS Code extension |
| CI/CD integration | GitHub Actions |

---

## Non-Goals

These are explicitly out of scope:

- **Deterministic compilation** — AI output varies
- **Formal verification** — Specs are natural language
- **Autonomous agents** — Human approval required
- **API key management** — User's responsibility
- **Model bundling** — Use external CLIs

---

## Versioning

- **0.x.y** — Breaking changes allowed
- **1.0.0** — Stable CLI surface, seed format frozen
- Semantic versioning after 1.0

---

## Contributing

Proposals for roadmap changes:
1. Open an issue describing the feature
2. Reference which version it targets
3. Explain impact on existing specs/commands
