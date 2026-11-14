// reduced-motion.cjs out.png -> the header with prefers-reduced-motion (must be a finished, still picture), plus a check that nothing moves
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 700 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../dist/test.html'));
  await p.waitForTimeout(500);
  const a = await p.locator('.cm-hero').screenshot();
  await p.waitForTimeout(1500);
  const c = await p.locator('.cm-hero').screenshot({ path: process.argv[2] });
  console.log('still:', Buffer.compare(a, c) === 0, ' classes:', await p.evaluate("document.querySelector('.cm-hero').className"), ' pause hidden:', await p.evaluate("document.querySelector('.cm-pause').hidden"));
  await b.close();
  // normal motion: pause button stops everything
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({ viewport: { width: 1440, height: 700 } });
  await p2.goto('file://' + path.resolve(__dirname, '../dist/test.html'));
  await p2.waitForTimeout(1200);
  await p2.click('.cm-pause');
  await p2.waitForTimeout(300);
  const s1 = await p2.locator('.cm-hero').screenshot();
  await p2.waitForTimeout(1200);
  const s2 = await p2.locator('.cm-hero').screenshot();
  console.log('paused still:', Buffer.compare(s1, s2) === 0, ' label:', await p2.evaluate("document.querySelector('.cm-pause').getAttribute('aria-label')"));
  await p2.click('.cm-pause');
  await p2.waitForTimeout(900);
  const s3 = await p2.locator('.cm-hero').screenshot();
  console.log('moves again:', Buffer.compare(s2, s3) !== 0);
  await b2.close();
})();
