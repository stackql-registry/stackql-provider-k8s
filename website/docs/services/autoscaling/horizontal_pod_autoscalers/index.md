--- 
title: horizontal_pod_autoscalers
hide_title: false
hide_table_of_contents: false
keywords:
  - horizontal_pod_autoscalers
  - autoscaling
  - k8s
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage k8s resources using SQL
custom_edit_url: null
image: /img/stackql-k8s-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Creates, updates, deletes, gets or lists a <code>horizontal_pod_autoscalers</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="horizontal_pod_autoscalers" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="k8s.autoscaling.horizontal_pod_autoscalers" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="apiVersion" /></td>
    <td><code>string</code></td>
    <td>APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources</td>
</tr>
<tr>
    <td><CopyableCode code="kind" /></td>
    <td><code>string</code></td>
    <td>Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds</td>
</tr>
<tr>
    <td><CopyableCode code="metadata" /></td>
    <td><code>object</code></td>
    <td>metadata is the standard object metadata. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata</td>
</tr>
<tr>
    <td><CopyableCode code="spec" /></td>
    <td><code>object</code></td>
    <td>spec is the specification for the behaviour of the autoscaler. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status.</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>object</code></td>
    <td>status is the current information about the autoscaler.</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="list">

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="apiVersion" /></td>
    <td><code>string</code></td>
    <td>APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources</td>
</tr>
<tr>
    <td><CopyableCode code="kind" /></td>
    <td><code>string</code></td>
    <td>Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds</td>
</tr>
<tr>
    <td><CopyableCode code="metadata" /></td>
    <td><code>object</code></td>
    <td>metadata is the standard object metadata. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata</td>
</tr>
<tr>
    <td><CopyableCode code="spec" /></td>
    <td><code>object</code></td>
    <td>spec is the specification for the behaviour of the autoscaler. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status.</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>object</code></td>
    <td>status is the current information about the autoscaler.</td>
</tr>
</tbody>
</table>
</TabItem>
</Tabs>

## Methods

The following methods are available for this resource:

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Accessible by</th>
    <th>Required Params</th>
    <th>Optional Params</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>read the specified HorizontalPodAutoscaler</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-allowWatchBookmarks"><code>allowWatchBookmarks</code></a>, <a href="#parameter-continue"><code>continue</code></a>, <a href="#parameter-fieldSelector"><code>fieldSelector</code></a>, <a href="#parameter-labelSelector"><code>labelSelector</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-resourceVersion"><code>resourceVersion</code></a>, <a href="#parameter-resourceVersionMatch"><code>resourceVersionMatch</code></a>, <a href="#parameter-sendInitialEvents"><code>sendInitialEvents</code></a>, <a href="#parameter-shardSelector"><code>shardSelector</code></a>, <a href="#parameter-timeoutSeconds"><code>timeoutSeconds</code></a>, <a href="#parameter-watch"><code>watch</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>list or watch objects of kind HorizontalPodAutoscaler</td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a>, <a href="#parameter-spec"><code>spec</code></a></td>
    <td><a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-fieldManager"><code>fieldManager</code></a>, <a href="#parameter-fieldValidation"><code>fieldValidation</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>create a HorizontalPodAutoscaler</td>
</tr>
<tr>
    <td><a href="#patch"><CopyableCode code="patch" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-fieldManager"><code>fieldManager</code></a>, <a href="#parameter-fieldValidation"><code>fieldValidation</code></a>, <a href="#parameter-force"><code>force</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>partially update the specified HorizontalPodAutoscaler</td>
</tr>
<tr>
    <td><a href="#replace"><CopyableCode code="replace" /></a></td>
    <td><CopyableCode code="replace" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a>, <a href="#parameter-spec"><code>spec</code></a></td>
    <td><a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-fieldManager"><code>fieldManager</code></a>, <a href="#parameter-fieldValidation"><code>fieldValidation</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>replace the specified HorizontalPodAutoscaler</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-gracePeriodSeconds"><code>gracePeriodSeconds</code></a>, <a href="#parameter-ignoreStoreReadErrorWithClusterBreakingPotential"><code>ignoreStoreReadErrorWithClusterBreakingPotential</code></a>, <a href="#parameter-orphanDependents"><code>orphanDependents</code></a>, <a href="#parameter-propagationPolicy"><code>propagationPolicy</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>delete a HorizontalPodAutoscaler</td>
</tr>
<tr>
    <td><a href="#delete_collection"><CopyableCode code="delete_collection" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-continue"><code>continue</code></a>, <a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-fieldSelector"><code>fieldSelector</code></a>, <a href="#parameter-gracePeriodSeconds"><code>gracePeriodSeconds</code></a>, <a href="#parameter-ignoreStoreReadErrorWithClusterBreakingPotential"><code>ignoreStoreReadErrorWithClusterBreakingPotential</code></a>, <a href="#parameter-labelSelector"><code>labelSelector</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-orphanDependents"><code>orphanDependents</code></a>, <a href="#parameter-propagationPolicy"><code>propagationPolicy</code></a>, <a href="#parameter-resourceVersion"><code>resourceVersion</code></a>, <a href="#parameter-resourceVersionMatch"><code>resourceVersionMatch</code></a>, <a href="#parameter-sendInitialEvents"><code>sendInitialEvents</code></a>, <a href="#parameter-shardSelector"><code>shardSelector</code></a>, <a href="#parameter-timeoutSeconds"><code>timeoutSeconds</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>delete collection of HorizontalPodAutoscaler</td>
</tr>
</tbody>
</table>

## Parameters

Parameters can be passed in the `WHERE` clause of a query. Check the [Methods](#methods) section to see which parameters are required or optional for each operation.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr id="parameter-cluster_addr">
    <td><CopyableCode code="cluster_addr" /></td>
    <td><code>string</code></td>
    <td>(default: localhost)</td>
</tr>
<tr id="parameter-name">
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td>name of the HorizontalPodAutoscaler</td>
</tr>
<tr id="parameter-namespace">
    <td><CopyableCode code="namespace" /></td>
    <td><code>string</code></td>
    <td>object name and auth scope, such as for teams and projects</td>
</tr>
<tr id="parameter-protocol">
    <td><CopyableCode code="protocol" /></td>
    <td><code>string</code></td>
    <td>(default: https, enum: &#91;https, http&#93;)</td>
</tr>
<tr id="parameter-allowWatchBookmarks">
    <td><CopyableCode code="allowWatchBookmarks" /></td>
    <td><code>boolean</code></td>
    <td>allowWatchBookmarks requests watch events with type "BOOKMARK". Servers that do not implement bookmarks may ignore this flag and bookmarks are sent at the server's discretion. Clients should not assume bookmarks are returned at any specific interval, nor may they assume the server will send any BOOKMARK event during a session. If this is not a watch, this field is ignored.</td>
</tr>
<tr id="parameter-continue">
    <td><CopyableCode code="continue" /></td>
    <td><code>string</code></td>
    <td>The continue option should be set when retrieving more results from the server. Since this value is server defined, clients may only use the continue value from a previous query result with identical query parameters (except for the value of continue) and the server may reject a continue value it does not recognize. If the specified continue value is no longer valid whether due to expiration (generally five to fifteen minutes) or a configuration change on the server, the server will respond with a 410 ResourceExpired error together with a continue token. If the client needs a consistent list, it must restart their list without the continue field. Otherwise, the client may send another list request with the token received with the 410 error, the server will respond with a list starting from the next key, but from the latest snapshot, which is inconsistent from the previous list results - objects that are created, modified, or deleted after the first list request will be included in the response, as long as their keys are after the "next key".  This field is not supported when watch is true. Clients may start a watch from the last resourceVersion value returned by the server and not miss any modifications.</td>
</tr>
<tr id="parameter-dryRun">
    <td><CopyableCode code="dryRun" /></td>
    <td><code>string</code></td>
    <td>When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed</td>
</tr>
<tr id="parameter-fieldManager">
    <td><CopyableCode code="fieldManager" /></td>
    <td><code>string</code></td>
    <td>fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https:​//golang.org/pkg/unicode/#IsPrint.</td>
</tr>
<tr id="parameter-fieldSelector">
    <td><CopyableCode code="fieldSelector" /></td>
    <td><code>string</code></td>
    <td>A selector to restrict the list of returned objects by their fields. Defaults to everything.</td>
</tr>
<tr id="parameter-fieldValidation">
    <td><CopyableCode code="fieldValidation" /></td>
    <td><code>string</code></td>
    <td>fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.</td>
</tr>
<tr id="parameter-force">
    <td><CopyableCode code="force" /></td>
    <td><code>boolean</code></td>
    <td>Force is going to "force" Apply requests. It means user will re-acquire conflicting fields owned by other people. Force flag must be unset for non-apply patch requests.</td>
</tr>
<tr id="parameter-gracePeriodSeconds">
    <td><CopyableCode code="gracePeriodSeconds" /></td>
    <td><code>integer</code></td>
    <td>The duration in seconds before the object should be deleted. Value must be non-negative integer. The value zero indicates delete immediately. If this value is nil, the default grace period for the specified type will be used. Defaults to a per object value if not specified. zero means delete immediately.</td>
</tr>
<tr id="parameter-ignoreStoreReadErrorWithClusterBreakingPotential">
    <td><CopyableCode code="ignoreStoreReadErrorWithClusterBreakingPotential" /></td>
    <td><code>boolean</code></td>
    <td>if set to true, it will trigger an unsafe deletion of the resource in case the normal deletion flow fails with a corrupt object error. A resource is considered corrupt if it can not be retrieved from the underlying storage successfully because of a) its data can not be transformed e.g. decryption failure, or b) it fails to decode into an object. NOTE: unsafe deletion ignores finalizer constraints, skips precondition checks, and removes the object from the storage. WARNING: This may potentially break the cluster if the workload associated with the resource being unsafe-deleted relies on normal deletion flow. Use only if you REALLY know what you are doing. The default value is false, and the user must opt in to enable it</td>
</tr>
<tr id="parameter-labelSelector">
    <td><CopyableCode code="labelSelector" /></td>
    <td><code>string</code></td>
    <td>A selector to restrict the list of returned objects by their labels. Defaults to everything.</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>limit is a maximum number of responses to return for a list call. If more items exist, the server will set the `continue` field on the list metadata to a value that can be used with the same initial query to retrieve the next set of results. Setting a limit may return fewer than the requested amount of items (up to zero items) in the event all requested objects are filtered out and clients should only use the presence of the continue field to determine whether more results are available. Servers may choose not to support the limit argument and will return all of the available results. If limit is specified and the continue field is empty, clients may assume that no more results are available. This field is not supported if watch is true.  The server guarantees that the objects returned when using continue will be identical to issuing a single list call without a limit - that is, no objects created, modified, or deleted after the first request is issued will be included in any subsequent continued requests. This is sometimes referred to as a consistent snapshot, and ensures that a client that is using limit to receive smaller chunks of a very large result can ensure they see all possible objects. If objects are updated during a chunked list the version of the object that was present at the time the first list result was calculated is returned.</td>
</tr>
<tr id="parameter-orphanDependents">
    <td><CopyableCode code="orphanDependents" /></td>
    <td><code>boolean</code></td>
    <td>Deprecated: please use the PropagationPolicy, this field will be deprecated in 1.7. Should the dependent objects be orphaned. If true/false, the "orphan" finalizer will be added to/removed from the object's finalizers list. Either this field or PropagationPolicy may be set, but not both.</td>
</tr>
<tr id="parameter-pretty">
    <td><CopyableCode code="pretty" /></td>
    <td><code>string</code></td>
    <td>If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).</td>
</tr>
<tr id="parameter-propagationPolicy">
    <td><CopyableCode code="propagationPolicy" /></td>
    <td><code>string</code></td>
    <td>Whether and how garbage collection will be performed. Either this field or OrphanDependents may be set, but not both. The default policy is decided by the existing finalizer set in the metadata.finalizers and the resource-specific default policy. Acceptable values are: 'Orphan' - orphan the dependents; 'Background' - allow the garbage collector to delete the dependents in the background; 'Foreground' - a cascading policy that deletes all dependents in the foreground.</td>
</tr>
<tr id="parameter-resourceVersion">
    <td><CopyableCode code="resourceVersion" /></td>
    <td><code>string</code></td>
    <td>resourceVersion sets a constraint on what resource versions a request may be served from. See https:​//kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions for details.  Defaults to unset</td>
</tr>
<tr id="parameter-resourceVersionMatch">
    <td><CopyableCode code="resourceVersionMatch" /></td>
    <td><code>string</code></td>
    <td>resourceVersionMatch determines how resourceVersion is applied to list calls. It is highly recommended that resourceVersionMatch be set for list calls where resourceVersion is set See https:​//kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions for details.  Defaults to unset</td>
</tr>
<tr id="parameter-sendInitialEvents">
    <td><CopyableCode code="sendInitialEvents" /></td>
    <td><code>boolean</code></td>
    <td>`sendInitialEvents=true` may be set together with `watch=true`. In that case, the watch stream will begin with synthetic events to produce the current state of objects in the collection. Once all such events have been sent, a synthetic "Bookmark" event  will be sent. The bookmark will report the ResourceVersion (RV) corresponding to the set of objects, and be marked with `"k8s.io/initial-events-end": "true"` annotation. Afterwards, the watch stream will proceed as usual, sending watch events corresponding to changes (subsequent to the RV) to objects watched.  When `sendInitialEvents` option is set, we require `resourceVersionMatch` option to also be set. The semantic of the watch request is as following: - `resourceVersionMatch` = NotOlderThan   is interpreted as "data at least as new as the provided `resourceVersion`"   and the bookmark event is send when the state is synced   to a `resourceVersion` at least as fresh as the one provided by the ListOptions.   If `resourceVersion` is unset, this is interpreted as "consistent read" and the   bookmark event is send when the state is synced at least to the moment   when request started being processed. - `resourceVersionMatch` set to any other value or unset   Invalid error is returned.  Defaults to true if `resourceVersion=""` or `resourceVersion="0"` (for backward compatibility reasons) and to false otherwise.</td>
</tr>
<tr id="parameter-shardSelector">
    <td><CopyableCode code="shardSelector" /></td>
    <td><code>string</code></td>
    <td>shardSelector restricts the list of returned objects using a CEL-based shard selector expression. The format uses the shardRange() function combined with || (logical OR) to specify one or more hash ranges:    shardRange(object.metadata.uid, '0x0', '0x8000000000000000')   shardRange(object.metadata.uid, '0x0', '0x8000000000000000') || shardRange(object.metadata.uid, '0x8000000000000000', '0x10000000000000000')  Field paths use CEL-style object-rooted syntax (e.g. "object.metadata.uid"), NOT the fieldSelector format ("metadata.uid"). Currently supported paths:   - object.metadata.uid   - object.metadata.namespace  hexStart and hexEnd are single-quoted CEL string literals with a '0x' prefix, defining the inclusive lower and exclusive upper bounds over the 64-bit FNV-1a hash space. The full range is &#91;0x0, 0x10000000000000000), where the exclusive upper bound equals 2^64.  Examples:   2-shard split:     shard 0: shardRange(object.metadata.uid, '0x0000000000000000', '0x8000000000000000')     shard 1: shardRange(object.metadata.uid, '0x8000000000000000', '0x10000000000000000')   4-shard split:     shard 0: shardRange(object.metadata.uid, '0x0000000000000000', '0x4000000000000000')     shard 1: shardRange(object.metadata.uid, '0x4000000000000000', '0x8000000000000000')     shard 2: shardRange(object.metadata.uid, '0x8000000000000000', '0xc000000000000000')     shard 3: shardRange(object.metadata.uid, '0xc000000000000000', '0x10000000000000000')  This is an alpha field and requires enabling the ShardedListAndWatch feature gate.</td>
</tr>
<tr id="parameter-timeoutSeconds">
    <td><CopyableCode code="timeoutSeconds" /></td>
    <td><code>integer</code></td>
    <td>Timeout for the list/watch call. This limits the duration of the call, regardless of any activity or inactivity.</td>
</tr>
<tr id="parameter-watch">
    <td><CopyableCode code="watch" /></td>
    <td><code>boolean</code></td>
    <td>Watch for changes to the described resources and return them as a stream of add, update, and remove notifications. Specify resourceVersion.</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

read the specified HorizontalPodAutoscaler

```sql
SELECT
apiVersion,
kind,
metadata,
spec,
status
FROM k8s.autoscaling.horizontal_pod_autoscalers
WHERE name = '{{ name }}' -- required
AND namespace = '{{ namespace }}' -- required
AND protocol = '{{ protocol }}' -- required
AND cluster_addr = '{{ cluster_addr }}' -- required
AND pretty = '{{ pretty }}'
;
```
</TabItem>
<TabItem value="list">

list or watch objects of kind HorizontalPodAutoscaler

```sql
SELECT
apiVersion,
kind,
metadata,
spec,
status
FROM k8s.autoscaling.horizontal_pod_autoscalers
WHERE namespace = '{{ namespace }}' -- required
AND protocol = '{{ protocol }}' -- required
AND cluster_addr = '{{ cluster_addr }}' -- required
AND allowWatchBookmarks = '{{ allowWatchBookmarks }}'
AND continue = '{{ continue }}'
AND fieldSelector = '{{ fieldSelector }}'
AND labelSelector = '{{ labelSelector }}'
AND limit = '{{ limit }}'
AND resourceVersion = '{{ resourceVersion }}'
AND resourceVersionMatch = '{{ resourceVersionMatch }}'
AND sendInitialEvents = '{{ sendInitialEvents }}'
AND shardSelector = '{{ shardSelector }}'
AND timeoutSeconds = '{{ timeoutSeconds }}'
AND watch = '{{ watch }}'
AND pretty = '{{ pretty }}'
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

create a HorizontalPodAutoscaler

```sql
INSERT INTO k8s.autoscaling.horizontal_pod_autoscalers (
apiVersion,
kind,
metadata,
spec,
status,
namespace,
protocol,
cluster_addr,
dryRun,
fieldManager,
fieldValidation,
pretty
)
SELECT 
'{{ apiVersion }}',
'{{ kind }}',
'{{ metadata }}',
'{{ spec }}' /* required */,
'{{ status }}',
'{{ namespace }}',
'{{ protocol }}',
'{{ cluster_addr }}',
'{{ dryRun }}',
'{{ fieldManager }}',
'{{ fieldValidation }}',
'{{ pretty }}'
RETURNING
apiVersion,
kind,
metadata,
spec,
status
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: horizontal_pod_autoscalers
  props:
    - name: namespace
      value: "{{ namespace }}"
      description: Required parameter for the horizontal_pod_autoscalers resource.
    - name: protocol
      value: "{{ protocol }}"
      description: Required parameter for the horizontal_pod_autoscalers resource.
    - name: cluster_addr
      value: "{{ cluster_addr }}"
      description: Required parameter for the horizontal_pod_autoscalers resource.
    - name: apiVersion
      value: "{{ apiVersion }}"
      description: |
        APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
    - name: kind
      value: "{{ kind }}"
      description: |
        Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
    - name: metadata
      description: |
        metadata is the standard object metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
      value:
        annotations: "{{ annotations }}"
        creationTimestamp: "{{ creationTimestamp }}"
        deletionGracePeriodSeconds: {{ deletionGracePeriodSeconds }}
        deletionTimestamp: "{{ deletionTimestamp }}"
        finalizers:
          - "{{ finalizers }}"
        generateName: "{{ generateName }}"
        generation: {{ generation }}
        labels: "{{ labels }}"
        managedFields:
          - apiVersion: "{{ apiVersion }}"
            fieldsType: "{{ fieldsType }}"
            fieldsV1: "{{ fieldsV1 }}"
            manager: "{{ manager }}"
            operation: "{{ operation }}"
            subresource: "{{ subresource }}"
            time: "{{ time }}"
        name: "{{ name }}"
        namespace: "{{ namespace }}"
        ownerReferences:
          - apiVersion: "{{ apiVersion }}"
            blockOwnerDeletion: {{ blockOwnerDeletion }}
            controller: {{ controller }}
            kind: "{{ kind }}"
            name: "{{ name }}"
            uid: "{{ uid }}"
        resourceVersion: "{{ resourceVersion }}"
        selfLink: "{{ selfLink }}"
        uid: "{{ uid }}"
      default: [object Object]
    - name: spec
      description: |
        spec is the specification for the behaviour of the autoscaler. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status.
      value:
        behavior:
          scaleDown:
            policies:
              - periodSeconds: {{ periodSeconds }}
                type: "{{ type }}"
                value: {{ value }}
            selectPolicy: "{{ selectPolicy }}"
            stabilizationWindowSeconds: {{ stabilizationWindowSeconds }}
            tolerance: "{{ tolerance }}"
          scaleUp:
            policies:
              - periodSeconds: {{ periodSeconds }}
                type: "{{ type }}"
                value: {{ value }}
            selectPolicy: "{{ selectPolicy }}"
            stabilizationWindowSeconds: {{ stabilizationWindowSeconds }}
            tolerance: "{{ tolerance }}"
        maxReplicas: {{ maxReplicas }}
        metrics:
          - containerResource:
              container: "{{ container }}"
              name: "{{ name }}"
              target:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                type: "{{ type }}"
                value: "{{ value }}"
            external:
              metric:
                name: "{{ name }}"
                selector:
                  matchExpressions: "{{ matchExpressions }}"
                  matchLabels: "{{ matchLabels }}"
              target:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                type: "{{ type }}"
                value: "{{ value }}"
            object:
              describedObject:
                apiVersion: "{{ apiVersion }}"
                kind: "{{ kind }}"
                name: "{{ name }}"
              metric:
                name: "{{ name }}"
                selector:
                  matchExpressions: "{{ matchExpressions }}"
                  matchLabels: "{{ matchLabels }}"
              target:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                type: "{{ type }}"
                value: "{{ value }}"
            pods:
              metric:
                name: "{{ name }}"
                selector:
                  matchExpressions: "{{ matchExpressions }}"
                  matchLabels: "{{ matchLabels }}"
              target:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                type: "{{ type }}"
                value: "{{ value }}"
            resource:
              name: "{{ name }}"
              target:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                type: "{{ type }}"
                value: "{{ value }}"
            type: "{{ type }}"
        minReplicas: {{ minReplicas }}
        scaleTargetRef:
          apiVersion: "{{ apiVersion }}"
          kind: "{{ kind }}"
          name: "{{ name }}"
      default: [object Object]
    - name: status
      description: |
        status is the current information about the autoscaler.
      value:
        conditions:
          - lastTransitionTime: "{{ lastTransitionTime }}"
            message: "{{ message }}"
            reason: "{{ reason }}"
            status: "{{ status }}"
            type: "{{ type }}"
        currentMetrics:
          - containerResource:
              container: "{{ container }}"
              current:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                value: "{{ value }}"
              name: "{{ name }}"
            external:
              current:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                value: "{{ value }}"
              metric:
                name: "{{ name }}"
                selector:
                  matchExpressions: "{{ matchExpressions }}"
                  matchLabels: "{{ matchLabels }}"
            object:
              current:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                value: "{{ value }}"
              describedObject:
                apiVersion: "{{ apiVersion }}"
                kind: "{{ kind }}"
                name: "{{ name }}"
              metric:
                name: "{{ name }}"
                selector:
                  matchExpressions: "{{ matchExpressions }}"
                  matchLabels: "{{ matchLabels }}"
            pods:
              current:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                value: "{{ value }}"
              metric:
                name: "{{ name }}"
                selector:
                  matchExpressions: "{{ matchExpressions }}"
                  matchLabels: "{{ matchLabels }}"
            resource:
              current:
                averageUtilization: {{ averageUtilization }}
                averageValue: "{{ averageValue }}"
                value: "{{ value }}"
              name: "{{ name }}"
            type: "{{ type }}"
        currentReplicas: {{ currentReplicas }}
        desiredReplicas: {{ desiredReplicas }}
        lastScaleTime: "{{ lastScaleTime }}"
        observedGeneration: {{ observedGeneration }}
      default: [object Object]
    - name: dryRun
      value: "{{ dryRun }}"
      description: When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
      description: When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
    - name: fieldManager
      value: "{{ fieldManager }}"
      description: fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https://golang.org/pkg/unicode/#IsPrint.
      description: fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https://golang.org/pkg/unicode/#IsPrint.
    - name: fieldValidation
      value: "{{ fieldValidation }}"
      description: fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.
      description: fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.
    - name: pretty
      value: "{{ pretty }}"
      description: If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).
      description: If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).
`}</CodeBlock>

</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="patch"
    values={[
        { label: 'patch', value: 'patch' }
    ]}
>
<TabItem value="patch">

partially update the specified HorizontalPodAutoscaler

```sql
UPDATE k8s.autoscaling.horizontal_pod_autoscalers
SET 
-- No updatable properties
WHERE 
name = '{{ name }}' --required
AND namespace = '{{ namespace }}' --required
AND protocol = '{{ protocol }}' --required
AND cluster_addr = '{{ cluster_addr }}' --required
AND dryRun = '{{ dryRun}}'
AND fieldManager = '{{ fieldManager}}'
AND fieldValidation = '{{ fieldValidation}}'
AND force = {{ force}}
AND pretty = '{{ pretty}}'
RETURNING
apiVersion,
kind,
metadata,
spec,
status;
```
</TabItem>
</Tabs>


## `REPLACE` examples

<Tabs
    defaultValue="replace"
    values={[
        { label: 'replace', value: 'replace' }
    ]}
>
<TabItem value="replace">

replace the specified HorizontalPodAutoscaler

```sql
REPLACE k8s.autoscaling.horizontal_pod_autoscalers
SET 
apiVersion = '{{ apiVersion }}',
kind = '{{ kind }}',
metadata = '{{ metadata }}',
spec = '{{ spec }}',
status = '{{ status }}'
WHERE 
name = '{{ name }}' --required
AND namespace = '{{ namespace }}' --required
AND protocol = '{{ protocol }}' --required
AND cluster_addr = '{{ cluster_addr }}' --required
AND spec = '{{ spec }}' --required
AND dryRun = '{{ dryRun}}'
AND fieldManager = '{{ fieldManager}}'
AND fieldValidation = '{{ fieldValidation}}'
AND pretty = '{{ pretty}}'
RETURNING
apiVersion,
kind,
metadata,
spec,
status;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete"
    values={[
        { label: 'delete', value: 'delete' },
        { label: 'delete_collection', value: 'delete_collection' }
    ]}
>
<TabItem value="delete">

delete a HorizontalPodAutoscaler

```sql
DELETE FROM k8s.autoscaling.horizontal_pod_autoscalers
WHERE name = '{{ name }}' --required
AND namespace = '{{ namespace }}' --required
AND protocol = '{{ protocol }}' --required
AND cluster_addr = '{{ cluster_addr }}' --required
AND dryRun = '{{ dryRun }}'
AND gracePeriodSeconds = '{{ gracePeriodSeconds }}'
AND ignoreStoreReadErrorWithClusterBreakingPotential = '{{ ignoreStoreReadErrorWithClusterBreakingPotential }}'
AND orphanDependents = '{{ orphanDependents }}'
AND propagationPolicy = '{{ propagationPolicy }}'
AND pretty = '{{ pretty }}'
;
```
</TabItem>
<TabItem value="delete_collection">

delete collection of HorizontalPodAutoscaler

```sql
DELETE FROM k8s.autoscaling.horizontal_pod_autoscalers
WHERE namespace = '{{ namespace }}' --required
AND protocol = '{{ protocol }}' --required
AND cluster_addr = '{{ cluster_addr }}' --required
AND continue = '{{ continue }}'
AND dryRun = '{{ dryRun }}'
AND fieldSelector = '{{ fieldSelector }}'
AND gracePeriodSeconds = '{{ gracePeriodSeconds }}'
AND ignoreStoreReadErrorWithClusterBreakingPotential = '{{ ignoreStoreReadErrorWithClusterBreakingPotential }}'
AND labelSelector = '{{ labelSelector }}'
AND limit = '{{ limit }}'
AND orphanDependents = '{{ orphanDependents }}'
AND propagationPolicy = '{{ propagationPolicy }}'
AND resourceVersion = '{{ resourceVersion }}'
AND resourceVersionMatch = '{{ resourceVersionMatch }}'
AND sendInitialEvents = '{{ sendInitialEvents }}'
AND shardSelector = '{{ shardSelector }}'
AND timeoutSeconds = '{{ timeoutSeconds }}'
AND pretty = '{{ pretty }}'
;
```
</TabItem>
</Tabs>
