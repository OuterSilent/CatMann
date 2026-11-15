"""Centerline tracing of fine line art into SVG path data.

Input: a grayscale crop (dark lines on white). Output: a silhouette polygon
(used as paper-white fill so the piece hides what is under it) and a list of
open polylines following the middle of each drawn line.
"""
import numpy as np
import cv2
from skimage.morphology import skeletonize

UP = 3  # upscale factor before thresholding: gives a cleaner skeleton


def load_gray(path):
    return cv2.imread(path, cv2.IMREAD_GRAYSCALE)


def binarize(gray, thr=215, up=UP):
    big = cv2.resize(gray, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)
    big = cv2.GaussianBlur(big, (0, 0), 0.8)
    return (big < thr).astype(np.uint8)


def silhouette(lines, close_bottom=True, close_px=7, close_sides=0.0):
    """Filled outline of the drawing: everything the background cannot reach."""
    h, w = lines.shape
    wall = cv2.dilate(lines, np.ones((close_px, close_px), np.uint8))
    if close_bottom:
        wall[h - 2:, :] = 1
    if close_sides:
        y = int(h * (1 - close_sides))
        wall[y:, :2] = 1
        wall[y:, -2:] = 1
    pad = cv2.copyMakeBorder(wall, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
    if close_bottom:
        pad[-1, :] = 1
    ff = pad.copy()
    mask = np.zeros((h + 4, w + 4), np.uint8)
    cv2.floodFill(ff, mask, (0, 0), 2)
    inside = (ff[1:-1, 1:-1] != 2).astype(np.uint8)
    # keep the biggest blob only
    n, lab, stats, _ = cv2.connectedComponentsWithStats(inside)
    if n > 1:
        k = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        inside = (lab == k).astype(np.uint8)
    inside = cv2.erode(inside, np.ones((close_px - 2, close_px - 2), np.uint8))
    return inside


def chains(skel):
    """Walk a 1px skeleton into polylines (lists of (x, y))."""
    sk = skel.astype(bool)
    h, w = sk.shape
    ys, xs = np.nonzero(sk)
    pts = set(zip(xs.tolist(), ys.tolist()))
    nb8 = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]

    def nbrs(p):
        return [(p[0] + dx, p[1] + dy) for dx, dy in nb8 if (p[0] + dx, p[1] + dy) in pts]

    deg = {p: len(nbrs(p)) for p in pts}
    nodes = {p for p in pts if deg[p] != 2}
    used = set()
    out = []

    def walk(a, b):
        path = [a, b]
        used.add((a, b)); used.add((b, a))
        prev, cur = a, b
        while cur not in nodes:
            nxt = [q for q in nbrs(cur) if q != prev]
            # prefer 4-connected continuation to avoid cutting corners twice
            nxt = [q for q in nxt if (cur, q) not in used]
            if not nxt:
                break
            q = nxt[0]
            used.add((cur, q)); used.add((q, cur))
            path.append(q)
            prev, cur = cur, q
        return path

    for n in nodes:
        for q in nbrs(n):
            if (n, q) not in used:
                out.append(walk(n, q))
    # closed loops without nodes
    for p in pts:
        if deg[p] == 2 and all((p, q) not in used for q in nbrs(p)):
            q = nbrs(p)[0]
            nodes.add(p)
            out.append(walk(p, q))
            nodes.discard(p)
    flagged = []
    for path in out:
        free = deg.get(path[0], 0) <= 1 or deg.get(path[-1], 0) <= 1
        flagged.append((path, free))
    return flagged


def rdp(pts, eps):
    pts = np.asarray(pts, float)
    if len(pts) < 3:
        return pts
    keep = np.zeros(len(pts), bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        seg = pts[b] - pts[a]
        L = np.hypot(*seg)
        v = pts[a + 1:b] - pts[a]
        d = np.abs(seg[0] * v[:, 1] - seg[1] * v[:, 0]) / L if L > 0 else np.hypot(v[:, 0], v[:, 1])
        i = int(np.argmax(d))
        if d[i] > eps:
            k = a + 1 + i
            keep[k] = True
            stack += [(a, k), (k, b)]
    return pts[keep]


def soften(p, sigma):
    """Gaussian smoothing along a chain; end points stay where they are."""
    p = np.asarray(p, float)
    n = len(p)
    if n < 5 or sigma <= 0:
        return p
    r = int(max(2, round(sigma * 3)))
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    closed = np.hypot(*(p[0] - p[-1])) < 1.6 and n > 12
    if closed:
        ext = np.vstack([p[-r - 1:-1], p, p[1:r + 1]])
    else:
        head = 2 * p[0] - p[1:r + 1][::-1]
        tail = 2 * p[-1] - p[-r - 1:-1][::-1]
        if len(head) < r:
            head = np.vstack([np.repeat(p[:1], r - len(head), 0), head])
        if len(tail) < r:
            tail = np.vstack([tail, np.repeat(p[-1:], r - len(tail), 0)])
        ext = np.vstack([head, p, tail])
    out = np.stack([np.convolve(ext[:, 0], k, 'valid'), np.convolve(ext[:, 1], k, 'valid')], 1)
    if not closed:
        out[0], out[-1] = p[0], p[-1]
    return out


def length(p):
    p = np.asarray(p, float)
    return float(np.hypot(*np.diff(p, axis=0).T).sum()) if len(p) > 1 else 0.0


def merge(polys, tol=2.5):
    """Join chains that meet end to end with a smooth direction (through junctions)."""
    polys = [np.asarray(p, float) for p in polys if len(p) >= 2]
    ends = []  # (chain, side, point, outward direction)
    for i, p in enumerate(polys):
        ends.append((i, 0, p[0], p[0] - p[min(4, len(p) - 1)]))
        ends.append((i, 1, p[-1], p[-1] - p[max(-5, -len(p))]))
    grid = {}
    for e, (_, _, pt, _) in enumerate(ends):
        grid.setdefault((int(pt[0] // tol), int(pt[1] // tol)), []).append(e)
    cands = []
    for a, (ia, sa, pa, da) in enumerate(ends):
        cx, cy = int(pa[0] // tol), int(pa[1] // tol)
        for gx in (cx - 1, cx, cx + 1):
            for gy in (cy - 1, cy, cy + 1):
                for b in grid.get((gx, gy), ()):
                    if b <= a:
                        continue
                    ib, sb, pb, db = ends[b]
                    if ia == ib or np.hypot(*(pa - pb)) > tol:
                        continue
                    na, nb = np.hypot(*da), np.hypot(*db)
                    if na == 0 or nb == 0:
                        continue
                    cos = float(np.dot(da, -db) / (na * nb))
                    if cos > 0.75:
                        cands.append((cos, a, b))
    cands.sort(reverse=True)
    link = {}
    for cos, a, b in cands:
        if a in link or b in link:
            continue
        link[a] = b
        link[b] = a
    # follow the links to assemble longer chains
    done = [False] * len(polys)
    out = []
    for i in range(len(polys)):
        if done[i]:
            continue
        # walk back to a free start (or detect a loop)
        start, side = i, 0
        seen = {i}
        while (2 * start + side) in link:
            o = link[2 * start + side]
            start, side = o // 2, 1 - (o % 2)
            if start in seen:
                break
            seen.add(start)
        cur, s0 = start, side  # s0 = side we enter from
        chain = []
        while True:
            done[cur] = True
            p = polys[cur] if s0 == 0 else polys[cur][::-1]
            chain.append(p if not chain else p[1:])
            exit_end = 2 * cur + (1 - s0)
            if exit_end not in link:
                break
            o = link[exit_end]
            nxt, ns = o // 2, o % 2
            if done[nxt]:
                break
            cur, s0 = nxt, ns
        out.append(np.vstack(chain))
    return out


def trace(gray, thr=215, keep_inside=True, close_bottom=True, min_len=2.0, eps=0.3, spur=4.0, up=UP, sigma=1.3, erase=(), close_sides=0.0):
    gray = gray.copy()
    for (x0, y0, x1, y1) in erase:
        gray[y0:y1, x0:x1] = 255
    lines = binarize(gray, thr, up)
    sil = silhouette(lines, close_bottom, close_sides=close_sides)
    if keep_inside:
        allow = cv2.dilate(sil, np.ones((9, 9), np.uint8))
        lines = lines & allow
    sk = skeletonize(lines.astype(bool))
    polys = chains(sk)
    # drop tiny spurs created by the thinning
    polys = [p for p, free in polys if not free or length(p) >= spur * up]
    polys = merge(polys, tol=2.5)
    out = []
    for p in polys:
        if length(p) < min_len * up:
            continue
        q = rdp(soften(p, sigma * up), eps * up) / up
        out.append(q)
    cs, _ = cv2.findContours(sil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)[:, 0, :].astype(float)
    c = rdp(soften(np.vstack([c, c[:1]]), 2.0 * up), 0.5 * up) / up
    return {"sil": c, "lines": out}


def smooth_d(p, closed=False, nd=1):
    """Catmull-Rom spline through the points as cubic Bezier path data."""
    p = np.asarray(p, float)
    n = len(p)
    if n < 2:
        return ""
    f = lambda v: (f"{v:.{nd}f}").rstrip("0").rstrip(".")
    d = f"M{f(p[0][0])},{f(p[0][1])}"
    if n == 2:
        return d + f"L{f(p[1][0])},{f(p[1][1])}"
    for i in range(n - 1):
        p0 = p[i - 1] if i > 0 else (p[-2] if closed else p[i])
        p1, p2 = p[i], p[i + 1]
        p3 = p[i + 2] if i + 2 < n else (p[1] if closed else p[i + 1])
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        d += f"C{f(c1[0])},{f(c1[1])} {f(c2[0])},{f(c2[1])} {f(p2[0])},{f(p2[1])}"
    return d + ("Z" if closed else "")


def to_svg(res, w, h, stroke=1.4, fill="#fcfbf8", ink="#232327"):
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
    s += f'<path d="{smooth_d(res["sil"], True)}" fill="{fill}"/>'
    s += f'<path d="{"".join(smooth_d(l) for l in res["lines"])}" fill="none" stroke="{ink}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round"/>'
    return s + "</svg>"
