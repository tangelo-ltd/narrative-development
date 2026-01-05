/**
 * nara init command
 * Initializes a fresh Narrative Development repository.
 *
 * For existing codebases, use `nara adopt` instead.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { input } from '@inquirer/prompts';
import { getSeedDir, canInit } from '../core/paths.js';
import { copyDir, ensureDir, listFiles, safeWriteFile } from '../core/fs.js';
import { AI_START_TEMPLATE, STATE_TEMPLATE } from '../templates/ai-start.js';
import { detectAndBootstrapAI } from '../ai/bootstrap.js';

/**
 * Initialize a fresh Narrative Development repository.
 * @param {object} options - Command options
 * @param {string} [options.name] - Project name
 * @param {string} [options.desc] - Project description
 * @param {boolean} [options.yes] - Use defaults for all prompts
 */
export default async function init(options) {
  const cwd = process.cwd();

  // Check if we can initialize
  const check = canInit(cwd);
  if (!check.canInit) {
    console.error(`Error: ${check.reason}`);
    console.error('\nFor existing codebases, use `nara adopt` instead.');
    process.exit(1);
  }

  const entries = (await readdir(cwd)).filter(name => name !== '.git');
  if (entries.length > 0) {
    if (options.yes) {
      console.log('Detected existing files. Proceeding as greenfield (--yes).');
    } else {
      const response = await input({
        message: 'Existing files detected. Is this a new project (greenfield)? (y/N):',
        default: 'N',
      });
      const normalized = response.trim().toLowerCase();
      if (!(normalized === 'y' || normalized === 'yes')) {
        console.error('Aborted. Use `nara adopt` to onboard an existing codebase.');
        process.exit(1);
      }
    }
  }

  const projectName = options.name || basename(cwd);
  const projectDesc = options.desc || 'A Narrative Development project';

  console.log('\nInitializing nara project...\n');

  const narrativeRoot = join(cwd, '.nara');

  // Copy seed files into .nara
  const seedDir = getSeedDir();
  if (!existsSync(seedDir)) {
    console.error('Error: Seed files not found. Is nara installed correctly?');
    process.exit(2);
  }

  await ensureDir(narrativeRoot);
  await copyDir(seedDir, narrativeRoot);

  const manifestPath = join(narrativeRoot, 'specs', 'manifest.md');
  if (existsSync(manifestPath)) {
    let manifest = await readFile(manifestPath, 'utf-8');
    manifest = manifest.replace(/\{\{project_name\}\}/g, projectName);
    manifest = manifest.replace(/\{\{project_description\}\}/g, projectDesc);
    manifest = manifest.replace(/\{\{current_state\}\}/g, 'Greenfield (initialized with nara init)');
    await writeFile(manifestPath, manifest, 'utf-8');
  }

  // Create nara.json config
  const configPath = join(narrativeRoot, 'nara.json');
  const projectConfig = {
    narrativeRoot: '.nara',
    specRoot: 'specs',
    conventionsIndex: 'specs/conventions/index.md',
    storiesRoot: 'specs/stories',
    tokenPolicy: {
      maxFiles: 6,
      maxBytes: 120000,
      includeGlossary: true,
    },
  };
  await writeFile(configPath, JSON.stringify(projectConfig, null, 2) + '\n', 'utf-8');

  // Create state.json
  const stateContent = { ...STATE_TEMPLATE, last_action: 'init' };
  await safeWriteFile(join(narrativeRoot, 'state.json'), JSON.stringify(stateContent, null, 2) + '\n');

  // Create AI-START.md
  const aiStartContent = AI_START_TEMPLATE.replace('{{phase}}', 'setup');
  await safeWriteFile(join(narrativeRoot, 'AI-START.md'), aiStartContent);

  // Report what was created
  const files = await listFiles(narrativeRoot);
  const createdFiles = files.filter(f => !f.includes('node_modules') && !f.includes('.git'));

  console.log('Created files:');
  for (const file of createdFiles.slice(0, 15)) {
    const relative = file.replace(narrativeRoot + '/', '.nara/');
    console.log(`  ${relative}`);
  }
  if (createdFiles.length > 15) {
    console.log(`  ... and ${createdFiles.length - 15} more`);
  }

  console.log('\n✓ nara project initialized');

  const bootstrap = await detectAndBootstrapAI('Read .nara/AI-START.md and execute the "IMMEDIATE START" instructions.');

  if (!bootstrap) {
    console.log('\nNext steps:');
    console.log('  1. Open AI assistant and point it to .nara/AI-START.md');
    console.log('  2. Follow the AI instructions');
  }
}
