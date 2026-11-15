// The scrap of paper under the artist's hands. When nobody touches anything he draws a cat's
// face on it, hair by hair: the eyes first, then nose and mouth, then the fur in short curved
// strokes from the eyes outward, the whiskers last. Every face is a little different.
import * as artist from './artist.js';

const scrap = document.getElementById('scrap');
const cv = scrap.querySelector('canvas');
const ctx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

let W = 0, H = 0, dpr = 1, rect = null, ink = '#232327';
let strokes = [], si = 0, sp = 0, pen = [0, 0], phase = 'draw', hold = 0;
let rnd = Math.random;
const seeded = (s) => () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };

// ---------- the face ----------
function face(seed) {
  rnd = seeded(seed);
  const r = (a, b) => a + rnd() * (b - a);
  const P = {
    rx: r(0.9, 1.04), ry: r(0.74, 0.84), earX: r(0.62, 0.8), earY: r(-1.08, -0.92), earW: r(0.3, 0.4),
    eyeX: r(0.33, 0.4), eyeY: r(-0.08, 0.02), eyeW: r(0.15, 0.19), eyeH: r(0.075, 0.1), slit: r(0.012, 0.045),
    noseY: r(0.3, 0.36), tabby: rnd() < 0.7, tilt: r(-0.08, 0.08),
  };
  const out = [];
  const add = (pts, a = 0.8, w = 0.9, kind = 'line') => out.push({ pts, a, w, kind });
  const arc = (cx, cy, rx, ry, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]; });
  const curve = (x0, y0, x1, y1, bend, n = 6) => Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, nx = -(y1 - y0), ny = x1 - x0, b = Math.sin(t * Math.PI) * bend;
    return [x0 + (x1 - x0) * t + nx * b, y0 + (y1 - y0) * t + ny * b];
  });

  // eyes: lids, pupil, iris
  const eyes = [-1, 1].map((s) => [s * P.eyeX, P.eyeY]);
  for (const [ex, ey] of eyes) {
    const s = Math.sign(ex);
    add(curve(ex - P.eyeW, ey + 0.01 * s, ex + P.eyeW, ey - 0.02 * s, -0.32), 0.95, 1.1);
    add(curve(ex + P.eyeW, ey - 0.02 * s, ex - P.eyeW, ey + 0.01 * s, -0.22), 0.8, 0.9);
    for (let i = 0; i < 9; i++) { const t = -1 + (2 * i) / 8; add([[ex + t * P.slit, ey - P.eyeH * 0.82], [ex + t * P.slit * 0.6, ey], [ex + t * P.slit, ey + P.eyeH * 0.82]], 0.95, 1.0); }
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, c = Math.cos(a), d = Math.sin(a); add([[ex + c * P.eyeW * 0.3, ey + d * P.eyeH * 0.4], [ex + c * P.eyeW * 0.7, ey + d * P.eyeH * 0.82]], 0.32, 0.7); }
    // dark rim at the inner corner, as cats have
    add(curve(ex - s * P.eyeW, ey + 0.01, ex - s * (P.eyeW + 0.07), ey + 0.1, 0.15 * s), 0.7, 1.0);
  }
  // nose and mouth
  const ny = P.noseY;
  add([[-0.07, ny - 0.04], [0, ny + 0.03], [0.07, ny - 0.04]], 0.9, 1.1);
  add(curve(-0.07, ny - 0.04, 0.07, ny - 0.04, -0.12), 0.8, 0.9);
  add([[0, ny + 0.03], [0, ny + 0.1]], 0.85, 0.9);
  add(curve(0, ny + 0.1, -0.13, ny + 0.13, -0.3), 0.8, 0.9);
  add(curve(0, ny + 0.1, 0.13, ny + 0.13, 0.3), 0.8, 0.9);
  // contour, light and broken, then the ears
  const inEar = (x, y) => {
    const s = Math.sign(x) || 1, tx = s * P.earX, ty = P.earY, bx0 = s * (P.earX + P.earW * 0.85), bx1 = s * (P.earX - P.earW * 1.1), by0 = -0.3, by1 = -0.62;
    const sign = (ax, ay, bx, by, cx, cy) => (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
    const d1 = sign(x, y, tx, ty, bx0, by0), d2 = sign(x, y, bx0, by0, bx1, by1), d3 = sign(x, y, bx1, by1, tx, ty);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const inHead = (x, y) => (x / P.rx) ** 2 + ((y - 0.05) / P.ry) ** 2 <= 1 || inEar(x, y);
  for (let k = 0; k < 7; k++) { const a0 = 0.15 + k * 0.42; add(arc(0, 0.05, P.rx, P.ry, a0, a0 + 0.5, 5), 0.3, 0.8); }
  for (const s of [-1, 1]) {
    add(curve(s * (P.earX + P.earW * 0.85), -0.3, s * P.earX, P.earY, 0.06 * s), 0.55, 0.9);
    add(curve(s * P.earX, P.earY, s * (P.earX - P.earW * 1.1), -0.62, 0.05 * s), 0.55, 0.9);
    for (let i = 0; i < 7; i++) { const t = 0.25 + i * 0.09; add(curve(s * (P.earX + P.earW * 0.2 - t * 0.1), P.earY + 0.12 + t * 0.4, s * (P.earX - 0.02), P.earY + 0.12 + t * 0.2, 0.2 * s, 3), 0.35, 0.7); }
  }

  // fur: Poisson points inside the head, stroke direction from a flow field
  const nose = [0, ny];
  const pts = [];
  for (let tries = 0; tries < 6000 && pts.length < 520; tries++) {
    const x = (rnd() * 2 - 1) * 1.1, y = -1.1 + rnd() * 2.1;
    if (!inHead(x, y)) continue;
    if (eyes.some(([ex, ey]) => ((x - ex) / (P.eyeW * 1.05)) ** 2 + ((y - ey) / (P.eyeH * 1.15)) ** 2 < 1)) continue;
    if (Math.abs(x) < 0.09 && y > ny - 0.08 && y < ny + 0.14) continue;
    if (pts.every(([px, py]) => (px - x) ** 2 + (py - y) ** 2 > 0.0042)) pts.push([x, y]);
  }
  const fur = pts.map(([x, y]) => {
    let dx = x - nose[0], dy = y - nose[1];
    const s = Math.sign(x) || 1;
    if (inEar(x, y)) { dx = s * P.earX - x; dy = P.earY - y; }
    else if (y < -0.25 && Math.abs(x) < 0.55) { dx = x * 0.6; dy = -1; }          // forehead: up and out
    else if (y > ny - 0.05) { dx = s * 1; dy = 0.35; }                             // muzzle and chin: sideways
    const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const j = (rnd() - 0.5) * 0.5; const c = Math.cos(j), sn = Math.sin(j);
    [dx, dy] = [dx * c - dy * sn, dx * sn + dy * c];
    const edge = Math.max((x / P.rx) ** 2 + ((y - 0.05) / P.ry) ** 2, inEar(x, y) ? 0.9 : 0);
    let a = 0.42 + 0.3 * edge ** 3 + rnd() * 0.14;
    // tabby: the "M" on the forehead and stripes on the cheeks
    if (P.tabby) {
      const m = y < -0.3 && Math.abs(x) < 0.45 && Math.abs(Math.sin(x * 11 + 1.6)) < 0.38;
      const cheek = Math.abs(x) > 0.55 && y > -0.05 && Math.abs(Math.sin((y - Math.abs(x) * 0.5) * 16)) < 0.35;
      if (m || cheek) a += 0.3;
    }
    const len = (0.06 + rnd() * 0.06) * (inEar(x, y) ? 0.7 : 1) * (y > ny ? 0.75 : 1);
    const bend = (rnd() - 0.5) * 0.5;
    const order = Math.min(...eyes.map(([ex, ey]) => Math.hypot(x - ex, y - ey))) + rnd() * 0.12;
    return { pts: curve(x, y, x + dx * len, y + dy * len, bend, 3), a: Math.min(0.9, a), w: 0.75, kind: 'fur', order };
  }).sort((p, q) => p.order - q.order);
  out.push(...fur);
  // whiskers
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const y0 = ny + 0.08 + i * 0.045;
    add(curve(s * 0.16, y0, s * (0.95 + rnd() * 0.25), y0 - 0.12 + i * 0.1, 0.1 * s * (i - 1 + rnd() * 0.5), 8), 0.5, 0.7);
  }
  // to canvas px
  const k = Math.min(W / 2.3, H / 2.25), ox = W / 2, oy = H * 0.53;
  const ct = Math.cos(P.tilt), st = Math.sin(P.tilt);
  return out.map((o) => ({ ...o, pts: o.pts.map(([x, y]) => [ox + (x * ct - y * st) * k, oy + (x * st + y * ct) * k]) }));
}

// ---------- drawing ----------
function seg(o, from, to) {
  ctx.globalAlpha = o.a; ctx.lineWidth = o.w;
  ctx.beginPath();
  const p = o.pts, n = p.length - 1;
  const at = (t) => { const f = t * n, i = Math.min(n - 1, Math.floor(f)), u = f - i; return [p[i][0] + (p[i + 1][0] - p[i][0]) * u, p[i][1] + (p[i + 1][1] - p[i][1]) * u]; };
  const steps = Math.max(2, Math.ceil((to - from) * n * 2));
  let q = at(from); ctx.moveTo(q[0], q[1]);
  for (let i = 1; i <= steps; i++) { q = at(from + (to - from) * i / steps); ctx.lineTo(q[0], q[1]); }
  ctx.stroke();
  return q;
}
function start() {
  ctx.clearRect(0, 0, W, H);
  strokes = face((Math.random() * 1e9) | 0);
  si = 0; sp = 0; phase = 'draw'; hold = 0;
}
function advance(budget) {
  // budget: canvas px of stroke length to draw this frame
  while (budget > 0.05 && si < strokes.length) {
    const o = strokes[si];
    const len = o.pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - o.pts[i - 1][0], p[1] - o.pts[i - 1][1]) : 0), 0) || 1;
    const take = Math.min(1 - sp, budget / len);
    pen = seg(o, sp, sp + take);
    sp += take; budget -= take * len;
    if (sp >= 1 - 1e-6) { si++; sp = 0; budget -= 3; } // lifting the pencil costs a little
  }
}
function tick() {
  const paused = document.hidden || artist.isBusy() || document.body.classList.contains('is-gallery') || document.body.classList.contains('is-reading');
  if (!paused) {
    if (phase === 'draw') {
      const o = strokes[si];
      advance(o && o.kind === 'fur' ? 7 : 3.2);
      if (si >= strokes.length) { phase = 'hold'; hold = 0; }
    } else if (phase === 'hold') {
      if (++hold > 260) phase = 'fade';
    } else {
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.06)';
      ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
      if (++hold > 330) start();
    }
  }
  requestAnimationFrame(tick);
}

// ---------- placement ----------
let onPlace = () => {};
export function place() {
  const S = artist.scale(), cx = artist.center();
  const w = Math.round(Math.max(150, 400 * S)), h = Math.round(w * 0.74);
  const left = Math.round(cx - w / 2 + 40 * S), top = Math.round(artist.headBottom() - 18 * S);
  scrap.style.cssText = `width:${w}px;height:${h}px;left:${left}px;top:${top}px`;
  dpr = Math.min(2, devicePixelRatio || 1);
  W = w; H = h; cv.width = w * dpr; cv.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = ink = getComputedStyle(document.documentElement).getPropertyValue('--c-ink').trim() || ink;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  rect = { left, top, width: w, height: h };
  artist.setRest([left + w * 0.62, top + h * 0.7], [left + 14 * S, top + h * 0.86]);
  onPlace(rect);
  start();
  if (reduce.matches) { advance(1e6); }
}
/** Bottom of the scrap in viewport px: the page keeps its content below it. */
export const bottom = () => (rect ? rect.top + rect.height : 0);
export function init(cb) {
  if (cb) onPlace = cb;
  place();
  window.addEventListener('resize', place);
  artist.setIdle(() => (document.body.classList.contains('is-reading') ? null : [rect.left + pen[0], rect.top + pen[1]]));
  if (!reduce.matches) requestAnimationFrame(tick);
}
