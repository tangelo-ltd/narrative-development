# Story Types

This document defines the allowed story types and their required sections.

All stories MUST include: `## ID`, `## Type`, `## Purpose`, `## Behavior`.

Additional required sections vary by type.

---

## page

Use for page-level narratives (screens, routes, static pages).

Required sections:

- `## ID`
- `## Type`
- `## Purpose`
- `## Behavior`

---

## component

Use for UI components or reusable interface elements.

Required sections:

- `## ID`
- `## Type`
- `## Purpose`
- `## Behavior`

Recommended sections:

- `## Inputs` (props or inputs if any)
- `## Outputs` (events or outputs if any)

---

## operation

Use for atomic capability specifications (classic Narrative Development story).

Required sections:

- `## ID`
- `## Type`
- `## Purpose`
- `## Inputs`
- `## Outputs`
- `## Behavior`
- `## Errors`

---

## endpoint

Use for externally exposed API endpoints.

Required sections:

- `## ID`
- `## Type`
- `## Purpose`
- `## Inputs`
- `## Outputs`
- `## Behavior`
- `## Errors`

Recommended sections:

- `## Constraints`
- `## Tests`

---

## Notes

- Types are validated by nara. Unknown types are rejected.
- Optional sections may be used for any type.
