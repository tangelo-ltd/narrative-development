#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NARA_DIR="${ROOT_DIR}/nara"
CLI_PATH="${NARA_DIR}/src/cli.js"
BIN_DIR="/usr/local/bin"

if [[ ! -d "${NARA_DIR}" ]]; then
  echo "nara directory not found at ${NARA_DIR}" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required (>= 18). Install Node.js and try again." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to install dependencies. Install npm and try again." >&2
  exit 1
fi

if [[ ! -f "${CLI_PATH}" ]]; then
  echo "CLI entrypoint not found at ${CLI_PATH}" >&2
  exit 1
fi

echo "Installing dependencies in ${NARA_DIR}..."
(cd "${NARA_DIR}" && npm install --no-audit --no-fund)

chmod +x "${CLI_PATH}"

if [[ ! -d "${BIN_DIR}" ]]; then
  if [[ -w "$(dirname "${BIN_DIR}")" ]]; then
    mkdir -p "${BIN_DIR}"
  else
    sudo mkdir -p "${BIN_DIR}"
  fi
fi

install_link() {
  local name="$1"
  local target="${BIN_DIR}/${name}"

  if [[ -w "${BIN_DIR}" ]]; then
    ln -sf "${CLI_PATH}" "${target}"
  else
    sudo ln -sf "${CLI_PATH}" "${target}"
  fi
}

install_link "nara"
install_link "narra"
install_link "nd"

echo "Installed: nara, narra, nd"
echo "Try: nara --help"
