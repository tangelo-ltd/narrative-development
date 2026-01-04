import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Get the directory where the CLI package is installed.
 * Used to locate seed files.
 */
export function getPackageDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // src/core/paths.js -> package root
  return resolve(__dirname, '..', '..');
}

/**
 * Get the path to seed files.
 */
export function getSeedDir() {
  return join(getPackageDir(), 'seed');
}

/**
 * Narrative root detection result.
 * @typedef {Object} NarrativeRoot
 * @property {string} root - Absolute path to narrative root
 * @property {'fresh'|'adopted'} mode - Whether this is a fresh repo or adopted codebase
 * @property {string} repoRoot - Absolute path to repository root
 */

/**
 * Find the narrative root by looking for nara markers.
 *
 * Detection priority:
 * 1. nara/NARA.md exists -> adopted mode, narrative root is nara/
 * 2. NARA.md exists at repo root -> fresh mode, narrative root is repo root
 *
 * @param {string} [startDir] - Directory to start searching from (default: cwd)
 * @returns {NarrativeRoot|null} - Narrative root info or null if not found
 */
export function findNarrativeRoot(startDir = process.cwd()) {
  let dir = resolve(startDir);
  const fsRoot = dirname(dir);

  while (dir !== fsRoot) {
    // Check for adopted mode first (nara/ subdirectory)
    const adoptedPath = join(dir, 'nara', 'NARA.md');
    if (existsSync(adoptedPath)) {
      return {
        root: join(dir, 'nara'),
        mode: 'adopted',
        repoRoot: dir,
      };
    }

    // Check for fresh mode (NARA.md at this level)
    const freshPath = join(dir, 'NARA.md');
    if (existsSync(freshPath)) {
      return {
        root: dir,
        mode: 'fresh',
        repoRoot: dir,
      };
    }

    // Also check for nara.json as fallback marker
    const configPath = join(dir, 'nara.json');
    const adoptedConfigPath = join(dir, 'nara', 'nara.json');

    if (existsSync(adoptedConfigPath)) {
      return {
        root: join(dir, 'nara'),
        mode: 'adopted',
        repoRoot: dir,
      };
    }

    if (existsSync(configPath)) {
      return {
        root: dir,
        mode: 'fresh',
        repoRoot: dir,
      };
    }

    dir = dirname(dir);
  }

  return null;
}

/**
 * Legacy function for backward compatibility.
 * @deprecated Use findNarrativeRoot instead
 */
export function findRepoRoot(startDir = process.cwd()) {
  const result = findNarrativeRoot(startDir);
  return result ? result.root : null;
}

/**
 * Resolve a path relative to a base directory.
 * @param {string} base - Base directory
 * @param  {...string} segments - Path segments
 * @returns {string} - Absolute path
 */
export function resolvePath(base, ...segments) {
  return join(base, ...segments);
}

/**
 * Get the default paths for a nara project.
 * All paths are relative to the narrative root.
 *
 * @param {string} narrativeRoot - Narrative root directory
 * @returns {object} - Object with common paths
 */
export function getDefaultPaths(narrativeRoot) {
  return {
    narrativeRoot,
    specs: resolvePath(narrativeRoot, 'specs'),
    stories: resolvePath(narrativeRoot, 'specs', 'stories'),
    conventions: resolvePath(narrativeRoot, 'specs', 'conventions'),
    userConfig: resolvePath(narrativeRoot, '.nara', 'config.json'),
    projectConfig: resolvePath(narrativeRoot, 'nara.json'),
  };
}

/**
 * Check if a directory can be adopted (handles existing nara/ folder).
 * @param {string} dir - Directory to check
 * @param {object} [options] - Adoption options
 * @param {boolean} [options.merge] - Allow merging into existing nara/
 * @param {boolean} [options.force] - Allow overwriting existing files
 * @returns {{ canAdopt: boolean, reason?: string }}
 */
export function canAdopt(dir, options = {}) {
  const { merge = false, force = false } = options;
  const naraDir = join(dir, 'nara');
  if (existsSync(naraDir)) {
    if (merge || force) {
      return { canAdopt: true };
    }
    return { canAdopt: false, reason: 'nara/ directory already exists' };
  }
  return { canAdopt: true };
}

/**
 * Check if a directory can be initialized as a fresh repo.
 * @param {string} dir - Directory to check
 * @returns {{ canInit: boolean, reason?: string }}
 */
export function canInit(dir) {
  if (existsSync(join(dir, 'NARA.md'))) {
    return { canInit: false, reason: 'NARA.md already exists (already a nara project)' };
  }
  if (existsSync(join(dir, 'nara', 'NARA.md'))) {
    return { canInit: false, reason: 'nara/NARA.md exists (use existing adopted project)' };
  }
  return { canInit: true };
}
