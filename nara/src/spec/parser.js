/**
 * Story file parser.
 * Parses markdown story files into structured data.
 */

import { STORY_TYPE_LIST, getRequiredSectionsForType } from './storyTypes.js';

/**
 * Optional sections.
 */
export const OPTIONAL_SECTIONS = [
  'Constraints',
  'Dependencies',
  'Tests',
  'Open Questions',
  'Existing Implementation',
  'As Implemented',
  'Intended Behavior',
];

/**
 * All valid section names.
 */
export const ALL_SECTIONS = [
  'ID',
  'Type',
  'Purpose',
  'Inputs',
  'Outputs',
  'Behavior',
  'Errors',
  ...OPTIONAL_SECTIONS,
];

/**
 * Parse a story markdown file into sections.
 * @param {string} content - Markdown content
 * @returns {{ sections: Map<string, string>, errors: string[] }}
 */
export function parseStory(content) {
  const sections = new Map();
  const errors = [];
  const lines = content.split('\n');

  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    // Check for section header (## SectionName)
    const headerMatch = line.match(/^##\s+(.+)$/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.set(currentSection, currentContent.join('\n').trim());
      }

      currentSection = headerMatch[1].trim();
      currentContent = [];

      // Warn about unknown sections
      if (!ALL_SECTIONS.includes(currentSection)) {
        errors.push(`Unknown section: ${currentSection}`);
      }
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.set(currentSection, currentContent.join('\n').trim());
  }

  return { sections, errors };
}

/**
 * Extract the story ID from parsed sections.
 * @param {Map<string, string>} sections - Parsed sections
 * @returns {string|null} - Story ID or null
 */
export function extractId(sections) {
  const idSection = sections.get('ID');
  if (!idSection) return null;

  // ID is typically on a line by itself
  const lines = idSection.split('\n').filter(l => l.trim());
  return lines[0]?.trim() || null;
}

/**
 * Count open questions in a story.
 * @param {Map<string, string>} sections - Parsed sections
 * @returns {number} - Number of open questions
 */
export function countOpenQuestions(sections) {
  const oq = sections.get('Open Questions');
  if (!oq || !oq.trim()) return 0;

  // Count lines that look like questions (Q1:, -, *, numbered)
  const lines = oq.split('\n').filter(l => {
    const trimmed = l.trim();
    return trimmed.match(/^(Q\d+:|[-*]|\d+\.)\s*.+/);
  });

  return lines.length;
}

/**
 * Check which required sections are missing.
 * @param {Map<string, string>} sections - Parsed sections
 * @returns {string[]} - Array of missing section names
 */
export function getMissingSections(sections) {
  const type = (sections.get('Type') || '').trim();
  const required = getRequiredSectionsForType(type);
  return required.filter(name => !sections.has(name));
}

/**
 * Analyze a story for completeness.
 * @param {string} content - Markdown content
 * @returns {{ id: string|null, complete: boolean, missing: string[], openQuestions: number, errors: string[] }}
 */
export function analyzeStory(content) {
  const { sections, errors } = parseStory(content);
  const id = extractId(sections);
  const type = (sections.get('Type') || '').trim();
  const missing = getMissingSections(sections);
  const openQuestions = countOpenQuestions(sections);
  const typeErrors = [];

  if (type && !STORY_TYPE_LIST.includes(type)) {
    typeErrors.push(`Unknown story type: ${type}`);
  }

  return {
    id,
    type,
    complete: missing.length === 0 && openQuestions === 0,
    missing,
    openQuestions,
    errors: [...errors, ...typeErrors],
  };
}
