import { execa } from 'execa';
import { select } from '@inquirer/prompts';

/**
 * Detects available AI CLI tools and prompts the user to launch one.
 * @param {string} promptText - The prompt to send to the AI.
 * @returns {Promise<boolean>} - True if an AI was bootstrapped, false otherwise.
 */
export async function detectAndBootstrapAI(promptText) {
  const aiTools = [
    { name: 'Gemini', value: 'gemini', cmd: 'gemini', args: ['--prompt-interactive'] },
    { name: 'Claude', value: 'claude', cmd: 'claude', args: [] },
    { name: 'Codex', value: 'codex', cmd: 'codex', args: ['--sandbox', 'workspace-write'] },
  ];

  const foundTools = [];
  for (const tool of aiTools) {
    try {
      await execa(tool.cmd, ['--version']);
      foundTools.push(tool);
    } catch {
      // Ignore missing tools
    }
  }

  if (foundTools.length === 0) {
    return false;
  }

  console.log('\nAI Assistants detected:');
  const answer = await select({
    message: 'Select an AI assistant to bootstrap (or None to skip):',
    choices: [
      ...foundTools.map(t => ({ name: t.name, value: t })),
      { name: 'None (Manual setup)', value: null },
    ],
  });

  if (!answer) {
    return false;
  }

  console.log(`\nLaunching ${answer.name}...`);
  try {
    await execa(answer.cmd, [...answer.args, promptText], { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error(`\nFailed to launch ${answer.name}: ${e.message}`);
    return false;
  }
}
