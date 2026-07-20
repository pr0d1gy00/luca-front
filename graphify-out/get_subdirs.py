import json
from pathlib import Path
from collections import Counter

detect_path = Path('graphify-out/.graphify_detect.json')
with open(detect_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# scan_root is an absolute path to the resolved INPUT_PATH
# Let's find scan_root. If it's not present, let's use the current dir absolute path.
scan_root_str = data.get('scan_root')
if not scan_root_str:
    scan_root_str = str(Path('.').resolve())

scan_root = Path(scan_root_str).resolve()
scan_root_str_clean = str(scan_root).lower()

all_files = []
files_dict = data.get('files', {})
for category in ['code', 'document', 'paper', 'image', 'video']:
    for f in files_dict.get(category, []):
        all_files.append(f)

# Filter out any path that starts with scan_root + "/graphify-out/"
graphify_out_prefix = str(scan_root / "graphify-out").lower()

subdirs = []
for f_path_str in all_files:
    f_path = Path(f_path_str).resolve()
    f_path_str_clean = str(f_path).lower()
    if f_path_str_clean.startswith(graphify_out_prefix):
         continue
    
    # Strip scan_root prefix
    try:
         rel = f_path.relative_to(scan_root)
         parts = rel.parts
         if not parts:
             subdirs.append("(root)")
         else:
             subdirs.append(parts[0])
    except ValueError:
         # Fallback if relative_to fails
         subdirs.append("(root)")

counts = Counter(subdirs)
# Show top 5
top_5 = counts.most_common(5)
print(json.dumps(top_5))
