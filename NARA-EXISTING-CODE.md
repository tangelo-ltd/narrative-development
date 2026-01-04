NARA-EXISTING-CODE.md
Purpose

This document defines how to set up Narrative Development in an existing repository without touching any existing code.

The Narrative Development layer is created in a dedicated top-level folder:

nara/

This folder is parallel to the project’s existing source code and contains all narrative artifacts, conventions, and tooling entry points.

The setup process may analyze the codebase to mirror reality in specs and report issues, but it MUST NOT modify code files.

Core Rule

When onboarding an existing project:

nara MUST NOT modify, move, or delete any source code or runtime files.

nara MAY read the codebase to produce specs and diagnostics.

All narrative files MUST live under nara/.

Folder Layout (Existing Code Onboarding)

Onboarding creates:

nara/

AGENTS.md

NARA.md

INDEX.md

config/

nara.json (optional, committed project-level settings for the narrative layer)

specs/

manifest.md

glossary.md

conventions/

index.md

atomic-stories.md

rfc-keywords.md

naming-and-ids.md

testing.md (optional)

inventory/

codebase-map.md

modules.md (optional)

endpoints.md (optional)

data.md (optional)

stories/

_template.md

<subsystem>/... (created as stories are added)

reports/

onboarding-report.md

issues.md

Optional:

nara/generated/ (kept empty unless you later enable compilation workflows)

Notes:

The project’s existing root remains unchanged except for creation of the nara/ folder.

This keeps adoption reversible and non-invasive.

Why a Dedicated nara/ Folder

A dedicated folder:

avoids conflicts with existing specs/, docs/, or AGENTS.md files

prevents accidental commingling of narrative artifacts and production code

makes the narrative layer easy to add, remove, or move

provides a single, predictable entry point for both humans and AI tools

Onboarding Command

Introduce a command:

nara adopt (preferred)

or nara init --existing

This command creates the nara/ folder and populates it.

nara adopt Behavior
Step 1. Safety and Conflict Checks

Before writing files:

If nara/ exists:

do not overwrite unless --merge or --force is provided

If nara/AGENTS.md exists:

do not overwrite unless --force

If the repository is read-only or lacks permissions:

fail with an actionable error

nara adopt MUST NOT create or modify any file outside nara/.

Step 2. Create Narrative Seed Files Under nara/

Create the minimal invariant set under nara/:

nara/AGENTS.md (token-efficient routing)

nara/NARA.md (tooling contract)

nara/INDEX.md (single index entry point)

conventions and templates under nara/specs/

All seed file contents must be real files (copyable templates), not prose.

Step 3. Inventory and Mirroring Pass (Read-Only Analysis)

nara adopt MAY perform a read-only analysis pass to generate an initial description of reality.

This pass MUST:

only read files

never rewrite files

never run project code unless the user explicitly opts in

The output of this pass is written to:

nara/specs/inventory/codebase-map.md

The codebase map SHOULD include:

primary entry points (build/start scripts)

main directories and their roles

detected frameworks (best-effort)

key modules/services

external integrations inferred from config (best-effort)

data stores inferred from configuration and dependencies (best-effort)

If detection is uncertain, it MUST be recorded as an assumption.

Step 4. Story Bootstrapping (Optional)

If the user opts in:

nara adopt creates a small number of initial story placeholders by identifying obvious “capability boundaries”, such as:

API endpoints

service handlers

storage modules

background jobs

This must stay minimal:

default: 0 stories created

opt-in: create up to N (suggest N=5)

Each created story MUST include an “Existing Implementation” section pointing to code locations, for example:

Existing Implementation:

Paths:

src/storage/read.js

Notes:

Mirrors current behavior as implemented, even if imperfect.

The story must describe what the code appears to do, not what it should do.

Mirroring Rule: Describe Reality First

During onboarding, specs must initially reflect reality.

Narrative Development distinguishes:

“As Implemented” (what the code does today)

“Intended” (what you want it to do)

For existing projects, stories SHOULD begin as “As Implemented” narratives, then evolve into “Intended” narratives over time.

To support this, each story MAY include:

Intended Behavior (optional)

As Implemented (required during onboarding)

This prevents the onboarding process from silently rewriting history.

Reporting Logic Errors and Issues

After mirroring, nara adopt SHOULD generate an onboarding report:

nara/reports/onboarding-report.md

This report may include:

missing or inconsistent error handling patterns

duplicated logic

suspicious mismatches (for example, function name suggests “read” but writes)

inconsistent naming vs behavior

unreachable or unused modules (best-effort)

spec gaps (areas where intent cannot be inferred)

Important constraints:

These are findings, not claims of correctness.

The tool MUST clearly separate:

“Observed behavior”

“Inferred behavior”

“Uncertain, needs confirmation”

A separate file may track issues for follow-up:

nara/reports/issues.md

with items formatted as:

ID

Location(s)

Observation

Confidence (low/medium/high)

Recommended question to confirm

AI Tooling and Token Efficiency

Because AI CLIs often look for AGENTS.md, onboarding MUST create:

nara/AGENTS.md

This file MUST:

point AI to nara/INDEX.md first

state that canonical narrative artifacts live under nara/specs/

forbid code edits unless explicitly requested

enforce token efficiency (load minimum files only)

The root project may already have its own AGENTS.md. Onboarding does not touch it. AI usage should be directed to the nara/ layer for Narrative Development tasks.

Interaction with Existing Development Workflow

After onboarding:

developers continue working as normal

narrative work happens in nara/

code is changed only when the user explicitly chooses to implement narrative changes

This makes adoption safe in production repositories.

Summary

To set up Narrative Development on an existing codebase:

create a dedicated nara/ folder at repo root

populate it with narrative seed files, conventions, and templates

optionally mirror the current codebase behavior into “As Implemented” specs

produce a report of likely issues and questions

do not touch code files under any circumstances

This approach supports incremental adoption and keeps narrative artifacts isolated, discoverable, and AI-friendly.