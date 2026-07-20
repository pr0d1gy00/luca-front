import json
from graphify.cache import check_semantic_cache
from pathlib import Path

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8"))
all_files = [f for cat in ('document', 'paper', 'image') for f in detect['files'].get(cat, [])]

# root is .
cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(all_files, root='.')

# Always (re)write the cache file
cache_json_path = Path('graphify-out/.graphify_cached.json')
if cached_nodes or cached_edges or cached_hyperedges:
    cache_json_path.write_text(json.dumps({'nodes': cached_nodes, 'edges': cached_edges, 'hyperedges': cached_hyperedges}, ensure_ascii=False), encoding="utf-8")
else:
    if cache_json_path.exists():
        cache_json_path.unlink()

Path('graphify-out/.graphify_uncached.txt').write_text('\n'.join(uncached), encoding="utf-8")
print(f'Cache: {len(all_files)-len(uncached)} files hit, {len(uncached)} files need extraction')
