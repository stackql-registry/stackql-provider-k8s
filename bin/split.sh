#!/usr/bin/env bash

# Thin passthrough to split.mjs (kept for bash users; `npm run split` calls split.mjs directly)

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

node "$SCRIPT_DIR/split.mjs" "$@"
