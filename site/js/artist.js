// The artist seen from above: head and shoulders at the bottom edge, two arms that reach
// any point of the screen. Hands are traced drawings; sleeves are drawn as tubes.
import { FIG } from './figures.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

const svg = document.getElementById('artist');
let vw = 0, vh = 0, S = 0.5, cx = 0;
let mode = 'desk';
const body = { lean: 0, drop: 0, dropTo: 0, shift: 0 };
const UPPER = 250; // natural upper-arm length, source px

function figure(key, parent) {
  const f = FIG[key];
  const g = el('g', { 'data-fig': key }, parent);
  el('path', { d: f.sil, class: 'paperfill' }, g);
  el('path', { d: f.ink, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, g);
  return g;
}

// ---- build ----
const gArmsUp = el('g', {}, svg);
const gHands = el('g', {}, svg);
const gTorso = el('g', {}, svg);
const tube = (parent) => ({ o: el('path', { class: 'tube-o' }, parent), i: el('path', { class: 'tube-i' }, parent), f: el('path', { class: 'ln' }, parent) });
const arms = {
  L: { side: -1, fig: 'handL', x: 0, y: 0, tube: tube(gArmsUp), figs: {}, rest: [0, 0] },
  R: { side: 1, fig: 'handRwrite', x: 0, y: 0, tube: tube(gArmsUp), figs: {}, rest: [0, 0] },
};
for (const k of ['handL']) arms.L.figs[k] = figure(k, gHands);
for (const k of ['handRwrite', 'handRsweep', 'handReraser']) arms.R.figs[k] = figure(k, gHands);
const shoulders = tube(gTorso);
const gHead = el('g', {}, gTorso);
{
  const h = FIG.head;
  el('path', { d: h.sil, class: 'paperfill' }, gHead);
  el('path', { d: h.ink, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, gHead);
  const hair = el('g', { class: 'hair' }, gHead);
  el('path', { d: h.hairSil, class: 'paperfill' }, hair);
  el('path', { d: h.hair, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, hair);
  el('path', { d: h.bandSil, class: 'paperfill' }, gHead);
  el('path', { d: h.band, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, gHead);
}
const style = el('style', {}, svg);
style.textContent = `.tube-o{fill:none;stroke:var(--c-ink);stroke-linecap:round}.tube-i{fill:none;stroke:var(--c-paper);stroke-linecap:round}`;

function layout() {
  vw = window.innerWidth; vh = window.innerHeight;
  strokeW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stroke')) || 1.25;
  svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  S = clamp(Math.min(vw / 2700, vh / 1500), 0.34, 0.66);
  cx = vw / 2;
  arms.L.rest = [cx - 330 * S, vh - 150 * S];
  arms.R.rest = [cx + 300 * S, vh - 170 * S];
  dirty = true;
}

export function scale() { return S; }
export function center() { return cx; }

// ---- pose ----
function shoulderY() { return vh - 300 * S + 520 * S + body.drop - body.lean; }
function solveArm(a) {
  const f = FIG[a.fig];
  const v0x = (f.tip[0] - f.elbow[0]) * S, v0y = (f.tip[1] - f.elbow[1]) * S;
  const fl = Math.hypot(v0x, v0y), u = UPPER * S;
  const sx = cx + body.shift + a.side * 300 * S, sy = shoulderY();
  const dx = a.x - sx, dy = a.y - sy, d = Math.hypot(dx, dy) || 1;
  let ex, ey;
  if (d >= u + fl - 1) { ex = a.x - (dx / d) * fl; ey = a.y - (dy / d) * fl; }
  else {
    const dd = Math.max(d, Math.abs(u - fl) + 1);
    const k = (u * u - fl * fl + dd * dd) / (2 * dd);
    const h = Math.sqrt(Math.max(0, u * u - k * k));
    const bx = sx + (dx / d) * k, by = sy + (dy / d) * k;
    const px = -dy / d, py = dx / d;
    const sign = (px * a.side >= 0 ? 1 : -1); // elbow points away from the body
    ex = bx + px * h * sign; ey = by + py * h * sign;
    // keep the forearm length exact
    const tx = a.x - ex, ty = a.y - ey, tl = Math.hypot(tx, ty) || 1;
    ex = a.x - (tx / tl) * fl; ey = a.y - (ty / tl) * fl;
  }
  const rot = Math.atan2(a.y - ey, a.x - ex) - Math.atan2(v0y, v0x);
  return { sx, sy, ex, ey, rot, f };
}

let dirty = true, strokeW = 1.25;
function render() {
  const lw = strokeW;
  for (const key of ['L', 'R']) {
    const a = arms[key];
    const p = solveArm(a);
    const w = p.f.sleeve * S;
    const d = `M${p.sx.toFixed(1)},${p.sy.toFixed(1)}L${p.ex.toFixed(1)},${p.ey.toFixed(1)}`;
    a.tube.o.setAttribute('d', d); a.tube.i.setAttribute('d', d);
    a.tube.o.setAttribute('stroke-width', w + lw); a.tube.i.setAttribute('stroke-width', w - lw);
    // sleeve folds: short creases across the tube, more of them when the arm is stretched
    {
      const ax = p.ex - p.sx, ay = p.ey - p.sy, al = Math.hypot(ax, ay) || 1, ux = ax / al, uy = ay / al, nx = -uy, ny = ux;
      let fd = '';
      const n = Math.max(2, Math.round(al / (95 * S)));
      for (let i = 1; i <= n; i++) {
        const t = (i - 0.35) / (n + 0.4), side = (i % 2 ? 1 : -1) * a.side;
        const bx = p.sx + ax * t, by = p.sy + ay * t;
        const x0 = bx + nx * side * w * 0.5, y0 = by + ny * side * w * 0.5;
        const x1 = bx - nx * side * w * 0.08 + ux * w * 0.3, y1 = by - ny * side * w * 0.08 + uy * w * 0.3;
        const mx = (x0 + x1) / 2 + ux * w * 0.12, my = (y0 + y1) / 2 + uy * w * 0.12;
        fd += `M${x0.toFixed(1)},${y0.toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
      }
      a.tube.f.setAttribute('d', fd);
    }
    for (const k in a.figs) {
      const g = a.figs[k];
      if (k !== a.fig) { g.setAttribute('display', 'none'); continue; }
      g.removeAttribute('display');
      g.setAttribute('transform', `translate(${p.ex.toFixed(2)} ${p.ey.toFixed(2)}) rotate(${(p.rot * 180 / Math.PI).toFixed(2)}) scale(${S}) translate(${-p.f.elbow[0]} ${-p.f.elbow[1]})`);
    }
  }
  const sy = shoulderY();
  const sd = `M${(cx + body.shift - 290 * S).toFixed(1)},${sy.toFixed(1)}L${(cx + body.shift + 290 * S).toFixed(1)},${sy.toFixed(1)}`;
  shoulders.o.setAttribute('d', sd); shoulders.i.setAttribute('d', sd);
  shoulders.o.setAttribute('stroke-width', 250 * S + lw); shoulders.i.setAttribute('stroke-width', 250 * S - lw);
  const hx = cx + body.shift - 265 * S + headTurn * 14 * S, hy = vh - 300 * S + body.drop - body.lean;
  gHead.setAttribute('transform', `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${(headTurn * 3 + nod).toFixed(2)} ${265 * S} ${300 * S}) scale(${S})`);
}

// ---- motion ----
let headTurn = 0, nod = 0;
const tweens = new Set();
function tween(ms, fn) {
  return new Promise((res) => {
    if (reduce.matches || ms <= 0) { fn(1); dirty = true; return res(); }
    const t = { t0: performance.now(), ms, fn, res };
    tweens.add(t);
  });
}
let idleTarget = null; // () => [x, y] for the right hand when nothing else is going on
export function setIdle(fn) { idleTarget = fn; }
let busy = 0;
export const isBusy = () => busy > 0;

function frame(now) {
  for (const t of tweens) {
    const k = Math.min(1, (now - t.t0) / t.ms);
    t.fn(k); dirty = true;
    if (k >= 1) { tweens.delete(t); t.res(); }
  }
  // idle: the right hand follows the doodle, the left one keeps the sheet still
  if (!busy && !reduce.matches) {
    const tgt = mode === 'desk' && idleTarget ? idleTarget() : null;
    const [rx, ry] = tgt || arms.R.rest;
    const R = arms.R;
    if (Math.abs(R.x - rx) + Math.abs(R.y - ry) > 0.05) { R.x = lerp(R.x, rx, 0.16); R.y = lerp(R.y, ry, 0.16); dirty = true; }
    if (R.fig !== 'handRwrite') { R.fig = 'handRwrite'; dirty = true; }
  }
  // the left hand drifts toward a spot to the left of the right hand, never far from rest
  {
    const L = arms.L, R = arms.R;
    const active = busy && R.y < vh - 260 * S;
    const lx = active ? clamp(L.rest[0] + body.shift + (R.x - cx) * 0.22, 20, vw - 20) : L.rest[0];
    const ly = active ? Math.max(R.y + 190 * S, vh - 470 * S) : L.rest[1];
    if (Math.abs(L.x - lx) + Math.abs(L.y - ly) > 0.3) { L.x = lerp(L.x, lx, 0.07); L.y = lerp(L.y, ly, 0.07); dirty = true; }
  }
  // body follows the pencil a little
  {
    const R = arms.R;
    const lean = busy ? clamp((vh * 0.62 - R.y) / (vh * 0.62), 0, 1) * 190 * S : 0;
    const shift = busy ? clamp((R.x - cx) * 0.42, -vw * 0.24, vw * 0.24) : 0;
    if (Math.abs(shift - body.shift) > 0.2) { body.shift = lerp(body.shift, shift, 0.12); dirty = true; }
    if (Math.abs(lean - body.lean) > 0.2) { body.lean = lerp(body.lean, lean, 0.12); dirty = true; }
    if (Math.abs(body.dropTo - body.drop) > 0.2) { body.drop = lerp(body.drop, body.dropTo, 0.1); dirty = true; }
    const turn = clamp((R.x - cx - body.shift) / (vw * 0.4), -1, 1);
    if (Math.abs(turn - headTurn) > 0.004) { headTurn = lerp(headTurn, turn, 0.08); dirty = true; }
    if (!reduce.matches) { const n = Math.sin(now / 520) * 0.5; if (Math.abs(n - nod) > 0.02) { nod = n; dirty = true; } }
  }
  if (dirty) { dirty = false; render(); }
  requestAnimationFrame(frame);
}

/** Move a hand's tip to a viewport point along a slightly lifted arc. */
export function moveTo(x, y, ms = 110, key = 'R') {
  const a = arms[key]; const x0 = a.x, y0 = a.y;
  const lift = Math.min(18, Math.hypot(x - x0, y - y0) * 0.06);
  return tween(ms, (k) => { const e = easeInOut(k); a.x = lerp(x0, x, e); a.y = lerp(y0, y, e) - Math.sin(e * Math.PI) * lift; });
}
/** Put the tip at a viewport point right now (used while following a stroke). */
export function at(x, y, key = 'R') { const a = arms[key]; a.x = x; a.y = y; dirty = true; }
export function tip(key = 'R') { return [arms[key].x, arms[key].y]; }
export function use(fig) { arms.R.fig = fig; dirty = true; }
export function acquire() { busy++; }
export function release() { busy = Math.max(0, busy - 1); }
export { tween };

export function setMode(m) {
  mode = m;
  body.dropTo = m === 'gallery' ? 190 * S : 0;
  const down = m === 'gallery' ? 260 * S : 0;
  arms.L.rest = [cx - 330 * S, vh - 150 * S + down];
  arms.R.rest = [cx + 300 * S, vh - 170 * S + down];
}

export function init() {
  layout();
  arms.L.x = arms.L.rest[0]; arms.L.y = arms.L.rest[1];
  arms.R.x = arms.R.rest[0]; arms.R.y = arms.R.rest[1];
  window.addEventListener('resize', () => { layout(); setMode(mode); });
  requestAnimationFrame(frame);
}
