// The artist seen from above, sitting at the TOP edge of the desk and facing the visitor.
// Head and shoulders are at the top of the screen, the arms come down onto the sheet.
// Everything is solved in a "local" frame where the artist sits at the bottom (the frame the
// figures were traced in) and drawn through a vertical flip, so the drawing hand is on the
// viewer's right, next to the menu.
// Arms have fixed lengths and bend at the elbow, which points away from the body.
// The artist only works on his own drawing: the page tells him where his two hands are (hands()),
// he never reaches for the interface.
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
const SHOULDER_Y = 450; // shoulder line, in head rows
const SHOULDER_X = 225; // half the shoulder width
const UPPER = 400;      // upper arm
const FORE = 70;        // sleeve between the elbow and the traced forearm (the tracing holds most of it)
const LEAN = 26;        // how far the head follows the pencil
const BACK = 150;       // how far he sits back when the drawing is put away

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
  L: { side: -1, fig: 'handL', x: 0, y: 0, sleeve: tube(gArms), figs: {} },
  R: { side: 1, fig: 'handRwrite', x: 0, y: 0, sleeve: tube(gArms), figs: {} },
};
arms.L.figs.handL = figure('handL', gHands);
arms.R.figs.handRwrite = figure('handRwrite', gHands);
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
el('style', {}, svg).textContent = '.tube-o{fill:none;stroke:var(--c-ink);stroke-linecap:round;stroke-linejoin:round}.tube-i{fill:none;stroke:var(--c-paper);stroke-linecap:round;stroke-linejoin:round}';

// viewport <-> local (local = artist at the bottom)
const toLocal = (x, y) => [x, vh - y];

// ---- public layout facts, used by the page to make room for the artist ----
/** Bottom edge of the visible head, in viewport px. */
export const headBottom = () => HEAD_VIS * S;
/** Half width of the head with the ear cups. */
export const headHalf = () => 195 * S;
/** Half width taken by the shoulders and the upper arms. */
export const bodyHalf = () => (SHOULDER_X + 215) * S;
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
// ---- pose ----
function shoulder(side) {
  return [cx + body.shift + side * SHOULDER_X * S, vh - HEAD_VIS * S + SHOULDER_Y * S - body.lean + body.back];
}
const forearm = (f) => Math.hypot(f.tip[0] - f.elbow[0], f.tip[1] - f.elbow[1]);

function solveArm(a) {
  const f = FIG[a.fig];
  const fl = (FORE + forearm(f)) * S, u = UPPER * S;
  const [sx, sy] = shoulder(a.side);
  let tx = a.x, ty = a.y;
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1;
  const max = (u + fl) * 0.985, min = Math.abs(u - fl) + 8 * S;
  if (d > max) { tx = sx + (dx / d) * max; ty = sy + (dy / d) * max; dx = tx - sx; dy = ty - sy; d = max; }
  const dd = Math.max(d, min);
  const k = (u * u - fl * fl + dd * dd) / (2 * dd);
  const h = Math.sqrt(Math.max(0, u * u - k * k));
  const px = -dy / d, py = dx / d;
  const sign = px * a.side >= 0 ? 1 : -1; // the elbow points away from the body
  const ex = sx + (dx / d) * k + px * h * sign, ey = sy + (dy / d) * k + py * h * sign;
  // traced hand: rotate so that its own forearm axis lies along elbow -> tip
  const v0x = f.tip[0] - f.elbow[0], v0y = f.tip[1] - f.elbow[1];
  const rot = Math.atan2(ty - ey, tx - ex) - Math.atan2(v0y, v0x);
  const ft = forearm(f) * S, L = Math.hypot(tx - ex, ty - ey) || 1;
  const cuffX = tx - ((tx - ex) / L) * ft, cuffY = ty - ((ty - ey) / L) * ft;
  return { sx, sy, ex, ey, cuffX, cuffY, rot, f, tx, ty };
}

const P2 = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
/** One sleeve from the shoulder round the elbow to the cuff, with its folds. */
function setSleeve(t, p, w, side) {
  const { sx, sy, ex, ey, cuffX: qx, cuffY: qy } = p;
  const a1 = Math.hypot(ex - sx, ey - sy) || 1, a2 = Math.hypot(qx - ex, qy - ey) || 1;
  const u1x = (ex - sx) / a1, u1y = (ey - sy) / a1, u2x = (qx - ex) / a2, u2y = (qy - ey) / a2;
  const r = Math.min(w * 0.42, a1 * 0.4, a2 * 0.6);
  const d = `M${P2(sx, sy)}L${P2(ex - u1x * r, ey - u1y * r)}Q${P2(ex, ey)} ${P2(ex + u2x * r, ey + u2y * r)}L${P2(qx, qy)}`;
  t.o.setAttribute('d', d); t.i.setAttribute('d', d);
  t.o.setAttribute('stroke-width', w + strokeW); t.i.setAttribute('stroke-width', Math.max(0, w - strokeW));
  // folds: a few along the upper arm, and the creases that gather inside the bent elbow
  let fd = '';
  const fold = (x0, y0, ux, uy, len, n, flip) => {
    const nx = -uy, ny = ux;
    for (let i = 1; i <= n; i++) {
      const t0 = (i - 0.35) / (n + 0.4), s = (i % 2 ? 1 : -1) * flip;
      const bx = x0 + ux * len * t0, by = y0 + uy * len * t0;
      const p0x = bx + nx * s * w * 0.5, p0y = by + ny * s * w * 0.5;
      const p1x = bx - nx * s * w * 0.02 + ux * w * 0.26, p1y = by - ny * s * w * 0.02 + uy * w * 0.26;
      fd += `M${P2(p0x, p0y)}Q${P2((p0x + p1x) / 2 + ux * w * 0.1, (p0y + p1y) / 2 + uy * w * 0.1)} ${P2(p1x, p1y)}`;
    }
  };
  fold(sx, sy, u1x, u1y, a1 - r, Math.max(2, Math.round(a1 / (120 * S))), side);
  // inner side of the elbow = the side the forearm turns toward
  const cross = u1x * u2y - u1y * u2x, ins = cross >= 0 ? 1 : -1;
  const bend = Math.min(1, Math.abs(cross) * 1.6);
  const bx = -(u1x - u2x), by = -(u1y - u2y), bl = Math.hypot(bx, by) || 1; // bisector pointing to the inner side
  const ix = ex + (bx / bl) * w * 0.5 * 0.96, iy = ey + (by / bl) * w * 0.5 * 0.96;
  // two creases across the inside of the bend, following the forearm
  for (const [along, len] of [[0.02, 0.62], [0.2, 0.4]]) {
    const x0 = ix + u2x * w * along, y0 = iy + u2y * w * along, l = w * len * bend;
    const x1 = x0 - (bx / bl) * l + u2x * l * 0.25, y1 = y0 - (by / bl) * l + u2y * l * 0.25;
    fd += `M${P2(x0, y0)}Q${P2((x0 + x1) / 2 + u2x * l * 0.22, (y0 + y1) / 2 + u2y * l * 0.22)} ${P2(x1, y1)}`;
  }
  t.f.setAttribute('d', fd);
}
function setTube(t, x0, y0, x1, y1, w) {
  const d = `M${P2(x0, y0)}L${P2(x1, y1)}`;
  t.o.setAttribute('d', d); t.i.setAttribute('d', d);
  t.o.setAttribute('stroke-width', w + strokeW); t.i.setAttribute('stroke-width', Math.max(0, w - strokeW));
}

let dirty = true;
let headTurn = 0, nod = 0;
function render() {
  for (const key of ['L', 'R']) {
    const a = arms[key];
    const p = solveArm(a);
    setSleeve(a.sleeve, p, p.f.sleeve * S * 1.08, a.side);
    for (const k in a.figs) {
      const g = a.figs[k];
      g.setAttribute('transform', `translate(${p.cuffX.toFixed(2)} ${p.cuffY.toFixed(2)}) rotate(${(p.rot * 180 / Math.PI).toFixed(2)}) scale(${S}) translate(${-p.f.elbow[0]} ${-p.f.elbow[1]})`);
    }
  }
  const [lx, sy] = shoulder(-1), [rx] = shoulder(1);
  setTube(shoulders, lx, sy, rx, sy, 250 * S);
  const hx = cx + body.shift - 265 * S + headTurn * 10 * S;
  const hy = vh - HEAD_VIS * S - body.lean + body.back;
  gHead.setAttribute('transform', `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${(headTurn * 3 + nod).toFixed(2)} ${265 * S} ${300 * S}) scale(${S})`);
}

// ---- motion ----
// Generic tweens (also used by the ink marks of the page, which draw themselves).
const tweens = new Set();
export function tween(ms, fn) {
  return new Promise((res) => {
    if (reduce.matches || ms <= 0) { fn(1); dirty = true; return res(); }
    tweens.add({ t0: performance.now(), ms, fn, res });
  });
}

/** Where the two hands are, in viewport px: [x, y] of the pencil tip and of the left hand. */
export function hands(right, left) {
  const [rx, ry] = toLocal(...right), [lx, ly] = toLocal(...left);
  const R = arms.R, L = arms.L;
  if (R.x !== rx || R.y !== ry || L.x !== lx || L.y !== ly) { R.x = rx; R.y = ry; L.x = lx; L.y = ly; dirty = true; }
}
/** 0 = bent over the drawing, 1 = sitting back. */
export function sitBack(k) { body.backTo = k * BACK * S; }

function frame(now) {
  for (const t of tweens) {
    const k = Math.min(1, (now - t.t0) / t.ms);
    t.fn(k); dirty = true;
    if (k >= 1) { tweens.delete(t); t.res(); }
  }
  // the head follows the pencil, slowly and only a little
  const R = arms.R;
  const lean = clamp((vh - R.y - HEAD_VIS * S) / (400 * S), 0, 1) * LEAN * S * (1 - body.backTo / (BACK * S || 1));
  const shift = clamp((R.x - cx) * 0.06, -30 * S, 30 * S);
  if (Math.abs(lean - body.lean) > 0.1) { body.lean = lerp(body.lean, lean, 0.03); dirty = true; }
  if (Math.abs(shift - body.shift) > 0.1) { body.shift = lerp(body.shift, shift, 0.03); dirty = true; }
  if (Math.abs(body.backTo - body.back) > 0.1) { body.back = lerp(body.back, body.backTo, 0.04); dirty = true; }
  const turn = clamp((R.x - cx) / (500 * S), -1, 1);
  if (Math.abs(turn - headTurn) > 0.004) { headTurn = lerp(headTurn, turn, 0.025); dirty = true; }
  if (!reduce.matches) { const n = Math.sin(now / 1900) * 0.5; if (Math.abs(n - nod) > 0.02) { nod = n; dirty = true; } }
  if (dirty) { dirty = false; render(); }
  requestAnimationFrame(frame);
}

export function init() {
  layout();
  window.addEventListener('resize', layout);
  requestAnimationFrame(frame);
}
