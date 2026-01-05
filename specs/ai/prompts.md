NARA-PROMPTS.md
Purpose

This document defines the canonical prompt envelopes used by nara when invoking AI CLIs.

The goal is to:

reduce brittleness across providers,

enforce consistent behavior,

minimize token usage,

prevent AI overreach.

Narrative Orchestration Model

nara is the orchestrator and constraint system.
AI is the reasoner.

nara MUST:
- decide scope and constraints
- provide minimal context
- validate outputs
- persist results

AI MUST:
- choose narrative shape and story type
- ask appropriate questions
- record unknowns as Open Questions

AI MUST NOT:
- invent requirements
- expand scope beyond the user intent
- claim to have inspected files not provided

AI Entry Points (AGENTS.md)

Projects MUST provide an `AGENTS.md` file at the narrative root (`.nara/`). It MUST:

- Point AI to `INDEX.md` first
- State that canonical narrative artifacts live under `.nara/specs/`
- Forbid code edits unless explicitly requested by the user
- Enforce token efficiency (load the minimum files needed)

AI Contract Header (Always Included)

This header is injected at the top of every AI prompt.

You are assisting with a Narrative Development project.

Rules:
- Specifications are the source of truth.
- Do not invent requirements or behavior.
- If information is missing, ask questions instead of guessing.
- Follow project conventions at: <conventionsIndex>.
- Be concise and token-efficient.


This header MUST NOT be modified per-command.

Context Assembly Rules
File Selection Algorithm

Always include:

target story (if applicable)

conventions index

Include additional files only if:

explicitly referenced by ID

required to resolve a dependency

glossary is enabled and terms are used

Stop when:

maxFiles is reached, or

maxBytes is exceeded

Ordering

Files MUST be appended in this order:

AI contract header

Conventions index

Referenced convention files

Target story

Referenced stories

Glossary (if enabled)

Prompt Envelopes
1. Create Narrative Artifact (nara init / nara story)

Used to create a manifest or story based on user intent.

Expected Output (JSON mode)

{
  "artifactType": "manifest",
  "content": "string",
  "openQuestions": ["string"]
}

{
  "artifactType": "story",
  "storyType": "page | component | operation | endpoint",
  "storyId": "story.subsystem.verb",
  "content": "string",
  "openQuestions": ["string"]
}

Rules:
- content MUST be full markdown for the artifact
- storyId MUST match the ID section in content
- storyType MUST match the Type section in content
- openQuestions MUST be reflected in the Open Questions section
- No TODO/TBD placeholders

2. Follow-up Questions (nara ask)

Used to request missing information without changing existing content.

Expected Output (JSON mode)

{
  "questions": ["string"]
}

Rules:
- Questions must be specific and minimal
- Do not propose edits or new requirements

3. Compilation (future)

Defined later.
Not part of v0.

Output Validation

Any output that does not match the expected format MUST be rejected

Partial outputs MUST NOT be applied

Free-form text outside defined sections is ignored

Summary

Prompts are deterministic in structure

Context inclusion is minimal and ordered

Output formats are strictly defined

AI output is advisory, never authoritative
