import json
from pathlib import Path
from collections import defaultdict
import math

uncached_path = Path('graphify-out/.graphify_uncached.txt')
if not uncached_path.exists():
    print("Uncached files list not found.")
    exit(1)

files = [line.strip() for line in uncached_path.read_text(encoding="utf-8").splitlines() if line.strip()]

# Group by directory
dir_groups = defaultdict(list)
images = []
for f in files:
    p = Path(f)
    if p.suffix.lower() in ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']:
        images.append(f)
    else:
        dir_groups[str(p.parent)].append(f)

# Build chunks of 20-22 files
chunks = []
current_chunk = []

for folder, folder_files in dir_groups.items():
    for f in folder_files:
        current_chunk.append(f)
        if len(current_chunk) >= 22:
            chunks.append(current_chunk)
            current_chunk = []

if current_chunk:
    chunks.append(current_chunk)

# Each image gets its own chunk as per rules: "Each image gets its own chunk (vision needs separate context)"
for img in images:
    chunks.append([img])

# Write chunks to a JSON file
with open('graphify-out/.chunks.json', 'w', encoding='utf-8') as f:
    json.dump(chunks, f, ensure_ascii=False, indent=2)

print(f"Split {len(files)} files into {len(chunks)} chunks.")
