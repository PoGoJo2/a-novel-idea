// Two tall stacks of real-looking books that stand in the page margins.
// They are drawn once, from fixed numbers, so they look the same on every visit.
const K = '#1a100a';
const GOLD = '#d8b25a';
let UID = '';

/* ---------------- realistic stacked books ---------------- */
let seed = 5;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const CLOTH = ['#c43a2b', '#1f2a4d', '#3d7aa3', '#a5472c', '#2f5f88', '#8e2b2b', '#2f4a3a', '#c9502f'];
const LEATHER = ['#b5764a', '#9a5f35', '#7a4a2a'];

function hbook(x, y, w, h, kind, c) {
  const pw = 7 + Math.floor(rnd() * 4);   // width of the visible page block at the right end
  const bw = w - pw;                       // width of the spine
  const cy = y + h / 2;
  let s = `<g>`;
  s += `<rect x="${x + 2}" y="${y + h - 1}" width="${w}" height="3.4" rx="1.5" fill="#000" opacity=".22"/>`;
  // page block with fine page lines
  s += `<rect x="${x + bw - 1}" y="${y + 1.6}" width="${pw + 1}" height="${h - 3.2}" fill="#ecdfba" stroke="${K}" stroke-width="1"/>`;
  for (let ly = y + 3.6; ly < y + h - 2.4; ly += 1.9) s += `<path d="M${x + bw} ${ly} H${x + bw + pw}" stroke="#b9a273" stroke-width=".55" opacity=".8"/>`;
  s += `<rect x="${x + bw - 1}" y="${y + 1.6}" width="${pw + 1}" height="${h - 3.2}" fill="url(#pageshade${UID})" opacity=".5"/>`;
  // spine
  s += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="1.6" fill="${c}" stroke="${K}" stroke-width="1.2"/>`;
  // cover boards overhanging the pages
  s += `<rect x="${x + bw - 2}" y="${y}" width="${pw + 3}" height="2.6" rx="1" fill="${c}" stroke="${K}" stroke-width="1"/>`;
  s += `<rect x="${x + bw - 2}" y="${y + h - 2.6}" width="${pw + 3}" height="2.6" rx="1" fill="${c}" stroke="${K}" stroke-width="1"/>`;
  // light and shadow on the cloth or leather
  s += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="1.6" fill="url(#bookshade${UID})"/>`;
  s += `<rect x="${x}" y="${y}" width="3.2" height="${h}" rx="1.4" fill="#000" opacity=".22"/>`;
  // tooling
  if (kind === 'bands') {
    for (let i = 1; i <= 4; i++) {
      const bx = x + (bw * i) / 5;
      s += `<rect x="${bx - 1.8}" y="${y}" width="3.6" height="${h}" fill="#000" opacity=".22"/><path d="M${bx - 2.6} ${y + 1} V${y + h - 1} M${bx + 2.6} ${y + 1} V${y + h - 1}" stroke="${GOLD}" stroke-width=".9"/>`;
    }
    s += `<rect x="${x + bw * 0.12}" y="${y + 3}" width="${bw * 0.2}" height="${h - 6}" fill="#2a160a" opacity=".55" stroke="${GOLD}" stroke-width=".7"/>`;
  } else if (kind === 'pattern') {
    s += `<path d="M${x + 4} ${y + 2.6} H${x + bw - 4} M${x + 4} ${y + h - 2.6} H${x + bw - 4}" stroke="${GOLD}" stroke-width=".9"/>`;
    for (let xx = x + 10; xx < x + bw - 8; xx += 11) s += `<path d="M${xx} ${cy - 3.2} L${xx + 3} ${cy} L${xx} ${cy + 3.2} L${xx - 3} ${cy} Z" fill="${GOLD}" opacity=".9"/><circle cx="${xx + 5.5}" cy="${cy}" r="1" fill="${GOLD}"/>`;
  } else if (kind === 'label') {
    s += `<rect x="${x + bw * 0.3}" y="${y + 3}" width="${bw * 0.34}" height="${h - 6}" fill="#171009" stroke="${GOLD}" stroke-width="1"/>`;
    s += `<path d="M${x + bw * 0.33} ${cy - 1.6} H${x + bw * 0.61} M${x + bw * 0.33} ${cy + 1.6} H${x + bw * 0.61}" stroke="${GOLD}" stroke-width=".7"/>`;
    s += `<path d="M${x + 8} ${y + 1} V${y + h - 1} M${x + 11} ${y + 1} V${y + h - 1} M${x + bw - 8} ${y + 1} V${y + h - 1} M${x + bw - 11} ${y + 1} V${y + h - 1}" stroke="${GOLD}" stroke-width=".8"/>`;
  } else if (kind === 'stitch') {
    [0.22, 0.68].forEach((f) => { const sx = x + bw * f; s += `<path d="M${sx} ${cy - 3} l7 6 m0 -6 l-7 6 M${sx + 9} ${cy - 3} l7 6 m0 -6 l-7 6 M${sx + 18} ${cy - 3} l7 6 m0 -6 l-7 6" stroke="#e8e2c8" stroke-width="1.1" fill="none" stroke-linecap="round"/>`; });
  } else { // plain cloth with hinge lines
    s += `<path d="M${x + 7} ${y + 1} V${y + h - 1} M${x + bw - 7} ${y + 1} V${y + h - 1}" stroke="#000" stroke-width="1" opacity=".3"/><path d="M${x + 9} ${y + 3} H${x + bw - 9}" stroke="${GOLD}" stroke-width=".7" opacity=".8"/>`;
  }
  return s + '</g>';
}

function fanned(cx, y) {
  let s = `<ellipse cx="${cx}" cy="${y + 6}" rx="64" ry="4" fill="#000" opacity=".2"/>`;
  s += `<path d="M${cx - 60} ${y} L${cx} ${y - 3} L${cx + 60} ${y} L${cx + 62} ${y + 5} L${cx} ${y + 2} L${cx - 62} ${y + 5} Z" fill="#8a3b1d" stroke="${K}" stroke-width="1.4"/>`;
  for (let i = 0; i <= 18; i++) {
    const a = -80 + i * (160 / 18); const sh = 232 - Math.abs(a) * 0.5;
    s += `<g transform="translate(${cx} ${y - 2}) rotate(${a})"><path d="M0 0 C-7 -14 -9 -36 -2 -56 Q0 -59 2 -56 C9 -36 7 -14 0 0Z" fill="rgb(${sh},${sh - 12},${sh - 44})" stroke="#b79d63" stroke-width=".7"/></g>`;
  }
  return s;
}


function trio(cx, base) {
  const sk = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${K}" stroke-width="1.2"/>`;
  const torso = (x, top, w, c) => `<path d="M${x - w} ${base} V${top + 16} Q${x - w} ${top} ${x} ${top} Q${x + w} ${top} ${x + w} ${top + 16} V${base} Z" fill="${c}" stroke="${K}" stroke-width="1.3"/>`;
  const hand = (x, y, c) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${c}" stroke="${K}" stroke-width="1.1"/>`;
  let o = `<ellipse cx="${cx}" cy="${base + 2}" rx="76" ry="4" fill="#000" opacity=".22"/>`;
  // left reader: auburn hair, green patterned sweater, orange book held to the side
  { const x = cx - 44, top = base - 48, hy = top - 12;
    o += `<path d="M${x - 13} ${hy + 2} Q${x - 15} ${hy - 16} ${x} ${hy - 15} Q${x + 15} ${hy - 16} ${x + 13} ${hy + 2} Q${x + 9} ${hy - 7} ${x} ${hy - 7} Q${x - 9} ${hy - 7} ${x - 13} ${hy + 2} Z" fill="#b5532a" stroke="${K}" stroke-width="1.2"/>`;
    o += torso(x, top, 23, '#3f8f86') + sk(x, hy, 11, '#e3a97f');
    o += `<path d="M${x - 11} ${hy - 4} Q${x} ${hy - 20} ${x + 11} ${hy - 4} Q${x} ${hy - 11} ${x - 11} ${hy - 4}Z" fill="#b5532a" stroke="${K}" stroke-width="1"/>`;
    o += `<g fill="none" stroke="#bfe3dc" stroke-width="1.3"><circle cx="${x - 9}" cy="${top + 18}" r="3.5"/><circle cx="${x + 8}" cy="${top + 12}" r="3.5"/><circle cx="${x + 10}" cy="${top + 28}" r="3.5"/><circle cx="${x - 8}" cy="${top + 32}" r="3.5"/></g>`;
    o += `<g transform="rotate(-10 ${x - 30} ${base - 34})"><rect x="${x - 44}" y="${base - 56}" width="28" height="36" rx="2" fill="#d2692a" stroke="${K}" stroke-width="1.4"/><rect x="${x - 40}" y="${base - 53}" width="21" height="30" fill="#f6ecd0" stroke="${K}" stroke-width="1"/></g>` + hand(x - 24, base - 26, '#e3a97f'); }
  // right reader: black bob with blue-green tips, coral top, red-brown book held to the side
  { const x = cx + 44, top = base - 48, hy = top - 12;
    o += `<path d="M${x - 14} ${hy + 14} Q${x - 17} ${hy - 16} ${x} ${hy - 16} Q${x + 17} ${hy - 16} ${x + 14} ${hy + 14} Q${x + 11} ${hy + 18} ${x + 8} ${hy + 14} V${hy - 2} H${x - 8} V${hy + 14} Q${x - 11} ${hy + 18} ${x - 14} ${hy + 14} Z" fill="#1f4f5a" stroke="${K}" stroke-width="1.2"/>`;
    o += torso(x, top, 23, '#cf6a3b') + sk(x, hy, 10.5, '#d99a78');
    o += `<path d="M${x - 11} ${hy - 4} Q${x} ${hy - 19} ${x + 11} ${hy - 4} Q${x} ${hy - 10} ${x - 11} ${hy - 4}Z" fill="#1f4f5a" stroke="${K}" stroke-width="1"/>`;
    o += `<g fill="none" stroke="#f2c49a" stroke-width="1.3" stroke-linecap="round"><path d="M${x - 12} ${top + 14} q4 -5 8 0"/><path d="M${x + 4} ${top + 10} q4 -5 8 0"/><path d="M${x - 4} ${top + 26} q4 -5 8 0"/><path d="M${x + 10} ${top + 28} q4 -5 8 0"/></g>`;
    o += `<g transform="rotate(9 ${x + 30} ${base - 34})"><rect x="${x + 16}" y="${base - 56}" width="28" height="36" rx="2" fill="#8a2b2b" stroke="${K}" stroke-width="1.4"/><rect x="${x + 19}" y="${base - 53}" width="21" height="30" fill="#f6ecd0" stroke="${K}" stroke-width="1"/></g>` + hand(x + 24, base - 26, '#d99a78'); }
  // centre reader: two hair puffs, mustard polka-dot top, big open navy book
  { const x = cx, top = base - 38, hy = top - 13;
    o += `<circle cx="${x - 12}" cy="${hy - 10}" r="7.5" fill="#1b1410" stroke="${K}" stroke-width="1.2"/><circle cx="${x + 12}" cy="${hy - 10}" r="7.5" fill="#1b1410" stroke="${K}" stroke-width="1.2"/>`;
    o += torso(x, top, 26, '#d9a21f') + sk(x, hy, 12, '#8a5a3c');
    o += `<path d="M${x - 12} ${hy - 4} Q${x} ${hy - 22} ${x + 12} ${hy - 4} Q${x} ${hy - 12} ${x - 12} ${hy - 4}Z" fill="#1b1410" stroke="${K}" stroke-width="1"/>`;
    o += `<g fill="#f6e1a0"><circle cx="${x - 14}" cy="${top + 12}" r="1.8"/><circle cx="${x + 15}" cy="${top + 10}" r="1.8"/><circle cx="${x - 6}" cy="${top + 22}" r="1.8"/><circle cx="${x + 8}" cy="${top + 24}" r="1.8"/><circle cx="${x - 18}" cy="${top + 28}" r="1.8"/><circle cx="${x + 20}" cy="${top + 28}" r="1.8"/></g>`;
    o += `<path d="M${x - 33} ${base - 4} L${x - 31} ${base - 34} L${x} ${base - 28} L${x + 31} ${base - 34} L${x + 33} ${base - 4} L${x} ${base + 1} Z" fill="#1f4e6b" stroke="${K}" stroke-width="1.5"/>`;
    o += `<path d="M${x - 29} ${base - 7} L${x - 27} ${base - 32} L${x - 1} ${base - 26} L${x - 1} ${base - 2} Z" fill="#f6ecd0" stroke="${K}" stroke-width="1.1"/><path d="M${x + 29} ${base - 7} L${x + 27} ${base - 32} L${x + 1} ${base - 26} L${x + 1} ${base - 2} Z" fill="#efe0bb" stroke="${K}" stroke-width="1.1"/>`;
    o += `<g stroke="#b9a273" stroke-width=".8"><path d="M${x - 23} ${base - 24} L${x - 6} ${base - 20} M${x - 23} ${base - 18} L${x - 6} ${base - 14} M${x + 23} ${base - 24} L${x + 6} ${base - 20} M${x + 23} ${base - 18} L${x + 6} ${base - 14}"/></g>`;
    o += hand(x - 33, base - 12, '#8a5a3c') + hand(x + 33, base - 12, '#8a5a3c'); }
  return o;
}

// one tall stack of books rising from the bottom of the page, topped with a fanned book or a reader
function stack(top, s0, uid) {
  seed = s0;
  UID = uid;
  const W = 170; const H = 594;
  let out = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" style="overflow:visible">
  <defs>
    <linearGradient id="bookshade${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
    <linearGradient id="pageshade${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
  </defs>
  <ellipse cx="85" cy="${H - 3}" rx="76" ry="6" fill="#000" opacity=".25"/>`;
  let y = H - 4; let books = '';
  while (y > 128) {
    const h = 15 + Math.floor(rnd() * 10);
    const w = 118 + Math.floor(rnd() * 26);
    const x = 14 + Math.floor(rnd() * (W - 28 - w));
    const pal = rnd();
    let c; let kind;
    if (pal < 0.2) { c = pick(LEATHER); kind = 'bands'; }
    else if (pal < 0.38) { c = '#5b5a3a'; kind = 'pattern'; }
    else { c = pick(CLOTH); kind = pick(['plain', 'label', 'stitch', 'plain', 'label']); }
    books += hbook(x, y - h, w, h, kind, c);
    y -= h;
  }
  out += books;
  if (top === 'fan') out += fanned(86, y);
  else out += trio(85, y);
  return out + '</svg>';
}


const LEFT = stack('fan', 5, 'L');
const RIGHT = stack('reader', 23, 'R');

export default function BookStacks() {
  return (
    <div className="book-stacks" aria-hidden="true">
      <div className="stack stack-left" dangerouslySetInnerHTML={{ __html: LEFT }} />
      <div className="stack stack-right" dangerouslySetInnerHTML={{ __html: RIGHT }} />
    </div>
  );
}
