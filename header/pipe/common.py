import cv2, numpy as np, os
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, '..', 'ref', 'reference.png')     # the source illustration, 2171 x 724 px (not in the repository)
OUT = os.path.join(HERE, '..', 'out')       # scratch: masks, layer images, raw traces (not in the repository)
VIEW = os.path.join(HERE, '..', 'view')     # review pictures written along the way (not in the repository)
os.makedirs(OUT, exist_ok=True)
os.makedirs(VIEW, exist_ok=True)

_im = None
def ref():
    """Reference image as BGR uint8."""
    global _im
    if _im is None:
        _im = cv2.imread(REF, cv2.IMREAD_COLOR)
        if _im is None:
            raise SystemExit('reference image not found: put it at ' + os.path.normpath(REF))
    return _im

def shape():
    return ref().shape[:2]

def poly_mask(pts, shape_=None):
    h, w = shape_ or shape()
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [np.round(np.array(pts, np.float64)).astype(np.int32)], 255)
    return m > 0

def disk(r):
    r = int(r)
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return (x * x + y * y) <= r * r + r * 0.5

def dilate(m, r):
    return ndi.binary_dilation(m, structure=disk(r)) if r > 0 else m

def erode(m, r):
    return ndi.binary_erosion(m, structure=disk(r)) if r > 0 else m

def bbox(m, pad=0):
    ys, xs = np.where(m)
    h, w = m.shape
    return max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + 1 + pad, w), min(ys.max() + 1 + pad, h)

def save_mask(name, m):
    cv2.imwrite(os.path.join(OUT, 'mask_%s.png' % name), (m * 255).astype(np.uint8))

def load_mask(name):
    return cv2.imread(os.path.join(OUT, 'mask_%s.png' % name), cv2.IMREAD_GRAYSCALE) > 127

def overlay(masks, x0, y0, x1, y1, out, scale=3, colors=None):
    """Draw mask boundaries over the reference crop for review."""
    crop = ref()[y0:y1, x0:x1]
    big = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    cols = colors or [(255, 0, 255), (0, 255, 0), (0, 200, 255), (255, 200, 0), (0, 128, 255), (255, 255, 255)]
    for i, m in enumerate(masks):
        mm = cv2.resize((m[y0:y1, x0:x1] * 255).astype(np.uint8), None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST)
        cnts, _ = cv2.findContours(mm, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(big, cnts, -1, cols[i % len(cols)], 1)
    cv2.imwrite(out, big)
    return out
