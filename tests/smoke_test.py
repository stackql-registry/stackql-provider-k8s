#!/usr/bin/env python3
"""pystackql smoke test for the k8s stackql provider.

Exercises the salient resources against a real Kubernetes cluster - read
smokes over namespaces / pods / nodes / api_resources, then a full write
lifecycle in a dedicated namespace: INSERT namespace, INSERT configmap,
UPDATE (merge patch) + verify, REPLACE + verify, INSERT deployment, scale
it via the deployments_scale subresource, then tear everything down with
DELETE + confirm-gone.

Every created object is namespaced under a `stackql-smoke-<stamp>`
namespace; before running, the script sweeps namespaces with the
stackql-smoke- prefix so each run starts from a clean slate.

Cluster access: the default vector is `kubectl proxy` (null_auth over
http), which works with any cluster your kubeconfig can reach:

    kubectl proxy --port=8001
    python tests/smoke_test.py

Direct access with a bearer token (no proxy):

    export K8S_TOKEN=$(kubectl create token stackql-smoke-sa)
    python tests/smoke_test.py --cluster-addr <host>:<port> --protocol https

NOTE: cluster_addr must currently be a dot-free hostname (e.g. localhost,
or an /etc/hosts alias) - any-sdk's query router matches the host against
the '{cluster_addr}' server template and gorilla/mux host variables do not
span dots, so bare IPs and FQDNs fail route resolution (core fix pending).

Usage:
    pip install pystackql
    python tests/smoke_test.py                    # local registry (default)
    python tests/smoke_test.py --registry public  # published provider in the
                                                  # stackql registry
    python tests/smoke_test.py --cleanup-only     # just sweep breadcrumbs
    python tests/smoke_test.py --skip-deployment  # configmap lifecycle only
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SMOKE_PREFIX = "stackql-smoke-"

# error-text fragments indicating a KNOWN environment/core limitation
XFAIL_PATTERNS = {
    "router-dotted-host": re.compile(r"FindRoute|no matching operation", re.I),
    "patch-media": re.compile(r"UnsupportedMediaType|unsupported media type", re.I),
}

ERROR_RE = re.compile(
    r"http response status code: [45]|over HTTP error|error assembling|"
    r"cannot find matching operation|FindRoute|no matching operation|"
    r"cannot find any viable servers|parser error|panic|"
    r"no request body for operation|schema unsuitable",
    re.I,
)


class Smoke:
    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.stamp = str(int(time.time()))[-6:]
        self.ns = f"{SMOKE_PREFIX}{self.stamp}"
        self.where = f"protocol = '{args.protocol}' AND cluster_addr = '{args.cluster_addr}'"
        self.server_cols = f"'{args.protocol}', '{args.cluster_addr}'"
        self.results: list[tuple[str, str, str]] = []

        from pystackql import StackQL

        if args.registry == "local":
            reg_path = (BASE_DIR / "provider-dev" / "openapi").resolve()
            reg_url = "file://" + reg_path.as_posix()
            self.sq = StackQL(output="dict", custom_registry=reg_url)
            # pystackql only serialises {"url": ...}; a local file registry
            # additionally needs localDocRoot + nopVerify - patch the exec
            # params in place (compact JSON, shell-quoted).
            full = json.dumps(
                {
                    "url": reg_url,
                    "localDocRoot": reg_path.as_posix(),
                    "verifyConfig": {"nopVerify": True},
                },
                separators=(",", ":"),
            )
            if sys.platform.startswith("win"):
                quoted = '"' + full.replace('"', '\\"') + '"'
            else:
                import shlex
                quoted = shlex.quote(full)
            params = self.sq.local_query_executor.params
            for i, p in enumerate(params):
                if p == "--registry":
                    params[i + 1] = quoted
                    break
        else:
            # public registry: requires the k8s provider to be published
            self.sq = StackQL(output="dict")

    # ------------------------------------------------------------------ core
    def q(self, sql: str):
        try:
            if sql.lstrip().upper().startswith(("SELECT", "SHOW", "DESCRIBE")):
                out = self.sq.execute(sql)
            else:
                out = self.sq.executeStmt(sql)
        except Exception as exc:  # noqa: BLE001
            return [], str(exc)
        text = json.dumps(out, default=str)
        if ERROR_RE.search(text):
            return out if isinstance(out, list) else [out], text
        if isinstance(out, list) and out and isinstance(out[0], dict) and "error" in out[0]:
            return out, text
        return out if isinstance(out, list) else [out], None

    def classify(self, err: str) -> tuple[str, str]:
        for reason, pat in XFAIL_PATTERNS.items():
            if pat.search(err):
                return "XFAIL", reason
        return "FAIL", err[:160]

    def step(self, name: str, sql: str, expect_rows: bool = False, contains: str | None = None):
        rows, err = self.q(sql)
        if err:
            status, note = self.classify(err)
            self.results.append((name, status, note))
            print(f"  {status:5s} {name}  [{note[:110]}]")
            return False
        blob = json.dumps(rows, default=str)
        if expect_rows and not rows:
            self.results.append((name, "FAIL", "expected rows, got none"))
            print(f"  FAIL  {name}  [no rows]")
            return False
        if contains and contains not in blob:
            self.results.append((name, "FAIL", f"'{contains}' not in result"))
            print(f"  FAIL  {name}  ['{contains}' not in {blob[:90]}]")
            return False
        self.results.append((name, "PASS", ""))
        print(f"  PASS  {name}")
        return True

    def wait_for(self, name: str, sql: str, pred, timeout: int = 180, interval: int = 5):
        start = time.time()
        last = None
        while time.time() - start < timeout:
            rows, err = self.q(sql)
            last = err or json.dumps(rows, default=str)[:160]
            if not err and pred(rows):
                self.results.append((name, "PASS", f"{int(time.time()-start)}s"))
                print(f"  PASS  {name}  ({int(time.time()-start)}s)")
                return True
            time.sleep(interval)
        self.results.append((name, "FAIL", f"timeout: {last}"))
        print(f"  FAIL  {name}  [timeout: {last}]")
        return False

    # ------------------------------------------------------- breadcrumb sweep
    def cleanup_breadcrumbs(self) -> None:
        print("== breadcrumb sweep ==")
        rows, err = self.q(
            f"SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.namespaces WHERE {self.where}"
        )
        if err:
            print(f"  WARN sweep list failed: {err[:120]}")
            return
        stale = [r.get("name") for r in rows if str(r.get("name", "")).startswith(SMOKE_PREFIX)]
        for name in stale:
            print(f"  sweeping {name}")
            self.q(f"DELETE FROM k8s.core.namespaces WHERE name = '{name}' AND {self.where}")

    # -------------------------------------------------------------- read path
    def read_smokes(self) -> None:
        print("== read smokes ==")
        self.step("show services", "SHOW SERVICES IN k8s", expect_rows=True)
        self.step(
            "namespaces list",
            f"SELECT json_extract(metadata, '$.name') AS name, json_extract(status, '$.phase') AS phase "
            f"FROM k8s.core.namespaces WHERE {self.where}",
            expect_rows=True, contains="default",
        )
        self.step(
            "pods all namespaces",
            f"SELECT json_extract(metadata, '$.namespace') AS namespace, json_extract(metadata, '$.name') AS name "
            f"FROM k8s.core.pods_all_namespaces WHERE {self.where}",
            expect_rows=True,
        )
        self.step(
            "nodes list",
            f"SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.nodes WHERE {self.where}",
            expect_rows=True,
        )
        self.step(
            "apps api_resources (group discovery)",
            f"SELECT name, kind, namespaced FROM k8s.apps.api_resources WHERE {self.where}",
            expect_rows=True, contains="Deployment",
        )
        self.step(
            "self_subject_reviews SELECT (who am I)",
            f"SELECT json_extract(status, '$.userInfo.username') AS username "
            f"FROM k8s.authentication.self_subject_reviews WHERE {self.where}",
            expect_rows=True,
        )
        self.step(
            "self_subject_access_reviews INSERT RETURNING (can I list pods)",
            f"INSERT INTO k8s.authorization.self_subject_access_reviews(protocol, cluster_addr, spec) "
            f"SELECT {self.server_cols}, '{{\"resourceAttributes\": {{\"verb\": \"list\", \"resource\": \"pods\"}}}}' "
            f"RETURNING status",
            expect_rows=True, contains="allowed",
        )

    # ------------------------------------------------------------- write path
    def lifecycle(self) -> None:
        ns, where, cols = self.ns, self.where, self.server_cols
        print(f"== write lifecycle (namespace: {ns}) ==")

        self.step(
            "namespace INSERT",
            f"INSERT INTO k8s.core.namespaces(protocol, cluster_addr, metadata) "
            f"SELECT {cols}, '{{\"name\": \"{ns}\"}}'",
        )
        self.step(
            "namespace get",
            f"SELECT json_extract(status, '$.phase') AS phase FROM k8s.core.namespaces "
            f"WHERE name = '{ns}' AND {where}",
            expect_rows=True, contains="Active",
        )

        self.step(
            "configmap INSERT",
            f"INSERT INTO k8s.core.config_maps(namespace, protocol, cluster_addr, metadata, data) "
            f"SELECT '{ns}', {cols}, '{{\"name\": \"smoke-cm\"}}', '{{\"k1\": \"v1\"}}'",
        )
        self.step(
            "configmap UPDATE (merge patch)",
            f"UPDATE k8s.core.config_maps SET data = '{{\"k2\": \"v2\"}}' "
            f"WHERE namespace = '{ns}' AND name = 'smoke-cm' AND {where}",
        )
        self.step(
            "configmap merged after patch",
            f"SELECT data FROM k8s.core.config_maps WHERE namespace = '{ns}' AND name = 'smoke-cm' AND {where}",
            expect_rows=True, contains="v2",
        )
        self.step(
            "configmap REPLACE",
            f"REPLACE k8s.core.config_maps SET metadata = '{{\"name\": \"smoke-cm\"}}', "
            f"data = '{{\"k3\": \"v3\"}}' "
            f"WHERE namespace = '{ns}' AND name = 'smoke-cm' AND {where}",
        )
        self.step(
            "configmap replaced",
            f"SELECT data FROM k8s.core.config_maps WHERE namespace = '{ns}' AND name = 'smoke-cm' AND {where}",
            expect_rows=True, contains="v3",
        )
        self.step(
            "configmap DELETE",
            f"DELETE FROM k8s.core.config_maps WHERE namespace = '{ns}' AND name = 'smoke-cm' AND {where}",
        )

        if not self.args.skip_deployment:
            deploy_body = json.dumps({
                "metadata": {"name": "smoke-web", "labels": {"app": "smoke-web"}},
                "spec": {
                    "replicas": 1,
                    "selector": {"matchLabels": {"app": "smoke-web"}},
                    "template": {
                        "metadata": {"labels": {"app": "smoke-web"}},
                        "spec": {"containers": [{"name": "web", "image": "nginx:1.27-alpine"}]},
                    },
                },
            })
            self.step(
                "deployment INSERT",
                f"INSERT INTO k8s.apps.deployments(namespace, protocol, cluster_addr, metadata, spec) "
                f"SELECT '{ns}', {cols}, "
                f"'{json.dumps(json.loads(deploy_body)['metadata'])}', "
                f"'{json.dumps(json.loads(deploy_body)['spec'])}'",
            )
            self.wait_for(
                "deployment ready",
                f"SELECT json_extract(status, '$.readyReplicas') AS ready FROM k8s.apps.deployments "
                f"WHERE namespace = '{ns}' AND name = 'smoke-web' AND {where}",
                lambda rows: rows and str(rows[0].get("ready")) == "1",
            )
            self.step(
                "deployment scale UPDATE (subresource)",
                f"UPDATE k8s.apps.deployments_scale SET spec = '{{\"replicas\": 2}}' "
                f"WHERE namespace = '{ns}' AND name = 'smoke-web' AND {where}",
            )
            self.wait_for(
                "scaled to 2",
                f"SELECT json_extract(spec, '$.replicas') AS replicas FROM k8s.apps.deployments_scale "
                f"WHERE namespace = '{ns}' AND name = 'smoke-web' AND {where}",
                lambda rows: rows and str(rows[0].get("replicas")) == "2",
            )
            self.step(
                "pods running in smoke namespace",
                f"SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.pods "
                f"WHERE namespace = '{ns}' AND {where}",
                expect_rows=True, contains="smoke-web",
            )
            # pods_log: text response transformed to one row per line
            pod_rows, pod_err = self.q(
                f"SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.pods "
                f"WHERE namespace = '{ns}' AND {where}"
            )
            if not pod_err and pod_rows:
                pod_name = pod_rows[0].get("name")
                self.wait_for(
                    "pods_log SELECT (line per row)",
                    f"SELECT log FROM k8s.core.pods_log "
                    f"WHERE namespace = '{ns}' AND name = '{pod_name}' AND {where}",
                    lambda rows: bool(rows),
                    timeout=60, interval=5,
                )
            else:
                self.results.append(("pods_log SELECT (line per row)", "FAIL", "no pod name to query"))
            self.step(
                "deployment DELETE",
                f"DELETE FROM k8s.apps.deployments WHERE namespace = '{ns}' AND name = 'smoke-web' AND {where}",
            )

        self.step(
            "namespace DELETE",
            f"DELETE FROM k8s.core.namespaces WHERE name = '{ns}' AND {where}",
        )
        self.wait_for(
            "namespace gone",
            f"SELECT json_extract(metadata, '$.name') AS name FROM k8s.core.namespaces WHERE {self.where}",
            lambda rows: all(r.get("name") != self.ns for r in rows),
        )

    # ---------------------------------------------------------------- summary
    def summary(self) -> int:
        print("\n== summary ==")
        counts = {"PASS": 0, "FAIL": 0, "XFAIL": 0}
        for name, status, note in self.results:
            counts[status] = counts.get(status, 0) + 1
            if status != "PASS":
                print(f"  {status:5s} {name}  [{note[:110]}]")
        print(f"  {counts['PASS']} passed, {counts['FAIL']} failed, {counts['XFAIL']} xfailed (registry: {self.args.registry})")
        return 1 if counts["FAIL"] else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="k8s provider smoke test")
    ap.add_argument("--registry", choices=["local", "public"], default="local",
                    help="local = provider-dev/openapi file registry (default); public = default stackql registry")
    ap.add_argument("--cluster-addr", default="localhost:8001",
                    help="host:port of the API server endpoint (default: localhost:8001, i.e. kubectl proxy)")
    ap.add_argument("--protocol", choices=["http", "https"], default="http")
    ap.add_argument("--cleanup-only", action="store_true", help="sweep stackql-smoke-* namespaces and exit")
    ap.add_argument("--skip-deployment", action="store_true", help="configmap lifecycle only")
    args = ap.parse_args()

    smoke = Smoke(args)
    print(f"k8s smoke test  registry={args.registry}  target={args.protocol}://{args.cluster_addr}  ns={smoke.ns}")
    smoke.cleanup_breadcrumbs()
    if args.cleanup_only:
        return 0
    smoke.read_smokes()
    smoke.lifecycle()
    return smoke.summary()


if __name__ == "__main__":
    sys.exit(main())
