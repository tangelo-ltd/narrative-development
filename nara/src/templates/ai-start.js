export const AI_START_TEMPLATE = `# AI Entrypoint

Welcome to Narrative Development.

## Current State
Phase: {{phase}}

## Instructions
1. Read \`.nara/state.json\` to understand the current context.
2. Read \`specs/manifest.md\` to understand the project intent.
3. If the manifest is incomplete, ask the user to clarify the intent.
4. If the manifest is complete, look for the next logical step in \`.nara/state.json\`.

## Constraints
- Do NOT invent requirements.
- Do NOT modify code unless explicitly requested.
- Do NOT write outside the allowed paths.
- For "adopted" projects, stay within the \`nara/\` directory unless instructed otherwise.
`;

export const STATE_TEMPLATE = {
  phase: "setup",
  last_action: "{{action}}",
  next_steps: [
    "clarify_intent",
    "create_first_story"
  ],
  open_questions: []
};
