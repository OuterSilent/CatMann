"""The pencil drawing the artist makes: a cat's face, authored in a flat design space and projected onto the sheet."""
import numpy as np, random

SHEET = [(773, 628), (1350, 628.5), (1569, 684.5), (692, 701)]   # TL, TR, BR, BL in image px

def homography(dst):
    """Unit square (0,0),(1,0),(1,1),(0,1) -> dst quad."""
    src = [(0, 0), (1, 0), (1, 1), (0, 1)]
    A, b = [], []
    for (u, v), (x, y) in zip(src, dst):
        A.append([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.append(x)
        A.append([0, 0, 0, u, v, 1, -u * y, -v * y]); b.append(y)
    h = np.linalg.solve(np.array(A, float), np.array(b, float))
    return np.append(h, 1).reshape(3, 3)

H = homography(SHEET)
Hinv = np.linalg.inv(H)

def proj(u, v):
    p = H @ np.array([u, v, 1.0])
    return p[0] / p[2], p[1] / p[2]

def unproj(x, y):
    p = Hinv @ np.array([x, y, 1.0])
    return p[0] / p[2], p[1] / p[2]

# ---- design space: x in [-1.2, 1.2] (right), y in [-1, 1] (up = away from the viewer, so the cat reads upright) ----
def mirror(pts):
    return [(-x, y) for x, y in pts]

def zigzag(a, b, c, d, n):
    """Hatching between segment a-b and segment c-d."""
    out = []
    for i in range(n + 1):
        t = i / n
        p = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
        q = (c[0] + (d[0] - c[0]) * t, c[1] + (d[1] - c[1]) * t)
        out += [p, q] if i % 2 == 0 else [q, p]
    return out

ear_l = [(-0.80, -0.10), (-0.90, 0.28), (-0.84, 0.96), (-0.40, 0.58), (-0.02, 0.64)]
eye_l = [(-0.66, 0.06), (-0.50, 0.24), (-0.34, 0.25), (-0.18, 0.06), (-0.36, -0.08), (-0.52, -0.07), (-0.66, 0.06)]
STROKES = [
    # (kind, points)  kind: 'line' normal, 'light' construction, 'dark' pressed, 'hatch' fast shading
    ('light', [(-0.95, 0.0), (0.95, 0.0)]),                                   # construction: eye line
    ('light', [(0.0, 0.85), (0.0, -0.9)]),                                    # construction: centre line
    ('line', ear_l),
    ('line', mirror(ear_l)[::-1]),
    ('line', [(0.80, -0.10), (0.58, -0.62), (0.22, -0.90), (0.0, -0.96), (-0.22, -0.90), (-0.58, -0.62), (-0.80, -0.10)]),
    ('dark', eye_l),
    ('dark', mirror(eye_l)),
    ('dark', [(-0.42, 0.22), (-0.45, 0.08), (-0.42, -0.06), (-0.39, 0.08), (-0.42, 0.22)]),      # pupil
    ('dark', [(0.42, 0.22), (0.39, 0.08), (0.42, -0.06), (0.45, 0.08), (0.42, 0.22)]),
    ('line', [(-0.10, -0.36), (0.10, -0.36), (0.0, -0.50), (-0.10, -0.36)]),                    # nose
    ('line', [(0.0, -0.50), (0.0, -0.62), (-0.16, -0.74)]),
    ('line', [(0.0, -0.62), (0.16, -0.74)]),
    ('line', [(-0.76, 0.74), (-0.70, 0.36), (-0.50, 0.54)]),                                    # inner ears
    ('line', [(0.76, 0.74), (0.70, 0.36), (0.50, 0.54)]),
    ('line', [(-0.14, 0.56), (-0.16, 0.30)]), ('line', [(0.0, 0.58), (0.0, 0.28)]), ('line', [(0.14, 0.56), (0.16, 0.30)]),   # tabby "M"
    ('hatch', zigzag((-0.74, -0.14), (-0.50, -0.62), (-0.56, -0.08), (-0.34, -0.52), 5)),      # cheek shading
    ('hatch', zigzag((0.74, -0.14), (0.50, -0.62), (0.56, -0.08), (0.34, -0.52), 5)),
    ('hatch', zigzag((-0.80, 0.80), (-0.74, 0.44), (-0.70, 0.74), (-0.60, 0.50), 4)),          # ear shading
    ('hatch', zigzag((0.80, 0.80), (0.74, 0.44), (0.70, 0.74), (0.60, 0.50), 4)),
    ('line', [(-0.30, -0.52), (-1.16, -0.38)]), ('line', [(-0.30, -0.58), (-1.20, -0.62)]), ('line', [(-0.28, -0.64), (-1.10, -0.86)]),   # whiskers
    ('line', [(0.30, -0.52), (1.16, -0.38)]), ('line', [(0.30, -0.58), (1.20, -0.62)]), ('line', [(0.28, -0.64), (1.10, -0.86)]),
]

def build(cx=945.0, cy=667.0, half_w=96.0, v_span=0.36, seed=7, subdiv=0.09, jitter=0.012):
    """-> list of {kind, pts:[(x,y)...]} in image px. The face is centred on image point (cx, cy)."""
    rnd = random.Random(seed)
    u0, v0 = unproj(cx, cy)
    # local scale: how much u changes per image px at the centre
    ux, _ = unproj(cx + 1, cy)
    du = (ux - u0) * half_w            # design x = 1  ->  du
    dv = -v_span                       # design y = 1  ->  towards the far edge
    out = []
    for kind, pts in STROKES:
        dense = []
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(1, int(np.hypot(x1 - x0, y1 - y0) / subdiv)) if kind != 'hatch' else 1
            for i in range(n):
                t = i / n
                dense.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
        dense.append(pts[-1])
        res = []
        for i, (x, y) in enumerate(dense):
            j = jitter if 0 < i < len(dense) - 1 else jitter * 0.4
            x += rnd.uniform(-j, j); y += rnd.uniform(-j, j) * 2
            px, py = proj(u0 + du * x, v0 + dv * y)
            res.append((round(px, 1), round(py, 1)))
        out.append({'kind': kind, 'pts': res})
    return out

if __name__ == '__main__':
    st = build()
    xs = [p[0] for s in st for p in s['pts']]; ys = [p[1] for s in st for p in s['pts']]
    print(len(st), 'strokes', min(xs), max(xs), min(ys), max(ys))
    # preview on the reference
    import cv2, os
    B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    im = cv2.imread(os.path.join(B, 'view', 'st3.png'))
    big = cv2.resize(im[600:724, 700:1250], None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    for s in st:
        pts = np.round((np.array(s['pts']) - [700, 600]) * 3 * 16).astype(np.int32)
        col = {'light': (175, 160, 165), 'line': (70, 60, 66), 'dark': (40, 32, 36), 'hatch': (120, 105, 110)}[s['kind']]
        cv2.polylines(big, [pts], False, col, 4 if s['kind'] != 'light' else 3, cv2.LINE_AA, shift=4)
    cv2.imwrite(os.path.join(B, 'view', 'dr1.png'), big)
