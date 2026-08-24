#!/usr/bin/env bash

# Thin passthrough to normalize.mjs (kept for bash users; `npm run normalize` calls normalize.mjs directly)

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

node "$SCRIPT_DIR/normalize.mjs" "$@"
