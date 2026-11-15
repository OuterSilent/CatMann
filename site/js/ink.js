// "Redrawing": every mark is a pencil stroke whose growing end is where the artist's pencil is.
import * as R from './rough.js';
import * as artist from './artist.js';

const NS = 'http://www.w3.org/2000/svg';
const sheet = document.getElementById('sheet');
const ink = document.getElementById('ink');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const cssMs = (name, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
export const D = { mark: 220, press: 200, write: 260, menu: 400, page: 600 };
export function readDurations() { D.mark = cssMs('--d-mark', 220); D.press = cssMs('--d-press', 200); D.write = cssMs('--d-write', 260); D.menu = cssMs('--d-menu', 400); D.page = cssMs('--d-page', 600); }

/** Box of an element in sheet coordinates. */
export function box(el) {
  const a = el.getBoundingClientRect(), b = sheet.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
}
/** Box of the text itself (not the block), for marks that should hug the words. */
export function textBox(el) {
  const r = document.createRange(); r.selectNodeContents(el);
  const rects = [...r.getClientRects()].filter((q) => q.width > 1);
  if (!rects.length) return box(el);
  const b = sheet.getBoundingClientRect(); const first = rects[0];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of rects) { x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); }
  return { x: x0 - b.left, y: y0 - b.top, w: x1 - x0, h: y1 - y0, lineH: first.height };
}
const toView = (x, y) => { const b = sheet.getBoundingClientRect(); return [b.left + x, b.top + y]; };

export function group(cls = '') { const g = document.createElementNS(NS, 'g'); if (cls) g.setAttribute('class', cls); ink.appendChild(g); return g; }
export function fadeOut(g) { if (!g || !g.isConnected) return; g.classList.add('out'); setTimeout(() => g.remove(), 220); }

let penToken = 0;
/**
 * Draw path data as one stroke. With `pen`, the artist's pencil travels to the start and follows the growing end.
 * Resolves when the stroke is complete. A newer pen stroke takes the pencil away, the older one still finishes.
 */
export async function stroke(d, parent, ms = D.mark, { pen = true, cls = '', travel = 90 } = {}) {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d); if (cls) p.setAttribute('class', cls);
  parent.appendChild(p);
  if (reduce.matches) return p;
  const len = p.getTotalLength();
  p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
  const mine = pen ? ++penToken : -1;
  if (pen) {
    artist.acquire();
    const s = p.getPointAtLength(0);
    await artist.moveTo(...toView(s.x, s.y), travel);
  }
  await artist.tween(ms, (k) => {
    p.style.strokeDashoffset = len * (1 - k);
    if (pen && mine === penToken) { const q = p.getPointAtLength(len * k); artist.at(...toView(q.x, q.y)); }
  });
  p.style.strokeDasharray = '';
  if (pen) artist.release();
  return p;
}

/** Let the pencil run along a list of sheet points without leaving a mark (used while text is revealed). */
export async function glide(pts, ms, { travel = 90, onStep } = {}) {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', R.smooth(pts));
  const len = p.getTotalLength();
  const mine = ++penToken;
  artist.acquire();
  const s = p.getPointAtLength(0);
  await artist.moveTo(...toView(s.x, s.y), travel);
  await artist.tween(ms, (k) => {
    if (onStep) onStep(k);
    if (mine === penToken) { const q = p.getPointAtLength(len * k); artist.at(...toView(q.x, q.y)); }
  });
  artist.release();
}

/** Reveal an element left to right as if it were being written. */
export async function write(el, ms = D.write, { pen = true } = {}) {
  if (reduce.matches) return;
  const b = textBox(el);
  el.style.clipPath = 'inset(-10% 100% -10% -2%)';
  const step = (k) => { el.style.clipPath = `inset(-10% ${(1 - k) * 100}% -10% -2%)`; };
  if (pen) await glide(R.writePts(b.x, b.y, b.w, b.h), ms, { onStep: step });
  else await artist.tween(ms, step);
  el.style.clipPath = '';
}

// ---- marks on links ----
const KINDS = ['under', 'circle', 'arrow', 'hatch', 'double'];
let lastKind = '';
export function markPath(kind, b) {
  const { x, y, w, h } = b;
  switch (kind) {
    case 'under': return [R.line(x - 3, y + h + 2, x + w + 4, y + h + 1 + R.jit(1.5), 0.9)];
    case 'double': return [R.line(x - 2, y + h + 1, x + w + 3, y + h, 0.8), R.line(x + w + 1, y + h + 5, x + 2, y + h + 5.5, 0.8)];
    case 'circle': return [R.ellipse(x + w / 2, y + h / 2, w / 2 + 11, h / 2 + 5, 1.12, 0.9)];
    case 'arrow': return [R.arrow(x - 30, y + h + 12, x - 5, y + h * 0.62, 7)];
    case 'hatch': return [R.hatch(x - 1, y + h * 0.45, w + 2, h * 0.55, 6, 5)];
    case 'box': return [R.rect(x - 6, y - 4, w + 12, h + 8, 0.9, 5)];
    default: return [];
  }
}
export async function mark(el, { kind, cls = '', pen = true, ms = D.mark } = {}) {
  if (!kind) { do { kind = R.pick(KINDS); } while (kind === lastKind); lastKind = kind; }
  const g = group(`${kind === 'hatch' ? 'soft ' : ''}${cls}`);
  g.dataset.kind = kind;
  const paths = markPath(kind, textBox(el));
  // draw without awaiting the caller: the mark is never in the way of a click
  (async () => { for (const [i, d] of paths.entries()) await stroke(d, g, ms / paths.length, { pen, travel: i ? 50 : 90 }); })();
  return g;
}

/** Quick hatch across a button when it is pressed. */
export async function press(el) {
  const b = box(el);
  const g = group('soft');
  await stroke(R.hatch(b.x + 4, b.y + 4, b.w - 12, b.h - 8, 8, 9), g, D.press, { travel: 60 });
  setTimeout(() => fadeOut(g), 500);
}

// ---- frames: borders that are drawn, not CSS ----
const ro = new ResizeObserver((entries) => { for (const e of entries) drawFrame(e.target); });
function drawFrame(el) {
  let svg = el.querySelector(':scope > svg.frame');
  if (!svg) { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'frame'); svg.setAttribute('aria-hidden', 'true'); el.prepend(svg); }
  const w = el.offsetWidth, h = el.offsetHeight;
  if (!w || (svg.dataset.w === String(w) && svg.dataset.h === String(h))) return;
  svg.dataset.w = w; svg.dataset.h = h;
  R.seed(w * 131 + h * 17 + (el.dataset.seed | 0));
  const kind = el.dataset.frame || 'rect';
  const d = kind === 'rule' ? R.line(0, h / 2, w, h / 2 + R.jit(2), 1.2)
    : kind === 'under' ? R.line(0, h, w, h + R.jit(1.5), 1)
      : R.rect(0.5, 0.5, w - 1, h - 1, 0.9, 5);
  svg.innerHTML = `<path pathLength="1" d="${d}"/>`;
}
export function frames(root = document) {
  root.querySelectorAll('.framed').forEach((el, i) => { el.dataset.seed = i; drawFrame(el); ro.observe(el); });
}

/** Staggered entrance of a view: heading written by the pencil, frames drawn, the rest fades in. */
export async function reveal(view, { pen = true } = {}) {
  view.querySelectorAll('.fade, .framed').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 9)));
  view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
  setTimeout(() => view.classList.remove('enter'), 1600);
  if (reduce.matches) return;
  const heads = [...view.querySelectorAll('[data-write]')].filter((h) => h.offsetParent);
  if (!heads.length) return;
  await write(heads[0], D.write, { pen });
  // then a quick pass along the first frame, so the hand is seen closing a box
  const fr = [...view.querySelectorAll('.framed')].find((f) => { const r = f.getBoundingClientRect(); return r.width && r.top < innerHeight * 0.85 && r.bottom > 0; });
  if (fr && pen) {
    const b = box(fr);
    await glide([[b.x, b.y + b.h], [b.x + b.w * 0.5, b.y + b.h + 2], [b.x + b.w, b.y + b.h]], 150, { travel: 110 });
  }
}

/** Wipe a view away under the side of the hand (or the eraser). */
export async function erase(view) {
  if (reduce.matches) return;
  const b = box(view); const vb = sheet.getBoundingClientRect();
  const top = Math.max(b.y, -vb.top + 70), bottom = Math.min(b.y + b.h, -vb.top + innerHeight * 0.72);
  const y0 = (top + bottom) / 2;
  artist.use(R.rnd() < 0.5 ? 'handRsweep' : 'handReraser');
  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push([b.x + (b.w * i) / 6, y0 + (i % 2 ? -1 : 1) * Math.min(90, (bottom - top) * 0.28)]);
  view.style.willChange = 'clip-path, opacity';
  await glide(pts, 230, { travel: 120, onStep: (k) => { view.style.clipPath = `inset(0 0 0 ${k * 100}%)`; view.style.opacity = 1 - k * 0.6; } });
  view.style.clipPath = ''; view.style.opacity = ''; view.style.willChange = '';
  artist.use('handRwrite');
}
