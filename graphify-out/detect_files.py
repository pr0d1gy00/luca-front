import json
from graphify.detect import detect
from pathlib import Path

result = detect(Path('.'))
# Make sure we don't save to graphify-out under raw directory or anything
# detect might return absolute paths, let's write it to .graphify_detect.json
with open('graphify-out/.graphify_detect.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
