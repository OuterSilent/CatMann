// page-shot.cjs out.png width height dsf [fullPage=1] [waitMs] [reduced]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, out, w = '1440', h = '900', dsf = '1', full = '1', wait = '1500', reduced = ''] = process.argv;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dsf, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.type(), m.text().slice(0, 300)); });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  p.on('requestfailed', r => console.log('[requestfailed]', r.url().slice(0, 120)));
  await p.goto('file://' + path.resolve(__dirname, '../dist/preview.html'));
  await p.waitForTimeout(+wait);
  const m = await p.evaluate(`({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight, fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.style + ' ' + f.weight).join(' | ')})`);
  console.log(JSON.stringify(m));
  await p.screenshot({ path: out, fullPage: full === '1' });
  await b.close();
})();
