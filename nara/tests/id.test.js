import { describe, it, expect } from 'vitest';
import { isValidId, validateName, nameToId, parseId, idToPath } from '../src/spec/id.js';

describe('Story ID validation', () => {
  describe('isValidId', () => {
    it('accepts valid IDs', () => {
      expect(isValidId('story.storage.read')).toBe(true);
      expect(isValidId('story.auth.login')).toBe(true);
      expect(isValidId('story.auth-v2.refresh')).toBe(true);
      expect(isValidId('story.cache.invalidate')).toBe(true);
    });

    it('rejects invalid IDs', () => {
      expect(isValidId('storage.read')).toBe(false); // missing story prefix
      expect(isValidId('story.Storage.read')).toBe(false); // uppercase
      expect(isValidId('story.storage')).toBe(false); // missing verb
      expect(isValidId('story.storage.read.v2')).toBe(false); // too many parts
      expect(isValidId('story.1storage.read')).toBe(false); // starts with number
      expect(isValidId('story.storage_v2.read')).toBe(false); // underscore
    });
  });

  describe('validateName', () => {
    it('accepts valid names', () => {
      expect(validateName('storage.read').valid).toBe(true);
      expect(validateName('auth-v2.login').valid).toBe(true);
    });

    it('rejects invalid names', () => {
      expect(validateName('').valid).toBe(false);
      expect(validateName('storage').valid).toBe(false);
      expect(validateName('Storage.read').valid).toBe(false);
      expect(validateName('storage.read.extra').valid).toBe(false);
    });
  });

  describe('nameToId', () => {
    it('converts name to full ID', () => {
      expect(nameToId('storage.read')).toBe('story.storage.read');
      expect(nameToId('auth.login')).toBe('story.auth.login');
    });
  });

  describe('parseId', () => {
    it('parses valid IDs', () => {
      expect(parseId('story.storage.read')).toEqual({
        subsystem: 'storage',
        verb: 'read',
      });
    });

    it('returns null for invalid IDs', () => {
      expect(parseId('invalid')).toBeNull();
    });
  });

  describe('idToPath', () => {
    it('converts ID to file path', () => {
      expect(idToPath('story.storage.read', 'specs/stories')).toBe('specs/stories/storage/read.md');
      expect(idToPath('story.auth-v2.login', 'specs/stories')).toBe('specs/stories/auth-v2/login.md');
    });
  });
});
