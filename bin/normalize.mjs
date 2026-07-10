#!/usr/bin/env node

import { providerdev } from '@stackql/provider-utils';
import fs from 'fs';

async function normalizeSpecs() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
  };

  const apiDir = getArg('--api-dir');
  const verbose = args.includes('--verbose');
  const bareArrayOverridesStr = getArg('--bare-array-overrides');

  if (!apiDir) {
    console.error('Error: Missing required arguments');
    console.error('Usage: node normalize.mjs --api-dir DIR [--verbose] [--bare-array-overrides JSON|FILE.json]');
    process.exit(1);
  }

  // --bare-array-overrides accepts inline JSON or a path to a JSON file
  let bareArrayOverrides = null;
  if (bareArrayOverridesStr) {
    try {
      const trimmed = bareArrayOverridesStr.trim();
      bareArrayOverrides = trimmed.startsWith('{')
        ? JSON.parse(trimmed)
        : JSON.parse(fs.readFileSync(trimmed, 'utf8'));
    } catch (err) {
      console.error('Error parsing bare array overrides (inline JSON or file path):', err.message);
      process.exit(1);
    }
  }

  try {
    const stats = await providerdev.normalize({ apiDir, verbose, bareArrayOverrides });
    console.log('Normalize completed:', JSON.stringify({
      filesProcessed: stats.filesProcessed,
      allOfFlattened: stats.allOfFlattened,
      oneOfRenamed: stats.oneOfRenamed,
      anyOfRenamed: stats.anyOfRenamed,
      misplacedKeywordsStripped: stats.stripped.length,
      opaqueObjectsConverted: stats.opaqueConverted.length,
      pathParamsLifted: stats.pathParamsLifted,
      serversStripped: stats.serversStripped,
      bareArraysWrapped: stats.bareArrayWrapped
    }, null, 2));
  } catch (error) {
    console.error('Error normalizing specs:', error);
    process.exit(1);
  }
}

normalizeSpecs();
