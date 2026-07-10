---
title: k8s
hide_title: false
hide_table_of_contents: false
keywords:
  - k8s
  - kubernetes
  - stackql
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage Kubernetes resources using SQL
custom_edit_url: null
image: /img/stackql-k8s-provider-featured-image.png
id: 'provider-intro'
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';

Query, provision and operate Kubernetes cluster resources - pods, deployments, services, config maps, RBAC and every other built-in control plane API group - using SQL. The provider works against any conformant cluster (kind, EKS, GKE, AKS, OpenShift, k3s, bare metal) and covers all built-in API groups including subresources such as `status`, `scale` and `log`.


:::info[Provider Summary] 

total services: __20__  
total resources: __172__  

:::

See also:
[[` SHOW `]](https://stackql.io/docs/language-spec/show) [[` DESCRIBE `]](https://stackql.io/docs/language-spec/describe)  [[` REGISTRY `]](https://stackql.io/docs/language-spec/registry)
* * *

## Installation

To pull the latest version of the `k8s` provider, run the following command:

```bash
REGISTRY PULL k8s;
```
> To view previous provider versions or to pull a specific provider version, see [here](https://stackql.io/docs/language-spec/registry).

## Connecting to a cluster

The API server endpoint is supplied in the `WHERE` clause of each query using two server parameters:

- <CopyableCode code="cluster_addr" /> - hostname and port of the Kubernetes API server endpoint (default: `localhost`)
- <CopyableCode code="protocol" /> - `http` or `https` (default: `https`)

```sql
SELECT json_extract(metadata, '$.name') AS name,
       json_extract(status, '$.phase') AS phase
FROM k8s.core.pods
WHERE protocol = 'http'
AND cluster_addr = 'localhost:8001'
AND namespace = 'default';
```

> `cluster_addr` must currently be a dot-free hostname (`localhost`, or a hosts-file alias for a remote endpoint) - bare IP addresses and fully qualified domain names are not yet supported for direct connections. The `kubectl proxy` workflow below is unaffected.

## Authentication

The provider default is `null_auth` (no credentials), designed for the `kubectl proxy` workflow - the proxy authenticates to the cluster using your kubeconfig (including cloud credential plugins for EKS, GKE and AKS), and StackQL connects to the local proxy port with no additional configuration:

```bash
kubectl proxy --port=8001
```

then in a separate terminal:

```bash
stackql shell
```

```sql
SELECT json_extract(metadata, '$.name') AS name
FROM k8s.core.namespaces
WHERE protocol = 'http' AND cluster_addr = 'localhost:8001';
```

This works with any cluster your `kubectl` can reach and is the recommended vector.

<details>

<summary>Direct access using a bearer token</summary>

To connect directly to the API server (no proxy), supply a bearer token via the `--auth` flag using the <CopyableCode code="K8S_TOKEN" /> environment variable, along with the cluster CA bundle:

```bash

export K8S_TOKEN='eyJhbGciOiJ...'
AUTH='{ "k8s": { "type": "bearer", "credentialsenvvar": "K8S_TOKEN" }}'
stackql shell --auth="${AUTH}" --tls.CABundle cluster-ca.pem

```
or using PowerShell:

```powershell

$env:K8S_TOKEN = 'eyJhbGciOiJ...'
$Auth = "{ 'k8s': { 'type': 'bearer', 'credentialsenvvar': 'K8S_TOKEN' }}"
stackql.exe shell --auth=$Auth --tls.CABundle cluster-ca.pem

```

A service account token can be created with `kubectl create token <serviceaccount>`. For managed clusters, obtain a token from the platform credential helper and pass it the same way, for example:

```bash
export K8S_TOKEN=$(aws eks get-token --cluster-name my-cluster | jq -r .status.token)
```

> Tokens issued by cloud credential helpers are short lived (typically 15 minutes) and are not refreshed automatically - for long running sessions prefer the `kubectl proxy` vector. Client certificate (mTLS) authentication and native kubeconfig resolution are not currently supported; use `kubectl proxy` for those clusters. Alternatively `--tls.allowInsecure=true` skips CA verification (not recommended).

</details>


## Services
<div class="row">
<div class="providerDocColumn">
<a href="/services/admissionregistration/">admissionregistration</a><br />
<a href="/services/apiextensions/">apiextensions</a><br />
<a href="/services/apiregistration/">apiregistration</a><br />
<a href="/services/apps/">apps</a><br />
<a href="/services/authentication/">authentication</a><br />
<a href="/services/authorization/">authorization</a><br />
<a href="/services/autoscaling/">autoscaling</a><br />
<a href="/services/batch/">batch</a><br />
<a href="/services/certificates/">certificates</a><br />
<a href="/services/coordination/">coordination</a><br />
</div>
<div class="providerDocColumn">
<a href="/services/core/">core</a><br />
<a href="/services/discovery/">discovery</a><br />
<a href="/services/events/">events</a><br />
<a href="/services/flowcontrol/">flowcontrol</a><br />
<a href="/services/networking/">networking</a><br />
<a href="/services/node/">node</a><br />
<a href="/services/policy/">policy</a><br />
<a href="/services/rbac/">rbac</a><br />
<a href="/services/scheduling/">scheduling</a><br />
<a href="/services/storage/">storage</a><br />
</div>
</div>
