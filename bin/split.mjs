#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';
import { providerdev } from '@stackql/provider-utils';

/**
 * Derive the Kubernetes API group from an upstream spec file name.
 * File naming convention (kubernetes/kubernetes api/openapi-spec/v3):
 *   api__v1_openapi.json                       -> core
 *   apis__<group>__<version>_openapi.json      -> <group>
 */
function groupFromFileName(fileName) {
  if (/^api__v\d+[^_]*_openapi\.json$/.test(fileName)) {
    return 'core';
  }
  const match = fileName.match(/^apis__(.+?)__v[^_]+_openapi\.json$/);
  return match ? match[1] : null;
}

function normalizeServiceName(raw) {
  return String(raw).toLowerCase().replace(/[-. ]/g, '_');
}

async function splitSingleDoc({ apiDoc, providerName, outputDir, svcDiscriminator, exclude, overwrite, verbose, svcNameOverrides }) {
  const result = await providerdev.split({
    apiDoc,
    providerName,
    outputDir,
    svcDiscriminator,
    exclude,
    overwrite,
    verbose,
    svcNameOverrides
  });
  if (!result) {
    process.exit(1);
  }
  console.log('Split operation completed successfully');
}

async function splitInputDir({ inputDir, providerName, outputDir, overwrite, verbose, svcNameOverrides }) {
  const specFiles = fs.readdirSync(inputDir)
    .filter((f) => f.endsWith('_openapi.json'))
    .sort();

  if (specFiles.length === 0) {
    console.error(`Error: No *_openapi.json specs found in ${inputDir}`);
    process.exit(1);
  }

  // Prepare the output directory, preserving non-yaml files (e.g. .gitkeep)
  fs.mkdirSync(outputDir, { recursive: true });
  const existing = fs.readdirSync(outputDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json'));
  if (existing.length > 0) {
    if (!overwrite) {
      console.error(`Error: Output directory ${outputDir} is not empty. Use --overwrite to replace existing service specs.`);
      process.exit(1);
    }
    for (const f of existing) {
      fs.rmSync(path.join(outputDir, f));
    }
  }

  const written = [];

  for (const specFile of specFiles) {
    const group = groupFromFileName(specFile);
    if (!group) {
      console.error(`Error: Cannot derive API group from file name: ${specFile}`);
      process.exit(1);
    }

    const serviceName = svcNameOverrides[group] || normalizeServiceName(group);
    console.log(`Splitting ${specFile} (group: ${group} -> service: ${serviceName})`);

    // provider-utils split() cleans its output dir on every call, so split
    // each group spec into a temp dir and collect the service spec from there
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackql-split-'));
    try {
      const result = await providerdev.split({
        apiDoc: path.join(inputDir, specFile),
        providerName,
        outputDir: tmpDir,
        svcDiscriminator: 'function',
        svcDiscriminatorFn: () => serviceName,
        overwrite: true,
        verbose,
        svcNameOverrides: {}
      });
      if (!result) {
        console.error(`Error: Split failed for ${specFile}`);
        process.exit(1);
      }

      for (const outFile of fs.readdirSync(tmpDir)) {
        const dest = path.join(outputDir, outFile);
        if (fs.existsSync(dest)) {
          console.error(`Error: Duplicate service spec ${outFile} (produced by ${specFile})`);
          process.exit(1);
        }
        fs.copyFileSync(path.join(tmpDir, outFile), dest);
        written.push(outFile);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  console.log(`Split operation completed successfully: ${written.length} service specs written to ${outputDir}`);
  for (const f of written.sort()) {
    console.log(`  ${f}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
  };

  const providerName = getArg('--provider-name');
  const apiDoc = getArg('--api-doc');
  const inputDir = getArg('--input-dir');
  const outputDir = getArg('--output-dir');
  const svcDiscriminator = getArg('--svc-discriminator') || 'tag';
  const exclude = getArg('--exclude') || '';
  const overwrite = args.includes('--overwrite');
  const verbose = args.includes('--verbose');
  const svcNameOverridesStr = getArg('--svc-name-overrides') || '{}';

  // --svc-name-overrides accepts inline JSON or a path to a JSON file
  let svcNameOverrides = {};
  try {
    const trimmed = svcNameOverridesStr.trim();
    svcNameOverrides = trimmed.startsWith('{')
      ? JSON.parse(trimmed)
      : JSON.parse(fs.readFileSync(trimmed, 'utf8'));
  } catch (err) {
    console.error('Error parsing service name overrides (inline JSON or file path):', err.message);
    process.exit(1);
  }

  if (!providerName || !outputDir || (!apiDoc && !inputDir)) {
    console.error('Error: Missing required arguments');
    console.error('Usage: node split.mjs --provider-name NAME (--api-doc PATH | --input-dir DIR) --output-dir DIR [--svc-discriminator tag|path|group] [--exclude LIST] [--svc-name-overrides JSON] [--overwrite] [--verbose]');
    process.exit(1);
  }

  if (inputDir || svcDiscriminator === 'group') {
    if (!inputDir) {
      console.error('Error: --svc-discriminator group requires --input-dir');
      process.exit(1);
    }
    await splitInputDir({ inputDir, providerName, outputDir, overwrite, verbose, svcNameOverrides });
  } else {
    await splitSingleDoc({ apiDoc, providerName, outputDir, svcDiscriminator, exclude, overwrite, verbose, svcNameOverrides });
  }
}

main().catch((err) => {
  console.error('Error splitting OpenAPI doc(s):', err);
  process.exit(1);
});
