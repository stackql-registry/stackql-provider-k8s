# `k8s` provider for [`stackql`](https://github.com/stackql/stackql)

This repository generates and documents the `k8s` provider for StackQL, enabling SQL-based query and provisioning operations against any Kubernetes cluster - covering all built-in control plane API groups and their subresources. The provider is built using the `@stackql/provider-utils` package.

## Design Principles

This is a ground-up rebuild of the original `k8s` provider. Key differences from the original implementation:

- **OpenAPI v3, per API group** - specs are sourced from the per-group OpenAPI v3 documents published in the [`kubernetes/kubernetes`](https://github.com/kubernetes/kubernetes) repository (`api/openapi-spec/v3/`) for a pinned release, rather than the monolithic `/openapi/v2` swagger document. Each API group maps naturally to a StackQL service, and the v3 specs carry accurate schema information (including `x-kubernetes-group-version-kind` extensions) which makes resource and method mapping mechanical rather than heuristic.
- **General provider, pointable at any cluster** - the provider is generated from the published upstream specs, not from a live cluster. The API server address is a runtime variable; the same provider works against kind, EKS, GKE, AKS, OpenShift, or bare metal.
- **Complete control plane coverage** - all built-in API groups are included, not a curated subset. See [Service Coverage](#service-coverage).
- **Subresource support** - `status`, `scale`, `log`, `eviction`, `binding`, and `approval` subresources are mapped as first-class methods on their parent resources.
- **Version-pinned builds** - the provider is generated and tagged per Kubernetes minor release (e.g. `v1.31`), built and tested in CI against a matching [kind](https://kind.sigs.k8s.io/) cluster.

Custom Resource Definitions are inherently cluster-specific and are out of scope for the general provider; the `apiextensions` service supports full lifecycle operations on the CRDs themselves. Streaming operations (`exec`, `attach`, `port-forward`, `watch`, follow-mode logs) use SPDY/WebSocket protocol upgrades and are also out of scope for the generated provider. Point-in-time log retrieval (`pods/log`) is supported as a standard method.

### Breaking Changes from the Original Provider

This rebuild is a breaking change relative to the published `k8s` provider (`v23.03.00121`):

- Service coverage expands from 5 services (`core`, `core_v1`, `admissionregistration`, `admissionregistration_v1`, `apiextensions`) to all built-in API groups, and the duplicated `<service>`/`<service>_v1` naming is collapsed to a single flat service name per group.
- Resource names move from singular (`k8s.core_v1.pod`) to plural (`k8s.core.pods`), consistent with the `aws`, `google`, and `databricks` providers.
- Request body columns move from `data__` prefixed (`data__metadata`) to native wire property names (`metadata`, `spec`, `data`) via the naive request body translator, consistent with the `aws` and `azure` providers; snake_case aliases of camelCase wire names are also accepted.
- `SELECT` / `DESCRIBE` columns present as snake_case aliases of camelCase wire properties (`roleRef` -> `role_ref`, `stringData` -> `string_data`) via `snake_case_aliases: true`, consistent with the `aws` and `azure` providers. Most top-level k8s columns (`metadata`, `spec`, `status`) are unaffected; nested `json_extract` paths remain wire-format camelCase.
- The `cluster_addr` and `protocol` server parameters are retained and behave as before, and can now be defaulted from the `KUBE_HOST` and `KUBE_PROTOCOL` environment variables.

Existing queries against the old provider will require updating. The old provider version remains available in the registry for pinning.

## Prerequisites

To build or test the Kubernetes provider you will need:

1. Node.js 20+ and GNU make (for the build pipeline)
2. StackQL CLI installed (see [StackQL](https://github.com/stackql/stackql)) - `$STACKQL`, `./stackql`, or on `PATH`
3. Python 3 (a venv with `pystackql` is created on demand for the smoke suite)
4. yarn (for the docs microsite)
5. A Kubernetes cluster for testing (a local [kind](https://kind.sigs.k8s.io/) cluster is sufficient), with `kubectl` configured

## Build with make

Every pipeline stage below is wrapped as a `make` target ([Makefile](Makefile)); `make all` runs the full chain - download pinned specs, split, map, normalize, generate, post-process, all non-cluster tests, docs, and the website build - and can be used at any stage to produce and test a new provider and docs from upstream changes:

```bash
make all              # deps -> build -> test -> docs -> website
make help             # list all targets
```

Individual stages (each corresponds to a numbered section below):

| Target | Purpose |
|---|---|
| `make deps` | install node dependencies |
| `make download` | download the per-group OpenAPI v3 specs for the pinned release (`K8S_VERSION` in the Makefile) |
| `make split` | split into per-service StackQL service specs |
| `make mappings` | regenerate and validate `all_services.csv` from the mapping rules |
| `make pre-normalize normalize` | lower polymorphism in the service specs |
| `make generate` | generate the provider (runs `post-process` automatically) |
| `make test` | offline + integration + meta-route test layers (no cluster required) |
| `make smoke` | live smoke suite against the locally generated provider (needs a cluster + `kubectl proxy`) |
| `make smoke-live` | live smoke suite against the published provider in the public registry |
| `make docs website` | generate the doc pages and build the microsite |

`make smoke` and `make smoke-live` source a gitignored `.env` file if present (`KUBE_HOST`, `KUBE_PROTOCOL`, `KUBE_TOKEN`). The smoke suite runs entirely against a cluster you point it at - with a local kind cluster the total cost is $0.

## 1. Download the OpenAPI Specs (`make download`)

Download the per-group OpenAPI v3 specs from the pinned Kubernetes release branch. Spec files follow the naming convention `api__v1_openapi.json` (core group) and `apis__<group>__<version>_openapi.json` (named groups):

```bash
K8S_VERSION=1.36
BASE_URL="https://raw.githubusercontent.com/kubernetes/kubernetes/release-${K8S_VERSION}/api/openapi-spec/v3"

mkdir -p provider-dev/downloaded
while read -r spec; do
  curl -sL "${BASE_URL}/${spec}" -o "provider-dev/downloaded/${spec}"
done < provider-dev/config/spec_manifest.txt
```

`provider-dev/config/spec_manifest.txt` lists the GA (`v1`) spec for each built-in group:

```text
api__v1_openapi.json
apis__admissionregistration.k8s.io__v1_openapi.json
apis__apiextensions.k8s.io__v1_openapi.json
apis__apiregistration.k8s.io__v1_openapi.json
apis__apps__v1_openapi.json
apis__authentication.k8s.io__v1_openapi.json
apis__authorization.k8s.io__v1_openapi.json
apis__autoscaling__v2_openapi.json
apis__batch__v1_openapi.json
apis__certificates.k8s.io__v1_openapi.json
apis__coordination.k8s.io__v1_openapi.json
apis__discovery.k8s.io__v1_openapi.json
apis__events.k8s.io__v1_openapi.json
apis__flowcontrol.apiserver.k8s.io__v1_openapi.json
apis__networking.k8s.io__v1_openapi.json
apis__node.k8s.io__v1_openapi.json
apis__policy__v1_openapi.json
apis__rbac.authorization.k8s.io__v1_openapi.json
apis__scheduling.k8s.io__v1_openapi.json
apis__storage.k8s.io__v1_openapi.json
```

Beta and alpha group versions (e.g. `resource.k8s.io` DRA APIs) can be added to the manifest as they reach GA.

## 2. Split into Service Specs (`make split`)

Process the per-group specs into StackQL service specs. Each downloaded spec file maps to exactly one service; the `group` discriminator derives the API group from the spec file name (`api__v1_openapi.json` -> `core`, `apis__<group>__<version>_openapi.json` -> `<group>`) and group names are mapped to service names using the overrides below (suffixes like `.k8s.io` and `.authorization.k8s.io` are stripped for readability):

```bash
npm run split -- \
  --provider-name k8s \
  --input-dir provider-dev/downloaded \
  --svc-discriminator group \
  --output-dir provider-dev/source \
  --overwrite \
  --svc-name-overrides provider-dev/config/service_names.json
```

`--svc-name-overrides` accepts a path to a JSON file or inline JSON. The split emits one self-contained spec per service (`provider-dev/source/<service>.yaml`) with all `$ref`s resolved into the document, preserving the `x-kubernetes-group-version-kind` operation extensions and the `limit`/`continue` list parameters used for mapping and pagination downstream.

`service_names.json`:

```json
{
  "core": "core",
  "apps": "apps",
  "batch": "batch",
  "autoscaling": "autoscaling",
  "policy": "policy",
  "networking.k8s.io": "networking",
  "storage.k8s.io": "storage",
  "rbac.authorization.k8s.io": "rbac",
  "apiextensions.k8s.io": "apiextensions",
  "apiregistration.k8s.io": "apiregistration",
  "admissionregistration.k8s.io": "admissionregistration",
  "certificates.k8s.io": "certificates",
  "coordination.k8s.io": "coordination",
  "discovery.k8s.io": "discovery",
  "events.k8s.io": "events",
  "flowcontrol.apiserver.k8s.io": "flowcontrol",
  "node.k8s.io": "node",
  "scheduling.k8s.io": "scheduling",
  "authentication.k8s.io": "authentication",
  "authorization.k8s.io": "authorization"
}
```

## 3. Generate Mappings (`make mappings`)

Generate the mapping configuration connecting OpenAPI operations to StackQL resources, methods, and SQL verbs:

```bash
npm run generate-mappings -- \
  --provider-name k8s \
  --input-dir provider-dev/source \
  --output-dir provider-dev/config
```

Then populate the `stackql_resource_name`, `stackql_method_name`, `stackql_verb`, and `stackql_object_key` columns:

```bash
node provider-dev/scripts/map_operations.mjs
```

The script maps every operation mechanically from the `x-kubernetes-action` and `x-kubernetes-group-version-kind` extensions in the service specs, applying these conventions:

| Operation pattern | StackQL verb | Resource / method |
|---|---|---|
| `list` (namespaced) | `SELECT` | `<resource>.list` |
| `list` (all namespaces) | `SELECT` | `<resource>_all_namespaces.list` |
| `read` | `SELECT` | `<resource>.get` |
| `create` | `INSERT` | `<resource>.create` |
| `replace` | `REPLACE` | `<resource>.replace` |
| `patch` | `UPDATE` | `<resource>.patch` |
| `delete` | `DELETE` | `<resource>.delete` |
| `deletecollection` | `DELETE` | `<resource>.delete_collection` |
| subresource read/write | verb per operation | `<resource>_status`, `<resource>_scale`, `<resource>_log`, etc |
| group discovery (`/apis/<group>/<version>/`) | `SELECT` | `api_resources.list` |
| zero-param review kinds (`SelfSubjectReview`) | `SELECT` over POST | `<resource>.create` routed to SELECT |
| parameterized review kinds (`SubjectAccessReview`, ...) | `INSERT` + `RETURNING` | `<resource>.create` |
| proxy connect operations | `EXEC` | `<resource>_proxy.connect_<verb>[_path]` |
| watch, exec, attach, port-forward | skipped | streaming operations are out of scope |

Resource names are derived from the resource kind (acronym-aware snake_case, pluralised - `CSIDriver` -> `csi_drivers`) with no version suffixes, since each API group ships a single GA version. List operations set `stackql_object_key` to `$.items` (Kubernetes list responses wrap items in an object); the discovery operations use `$.resources`.

Review kinds are POST-only calls that return data and mutate nothing - authn/authz checks, not object creation. The zero-parameter `SelfSubjectReview` maps to `SELECT` over POST (post-processing binds a static request body); the parameterized reviews (`TokenReview`, `SubjectAccessReview`, `SelfSubjectAccessReview`, `SelfSubjectRulesReview`, `LocalSubjectAccessReview`) stay `INSERT` and surface their verdict via `RETURNING`, because StackQL does not yet route `SELECT` WHERE parameters into request bodies (any-sdk core gap - promote them to `SELECT` once that lands):

```sql
-- who am I
SELECT json_extract(status, '$.userInfo.username') AS username
FROM k8s.authentication.self_subject_reviews;

-- can I delete pods in prod
INSERT INTO k8s.authorization.self_subject_access_reviews(spec)
SELECT '{"resourceAttributes": {"verb": "delete", "resource": "pods", "namespace": "prod"}}'
RETURNING status;
```

`pods_log` returns raw text, which would project as zero columns; post-processing attaches a golang response template that wraps it into a queryable row (column `log`).

The script validates the result - every generator-relevant operation is mapped, method names are unique per resource, and overloaded SQL verbs have unique path-parameter signatures - and fails without writing on any violation. It is deterministic and re-runnable on version bumps; review the CSV diff after re-running. Manual mapping decisions (if any) should be applied as rules in the script, not hand-edits to the CSV.

## 4. Normalize the Service Specs (`make pre-normalize normalize`)

StackQL models providers as relational data sources, and relational databases have no native concept of polymorphism - `oneOf`, `anyOf`, and `allOf` composition in the specs must be lowered to concrete schemas before provider generation. This is done in place on `provider-dev/source`:

```bash
node provider-dev/scripts/pre_normalize.mjs
npm run normalize -- --api-dir provider-dev/source
```

`pre_normalize.mjs` applies Kubernetes-specific adjustments first: `IntOrString` is published as `oneOf: [integer, string]` and the flatten keeps the first member's type, so it is rewritten to `type: string` (a string column holds both `80` and `"80%"`; `format: int-or-string` is retained as a marker).

`npm run normalize` (the `normalize` function in `@stackql/provider-utils`) then:

- renames `oneOf`/`anyOf` to `allOf` and flattens all `allOf` composition into single merged schemas (the k8s specs wrap almost every `$ref` in `allOf` to attach field descriptions - ~15,000 sites)
- converts opaque `type: object` schemas with no defined structure (`RawExtension`, `FieldsV1`, etc) to `type: string`, exposed as JSON-blob columns
- lifts path-item-level `parameters` onto each operation (StackQL's request builder only reads operation-level parameters)
- strips non-root `servers` overrides and wraps bare-array responses (neither occurs in the k8s specs)

The `allOf`/`oneOf`/`anyOf` keys remaining in `apiextensions.yaml` afterwards are `JSONSchemaProps` property definitions (the CRD meta-schema has fields literally named `allOf`/`oneOf`/`anyOf`) - data, not composition. Re-running the mapping script against the normalized specs produces an identical CSV; normalization changes schemas only, never paths, verbs, or operations.

## 5. Generate Provider (`make generate`)

Transform the service specs into a functional StackQL provider using the mappings (`make generate` - the servers, provider config, and service config JSON below are maintained in the [Makefile](Makefile)):

```bash
rm -rf provider-dev/openapi/*
npm run generate-provider -- \
  --provider-name k8s \
  --input-dir provider-dev/source \
  --output-dir provider-dev/openapi/src/k8s \
  --config-path provider-dev/config/all_services.csv \
  --servers '[{"url": "{protocol}://{cluster_addr}", "variables": {"protocol": {"default": "https", "enum": ["https", "http"], "x-stackQL-envVar": "KUBE_PROTOCOL"}, "cluster_addr": {"default": "localhost", "x-stackQL-envVar": "KUBE_HOST"}}}]' \
  --provider-config '{"auth": {"type": "null_auth"}, "snake_case_aliases": true}' \
  --service-config '{"pagination": {"requestToken": {"key": "continue", "location": "query"}, "responseToken": {"key": "$.metadata.continue", "location": "body"}}, "queryParamPushdown": {"top": {"paramName": "limit"}}}' \
  --naive-req-body-translate \
  --overwrite
```

The `enum` on `protocol` is required - the any-sdk query router builds route matchers from the server variable's default plus enum values, so without it every `protocol = 'http'` query fails route resolution.

`x-stackQL-envVar` lets the server variables default from the environment (`KUBE_HOST`, `KUBE_PROTOCOL`), removing them from the `WHERE` clause entirely; an explicit `WHERE` value always wins. See [Server Parameters](#server-parameters).

`snake_case_aliases` presents `SELECT` / `DESCRIBE` columns as snake_case aliases of the camelCase wire properties (`roleRef` -> `role_ref`, `stringData` -> `string_data`) - the same pattern the production `aws` and `azure` providers ship. Most k8s top-level columns (`metadata`, `spec`, `status`, `data`) are unaffected; nested JSON paths inside `json_extract` remain wire-format camelCase.

`--service-config` injects an `x-stackQL-config` block into every service spec, enabling two runtime behaviours uniform across all Kubernetes list APIs:

- **Pagination** - the k8s list contract is a `continue` token: the response carries `metadata.continue` while more results exist, and the client passes it back as the `continue` query parameter. With the token semantics configured, StackQL traverses the full chain transparently - a `SELECT` returns all rows even when the API server caps page sizes. The config lives at the service level (not provider level) deliberately: provider-level pagination token inheritance is currently broken in any-sdk.
- **LIMIT pushdown** - `SELECT ... LIMIT n` is pushed to the wire as the k8s `limit` query parameter, so the API server bounds the result set instead of StackQL fetching everything and discarding. Pushdown is purely an optimisation - StackQL's client-side `LIMIT` remains authoritative, so a partial or absent translation never changes results. Filter pushdown to `fieldSelector` is a future enhancement pending a k8s filter syntax renderer in any-sdk (only OData `$filter` rendering exists today).

`--naive-req-body-translate` selects the naive request body translator: `INSERT` / `UPDATE` / `REPLACE` body columns are the native wire property names (`metadata`, `spec`, `data`), not `data__` prefixed as in the original provider. Snake_case aliases of camelCase wire names are also accepted (`string_data` -> `stringData`) via the `nativeCasing: camel` request binding applied in post-processing.

Then post-process the generated provider:

```bash
node provider-dev/scripts/post_process.mjs
```

This applies fixes the generator cannot make on its own:

- **Response media type**: the upstream specs list response content types alphabetically, so `application/cbor` sorts first and gets stamped as every method's `response.mediaType`. StackQL can only project rows from JSON (or XML) response schemas - with cbor every resource is unselectable. The script rewrites `response.mediaType` to `application/json` on all 543 mapped methods.
- **Patch request binding**: k8s patch operations accept only patch-specific content types with an opaque `Patch` request schema, and any-sdk's default request resolution matches `application/json` only - `UPDATE` would find no request body. The script pins `request.mediaType` to `application/merge-patch+json` (partial-update semantics match the `UPDATE` verb) and overrides the request schema with the operation's response kind schema so body columns map to real fields.
- **JSON request bindings**: the specs declare create/replace/delete request bodies as `*/*`, which any-sdk never matches - the script rewrites them to `application/json` and binds them on each method.
- **`nativeCasing: camel` on every method**: paired with `snake_case_aliases` on the provider config, snake_case `WHERE` parameters (`label_selector`, `field_selector`) resolve against the camelCase wire parameters on every method, including `SELECT` - not just methods with request bodies. The camelCase spellings keep working.
- **Review body bindings and the `pods_log` text transform** (see steps 3 and the mapping notes above).

### Server Parameters

`cluster_addr` and `protocol` are server variables supplied in the `WHERE` clause of each query, consistent with the original provider:

- `protocol` - `https` or `http` (default: `https`)
- `cluster_addr` - the hostname of the Kubernetes API server (default: `localhost`)

Both can be defaulted from environment variables via `x-stackQL-envVar`, removing them from the `WHERE` clause entirely (an explicit `WHERE` value always wins):

```bash
export KUBE_HOST='localhost:8001'    # cluster_addr default - host:port, no scheme
export KUBE_PROTOCOL='http'          # protocol default
```

```sql
SELECT json_extract(metadata, '$.name') AS name
FROM k8s.core.pods
WHERE namespace = 'default';
```

`KUBE_HOST` matches the Terraform `kubernetes` provider variable by name, but takes the hostname and port only (no scheme) - the scheme lives in `KUBE_PROTOCOL`.

`cluster_addr` must currently be a dot-free hostname (`localhost`, or an `/etc/hosts` alias for a remote endpoint) - the any-sdk query router matches the request host against the `{cluster_addr}` server template with gorilla/mux, whose host variables do not span dots, so bare IPs and FQDNs fail route resolution. Core fix pending; the `kubectl proxy` vector below is unaffected.

### Authentication

The provider default is `null_auth`, which supports the `kubectl proxy` workflow with no additional configuration:

```bash
kubectl proxy --port=8001
```

```sql
SELECT json_extract(metadata, '$.name') AS name,
       json_extract(status, '$.phase') AS phase
FROM k8s.core.pods
WHERE protocol = 'http'
AND cluster_addr = 'localhost:8001'
AND namespace = 'default';
```

Columns are the top-level fields of each object (`metadata`, `spec`, `status`, ...); nested fields are addressed with `json_extract`.

For direct cluster access, supply a bearer token via runtime auth config, along with the cluster CA bundle:

```bash
export KUBE_TOKEN='eyJhbGciOiJ...'
AUTH='{ "k8s": { "type": "bearer", "credentialsenvvar": "KUBE_TOKEN" } }'
stackql shell --auth="${AUTH}" --tls.CABundle k8s_cert_bundle.pem
```

Extract the CA bundle from the cluster:

```bash
kubectl get secret -o jsonpath="{.items[?(@.type==\"kubernetes.io/service-account-token\")].data['ca\.crt']}" | base64 -d > k8s_cert_bundle.pem
```

Alternatively add `--tls.allowInsecure=true` (not recommended). For managed clusters (EKS, GKE, AKS), obtain a token from the platform credential helper (`aws eks get-token`, `gke-gcloud-auth-plugin`, `kubelogin`) and pass it via `KUBE_TOKEN`. Native kubeconfig context resolution is a candidate runtime enhancement, not a provider build concern.

## 6. Test Provider (`make test`)

### Validate offline (`make test-offline`)

Sanity-check the provider resolves without any cluster:

```bash
REG_PATH="$(pwd)/provider-dev/openapi"
REG="{\"url\":\"file://${REG_PATH}\",\"localDocRoot\":\"${REG_PATH}\",\"verifyConfig\":{\"nopVerify\":true}}"

stackql --registry="$REG" exec "SHOW SERVICES IN k8s"
stackql --registry="$REG" exec "SHOW RESOURCES IN k8s.apps"
stackql --registry="$REG" exec "SHOW METHODS IN k8s.core.pods"
stackql --registry="$REG" exec "DESCRIBE EXTENDED k8s.apps.deployments"
```

### Meta-route test suite (`make test-meta`)

Starts a StackQL wire server against the local registry and walks every service, resource, and method, asserting that every resource has methods, no two methods on the same SQL verb share a required-params signature, and every selectable resource yields non-empty `DESCRIBE EXTENDED`:

```bash
PROVIDER_REGISTRY_ROOT_DIR="$(pwd)/provider-dev/openapi"
npm run start-server -- --provider k8s --registry $PROVIDER_REGISTRY_ROOT_DIR
npm run test-meta-routes -- k8s --verbose
npm run stop-server
```

### Integration tests (`make test-integration` - mock API server, no cluster required)

Runs the provider against an in-process mock kube-apiserver ([tests/integration/mock_k8s_server.mjs](tests/integration/mock_k8s_server.mjs)) that serves real k8s wire shapes, and asserts row-level results for each operation archetype: list unwrapping via `$.items`, namespaced and cluster-scoped routing, `_all_namespaces` resources, subresources, group discovery via `$.resources`, and the full configmap `INSERT` / `UPDATE` / `REPLACE` / `DELETE` lifecycle:

```bash
npm run test-integration            # add -- --verbose for per-query output
```

Requires a `stackql` binary (`$STACKQL`, `./stackql`, or on `PATH`). These tests caught the response media type, protocol enum, and patch binding issues fixed by `post_process.mjs` - run them after every regeneration.

### UAT - run real queries

Any cluster reachable from `kubectl` works. For a free local cluster:

```bash
kind create cluster --name stackql-test --image kindest/node:v1.36.1
kubectl apply -f tests/fixtures/seed.yaml   # seed UAT objects (namespace stackql-uat)
kubectl proxy --port=8001                   # null_auth vector, leave running
```

Kubernetes v1.35+ requires cgroup v2 on the host - on a cgroup v1 host (e.g. WSL2 with the stock 5.15 kernel, check with `stat -fc %T /sys/fs/cgroup`; `tmpfs` = v1) the v1.36 node image fails to boot kubeadm. Either enable cgroup v2 (`kernelCommandLine = cgroup_no_v1=all` in `.wslconfig`, then `wsl --shutdown`) or use `--image kindest/node:v1.33.1` - the API surface the provider exercises is identical.

Start a shell against the local registry:

```bash
REG_PATH="$(pwd)/provider-dev/openapi"
REG="{\"url\":\"file://${REG_PATH}\",\"localDocRoot\":\"${REG_PATH}\",\"verifyConfig\":{\"nopVerify\":true}}"
stackql --registry="$REG" shell
```

Sample queries (add `protocol = 'http' AND cluster_addr = 'localhost:8001'` to each `WHERE` clause, omitted below for readability). Columns are the top-level object fields (`metadata`, `spec`, `status`, ...); use `json_extract` for nested values:

```sql
-- namespaces
SELECT json_extract(metadata, '$.name') AS name,
       json_extract(status, '$.phase') AS phase
FROM k8s.core.namespaces;

-- pods across all namespaces
SELECT json_extract(metadata, '$.namespace') AS namespace,
       json_extract(metadata, '$.name') AS name,
       json_extract(status, '$.phase') AS phase,
       json_extract(spec, '$.nodeName') AS node
FROM k8s.core.pods_all_namespaces;

-- deployment rollout state (seeded by tests/fixtures/seed.yaml)
SELECT json_extract(metadata, '$.name') AS name,
       json_extract(spec, '$.replicas') AS want,
       json_extract(status, '$.readyReplicas') AS ready
FROM k8s.apps.deployments
WHERE namespace = 'stackql-uat';

-- create a configmap (body columns are native wire property names)
INSERT INTO k8s.core.config_maps(namespace, metadata, data)
SELECT 'stackql-uat', '{"name": "uat-cm"}', '{"greeting": "hello"}';

-- partial update (merge patch)
UPDATE k8s.core.config_maps
SET data = '{"mood": "optimistic"}'
WHERE namespace = 'stackql-uat' AND name = 'uat-cm';

-- scale a deployment (subresource)
UPDATE k8s.apps.deployments_scale
SET spec = '{"replicas": 3}'
WHERE namespace = 'stackql-uat' AND name = 'uat-web';

-- api group discovery
SELECT name, kind, namespaced
FROM k8s.apps.api_resources;

-- LIMIT is pushed down to the API server as the k8s limit parameter
SELECT json_extract(metadata, '$.name') AS name
FROM k8s.core.pods_all_namespaces
LIMIT 5;

-- clean up
DELETE FROM k8s.core.config_maps
WHERE namespace = 'stackql-uat' AND name = 'uat-cm';
```

### Smoke tests

[tests/smoke_test.py](tests/smoke_test.py) (pystackql) runs read smokes plus a full write lifecycle - namespace and configmap `INSERT` / `UPDATE` / `REPLACE` / `DELETE`, a deployment scaled through the `deployments_scale` subresource - in a disposable `stackql-smoke-<stamp>` namespace, sweeping any breadcrumbs from prior runs first:

```bash
kubectl proxy --port=8001                        # default access vector, leave running

make smoke                                       # local registry (creates a pystackql venv on demand)
make smoke-live                                  # --live: published provider in the stackql registry
make smoke-cleanup                               # just sweep breadcrumbs
```

Or invoke the script directly (`pip install pystackql`):

```bash
python tests/smoke_test.py                       # local registry (default)
python tests/smoke_test.py --live                # published provider (alias for --registry public)
python tests/smoke_test.py --cleanup-only        # just sweep breadcrumbs
python tests/smoke_test.py --skip-deployment     # configmap lifecycle only
```

`--live` exercises the provider as consumers get it (`registry pull k8s`); everything else is identical, so it doubles as the post-publish verification. The `make` smoke targets source a gitignored `.env` file if present (`KUBE_HOST`, `KUBE_PROTOCOL`, `KUBE_TOKEN`). Against a kind cluster the suite costs $0.

### Getting a cheap real cluster

For smoke tests beyond kind, from cheapest up - the first two dogfood StackQL's own cloud providers to provision the cluster:

1. **k3s on a GCP `e2-micro` - effectively $0.** One `e2-micro` per account is in GCP's always-free tier (us-west1 / us-central1 / us-east1), and a single-node [k3s](https://k3s.io/) install fits in its 1 GB. Provision with the `google` provider:

   ```sql
   INSERT INTO google.compute.instances(project, zone, data__name, data__machineType, data__disks, data__networkInterfaces, data__metadata)
   SELECT 'my-project', 'us-central1-a', 'stackql-k3s',
     'zones/us-central1-a/machineTypes/e2-micro',
     '[{"boot": true, "initializeParams": {"sourceImage": "projects/debian-cloud/global/images/family/debian-12"}}]',
     '[{"network": "global/networks/default", "accessConfigs": [{"type": "ONE_TO_ONE_NAT"}]}]',
     '{"items": [{"key": "startup-script", "value": "curl -sfL https://get.k3s.io | sh -"}]}';
   ```

   Then pull the kubeconfig and proxy locally (`kubectl proxy` sidesteps the dot-free `cluster_addr` constraint):

   ```bash
   gcloud compute ssh stackql-k3s --zone us-central1-a -- 'sudo cat /etc/rancher/k3s/k3s.yaml' > ~/.kube/k3s-config
   # point the server at localhost via an ssh tunnel, then:
   gcloud compute ssh stackql-k3s --zone us-central1-a -- -L 6443:localhost:6443 -N &
   KUBECONFIG=~/.kube/k3s-config kubectl proxy --port=8001
   ```

2. **k3s on a spot VM - about a cent an hour.** Same pattern via the `aws` provider (`t4g.small` spot, ~$0.005/hr) or `azure` provider (`Standard_B2ats_v2` spot, ~$0.005-0.01/hr), with the k3s one-liner in user data / custom data.

3. **Managed control planes** if you need one: AKS Free tier ($0 control plane) or a GKE zonal cluster (the ~$74/month fee is covered by GKE's free credit for one zonal cluster) - pay only for a small spot node. EKS has no free control plane ($0.10/hr, ~$72/month) and is the most expensive vector - avoid for smoke testing.

### CI

The GitHub Actions workflow ([.github/workflows/build-and-test.yml](.github/workflows/build-and-test.yml)) rebuilds the provider from the pinned release specs on every push and PR (`make build`), fails on any uncommitted generation drift, and runs the offline, integration (mock kube-apiserver), and meta-route layers (`make test`). On pushes it then stands up a kind cluster matching the pinned minor release, seeds `tests/fixtures/seed.yaml`, and runs the smoke suite (`make smoke`) through `kubectl proxy` - the whole chain is credential-free and costs nothing. The docs microsite deploys separately via the web workflows.

## Service Coverage

| Service | API group | Representative resources |
|---|---|---|
| `core` | (core/v1) | pods, services, namespaces, nodes, config_maps, secrets, persistent_volumes, service_accounts, events |
| `apps` | apps | deployments, stateful_sets, daemon_sets, replica_sets, controller_revisions |
| `batch` | batch | jobs, cron_jobs |
| `autoscaling` | autoscaling | horizontal_pod_autoscalers |
| `networking` | networking.k8s.io | ingresses, ingress_classes, network_policies |
| `storage` | storage.k8s.io | storage_classes, volume_attachments, csi_drivers, csi_nodes |
| `rbac` | rbac.authorization.k8s.io | roles, cluster_roles, role_bindings, cluster_role_bindings |
| `policy` | policy | pod_disruption_budgets |
| `apiextensions` | apiextensions.k8s.io | custom_resource_definitions |
| `apiregistration` | apiregistration.k8s.io | api_services |
| `admissionregistration` | admissionregistration.k8s.io | validating_webhook_configurations, mutating_webhook_configurations, validating_admission_policies |
| `certificates` | certificates.k8s.io | certificate_signing_requests |
| `coordination` | coordination.k8s.io | leases |
| `discovery` | discovery.k8s.io | endpoint_slices |
| `events` | events.k8s.io | events |
| `flowcontrol` | flowcontrol.apiserver.k8s.io | flow_schemas, priority_level_configurations |
| `node` | node.k8s.io | runtime_classes |
| `scheduling` | scheduling.k8s.io | priority_classes |
| `authentication` | authentication.k8s.io | token_reviews, self_subject_reviews |
| `authorization` | authorization.k8s.io | subject_access_reviews, self_subject_access_reviews |

## 7. Publish the Provider

To publish, push the `k8s` dir to `providers/src` in a feature branch of the [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry). Follow the [registry release flow](https://github.com/stackql/stackql-provider-registry/blob/dev/docs/build-and-deployment.md).

Pull and verify from the dev registry:

```bash
export DEV_REG="{ \"url\": \"https://registry-dev.stackql.app/providers\" }"
./stackql --registry="${DEV_REG}" shell
```

```sql
registry pull k8s;
```

## 8. Generate Web Docs (`make docs website`)

The doc microsite (`website/`) is Docusaurus 3.10 and follows the shared architecture used by the other provider microsites: all navbar/footer/theme/plugin configuration lives in [`stackql/docusaurus-config`](https://github.com/stackql/docusaurus-config), which is vendored into `.shared-config/` at build time (the `vendor-config` script runs automatically before `start`/`build`). Site-local files are limited to the provider identity (`website/provider.js`), thin wrappers (`docusaurus.config.js`, `sidebars.js`), the shared components/theme under `src/`, and static assets (including `static/CNAME` for the custom domain).

a. Update `headerContent1.txt` and `headerContent2.txt` in `provider-dev/docgen/provider-data/` - these are injected into the docs landing page (installation, connection, and authentication sections)

b. Set the provider identity in `website/provider.js` (already done for this repo):

```js
export const providerName = 'k8s';
export const providerTitle = 'Kubernetes';
```

c. Generate the docs and sanitize them for MDX v3 (Kubernetes field descriptions carry literal `<placeholder>` tokens and JSON braces that MDX parses as JSX):

```bash
npm run generate-docs -- \
  --provider-name k8s \
  --provider-dir ./provider-dev/openapi/src/k8s/v00.00.00000 \
  --output-dir ./website \
  --provider-data-dir ./provider-dev/docgen/provider-data
node website/scripts/sanitize-docs.mjs
```

d. Build and test locally (yarn, Node 20+; the build vendors the shared config, so network access to GitHub is required):

```bash
cd website
yarn install
yarn build
yarn serve
```

To publish, select __GitHub Actions__ as the __Source__ under __Pages -> Build and deployment__ in the repository settings, and create the following DNS record (the served hostname is pinned by `website/static/CNAME`):

| Source Domain | Record Type | Target |
|---|---|---|
| k8s-provider.stackql.io | CNAME | stackql.github.io. |

## License

MIT

## Contributing

Contributions are welcome. Please submit a Pull Request.
