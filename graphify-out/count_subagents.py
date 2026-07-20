import json
with open('graphify-out/tool_call_subagents.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f"Number of subagents: {len(data['Subagents'])}")
for idx, s in enumerate(data['Subagents']):
    print(f"Subagent {idx+1}: {s['Role']} (Prompt len={len(s['Prompt'])})")
