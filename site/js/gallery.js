// The gallery: a pile of drawings on the desk. The top sheet follows the finger, its corner
// curls, then it slides past the edge of the screen in perspective. Drawn in WebGL; without
// WebGL the sheets simply slide.
import * as R from './rough.js';

const root = document.getElementById('gallery');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const hex = (h) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

let works = [], srcOf = (n) => n, label = (k) => k, lang = 'it';
let index = 0, t = 0, moving = null; // moving: {from, to, dir} while a sheet is in the air
let canvas, gl, prog, loc = {}, tex = new Map(), vw = 0, vh = 0, dpr = 1;
let rect = { x: 0, y: 0, w: 300, h: 400 };
let els = {};
const GRID = [44, 58];

const VS = `
precision highp float;
attribute vec2 aUV;
uniform vec2 uSize, uPos, uView, uCurlO, uCurlN;
uniform vec3 uMove; uniform float uR, uRotY, uD, uShadow;
varying vec2 vUV; varying float vTheta, vD;
void main(){
  vec2 p = aUV * uSize; float z = 0.0;
  float d = dot(p - uCurlO, uCurlN); float th = 0.0;
  if (d > 0.0) {
    th = d / uR;
    if (th < 3.14159265) { p -= uCurlN * (d - uR * sin(th)); z = uR * (1.0 - cos(th)); }
    else { p -= uCurlN * (d + d - 3.14159265 * uR); z = 2.0 * uR; th = 3.14159265; }
  }
  vTheta = th; vD = d / uR; vUV = aUV;
  vec2 q = p - uSize * 0.5;
  float c = cos(uRotY), s = sin(uRotY);
  float x = q.x * c - z * s; float zz = q.x * s + z * c + uMove.z;
  vec2 w = uPos + uSize * 0.5 + vec2(x, q.y) + uMove.xy;
  if (uShadow > 0.5) { w += vec2(6.0 + zz * 0.22, 9.0 + zz * 0.3) ; zz = 0.0; }
  vec2 ctr = uView * 0.5;
  vec2 sc = ctr + (w - ctr) * (uD / (uD - zz));
  vec2 ndc = sc / uView * 2.0 - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, clamp(-zz / uD, -0.99, 0.99) + (uShadow > 0.5 ? 0.002 : 0.0), 1.0);
}`;
const FS = `
precision highp float;
uniform sampler2D uTex; uniform vec2 uSize; uniform vec3 uPaper, uEdge; uniform float uShadow, uFlat, uShadowA;
varying vec2 vUV; varying float vTheta, vD;
void main(){
  vec2 e = min(vUV, 1.0 - vUV) * uSize;
  float edge = min(e.x, e.y);
  if (uShadow > 0.5) { float a = smoothstep(0.0, 14.0, edge) * 0.17 * uShadowA; gl_FragColor = vec4(0.23, 0.2, 0.16, 1.0) * a; return; }
  vec3 col;
  if (gl_FrontFacing) {
    col = texture2D(uTex, vUV).rgb;
    col *= 1.0 - 0.2 * sin(vTheta);
    col *= 1.0 - 0.10 * uFlat * smoothstep(-3.2, 0.0, vD) * step(vD, 0.0);
  } else {
    col = uPaper * (0.93 - 0.13 * sin(vTheta));
  }
  col = mix(uEdge, col, smoothstep(0.4, 1.6, edge));
  gl_FragColor = vec4(col, 1.0);
}`;

function initGL() {
  gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return false;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const [nx, ny] = GRID, verts = [], idx = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) verts.push(i / nx, j / ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(prog, 'aUV'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  for (const u of ['uSize', 'uPos', 'uView', 'uCurlO', 'uCurlN', 'uMove', 'uR', 'uRotY', 'uD', 'uShadow', 'uTex', 'uPaper', 'uEdge', 'uFlat', 'uShadowA']) loc[u] = gl.getUniformLocation(prog, u);
  loc.count = idx.length;
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthFunc(gl.LEQUAL);
  return true;
}

/** A work as a sheet of paper: the picture inside a white margin. */
function texture(i) {
  const w = works[i];
  if (tex.has(i)) return tex.get(i);
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1366;
  const c = cv.getContext('2d');
  const paint = (img) => {
    c.fillStyle = css('--c-paper') || '#fcfbf8'; c.fillRect(0, 0, cv.width, cv.height);
    if (img) {
      const m = 70, bw = cv.width - m * 2, bh = cv.height - m * 2 - 40;
      const k = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
      const iw = img.naturalWidth * k, ih = img.naturalHeight * k;
      c.drawImage(img, (cv.width - iw) / 2, m + (bh - ih) / 2, iw, ih);
    }
  };
  paint(null);
  const T = gl.createTexture();
  const upload = () => {
    gl.bindTexture(gl.TEXTURE_2D, T);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  upload();
  const img = new Image();
  img.onload = () => { paint(img); upload(); draw(); };
  img.src = srcOf(w.ph);
  tex.set(i, T);
  return T;
}

/** Where the flying sheet is for a progress k: 0 = lying on the pile, 1 = gone past the left edge. */
function pose(k) {
  const curl = sstep(0, 0.14, k) * (1 - 0.5 * sstep(0.5, 1, k));
  const n = [0.864, 0.503];
  const reach = curl * 0.34 * rect.w;
  const travel = rect.x + rect.w * 1.08 + 24;
  return {
    o: [rect.w - n[0] * reach, rect.h - n[1] * reach], n, r: rect.w * 0.062,
    move: [-travel * k, -26 * sstep(0.2, 1, k), Math.max(vw, vh) * 0.045 * sstep(0.08, 1, k)],
    rot: 1.15 * sstep(0.12, 1, k),
  };
}
export const travel = () => rect.x + rect.w * 1.08 + 24;

function sheet(i, p, shadow) {
  gl.uniform2f(loc.uSize, rect.w, rect.h); gl.uniform2f(loc.uPos, rect.x, rect.y);
  gl.uniform2f(loc.uCurlO, p.o[0], p.o[1]); gl.uniform2f(loc.uCurlN, p.n[0], p.n[1]);
  gl.uniform3f(loc.uMove, p.move[0], p.move[1], p.move[2]);
  gl.uniform1f(loc.uR, p.r); gl.uniform1f(loc.uRotY, p.rot); gl.uniform1f(loc.uShadow, shadow ? 1 : 0);
  gl.uniform1f(loc.uFlat, p.flat ? 0 : 1);
  if (!shadow) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture(i)); gl.uniform1i(loc.uTex, 0); }
  gl.drawElements(gl.TRIANGLES, loc.count, gl.UNSIGNED_SHORT, 0);
}
const FLAT = { o: [1e6, 1e6], n: [1, 0], r: 10, move: [0, 0, 0], rot: 0, flat: true };

function draw() {
  if (!gl || root.hidden) return;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform2f(loc.uView, vw, vh); gl.uniform1f(loc.uD, Math.max(vw, vh) * 1.5);
  gl.uniform3fv(loc.uPaper, hex(css('--c-paper-shade') || '#f1eee8')); gl.uniform3fv(loc.uEdge, hex(css('--c-hair') || '#bdbab4'));
  gl.disable(gl.DEPTH_TEST);
  if (moving) {
    sheet(moving.under, FLAT, false);
    const p = pose(t);
    gl.uniform1f(loc.uShadowA, 1 - sstep(0.3, 0.85, t));
    sheet(moving.top, p, true);
    gl.enable(gl.DEPTH_TEST); gl.clear(gl.DEPTH_BUFFER_BIT);
    sheet(moving.top, p, false);
  } else sheet(index, FLAT, false);
}

function layout() {
  vw = innerWidth; vh = innerHeight; dpr = Math.min(2, devicePixelRatio || 1);
  const head = document.getElementById('sheet').getBoundingClientRect();
  const top = Math.max(70, head.bottom) + 22, capH = 86, bottom = vh - capH - Math.max(18, vh * 0.05);
  let h = Math.min(bottom - top, 780), w = h * 0.75;
  if (w > vw - 52) { w = vw - 52; h = w / 0.75; }
  rect = { x: Math.round((vw - w) / 2), y: Math.round(top + (bottom - top - h) / 2), w: Math.round(w), h: Math.round(h) };
  if (canvas) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
  els.under.forEach((u, i) => { u.style.cssText = `left:${rect.x}px;top:${rect.y}px;width:${rect.w}px;height:${rect.h}px;transform:rotate(${[2.6, 1.3, -1.1][i]}deg) translate(${[9, 5, -4][i]}px, ${[-5, -2, 3][i]}px)`; });
  els.cap.style.cssText = `left:${rect.x}px;top:${rect.y + rect.h + 14}px;width:${rect.w}px`;
  els.prev.style.cssText = `left:${Math.max(4, rect.x - 96)}px;top:${rect.y + rect.h / 2 - 28}px`;
  els.next.style.cssText = `left:${Math.min(vw - 60, rect.x + rect.w + 40)}px;top:${rect.y + rect.h / 2 - 28}px`;
  const wide = vw - (rect.x + rect.w) > 220;
  els.hint.style.left = wide ? `${rect.x + rect.w + 34}px` : `${rect.x + rect.w - 130}px`; els.hint.style.top = wide ? `${rect.y + 44}px` : `${rect.y + rect.h + 92}px`; els.hint.style.rotate = '-4deg';
  if (els.fallback) els.fallback.style.cssText = `left:${rect.x}px;top:${rect.y}px;width:${rect.w}px;height:${rect.h}px`;
  draw();
}

function caption() {
  const w = works[index];
  const n = (v) => String(v).padStart(2, '0');
  els.cap.innerHTML = `<span class="mono">№ ${n(index + 1)} / ${n(works.length)}</span><strong>${w[lang]}, ${w.year}</strong><span class="mono">${w.tech[lang === 'it' ? 0 : 1]}${w.size ? ' · ' + w.size : ''}</span>`;
  els.live.textContent = `${w[lang]}. ${index + 1} ${label('g.of')} ${works.length}`;
  if (els.fallback) els.fallback.querySelector('img').src = srcOf(w.ph);
}

let raf = 0;
function animate(to, ms, done) {
  cancelAnimationFrame(raf);
  const from = t, t0 = performance.now();
  if (reduce.matches) ms = 0;
  const stepf = (now) => {
    const k = ms ? Math.min(1, (now - t0) / ms) : 1;
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    t = from + (to - from) * e; draw();
    if (k < 1) raf = requestAnimationFrame(stepf); else done();
  };
  raf = requestAnimationFrame(stepf);
}
const mod = (i) => (i + works.length) % works.length;
function settle() { moving = null; t = 0; caption(); draw(); }

export function next() {
  if (!gl) { index = mod(index + 1); return caption(); }
  if (moving && moving.dir === -1) return;
  if (!moving) { moving = { top: index, under: mod(index + 1), dir: 1 }; t = 0; }
  els.hint.style.opacity = 0;
  animate(1, 560 * (1 - t) + 80, () => { index = moving.under; settle(); });
}
export function prev() {
  if (!gl) { index = mod(index - 1); return caption(); }
  if (moving && moving.dir === 1) return;
  if (!moving) { moving = { top: mod(index - 1), under: index, dir: -1 }; t = 1; }
  els.hint.style.opacity = 0;
  animate(0, 520 * t + 80, () => { index = moving.top; settle(); });
}

function pointer() {
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    cancelAnimationFrame(raf);
    drag = { x: e.clientX, y: e.clientY, t0: performance.now(), moved: false, lastX: e.clientX, lastT: performance.now(), v: 0, base: moving ? t : null };
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('drag');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;
    drag.moved = true; els.hint.style.opacity = 0;
    const now = performance.now(); drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.lastT); drag.lastX = e.clientX; drag.lastT = now;
    if (!moving) { moving = dx < 0 ? { top: index, under: mod(index + 1), dir: 1 } : { top: mod(index - 1), under: index, dir: -1 }; drag.base = moving.dir === 1 ? 0 : 1; drag.x = e.clientX; }
    t = clamp(drag.base - (e.clientX - drag.x) / travel(), 0, 1);
    draw();
  });
  const up = (e) => {
    if (!drag) return;
    canvas.classList.remove('drag');
    const d = drag; drag = null;
    if (!d.moved) { // a tap: on the sides of the sheet it turns the page
      if (moving) return moving.dir === 1 ? next() : prev();
      if (e.clientX > rect.x + rect.w * 0.6) next(); else if (e.clientX < rect.x + rect.w * 0.4) prev();
      return;
    }
    if (!moving) return;
    const far = Math.min(90, travel() * 0.2);
    if (moving.dir === 1) { if (t * travel() > far || d.v < -0.5) next(); else animate(0, 280, settle); }
    else if ((1 - t) * travel() > far || d.v > 0.5) prev(); else animate(1, 280, settle);
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
}

function arrowSvg(dir) {
  R.seed(dir > 0 ? 7 : 11);
  const x0 = dir > 0 ? 4 : 40, x1 = dir > 0 ? 40 : 4, k = dir > 0 ? -1 : 1;
  const d = R.line(x0, 14, x1, 14, 0.7) + `M${x1 + k * 10},6L${x1},14L${x1 + k * 10},22`;
  return `<svg viewBox="0 0 44 28" aria-hidden="true"><path class="ln" d="${d}"/></svg>`;
}

export function init(opts) {
  works = opts.works; srcOf = opts.src; label = opts.label; lang = opts.lang;
  root.innerHTML = `<i class="g-under"></i><i class="g-under"></i><i class="g-under"></i><canvas aria-hidden="true"></canvas>
    <p class="g-hint" aria-hidden="true"></p>
    <button class="g-arrow prev" type="button">${arrowSvg(-1)}</button><button class="g-arrow next" type="button">${arrowSvg(1)}</button>
    <div class="g-cap"></div><p class="vh" aria-live="polite"></p>`;
  canvas = root.querySelector('canvas');
  els = { under: [...root.querySelectorAll('.g-under')], cap: root.querySelector('.g-cap'), prev: root.querySelector('.prev'), next: root.querySelector('.next'), hint: root.querySelector('.g-hint'), live: root.querySelector('[aria-live]') };
  let ok = false;
  try { ok = initGL(); } catch (err) { console.warn('gallery: WebGL unavailable', err); gl = null; }
  if (!ok) {
    gl = null; canvas.remove();
    els.fallback = document.createElement('div'); els.fallback.className = 'g-fallback'; els.fallback.innerHTML = '<img alt="">';
    root.insertBefore(els.fallback, els.hint);
    els.fallback.addEventListener('click', (e) => (e.offsetX > els.fallback.offsetWidth / 2 ? next() : prev()));
  } else pointer();
  els.prev.addEventListener('click', prev); els.next.addEventListener('click', next);
  window.addEventListener('keydown', (e) => {
    if (root.hidden || e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });
  window.addEventListener('resize', () => { if (!root.hidden) layout(); });
  setLang(lang);
}
export function setLang(l) {
  lang = l;
  els.prev.setAttribute('aria-label', label('g.prev')); els.next.setAttribute('aria-label', label('g.next'));
  els.hint.textContent = label('g.hint');
  caption();
}
export function show() { root.hidden = false; layout(); caption(); if (gl) { texture(mod(index + 1)); texture(mod(index - 1)); } }
export function hide() { root.hidden = true; cancelAnimationFrame(raf); moving = null; t = 0; }
export const hasGL = () => !!gl;
/** For checks: freeze the flying sheet at progress k. */
export function freeze(k) { cancelAnimationFrame(raf); moving = { top: index, under: mod(index + 1), dir: 1 }; t = k; draw(); }
