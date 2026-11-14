import numpy as np, cv2
from skimage.segmentation import random_walker
from common import *

_lab = None
def lab():
    global _lab
    if _lab is None:
        sm = cv2.bilateralFilter(ref(), 5, 20, 3)
        _lab = cv2.cvtColor(sm, cv2.COLOR_BGR2LAB).astype(np.float64) / 255.0
    return _lab

def snap(pts, inner=5, outer=5, beta=900, pad=12, fill=None, fg=None, bg=None):
    """Snap a rough outline to the strongest image edge inside a band around it (random walker)."""
    fill = poly_mask(pts) if fill is None else fill
    core = erode(fill, inner)
    far = ~dilate(fill, outer)
    x0, y0, x1, y1 = bbox(fill, pad + outer)
    labels = np.zeros(fill.shape, np.int32)
    labels[core] = 1
    labels[far] = 2
    if fg is not None:      # pixels known to belong to the object (e.g. a rim light that two strong edges enclose)
        labels[fg & ~far] = 1
    if bg is not None:
        labels[bg & ~core] = 2
    lc = labels[y0:y1, x0:x1]
    data = lab()[y0:y1, x0:x1]
    res = random_walker(data, lc, beta=beta, mode='cg_j', tol=1e-4, channel_axis=-1)
    out = np.zeros(fill.shape, bool)
    out[y0:y1, x0:x1] = res == 1
    return out
