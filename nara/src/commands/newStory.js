/**
 * nara story command
 * Creates a new narrative artifact via AI under strict constraints.
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { input } from '@inquirer/prompts';
import { findNarrativeRoot, getDefaultPaths } from '../core/paths.js';
import { safeReadFile, safeWriteFile } from '../core/fs.js';
import { validateName, idToPath } from '../spec/id.js';
import { loadConfig } from '../core/config.js';
import { runAI } from '../ai/runner.js';
import { parseJsonFromOutput } from '../ai/parse.js';
import { buildStoryPrompt } from '../ai/prompts.js';
import { validateStoryContent } from '../spec/validate.js';
import detect from './detect.js';
import { startSpinner } from '../core/ui.js';

async function loadConventions(narrativeRoot) {
  const { conventionsIndex } = getDefaultPaths(narrativeRoot);
  if (!conventionsIndex) return '';
  try {
    const content = await readFile(conventionsIndex, 'utf-8');
    return content.trim();
  } catch {
    return '';
  }
}

/**
 * Create a new story based on user intent using AI orchestration.
 * @param {string} [name] - Optional name constraint (subsystem.verb)
 */
export default async function newStory(name) {
  const narRoot = findNarrativeRoot();
  if (!narRoot) {
    console.error('Error: Not in a nara repository');
    console.error('Run `nara init` for a new project or `nara adopt` for an existing codebase');
    process.exit(2);
  }

  let nameConstraint = null;
  let nameHint = '';
  if (name) {
    const validation = validateName(name);
    if (validation.valid) {
      nameConstraint = name;
    } else {
      nameHint = name;
      console.log(`Note: "${name}" is not a valid story name. AI will propose the ID.`);
    }
  }

  const { root: narrativeRoot } = narRoot;
  const paths = getDefaultPaths(narrativeRoot);
  let config = await loadConfig(narrativeRoot);

  if (config.ai.provider === 'none') {
    await detect();
    config = await loadConfig(narrativeRoot);
    if (config.ai.provider === 'none') {
      console.error('Error: No AI provider configured.');
      console.error('Run `nara detect` to configure an AI provider.');
      process.exit(1);
    }
  }

  const statePath = `${narrativeRoot}/state.json`;
  const stateRaw = await safeReadFile(statePath);
  let lastIntent = '';
  if (stateRaw) {
    try {
      lastIntent = JSON.parse(stateRaw)?.lastIntent || '';
    } catch {
      lastIntent = '';
    }
  }

  const intent = await input({
    message: 'What are you trying to describe?',
    default: nameHint || lastIntent || '',
  });

  if (!intent.trim()) {
    console.error('Error: Intent is required.');
    process.exit(1);
  }

  const conventionsText = await loadConventions(narrativeRoot);
  const prompt = buildStoryPrompt({
    intent: intent.trim(),
    nameConstraint,
    conventionsText,
  });

  const controller = new AbortController();
  const onSigint = () => {
    controller.abort();
  };
  process.once('SIGINT', onSigint);

  const runStory = async (storyPrompt) => {
    const stopSpinner = startSpinner('Generating story with AI...');
    let result;
    try {
      result = await runAI(storyPrompt, config.ai, { signal: controller.signal });
      stopSpinner();
    } catch (err) {
      stopSpinner();
      throw new Error(`AI command failed (${err.message})`);
    }

    if (result.code !== 0 && !result.stdout.trim()) {
      const stderr = result.stderr ? result.stderr.trim() : '';
      throw new Error(`AI command failed with exit code ${result.code}${stderr ? `: ${stderr}` : ''}`);
    }

    let payload;
    try {
      payload = parseJsonFromOutput(result.stdout);
    } catch (err) {
      const stderr = result.stderr ? result.stderr.trim() : '';
      throw new Error(`${err.message}${stderr ? ` (${stderr})` : ''}`);
    }

    if (!payload || payload.artifactType !== 'story') {
      throw new Error('AI output is missing artifactType=story.');
    }

    return { payload, rawOutput: result.stdout, exitCode: result.code };
  };

  let payload;
  let rawOutput = '';
  let exitCode = 0;
  try {
    const first = await runStory(prompt);
    payload = first.payload;
    rawOutput = first.rawOutput;
    exitCode = first.exitCode;
  } catch (err) {
    process.removeListener('SIGINT', onSigint);
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }

  const validate = (candidate) => validateStoryContent(candidate.content || '', {
    intentText: intent,
    nameConstraint,
    storyType: candidate.storyType,
    storyId: candidate.storyId,
    openQuestions: candidate.openQuestions || [],
  });

  let validationResult = validate(payload);
  if (!validationResult.valid) {
    const strictPrompt = `${prompt}\nSTRICT MODE:\n- Content must include all required headings for the chosen type\n- Use exact "## " headings\n- Return JSON only\n`;
    try {
      const retry = await runStory(strictPrompt);
      payload = retry.payload;
      rawOutput = retry.rawOutput;
      exitCode = retry.exitCode;
      validationResult = validate(payload);
    } catch (err) {
      process.removeListener('SIGINT', onSigint);
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
  }

  if (!validationResult.valid) {
    console.error('Error: AI output failed validation.');
    for (const error of validationResult.errors) {
      console.error(`- ${error}`);
    }
    await safeWriteFile(`${narrativeRoot}/ai-output.json`, rawOutput);
    console.error('Saved raw AI output to .nara/ai-output.json');
    process.exit(2);
  }

  if (exitCode !== 0) {
    console.log('Warning: AI command exited non-zero, using partial output.');
  }

  process.removeListener('SIGINT', onSigint);

  const content = payload.content || '';

  const storyId = payload.storyId || validationResult.id;
  const storyPath = idToPath(storyId, paths.stories);

  if (existsSync(storyPath)) {
    console.error(`Error: Story already exists: ${storyPath}`);
    process.exit(1);
  }

  await safeWriteFile(storyPath, content);
  await safeWriteFile(statePath, JSON.stringify({ lastIntent: intent.trim() }, null, 2) + '\n');

  const displayPath = storyPath.replace(narrativeRoot, '.nara');

  const openQuestions = payload.openQuestions || [];

  console.log(`\n✓ Created story: ${storyId}`);
  console.log(`  Type: ${validationResult.type}`);
  console.log(`  Path: ${displayPath}`);
  if (openQuestions.length > 0) {
    console.log(`  Open Questions: ${openQuestions.length}`);
  }
}
