import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { getDefaultPaths } from './paths.js';

/**
 * Token policy schema
 */
const TokenPolicySchema = z.object({
  maxFiles: z.number().int().min(1).default(6),
  maxBytes: z.number().int().min(1000).default(120000),
  includeGlossary: z.boolean().default(true),
}).default({});

/**
 * Project configuration schema (nara.json)
 */
export const ProjectConfigSchema = z.object({
  specRoot: z.string().default('specs'),
  conventionsIndex: z.string().default('specs/conventions/index.md'),
  storiesRoot: z.string().default('specs/stories'),
  tokenPolicy: TokenPolicySchema,
}).default({});

/**
 * AI configuration schema
 */
const AIConfigSchema = z.object({
  provider: z.enum(['codex', 'claude', 'gemini', 'custom', 'none']).default('none'),
  command: z.string().nullable().default(null),
  args: z.array(z.string()).default([]),
  promptMode: z.enum(['stdin', 'arg']).default('stdin'),
  outputMode: z.enum(['json', 'sections', 'raw']).default('json'),
}).default({});

/**
 * User configuration schema (.nara/config.json)
 */
export const UserConfigSchema = z.object({
  ai: AIConfigSchema,
}).default({});

/**
 * Merged configuration with all defaults applied
 */
export const FullConfigSchema = z.object({
  specRoot: z.string(),
  conventionsIndex: z.string(),
  storiesRoot: z.string(),
  tokenPolicy: TokenPolicySchema,
  ai: AIConfigSchema,
});

/**
 * Load a JSON config file safely.
 * @param {string} path - Path to config file
 * @returns {Promise<object|null>} - Parsed JSON or null if file doesn't exist
 */
async function loadJsonFile(path) {
  if (!existsSync(path)) {
    return null;
  }
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse config at ${path}: ${err.message}`);
  }
}

/**
 * Load and merge configuration from all sources.
 * @param {string} repoRoot - Repository root
 * @param {object} [cliFlags] - CLI flags to override config
 * @returns {Promise<object>} - Merged and validated configuration
 */
export async function loadConfig(repoRoot, cliFlags = {}) {
  const paths = getDefaultPaths(repoRoot);

  // Load configs (may be null if files don't exist)
  const projectRaw = await loadJsonFile(paths.projectConfig);
  const userRaw = await loadJsonFile(paths.userConfig);

  // Parse and apply defaults
  const projectConfig = ProjectConfigSchema.parse(projectRaw || {});
  const userConfig = UserConfigSchema.parse(userRaw || {});

  // Merge: defaults < project < user < CLI flags
  const merged = {
    ...projectConfig,
    ...userConfig,
    ai: {
      ...projectConfig.ai,
      ...userConfig.ai,
      ...cliFlags.ai,
    },
    ...cliFlags,
  };

  // Remove nested ai from top level if it came from spread
  delete merged.ai?.ai;

  return FullConfigSchema.parse(merged);
}

/**
 * Get default configuration (no files loaded).
 * @returns {object} - Default configuration
 */
export function getDefaultConfig() {
  return FullConfigSchema.parse({
    ...ProjectConfigSchema.parse({}),
    ...UserConfigSchema.parse({}),
  });
}
