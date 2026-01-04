import { describe, it, expect } from 'vitest';
import { parseStory, extractId, countOpenQuestions, getMissingSections, analyzeStory } from '../src/spec/parser.js';

const COMPLETE_STORY = `## ID

story.storage.read

## Type

operation

## Purpose

Retrieves a value from the key-value store.

## Inputs

- key: string

## Outputs

- value: string | null

## Behavior

1. Validate key
2. Look up value
3. Return result

## Errors

- InvalidKey: when key is empty

## Tests

### Happy path
- Given: key exists
- When: read is called
- Then: returns value
`;

const INCOMPLETE_STORY = `## ID

story.storage.write

## Type

operation

## Purpose

Writes a value to the store.

## Inputs

- key: string
- value: string
`;

const STORY_WITH_QUESTIONS = `## ID

story.cache.get

## Type

operation

## Purpose

Gets a cached value.

## Inputs

- key: string

## Outputs

- value: string | null

## Behavior

1. Check cache
2. Return value or null

## Errors

- CacheMiss: when key not in cache

## Open Questions

- Q1: Should we support TTL?
- Q2: What about cache invalidation?
`;

describe('Story parser', () => {
  describe('parseStory', () => {
    it('parses sections from markdown', () => {
      const { sections, errors } = parseStory(COMPLETE_STORY);
      expect(sections.has('ID')).toBe(true);
      expect(sections.has('Purpose')).toBe(true);
      expect(sections.has('Inputs')).toBe(true);
      expect(errors.length).toBe(0);
    });

    it('warns about unknown sections', () => {
      const { errors } = parseStory('## ID\n\ntest\n\n## CustomSection\n\nfoo');
      expect(errors.some(e => e.includes('CustomSection'))).toBe(true);
    });
  });

  describe('extractId', () => {
    it('extracts ID from sections', () => {
      const { sections } = parseStory(COMPLETE_STORY);
      expect(extractId(sections)).toBe('story.storage.read');
    });
  });

  describe('countOpenQuestions', () => {
    it('counts questions', () => {
      const { sections } = parseStory(STORY_WITH_QUESTIONS);
      expect(countOpenQuestions(sections)).toBe(2);
    });

    it('returns 0 when no questions', () => {
      const { sections } = parseStory(COMPLETE_STORY);
      expect(countOpenQuestions(sections)).toBe(0);
    });
  });

  describe('getMissingSections', () => {
    it('returns empty for complete story', () => {
      const { sections } = parseStory(COMPLETE_STORY);
      expect(getMissingSections(sections)).toEqual([]);
    });

    it('returns missing sections', () => {
      const { sections } = parseStory(INCOMPLETE_STORY);
      const missing = getMissingSections(sections);
      expect(missing).toContain('Outputs');
      expect(missing).toContain('Behavior');
      expect(missing).toContain('Errors');
    });
  });

  describe('analyzeStory', () => {
    it('identifies complete stories', () => {
      const result = analyzeStory(COMPLETE_STORY);
      expect(result.complete).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.openQuestions).toBe(0);
    });

    it('identifies incomplete stories', () => {
      const result = analyzeStory(INCOMPLETE_STORY);
      expect(result.complete).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });

    it('identifies stories with open questions', () => {
      const result = analyzeStory(STORY_WITH_QUESTIONS);
      expect(result.complete).toBe(false);
      expect(result.missing).toEqual([]);
      expect(result.openQuestions).toBe(2);
    });
  });
});
