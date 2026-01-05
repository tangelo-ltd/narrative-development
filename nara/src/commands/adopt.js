/**
 * nara adopt command
 * Onboards an existing codebase by creating nara/ narrative layer.
 *
 * SAFETY: Never writes outside nara/ directory.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { input } from '@inquirer/prompts';
import { getSeedDir, canAdopt } from '../core/paths.js';
import { copyDir, copyDirWithPolicy, ensureDir, listFiles, safeWriteFile } from '../core/fs.js';
import { AI_START_TEMPLATE, STATE_TEMPLATE } from '../templates/ai-start.js';

const DEFAULT_INDEX = `# Narrative Index

Start here for Narrative Development artifacts.

## Entry Points

- \`NARA.md\` - tooling contract and canonical paths
- \`specs/manifest.md\` - project intent and scope
- \`specs/conventions/index.md\` - rules and constraints
- \`specs/stories/\` - atomic capability specs
- \`specs/glossary.md\` - shared vocabulary

## Adopted Codebases

- \`specs/inventory/codebase-map.md\` - current code reality
- \`reports/onboarding-report.md\` - findings and questions
- \`reports/issues.md\` - tracked follow-ups
`;

const DEFAULT_CODEBASE_MAP = `# Codebase Map

Status: Not generated. Run \`nara adopt --inventory\` to populate.

## Entry Points

- Unknown.

## Directories

- Unknown.

## Frameworks

- Unknown.

## Key Modules

- Unknown.

## External Integrations

- Unknown.

## Data Stores

- Unknown.

## Assumptions

- None recorded.
`;

const DEFAULT_ONBOARDING_REPORT = `# Onboarding Report

Status: Not generated.

## Observed Behavior

- None.

## Inferred Behavior

- None.

## Uncertain, Needs Confirmation

- None.
`;

const DEFAULT_ISSUES = `# Issues

Use this format for follow-up items:

- ID: ISSUE-001
  Locations:
  - path/to/file.js:123
  Observation:
  Confidence: low | medium | high
  Question:

## Items

- (none)
`;

async function writeTemplateFile(path, content, options = {}) {
  const { overwrite = false } = options;
  if (!overwrite && existsSync(path)) {
    return false;
  }
  await ensureDir(dirname(path));
  await writeFile(path, content, 'utf-8');
  return true;
}

async function readJsonFile(path) {
  if (!existsSync(path)) {
    return null;
  }
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

async function generateCodebaseMap(repoRoot) {
  const ignoreDirs = new Set([
    '.git',
    '.nara',
    'nara',
    'node_modules',
    'dist',
    'build',
    'coverage',
    'out',
    '.next',
  ]);

  const entries = await readdir(repoRoot, { withFileTypes: true });
  const directories = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => !ignoreDirs.has(name))
    .sort();

  const pkgPath = join(repoRoot, 'package.json');
  const pkg = await readJsonFile(pkgPath);
  const deps = {
    ...(pkg?.dependencies || {}),
    ...(pkg?.devDependencies || {}),
    ...(pkg?.peerDependencies || {}),
  };
  const depNames = Object.keys(deps);

  const frameworks = [];
  const integrations = [];
  const dataStores = [];
  const assumptions = [];
  const entryPoints = [];

  if (pkg?.scripts?.start) entryPoints.push('npm run start');
  if (pkg?.scripts?.build) entryPoints.push('npm run build');
  if (pkg?.scripts?.dev) entryPoints.push('npm run dev');
  if (pkg?.main) entryPoints.push(`node ${pkg.main}`);

  if (existsSync(join(repoRoot, 'Dockerfile'))) entryPoints.push('Dockerfile');
  if (existsSync(join(repoRoot, 'docker-compose.yml'))) entryPoints.push('docker-compose.yml');

  const detect = (name, list, label) => {
    if (depNames.includes(name)) {
      list.push(label);
      assumptions.push(`Inferred ${label} from package.json dependency "${name}".`);
    }
  };

  detect('react', frameworks, 'React');
  detect('next', frameworks, 'Next.js');
  detect('vue', frameworks, 'Vue');
  detect('svelte', frameworks, 'Svelte');
  detect('express', frameworks, 'Express');
  detect('fastify', frameworks, 'Fastify');
  detect('@nestjs/core', frameworks, 'NestJS');
  detect('koa', frameworks, 'Koa');

  detect('pg', dataStores, 'PostgreSQL');
  detect('mysql2', dataStores, 'MySQL');
  detect('mongoose', dataStores, 'MongoDB (Mongoose)');
  detect('mongodb', dataStores, 'MongoDB');
  detect('redis', dataStores, 'Redis');
  detect('sqlite3', dataStores, 'SQLite');
  detect('better-sqlite3', dataStores, 'SQLite');

  detect('stripe', integrations, 'Stripe');
  detect('twilio', integrations, 'Twilio');
  detect('sendgrid', integrations, 'SendGrid');
  detect('sentry', integrations, 'Sentry');
  detect('@sentry/node', integrations, 'Sentry');
  detect('aws-sdk', integrations, 'AWS SDK');
  detect('@aws-sdk/client-s3', integrations, 'AWS SDK');
  detect('firebase', integrations, 'Firebase');

  const renderList = (items, fallback) => (
    items.length ? items.map(item => `- ${item}`).join('\n') : `- ${fallback}`
  );

  return `# Codebase Map

Status: Generated by \`nara adopt --inventory\`.

## Entry Points

${renderList(uniqueList(entryPoints), 'Unknown.')}

## Directories

${renderList(directories, 'Unknown.')}

## Frameworks

${renderList(uniqueList(frameworks), 'Unknown.')}

## Key Modules

${renderList([], 'Unknown.')}

## External Integrations

${renderList(uniqueList(integrations), 'Unknown.')}

## Data Stores

${renderList(uniqueList(dataStores), 'Unknown.')}

## Assumptions

${renderList(uniqueList(assumptions), 'None recorded.')}
`;
}

/**
 * Adopt an existing codebase into Narrative Development.
 * Creates all narrative artifacts under nara/ subdirectory.
 *
 * @param {object} options - Command options
 * @param {string} [options.name] - Project name
 * @param {string} [options.desc] - Project description
 * @param {boolean} [options.merge] - Merge into existing nara/ directory
 * @param {boolean} [options.force] - Overwrite existing files under nara/
 * @param {boolean} [options.inventory] - Run read-only inventory pass
 */
export default async function adopt(options) {
  const cwd = process.cwd();
  const naraDir = join(cwd, 'nara');
  const merge = Boolean(options.merge);
  const force = Boolean(options.force);
  const runInventory = Boolean(options.inventory);

  // Safety check: ensure we can adopt
  const check = canAdopt(cwd, { merge, force });
  if (!check.canAdopt) {
    console.error(`Error: ${check.reason}`);
    console.error('Use --merge to add missing files or --force to overwrite.');
    process.exit(1);
  }

  // Get project info
  const projectName = options.name || basename(cwd);
  const projectDesc = options.desc || 'An adopted Narrative Development project';

  console.log('\nAdopting codebase into Narrative Development...\n');
  console.log('All narrative artifacts will be created under nara/');
  console.log('Existing code will NOT be modified.\n');
  if (merge) {
    console.log('Mode: merge (existing files will be preserved)\n');
  } else if (force) {
    console.log('Mode: force (existing files may be overwritten)\n');
  }

  // Create nara/ directory
  await ensureDir(naraDir);

  const manifestPath = join(naraDir, 'specs', 'manifest.md');
  const manifestExistsBefore = existsSync(manifestPath);

  // Copy seed files into nara/
  const seedDir = getSeedDir();
  if (!existsSync(seedDir)) {
    console.error('Error: Seed files not found. Is nara installed correctly?');
    process.exit(2);
  }

  if (force) {
    await copyDir(seedDir, naraDir);
  } else if (merge) {
    await copyDirWithPolicy(seedDir, naraDir, { overwrite: false });
  } else {
    await copyDir(seedDir, naraDir);
  }

  // Substitute placeholders in manifest.md
  if (existsSync(manifestPath) && (!manifestExistsBefore || force)) {
    let manifest = await readFile(manifestPath, 'utf-8');
    manifest = manifest.replace(/\{\{project_name\}\}/g, projectName);
    manifest = manifest.replace(/\{\{project_description\}\}/g, projectDesc);
    manifest = manifest.replace(/\{\{current_state\}\}/g, 'Existing codebase (adopted)');
    await writeFile(manifestPath, manifest, 'utf-8');
  }

  // Create nara.json with adopted mode marker
  const configPath = join(naraDir, 'nara.json');
  const config = {
    narrativeRoot: '.',
    specRoot: 'specs',
    conventionsIndex: 'specs/conventions/index.md',
    storiesRoot: 'specs/stories',
    mode: 'adopted',
    tokenPolicy: {
      maxFiles: 6,
      maxBytes: 120000,
      includeGlossary: true,
    },
  };
  await writeTemplateFile(
    configPath,
    JSON.stringify(config, null, 2) + '\n',
    { overwrite: force }
  );

  // Ensure INDEX.md exists
  await writeTemplateFile(join(naraDir, 'INDEX.md'), DEFAULT_INDEX, { overwrite: force });

  // Create inventory and reports scaffolding
  const inventoryDir = join(naraDir, 'specs', 'inventory');
  const reportsDir = join(naraDir, 'reports');
  await ensureDir(inventoryDir);
  await ensureDir(reportsDir);

  const codebaseMapPath = join(inventoryDir, 'codebase-map.md');
  const codebaseMapContent = runInventory
    ? await generateCodebaseMap(cwd)
    : DEFAULT_CODEBASE_MAP;
  const wroteInventory = await writeTemplateFile(codebaseMapPath, codebaseMapContent, {
    overwrite: force,
  });
  if (runInventory && !wroteInventory && !force) {
    console.log('Skipped inventory generation (codebase-map.md already exists).');
  } else if (runInventory && wroteInventory) {
    console.log('Generated inventory: nara/specs/inventory/codebase-map.md');
  }

  await writeTemplateFile(join(reportsDir, 'onboarding-report.md'), DEFAULT_ONBOARDING_REPORT, {
    overwrite: force,
  });
  await writeTemplateFile(join(reportsDir, 'issues.md'), DEFAULT_ISSUES, {
    overwrite: force,
  });

  // Create .nara directory for local state in nara/
  await ensureDir(join(naraDir, '.nara'));

  // Create state.json in nara/.nara/
  const stateContent = { ...STATE_TEMPLATE, last_action: 'adopt' };
  await safeWriteFile(join(naraDir, '.nara', 'state.json'), JSON.stringify(stateContent, null, 2) + '\n');

  // Create AI-START.md in nara/
  const aiStartContent = AI_START_TEMPLATE.replace('{{phase}}', 'setup');
  await safeWriteFile(join(naraDir, 'AI-START.md'), aiStartContent);


  // Report what was created
  const files = await listFiles(naraDir);
  const createdFiles = files.filter(f => !f.includes('node_modules'));

  console.log('Created files under nara/:');
  for (const file of createdFiles.slice(0, 15)) {
    const relative = file.replace(naraDir + '/', '');
    console.log(`  nara/${relative}`);
  }
  if (createdFiles.length > 15) {
    console.log(`  ... and ${createdFiles.length - 15} more`);
  }

  console.log('\n✓ Codebase adopted into Narrative Development');
  console.log(`  Narrative root: ${naraDir}`);
  console.log('\nNext steps:');
  console.log('  1. Open AI assistant and point it to nara/AI-START.md');
  console.log('  2. Follow the AI instructions');
}
