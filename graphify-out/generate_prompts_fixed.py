import json
from pathlib import Path

# Load template
spec_path = Path('C:/Users/mendo/.gemini/config/skills/graphify/references/extraction-spec.md')
lines = spec_path.read_text(encoding="utf-8").splitlines()
prompt_start = -1
for i, line in enumerate(lines):
    if line.strip().startswith('```') and i > 2:
        prompt_start = i + 1
        break

template_lines = []
for line in lines[prompt_start:]:
    if line.strip().startswith('```'):
        break
    template_lines.append(line)

template = "\n".join(template_lines)

# Load chunks
chunks_path = Path('graphify-out/.chunks.json')
with open(chunks_path, 'r', encoding='utf-8') as f:
    chunks = json.load(f)

project_root = str(Path('.').resolve())

prompts = []
for idx, chunk in enumerate(chunks):
    chunk_num = idx + 1
    total_chunks = len(chunks)
    
    file_list = "\n".join(chunk)
    chunk_filename = f".graphify_chunk_{chunk_num:02d}.json"
    chunk_path = str(Path(project_root) / "graphify-out" / chunk_filename)
    
    # Replace ONLY '\nFILE_LIST\n' to avoid matching '<FILE_LIST path verbatim>'
    prompt = template.replace('CHUNK_NUM', str(chunk_num))
    prompt = prompt.replace('TOTAL_CHUNKS', str(total_chunks))
    prompt = prompt.replace('\nFILE_LIST\n', f'\n{file_list}\n')
    prompt = prompt.replace('DEEP_MODE', 'False')
    prompt = prompt.replace('CHUNK_PATH', chunk_path)
    
    prompts.append({
        "chunk_num": chunk_num,
        "chunk_path": chunk_path,
        "files": chunk,
        "prompt": prompt
    })

with open('graphify-out/subagent_prompts.json', 'w', encoding='utf-8') as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)

print(f"Generated {len(prompts)} fixed prompts.")
