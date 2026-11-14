#!/usr/bin/env python3
"""Preview page around the animated header -> ../dist/preview.html, a complete page that opens straight from the file system.
Texts and works are placeholders; the page exists to judge the header in context.

    python3 preview.py [--fragment PATH]

--fragment also writes the page content alone (no doctype, head or body) for hosts that supply the document themselves.
The header markup, CSS and runtime come from build.py."""
import os, sys, gzip
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build

PAGE_CSS = r"""
/* Layout: a plain bar with the name, then the animated scene edge to edge; under it one statement set large beside the
   actions, then the works as sheets of paper on the dark table. Corners are cut like facets, never rounded. */
:root{
  color-scheme:dark;
  --night:#141112; --surface:#1d1819; --line:#3a2f31; --graphite:#2b2628;
  --paper:#f3ddd0; --paper-dim:#cdb5a8; --muted:#a8958d; --paper-ink:#5f504b;
  --neon:#ff8a4c; --neon-ink:#1d0f07; --teal:#45b6cd;
  --f-display:'Instrument Serif','Iowan Old Style','Palatino Linotype',Georgia,serif;
  --f-text:'Inter Tight','Helvetica Neue',Arial,system-ui,sans-serif;
  --f-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  --gutter:clamp(16px,5vw,80px);
  --cut:12px;
}
*,*::before,*::after{box-sizing:border-box}
body{background:var(--night);color:var(--paper);font-family:var(--f-text);font-size:clamp(16px,.35vw + 15px,18px);line-height:1.55;-webkit-font-smoothing:antialiased}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
a{color:inherit}
:focus-visible{outline:2px solid var(--paper);outline-offset:3px}
.wrap{max-width:1440px;margin-inline:auto;padding-left:max(var(--gutter),env(safe-area-inset-left,0px));padding-right:max(var(--gutter),env(safe-area-inset-right,0px))}
.mono{font-family:var(--f-mono);font-size:clamp(11px,.1vw + 11px,13px);letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}

/* ---------- bar ---------- */
.bar{background:var(--night)}
.bar-in{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-block:14px;flex-wrap:wrap}
.brand{display:inline-flex;align-items:baseline;gap:8px;text-decoration:none}
.brand-name{font-family:var(--f-display);font-style:italic;font-size:clamp(26px,1vw + 22px,34px);line-height:1;letter-spacing:-.01em}
.brand-art{font-family:var(--f-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--neon)}
.links{display:flex;gap:clamp(18px,2.4vw,40px);align-items:center}
.links a{font-size:13px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;color:var(--paper-dim);padding-block:6px;border-bottom:1px solid transparent;transition:color .16s,border-color .16s}
.links a:hover{color:var(--paper);border-bottom-color:var(--neon)}
.menu-btn{display:none;font:500 13px/1 var(--f-text);letter-spacing:.1em;text-transform:uppercase;color:var(--paper);background:none;border:1px solid var(--line);padding:10px 14px;cursor:pointer;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
@media (max-width:640px){
  .menu-btn{display:block}
  .links{display:none;flex-basis:100%;flex-direction:column;align-items:flex-start;gap:4px;padding-bottom:6px}
  .bar.is-open .links{display:flex}
  .links a{font-size:15px;padding-block:10px}
}

/* ---------- statement ---------- */
.intro{padding-block:clamp(36px,6vw,88px) clamp(28px,4vw,56px)}
.intro-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(24px,5vw,88px);align-items:end}
.intro h1{margin:14px 0 0;font-family:var(--f-display);font-weight:400;font-size:clamp(40px,6.2vw,92px);line-height:.98;letter-spacing:-.02em;text-wrap:balance}
.intro h1 em{display:block;color:var(--paper-dim)}
.intro-side{display:flex;flex-direction:column;gap:22px;min-width:0}
.intro-side p{margin:0;max-width:44ch;color:var(--paper-dim)}
.actions{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-flex;align-items:center;gap:10px;font:600 14px/1 var(--f-text);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;padding:15px 20px;border:0;cursor:pointer;
  clip-path:polygon(0 0,calc(100% - var(--cut)) 0,100% var(--cut),100% 100%,var(--cut) 100%,0 calc(100% - var(--cut)));transition:transform .16s,background-color .16s,color .16s}
.btn-main{background:var(--neon);color:var(--neon-ink)}
.btn-main:hover{background:var(--paper)}
.btn-quiet{background:var(--surface);color:var(--paper);box-shadow:inset 0 0 0 1px var(--line)}
.btn-quiet:hover{background:var(--line)}
.btn:active{transform:translateY(1px)}
.btn[disabled]{opacity:.55;cursor:default}
@media (max-width:860px){.intro-grid{grid-template-columns:minmax(0,1fr)}}

/* preview-only strip */
.try{margin-top:clamp(28px,4vw,48px);padding:16px 18px;background:var(--surface);display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;
  clip-path:polygon(0 0,calc(100% - var(--cut)) 0,100% var(--cut),100% 100%,var(--cut) 100%,0 calc(100% - var(--cut)))}
.try .mono b{color:var(--neon);font-weight:500}
.try-btns{display:flex;flex-wrap:wrap;gap:8px}
.chip{font:500 13px/1 var(--f-text);letter-spacing:.04em;color:var(--paper);background:var(--night);border:0;box-shadow:inset 0 0 0 1px var(--line);padding:11px 14px;cursor:pointer;transition:box-shadow .16s,color .16s;
  clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
.chip:hover{box-shadow:inset 0 0 0 1px var(--neon)}
.try-status{flex:1 1 220px;min-width:0;margin:0;font-size:14px;color:var(--paper-dim)}

/* ---------- works ---------- */
.works{padding-block:clamp(28px,5vw,72px) clamp(48px,7vw,104px)}
.works-head{display:flex;align-items:center;gap:18px;margin-bottom:clamp(22px,3vw,40px)}
.works-head h2{margin:0;font:inherit}
.works-head h2,.works-head>span{flex:none;white-space:nowrap}
.beat{flex:1 1 auto;min-width:40px;height:26px;color:var(--neon)}
.beat polyline{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
.grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(18px,2.6vw,40px) clamp(14px,2.2vw,32px);align-items:end}
.work{margin:0;display:flex;flex-direction:column;gap:12px;min-width:0}
.work:nth-child(1){grid-column:span 5}.work:nth-child(2){grid-column:span 3}.work:nth-child(3){grid-column:span 4}
.work:nth-child(4){grid-column:2 / span 4}.work:nth-child(5){grid-column:span 3}.work:nth-child(6){grid-column:span 3}
.sheet{position:relative;background:var(--paper);box-shadow:0 18px 40px -22px rgba(0,0,0,.9),0 2px 0 rgba(0,0,0,.35)}
.sheet canvas{display:block;width:100%;height:auto}
.tag{position:absolute;left:10px;bottom:9px;font-family:var(--f-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--paper-ink)}
.work figcaption{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:12px;row-gap:2px;align-items:baseline}
.work .num{font-family:var(--f-mono);font-size:12px;letter-spacing:.08em;color:var(--neon)}
.work .name{font-family:var(--f-display);font-size:clamp(20px,1.2vw + 14px,28px);line-height:1.1}
.work .meta{grid-column:2;font-family:var(--f-mono);font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}
.work .meta span{white-space:nowrap}
@media (max-width:860px){.work:nth-child(n){grid-column:span 6}}
@media (max-width:480px){.work:nth-child(n){grid-column:span 12}}

/* ---------- shop / artist / foot ---------- */
.band{background:var(--surface)}
.band-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,5vw,88px);padding-block:clamp(40px,6vw,88px)}
.band h2{margin:10px 0 14px;font-family:var(--f-display);font-weight:400;font-size:clamp(32px,3.6vw,56px);line-height:1.02;letter-spacing:-.015em;text-wrap:balance}
.band p{margin:0 0 20px;max-width:46ch;color:var(--paper-dim)}
@media (max-width:860px){.band-in{grid-template-columns:minmax(0,1fr)}}
.foot{padding-block:clamp(36px,5vw,64px) 28px}
.foot-in{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px 40px}
.sign{font-family:var(--f-display);font-style:italic;font-size:clamp(44px,8vw,120px);line-height:.9;letter-spacing:-.02em}
.foot-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:15px;color:var(--paper-dim)}
.foot-list a{text-decoration-color:var(--neon);text-underline-offset:4px}
.note{margin-top:28px;padding-top:16px;border-top:1px solid var(--line)}
"""

PAGE_JS = r"""
(function () {
  'use strict';
  // ---- menu (phones)
  var bar = document.querySelector('.bar'), mb = document.getElementById('menu-btn');
  mb.addEventListener('click', function () { var o = bar.classList.toggle('is-open'); mb.setAttribute('aria-expanded', String(o)); });
  document.querySelectorAll('#links a').forEach(function (a) { a.addEventListener('click', function () { bar.classList.remove('is-open'); mb.setAttribute('aria-expanded', 'false'); }); });

  // ---- preview only: ask the cat for one of its three behaviours
  var hero = document.querySelector('[data-cm-hero]'), status = document.getElementById('try-status'), timer = 0;
  var SAY = { observe: 'Il gatto si sporge a guardare il foglio.', attention: 'Il gatto va a chiedere una carezza.', disturb: 'Il gatto punta il foglio con la zampa.' };
  document.querySelectorAll('[data-act]').forEach(function (b) {
    b.addEventListener('click', function () {
      clearTimeout(timer);
      if (hero.classList.contains('cm-static')) { status.textContent = 'Il tuo dispositivo chiede meno animazioni: l\'header resta fermo, con il disegno finito.'; return; }
      if (hero.classList.contains('cm-paused')) { status.textContent = 'L\'animazione è in pausa: riprendila con il pulsante in basso a destra nell\'immagine.'; return; }
      hero.dispatchEvent(new CustomEvent('cm:act', { detail: b.dataset.act }));
      hero.scrollIntoView({ block: 'nearest' });
      status.textContent = SAY[b.dataset.act] + ' Parte appena lui finisce il tratto.';
      timer = setTimeout(function () { status.textContent = 'Puoi anche toccare il gatto direttamente.'; }, 9000);
    });
  });

  // ---- placeholder works: a cat's eye in graphite facets, different on every sheet
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function delaunay(P) {                                   // Bowyer-Watson; fine for a few hundred points
    var n = P.length, pts = P.concat([[-10, -10], [20, -10], [-10, 20]]), T = [[n, n + 1, n + 2]];
    function circ(t) {
      var a = pts[t[0]], b = pts[t[1]], c = pts[t[2]], d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
      var ux = ((a[0] * a[0] + a[1] * a[1]) * (b[1] - c[1]) + (b[0] * b[0] + b[1] * b[1]) * (c[1] - a[1]) + (c[0] * c[0] + c[1] * c[1]) * (a[1] - b[1])) / d;
      var uy = ((a[0] * a[0] + a[1] * a[1]) * (c[0] - b[0]) + (b[0] * b[0] + b[1] * b[1]) * (a[0] - c[0]) + (c[0] * c[0] + c[1] * c[1]) * (b[0] - a[0])) / d;
      return [ux, uy, (a[0] - ux) * (a[0] - ux) + (a[1] - uy) * (a[1] - uy)];
    }
    T[0].c = circ(T[0]);
    for (var i = 0; i < n; i++) {
      var p = pts[i], bad = [], keep = [], edges = {};
      T.forEach(function (t) { var c = t.c; ((p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]) < c[2] ? bad : keep).push(t); });
      bad.forEach(function (t) { for (var k = 0; k < 3; k++) { var a = t[k], b = t[(k + 1) % 3], key = a < b ? a + '_' + b : b + '_' + a; edges[key] = edges[key] ? null : [a, b]; } });
      T = keep;
      for (var key in edges) if (edges[key]) { var t = [edges[key][0], edges[key][1], i]; t.c = circ(t); T.push(t); }
    }
    return T.filter(function (t) { return t[0] < n && t[1] < n && t[2] < n; });
  }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  var PAPER = [243, 221, 208], GRAPH = [38, 33, 35];
  function drawEye(cv, o) {
    var W = cv.width, H = cv.height, g = cv.getContext('2d'), R = rng(o.seed), asp = H / W;
    // eye geometry in sheet units (x 0..1, y 0..asp)
    var cx = o.cx, cy = o.cy * asp, half = o.size, tilt = o.tilt, hu = o.open * half * 0.56, hl = half * 0.36, ir = half * 0.5, slit = o.slit;
    function lid(t, up) { var x = -half + 2 * half * t, s = Math.pow(Math.sin(Math.PI * t), up ? 0.85 : 1.1), y = up ? -hu * s : hl * s; return [cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]; }
    function local(p) { var dx = p[0] - cx, dy = p[1] - cy; return [dx * Math.cos(tilt) + dy * Math.sin(tilt), -dx * Math.sin(tilt) + dy * Math.cos(tilt)]; }
    function inEye(q, grow) { var t = (q[0] + half) / (2 * half); if (t <= 0 || t >= 1) return false; var su = Math.pow(Math.sin(Math.PI * t), 0.85), sl = Math.pow(Math.sin(Math.PI * t), 1.1); return q[1] > -hu * su - grow && q[1] < hl * sl + grow; }
    var P = [], i, k;
    for (i = 0; i <= 22; i++) { P.push(lid(i / 22, true)); if (i > 0 && i < 22) P.push(lid(i / 22, false)); }
    for (i = 0; i < 18; i++) { var a = i / 18 * 6.283; var q = [Math.cos(a) * ir, Math.sin(a) * ir]; if (inEye(q, 0.004)) P.push([cx + q[0] * Math.cos(tilt) - q[1] * Math.sin(tilt), cy + q[0] * Math.sin(tilt) + q[1] * Math.cos(tilt)]); }
    for (i = 0; i < 12; i++) { var b = i / 12 * 6.283; var q2 = [Math.cos(b) * ir * slit, Math.sin(b) * ir * 0.92]; if (inEye(q2, 0)) P.push([cx + q2[0] * Math.cos(tilt) - q2[1] * Math.sin(tilt), cy + q2[0] * Math.sin(tilt) + q2[1] * Math.cos(tilt)]); }
    var cols = 9, rows = Math.round(9 * asp);
    for (i = 0; i <= cols; i++) for (k = 0; k <= rows; k++) {
      var edge = i === 0 || k === 0 || i === cols || k === rows;
      P.push([(i + (edge ? 0 : (R() - 0.5) * 0.8)) / cols, (k + (edge ? 0 : (R() - 0.5) * 0.8)) / rows * asp]);
    }
    for (i = 0; i < 40; i++) { var an = R() * 6.283, rr = half * (0.2 + R() * 1.25); P.push([Math.min(1, Math.max(0, cx + Math.cos(an) * rr)), Math.min(asp, Math.max(0, cy + Math.sin(an) * rr * 0.8))]); }
    function tone(p) {
      var q = local(p), d = Math.hypot(q[0], q[1]);
      var fade = Math.min(1, Math.max(0, (Math.min(p[0], 1 - p[0], p[1], asp - p[1]) - 0.05) / 0.16));      // the drawing runs out towards the edge of the sheet
      if (inEye(q, 0)) {
        if (Math.abs(q[0]) < ir * slit * Math.sqrt(Math.max(0, 1 - Math.pow(q[1] / (ir * 0.92), 2))) ) return 0.94;
        if (d < ir) return 0.34 + 0.26 * d / ir + 0.07 * Math.sin(Math.atan2(q[1], q[0]) * 7 + o.seed) + (q[1] < -ir * 0.45 ? 0.2 : 0);
        return 0.62 + 0.14 * R();
      }
      if (inEye(q, half * 0.075)) return 0.84;
      var near = Math.exp(-Math.max(0, d - half * 0.55) / (half * 0.55));
      return (0.1 + 0.34 * near + (R() - 0.5) * 0.12 + (q[1] < 0 ? 0.05 : 0)) * fade * o.ink;
    }
    g.fillStyle = 'rgb(' + PAPER.join(',') + ')'; g.fillRect(0, 0, W, H);
    delaunay(P).forEach(function (t) {
      var a = P[t[0]], b = P[t[1]], c = P[t[2]], m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3], v = tone(m);
      if (v < 0.035) return;
      var col = mix(PAPER, GRAPH, Math.min(1, v)).map(Math.round), s = 'rgb(' + col.join(',') + ')';
      g.beginPath(); g.moveTo(a[0] * W, a[1] * W); g.lineTo(b[0] * W, b[1] * W); g.lineTo(c[0] * W, c[1] * W); g.closePath();
      g.fillStyle = s; g.strokeStyle = s; g.lineWidth = 1; g.fill(); g.stroke();
    });
    // the glint, and two construction lines as on his sheet
    var hx = cx - ir * 0.34 * Math.cos(tilt) + ir * 0.4 * Math.sin(tilt), hy = cy - ir * 0.34 * Math.sin(tilt) - ir * 0.4 * Math.cos(tilt), hs = ir * 0.2;
    g.fillStyle = 'rgb(250,240,232)'; g.beginPath(); g.moveTo((hx - hs) * W, hy * W); g.lineTo(hx * W, (hy - hs * 0.8) * W); g.lineTo((hx + hs * 0.7) * W, (hy + hs * 0.5) * W); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(70,58,58,.32)'; g.lineWidth = Math.max(1, W / 420); g.beginPath();
    var ex = Math.cos(tilt) * half * 1.45, ey = Math.sin(tilt) * half * 1.45; g.moveTo((cx - ex) * W, (cy - ey) * W); g.lineTo((cx + ex) * W, (cy + ey) * W);
    g.moveTo((cx + Math.sin(tilt) * half * 1.1) * W, (cy - Math.cos(tilt) * half * 1.1) * W); g.lineTo((cx - Math.sin(tilt) * half * 0.9) * W, (cy + Math.cos(tilt) * half * 0.9) * W); g.stroke();
  }
  var EYES = [
    { seed: 11, cx: 0.5, cy: 0.5, size: 0.36, tilt: -0.06, open: 1, slit: 0.2, ink: 1 },
    { seed: 27, cx: 0.52, cy: 0.46, size: 0.4, tilt: 0.1, open: 0.78, slit: 0.34, ink: 0.85 },
    { seed: 43, cx: 0.48, cy: 0.52, size: 0.33, tilt: -0.14, open: 1.08, slit: 0.56, ink: 1.1 },
    { seed: 58, cx: 0.5, cy: 0.5, size: 0.42, tilt: 0.04, open: 0.5, slit: 0.26, ink: 0.9 },
    { seed: 71, cx: 0.46, cy: 0.48, size: 0.3, tilt: 0.16, open: 0.95, slit: 0.14, ink: 1 },
    { seed: 96, cx: 0.54, cy: 0.5, size: 0.38, tilt: -0.02, open: 0.88, slit: 0.44, ink: 0.8 }
  ];
  document.querySelectorAll('.sheet canvas').forEach(function (cv, i) { try { drawEye(cv, EYES[i % EYES.length]); } catch (e) {} });
})();
"""

WORKS = [  # (title, meta, canvas w, h)
    ('Senza titolo (Grigio)', '2026 · Grafite su carta · 40 × 50 cm', 800, 1000),
    ('Studio per uno sguardo', '2026 · Grafite su carta · 30 × 30 cm', 720, 720),
    ('Gattara', '2025 · Grafite su carta · 30 × 40 cm', 780, 1040),
    ('Notturno n. 3', '2025 · Grafite su carta · 40 × 30 cm', 960, 720),
    ('Pupilla', '2025 · Grafite su carta · 24 × 30 cm', 720, 900),
    ('Il sonno del giusto', '2024 · Grafite su carta · 30 × 30 cm', 720, 720),
]

def meta_html(meta):
    # each part stays on one line; the caption only breaks between parts
    parts = meta.split(' · ')
    return ' '.join('<span>%s%s</span>' % (p, ' ·' if k < len(parts) - 1 else '') for k, p in enumerate(parts))

def works_html():
    out = []
    for i, (name, meta, w, h) in enumerate(WORKS, start=1):
        out.append('<figure class="work"><div class="sheet"><canvas width="%d" height="%d" role="img" aria-label="Segnaposto: occhio di gatto a grafite, a sfaccettature"></canvas>'
                   '<span class="tag">Segnaposto</span></div>'
                   '<figcaption><span class="num">№ %02d</span><span class="name">%s</span><span class="meta">%s</span></figcaption></figure>' % (w, h, i, name, meta_html(meta)))
    return ''.join(out)

TITLE = '<title>Cosmin Mann Art</title>\n'
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">\n'

def styles():
    return ''.join(['<style>', PAGE_CSS, build.CSS, '</style>\n'])

def body():
    return ''.join([
        '<header class="bar" id="top"><div class="wrap bar-in">'
        '<a class="brand" href="#top" aria-label="Cosmin Mann Art: torna all\'inizio"><span class="brand-name">Cosmin Mann</span><span class="brand-art">Art</span></a>'
        '<button type="button" class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="links">Menu</button>'
        '<nav class="links" id="links" aria-label="Principale"><a href="#opere">Opere</a><a href="#artista">Artista</a><a href="#shop">Shop</a><a href="#contatti">Contatti</a></nav>'
        '</div></header>\n',
        '<main>\n', build.hero_html(), '\n',
        '<section class="intro"><div class="wrap">'
        '<div class="intro-grid"><div><span class="mono">Cosmin Mann · disegni a grafite</span>'
        '<h1>Gatti a grafite. <em>Un pelo alla volta.</em></h1></div>'
        '<div class="intro-side"><p>Matita, carta e un modello che non sta mai fermo. Qui trovi le opere finite; gli originali arriveranno nello shop.</p>'
        '<div class="actions"><a class="btn btn-main" href="#opere">Guarda le opere</a><a class="btn btn-quiet" href="#shop">Vai allo shop</a></div></div></div>'
        '<div class="try"><span class="mono"><b>Solo in anteprima</b> · chiedi al gatto di</span>'
        '<div class="try-btns"><button type="button" class="chip" id="act-observe" data-act="observe">Osservare</button>'
        '<button type="button" class="chip" id="act-attention" data-act="attention">Chiedere coccole</button>'
        '<button type="button" class="chip" id="act-disturb" data-act="disturb">Disturbare</button></div>'
        '<p class="try-status" id="try-status" aria-live="polite">Puoi anche toccare il gatto direttamente.</p></div>'
        '</div></section>\n',
        '<section class="works" id="opere"><div class="wrap">'
        '<div class="works-head"><h2 class="mono">Opere selezionate</h2>'
        '<svg class="beat" viewBox="0 0 600 26" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,15 250,15 262,15 270,4 281,24 290,9 298,15 600,15"/></svg>'
        '<span class="mono">№ 01 a 06</span></div>'
        '<div class="grid">', works_html(), '</div></div></section>\n',
        '<section class="band"><div class="wrap band-in">'
        '<div id="shop"><span class="mono">Shop · in arrivo</span><h2>Gli originali, dal suo tavolo al tuo muro.</h2>'
        '<p>Ogni disegno è un pezzo unico, firmato. La vetrina aprirà qui: per ora è solo una promessa.</p>'
        '<button type="button" class="btn btn-quiet" id="shop-soon" disabled>Apre presto</button></div>'
        '<div id="artista"><span class="mono">L\'artista</span><h2>Cuffie in testa, caffè vicino, gatto sul tavolo.</h2>'
        '<p>Cosmin disegna a grafite, ciocca dopo ciocca, finché lo sguardo non ricambia. Il resto della storia arriva con le sue parole.</p></div>'
        '</div></section>\n',
        '</main>\n',
        '<footer class="foot" id="contatti"><div class="wrap">'
        '<div class="foot-in"><div class="sign">Cosmin Mann Art</div>'
        '<ul class="foot-list"><li>Instagram: <a href="https://www.instagram.com/cosmin_mann" target="_blank" rel="noopener">@cosmin_mann</a></li>'
        '<li>Commissioni e contatti: in arrivo</li></ul></div>'
        '<p class="mono note">Anteprima di lavoro · testi e opere sono segnaposto</p>'
        '</div></footer>\n',
        '<script>', build.JS, '</script>\n<script>', PAGE_JS, '</script>\n',
    ])

def document():
    """The complete page."""
    return ''.join([
        '<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n',
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="robots" content="noindex">\n',
        TITLE, FONTS, '<style>body{margin:0}[hidden]{display:none!important}</style>\n', styles(),
        '</head>\n<body>\n', body(), '</body>\n</html>\n'])

def fragment():
    """Page content only; the meta asks the preview host to let the picture reach the side edges of the screen."""
    return ''.join([TITLE, '<meta name="claude:viewport-fit-sides" content="cover">\n', FONTS, styles(), body()])

if __name__ == '__main__':
    doc = document()
    open(os.path.join(build.DIST, 'preview.html'), 'w').write(doc)
    if '--fragment' in sys.argv:
        open(sys.argv[sys.argv.index('--fragment') + 1], 'w').write(fragment())
    print('preview %d KB (gzip %d KB)' % (len(doc) // 1024, len(gzip.compress(doc.encode())) // 1024))
