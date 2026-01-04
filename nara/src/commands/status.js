/**
 * nara status command
 * Reports the current health of the narrative repository.
 */

import { findNarrativeRoot, getDefaultPaths } from '../core/paths.js';
import { join } from 'node:path';
import { listFiles, safeReadFile } from '../core/fs.js';
import { loadConfig } from '../core/config.js';
import { analyzeStory } from '../spec/parser.js';
import { runAI } from '../ai/runner.js';
import { parseJsonFromOutput } from '../ai/parse.js';
import { buildStatusSuggestionPrompt } from '../ai/prompts.js';
import { startSpinner } from '../core/ui.js';

/**
 * Report narrative health.
 * @param {object} options - Command options
 * @param {boolean} [options.json] - Output as JSON
 * @param {boolean} [options.verbose] - Show full details
 */
export default async function status(options) {
  // Find narrative root
  const narRoot = findNarrativeRoot();
  if (!narRoot) {
    console.error('Error: Not in a nara repository');
    console.error('Run `nara init` for a new project or `nara adopt` for an existing codebase');
    process.exit(2);
  }

  const { root: narrativeRoot, mode, repoRoot } = narRoot;
  const paths = getDefaultPaths(narrativeRoot);
  const config = await loadConfig(narrativeRoot);

  // Find all story files
  const storyFiles = await listFiles(paths.stories, '.md');

  // Filter out template files
  const stories = storyFiles.filter(f => !f.includes('_template'));

  // Analyze each story
  const analyses = [];
  for (const file of stories) {
    const content = await safeReadFile(file);
    if (content) {
      const analysis = analyzeStory(content);
      analysis.file = file.replace(narrativeRoot + '/', '');
      analyses.push(analysis);
    }
  }

  // Categorize
  const complete = analyses.filter(a => a.complete);
  const withOpenQuestions = analyses.filter(a => a.missing.length === 0 && a.openQuestions > 0);
  const incomplete = analyses.filter(a => a.missing.length > 0);

  // Build result
  const result = {
    narrativeRoot: mode === 'adopted' ? 'nara/' : '.',
    mode,
    stories: {
      total: analyses.length,
      complete: complete.length,
      withOpenQuestions: withOpenQuestions.length,
      incomplete: incomplete.length,
    },
    openQuestions: withOpenQuestions.map(a => ({
      id: a.id,
      file: a.file,
      count: a.openQuestions,
    })),
    incomplete: incomplete.map(a => ({
      id: a.id,
      file: a.file,
      missing: a.missing,
    })),
    ai: {
      provider: config.ai.provider,
      configured: config.ai.provider !== 'none',
    },
  };

  // Output
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable output
  console.log('nara status\n');
  console.log(`Narrative root: ${result.narrativeRoot} (${mode} mode)`);

  console.log(`\nStories: ${result.stories.total}`);
  console.log(`  Complete: ${result.stories.complete}`);
  console.log(`  With Open Questions: ${result.stories.withOpenQuestions}`);
  console.log(`  Incomplete: ${result.stories.incomplete}`);

  if (result.openQuestions.length > 0) {
    console.log('\nOpen Questions:');
    for (const s of result.openQuestions) {
      const id = s.id || s.file;
      console.log(`  ${id} (${s.count} question${s.count !== 1 ? 's' : ''})`);
    }
  }

  if (result.incomplete.length > 0) {
    console.log('\nIncomplete Stories:');
    for (const s of result.incomplete) {
      const id = s.id || s.file;
      console.log(`  ${id} - missing: ${s.missing.join(', ')}`);
    }
  }

  console.log(`\nAI Provider: ${result.ai.provider} (${result.ai.configured ? 'configured' : 'not configured'})`);

  if (!result.ai.configured) {
    console.log('  Run `nara detect` to configure an AI provider');
    return;
  }

  const manifestPath = join(narrativeRoot, 'specs', 'manifest.md');
  const manifestContent = await safeReadFile(manifestPath);
  const stateContent = await safeReadFile(`${narrativeRoot}/.nara/state.json`);
  let lastIntent = '';
  if (stateContent) {
    try {
      lastIntent = JSON.parse(stateContent).lastIntent || '';
    } catch {
      lastIntent = '';
    }
  }

  if (!manifestContent) {
    return;
  }

  const suggestionPrompt = buildStatusSuggestionPrompt({
    manifestContent,
    storyStats: result.stories,
    lastIntent,
  });

  const stopSpinner = startSpinner('Generating AI suggestion...');
  let aiResult;
  try {
    aiResult = await runAI(suggestionPrompt, config.ai);
    stopSpinner();
  } catch (err) {
    stopSpinner();
    console.log('AI suggestion unavailable.');
    return;
  }

  if (aiResult.code !== 0 && !aiResult.stdout.trim()) {
    console.log('AI suggestion unavailable.');
    return;
  }

  let suggestion;
  try {
    suggestion = parseJsonFromOutput(aiResult.stdout);
  } catch {
    console.log('AI suggestion unavailable.');
    return;
  }

  if (suggestion?.suggestion) {
    console.log(`\nSuggestion: ${suggestion.suggestion}`);
    if (suggestion.reason) {
      console.log(`Reason: ${suggestion.reason}`);
    }
  }
}
