$py = Get-Content graphify-out\.graphify_python -Raw
$py = $py.Trim()
Write-Host "Using python: $py"

# Step 4: Build graph
Write-Host "`n=== graphify.build ==="
& $py -c "
import sys, json
sys.path.insert(0, '.')
from graphify.build import build
result = build(
    extract_path='graphify-out/.graphify_extract.json',
    output_path='graphify-out/graph.json',
    root='.'
)
print(json.dumps(result, indent=2, default=str))
"
