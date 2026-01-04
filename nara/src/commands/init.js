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
import { loadConfig } from '../core/config.js';
import { runAI } from '../ai/runner.js';
import { parseJsonFromOutput } from '../ai/parse.js';
import { buildManifestPrompt } from '../ai/prompts.js';
import { validateManifestContent } from '../spec/validate.js';
import detect from './detect.js';
import { startSpinner } from '../core/ui.js';

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

  const projectName = options.name || await input({
    message: 'Project name:',
    default: basename(cwd),
  });

  const projectDesc = options.desc || await input({
    message: 'Project description:',
    default: 'A Narrative Development project',
  });

  const intent = await input({
    message: 'What are you trying to build?',
    default: '',
  });

  console.log('\nInitializing nara project...\n');

  // Copy seed files to repository root
  const seedDir = getSeedDir();
  if (!existsSync(seedDir)) {
    console.error('Error: Seed files not found. Is nara installed correctly?');
    process.exit(2);
  }

  await copyDir(seedDir, cwd);

  const manifestPath = join(cwd, 'specs', 'manifest.md');
  let openQuestionCount = 0;

  let config = await loadConfig(cwd);
  if (config.ai.provider === 'none') {
    const response = await input({
      message: 'AI is not configured. Run `nara detect` now? (Y/n):',
      default: 'Y',
    });
    const normalized = response.trim().toLowerCase();
    if (normalized === 'y' || normalized === 'yes' || normalized === '') {
      await detect();
      config = await loadConfig(cwd);
    }
  }

  if (config.ai.provider === 'none') {
    if (existsSync(manifestPath)) {
      let manifest = await readFile(manifestPath, 'utf-8');
      manifest = manifest.replace(/\{\{project_name\}\}/g, projectName);
      manifest = manifest.replace(/\{\{project_description\}\}/g, projectDesc);
      manifest = manifest.replace(/\{\{current_state\}\}/g, 'Greenfield (initialized with nara init)');
      await writeFile(manifestPath, manifest, 'utf-8');
      openQuestionCount = (manifest.match(/- Q\d+:/g) || []).length;
    }
    console.log('\nAI is not configured. Manifest created with Open Questions.');
  } else {
    if (!intent.trim()) {
      console.error('Error: Intent is required when AI is configured.');
      process.exit(1);
    }
    const conventionsPath = join(cwd, 'specs', 'conventions', 'index.md');
    let conventionsText = '';
    if (existsSync(conventionsPath)) {
      conventionsText = await readFile(conventionsPath, 'utf-8');
    }

    const basePrompt = buildManifestPrompt({
      intent: intent.trim(),
      name: projectName,
      description: projectDesc,
      conventionsText,
    });

    const runManifest = async (prompt) => {
      const controller = new AbortController();
      const onSigint = () => controller.abort();
      process.once('SIGINT', onSigint);

      const stopSpinner = startSpinner('Generating manifest with AI...');
      let aiResult;
      try {
        aiResult = await runAI(prompt, config.ai, { signal: controller.signal });
        stopSpinner();
      } catch (err) {
        stopSpinner();
        process.removeListener('SIGINT', onSigint);
        throw new Error(`AI command failed (${err.message})`);
      }
      process.removeListener('SIGINT', onSigint);

      if (aiResult.code !== 0 && !aiResult.stdout.trim()) {
        const stderr = aiResult.stderr ? aiResult.stderr.trim() : '';
        throw new Error(`AI command failed with exit code ${aiResult.code}${stderr ? `: ${stderr}` : ''}`);
      }

      let payload;
      try {
        payload = parseJsonFromOutput(aiResult.stdout);
      } catch (err) {
        const stderr = aiResult.stderr ? aiResult.stderr.trim() : '';
        throw new Error(`${err.message}${stderr ? ` (${stderr})` : ''}`);
      }

      if (!payload || payload.artifactType !== 'manifest') {
        throw new Error('AI output is missing artifactType=manifest.');
      }

      return { payload, rawOutput: aiResult.stdout, exitCode: aiResult.code };
    };

    let payload;
    let rawOutput = '';
    let exitCode = 0;
    try {
      const first = await runManifest(basePrompt);
      payload = first.payload;
      rawOutput = first.rawOutput;
      exitCode = first.exitCode;
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }

    const validate = (candidate) => validateManifestContent(candidate.content || '', {
      intentText: intent,
      openQuestions: candidate.openQuestions || [],
    });

    let validation = validate(payload);
    if (!validation.valid) {
      const strictPrompt = `${basePrompt}\nSTRICT MODE:\n- Content must start with "# Project Manifest"\n- Use headings exactly as listed\n- Return JSON only\n`;
      try {
        const retry = await runManifest(strictPrompt);
        payload = retry.payload;
        rawOutput = retry.rawOutput;
        exitCode = retry.exitCode;
        validation = validate(payload);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(2);
      }
    }

    if (!validation.valid) {
      console.error('Error: AI output failed validation.');
      for (const error of validation.errors) {
        console.error(`- ${error}`);
      }
      await safeWriteFile(join(cwd, '.nara', 'ai-output.json'), rawOutput);
      console.error('Saved raw AI output to .nara/ai-output.json');
      process.exit(2);
    }

    if (exitCode !== 0) {
      console.log('Warning: AI command exited non-zero, using partial output.');
    }

    const manifestContent = payload.content || '';
    if (existsSync(manifestPath)) {
      await writeFile(manifestPath, manifestContent, 'utf-8');
      openQuestionCount = (payload.openQuestions || []).length;
    }
  }

  // Create nara.json config
  const configPath = join(cwd, 'nara.json');
  const projectConfig = {
    narrativeRoot: '.',
    specRoot: 'specs',
    conventionsIndex: 'specs/conventions/index.md',
    storiesRoot: 'specs/stories',
    mode: 'fresh',
    tokenPolicy: {
      maxFiles: 6,
      maxBytes: 120000,
      includeGlossary: true,
    },
  };
  await writeFile(configPath, JSON.stringify(projectConfig, null, 2) + '\n', 'utf-8');

  // Create .nara directory for local state
  await ensureDir(join(cwd, '.nara'));
  await safeWriteFile(join(cwd, '.nara', 'state.json'), JSON.stringify({ lastIntent: intent.trim() }, null, 2) + '\n');

  // Report what was created
  const files = await listFiles(cwd);
  const createdFiles = files.filter(f => !f.includes('node_modules') && !f.includes('.git'));

  console.log('Created files:');
  for (const file of createdFiles.slice(0, 15)) {
    const relative = file.replace(cwd + '/', '');
    console.log(`  ${relative}`);
  }
  if (createdFiles.length > 15) {
    console.log(`  ... and ${createdFiles.length - 15} more`);
  }

  console.log('\n✓ nara project initialized');
  console.log('\nManifest created.');
  if (openQuestionCount > 0) {
    console.log(`Open Questions: ${openQuestionCount}`);
  }
  console.log('\nNext steps:');
  console.log('  1. Run `nara status` to see your story health');
  if (config.ai.provider === 'none') {
    console.log('  2. Run `nara detect` to configure AI tools');
    console.log('  3. Run `nara story` to create your first story');
  } else {
    console.log('  2. Run `nara story` to create your first story');
  }
}
