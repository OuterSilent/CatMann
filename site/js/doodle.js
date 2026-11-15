// The scrap of paper next to the artist's hand: a small generative scribble, different every visit.
import * as artist from './artist.js';

const scrap = document.getElementById('scrap');
const cv = scrap.querySelector('canvas');
const ctx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let W = 0, H = 0, dpr = 1, x = 0, y = 0, ang = 0, va = 0, steps = 0, modeN = 0, fading = 0, rect = null, ink = '#6b6a70';

function place() {
  const S = artist.scale(), cx = artist.center();
  const w = Math.round(Math.max(96, 300 * S)), h = Math.round(w * 0.62);
  const left = Math.min(innerWidth - w - 10, cx + 340 * S);
  scrap.style.cssText = `width:${w}px;height:${h}px;left:${left}px;top:${innerHeight - h - Math.max(14, 60 * S)}px;rotate:3deg`;
  dpr = Math.min(2, devicePixelRatio || 1);
  W = w; H = h; cv.width = w * dpr; cv.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ink = getComputedStyle(document.documentElement).getPropertyValue('--c-ink-soft').trim() || ink;
  reset();
}
function reset() {
  ctx.clearRect(0, 0, W, H);
  x = W * (0.3 + Math.random() * 0.4); y = H * (0.3 + Math.random() * 0.4);
  ang = Math.random() * 6.28; va = 0; steps = 0; fading = 0; modeN = Math.floor(Math.random() * 4);
  rect = scrap.getBoundingClientRect();
}
function step() {
  const px = x, py = y, t = steps;
  if (modeN === 0) { va += (Math.random() - 0.5) * 0.05; va *= 0.96; ang += va + 0.02; }            // loose loops
  else if (modeN === 1) { ang += Math.sin(t * 0.045) * 0.11 + (Math.random() - 0.5) * 0.04; }        // waves
  else if (modeN === 2) { ang += 0.03 * Math.sin(t * 0.011) + 0.036; }                               // spiral rosette
  else { ang += (Math.random() < 0.035 ? (Math.random() - 0.5) * 2.6 : 0) + 0.012; }                 // angular walk
  const sp = 0.9;
  x += Math.cos(ang) * sp; y += Math.sin(ang) * sp;
  const m = 9;
  if (x < m || x > W - m || y < m || y > H - m) { ang += Math.PI * 0.55; x = Math.min(W - m, Math.max(m, x)); y = Math.min(H - m, Math.max(m, y)); }
  ctx.strokeStyle = ink; ctx.globalAlpha = 0.5 + Math.random() * 0.25; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
  steps++;
}
function tick() {
  if (!document.hidden && !artist.isBusy() && !document.body.classList.contains('is-gallery')) {
    if (fading) {
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
      if (++fading > 90) reset();
    } else { step(); step(); if (steps > 2600) fading = 1; }
  }
  requestAnimationFrame(tick);
}
export function init() {
  place();
  window.addEventListener('resize', place);
  // the pencil sits on the growing end of the scribble (3 degrees of rotation are ignored: the offset is under a pixel)
  artist.setIdle(() => [rect.left + x, rect.top + y]);
  if (reduce.matches) { for (let i = 0; i < 900; i++) step(); return; }
  requestAnimationFrame(tick);
}
