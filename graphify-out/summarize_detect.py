import json
from pathlib import Path

detect_path = Path('graphify-out/.graphify_detect.json')
if not detect_path.exists():
    print("Detect file not found.")
    exit(1)

with open(detect_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

total_files = data.get('total_files', 0)
total_words = data.get('total_words', 0)

print(f"Corpus: {total_files} files · ~{total_words:,} words")

files_dict = data.get('files', {})
for category, files in files_dict.items():
    if not files:
        continue
    # Gather extensions
    exts = sorted(list(set(Path(f).suffix for f in files if Path(f).suffix)))
    exts_str = " ".join(exts)
    if exts_str:
        print(f"  {category}:     {len(files)} files ({exts_str})")
    else:
        print(f"  {category}:     {len(files)} files")
