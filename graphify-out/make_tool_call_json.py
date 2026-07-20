import json
from pathlib import Path

with open('graphify-out/subagent_prompts.json', 'r', encoding='utf-8') as f:
    prompts = json.load(f)

subagents_list = []
for p in prompts:
    subagents_list.append({
        "TypeName": "self",
        "Role": f"Semantic Extractor Chunk {p['chunk_num']}",
        "Prompt": p['prompt']
    })

tool_call = {
    "Subagents": subagents_list
}

with open('graphify-out/tool_call_subagents.json', 'w', encoding='utf-8') as f:
    json.dump(tool_call, f, ensure_ascii=False, indent=2)

print("Generated tool_call_subagents.json")
