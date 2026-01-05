export const AI_START_TEMPLATE = `# AI Entrypoint

Welcome to Narrative Development.

## Current State
Phase: {{phase}}

## IMMEDIATE START
1. **Read** \`specs/manifest.md\` and \`state.json\` NOW.
2. **Check** for placeholders (like \`{{...}}\`) in the manifest.
3. **If placeholders exist**:
   - ASK the user to clarify the intent (Intended Users, Primary Goal, Non-Goals, Project Type, Constraints).
   - **DO NOT** ask "Shall I check?". **DO NOT** summarize this plan. **JUST ASK THE QUESTIONS.**

## Core Mandates
1. **Action Over Permission**: When the user answers, **IMMEDIATELY** update \`specs/manifest.md\`.
2. **Continuous Flow**: After updating the manifest, **IMMEDIATELY** define the first story.
3. **Drive to Implementation**: Do not stop at specs. Create tests, write code, verify.
4. **Persist Design**: If the user provides visual/styling details, create a dedicated spec (e.g., \`specs/design.md\`) to avoid repetition. If undefined, you MAY generate defaults there.

## Lifecycle Instructions

### 1. Setup (Current)
- Gather requirements -> Update Manifest.
- Create first atomic story in \`specs/stories/\` (e.g., \`001-setup.md\`).

### 2. Implementation
- Create reproduction/test case.
- Implement code.
- Verify.

## Constraints
- Do NOT invent requirements.
- Follow the conventions in \`specs/conventions/\`.
`;

export const STATE_TEMPLATE = {
  phase: "setup",
  last_action: "{{action}}",
  next_steps: [
    "clarify_intent",
    "create_first_story",
    "implement_story"
  ],
  open_questions: [],
  current_goal: null,
  recent_learnings: []
};
