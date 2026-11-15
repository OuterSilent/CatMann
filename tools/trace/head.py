"""Head seen from above: traced ear cups and hood, procedural short curly hair and headband."""
import numpy as np, random, math
from centerline import load_gray, trace, smooth_d

BOX = (280, 820, 810, 1402)           # crop of ref/artista-dallalto.png
C = (265.0, 292.0); RX, RY = 158.0, 196.0   # hair mass, crop coordinates


def in_ell(x, y, k=1.0):
    return ((x - C[0]) / (RX * k)) ** 2 + ((y - C[1]) / (RY * k)) ** 2 <= 1


def build(seed=5):
    rnd = random.Random(seed)
    g = load_gray('ref/artista-dallalto.png')[BOX[1]:BOX[3], BOX[0]:BOX[2]]
    r = trace(g)
    keep = []
    for l in r['lines']:
        # drop the straight hair, the headband, the sheet of paper and the arms
        m = l.mean(0)
        if in_ell(m[0], m[1], 1.13):
            continue
        if m[1] < 240 or (m[1] < 395 and (m[0] < 42 or m[0] > 492)):
            continue
        # clip the remaining lines where they enter the hair mass
        seg = [p for p in l if not in_ell(p[0], p[1], 0.98)]
        if len(seg) >= 2:
            keep.append(np.array(seg))
    # curls: chains of loops (a trochoid) running along rings around the crown
    def loops(path_fn, length, r, step, phase, hand):
        """Loop chain along a guide: path_fn(u) -> (x, y, tangent angle), u in pixels."""
        pts = []
        n = int(length / step * 14)
        for i in range(n + 1):
            u = length * i / n
            x, y, ta = path_fn(u)
            a = phase + hand * 2 * math.pi * u / step
            rr = r * (0.85 + 0.3 * math.sin(u * 0.21 + phase))
            pts.append((x + math.cos(a + ta) * rr, y + math.sin(a + ta) * rr * 0.9))
        return pts
    crown = (C[0] + 12, C[1] + 34)
    def ring(k, wob):
        def fn(u, k=k, wob=wob):
            # walk the ellipse of scale k by arc length (approximate)
            per = math.pi * (3 * (RX + RY) - math.sqrt((3 * RX + RY) * (RX + 3 * RY))) * k
            t = u / per * 2 * math.pi + wob
            kk = k * (1 + 0.03 * math.sin(5 * t + wob))
            cx = C[0] + (crown[0] - C[0]) * (1 - k); cy = C[1] + (crown[1] - C[1]) * (1 - k)
            x = cx + math.cos(t) * RX * kk; y = cy + math.sin(t) * RY * kk
            return x, y, math.atan2(math.cos(t) * RY, -math.sin(t) * RX)
        per = math.pi * (3 * (RX + RY) - math.sqrt((3 * RX + RY) * (RX + 3 * RY))) * k
        return fn, per
    curls = []
    # outer ring: one closed chain, it is the outline of the hair
    fn, per = ring(1.0, rnd.uniform(0, 6))
    nl = round(per / 21)
    out = loops(fn, per, 9.5, per / nl, 0.0, 1)
    pts = []
    tries = 0
    while tries < 6000:
        tries += 1
        a = rnd.uniform(0, 6.283); d = math.sqrt(rnd.random())
        x = C[0] + math.cos(a) * RX * 0.86 * d; y = C[1] + math.sin(a) * RY * 0.86 * d
        if all((x - px) ** 2 + (y - py) ** 2 > 27 ** 2 for px, py in pts):
            pts.append((x, y))
    for (x, y) in pts:
        tang = math.atan2(y - crown[1], x - crown[0]) + math.pi / 2 + rnd.uniform(-1.0, 1.0)
        ln = rnd.uniform(26, 52); curv = rnd.uniform(-0.02, 0.02)
        def guide(v, x=x, y=y, tang=tang, ln=ln, curv=curv):
            w = v - ln / 2
            a = tang + curv * w
            return x + math.cos(a) * w, y + math.sin(a) * w, a
        seg = loops(guide, ln, rnd.uniform(6.0, 8.5), rnd.uniform(14, 18), rnd.uniform(0, 6.28), rnd.choice((1, -1)))
        curls.append(seg)
    # headband: two arcs between the ear cups
    def arc(y_mid, x0, x1, y_end):
        return [(x0 + (x1 - x0) * i / 24, y_end - (y_end - y_mid) * math.sin(math.pi * i / 24) ** 0.85) for i in range(25)]
    band_out = arc(128, 78, 452, 262); band_in = arc(176, 96, 434, 268)
    return dict(w=BOX[2] - BOX[0], h=BOX[3] - BOX[1], sil=r['sil'], lines=keep, hair=out, curls=curls, band=(band_out, band_in))


def svg(h, fill="#fcfbf8", ink="#232327", sw=1.4):
    P = lambda d, f="none", s=ink: f'<path d="{d}" fill="{f}" stroke="{s}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {h["w"]} {h["h"]}" width="{h["w"]}" height="{h["h"]}">'
    s += P(smooth_d(h['sil'], True), fill, "none")
    s += P("".join(smooth_d(l) for l in h['lines']))
    s += P(smooth_d(h['hair'], True), fill, 'none') + P(smooth_d(h['hair'], True))
    s += P("".join(smooth_d(c) for c in h['curls']))
    bo, bi = h['band']
    s += P(smooth_d(bo) + "L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in bi[::-1]) + "Z", fill, "none")
    s += P(smooth_d(bo) + smooth_d(bi))
    return s + "</svg>"


if __name__ == '__main__':
    h = build()
    open('tools/view/head.svg', 'w').write(svg(h))
