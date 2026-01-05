# Project Manifest

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

## Open Questions

- Should the CLI enforce any project layout beyond `specs/`?
- What governance model should define future spec changes?
- Which reference implementations should be prioritized?
