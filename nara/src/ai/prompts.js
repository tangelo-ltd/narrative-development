import { STORY_TYPES, STORY_TYPE_LIST } from '../spec/storyTypes.js';

function formatStoryTypeRules() {
  return STORY_TYPE_LIST.map(type => {
    const required = STORY_TYPES[type].required.join(', ');
    return `- ${type}: required sections -> ${required}`;
  }).join('\n');
}

export function buildStoryPrompt({ intent, nameConstraint, conventionsText }) {
  const nameLine = nameConstraint
    ? `Name constraint: ${nameConstraint} (ID must be story.${nameConstraint})`
    : 'Name constraint: none (you must propose a valid story ID)';

  return `You are assisting with a Narrative Development project.

Rules:
- Do not invent requirements or behavior.
- Do not expand scope beyond the user intent.
- Do not use MUST/SHOULD/REQUIRED unless the user wrote those words.
- Choose a story type from: ${STORY_TYPE_LIST.join(', ')}.
- ID format must be: story.<subsystem>.<verb>.
- Include an Open Questions section for unknowns.
- Output JSON only, no extra text.
- Do not wrap content in code fences.
- Use only allowed headings: ID, Type, Purpose, Inputs, Outputs, Behavior, Errors, Constraints, Dependencies, Tests, Open Questions, Existing Implementation, As Implemented, Intended Behavior.
- Do not add headings outside the allowed list.
- Ensure every open question is listed verbatim under "## Open Questions".

Story type rules:
${formatStoryTypeRules()}

${conventionsText ? `Conventions:\n${conventionsText}\n` : ''}
User intent: ${intent}
${nameLine}

Output JSON schema:
{
  "artifactType": "story",
  "storyType": "page | component | operation | endpoint",
  "storyId": "story.subsystem.verb",
  "content": "full markdown story",
  "openQuestions": ["string"]
}
`;
}

export function buildManifestPrompt({ intent, name, description, conventionsText }) {
  return `You are assisting with a Narrative Development project.

Rules:
- Do not invent requirements or behavior.
- Do not expand scope beyond the user intent.
- Do not use MUST/SHOULD/REQUIRED unless the user wrote those words.
- Include an Open Questions section for unknowns.
- Output JSON only, no extra text.
- Do not wrap content in code fences.

Manifest sections (use these headings):
- Name
- Description
- Intended Users
- Primary Goal
- Non-Goals
- Project Type
- Key Constraints
- Success Criteria
- Current State
- Maturity
- Key Decisions
- Open Questions

${conventionsText ? `Conventions:\n${conventionsText}\n` : ''}
Project name: ${name}
Project description: ${description}
User intent: ${intent}

Output JSON schema:
{
  "artifactType": "manifest",
  "content": "full markdown manifest",
  "openQuestions": ["string"]
}
`;
}

export function buildStatusSuggestionPrompt({ manifestContent, storyStats, lastIntent }) {
  return `You are assisting with a Narrative Development project.

Rules:
- Do not invent requirements or behavior.
- Do not expand scope beyond the user intent.
- Suggest exactly one next action command.
- Output JSON only, no extra text.

Project manifest:
${manifestContent}

Story stats:
${JSON.stringify(storyStats)}

Last intent (if any):
${lastIntent || 'Unknown'}

Output JSON schema:
{
  "suggestion": "command to run",
  "reason": "short explanation"
}
`;
}
