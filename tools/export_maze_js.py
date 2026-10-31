import json
from pathlib import Path

data = json.loads(
    Path(__file__).with_name("maze-layout.json").read_text(encoding="utf-8")
)
rows = data["rows"]
cols = data["cols"]
maze = data["cells"]
lines = []
for ri in range(rows):
    chars = []
    for ci in range(cols):
        w = maze[ri][ci]
        mask = (
            (1 if w["top"] else 0)
            | (2 if w["right"] else 0)
            | (4 if w["bottom"] else 0)
            | (8 if w["left"] else 0)
        )
        chars.append(format(mask, "X"))
    lines.append("".join(chars))

out = Path(__file__).with_name("maze-encoding.txt")
text = "\n".join(
    [
        f"entrance={data['entrance']}",
        f"exit={data['exit']}",
        f"rows={rows}",
        f"cols={cols}",
        *lines,
    ]
)
out.write_text(text, encoding="utf-8")
print(out)
print("entrance", data["entrance"], "exit", data["exit"])
