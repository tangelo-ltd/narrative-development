#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="$ROOT_DIR/.publish-state"

PACKAGES=(
  "$ROOT_DIR/nara"
  "$ROOT_DIR/packages/nara"
  "$ROOT_DIR/packages/nara-cli"
)

if [[ ! -f "$STATE_FILE" ]]; then
  echo "First publish detected; skipping version bump."
  SKIP_BUMP=1
else
  SKIP_BUMP=0
fi

if [[ "$SKIP_BUMP" -eq 0 ]]; then
ROOT_DIR="$ROOT_DIR" node <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.env.ROOT_DIR ?? process.cwd();
const packagePaths = [
  join(rootDir, 'nara', 'package.json'),
  join(rootDir, 'packages', 'nara', 'package.json'),
  join(rootDir, 'packages', 'nara-cli', 'package.json'),
];
const lockPath = join(rootDir, 'nara', 'package-lock.json');

const bumpPatch = version => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }
  const [, major, minor, patch, rest] = match;
  return `${major}.${minor}.${Number(patch) + 1}${rest}`;
};

const mainPkg = JSON.parse(readFileSync(packagePaths[0], 'utf8'));
const nextVersion = bumpPatch(mainPkg.version);

for (const pkgPath of packagePaths) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.version = nextVersion;
  if (pkg.dependencies && pkg.dependencies['@tangeloltd/narrative-development']) {
    pkg.dependencies['@tangeloltd/narrative-development'] = nextVersion;
  }
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
lock.version = nextVersion;
if (lock.packages && lock.packages['']) {
  lock.packages[''].version = nextVersion;
  lock.packages[''].name = '@tangeloltd/narrative-development';
}
writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
console.log(`Version bumped to ${nextVersion}`);
NODE
fi

for pkg_dir in "${PACKAGES[@]}"; do
  if [[ ! -f "$pkg_dir/package.json" ]]; then
    echo "Missing package.json in $pkg_dir"
    exit 1
  fi
done

for pkg_dir in "${PACKAGES[@]}"; do
  echo "Publishing $pkg_dir..."
  (cd "$pkg_dir" && npm publish --access public)
done

if [[ ! -f "$STATE_FILE" ]]; then
  printf "published=%s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STATE_FILE"
fi
