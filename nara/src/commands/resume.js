import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import { detectAndBootstrapAI } from '../ai/bootstrap.js';
import { findNarrativeRoot } from '../core/paths.js';

/**
 * Resume a Narrative Development session.
 */
export default async function resume() {
  const cwd = process.cwd();
  const rootInfo = findNarrativeRoot(cwd);

  if (!rootInfo) {
    console.error('Error: Not a valid nara project (could not find .nara/NARA.md).');
    process.exit(1);
  }

  const statePath = join(rootInfo.root, 'state.json');
  const aiStartPath = join(rootInfo.root, 'AI-START.md');

  // Calculate relative paths for cleaner prompts if possible
  const relStatePath = relative(cwd, statePath);
  const relAiStartPath = relative(cwd, aiStartPath);

  let state;
  try {
    const raw = await readFile(statePath, 'utf-8');
    state = JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading state file at ${relStatePath}:`, e.message);
    process.exit(1);
  }

  const { phase, last_action, next_steps, current_goal, recent_learnings } = state;

  console.log(`
Resuming session (Phase: ${phase})...`);
  if (last_action) console.log(`Last action: ${last_action}`);
  if (current_goal) console.log(`Current goal: ${current_goal}`);

  const prompt = [
    'I am resuming my work on this project.',
    `Current Phase: ${phase}`,
    last_action ? `Last Action: ${last_action}` : null,
    current_goal ? `Current Goal: ${current_goal}` : null,
    recent_learnings && recent_learnings.length > 0 ? `Recent Learnings: ${recent_learnings.join('; ')}` : null,
    `Please read ${relStatePath} and ${relAiStartPath} to re-orient yourself.`,
    next_steps && next_steps.length > 0 ? `My likely next step is: ${next_steps[0]}. Start this step immediately.` : 'Identify the next logical step and START IT.'
  ].filter(Boolean).join('\n');

  const bootstrap = await detectAndBootstrapAI(prompt);

  if (!bootstrap) {
    console.log('\nAI assistant could not be launched automatically.');
    console.log('Please open your AI tool and paste the following context:\n');
    console.log(prompt);
  }
}
