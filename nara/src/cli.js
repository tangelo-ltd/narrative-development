#!/usr/bin/env node

import { readdir } from 'node:fs/promises';

import { program } from 'commander';
import { findNarrativeRoot } from './core/paths.js';
import init from './commands/init.js';
import adopt from './commands/adopt.js';
import detect from './commands/detect.js';
import configure from './commands/configure.js';
import newStory from './commands/newStory.js';
import status from './commands/status.js';
import resume from './commands/resume.js';

program
  .name('nara')
  .description('Narrative Development CLI - intent-first specs for human + AI collaboration')
  .version('0.0.1')
  .option('--config', 'Interactively select an AI provider');

program
  .command('init')
  .description('Initialize a fresh Narrative Development repository')
  .option('--name <name>', 'Project name')
  .option('--desc <description>', 'Project description')
  .option('--yes', 'Use defaults for all prompts')
  .action(init);

program
  .command('adopt')
  .description('Onboard existing codebase (creates .nara/ narrative layer)')
  .option('--name <name>', 'Project name')
  .option('--desc <description>', 'Project description')
  .option('--merge', 'Merge into existing .nara/ directory without overwriting')
  .option('--force', 'Overwrite existing files under .nara/')
  .option('--inventory', 'Run a read-only inventory pass')
  .action(adopt);

program
  .command('resume')
  .description('Resume the narrative session')
  .action(resume);

program
  .command('detect')
  .description('Detect installed AI CLI tools')
  .option('--force', 'Re-run detection even if already configured')
  .action(detect);

program
  .command('configure <setting>')
  .description('Update user configuration (e.g., ai.provider=claude)')
  .action(configure);

program
  .command('story [name]')
  .description('Create a new story via AI-orchestrated capture')
  .action(newStory);

program
  .command('status')
  .description('Report narrative health')
  .option('--json', 'Output as JSON')
  .option('--verbose', 'Show full details')
  .action(status);

const argv = process.argv.slice(2);
if (argv.includes('--config')) {
  await detect({ force: true });
} else if (process.argv.length <= 2) {
  const rootInfo = findNarrativeRoot(process.cwd());
  if (rootInfo) {
    await resume();
  } else {
    const entries = (await readdir(process.cwd())).filter(name => name !== '.git');
    if (entries.length === 0) {
      await init({});
    } else {
      await adopt({});
    }
  }
} else {
  program.parse();
}
