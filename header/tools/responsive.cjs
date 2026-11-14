// responsive.cjs out.png width height dsf [js]  -> screenshot of the hero only at a given viewport
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, out, w, h, dsf = '1', js = "__cm.freeze(); __cm.ink(); __cm.S.tailAmp=0; __cm.S.track=0; __cm.set({}, 0)", page_ = '../dist/test_manual.html'] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dsf });
  p.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text()); });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(__dirname, page_));
  await p.evaluate(`(async()=>{ ${js} })()`);
  await p.waitForTimeout(200);
  const r = await p.evaluate(`(function(){ var h = document.querySelector('.cm-hero').getBoundingClientRect(), s = document.querySelector('.cm-stage').getBoundingClientRect(); return {hero:[h.x,h.y,h.width,h.height], stage:[s.x,s.y,s.width,s.height], u:getComputedStyle(document.querySelector('.cm-stage')).getPropertyValue('--u')}; })()`);
  console.log(JSON.stringify(r));
  await p.locator('.cm-hero').screenshot({ path: out });
  await b.close();
})();
