"""
Step 3B: Merge all semantic chunk JSONs into .graphify_semantic.json
"""
import glob, json, sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

chunks = sorted(glob.glob('graphify-out/.graphify_chunk_*.json'))
print(f"Merging {len(chunks)} chunks...")

all_nodes = []
all_edges = []
all_hyperedges = []
total_input_tokens = 0
total_output_tokens = 0

seen_node_ids = {}
seen_edge_keys = set()

for chunk_path in chunks:
    data = json.loads(Path(chunk_path).read_text(encoding='utf-8'))
    
    # Merge nodes (deduplicate by ID, keep first occurrence)
    for node in data.get('nodes', []):
        nid = node['id']
        if nid not in seen_node_ids:
            seen_node_ids[nid] = True
            all_nodes.append(node)
    
    # Merge edges (deduplicate by source+target+relation)
    for edge in data.get('edges', []):
        key = (edge['source'], edge['target'], edge['relation'])
        if key not in seen_edge_keys:
            seen_edge_keys.add(key)
            all_edges.append(edge)
    
    # Merge hyperedges
    all_hyperedges.extend(data.get('hyperedges', []))
    
    total_input_tokens += data.get('input_tokens', 0)
    total_output_tokens += data.get('output_tokens', 0)

result = {
    "nodes": all_nodes,
    "edges": all_edges,
    "hyperedges": all_hyperedges,
    "input_tokens": total_input_tokens,
    "output_tokens": total_output_tokens
}

out_path = Path('graphify-out/.graphify_semantic.json')
out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')

print(f"Done! Merged semantic graph:")
print(f"  Nodes:       {len(all_nodes)}")
print(f"  Edges:       {len(all_edges)}")
print(f"  Hyperedges:  {len(all_hyperedges)}")
print(f"  Output:      {out_path}")
print(f"  File size:   {out_path.stat().st_size:,} bytes")
