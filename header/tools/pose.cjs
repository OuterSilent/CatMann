// pose.cjs out.png '<js that uses __cm>' [width] [height] [clip x0,y0,x1,y1 in stage px] [zoom]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, out, js = '', w = '2171', h = '724', clip = '', zoom = '1'] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +zoom });
  p.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text()); });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../dist/test_manual.html'));
  await p.evaluate(`(async()=>{ ${js} })()`);
  await p.waitForTimeout(150);
  const opt = { path: out };
  if (clip) { const [x0, y0, x1, y1] = clip.split(',').map(Number); const k = (+w) / 2171; opt.clip = { x: x0 * k, y: y0 * k, width: (x1 - x0) * k, height: (y1 - y0) * k }; }
  await p.screenshot(opt);
  await b.close();
  console.log(out);
})();
