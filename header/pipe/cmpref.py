"""cmpref.py render.png [out_err.png]  -> fidelity of a rest-pose render against the reference (sheet excluded)."""
import sys
sys.path.insert(0, '.')
from common import *
import rough
ren = cv2.imread(sys.argv[1])[:, :, :3]
src = ref()
m = ~dilate(poly_mask(rough.SHEET), 6)
d = np.abs(ren.astype(np.int32) - src.astype(np.int32))
print('MAE %.2f   (far-only areas %.2f, pieces %.2f)   p95 %.0f' % (
    d[m].mean(),
    d[m & ~(load_mask('man_all') | load_mask('cat_all') | load_mask('table') | load_mask('plant') | load_mask('camera'))].mean(),
    d[m & (load_mask('man_all') | load_mask('cat_all'))].mean(),
    np.percentile(d[m].max(axis=1), 95)))
if len(sys.argv) > 2:
    vis = np.clip(d.max(axis=2) * 6, 0, 255).astype(np.uint8)
    cv2.imwrite(sys.argv[2], vis)
