import { parseStory, extractId } from './parser.js';
import { isValidId, nameToId } from './id.js';
import { STORY_TYPE_LIST, getRequiredSectionsForType } from './storyTypes.js';

const NORMATIVE_REGEX = /\b(MUST|MUST NOT|SHALL|SHALL NOT|SHOULD|SHOULD NOT|REQUIRED)\b/;

function hasNormativeKeywords(text) {
  return NORMATIVE_REGEX.test(text);
}

function normalizeIntent(intentText) {
  return intentText ? intentText.toUpperCase() : '';
}

function findTodoMarkers(text) {
  return /\b(TODO|TBD)\b/i.test(text);
}

export function validateStoryContent(content, options = {}) {
  const errors = [];
  const {
    intentText = '',
    nameConstraint,
    storyType,
    storyId,
    openQuestions,
  } = options;

  if (findTodoMarkers(content)) {
    errors.push('Story contains TODO/TBD placeholders.');
  }

  if (hasNormativeKeywords(content)) {
    const intentUpper = normalizeIntent(intentText);
    if (!NORMATIVE_REGEX.test(intentUpper)) {
      errors.push('Normative keywords are not allowed unless present in user input.');
    }
  }

  const { sections, errors: parseErrors } = parseStory(content);
  if (parseErrors.length > 0) {
    errors.push(...parseErrors);
  }

  const id = extractId(sections);
  if (!id || !isValidId(id)) {
    errors.push('Invalid or missing story ID.');
  }

  if (storyId && id && storyId !== id) {
    errors.push('Story ID does not match the AI-provided storyId.');
  }

  if (nameConstraint && id) {
    const expectedId = nameToId(nameConstraint);
    if (id !== expectedId) {
      errors.push(`Story ID must match provided name (${expectedId}).`);
    }
  }

  const type = (sections.get('Type') || '').trim();
  if (!type) {
    errors.push('Missing Type section.');
  } else if (!STORY_TYPE_LIST.includes(type)) {
    errors.push(`Unknown story type: ${type}`);
  }

  if (storyType && type && storyType !== type) {
    errors.push('Story type does not match the AI-provided storyType.');
  }

  const required = getRequiredSectionsForType(type);
  for (const section of required) {
    const value = sections.get(section);
    if (!value || !value.trim()) {
      errors.push(`Missing or empty required section: ${section}`);
    }
  }

  if (openQuestions && openQuestions.length > 0) {
    const oqSection = sections.get('Open Questions') || '';
    for (const question of openQuestions) {
      if (!oqSection.includes(question)) {
        errors.push(`Open Questions section is missing: ${question}`);
      }
    }
  }

  return { valid: errors.length === 0, errors, id, type };
}

export function validateManifestContent(content, options = {}) {
  const errors = [];
  const { intentText = '', openQuestions } = options;

  if (findTodoMarkers(content)) {
    errors.push('Manifest contains TODO/TBD placeholders.');
  }

  if (hasNormativeKeywords(content)) {
    const intentUpper = normalizeIntent(intentText);
    if (!NORMATIVE_REGEX.test(intentUpper)) {
      errors.push('Normative keywords are not allowed unless present in user input.');
    }
  }

  const requiredHeadings = [
    '## Name',
    '## Description',
    '## Intended Users',
    '## Primary Goal',
    '## Non-Goals',
    '## Project Type',
    '## Key Constraints',
    '## Success Criteria',
    '## Current State',
    '## Maturity',
    '## Key Decisions',
    '## Open Questions',
  ];

  for (const heading of requiredHeadings) {
    if (!content.includes(heading)) {
      errors.push(`Missing manifest heading: ${heading}`);
    }
  }

  if (openQuestions && openQuestions.length > 0) {
    const oqIndex = content.indexOf('## Open Questions');
    const oqSection = oqIndex >= 0 ? content.slice(oqIndex) : '';
    for (const question of openQuestions) {
      if (!oqSection.includes(question)) {
        errors.push(`Open Questions section is missing: ${question}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
