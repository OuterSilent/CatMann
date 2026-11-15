import { EN, IT_EXTRA, WORKS } from './content.js';
import * as R from './rough.js';
import * as artist from './artist.js';
import * as ink from './ink.js';
import * as doodle from './doodle.js';
import * as desk from './desk.js';
import * as gallery from './gallery.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const ph = (n) => (window.__PH && window.__PH[n]) || `placeholder/${n}.jpg`;
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };

// ---------- language ----------
let lang = store.get('cm-lang') === 'en' ? 'en' : 'it';
const IT = { ...IT_EXTRA };
const tr = (k) => (lang === 'en' ? EN[k] : IT[k]) ?? k;
function captureItalian() {
  $$('[data-i18n]').forEach((e) => { IT[e.dataset.i18n] = e.textContent; });
  $$('[data-i18n-html]').forEach((e) => { IT[e.dataset.i18nHtml] = e.innerHTML; });
  $$('[data-i18n-aria]').forEach((e) => { IT[e.dataset.i18nAria] = e.getAttribute('aria-label'); });
  $$('[data-i18n-alt]').forEach((e) => { IT[e.dataset.i18nAlt] = e.getAttribute('alt'); });
}
function applyLang() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((e) => { e.textContent = tr(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach((e) => { e.innerHTML = tr(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach((e) => e.setAttribute('aria-label', tr(e.dataset.i18nAria)));
  $$('[data-i18n-alt]').forEach((e) => e.setAttribute('alt', tr(e.dataset.i18nAlt)));
  $('#lang').setAttribute('aria-label', lang === 'it' ? 'Switch to English' : "Passa all'italiano");
  $$('#lang span').forEach((s) => { if (s.dataset.l === lang) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
  renderShop(); gallery.setLang(lang);
}
let langMark = null;
function strikeOther() {
  ink.fadeOut(langMark);
  const other = $(`#lang span[data-l="${lang === 'it' ? 'en' : 'it'}"]`);
  const b = ink.textBox(other);
  langMark = ink.group();
  return ink.stroke(R.line(b.x - 3, b.y + b.h * 0.58, b.x + b.w + 3, b.y + b.h * 0.42, 0.6), langMark, 120);
}
async function toggleLang() {
  lang = lang === 'it' ? 'en' : 'it';
  store.set('cm-lang', lang);
  applyLang();
  await strikeOther();
  placeCurrentMark();
  const view = $('.view:not([hidden])');
  const h = view && view.querySelector('[data-write]');
  if (h && h.offsetParent) await ink.write(h, 230);
}

// ---------- shop ----------
function renderShop() {
  $('#shop').innerHTML = WORKS.filter((w) => w.price).map((w, i) => `
    <article class="item fade" style="--i:${i + 3}">
      <div class="pic framed"><img src="${ph(w.ph)}" alt="${w[lang]}" loading="lazy" width="600" height="800"></div>
      <h3>${w[lang]}</h3>
      <p class="mono">${w.tech[lang === 'it' ? 0 : 1]} · ${w.size}</p>
      <p class="price ${w.sold ? 'sold' : ''}">€ ${w.price}</p>
      ${w.sold ? `<p class="note">${tr('shop.sold')}</p>` : `<a class="tlink" href="#contatti">${tr('shop.ask')}</a>`}
    </article>`).join('');
  ink.frames($('#shop'));
  $('#works-list').innerHTML = WORKS.map((w) => `<li>${w[lang]}, ${w.year}. ${w.tech[lang === 'it' ? 0 : 1]}</li>`).join('');
}

// ---------- navigation ----------
const views = Object.fromEntries($$('.view').map((v) => [v.dataset.view, v]));
let current = null, navToken = 0, currentMark = null;
const nameFromHash = () => { const h = location.hash.replace('#', ''); return views[h] ? h : 'home'; };

function placeCurrentMark() {
  ink.fadeOut(currentMark); currentMark = null;
  const a = $(`#nav a[href="#${current}"]`);
  $$('#nav a').forEach((l) => l.removeAttribute('aria-current'));
  if (!a) return;
  a.setAttribute('aria-current', 'page');
  if (!a.offsetParent) return;
  R.seed(current.length * 97 + 3);
  const b = ink.textBox(a);
  currentMark = ink.group('red');
  ink.stroke(R.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 11, b.h / 2 + 5, 1.12, 0.9), currentMark, 240);
}

async function go(name, { first = false } = {}) {
  if (name === current) return;
  const token = ++navToken;
  const out = current && views[current], inn = views[name];
  closeMenu();
  hoverOff();
  {
    if (out && !first && current !== 'opere') await ink.erase(out);
    if (token !== navToken) return;
    for (const v of Object.values(views)) v.hidden = true;
    current = name;
    inn.hidden = false;
    const isGallery = name === 'opere';
    document.body.classList.toggle('is-gallery', isGallery);
    window.scrollTo(0, 0);
    if (isGallery) gallery.show(); else gallery.hide();
    desk.draw();
    placeCurrentMark();
    if (!isGallery) await ink.reveal(inn);
  }
}
window.addEventListener('hashchange', () => go(nameFromHash()));

// ---------- hover, focus, press ----------
let hoverG = null, hoverEl = null;
function hoverOff() { ink.fadeOut(hoverG); hoverG = null; hoverEl = null; }
const HOVERABLE = '#nav a, .tlink, .sig, #menu-btn, .g-arrow';
async function hoverOn(el) {
  if (hoverEl === el || !el.closest('#sheet')) return;
  hoverOff(); hoverEl = el;
  if (el.getAttribute('aria-current') === 'page') return;
  R.seed((performance.now() * 1000) | 0);
  const kind = el.matches('.sig') ? 'under' : undefined;
  hoverG = await ink.mark(el, { kind });
}
document.addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; const el = e.target.closest?.(HOVERABLE); if (el) hoverOn(el); });
document.addEventListener('pointerout', (e) => { const el = e.target.closest?.(HOVERABLE); if (el && el === hoverEl && !el.contains(e.relatedTarget)) hoverOff(); });
document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest?.('.btn'); if (b) ink.press(b);
  if (e.pointerType === 'touch') { const el = e.target.closest?.(HOVERABLE); if (el) { hoverOn(el); setTimeout(hoverOff, 700); } }
});
// buttons: a second outline when the pointer arrives
let btnG = null;
document.addEventListener('pointerover', (e) => {
  const b = e.target.closest?.('.btn'); if (!b || e.pointerType === 'touch' || b.dataset.hot) return;
  b.dataset.hot = '1';
  const r = ink.box(b); R.seed((performance.now() * 1000) | 0);
  btnG = ink.group();
  ink.stroke(R.line(r.x + 6, r.y + r.h + 5, r.x + r.w + 5, r.y + r.h + 5, 0.8) + R.line(r.x + r.w + 5, r.y + r.h + 5, r.x + r.w + 5, r.y + 6, 0.8), btnG, 200);
  const g = btnG;
  b.addEventListener('pointerleave', () => { delete b.dataset.hot; ink.fadeOut(g); }, { once: true });
});
// keyboard focus: a box drawn by hand instead of the browser outline
let focusG = null;
document.addEventListener('focusin', (e) => {
  ink.fadeOut(focusG); focusG = null;
  const el = e.target;
  if (!el.matches?.(':focus-visible') || !el.closest('#sheet') || el.matches('input, textarea')) return;
  R.seed((performance.now() * 1000) | 0);
  ink.mark(el.matches('.btn, .ministack') ? el : el, { kind: 'box', ms: 160 }).then((g) => { focusG = g; });
});
document.addEventListener('focusout', () => { ink.fadeOut(focusG); focusG = null; });

// ---------- menu (small screens) ----------
const nav = $('#nav'), menuBtn = $('#menu-btn');
const small = matchMedia('(max-width: 1240px)');
function closeMenu() { if (!small.matches) return; nav.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
async function openMenu() {
  nav.hidden = false; menuBtn.setAttribute('aria-expanded', 'true');
  placeCurrentMark();
  const links = $$('#nav a');
  links.forEach((a) => { a.style.clipPath = 'inset(0 100% 0 0)'; });
  for (const a of links) await ink.write(a, ink.D.menu / links.length - 40);
  links.forEach((a) => { a.style.clipPath = ''; });
}
menuBtn.addEventListener('click', () => (nav.hidden ? openMenu() : closeMenu()));
function syncMenu() { nav.hidden = small.matches; menuBtn.setAttribute('aria-expanded', 'false'); }
small.addEventListener('change', () => { syncMenu(); placeCurrentMark(); });

// ---------- form ----------
$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const note = $('#form-note');
  note.textContent = $('#f-msg').value.trim() ? tr('contact.done') : tr('contact.empty');
  ink.write(note, 320);
});

// ---------- room for the artist ----------
// The header keeps a free column under the head and reserves the band down to the scrap of paper.
function fitBand() {
  const root = document.documentElement.style;
  const sheetTop = $('#sheet').getBoundingClientRect().top + window.scrollY;
  root.setProperty('--head-w', `${Math.round(artist.bodyHalf() * 2 + 16)}px`);
  root.setProperty('--row-top', `${Math.max(14, Math.round(artist.headBottom() * 0.36 - sheetTop))}px`);
  root.setProperty('--head-b', `${Math.round(artist.headBottom() * 1.3 - sheetTop)}px`);
  root.setProperty('--band-in', `${Math.round(doodle.bottom() + 34 - sheetTop)}px`);
}

// ---------- start ----------
function start() {
  document.body.classList.add('ink');
  ink.readDurations();
  $$('img[data-ph]').forEach((img) => { img.src = ph(img.dataset.ph); });
  captureItalian();
  desk.init();
  ink.frames();
  artist.init();
  gallery.init({ works: WORKS, src: ph, label: tr, lang, top: () => artist.headBottom() });
  applyLang();
  syncMenu();
  doodle.init(fitBand);
  $('#lang').addEventListener('click', toggleLang);
  go(nameFromHash(), { first: true }).then(() => strikeOther());
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { placeCurrentMark(); strikeOther(); }, 160); });
  document.fonts?.ready.then(() => { placeCurrentMark(); strikeOther(); });
}
window.__cm = { gallery, artist, ink, go, doodle };
start();
