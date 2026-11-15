// The artist's own drawing: a sheet under his hands with the portrait of a cat, built the way he
// works. Eyes first, then nose and mouth, then the fur one hair at a time, patch after patch
// outward from the eyes, the whiskers last. The portrait is a tone map (stripes, light muzzle,
// shadows) rendered with thousands of short pencil strokes that follow the direction of the fur.
//
// The sheet belongs to the page: it scrolls with it and the hands follow. When it would slide away
// under the artist he puts it away himself and rests his hands on the desk; he takes it out again
// when the page is back at the top. A finished portrait is put away and a new sheet comes out.
import * as artist from './artist.js';

const scrap = document.getElementById('scrap');
const cv = scrap.querySelector('canvas');
const ctx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const G = (x, y, cx, cy, rx, ry) => Math.exp(-(((x - cx) / rx) ** 2) - ((y - cy) / ry) ** 2);
const segDist = (x, y, x0, y0, x1, y1) => {
  const dx = x1 - x0, dy = y1 - y0, t = clamp(((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(x - x0 - dx * t, y - y0 - dy * t);
};
const seeded = (s) => () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };

let W = 0, H = 0, dpr = 1, base = null, S = 0.5;
let strokes = [], si = 0, sp = 0, seed = 1, pen = [0, 0];

// ---------- the portrait ----------
// Face coordinates: x to the right, y down, the head is about 1 unit in radius.
function portrait(sd) {
  const rnd = seeded(sd);
  const r = (a, b) => a + rnd() * (b - a);
  const P = {
    ex: r(0.35, 0.38), ey: r(-0.07, -0.03), ew: r(0.18, 0.2), eh: r(0.115, 0.13), pw: r(0.032, 0.062),
    ny: r(0.29, 0.33), ph: r(-0.5, 0.5), ph2: r(0, 6), earT: r(-1.12, -1.04), tilt: r(-0.05, 0.05),
  };
  const k = Math.min(W / 2.72, H / 2.3);
  const out = [];
  const add = (pts, a, w, v = 1.1, kind = 'ink') => { if (pts.length > 1) out.push({ pts, a, w, v, kind }); };
  const curve = (x0, y0, x1, y1, bend, n = 6) => Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, nx = -(y1 - y0), ny = x1 - x0, b = Math.sin(t * Math.PI) * bend;
    return [x0 + (x1 - x0) * t + nx * b, y0 + (y1 - y0) * t + ny * b];
  });
  /** Keep the runs of a polyline where `ok` holds. */
  const clip = (pts, ok) => { const runs = []; let cur = []; for (const p of pts) { if (ok(p[0], p[1])) cur.push(p); else { if (cur.length > 1) runs.push(cur); cur = []; } } if (cur.length > 1) runs.push(cur); return runs; };
  // value noise, so the coat is not perfectly even
  const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + sd) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const noise = (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v); return lerp(lerp(hash(i, j), hash(i + 1, j), a), lerp(hash(i, j + 1), hash(i + 1, j + 1), a), b); };

  // -- shapes --
  const tri = (x, y, ax, ay, bx, by, cx, cy) => {
    const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by), d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy), d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const EAR = { ox: 0.93, oy: -0.36, tx: 0.76, ty: P.earT, ix: 0.24, iy: -0.68 };
  const inEar = (x, y) => tri(Math.abs(x), y, EAR.ox, EAR.oy, EAR.tx, EAR.ty, EAR.ix, EAR.iy);
  // inner ear: the same triangle pulled toward its middle
  const ecx = (EAR.ox + EAR.tx + EAR.ix) / 3 - 0.02, ecy = (EAR.oy + EAR.ty + EAR.iy) / 3 + 0.04;
  const sh = (px, py, f) => [ecx + (px - ecx) * f, ecy + (py - ecy) * f];
  const [e1x, e1y] = sh(EAR.ox, EAR.oy, 0.62), [e2x, e2y] = sh(EAR.tx, EAR.ty, 0.7), [e3x, e3y] = sh(EAR.ix, EAR.iy, 0.6);
  const inInnerEar = (x, y) => tri(Math.abs(x), y, e1x, e1y, e2x, e2y, e3x, e3y);
  const skull = (x, y) => (x / 0.97) ** 2 + ((y - 0.02) / 0.79) ** 2;
  const cheek = (x, y) => (x / 1.04) ** 2 + ((y - 0.27) / 0.56) ** 2;
  const edge = (x, y) => Math.min(skull(x, y), cheek(x, y));
  const inHead = (x, y) => edge(x, y) <= 1 || inEar(x, y);
  const inChest = (x, y) => y > 0.6 && y < 1.12 && Math.abs(x) < 0.92 - (y - 0.6) * 0.35;
  const upper = (u) => P.ey - 0.045 * u - P.eh * (1 - u * u) ** 0.6;
  const lower = (u) => P.ey - 0.045 * u + P.eh * 0.8 * (1 - u * u) ** 0.75;
  const inEye = (x, y, m = 0) => { const u = (Math.abs(x) - P.ex) / P.ew; return Math.abs(u) < 1 && y > upper(u) - m && y < lower(u) + m; };
  const ny = P.ny;
  const noseHalf = (y) => (y < ny ? 0 : y < ny + 0.085 ? lerp(0.088, 0.036, (y - ny) / 0.085) : y < ny + 0.108 ? lerp(0.036, 0, (y - ny - 0.085) / 0.023) : 0);
  const inNose = (x, y) => Math.abs(x) < noseHalf(y);

  // -- how dark the coat is at a point (0 paper, 1 black) --
  const tone = (x, y) => {
    const ax = Math.abs(x);
    let t;
    if (edge(x, y) > 1 && inEar(x, y)) {
      t = inInnerEar(x, y) ? 0.13 + 0.5 * ss(-0.72, -0.5, y) : 0.6;
    } else if (!inHead(x, y)) {
      t = 0.44 - 0.34 * ss(0.72, 1.08, y);                                  // chest: shadow under the chin, then fading out
    } else {
      t = 0.36;
      if (y < -0.1) {                                                    // the "M" on the forehead
        const u = x / (0.46 + -y * 0.5);
        t += 0.36 * ss(0.2, 0.8, Math.cos(u * Math.PI * 3.6 + P.ph)) * ss(-0.12, -0.3, y) * ss(0.95, 0.6, Math.abs(u));
      }
      if (ax > 0.42 && y > -0.2) t += 0.28 * ss(0.25, 0.8, Math.cos((y - 0.55 * ax) * 21 + P.ph2)) * ss(0.42, 0.62, ax) * ss(0.8, 0.45, y);  // cheek stripes
      t += 0.4 * Math.exp(-((segDist(ax, y, P.ex + P.ew, P.ey - 0.05, 0.97, 0.1) / 0.035) ** 2));  // the line that runs back from the eye
      t += 0.2 * Math.exp(-((segDist(ax, y, P.ex - P.ew - 0.02, P.ey + 0.06, 0.1, ny - 0.02) / 0.03) ** 2)); // tear line down to the nose
      t -= 0.25 * G(ax, y, 0.15, ny + 0.17, 0.2, 0.13);                   // whisker pads
      t -= 0.27 * G(x, y, 0, ny + 0.4, 0.22, 0.1);                        // chin
      t -= 0.16 * G(ax, y, P.ex, P.ey, 0.27, 0.17);                       // light ring around the eyes
      t += 0.13 * G(ax, y, 0.115, ny - 0.16, 0.045, 0.2);                 // sides of the nose bridge
      t += 0.1 * G(x, y, 0, -0.32, 0.1, 0.2);
      t += 0.1 * ss(0.45, 0.8, y) * ss(0.25, 0.6, ax);
      t += 0.14 * G(x, y, 0, ny + 0.24, 0.12, 0.035);                     // shadow under the lip                    // under the jaw
      t += 0.12 * ss(0.8, 1, edge(x, y));                                 // the head turns away at the rim
    }
    return clamp(t + (noise(x * 4.2, y * 4.2) - 0.5) * 0.16, 0.05, 0.95);
  };
  // -- which way the hair lies --
  const dir = (x, y) => {
    const ax = Math.abs(x), s = x < 0 ? -1 : 1;
    let dx = x, dy = y - (ny + 0.01);                                    // away from the bridge of the nose
    if (edge(x, y) > 1 && inEar(x, y)) { dx = s * (inInnerEar(x, y) ? 0.5 : EAR.tx - ax); dy = inInnerEar(x, y) ? -1 : EAR.ty - y; }
    else if (!inHead(x, y)) { dx = x * 0.5; dy = 1; }
    else if (y < -0.2 && ax < 0.5) { dx = x * 0.8; dy = -1; }
    else if (y > ny - 0.02 && y < ny + 0.3 && ax < 0.36) { dx = s; dy = 0.35 + (y - ny) * 1.6; }
    else if (y >= ny + 0.3 && ax < 0.3) { dx = x * 0.6; dy = 1; }
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  const hairLen = (x, y) => {
    if (edge(x, y) > 1 && inEar(x, y)) return inInnerEar(x, y) ? 0.13 : 0.035;
    if (!inHead(x, y)) return 0.1;
    const ax = Math.abs(x);
    const nearEye = G(ax, y, P.ex, P.ey, 0.3, 0.22), muzzle = G(ax, y, 0.1, ny + 0.12, 0.3, 0.2);
    return (0.036 + 0.06 * ss(0.35, 1, edge(x, y))) * (1 - 0.4 * Math.max(nearEye, muzzle));
  };

  // 1. a light construction sketch
  for (let i = 0; i < 9; i++) { const a0 = -0.3 + i * 0.72 + r(-0.05, 0.05); add(Array.from({ length: 7 }, (_, j) => { const a = a0 + j * 0.11; return [Math.cos(a) * 0.99, 0.08 + Math.sin(a) * 0.8]; }), 0.13, 0.6, 1.5); }
  for (const s of [-1, 1]) {
    add(curve(s * EAR.ox, EAR.oy, s * EAR.tx, EAR.ty, 0.05 * s, 5), 0.16, 0.6, 1.5);
    add(curve(s * EAR.tx, EAR.ty, s * EAR.ix, EAR.iy, 0.06 * s, 5), 0.16, 0.6, 1.5);
  }
  add([[0, -0.6], [0, 0.5]], 0.08, 0.5, 1.5); add([[-0.6, P.ey], [0.6, P.ey]], 0.08, 0.5, 1.5);

  // 2. the eyes
  const hi = [-0.05, -0.055, 0.023], hi2 = [0.04, 0.045, 0.009];      // window light, same side in both eyes
  for (const s of [-1, 1]) {
    const cx = s * P.ex, cy = P.ey - 0.008;
    const X = (u) => s * (P.ex + u * P.ew);
    const lid = (f, off, u0 = -1, u1 = 1, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const u = lerp(u0, u1, i / n); return [X(u), f(u) + off]; });
    const lit = (x, y) => Math.hypot(x - cx - hi[0], y - cy - hi[1]) > hi[2] && Math.hypot(x - cx - hi2[0], y - cy - hi2[1]) > hi2[2];
    const pup = (x, y) => ((x - cx) / P.pw) ** 2 + ((y - cy) / (P.eh * 0.97)) ** 2;
    // lids: several passes, the upper one heavier, running past the outer corner
    add(lid(upper, 0, -1, 1.12), 0.9, 1.15); add(lid(upper, -0.008, -0.95, 1.1), 0.75, 1.0); add(lid(upper, -0.017, -0.8, 1), 0.42, 0.9);
    add(lid(lower, 0), 0.75, 1.0); add(lid(lower, 0.008, -0.9, 0.95), 0.4, 0.9);
    add(curve(X(-1), upper(-1), X(-1) - s * 0.055, upper(-1) + 0.075, 0.12 * s, 4), 0.85, 1.05);  // tear duct
    // pupil, hatched twice to solid black, leaving the lights
    for (const offx of [0, 0.5]) for (let i = 0; i * 0.0062 < P.pw * 2; i++) {
      const x = cx - P.pw + (i + offx) * 0.0062, hy = P.eh * 0.97 * Math.sqrt(Math.max(0, 1 - ((x - cx) / P.pw) ** 2));
      const line = Array.from({ length: 13 }, (_, j) => [x, cy - hy + (2 * hy * j) / 12]);
      for (const run of clip(line, (px, py) => inEye(px, py, -0.004) && lit(px, py))) add(run, 0.9, 0.9, 1.2);
    }
    // iris: fine rays from the pupil, a darker ring at the rim, the shadow of the upper lid
    for (let i = 0; i < 76; i++) {
      const a = (i / 76) * Math.PI * 2 + r(-0.03, 0.03), c = Math.cos(a), d = Math.sin(a), r0 = r(0, 0.015), r1 = r(0.08, 0.2);
      const ray = Array.from({ length: 12 }, (_, j) => { const q = lerp(r0, r1, j / 11); return [cx + c * q, cy + d * q]; });
      for (const run of clip(ray, (px, py) => inEye(px, py, -0.006) && pup(px, py) > 1.05 && lit(px, py))) add(run, r(0.26, 0.44), 0.6, 1.2);
    }
    for (const [off, a] of [[0.012, 0.5], [0.024, 0.36], [0.037, 0.22], [0.05, 0.12]]) for (const run of clip(lid(upper, off, -0.92, 0.92, 22), (px, py) => inEye(px, py, -0.004) && pup(px, py) > 1 && lit(px, py))) add(run, a, 0.8, 1.2);
    for (const run of clip(lid(lower, -0.011, -0.9, 0.9, 22), (px, py) => pup(px, py) > 1)) add(run, 0.26, 0.7, 1.2);
    add(Array.from({ length: 15 }, (_, j) => { const a = -0.5 + (j / 14) * 4.2; return [cx + Math.cos(a) * P.pw * 1.12, cy + Math.sin(a) * P.eh]; }).filter(([px, py]) => inEye(px, py, -0.004)), 0.5, 0.7, 1.2);
  }

  // 3. nose and mouth
  add([[-0.088, ny], [-0.035, ny + 0.013], [0, ny + 0.006], [0.035, ny + 0.013], [0.088, ny]], 0.6, 0.9);
  for (const s of [-1, 1]) add([[s * 0.088, ny], [s * 0.07, ny + 0.045], [s * 0.036, ny + 0.085], [0, ny + 0.108]], 0.7, 1.0);
  for (let y = ny + 0.012; y < ny + 0.104; y += 0.0065) { const h = noseHalf(y) - 0.006; if (h > 0.004) add([[-h, y + r(-0.002, 0.002)], [0, y + 0.002], [h, y + r(-0.002, 0.002)]], 0.22 + 0.3 * ss(ny + 0.03, ny + 0.1, y), 0.75, 1.3); }
  for (const s of [-1, 1]) for (const b of [0.3, 0.42]) add(curve(s * 0.022, ny + 0.04, s * 0.064, ny + 0.062, -b * s, 5), 0.85, 1.05);
  add([[0, ny + 0.108], [0, ny + 0.178]], 0.8, 0.95);
  for (const s of [-1, 1]) {
    add(curve(0, ny + 0.178, s * 0.125, ny + 0.2, 0.13 * s, 7), 0.72, 0.95);
    add(curve(s * 0.02, ny + 0.195, s * 0.11, ny + 0.212, 0.1 * s, 5), 0.32, 0.8);
    for (let row = 0; row < 3; row++) for (let c = 0; c < 4; c++) { const x = s * (0.085 + c * 0.05 + row * 0.012), y = ny + 0.075 + row * 0.043 + c * 0.012; add([[x, y], [x + s * 0.007, y + 0.004]], 0.75, 1.2); }
  }
  for (let i = 0; i < 9; i++) { const x = r(-0.07, 0.07); add([[x, ny + 0.2], [x * 1.2, ny + r(0.225, 0.25)]], 0.4, 0.7, 1.3); }
  const featureCount = out.length;

  // 4. the fur, one hair at a time
  const fur = [];
  const g = 1.55 / k;
  const eyeD = (x, y) => Math.hypot(Math.abs(x) - P.ex, y - P.ey);
  for (let y = -1.16; y < 1.12; y += g) for (let x = -1.1; x < 1.1; x += g) {
    const px = x + r(-0.5, 0.5) * g, py = y + r(-0.5, 0.5) * g;
    const head = inHead(px, py);
    if (!head && !inChest(px, py)) continue;
    if (inEye(px, py, 0.006) || inNose(px, py)) continue;
    const t = tone(px, py);
    let dens = 0.3 + 0.75 * t;
    if (!head) dens *= 1 - ss(0.78, 1.1, py) * 0.9;
    else if (!(edge(px, py) > 1)) dens *= 1 - 0.45 * ss(0.9, 1, edge(px, py));
    for (let pass = 0; pass < 2; pass++) {
      if (rnd() > (pass ? (t - 0.42) * 1.5 : dens * 0.72)) continue;
      let [dx, dy] = dir(px, py);
      const j = r(-0.2, 0.2), c = Math.cos(j), sn = Math.sin(j);
      [dx, dy] = [dx * c - dy * sn, dx * sn + dy * c];
      const len = hairLen(px, py) * r(0.7, 1.3) * (pass ? 0.8 : 1);
      const a = clamp((0.1 + 0.55 * t ** 1.3) * r(0.8, 1.2) + pass * 0.12, 0.06, 0.9);
      const cell = Math.floor((px + 2) / 0.21) * 64 + Math.floor((py + 2) / 0.21);
      const ccx = (Math.floor((px + 2) / 0.21) + 0.5) * 0.21 - 2, ccy = (Math.floor((py + 2) / 0.21) + 0.5) * 0.21 - 2;
      fur.push({ pts: curve(px, py, px + dx * len, py + dy * len, r(-0.16, 0.16), 3), a, w: 0.45 + 0.3 * t, v: 1.6, kind: 'ink', key: (head ? eyeD(ccx, ccy) : 3 + ccy) * 1e5 + cell + (a + pass) * 0.3 });
    }
  }
  fur.sort((p, q) => p.key - q.key);
  out.push(...fur);

  // 5. whiskers: lifted out of the graphite, and a faint line where they cross the bare paper
  const whisker = (pts) => { add(pts, 0.92, 0.95, 1.9, 'erase'); for (const run of clip(pts, (px, py) => !inHead(px, py) && !inChest(px, py))) add(run, 0.3, 0.55, 1.9); for (const run of clip(pts, (px, py) => inHead(px, py) || inChest(px, py))) add(run, 0.07, 0.5, 1.9); };
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const x0 = s * (0.1 + (i % 3) * 0.05), y0 = ny + 0.08 + (i % 3) * 0.04 + (i > 2 ? 0.02 : 0), ang = -0.3 + i * 0.14 + r(-0.04, 0.04), L = r(0.9, 1.15);
      whisker(curve(x0, y0, x0 + s * Math.cos(ang) * L, y0 + Math.sin(ang) * L, s * r(0.03, 0.09), 14));
    }
    for (let i = 0; i < 3; i++) whisker(curve(s * (0.3 + i * 0.05), P.ey - 0.17, s * (0.48 + i * 0.16), -0.72 - r(0, 0.14) + i * 0.1, -s * 0.08, 10));
  }

  // to sheet px
  const ox = W / 2, oy = H * 0.5 + 0.02 * k, ct = Math.cos(P.tilt), st = Math.sin(P.tilt);
  for (const o of out) {
    o.pts = o.pts.map(([x, y]) => [ox + (x * ct - y * st) * k, oy + (x * st + y * ct) * k]);
    o.len = 0; for (let i = 1; i < o.pts.length; i++) o.len += Math.hypot(o.pts[i][0] - o.pts[i - 1][0], o.pts[i][1] - o.pts[i - 1][1]);
    o.len = o.len || 0.5;
  }
  out.featureCount = featureCount;
  return out;
}

// ---------- drawing ----------
function seg(o, from, to) {
  ctx.globalCompositeOperation = o.kind === 'erase' ? 'destination-out' : 'source-over';
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
/** Start a sheet: `done` is the share of the portrait already on it. */
function begin(newSeed, done) {
  seed = newSeed;
  ctx.clearRect(0, 0, W, H);
  strokes = portrait(seed);
  si = 0; sp = 0; drawing = 'travel'; wait = 0; untilLook = 60; held = 0;
  jump(typeof done === 'number' ? Math.floor(strokes.length * done) : done);
}
function jump(n) {
  for (; si < Math.min(n, strokes.length); si++) seg(strokes[si], 0, 1);
  const o = strokes[Math.min(si, strokes.length - 1)];
  if (o) pen = o.pts[0].slice();
}

// The pencil: it travels to the root of the next hair, draws it at an even pace, lifts. Now and
// then it stops while he looks at what he has done.
let drawing = 'travel', wait = 0, untilLook = 60, held = 0;
function work() {
  if (wait > 0) { wait--; return; }
  const o = strokes[si];
  if (!o) { held++; return; }
  if (drawing === 'travel') {
    const dx = o.pts[0][0] - pen[0], dy = o.pts[0][1] - pen[1], d = Math.hypot(dx, dy);
    const v = clamp(d * 0.09, 0.7, 3.2);
    if (d <= v) { pen = o.pts[0].slice(); drawing = 'draw'; sp = 0; wait = d > 24 ? 6 : 1; } else { pen[0] += (dx / d) * v; pen[1] += (dy / d) * v; }
    return;
  }
  const take = Math.min(1 - sp, o.v / o.len);
  pen = seg(o, sp, sp + take); sp += take;
  if (sp >= 1 - 1e-6) {
    si++; sp = 0; drawing = 'travel'; wait = 1 + ((Math.random() * 3) | 0);
    if (--untilLook <= 0) { untilLook = 45 + ((Math.random() * 70) | 0); wait = 50 + ((Math.random() * 70) | 0); }
  }
}

// ---------- the sheet on the page, the hands ----------
// away: 0 = the sheet lies under his hands, 1 = put away and hands resting near him.
let away = 0, swap = false, last = 0, off = 0;
const wantAway = () => swap || document.body.classList.contains('is-gallery') || window.scrollY > base.h * 0.35;
function pose() {
  const a = ss(0, 0.2, away), b = ease(clamp((away - 0.2) / 0.52, 0, 1)), c = ease(clamp((away - 0.72) / 0.28, 0, 1));
  const near = document.body.classList.contains('is-gallery') ? 0 : -Math.min(window.scrollY, base.h * 0.6);
  off = lerp(near, -(base.top + base.h + 16), b);
  scrap.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
  scrap.style.visibility = b >= 1 ? 'hidden' : '';
  const hb = artist.headBottom(), cx = artist.center();
  const restR = [cx + 150 * S, hb * 0.74], restL = [cx - 160 * S, hb * 0.78];
  const floor = hb * 0.45;                                   // the hands stop near him, the sheet goes on
  let R = [lerp(base.left + pen[0], base.left + base.w * 0.84, a), Math.max(floor, lerp(base.top + pen[1], base.top + base.h * 0.8, a) + off)];
  let L = [base.left + 14 * S, Math.max(floor, base.top + base.h * 0.86 + off)];
  R = [lerp(R[0], restR[0], c), lerp(R[1], restR[1], c)];
  L = [lerp(L[0], restL[0], c), lerp(L[1], restL[1], c)];
  artist.hands(R, L);
  artist.sitBack(c);
}
function tick(now) {
  const dt = Math.min(50, now - (last || now)); last = now;
  const target = wantAway() ? 1 : 0;
  if (away !== target) away = clamp(away + Math.sign(target - away) * dt / 2800, 0, 1);
  if (away === 1 && swap) { swap = false; begin((Math.random() * 1e9) | 0, 9); }
  if (away === 0) {
    work();
    if (held > 720) { held = 0; swap = true; }
  }
  pose();
  requestAnimationFrame(tick);
}

// ---------- placement ----------
let onPlace = () => {};
export function place() {
  S = artist.scale();
  const cx = artist.center();
  const w = Math.round(Math.max(170, 440 * S)), h = Math.round(w * 0.82);
  const left = Math.round(cx - w / 2 + 6 * S), top = Math.round(artist.headBottom() - 14 * S);
  scrap.style.cssText = `width:${w}px;height:${h}px;left:${left}px;top:${top}px`;
  dpr = Math.min(2, devicePixelRatio || 1);
  const first = !base, keep = si;
  W = w; H = h; cv.width = w * dpr; cv.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-ink').trim() || '#232327';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  base = { left, top, w, h };
  onPlace(base);
  if (first) begin((Math.random() * 1e9) | 0, reduce.matches ? 1 : 0.5 + Math.random() * 0.14);
  else begin(seed, keep);
  if (reduce.matches) { away = wantAway() ? 1 : 0; pose(); }
}
/** Bottom of the sheet in viewport px when the page is at the top: the content starts below it. */
export const bottom = () => (base ? base.top + base.h : 0);
export function init(cb) {
  if (cb) onPlace = cb;
  place();
  window.addEventListener('resize', place);
  if (reduce.matches) { window.addEventListener('scroll', () => { away = wantAway() ? 1 : 0; pose(); }, { passive: true }); return; }
  requestAnimationFrame(tick);
}
export const debug = { finish: () => jump(1e9), jump: (f) => jump(Math.floor(strokes.length * f)), count: () => [si, strokes.length, strokes.featureCount] };
