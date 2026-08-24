#!/usr/bin/env node

// Mock kube-apiserver for integration-testing the generated k8s provider
// without a cluster. Serves canned JSON in the exact wire shapes the real
// API server produces (lists wrap items with kind/apiVersion/metadata,
// subresources, text/plain pod logs), and maintains an in-memory configmap
// store so INSERT / UPDATE / REPLACE / DELETE round-trip realistically.
//
// List endpoints honour the k8s `limit` / `continue` pagination contract
// only when a `limit` query param is supplied, so unpaginated clients see
// full collections and pagination-aware clients can be asserted against.
//
// Exports startMockServer() for the test runner; also runnable standalone:
//   node tests/integration/mock_k8s_server.mjs [port]

import http from 'http';
import { URL } from 'url';

function meta(name, namespace) {
  const m = {
    name,
    uid: `uid-${name}`,
    resourceVersion: '1',
    creationTimestamp: '2026-01-01T00:00:00Z'
  };
  if (namespace) m.namespace = namespace;
  return m;
}

function nsObj(name, phase = 'Active') {
  return { kind: 'Namespace', apiVersion: 'v1', metadata: meta(name), status: { phase } };
}

function podObj(name, namespace, phase = 'Running') {
  return {
    kind: 'Pod',
    apiVersion: 'v1',
    metadata: meta(name, namespace),
    spec: { nodeName: 'mock-node-1', containers: [{ name: 'app', image: 'nginx:1.27' }] },
    status: { phase, podIP: '10.0.0.1' }
  };
}

function deployObj(name, namespace, replicas = 1) {
  return {
    kind: 'Deployment',
    apiVersion: 'apps/v1',
    metadata: meta(name, namespace),
    spec: { replicas, selector: { matchLabels: { app: name } } },
    status: { replicas, readyReplicas: replicas, availableReplicas: replicas }
  };
}

// fixed collections
const NAMESPACES = ['default', 'kube-system', 'kube-public', 'kube-node-lease', 'stackql-mock'].map((n) => nsObj(n));
const PODS = {
  'default': [podObj('web-1', 'default'), podObj('web-2', 'default'), podObj('db-1', 'default', 'Pending')],
  'kube-system': [podObj('coredns-1', 'kube-system')]
};
const DEPLOYMENTS = { 'default': [deployObj('web', 'default', 2)] };

// mutable configmap store: namespace -> name -> object
const configMaps = new Map([['default', new Map()]]);

function list(kind, items, { limit, continueToken } = {}) {
  const body = {
    kind: `${kind}List`,
    apiVersion: kind === 'Deployment' ? 'apps/v1' : 'v1',
    metadata: { resourceVersion: '1000' },
    items
  };
  if (continueToken) body.metadata.continue = continueToken;
  return body;
}

// k8s pagination: opaque continue token; here it is just the start offset.
// defaultPageSize simulates a server-side page cap so pagination-aware
// clients must traverse continue tokens even without an explicit limit.
function paginate(items, url, defaultPageSize = 0) {
  const limit = parseInt(url.searchParams.get('limit') || '0', 10) || defaultPageSize;
  const start = parseInt(url.searchParams.get('continue') || '0', 10) || 0;
  if (!limit || limit <= 0) return { page: items, continueToken: null };
  const page = items.slice(start, start + limit);
  const next = start + limit < items.length ? String(start + limit) : null;
  return { page, continueToken: next };
}

function statusOK(details) {
  return { kind: 'Status', apiVersion: 'v1', status: 'Success', details };
}

function notFound(res, kind, name) {
  send(res, 404, {
    kind: 'Status', apiVersion: 'v1', status: 'Failure', reason: 'NotFound',
    message: `${kind} "${name}" not found`, code: 404
  });
}

function send(res, code, body, contentType = 'application/json') {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': contentType });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({ _raw: data }); }
    });
  });
}

const APPS_DISCOVERY = {
  kind: 'APIResourceList',
  apiVersion: 'v1',
  groupVersion: 'apps/v1',
  resources: [
    { name: 'deployments', singularName: 'deployment', namespaced: true, kind: 'Deployment', verbs: ['get', 'list', 'create', 'update', 'patch', 'delete'] },
    { name: 'statefulsets', singularName: 'statefulset', namespaced: true, kind: 'StatefulSet', verbs: ['get', 'list'] },
    { name: 'daemonsets', singularName: 'daemonset', namespaced: true, kind: 'DaemonSet', verbs: ['get', 'list'] }
  ]
};

async function handle(req, res, log) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  const m = req.method;
  log.push({ method: m, path: p, query: Object.fromEntries(url.searchParams) });

  let match;

  // group discovery
  if (m === 'GET' && p === '/apis/apps/v1/') return send(res, 200, APPS_DISCOVERY);

  // review kinds (SELECT-over-POST): echo the received spec back so tests
  // can assert the request body actually carried the WHERE-supplied members
  if (m === 'POST' && p === '/apis/authorization.k8s.io/v1/selfsubjectaccessreviews') {
    const body = await readBody(req);
    return send(res, 201, {
      kind: 'SelfSubjectAccessReview', apiVersion: 'authorization.k8s.io/v1',
      metadata: {}, spec: body.spec || {},
      status: { allowed: true, reason: 'mock-grant' }
    });
  }
  if (m === 'POST' && p === '/apis/authentication.k8s.io/v1/selfsubjectreviews') {
    return send(res, 201, {
      kind: 'SelfSubjectReview', apiVersion: 'authentication.k8s.io/v1',
      metadata: {},
      status: { userInfo: { username: 'mock-user', groups: ['system:authenticated'] } }
    });
  }

  // namespaces (cluster-scoped, paginated at 2 per page server-side)
  if (m === 'GET' && p === '/api/v1/namespaces') {
    const { page, continueToken } = paginate(NAMESPACES, url, 2);
    return send(res, 200, list('Namespace', page, { continueToken }));
  }
  if ((match = p.match(/^\/api\/v1\/namespaces\/([^/]+)$/)) && m === 'GET') {
    const ns = NAMESPACES.find((n) => n.metadata.name === match[1]);
    return ns ? send(res, 200, ns) : notFound(res, 'Namespace', match[1]);
  }

  // pods
  if (m === 'GET' && p === '/api/v1/pods') {
    return send(res, 200, list('Pod', Object.values(PODS).flat()));
  }
  if ((match = p.match(/^\/api\/v1\/namespaces\/([^/]+)\/pods$/)) && m === 'GET') {
    return send(res, 200, list('Pod', PODS[match[1]] || []));
  }
  if ((match = p.match(/^\/api\/v1\/namespaces\/([^/]+)\/pods\/([^/]+)$/)) && m === 'GET') {
    const pod = (PODS[match[1]] || []).find((x) => x.metadata.name === match[2]);
    return pod ? send(res, 200, pod) : notFound(res, 'Pod', match[2]);
  }
  if ((match = p.match(/^\/api\/v1\/namespaces\/([^/]+)\/pods\/([^/]+)\/log$/)) && m === 'GET') {
    return send(res, 200, 'line one\nline two\n', 'text/plain');
  }

  // deployments + scale subresource
  if ((match = p.match(/^\/apis\/apps\/v1\/namespaces\/([^/]+)\/deployments$/)) && m === 'GET') {
    return send(res, 200, list('Deployment', DEPLOYMENTS[match[1]] || []));
  }
  if ((match = p.match(/^\/apis\/apps\/v1\/namespaces\/([^/]+)\/deployments\/([^/]+)$/)) && m === 'GET') {
    const d = (DEPLOYMENTS[match[1]] || []).find((x) => x.metadata.name === match[2]);
    return d ? send(res, 200, d) : notFound(res, 'Deployment', match[2]);
  }
  if ((match = p.match(/^\/apis\/apps\/v1\/namespaces\/([^/]+)\/deployments\/([^/]+)\/scale$/))) {
    const d = (DEPLOYMENTS[match[1]] || []).find((x) => x.metadata.name === match[2]);
    if (!d) return notFound(res, 'Deployment', match[2]);
    if (m === 'GET') {
      return send(res, 200, {
        kind: 'Scale', apiVersion: 'autoscaling/v1', metadata: meta(match[2], match[1]),
        spec: { replicas: d.spec.replicas }, status: { replicas: d.spec.replicas }
      });
    }
    if (m === 'PATCH' || m === 'PUT') {
      const body = await readBody(req);
      const replicas = body?.spec?.replicas ?? d.spec.replicas;
      d.spec.replicas = replicas;
      return send(res, 200, {
        kind: 'Scale', apiVersion: 'autoscaling/v1', metadata: meta(match[2], match[1]),
        spec: { replicas }, status: { replicas }
      });
    }
  }

  // configmaps (mutable store)
  if ((match = p.match(/^\/api\/v1\/namespaces\/([^/]+)\/configmaps$/))) {
    const store = configMaps.get(match[1]) || configMaps.set(match[1], new Map()).get(match[1]);
    if (m === 'GET') return send(res, 200, list('ConfigMap', [...store.values()]));
    if (m === 'POST') {
      const body = await readBody(req);
      const name = body?.metadata?.name || 'unnamed';
      const obj = { kind: 'ConfigMap', apiVersion: 'v1', metadata: meta(name, match[1]), data: body.data || {} };
      store.set(name, obj);
      return send(res, 201, obj);
    }
  }
  if ((match = p.match(/^\/api\/v1\/namespaces\/([^/]+)\/configmaps\/([^/]+)$/))) {
    const store = configMaps.get(match[1]) || new Map();
    const existing = store.get(match[2]);
    if (m === 'GET') return existing ? send(res, 200, existing) : notFound(res, 'ConfigMap', match[2]);
    if (m === 'PATCH' || m === 'PUT') {
      if (!existing && m === 'PATCH') return notFound(res, 'ConfigMap', match[2]);
      const body = await readBody(req);
      const obj = {
        kind: 'ConfigMap', apiVersion: 'v1', metadata: meta(match[2], match[1]),
        data: { ...(m === 'PATCH' ? existing.data : {}), ...(body.data || {}) }
      };
      store.set(match[2], obj);
      return send(res, 200, obj);
    }
    if (m === 'DELETE') {
      if (!existing) return notFound(res, 'ConfigMap', match[2]);
      store.delete(match[2]);
      return send(res, 200, statusOK({ name: match[2], kind: 'configmaps' }));
    }
  }

  send(res, 404, { kind: 'Status', status: 'Failure', reason: 'NotFound', message: `no mock route for ${m} ${p}`, code: 404 });
}

export function startMockServer(port = 0) {
  const log = [];
  const server = http.createServer((req, res) => {
    handle(req, res, log).catch((err) => send(res, 500, { error: err.message }));
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port, log });
    });
  });
}

// standalone mode
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('mock_k8s_server.mjs')) {
  const { port } = await startMockServer(parseInt(process.argv[2] || '18080', 10));
  console.log(`mock kube-apiserver listening on http://127.0.0.1:${port}`);
}
