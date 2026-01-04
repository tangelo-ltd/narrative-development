import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, readdir, cp, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * Ensure a directory exists, creating it if necessary.
 * @param {string} dir - Directory path
 */
export async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Write a file, creating parent directories if needed.
 * @param {string} path - File path
 * @param {string} content - File content
 */
export async function safeWriteFile(path, content) {
  await ensureDir(dirname(path));
  await writeFile(path, content, 'utf-8');
}

/**
 * Read a file safely, returning null if it doesn't exist.
 * @param {string} path - File path
 * @returns {Promise<string|null>} - File content or null
 */
export async function safeReadFile(path) {
  if (!existsSync(path)) {
    return null;
  }
  return readFile(path, 'utf-8');
}

/**
 * Copy a directory recursively.
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
export async function copyDir(src, dest) {
  await ensureDir(dest);
  await cp(src, dest, { recursive: true });
}

/**
 * Copy a directory recursively with overwrite control.
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {object} [options] - Copy options
 * @param {boolean} [options.overwrite=false] - Whether to overwrite existing files
 */
export async function copyDirWithPolicy(src, dest, options = {}) {
  const { overwrite = false } = options;
  await ensureDir(dest);

  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirWithPolicy(srcPath, destPath, { overwrite });
      continue;
    }

    if (entry.isFile()) {
      if (!overwrite && existsSync(destPath)) {
        continue;
      }
      await ensureDir(dirname(destPath));
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * List all files in a directory recursively.
 * @param {string} dir - Directory path
 * @param {string} [extension] - Filter by extension (e.g., '.md')
 * @returns {Promise<string[]>} - Array of absolute file paths
 */
export async function listFiles(dir, extension = null) {
  if (!existsSync(dir)) {
    return [];
  }

  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFiles(fullPath, extension);
      results.push(...nested);
    } else if (entry.isFile()) {
      if (!extension || entry.name.endsWith(extension)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Check if a path exists.
 * @param {string} path - Path to check
 * @returns {boolean}
 */
export function pathExists(path) {
  return existsSync(path);
}
