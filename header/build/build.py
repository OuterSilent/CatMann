#!/usr/bin/env python3
"""Assemble the animated header from the traced vector layers.

../data/vec_<layer>.json + lights.json  ->  ../dist/hero.html (the whole header block), hero.css, hero.js
and two development pages that are not committed: test.html (plays by itself) and test_manual.html (driven by the
__cm hooks, for the tools in ../tools)."""
import json, os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
DIST = os.path.join(HERE, '..', 'dist')
os.makedirs(DIST, exist_ok=True)
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'pipe'))
import drawing
import rough
import shapely.geometry as sg
W, H = 2171, 724

def fmt(v):
    s = ('%.1f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def path_d(subpaths, nd=1):
    """Compact path data: absolute start, then relative line segments. nd: decimals kept (0 for the blurred background)."""
    out = []
    for sp in subpaths:
        pts = [(round(x, nd), round(y, nd)) for x, y in sp]
        pts = [q for i, q in enumerate(pts) if i == 0 or q != pts[i - 1]]
        if len(pts) > 1 and pts[-1] == pts[0]:
            pts.pop()
        if len(pts) < 3:
            continue
        d = 'M%s,%s' % (fmt(pts[0][0]), fmt(pts[0][1]))
        seg = []
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            dx, dy = fmt(x1 - x0), fmt(y1 - y0)
            seg.append(dx + (',' if not dy.startswith('-') else '') + dy)
        if seg:
            d += 'l' + ' '.join(seg)
        out.append(d + 'z')
    return ''.join(out)

def load(name):
    return json.load(open(os.path.join(DATA, 'vec_%s.json' % name)))

def svg_open(x0, y0, x1, y1, cls='pc'):
    """A piece sits in the stage by layout, in stage units (--x/--y/--w/--h times the unit --u, see hero.css): the browser
    then rasterises every layer at the size it is shown, whatever the size of the header."""
    return ('<svg class="%s" style="--x:%d;--y:%d;--w:%d;--h:%d" viewBox="%d %d %d %d" aria-hidden="true" focusable="false">'
            % (cls, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0))

GID = [0]
def gid():
    """Short document-unique id for a gradient (all inline SVGs of the page share one id namespace)."""
    n = GID[0]; GID[0] += 1
    out = ''
    while True:
        out = 'abcdefghijklmnopqrstuvwxyz'[n % 26] + out
        n = n // 26 - 1
        if n < 0:
            break
    return 'cm' + out

def piece_svg(name, extra='', pad=2, under='', nd=1):
    """Inline SVG of one traced piece. Facets that shade in the source carry a two-stop linear gradient; a "soft group"
    (regions of one smooth surface) is blurred together and clipped to its outline."""
    d = load(name)
    x0, y0, x1, y1 = d['bbox']
    defs, body, blurs = [], [], {}
    def one(p):
        fill = p['fill']
        if p.get('grad'):
            gx1, gy1, gx2, gy2, c1, c2 = p['grad']
            i = gid()
            defs.append('<linearGradient id="%s" gradientUnits="userSpaceOnUse" x1="%s" y1="%s" x2="%s" y2="%s"><stop stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
                        % (i, fmt(round(gx1, nd)), fmt(round(gy1, nd)), fmt(round(gx2, nd)), fmt(round(gy2, nd)), c1, c2))
            fill = 'url(#%s) %s' % (i, fill)
        dd = path_d(p['subpaths'], nd)
        return '<path fill="%s" d="%s"/>' % (fill, dd) if dd else ''
    for p in d['paths']:
        g = p.get('group')
        if not g:
            body.append(one(p))
            continue
        if g['blur'] not in blurs:
            blurs[g['blur']] = gid()
            defs.append('<filter id="%s" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="%s"/></filter>' % (blurs[g['blur']], fmt(g['blur'])))
        ci = gid()
        defs.append('<clipPath id="%s"><path d="%s"/></clipPath>' % (ci, path_d(g['clip'], nd)))
        body.append('<g clip-path="url(#%s)"><g filter="url(#%s)">%s</g></g>' % (ci, blurs[g['blur']], ''.join(one(q) for q in g['paths'])))
    dd = ('<defs>' + ''.join(defs) + '</defs>') if defs else ''
    return svg_open(x0 - pad, y0 - pad, x1 + pad, y1 + pad) + dd + under + ''.join(body) + extra + '</svg>'

def node(name, inner, cls=''):
    return '<div class="n%s" data-n="%s">%s</div>' % ((' ' + cls) if cls else '', name, inner)

def pts(p):
    return ' '.join('%s,%s' % (fmt(x), fmt(y)) for x, y in p)

# ------------------------------------------------------------------ authored details
NEON = rough.NEON
def neon_svg(cls, inner, style=''):
    return svg_open(1760, 0, 2204, 290, 'pc ' + cls).replace('style="', 'style="' + style, 1) + inner + '</svg>'
_pl = '<polyline%s points="' + pts(NEON) + '"/>'
GW = rough.NEON_GLOW['w']
neon = (''.join(neon_svg('neon-glow', _pl % (' stroke="#%02x%02x%02x" stroke-width="%s"' % (rgb + (fmt(GW),))), 'filter:blur(calc(%s*var(--u)));opacity:%s;' % (fmt(sig), fmt(op)))
                for sig, op, rgb in rough.NEON_GLOW['layers'])                                   # the halo on the wall, as fitted to the reference
        + neon_svg('neon-pulse', _pl % '')                                                      # extra bloom on every heartbeat
        + neon_svg('neon-tube', _pl % ' class="neon-edge"' + _pl % ' class="neon-core"')
        + neon_svg('neon-run', _pl % ' pathLength="100"'))                                      # the blip that runs along the trace

STEAM = [  # (fill, polygon) from the mug upwards
    ('#dcab9a', [(333.6, 493.6), (342.1, 493.6), (341.4, 465), (310.3, 459.3)]),
    ('#b1887b', [(310.3, 459.3), (341.4, 465), (335.4, 424.7)]),
    ('#dfb09d', [(341.4, 465), (335.4, 424.7), (375, 431.4)]),
    ('#bc9080', [(290.7, 385.7), (335.4, 424.7), (375, 431.4), (370.3, 407.1), (351.4, 413.3)]),
    ('#a57c73', [(290.7, 385.7), (303.6, 360.4), (370.3, 407.1), (351.4, 413.3)]),
    ('#7a5d5c', [(303.6, 360.4), (310, 343.6), (308.5, 362.5)]),
]
STEAM[-1] = ('url(#cmWisp)', [(302.4, 360.6), (306.8, 361.2), (310.8, 343)])            # the last wisp thins out into the air
STEAM_BACK = [(333.6, 493.6), (342.1, 493.6), (341.4, 465), (375, 431.4), (370.3, 407.1), (303.6, 360.4), (290.7, 385.7), (335.4, 424.7), (310.3, 459.3)]
steam = (svg_open(250, 320, 420, 500)
         + '<defs><linearGradient id="cmWisp" gradientUnits="userSpaceOnUse" x1="304.5" y1="361" x2="310.8" y2="343"><stop stop-color="#7a5d5c"/><stop offset="1" stop-color="#7a5d5c" stop-opacity="0"/></linearGradient></defs>'
         + '<g id="cmSteam"><polygon fill="#c39686" points="%s"/>' % pts(STEAM_BACK)      # backing shape: no hairline seams between the facets
         + ''.join('<polygon fill="%s" points="%s"/>' % (c, pts(p)) for c, p in STEAM) + '</g></svg>')

SHEET = drawing.SHEET
sheet = (svg_open(660, 610, 1600, 712)
         + '<defs><linearGradient id="cmPaper" gradientUnits="userSpaceOnUse" x1="700" y1="0" x2="1570" y2="0"><stop offset="0" stop-color="#f1d6c6"/><stop offset=".5" stop-color="#f3d8cb"/><stop offset="1" stop-color="#f5cdbb"/></linearGradient>'
         + '<clipPath id="cmSheetClip"><polygon points="%s"/></clipPath><filter id="cmSoft" x="-20%%" y="-40%%" width="140%%" height="180%%"><feGaussianBlur stdDeviation="1.8"/></filter></defs>' % pts(SHEET)
         + '<polygon points="%s" fill="url(#cmPaper)"/>' % pts(SHEET)
         + '<g clip-path="url(#cmSheetClip)"><g id="cmInk"></g>'
         + '<polygon id="cmShL" filter="url(#cmSoft)" fill="#a37768" points="1118,627 1180,630 1262,636 1330,633 1356,627 1344,641 1262,645 1170,641 1124,635"/>'
         + '<g id="cmShR" filter="url(#cmSoft)"><polygon fill="#7a4a3c" points="742,652 770,642 830,646 880,641 914,636 936,651 941,661 916,666 880,661 840,669 790,663 756,658"/></g>'
         + '</g></svg>')

def smooth(p, t=0.5):
    """Closed Catmull-Rom spline through the points, as cubic Beziers."""
    n = len(p)
    d = 'M%s,%s' % (fmt(p[0][0]), fmt(p[0][1]))
    for i in range(n):
        p0, p1, p2, p3 = p[(i - 1) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3)
        d += 'C%s,%s %s,%s %s,%s' % (fmt(c1[0]), fmt(c1[1]), fmt(c2[0]), fmt(c2[1]), fmt(p2[0]), fmt(p2[1]))
    return d + 'z'

# The cat's eyes, redrawn by hand over the reference (the tracer turns something this small into blocks).
IRIS_N = [(1481.3, 541.2), (1479.6, 541.7), (1478, 547.3), (1478.7, 550), (1482, 553.3), (1485.3, 555), (1490.3, 554.3), (1495.3, 553),
          (1497.3, 549.3), (1498.7, 544.7), (1499.7, 540.7), (1499.8, 534.5), (1493.7, 535.9), (1488.3, 537.4), (1487.3, 537.9)]
IRIS_SHADE = [(1487.3, 537.9), (1488.3, 537.4), (1493.7, 535.9), (1499.8, 534.5), (1499.7, 540.9), (1495, 541.9), (1491, 542.8), (1489.4, 541.4)]
PUPIL_N = [(1481.4, 540.5), (1481.8, 544.7), (1483.4, 547.8), (1485.7, 550.1), (1487.7, 551), (1489.3, 550), (1490.3, 547.3), (1490, 544),
           (1488.7, 540.7), (1487.3, 537.6), (1484, 538.6)]
IRIS_F = [(1436, 541), (1437.7, 542), (1440, 545.7), (1442, 549.3), (1444.7, 552), (1447.3, 554), (1445.3, 553.3), (1442.3, 551.7),
          (1440, 549), (1438, 545.3), (1436.3, 542.7)]
EYES = ('<defs><linearGradient id="cmIris" gradientUnits="userSpaceOnUse" x1="1478" y1="549" x2="1499" y2="544"><stop stop-color="#9a7d29"/><stop offset=".45" stop-color="#b09232"/><stop offset="1" stop-color="#bd9f45"/></linearGradient></defs>'
        '<polygon fill="#0a0806" points="%s"/>' % pts(rough.EYE_N)
        + '<polygon fill="url(#cmIris) #b09232" points="%s"/>' % pts(IRIS_N)
        + '<polygon fill="#7f6c2a" points="%s"/>' % pts(IRIS_SHADE)
        + '<path fill="#0b0905" d="%s"/>' % smooth(PUPIL_N)
        + '<polygon fill="#171005" points="%s"/>' % pts(rough.EYE_F)
        + '<polygon fill="#8f7218" points="%s"/>' % pts(IRIS_F))

def grown(poly, r):
    g = sg.Polygon(poly).buffer(r, join_style=2)
    return list(g.exterior.coords)[:-1]
LIDS = ('<polygon class="lid" fill="#a8725d" points="%s"/>' % pts(grown(rough.EYE_N, 1.1))
        + '<polygon class="lid" fill="#9a6a5b" points="%s"/>' % pts(grown(rough.EYE_F, 0.9))
        + '<path class="lidline" d="M1472,548.5L1484,554.5L1500.5,545.5M1431.5,541L1440,551.5L1448,558"/>')

WHISK = [((1422.9, 507.9), (1391.4, 485)), ((1422.1, 515), (1385.7, 497.6)), ((1421.4, 520.7), (1392.3, 516.6)),
         ((1447.9, 577.1), (1411.3, 571.4)), ((1448.6, 580.7), (1422.1, 591.4)), ((1451.4, 586.4), (1433, 596.4)), ((1453.6, 587.9), (1445.4, 604)),
         ((1494.3, 580), (1548.5, 592.1)), ((1501.4, 591.4), (1535, 604.3)), ((1500, 593.6), (1512.5, 608.5))]
def whisker(a, b, w=0.62, sag=1.8):
    """A hair: a sliver that is widest at the root and runs out to nothing, with a slight droop."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = (dx * dx + dy * dy) ** 0.5
    nx, ny = -dy / L, dx / L
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag
    return 'M%s,%sQ%s,%s %s,%sQ%s,%s %s,%sz' % (fmt(a[0] + nx * w), fmt(a[1] + ny * w), fmt(mx + nx * w * 0.6), fmt(my + ny * w * 0.6), fmt(b[0]), fmt(b[1]),
                                              fmt(mx - nx * w * 0.6), fmt(my - ny * w * 0.6), fmt(a[0] - nx * w), fmt(a[1] - ny * w))
whiskers = '<path class="whisk" d="%s"/>' % ''.join(whisker(a, b) for a, b in WHISK)

# Small crisp details the tracer rounds away: the rivets on his sunglasses and the glint in the eye of the print on the wall.
def diamond(cx, cy, rx, ry):
    return pts([(cx - rx, cy), (cx, cy - ry), (cx + rx, cy), (cx, cy + ry)])
RIVETS = ('<polygon fill="#f3c3a0" points="%s"/><polygon fill="#c9805c" points="%s"/>' % (diamond(973.75, 260, 3.9, 4), diamond(973.75, 260, 1.9, 1.9))
          + '<polygon fill="#f3c9aa" points="%s"/><polygon fill="#a8623c" points="%s"/>' % (diamond(1190.75, 284.4, 3.6, 3.5), diamond(1191.2, 284.4, 1.7, 1.7)))
GLINT = '<ellipse cx="2088.3" cy="202.3" rx="4.2" ry="3.6" fill="#e6ddd8"/>'

# The plant: light between the leaves (crisp facets with a bright rim) and a needle-thin leaf tip, drawn by hand over the
# traced piece. Colours measured on the reference (pipe/polyfill.py).
PP = rough.PLANT_PATCH
def poly(name, attrs):
    return '<polygon %s points="%s"/>' % (attrs, pts(PP[name]))
PLANT_FIX = (
    '<defs><linearGradient id="cmGapG" gradientUnits="userSpaceOnUse" x1="53.6" y1="159" x2="33.1" y2="170.4"><stop stop-color="#efb28a"/><stop offset="1" stop-color="#8e5a3c"/></linearGradient>'
    '<linearGradient id="cmTipG" gradientUnits="userSpaceOnUse" x1="236" y1="222" x2="250" y2="248"><stop stop-color="#dc915a"/><stop offset="1" stop-color="#e59d68"/></linearGradient>'
    '<linearGradient id="cmTipD" gradientUnits="userSpaceOnUse" x1="188" y1="0" x2="224" y2="0"><stop stop-color="#403427"/><stop offset="1" stop-color="#47382a"/></linearGradient>'
    '<linearGradient id="cmGapS" gradientUnits="userSpaceOnUse" x1="0" y1="217.3" x2="0" y2="273.5"><stop offset=".43" stop-color="#fbe7d6"/><stop offset=".52" stop-color="#f4bc90"/></linearGradient>'
    '<clipPath id="cmGapC"><polygon points="47.5,137 63,179.5 55,188.5 26.5,166.5 22,163 24,155 27,148 31,142 37,136 42,134"/></clipPath>'
    '<filter id="cmGapB" x="-30%%" y="-30%%" width="160%%" height="160%%"><feGaussianBlur stdDeviation="1.4"/></filter>'
    '<filter id="cmGapB2" x="-30%%" y="-30%%" width="160%%" height="160%%"><feGaussianBlur stdDeviation=".7"/></filter></defs>'
    # the out-of-focus leaf behind the opening: soft towards the leaf on its left, cut clean everywhere else
    '<g clip-path="url(#cmGapC)"><polygon filter="url(#cmGapB)" fill="url(#cmGapG)" points="%s"/></g>'
    % pts([(47, 132), (66, 180), (58, 196), (20, 168), (29.5, 163), (31, 157), (33, 151), (36, 146), (40, 141)])
    + poly('cream_up', 'fill="#feead4"') + poly('cream_lo', 'fill="#fde6cf" stroke="#fff8ee" stroke-width="1.2" stroke-linejoin="round"')
    + '<polyline fill="none" stroke="#fff8ee" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" points="%s"/>' % pts(PP['cream_up'])
    + '<g filter="url(#cmGapB2)">' + poly('mauve', 'fill="#745c57"') + poly('obrown', 'fill="#b6856e"') + poly('mauve3', 'fill="#785d58"') + '</g>'
    + poly('stripe', 'fill="url(#cmGapS) #f4bc90"')
    + '<polyline fill="none" stroke="#fff8ee" stroke-width="1" stroke-linecap="round" opacity=".85" points="45.4,243.4 61.6,217.4 61.2,243.6"/>'
    + poly('tip_dark', 'fill="url(#cmTipD) #47382a"') + poly('tip_orange', 'fill="url(#cmTipG) #e1965f"'))
# the plant reaches past the left edge of the picture (the layers shift against each other): one dark strip, under the leaves
PLANT_EDGE = '<path fill="#27231f" d="M-40,-10H8V545H-40z"/>'

# The lamps of the background: nested contours lifted off the reference (pipe/lights.py), a pale core inside a warm rim.
def lights_svg():
    defs, out = [], []
    for name, v in json.load(open(os.path.join(DATA, 'lights.json'))).items():
        for e in v['stack']:
            fill = e['fill']
            if e.get('grad'):
                gx1, gy1, gx2, gy2, c1, c2 = e['grad']
                i = gid()
                defs.append('<linearGradient id="%s" gradientUnits="userSpaceOnUse" x1="%s" y1="%s" x2="%s" y2="%s"><stop stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
                            % (i, fmt(gx1), fmt(gy1), fmt(gx2), fmt(gy2), c1, c2))
                fill = 'url(#%s) %s' % (i, fill)
            out.append('<path fill="%s" d="%s"/>' % (fill, path_d([e['pts']])))
    return ('<defs>' + ''.join(defs) + '</defs>' if defs else '') + ''.join(out)

# The foreleg that reaches for the sheet: the shaded side and the lit front of the leg, in the colours of the stretch of leg
# the picture shows above the paw, and the shadow the paw throws where it lands. The runtime sets the points.
leg = (svg_open(1430, 560, 1690, 706) + '<defs><filter id="cmPawSoft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>'
       '<g><polygon id="cmPawSh" filter="url(#cmPawSoft)" fill="#3a211c" opacity=".42" points="0,0"/><polygon id="cmLegS" fill="#593e39" points="0,0"/>'
       '<polygon id="cmLeg" fill="#8d6659" points="0,0"/><polygon id="cmLegL" fill="#9b7467" points="0,0"/></g></svg>')
sleeve = svg_open(1230, 300, 1730, 690) + '<polygon id="cmSlv" fill="#1b1818" points="0,0"/><polygon id="cmSlvF" fill="#262120" points="0,0"/><polygon id="cmSlvR" fill="#31434b" points="0,0"/><polygon id="cmSlvC" fill="#2a2423" points="0,0"/></svg>'

RIG = {
    'w': W, 'h': H, 'bpm': 92,
    'joints': {
        'tip': {'x': 936, 'y': 656}, 'wrist': {'x': 716, 'y': 600}, 'elbow': {'x': 505, 'y': 606}, 'shoulder': {'x': 772, 'y': 372},
        'hip': {'x': 1060, 'y': 660}, 'neck': {'x': 1062, 'y': 432},
        'lwrist': {'x': 1350, 'y': 590}, 'lelbow': {'x': 1392, 'y': 548}, 'lraise': {'x': 1318, 'y': 448}, 'ltuck': {'x': 1222, 'y': 583},
        'sheetPivot': {'x': 1240, 'y': 632},
        'catGround': {'x': 1700, 'y': 640}, 'tail': {'x': 1882, 'y': 585}, 'catNeck': {'x': 1548, 'y': 505}, 'catHead': {'x': 1480, 'y': 520},
        'paw': {'x': 1582, 'y': 620},
        # the leg above the paw: top of its front and side facets on the chest (legA-B-C), and where they meet the paw (pawA-B-C)
        'legA': {'x': 1572, 'y': 584}, 'legB': {'x': 1595, 'y': 579}, 'legC': {'x': 1625, 'y': 592},
        'pawA': {'x': 1571, 'y': 602}, 'pawB': {'x': 1595, 'y': 601}, 'pawC': {'x': 1615, 'y': 617},
    },
    'pawShadow': [[1550, 631], [1617, 632], [1629, 640], [1612, 647], [1560, 647], [1544, 640]],
    'pet': {'x': 1445, 'y': 452, 'rot': -6},
    'disturb': {'pawX': -46, 'pawY': 38, 'drag': 14, 'hx': 1335, 'hy': 612, 'hrot': 2},
    'strokes': drawing.build(cx=945.0, cy=665.0, half_w=96.0, v_span=0.33),
}

GID_BASE = GID[0]       # ids handed out above belong to the fixed snippets; the pieces start from here on every call

def stage_html():
    GID[0] = GID_BASE
    h = ['<div class="cm-stage">']
    h.append(node('far', piece_svg('far', lights_svg() + GLINT, nd=0), 'mv cm-far'))
    h.append(node('neon', neon, 'mv cm-neon'))
    h.append(node('steam', steam))
    h.append(node('torso', piece_svg('torso'), 'mv'))
    h.append(node('r_upper', piece_svg('r_upper'), 'mv'))
    h.append(node('man_head', piece_svg('man_head', RIVETS), 'mv'))
    h.append(node('table', piece_svg('table')))
    h.append(node('mug', piece_svg('mug')))
    h.append(node('sheet', sheet))
    h.append(node('cat_tail', piece_svg('cat_tail'), 'mv'))
    h.append(node('cat_body', piece_svg('cat_body'), 'mv'))
    h.append(node('cat_leg', leg))
    h.append(node('cat_paw_l', piece_svg('cat_paw_l'), 'mv'))
    # from the cat's head on, the pieces sit on stacking levels (z2..z4, see hero.css): the left hand and its sleeve (z3) can drop under the head
    h.append(node('cat_head', piece_svg('cat_head', EYES + LIDS + whiskers), 'mv z2'))
    h.append(node('props_front', piece_svg('props_front'), 'z2'))
    h.append(node('r_forearm', piece_svg('r_forearm'), 'mv z2'))
    h.append(node('r_hand', piece_svg('r_hand'), 'mv z2'))
    h.append(node('l_sleeve', sleeve, 'z3'))
    h.append(node('l_hand', piece_svg('l_hand'), 'mv z3'))
    h.append(node('plant', piece_svg('plant', PLANT_FIX, under=PLANT_EDGE), 'mv z4'))
    h.append(node('camera', piece_svg('camera'), 'mv cm-cam z4'))
    h.append('<button type="button" class="cm-cat-hit" data-cm-cat aria-label="Il gatto: toccalo per farlo interagire con l\'artista"></button>')
    h.append('</div>')
    return '\n'.join(h)

HERO_ALT = ("Illustrazione animata in stile low poly: Cosmin Mann, con cuffie e occhiali scuri, disegna un gatto a matita al tavolo di un locale. "
            "Accanto a lui un gatto grigio lo osserva, ogni tanto gli chiede una carezza e ogni tanto mette una zampa sul foglio.")
def hero_html(attrs=''):
    """The whole header: description for screen readers, the stage, and the pause button (shown by the script)."""
    return ('<div class="cm-hero" data-cm-hero%s><p class="cm-sr">%s</p>%s'
            '<button type="button" class="cm-pause" data-cm-pause hidden aria-pressed="false" aria-label="Metti in pausa l\'animazione" '
            'data-label-pause="Metti in pausa l\'animazione" data-label-play="Riprendi l\'animazione"></button></div>' % (attrs, HERO_ALT, stage_html()))

CSS = open(os.path.join(HERE, 'hero.css')).read()
JS = open(os.path.join(HERE, 'runtime.js')).read().replace('/*__RIG__*/ null', json.dumps(RIG, separators=(',', ':')))

TEST_PAGE = ('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>hero test</title>'
             '<style>html,body{margin:0;background:#141112}%s</style></head><body>%s<script>%s</script></body></html>')

if __name__ == '__main__':
    import gzip
    hero = hero_html()
    open(os.path.join(DIST, 'hero.html'), 'w').write(hero)
    open(os.path.join(DIST, 'hero.css'), 'w').write(CSS)
    open(os.path.join(DIST, 'hero.js'), 'w').write(JS)
    for name, attrs in (('test.html', ''), ('test_manual.html', ' data-cm-manual')):
        open(os.path.join(DIST, name), 'w').write(TEST_PAGE % (CSS, hero_html(attrs), JS))
    gz = lambda t: len(gzip.compress(t.encode())) // 1024
    print('header html %d KB (gzip %d KB), css %d KB, js %d KB (gzip %d KB)' % (len(hero) // 1024, gz(hero), len(CSS) // 1024, len(JS) // 1024, gz(JS)))
