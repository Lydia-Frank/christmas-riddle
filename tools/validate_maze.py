"""Validate fixed maze encoding: connectivity + overlay vs source."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ENC = Path(__file__).with_name("maze-encoding.txt")
SRC = ROOT / "maze-source.png"

TOP, LEFT, CELL = 24, 23, 27


def load_encoding():
    lines = ENC.read_text(encoding="utf-8").strip().splitlines()
    meta = {}
    rows = []
    for line in lines:
        if "=" in line and not line[0].isalnum():
            continue
        if line.startswith("entrance="):
            meta["entrance"] = eval(line.split("=", 1)[1])
        elif line.startswith("exit="):
            meta["exit"] = eval(line.split("=", 1)[1])
        elif line.startswith("rows="):
            meta["rows"] = int(line.split("=", 1)[1])
        elif line.startswith("cols="):
            meta["cols"] = int(line.split("=", 1)[1])
        else:
            rows.append(line)
    return meta, rows


def walls(mask: int):
    return {
        "top": bool(mask & 1),
        "right": bool(mask & 2),
        "bottom": bool(mask & 4),
        "left": bool(mask & 8),
    }


def main() -> None:
    meta, rows = load_encoding()
    R, C = meta["rows"], meta["cols"]
    assert len(rows) == R
    assert all(len(r) == C for r in rows)

    maze = [[walls(int(rows[r][c], 16)) for c in range(C)] for r in range(R)]
    start = tuple(meta["entrance"])
    goal = tuple(meta["exit"])

    q = deque([start])
    seen = {start}
    parent = {start: None}
    while q:
        r0, c0 = q.popleft()
        w = maze[r0][c0]
        for nr, nc, blocked in (
            (r0 - 1, c0, w["top"]),
            (r0 + 1, c0, w["bottom"]),
            (r0, c0 - 1, w["left"]),
            (r0, c0 + 1, w["right"]),
        ):
            if blocked or not (0 <= nr < R and 0 <= nc < C) or (nr, nc) in seen:
                continue
            # consistency with neighbor facing wall
            if nr == r0 - 1 and maze[nr][nc]["bottom"]:
                continue
            if nr == r0 + 1 and maze[nr][nc]["top"]:
                continue
            if nc == c0 - 1 and maze[nr][nc]["right"]:
                continue
            if nc == c0 + 1 and maze[nr][nc]["left"]:
                continue
            seen.add((nr, nc))
            parent[(nr, nc)] = (r0, c0)
            q.append((nr, nc))

    print("reachable", len(seen), "/", R * C, "goal", goal in seen)
    assert goal in seen, "exit not reachable"
    assert len(seen) == R * C, "maze has unreachable cells"

    # mutual wall consistency
    bad = 0
    for r in range(R):
        for c in range(C):
            if c + 1 < C and maze[r][c]["right"] != maze[r][c + 1]["left"]:
                bad += 1
            if r + 1 < R and maze[r][c]["bottom"] != maze[r + 1][c]["top"]:
                bad += 1
    print("asymmetric shared walls", bad)

    # overlay difference map
    src = np.array(Image.open(SRC).convert("RGB"))
    r, g, b = src[:, :, 0].astype(int), src[:, :, 1].astype(int), src[:, :, 2].astype(int)
    is_red = (r > 140) & (r > g + 30) & (r > b + 30)
    lum = (r + g + b) / 3
    src_wall = (lum < 100) & (~is_red)

    canvas = Image.new("RGB", (src.shape[1], src.shape[0]), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    for ri in range(R):
        for ci in range(C):
            x0, x1 = LEFT + ci * CELL, LEFT + (ci + 1) * CELL
            y0, y1 = TOP + ri * CELL, TOP + (ri + 1) * CELL
            w = maze[ri][ci]
            if w["top"]:
                draw.line([(x0, y0), (x1, y0)], fill=(0, 0, 0), width=2)
            if w["bottom"]:
                draw.line([(x0, y1), (x1, y1)], fill=(0, 0, 0), width=2)
            if w["left"]:
                draw.line([(x0, y0), (x0, y1)], fill=(0, 0, 0), width=2)
            if w["right"]:
                draw.line([(x1, y0), (x1, y1)], fill=(0, 0, 0), width=2)

    dig = np.array(canvas)
    dig_wall = dig[:, :, 0] < 128

    # compare interior only
    y0, y1 = TOP, TOP + R * CELL
    x0, x1 = LEFT, LEFT + C * CELL
    src_i = src_wall[y0:y1, x0:x1]
    dig_i = dig_wall[y0:y1, x0:x1]
    # dilate both slightly for fair compare
    from numpy.lib.stride_tricks import sliding_window_view

    def dilate(m):
        pad = np.pad(m, 1, constant_values=False)
        windows = sliding_window_view(pad, (3, 3))
        return windows.any(axis=(-1, -2))

    src_d = dilate(src_i)
    dig_d = dilate(dig_i)
    missing = src_i & ~dig_d  # source wall not in digitized
    extra = dig_i & ~src_d  # digitized wall not in source
    print(
        "wall pixel mismatch (approx)",
        "missing",
        int(missing.mean() * 1000) / 10,
        "%",
        "extra",
        int(extra.mean() * 1000) / 10,
        "%",
    )

    overlay = np.zeros((y1 - y0, x1 - x0, 3), dtype=np.uint8)
    overlay[:] = 255
    overlay[src_i] = [0, 0, 0]
    overlay[missing] = [255, 0, 0]  # missed walls
    overlay[extra] = [0, 0, 255]  # false walls
    Image.fromarray(overlay).save(Path(__file__).with_name("maze-diff.png"))
    print("wrote maze-diff.png (red=missed, blue=extra)")


if __name__ == "__main__":
    main()
