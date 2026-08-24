--- 
title: csi_storage_capacities_all_namespaces
hide_title: false
hide_table_of_contents: false
keywords:
  - csi_storage_capacities_all_namespaces
  - storage
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

Creates, updates, deletes, gets or lists a <code>csi_storage_capacities_all_namespaces</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="csi_storage_capacities_all_namespaces" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="k8s.storage.csi_storage_capacities_all_namespaces" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
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
    <td><CopyableCode code="storage_class_name" /></td>
    <td><code>string</code></td>
    <td>storageClassName represents the name of the StorageClass that the reported capacity applies to. It must meet the same requirements as the name of a StorageClass object (non-empty, DNS subdomain). If that object no longer exists, the CSIStorageCapacity object is obsolete and should be removed by its creator. This field is immutable. (default: ) (wire: storageClassName)</td>
</tr>
<tr>
    <td><CopyableCode code="api_version" /></td>
    <td><code>string</code></td>
    <td>APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources (wire: apiVersion)</td>
</tr>
<tr>
    <td><CopyableCode code="capacity" /></td>
    <td><code>string</code></td>
    <td>capacity is the value reported by the CSI driver in its GetCapacityResponse for a GetCapacityRequest with topology and parameters that match the previous fields.  The semantic is currently (CSI spec 1.2) defined as: The available capacity, in bytes, of the storage that can be used to provision volumes. If not set, that information is currently unavailable.</td>
</tr>
<tr>
    <td><CopyableCode code="kind" /></td>
    <td><code>string</code></td>
    <td>Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds</td>
</tr>
<tr>
    <td><CopyableCode code="maximum_volume_size" /></td>
    <td><code>string</code></td>
    <td>maximumVolumeSize is the value reported by the CSI driver in its GetCapacityResponse for a GetCapacityRequest with topology and parameters that match the previous fields.  This is defined since CSI spec 1.4.0 as the largest size that may be used in a CreateVolumeRequest.capacity_range.required_bytes field to create a volume with the same parameters as those in GetCapacityRequest. The corresponding value in the Kubernetes API is ResourceRequirements.Requests in a volume claim. (wire: maximumVolumeSize)</td>
</tr>
<tr>
    <td><CopyableCode code="metadata" /></td>
    <td><code>object</code></td>
    <td>Standard object's metadata. The name has no particular meaning. It must be a DNS subdomain (dots allowed, 253 characters). To ensure that there are no conflicts with other CSI drivers on the cluster, the recommendation is to use csisc-&lt;uuid&gt;, a generated name, or a reverse-domain name which ends with the unique CSI driver name.  Objects are namespaced.  More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata</td>
</tr>
<tr>
    <td><CopyableCode code="node_topology" /></td>
    <td><code>object</code></td>
    <td>nodeTopology defines which nodes have access to the storage for which capacity was reported. If not set, the storage is not accessible from any node in the cluster. If empty, the storage is accessible from all nodes. This field is immutable. (x-kubernetes-map-type: atomic) (wire: nodeTopology)</td>
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
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-allow_watch_bookmarks"><code>allow_watch_bookmarks</code></a>, <a href="#parameter-continue"><code>continue</code></a>, <a href="#parameter-field_selector"><code>field_selector</code></a>, <a href="#parameter-label_selector"><code>label_selector</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-pretty"><code>pretty</code></a>, <a href="#parameter-resource_version"><code>resource_version</code></a>, <a href="#parameter-resource_version_match"><code>resource_version_match</code></a>, <a href="#parameter-send_initial_events"><code>send_initial_events</code></a>, <a href="#parameter-shard_selector"><code>shard_selector</code></a>, <a href="#parameter-timeout_seconds"><code>timeout_seconds</code></a>, <a href="#parameter-watch"><code>watch</code></a></td>
    <td>list or watch objects of kind CSIStorageCapacity</td>
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
    <td>(default: localhost, x-stackQL-envVar: KUBE_HOST)</td>
</tr>
<tr id="parameter-protocol">
    <td><CopyableCode code="protocol" /></td>
    <td><code>string</code></td>
    <td>(default: https, enum: &#91;https, http&#93;, x-stackQL-envVar: KUBE_PROTOCOL)</td>
</tr>
<tr id="parameter-allow_watch_bookmarks">
    <td><CopyableCode code="allow_watch_bookmarks" /></td>
    <td><code>boolean</code></td>
    <td>allowWatchBookmarks requests watch events with type "BOOKMARK". Servers that do not implement bookmarks may ignore this flag and bookmarks are sent at the server's discretion. Clients should not assume bookmarks are returned at any specific interval, nor may they assume the server will send any BOOKMARK event during a session. If this is not a watch, this field is ignored. (wire: allowWatchBookmarks)</td>
</tr>
<tr id="parameter-continue">
    <td><CopyableCode code="continue" /></td>
    <td><code>string</code></td>
    <td>The continue option should be set when retrieving more results from the server. Since this value is server defined, clients may only use the continue value from a previous query result with identical query parameters (except for the value of continue) and the server may reject a continue value it does not recognize. If the specified continue value is no longer valid whether due to expiration (generally five to fifteen minutes) or a configuration change on the server, the server will respond with a 410 ResourceExpired error together with a continue token. If the client needs a consistent list, it must restart their list without the continue field. Otherwise, the client may send another list request with the token received with the 410 error, the server will respond with a list starting from the next key, but from the latest snapshot, which is inconsistent from the previous list results - objects that are created, modified, or deleted after the first list request will be included in the response, as long as their keys are after the "next key".  This field is not supported when watch is true. Clients may start a watch from the last resourceVersion value returned by the server and not miss any modifications.</td>
</tr>
<tr id="parameter-field_selector">
    <td><CopyableCode code="field_selector" /></td>
    <td><code>string</code></td>
    <td>A selector to restrict the list of returned objects by their fields. Defaults to everything. (wire: fieldSelector)</td>
</tr>
<tr id="parameter-label_selector">
    <td><CopyableCode code="label_selector" /></td>
    <td><code>string</code></td>
    <td>A selector to restrict the list of returned objects by their labels. Defaults to everything. (wire: labelSelector)</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>limit is a maximum number of responses to return for a list call. If more items exist, the server will set the `continue` field on the list metadata to a value that can be used with the same initial query to retrieve the next set of results. Setting a limit may return fewer than the requested amount of items (up to zero items) in the event all requested objects are filtered out and clients should only use the presence of the continue field to determine whether more results are available. Servers may choose not to support the limit argument and will return all of the available results. If limit is specified and the continue field is empty, clients may assume that no more results are available. This field is not supported if watch is true.  The server guarantees that the objects returned when using continue will be identical to issuing a single list call without a limit - that is, no objects created, modified, or deleted after the first request is issued will be included in any subsequent continued requests. This is sometimes referred to as a consistent snapshot, and ensures that a client that is using limit to receive smaller chunks of a very large result can ensure they see all possible objects. If objects are updated during a chunked list the version of the object that was present at the time the first list result was calculated is returned.</td>
</tr>
<tr id="parameter-pretty">
    <td><CopyableCode code="pretty" /></td>
    <td><code>string</code></td>
    <td>If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).</td>
</tr>
<tr id="parameter-resource_version">
    <td><CopyableCode code="resource_version" /></td>
    <td><code>string</code></td>
    <td>resourceVersion sets a constraint on what resource versions a request may be served from. See https:​//kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions for details.  Defaults to unset (wire: resourceVersion)</td>
</tr>
<tr id="parameter-resource_version_match">
    <td><CopyableCode code="resource_version_match" /></td>
    <td><code>string</code></td>
    <td>resourceVersionMatch determines how resourceVersion is applied to list calls. It is highly recommended that resourceVersionMatch be set for list calls where resourceVersion is set See https:​//kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions for details.  Defaults to unset (wire: resourceVersionMatch)</td>
</tr>
<tr id="parameter-send_initial_events">
    <td><CopyableCode code="send_initial_events" /></td>
    <td><code>boolean</code></td>
    <td>`sendInitialEvents=true` may be set together with `watch=true`. In that case, the watch stream will begin with synthetic events to produce the current state of objects in the collection. Once all such events have been sent, a synthetic "Bookmark" event  will be sent. The bookmark will report the ResourceVersion (RV) corresponding to the set of objects, and be marked with `"k8s.io/initial-events-end": "true"` annotation. Afterwards, the watch stream will proceed as usual, sending watch events corresponding to changes (subsequent to the RV) to objects watched.  When `sendInitialEvents` option is set, we require `resourceVersionMatch` option to also be set. The semantic of the watch request is as following: - `resourceVersionMatch` = NotOlderThan   is interpreted as "data at least as new as the provided `resourceVersion`"   and the bookmark event is send when the state is synced   to a `resourceVersion` at least as fresh as the one provided by the ListOptions.   If `resourceVersion` is unset, this is interpreted as "consistent read" and the   bookmark event is send when the state is synced at least to the moment   when request started being processed. - `resourceVersionMatch` set to any other value or unset   Invalid error is returned.  Defaults to true if `resourceVersion=""` or `resourceVersion="0"` (for backward compatibility reasons) and to false otherwise. (wire: sendInitialEvents)</td>
</tr>
<tr id="parameter-shard_selector">
    <td><CopyableCode code="shard_selector" /></td>
    <td><code>string</code></td>
    <td>shardSelector restricts the list of returned objects using a CEL-based shard selector expression. The format uses the shardRange() function combined with || (logical OR) to specify one or more hash ranges:    shardRange(object.metadata.uid, '0x0', '0x8000000000000000')   shardRange(object.metadata.uid, '0x0', '0x8000000000000000') || shardRange(object.metadata.uid, '0x8000000000000000', '0x10000000000000000')  Field paths use CEL-style object-rooted syntax (e.g. "object.metadata.uid"), NOT the fieldSelector format ("metadata.uid"). Currently supported paths:   - object.metadata.uid   - object.metadata.namespace  hexStart and hexEnd are single-quoted CEL string literals with a '0x' prefix, defining the inclusive lower and exclusive upper bounds over the 64-bit FNV-1a hash space. The full range is &#91;0x0, 0x10000000000000000), where the exclusive upper bound equals 2^64.  Examples:   2-shard split:     shard 0: shardRange(object.metadata.uid, '0x0000000000000000', '0x8000000000000000')     shard 1: shardRange(object.metadata.uid, '0x8000000000000000', '0x10000000000000000')   4-shard split:     shard 0: shardRange(object.metadata.uid, '0x0000000000000000', '0x4000000000000000')     shard 1: shardRange(object.metadata.uid, '0x4000000000000000', '0x8000000000000000')     shard 2: shardRange(object.metadata.uid, '0x8000000000000000', '0xc000000000000000')     shard 3: shardRange(object.metadata.uid, '0xc000000000000000', '0x10000000000000000')  This is an alpha field and requires enabling the ShardedListAndWatch feature gate. (wire: shardSelector)</td>
</tr>
<tr id="parameter-timeout_seconds">
    <td><CopyableCode code="timeout_seconds" /></td>
    <td><code>integer</code></td>
    <td>Timeout for the list/watch call. This limits the duration of the call, regardless of any activity or inactivity. (wire: timeoutSeconds)</td>
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
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

list or watch objects of kind CSIStorageCapacity

```sql
SELECT
storage_class_name,
api_version,
capacity,
kind,
maximum_volume_size,
metadata,
node_topology
FROM k8s.storage.csi_storage_capacities_all_namespaces
WHERE protocol = '{{ protocol }}' -- required
AND cluster_addr = '{{ cluster_addr }}' -- required
AND allow_watch_bookmarks = '{{ allow_watch_bookmarks }}'
AND continue = '{{ continue }}'
AND field_selector = '{{ field_selector }}'
AND label_selector = '{{ label_selector }}'
AND limit = '{{ limit }}'
AND pretty = '{{ pretty }}'
AND resource_version = '{{ resource_version }}'
AND resource_version_match = '{{ resource_version_match }}'
AND send_initial_events = '{{ send_initial_events }}'
AND shard_selector = '{{ shard_selector }}'
AND timeout_seconds = '{{ timeout_seconds }}'
AND watch = '{{ watch }}'
;
```
</TabItem>
</Tabs>
