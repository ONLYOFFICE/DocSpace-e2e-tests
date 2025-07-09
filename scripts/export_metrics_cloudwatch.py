import xml.etree.ElementTree as ET
import subprocess
import re
import unicodedata
import sys
import os


def clean_name(name):
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9_.-]", "_", name)


if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <path-to-xml>")
    sys.exit(1)

xml_path = sys.argv[1]

# Определяем SuiteName
tree = ET.parse(xml_path)
root = tree.getroot()

suite_name = root.attrib.get("name")
if not suite_name:
    suite_name = os.path.splitext(os.path.basename(xml_path))[0]
suite_name = clean_name(suite_name)

# Агрегация по Suite
total = 0
passed = 0
failed = 0
skipped = 0
total_duration = 0.0

for testcase in root.iter("testcase"):
    total += 1
    time = float(testcase.attrib.get("time", 0))
    total_duration += time
    if testcase.find("skipped") is not None:
        skipped += 1
    elif testcase.find("failure") is not None or testcase.find("error") is not None:
        failed += 1
    else:
        passed += 1

print(
    f"Suite: {suite_name} | Total: {total}, Passed: {passed}, Failed: {failed}, Skipped: {skipped}, Duration: {total_duration:.2f}"
)


def push_metric(name, value, unit, dimensions):
    cmd = [
        "aws",
        "cloudwatch",
        "put-metric-data",
        "--region",
        "us-east-1",
        "--namespace",
        "DocspaceIO/Autotests",
        "--metric-name",
        name,
        "--value",
        str(value),
        "--unit",
        unit,
        "--dimensions",
        dimensions,
    ]
    subprocess.run(cmd, check=True)


# Пушим агрегированные по Suite метрики
push_metric("Total", total, "Count", f"SuiteName={suite_name}")
push_metric("Passed", passed, "Count", f"SuiteName={suite_name}")
push_metric("Failed", failed, "Count", f"SuiteName={suite_name}")
push_metric("Skipped", skipped, "Count", f"SuiteName={suite_name}")
push_metric("Duration", total_duration, "Seconds", f"SuiteName={suite_name}")

# Пушим метрики по каждому тесту
for testcase in root.iter("testcase"):
    test_name = testcase.attrib.get("name", "unknown")
    test_name_clean = clean_name(test_name)
    time = float(testcase.attrib.get("time", 0))
    if testcase.find("skipped") is not None:
        status = "Skipped"
        passed_val = 0
        failed_val = 0
        skipped_val = 1
    elif testcase.find("failure") is not None or testcase.find("error") is not None:
        status = "Failed"
        passed_val = 0
        failed_val = 1
        skipped_val = 0
    else:
        status = "Passed"
        passed_val = 1
        failed_val = 0
        skipped_val = 0

    dimensions = f"SuiteName={suite_name},TestName={test_name_clean}"
    push_metric("Passed", passed_val, "Count", dimensions)
    push_metric("Failed", failed_val, "Count", dimensions)
    push_metric("Skipped", skipped_val, "Count", dimensions)
    push_metric("Duration", time, "Seconds", dimensions)
    # Для удобства можно вывести лог:
    print(f"{suite_name}/{test_name_clean} - {status} - {time:.2f}s")
