// Hand-drawn geometry: every shape is a list of points turned into a smooth path.
let s = 20261115;
export function seed(n) { s = (n >>> 0) || 1; }
export function rnd() { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }
export const jit = (a) => (rnd() * 2 - 1) * a;
export const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const f = (v) => Math.round(v * 10) / 10;

/** Catmull-Rom spline through pts as cubic Bezier path data. */
export function smooth(pts, closed = false) {
  const n = pts.length;
  if (n < 2) return '';
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  if (n === 2) return d + `L${f(pts[1][0])},${f(pts[1][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i - 1] || (closed ? pts[n - 2] : pts[i]);
    const p1 = pts[i], p2 = pts[i + 1];
    const p3 = pts[i + 2] || (closed ? pts[1] : p2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

export function linePts(x1, y1, x2, y2, j = 1) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(2, Math.round(len / 46));
  const bow = jit(Math.min(3, len * 0.012));
  const nx = -(y2 - y1) / (len || 1), ny = (x2 - x1) / (len || 1);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, b = Math.sin(t * Math.PI) * bow;
    const e = i === 0 || i === n ? 0.4 : 1;
    pts.push([x1 + (x2 - x1) * t + nx * b + jit(j * e), y1 + (y2 - y1) * t + ny * b + jit(j * e)]);
  }
  return pts;
}
export const line = (x1, y1, x2, y2, j) => smooth(linePts(x1, y1, x2, y2, j));

/** Rectangle drawn as four strokes that overshoot the corners a little, in one path. */
export function rect(x, y, w, h, j = 1, over = 4) {
  const o = () => over * (0.4 + rnd() * 0.8);
  return line(x - o(), y, x + w + o(), y, j) + line(x + w, y - o(), x + w, y + h + o(), j) +
    line(x + w + o(), y + h, x - o(), y + h, j) + line(x, y + h + o(), x, y - o(), j);
}

export function ellipsePts(cx, cy, rx, ry, over = 1.1, j = 1, a0 = -2.2 + jit(0.5)) {
  const n = 26, pts = [];
  const total = Math.round(n * over);
  for (let i = 0; i <= total; i++) {
    const a = a0 + (i / n) * Math.PI * 2;
    const k = 1 + (i / total - 0.5) * 0.06; // slight spiral, so the ends cross instead of meeting
    pts.push([cx + Math.cos(a) * rx * k + jit(j), cy + Math.sin(a) * ry * k + jit(j)]);
  }
  return pts;
}
export const ellipse = (...a) => smooth(ellipsePts(...a));

/** Zigzag hatch across a box, left to right. */
export function hatchPts(x, y, w, h, step = 7, lean = 8) {
  const pts = [];
  for (let px = x, i = 0; px <= x + w; px += step, i++) {
    pts.push(i % 2 ? [px + lean + jit(1), y + jit(1.2)] : [px + jit(1), y + h + jit(1.2)]);
  }
  return pts;
}
export const hatch = (...a) => 'M' + hatchPts(...a).map((p) => `${f(p[0])},${f(p[1])}`).join('L');

/** A loose scribble through a box, used as the path the pencil follows while "writing". */
export function writePts(x, y, w, h, loops = Math.max(3, Math.round(w / 34))) {
  const pts = [];
  for (let i = 0; i <= loops * 2; i++) {
    const t = i / (loops * 2);
    pts.push([x + w * t, y + h * (i % 2 ? 0.22 : 0.8) + jit(h * 0.08)]);
  }
  return pts;
}

export function arrow(x1, y1, x2, y2, head = 9) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const mx = (x1 + x2) / 2 + jit(6) - Math.sin(a) * 7, my = (y1 + y2) / 2 + jit(6) + Math.cos(a) * 7;
  return smooth([[x1, y1], [mx, my], [x2, y2]]) +
    `M${f(x2 - Math.cos(a - 0.5) * head)},${f(y2 - Math.sin(a - 0.5) * head)}L${f(x2)},${f(y2)}L${f(x2 - Math.cos(a + 0.5) * head)},${f(y2 - Math.sin(a + 0.5) * head)}`;
}
