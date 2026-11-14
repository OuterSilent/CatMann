// timeline.cjs [secs] -> prints what happens when (behaviours, strokes drawn, page reset), with a seeded Math.random
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const secs = +(process.argv[2] || 120);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2171, height: 724 } });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../dist/test_manual.html'));
  await p.evaluate(`(async()=>{ Math.random = (function(){ var s = 12345; return function(){ s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })(); __cm.bootManual(); })()`);
  let prev = '';
  for (let t = 0; t < secs; t += 0.5) {
    await p.evaluate('__cm.run(0.5, 30)');
    const s = await p.evaluate(`(function(){ var S = __cm.S; return [__cm.strokes.filter(function(s){return s.p>=1}).length, __cm.isBusy() ? 1 : 0, S.page.toFixed(2), S.eye.toFixed(1), Math.round(S.pawX), Math.round(S.lhx), Math.round(S.cHeadTilt), Math.round(S.headRot)].join(' ') })()`);
    const key = s.split(' ').slice(1).join(' ');
    if (key !== prev) { console.log((t + 0.5).toFixed(1).padStart(6), 'strokes busy page eye pawX lhx tilt headRot:', s); prev = key; }
  }
  await b.close();
})();
