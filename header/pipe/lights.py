"""Stage 1c: the lamps of the background as stacks of nested iso-contours -> out/lights.json
{name: {zone: [[x, y], ...], stack: [{fill, grad?, pts}, ...]}}  (outermost shape first)"""
import sys, json
sys.path.insert(0, '.')
from common import *
import rough
from ptrace import fit_fill, hexcol
from skimage import measure
import shapely.geometry as sg

PAD = 20
FRACS = (0.12, 0.3, 0.5, 0.7, 0.88)

def contour_at(s, level, seed, x0, y0):
    best = None
    for c in measure.find_contours(s, level):
        pts = [(float(q[1]) + 0.5 + x0 - PAD, float(q[0]) + 0.5 + y0 - PAD) for q in c]
        if len(pts) < 4:
            continue
        pg = sg.Polygon(pts)
        if not pg.is_valid:
            pg = pg.buffer(0)
        if pg.is_empty or pg.geom_type != 'Polygon':
            continue
        if pg.contains(sg.Point(seed)) and (best is None or pg.area > best.area):
            best = pg
    return best

def light(name, roi, seed, kind):
    img = ref()
    H, W = img.shape[:2]
    x0, y0, x1, y1 = roi
    crop = np.pad(img, ((PAD, PAD), (PAD, PAD), (0, 0)), mode='edge')[y0:y1 + 2 * PAD, x0:x1 + 2 * PAD].astype(np.float32)
    b, g, r = crop[:, :, 0], crop[:, :, 1], crop[:, :, 2]
    s = (r + g + b) if kind == 'warm' else (g + b - r)
    s = cv2.GaussianBlur(s, (0, 0), 0.6)
    sy, sx = int(round(seed[1] - y0 + PAD)), int(round(seed[0] - x0 + PAD))
    core = float(np.median(s[sy - 2:sy + 3, sx - 2:sx + 3]))
    # the lit shape, roughly: everything brighter than halfway between the surroundings and the core
    rough_lvl = (np.percentile(s, 30) + core) / 2
    p_half = contour_at(s, rough_lvl, seed, x0, y0)
    yy, xx = np.mgrid[0:s.shape[0], 0:s.shape[1]]
    def mask_of(pg):
        m = np.zeros(s.shape, np.uint8)
        ext = np.array(pg.exterior.coords) - [x0 - PAD, y0 - PAD]
        cv2.fillPoly(m, [np.round(ext * 16).astype(np.int32)], 255, shift=4)       # pixel (r, c) covers [c, c+1): matches the +0.5 above
        return m > 127
    m_half = mask_of(p_half)
    ring = dilate(m_half, 6) & ~dilate(m_half, 3)
    lo = float(np.percentile(s[ring], 85))                 # the brightest surroundings: below this the wall takes over
    stack, polys = [], []
    for f in FRACS:
        pg = contour_at(s, lo + (core - lo) * f, seed, x0, y0)
        if pg is None:
            continue
        pg = pg.simplify(0.45)
        polys.append(pg)
    masks = [mask_of(p) for p in polys]
    for i, pg in enumerate(polys):
        inner = masks[i + 1] if i + 1 < len(polys) else np.zeros_like(masks[i])
        m = masks[i] & ~inner
        ent = {'pts': [[round(x, 1), round(y, 1)] for x, y in list(pg.exterior.coords)[:-1]]}
        if i + 1 < len(polys):
            px = crop[m] if m.sum() >= 4 else crop[masks[i]]
            ent['fill'] = hexcol(np.median(px, axis=0))
        else:
            mm = erode(masks[i], 1) if erode(masks[i], 1).sum() > 30 else masks[i]
            fill, gr = fit_fill(mm, crop.astype(np.uint8), x0 - PAD, y0 - PAD, min_area=30, min_span=6.0)
            ent['fill'] = fill
            if gr:
                ent['grad'] = gr
        stack.append(ent)
    zone = polys[0].buffer(0.5).simplify(0.4)
    print('%-8s core %.0f  lo %.0f  levels %d  points %d' % (name, core, lo, len(stack), sum(len(e['pts']) for e in stack)), [e['fill'] for e in stack])
    return {'zone': [[round(x, 1), round(y, 1)] for x, y in list(zone.exterior.coords)[:-1]], 'stack': stack}

if __name__ == '__main__':
    out = {k: light(k, **v) for k, v in rough.LIGHTS.items()}
    json.dump(out, open(os.path.join(OUT, 'lights.json'), 'w'))
