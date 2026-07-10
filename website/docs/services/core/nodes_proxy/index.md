--- 
title: nodes_proxy
hide_title: false
hide_table_of_contents: false
keywords:
  - nodes_proxy
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

Creates, updates, deletes, gets or lists a <code>nodes_proxy</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="nodes_proxy" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="k8s.core.nodes_proxy" /></td></tr>
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
    <td><a href="#connect_delete"><CopyableCode code="connect_delete" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect DELETE requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_get"><CopyableCode code="connect_get" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect GET requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_patch"><CopyableCode code="connect_patch" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect PATCH requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_post"><CopyableCode code="connect_post" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect POST requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_put"><CopyableCode code="connect_put" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect PUT requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_delete_path"><CopyableCode code="connect_delete_path" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-path"><code>path</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect DELETE requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_get_path"><CopyableCode code="connect_get_path" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-path"><code>path</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect GET requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_patch_path"><CopyableCode code="connect_patch_path" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-path"><code>path</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect PATCH requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_post_path"><CopyableCode code="connect_post_path" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-path"><code>path</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect POST requests to proxy of Node</td>
</tr>
<tr>
    <td><a href="#connect_put_path"><CopyableCode code="connect_put_path" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-path"><code>path</code></a>, <a href="#parameter-protocol"><code>protocol</code></a>, <a href="#parameter-cluster_addr"><code>cluster_addr</code></a></td>
    <td><a href="#parameter-path"><code>path</code></a></td>
    <td>connect PUT requests to proxy of Node</td>
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
    <td>name of the NodeProxyOptions</td>
</tr>
<tr id="parameter-path">
    <td><CopyableCode code="path" /></td>
    <td><code>string</code></td>
    <td>path to the resource</td>
</tr>
<tr id="parameter-protocol">
    <td><CopyableCode code="protocol" /></td>
    <td><code>string</code></td>
    <td>(default: https, enum: &#91;https, http&#93;)</td>
</tr>
<tr id="parameter-path">
    <td><CopyableCode code="path" /></td>
    <td><code>string</code></td>
    <td>Path is the URL path to use for the current proxy request to node.</td>
</tr>
</tbody>
</table>

## Lifecycle Methods

<Tabs
    defaultValue="connect_delete"
    values={[
        { label: 'connect_delete', value: 'connect_delete' },
        { label: 'connect_get', value: 'connect_get' },
        { label: 'connect_patch', value: 'connect_patch' },
        { label: 'connect_post', value: 'connect_post' },
        { label: 'connect_put', value: 'connect_put' },
        { label: 'connect_delete_path', value: 'connect_delete_path' },
        { label: 'connect_get_path', value: 'connect_get_path' },
        { label: 'connect_patch_path', value: 'connect_patch_path' },
        { label: 'connect_post_path', value: 'connect_post_path' },
        { label: 'connect_put_path', value: 'connect_put_path' }
    ]}
>
<TabItem value="connect_delete">

connect DELETE requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_delete 
@name='{{ name }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_get">

connect GET requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_get 
@name='{{ name }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_patch">

connect PATCH requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_patch 
@name='{{ name }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_post">

connect POST requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_post 
@name='{{ name }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_put">

connect PUT requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_put 
@name='{{ name }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_delete_path">

connect DELETE requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_delete_path 
@name='{{ name }}' --required, 
@path='{{ path }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_get_path">

connect GET requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_get_path 
@name='{{ name }}' --required, 
@path='{{ path }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_patch_path">

connect PATCH requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_patch_path 
@name='{{ name }}' --required, 
@path='{{ path }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_post_path">

connect POST requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_post_path 
@name='{{ name }}' --required, 
@path='{{ path }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
<TabItem value="connect_put_path">

connect PUT requests to proxy of Node

```sql
EXEC k8s.core.nodes_proxy.connect_put_path 
@name='{{ name }}' --required, 
@path='{{ path }}' --required, 
@protocol='{{ protocol }}' --required, 
@cluster_addr='{{ cluster_addr }}' --required, 
@path='{{ path }}'
;
```
</TabItem>
</Tabs>
