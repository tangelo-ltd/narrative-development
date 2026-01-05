# Narrative Development

Intent-first software development where specifications are the source of truth and code is a derived artifact.

## Install

Prerequisites:

- Node.js >= 18
- npm

Install from npm (recommended):

```bash
npm install -g @tangeloltd/narrative-development
```

Or install locally in a project:

```bash
npm install --save-dev @tangeloltd/narrative-development
```

Run without installing:

```bash
npx @tangeloltd/narrative-development --help
```

Aliases:

- `@tangeloltd/nara`
- `@tangeloltd/nara-cli`

Then run:

```bash
nara --help
```

Most commands are interactive by default. If you skip flags or config, `nara` will prompt you for anything it needs.
Using external AI providers may incur usage costs depending on your configured tool and account (e.g. Gemini, Claude, Codex).

## Quickstart

```bash
nara init
nara story storage.read
```

`nara` will prompt you for any missing details (AI tool selection, settings, and story inputs).

Install from source:

Steps:

1. Clone this repo or download the ZIP from GitHub.
2. Make the install script executable:
   `chmod +x install.sh`
3. Run the installer (may prompt for sudo):
   `./install.sh`

The script installs dependencies and creates machine-wide commands in `/usr/local/bin`:

- `nara`
- `narra`
- `nd`

Verify with:

`nara --help`

Uninstall:

1. Make the uninstall script executable:
   `chmod +x uninstall.sh`
2. Run the uninstaller (may prompt for sudo):
   `./uninstall.sh`

## Mental Model

- `nara` is the contract.
- AI is the reasoner.
- The user stays in control.

`nara` orchestrates and constrains narrative work. AI structures and questions the narrative within those constraints.

## The Core Idea

Most software projects treat executable code as the canonical artifact and documentation as an approximation of intent. Narrative Development inverts this relationship.

In Narrative Development:

- Natural language specifications describe what the system is intended to do.
- Specifications capture intent, constraints, and assumptions.
- Executable code is a materialization of that intent at a given point in time.
- Code may change shape, structure, or implementation strategy without invalidating the underlying narrative.
- If code and specifications disagree, the specifications represent the intended system, even if the implementation diverges.

## Start Minimal, Grow Deliberately

Narrative Development is designed to begin with minimal knowledge and minimal structure. A new project starts with only:

- A declaration of intent.
- A shared vocabulary.
- A place for specifications to grow.

As understanding increases, the repository structure expands only when justified by the narrative.

- No folder, file, or abstraction is created up front because it is considered best practice.
- Structure emerges because the narrative becomes too complex to express without it.

## What Counts as a Specification

A specification is a human-authored, structured, natural language document that records intent.

A specification MAY describe:

- Behavior.
- Constraints.
- Assumptions.
- Boundaries.
- Responsibilities.
- Expectations.

Specifications:

- Live in the repository.
- Are version-controlled.
- Are reviewed and discussed.
- Evolve as understanding evolves.

Specifications are not:

- Comments inside code.
- Prompts sent to a model.
- Generated explanations.
- Post-hoc documentation.

They are the primary narrative of the system.

## Atomic Stories (Core Principle)

Narrative Development favors small, self-contained specification units, referred to as stories. A story describes one capability with a clear and explicit boundary.

This principle exists because both humans and AI systems reason most reliably about narrow, atomic units with well-defined inputs and outputs.

### Atomic by Default

Specifications SHOULD be written as small, self-contained stories rather than large monolithic documents.

A story SHOULD:

- Have a single responsibility.
- Be understandable in isolation.
- Declare dependencies explicitly when required.

Large documents that mix multiple responsibilities SHOULD be split as understanding improves.

### One File per Capability

When a subsystem exposes discrete capabilities, each capability SHOULD be represented as a separate specification file.

Instead of a single document such as:

- `storage.md`

Prefer a structure such as:

- `specs/storage/`
- `read.md`
- `write.md`
- `delete.md`
- `list.md`

Each file represents one story.

### Fixed Narrative Interfaces

Each story that describes an operation MUST define:

- A stable identifier.
- Explicit inputs (parameters and shape).
- Explicit outputs (return values and error cases).
- Behavioral expectations.
- Constraints and invariants.

This creates a narrative interface that can be implemented across different stacks and technologies.

### Explicit Errors and Edge Cases

If an operation can fail, its failure modes MUST be specified explicitly.

Errors are part of the output contract, not implicit behavior.

### Composition Is Explicit

Complex behavior SHOULD be expressed through composition, not hidden inside atomic stories.

If an operation requires multiple steps, it SHOULD be represented as:

- A higher-level story that composes lower-level stories, or
- A flow specification that references stories by identifier.

Atomic stories remain simple. Complexity lives in composition.

### Generated Code Mirrors Story Boundaries

Generated code SHOULD preserve story boundaries. Where the target stack allows, this means:

- One function or module per story.
- Explicit inputs and outputs matching the specification.
- No hidden coupling between stories.

Shared helpers MAY exist, but they MUST NOT alter or obscure story interfaces.

### When Not to Be Atomic

Atomic stories SHOULD NOT be forced when they reduce correctness or clarity. Examples include:

- Transactional behavior across multiple operations.
- Streaming or continuous processes.
- Batch or aggregate operations.
- Performance-critical combined operations.

In such cases, the specification MUST explain why atomicity is not appropriate.

## Normative Language and RFC Alignment

Narrative Development specifications use explicit normative keywords to communicate intent and constraints. The meaning of these keywords is inspired by:

- RFC 2119 - Key words for use in RFCs to Indicate Requirement Levels.
- RFC 8174 - Clarifying ambiguity of uppercase vs lowercase usage.

The following keywords are used with their established meanings:

- MUST / REQUIRED
- MUST NOT / SHALL NOT
- SHOULD / RECOMMENDED
- SHOULD NOT / NOT RECOMMENDED
- MAY / OPTIONAL

These keywords express importance and expectation, not enforcement or determinism.

## The Role of AI

AI is an assistant, not an authority.

AI tools MAY:

- Ask clarifying questions.
- Highlight ambiguity or missing information.
- Propose structure when narratives grow.
- Translate stories into code when explicitly requested.

AI tools MUST NOT:

- Invent requirements.
- Introduce new domain logic.
- Override human-authored intent.
- Claim correctness or completeness.

AI-driven transformations are non-deterministic by nature. Generated code is an interpretation, not a guarantee.

## Code Generation and Compilation

Narrative Development supports translating specifications into executable code, but makes no promise of deterministic or equivalent output.

Key principles:

- Compilation is explicit and user-initiated.
- Output reflects the current narrative and context.
- Different runs may produce different implementations.
- Generated code is expected to be reviewed, adapted, or discarded.

Code generation exists to accelerate understanding and implementation, not to replace judgment.

## The Workflow

Narrative Development follows an explicit loop:

- Write or refine stories.
- Identify ambiguity and missing intent.
- Ask questions to improve clarity.
- Translate intent into code when useful.
- Review results and evolve the narrative.

The narrative drives the process. The code remains provisional.

## The `nara` CLI

`nara` is the canonical command-line interface for Narrative Development. It is the primary entry point into a Narrative Development project, designed to keep intent explicit while making AI assistance safe and useful.

`nara` provides:

- Minimal initial setup.
- Progressive narrative growth.
- Atomic story creation.
- Explicit AI-assisted steps.
- Delegation to the user's preferred AI tooling.

If you have AI tools installed, `nara` can detect them, but this is optional; it will prompt you to choose or configure when needed.

Supported aliases:

- `nd`
- `narra`

All aliases behave identically, but `nara` is the canonical name.

## What Narrative Development Is Not

Narrative Development is not:

- A deterministic compiler.
- A prompt-to-code system.
- A code completion tool.
- An autonomous agent.
- A one-shot generator.
- A formal specification language.

It is a practice for keeping intent explicit as systems evolve.

## Why This Exists

Software changes faster than its original intent is remembered. Narrative Development exists to make intent:

- Explicit.
- Reviewable.
- Discussable.
- Evolvable.

By separating intent from implementation, teams can rebuild systems without losing understanding.

## One Sentence

If you remember nothing else:

> Narrative Development treats specifications as the durable record of intent and code as a provisional interpretation of that intent.

## Project Manifest

## Name

Narrative Development

## Description

Intent-first software development practice and toolset where narrative specifications are the source of truth and code is a derived artifact, supported by the `nara` CLI and related docs.

## Origin and Coinage

The term "Narrative Development" was coined by Ramazan Yavuz and developed by Tangelo Bilişim Ltd.

## Intended Users

- Product engineers, founders, and teams building software with AI assistance.
- Spec-driven teams who want intent preserved across rewrites.
- Open-source contributors adopting a shared narrative spec style.

## Primary Goal

- Establish narrative specifications as the durable record of intent and provide tooling that keeps code aligned to that intent.

## Non-Goals

- Replacing engineering judgment or human decision-making.
- Providing deterministic compilation from specs to code.
- Serving as a generic code-completion system.

## Project Type

- Methodology, specification format, and CLI tooling.

## Key Constraints

- Specs are human-authored and version-controlled.
- AI assistance is optional and does not override human intent.
- The CLI stays minimal and safe by default.

## Success Criteria

- Teams can start projects with only a manifest and stories.
- Users can evolve specs without losing original intent.
- The `nara` CLI is usable as a stable entry point to the workflow.

## Current State

Active development with published CLI packages and evolving documentation.

## Maturity

- [ ] Concept
- [x] In Development
- [ ] Alpha
- [ ] Beta
- [ ] Production

## Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Specs are the source of truth | Keep intent durable across rewrites | Ongoing |

## Legal Disclaimer

This software, documentation, and any associated guidance are provided "AS IS" and "AS AVAILABLE" without warranties or conditions of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, non-infringement, accuracy, or availability. You use Narrative Development and related tooling at your own risk. Tangelo Bilişim Ltd. and its contributors are not responsible for any actions you take or decisions you make based on outputs or recommendations.

You are solely responsible for how you configure, integrate, and use any third-party systems, including AI models, plugins, or external services. You are responsible for validating outputs, reviewing generated artifacts, and maintaining appropriate backups, access controls, and safeguards. The tooling does not guarantee correctness, safety, or security and may produce unexpected or incorrect results.

To the maximum extent permitted by applicable law, Tangelo Bilişim Ltd. and its contributors will not be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including data loss, service disruption, security incidents, hardware or system damage, loss of profits, or business interruption) arising out of or related to the use or misuse of the tooling, specifications, documentation, or any third-party services you choose to integrate, even if advised of the possibility of such damages. Some jurisdictions do not allow certain exclusions or limitations of liability, so some of the above may not apply to you.
