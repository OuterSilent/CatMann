/* Cosmin Mann — animated header runtime.
   Cut-out animation of vector layers: every moving piece is an HTML node holding an inline SVG,
   moved with a CSS matrix so the browser only composites (no repaint) for most of the motion. */
(function () {
  'use strict';
  var RIG = {"w":2171,"h":724,"bpm":92,"joints":{"tip":{"x":936,"y":656},"wrist":{"x":716,"y":600},"elbow":{"x":505,"y":606},"shoulder":{"x":772,"y":372},"hip":{"x":1060,"y":660},"neck":{"x":1062,"y":432},"lwrist":{"x":1350,"y":590},"lelbow":{"x":1392,"y":548},"lraise":{"x":1318,"y":448},"ltuck":{"x":1222,"y":583},"sheetPivot":{"x":1240,"y":632},"catGround":{"x":1700,"y":640},"tail":{"x":1882,"y":585},"catNeck":{"x":1548,"y":505},"catHead":{"x":1480,"y":520},"paw":{"x":1582,"y":620},"legA":{"x":1572,"y":584},"legB":{"x":1595,"y":579},"legC":{"x":1625,"y":592},"pawA":{"x":1571,"y":602},"pawB":{"x":1595,"y":601},"pawC":{"x":1615,"y":617}},"pawShadow":[[1550,631],[1617,632],[1629,640],[1612,647],[1560,647],[1544,640]],"sheetVanish":{"x":900.1,"y":513.5},"pet":{"x":1445,"y":452,"rot":-6},"disturb":{"pawX":-46,"pawY":38,"drag":14,"hx":1335,"hy":612,"hrot":2},"strokes":[{"kind":"light","pts":[[964.9,639.9],[965.2,641.9],[965.0,643.8],[964.5,645.8],[964.5,648.0],[964.5,650.3],[964.9,652.2],[964.6,654.9],[965.1,656.9],[965.1,659.7],[965.6,662.5],[965.4,665.1],[964.6,668.0],[964.8,670.5],[964.6,673.6],[965.2,676.9],[965.1,680.4],[964.4,683.7],[965.1,687.0]]},{"kind":"light","pts":[[868.2,657.4],[877.2,657.4],[886.7,657.1],[894.9,657.1],[904.2,656.9],[913.1,657.2],[922.2,657.2],[930.4,656.8],[938.8,656.9],[947.3,656.7],[956.7,656.7],[965.4,656.8],[973.7,656.6],[982.1,656.6],[990.8,656.3],[998.8,656.3],[1006.7,656.3],[1015.6,656.0],[1024.2,656.3],[1031.9,656.1],[1039.8,656.1],[1048.2,656.2],[1056.4,655.9]]},{"kind":"line","pts":[[871.2,655.8],[874.8,653.0],[877.6,650.8],[881.4,648.2],[884.8,646.0],[887.0,644.0],[890.1,641.7],[893.3,639.9],[895.2,637.9],[897.9,635.9],[900.7,634.0],[904.8,635.5],[909.9,636.9],[915.3,638.3],[919.7,639.9],[924.8,641.7],[930.3,643.0],[935.5,644.6],[940.4,646.5]]},{"kind":"line","pts":[[940.3,646.4],[948.2,646.3],[956.6,645.9],[965.0,645.5],[972.6,645.8],[980.8,646.0],[989.1,646.2]]},{"kind":"line","pts":[[989.3,646.3],[994.2,644.6],[999.4,643.0],[1004.7,641.1],[1009.1,639.7],[1013.5,638.4],[1018.2,636.8],[1023.1,635.4],[1026.8,633.8],[1029.4,635.8],[1031.8,637.7],[1034.1,639.2],[1037.0,641.3],[1039.1,643.4],[1041.7,645.3],[1044.8,647.5],[1047.6,649.9],[1050.9,651.9],[1053.9,654.4]]},{"kind":"line","pts":[[1053.9,654.4],[1057.7,657.2],[1062.3,660.3],[1066.6,663.0],[1061.6,665.1],[1057.5,667.6],[1052.2,669.7],[1047.2,672.6],[1040.8,675.3],[1035.3,677.9],[1026.5,679.5],[1017.6,681.8],[1007.9,683.6],[997.4,685.9],[988.1,688.1]]},{"kind":"line","pts":[[988.0,688.2],[976.0,688.2],[964.8,688.4],[954.1,688.8],[941.7,688.9]]},{"kind":"line","pts":[[941.9,689.0],[930.8,687.3],[921.8,685.0],[910.8,683.1],[902.0,681.4],[891.6,679.8],[884.8,677.5],[880.1,674.5],[873.7,671.8],[867.9,669.4],[862.6,667.4],[856.7,665.0],[861.6,661.7],[866.4,658.7],[871.3,655.7]]},{"kind":"dark","pts":[[890.7,654.0],[898.0,651.8],[904.7,649.7],[911.3,648.0],[921.8,649.1],[932.5,649.8],[935.2,651.7],[938.6,654.0],[942.6,656.1],[945.8,658.4]]},{"kind":"fine","pts":[[945.9,658.4],[938.0,660.4],[930.4,662.6],[923.0,664.6],[914.9,663.3],[907.4,662.3],[899.1,661.0],[896.2,658.5],[893.4,656.3],[890.8,654.0]]},{"kind":"fill","pts":[[914.4,656.0],[922.9,650.3],[924.3,653.5],[916.0,659.1],[917.3,662.4],[923.8,658.0]],"poly":[[921.9,648.9],[925.8,655.9],[918.0,664.1],[914.3,656.0]]},{"kind":"dark","pts":[[984.0,658.2],[986.9,655.9],[990.2,653.8],[993.3,651.4],[996.9,649.4],[1006.7,648.3],[1017.1,647.5],[1023.6,649.1],[1029.2,651.0],[1036.1,653.1]]},{"kind":"fine","pts":[[1036.3,653.0],[1033.4,655.3],[1031.2,657.7],[1028.4,660.0],[1021.6,661.5],[1013.8,662.5],[1006.0,663.9],[998.7,661.9],[990.6,659.7],[984.0,658.1]]},{"kind":"fill","pts":[[1005.0,652.0],[1008.3,649.8],[1011.2,652.1],[1004.3,656.8],[1006.9,659.3],[1013.5,654.9],[1012.3,660.0],[1009.5,661.9]],"poly":[[1007.1,648.4],[1003.3,655.3],[1010.8,663.2],[1014.2,655.3]]},{"kind":"fine","pts":[[946.0,658.5],[946.3,661.0],[947.7,664.0],[948.0,667.4],[949.6,670.2]]},{"kind":"fine","pts":[[983.8,658.1],[983.2,660.7],[981.7,663.6],[980.8,666.5],[980.4,669.9]]},{"kind":"fill","pts":[[951.4,671.0],[952.8,670.0],[958.6,670.2],[955.0,672.6],[958.9,674.1],[964.8,670.1],[970.9,670.1],[962.4,675.8],[971.2,674.0],[977.1,670.0]],"poly":[[949.5,670.2],[980.4,669.9],[965.0,676.7]]},{"kind":"fine","pts":[[964.9,676.7],[965.1,680.6],[953.8,682.8],[942.3,684.8]]},{"kind":"fine","pts":[[964.9,680.7],[976.4,682.2],[987.2,684.0]]},{"kind":"t2","pts":[[893.4,642.3],[898.7,638.8],[903.1,640.0],[886.0,651.5],[891.1,652.2],[907.4,641.2],[911.4,642.7],[898.8,651.1],[906.7,650.0],[915.8,643.9],[919.9,645.3],[914.2,649.1],[922.2,647.9],[923.9,646.7]],"poly":[[896.9,637.9],[884.6,653.0],[925.9,647.4]]},{"kind":"t3","pts":[[1005.9,647.5],[1009.8,644.8],[1023.2,640.3],[1011.2,648.3],[1016.7,649.0],[1031.7,638.9],[1033.7,642.0],[1022.4,649.7],[1027.8,650.4],[1036.3,644.7],[1038.5,647.7],[1033.7,650.9],[1038.9,651.8],[1040.5,650.7]],"poly":[[1030.5,637.7],[1041.8,652.1],[1003.2,647.1]]},{"kind":"t1","pts":[[914.1,648.3],[914.5,648.1],[921.0,648.1],[919.9,648.8],[925.8,649.3],[928.8,647.3],[936.1,646.8],[932.0,649.5],[935.3,651.8],[943.7,646.1],[950.3,646.1],[938.7,653.9],[941.9,656.2],[957.4,645.8],[964.4,645.4],[945.5,658.2],[954.9,656.3],[965.0,649.5],[964.9,654.0],[961.4,656.3]],"poly":[[940.4,646.4],[965.0,645.4],[965.0,656.1],[953.7,656.2],[945.9,658.4],[932.5,649.8],[911.3,648.0],[920.3,648.2]]},{"kind":"t2","pts":[[964.8,647.6],[967.9,645.6],[973.5,645.9],[964.8,651.8],[964.9,655.8],[979.4,646.0],[985.4,646.1],[970.6,656.1],[976.7,656.1],[991.2,646.3],[996.8,646.7],[981.1,657.3],[999.1,649.2],[1002.0,647.3],[1007.4,647.8],[1006.6,648.3],[1013.6,647.7],[1013.9,647.5]],"poly":[[989.2,646.2],[965.0,645.4],[965.0,656.1],[976.2,656.1],[983.9,658.1],[996.9,649.4],[1017.1,647.5],[1008.6,647.7]]},{"kind":"t1","pts":[[1010.8,648.3],[1012.0,647.5],[1017.9,647.6],[1016.3,648.7],[1021.3,649.5],[1022.3,648.8],[1026.4,650.2],[1026.0,650.5],[1030.7,651.5],[1031.4,651.0],[1036.4,651.7],[1035.1,652.6],[1040.1,653.4],[1041.4,652.5],[1046.4,653.3],[1045.7,653.8],[1050.9,654.4],[1051.0,654.3]],"poly":[[1053.8,654.5],[1008.6,647.7],[1017.1,647.5],[1036.2,653.1]]},{"kind":"t1","pts":[[859.5,665.4],[863.1,663.0],[876.0,658.7],[865.1,666.0],[871.0,666.5],[888.5,654.7],[893.2,656.0],[876.7,667.1],[882.3,667.8],[895.8,658.7],[899.1,660.9],[888.1,668.3],[893.6,669.0],[904.3,661.8],[909.4,662.8],[899.3,669.6],[905.0,670.2],[914.9,663.5],[920.3,664.3],[910.8,670.7],[918.1,670.2],[928.7,663.1],[940.1,659.9],[925.2,669.9],[932.1,669.7],[946.4,660.1],[947.8,663.5],[939.1,669.4],[946.2,669.0],[949.0,667.1]],"poly":[[890.8,654.0],[856.9,665.0],[908.5,670.7],[949.6,668.9],[945.9,658.4],[922.9,664.6],[899.0,661.0]]},{"kind":"t2","pts":[[858.9,665.8],[859.4,665.4],[865.1,666.0],[862.6,667.6],[866.9,669.1],[870.7,666.6],[876.2,667.3],[870.8,670.9],[874.6,672.8],[881.9,667.8],[887.7,668.3],[878.9,674.2],[882.8,675.9],[893.1,669.1],[898.8,669.6],[886.7,677.7],[890.7,679.4],[904.2,670.4],[909.6,671.1],[898.1,678.8],[906.3,677.7],[914.7,672.0],[919.2,673.4],[913.9,676.9],[922.5,675.6],[924.3,674.4]],"poly":[[856.9,665.0],[891.6,679.8],[926.4,675.1],[908.5,670.7]]},{"kind":"t2","pts":[[982.9,661.0],[986.1,658.8],[991.1,659.8],[980.8,666.7],[984.1,668.8],[995.6,661.1],[1000.2,662.3],[990.3,668.9],[997.0,668.8],[1004.7,663.6],[1012.4,662.7],[1003.2,669.0],[1009.4,669.1],[1021.2,661.2],[1038.7,653.7],[1015.3,669.4],[1022.3,669.1],[1042.6,655.4],[1047.2,656.7],[1030.1,668.1],[1038.4,666.9],[1051.4,658.1],[1055.8,659.5],[1046.3,665.9],[1054.5,664.7],[1060.4,660.7],[1064.7,662.2],[1062.4,663.7]],"poly":[[1036.2,653.1],[1066.7,663.0],[1019.7,669.4],[980.3,668.6],[983.9,658.1],[1006.1,663.8],[1028.5,659.9]]},{"kind":"t3","pts":[[1005.5,674.3],[1007.6,672.9],[1018.0,669.9],[1010.6,674.9],[1015.6,675.4],[1025.7,668.7],[1033.2,667.6],[1020.4,676.2],[1025.8,676.5],[1040.8,666.5],[1048.1,665.5],[1030.6,677.3],[1036.6,677.2],[1055.3,664.7],[1063.2,663.3],[1056.5,667.8]],"poly":[[1066.7,663.0],[1035.4,677.8],[1002.8,674.2],[1019.7,669.4]]},{"kind":"fine","pts":[[926.5,674.4],[916.2,674.3],[906.5,674.1],[896.5,673.4],[887.1,673.2],[876.8,672.9],[867.1,672.9],[856.5,673.0],[846.6,672.4],[836.4,672.1]]},{"kind":"fine","pts":[[925.8,677.3],[915.5,677.8],[904.0,678.1],[892.8,678.2],[882.5,678.9],[870.8,679.3],[859.3,679.6],[847.2,680.2],[836.1,680.0],[824.5,680.8]]},{"kind":"fine","pts":[[927.6,679.9],[916.1,681.4],[904.3,682.6],[892.8,683.7],[880.9,684.8],[869.6,685.5],[857.3,687.1],[844.4,688.3],[831.6,689.6]]},{"kind":"fine","pts":[[1002.4,673.5],[1012.8,673.2],[1021.5,672.4],[1031.3,672.2],[1039.8,671.7],[1049.1,671.2],[1058.6,670.4],[1067.8,670.5],[1075.4,669.6],[1084.9,669.3]]},{"kind":"fine","pts":[[1003.3,676.3],[1013.3,676.0],[1024.1,676.1],[1034.7,676.6],[1043.9,676.8],[1054.4,676.5],[1065.1,676.6],[1074.8,676.6],[1084.7,676.9],[1094.6,676.9]]},{"kind":"fine","pts":[[1001.6,678.9],[1012.7,679.9],[1022.7,680.7],[1034.0,681.2],[1044.4,682.5],[1055.7,682.9],[1066.6,683.9],[1078.0,684.9],[1088.6,685.4]]}],"ink":{"y":665.0,"k":0.42,"start":8}};
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
      var pt = inkAt(stroke);
      tip = ap(Msh, pt); S.penX = pt.x; S.penY = pt.y;
      inkShow(stroke);
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
  // Each stroke is a polyline in "ink space" (y stretched around INK.y; the group #cmInk squashes it back): the nib is round
  // on the paper, so from where we stand a stroke across the sheet is thin and one that runs away from us is broad.
  // A facet is a flat polygon uncovered through a mask: the zigzag the nib makes to shade it.
  var strokes = [], INK = RIG.ink;
  (function () {
    var g = el.ink, ns = 'http://www.w3.org/2000/svg', OVER = 5;
    function mk(tag, cls) { var e = document.createElementNS(ns, tag); if (cls) e.setAttribute('class', cls); return e; }
    function ink(q) { return [q[0], INK.y + (q[1] - INK.y) / INK.k]; }
    function d(pts) { return 'M' + pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L'); }
    function length(pts, cum) { var l = 0; for (var k = 1; k < pts.length; k++) { l += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); if (cum) cum.push(l); } return l; }
    RIG.strokes.forEach(function (s, i) {
      var q = s.pts.map(ink), p = mk('path', s.poly ? 'ink-mask' : 'ink ink-' + s.kind), face = null, cum = [0], len = length(q, cum), shown = len;
      if (s.poly) {
        // the mask is the same zigzag with every pass run a little past the edges of the facet, so that no corner stays covered
        var m = mk('mask'), over = [];
        for (var k = 0; k + 1 < q.length; k += 2) {
          var a = q[k], b = q[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
          over.push([a[0] - dx / l * OVER, a[1] - dy / l * OVER], [b[0] + dx / l * OVER, b[1] + dy / l * OVER]);
        }
        p.setAttribute('d', d(over)); shown = length(over);
        m.id = 'cmInkM' + i; m.appendChild(p); g.appendChild(m);
        face = mk('path', 'ink-' + s.kind); face.setAttribute('d', d(s.poly.map(ink)) + 'z'); face.__m = 'url(#' + m.id + ')'; g.appendChild(face);
      } else { p.setAttribute('d', d(q)); g.appendChild(p); }
      p.style.strokeDasharray = shown.toFixed(1) + ' ' + (shown + 12).toFixed(1);
      strokes.push({ el: p, face: face, len: len, shownLen: shown, cum: cum, pts: s.pts, kind: s.kind, a: s.pts[0], p: 0, shown: -1 });
    });
  })();
  var SPEED = { light: 380, line: 180, dark: 125, fine: 240, face: 300 };     // ink-space units per second

  /* Puts as much of the stroke on the paper as its p says (0..1). A finished facet drops its mask. */
  function inkShow(s) {
    if (s.shown === s.p) return;
    s.shown = s.p;
    s.el.style.strokeDashoffset = (s.shownLen * (1 - s.p)).toFixed(1);
    var masked = s.p < 1;
    if (s.face && masked !== s.masked) { s.masked = masked; if (masked) s.face.setAttribute('mask', s.face.__m); else s.face.removeAttribute('mask'); }
  }
  /* Where the nib is along the stroke, in stage units. */
  function inkAt(s) {
    var d = s.p * s.len, c = s.cum, i = 1;
    while (i < c.length - 1 && c[i] < d) i++;
    var f = c[i] > c[i - 1] ? (d - c[i - 1]) / (c[i] - c[i - 1]) : 0, a = s.pts[i - 1], b = s.pts[i];
    return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f };
  }
  /* The first n strokes are on the paper (all of them without n), the rest are not. */
  function inkReset(n) { strokes.forEach(function (s, i) { s.p = i >= n ? 0 : 1; inkShow(s); }); }
  inkReset(INK.start);       // the page opens on a sheet that already has the outline: something to look at from the first second

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
    await tw(s, { p: 1 }, clamp(s.len / (s.face ? SPEED.face : SPEED[s.kind]), 0.18, 2.6), s.face ? E.lin : E.sine);
    inkShow(s);
    stroke = null;
  }

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
    var next = now + rand(4, 6), sinceGlance = 0, from = INK.start;
    while (alive) {
      for (var i = from; i < strokes.length && alive; i++) {
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
      inkReset(0); from = 0; S.page = 1;
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
    if (reduce.matches) { inkReset(); pose(); hero.classList.add('cm-static'); return; }
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
    // the first n strokes are on the paper (all of them without n); with `part`, stroke n is that far along and the nib is on it
    ink: function (n, part) {
      inkReset(n);
      if (part != null && strokes[n]) { var s = strokes[n]; s.p = part; inkShow(s); var q = inkAt(s); S.penX = q.x; S.penY = q.y; }
    },
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
