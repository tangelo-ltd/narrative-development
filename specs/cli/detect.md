NARA-DETECT

This document defines how the nara CLI detects, selects, and integrates AI command-line tools provided by the user.

nara does not bundle or manage models.
It orchestrates existing AI CLIs that the user already trusts and has installed.

Design Principles

Best-effort detection
Detection is a convenience, not a requirement.

Non-invasive
nara does not install tools, manage API keys, or modify user environments.

User choice over heuristics
When multiple tools are available, the user explicitly chooses.

Explicit override always wins
User configuration overrides detection.

Minimal assumptions
nara only assumes basic CLI behavior: executable on PATH, stdin/stdout I/O.

Token efficiency
Detection and integration must not encourage loading large contexts by default.

Supported AI CLI Tools (Built-in)

nara ships with built-in adapters for the following known tools:

codex

claude

gemini

These names refer to executable commands expected to be available on the system PATH.

Additional tools can be configured manually.

Detection Algorithm

Detection is performed when:

nara init runs (informational only), or

the first AI-assisted command is invoked and no provider is configured.

Step 1: Scan PATH

nara checks for known executables in the following order:

codex

claude

gemini

Platform-specific checks:

POSIX systems:

command -v <name>

Windows:

where <name>

Only executables that return a valid path are considered installed.

Step 2: Resolve Provider

If exactly one known tool is found:

That tool is selected automatically.

If multiple known tools are found:

nara prompts the user to choose.

The prompt lists detected tools and their executable paths.

The user’s selection is treated as authoritative.

If no tools are found:

nara enters manual mode (ai.provider = none).

No silent prioritization is applied.

Step 3: Persist Selection

Once a provider is chosen (automatically or interactively), the selection is written to:

.nara/config.json

This file is user-specific and SHOULD NOT be committed.

After persistence, detection is not re-run unless explicitly requested via `nara detect --force`.

User Overrides

Detection can always be overridden explicitly.

Set provider by name
nara configure ai.provider=claude

Set a custom executable
nara configure ai.provider=custom
nara configure ai.command=/path/to/my-ai-cli

Set invocation details
nara configure ai.args="--prompt"
nara configure ai.prompt_mode=stdin
nara configure ai.output_mode=json


Explicit configuration disables automatic detection.

Adapter Model

Each AI tool is represented by a small adapter that defines:

executable name

prompt input method

supported output modes

known authentication expectations

Adapters describe how to talk to a tool.
They do not manage credentials or behavior.

Built-in Adapter Behavior (Default)
codex

Command: codex

Prompt: stdin

Output: prefers structured or JSON if supported

Auth: handled by the Codex CLI itself

claude

Command: claude

Prompt: stdin or prompt flag

Output: sectioned text or JSON if supported

Auth: handled by the Claude CLI itself

gemini

Command: gemini

Prompt: stdin or file-based flags

Output: text or JSON depending on CLI version

Auth: handled by the Gemini CLI itself

Exact flags are adapter-defined and may evolve.

Custom Provider Support

Users may define arbitrary tools.

Required fields:

ai.provider = custom

ai.command

ai.prompt_mode (stdin or arg)

ai.output_mode (json, sections, raw)

Optional fields:

ai.args

ai.env_passthrough

Custom providers are treated as opaque processes.

Interaction with AGENTS.md

AGENTS.md exists for external AI tools that automatically scan repositories.

nara:

does not rely on AGENTS.md for detection,

but applies the same AI contract rules when constructing prompts.

This ensures consistent behavior whether AI is invoked manually or through nara.

Safety and Constraints

nara MUST:

never auto-install AI tools

never manage API keys

never assume network availability

never send the full repository by default

All AI invocations are:

explicit,

scoped,

reviewable.

Failure Modes

If a configured provider executable is missing:

nara fails with a clear error.

If an AI command returns invalid output:

nara reports the error and does not apply changes.

If output violates conventions:

changes are rejected.

Summary

nara integrates with AI tools by:

detecting known CLIs on PATH,

asking the user to choose when multiple are available,

allowing full manual override,

delegating all intelligence to the user’s chosen tool,

remaining minimal, explicit, and non-invasive.

Detection exists to reduce friction, not to remove agency.
