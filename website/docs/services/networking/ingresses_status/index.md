--- 
title: ingresses_status
hide_title: false
hide_table_of_contents: false
keywords:
  - ingresses_status
  - networking
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

Creates, updates, deletes, gets or lists an <code>ingresses_status</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="ingresses_status" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="k8s.networking.ingresses_status" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
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
    <td>Standard object's metadata. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata</td>
</tr>
<tr>
    <td><CopyableCode code="spec" /></td>
    <td><code>object</code></td>
    <td>spec is the desired state of the Ingress. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>object</code></td>
    <td>status is the current state of the Ingress. More info: https:​//git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status</td>
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
    <td>read status of the specified Ingress</td>
</tr>
<tr>
    <td><a href="#patch"><CopyableCode code="patch" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-fieldManager"><code>fieldManager</code></a>, <a href="#parameter-fieldValidation"><code>fieldValidation</code></a>, <a href="#parameter-force"><code>force</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>partially update status of the specified Ingress</td>
</tr>
<tr>
    <td><a href="#replace"><CopyableCode code="replace" /></a></td>
    <td><CopyableCode code="replace" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-namespace"><code>namespace</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-dryRun"><code>dryRun</code></a>, <a href="#parameter-fieldManager"><code>fieldManager</code></a>, <a href="#parameter-fieldValidation"><code>fieldValidation</code></a>, <a href="#parameter-pretty"><code>pretty</code></a></td>
    <td>replace status of the specified Ingress</td>
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
    <td>name of the Ingress</td>
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
<tr id="parameter-force">
    <td><CopyableCode code="force" /></td>
    <td><code>boolean</code></td>
    <td>Force is going to "force" Apply requests. It means user will re-acquire conflicting fields owned by other people. Force flag must be unset for non-apply patch requests.</td>
</tr>
<tr id="parameter-pretty">
    <td><CopyableCode code="pretty" /></td>
    <td><code>string</code></td>
    <td>If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

read status of the specified Ingress

```sql
SELECT
apiVersion,
kind,
metadata,
spec,
status
FROM k8s.networking.ingresses_status
WHERE name = '{{ name }}' -- required
AND namespace = '{{ namespace }}' -- required
AND protocol = '{{ protocol }}' -- required
AND cluster_addr = '{{ cluster_addr }}' -- required
AND pretty = '{{ pretty }}'
;
```
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

partially update status of the specified Ingress

```sql
UPDATE k8s.networking.ingresses_status
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

replace status of the specified Ingress

```sql
REPLACE k8s.networking.ingresses_status
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
