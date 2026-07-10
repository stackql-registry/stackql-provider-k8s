#!/usr/bin/env node

// Kubernetes-specific spec adjustments applied to provider-dev/source before
// the generic `npm run normalize` pass.
//
// IntOrString is published as `oneOf: [integer, string]` (integer first).
// The normalize allOf-flatten keeps the first member's scalar type, which
// would type every IntOrString field (service targetPort, rolling update
// maxSurge/maxUnavailable, PDB minAvailable, ...) as integer even though
// they legitimately hold strings like "50%" or named ports. A string column
// holds both representations, so rewrite the component schema to
// `type: string` (keeping `format: int-or-string` as the marker) before
// the flatten inlines it everywhere.
//
// Usage: node provider-dev/scripts/pre_normalize.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceDir = path.join(repoRoot, 'provider-dev', 'source');

const INT_OR_STRING_SCHEMA = 'io.k8s.apimachinery.pkg.util.intstr.IntOrString';

let filesTouched = 0;
for (const filename of fs.readdirSync(sourceDir).filter((f) => f.endsWith('.yaml')).sort()) {
  const filePath = path.join(sourceDir, filename);
  const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
  const schema = doc.components?.schemas?.[INT_OR_STRING_SCHEMA];
  if (!schema || !Array.isArray(schema.oneOf)) continue;
  delete schema.oneOf;
  schema.type = 'string';
  fs.writeFileSync(filePath, yaml.dump(doc, { lineWidth: -1, noRefs: true }), 'utf8');
  filesTouched++;
  console.log(`${filename}: IntOrString -> type: string`);
}
console.log(`Done. ${filesTouched} file(s) adjusted.`);
