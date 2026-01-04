import { describe, it, expect } from 'vitest';
import { renderStoryTemplate, renderMinimalStory } from '../src/spec/template.js';

describe('Story template', () => {
  describe('renderStoryTemplate', () => {
    it('renders template with provided values', () => {
      const result = renderStoryTemplate({
        subsystem: 'storage',
        verb: 'read',
        purpose: 'Reads a value',
        inputs: '- key: string',
        outputs: '- value: string',
        behavior: '1. Look up key\n2. Return value',
        constraints: '- Max key length: 256',
        errors: '- NotFound: when key missing',
        dependencies: '(None)',
        tests: '### Happy path\n- Given: key exists\n- Then: returns value',
        openQuestions: '(None)',
      });

      expect(result).toContain('story.storage.read');
      expect(result).toContain('Reads a value');
      expect(result).toContain('- key: string');
    });

    it('uses defaults for missing values', () => {
      const result = renderStoryTemplate({
        subsystem: 'auth',
        verb: 'login',
      });

      expect(result).toContain('story.auth.login');
      expect(result).toContain('(One sentence');
    });
  });

  describe('renderMinimalStory', () => {
    it('creates story with open questions', () => {
      const result = renderMinimalStory('cache', 'get');

      expect(result).toContain('story.cache.get');
      expect(result).toContain('Unknown. See Open Questions');
      expect(result).toContain('Q1:');
      expect(result).toContain('Q2:');
    });
  });
});
