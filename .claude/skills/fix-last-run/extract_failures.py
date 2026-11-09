#!/usr/bin/env python3
"""Extract failed tests from the Playwright HTML report of the CI run.

The HTML report embeds its data as a base64 zip; this unpacks it and prints
failed tests grouped by error signature (same locator / same first error
line), so one representative test per group can be checked.

Usage:
  extract_failures.py [REPORT_URL] [OUT_DIR]
Defaults:
  REPORT_URL = CI_REPORT_URL from env / .env
  OUT_DIR    = <system temp dir>/ci-report
Writes OUT_DIR/failed.json (full details incl. attachment URLs) and
OUT_DIR/per_spec.json (per spec file: tests run / skipped / failed / flaky,
chromium only so each test counts once - used by /release-test-audit).
"""
import base64
import collections
import datetime
import glob
import io
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.request
import zipfile


def default_report_url() -> str:
    """CI_REPORT_URL from the env or .env."""
    if os.environ.get("CI_REPORT_URL"):
        return os.environ["CI_REPORT_URL"]
    if os.path.exists(".env"):
        for line in open(".env", encoding="utf-8"):
            m = re.match(r"\s*CI_REPORT_URL\s*[=:]\s*[\"']?([^\"'\s]+)", line)
            if m:
                return m.group(1)
    sys.exit("Set CI_REPORT_URL in .env (the e2e report index.html URL) or pass it as an argument")


URL = (len(sys.argv) > 1 and sys.argv[1]) or default_report_url()
OUT = (len(sys.argv) > 2 and sys.argv[2]) or os.path.join(tempfile.gettempdir(), "ci-report")
BASE = URL.rsplit("/", 1)[0]
ANSI = re.compile(r"\x1b\[[0-9;]*m")

os.makedirs(OUT, exist_ok=True)
html = urllib.request.urlopen(URL, timeout=120).read().decode("utf-8")
m = re.search(r"data:application/zip;base64,([A-Za-z0-9+/=]+)", html)
if not m:
    sys.exit("No embedded report data found in " + URL)
# Start clean: files of a previous (bigger) report would mix into this one.
shutil.rmtree(os.path.join(OUT, "z"), ignore_errors=True)
zipfile.ZipFile(io.BytesIO(base64.b64decode(m.group(1)))).extractall(os.path.join(OUT, "z"))

report = json.load(open(os.path.join(OUT, "z", "report.json")))
start = datetime.datetime.fromtimestamp(report["startTime"] / 1000, datetime.timezone.utc)
print(f"Run started: {start:%Y-%m-%d %H:%M} UTC  stats: {report.get('stats')}\n")


def signature(err: str) -> str:
    loc = re.search(r"waiting for (.+)", err)
    if loc:
        return loc.group(1).strip()[:160]
    exp = re.search(r"Expected[^:]*:\s*(.+)", err)
    first = err.strip().split("\n")[0][:120]
    return first + (f" | expected {exp.group(1)[:80]}" if exp else "")


failed = []
per_spec = collections.defaultdict(collections.Counter)
for f in glob.glob(os.path.join(OUT, "z", "*.json")):
    if f.endswith("report.json"):
        continue
    d = json.load(open(f))
    for t in d.get("tests", []):
        if t.get("projectName") in (None, "chromium"):
            c = per_spec[d["fileName"]]
            c["skipped" if t["outcome"] == "skipped" else "run"] += 1
            if t["outcome"] in ("unexpected", "flaky"):
                c["failed" if t["outcome"] == "unexpected" else "flaky"] += 1
        if t.get("outcome") not in ("unexpected", "flaky"):
            continue
        res = t["results"][0]
        err = ANSI.sub("", "\n".join(e.get("message", "") for e in res.get("errors", [])))
        atts = [
            {"name": a.get("name"), "url": f"{BASE}/{a['path']}"}
            for r in t["results"]
            for a in r.get("attachments", [])
            if a.get("path")
        ]
        failed.append({
            "file": d["fileName"],
            "title": " > ".join(t.get("path", []) + [t["title"]]),
            "project": t.get("projectName"),
            "outcome": t["outcome"],
            "signature": signature(err),
            "error": err[:3000],
            "attachments": atts,
        })

json.dump(failed, open(os.path.join(OUT, "failed.json"), "w"), ensure_ascii=False, indent=1)
json.dump(dict(sorted(per_spec.items())), open(os.path.join(OUT, "per_spec.json"), "w"), indent=1)
print(f"Written: {OUT}/failed.json, {OUT}/per_spec.json\n")

groups = collections.defaultdict(list)
for x in failed:
    if x["outcome"] == "unexpected":
        groups[x["signature"]].append(x)

print(f"Failed (unexpected): {sum(len(v) for v in groups.values())}, groups: {len(groups)}")
print(f"Flaky: {sum(1 for x in failed if x['outcome'] == 'flaky')}\n")
for sig, items in sorted(groups.items(), key=lambda kv: -len(kv[1])):
    tests = sorted({(i["file"], i["title"]) for i in items})
    projects = sorted({i["project"] for i in items})
    print(f"### [{len(tests)} tests, {'/'.join(projects)}] {sig}")
    for file, title in tests:
        print(f"    {file} :: {title}")
    print()
