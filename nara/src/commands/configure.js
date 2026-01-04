/**
 * nara configure command
 * Updates user configuration.
 */

import { findNarrativeRoot, getDefaultPaths } from '../core/paths.js';
import { safeReadFile, safeWriteFile } from '../core/fs.js';

/**
 * Valid configuration keys and their types.
 */
const VALID_KEYS = {
  'ai.provider': {
    type: 'enum',
    values: ['codex', 'claude', 'gemini', 'custom', 'none'],
  },
  'ai.command': {
    type: 'string',
  },
  'ai.args': {
    type: 'string', // comma-separated
  },
  'ai.promptMode': {
    type: 'enum',
    values: ['stdin', 'arg'],
  },
  'ai.outputMode': {
    type: 'enum',
    values: ['json', 'sections', 'raw'],
  },
};

/**
 * Parse a setting string (key=value).
 * @param {string} setting - Setting in format "key=value"
 * @returns {{ key: string, value: string } | null}
 */
function parseSetting(setting) {
  const eqIndex = setting.indexOf('=');
  if (eqIndex === -1) {
    return null;
  }
  return {
    key: setting.slice(0, eqIndex),
    value: setting.slice(eqIndex + 1),
  };
}

/**
 * Validate a configuration key and value.
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @returns {{ valid: boolean, error?: string }}
 */
function validateSetting(key, value) {
  const spec = VALID_KEYS[key];
  if (!spec) {
    return { valid: false, error: `Unknown configuration key: ${key}` };
  }

  if (spec.type === 'enum' && !spec.values.includes(value)) {
    return { valid: false, error: `Invalid value for ${key}. Must be one of: ${spec.values.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Set a nested property on an object.
 * @param {object} obj - Object to modify
 * @param {string} path - Dot-separated path (e.g., "ai.provider")
 * @param {any} value - Value to set
 */
function setNested(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  // Handle special case for args (comma-separated to array)
  if (path === 'ai.args') {
    current[parts[parts.length - 1]] = value.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    current[parts[parts.length - 1]] = value;
  }
}

/**
 * Configure user settings.
 * @param {string} setting - Setting in format "key=value"
 */
export default async function configure(setting) {
  // Parse the setting
  const parsed = parseSetting(setting);
  if (!parsed) {
    console.error('Error: Invalid format. Use: nara configure key=value');
    console.error('Example: nara configure ai.provider=claude');
    process.exit(1);
  }

  const { key, value } = parsed;

  // Validate
  const validation = validateSetting(key, value);
  if (!validation.valid) {
    console.error(`Error: ${validation.error}`);
    process.exit(1);
  }

  // Find narrative root
  const narRoot = findNarrativeRoot();
  if (!narRoot) {
    console.error('Error: Not in a nara repository');
    console.error('Run `nara init` for a new project or `nara adopt` for an existing codebase');
    process.exit(2);
  }

  const { root: narrativeRoot, mode } = narRoot;
  const paths = getDefaultPaths(narrativeRoot);

  // Load existing config
  let config = {};
  const existingContent = await safeReadFile(paths.userConfig);
  if (existingContent) {
    try {
      config = JSON.parse(existingContent);
    } catch {
      console.error('Warning: Existing config is invalid JSON, starting fresh');
    }
  }

  // Update config
  setNested(config, key, value);

  // Write config
  await safeWriteFile(paths.userConfig, JSON.stringify(config, null, 2) + '\n');

  const displayPath = mode === 'adopted'
    ? paths.userConfig.replace(narrativeRoot, 'nara')
    : paths.userConfig.replace(narrativeRoot + '/', '');

  console.log(`✓ Set ${key} = ${value}`);
  console.log(`  Config saved to: ${displayPath}`);
}
