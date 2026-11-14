"""Stage 3: vectorise each layer -> out/vec_<name>.json  {name, bbox, paths: [{fill, grad?, subpaths: [[(x, y), ...], ...]}, ...]}

Crisp pieces go through vtracer, then are simplified, trimmed along the silhouette and recoloured from the source.
Soft or very dark pieces (the background, the hoodie) go through the posterised tracer in ptrace.py. CFG says which.

    python3 trace.py [layer ...]      # all layers when none is named"""
import sys, re, json, tempfile
sys.path.insert(0, '.')
from common import *
import vtracer

NUM = re.compile(r'-?\d+(?:\.\d+)?')

def parse_svg(svg, ox, oy):
    out = []
    for m in re.finditer(r'<path d="([^"]*)" fill="(#[0-9A-Fa-f]{6})" transform="translate\(([-\d.]+),([-\d.]+)\)"/>', svg):
        d, fill, tx, ty = m.group(1), m.group(2).lower(), float(m.group(3)), float(m.group(4))
        subs = []
        for sp in d.split('M'):
            sp = sp.strip()
            if not sp:
                continue
            nums = [float(v) for v in NUM.findall(sp)]
            pts = [(nums[i] + tx + ox, nums[i + 1] + ty + oy) for i in range(0, len(nums) - 1, 2)]
            if len(pts) >= 3:
                subs.append(pts)
        if subs:
            out.append({'fill': fill, 'subpaths': subs})
    return out

def curve_fwd(v, k):
    """Log tone curve: spreads the dark tones so that near-black facets survive the colour clustering."""
    return 255.0 * np.log1p(np.asarray(v, np.float64) / k) / np.log1p(255.0 / k)

def curve_inv(o, k):
    return k * np.expm1(np.asarray(o, np.float64) / 255.0 * np.log1p(255.0 / k))

def trace_layer(name, speckle=6, cp=8, ld=6, ms=(5, 10), pad=4, upscale=1, lift=0, bil=None):
    # speckle: patches narrower than this many source pixels are dropped (vtracer takes a length, not an area)
    rgba = cv2.imread(os.path.join(OUT, 'layer_%s.png' % name), cv2.IMREAD_UNCHANGED)
    alpha = rgba[:, :, 3] > 127
    x0, y0, x1, y1 = bbox(alpha, 0)
    full = alpha.all()
    crop = rgba[y0:y1, x0:x1].copy()
    col = crop[:, :, :3]
    if bil:
        col = cv2.bilateralFilter(col, bil[0], bil[1], bil[2])
    if lift:
        col = np.clip(np.round(curve_fwd(col, lift)), 0, 255).astype(np.uint8)
    if ms:
        col = cv2.pyrMeanShiftFiltering(col, sp=ms[0], sr=ms[1], maxLevel=0)
    a = crop[:, :, 3]
    if upscale != 1:
        col = cv2.resize(col, None, fx=upscale, fy=upscale, interpolation=cv2.INTER_CUBIC)
        a = cv2.resize(a, None, fx=upscale, fy=upscale, interpolation=cv2.INTER_CUBIC)
        a = ((a > 127) * 255).astype(np.uint8)
    if not full:
        p = pad * upscale
        col = cv2.copyMakeBorder(col, p, p, p, p, cv2.BORDER_CONSTANT, value=(0, 0, 0))
        a = cv2.copyMakeBorder(a, p, p, p, p, cv2.BORDER_CONSTANT, value=0)
    else:
        p = 0
    tmp = os.path.join(OUT, '_tmp_%s.png' % name)
    cv2.imwrite(tmp, np.dstack([col, a]))
    svg_path = os.path.join(OUT, '_tmp_%s.svg' % name)
    vtracer.convert_image_to_svg_py(tmp, svg_path, colormode='color', hierarchical='stacked', mode='polygon',
                                    filter_speckle=speckle * upscale, color_precision=cp, layer_difference=ld, path_precision=2)
    paths = parse_svg(open(svg_path).read(), 0, 0)
    if lift:
        for pth in paths:
            rgb = [int(pth['fill'][i:i + 2], 16) for i in (1, 3, 5)]
            rgb = np.clip(np.round(curve_inv(rgb, lift)), 0, 255).astype(int)
            pth['fill'] = '#%02x%02x%02x' % tuple(rgb)
    for pth in paths:
        pth['subpaths'] = [[((x - p) / upscale + x0, (y - p) / upscale + y0) for x, y in sp] for sp in pth['subpaths']]
    npts = sum(len(sp) for pth in paths for sp in pth['subpaths'])
    json.dump({'name': name, 'bbox': [int(x0), int(y0), int(x1), int(y1)], 'paths': paths}, open(os.path.join(OUT, 'vec_%s.json' % name), 'w'))
    print('%-12s paths %5d points %6d' % (name, len(paths), npts))
    return paths

import shapely.geometry as sg

def simplify(paths, eps):
    """Douglas-Peucker on every ring: low-poly facets have straight edges, so this both cleans and shrinks them."""
    out = []
    for p in paths:
        subs = []
        for sp in p['subpaths']:
            if len(sp) < 3:
                continue
            ring = sg.Polygon(sp).exterior.simplify(eps, preserve_topology=False)
            c = [(round(x, 1), round(y, 1)) for x, y in list(ring.coords)[:-1]]
            if len(c) >= 3:
                subs.append(c)
        if subs:
            out.append({'fill': p['fill'], 'subpaths': subs})
    return out

def recolour(name, paths, min_span=6.0):
    """Give every traced shape the colour its visible part really has in the source: the median, or a linear
    gradient where the source shades across the facet. Geometry is untouched."""
    from ptrace import fit_fill
    rgba = cv2.imread(os.path.join(OUT, 'layer_%s.png' % name), cv2.IMREAD_UNCHANGED)
    src = rgba[:, :, :3]
    H, W = src.shape[:2]
    S = 2
    idx = np.zeros((H * S, W * S), np.int32)
    for i, p in enumerate(paths):
        polys = [np.round(np.array(sp) * S * 16).astype(np.int32) for sp in p['subpaths']]
        cv2.fillPoly(idx, polys, i + 1, shift=4)
    idx = idx[S // 2::S, S // 2::S]              # one sample per pixel, at the pixel centre
    objs = ndi.find_objects(idx)
    ng = 0
    for i, p in enumerate(paths):
        sl = objs[i] if i < len(objs) else None
        if sl is None:
            continue
        m = idx[sl] == i + 1
        if m.sum() < 6:
            continue
        fill, gr = fit_fill(m, src[sl], sl[1].start, sl[0].start, min_span=min_span)
        p['fill'] = fill
        if gr:
            p['grad'] = gr; ng += 1
        elif 'grad' in p:
            del p['grad']
    return ng

from shapely.ops import unary_union

def _geom(subpaths):
    """Even-odd union of the rings, as the SVG renders them: a ring inside another one is a hole."""
    g = None
    for sp in subpaths:
        if len(sp) >= 3:
            pg = sg.Polygon(sp)
            if not pg.is_valid:
                pg = pg.buffer(0)
            if pg.is_empty:
                continue
            g = pg if g is None else g.symmetric_difference(pg)
    return g

def _rings(geom, min_area=0.6):
    out = []
    polys = [geom] if geom.geom_type == 'Polygon' else [g for g in getattr(geom, 'geoms', []) if g.geom_type == 'Polygon']
    for pg in polys:
        if pg.area < min_area:
            continue
        for ring in [pg.exterior] + list(pg.interiors):
            c = [(round(x, 1), round(y, 1)) for x, y in list(ring.coords)[:-1]]
            if len(c) >= 3:
                out.append(c)
    return out

def unpeek(paths, inset=0.7):
    """Stacked shapes all reach the silhouette, so after simplification a lower shape can show as a hairline of the
    wrong colour outside the shape drawn on top of it (skin around a dark cuff shadow, say). Cut every shape back
    from the silhouette wherever it is not the one that is really visible there."""
    geoms = [_geom(p['subpaths']) for p in paths]
    sil = unary_union([g for g in geoms if g is not None])
    inner = sil.buffer(-inset)
    above = None
    changed = 0
    for i in range(len(paths) - 1, -1, -1):
        g = geoms[i]
        if g is None:
            continue
        if above is not None and not inner.contains(g):
            vis = g.difference(above)
            keep = vis.buffer(-0.6).buffer(1.6) if not vis.is_empty else None
            region = inner if (keep is None or keep.is_empty) else inner.union(keep)
            ng = g.intersection(region)
            if ng.is_empty:
                paths[i]['subpaths'] = []
                changed += 1
            elif g.area - ng.area > 0.3:
                r = _rings(ng.simplify(0.2))
                paths[i]['subpaths'] = r
                changed += 1
        above = g if above is None else above.union(g)
    paths[:] = [p for p in paths if p['subpaths']]
    return changed

DARK = dict(ld=3, ms=(4, 3), speckle=8, lift=20)      # light smoothing: dim facets and soft shading survive
# The hoodie: dim facets a few levels apart, shaded softly, next to hard rim lights. The posterised tracer keeps the faint
# facets apart, blends the ones that only shading separates and, on a 3x enlargement, follows the hard edges cleanly.
HOOD = dict(p=dict(T=6, ms=(4, 3), mode=1, speckle=12, eps=0.9, trap=2, snap=3, soft=4, soft_g=3.0, soft_ext=10, soft_eps=1.6, soft_area=200, up=3))
STD = dict(ld=4, ms=(5, 6), speckle=8, lift=20)
# Pieces with crisp, anti-aliased detail are traced from a 3x enlargement: the tracer then follows the edges instead of
# stepping along pixel rows (which showed as comb-like slivers on the eyebrows and the sunglasses).
FINE = dict(ld=4, ms=(5, 6), speckle=4, lift=20, upscale=3)
CFG = {
    # soft: regions that only posterisation separates are blended together again (no banding on the smooth walls);
    # snap: region borders are pulled onto the real edges of the picture (straight window bars, a clean speaker box)
    'far': dict(p=dict(T=16, ms=(8, 14), speckle=30, mode=2, eps=1.8, trap=4, edge_pad=16, soft=6, snap=4)), 'table': dict(STD, upscale=2), 'plant': STD,
    'camera': dict(ld=5, ms=(6, 8), speckle=10, lift=20, upscale=3),
    'torso': HOOD, 'r_upper': HOOD, 'r_forearm': HOOD, 'man_head': dict(FINE, speckle=5), 'r_hand': FINE, 'l_hand': FINE,
    'cat_tail': dict(STD, upscale=3), 'cat_body': STD, 'cat_head': dict(ld=3, ms=(4, 3), speckle=4, lift=20, upscale=3), 'cat_paw_l': dict(STD, upscale=3),
    'props_front': dict(STD, upscale=3), 'steam': STD,
    'mug': dict(ld=2, ms=(3, 2), speckle=6, lift=0),          # pale facets a few levels apart: hardly any smoothing
}
EPS = 0.85

def count_points(paths):
    n = 0
    for p in paths:
        g = p.get('group')
        if g:
            n += sum(len(sp) for sp in g['clip']) + count_points(g['paths'])
        else:
            n += sum(len(sp) for sp in p['subpaths'])
    return n

if __name__ == '__main__':
    names = sys.argv[1:] or list(CFG)
    tot = 0
    for n in names:
        if not os.path.exists(os.path.join(OUT, 'layer_%s.png' % n)):
            continue
        if 'p' in CFG[n]:                          # soft, out-of-focus layers: posterised tracer with gradient facets
            from ptrace import ptrace_layer
            paths = ptrace_layer(n, **CFG[n]['p'])
            tot += count_points(paths)
            continue
        paths = simplify(trace_layer(n, **CFG[n]), EPS)
        nu = unpeek(paths)
        ng = recolour(n, paths)
        d = json.load(open(os.path.join(OUT, 'vec_%s.json' % n)))
        d['paths'] = paths
        json.dump(d, open(os.path.join(OUT, 'vec_%s.json' % n), 'w'))
        npts = sum(len(sp) for p in paths for sp in p['subpaths'])
        tot += npts
        print('   -> simplified: paths %d points %d, gradients %d, edge-trimmed %d' % (len(paths), npts, ng, nu))
    print('total points', tot)
