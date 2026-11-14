"""Stage 2: per-layer colour images (clean edges, under-fills) -> out/layer_<name>.png (BGRA)."""
import sys
sys.path.insert(0, '.')
from common import *
import rough

NAMES = ['cat_all', 'cat_tail', 'cat_head', 'cat_paw_l', 'cat_body', 'man_head', 'r_hand', 'l_hand', 'man_all',
         'r_forearm', 'r_upper', 'torso', 'props_front', 'steam', 'plant', 'camera', 'mug', 'table', 'sheet']
M = {k: load_mask(k) for k in NAMES}
img = ref().copy()
H, W = img.shape[:2]

# ---------- remove whiskers that lie outside the cat (they come back as crisp vector strokes) ----------
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
zone = poly_mask([(1372, 468), (1432, 468), (1432, 560), (1453, 575), (1453, 614), (1400, 628), (1372, 600)]) | \
       poly_mask([(1493, 584), (1558, 570), (1558, 642), (1478, 642), (1468, 600)])
wh = (tophat > 9) & zone & ~M['cat_all']
wh = dilate(wh, 2) & ~erode(M['cat_all'], 1)
img = cv2.inpaint(img, (wh * 255).astype(np.uint8), 4, cv2.INPAINT_TELEA)
cv2.imwrite(os.path.join(OUT, 'ref_clean.png'), img)

def nearest_fill(src, known):
    idx = ndi.distance_transform_edt(~known, return_distances=False, return_indices=True)
    return src[idx[0], idx[1]]

def soft_fill(src, known, hole, sigma=3):
    """Nearest-colour fill of `hole` from `known`, then smoothed inside the hole only."""
    out = nearest_fill(src, known)
    bl = cv2.GaussianBlur(out, (0, 0), sigma)
    res = src.copy()
    res[hole] = bl[hole]
    res[~known & ~hole] = out[~known & ~hole]
    return res

def write_layer(name, colour, alpha):
    out = np.dstack([colour, (alpha * 255).astype(np.uint8)])
    cv2.imwrite(os.path.join(OUT, 'layer_%s.png' % name), out)
    print(name, int(alpha.sum()))

def part(name, mask, ext=None, shrink=1, sigma=7, avoid=None, deep=0, nosrc=None, img=None):
    """Colour = own pixels, with the outer ring filled from the nearest interior pixel.
    Extensions (areas hidden under other pieces) get a smooth fill so they trace into a few calm facets."""
    if img is None:
        img = globals()['img']
    known = erode(mask, shrink)
    if avoid is not None:
        known &= ~dilate(avoid, 4)          # edge halos of the pieces lying on top must not leak into this one
    if nosrc is not None:
        known &= ~nosrc
    colour = nearest_fill(img, known)
    alpha = mask
    if ext is not None:
        ext = ext & ~mask
        base = nearest_fill(img, erode(known, deep)) if deep else colour      # under-fill takes its colours from well inside the piece
        sm = cv2.GaussianBlur(base, (0, 0), sigma)
        sm = cv2.GaussianBlur(np.where(ext[:, :, None], sm, colour), (0, 0), sigma)
        w = np.clip(ndi.distance_transform_edt(ext) / 6.0, 0, 1)[:, :, None]     # blend in over 6 px from the real pixels
        colour = np.where(ext[:, :, None], (colour * (1 - w) + sm * w).astype(np.uint8), colour)
        alpha = mask | ext
    write_layer(name, colour, alpha)
    return colour

# ---------- left hand: open the gaps between the fingers ----------
lh = M['l_hand']
dark = (img.max(axis=2) < 62) & lh
lab, n = ndi.label(dark)
edge = lh & ~erode(lh, 2)
gaps = np.zeros_like(lh)
for i in range(1, n + 1):
    reg = lab == i
    if reg.sum() > 25 and (reg & edge).any():
        gaps |= reg
gaps = dilate(gaps, 1) & lh
lh2 = lh & ~gaps
lh2 = ndi.binary_opening(lh2, structure=disk(1))
lab, n = ndi.label(lh2)
sizes = ndi.sum(lh2, lab, range(1, n + 1))
lh2 = lab == (1 + int(np.argmax(sizes)))
M['l_hand'] = lh2          # from here on "the left hand" is the hand without the gaps (running this stage twice changes nothing)
save_mask('l_hand', lh2)

moving = M['cat_all'] | M['man_all'] | M['steam']
cam_soft = dilate(M['camera'], 8)
front = M['plant'] | cam_soft
table = M['table']

# ---------- the neon sign is drawn live as vector strokes: take the tube and its glow off the wall ----------
def membrane_fill(src, known, hole, iters=3000):
    """Harmonic (soap-film) fill: hole pixels relax to the mean of their neighbours, pinned to the known pixels at the rim.
    Pixels that are neither hole nor known (other objects) act as a wall the fill does not look at."""
    x0, y0, x1, y1 = bbox(hole, 3)
    sl = (slice(y0, y1), slice(x0, x1))
    h, k = hole[sl], known[sl]
    w = (h | k).astype(np.float32)
    v = src[sl].astype(np.float32)
    # start from a coarse guess so the relaxation converges quickly
    for sigma in (8, 20, 50):
        den = cv2.GaussianBlur(k.astype(np.float32), (0, 0), sigma)
        num = cv2.GaussianBlur(src[sl].astype(np.float32) * k[:, :, None], (0, 0), sigma)
        ok = h & (den > 0.02)
        v[ok] = (num / np.maximum(den, 1e-6)[:, :, None])[ok]
        k = k | ok
    k = known[sl]
    wp = np.pad(w, 1)
    wsum = wp[:-2, 1:-1] + wp[2:, 1:-1] + wp[1:-1, :-2] + wp[1:-1, 2:]
    for _ in range(iters):
        vp = np.pad(v * w[:, :, None], ((1, 1), (1, 1), (0, 0)))
        acc = vp[:-2, 1:-1] + vp[2:, 1:-1] + vp[1:-1, :-2] + vp[1:-1, 2:]
        nv = acc / np.maximum(wsum, 1e-6)[:, :, None]
        v[h] = nv[h]
    out = src.copy()
    out[sl][h] = np.clip(np.round(v), 0, 255).astype(np.uint8)[h]
    return out

# The halo is the same model the browser draws (two blurred copies of the stroke), so it can be divided out exactly;
# only the tube itself and a few pixels around it have to be filled in from the wall next to them.
PADR = 80
G = rough.NEON_GLOW
npts = [np.round(np.array(rough.NEON) * 16).astype(np.int32)]
cov = np.zeros((H, W + PADR), np.uint8)
cv2.polylines(cov, npts, False, 255, int(round(G['w'])), cv2.LINE_AA, 4)
wall = img.astype(np.float32)
touched = np.zeros((H, W), bool)
for sigma, op, rgb in reversed(G['layers']):            # undo the layers top-down
    al = (op * cv2.GaussianBlur(cov.astype(np.float32) / 255, (0, 0), sigma))[:, :W]
    wall = (wall - np.array(rgb[::-1], np.float32)[None, None, :] * al[:, :, None]) / np.maximum(1 - al, 0.15)[:, :, None]
    touched |= al > 0.003
img_far = np.where(touched[:, :, None], np.clip(np.round(wall), 0, 255), img).astype(np.uint8)
# the model is not exact close to the tube (the real halo is a little lopsided): there the wall is simply stretched across
zone = np.zeros((H, W + PADR), np.uint8)
cv2.polylines(zone, npts, False, 255, 34, cv2.LINE_AA, 4)
zone = zone[:, :W] > 127
poster = poly_mask(rough.POSTER)
img_far = membrane_fill(img_far, ~zone & ~dilate(poster, 3), zone & ~dilate(poster, 1))
# the glint in the eye on the print comes back as a crisp dot
glint = np.zeros((H, W), np.uint8)
cv2.circle(glint, (2088, 202), 8, 255, -1)
img_far = cv2.inpaint(img_far, glint, 3, cv2.INPAINT_TELEA)

# ---------- the lamps are drawn live as nested vector shapes (lights.py): they come off the wall as well ----------
import json
for _k, _v in json.load(open(os.path.join(OUT, 'lights.json'))).items():
    _zone = dilate(poly_mask(_v['zone']), 3)
    img_far = membrane_fill(img_far, ~_zone, _zone)

# ---------- far background: everything nearer is removed and inpainted ----------
hole = dilate(moving | M['plant'], 6) | cam_soft | dilate(table, 1)
far = cv2.inpaint(img_far, (hole * 255).astype(np.uint8), 7, cv2.INPAINT_TELEA)
tz = dilate(M['cat_tail'] | (M['cat_body'] & poly_mask([(1700, 330), (1960, 330), (1960, 640), (1700, 640)])), 8)
b_, g_, r_ = [far[:, :, i].astype(np.int32) for i in range(3)]
cool = (b_ > r_ + 8) & ~hole
tfill = cv2.GaussianBlur(nearest_fill(far, cool), (0, 0), 6)
tw_ = np.clip(ndi.distance_transform_edt(tz & hole) / 5.0, 0, 1)[:, :, None]
far = np.where((tz & hole)[:, :, None], (far * (1 - tw_) + tfill * tw_).astype(np.uint8), far)
deep = erode(hole, 40)              # never revealed: keep it trivially simple for the tracer
write_layer('far_full', far, np.ones((H, W), bool))        # everything filled in: the source of the soft base layer (farsplit.py)
save_mask('far_deep', deep)
far[deep] = (30, 27, 28)
write_layer('far', far, np.ones((H, W), bool))

# ---------- table (with mug, photos, books): static mid layer; the sheet is re-authored as clean vector ----------
thole = (dilate(M['man_all'] | M['cat_all'], 4) | cam_soft | dilate(M['sheet'], 3)) & table
tknown = table & ~thole
tcol = soft_fill(img, erode(tknown, 1), thole, sigma=4)
tcol[erode(M['sheet'], 6)] = (53, 52, 58)
tcol[erode(M['props_front'], 14) & table] = tcol[erode(M['props_front'], 14) & table]  # (kept: books are visible in props_front only)
# the mug is traced on its own with a finer setting (its facets are faint); under it the table layer is plain
mcol = nearest_fill(img, erode(M['mug'], 1) & ~cam_soft)          # the lens overlaps the handle: its pixels must not stay in the mug
write_layer('mug', mcol, M['mug'])
tcol[erode(M['mug'], 3)] = np.median(img[erode(M['mug'], 3)], axis=0).astype(np.uint8)
write_layer('table', tcol, table)

# ---------- front: plant (sharp) and camera (out of focus) ----------
# the openings between the leaves that are redrawn by hand (rough.PLANT_PATCH) are painted over with leaf colour
gaps = np.zeros((H, W), bool)
for k in rough.PLANT_GAPS + ['mauve3']:
    gaps |= poly_mask(rough.PLANT_PATCH[k])
gaps = dilate(gaps, 5) & M['plant']
unknown = gaps | (~M['plant'] & dilate(gaps, 14))          # only leaf pixels may be copied in
pimg = cv2.inpaint(img, (unknown * 255).astype(np.uint8), 5, cv2.INPAINT_TELEA)
part('plant', M['plant'], img=np.where(gaps[:, :, None], pimg, img))
ccol = nearest_fill(img, M['camera'])
ccol = np.where(M['camera'][:, :, None], img, cv2.GaussianBlur(ccol, (0, 0), 2))
write_layer('camera', ccol, dilate(M['camera'], 3))

# ---------- man ----------
torso_ext = (poly_mask([(700, 500), (940, 500), (940, 628), (770, 628), (745, 650), (700, 646)])      # under right hand
             | poly_mask([(1105, 520), (1372, 520), (1372, 628), (1105, 628)])                          # under left hand
             | (dilate(M['torso'], 18) & M['man_head'])                                                 # neck / hood under the head
             | (poly_mask(rough.CUT['r_forearm']) & dilate(M['torso'], 60) & M['r_forearm']))           # under the forearm
torso_ext &= (M['r_hand'] | M['l_hand'] | M['man_head'] | M['r_forearm'])
torso_ext |= poly_mask([(700, 500), (940, 500), (940, 640), (700, 640)]) | poly_mask([(1105, 520), (1372, 520), (1372, 640), (1105, 640)])
torso_ext |= M['r_upper']                                                                             # the upper arm swings over the chest
below = poly_mask([(486, rough.TABLE_Y), (1446, rough.TABLE_Y), (1446, rough.TABLE_Y + 16), (486, rough.TABLE_Y + 16)])   # hidden under the table edge: lets him lean without a gap
torso_ext |= below & ~M['torso']
edge_strip = poly_mask([(0, rough.TABLE_Y - 12), (W, rough.TABLE_Y - 12), (W, H), (0, H)])
part('torso', M['torso'], torso_ext, avoid=M['r_hand'] | M['l_hand'] | M['man_head'], nosrc=edge_strip)
part('man_head', M['man_head'])
part('r_upper', M['r_upper'], dilate(M['r_upper'], 34) & M['r_forearm'], avoid=M['r_hand'])
part('r_forearm', M['r_forearm'], dilate(M['r_forearm'], 26) & M['r_hand'], avoid=M['r_hand'])
part('r_hand', M['r_hand'])
part('l_hand', M['l_hand'])

# ---------- cat ----------
part('cat_tail', M['cat_tail'], dilate(M['cat_tail'], 16) & M['cat_body'], deep=6)
part('cat_body', M['cat_body'], (dilate(M['cat_body'], 46) & M['cat_head']) | (dilate(M['cat_body'], 10) & M['cat_paw_l']), deep=14)
# the eyes are re-authored as vector shapes (iris, pupil, lids): the traced head carries plain fur there
eyes = (dilate(poly_mask(rough.EYE_N), 2) | dilate(poly_mask(rough.EYE_F), 1)) & M['cat_head']
img = cv2.inpaint(img, (eyes * 255).astype(np.uint8), 3, cv2.INPAINT_TELEA)
part('cat_head', M['cat_head'])
part('cat_paw_l', M['cat_paw_l'])

# ---------- static props in front of the cat ----------
write_layer('props_front', tcol, M['props_front'])
