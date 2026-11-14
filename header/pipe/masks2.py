"""Stage 1b: depth-layer masks (plant, pot, camera, mug, table)."""
import sys
sys.path.insert(0, '.')
from common import *
from snap import snap
import rough
R = rough.R
im = ref().astype(np.int32)
B, G, Rr = im[:, :, 0], im[:, :, 1], im[:, :, 2]
mx = im.max(axis=2)
H, W = mx.shape

hull = dilate(poly_mask(R['plant_hull']), 2)
dark = mx < 75
brown = (mx < 128) & (B < 0.62 * Rr)
orange = (Rr > 180) & (B < 112) & (G < 165)
plant = (dark | brown | orange) & hull
plant = ndi.binary_opening(plant, structure=disk(1))
plant = ndi.binary_closing(plant, structure=disk(2))
lab, n = ndi.label(plant)
sizes = ndi.sum(plant, lab, range(1, n + 1))
keep = np.zeros_like(plant)
for i, s in enumerate(sizes):
    if s > 150:
        keep |= lab == i + 1
plant = keep
holes = ndi.binary_fill_holes(plant) & ~plant
lab, n = ndi.label(holes)
sizes = ndi.sum(holes, lab, range(1, n + 1))
for i, s in enumerate(sizes):
    if s < 60:
        plant |= lab == i + 1
# hand-drawn patches (see rough.PLANT_PATCH): the gaps they sit in are closed, thin tips are added
gapfill = np.zeros_like(plant)
for k in rough.PLANT_GAPS:
    gapfill |= poly_mask(rough.PLANT_PATCH[k])
gapfill = dilate(gapfill, 3)
for k in rough.PLANT_EXACT:
    gapfill |= poly_mask(rough.PLANT_PATCH[k])
plant |= gapfill
holes = ndi.binary_fill_holes(plant) & ~plant
lab, n = ndi.label(holes)
sizes = ndi.sum(holes, lab, range(1, n + 1))
for i, s in enumerate(sizes):
    if s < 60:
        plant |= lab == i + 1
pot = snap(R['pot'], inner=4, outer=4)
cam = snap(R['camera'], inner=6, outer=7)
mug = snap(R['mug'], inner=3, outer=4) & ~snap(R['mug_hole'], inner=3, outer=3)
props = load_mask('props_front')
table = poly_mask([(0, rough.TABLE_Y), (W, rough.TABLE_Y), (W, H), (0, H)]) | mug | props
sheet = poly_mask(rough.SHEET)
for k, v in {'plant': plant | pot, 'camera': cam, 'mug': mug, 'table': table, 'sheet': sheet}.items():
    save_mask(k, v)
    print(k, int(v.sum()))
overlay([plant | pot], 0, 0, 300, 540, '../view/m_plant.png', scale=2.6)
overlay([cam, mug, pot], 0, 380, 440, 724, '../view/m_cam.png', scale=3)
overlay([sheet, table], 640, 590, 1620, 724, '../view/m_sheet.png', scale=2)
