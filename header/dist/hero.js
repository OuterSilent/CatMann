/* Cosmin Mann — animated header runtime.
   Cut-out animation of vector layers: every moving piece is an HTML node holding an inline SVG,
   moved with a CSS matrix so the browser only composites (no repaint) for most of the motion. */
(function () {
  'use strict';
  var RIG = {"w":2171,"h":724,"bpm":92,"joints":{"tip":{"x":936,"y":656},"wrist":{"x":716,"y":600},"elbow":{"x":505,"y":606},"shoulder":{"x":772,"y":372},"hip":{"x":1060,"y":660},"neck":{"x":1062,"y":432},"lwrist":{"x":1350,"y":590},"lelbow":{"x":1392,"y":548},"lraise":{"x":1318,"y":448},"ltuck":{"x":1222,"y":583},"sheetPivot":{"x":1240,"y":632},"catGround":{"x":1700,"y":640},"tail":{"x":1882,"y":585},"catNeck":{"x":1548,"y":505},"catHead":{"x":1480,"y":520},"paw":{"x":1582,"y":620},"legA":{"x":1572,"y":584},"legB":{"x":1595,"y":579},"legC":{"x":1625,"y":592},"pawA":{"x":1571,"y":602},"pawB":{"x":1595,"y":601},"pawC":{"x":1615,"y":617}},"pawShadow":[[1550,631],[1617,632],[1629,640],[1612,647],[1560,647],[1544,640]],"sheetVanish":{"x":900.1,"y":513.5},"pet":{"x":1445,"y":452,"rot":-6},"disturb":{"pawX":-46,"pawY":38,"drag":14,"hx":1335,"hy":612,"hrot":2},"strokes":[{"kind":"light","pts":[[851.4,666.1],[860.9,666.3],[869.8,665.9],[877.7,665.6],[886.7,665.7],[895.7,666.0],[905.4,665.0],[913.6,665.6],[923.4,664.7],[932.2,665.2],[941.9,665.6],[950.2,665.2],[957.3,665.3],[965.9,664.4],[974.3,664.6],[983.9,664.8],[992.4,665.0],[999.6,664.8],[1009.2,664.5],[1016.6,664.2],[1025.5,664.4],[1033.8,664.0]]},{"kind":"light","pts":[[939.3,646.6],[940.0,648.1],[941.2,650.4],[942.3,652.5],[941.5,653.8],[941.6,656.0],[941.9,657.9],[944.1,660.0],[945.1,662.5],[945.3,664.4],[945.7,666.8],[946.9,668.6],[946.8,671.3],[946.5,673.8],[948.6,676.0],[950.1,679.6],[949.7,681.8],[949.7,685.0],[951.1,688.5],[952.2,690.7]]},{"kind":"line","pts":[[865.7,668.5],[864.0,665.5],[861.2,663.6],[860.6,660.9],[859.4,658.7],[859.5,657.0],[861.2,654.3],[863.7,653.0],[863.3,650.9],[864.8,648.6],[866.7,646.9],[866.8,644.9],[873.6,646.0],[881.1,647.0],[886.4,648.3],[893.1,650.1],[900.0,650.6],[906.5,651.9],[914.0,651.9],[921.7,651.3],[930.0,651.5],[938.8,650.9]]},{"kind":"line","pts":[[942.4,650.9],[949.9,651.3],[958.4,651.4],[966.4,651.1],[976.3,652.1],[980.9,650.6],[986.7,649.5],[992.4,647.5],[997.2,646.7],[1001.8,645.8],[1007.2,644.5],[1010.3,646.4],[1010.4,647.5],[1014.2,650.1],[1016.7,652.1],[1018.3,653.2],[1021.7,655.5],[1023.2,657.9],[1022.2,659.6],[1022.6,661.8],[1022.2,664.7],[1022.0,666.5]]},{"kind":"line","pts":[[1022.1,666.6],[1020.6,668.6],[1017.7,671.2],[1016.6,674.2],[1013.7,676.3],[1011.9,678.2],[1011.8,681.1],[1004.9,682.1],[999.0,684.9],[990.5,687.0],[983.6,689.0],[977.2,689.8],[966.2,691.7],[953.5,692.4],[939.4,691.9],[928.9,690.9],[920.2,689.6],[910.3,687.4],[902.7,685.7],[896.4,684.6],[887.0,682.2],[884.0,680.7],[878.8,678.3],[877.3,674.9],[872.0,672.5],[870.6,670.4],[866.0,668.3]]},{"kind":"dark","pts":[[880.4,664.4],[889.9,661.7],[896.7,659.2],[911.5,658.9],[920.2,661.8],[926.9,663.9],[918.4,665.4],[909.8,667.5],[893.6,666.8],[887.2,665.7],[880.9,663.9]]},{"kind":"dark","pts":[[1005.8,662.8],[997.3,660.9],[989.2,659.5],[974.3,659.2],[966.8,660.8],[960.8,663.4],[971.3,664.9],[979.7,666.6],[995.1,665.9],[999.7,664.5],[1005.9,663.1]]},{"kind":"dark","pts":[[904.4,660.1],[901.5,663.2],[905.3,667.0],[907.4,663.4],[904.2,660.0]]},{"kind":"dark","pts":[[981.8,659.4],[980.6,662.2],[985.8,665.6],[987.6,662.9],[981.8,659.3]]},{"kind":"line","pts":[[938.0,674.7],[946.9,674.5],[957.0,674.6],[947.8,678.2],[937.8,674.3]]},{"kind":"line","pts":[[948.6,678.3],[950.6,682.5],[942.8,683.2],[933.3,685.7]]},{"kind":"line","pts":[[949.9,682.0],[960.2,683.1],[968.1,685.4]]},{"kind":"line","pts":[[873.9,649.2],[874.2,651.2],[876.3,653.5],[877.0,655.1],[876.9,657.3],[887.8,655.0],[896.4,652.9]]},{"kind":"line","pts":[[1004.1,648.3],[1003.6,650.5],[1003.2,651.9],[1004.4,654.5],[1004.3,655.8],[995.5,654.6],[984.5,652.4]]},{"kind":"line","pts":[[929.0,652.4],[927.8,655.7],[928.4,658.1]]},{"kind":"line","pts":[[940.7,651.8],[942.0,653.7],[941.4,655.8],[942.6,658.3]]},{"kind":"line","pts":[[953.5,652.4],[955.4,654.6],[957.3,658.0]]},{"kind":"hatch","pts":[[872.0,669.5],[889.4,668.0],[893.6,670.2],[876.0,672.1],[881.8,674.7],[899.2,672.5],[903.4,675.2],[885.3,677.8],[891.5,679.8],[907.6,677.0],[914.4,680.0],[896.4,682.8]]},{"kind":"hatch","pts":[[1016.9,667.6],[998.8,666.4],[996.4,668.1],[1013.6,669.8],[1011.8,672.7],[993.3,671.2],[989.7,673.9],[1007.3,675.2],[1005.2,678.8],[986.2,675.5],[985.1,678.2],[1002.2,681.3]]},{"kind":"hatch","pts":[[870.4,647.9],[878.5,649.1],[880.8,649.8],[872.6,649.7],[872.0,651.1],[882.9,651.6],[884.4,652.8],[873.5,653.4],[873.9,655.4],[887.2,654.1]]},{"kind":"hatch","pts":[[1006.1,647.3],[998.5,648.9],[997.6,649.9],[1006.7,649.0],[1007.1,650.6],[996.8,650.5],[995.2,652.2],[1008.1,652.9],[1007.3,654.3],[993.5,653.2]]},{"kind":"line","pts":[[917.9,679.3],[907.9,678.6],[896.2,678.7],[886.9,678.0],[877.5,677.6],[866.8,677.2],[856.7,677.2],[845.0,677.8],[834.7,677.0],[825.2,676.3]]},{"kind":"line","pts":[[917.8,681.1],[908.3,681.2],[898.2,682.5],[889.2,681.6],[878.5,682.2],[868.8,683.2],[859.0,683.2],[847.1,683.4],[838.6,683.8],[828.9,682.9],[817.5,684.0]]},{"kind":"line","pts":[[920.0,682.9],[910.9,683.7],[900.6,685.5],[889.0,686.2],[880.3,687.0],[869.3,688.5],[857.3,689.1],[848.3,689.4],[837.2,691.0],[825.7,691.7]]},{"kind":"line","pts":[[980.3,678.7],[990.9,678.3],[999.9,676.8],[1007.3,676.9],[1018.0,675.6],[1026.9,676.0],[1034.6,674.5],[1044.0,674.5],[1052.7,674.0],[1062.9,673.7]]},{"kind":"line","pts":[[981.4,680.3],[991.2,680.0],[998.7,679.7],[1009.4,680.9],[1017.1,680.3],[1027.6,680.5],[1036.0,680.4],[1045.0,679.7],[1053.4,679.8],[1065.3,680.7],[1073.3,680.0]]},{"kind":"line","pts":[[980.3,682.2],[989.5,682.9],[1000.9,683.2],[1009.4,684.0],[1019.6,685.2],[1028.4,684.6],[1038.7,685.1],[1049.6,686.7],[1060.5,687.4],[1069.8,687.3]]}]};
  var hero = document.querySelector('[data-cm-hero]');
  if (!hero) return;
  var stage = hero.querySelector('.cm-stage');
  var N = {};
  stage.querySelectorAll('[data-n]').forEach(function (e) { N[e.dataset.n] = e; });
  var Q = function (s) { return stage.querySelector(s); };
  var W = RIG.w, H = RIG.h, J = RIG.joints;

  // ---------------------------------------------------------------- math
  var DEG = Math.PI / 180;
  function mul(m, n) {
    return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
      m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  }
  function chain() { var m = arguments[0]; for (var i = 1; i < arguments.length; i++) m = mul(m, arguments[i]); return m; }
  function T(x, y) { return [1, 0, 0, 1, x, y]; }
  function R(deg, c) { var k = Math.cos(deg * DEG), s = Math.sin(deg * DEG); return [k, s, -s, k, c.x - k * c.x + s * c.y, c.y - s * c.x - k * c.y]; }
  function SC(sx, sy, c) { return [sx, 0, 0, sy, c.x - sx * c.x, c.y - sy * c.y]; }
  function ap(m, p) { return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }; }
  /* Maps segment a0->b0 onto a1->b1, stretching along the segment only (thickness is kept). */
  function bone(a0, b0, a1, b1) {
    var t0 = Math.atan2(b0.y - a0.y, b0.x - a0.x), t1 = Math.atan2(b1.y - a1.y, b1.x - a1.x);
    var k = Math.hypot(b1.x - a1.x, b1.y - a1.y) / Math.hypot(b0.x - a0.x, b0.y - a0.y);
    var c0 = Math.cos(-t0), s0 = Math.sin(-t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
    return chain(T(a1.x, a1.y), [c1, s1, -s1, c1, 0, 0], [k, 0, 0, 1, 0, 0], [c0, s0, -s0, c0, 0, 0], T(-a0.x, -a0.y));
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  var E = {
    lin: function (p) { return p; },
    io: function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    out: function (p) { return 1 - Math.pow(1 - p, 3); },
    in: function (p) { return p * p * p; },
    back: function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
    sine: function (p) { return 0.5 - 0.5 * Math.cos(Math.PI * p); }
  };

  /* Matrices are worked out in stage units; the offset is handed to CSS in units too (--u), so the same pose holds at any size. */
  var cache = {};
  function setM(name, m) {
    var s = 'translate(calc(' + m[4].toFixed(2) + '*var(--u)),calc(' + m[5].toFixed(2) + '*var(--u)))';
    if (m[0] !== 1 || m[1] !== 0 || m[2] !== 0 || m[3] !== 1) s += ' matrix(' + m[0].toFixed(5) + ',' + m[1].toFixed(5) + ',' + m[2].toFixed(5) + ',' + m[3].toFixed(5) + ',0,0)';
    if (cache[name] !== s) { cache[name] = s; N[name].style.transform = s; }
  }
  function setAttr(el, k, v) { if (el.__v !== v || el.__k !== k) { el.setAttribute(k, v); el.__v = v; el.__k = k; } }

  // ---------------------------------------------------------------- state (everything the pose depends on)
  var S = {
    // artist
    penX: J.tip.x, penY: J.tip.y, penUp: 0, handRot: 0,
    headRot: 0, headX: 0, headY: 0, nod: 1, lean: 0,
    lhx: J.lwrist.x, lhy: J.lwrist.y, lhRot: 0, lhFlip: 1, lhShadow: 1, lhTuck: 0,
    // cat
    catX: 0, catY: 0, cHeadRot: 0, cHeadX: 0, cHeadY: 0, cHeadTilt: 0, track: 1,
    tail: 0, tailAmp: 1, tailSpeed: 1, pawX: 0, pawY: 0, pawRot: 0, eye: 0, blink: 0,
    // sheet + drawing (page: 1 = the page he draws on lies on the pad; larger = it is sliding off, towards the viewer)
    shX: 0, shY: 0, shRot: 0, page: 1
  };
  var REST = JSON.parse(JSON.stringify(S));
  var stroke = null;          // {el, len, p}
  var now = 0, tweens = [], alive = true;

  function tw(o, props, dur, ease) {
    return new Promise(function (res) {
      var from = {}; for (var k in props) from[k] = o[k];
      tweens.push({ o: o, from: from, to: props, t0: now, dur: Math.max(dur, 0.0001), ease: ease || E.io, res: res });
    });
  }
  function wait(d) { return new Promise(function (res) { tweens.push({ t0: now, dur: Math.max(d, 0.0001), res: res }); }); }
  function stepTweens() {
    for (var i = tweens.length - 1; i >= 0; i--) {
      var t = tweens[i], p = Math.min(1, (now - t.t0) / t.dur);
      if (t.o) { var e = t.ease(p); for (var k in t.to) t.o[k] = t.from[k] + (t.to[k] - t.from[k]) * e; }
      if (p >= 1) { tweens.splice(i, 1); t.res(); }
    }
  }

  // ---------------------------------------------------------------- pose: state -> matrices
  var par = { x: 0, y: 0, tx: 0, ty: 0, sy: 0 };
  var look = 0, lastEye = -1, tailPhase = 0, lastT = 0;
  var el = {
    shR: Q('#cmShR'), shL: Q('#cmShL'), leg: Q('#cmLeg'), legL: Q('#cmLegL'), legS: Q('#cmLegS'), pawSh: Q('#cmPawSh'), slv: Q('#cmSlv'), slvF: Q('#cmSlvF'), slvC: Q('#cmSlvC'), slvR: Q('#cmSlvR'),
    steam: [].slice.call(stage.querySelectorAll('#cmSteam polygon')), ink: Q('#cmInk'), page: Q('#cmPage'), pageEdge: Q('#cmPageEdge')
  };
  var steamBase = el.steam.map(function (p) { return p.getAttribute('points').trim().split(/\s+/).map(function (s) { var a = s.split(','); return [+a[0], +a[1]]; }); });

  function pose() {
    var t = now, dt = t - lastT; lastT = t;
    // ---- depth: far layer drifts against the pointer, near layer with it
    par.x += (par.tx - par.x) * 0.07; par.y += (par.ty - par.y) * 0.07;
    var Mfar = T(-par.x * 10, -par.y * 4 + Math.min(8, par.sy * 0.02));
    setM('far', Mfar); setM('neon', Mfar);
    setM('plant', T(par.x * 14, par.y * 6 - Math.min(10, par.sy * 0.025)));
    setM('camera', T(par.x * 18, par.y * 8 - Math.min(14, par.sy * 0.035)));

    // ---- artist
    var breath = Math.sin(t * 1.45);
    var Mm = chain(R(S.lean, J.hip), SC(1, 1 + 0.0035 * breath, J.hip));
    setM('torso', Mm);
    var beat = t * RIG.bpm / 60 * Math.PI * 2;
    var nod = S.nod * Math.sin(beat);
    setM('man_head', chain(Mm, T(S.headX, S.headY + nod * 0.9 - breath * 0.5), R(S.headRot + nod * 0.75, J.neck)));

    var Msh = chain(T(S.shX, S.shY), R(S.shRot, J.sheetPivot));
    setM('sheet', Msh);

    var tip = { x: S.penX, y: S.penY };
    if (stroke) {
      var pt = stroke.el.getPointAtLength(stroke.p * stroke.len);
      tip = ap(Msh, pt); S.penX = pt.x; S.penY = pt.y;
      stroke.el.style.strokeDashoffset = (stroke.len * (1 - stroke.p)).toFixed(1);
    }
    var up = S.penUp;
    var tipL = { x: tip.x - 4 * up, y: tip.y - 12 * up };
    var hr = S.handRot - 6 * up + clamp((tip.y - J.tip.y) * 0.1, -3, 5) + clamp((tip.x - J.tip.x) * -0.02, -3, 3);
    var Mh = chain(T(tipL.x - J.tip.x, tipL.y - J.tip.y), R(hr, J.tip));
    var wr = ap(Mh, J.wrist);
    var sh = ap(Mm, J.shoulder);
    var elb = { x: J.elbow.x + (wr.x - J.wrist.x) * 0.52, y: J.elbow.y + (wr.y - J.wrist.y) * 0.5 };
    setM('r_upper', bone(J.shoulder, J.elbow, sh, elb));
    setM('r_forearm', bone(J.elbow, J.wrist, elb, wr));
    setM('r_hand', Mh);
    // contact shadow of the drawing hand on the paper
    setAttr(el.shR, 'transform', 'translate(' + (tip.x - J.tip.x + 2 * up).toFixed(1) + ',' + (tip.y - J.tip.y + 3 * up).toFixed(1) + ')');
    el.shR.style.opacity = (0.62 - 0.3 * up).toFixed(2);

    // ---- left hand (rests on the sheet; lifts, turns over and reaches for the cat)
    // turning the hand over: it narrows to about a third and swaps sides at the wrist in one frame (it never shrinks to nothing)
    var flip = (S.lhFlip < 0 ? -1 : 1) * Math.max(0.32, Math.pow(Math.abs(S.lhFlip), 0.45));
    var Ml = chain(T(S.lhx - J.lwrist.x, S.lhy - J.lwrist.y), R(S.lhRot, J.lwrist), SC(flip, 1, J.lwrist));
    setM('l_hand', Ml);
    var lw = { x: S.lhx, y: S.lhy }, away = Math.hypot(lw.x - J.lwrist.x, lw.y - J.lwrist.y);
    var raise = clamp((J.lwrist.y - lw.y) / 110, 0, 1);            // the higher the hand, the more the elbow comes up to shoulder height
    var le = { x: lerp(J.lelbow.x + (lw.x - J.lwrist.x) * 0.22, J.lraise.x, raise), y: lerp(J.lelbow.y + (lw.y - J.lwrist.y) * 0.3, J.lraise.y, raise) };
    if (S.lhTuck > 0) {                                           // reaching along the sheet: the elbow comes in front of him, the forearm lies on the table edge
      le.x = lerp(le.x, J.ltuck.x + (lw.x - RIG.disturb.hx) * 0.45, S.lhTuck); le.y = lerp(le.y, J.ltuck.y + (lw.y - RIG.disturb.hy) * 0.45, S.lhTuck);
    }
    var vis = Math.max(clamp((away - 10) / 26, 0, 1), S.lhTuck);
    N.l_sleeve.style.opacity = vis.toFixed(2);
    if (vis > 0) { sleeve(le, lw); setAttr(el.slvR, 'opacity', raise.toFixed(2)); }   // the rim light only shows once the arm is up against the bright wall
    el.shL.style.opacity = (0.5 * S.lhShadow * clamp(1 - away / 18, 0, 1)).toFixed(2);

    // ---- cat
    var cb = Math.sin(t * 2.1);
    var Mc = T(S.catX, S.catY);
    setM('cat_body', chain(Mc, SC(1 + 0.003 * cb, 1 + 0.007 * cb, J.catGround)));
    tailPhase += dt * S.tailSpeed;
    var ta = clamp(S.tail + S.tailAmp * (5.5 * Math.sin(tailPhase * 1.2) + 2.5 * Math.sin(tailPhase * 2.9 + 1)), -24, 8);
    setM('cat_tail', chain(Mc, R(ta, J.tail)));
    var want = clamp((S.penX - J.tip.x) * 0.02 + (S.penY - J.tip.y) * -0.04, -3, 3.5) * S.track;
    look += (want - look) * 0.06;
    var Mch = chain(Mc, T(S.cHeadX, S.cHeadY - 0.9 * cb), R(S.cHeadRot + look, J.catNeck), R(S.cHeadTilt, J.catHead));
    setM('cat_head', Mch);
    var Mp = chain(Mc, T(S.pawX, S.pawY), R(S.pawRot, J.paw));
    setM('cat_paw_l', Mp);
    var reach = Math.hypot(S.pawX, S.pawY);
    el.leg.parentNode.style.opacity = clamp(reach / 6, 0, 1).toFixed(2);
    if (reach > 0.5) leg(Mc, Mp);
    var eye = Math.max(S.eye, S.blink);
    if (Math.abs(eye - lastEye) > 0.004) { lastEye = eye; N.cat_head.style.setProperty('--eye', eye.toFixed(3)); }

    // ---- steam: the ribbon bends from its base upwards
    for (var i = 0; i < el.steam.length; i++) {
      var pts = steamBase[i], s = '';
      for (var k = 0; k < pts.length; k++) {
        var h = 494 - pts[k][1];
        var dx = h * 0.055 * Math.sin(t * 1.3 - h * 0.035) + h * 0.02 * Math.sin(t * 2.3 - h * 0.05);
        s += (pts[k][0] + dx).toFixed(1) + ',' + (pts[k][1] - h * 0.02 * Math.sin(t * 0.9)).toFixed(1) + ' ';
      }
      el.steam[i].setAttribute('points', s);
    }
    // ---- the finished page slides across the table towards the viewer: it grows away from the point its sides run to
    if (el.page.__k !== S.page) {
      var k = el.page.__k = S.page, V = RIG.sheetVanish;
      if (k === 1) el.page.removeAttribute('transform');
      else el.page.setAttribute('transform', 'translate(' + (V.x * (1 - k)).toFixed(2) + ',' + (V.y * (1 - k)).toFixed(2) + ') scale(' + k.toFixed(4) + ')');
      el.pageEdge.setAttribute('opacity', (0.34 * clamp((k - 1) * 14, 0, 1)).toFixed(2));
    }
  }

  /* Sleeve of the lifted left arm: a low-poly tapered shape between elbow and wrist, with its cuff. */
  function sleeve(e, w) {
    var dx = w.x - e.x, dy = w.y - e.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    if (ny > 0) { nx = -nx; ny = -ny; }                              // n points up (towards the light)
    var we = 41, ww = 30, c = Math.min(24, L * 0.35);
    function P(a, n) { return (e.x + ux * a + nx * n).toFixed(1) + ',' + (e.y + uy * a + ny * n).toFixed(1); }
    el.slv.setAttribute('points', [P(-34, we), P(L * 0.5, we * 0.5 + ww * 0.5 + 3), P(L - c, ww), P(L - c, -ww), P(L * 0.4, -we * 0.6 - ww * 0.4 - 2), P(-34, -we)].join(' '));
    el.slvF.setAttribute('points', [P(-20, we), P(L * 0.5, we * 0.5 + ww * 0.5 + 3), P(L - c, ww), P(L * 0.3, 2)].join(' '));
    el.slvR.setAttribute('points', [P(-34, we), P(L * 0.5, we * 0.5 + ww * 0.5 + 3), P(L - c, ww), P(L - c, ww - 3.2), P(L * 0.5, we * 0.5 + ww * 0.5 - 0.5), P(-34, we - 3.5)].join(' '));
    el.slvC.setAttribute('points', [P(L - c, ww + 2.5), P(L + 5, ww - 2), P(L + 7, -ww + 4), P(L - c, -ww - 2.5)].join(' '));
  }
  /* Foreleg of the cat when the paw reaches out: the stretch of leg the picture shows above the paw, drawn out from the
     chest to wherever the paw is (lit front, shaded side), and the shadow under the paw. */
  function leg(Mc, Mp) {
    var a = ap(Mc, J.legA), b = ap(Mc, J.legB), c = ap(Mc, J.legC), a2 = ap(Mp, J.pawA), b2 = ap(Mp, J.pawB), c2 = ap(Mp, J.pawC);
    function f(p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }
    el.legS.setAttribute('points', [f(b), f(c), f(c2), f(b2)].join(' '));
    el.leg.setAttribute('points', [f(a), f(b), f(b2), f(a2)].join(' '));
    el.legL.setAttribute('points', [f(a), f(b2), f(a2)].join(' '));
    // the shadow lies on the table: it does not rise with a lifted paw, and it shows as the paw comes forward onto the sheet
    var Ms = chain(Mc, T(S.pawX, Math.max(0, S.pawY)));
    el.pawSh.setAttribute('points', RIG.pawShadow.map(function (q) { return f(ap(Ms, { x: q[0], y: q[1] })); }).join(' '));
    setAttr(el.pawSh, 'opacity', (0.42 * clamp(S.pawY / 14, 0, 1)).toFixed(2));
  }

  // ---------------------------------------------------------------- the drawing
  var strokes = [];
  (function () {
    var g = el.ink, ns = 'http://www.w3.org/2000/svg';
    RIG.strokes.forEach(function (s) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', 'M' + s.pts.map(function (q) { return q[0] + ',' + q[1]; }).join('L'));
      p.setAttribute('class', 'ink ink-' + s.kind);
      g.appendChild(p);
      var len = p.getTotalLength();
      p.style.strokeDasharray = len.toFixed(1) + ' ' + (len + 4).toFixed(1);
      p.style.strokeDashoffset = len.toFixed(1);
      strokes.push({ el: p, len: len, kind: s.kind, a: s.pts[0], p: 0 });
    });
  })();
  var SPEED = { light: 300, line: 150, dark: 95, hatch: 260 };

  async function penTo(x, y, lift) {
    var d = Math.hypot(x - S.penX, y - S.penY);
    if (d < 3) return;
    if (lift !== false) await tw(S, { penUp: 1 }, 0.14, E.out);
    await tw(S, { penX: x, penY: y }, clamp(0.16 + d / 520, 0.2, 0.75), E.io);
    if (lift !== false) await tw(S, { penUp: 0 }, 0.12, E.in);
  }
  async function drawStroke(s) {
    await penTo(s.a[0], s.a[1]);
    stroke = s; s.p = 0;
    await tw(s, { p: 1 }, clamp(s.len / SPEED[s.kind], 0.18, 2.6), s.kind === 'hatch' ? E.lin : E.sine);
    stroke = null;
  }
  function inkReset(done) { strokes.forEach(function (s) { s.p = done ? 1 : 0; s.el.style.strokeDashoffset = done ? '0' : s.len.toFixed(1); }); }

  // ---------------------------------------------------------------- behaviours
  var busy = false, forced = null;

  /* The cat leans in and watches the pen; the artist keeps drawing. */
  async function observe() {
    busy = true;
    S.track = 2.2;
    tw(S, { tailAmp: 0.35 }, 0.6);
    await tw(S, { cHeadX: -15, cHeadY: 9, cHeadRot: -6, catX: -8 }, 0.8, E.io);
    await wait(rand(0.8, 1.4));
    await tw(S, { cHeadTilt: 9 }, 0.45, E.back);            // curious tilt
    await wait(rand(0.9, 1.5));
    await tw(S, { cHeadTilt: -5 }, 0.5, E.io);
    await wait(rand(0.6, 1.1));
    tw(S, { tailAmp: 1 }, 0.8);
    await tw(S, { cHeadX: 0, cHeadY: 0, cHeadRot: 0, cHeadTilt: 0, catX: 0 }, 0.9, E.io);
    S.track = 1;
    busy = false;
  }

  async function artistPause() {
    tw(S, { nod: 0 }, 0.4);
    await tw(S, { penUp: 1 }, 0.2, E.out);
    tw(S, { penX: S.penX - 14, penY: S.penY - 4 }, 0.5);
    await tw(S, { headRot: 5.5, headX: 7, headY: 1 }, 0.55, E.io);
  }
  async function artistResume() {
    tw(S, { headRot: 0, headX: 0, headY: 0 }, 0.7, E.io);
    await wait(0.35);
    tw(S, { nod: 1 }, 1.2);
  }
  /* Left hand: lift from the sheet, turn over and travel to (x, y). tuck: the forearm comes round in front of him (see pose). */
  async function handOut(x, y, rot, tuck) {
    tw(S, { lhShadow: 0 }, 0.2);
    await tw(S, { lhy: J.lwrist.y - 16, lhRot: -4 }, 0.22, E.out);
    tw(S, { lhFlip: -1 }, 0.3, E.io);
    if (tuck) tw(S, { lhTuck: 1 }, 0.3, E.io);
    await tw(S, { lhx: x, lhy: y, lhRot: rot }, 0.55, E.io);
  }
  async function handHome() {
    tw(S, { lhFlip: 1, lhTuck: 0 }, 0.3, E.io);
    await tw(S, { lhx: J.lwrist.x, lhy: J.lwrist.y - 12, lhRot: -3 }, 0.55, E.io);
    await tw(S, { lhy: J.lwrist.y, lhRot: 0 }, 0.2, E.in);
    tw(S, { lhShadow: 1 }, 0.25);
  }

  /* The cat asks for attention (rubs against his arm, looks up); the artist stops and strokes it. */
  async function attention() {
    busy = true; S.track = 0;
    tw(S, { tail: -14, tailAmp: 0.5 }, 0.7);
    await tw(S, { catX: -22, cHeadX: -20, cHeadY: 11, cHeadRot: -9 }, 0.55, E.io);       // pushes its head against his forearm
    for (var b = 0; b < 2; b++) {
      tw(S, { lhx: J.lwrist.x - 4, lhRot: -1.5 }, 0.22, E.out);
      await tw(S, { cHeadX: -27, cHeadY: 3, cHeadRot: 5, cHeadTilt: 7 }, 0.42, E.io);    // ...and rubs upwards
      tw(S, { lhx: J.lwrist.x, lhRot: 0 }, 0.3, E.io);
      await tw(S, { cHeadX: -20, cHeadY: 11, cHeadRot: -8, cHeadTilt: 0 }, 0.36, E.io);
    }
    await tw(S, { cHeadX: -10, cHeadY: -7, cHeadRot: 10, cHeadTilt: 6 }, 0.45, E.back);  // looks up at him
    await artistPause();
    var P = RIG.pet;
    await handOut(P.x, P.y, P.rot);
    tw(S, { eye: 1 }, 0.35);
    tw(S, { cHeadRot: 4, cHeadY: 2, cHeadTilt: 3, cHeadX: -8 }, 0.4);
    await tw(S, { lhy: P.y + 9 }, 0.18, E.in);                                            // hand settles on the head
    for (var i = 0; i < 3; i++) {
      tw(S, { cHeadRot: 7, cHeadY: -2, cHeadTilt: 5 }, 0.5, E.io);
      await tw(S, { lhx: P.x + 54, lhy: P.y - 4, lhRot: P.rot + 5 }, 0.55, E.io);         // stroke towards the back
      tw(S, { cHeadRot: 2, cHeadY: 3, cHeadTilt: 1 }, 0.45, E.io);
      await tw(S, { lhx: P.x, lhy: P.y + 9, lhRot: P.rot }, 0.45, E.io);
    }
    await wait(0.2);
    tw(S, { tail: 0, tailAmp: 1 }, 1.2);
    await handHome();
    tw(S, { catX: 0, cHeadX: 0, cHeadY: 0, cHeadRot: 0, cHeadTilt: 0 }, 1.0, E.io);
    await artistResume();
    await wait(0.6);
    tw(S, { eye: 0 }, 0.7);                                                               // slow, content blink
    S.track = 1; busy = false;
  }

  /* The left hand and its sleeve normally pass over the cat's head (stroking); here they go under it. */
  function handUnder(on) { N.l_hand.classList.toggle('cm-under', on); N.l_sleeve.classList.toggle('cm-under', on); }

  /* The cat puts a paw on the sheet and drags it; the artist gently moves the paw away. */
  async function disturb() {
    busy = true; S.track = 0;
    var D = RIG.disturb;
    tw(S, { tailAmp: 1.6, tailSpeed: 1.8 }, 0.4);
    await tw(S, { cHeadX: -10, cHeadY: 12, cHeadRot: -9 }, 0.5, E.io);                 // eyes the paper
    await tw(S, { pawY: -12, pawX: D.pawX * 0.4, pawRot: -14 }, 0.22, E.out);
    await tw(S, { pawX: D.pawX, pawY: D.pawY, pawRot: 6 }, 0.2, E.in);                  // paw lands on the corner
    await wait(0.15);
    tw(S, { shX: D.drag, shY: 2, shRot: -1.1 }, 0.45, E.io);                            // ...and pulls
    await tw(S, { pawX: D.pawX + D.drag, pawY: D.pawY + 2 }, 0.45, E.io);
    tw(S, { nod: 0 }, 0.3);
    tw(S, { penUp: 1 }, 0.18, E.out);
    await tw(S, { headRot: 5.5, headX: 7, headY: 1 }, 0.45, E.io);
    tw(S, { shX: D.drag + 6, shRot: -1.6 }, 0.25, E.io);
    await tw(S, { pawX: D.pawX + D.drag + 6, pawRot: 12 }, 0.25, E.io);                 // another tug
    handUnder(true);                                                                    // his hand slides in under the cat's chin
    await handOut(D.hx, D.hy, D.hrot, true);
    tw(S, { cHeadRot: 2, cHeadY: 4, cHeadX: -4 }, 0.4);
    tw(S, { pawX: 6, pawY: 0, pawRot: 0, catX: 12 }, 0.6, E.io);                        // the hand eases the paw back
    await tw(S, { lhx: D.hx + 44, lhy: D.hy - 6 }, 0.6, E.io);
    await wait(0.25);
    tw(S, { shX: 0, shY: 0, shRot: 0 }, 0.75, E.io);                                    // sheet straightened on the way back
    await handHome();
    handUnder(false);
    tw(S, { tailSpeed: 2.6, tailAmp: 2 }, 0.2);
    tw(S, { pawX: 0, catX: 0 }, 0.8, E.io);
    await tw(S, { cHeadRot: 8, cHeadX: 6, cHeadY: -4, cHeadTilt: -6 }, 0.5, E.io);      // looks away, mildly offended
    await artistResume();
    await wait(0.5);
    tw(S, { tailSpeed: 1, tailAmp: 1 }, 1.5);
    await tw(S, { cHeadRot: 0, cHeadX: 0, cHeadY: 0, cHeadTilt: 0 }, 0.9, E.io);
    S.track = 1; busy = false;
  }

  var ACTS = { observe: observe, attention: attention, disturb: disturb };
  var bag = [];
  function nextAct() {
    if (forced) { var f = forced; forced = null; return f; }
    if (!bag.length) { bag = ['observe', 'attention', 'disturb']; for (var i = 2; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = bag[i]; bag[i] = bag[j]; bag[j] = x; } }
    return bag.pop();
  }

  async function blinkLoop() {
    while (alive) {
      await wait(rand(2.4, 6));
      await tw(S, { blink: 1 }, 0.07, E.in); await wait(0.05); await tw(S, { blink: 0 }, 0.12, E.out);
      if (Math.random() < 0.25) { await wait(0.12); await tw(S, { blink: 1 }, 0.06, E.in); await tw(S, { blink: 0 }, 0.12, E.out); }
    }
  }

  /* He looks up at his model for a moment. */
  async function glance() {
    await tw(S, { headRot: 3.5, headX: 4 }, 0.4, E.io);
    await wait(rand(0.5, 0.9));
    await tw(S, { headRot: 0, headX: 0 }, 0.5, E.io);
  }

  async function director() {
    await wait(0.8);
    var next = now + rand(4, 6), sinceGlance = 0;
    while (alive) {
      for (var i = 0; i < strokes.length && alive; i++) {
        await drawStroke(strokes[i]);
        if (!busy && (forced || now >= next)) {
          var a = nextAct();
          if (a === 'observe') ACTS[a](); else { await ACTS[a](); }
          next = now + rand(6.5, 10);
        } else if (++sinceGlance > 3 && Math.random() < 0.45 && !busy) {
          sinceGlance = 0;
          tw(S, { penUp: 1 }, 0.15, E.out);
          await glance();
        }
        await wait(rand(0.04, 0.3));
      }
      // finished: he and the cat look at it for a moment, then he slides the page off the pad, across the table and out
      // towards the viewer (the gallery is right under the header), and starts again on the clean sheet underneath
      while (busy) await wait(0.2);
      await tw(S, { penUp: 1 }, 0.2, E.out);
      tw(S, { penX: J.tip.x - 40, penY: J.tip.y - 8 }, 0.7);
      S.track = 0;
      tw(S, { cHeadRot: -7, cHeadX: -8, cHeadY: 6 }, 0.7, E.io);
      await tw(S, { headRot: -2, headY: 1.5, nod: 0.3 }, 0.6, E.io);
      await wait(2.4);
      tw(S, { lhShadow: 0 }, 0.2);
      await tw(S, { lhx: J.lwrist.x - 8, lhy: J.lwrist.y + 7, lhRot: 2 }, 0.28, E.io);    // the left hand flattens on the page...
      tw(S, { lhx: J.lwrist.x + 8, lhy: J.lwrist.y + 24, lhRot: 4 }, 0.26, E.in);         // ...and gives it a push
      await tw(S, { page: 1.16 }, 0.26, E.in);
      tw(S, { cHeadRot: 4, cHeadX: 2, cHeadY: -2 }, 0.5, E.io);                            // the cat watches it go
      tw(S, { lhx: J.lwrist.x, lhy: J.lwrist.y - 8, lhRot: -2 }, 0.45, E.out);
      await tw(S, { page: 1.96 }, 0.43, E.lin);                                            // it carries on at that speed and leaves the picture
      inkReset(false); S.page = 1;
      await tw(S, { lhy: J.lwrist.y, lhRot: 0 }, 0.2, E.in);
      tw(S, { lhShadow: 1 }, 0.25);
      S.track = 1;
      tw(S, { cHeadRot: 0, cHeadX: 0, cHeadY: 0 }, 0.8, E.io);
      tw(S, { headRot: 0, headY: 0, nod: 1 }, 0.6, E.io);
      await wait(0.6);
    }
  }

  // ---------------------------------------------------------------- loop, visibility, framing
  var raf = 0, last = 0, running = false, paused = false, onscreen = true;
  function frame(ts) {
    var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    now += dt; stepTweens(); pose();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || !alive || paused || !onscreen || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  /* Size and framing are pure CSS (hero.css); the script only needs the current size of a stage unit for the scroll drift. */
  var view = { k: 1 };
  function fit() { view.k = stage.getBoundingClientRect().width / W || 1; }
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(hero); else window.addEventListener('resize', fit);

  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = hero.getBoundingClientRect();
    if (par.locked) return;
    par.tx = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); par.ty = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
  });
  hero.addEventListener('pointerleave', function () { par.tx = 0; par.ty = 0; });
  window.addEventListener('scroll', function () { par.sy = clamp(window.scrollY, 0, 900) / view.k; }, { passive: true });
  var catHit = hero.querySelector('[data-cm-cat]');
  if (catHit) catHit.addEventListener('click', function () { if (!busy) forced = Math.random() < 0.6 ? 'attention' : 'disturb'; });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function boot() {
    if (reduce.matches) { inkReset(true); pose(); hero.classList.add('cm-static'); return; }
    hero.classList.add('cm-live');
    director(); blinkLoop();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { onscreen = en[0].isIntersecting; if (onscreen) start(); else stop(); }, { threshold: 0.02 }).observe(hero);
    } else start();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    // a visible way to stop the motion (and to start it again)
    var pauseBtn = hero.querySelector('[data-cm-pause]');
    if (pauseBtn) {
      pauseBtn.hidden = false;
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        hero.classList.toggle('cm-paused', paused);
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.setAttribute('aria-label', pauseBtn.getAttribute(paused ? 'data-label-play' : 'data-label-pause'));
        if (paused) stop(); else start();
      });
    }
  }
  pose();
  hero.classList.add('cm-ready');

  // test hooks (used by the screenshot checks)
  window.__cm = {
    S: S, REST: REST, J: J, RIG: RIG, tw: tw, wait: wait, strokes: strokes, acts: ACTS, fit: fit,
    par: par,
    freeze: function () { alive = false; stop(); tweens.length = 0; par.locked = true; par.tx = par.ty = par.x = par.y = par.sy = 0; },
    set: function (o, t) { for (var k in o) S[k] = o[k]; if (t != null) now = t; pose(); pose(); pose(); },
    ink: function (n) { strokes.forEach(function (s, i) { var d = i < n; s.el.style.strokeDashoffset = d ? '0' : s.len.toFixed(1); }); },
    run: async function (secs, fps) {
      fps = fps || 60;
      var ch = new MessageChannel();
      for (var i = 0; i < Math.round(secs * fps); i++) {
        now += 1 / fps; stepTweens(); pose();
        await new Promise(function (r) { ch.port1.onmessage = r; ch.port2.postMessage(0); });
      }
    },
    bootManual: function () { hero.classList.add('cm-live'); director(); blinkLoop(); },
    force: function (a) { forced = a; }, now: function () { return now; }, boot: boot, isBusy: function () { return busy; }
  };
  hero.addEventListener('cm:act', function (e) { if (ACTS[e.detail]) forced = e.detail; });   // e.g. hero.dispatchEvent(new CustomEvent('cm:act', {detail: 'attention'}))
  if (!hero.hasAttribute('data-cm-manual')) boot();
})();
