import json
from pathlib import Path

detect_path = Path('graphify-out/.graphify_detect.json')
if not detect_path.exists():
    print("Detect file not found.")
    exit(1)

with open(detect_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter out files in .agents, .next, .git, etc.
def is_ignored(filepath):
    p = Path(filepath).resolve()
    for part in p.parts:
        if part.startswith('.') and part not in ['.', '..']:
            # Allow some files if they are not .agents or .next
            if part in ['.agents', '.next', '.git', '.husky', '.ruff_cache', '.pi', '.gemini']:
                return True
    return False

filtered_files = {}
total_files = 0
for category, files in data.get('files', {}).items():
    filtered_list = [f for f in files if not is_ignored(f)]
    filtered_files[category] = filtered_list
    total_files += len(filtered_list)

data['files'] = filtered_files
data['total_files'] = total_files

# Re-estimate words (very roughly, or just set it to the sum of files' words, but let's keep it simple)
# We can recalculate word counts if needed, but keeping total_words is fine or we can estimate ~1000 words per file
# Let's just write back the filtered json
with open(detect_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Filtered files. New total: {total_files}")
