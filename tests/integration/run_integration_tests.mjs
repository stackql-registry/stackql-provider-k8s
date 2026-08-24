#!/usr/bin/env node

// Integration tests: run the generated provider (local file registry)
// against the mock kube-apiserver and assert row-level results for each
// operation archetype - list unwrapping via objectKey, namespaced routing,
// _all_namespaces resources, subresources, group discovery, and the full
// configmap INSERT / UPDATE / REPLACE / DELETE lifecycle.
//
// Requires a stackql binary: $STACKQL, ./stackql, or `stackql` on PATH.
//
// Usage: node tests/integration/run_integration_tests.mjs [--verbose]

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startMockServer } from './mock_k8s_server.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const verbose = process.argv.includes('--verbose');

function findStackql() {
  if (process.env.STACKQL) return process.env.STACKQL;
  // the repo-root ./stackql is a Linux ELF (WSL use) - only pick the
  // platform-appropriate local binary, else fall back to PATH
  const local = path.join(repoRoot, process.platform === 'win32' ? 'stackql.exe' : 'stackql');
  if (existsSync(local)) return local;
  return 'stackql'; // PATH
}

const stackqlBin = findStackql();
const regPath = path.join(repoRoot, 'provider-dev', 'openapi').split(path.sep).join('/');
const registry = JSON.stringify({
  url: `file://${regPath}`,
  localDocRoot: regPath,
  verifyConfig: { nopVerify: true }
});

// IMPORTANT: must be async (spawn, not spawnSync) - the mock kube-apiserver
// runs on this process's event loop, so a synchronous wait for stackql
// deadlocks: stackql blocks on an HTTP response the mock can never serve.
function runSql(sql, extraEnv = null) {
  return new Promise((resolve) => {
    const child = spawn(stackqlBin, [`--registry=${registry}`, 'exec', sql, '--output', 'json'], {
      cwd: repoRoot,
      env: extraEnv ? { ...process.env, ...extraEnv } : process.env
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => child.kill(), 120000);
    child.on('error', (e) => { clearTimeout(timer); resolve({ rows: null, err: String(e) }); });
    child.on('close', () => {
      clearTimeout(timer);
      stdout = stdout.trim();
      stderr = stderr.trim();
      if (verbose) console.log(`    sql: ${sql}\n    out: ${stdout.slice(0, 300)}${stderr ? `\n    err: ${stderr.slice(0, 300)}` : ''}`);
      const errish = /http response status code: [45]|error|panic|FindRoute|no matching operation/i;
      if (errish.test(stderr)) return resolve({ rows: null, err: stderr });
      if (!stdout) return resolve({ rows: [], err: null });
      try {
        // stackql prints literal null for zero-row results
        resolve({ rows: JSON.parse(stdout) ?? [], err: null });
      } catch {
        // DDL/DML statements return status text, not JSON
        resolve({ rows: [{ _text: stdout }], err: errish.test(stdout) ? stdout : null });
      }
    });
  });
}

const results = [];
function check(name, cond, note = '') {
  results.push({ name, pass: !!cond, note });
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && note ? `  [${String(note).slice(0, 160)}]` : ''}`);
}

// NOTE: cluster_addr must be a dot-free hostname (localhost) - any-sdk's
// query router matches the host against the '{cluster_addr}' server
// template with gorilla/mux, whose host variables do not span dots, so
// IPs and FQDNs currently fail route resolution (core fix candidate).
const { server, port, log } = await startMockServer();
const where = `protocol = 'http' AND cluster_addr = 'localhost:${port}'`;
console.log(`mock kube-apiserver on localhost:${port}, stackql: ${stackqlBin}`);

try {
  // --- meta sanity
  let r = await runSql(`SHOW SERVICES IN k8s`);
  check('show services (20)', r.rows && r.rows.length === 20, r.err || `got ${r.rows?.length}`);

  // --- cluster-scoped list: objectKey $.items unwrapping + pagination.
  // The mock serves namespaces 2 per page, so 5 rows proves stackql
  // traversed the continue token chain (x-stackQL-config pagination).
  let mark = log.length;
  r = await runSql(`SELECT json_extract(metadata, '$.name') AS name, json_extract(status, '$.phase') AS phase FROM k8s.core.namespaces WHERE ${where}`);
  check('namespaces list (5 rows via $.items, paginated)', r.rows && r.rows.length === 5, r.err || `got ${r.rows?.length}`);
  let nsCalls = log.slice(mark).filter((e) => e.path === '/api/v1/namespaces' && e.method === 'GET');
  check('pagination traversed 3 pages via continue token',
    nsCalls.length === 3 && nsCalls.filter((c) => c.query.continue).length === 2,
    `calls: ${JSON.stringify(nsCalls.map((c) => c.query))}`);

  // --- LIMIT pushdown: SQL LIMIT lands on the wire as the k8s limit param
  mark = log.length;
  r = await runSql(`SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.namespaces WHERE ${where} LIMIT 1`);
  check('LIMIT 1 returns 1 row', r.rows && r.rows.length === 1, r.err || `got ${r.rows?.length}`);
  nsCalls = log.slice(mark).filter((e) => e.path === '/api/v1/namespaces' && e.method === 'GET');
  check('LIMIT pushed down as limit query param',
    nsCalls.length > 0 && nsCalls[0].query.limit === '1',
    `calls: ${JSON.stringify(nsCalls.map((c) => c.query))}`);

  // --- server variables defaulted from env vars (x-stackQL-envVar):
  // no protocol/cluster_addr in the WHERE clause at all
  r = await runSql(`SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.namespaces`,
    { KUBE_HOST: `localhost:${port}`, KUBE_PROTOCOL: 'http' });
  check('KUBE_HOST/KUBE_PROTOCOL env defaults (no server params in WHERE)', r.rows && r.rows.length === 5, r.err || `got ${r.rows?.length}`);

  // --- snake_case_aliases: DESCRIBE presents snake aliases of camelCase wire names
  r = await runSql(`DESCRIBE k8s.core.secrets`);
  check('snake_case column surface (string_data in DESCRIBE)',
    r.rows && JSON.stringify(r.rows).includes('string_data'), r.err || JSON.stringify(r.rows).slice(0, 160));

  // --- cluster-scoped get (name routing)
  r = await runSql(`SELECT kind, json_extract(metadata, '$.name') AS name FROM k8s.core.namespaces WHERE name = 'default' AND ${where}`);
  check('namespace get', r.rows && r.rows.length === 1 && JSON.stringify(r.rows[0]).includes('default'), r.err || JSON.stringify(r.rows));

  // --- namespaced list vs all-namespaces resource
  r = await runSql(`SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.pods WHERE namespace = 'default' AND ${where}`);
  check('pods namespaced list (3)', r.rows && r.rows.length === 3, r.err || `got ${r.rows?.length}`);
  r = await runSql(`SELECT json_extract(metadata, '$.name') AS name, json_extract(metadata, '$.namespace') AS namespace FROM k8s.core.pods_all_namespaces WHERE ${where}`);
  check('pods_all_namespaces list (4)', r.rows && r.rows.length === 4, r.err || `got ${r.rows?.length}`);

  // --- snake_case WHERE param aliasing on SELECT methods (request.nativeCasing
  // stamped on every method): label_selector resolves to the labelSelector wire
  // param and is serialized under the wire name (the mock does not filter -
  // assert the wire call, not the row count)
  mark = log.length;
  r = await runSql(`SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.pods WHERE namespace = 'default' AND label_selector = 'app=web' AND ${where}`);
  const lsCalls = log.slice(mark).filter((e) => e.path === '/api/v1/namespaces/default/pods');
  check('snake WHERE param on SELECT (label_selector -> labelSelector on the wire)',
    r.rows && r.rows.length === 3 && lsCalls.length > 0 && lsCalls[0].query.labelSelector === 'app=web',
    r.err || `rows ${r.rows?.length}, calls ${JSON.stringify(lsCalls.map((c) => c.query))}`);

  // --- namespaced get with two path params
  r = await runSql(`SELECT json_extract(status, '$.phase') AS phase FROM k8s.core.pods WHERE namespace = 'default' AND name = 'web-1' AND ${where}`);
  check('pod get (namespace + name)', r.rows && r.rows.length === 1 && JSON.stringify(r.rows[0]).includes('Running'), r.err || JSON.stringify(r.rows));

  // --- subresource resource (deployments_scale)
  r = await runSql(`SELECT * FROM k8s.apps.deployments_scale WHERE namespace = 'default' AND name = 'web' AND ${where}`);
  check('deployments_scale get', r.rows && r.rows.length === 1, r.err || JSON.stringify(r.rows));

  // --- group discovery resource (objectKey $.resources)
  r = await runSql(`SELECT name, kind, namespaced FROM k8s.apps.api_resources WHERE ${where}`);
  check('apps api_resources ($.resources, 3 rows)', r.rows && r.rows.length === 3, r.err || `got ${r.rows?.length}`);

  // --- review kinds: SELECT over POST
  r = await runSql(`SELECT json_extract(status, '$.userInfo.username') AS username FROM k8s.authentication.self_subject_reviews WHERE ${where}`);
  check('self_subject_reviews SELECT (zero-param POST)', r.rows && r.rows.length === 1 && JSON.stringify(r.rows[0]).includes('mock-user'), r.err || JSON.stringify(r.rows));

  r = await runSql(`INSERT INTO k8s.authorization.self_subject_access_reviews(protocol, cluster_addr, spec) SELECT 'http', 'localhost:${port}', '{"resourceAttributes": {"verb": "list", "resource": "pods"}}' RETURNING status, spec`);
  check('self_subject_access_reviews INSERT RETURNING (spec -> body, verdict back)', r.rows && r.rows.length === 1 && JSON.stringify(r.rows[0]).includes('resourceAttributes') && JSON.stringify(r.rows[0]).includes('allowed'), r.err || JSON.stringify(r.rows));

  // --- pods_log: raw text response transformed into a queryable row
  r = await runSql(`SELECT log FROM k8s.core.pods_log WHERE namespace = 'default' AND name = 'web-1' AND ${where}`);
  check('pods_log (text transform to log column)', r.rows && r.rows.length === 1 && JSON.stringify(r.rows[0]).includes('line one'), r.err || JSON.stringify(r.rows));

  // --- configmap lifecycle: INSERT / SELECT / UPDATE / REPLACE / DELETE
  // body columns are native wire property names (naive request body translator)
  r = await runSql(`INSERT INTO k8s.core.config_maps(namespace, protocol, cluster_addr, metadata, data) SELECT 'default', 'http', 'localhost:${port}', '{"name": "it-cm"}', '{"k1": "v1"}'`);
  check('configmap INSERT', !r.err, r.err);
  r = await runSql(`SELECT name, data FROM k8s.core.config_maps WHERE namespace = 'default' AND name = 'it-cm' AND ${where}`);
  check('configmap get after INSERT', r.rows && r.rows.length === 1 && JSON.stringify(r.rows[0]).includes('v1'), r.err || JSON.stringify(r.rows));

  r = await runSql(`UPDATE k8s.core.config_maps SET data = '{"k2": "v2"}' WHERE namespace = 'default' AND name = 'it-cm' AND ${where}`);
  check('configmap UPDATE (patch)', !r.err, r.err);
  r = await runSql(`SELECT data FROM k8s.core.config_maps WHERE namespace = 'default' AND name = 'it-cm' AND ${where}`);
  check('configmap merged after patch', r.rows && JSON.stringify(r.rows[0]).includes('v1') && JSON.stringify(r.rows[0]).includes('v2'), r.err || JSON.stringify(r.rows));

  r = await runSql(`REPLACE k8s.core.config_maps SET metadata = '{"name": "it-cm"}', data = '{"k3": "v3"}' WHERE namespace = 'default' AND name = 'it-cm' AND ${where}`);
  check('configmap REPLACE (put)', !r.err, r.err);
  r = await runSql(`SELECT data FROM k8s.core.config_maps WHERE namespace = 'default' AND name = 'it-cm' AND ${where}`);
  check('configmap replaced (old keys gone)', r.rows && JSON.stringify(r.rows[0]).includes('v3') && !JSON.stringify(r.rows[0]).includes('v1'), r.err || JSON.stringify(r.rows));

  r = await runSql(`DELETE FROM k8s.core.config_maps WHERE namespace = 'default' AND name = 'it-cm' AND ${where}`);
  check('configmap DELETE', !r.err, r.err);
  r = await runSql(`SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.config_maps WHERE namespace = 'default' AND ${where}`);
  check('configmap gone after DELETE', r.rows && !JSON.stringify(r.rows).includes('it-cm'), r.err || JSON.stringify(r.rows));

  const listCalls = log.filter((e) => e.path === '/api/v1/namespaces' && e.method === 'GET');
  check('mock saw namespace list traffic', listCalls.length > 0, JSON.stringify(listCalls.length));
} finally {
  server.close();
}

const failed = results.filter((x) => !x.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
