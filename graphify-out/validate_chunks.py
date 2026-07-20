import glob, json, sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

chunks = sorted(glob.glob('graphify-out/.graphify_chunk_*.json'))
print(f"Found {len(chunks)} chunk files on disk:\n")
for c in chunks:
    p = Path(c)
    size = p.stat().st_size
    try:
        data = json.loads(p.read_text(encoding='utf-8'))
        nodes = len(data.get('nodes', []))
        edges = len(data.get('edges', []))
        print(f"  {p.name:30s}  {size:8d} bytes  nodes={nodes:4d}  edges={edges:4d}  OK")
    except Exception as e:
        print(f"  {p.name:30s}  {size:8d} bytes  INVALID: {e}")

present = {int(Path(c).stem.split('_')[-1]) for c in chunks}
expected = set(range(1, 19))
missing = sorted(expected - present)
print(f"\nMissing chunks: {missing}")
