let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(r() * a.length)];
const f = n => +n.toFixed(1);
const COLS = 168, ROWS = 56, CW = 9.6, RH = 18, FS = 16;
const W = Math.round(COLS * CW), H = ROWS * RH;
const BG = '#08090c';
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v / 6) * 6)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const dim = (c, t) => mix(c, BG, t);

// ---------- grid ----------
const G = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const put = (rw, c, ch, col, glow) => { if (rw >= 0 && rw < ROWS && c >= 0 && c < COLS) G[rw][c] = { ch, col, glow: !!glow }; };
const lights = []; // [row, col, strength]

// twilight sky streaks (rows 0-4)
for (let rw = 0; rw < 5; rw++) {
  let c = 0;
  while (c < COLS) {
    if (r() < .06) { const len = 6 + Math.floor(r() * 26), col = dim(pick(['#b07a8c', '#9a7fa0', '#c08a86', '#7f86a8']), .35 + rw * .1);
      for (let i = 0; i < len; i++) if (r() < .7) put(rw, c + i, pick(['~', '-', '~', '_', '.']), col); c += len; }
    c++;
  }
}
// layered ridges, far to near, each misted toward the sky
const RIDGES = [[3.0, '#7a7aa0', .25, 0], [5.4, '#5a6082', .3, 1.9], [7.8, '#414a66', .3, 3.7]];
const ridgePaths = [];
for (const [base, col, amp, ph] of RIDGES) {
  const yAt = c => base + 2.2 * Math.sin(c / 31 + ph) + 1.3 * Math.sin(c / 13 + ph * 1.7) + amp * Math.sin(c / 5);
  let pd = `M-10 ${f(yAt(0) * RH + 9)}`; for (let c = 1; c <= COLS; c++) pd += ` L${f(c * CW)} ${f(yAt(c) * RH + 9)}`;
  ridgePaths.push(`<path d="${pd} L${W + 10} ${15 * RH} L-10 ${15 * RH} Z" fill="${dim(col, .55)}" opacity=".55"/>`);
  for (let c = 0; c < COLS; c++) {
    const y = Math.round(yAt(c)), dy = Math.round(yAt(c + 1)) - y;
    put(y, c, dy < 0 ? '/' : dy > 0 ? '\\' : (r() < .2 ? '^' : '_'), col);
    for (let rw = y + 1; rw < 12; rw++) put(rw, c, r() < .16 ? pick(['.', ':', "'", ',', '^']) : ' ', dim(col, .25 + (rw - y) * .04));
  }
}
for (let i = 0; i < 7; i++) { const rw = 5 + Math.floor(r() * 4), c = Math.floor(r() * COLS); put(rw, c, '.', '#e9a85a', true); }
// village palettes
const ROOFS = ['#b0583c', '#9c4a3a', '#b8743e', '#8a4b52', '#a8603f'];
const WALLS = ['#a58f73', '#9b8068', '#8f7e66', '#a8876a', '#94806e'];
const SHUT = ['#6f8a6a', '#7a6a8a', '#8a6248', '#5f7f78'];
const WIN = '#ffc46b', WIN2 = '#ffad55', DARKWIN = '#2a2420';
const FLOW = ['#c46a7a', '#d08a4a', '#b85a5a', '#c9a24a'];
const TREE = ['#3e5a3e', '#4a6844', '#35503a'];

function tree(base, c, depth) {
  const t = depth, g = dim(pick(TREE), t), g2 = dim(pick(TREE), t + .1);
  if (r() < .4) { // cypress
    const h = 3 + Math.floor(r() * 3);
    put(base - h, c, '^', g);
    for (let i = 1; i < h; i++) put(base - h + i, c, i % 2 ? '(' : '{', g), put(base - h + i, c + 1, i % 2 ? ')' : '}', g2);
    put(base - h, c + 1, ' ', g); put(base, c, '|', dim('#5a4636', t));
  } else { // round olive / lemon tree
    const shape = ['  .@@.  ', ' @@@@@@ ', '(@@@@@@)', " '@@@@' ", '   ||   '];
    shape.forEach((row, i) => [...row].forEach((ch, j) => {
      if (ch === ' ') return;
      const col = ch === '|' ? dim('#5a4636', t) : (ch === '@' && r() < .25 ? g2 : g);
      put(base - 4 + i, c - 4 + j, ch === '@' && r() < .12 ? pick(['o', '*']) : ch, ch === '@' && r() < .05 ? dim('#d4a24a', t) : col);
    }));
  }
}
function house(base, c0, w, depth) {
  const t = depth, style = r();
  const roof = dim(pick(ROOFS), t), wall = dim(pick(WALLS), t), shut = dim(pick(SHUT), t);
  const facH = 2 + Math.floor(r() * 2) + (depth < .2 ? 1 : 0);
  const top = base - facH;
  // clear the body so what's behind doesn't show through
  for (let rw = top; rw <= base; rw++) for (let c = c0; c < c0 + w; c++) put(rw, c, ' ', wall);
  if (style < .28) { // flat-roofed villa with pergola and plants
    for (let c = c0; c < c0 + w; c++) put(top - 1, c, c === c0 || c === c0 + w - 1 ? '|' : '_', wall);
    for (let c = c0 + 1; c < c0 + w - 1; c++) if (r() < .55) put(top - 2, c, (c - c0) % 3 ? '-' : '#', dim('#7a5e44', t));
    for (let c = c0 + 1; c < c0 + w - 1; c++) if (r() < .3) put(top - 2, c, pick(['&', '%', '*']), r() < .3 ? dim(pick(FLOW), t) : dim(pick(TREE), t));
  } else if (style < .36 && w <= 11) { // bell tower
    const th = 3;
    const cx = c0 + Math.floor(w / 2);
    put(top - th - 2, cx, '+', dim('#c9a46a', t));
    put(top - th - 1, cx - 1, '/', roof); put(top - th - 1, cx, '^', roof); put(top - th - 1, cx + 1, '\\', roof);
    for (let i = 0; i < th; i++) { put(top - th + i, cx - 2, '|', wall); put(top - th + i, cx + 2, '|', wall); for (let d = -1; d <= 1; d++) put(top - th + i, cx + d, ' ', wall); }
    put(top - th + 1, cx - 1, '('); put(top - th + 1, cx - 1, '(', wall); put(top - th + 1, cx, 'o', WIN, true); put(top - th + 1, cx + 1, ')', wall);
    lights.push([top - th + 1, cx, .8]);
    for (let c = c0; c < c0 + w; c++) put(top - 1, c, c === c0 ? '/' : c === c0 + w - 1 ? '\\' : (c % 2 ? '_' : '/'), roof);
  } else { // pitched tile roof
    const rh = 2 + (w > 13 ? 1 : 0);
    for (let i = 0; i < rh; i++) {
      const rw = top - rh + i, ind = rh - 1 - i, L = c0 + ind, R = c0 + w - 1 - ind;
      for (let c = L; c <= R; c++) put(rw, c, c === L ? '/' : c === R ? '\\' : ((c + i) % 2 ? '_' : '/'), roof);
    }
    for (let c = c0 + rh; c <= c0 + w - 1 - rh; c++) put(top - rh - 1, c, '_', dim(roof, .2));
    if (r() < .5) { const cc = c0 + rh + 1 + Math.floor(r() * Math.max(1, w - 2 * rh - 3)); put(top - rh - 1, cc, 'n', dim('#7a5a48', t)); }
  }
  // facade
  for (let rw = top; rw <= base; rw++) { put(rw, c0, '|', wall); put(rw, c0 + w - 1, '|', wall); }
  for (let c = c0 + 1; c < c0 + w - 1; c++) { put(base, c, '_', dim(wall, .25));  }
  const lit = depth < .5 ? .42 : .3;
  for (let rw = top; rw < base; rw++) {
    const arch = rw === top && r() < .4;
    for (let c = c0 + 2; c + 2 < c0 + w - 1; c += 4 + (r() < .3 ? 1 : 0)) {
      const on = r() < lit;
      put(rw, c, arch ? '(' : '[', shut); put(rw, c + 1, on ? pick(['#', '=', '"', '#']) : pick([':', '.']), on ? (r() < .5 ? WIN : WIN2) : DARKWIN, on); put(rw, c + 2, arch ? ')' : ']', shut);
      if (on) lights.push([rw, c + 1, .35 * (1 - depth)]);
      if (rw === base - 1 && r() < .35) { put(rw + 1, c, pick(['*', '"']), dim(pick(FLOW), t)); put(rw + 1, c + 2, '*', dim(pick(FLOW), t)); }
    }
  }
  // door with warm spill
  const dc = c0 + Math.floor(w / 2);
  const dopen = r() < .45;
  put(base, dc - 1, '|', dim('#7a5640', t)); put(base, dc, dopen ? '#' : '=', dopen ? WIN2 : dim('#6a4a36', t), dopen); put(base, dc + 1, '|', dim('#7a5640', t));
  if (dopen) lights.push([base, dc, .5 * (1 - depth)]);
}

function terrace(base0, depth, wall, ph) {
  const bAt = c => base0 + Math.round(1.6 * Math.sin(c / 19 + ph) + .8 * Math.sin(c / 7 + ph * 2));
  if (wall) for (let c = 0; c < COLS; c++) { const b = bAt(c) + 1; put(b, c, c % 5 === 0 ? '|' : '_', dim('#6e6152', depth + .12)); }
  let c = -3 + Math.floor(r() * 4);
  while (c < COLS) {
    const edge = Math.min(c, COLS - c) / (COLS / 2);
    if (r() < .3 + (1 - edge) * .25) {
      const n = 1 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) tree(bAt(c + 2 + i * 4), c + 2 + i * 4, depth);
      c += 3 + n * 4; continue;
    }
    const w = 9 + Math.floor(r() * 10);
    house(bAt(c + (w >> 1)), c, w, depth);
    c += w + 1 + Math.floor(r() * 4);
  }
}
terrace(15, .48, true, 1.7);
// stairs winding down
for (const sc of [34, 101, 142]) for (let rw = 13; rw <= 25; rw++) { const cc = sc + Math.round(Math.sin(rw / 2.2) * 2); put(rw, cc, '=', dim('#8a7a66', .35)); put(rw, cc + 1, '=', dim('#8a7a66', .35)); }
terrace(20, .3, true, 3.1);
terrace(25, .08, false, 4.6);

// promenade + lanterns + seawall
const LANT = [];
for (let c = 0; c < COLS; c++) {
  put(26, c, r() < .3 ? pick(['.', ',', "'"]) : ' ', dim('#7e6d58', .3));
  put(27, c, c % 6 === 0 ? '|' : '_', dim('#7a6a56', .2));
  put(28, c, pick(['"', '`', "'", ' ', ' ']), dim('#5a4e40', .3));
}
for (let c = 6; c < COLS; c += 17 + Math.floor(r() * 5)) {
  put(26, c, 'o', '#ffd27a', true); put(27, c, '|', dim('#5a4a3a', .1));
  LANT.push(c); lights.push([26, c, 1.2]);
}

// sand, lit by the lanterns and the windows
const SAND_D = '#2e2620', SAND_L = '#e0a462';
for (let rw = 29; rw < 44; rw++) for (let c = 0; c < COLS; c++) {
  let b = 0;
  for (const [lr, lc, s] of lights) { const dr = (rw - lr) * 1.9, dc = (c - lc) * .55; b += s * Math.exp(-(dr * dr + dc * dc) / 170); }
  b = Math.min(1, b * 1.1);
  const q = Math.round(b * 6) / 6;
  if (r() < .28 + b * .35) put(rw, c, pick(['.', ',', "'", '`', ':', '.', '.']), mix(SAND_D, SAND_L, q * .85 + .06));
}

// ---------- emit grid as text runs ----------
const classes = new Map();
const cls = c => { if (!classes.has(c)) classes.set(c, 'c' + classes.size.toString(36)); return classes.get(c); };
function emit(filterGlow) {
  let out = '';
  for (let rw = 0; rw < ROWS; rw++) {
    let row = '', c = 0;
    while (c < COLS) {
      const cell = G[rw][c];
      if (!cell || cell.ch === ' ' || (filterGlow && !cell.glow)) { c++; continue; }
      const col = cell.col; let s = '', e = c, gap = 0;
      while (e < COLS) {
        const x = G[rw][e];
        const ok = x && x.ch !== ' ' && (!filterGlow || x.glow);
        if (ok && x.col === col) { s += ' '.repeat(gap) + x.ch; gap = 0; e++; }
        else if (!ok && gap < 24) { gap++; e++; }
        else break;
      }
      e -= gap;
      row += `<tspan x="${f(c * CW)}" class="${cls(col)}">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</tspan>`;
      c = e;
    }
    if (row) out += `<text y="${rw * RH + 13}">${row}</text>`;
  }
  return out;
}
const gridText = emit(false), glowText = emit(true);

// ---------- waves ----------
const edgeAt = (x, base, ph) => base + 9 * Math.sin(x / 140 + ph) + 5 * Math.sin(x / 57 + ph * 2.3) + 2.5 * Math.sin(x / 21 + ph * 4);
function wave(base, ph, d, dur, delay, fill, op) {
  let path = `M-90 ${f(edgeAt(-90, base, ph))}`;
  for (let x = -82; x <= W + 90; x += 8) path += ` L${x} ${f(edgeAt(x, base, ph))}`;
  path += ` L${W + 90} ${H + 140} L-90 ${H + 140} Z`;
  const fx = [], fy = [], fc = [];
  const sx = [], sy = [], sc = [];
  const tx = [], ty = [], tc = [];
  const px = [], py = [], pc = [];
  for (let x = -86; x <= W + 86; x += CW) {
    const e = edgeAt(x, base, ph);
    if (r() < .92) { fx.push(f(x)); fy.push(f(e + 2)); fc.push(pick(['o', '.', ':', '°', 'o', '·', '~', '.', 'O'])); }
    if (r() < .6) { sx.push(f(x + (r() - .5) * 4)); sy.push(f(e + 14 + r() * 8)); sc.push(pick(['.', '·', ':', "'", '°', ','])); }
    if (r() < .25) { tx.push(f(x)); ty.push(f(e + 32 + r() * 40)); tc.push(pick(['~', '-', '~', '.', '_'])); }
    if (r() < .22) { px.push(f(x + (r() - .5) * 6)); py.push(f(e - 2 - r() * 4)); pc.push(pick(['.', "'", '·', '`'])); }
  }
  const T = (xs, ys, cs, k) => (xs = xs.map(Math.round), ys = ys.map(Math.round), `<text class="${k}" x="${xs.join(' ')}" y="${ys.join(' ')}">${cs.join('')}</text>`);
  return `<g class="sw" style="--d:${d}px;animation-duration:${dur}s;animation-delay:-${delay}s"><g class="dr" style="animation-duration:${f(14 + r() * 8)}s">`
    + `<path d="${path}" fill="${fill}" opacity="${op}"/>`
    + `<path d="${path.split(' L' + (W + 90))[0]}" fill="none" stroke="#9fd2d4" stroke-width="1" opacity=".18"/>`
    + T(tx, ty, tc, 'wt') + T(sx, sy, sc, 'fz') + T(fx, fy, fc, 'fm')
    + `<g class="sp" style="animation-duration:${dur}s;animation-delay:-${delay}s">${T(px, py, pc, 'fm')}</g>`
    + `</g></g>`;
}
const waves = wave(39 * RH, 0, -96, 10, 0, 'url(#w1)', 1)
  + wave(41 * RH, 2.1, -80, 12.5, 4.2, 'url(#w2)', 1)
  + wave(43.5 * RH, 4.4, -64, 15, 9.1, 'url(#w3)', 1);

// lace of foam the retreating water leaves on the sand
let lx = [], ly = [], lc = [];
for (let i = 0; i < 160; i++) { const x = r() * W; lx.push(f(x)); ly.push(f(edgeAt(x, 39 * RH, 0) - 34 - r() * 50)); lc.push(pick(['.', '·', ':', '°', "'"])); }
const lace = `<text class="lace fz" style="animation-duration:10s" x="${lx.join(' ')}" y="${ly.join(' ')}">${lc.join('')}</text>`;

// deep sea texture + lantern reflections
let sea = '';
for (let rw = 47; rw < ROWS; rw++) {
  let xs = [], cs = [];
  for (let c = 0; c < COLS; c++) if (r() < .13) { xs.push(f(c * CW + (r() - .5) * 3)); cs.push(pick(['~', '-', '~', '_', '.'])); }
  const t = (rw - 47) / (ROWS - 47);
  sea += `<text class="${cls(mix('#2e6276', '#163846', t))}" x="${xs.join(' ')}" y="${rw * RH + 13}">${cs.join('')}</text>`;
}
const seaRows = `<g class="dr2">${sea}</g>`;
let refl = '';
for (const c of LANT) for (let rw = 47; rw < ROWS - 1; rw++) {
  if (r() < .25) continue;
  const fade = (rw - 47) / (ROWS - 48);
  const cc = c + Math.round((r() - .5) * 3);
  refl += `<text class="sh ${cls(mix('#ffb35c', '#0a1c26', .25 + fade * .6))}" style="animation-duration:${f(1.5 + r() * 2.5)}s;animation-delay:-${f(r() * 3)}s" x="${f(cc * CW)}" y="${rw * RH + 13}">${pick(['|', ':', '!', "'", '-', '~'])}</text>`;
}
// rain rings on the sea
let rings = '';
for (let i = 0; i < 34; i++) {
  const x = r() * W, y = (48 + r() * 7) * RH;
  rings += `<text class="rg" style="animation-duration:${f(2.4 + r() * 2.5)}s;animation-delay:-${f(r() * 4)}s" x="${f(x)}" y="${f(y)}">${pick(['o', '°', 'o', '()'])}</text>`;
}

// ---------- fog banks ----------
function fogRow(y, op, dur, w, cl) {
  let str = '';
  for (let c = 0; c < COLS + 60; c++) { const n = Math.sin(c / 9 + y) + Math.sin(c / 23 + y * 1.3); str += n > .3 && r() < .75 ? pick(['~', '-', '~', '.', '=']) : ' '; }
  return `<g class="fg" style="--t:${dur}s;--w:${w}px"><text class="${cl}" x="-300" y="${f(y)}" opacity="${op}">${str}</text></g>`;
}
const fog = `<g filter="url(#fogb)">`
  + `<ellipse class="fh" cx="${W * .3}" cy="${9 * RH}" rx="${W * .5}" ry="46" fill="#9a9cc0" opacity=".2"/>`
  + `<ellipse class="fh" style="animation-delay:-20s" cx="${W * .75}" cy="${11.5 * RH}" rx="${W * .42}" ry="38" fill="#a898b4" opacity=".16"/>`
  + `<ellipse class="fh" style="animation-delay:-35s" cx="${W * .82}" cy="${50 * RH}" rx="${W * .34}" ry="50" fill="#8aa0b4" opacity=".12"/>`
  + `</g>`
  + fogRow(6.4 * RH, .3, 70, 260, 'fo') + fogRow(8.8 * RH, .34, 95, -220, 'fo') + fogRow(11.4 * RH, .24, 120, 300, 'fo')
  + fogRow(48.5 * RH, .2, 110, -260, 'fs') + fogRow(50.5 * RH, .14, 140, 240, 'fs');

// ---------- sea stacks ----------
function stack(cx, by, art, flip) {
  const rows = art.map(l => flip ? [...l].reverse().map(ch => ch === '/' ? '\\' : ch === '\\' ? '/' : ch).join('') : l);
  const h = rows.length, wdt = Math.max(...rows.map(l => l.length));
  let o = `<path d="M${f(cx + 2 * CW)} ${by} L${f(cx + (wdt / 2) * CW)} ${by - h * RH + 4} L${f(cx + (wdt - 2) * CW)} ${by} Z" fill="#06080b" opacity=".9" filter="url(#fogb)"/>`;
  rows.forEach((l, i) => { o += `<text class="rk${i === 0 ? ' rt' : ''}" x="${f(cx)}" y="${f(by - (h - i) * RH + 14)}">${l}</text>`; });
  const fx = [], fy = [], fc = [];
  for (let i = -2; i < wdt + 2; i++) if (r() < .8) { fx.push(Math.round(cx + i * CW)); fy.push(Math.round(by + 4 + r() * 8)); fc.push(pick(['o', '.', '°', ':', '~', '.'])); }
  return o + `<text class="fm fz" x="${fx.join(' ')}" y="${fy.join(' ')}">${fc.join('')}</text>`;
}
const SA0 = ['    _/\\_     ', '   /%%#%\\_   ', '  /#%%##%%\\  ', ' /%##%#%##%\\ ', '/#%%##%%#%#%\\'];
const SB = ['   _      ', '  /#\\_   ', ' /%#%#\\  ', '/##%%#%\\ '];
const SC = ['  /\\  ', ' /%#\\ ', '/#%%#\\'];
const SA = ['      _/\\_       ', '     /%#%%\\_     ', '   _/%##%#%%\\    ', '  /%%#%##%%#%\\_  ', ' /#%%##%%#%#%%%\\ ', '/%##%#%%##%#%##%\\', '##%%#%##%%#%%#%%#'];
const stacks = stack(W * .72, 52 * RH, SA, false) + stack(W * .83, 50 * RH, SB, true) + stack(W * .9, 52 * RH, SC, false)
  + stack(W * .06, 53 * RH, SB, false) + stack(W * .62, 49 * RH, SC, true);

// ---------- coastal grass framing the foot ----------
function grass(x0, x1, top) {
  let o = '';
  for (let i = 0; i < 4; i++) {
    let str = '';
    const n = Math.round((x1 - x0) / CW);
    for (let c = 0; c < n; c++) str += r() < .55 + i * .12 ? pick(['|', '/', '\\', "'", ',', '|', '/', '"']) : ' ';
    o += `<text class="gr${i % 2}" x="${f(x0)}" y="${f(top + i * RH)}">${str}</text>`;
  }
  return `<g class="gs" style="--t:${f(5 + r() * 3)}s">${o}</g>`;
}
const grassL = grass(-20, W * .2, 52.5 * RH), grassR = grass(W * .82, W + 20, 52 * RH);

// ---------- rain ----------
function rainLayer(n, cl, dur, size) {
  const xs = [], ys = [], cs = [];
  for (let i = 0; i < n; i++) { xs.push(f(-120 + r() * (W + 240))); ys.push(f(r() * H)); cs.push(pick(['/', '/', "'", '/', ',', '/'])); }
  const t = `<text x="${xs.join(' ')}" y="${ys.join(' ')}">${cs.join('')}</text>`;
  const id = 'R' + cl.slice(-1);
  return `<g class="${cl}" style="font-size:${size}px;animation-duration:${dur}s"><g id="${id}">${t}</g><use href="#${id}" transform="translate(70 -${H})"/></g>`;
}
const rain = rainLayer(150, 'rn r1', 2.6, 12) + rainLayer(70, 'rn r2', 1.5, 15);

// ---------- fireflies ----------
let ff = '';
for (let i = 0; i < 38; i++) {
  const zone = r();
  const x = r() * W;
  const y = zone < .45 ? (2 + r() * 24) * RH : zone < .85 ? (25 + r() * 14) * RH : (39 + r() * 6) * RH;
  const a = f((r() - .5) * 70), b = f((r() - .5) * 50), c = f((r() - .5) * 80), d = f((r() - .5) * 40);
  ff += `<g transform="translate(${Math.round(x)} ${Math.round(y)})"><g class="ff" style="--a:${Math.round(a)}px;--b:${Math.round(b)}px;--c:${Math.round(c)}px;--d:${Math.round(d)}px;--t:${Math.round(11 + r() * 12)}s;--l:-${Math.round(r() * 14)}s"><g class="fb" style="--t:${f(2.8 + r() * 3.5)}s;--l:-${f(r() * 5)}s"><circle r="${Math.round(9 + r() * 6)}" fill="url(#gF)"/><text class="fc" x="-2.6" y="3.8">${pick(['·', '.', '·'])}</text></g></g></g>`;
}

// lantern flicker halos
let halos = '';
for (const c of LANT) halos += `<circle class="lf" style="animation-duration:${f(2 + r() * 2)}s;animation-delay:-${f(r() * 2)}s" cx="${f(c * CW + 4)}" cy="${26 * RH + 8}" r="70" fill="url(#gL)"/><ellipse cx="${f(c * CW + 4)}" cy="${31 * RH}" rx="150" ry="70" fill="url(#gL)" opacity=".55"/>`;

const css = `
text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"DejaVu Sans Mono",monospace;font-size:${FS}px;white-space:pre}
*{transform-box:fill-box}
${[...classes].map(([c, k]) => `.${k}{fill:${c}}`).join('')}
.gl text{filter:none}
.fm{fill:#cfe6e4;opacity:.9}.fz{fill:#8fbcc0;opacity:.6}.wt{fill:#2d6075;opacity:.85}
.fc{fill:#fff1c4;font-size:13px}.fo{fill:#a9a6c4}.fs{fill:#9fb4c4}.rk{fill:#323a45}.rt{fill:#6a7686}.gr0{fill:#6e5c40}.gr1{fill:#8a7048}
.rn{fill:#8fa3b8}.r1{opacity:.22}.r2{opacity:.38}
@keyframes sw{0%{transform:translateY(0);animation-timing-function:cubic-bezier(.25,.6,.35,1)}42%{transform:translateY(var(--d));animation-timing-function:ease-in-out}54%{transform:translateY(var(--d));animation-timing-function:cubic-bezier(.45,0,.6,1)}100%{transform:translateY(0)}}
.sw{animation:sw infinite}
@keyframes dr{0%,100%{transform:translateX(-22px)}50%{transform:translateX(22px)}}
.dr{animation:dr ease-in-out infinite}
@keyframes dr2{0%,100%{transform:translateX(-12px)}50%{transform:translateX(12px)}}
.dr2{animation:dr2 19s ease-in-out infinite}
@keyframes sp{0%,30%{opacity:0;transform:translateY(0)}41%{opacity:.95;transform:translateY(-10px)}52%{opacity:0;transform:translateY(-20px)}100%{opacity:0}}
.sp{animation:sp infinite}
@keyframes lace{0%,40%{opacity:0}62%{opacity:.75}100%{opacity:0}}
.lace{animation:lace infinite}
@keyframes fizz{0%,100%{opacity:.35}50%{opacity:.75}}
.fz{animation:fizz 1.7s ease-in-out infinite}
@keyframes fall{from{transform:translate(0,0)}to{transform:translate(-70px,${H}px)}}
.rn{animation:fall linear infinite}
@keyframes wander{0%,100%{transform:translate(0,0)}25%{transform:translate(var(--a),var(--b))}50%{transform:translate(var(--c),var(--d))}75%{transform:translate(var(--b),var(--a))}}
.ff{animation:wander var(--t) ease-in-out var(--l) infinite}@keyframes fg{0%,100%{transform:translateX(0)}50%{transform:translateX(var(--w))}}.fg{animation:fg var(--t) ease-in-out infinite}@keyframes fh{0%,100%{transform:translateX(-60px)}50%{transform:translateX(60px)}}.fh{animation:fh 60s ease-in-out infinite}@keyframes gs{0%,100%{transform:skewX(-4deg)}50%{transform:skewX(5deg)}}.gs{transform-origin:50% 100%;animation:gs var(--t) ease-in-out infinite}
@keyframes blink{0%,100%{opacity:.08}25%,50%{opacity:1}75%{opacity:.25}}
.fb{animation:blink var(--t) ease-in-out var(--l) infinite}
@keyframes sh{0%,100%{opacity:.25}50%{opacity:1}}
.sh{animation:sh ease-in-out infinite}
@keyframes lf{0%,100%{opacity:.75}30%{opacity:1}60%{opacity:.6}80%{opacity:.9}}
.lf{animation:lf ease-in-out infinite}
@keyframes rg{0%{opacity:0;transform:scale(.4)}20%{opacity:.6}100%{opacity:0;transform:scale(1.6)}}
.rg{fill:#6e9db0;font-size:12px;transform-origin:50% 50%;animation:rg ease-out infinite}
`.replace(/\n/g, '');

const defs = `<radialGradient id="gF"><stop offset="0" stop-color="#ffe7a0" stop-opacity=".75"/><stop offset=".25" stop-color="#ffc060" stop-opacity=".3"/><stop offset="1" stop-color="#ff9c3a" stop-opacity="0"/></radialGradient>`
  + `<radialGradient id="gL"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset=".4" stop-color="#ff9e45" stop-opacity=".16"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>`
  + `<radialGradient id="gV" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".16"/><stop offset=".6" stop-color="#ff8a3a" stop-opacity=".05"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></radialGradient>`
  + `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2440"/><stop offset=".035" stop-color="#4c2e44"/><stop offset=".07" stop-color="#5a3446"/><stop offset=".12" stop-color="#262738"/><stop offset=".22" stop-color="#0f1016"/><stop offset=".5" stop-color="#0b0a0b"/><stop offset=".62" stop-color="#0d0c0b"/><stop offset=".75" stop-color="#081419"/><stop offset="1" stop-color="#050b0f"/></linearGradient>`
  + `<linearGradient id="w1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#163b47" stop-opacity=".55"/><stop offset=".08" stop-color="#0d2933" stop-opacity=".85"/><stop offset=".3" stop-color="#081b24" stop-opacity=".95"/></linearGradient>`
  + `<linearGradient id="w2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#143643" stop-opacity=".6"/><stop offset=".08" stop-color="#0c2530" stop-opacity=".88"/><stop offset=".3" stop-color="#071820" stop-opacity=".96"/></linearGradient>`
  + `<linearGradient id="w3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12323e" stop-opacity=".65"/><stop offset=".08" stop-color="#0a222c" stop-opacity=".9"/><stop offset=".3" stop-color="#06141b" stop-opacity=".97"/></linearGradient>`
  + `<linearGradient id="rmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="rm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${15 * RH}"><rect width="${W}" height="${15 * RH}" fill="url(#rmg)"/></mask>`
  + `<filter id="fogb" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>`
  + `<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>`
  + `<filter id="glow2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><style>${css}</style><defs>${defs}<g id="gt">${glowText}</g></defs>`
  + `<rect width="${W}" height="${H}" fill="url(#bg)"/>`
  + `<rect width="${W}" height="${30 * RH}" fill="url(#gV)"/>` + `<g mask="url(#rm)">${ridgePaths.join('')}</g>`
  + `<use href="#gt" filter="url(#glow2)" opacity=".9"/><use href="#gt" filter="url(#glow)"/>`
  + gridText + halos
  + lace + waves + seaRows + refl + rings + fog + stacks + ff + grassL + grassR + rain
  + `</svg>`;
require('fs').writeFileSync(process.argv[2] + '/scene.svg', svg);
require('fs').writeFileSync(process.argv[3], `// Generated: the Lantern Isle backdrop, drawn in ASCII.\nexport const SCENE = ${JSON.stringify(svg)}\n`);
console.log('length', svg.length, 'fog', fog.length, 'stacks', stacks.length, 'grid', gridText.length, 'glow', glowText.length, 'waves', waves.length, 'sea', seaRows.length, 'refl', refl.length, 'ff', ff.length, 'rain', rain.length);
