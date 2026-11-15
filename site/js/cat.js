// The grey cat asleep on the corner of the desk. It lifts its head when the artist redraws a page.
import { FIG } from './figures.js';

const btn = document.getElementById('cat');
let timer = 0;
function pose(key, off) {
  const f = FIG[key];
  // both poses share one viewBox; the loaf is nudged so the two bodies overlap
  return `<g class="pose" data-pose="${key}" ${off ? 'data-off' : ''}><path class="catfill" d="${f.sil}"/><path class="ln" d="${f.ink}" vector-effect="non-scaling-stroke"/></g>`;
}
export function wake(ms = 2600) {
  btn.classList.add('awake');
  btn.querySelector('[data-pose=catCurl]').setAttribute('data-off', '');
  btn.querySelector('[data-pose=catLoaf]').removeAttribute('data-off');
  clearTimeout(timer);
  timer = setTimeout(() => {
    btn.classList.remove('awake');
    btn.querySelector('[data-pose=catLoaf]').setAttribute('data-off', '');
    btn.querySelector('[data-pose=catCurl]').removeAttribute('data-off');
  }, ms);
}
export function init() {
  btn.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 385 335" aria-hidden="true">${pose('catCurl')}<g transform="translate(0 18)">${pose('catLoaf', true)}</g></svg>`);
  btn.addEventListener('click', () => wake(3200));
}
