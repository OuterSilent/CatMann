"""Posterised tracer: layer image -> flat-colour polygons, deterministic and free of the gradient chain-merging
that connectivity-based clustering suffers from.

1. edge-preserving smoothing (mean shift) so that anti-aliased facet edges snap to one side
2. palette built in a tone-lifted space with a bounded radius T (k-centre greedy + Lloyd): two facets further apart
   than ~2T never share a colour, however small they are
3. label clean-up (majority filter, speckles, thin fringes of in-between colour)
4. connected regions -> polygons, drawn large to small; every region is grown a little *under* the regions drawn after
   it (trapping), so independent simplification of neighbouring outlines can never open a hairline seam
"""
import sys, json
sys.path.insert(0, '.')
from common import *
from skimage import measure
from skimage.filters import rank
import shapely.geometry as sg


def lift_fwd(v, k):
    return 255.0 * np.log1p(np.asarray(v, np.float64) / k) / np.log1p(255.0 / k)


def palette(feat, weight, T, max_k=400):
    """k-centre greedy on weighted unique colours until every colour is within T of a centre, then Lloyd refinement."""
    centres = [np.average(feat, axis=0, weights=weight)]
    d = np.linalg.norm(feat - centres[0], axis=1)
    while len(centres) < max_k:
        i = int(np.argmax(d))
        if d[i] <= T:
            break
        centres.append(feat[i])
        d = np.minimum(d, np.linalg.norm(feat - feat[i], axis=1))
    C = np.array(centres)
    for _ in range(6):
        idx = nearest(feat, C)
        for j in range(len(C)):
            m = idx == j
            if m.any():
                C[j] = np.average(feat[m], axis=0, weights=weight[m])
    return C


def nearest(feat, C, chunk=200000):
    out = np.empty(len(feat), np.int32)
    for s in range(0, len(feat), chunk):
        f = feat[s:s + chunk]
        out[s:s + chunk] = np.argmin(((f[:, None, :] - C[None, :, :]) ** 2).sum(axis=2), axis=1)
    return out


def relabel_small(lbl, valid, min_area):
    """Regions smaller than min_area are absorbed by their surroundings (nearest surviving pixel)."""
    reg = measure.label(np.where(valid, lbl + 1, 0), connectivity=1, background=0)
    areas = np.bincount(reg.ravel())
    small = (areas < min_area)
    small[0] = False
    kill = small[reg] & valid
    if not kill.any():
        return lbl
    keep = valid & ~kill
    if not keep.any():
        return lbl
    idx = ndi.distance_transform_edt(~keep, return_distances=False, return_indices=True)
    out = lbl.copy()
    out[kill] = lbl[idx[0][kill], idx[1][kill]]
    return out


def remove_fringes(lbl, valid, C, width=1):
    """Thin strips whose colour lies between the colours of their two neighbours are anti-aliasing fringes: absorb them.
    Thin strips of an extreme colour (highlights, outlines) are real features and stay."""
    K = len(C)
    thin = np.zeros(lbl.shape, bool)
    se = disk(width)
    H_, W_ = lbl.shape
    for k, sl in enumerate(ndi.find_objects(np.where(valid, lbl + 1, 0), max_label=K)):       # per colour, inside its bounding box
        if sl is None:
            continue
        ys = slice(max(sl[0].start - width - 1, 0), min(sl[0].stop + width + 1, H_)); xs = slice(max(sl[1].start - width - 1, 0), min(sl[1].stop + width + 1, W_))
        m = (lbl[ys, xs] == k) & valid[ys, xs]
        thin[ys, xs] |= m & ~ndi.binary_opening(m, structure=se)
    comp = measure.label(np.where(thin, lbl + 1, 0), connectivity=2, background=0)
    n = comp.max()
    if n == 0:
        return lbl
    kill = np.zeros(lbl.shape, bool)
    objs = ndi.find_objects(comp)
    for i, sl in enumerate(objs, start=1):
        if sl is None:
            continue
        y0, y1 = max(sl[0].start - 2, 0), min(sl[0].stop + 2, lbl.shape[0])
        x0, x1 = max(sl[1].start - 2, 0), min(sl[1].stop + 2, lbl.shape[1])
        c = comp[y0:y1, x0:x1] == i
        own = lbl[y0:y1, x0:x1][c][0]
        ring = ndi.binary_dilation(c, structure=np.ones((3, 3), bool)) & ~c & valid[y0:y1, x0:x1]
        nb = lbl[y0:y1, x0:x1][ring]
        nb = nb[nb != own]
        if nb.size == 0:
            continue
        cnt = np.bincount(nb, minlength=K)
        top = np.argsort(cnt)[::-1][:2]
        if cnt[top[1]] == 0 or cnt[top[1]] < 0.15 * cnt[top[0]]:
            continue                                   # a line lying inside one region: a real detail
        a, b, cc = C[top[0]], C[top[1]], C[own]
        dab = np.linalg.norm(a - b)
        if np.linalg.norm(a - cc) + np.linalg.norm(cc - b) <= 1.2 * dab + 3:
            kill[y0:y1, x0:x1] |= c
    if not kill.any():
        return lbl
    keep = valid & ~kill
    idx = ndi.distance_transform_edt(~keep, return_distances=False, return_indices=True)
    out = lbl.copy()
    out[kill] = lbl[idx[0][kill], idx[1][kill]]
    return out


def hexcol(bgr):
    b, g, r = [int(round(min(255.0, max(0.0, v)))) for v in bgr]
    return '#%02x%02x%02x' % (r, g, b)


def fit_fill(m, px_img, xa, ya, min_area=60, min_span=5.0, rim=1):
    """Fill of a region: flat median colour, or a linear gradient when the original pixels really shade across it.
    -> (hex, None) or (hex_mid, [x1, y1, x2, y2, hex1, hex2]) with coordinates relative to the crop origin (xa, ya)."""
    ys, xs = np.nonzero(m)
    col = px_img[ys, xs].astype(np.float64)
    med = np.median(col, axis=0)
    if len(ys) < min_area:
        return hexcol(med), None
    inner = ndi.binary_erosion(m, structure=np.ones((3, 3), bool), iterations=rim)
    if inner.sum() >= max(min_area * 0.6, 0.45 * len(ys)):       # fit away from the anti-aliased rim when the region allows it
        ys2, xs2 = np.nonzero(inner)
        col2 = px_img[ys2, xs2].astype(np.float64)
    else:
        ys2, xs2, col2 = ys, xs, col
    P = np.stack([xs2, ys2], axis=1).astype(np.float64)
    pm = P.mean(axis=0); cm = col2.mean(axis=0)
    Pc = P - pm
    cov = Pc.T @ Pc / len(Pc)
    try:
        L = np.linalg.cholesky(cov + np.eye(2) * 1e-6)
    except np.linalg.LinAlgError:
        return hexcol(med), None
    Wh = np.linalg.solve(L, Pc.T).T                              # whitened positions
    G = np.linalg.lstsq(Wh, col2 - cm, rcond=None)[0].T          # 3x2: colour change per whitened unit
    U, S, Vt = np.linalg.svd(G, full_matrices=False)
    a = U[:, 0] * S[0]                                           # colour slope along the main shading direction
    w = np.linalg.solve(L.T, Vt[0])                              # t = w . (p - pm)
    Pall = np.stack([xs, ys], axis=1).astype(np.float64) - pm
    t = Pall @ w
    t0, t1 = np.percentile(t, 1), np.percentile(t, 99)
    span = np.abs(a).max() * (t1 - t0)
    if span < min_span:
        return hexcol(med), None
    # is the shading real? compare residuals of flat vs gradient model on the fitted pixels
    t2 = Pc @ w
    res_flat = np.abs(col2 - cm).mean()
    res_grad = np.abs(col2 - (cm + np.outer(t2, a))).mean()
    if res_grad > 0.8 * res_flat:
        return hexcol(med), None
    wn = w / (w @ w)
    A = pm + wn * t0; B = pm + wn * t1
    lo, hi = np.percentile(col, 2, axis=0), np.percentile(col, 98, axis=0)       # a fitted line must not overshoot the colours that are really there
    c1 = np.clip(cm + a * t0, lo, hi); c2 = np.clip(cm + a * t1, lo, hi)
    return hexcol(cm), [round(float(A[0] + xa + 0.5), 1), round(float(A[1] + ya + 0.5), 1), round(float(B[0] + xa + 0.5), 1), round(float(B[1] + ya + 0.5), 1), hexcol(c1), hexcol(c2)]


def lin_res(m, px_img):
    """Mean abs residual of the best linear colour model over mask m (and the model-free flat residual)."""
    ys, xs = np.nonzero(m)
    col = px_img[ys, xs].astype(np.float64)
    P = np.stack([xs, ys, np.ones(len(xs))], axis=1).astype(np.float64)
    coef = np.linalg.lstsq(P, col, rcond=None)[0]
    return np.abs(col - P @ coef).mean(), np.abs(col - col.mean(axis=0)).mean()


def split_regions(reg, px_img, tol=2.6, min_area=500, gain=0.72, depth=4):
    """Regions whose shading is not linear (round glows, bent gradients) are cut in two across their long axis,
    recursively, as long as that makes the linear models fit clearly better. The cuts are straight: more facets."""
    nxt = reg.max() + 1
    stack = [(r, 0) for r in range(1, reg.max() + 1)]
    objs = {r: sl for r, sl in enumerate(ndi.find_objects(reg), start=1)}
    while stack:
        r, d = stack.pop()
        sl = objs.get(r)
        if sl is None or d >= depth:
            continue
        m = reg[sl] == r
        n = int(m.sum())
        if n < min_area:
            continue
        pi = px_img[sl]
        res, _ = lin_res(m, pi)
        if res <= tol:
            continue
        ys, xs = np.nonzero(m)
        P = np.stack([xs, ys], axis=1).astype(np.float64)
        pm = P.mean(axis=0)
        ev, evec = np.linalg.eigh(np.cov((P - pm).T))
        axis = evec[:, 1]
        side = (P - pm) @ axis > 0
        if side.sum() < min_area * 0.3 or (~side).sum() < min_area * 0.3:
            continue
        a = np.zeros_like(m); b = np.zeros_like(m)
        a[ys[side], xs[side]] = True; b[ys[~side], xs[~side]] = True
        ra, _ = lin_res(a, pi); rb, _ = lin_res(b, pi)
        after = (ra * a.sum() + rb * b.sum()) / n
        if after > gain * res:
            continue
        # relabel: each connected part of the two halves becomes a region of its own
        first = True
        for half in (a, b):
            hl, hn = ndi.label(half)
            for h in range(1, hn + 1):
                hm = hl == h
                if first:
                    rid = r; first = False
                else:
                    rid = nxt; nxt += 1
                sub = reg[sl]
                sub[hm] = rid
                yy, xx = np.nonzero(hm)
                objs[rid] = (slice(sl[0].start + yy.min(), sl[0].start + yy.max() + 1), slice(sl[1].start + xx.min(), sl[1].start + xx.max() + 1))
                stack.append((rid, d + 1))
    return reg


def ring_points(mask, ox, oy, eps, min_area=1.5):
    """Sub-pixel outlines of a boolean mask (holes included) as simplified polygons in image coordinates."""
    pad = np.pad(mask, 1).astype(np.float32)
    subs = []
    for c in measure.find_contours(pad, 0.5):
        if len(c) < 4:
            continue
        pts = [(x - 1 + 0.5 + ox, y - 1 + 0.5 + oy) for y, x in c]
        ring = sg.Polygon(pts).exterior.simplify(eps, preserve_topology=False)
        cs = [(round(x, 1), round(y, 1)) for x, y in list(ring.coords)[:-1]]
        if len(cs) >= 3 and abs(sg.Polygon(cs).area) >= min_area:
            subs.append(cs)
    return subs


def snap_edges(reg, A, orig, lift, r=3, sigma=1.0):
    """Region borders are moved onto the crest of the image gradient (marker-controlled watershed, grown from the inner
    part of every region): a blurred straight edge then gets one straight outline instead of the bumpy iso-colour line
    the posterisation happened to draw, and the two sides of an edge agree on where it is."""
    from skimage.segmentation import watershed
    L = lift_fwd(orig, lift).astype(np.float32) if lift else orig.astype(np.float32)
    L = cv2.GaussianBlur(L, (0, 0), sigma)
    gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3)
    G = np.sqrt(gx ** 2 + gy ** 2).sum(axis=2)
    b = np.zeros(reg.shape, bool)                               # pixels that touch another region
    dh = reg[:, 1:] != reg[:, :-1]; dv = reg[1:, :] != reg[:-1, :]
    b[:, 1:] |= dh; b[:, :-1] |= dh; b[1:, :] |= dv; b[:-1, :] |= dv
    d = ndi.distance_transform_edt(~b)
    n = int(reg.max())
    maxd = ndi.maximum(d, reg, index=np.arange(n + 1))
    thr = np.minimum(r, 0.6 * maxd)[reg]
    markers = np.where((d >= thr) & (reg > 0), reg, 0)
    return watershed(G, markers, mask=A).astype(reg.dtype)


def label_regions(name, T=7.0, lift=20, ms=(5, 10), mode=1, speckle=10, fringe=1, edge_pad=0, src=None, grad=True, split=2.6, split_area=500, snap=0, up=1):
    """Layer image -> label image of posterised regions (0 outside the piece), the original colours and the crop origin."""
    rgba = cv2.imread(src or os.path.join(OUT, 'layer_%s.png' % name), cv2.IMREAD_UNCHANGED)
    alpha = rgba[:, :, 3] > 127
    x0, y0, x1, y1 = bbox(alpha, 3)
    col = rgba[y0:y1, x0:x1, :3].copy()
    A = alpha[y0:y1, x0:x1].copy()
    ox, oy = x0, y0
    if up > 1:                                     # work on a bicubic enlargement: region borders then follow the
        col = cv2.resize(col, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)     # anti-aliased edges with sub-pixel precision
        A = cv2.resize((A * 255).astype(np.uint8), None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC) > 127
        ms = (ms[0] * up, ms[1]) if ms else ms
        mode *= up; speckle *= up * up; fringe *= up; split_area *= up * up
    if edge_pad:                                   # full-frame layers: bleed beyond the picture so parallax never shows an edge
        col = cv2.copyMakeBorder(col, edge_pad, edge_pad, edge_pad, edge_pad, cv2.BORDER_REPLICATE)
        A = np.pad(A, edge_pad, mode='edge')
        ox -= edge_pad; oy -= edge_pad
    sm = cv2.pyrMeanShiftFiltering(col, sp=ms[0], sr=ms[1], maxLevel=0) if ms else col
    feat_img = lift_fwd(sm, lift) if lift else sm.astype(np.float64)
    # ---- palette from the colours actually present (5-bit bins of the lifted colour, weighted by count)
    fa = feat_img[A]
    q = np.round(fa / 4.0).astype(np.int32)
    key = (q[:, 0] << 16) | (q[:, 1] << 8) | q[:, 2]
    uk, inv, cnt = np.unique(key, return_inverse=True, return_counts=True)
    ufeat = np.zeros((len(uk), 3))
    for ch in range(3):
        ufeat[:, ch] = np.bincount(inv, weights=fa[:, ch], minlength=len(uk)) / cnt
    C = palette(ufeat, cnt.astype(np.float64), T)
    lbl = np.zeros(A.shape, np.int32)
    lbl[A] = nearest(fa, C)
    K = len(C)
    # ---- clean-up
    if K < 256 and mode:
        filt = rank.modal(lbl.astype(np.uint8), disk(mode), mask=A.astype(np.uint8))
        lbl = np.where(A, filt.astype(np.int32), lbl)
    lbl = relabel_small(lbl, A, speckle)
    if fringe:
        lbl = remove_fringes(lbl, A, C, fringe)
        lbl = relabel_small(lbl, A, speckle)
    reg = measure.label(np.where(A, lbl + 1, 0), connectivity=1, background=0)
    orig = col
    if snap:
        reg = snap_edges(reg, A, orig, lift, snap * up, 1.0 * up)
    if grad and split:
        reg = split_regions(reg, orig, tol=split, min_area=split_area)
    return dict(reg=reg, A=A, orig=orig, ox=ox, oy=oy, K=K, lift=lift)


def trapped(m, later, se):
    """Shape of an element: its own pixels, grown a little under whatever is drawn after it; holes that later
    elements cover completely are not cut out."""
    g = m | (ndi.binary_dilation(m, structure=se) & later) if se is not None else m.copy()
    holes = ndi.binary_fill_holes(g) & ~g
    if holes.any():
        hl, hn = ndi.label(holes)
        for h in range(1, hn + 1):
            hm = hl == h
            if later[hm].all():
                g |= hm
    return g


def soft_clusters(reg, orig, lift, g0=2.0, min_len=8, glift=None, hard_k=1.5, up=1):
    """Groups of regions that are separated only by 'seams' - borders the posterisation drew across smooth shading,
    where the picture itself has no edge. -> root label per region (regions of one group share a root)."""
    # glift: tone curve the edge strength is measured in (None: the tracer's own, which favours the dark tones; 0: plain sRGB)
    gl = lift if glift is None else glift
    L = lift_fwd(orig, gl).astype(np.float32) if gl else orig.astype(np.float32)
    L = cv2.GaussianBlur(L, (0, 0), 1.2 * up)
    gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3) / 8 * up; gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3) / 8 * up     # per source pixel
    min_len *= up
    G = np.sqrt(gx ** 2 + gy ** 2).max(axis=2)
    n = int(reg.max())
    pa, pb, pg = [], [], []
    for a, b, g in ((reg[:, :-1], reg[:, 1:], np.maximum(G[:, :-1], G[:, 1:])), (reg[:-1, :], reg[1:, :], np.maximum(G[:-1, :], G[1:, :]))):
        m = (a != b) & (a > 0) & (b > 0)
        pa.append(np.minimum(a[m], b[m])); pb.append(np.maximum(a[m], b[m])); pg.append(g[m])
    pa = np.concatenate(pa).astype(np.int64); pb = np.concatenate(pb).astype(np.int64); pg = np.concatenate(pg)
    key = pa * (n + 1) + pb
    order = np.argsort(key, kind='stable')
    key = key[order]; pg = pg[order]
    uk, start, cnt = np.unique(key, return_index=True, return_counts=True)
    # Seams join regions into groups, weakest border first. Two regions that share a real edge must never end up in
    # the same group, however long the chain of seams that would connect them round the back (cannot-link).
    seams, hard = [], [set() for _ in range(n + 1)]
    for k, s, c in zip(uk, start, cnt):
        if c < min_len:
            continue
        a, b = int(k // (n + 1)), int(k % (n + 1))
        g = pg[s:s + c]
        gm = float(g.mean())
        if gm < g0 and np.percentile(g, 80) < 1.5 * g0:
            seams.append((gm, a, b))
        elif gm >= hard_k * g0:
            hard[a].add(b); hard[b].add(a)
    parent = np.arange(n + 1)
    members = [{i} for i in range(n + 1)]
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    nsoft = 0
    for gm, a, b in sorted(seams):
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        if hard[ra] & members[rb] or hard[rb] & members[ra]:
            continue
        if len(members[ra]) < len(members[rb]):
            ra, rb = rb, ra
        parent[rb] = ra
        members[ra] |= members[rb]; hard[ra] |= hard[rb]
        members[rb] = set(); hard[rb] = set()
        nsoft += 1
    return np.array([find(i) for i in range(n + 1)]), nsoft


def ptrace_layer(name, T=7.0, lift=20, ms=(5, 10), mode=1, speckle=10, fringe=1, trap=2, eps=0.8, edge_pad=0, src=None, quiet=False, grad=True, min_span=5.0, split=2.6, split_area=500,
                 soft=0, soft_g=2.0, soft_ext=14, soft_eps=2.4, soft_area=500, snap=0, soft_lift=None, up=1, out=None):
    """soft > 0: regions that only a seam separates are drawn together in a group that is blurred by `soft` px and then
    clipped to the group's outline: smooth walls stay smooth, real edges stay where they are.
    up > 1: trace a bicubic enlargement (all lengths below are still given in source pixels)."""
    R = label_regions(name, T, lift, ms, mode, speckle, fringe, edge_pad, src, grad, split, split_area, snap, up)
    reg, A, orig, ox, oy, K = R['reg'], R['A'], R['orig'], R['ox'], R['oy'], R['K']
    U = float(up)
    trap_px = trap * up; ext_px = soft_ext * up
    def tr(subs):                                              # enlarged crop coordinates -> picture coordinates
        return [[(round(x / U + ox, 1), round(y / U + oy, 1)) for x, y in sp] for sp in subs]
    def trg(gr):
        return gr and [round(gr[0] / U + ox, 1), round(gr[1] / U + oy, 1), round(gr[2] / U + ox, 1), round(gr[3] / U + oy, 1), gr[4], gr[5]]
    def fill_of(mask, px, xa, ya, span):
        if not grad:
            return hexcol(np.median(px[mask], axis=0)), None
        f, gr = fit_fill(mask, px, xa, ya, min_area=60 * up * up, min_span=span, rim=up)
        return f, trg(gr)
    n = reg.max()
    root = np.arange(n + 1)
    if soft:
        root, nsoft = soft_clusters(reg, orig, lift, soft_g, glift=soft_lift, up=up)
        # groups that are too small to matter are drawn the plain way
        elem0 = root[reg]
        ar = np.bincount(elem0.ravel(), minlength=n + 1)
        members = np.bincount(root[1:], minlength=n + 1)
        for r in range(1, n + 1):
            if members[root[r]] > 1 and ar[root[r]] < soft_area * up * up:
                root[r] = -r                                   # mark: stand-alone
        root = np.where(root < 0, np.arange(n + 1), root)
    elem = root[reg]                                           # element id per pixel (0 outside the piece)
    ids = np.unique(elem[elem > 0])
    areas = np.bincount(elem.ravel(), minlength=n + 1)
    order = ids[np.argsort(-areas[ids], kind='stable')]
    rank_of = np.zeros(n + 1, np.int32)
    rank_of[order] = np.arange(1, len(order) + 1)              # 1 = drawn first (bottom)
    rk = rank_of[elem]
    objs = ndi.find_objects(elem)
    rareas = np.bincount(reg.ravel(), minlength=n + 1)
    se = disk(trap_px) if trap else None
    se2 = disk(2 * up)
    Hh, Ww = A.shape
    paths = []
    ngroups = 0
    for e in order:
        sl = objs[e - 1]
        mem = np.nonzero(root == e)[0]
        mem = mem[mem > 0]
        padw = (trap_px + 1) if len(mem) == 1 else (max(trap_px, ext_px) + 3)
        ya, yb = max(sl[0].start - padw, 0), min(sl[0].stop + padw, Hh)
        xa, xb = max(sl[1].start - padw, 0), min(sl[1].stop + padw, Ww)
        m = elem[ya:yb, xa:xb] == e
        later = rk[ya:yb, xa:xb] > rank_of[e]
        g = trapped(m, later, se)
        subs = tr(ring_points(g, xa, ya, eps * up, 1.5 * up * up))
        if not subs:
            continue
        osub = orig[ya:yb, xa:xb]
        if len(mem) == 1:
            fill, gr = fill_of(m, osub, xa, ya, min_span)
            en = {'fill': fill, 'subpaths': subs}
            if gr:
                en['grad'] = gr
            paths.append(en)
            continue
        # ---- a soft group: its regions, carried on a little beyond the outline so the blur has something to work with
        rsub = reg[ya:yb, xa:xb]
        dist, idx = ndi.distance_transform_edt(~m, return_indices=True)
        lab = np.where(dist <= ext_px, rsub[idx[0], idx[1]], 0)
        mo = mem[np.argsort(-rareas[mem], kind='stable')]
        mrank = {int(r): i for i, r in enumerate(mo)}
        mr = np.zeros(lab.shape, np.int32)
        for r in mo:
            mr[lab == r] = mrank[int(r)] + 1
        inner = []
        for r in mo:
            gm = lab == r
            if not gm.any():
                continue
            gg = trapped(gm, mr > mrank[int(r)] + 1, se2)
            ss = tr(ring_points(gg, xa, ya, soft_eps * up, 1.5 * up * up))
            if not ss:
                continue
            fill, gr = fill_of(rsub == r, osub, xa, ya, min(min_span, 2.5))
            en = {'fill': fill, 'subpaths': ss}
            if gr:
                en['grad'] = gr
            inner.append(en)
        paths.append({'group': {'clip': subs, 'blur': soft, 'paths': inner}})
        ngroups += 1
    flat = [p for p in paths if 'group' not in p] + [q for p in paths if 'group' in p for q in p['group']['paths']]
    npts = sum(len(sp) for p in flat for sp in p['subpaths']) + sum(len(sp) for p in paths if 'group' in p for sp in p['group']['clip'])
    ngr = sum(1 for p in flat if 'grad' in p)
    bb = [int(ox), int(oy), int(ox + A.shape[1] // up), int(oy + A.shape[0] // up)]
    json.dump({'name': name, 'bbox': bb, 'paths': paths}, open(out or os.path.join(OUT, 'vec_%s.json' % name), 'w'))
    if not quiet:
        print('%-12s palette %3d  regions %4d  gradients %4d  points %6d%s' % (name, K, len(flat), ngr, npts, ('  soft groups %d' % ngroups) if soft else ''))
    return paths


if __name__ == '__main__':
    import ast
    name = sys.argv[1]
    kw = {}
    for a in sys.argv[2:]:
        k, v = a.split('=')
        kw[k] = ast.literal_eval(v)
    ptrace_layer(name, **kw)
