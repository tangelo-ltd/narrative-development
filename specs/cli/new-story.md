# nara story (AI-orchestrated narrative)

Goal

Create the minimal valid narrative artifact for a given intent, without forcing atomic-operation modeling too early.

Core rule: nara MUST NOT decide story type or structure. AI decides story type and questions within constraints.

---

Command

```
nara story [name]
```

If `name` is provided and valid, it constrains the story ID. If omitted, AI proposes the ID.

If `name` is invalid, nara ignores it as a constraint and lets AI propose the ID.

---

Flow

1) Capture intent

nara asks a single question:

- "What are you trying to describe?"

2) Invoke AI (constrained)

nara provides:

- conventions index
- story type rules
- naming rules
- safety prohibitions
- the user's intent (and optional name constraint)

AI returns a full story file and Open Questions.

If no AI provider is configured, `nara story` MUST run `nara detect` automatically before proceeding.

3) Validate

nara validates:

- ID format (`story.<subsystem>.<verb>`)
- `## Type` matches an allowed story type (`page`, `component`, `operation`, `endpoint`)
- type rules from [files/story-types.md](../files/story-types.md)
- required sections for that type
- no unknown sections
- no TODO/TBD placeholders
- no normative keywords unless present in user input

If validation fails, nara rejects the output and prints actionable errors.

4) Write

nara writes the story under `specs/stories/<subsystem>/<verb>.md` and reports Open Questions.

---

Interruption behavior

If the user aborts mid-flow:

- If a valid draft exists, write it and mark missing details as Open Questions
- Otherwise, exit without writing and explain how to retry

---

Notes

- Atomic stories remain valid and supported.
- Simple projects (static websites, single pages) should result in `page` or `component` stories.
