/**
 * nara detect command
 * Detects installed AI CLI tools and configures the user's preference.
 */

import { select } from '@inquirer/prompts';
import { findNarrativeRoot, getDefaultPaths } from '../core/paths.js';
import { safeReadFile, safeWriteFile } from '../core/fs.js';
import { detectAITools, getAdapterConfig } from '../ai/detect.js';

/**
 * Detect AI tools and configure user preference.
 */
export default async function detect(options = {}) {
  // Find narrative root
  const narRoot = findNarrativeRoot();
  if (!narRoot) {
    console.error('Error: Not in a nara repository');
    console.error('Run `nara init` for a new project or `nara adopt` for an existing codebase');
    process.exit(2);
  }

  const { root: narrativeRoot } = narRoot;
  const paths = getDefaultPaths(narrativeRoot);

  // Respect existing configuration unless forced
  const existingContent = await safeReadFile(paths.userConfig);
  if (existingContent) {
    try {
      const existingConfig = JSON.parse(existingContent);
      const provider = existingConfig?.ai?.provider;
      if (provider && provider !== 'none' && !options.force) {
        console.log(`AI provider already configured (${provider}).`);
        console.log('Use `nara detect --force` to re-run detection.');
        return;
      }
    } catch {
      // Ignore invalid config and proceed with detection
    }
  }

  console.log('Detecting AI CLI tools...\n');

  const tools = await detectAITools();

  if (tools.length === 0) {
    console.log('No AI CLI tools detected.');
    console.log('\nSupported tools:');
    console.log('  - codex (OpenAI Codex CLI)');
    console.log('  - claude (Anthropic Claude CLI)');
    console.log('  - gemini (Google Gemini CLI)');
    console.log('\nInstall one of these tools and run `nara detect` again.');
    console.log('Or use `nara configure ai.provider=custom` for a custom tool.');
    return;
  }

  console.log('Found AI CLI tools:');
  for (const tool of tools) {
    console.log(`  - ${tool.name}: ${tool.path}`);
  }
  console.log();

  let selectedTool;

  if (tools.length === 1) {
    // Auto-select if only one tool
    selectedTool = tools[0];
    console.log(`Auto-selecting: ${selectedTool.name}`);
  } else {
    // Prompt user to choose
    const choice = await select({
      message: 'Multiple AI tools detected. Which one should nara use?',
      choices: [
        ...tools.map(t => ({
          name: `${t.name} (${t.path})`,
          value: t.name,
        })),
        {
          name: 'None - I\'ll configure manually later',
          value: 'none',
        },
      ],
    });

    if (choice === 'none') {
      console.log('\nNo AI tool configured. Use `nara configure` to set one later.');
      return;
    }

    selectedTool = tools.find(t => t.name === choice);
  }

  // Load existing config
  let config = {};
  if (existingContent) {
    try {
      config = JSON.parse(existingContent);
    } catch {
      // Ignore invalid config
    }
  }

  // Update AI config
  config.ai = getAdapterConfig(selectedTool.name);

  // Write config
  await safeWriteFile(paths.userConfig, JSON.stringify(config, null, 2) + '\n');

  const displayPath = paths.userConfig.replace(narrativeRoot, '.nara');

  console.log(`\n✓ Configured ${selectedTool.name} as the AI provider`);
  console.log(`  Config saved to: ${displayPath}`);
}
