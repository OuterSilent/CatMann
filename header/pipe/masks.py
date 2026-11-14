"""Stage 1: part masks. Rough outlines are snapped to image edges; internal cuts are exact."""
import sys, json
sys.path.insert(0, '.')
from common import *
from snap import snap
import rough
R, CUT = rough.R, rough.CUT

M = {}
M['cat_all'] = snap(R['cat'])
M['cat_tail'] = M['cat_all'] & poly_mask(CUT['cat_tail'])
M['cat_head'] = M['cat_all'] & poly_mask(CUT['cat_head'])
M['cat_paw_l'] = M['cat_all'] & poly_mask(CUT['cat_paw_l'])
M['cat_body'] = M['cat_all'] & ~M['cat_tail'] & ~M['cat_head'] & ~M['cat_paw_l']

M['man_head'] = snap(R['man_head'])
M['r_hand'] = snap(R['r_hand'], inner=4, outer=4)
# the pen cap has a light rim that the snap leaves outside: pull it in (with its dark outline)
_zone = poly_mask([(788, 430), (842, 430), (884, 524), (800, 524)])
_rim = (ref().max(axis=2) > 105) & _zone & dilate(M['r_hand'], 8)
M['r_hand'] |= dilate(_rim, 2) & _zone
M['r_hand'] = ndi.binary_closing(M['r_hand'], structure=disk(2)) | M['r_hand']
# where the drawing hand borders the dark sleeve the snap keeps a few px of sleeve: give them back to the sleeve
_hz = poly_mask([(696, 500), (800, 500), (800, 540), (764, 572), (742, 646), (696, 646)])
_hz |= poly_mask([(788, 499), (818, 499), (818, 513), (788, 518)])          # ... and along the top of the hand, up to the pen
_dk = (ref().max(axis=2) < 108) & M['r_hand'] & _hz & ~erode(M['r_hand'], 14)      # dark sleeve and the half-dark pixels of its edge
_lab, _n = ndi.label(_dk)
_rim2 = M['r_hand'] & ~erode(M['r_hand'], 1)
for _i in range(1, _n + 1):
    _r = _lab == _i
    if (_r & _rim2).any():
        M['r_hand'] &= ~_r
M['r_hand'] = ndi.binary_opening(M['r_hand'], structure=disk(1))
_lab, _n = ndi.label(M['r_hand'])
M['r_hand'] = _lab == (1 + int(np.argmax(ndi.sum(M['r_hand'], _lab, range(1, _n + 1)))))
M['l_hand'] = snap(R['l_hand'], inner=4, outer=4)
_im = ref().astype(np.int32)
# the warm rim light along his right arm and shoulder is enclosed by two strong edges: tell the snap it is his
_rimzone = poly_mask([(470, 610), (470, 560), (640, 420), (720, 340), (830, 330), (850, 290), (915, 285), (915, 330), (760, 400), (560, 560), (505, 615)])
_rim = (_im[..., 2] - _im[..., 0] > 45) & (_im[..., 2] > 110) & _rimzone
body = snap(R['torso'], fg=_rim & dilate(poly_mask(R['torso']), 3))
M['man_all'] = body | M['man_head'] | M['r_hand'] | M['l_hand']
M['r_forearm'] = body & poly_mask(CUT['r_forearm']) & ~M['r_hand']
M['r_upper'] = body & poly_mask(CUT['r_upper']) & ~M['r_forearm'] & ~M['man_head'] & ~M['r_hand'] & ~M['l_hand']
M['torso'] = body & ~M['r_forearm'] & ~M['r_upper'] & ~M['man_head'] & ~M['r_hand'] & ~M['l_hand']
M['props_front'] = snap(R['props_front'], inner=4, outer=4) & ~M['cat_all']
M['steam'] = dilate(poly_mask(R['steam']), 3)

for k, v in M.items():
    save_mask(k, v)
    print(k, int(v.sum()))

overlay([M['cat_tail'], M['cat_body'], M['cat_head'], M['cat_paw_l'], M['props_front']], 1370, 290, 1960, 660, '../view/m_cat.png', scale=2.4)
overlay([M['man_head'], M['torso'], M['r_forearm'], M['r_hand'], M['l_hand']], 470, 0, 1460, 660, '../view/m_man.png', scale=1.45)
overlay([M['man_head']], 860, 0, 1300, 450, '../view/m_mhead.png', scale=3)
overlay([M['r_hand'], M['r_forearm']], 680, 430, 960, 680, '../view/m_rhand.png', scale=5)
overlay([M['l_hand']], 1100, 500, 1440, 650, '../view/m_lhand.png', scale=4.2)
