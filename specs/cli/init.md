# nara init

Creates a fresh Narrative Development repository from scratch.

---

## When to Use

Use `nara init` when starting a **new project** where Narrative Development is the primary methodology from day one.

For **existing codebases**, use [`nara adopt`](adopt.md) instead, which creates narrative artifacts under `nara/` without touching existing files.

---

## Purpose

`nara init` exists to:

- Establish a Narrative Development–compliant repository
- Make the project immediately usable by AI CLI tools
- Enforce a spec-first, story-based workflow
- Minimize upfront structure and token usage

No code is generated.
No AI calls are made.
No assumptions about architecture or stack are introduced.

## Command

```
nara init [options]
```

### Flags

| Flag | Description |
|------|-------------|
| `--name <name>` | Project name (default: directory name) |
| `--desc <description>` | Project description |
| `--yes` | Use defaults for all prompts |

## Manifest Capture

`nara init` MUST generate `specs/manifest.md` by delegating narrative reasoning to AI when configured.

nara collects minimal hard input:

- project name
- short description
- one-sentence intent ("What are you trying to build?")

nara invokes AI with:

- conventions index
- manifest template structure
- safety prohibitions (no invention, no code edits)

AI returns a complete manifest and Open Questions for unknowns.

If AI is not configured, nara MUST offer to run `nara detect` before falling back to the manifest template with Open Questions.

## Existing Files Check

If the target directory contains existing files, `nara init` MUST confirm that the user intends a greenfield project.

- If the user declines, `nara init` MUST abort and direct them to `nara adopt`

Core Guarantees

After nara init:

The repository has a single canonical source of truth (specs/)

AI tools know where to look and what rules to follow (AGENTS.md)

Specifications are written as atomic, testable stories

The project can grow organically through conversation and iteration

Files and Folders Created
Repository Root

README.md
The Narrative Development manifesto (already defined elsewhere).

INDEX.md
Single entry point for narrative artifacts.

AGENTS.md
Primary entry point for AI tools.
Contains minimal, token-efficient instructions and pointers to authoritative conventions.

NARA.md
Tooling contract for humans and automation:

canonical folders

non-determinism disclaimer

rules for generated output

extension points

.gitignore
Defaults to ignoring generated and local state.

.nara/
Local tool state (optional, may be gitignored).

Canonical Specification Root

specs/ is the only authoritative source of system intent.

Nothing outside specs/ defines what the system is supposed to do.

Contents created by nara init:

specs/manifest.md

Project-level intent:

project name

short description

scope and non-goals

target users

current maturity

Open Questions

This file answers: “What are we even building?”

specs/glossary.md

Shared vocabulary.

All important domain terms SHOULD be defined here once and referenced elsewhere by name or ID.

This prevents silent semantic drift.

specs/conventions/

This folder contains all rules and conventions.
Nothing is duplicated into AGENTS.md to save tokens.

Files created:

specs/conventions/index.md
Single entry point for rules.
AI tools are expected to read this file first.

specs/conventions/atomic-stories.md
Defines the Atomic Stories principle:

one capability per file

fixed inputs and outputs

explicit errors

explicit composition

when atomicity is not appropriate

specs/conventions/rfc-keywords.md
Defines normative language inspired by:

RFC 2119

RFC 8174
Clarifies that keywords express intent, not determinism or enforcement.

specs/conventions/naming-and-ids.md
Defines:

folder naming rules

file naming rules

stable story ID format

reference rules

specs/stories/

Default home for atomic narrative stories.

Created with:

specs/stories/_template.md

This template is optimized for:

human clarity

AI reasoning

code and test generation

Template sections:

ID

Purpose

Inputs

Outputs

Behavior

Existing Implementation

As Implemented

Intended Behavior

Constraints

Errors

Dependencies

Acceptance Criteria

Tests

Given / When / Then cases

Negative cases

Optional fixtures

Open Questions

Generated Output

generated/

This folder is explicitly disposable.

Rules:

All AI-generated code goes here unless stated otherwise

Humans SHOULD NOT hand-edit files here

Output may change between runs

No guarantees of determinism or equivalence

AGENTS.md (AI Entry Point)

AI CLI tools typically scan for AGENTS.md first.

nara init creates a minimal, pointer-based AGENTS.md to reduce token usage.

It MUST:

Declare that specs/ is canonical

Instruct AI to read specs/conventions/index.md

Prohibit inventing requirements

Require missing information to be surfaced as questions

Instruct AI to load only relevant files

AGENTS.md MUST NOT:

duplicate conventions

include long explanations

embed full templates

restate the manifesto

It is a routing file, not a rules dump.

Token Efficiency Rules (Normative)

All AI-assisted interactions MUST follow these rules:

Load only the minimum required spec files

Prefer referencing story IDs over copying text

Do not restate conventions; point to them

If information is missing, write Open Questions instead of guessing

This is a first-class design constraint.

What nara init Explicitly Does NOT Do

Does not create domains, APIs, UI, or data folders

Does not generate any executable code

Does not require an API key

Does not assume a tech stack

Does not promise reproducible builds

Does not enforce structure beyond invariants

Structure emerges later via:

nara new story

nara ask

ongoing narrative refinement

Design Intent

nara init is intentionally boring.

Its job is not to impress.
Its job is to establish a clean narrative surface that can grow through real conversation.

If nara init feels lightweight, that is by design.

Summary

After nara init:

Humans know where intent lives

AI knows where rules live

Stories are atomic and testable

Nothing unnecessary exists yet

Everything else is earned.

If you want next, the highest-leverage follow-ups are:

define AGENTS.md exact contents (copy-paste ready),

define specs/conventions/index.md exactly,

or define nara new story behavior step by step.
