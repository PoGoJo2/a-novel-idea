// Artwork for the My Library page: shelves of upright books, and four people reading.
// Everything is drawn once, from fixed numbers, so it looks the same on every visit.
const K = '#1a100a';
const GOLD = '#d8b25a';
let seed = 5;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const CLOTH = ['#c43a2b', '#1f2a4d', '#3d7aa3', '#a5472c', '#2f5f88', '#8e2b2b', '#2f4a3a', '#c9502f'];
const LEATHER = ['#b5764a', '#9a5f35', '#7a4a2a'];


/* ---------------- a library wall: upright books on shelves + readers at a table ---------------- */
function vbook(x, base, w, h, kind, c, tilt) {
  const y = base - h;
  let o = `<g${tilt ? ` transform="rotate(${tilt} ${x + w} ${base})"` : ''}>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4" fill="${c}" stroke="${K}" stroke-width="1.1"/>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4" fill="url(#vshade${LU})"/>`;
  o += `<path d="M${x} ${y + 5} H${x + w} M${x} ${y + h - 5} H${x + w}" stroke="${GOLD}" stroke-width=".9"/>`;
  if (kind === 'label') o += `<rect x="${x + 2}" y="${y + h * 0.28}" width="${w - 4}" height="${h * 0.3}" fill="#171009" stroke="${GOLD}" stroke-width=".7"/><path d="M${x + 3.5} ${y + h * 0.43} H${x + w - 3.5}" stroke="${GOLD}" stroke-width=".6"/>`;
  else if (kind === 'bands') o += `<path d="M${x} ${y + h * 0.34} H${x + w} M${x} ${y + h * 0.4} H${x + w} M${x} ${y + h * 0.62} H${x + w}" stroke="${GOLD}" stroke-width=".9"/>`;
  else if (kind === 'diamond') { for (let yy = y + 14; yy < y + h - 12; yy += 9) o += `<path d="M${x + w / 2} ${yy - 3} L${x + w / 2 + 3} ${yy} L${x + w / 2} ${yy + 3} L${x + w / 2 - 3} ${yy} Z" fill="${GOLD}" opacity=".9"/>`; }
  else o += `<path d="M${x + 2} ${y + h * 0.5} H${x + w - 2}" stroke="#000" stroke-width=".8" opacity=".3"/>`;
  return o + '</g>';
}
let LU = '';
function shelfRow(x0, x1, base) {
  let o = ''; let x = x0;
  const kinds = ['label', 'bands', 'diamond', 'plain', 'label'];
  while (x < x1 - 14) {
    const w = 9 + Math.floor(rnd() * 9);
    const h = 36 + Math.floor(rnd() * 30);
    if (x + w > x1) break;
    const pal = rnd();
    const c = pal < 0.25 ? pick(LEATHER) : pal < 0.38 ? '#5b5a3a' : pick(CLOTH);
    const lean = rnd() < 0.08 && x + w + 14 < x1;
    o += vbook(x, base, w, h, pick(kinds), c, lean ? -14 : 0);
    x += w + (lean ? 12 : 0.6);
  }
  return o;
}
function libSide(side, s0) {
  seed = s0; LU = side;
  const W = 170, H = 674;
  let o = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" style="overflow:visible"><defs><linearGradient id="vshade${side}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient></defs>`;
  const top = 12, rows = 8, rowH = 79;
  o += `<rect x="12" y="${top}" width="146" height="${rows * rowH}" fill="#2a1a0e" opacity=".6"/>`;
  for (let r = 0; r < rows; r++) {
    const base = top + (r + 1) * rowH - 7;
    o += shelfRow(16, 154, base);
    o += `<rect x="4" y="${base}" width="162" height="7" rx="1.5" fill="#7a4a28" stroke="${K}" stroke-width="1.2"/><path d="M6 ${base + 1.6} H164" stroke="#b07a46" stroke-width=".9"/>`;
  }
  o += `<rect x="4" y="${top - 6}" width="162" height="8" rx="2" fill="#8a5a32" stroke="${K}" stroke-width="1.3"/>`;
  o += `<rect x="4" y="${top - 2}" width="8" height="${rows * rowH + 4}" fill="#6a4426" stroke="${K}" stroke-width="1.2"/><rect x="158" y="${top - 2}" width="8" height="${rows * rowH + 4}" fill="#6a4426" stroke="${K}" stroke-width="1.2"/>`;
  return o + '</svg>';
}

/* ---------------- people reading, drawn for the bottom of the library page ---------------- */
const SC = 0.78; // people are drawn at about 3/4 of their first size
// Soft modelling: every element marked data-s gets a copy filled with a light-to-dark gradient, so forms look rounded and lit from the upper left
const shade = (inner, id) => inner.replace(/<(path|circle|ellipse|rect)\b([^>]*?data-s[^>]*?)\/>/g, (m, t, a) => {
  const f = a.match(/fill="(#[0-9a-fA-F]{3,8})"/);
  if (!f) return m;
  const a2 = a.replace(/fill="#[0-9a-fA-F]{3,8}"/, `fill="url(#${id})"`).replace(/stroke="[^"]*"/, 'stroke="none"').replace(/stroke-width="[\d.]+"/, '').replace('data-s', '');
  return m + `<${t}${a2}/>`;
});
const svgWrap = (w, h, inner, cls) => { const id = cls.split(' ').pop(); return `<svg class="${cls}" width="${Math.round(w * SC)}" height="${Math.round(h * SC)}" viewBox="0 0 ${w} ${h}" aria-hidden="true" style="overflow:visible"><defs><linearGradient id="sh-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff5e0" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1e0e06" stop-opacity=".5"/></linearGradient><filter id="ink-${id}" x="-4%" y="-4%" width="108%" height="108%"><feGaussianBlur stdDeviation=".35" result="b"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .2 0 0 0 0 .12 0 0 0 0 .06 0 0 0 1.4 -.6" result="g"/><feComposite in="g" in2="b" operator="in" result="gi"/><feMerge><feMergeNode in="b"/><feMergeNode in="gi"/></feMerge></filter></defs><g filter="url(#ink-${id})">${shade(inner, 'sh-' + id)}</g></svg>`; };

// ---- realistic-leaning helpers: natural proportions, soft light, faint contour lines ----
const INK = '#3a2412';
const SKIN = '#e0b08c', SKIN_D = '#c58d68', DSKIN = '#8b5a3c';
const P = (d, f, w = 0.8) => `<path data-s d="${d}" fill="${f}" stroke="${INK}" stroke-opacity=".55" stroke-width="${w}" stroke-linejoin="round"/>`;
const C = (cx, cy, r, f) => `<circle data-s cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
const ln = (d, c = INK, w = 1, op = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
const fold = (d) => ln(d, '#20100a', 1, 0.28);
const glint = (d) => ln(d, '#fff', 1, 0.3);
// a tapered limb between two joints, with rounded ends
const limb = (ax, ay, bx, by, wa, wb, f) => {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const q = (x, y, w, k) => `${(x + (nx * w * k) / 2).toFixed(1)} ${(y + (ny * w * k) / 2).toFixed(1)}`;
  return P(`M${q(ax, ay, wa, 1)} L${q(bx, by, wb, 1)} L${q(bx, by, wb, -1)} L${q(ax, ay, wa, -1)} Z`, f, 0) + C(ax, ay, wa / 2, f) + C(bx, by, wb / 2, f);
};
const hand = (x, y, f = SKIN) => P(`M${x - 4} ${y} C${x - 4} ${y - 4} ${x + 3} ${y - 5} ${x + 5} ${y - 1} C${x + 6} ${y + 3} ${x + 1} ${y + 6} ${x - 3} ${y + 4} Z`, f, 0.6);
const eyes = (lx, rx, y, c = '#2b1a10') => ln(`M${lx - 3} ${y} q3 2 6 0`, c, 1.1, 0.85) + ln(`M${rx - 3} ${y} q3 2 6 0`, c, 1.1, 0.85) + ln(`M${lx - 4} ${y - 3} q4 -2 8 0 M${rx - 4} ${y - 3} q4 -2 8 0`, c, 0.9, 0.55);
const lips = (x, y, w = 6, c = '#a8504a') => P(`M${x - w / 2} ${y} Q${x} ${y - 1.8} ${x + w / 2} ${y} Q${x} ${y + 2.6} ${x - w / 2} ${y} Z`, c, 0);
const nose = (x, y) => ln(`M${x} ${y} q1.8 5 -1 7`, '#8a5a3c', 1, 0.7);

// young woman reading in a rust armchair beside a side table, plant and floor lamp  (left corner)
function girlScene() {
  let o = `<ellipse cx="125" cy="196" rx="120" ry="5" fill="#000" opacity=".2"/>`;
  o += `<circle cx="228" cy="52" r="36" fill="#f6d27a" opacity=".18"/><ellipse cx="228" cy="195" rx="14" ry="3.5" fill="#3a2a18"/>` + ln('M228 44 V194', '#3a2a18', 3.4) + P('M212 44 L244 44 L238 16 L218 16 Z', '#f3dfa0');
  o += P('M146 118 H216 L214 127 H148 Z', '#8f5d33') + ln('M154 127 V195 M208 127 V195', '#6a4426', 5) + P('M156 160 H206 V166 H156 Z', '#8f5d33') + P('M160 160 V149 H194 V160 Z', '#2f5f88') + P('M164 149 V140 H192 V149 Z', '#b5522c');
  o += P('M184 118 C170 104 170 92 180 84 C190 94 192 108 184 118 Z', '#3f8f5a') + P('M184 118 C190 100 200 94 208 94 C206 106 198 114 184 118 Z', '#52ad6c') + P('M184 118 C180 100 182 86 190 78 C196 92 194 106 184 118 Z', '#2f7a4a') + P('M172 118 H198 L194 104 H176 Z', '#c97d42');
  // chair
  o += P('M16 178 C6 122 10 66 50 58 C86 52 114 66 118 118 L120 178 Z', '#9c4a28') + P('M26 170 C20 122 24 80 52 74 C80 70 102 82 106 122 L106 170 Z', '#b0603a') + glint('M30 100 C28 88 34 80 46 77');
  o += P('M104 112 C126 104 140 116 136 142 L134 178 H104 Z', '#a8552e') + P('M16 144 C40 132 98 132 128 144 L130 176 H16 Z', '#b9683c') + fold('M30 150 C60 146 100 146 124 152') + ln('M24 178 V195 M120 178 V195', '#4a2a14', 8);
  // hair behind
  o += P('M50 76 C46 56 60 46 72 50 C84 54 88 68 84 86 C90 100 88 118 80 128 L74 102 L58 102 L52 122 C44 108 44 90 50 76 Z', '#47291a');
  // torso (cream knit), arms, legs
  o += limb(84, 108, 98, 132, 11, 9, '#cdb892');
  o += P('M48 152 C44 130 46 108 56 98 C62 92 76 92 82 98 C90 108 92 130 88 152 Z', '#dccaa8') + fold('M54 112 C62 118 74 118 84 112 M52 130 C64 136 78 136 88 130') + glint('M56 100 C60 96 68 95 74 96');
  o += limb(64, 150, 112, 143, 25, 19, '#6f87aa') + limb(112, 143, 118, 186, 18, 13, '#6f87aa') + fold('M80 142 C88 148 96 148 104 144 M112 160 C118 162 122 162 124 160');
  o += P('M104 186 C110 180 128 182 134 188 L134 194 H104 Z', '#7a4a2c');
  // neck, head (slightly bowed)
  o += `<g transform="rotate(7 66 82)">` + P('M60 92 L72 92 L72 100 C68 103 64 103 60 100 Z', SKIN_D) + P('M55 76 C54 61 60 56 66 56 C74 56 78 64 78 76 C78 88 73 94 66 94 C60 94 55 88 55 76 Z', SKIN) + eyes(61, 71, 78) + nose(67, 79) + lips(66, 88) + `<ellipse cx="59" cy="84" rx="3" ry="2" fill="#d47a74" opacity=".35"/><ellipse cx="74" cy="84" rx="3" ry="2" fill="#d47a74" opacity=".35"/>` + P('M53 76 C54 60 66 54 76 60 C82 64 82 72 80 76 C76 66 62 64 53 76 Z', '#47291a') + glint('M58 60 C64 56 72 56 76 60') + `</g>`;
  o += limb(52, 104, 48, 128, 12, 10, '#dccaa8') + limb(48, 128, 78, 140, 10, 8, '#dccaa8');
  // book on her lap
  o += P('M70 134 L108 126 L114 153 L75 162 Z', '#2f5f4a') + P('M74 136 L106 129 L110 150 L78 157 Z', '#efe3c6') + ln('M91 132 L93 155 M79 141 L102 135 M80 147 L104 141', '#bba978', 0.9, 0.8) + hand(80, 141) + hand(106, 133);
  return svgWrap(250, 200, o, 'scene scene-girl');
}

// boy balancing a tall stack of books  (bottom row)
function boyScene() {
  let o = `<ellipse cx="56" cy="196" rx="46" ry="4.5" fill="#000" opacity=".2"/>`;
  const cols = ['#a83a2e', '#2f7a78', '#c9962a', '#2f4a6b', '#6c8a36', '#b5522c', '#5f4a8a', '#2f5f88'];
  o += limb(48, 108, 43, 142, 18, 13, '#3f5878') + limb(43, 142, 41, 174, 13, 10, '#3f5878') + limb(64, 108, 70, 140, 18, 13, '#3f5878') + limb(70, 140, 77, 172, 13, 10, '#3f5878');
  o += P('M30 172 C34 166 48 166 52 172 L54 180 C46 184 34 184 28 180 Z', '#c8362b') + P('M66 170 C70 164 84 166 88 172 L90 180 C82 184 70 184 64 180 Z', '#c8362b') + ln('M28 181 C36 184 46 184 54 181 M64 181 C72 184 82 184 90 181', '#f4f1ea', 1.6);
  o += P('M38 62 C34 84 36 102 40 112 H72 C76 102 78 84 74 62 C68 56 44 56 38 62 Z', '#dcb242') + fold('M44 80 C50 90 52 100 50 110 M68 78 C64 88 64 98 66 108');
  o += limb(56, 62, 56, 50, 11, 10, DSKIN);
  o += P('M45 36 C44 22 50 17 56 17 C63 17 68 22 68 36 C68 48 62 55 56 55 C50 55 45 48 45 36 Z', DSKIN);
  [[46, 22, 6], [53, 15, 6.5], [62, 16, 6.5], [68, 24, 5.5], [44, 29, 4.5]].forEach(([x, y, r]) => { o += C(x, y, r, '#1b1410'); });
  o += eyes(51, 61, 36, '#1b1008') + nose(56, 38) + lips(56, 47, 7, '#7a3a2c') + glint('M48 20 C52 15 58 14 62 17');
  let y = 126;
  for (let i = 0; i < 8; i++) {
    const w = 50 + ((i * 7) % 12); const x = 56 - w / 2 + ((i * 5) % 7) - 3;
    o += P(`M${x} ${y} h${w} v-8 h-${w} Z`, cols[i], 0.9) + ln(`M${x + 4} ${y - 4} h${w - 14}`, '#eed48a', 0.9, 0.8) + `<rect x="${x + w - 6}" y="${y - 7}" width="5.4" height="6" fill="#efe3c6" opacity=".9"/>`;
    y -= 8;
  }
  o += limb(38, 66, 30, 90, 11, 9, DSKIN) + limb(30, 90, 46, 112, 9, 8, DSKIN) + limb(74, 66, 82, 90, 11, 9, DSKIN) + limb(82, 90, 66, 112, 9, 8, DSKIN) + hand(48, 113, DSKIN) + hand(64, 113, DSKIN);
  return svgWrap(112, 200, o, 'scene scene-boy');
}

// grandfather in a mustard armchair  (bottom row)
function elderScene() {
  let o = `<ellipse cx="86" cy="177" rx="84" ry="5" fill="#000" opacity=".2"/>`;
  o += P('M70 162 C58 100 66 44 104 36 C140 30 166 48 168 100 L166 162 Z', '#c8921c') + P('M62 130 C90 120 150 120 168 130 L168 158 H62 Z', '#dba630') + P('M144 98 C164 90 178 104 174 130 L172 160 H144 Z', '#b98418') + ln('M76 160 V176 M154 160 V176', '#5a3a1a', 8) + glint('M76 70 C80 52 92 42 108 40');
  o += limb(108, 142, 56, 138, 24, 19, '#4d4660') + limb(56, 138, 52, 170, 17, 13, '#4d4660') + fold('M80 134 C72 140 66 142 60 140') + P('M46 170 C48 164 62 164 64 172 L66 178 H40 Z', '#4a2e1a');
  o += P('M88 144 C80 110 84 86 104 80 C124 78 138 92 134 124 L134 144 Z', '#486da0') + ln('M112 94 V142', '#2c4468', 1.2, 0.8) + fold('M90 110 C94 120 94 130 92 140 M128 104 C130 116 128 130 126 140') + P('M98 80 L108 94 L118 80 Z', '#f2ead4') + P('M105 92 L111 92 L112 114 L108 120 L104 114 Z', '#7e2a2a');
  o += limb(100, 90, 90, 112, 12, 10, '#486da0') + limb(90, 112, 68, 112, 10, 8, '#486da0');
  o += limb(110, 82, 110, 74, 12, 11, '#d6ad88');
  o += P('M95 62 C93 46 101 39 110 39 C121 39 127 48 126 62 C125 76 117 82 110 82 C102 82 96 74 95 62 Z', '#e0b892') + ln('M100 52 q4 -2 8 0 M114 52 q4 -2 8 0 M103 70 q6 3 12 0', '#a8785a', 0.9, 0.6);
  o += P('M94 56 C92 40 102 33 113 35 C126 36 132 47 127 58 C121 47 104 46 94 56 Z', '#ecece6') + P('M93 56 C90 62 91 70 95 74 C95 66 95 60 96 56 Z', '#e4e4de') + glint('M101 38 C106 34 114 34 119 37');
  o += `<circle cx="103" cy="62" r="5" fill="rgba(255,255,255,.18)" stroke="#2b1a10" stroke-width="1"/><circle cx="117" cy="62" r="5" fill="rgba(255,255,255,.18)" stroke="#2b1a10" stroke-width="1"/>` + ln('M108 62 h4', '#2b1a10', 1) + eyes(103, 117, 63) + nose(110, 64);
  o += P('M101 73 C105 70 108 72 110 73 C112 72 115 70 119 73 C115 77 112 77 110 75 C108 77 105 77 101 73 Z', '#ecece6');
  o += P('M52 94 L92 88 L98 120 L56 126 Z', '#2f5f4a') + P('M56 97 L90 92 L94 114 L59 120 Z', '#efe3c6') + ln('M73 94 L75 117 M60 102 L70 100 M61 108 L71 106', '#bba978', 0.9, 0.8) + hand(66, 114, '#d6ad88') + hand(94, 106, '#d6ad88');
  return svgWrap(172, 180, o, 'scene scene-elder');
}

// man lounging on a giant stack of books, one leg swinging  (right corner)
function stackManScene() {
  let o = `<ellipse cx="100" cy="247" rx="96" ry="5" fill="#000" opacity=".2"/>`;
  const cols = [['#2f7a78', 190], ['#c9962a', 176], ['#b5522c', 184], ['#2f4a6b', 168], ['#66763a', 178], ['#862a2a', 160]];
  let y = 246;
  cols.forEach(([c, w], i) => {
    const x = 100 - w / 2 + (i % 2 ? 5 : -4);
    o += P(`M${x} ${y} H${x + w} V${y - 21} H${x} Z`, c, 1) + `<rect x="${x + w - 13}" y="${y - 18}" width="12" height="15" fill="#efe3c6"/>` + ln(`M${x + w - 12} ${y - 14} H${x + w - 2} M${x + w - 12} ${y - 9} H${x + w - 2}`, '#b9a273', 0.8) + ln(`M${x + 8} ${y - 15} H${x + w - 22} M${x + 8} ${y - 8} H${x + w - 22}`, '#f7ecc4', 1, 0.7) + ln(`M${x + 3} ${y - 21} V${y}`, '#000', 1, 0.3);
    y -= 21;
  });
  const t = y;
  o += limb(100, t - 12, 58, t - 6, 24, 19, '#3d3548') + limb(58, t - 6, 54, t + 32, 17, 13, '#3d3548') + P(`M46 ${t + 30} C48 ${t + 26} 62 ${t + 26} 64 ${t + 34} L66 ${t + 40} H42 Z`, '#4a2e1a') + fold(`M80 ${t - 10} C72 ${t - 4} 66 ${t - 2} 60 ${t - 4}`);
  o += limb(96, t - 14, 120, t - 6, 24, 20, '#3d3548');
  o += P(`M82 ${t - 8} C72 ${t - 40} 80 ${t - 68} 100 ${t - 72} C120 ${t - 72} 130 ${t - 48} 124 ${t - 8} Z`, '#6f7f38') + fold(`M88 ${t - 40} C92 ${t - 30} 92 ${t - 20} 90 ${t - 12} M118 ${t - 42} C120 ${t - 32} 118 ${t - 20} 116 ${t - 12}`) + ln(`M104 ${t - 66} V${t - 8}`, '#44521e', 1.2, 0.8) + P(`M92 ${t - 70} L104 ${t - 58} L114 ${t - 70} Z`, '#85964a') + P(`M110 ${t - 38} h10 v12 h-10 Z`, '#5d6c2e', 0.6) + glint(`M90 ${t - 62} C94 ${t - 68} 100 ${t - 70} 106 ${t - 70}`);
  o += limb(104, t - 76, 104, t - 84, 12, 11, '#dcab84');
  o += P(`M91 ${t - 100} C89 ${t - 116} 98 ${t - 120} 108 ${t - 120} C120 ${t - 120} 125 ${t - 108} 123 ${t - 96} C121 ${t - 86} 115 ${t - 82} 107 ${t - 82} C99 ${t - 82} 92 ${t - 88} 91 ${t - 100} Z`, '#e0b08c');
  o += P(`M90 ${t - 102} C88 ${t - 122} 102 ${t - 128} 114 ${t - 124} C126 ${t - 120} 128 ${t - 106} 124 ${t - 100} C120 ${t - 110} 102 ${t - 112} 90 ${t - 102} Z`, '#b5502a') + glint(`M96 ${t - 114} C102 ${t - 120} 112 ${t - 121} 120 ${t - 115}`);
  o += P(`M92 ${t - 96} C94 ${t - 80} 102 ${t - 74} 108 ${t - 74} C116 ${t - 74} 122 ${t - 80} 124 ${t - 96} C118 ${t - 86} 114 ${t - 84} 108 ${t - 84} C100 ${t - 84} 96 ${t - 86} 92 ${t - 96} Z`, '#b5502a');
  o += `<circle cx="101" cy="${t - 99}" r="5" fill="rgba(255,255,255,.18)" stroke="#2b1a10" stroke-width="1"/><circle cx="115" cy="${t - 99}" r="5" fill="rgba(255,255,255,.18)" stroke="#2b1a10" stroke-width="1"/>` + ln(`M106 ${t - 99} h4`, '#2b1a10', 1) + eyes(101, 115, t - 98) + nose(108, t - 97) + ln(`M104 ${t - 88} q4 2 8 0`, '#5a2a18', 1.3, 0.8);
  o += limb(96, t - 62, 76, t - 40, 12, 10, '#6f7f38') + limb(76, t - 40, 70, t - 32, 10, 8, '#6f7f38');
  o += P(`M62 ${t - 52} L100 ${t - 60} L106 ${t - 30} L66 ${t - 22} Z`, '#a8322a') + P(`M66 ${t - 50} L98 ${t - 57} L102 ${t - 33} L69 ${t - 26} Z`, '#efe3c6') + ln(`M82 ${t - 54} L84 ${t - 29} M70 ${t - 44} L80 ${t - 46} M71 ${t - 38} L81 ${t - 40}`, '#bba978', 0.9, 0.8) + hand(66, t - 34) + hand(104, t - 44);
  return svgWrap(200, 250, o, 'scene scene-stack');
}


export const SHELF_LEFT = libSide('L', 11);
export const SHELF_RIGHT = libSide('R', 29);
export const SCENES = { girl: girlScene(), boy: boyScene(), elder: elderScene(), stack: stackManScene() };
