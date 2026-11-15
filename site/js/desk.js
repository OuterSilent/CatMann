// The desk around the sheet: faint wood grain and a few things left on it.
import * as R from './rough.js';

const grain = document.getElementById('grain');
const props = document.getElementById('props');

function cup(x, y, r, coffee = true) {
  let s = `<circle cx="${x}" cy="${y}" r="${r * 1.55}" class="paperfill"/><path class="ln" d="${R.ellipse(x, y, r * 1.55, r * 1.55, 1.06, 0.6)}"/>`;
  s += `<path class="ln" d="${R.ellipse(x, y, r, r, 1.06, 0.5)}"/><path class="ln-soft" d="${R.ellipse(x, y, r * 0.84, r * 0.84, 1.02, 0.4)}"/>`;
  if (coffee) s += `<circle cx="${x}" cy="${y}" r="${r * 0.82}" fill="var(--c-ink)" opacity=".08"/>`;
  // handle
  s += `<path class="ln" d="${R.smooth([[x + r * 0.9, y - r * 0.42], [x + r * 1.5, y - r * 0.5], [x + r * 1.62, y], [x + r * 1.5, y + r * 0.5], [x + r * 0.9, y + r * 0.42]])}"/>`;
  return s;
}
function pencil(x, y, len, ang) {
  const w = 7;
  const body = R.rect(0, -w / 2, len, w, 0.4, 1);
  return `<g transform="translate(${x} ${y}) rotate(${ang})"><rect x="0" y="${-w / 2}" width="${len}" height="${w}" class="paperfill"/><path class="ln" d="${body}M${len},${-w / 2}L${len + 14},0L${len},${w / 2}M${len + 9},-1.6L${len + 9},1.6M12,${-w / 2}L12,${w / 2}"/><path class="ln-soft" d="M14,0L${len - 2},0"/></g>`;
}

export function draw() {
  const w = innerWidth, h = Math.max(innerHeight, 600);
  R.seed(77);
  let g = '';
  for (let i = 0; i < 11; i++) {
    const y = R.rnd() * h, amp = 4 + R.rnd() * 9, wl = 160 + R.rnd() * 220;
    const pts = [];
    for (let x = -30; x <= w + 30; x += w / 12) pts.push([x, y + Math.sin(x / wl + i) * amp + R.jit(2)]);
    g += `<path class="grain" d="${R.smooth(pts)}"/>`;
  }
  grain.setAttribute('viewBox', `0 0 ${w} ${h}`); grain.innerHTML = g;
  // things on the desk: only where the desk is wide enough to hold them
  const sheet = document.getElementById('sheet').getBoundingClientRect();
  const margin = sheet.left;
  let p = '';
  if (margin > 120) {
    R.seed(5);
    const r = Math.min(34, margin * 0.2);
    p += cup(margin * 0.5, h * 0.34, r);
    p += pencil(margin * 0.3, h * 0.62, Math.min(150, margin * 0.9), -78);
    p += pencil(margin * 0.52, h * 0.66, Math.min(130, margin * 0.8), -70);
    // eraser
    p += `<g transform="translate(${w - margin * 0.55} ${h * 0.52}) rotate(14)"><rect x="-22" y="-13" width="44" height="26" rx="5" class="paperfill"/><path class="ln" d="${R.rect(-22, -13, 44, 26, 0.5, 1)}"/><path class="ln-soft" d="M-8,-13L-8,13"/></g>`;
  }
  props.setAttribute('viewBox', `0 0 ${w} ${h}`); props.innerHTML = p;
}
export function init() { draw(); let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 120); }); }
