import json
from pathlib import Path

with open('graphify-out/subagent_prompts.json', 'r', encoding='utf-8') as f:
    prompts = json.load(f)

print(f"Total prompts: {len(prompts)}")
for p in prompts[:3]:
    print(f"Chunk {p['chunk_num']}: path={p['chunk_path']}")
    print(f"Files: {p['files']}")
    print("---")
