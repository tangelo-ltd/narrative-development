# Narrative Development Protocol (NDP)

## Status

Draft.

## Purpose

The Narrative Development Protocol (NDP) defines how narrative intent is captured, structured, and evolved so humans and tools can interoperate safely. It is a contract for narrative artifacts, not for implementation code.

## Short Forms

- Narrative Development = ND
- Narrative Development Protocol = NDP
- `nara` = the canonical CLI for ND/NDP workflows

## Normative Language

The key words "MUST", "MUST NOT", "SHOULD", "SHOULD NOT", and "MAY" are to be interpreted as described in RFC 2119 and RFC 8174.

## Scope

The protocol applies to narrative artifacts: specifications, vocabulary, and intent. It does not prescribe a programming language, architecture, or runtime.

## Required Artifacts

An ND-compliant project:

- MUST publish a manifest that declares intent, scope, and non-goals.
- MUST maintain a shared glossary for domain terms.
- MUST define stories with stable identifiers, explicit inputs/outputs, constraints, and error cases.

These artifacts are defined by their content and structure, not by fixed file paths.

## Story Requirements

Stories:

- MUST describe a single capability with clear boundaries.
- MUST declare inputs, outputs, constraints, and failure modes.
- SHOULD remain atomic and composable.
- SHOULD record assumptions or dependencies when relevant.

## Decisions and Questions

Projects SHOULD record decisions, assumptions, and open questions as part of the narrative so intent remains reviewable over time.

## Tooling

Tools MAY assist in creating, validating, or transforming narrative artifacts. Tooling MUST NOT replace human intent or introduce requirements not present in the narrative.

## Conformance

A project conforms to NDP if it satisfies the Required Artifacts and Story Requirements sections. Conformance does not imply a specific repository layout.
