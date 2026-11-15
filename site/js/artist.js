// The artist seen from above, sitting at the TOP edge of the desk and facing the visitor.
// Head and shoulders are at the top of the screen, the arms come down onto the sheet.
// Everything is solved in a "local" frame where the artist sits at the bottom (the frame the
// figures were traced in) and drawn through a vertical flip, so the drawing hand is on the
// viewer's right, next to the menu.
// Arms keep their natural length: a point out of reach is pointed at, never reached by stretching.
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

// Proportions in the units of the traced figures (the head is about 320 wide).
const HEAD_VIS = 300;   // rows of the head drawing that show below the top edge
const SHOULDER_Y = 470; // shoulder line, in head rows
const SHOULDER_X = 220; // half the shoulder width
const UPPER = 300;      // upper arm, seen from above (foreshortened)
const FORE = 330;       // forearm between the elbow and the cuff where the traced hand starts
const LEAN = 150;       // how far the head and shoulders may lean over the sheet
const SHIFT = 120;      // how far the body may slide sideways on the chair

const svg = document.getElementById('artist');
const root = el('g', {}, svg);
let vw = 0, vh = 0, S = 0.5, cx = 0, strokeW = 1.25;
let mode = 'desk';
const body = { lean: 0, shift: 0, back: 0, backTo: 0 };

function figure(key, parent) {
  const f = FIG[key];
  const g = el('g', { 'data-fig': key }, parent);
  el('path', { d: f.sil, class: 'paperfill' }, g);
  el('path', { d: f.ink, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, g);
  return g;
}

// ---- build (back to front) ----
const gArms = el('g', {}, root);
const gHands = el('g', {}, root);
const gTorso = el('g', {}, root);
const tube = (parent) => ({ o: el('path', { class: 'tube-o' }, parent), i: el('path', { class: 'tube-i' }, parent), f: el('path', { class: 'ln' }, parent) });
const arms = {
  L: { side: -1, fig: 'handL', x: 0, y: 0, upper: tube(gArms), fore: tube(gArms), figs: {}, rest: [0, 0] },
  R: { side: 1, fig: 'handRwrite', x: 0, y: 0, upper: tube(gArms), fore: tube(gArms), figs: {}, rest: [0, 0] },
};
arms.L.figs.handL = figure('handL', gHands);
for (const k of ['handRwrite', 'handRsweep', 'handReraser']) arms.R.figs[k] = figure(k, gHands);
const shoulders = tube(gTorso);
const gHead = el('g', {}, gTorso);
{
  const h = FIG.head;
  el('path', { d: h.sil, class: 'paperfill' }, gHead);
  el('path', { d: h.ink, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, gHead);
  el('path', { d: h.hairSil, class: 'paperfill' }, gHead);
  el('path', { d: h.hair, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, gHead);
  el('path', { d: h.bandSil, class: 'paperfill' }, gHead);
  el('path', { d: h.band, class: 'ln', 'vector-effect': 'non-scaling-stroke' }, gHead);
}
el('style', {}, svg).textContent = '.tube-o{fill:none;stroke:var(--c-ink);stroke-linecap:round}.tube-i{fill:none;stroke:var(--c-paper);stroke-linecap:round}';

// viewport <-> local (local = artist at the bottom)
const toLocal = (x, y) => [x, vh - y];

// ---- public layout facts, used by the page to make room for the artist ----
/** Bottom edge of the visible head, in viewport px. */
export const headBottom = () => HEAD_VIS * S;
/** Half width of the head with the ear cups. */
export const headHalf = () => 195 * S;
/** Half width taken by the shoulders and the upper arms. */
export const bodyHalf = () => (SHOULDER_X + 70) * S;
export function scale() { return S; }
export function center() { return cx; }

function layout() {
  vw = window.innerWidth; vh = window.innerHeight;
  strokeW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stroke')) || 1.25;
  svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  root.setAttribute('transform', `translate(0 ${vh}) scale(1 -1)`);
  S = clamp(Math.min(vw / 2300, vh / 1450), 0.3, 0.7);
  cx = vw / 2;
  dirty = true;
}
/** Where the hands rest, in viewport px: set by the page around the scrap of paper. */
let deskRest = null;
export function setRest(right, left) {
  deskRest = [toLocal(...right), toLocal(...left)];
  applyRest();
  if (!placed) { placed = true; for (const a of [arms.L, arms.R]) { a.x = a.rest[0]; a.y = a.rest[1]; } }
  dirty = true;
}
let placed = false;
// When he is not drawing on the scrap (gallery, or the visitor is reading further down) he sits
// back and rests his hands on the edge of the sheet, close to himself.
function applyRest() {
  if (mode === 'desk' && deskRest) { arms.R.rest = deskRest[0]; arms.L.rest = deskRest[1]; return; }
  const y = HEAD_VIS * S * 0.8;
  arms.R.rest = toLocal(cx + 200 * S, y);
  arms.L.rest = toLocal(cx - 210 * S, y + 10 * S);
}

// ---- pose ----
function shoulder(side) {
  return [cx + body.shift + side * SHOULDER_X * S, vh - HEAD_VIS * S + SHOULDER_Y * S - body.lean + body.back];
}
const forearm = (f) => Math.hypot(f.tip[0] - f.elbow[0], f.tip[1] - f.elbow[1]);
const reachOf = (a) => (UPPER + FORE + forearm(FIG[a.fig])) * S;

function solveArm(a) {
  const f = FIG[a.fig];
  const fl = (FORE + forearm(f)) * S, u = UPPER * S;
  const [sx, sy] = shoulder(a.side);
  let tx = a.x, ty = a.y;
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1;
  const max = (u + fl) * 0.995;
  if (d > max) { tx = sx + (dx / d) * max; ty = sy + (dy / d) * max; dx = tx - sx; dy = ty - sy; d = max; }
  // Seen from above, a bent arm mostly folds downward (toward the floor), so in the drawing the
  // elbow stays close to the shoulder-hand line and the upper arm just looks shorter.
  const dd = Math.max(d, Math.abs(u - fl) + 1);
  const k = (u * u - fl * fl + dd * dd) / (2 * dd);
  const h = Math.sqrt(Math.max(0, u * u - k * k)) * 0.22;
  const bx = sx + (dx / d) * Math.min(k, d * 0.42), by = sy + (dy / d) * Math.min(k, d * 0.42);
  const px = -dy / d, py = dx / d;
  const sign = px * a.side >= 0 ? 1 : -1; // the elbow points away from the body
  const ex = bx + px * h * sign, ey = by + py * h * sign;
  // traced hand: rotate so that its own forearm axis lies along elbow -> tip
  const v0x = f.tip[0] - f.elbow[0], v0y = f.tip[1] - f.elbow[1];
  const rot = Math.atan2(ty - ey, tx - ex) - Math.atan2(v0y, v0x);
  const ft = forearm(f) * S, L = Math.hypot(tx - ex, ty - ey) || 1;
  const cuffX = tx - ((tx - ex) / L) * ft, cuffY = ty - ((ty - ey) / L) * ft;
  return { sx, sy, ex, ey, cuffX, cuffY, rot, f, tx, ty };
}

function setTube(t, x0, y0, x1, y1, w, side, folds) {
  const d = `M${x0.toFixed(1)},${y0.toFixed(1)}L${x1.toFixed(1)},${y1.toFixed(1)}`;
  t.o.setAttribute('d', d); t.i.setAttribute('d', d);
  t.o.setAttribute('stroke-width', w + strokeW); t.i.setAttribute('stroke-width', Math.max(0, w - strokeW));
  if (!folds) { t.f.setAttribute('d', ''); return; }
  const ax = x1 - x0, ay = y1 - y0, al = Math.hypot(ax, ay) || 1, ux = ax / al, uy = ay / al, nx = -uy, ny = ux;
  let fd = '';
  const n = Math.max(1, Math.round(al / (110 * S)));
  for (let i = 1; i <= n; i++) {
    const t0 = (i - 0.4) / (n + 0.3), s = (i % 2 ? 1 : -1) * side;
    const bx = x0 + ax * t0, by = y0 + ay * t0;
    const p0x = bx + nx * s * w * 0.5, p0y = by + ny * s * w * 0.5;
    const p1x = bx - nx * s * w * 0.05 + ux * w * 0.28, p1y = by - ny * s * w * 0.05 + uy * w * 0.28;
    const mx = (p0x + p1x) / 2 + ux * w * 0.1, my = (p0y + p1y) / 2 + uy * w * 0.1;
    fd += `M${p0x.toFixed(1)},${p0y.toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(1)}`;
  }
  t.f.setAttribute('d', fd);
}

let dirty = true;
let headTurn = 0, nod = 0;
function render() {
  for (const key of ['L', 'R']) {
    const a = arms[key];
    const p = solveArm(a);
    const w = p.f.sleeve * S;
    setTube(a.upper, p.sx, p.sy, p.ex, p.ey, w * 1.18, a.side, true);
    setTube(a.fore, p.ex, p.ey, p.cuffX, p.cuffY, w * 1.04, -a.side, true);
    for (const k in a.figs) {
      const g = a.figs[k];
      if (k !== a.fig) { g.setAttribute('display', 'none'); continue; }
      g.removeAttribute('display');
      g.setAttribute('transform', `translate(${p.cuffX.toFixed(2)} ${p.cuffY.toFixed(2)}) rotate(${(p.rot * 180 / Math.PI).toFixed(2)}) scale(${S}) translate(${-p.f.elbow[0]} ${-p.f.elbow[1]})`);
    }
    a.solved = p;
  }
  const [lx, sy] = shoulder(-1), [rx] = shoulder(1);
  setTube(shoulders, lx, sy, rx, sy, 250 * S, 1, false);
  const hx = cx + body.shift - 265 * S + headTurn * 12 * S;
  const hy = vh - HEAD_VIS * S - body.lean + body.back;
  gHead.setAttribute('transform', `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${(headTurn * 4 + nod).toFixed(2)} ${265 * S} ${300 * S}) scale(${S})`);
}

// ---- motion ----
const tweens = new Set();
export function tween(ms, fn) {
  return new Promise((res) => {
    if (reduce.matches || ms <= 0) { fn(1); dirty = true; return res(); }
    tweens.add({ t0: performance.now(), ms, fn, res });
  });
}
let idleTarget = null; // () => [x, y] viewport, for the drawing hand when nothing else happens
export function setIdle(fn) { idleTarget = fn; }
let busy = 0;
export const isBusy = () => busy > 0;
export function acquire() { busy++; }
export function release() { busy = Math.max(0, busy - 1); }

function frame(now) {
  for (const t of tweens) {
    const k = Math.min(1, (now - t.t0) / t.ms);
    t.fn(k); dirty = true;
    if (k >= 1) { tweens.delete(t); t.res(); }
  }
  const R = arms.R, L = arms.L;
  if (!busy && !reduce.matches) {
    const tgt = mode === 'desk' && idleTarget ? idleTarget() : null;
    const [rx, ry] = tgt ? toLocal(...tgt) : R.rest;
    if (Math.abs(R.x - rx) + Math.abs(R.y - ry) > 0.05) { R.x = lerp(R.x, rx, 0.22); R.y = lerp(R.y, ry, 0.22); dirty = true; }
    if (R.fig !== 'handRwrite') { R.fig = 'handRwrite'; dirty = true; }
  }
  // the left hand keeps the paper still; when the right one travels far it follows a little
  {
    const far = busy && Math.hypot(R.x - R.rest[0], R.y - R.rest[1]) > 160 * S;
    const lx = far ? clamp(L.rest[0] + (R.x - R.rest[0]) * 0.35, cx - 700 * S, R.x - 260 * S) : L.rest[0];
    const ly = far ? L.rest[1] + (R.y - R.rest[1]) * 0.3 : L.rest[1];
    if (Math.abs(L.x - lx) + Math.abs(L.y - ly) > 0.3) { L.x = lerp(L.x, lx, 0.08); L.y = lerp(L.y, ly, 0.08); dirty = true; }
  }
  // the body leans over the sheet and slides toward where the pencil has to go
  {
    const [sx, sy] = [cx + SHOULDER_X * S, vh - HEAD_VIS * S + SHOULDER_Y * S];
    const need = Math.hypot(R.x - sx, R.y - sy) - reachOf(R) * 0.82;
    const lean = busy ? clamp(need, 0, LEAN * S) : 0;
    const shift = busy ? clamp((R.x - sx) * 0.3, -SHIFT * S, SHIFT * S) : 0;
    if (Math.abs(lean - body.lean) > 0.2) { body.lean = lerp(body.lean, lean, 0.12); dirty = true; }
    if (Math.abs(shift - body.shift) > 0.2) { body.shift = lerp(body.shift, shift, 0.1); dirty = true; }
    if (Math.abs(body.backTo - body.back) > 0.2) { body.back = lerp(body.back, body.backTo, 0.1); dirty = true; }
    const turn = clamp((R.x - cx - body.shift) / (vw * 0.4), -1, 1);
    if (Math.abs(turn - headTurn) > 0.004) { headTurn = lerp(headTurn, turn, 0.08); dirty = true; }
    if (!reduce.matches) { const n = Math.sin(now / 560) * 0.4; if (Math.abs(n - nod) > 0.02) { nod = n; dirty = true; } }
  }
  if (dirty) { dirty = false; render(); }
  requestAnimationFrame(frame);
}

/** Can the drawing hand reach this viewport point, leaning and sliding as far as it may? */
export function canReach(x, y) {
  const [lx, ly] = toLocal(x, y);
  const sx = cx + SHOULDER_X * S + clamp(lx - cx - SHOULDER_X * S, -SHIFT * S, SHIFT * S);
  const sy = vh - HEAD_VIS * S + SHOULDER_Y * S - LEAN * S;
  return Math.hypot(lx - sx, ly - sy) <= reachOf(arms.R) * 0.97;
}
/** Move the drawing hand's tip to a viewport point along a slightly lifted arc. */
export function moveTo(x, y, ms = 110) {
  const a = arms.R; const x0 = a.x, y0 = a.y;
  const [tx, ty] = toLocal(x, y);
  const lift = Math.min(18, Math.hypot(tx - x0, ty - y0) * 0.06);
  return tween(ms, (k) => { const e = easeInOut(k); a.x = lerp(x0, tx, e); a.y = lerp(y0, ty, e) + Math.sin(e * Math.PI) * lift; });
}
/** Put the tip at a viewport point now (used while following a stroke). */
export function at(x, y) { const [lx, ly] = toLocal(x, y); arms.R.x = lx; arms.R.y = ly; dirty = true; }
export function use(fig) { arms.R.fig = fig; dirty = true; }

export function setMode(m) {
  if (m === mode) return;
  mode = m;
  body.backTo = m === 'desk' ? 0 : 90 * S; // sits back a little and watches
  applyRest();
}

export function init() {
  layout();
  window.addEventListener('resize', () => { layout(); applyRest(); });
  requestAnimationFrame(frame);
}
