# StackQL k8s (Kubernetes) provider build pipeline.
#
# Every step is deterministic and re-runnable; manual mapping decisions live
# in provider-dev/scripts, never in hand-edited artifacts. `make all` runs
# the full chain: download pinned upstream specs -> split service specs ->
# mappings -> pre-normalize -> normalize -> generate -> post-process ->
# offline + integration + meta-route tests -> docs -> website build.
# `make smoke` needs a reachable cluster (kind is free - the whole suite
# costs $0) and is separate so `all` never needs one.
#
# Requirements: Node >= 20, GNU make, a stackql binary ($STACKQL, ./stackql
# or on PATH), Python 3 (a venv with pystackql is created on demand for the
# smoke suite), yarn for the website, kubectl + a cluster for smoke tests.
# Runs under Linux / WSL / macOS.
#
# Optional .env (never committed - gitignored; smoke targets source it if
# present): KUBE_HOST, KUBE_PROTOCOL (server variable defaults), KUBE_TOKEN
# (bearer token for direct access vectors).

SHELL := bash
.DEFAULT_GOAL := help

PROVIDER := k8s
# Pinned Kubernetes minor release - the upstream spec source branch.
# Bumping this means re-running `make all` and reviewing the mapping diff.
K8S_VERSION ?= 1.36
SPEC_BASE_URL := https://raw.githubusercontent.com/kubernetes/kubernetes/release-$(K8S_VERSION)/api/openapi-spec/v3
SERVICES_DIR := provider-dev/openapi/src/$(PROVIDER)

# cluster_addr/protocol are supplied per query in the WHERE clause, or
# defaulted from KUBE_HOST/KUBE_PROTOCOL via x-stackQL-envVar (explicit
# WHERE values win). The protocol enum is required - the any-sdk query
# router builds route matchers from the default plus enum values.
SERVERS := [{"url": "{protocol}://{cluster_addr}", "variables": {"protocol": {"default": "https", "enum": ["https", "http"], "x-stackQL-envVar": "KUBE_PROTOCOL"}, "cluster_addr": {"default": "localhost", "x-stackQL-envVar": "KUBE_HOST"}}}]
# null_auth supports the kubectl proxy vector with zero configuration;
# snake_case_aliases presents SELECT/DESCRIBE columns as snake_case aliases
# of the camelCase wire properties (aws/azure/clickhouse precedent).
PROVIDER_CONFIG := {"auth": {"type": "null_auth"}, "snake_case_aliases": true}
# Service-level (not provider-level - provider-level pagination token
# inheritance is broken in any-sdk): continue-token pagination + LIMIT
# pushdown to the k8s `limit` query parameter.
SERVICE_CONFIG := {"pagination": {"requestToken": {"key": "continue", "location": "query"}, "responseToken": {"key": "$$.metadata.continue", "location": "body"}}, "queryParamPushdown": {"top": {"paramName": "limit"}}}

VENV := .venv
PY := $(VENV)/bin/python
ENV_FILE := .env

.PHONY: help deps download split mappings pre-normalize normalize generate post-process build \
        test-offline test-integration test-meta test venv smoke smoke-live smoke-cleanup \
        docs website website-start clean all

help: ## show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

deps: ## install node dependencies (latest @stackql/provider-utils + @stackql/pgwire-lite per package.json ranges)
	npm install

# ---------------------------------------------------------------- pipeline

download: ## download the per-group OpenAPI v3 specs from the pinned Kubernetes release branch
	mkdir -p provider-dev/downloaded
	@while read -r spec || [ -n "$$spec" ]; do \
	  [ -z "$$spec" ] && continue; \
	  echo "  $(SPEC_BASE_URL)/$${spec}"; \
	  curl -sfL "$(SPEC_BASE_URL)/$${spec}" -o "provider-dev/downloaded/$${spec}" || exit 1; \
	done < provider-dev/config/spec_manifest.txt
	@count=$$(ls provider-dev/downloaded/*.json | wc -l); \
	expected=$$(grep -c . provider-dev/config/spec_manifest.txt); \
	echo "downloaded $${count} spec(s) for release-$(K8S_VERSION)"; \
	[ "$$count" -eq "$$expected" ] || { echo "expected $${expected} specs from the manifest"; exit 1; }

split: ## split the downloaded specs into per-service StackQL service specs (provider-dev/source)
	npm run split -- \
	  --provider-name $(PROVIDER) \
	  --input-dir provider-dev/downloaded \
	  --svc-discriminator group \
	  --output-dir provider-dev/source \
	  --overwrite \
	  --svc-name-overrides provider-dev/config/service_names.json

mappings: ## regenerate all_services.csv from scratch and apply the deterministic mapping rules
	rm -f provider-dev/config/all_services.csv
	npm run generate-mappings -- \
	  --provider-name $(PROVIDER) \
	  --input-dir provider-dev/source \
	  --output-dir provider-dev/config
	node provider-dev/scripts/map_operations.mjs

pre-normalize: ## k8s-specific spec adjustments (IntOrString -> type: string)
	node provider-dev/scripts/pre_normalize.mjs

normalize: ## generic provider-utils normalize pass (oneOf/anyOf/allOf flatten, opaque objects, param lifting)
	npm run normalize -- --api-dir provider-dev/source

generate: ## generate the provider (null_auth, snake_case aliases, env var server defaults, pagination, LIMIT pushdown)
	rm -rf provider-dev/openapi/*
	npm run generate-provider -- \
	  --provider-name $(PROVIDER) \
	  --input-dir provider-dev/source \
	  --output-dir $(SERVICES_DIR) \
	  --config-path provider-dev/config/all_services.csv \
	  --servers '$(SERVERS)' \
	  --provider-config '$(PROVIDER_CONFIG)' \
	  --service-config '$(SERVICE_CONFIG)' \
	  --naive-req-body-translate \
	  --overwrite
	$(MAKE) post-process

post-process: ## re-apply generated-provider fixes (response media types, patch/json request bindings, log transform)
	node provider-dev/scripts/post_process.mjs

build: download split mappings pre-normalize normalize generate ## full spec -> provider pipeline

# ------------------------------------------------------------------- tests

test-offline: ## quick offline validation against the local file registry (SHOW / DESCRIBE)
	@REG_PATH="$$(pwd)/provider-dev/openapi"; \
	REG="{\"url\":\"file://$${REG_PATH}\",\"localDocRoot\":\"$${REG_PATH}\",\"verifyConfig\":{\"nopVerify\":true}}"; \
	STACKQL_BIN="$${STACKQL:-$$(command -v stackql || echo ./stackql)}"; \
	set -e; \
	"$$STACKQL_BIN" --registry="$$REG" exec "SHOW SERVICES IN $(PROVIDER)" | grep -q core; \
	"$$STACKQL_BIN" --registry="$$REG" exec "SHOW RESOURCES IN $(PROVIDER).apps" | grep -q deployments; \
	"$$STACKQL_BIN" --registry="$$REG" exec "SHOW METHODS IN $(PROVIDER).core.pods" | grep -q get; \
	"$$STACKQL_BIN" --registry="$$REG" exec "DESCRIBE EXTENDED $(PROVIDER).apps.deployments" | grep -q metadata; \
	echo "offline validation passed"

test-integration: ## row-level integration tests against the mock kube-apiserver (no cluster required)
	npm run test-integration

test-meta: ## meta-route suite against a local stackql server (walks every service/resource/method)
	npm run start-server -- --provider $(PROVIDER) --registry "$$(pwd)/provider-dev/openapi"
	npm run test-meta-routes -- $(PROVIDER) || (npm run stop-server; exit 1)
	npm run stop-server

test: test-offline test-integration test-meta ## all non-cluster test layers

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install --quiet --upgrade pip pystackql

venv: $(VENV)/bin/activate ## create the python venv with pystackql for the smoke suite

# smoke targets source .env when present so a developer checkout works
# without exporting anything; CI sets variables from secrets.
with_env = set -a; [ -f $(ENV_FILE) ] && source <(tr -d '\r' < $(ENV_FILE)); set +a;

smoke: venv ## live smoke suite with the locally generated provider - reads + full write lifecycle (needs a cluster + kubectl proxy on :8001)
	@$(with_env) $(PY) tests/smoke_test.py

smoke-live: venv ## live smoke suite against the published provider in the public registry (post-publish verification)
	@$(with_env) $(PY) tests/smoke_test.py --live

smoke-cleanup: venv ## sweep stackql-smoke-* namespaces and exit
	@$(with_env) $(PY) tests/smoke_test.py --cleanup-only

# -------------------------------------------------------------------- docs

docs: ## generate the website docs (snake_case surface), then sanitize for MDX v3
	npm run generate-docs -- \
	  --provider-name $(PROVIDER) \
	  --provider-dir ./$(SERVICES_DIR)/v00.00.00000 \
	  --output-dir ./website \
	  --provider-data-dir ./provider-dev/docgen/provider-data \
	  --snake-case-aliases
	node website/scripts/sanitize-docs.mjs

website: ## build the docusaurus microsite (vendors shared config first)
	cd website && yarn install && yarn build

website-start: ## run the docusaurus dev server
	cd website && yarn install && yarn start

clean: ## remove regenerable artifacts (provider output, website build)
	rm -rf provider-dev/openapi/* website/build website/.docusaurus

all: deps build test docs website ## everything that needs no cluster: deps, pipeline, tests, docs, site build
