--- 
title: pods_log
hide_title: false
hide_table_of_contents: false
keywords:
  - pods_log
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

Creates, updates, deletes, gets or lists a <code>pods_log</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="pods_log" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="k8s.core.pods_log" /></td></tr>
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
    <td><CopyableCode code="log" /></td>
    <td><code>string</code></td>
    <td></td>
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
    <td><a href="#parameter-container"><code>container</code></a>, <a href="#parameter-follow"><code>follow</code></a>, <a href="#parameter-insecure_skip_tls_verify_backend"><code>insecure_skip_tls_verify_backend</code></a>, <a href="#parameter-limit_bytes"><code>limit_bytes</code></a>, <a href="#parameter-pretty"><code>pretty</code></a>, <a href="#parameter-previous"><code>previous</code></a>, <a href="#parameter-since_seconds"><code>since_seconds</code></a>, <a href="#parameter-stream"><code>stream</code></a>, <a href="#parameter-tail_lines"><code>tail_lines</code></a>, <a href="#parameter-timestamps"><code>timestamps</code></a></td>
    <td>read log of the specified Pod</td>
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
<tr id="parameter-name">
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td>name of the Pod</td>
</tr>
<tr id="parameter-namespace">
    <td><CopyableCode code="namespace" /></td>
    <td><code>string</code></td>
    <td>object name and auth scope, such as for teams and projects</td>
</tr>
<tr id="parameter-protocol">
    <td><CopyableCode code="protocol" /></td>
    <td><code>string</code></td>
    <td>(default: https, enum: &#91;https, http&#93;, x-stackQL-envVar: KUBE_PROTOCOL)</td>
</tr>
<tr id="parameter-container">
    <td><CopyableCode code="container" /></td>
    <td><code>string</code></td>
    <td>The container for which to stream logs. Defaults to only container if there is one container in the pod.</td>
</tr>
<tr id="parameter-follow">
    <td><CopyableCode code="follow" /></td>
    <td><code>boolean</code></td>
    <td>Follow the log stream of the pod. Defaults to false.</td>
</tr>
<tr id="parameter-insecure_skip_tls_verify_backend">
    <td><CopyableCode code="insecure_skip_tls_verify_backend" /></td>
    <td><code>boolean</code></td>
    <td>insecureSkipTLSVerifyBackend indicates that the apiserver should not confirm the validity of the serving certificate of the backend it is connecting to.  This will make the HTTPS connection between the apiserver and the backend insecure. This means the apiserver cannot verify the log data it is receiving came from the real kubelet.  If the kubelet is configured to verify the apiserver's TLS credentials, it does not mean the connection to the real kubelet is vulnerable to a man in the middle attack (e.g. an attacker could not intercept the actual log data coming from the real kubelet). (wire: insecureSkipTLSVerifyBackend)</td>
</tr>
<tr id="parameter-limit_bytes">
    <td><CopyableCode code="limit_bytes" /></td>
    <td><code>integer</code></td>
    <td>If set, the number of bytes to read from the server before terminating the log output. This may not display a complete final line of logging, and may return slightly more or slightly less than the specified limit. (wire: limitBytes)</td>
</tr>
<tr id="parameter-pretty">
    <td><CopyableCode code="pretty" /></td>
    <td><code>string</code></td>
    <td>If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).</td>
</tr>
<tr id="parameter-previous">
    <td><CopyableCode code="previous" /></td>
    <td><code>boolean</code></td>
    <td>Return previous terminated container logs. Defaults to false.</td>
</tr>
<tr id="parameter-since_seconds">
    <td><CopyableCode code="since_seconds" /></td>
    <td><code>integer</code></td>
    <td>A relative time in seconds before the current time from which to show logs. If this value precedes the time a pod was started, only logs since the pod start will be returned. If this value is in the future, no logs will be returned. Only one of sinceSeconds or sinceTime may be specified. (wire: sinceSeconds)</td>
</tr>
<tr id="parameter-stream">
    <td><CopyableCode code="stream" /></td>
    <td><code>string</code></td>
    <td>Specify which container log stream to return to the client. Acceptable values are "All", "Stdout" and "Stderr". If not specified, "All" is used, and both stdout and stderr are returned interleaved. Note that when "TailLines" is specified, "Stream" can only be set to nil or "All".</td>
</tr>
<tr id="parameter-tail_lines">
    <td><CopyableCode code="tail_lines" /></td>
    <td><code>integer</code></td>
    <td>If set, the number of lines from the end of the logs to show. If not specified, logs are shown from the creation of the container or sinceSeconds or sinceTime. Note that when "TailLines" is specified, "Stream" can only be set to nil or "All". (wire: tailLines)</td>
</tr>
<tr id="parameter-timestamps">
    <td><CopyableCode code="timestamps" /></td>
    <td><code>boolean</code></td>
    <td>If true, add an RFC3339 or RFC3339Nano timestamp at the beginning of every line of log output. Defaults to false.</td>
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

read log of the specified Pod

```sql
SELECT
log
FROM k8s.core.pods_log
WHERE name = '{{ name }}' -- required
AND namespace = '{{ namespace }}' -- required
AND protocol = '{{ protocol }}' -- required
AND cluster_addr = '{{ cluster_addr }}' -- required
AND container = '{{ container }}'
AND follow = '{{ follow }}'
AND insecure_skip_tls_verify_backend = '{{ insecure_skip_tls_verify_backend }}'
AND limit_bytes = '{{ limit_bytes }}'
AND pretty = '{{ pretty }}'
AND previous = '{{ previous }}'
AND since_seconds = '{{ since_seconds }}'
AND stream = '{{ stream }}'
AND tail_lines = '{{ tail_lines }}'
AND timestamps = '{{ timestamps }}'
;
```
</TabItem>
</Tabs>
