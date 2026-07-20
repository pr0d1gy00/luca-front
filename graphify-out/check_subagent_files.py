import glob
from pathlib import Path

chunks = sorted(glob.glob('graphify-out/.graphify_chunk_*.json'))
print(f"Found {len(chunks)} chunk files on disk:")
for c in chunks:
    print(f"  {Path(c).name}")
