/**
 * AI CLI tool detection.
 */

import { execa } from 'execa';

/**
 * Known AI CLI tools.
 */
export const KNOWN_TOOLS = ['codex', 'claude', 'gemini'];

/**
 * Check if a command exists on the system PATH.
 * @param {string} command - Command name to check
 * @returns {Promise<string|null>} - Path to command or null if not found
 */
export async function findCommand(command) {
  const isWindows = process.platform === 'win32';
  const checkCmd = isWindows ? 'where' : 'which';

  try {
    const { stdout } = await execa(checkCmd, [command]);
    // Return first line (in case of multiple matches on Windows)
    const path = stdout.split('\n')[0]?.trim();
    return path || null;
  } catch {
    // Command not found
    return null;
  }
}

/**
 * Detect all installed AI CLI tools.
 * @returns {Promise<Array<{ name: string, path: string }>>} - Array of found tools
 */
export async function detectAITools() {
  const results = await Promise.all(
    KNOWN_TOOLS.map(async (name) => {
      const path = await findCommand(name);
      return path ? { name, path } : null;
    })
  );

  return results.filter(Boolean);
}

/**
 * Get the default adapter config for a known tool.
 * @param {string} name - Tool name
 * @returns {object} - Adapter configuration
 */
export function getAdapterConfig(name) {
  return {
    provider: name,
    command: name,
    args: [],
    promptMode: 'stdin',
    outputMode: 'json',
  };
}
