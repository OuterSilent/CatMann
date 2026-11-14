// perf.cjs width height dsf secs -> frame pacing of the live header (software rendering here, so an upper bound)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, w = '1440', h = '900', dsf = '1', secs = '6'] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dsf });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  const t0 = Date.now();
  await p.goto('file://' + path.resolve(__dirname, '../dist/test.html'));
  const nav = await p.evaluate(`(function(){ var n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd)}; })()`);
  const res = await p.evaluate(`new Promise(function(res){ var ts = [], t0 = performance.now(); function f(t){ ts.push(t); if (t - t0 < ${+secs * 1000}) requestAnimationFrame(f); else res(ts); } requestAnimationFrame(f); })`);
  const d = []; for (let i = 1; i < res.length; i++) d.push(res[i] - res[i - 1]);
  d.sort((a, b) => a - b);
  const q = x => d[Math.min(d.length - 1, Math.floor(d.length * x))].toFixed(1);
  console.log(`${w}x${h}@${dsf}: load ${JSON.stringify(nav)}  frames ${d.length}  median ${q(0.5)} ms  p90 ${q(0.9)}  p99 ${q(0.99)}  max ${d[d.length - 1].toFixed(1)}`);
  const m = await p.evaluate(`(async function(){ if (performance.measureUserAgentSpecificMemory) { try { var r = await performance.measureUserAgentSpecificMemory(); return r.bytes; } catch (e) { return String(e); } } return performance.memory ? performance.memory.usedJSHeapSize : null; })()`);
  console.log('js heap', m);
  await b.close();
})();
