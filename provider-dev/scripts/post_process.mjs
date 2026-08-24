#!/usr/bin/env node

// Post-processing over the generated provider (run after generate-provider).
//
// 1. Response media type: the upstream k8s specs list response content
//    types alphabetically, so `application/cbor` comes first and the
//    generator stamps it as every method's response.mediaType. stackql can
//    only project rows from JSON (or XML) response schemas - with a cbor
//    media type every resource is unselectable and route resolution fails.
//    Rewrite response.mediaType to application/json wherever the operation
//    actually serves it (all k8s operations do).
//
// 2. Patch requests: k8s patch operations accept only patch-specific
//    content types (merge-patch, strategic-merge-patch, json-patch, apply)
//    with an opaque `Patch` request schema. any-sdk's default request
//    resolution only matches application/json, so UPDATE would find no
//    request body at all. Pin request.mediaType to
//    application/merge-patch+json (partial-update semantics match the
//    UPDATE verb) and override the request schema with the operation's
//    response kind schema so data__ columns map to real fields.
//
// Deterministic and re-runnable; run it every time the provider is
// regenerated.
//
// Usage: node provider-dev/scripts/post_process.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const servicesDir = path.join(repoRoot, 'provider-dev', 'openapi', 'src', 'k8s', 'v00.00.00000', 'services');

const MERGE_PATCH = 'application/merge-patch+json';

function decodeOperationRef(ref) {
  // '#/paths/~1api~1v1~1namespaces~1{name}/get' -> [path, verb]
  const parts = ref.replace(/^#\/paths\//, '').split('/');
  const verb = parts.pop();
  const pathKey = parts.join('/').replace(/~1/g, '/').replace(/~0/g, '~');
  return [pathKey, verb];
}

let totals = { responseMedia: 0, patchRequests: 0, jsonRequests: 0, reviewBodies: 0, logTransforms: 0, casedMethods: 0, files: 0 };

for (const filename of fs.readdirSync(servicesDir).filter((f) => f.endsWith('.yaml')).sort()) {
  const filePath = path.join(servicesDir, filename);
  const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
  const resources = doc.components?.['x-stackQL-resources'];
  if (!resources) continue;

  let touched = false;
  for (const resource of Object.values(resources)) {
    for (const method of Object.values(resource.methods || {})) {
      const ref = method.operation?.$ref;
      if (!ref) continue;
      const [pathKey, verb] = decodeOperationRef(ref);
      const op = doc.paths?.[pathKey]?.[verb];
      if (!op) continue;

      // 1. prefer application/json for the response
      const docKey = method.response?.openAPIDocKey;
      const respContent = docKey ? op.responses?.[docKey]?.content : null;
      if (method.response && respContent?.['application/json'] && method.response.mediaType !== 'application/json') {
        method.response.mediaType = 'application/json';
        totals.responseMedia++;
        touched = true;
      }

      // 2. pin patch request media + schema. The spec types patch bodies as
      // the opaque `Patch` schema (no properties), which gives the naive
      // body translator nothing to match - repoint the merge-patch content
      // schema at the operation's kind schema. (A method-level
      // schema_override does not work here: any-sdk's loader resolves the
      // explicit mediaType content AFTER the override and clobbers it.)
      if (verb === 'patch' && op.requestBody?.content?.[MERGE_PATCH] && !method.request) {
        const kindRef = respContent?.['application/json']?.schema?.$ref;
        if (kindRef) {
          op.requestBody.content[MERGE_PATCH].schema = { $ref: kindRef };
        }
        method.request = { mediaType: MERGE_PATCH, nativeCasing: 'camel' };
        totals.patchRequests++;
        touched = true;
      }

      // 3. bind json request bodies on create/replace/delete methods. The
      // k8s specs declare these request bodies as '*/*' (accept anything),
      // which any-sdk's request resolution never matches, and a method
      // without a `request` component sends an empty body - so INSERT and
      // REPLACE silently posted nothing. Rewrite the op's request content
      // key to application/json and bind it on the method.
      if (verb !== 'patch' && op.requestBody?.content) {
        const content = op.requestBody.content;
        if (content['*/*'] && !content['application/json']) {
          content['application/json'] = content['*/*'];
          delete content['*/*'];
          touched = true;
        }
        if (content['application/json'] && !method.request) {
          // nativeCasing lets the naive body translator accept snake_case
          // column aliases for camelCase wire properties (string_data -> stringData)
          method.request = { mediaType: 'application/json', nativeCasing: 'camel' };
          totals.jsonRequests++;
          touched = true;
        }
      }

      // 3b. nativeCasing: camel on EVERY method (not just body methods).
      // With snake_case_aliases presenting snake columns, WHERE parameters
      // must accept the snake spelling too (label_selector as well as
      // labelSelector) - any-sdk's reverse-casing param resolution is
      // gated on request.nativeCasing, and a request component without a
      // mediaType is inert for body handling (clickhouse precedent, all
      // methods, verified live).
      if (!method.request?.nativeCasing) {
        method.request = { ...(method.request || {}), nativeCasing: 'camel' };
        totals.casedMethods++;
        touched = true;
      }

      // 4. review kinds (SELECT-over-POST): non-mutating authz/authn checks
      // mapped to SELECT. `base` merges under any WHERE-supplied body
      // members (spec, ...); `default` is the whole body when the SELECT
      // supplies none (SelfSubjectReview needs nothing but an empty object)
      if (verb === 'post' && method.request &&
          /Review$/.test(op['x-kubernetes-group-version-kind']?.kind || '') &&
          !method.request.base) {
        method.request.base = '{}';
        method.request.default = '{}';
        totals.reviewBodies++;
        touched = true;
      }
    }
  }

  // 5. pods_log: the response is raw log text (schema `type: string`),
  // which projects as zero columns. Wrap it via a golang text template
  // into a single row with a `log` column, with a synthesized wrapper
  // schema so DESCRIBE and the row projector see a real shape. (One row
  // per line would be nicer, but the template funcmap has no line-split
  // function - getRegexpAllMatches returns first-match capture groups,
  // not all matches. Deterministic rewrite: safe to re-run.)
  const podsLog = resources.pods_log?.methods?.get;
  if (podsLog) {
    doc.components.schemas.PodLogTransformed = {
      type: 'object',
      properties: {
        log_output: {
          type: 'array',
          items: { type: 'object', properties: { log: { type: 'string' } } }
        }
      }
    };
    podsLog.response = {
      mediaType: podsLog.response?.mediaType || 'application/json',
      openAPIDocKey: podsLog.response?.openAPIDocKey || '200',
      overrideMediaType: 'application/json',
      schema_override: { $ref: '#/components/schemas/PodLogTransformed' },
      objectKey: '$.log_output',
      transform: {
        type: 'golang_template_text_v0.3.0',
        body: '{"log_output": [{"log": {{ toJson . }}}]}'
      }
    };
    totals.logTransforms++;
    touched = true;
  }

  if (touched) {
    fs.writeFileSync(filePath, yaml.dump(doc, { lineWidth: -1, noRefs: true }), 'utf8');
    totals.files++;
    console.log(`${filename}: post-processed`);
  }
}

console.log(`Done. ${totals.files} file(s): ${totals.responseMedia} response media type(s) -> application/json, ${totals.patchRequests} patch request binding(s) -> ${MERGE_PATCH}, ${totals.jsonRequests} json request binding(s), ${totals.reviewBodies} review body binding(s), ${totals.logTransforms} log transform(s), ${totals.casedMethods} additional method(s) stamped nativeCasing: camel`);
