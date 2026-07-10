--- 
title: pods_binding
hide_title: false
hide_table_of_contents: false
keywords:
  - pods_binding
  - core
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

Creates, updates, deletes, gets or lists a <code>pods_binding</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="pods_binding" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="k8s.core.pods_binding" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

`SELECT` not supported for this resource, use `SHOW METHODS` to view available operations for the resource.


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
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a>, <a href="#parameter-target"><code>target</code></a></td>
    <td><a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-fieldManager"><code>fieldManager</code></a>, <a href="#parameter-fieldValidation"><code>fieldValidation</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>create binding of a Pod</td>
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
    <td>name of the Binding</td>
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
<tr id="parameter-fieldValidation">
    <td><CopyableCode code="fieldValidation" /></td>
    <td><code>string</code></td>
    <td>fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.</td>
</tr>
<tr id="parameter-pretty">
    <td><CopyableCode code="pretty" /></td>
    <td><code>string</code></td>
    <td>If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).</td>
</tr>
</tbody>
</table>

## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

create binding of a Pod

```sql
INSERT INTO k8s.core.pods_binding (
apiVersion,
kind,
metadata,
target,
name,
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
'{{ target }}' /* required */,
'{{ name }}',
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
target
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: pods_binding
  props:
    - name: name
      value: "{{ name }}"
      description: Required parameter for the pods_binding resource.
    - name: namespace
      value: "{{ namespace }}"
      description: Required parameter for the pods_binding resource.
    - name: protocol
      value: "{{ protocol }}"
      description: Required parameter for the pods_binding resource.
    - name: cluster_addr
      value: "{{ cluster_addr }}"
      description: Required parameter for the pods_binding resource.
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
        Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
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
    - name: target
      description: |
        The target object that you want to bind to the standard object.
      value:
        apiVersion: "{{ apiVersion }}"
        fieldPath: "{{ fieldPath }}"
        kind: "{{ kind }}"
        name: "{{ name }}"
        namespace: "{{ namespace }}"
        resourceVersion: "{{ resourceVersion }}"
        uid: "{{ uid }}"
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
