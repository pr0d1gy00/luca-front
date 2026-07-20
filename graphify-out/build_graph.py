"""
Step 4: Build graph.json from .graphify_extract.json using graphify Python API
"""
import sys, json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path('C:/Users/mendo/AppData/Roaming/uv/tools/graphifyy/Lib/site-packages')))

from graphify import build, cluster, analyze, report

ROOT = '.'
EXTRACT_PATH = Path('graphify-out/.graphify_extract.json')
GRAPH_PATH = Path('graphify-out/graph.json')

print("Loading extract...")
extraction = json.loads(EXTRACT_PATH.read_text(encoding='utf-8'))
print(f"  {len(extraction['nodes'])} nodes, {len(extraction['edges'])} edges")

print("\nBuilding graph...")
G = build.build_from_json(extraction, root=ROOT)
print(f"  Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

print("\nClustering...")
communities = cluster.cluster(G)
print(f"  {len(communities)} communities detected")

print("\nScoring cohesion...")
cohesion_scores = cluster.score_all(G, communities)

print("\nLabeling communities by hub...")
community_labels = cluster.label_communities_by_hub(G, communities)
print(f"  Labels: {dict(list(community_labels.items())[:5])} ...")

print("\nAnalyzing god nodes...")
god_node_list = analyze.god_nodes(G, top_n=15)
print(f"  {len(god_node_list)} god nodes found")
for gn in god_node_list[:5]:
    print(f"    {gn.get('label','?')} (degree={gn.get('degree',0)})")

print("\nFinding surprising connections...")
surprise_list = analyze.surprising_connections(G)
print(f"  {len(surprise_list)} surprising connections")

print("\nSuggesting questions...")
suggested_questions = analyze.suggest_questions(G, communities, community_labels, top_n=7)

print("\nBuilding detection_result...")
detection_result = {
    "total_files": 434,
    "total_words": 458959,
    "code_files": 317,
    "doc_files": 103,
    "image_files": 13,
    "paper_files": 1,
}

token_cost = {
    "input_tokens": extraction.get("input_tokens", 0),
    "output_tokens": extraction.get("output_tokens", 0),
}

print("\nGenerating report...")
report_md = report.generate(
    G=G,
    communities=communities,
    cohesion_scores=cohesion_scores,
    community_labels=community_labels,
    god_node_list=god_node_list,
    surprise_list=surprise_list,
    detection_result=detection_result,
    token_cost=token_cost,
    root=ROOT,
    suggested_questions=suggested_questions,
)

report_path = Path('graphify-out/GRAPH_REPORT.md')
report_path.write_text(report_md, encoding='utf-8')
print(f"  Report written: {report_path} ({report_path.stat().st_size:,} bytes)")

print("\nSaving graph.json...")
# Serialize graph with community + analysis data
import networkx as nx

nodes_out = []
for node_id, data in G.nodes(data=True):
    nodes_out.append({"id": node_id, **data})

edges_out = []
for u, v, data in G.edges(data=True):
    edges_out.append({"source": u, "target": v, **data})

# Find which community each node belongs to
node_to_community = {}
for cid, members in communities.items():
    for m in members:
        node_to_community[m] = cid

graph_json = {
    "nodes": nodes_out,
    "edges": edges_out,
    "communities": {str(k): v for k, v in communities.items()},
    "community_labels": {str(k): v for k, v in community_labels.items()},
    "cohesion_scores": {str(k): v for k, v in cohesion_scores.items()},
    "god_nodes": god_node_list,
    "surprising_connections": surprise_list,
    "suggested_questions": suggested_questions,
    "detection_result": detection_result,
    "token_cost": token_cost,
    "hyperedges": extraction.get("hyperedges", []),
}

GRAPH_PATH.write_text(json.dumps(graph_json, ensure_ascii=False, indent=2, default=str), encoding='utf-8')
print(f"  graph.json written: {GRAPH_PATH.stat().st_size:,} bytes")

print("\nAll done!")
