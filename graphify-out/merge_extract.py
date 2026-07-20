"""
Step 3C: Merge AST extract + semantic extract into .graphify_extract.json
"""
import json, sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ast_path = Path('graphify-out/.graphify_ast.json')
sem_path = Path('graphify-out/.graphify_semantic.json')

ast_data = json.loads(ast_path.read_text(encoding='utf-8'))
sem_data = json.loads(sem_path.read_text(encoding='utf-8'))

print(f"AST:      nodes={len(ast_data.get('nodes',[]))}, edges={len(ast_data.get('edges',[]))}")
print(f"Semantic: nodes={len(sem_data.get('nodes',[]))}, edges={len(sem_data.get('edges',[]))}, hyperedges={len(sem_data.get('hyperedges',[]))}")

# Merge: nodes and edges from both, dedup by id/key
seen_node_ids = set()
merged_nodes = []
seen_edge_keys = set()
merged_edges = []

for node in ast_data.get('nodes', []) + sem_data.get('nodes', []):
    nid = node['id']
    if nid not in seen_node_ids:
        seen_node_ids.add(nid)
        merged_nodes.append(node)

for edge in ast_data.get('edges', []) + sem_data.get('edges', []):
    key = (edge['source'], edge['target'], edge['relation'])
    if key not in seen_edge_keys:
        seen_edge_keys.add(key)
        merged_edges.append(edge)

merged_hyperedges = sem_data.get('hyperedges', [])

result = {
    "nodes": merged_nodes,
    "edges": merged_edges,
    "hyperedges": merged_hyperedges,
    "input_tokens": sem_data.get('input_tokens', 0),
    "output_tokens": sem_data.get('output_tokens', 0)
}

out_path = Path('graphify-out/.graphify_extract.json')
out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')

print(f"\nMerged extract:")
print(f"  Nodes:       {len(merged_nodes)}")
print(f"  Edges:       {len(merged_edges)}")
print(f"  Hyperedges:  {len(merged_hyperedges)}")
print(f"  Output:      {out_path}")
print(f"  File size:   {out_path.stat().st_size:,} bytes")
