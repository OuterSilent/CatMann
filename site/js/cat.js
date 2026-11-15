// The cat asleep on the corner of the desk, drawn in the same fine line as the artist.
// It sits up for a moment when the artist redraws a page, or when it is clicked.
import { FIG } from './figures.js';

const btn = document.getElementById('cat');
let timer = 0;
function pose(key, off) {
  const f = FIG[key];
  // both poses share one viewBox; the loaf is nudged so the two bodies overlap
  return `<g class="pose" data-pose="${key}" ${off ? 'data-off' : ''}><path class="paperfill" d="${f.sil}"/><path class="ln" d="${f.ink}" vector-effect="non-scaling-stroke"/></g>`;
}
export function wake(ms = 2600) {
  btn.classList.add('awake');
  btn.querySelector('[data-pose=catLoaf]').setAttribute('data-off', '');
  btn.querySelector('[data-pose=catSit]').removeAttribute('data-off');
  clearTimeout(timer);
  timer = setTimeout(() => {
    btn.classList.remove('awake');
    btn.querySelector('[data-pose=catSit]').setAttribute('data-off', '');
    btn.querySelector('[data-pose=catLoaf]').removeAttribute('data-off');
  }, ms);
}
export function init() {
  btn.insertAdjacentHTML('beforeend', `<svg viewBox="0 -40 385 350" aria-hidden="true"><g transform="translate(0 10)">${pose('catLoaf')}</g><g transform="translate(60 -40) scale(.95)">${pose('catSit', true)}</g></svg>`);
  btn.addEventListener('click', () => wake(3200));
}
