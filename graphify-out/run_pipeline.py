"""
Step 4: Run graphify build pipeline
"""
import sys, json, subprocess
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

py = Path('graphify-out/.graphify_python').read_text().strip()
print(f"Python: {py}\n")

# Run graphify CLI commands
steps = [
    ("build", [py, "-m", "graphify", "build",
               "--extract", "graphify-out/.graphify_extract.json",
               "--output", "graphify-out/graph.json",
               "--root", "."]),
    ("cluster", [py, "-m", "graphify", "cluster",
                 "--graph", "graphify-out/graph.json",
                 "--output", "graphify-out/graph.json"]),
    ("analyze", [py, "-m", "graphify", "analyze",
                 "--graph", "graphify-out/graph.json",
                 "--output", "graphify-out/graph.json"]),
    ("report", [py, "-m", "graphify", "report",
                "--graph", "graphify-out/graph.json",
                "--output", "graphify-out/GRAPH_REPORT.md"]),
]

for name, cmd in steps:
    print(f"=== {name} ===")
    result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr[:2000])
    if result.returncode != 0:
        print(f"ERROR: exit code {result.returncode}")
        sys.exit(1)
    print(f"  Done.\n")

print("All steps complete!")
