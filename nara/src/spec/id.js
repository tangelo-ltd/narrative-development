/**
 * Story ID validation and utilities.
 *
 * ID format: story.<subsystem>.<verb>
 * - All lowercase
 * - Letters, numbers, hyphens only
 * - Must start with letter
 * - Exactly 3 parts
 */

const ID_REGEX = /^story\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/;

/**
 * Validate a story ID.
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid
 */
export function isValidId(id) {
  return ID_REGEX.test(id);
}

/**
 * Parse a story name (subsystem.verb) into an ID.
 * @param {string} name - Name like "storage.read"
 * @returns {string} - Full ID like "story.storage.read"
 */
export function nameToId(name) {
  return `story.${name}`;
}

/**
 * Parse a story ID into its parts.
 * @param {string} id - Full ID like "story.storage.read"
 * @returns {{ subsystem: string, verb: string } | null} - Parts or null if invalid
 */
export function parseId(id) {
  if (!isValidId(id)) {
    return null;
  }
  const [, subsystem, verb] = id.split('.');
  return { subsystem, verb };
}

/**
 * Convert a story ID to a file path.
 * @param {string} id - Full ID like "story.storage.read"
 * @param {string} storiesRoot - Root directory for stories
 * @returns {string} - File path like "specs/stories/storage/read.md"
 */
export function idToPath(id, storiesRoot) {
  const parts = parseId(id);
  if (!parts) {
    throw new Error(`Invalid story ID: ${id}`);
  }
  return `${storiesRoot}/${parts.subsystem}/${parts.verb}.md`;
}

/**
 * Validate a story name (without the "story." prefix).
 * @param {string} name - Name like "storage.read"
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateName(name) {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }

  const parts = name.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Name must be in format: subsystem.verb (e.g., storage.read)' };
  }

  const [subsystem, verb] = parts;

  if (!/^[a-z][a-z0-9-]*$/.test(subsystem)) {
    return { valid: false, error: 'Subsystem must be lowercase, start with letter, contain only letters/numbers/hyphens' };
  }

  if (!/^[a-z][a-z0-9-]*$/.test(verb)) {
    return { valid: false, error: 'Verb must be lowercase, start with letter, contain only letters/numbers/hyphens' };
  }

  return { valid: true };
}
