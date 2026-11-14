"""The drawing the artist makes: a cat's head in broad, angular strokes like the marks on the sheet of the reference picture.
It is authored in a flat design space, projected onto the sheet, and laid out for a nib that is round on the paper and
therefore looks flattened from where we stand (see SQUASH)."""
import numpy as np, random

SHEET = [(773, 628), (1350, 628.5), (1569, 684.5), (692, 701)]   # TL, TR, BR, BL in image px

# The strokes are painted in "ink space": image px with y stretched by 1/SQUASH around INK_Y. The group that holds them is
# squashed back by SQUASH, so a stroke that runs across the sheet comes out thin and one that runs away from us comes out
# broad, as marks lying on a table do.
SQUASH = 0.42
INK_Y = 665.0
def to_ink(y):
    return INK_Y + (y - INK_Y) / SQUASH
def from_ink(y):
    return INK_Y + (y - INK_Y) * SQUASH

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

# ---- design space: x in [-1.3, 1.3] (right), y in [-1, 1] (up = away from the viewer, so the cat reads upright for us,
# and upside down for him). One unit of x is the half width of the head. ----
def mirror(pts):
    return [(-x, y) for x, y in pts]

EAR_OUT, EAR_TIP, EAR_IN = (-0.98, 0.04), (-0.80, 1.00), (-0.28, 0.40)
CHEEK, JAW, CHIN = (-1.06, -0.28), (-0.66, -0.74), (-0.20, -1.00)
EYE_OUT, EYE_UP, EYE_UP2, EYE_IN, EYE_LOW, EYE_LOW2 = (-0.79, 0.10), (-0.60, 0.34), (-0.36, 0.26), (-0.20, -0.08), (-0.42, -0.29), (-0.67, -0.16)
NOSE = [(-0.15, -0.48), (0.15, -0.48), (0.0, -0.68)]
MUZZLE, MID = (-0.36, -0.62), (-0.54, -0.48)

EAR_L = [EAR_OUT, EAR_TIP, EAR_IN]
SIDE_L = [EAR_OUT, CHEEK, JAW, CHIN]
LID_L = [EYE_OUT, EYE_UP, EYE_UP2, EYE_IN]
LOWER_LID_L = [EYE_IN, EYE_LOW, EYE_LOW2, EYE_OUT]
PUPIL_L = [(-0.48, 0.30), (-0.415, 0.02), (-0.47, -0.27), (-0.535, 0.02)]
INNER_EAR_L = [(-0.82, 0.80), (-0.86, 0.14), (-0.44, 0.36)]
TEMPLE_L = [EAR_OUT, (-0.50, 0.33), EYE_UP, EYE_OUT]
BROW_L = [EAR_IN, (0.0, 0.44), (0.0, 0.0), (-0.12, 0.0), EYE_IN, EYE_UP2, EYE_UP, (-0.50, 0.33)]
CHEEK_UP_L = [EYE_OUT, CHEEK, MID, (-0.15, -0.44), EYE_IN, EYE_LOW, EYE_LOW2]
CHEEK_LOW_L = [CHEEK, JAW, MUZZLE, MID]

# (kind, points)   strokes: 'light' construction, 'line' contour, 'dark' pressed, 'fine' thin.
# facets: 't1' 't2' 't3' flat tones from light to dark, 'fill' solid: the points are the corners, hatch() adds the zigzag
# the nib makes to shade them. The light comes from the left, as in the room.
STROKES = [
    ('light', [(0.0, 0.70), (0.0, -0.96)]),                                   # construction: centre line
    ('light', [(-1.0, -0.02), (1.0, -0.02)]),                                 # construction: eye line
    ('line', EAR_L),
    ('line', [EAR_IN, (0.0, 0.44), (0.28, 0.40)]),
    ('line', mirror(EAR_L)[::-1]),
    ('line', mirror(SIDE_L)),
    ('line', [(0.20, -1.00), (-0.20, -1.00)]),
    ('line', SIDE_L[::-1]),
    ('dark', LID_L), ('fine', LOWER_LID_L), ('fill', PUPIL_L),                # eyes
    ('dark', mirror(LID_L)[::-1]), ('fine', mirror(LOWER_LID_L)[::-1]), ('fill', mirror(PUPIL_L)),
    ('fine', [EYE_IN, NOSE[0]]),                                              # bridge of the nose
    ('fine', mirror([EYE_IN, NOSE[0]])),
    ('fill', NOSE),
    ('fine', [(0.0, -0.68), (0.0, -0.79), (-0.20, -0.89)]),                   # mouth
    ('fine', [(0.0, -0.79), (0.20, -0.89)]),
    ('t2', INNER_EAR_L),
    ('t3', mirror(INNER_EAR_L)),
    ('t1', BROW_L),
    ('t2', mirror(BROW_L)),
    ('t1', mirror(TEMPLE_L)),
    ('t1', CHEEK_UP_L),
    ('t2', CHEEK_LOW_L),
    ('t2', mirror(CHEEK_UP_L)),
    ('t3', mirror(CHEEK_LOW_L)),
    ('fine', [(-0.36, -0.60), (-1.20, -0.50)]), ('fine', [(-0.36, -0.68), (-1.24, -0.74)]), ('fine', [(-0.34, -0.76), (-1.12, -0.97)]),   # whiskers
    ('fine', [(0.36, -0.60), (1.20, -0.50)]), ('fine', [(0.36, -0.68), (1.24, -0.74)]), ('fine', [(0.34, -0.76), (1.12, -0.97)]),
]
FACETS = ('t1', 't2', 't3', 'fill')
HEAD_START = 8          # the construction lines and the outline: the header opens with these already drawn

def hatch(poly, rnd, angle=-58.0, spacing=5.6, jit=0.5):
    """The zigzag the nib makes to shade the polygon (image px). It is laid out in ink space, where the nib is round:
    passes at most `spacing` apart, `angle` degrees from the horizontal, from edge to edge."""
    P = np.array([(x, to_ink(y)) for x, y in poly], float)
    a = np.radians(angle); c, s = np.cos(a), np.sin(a)
    M = np.array([[c, -s], [s, c]])                  # columns: along the passes, across them
    Q = P @ M
    lo_y, hi_y = Q[:, 1].min(), Q[:, 1].max()
    n = max(1, int(np.ceil((hi_y - lo_y) / spacing)))
    out = []
    for i in range(n):
        y = lo_y + (i + 0.5) * (hi_y - lo_y) / n
        xs = [x0 + (x1 - x0) * (y - y0) / (y1 - y0) for (x0, y0), (x1, y1) in zip(Q, np.roll(Q, -1, axis=0)) if (y0 - y) * (y1 - y) < 0]
        if len(xs) < 2:
            continue
        seg = [(min(xs) + rnd.uniform(-jit, jit), y), (max(xs) + rnd.uniform(-jit, jit), y)]
        out += seg if i % 2 == 0 else seg[::-1]
    back = np.array(out) @ M.T
    return [(float(x), float(from_ink(y))) for x, y in back]

def build(cx=965.0, v_far=0.13, v_near=0.93, half_w=94.0, seed=7, subdiv=0.09, jitter=0.006):
    """-> list of {kind, pts:[(x,y)...]} in image px; a facet also has `poly`, its corners. The drawing takes the sheet
    from v_far to v_near of its depth (0 = the edge next to him, 1 = the edge next to us) and is centred on image x = cx."""
    rnd = random.Random(seed)
    v0, v_span = (v_far + v_near) / 2, (v_near - v_far) / 2
    lo, hi = 0.0, 1.0                  # the centre: on the line v = v0, at image x = cx
    for _ in range(50):
        u0 = (lo + hi) / 2
        if proj(u0, v0)[0] < cx:
            lo = u0
        else:
            hi = u0
    cy = proj(u0, v0)[1]
    # local scale: how much u changes per image px at the centre
    du = (unproj(cx + 1, cy)[0] - u0) * half_w            # design x = 1  ->  du
    dv = -v_span                       # design y = 1  ->  towards the far edge
    # The sheet lies to one side of where we stand, so a line that runs straight up the paper leans in the picture. The
    # drawing sits a couple of degrees round on the paper (`lean`), which is enough for its axis to stand upright for us.
    lo, hi = -0.3, 0.3
    for _ in range(40):
        lean = (lo + hi) / 2
        if proj(u0 + lean, v0 + dv)[0] > proj(u0 - lean, v0 - dv)[0]:
            hi = lean
        else:
            lo = lean
    def D(x, y):
        return proj(u0 + du * x + lean * y, v0 + dv * y)
    def r1(pts):
        return [(round(float(x), 1), round(float(y), 1)) for x, y in pts]
    out = []
    for kind, pts in STROKES:
        if kind in FACETS:
            poly = [D(x, y) for x, y in pts]
            out.append({'kind': kind, 'pts': r1(hatch(poly, rnd)), 'poly': r1(poly)})
            continue
        dense = []
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(1, int(np.hypot(x1 - x0, y1 - y0) / subdiv))
            for i in range(n):
                t = i / n
                dense.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, i == 0))
        dense.append(tuple(pts[-1]) + (True,))
        res = []
        for x, y, corner in dense:
            j = jitter * (0.3 if corner else 1.0)
            res.append(D(x + rnd.uniform(-j, j), y + rnd.uniform(-j, j) * 1.6))
        out.append({'kind': kind, 'pts': r1(res)})
    return out

if __name__ == '__main__':
    st = build()
    xs = [p[0] for s in st for p in s['pts']]; ys = [p[1] for s in st for p in s['pts']]
    print(len(st), 'strokes', min(xs), max(xs), min(ys), max(ys))
