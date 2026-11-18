import { hash, isHex, makeRng, mix } from '../utils/color.js';

// Abstract artwork for a book cover, drawn in SVG. Every book gets its own picture (the same
// book always looks the same), tinted with its accent color, with soft drop shadows on the shapes.
// The picture depends on the genre: moon and fog (mystery), mountains and stars (fantasy),
// an ornate medallion (classics), a ringed planet (science fiction), or overlapping shapes.
const W = 200;
const H = 300;

const stars = (c, count, maxY) =>
  Array.from({ length: count }, (_, i) => (
    <circle key={`star-${i}`} cx={c.rr(8, 192)} cy={c.rr(10, maxY)} r={c.rr(0.7, 2)} fill={i % 5 === 0 ? c.ribbon : c.pale} opacity={c.rr(0.5, 0.95)} />
  ));

const ridge = (c, baseY, amp, steps = 7) => {
  let d = `M0 ${H} L0 ${baseY}`;
  for (let i = 1; i <= steps; i += 1) d += ` L${(W / steps) * i} ${baseY - c.rr(-amp * 0.4, amp)}`;
  return `${d} L${W} ${H} Z`;
};

function mystery(c) {
  const cx = c.rr(70, 130);
  const cy = c.rr(62, 88);
  const r = c.rr(30, 42);
  const dx = c.rr(-12, 12);
  return (
    <>
      <g filter={c.shadow}><circle cx={cx} cy={cy} r={r} fill={c.pale} /></g>
      <circle cx={cx + r * 0.35} cy={cy - r * 0.2} r={r * 0.85} fill={c.deep} opacity="0.5" />
      {[0, 1, 2].map((i) => (
        <ellipse key={`fog-${i}`} cx={100 + (i - 1) * 14} cy={122 + i * 20} rx="120" ry={8 + i * 2} fill={c.pale} opacity={0.12 + 0.05 * i} />
      ))}
      <g filter={c.shadow} fill={c.dark} transform={`translate(${dx} 0)`}>
        <path d="M-10 196 V156 H14 V132 L26 114 L38 132 V152 H82 V138 H94 L106 122 L118 138 V152 H150 V126 L162 110 L174 126 V156 H210 V196 Z" />
      </g>
      <rect x={20 + dx} y="138" width="5" height="8" fill={c.ribbon} />
      <rect x={100 + dx} y="142" width="5" height="8" fill={c.ribbon} opacity="0.85" />
      <rect x={160 + dx} y="132" width="5" height="8" fill={c.ribbon} />
      {stars(c, 8, 50)}
    </>
  );
}

function fantasy(c) {
  const tx = c.rr(110, 150);
  return (
    <>
      {stars(c, 16, 100)}
      <circle cx={c.rr(130, 170)} cy={c.rr(30, 52)} r={c.rr(12, 18)} fill={c.ribbon} opacity="0.85" />
      <path d={ridge(c, 150, 38)} fill={c.light} opacity="0.45" />
      <path d={ridge(c, 168, 34)} fill={mix(c.accent, '#000000', 0.25)} />
      <g filter={c.shadow}>
        <rect x={tx} y="128" width="16" height="42" fill={c.dark} />
        <path d={`M${tx - 3} 128 L${tx + 8} 104 L${tx + 19} 128 Z`} fill={c.dark} />
        <rect x={tx + 5} y="140" width="5" height="8" fill={c.ribbon} />
      </g>
      <g filter={c.shadow}><path d={ridge(c, 190, 30)} fill={c.dark} /></g>
    </>
  );
}

function classics(c) {
  const petals = 6 + 2 * Math.floor(c.rr(0, 3));
  return (
    <>
      <rect x="14" y="14" width="172" height="160" fill="none" stroke={c.ribbon} strokeWidth="1.3" />
      <rect x="20" y="20" width="160" height="148" fill="none" stroke={c.ribbon} strokeWidth="0.6" />
      {[[14, 14], [186, 14], [14, 174], [186, 174]].map(([x, y]) => (
        <circle key={`corner-${x}-${y}`} cx={x} cy={y} r="3" fill={c.ribbon} />
      ))}
      <g filter={c.shadow}>
        <circle cx="100" cy="94" r="44" fill={c.deep} stroke={c.ribbon} strokeWidth="1.2" />
        <circle cx="100" cy="94" r="35" fill="none" stroke={c.pale} strokeWidth="0.8" />
        {Array.from({ length: petals }, (_, i) => (
          <ellipse key={`petal-${i}`} cx="100" cy="71" rx="6.5" ry="16" fill={c.pale} opacity="0.8" transform={`rotate(${(360 / petals) * i} 100 94)`} />
        ))}
        <circle cx="100" cy="94" r="9" fill={c.ribbon} />
      </g>
    </>
  );
}

function scifi(c, uid) {
  const px = c.rr(78, 122);
  const py = c.rr(80, 104);
  const r = c.rr(34, 46);
  const tilt = c.rr(-26, -12);
  return (
    <>
      <defs>
        <radialGradient id={`planet-${uid}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={c.pale} />
          <stop offset="0.55" stopColor={c.light} />
          <stop offset="1" stopColor={c.dark} />
        </radialGradient>
      </defs>
      {stars(c, 24, 190)}
      <ellipse cx="100" cy={py} rx="92" ry="26" fill="none" stroke={c.pale} strokeWidth="0.7" opacity="0.4" transform={`rotate(${tilt + 40} 100 ${py})`} />
      <ellipse cx={px} cy={py} rx={r * 1.8} ry={r * 0.42} fill="none" stroke={c.ribbon} strokeWidth="3" opacity="0.9" transform={`rotate(${tilt} ${px} ${py})`} />
      <g filter={c.shadow}><circle cx={px} cy={py} r={r} fill={`url(#planet-${uid})`} /></g>
      <path d={`M${px - r * 1.8} ${py} A${r * 1.8} ${r * 0.42} 0 0 0 ${px + r * 1.8} ${py}`} fill="none" stroke={c.ribbon} strokeWidth="3" transform={`rotate(${tilt} ${px} ${py})`} />
      <circle cx={c.rr(20, 60)} cy={c.rr(150, 185)} r="9" fill={c.light} opacity="0.7" />
    </>
  );
}


function horror(c) {
  return (
    <>
      {stars(c, 14, 70)}
      <g filter={c.shadow}><circle cx="120" cy="62" r="26" fill={c.pale} opacity="0.9" /></g>
      <circle cx="130" cy="55" r="22" fill={c.deep} opacity="0.45" />
      <path d="M30 80 q8 -14 16 -2 q8 -12 16 2 q-16 -4 -16 8 q0 -10 -16 -6z" fill={c.dark} />
      <path d="M0 215 Q60 180 120 198 T200 190 V300 H0Z" fill={c.dark} />
      {[26, 70, 120, 160].map((x, i) => (
        <path key={`g-${x}`} d={`M${x} 250 v-${30 - i * 3} a10 10 0 0 1 20 0 v${30 - i * 3}z`} fill={c.deep} />
      ))}
      <path d="M176 230 V170 M176 190 L158 172 M176 204 L196 184" stroke={c.dark} strokeWidth="5" fill="none" />
    </>
  );
}

function romance(c) {
  const heart = (x, y, r, o) => (
    <path key={`h-${x}-${y}`} d={`M${x} ${y + r} c-${r * 2} -${r * 1.4} -${r * 0.9} -${r * 2.4} 0 -${r * 1.1} c${r * 0.9} -${r * 1.3} ${r * 2} -${r * 0.3} 0 ${r * 2.5}z`} fill={c.pale} opacity={o} />
  );
  return (
    <>
      <g filter={c.shadow}><circle cx="100" cy="100" r="34" fill={c.light} opacity="0.5" /></g>
      {[[100, 92, 18, 0.9], [44, 50, 8, 0.7], [160, 46, 10, 0.7], [152, 140, 7, 0.6], [40, 146, 9, 0.6], [100, 34, 6, 0.6]].map(([x, y, r, o]) => heart(x, y, r, o))}
      <path d="M0 200 Q50 176 100 194 T200 186 V300 H0Z" fill={c.dark} opacity="0.7" />
    </>
  );
}

function thriller(c) {
  return (
    <>
      <circle cx="100" cy="92" r="54" fill={c.ribbon} opacity="0.18" />
      <g filter={c.shadow}><circle cx="100" cy="92" r="26" fill={c.ribbon} opacity="0.9" /></g>
      <path d="M112 20 L78 98 h26 l-14 62 L138 78 h-26 z" fill={c.pale} opacity="0.9" />
      {[[0, 26, 70], [26, 20, 96], [46, 30, 60], [138, 24, 80], [162, 38, 104]].map(([x, w, h]) => (
        <rect key={`b-${x}`} x={x} y={230 - h + 20} width={w} height={h + 60} fill={c.dark} />
      ))}
    </>
  );
}

function trueCrime(c) {
  return (
    <>
      {stars(c, 8, 60)}
      {[[0, 28, 100], [28, 20, 130], [48, 34, 84], [134, 26, 120], [160, 40, 90]].map(([x, w, h]) => (
        <rect key={`b-${x}`} x={x} y={250 - h} width={w} height={h + 60} fill={c.dark} />
      ))}
      <g transform="rotate(-8 100 120)">
        <rect x="-10" y="106" width="220" height="22" fill={c.ribbon} />
        {Array.from({ length: 9 }, (_, i) => <path key={`t-${i}`} d={`M${i * 28 - 8} 128 l14 -22 h12 l-14 22z`} fill="#1a1a1a" />)}
      </g>
      <circle cx="100" cy="46" r="7" fill="#d83a3a" /><circle cx="100" cy="46" r="18" fill="#d83a3a" opacity="0.25" />
    </>
  );
}

function autobiography(c) {
  return (
    <>
      <g filter={c.shadow}>
        <rect x="52" y="40" width="96" height="124" fill={c.deep} stroke={c.ribbon} strokeWidth="3" />
        <rect x="62" y="50" width="76" height="104" fill="none" stroke={c.ribbon} strokeWidth="1" opacity="0.8" />
        <circle cx="100" cy="92" r="18" fill={c.light} opacity="0.85" />
        <path d="M68 154 q32 -46 64 0z" fill={c.light} opacity="0.85" />
      </g>
      <path d="M0 230 Q60 196 120 214 T200 206 V300 H0Z" fill={c.dark} opacity="0.8" />
      <path d="M70 300 L96 214 M130 300 L110 214" stroke={c.ribbon} strokeWidth="1.5" opacity="0.5" />
    </>
  );
}

function selfHelp(c) {
  return (
    <>
      <circle cx="100" cy="150" r="62" fill={c.ribbon} opacity="0.22" />
      <g filter={c.shadow}><circle cx="100" cy="150" r="34" fill={c.ribbon} /></g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30) * (Math.PI / 180);
        return <path key={`r-${i}`} d={`M${100 + 44 * Math.cos(a)} ${150 + 44 * Math.sin(a)} L${100 + 58 * Math.cos(a)} ${150 + 58 * Math.sin(a)}`} stroke={c.ribbon} strokeWidth="3" opacity="0.7" />;
      })}
      <path d="M0 210 Q50 160 110 190 Q160 210 200 176 V300 H0Z" fill={c.deep} />
      <path d="M0 250 Q80 214 200 244 V300 H0Z" fill={c.dark} />
      <path d="M142 186 v-18 M142 168 l12 4 l-12 4" stroke={c.pale} strokeWidth="2" fill="none" />
    </>
  );
}

function abstractShapes(c) {
  const tints = [c.pale, c.light, c.ribbon, c.pale];
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <g key={`blob-${i}`} filter={c.shadow}>
          <circle cx={c.rr(40, 160)} cy={c.rr(50, 150)} r={c.rr(24, 48)} fill={tints[i]} opacity={c.rr(0.35, 0.65)} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <path key={`wave-${i}`} d={`M0 ${150 + i * 16} Q50 ${130 + i * 16} 100 ${150 + i * 16} T200 ${150 + i * 16}`} fill="none" stroke={c.pale} strokeWidth="3" opacity={0.55 - i * 0.12} />
      ))}
    </>
  );
}

export default function CoverArt({ book, uid }) {
  const accent = isHex(book.accentColors?.accent) ? book.accentColors.accent : '#22365c';
  const ribbon = isHex(book.accentColors?.ribbon) ? book.accentColors.ribbon : '#d8b25a';
  const rng = makeRng(hash(`${book.id || ''}${book.title}`));
  const c = {
    accent,
    ribbon,
    dark: mix(accent, '#000000', 0.6),
    deep: mix(accent, '#000000', 0.35),
    light: mix(accent, '#ffffff', 0.5),
    pale: mix(accent, '#ffffff', 0.8),
    rr: (min, max) => min + rng() * (max - min),
    shadow: `url(#shadow-${uid})`,
  };

  const art = { Mystery: mystery, Fantasy: fantasy, Classics: classics, 'Science Fiction': scifi, Horror: horror, Romance: romance, 'Thriller / Action': thriller, 'True Crime': trueCrime, Autobiography: autobiography, 'Self Help / Personal Development': selfHelp }[book.genre] || abstractShapes;

  return (
    <>
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.dark} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.72" />
        </linearGradient>
        <filter id={`shadow-${uid}`} x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.42" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#bg-${uid})`} />
      {art(c, uid)}
      <rect y="170" width={W} height="130" fill={`url(#fade-${uid})`} />
      <path d={`M0 0 L${W} 0 L${W} 46 L0 130 Z`} fill="#ffffff" opacity="0.05" />
    </>
  );
}
