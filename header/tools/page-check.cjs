// page-check.cjs [outDir] -> functional check of the preview page: behaviour buttons, pause, touching the cat, phone menu.
// Screenshots go to outDir (default ../view, not committed).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, '../view'));
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const url = 'file://' + path.resolve(__dirname, '../dist/preview.html');
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text().slice(0, 300)); });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto(url); await p.waitForTimeout(1200);
  const hero = p.locator('.cm-hero');
  const st = async () => (await p.locator('#try-status').textContent());
  console.log('status0:', await st());
  for (const [id, waits] of [['act-attention', [1600, 1600, 2500]], ['act-disturb', [1500, 1500, 2500]], ['act-observe', [1500, 2000]]]) {
    await p.click('#' + id);
    console.log(id, 'status:', await st());
    let k = 0;
    for (const w of waits) { await p.waitForTimeout(w); await hero.screenshot({ path: path.join(OUT, `pt_${id}_${k++}.png`) }); }
    await p.waitForTimeout(6000);
    console.log(id, 'after:', await st());
  }
  // pause
  const pb = p.locator('[data-cm-pause]');
  console.log('pause hidden?', await pb.evaluate(e => e.hidden), 'label', await pb.getAttribute('aria-label'));
  await pb.click(); await p.waitForTimeout(600);        // let the button's own hover transition finish
  console.log('paused: pressed', await pb.getAttribute('aria-pressed'), 'label', await pb.getAttribute('aria-label'), 'class', await hero.getAttribute('class'));
  const a1 = await hero.screenshot(); await p.waitForTimeout(1500); const a2 = await hero.screenshot();
  console.log('frames identical while paused:', Buffer.compare(a1, a2) === 0);
  await pb.click(); await p.waitForTimeout(800); const a3 = await hero.screenshot();
  console.log('moves again after resume:', Buffer.compare(a2, a3) !== 0, 'pressed', await pb.getAttribute('aria-pressed'));
  // cat hit
  await p.locator('.cm-cat-hit').click(); await p.waitForTimeout(1800); await hero.screenshot({ path: path.join(OUT, 'pt_cat_click.png') });
  await p.close();
  // phone: menu
  const q = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  q.on('pageerror', e => console.log('[pageerror]', e.message));
  await q.goto(url); await q.waitForTimeout(800);
  await q.click('#menu-btn'); await q.waitForTimeout(200);
  console.log('menu expanded', await q.getAttribute('#menu-btn', 'aria-expanded'));
  await q.screenshot({ path: path.join(OUT, 'pt_phone_menu.png') });
  await q.click('#links a[href="#opere"]'); await q.waitForTimeout(900);
  console.log('after link: expanded', await q.getAttribute('#menu-btn', 'aria-expanded'), 'scrollY', await q.evaluate('scrollY'));
  await q.screenshot({ path: path.join(OUT, 'pt_phone_works.png') });
  await b.close();
})();
