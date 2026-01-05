#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NARA_DIR="${ROOT_DIR}/nara"
CLI_PATH="${NARA_DIR}/src/cli.js"
BIN_DIR="/usr/local/bin"

remove_link() {
  local name="$1"
  local target="${BIN_DIR}/${name}"

  if [[ -L "${target}" ]]; then
    local resolved
    resolved="$(readlink "${target}")"
    if [[ "${resolved}" == "${CLI_PATH}" ]]; then
      if [[ -w "${BIN_DIR}" ]]; then
        rm -f "${target}"
      else
        sudo rm -f "${target}"
      fi
      echo "Removed ${name}"
    else
      echo "Skipping ${name} (points to ${resolved})"
    fi
  elif [[ -e "${target}" ]]; then
    echo "Skipping ${name} (not a symlink)"
  else
    echo "Not found: ${name}"
  fi
}

remove_link "nara"
remove_link "narra"
remove_link "nd"

echo "Uninstall complete."
