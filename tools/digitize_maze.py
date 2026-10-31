"""Digitize maze walls from maze-source.png, ignoring red/pink annotations."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(__file__).with_name("maze-source.png")
OUT_DIR = ROOT / "tools"

# Measured from strong border lines in the source image
TOP = 24
LEFT = 23
CELL = 27
ROWS = 29  # (807 - 24) / 27
COLS = 35  # (968 - 23) / 27
WALL_THRESH = 0.22


def main() -> None:
    im = Image.open(SRC).convert("RGB")
    arr = np.array(im)
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    is_reddish = (r > 140) & (r > g + 30) & (r > b + 30)
    lum = (r + g + b) / 3.0
    # Dark ink only; annotations ignored so corridor paint never counts as a wall
    is_wall = (lum < 100) & (~is_reddish)

    row_lines = [TOP + i * CELL for i in range(ROWS + 1)]
    col_lines = [LEFT + i * CELL for i in range(COLS + 1)]
    print("grid", ROWS, "x", COLS, "lines", row_lines[0], row_lines[-1], col_lines[0], col_lines[-1])

    def edge_wall(y0: int, y1: int, x0: int, x1: int) -> bool:
        """True if the sampled strip looks like a wall segment."""
        yy0, yy1 = sorted((max(0, y0), min(arr.shape[0], y1)))
        xx0, xx1 = sorted((max(0, x0), min(arr.shape[1], x1)))
        band = is_wall[yy0:yy1, xx0:xx1]
        if band.size == 0:
            return True
        return float(band.mean()) >= WALL_THRESH

    # Build wall matrix: H[r][c] = wall between (r-1,c) and (r,c)  (ROWS+1 x COLS)
    # V[r][c] = wall between (r,c-1) and (r,c)  (ROWS x COLS+1)
    H = [[False for _ in range(COLS)] for _ in range(ROWS + 1)]
    V = [[False for _ in range(COLS + 1)] for _ in range(ROWS)]

    inset = 6  # stay away from corners where walls meet

    for ri in range(ROWS + 1):
        y = row_lines[ri]
        for ci in range(COLS):
            x_a = col_lines[ci] + inset
            x_b = col_lines[ci + 1] - inset
            H[ri][ci] = edge_wall(y - 1, y + 3, x_a, x_b)

    for ri in range(ROWS):
        y_a = row_lines[ri] + inset
        y_b = row_lines[ri + 1] - inset
        for ci in range(COLS + 1):
            x = col_lines[ci]
            V[ri][ci] = edge_wall(y_a, y_b, x - 1, x + 3)

    # Force outer border closed, then reopen entrance/exit from image gaps
    for ci in range(COLS):
        H[0][ci] = True
        H[ROWS][ci] = True
    for ri in range(ROWS):
        V[ri][0] = True
        V[ri][COLS] = True

    # Detect openings on left/right outer edges by low wall density in cell mid-band
    left_open = []
    right_open = []
    for ri in range(ROWS):
        y_a = row_lines[ri] + inset
        y_b = row_lines[ri + 1] - inset
        left_score = float(is_wall[y_a:y_b, LEFT - 1 : LEFT + 3].mean())
        right_score = float(is_wall[y_a:y_b, col_lines[-1] - 1 : col_lines[-1] + 3].mean())
        left_open.append((ri, left_score))
        right_open.append((ri, right_score))

    entrance_row = min(left_open, key=lambda t: t[1])[0]
    exit_row = min(right_open, key=lambda t: t[1])[0]
    print(
        "left scores top5",
        sorted(left_open, key=lambda t: t[1])[:5],
        "right scores top5",
        sorted(right_open, key=lambda t: t[1])[:5],
    )

    # Prefer top-left entrance / bottom-right exit if scores are close
    if left_open[0][1] < 0.35:
        entrance_row = 0
    # Exit: choose lowest score among bottom half
    bottom_half = [t for t in right_open if t[0] >= ROWS // 2]
    exit_row = min(bottom_half, key=lambda t: t[1])[0]
    # If all bottom scores high, fall back to global min among lower 2/3
    if min(bottom_half, key=lambda t: t[1])[1] > 0.4:
        lower = [t for t in right_open if t[0] >= ROWS // 3]
        exit_row = min(lower, key=lambda t: t[1])[0]

    V[entrance_row][0] = False
    V[exit_row][COLS] = False
    print("entrance", (entrance_row, 0), "exit", (exit_row, COLS - 1))

    # Convert to cell wall objects matching riddle3.js
    maze = []
    for ri in range(ROWS):
        row = []
        for ci in range(COLS):
            row.append(
                {
                    "top": H[ri][ci],
                    "bottom": H[ri + 1][ci],
                    "left": V[ri][ci],
                    "right": V[ri][ci + 1],
                }
            )
        maze.append(row)

    # BFS connectivity
    start = (entrance_row, 0)
    goal = (exit_row, COLS - 1)
    q = deque([start])
    seen = {start}
    parent = {start: None}
    while q:
        r0, c0 = q.popleft()
        walls = maze[r0][c0]
        for nr, nc, blocked in (
            (r0 - 1, c0, walls["top"]),
            (r0 + 1, c0, walls["bottom"]),
            (r0, c0 - 1, walls["left"]),
            (r0, c0 + 1, walls["right"]),
        ):
            if blocked or not (0 <= nr < ROWS and 0 <= nc < COLS):
                continue
            if (nr, nc) in seen:
                continue
            seen.add((nr, nc))
            parent[(nr, nc)] = (r0, c0)
            q.append((nr, nc))

    openings = 0
    for ri in range(ROWS):
        for ci in range(COLS):
            if not maze[ri][ci]["right"] and ci + 1 < COLS:
                openings += 1
            if not maze[ri][ci]["bottom"] and ri + 1 < ROWS:
                openings += 1

    print(
        "reachable",
        len(seen),
        "of",
        ROWS * COLS,
        "goal",
        goal in seen,
        "internal openings",
        openings,
        "tree target",
        ROWS * COLS - 1,
    )

    # Debug drawing
    debug = Image.new("RGB", (arr.shape[1], arr.shape[0]), "white")
    draw = ImageDraw.Draw(debug)
    for ri in range(ROWS):
        for ci in range(COLS):
            x_a, x_b = col_lines[ci], col_lines[ci + 1]
            y_a, y_b = row_lines[ri], row_lines[ri + 1]
            w = maze[ri][ci]
            if w["top"]:
                draw.line([(x_a, y_a), (x_b, y_a)], fill=(0, 0, 0), width=2)
            if w["bottom"]:
                draw.line([(x_a, y_b), (x_b, y_b)], fill=(0, 0, 0), width=2)
            if w["left"]:
                draw.line([(x_a, y_a), (x_a, y_b)], fill=(0, 0, 0), width=2)
            if w["right"]:
                draw.line([(x_b, y_a), (x_b, y_b)], fill=(0, 0, 0), width=2)

    if goal in seen:
        path = []
        cur = goal
        while cur is not None:
            path.append(cur)
            cur = parent[cur]
        path.reverse()
        pts = [
            (
                (col_lines[c] + col_lines[c + 1]) // 2,
                (row_lines[r] + row_lines[r + 1]) // 2,
            )
            for r, c in path
        ]
        if len(pts) > 1:
            draw.line(pts, fill=(255, 0, 0), width=2)
        print("path length", len(path))

    # Mark unreachable cells in blue
    for ri in range(ROWS):
        for ci in range(COLS):
            if (ri, ci) not in seen:
                cx = (col_lines[ci] + col_lines[ci + 1]) // 2
                cy = (row_lines[ri] + row_lines[ri + 1]) // 2
                draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(0, 100, 255))

    debug.save(OUT_DIR / "maze-reconstructed.png")

    # Side-by-side comparison crop
    mask = np.full(arr.shape, 255, dtype=np.uint8)
    mask[is_wall] = 0
    mask[is_reddish] = [255, 80, 80]
    Image.fromarray(mask).save(OUT_DIR / "maze-mask-debug.png")

    payload = {
        "rows": ROWS,
        "cols": COLS,
        "entrance": [entrance_row, 0],
        "exit": [exit_row, COLS - 1],
        "cells": maze,
        "reachable": len(seen),
        "goal_reachable": goal in seen,
        "internal_openings": openings,
    }
    (OUT_DIR / "maze-layout.json").write_text(json.dumps(payload), encoding="utf-8")
    print("wrote maze-layout.json")


if __name__ == "__main__":
    main()
