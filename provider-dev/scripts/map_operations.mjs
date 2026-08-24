#!/usr/bin/env node

// Populates stackql_resource_name, stackql_method_name, stackql_verb and
// stackql_object_key in provider-dev/config/all_services.csv, driven by the
// x-kubernetes-action and x-kubernetes-group-version-kind extensions in the
// split service specs (provider-dev/source). Deterministic and re-runnable
// on Kubernetes version bumps; review the CSV diff after running.
//
// Usage: node provider-dev/scripts/map_operations.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import pluralize from 'pluralize';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceDir = path.join(repoRoot, 'provider-dev', 'source');
const csvPath = path.join(repoRoot, 'provider-dev', 'config', 'all_services.csv');

const HTTP_VERBS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];
const STREAMING_SUBRESOURCES = ['exec', 'attach', 'portforward'];
const SUBRESOURCE_NAME_OVERRIDES = { ephemeralcontainers: 'ephemeral_containers' };

// Review kinds are POST-only calls that return data and do not mutate the
// system - authz/authn checks, not object creation (nothing is persisted).
// Zero-parameter reviews map to SELECT (post_process.mjs supplies the
// static request body). Parameterized reviews (TokenReview,
// SubjectAccessReview, SelfSubjectAccessReview, SelfSubjectRulesReview,
// LocalSubjectAccessReview) stay INSERT with `RETURNING status` because
// stackql does not yet route SELECT WHERE params into request bodies
// (core gap in any-sdk splitHTTPParameters for select statements) -
// promote them to SELECT once that lands.
const READONLY_POST_KINDS = new Set([
  'SelfSubjectReview'
]);

// Acronym-aware CamelCase -> snake_case (CSIDriver -> csi_driver, APIService -> api_service)
function kindToSnake(kind) {
  return kind
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

function pathParams(p) {
  return (p.match(/\{[^}]+\}/g) || []).map((s) => s.slice(1, -1));
}

// ---------------------------------------------------------------------------
// Pass 0: index every operation in the split service specs
// ---------------------------------------------------------------------------

const ops = new Map(); // `${filename}::${path}::${verb}` -> op info
const parentResourceByItemPath = new Map(); // `${filename}::${itemPath}` -> resource name

const specFiles = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.yaml')).sort();
for (const filename of specFiles) {
  const spec = yaml.load(fs.readFileSync(path.join(sourceDir, filename), 'utf8'));
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    for (const verb of HTTP_VERBS) {
      const op = pathItem[verb];
      if (!op) continue;
      ops.set(`${filename}::${pathKey}::${verb}`, {
        action: op['x-kubernetes-action'] || null,
        gvk: op['x-kubernetes-group-version-kind'] || null,
        operationId: op.operationId
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Pass 1: name the primary resource for every item path (".../{name}") so
// subresource and proxy paths can resolve their parent resource by path
// ---------------------------------------------------------------------------

for (const [key, op] of ops) {
  if (op.action !== 'get') continue;
  const [filename, pathKey] = key.split('::');
  if (!/\{name\}$/.test(pathKey) || pathKey.includes('/watch/')) continue;
  if (!op.gvk) continue;
  const resource = pluralize(kindToSnake(op.gvk.kind));
  parentResourceByItemPath.set(`${filename}::${pathKey}`, resource);
}

// ---------------------------------------------------------------------------
// Pass 2: compute the mapping for each CSV row
// ---------------------------------------------------------------------------

function mapOperation(filename, pathKey, verb, operationId) {
  const op = ops.get(`${filename}::${pathKey}::${verb}`);
  if (!op) return { error: `operation not found in ${sourceDir}` };

  // API group discovery (GET /apis/<group>/<version>/): APIResourceList
  // is an object wrapping a `resources` array, hence the object key
  if (!op.action && /APIResources$/.test(operationId || '')) {
    return { resource: 'api_resources', method: 'list', sqlVerb: 'select', objectKey: '$.resources' };
  }

  if (!op.action) return { error: 'no x-kubernetes-action and not a discovery op' };

  // watch operations are deprecated streaming reads - out of scope
  if (op.action === 'watch' || op.action === 'watchlist' || pathKey.includes('/watch/')) {
    return { resource: 'skip_this_resource', method: '', sqlVerb: '', objectKey: '' };
  }

  if (op.action === 'connect') {
    const seg = pathKey.match(/\{name\}\/([a-z]+)(\/\{path\})?$/);
    const sub = seg ? seg[1] : null;
    if (!sub) return { error: 'connect op with unrecognised path shape' };
    // SPDY/WebSocket streaming subresources are out of scope
    if (STREAMING_SUBRESOURCES.includes(sub)) {
      return { resource: 'skip_this_resource', method: '', sqlVerb: '', objectKey: '' };
    }
    // proxy: plain HTTP passthrough, an action rather than CRUD on a thing
    const itemPath = pathKey.replace(/\/proxy(\/\{path\})?$/, '');
    const parent = parentResourceByItemPath.get(`${filename}::${itemPath}`);
    if (!parent) return { error: `no parent resource for proxy path ${pathKey}` };
    const withPath = pathKey.endsWith('/{path}') ? '_path' : '';
    return { resource: `${parent}_proxy`, method: `connect_${verb}${withPath}`, sqlVerb: 'exec', objectKey: '' };
  }

  // subresource paths: .../{name}/<subresource>
  const subMatch = pathKey.match(/\{name\}\/([a-z]+)$/);
  let resource;
  if (subMatch) {
    const sub = subMatch[1];
    const itemPath = pathKey.replace(/\/[a-z]+$/, '');
    const parent = parentResourceByItemPath.get(`${filename}::${itemPath}`);
    if (!parent) return { error: `no parent resource for subresource path ${pathKey}` };
    resource = `${parent}_${SUBRESOURCE_NAME_OVERRIDES[sub] || sub}`;
  } else if (op.gvk) {
    resource = pluralize(kindToSnake(op.gvk.kind));
  } else {
    return { error: 'no group-version-kind on non-subresource operation' };
  }

  switch (op.action) {
    case 'get':
      return { resource, method: 'get', sqlVerb: 'select', objectKey: '' };
    case 'list': {
      // cluster-wide list of a namespaced kind is a separate resource
      const allNs = /ForAllNamespaces$/.test(operationId || '');
      return {
        resource: allNs ? `${resource}_all_namespaces` : resource,
        method: 'list',
        sqlVerb: 'select',
        objectKey: '$.items'
      };
    }
    case 'post':
      if (op.gvk && READONLY_POST_KINDS.has(op.gvk.kind)) {
        return { resource, method: 'create', sqlVerb: 'select', objectKey: '' };
      }
      return { resource, method: 'create', sqlVerb: 'insert', objectKey: '' };
    case 'put':
      return { resource, method: 'replace', sqlVerb: 'replace', objectKey: '' };
    case 'patch':
      return { resource, method: 'patch', sqlVerb: 'update', objectKey: '' };
    case 'delete':
      return { resource, method: 'delete', sqlVerb: 'delete', objectKey: '' };
    case 'deletecollection':
      return { resource, method: 'delete_collection', sqlVerb: 'delete', objectKey: '' };
    default:
      return { error: `unhandled x-kubernetes-action: ${op.action}` };
  }
}

// ---------------------------------------------------------------------------
// CSV read/transform/write (simple RFC 4180 handling, preserves column order)
// ---------------------------------------------------------------------------

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else { field += c; }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function csvField(v) {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const header = rows[0];
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const required of ['filename', 'path', 'verb', 'operationId', 'stackql_resource_name', 'stackql_method_name', 'stackql_verb', 'stackql_object_key']) {
  if (!(required in col)) {
    console.error(`Missing expected CSV column: ${required}`);
    process.exit(1);
  }
}

const errors = [];
const seenKeys = new Set();
const stats = { mapped: 0, skipped: 0, exec: 0 };

for (const row of rows.slice(1)) {
  const filename = row[col.filename], pathKey = row[col.path], verb = row[col.verb];
  seenKeys.add(`${filename}::${pathKey}::${verb}`);
  const m = mapOperation(filename, pathKey, verb, row[col.operationId]);
  if (m.error) {
    errors.push(`${filename} ${verb} ${pathKey}: ${m.error}`);
    continue;
  }
  row[col.stackql_resource_name] = m.resource;
  if (m.resource === 'skip_this_resource') {
    stats.skipped++;
    continue;
  }
  row[col.stackql_method_name] = m.method;
  row[col.stackql_verb] = m.sqlVerb;
  row[col.stackql_object_key] = m.objectKey;
  if (m.sqlVerb === 'exec') stats.exec++; else stats.mapped++;
}

// spec operations missing from the CSV manifest (would fail generate-provider);
// only the verbs the generator processes need manifest rows
const GENERATOR_VERBS = ['get', 'post', 'put', 'patch', 'delete'];
for (const key of ops.keys()) {
  if (GENERATOR_VERBS.includes(key.split('::')[2]) && !seenKeys.has(key)) {
    errors.push(`in spec but not in CSV: ${key}`);
  }
}

// ---------------------------------------------------------------------------
// Consistency checks: unique (resource, method) and unique path-param
// signatures per (resource, sqlVerb) within each service
// ---------------------------------------------------------------------------

const methodSeen = new Map();
const sigSeen = new Map();
for (const row of rows.slice(1)) {
  const resource = row[col.stackql_resource_name];
  if (!resource || resource === 'skip_this_resource') continue;
  const service = row[col.filename].replace(/\.yaml$/, '');
  const methodKey = `${service}.${resource}.${row[col.stackql_method_name]}`;
  if (methodSeen.has(methodKey)) {
    errors.push(`duplicate method ${methodKey} (${methodSeen.get(methodKey)} and ${row[col.path]}:${row[col.verb]})`);
  }
  methodSeen.set(methodKey, `${row[col.path]}:${row[col.verb]}`);

  const sqlVerb = row[col.stackql_verb];
  if (sqlVerb === 'exec') continue;
  const sig = pathParams(row[col.path]).sort().join(',');
  const sigKey = `${service}.${resource}.${sqlVerb}::${sig}`;
  if (sigSeen.has(sigKey)) {
    errors.push(`signature clash on ${service}.${resource} ${sqlVerb} [${sig}] (${sigSeen.get(sigKey)} and ${row[col.stackql_method_name]})`);
  }
  sigSeen.set(sigKey, row[col.stackql_method_name]);
}

if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const outArgIdx = process.argv.indexOf('--out');
const outPath = outArgIdx !== -1 ? path.resolve(process.argv[outArgIdx + 1]) : csvPath;
const out = rows.map((r) => r.map(csvField).join(',')).join('\n') + '\n';
fs.writeFileSync(outPath, out);

// summary
const resourcesByService = new Map();
for (const row of rows.slice(1)) {
  const resource = row[col.stackql_resource_name];
  if (!resource || resource === 'skip_this_resource') continue;
  const service = row[col.filename].replace(/\.yaml$/, '');
  if (!resourcesByService.has(service)) resourcesByService.set(service, new Set());
  resourcesByService.get(service).add(resource);
}
console.log(`Mapped ${stats.mapped} operations to SQL verbs, ${stats.exec} to exec, ${stats.skipped} skipped (watch/streaming)`);
console.log(`Resources per service:`);
for (const [service, resources] of [...resourcesByService.entries()].sort()) {
  console.log(`  ${service}: ${resources.size}`);
}
console.log(`Total resources: ${[...resourcesByService.values()].reduce((n, s) => n + s.size, 0)}`);
