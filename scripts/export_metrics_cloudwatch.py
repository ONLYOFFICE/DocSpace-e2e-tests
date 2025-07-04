import xml.etree.ElementTree as ET
import subprocess
import re
import unicodedata
import sys

def clean_name(name):
    # Преобразуем в ASCII, удаляя всё не-ASCII
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    # Заменяем все неразрешённые символы на _
    return re.sub(r"[^a-zA-Z0-9_.-]", "_", name)

if len(sys.argv) != 2:
    print(f"Usage: {sys.argv[0]} <path-to-xml>")
    sys.exit(1)

xml_path = sys.argv[1]

tree = ET.parse(xml_path)
root = tree.getroot()

for testcase in root.iter("testcase"):
    name = testcase.attrib.get("name", "unknown")
    clean_test_name = clean_name(name)
    time = float(testcase.attrib.get("time", 0))
    status = "passed"
    if testcase.find("failure") is not None or testcase.find("error") is not None:
        status = "failed"
    print(f"{name} ({clean_test_name}) {status} {time}")

    metric_name = status.capitalize()
    # Отправляем Passed/Failed
    subprocess.run(
        [
            "aws",
            "cloudwatch",
            "put-metric-data",
            "--region",
            "us-east-1",
            "--namespace",
            "DocspaceIO/Autotests",
            "--metric-name",
            metric_name,
            "--value",
            "1",
            "--unit",
            "Count",
            "--dimensions",
            f"TestName={clean_test_name}",
        ],
        check=True,
    )
    # Отправляем Duration
    subprocess.run(
        [
            "aws",
            "cloudwatch",
            "put-metric-data",
            "--region",
            "us-east-1",
            "--namespace",
            "DocspaceIO/Autotests",
            "--metric-name",
            "Duration",
            "--value",
            str(time),
            "--unit",
            "Seconds",
            "--dimensions",
            f"TestName={clean_test_name}",
        ],
        check=True,
    )
