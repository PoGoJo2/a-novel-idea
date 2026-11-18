import { useId } from 'react';
import { hash, makeRng, mix } from '../utils/color.js';

// A decorative banner for each genre row: artwork in the genre's colors with the genre name
// on a ribbon in the middle. Mystery has moonlight and rooftops, fantasy has mountains and a
// tower, classics has an ornate gold design, science fiction has a ringed planet.
const W = 800;
const H = 96;

const THEMES = {
  Mystery: { accent: '#22365c', ribbon: '#d8b25a' },
  Fantasy: { accent: '#4b3590', ribbon: '#d8b25a' },
  Classics: { accent: '#7a1f2e', ribbon: '#d8b25a' },
  'Science Fiction': { accent: '#1f5f78', ribbon: '#e8c46a' },
  'Top Recommended': { accent: '#6b2236', ribbon: '#f0cd6e' },
  Horror: { accent: '#4a1626', ribbon: '#c9b99a' },
  Romance: { accent: '#8a3454', ribbon: '#f0b6c8' },
  'Thriller / Action': { accent: '#7a2410', ribbon: '#f4b24a' },
  'True Crime': { accent: '#3c4350', ribbon: '#e8c52a' },
  Autobiography: { accent: '#7a5330', ribbon: '#e0c08a' },
  'Self Help / Personal Development': { accent: '#1f7a6e', ribbon: '#f4d58a' },
};
const FALLBACK = { accent: '#2d5a52', ribbon: '#e8c46a' };

const stars = (c, count, maxY) =>
  Array.from({ length: count }, (_, i) => (
    <circle key={`s-${i}`} cx={c.rr(6, W - 6)} cy={c.rr(6, maxY)} r={c.rr(0.7, 1.9)} fill={i % 6 === 0 ? c.ribbon : c.pale} opacity={c.rr(0.5, 0.95)} />
  ));

const ridge = (c, base, amp) => {
  let d = `M0 ${H} L0 ${base}`;
  for (let x = 40; x <= W; x += 40) d += ` L${x} ${(base - c.rr(-amp * 0.4, amp)).toFixed(1)}`;
  return `${d} L${W} ${H} Z`;
};

function mystery(c) {
  let x = 0;
  let d = `M0 ${H}`;
  const windows = [];
  while (x < W) {
    const w = c.rr(22, 46);
    const top = H - c.rr(14, 34);
    d += ` L${x.toFixed(1)} ${top.toFixed(1)}`;
    if (c.rr(0, 1) > 0.5) d += ` L${(x + w / 2).toFixed(1)} ${(top - 12).toFixed(1)}`;
    d += ` L${(x + w).toFixed(1)} ${top.toFixed(1)}`;
    if (c.rr(0, 1) > 0.6) windows.push([x + w / 2 - 2, top + 7]);
    x += w;
  }
  d += ` L${W} ${H} Z`;
  return (
    <>
      {stars(c, 26, 40)}
      <g filter={c.shadow}><circle cx="120" cy="34" r="20" fill={c.pale} /></g>
      <circle cx="129" cy="29" r="17" fill={c.deep} opacity="0.55" />
      <ellipse cx="400" cy="70" rx="470" ry="9" fill={c.pale} opacity="0.12" />
      <ellipse cx="300" cy="80" rx="400" ry="8" fill={c.pale} opacity="0.09" />
      <g filter={c.shadow}><path d={d} fill={c.dark} /></g>
      {windows.map(([wx, wy]) => <rect key={`w-${wx}`} x={wx} y={wy} width="4" height="6" fill={c.ribbon} />)}
    </>
  );
}

function fantasy(c) {
  return (
    <>
      {stars(c, 34, 50)}
      <circle cx="702" cy="28" r="15" fill={c.ribbon} opacity="0.85" />
      <path d={ridge(c, 62, 30)} fill={c.light} opacity="0.4" />
      <path d={ridge(c, 74, 26)} fill={mix(c.accent, '#000000', 0.25)} />
      <g filter={c.shadow}>
        <rect x="176" y="50" width="14" height="46" fill={c.dark} />
        <path d="M173 50 L183 28 L193 50 Z" fill={c.dark} />
        <rect x="180" y="62" width="4" height="7" fill={c.ribbon} />
        <path d={ridge(c, 86, 14)} fill={c.dark} />
      </g>
    </>
  );
}

function classics(c) {
  const rosette = (cx) => (
    <g key={`r-${cx}`} filter={c.shadow}>
      <circle cx={cx} cy="48" r="28" fill={c.deep} stroke={c.ribbon} strokeWidth="1.3" />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={`p-${cx}-${i}`} cx={cx} cy="34" rx="4.5" ry="11" fill={c.pale} opacity="0.8" transform={`rotate(${45 * i} ${cx} 48)`} />
      ))}
      <circle cx={cx} cy="48" r="6" fill={c.ribbon} />
    </g>
  );
  const flourish = (x1, x2) => (
    <g key={`f-${x1}`} stroke={c.ribbon} fill={c.ribbon}>
      <line x1={x1} y1="48" x2={x2} y2="48" strokeWidth="1" />
      <path d={`M${(x1 + x2) / 2 - 5} 48 l5 -5 l5 5 l-5 5 Z`} stroke="none" />
    </g>
  );
  return (
    <>
      <line x1="0" y1="9" x2={W} y2="9" stroke={c.ribbon} strokeWidth="1" opacity="0.8" />
      <line x1="0" y1="13" x2={W} y2="13" stroke={c.ribbon} strokeWidth="0.5" opacity="0.7" />
      <line x1="0" y1="83" x2={W} y2="83" stroke={c.ribbon} strokeWidth="1" opacity="0.8" />
      <line x1="0" y1="87" x2={W} y2="87" stroke={c.ribbon} strokeWidth="0.5" opacity="0.7" />
      {rosette(90)}
      {rosette(710)}
      {flourish(135, 300)}
      {flourish(500, 665)}
    </>
  );
}

function scifi(c, uid) {
  return (
    <>
      <defs>
        <radialGradient id={`planet-${uid}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={c.pale} />
          <stop offset="0.55" stopColor={c.light} />
          <stop offset="1" stopColor={c.dark} />
        </radialGradient>
      </defs>
      {stars(c, 44, 90)}
      <ellipse cx="400" cy="52" rx="380" ry="30" fill="none" stroke={c.pale} strokeWidth="0.7" opacity="0.3" transform="rotate(-4 400 52)" />
      <circle cx="140" cy="58" r="10" fill={c.light} opacity="0.75" />
      <ellipse cx="690" cy="48" rx="54" ry="13" fill="none" stroke={c.ribbon} strokeWidth="2.5" transform="rotate(-18 690 48)" />
      <g filter={c.shadow}><circle cx="690" cy="48" r="29" fill={`url(#planet-${uid})`} /></g>
      <path d="M636 48 A54 13 0 0 0 744 48" fill="none" stroke={c.ribbon} strokeWidth="2.5" transform="rotate(-18 690 48)" />
    </>
  );
}

function recommended(c) {
  const star = (cx, cy, r) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + i * 36) * (Math.PI / 180);
      const rad = i % 2 === 0 ? r : r * 0.42;
      return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
    });
    return pts.join(' ');
  };
  const big = [[90, 48, 20], [168, 30, 11], [236, 62, 8], [560, 62, 8], [632, 30, 11], [710, 48, 20]];
  return (
    <>
      {stars(c, 30, 88)}
      <line x1="0" y1="9" x2={W} y2="9" stroke={c.ribbon} strokeWidth="1" opacity="0.8" />
      <line x1="0" y1="87" x2={W} y2="87" stroke={c.ribbon} strokeWidth="1" opacity="0.8" />
      {big.map(([cx, cy, r]) => (
        <g key={`st-${cx}`} filter={c.shadow}><polygon points={star(cx, cy, r)} fill={c.ribbon} stroke={c.dark} strokeWidth="0.8" /></g>
      ))}
    </>
  );
}


const skyline = (c, xs, color) =>
  xs.map(([x, w, h]) => <rect key={`sk-${x}`} x={x} y={H - h} width={w} height={h} fill={color} />);

function horror(c) {
  const stone = (x) => <path key={`t-${x}`} d={`M${x} ${H} v-20 a8 8 0 0 1 16 0 v20z`} fill={c.dark} />;
  const bat = (x, y) => <path key={`b-${x}`} d={`M${x} ${y} q8 -12 16 -2 q8 -10 16 2 q-16 -4 -16 6 q0 -10 -16 -6z`} fill={c.dark} />;
  return (
    <>
      {stars(c, 14, 40)}
      <g filter={c.shadow}><circle cx="130" cy="36" r="19" fill={c.pale} opacity="0.9" /></g>
      <circle cx="137" cy="31" r="16" fill={c.deep} opacity="0.4" />
      {[60, 210, 250, 560, 610, 660, 720].map(stone)}
      <path d="M690 96 V50 M690 62 L674 46 M690 72 L708 54 M690 56 L700 40" stroke={c.dark} strokeWidth="4" fill="none" />
      {bat(520, 24)}{bat(580, 40)}{bat(300, 18)}
      <path d={ridge(c, 90, 6)} fill={c.dark} />
    </>
  );
}

function romance(c) {
  const heart = (x, y, r, o) => (
    <path key={`h-${x}`} d={`M${x} ${y + r} c-${r * 2} -${r * 1.4} -${r * 0.9} -${r * 2.4} 0 -${r * 1.1} c${r * 0.9} -${r * 1.3} ${r * 2} -${r * 0.3} 0 ${r * 2.5}z`} fill={c.ribbon} opacity={o} />
  );
  return (
    <>
      <g filter={c.shadow}><circle cx="120" cy="40" r="20" fill={c.pale} opacity="0.55" /></g>
      {[[190, 56, 7, 0.8], [250, 30, 5, 0.7], [320, 70, 6, 0.6], [520, 28, 6, 0.8], [590, 62, 8, 0.8], [660, 34, 5, 0.7], [740, 60, 7, 0.8], [90, 72, 5, 0.7]].map(([x, y, r, o]) => heart(x, y, r, o))}
      <path d="M0 96 Q100 66 200 82 T400 80 T600 78 T800 82 V96Z" fill={c.dark} opacity="0.6" />
    </>
  );
}

function thriller(c) {
  return (
    <>
      <circle cx="700" cy="50" r="40" fill={c.ribbon} opacity="0.18" />
      <g filter={c.shadow}><circle cx="700" cy="50" r="22" fill="#e0661f" /><circle cx="700" cy="50" r="13" fill={c.ribbon} /></g>
      {skyline(c, [[40, 22, 44], [66, 16, 60], [86, 26, 36], [116, 18, 52], [150, 24, 30], [600, 20, 40], [624, 26, 56], [654, 16, 34], [744, 22, 46], [770, 26, 30]], c.dark)}
      <path d="M180 8 L160 46 h14 l-8 30 L204 34 h-14 z" fill={c.ribbon} opacity="0.95" />
      <path d="M140 74 l30 -6 M96 80 h24" stroke={c.ribbon} strokeWidth="1.4" opacity="0.7" />
    </>
  );
}

function trueCrime(c) {
  return (
    <>
      {skyline(c, [[40, 22, 44], [66, 18, 60], [88, 26, 36], [118, 20, 52], [150, 24, 30], [610, 20, 42], [634, 26, 58], [664, 18, 34], [700, 22, 48], [728, 26, 30]], c.dark)}
      {Array.from({ length: 22 }, (_, i) => <path key={`tape-${i}`} d={`M${i * 40 - 10} ${H - 8} l14 -14 h14 l-14 14z`} fill={c.ribbon} />)}
      <rect x="0" y={H - 20} width={W} height="2" fill={c.ribbon} /><rect x="0" y={H - 4} width={W} height="2" fill={c.ribbon} />
      <circle cx="560" cy="26" r="6" fill="#d83a3a" /><circle cx="560" cy="26" r="14" fill="#d83a3a" opacity="0.25" />
      {stars(c, 8, 30)}
    </>
  );
}

function autobiography(c) {
  const frame = (x, w, h) => (
    <g key={`fr-${x}`} filter={c.shadow}>
      <rect x={x} y="14" width={w} height={h} fill={c.deep} stroke={c.ribbon} strokeWidth="1.5" />
      <circle cx={x + w / 2} cy={14 + h * 0.4} r={w * 0.17} fill={c.light} opacity="0.8" />
      <path d={`M${x + w * 0.18} ${14 + h - 4} q${w * 0.32} -${h * 0.42} ${w * 0.64} 0z`} fill={c.light} opacity="0.8" />
    </g>
  );
  return (
    <>
      {frame(110, 30, 42)}{frame(160, 24, 32)}{frame(640, 30, 42)}{frame(600, 24, 32)}
      <path d="M0 96 Q200 60 400 82 T800 70 V96Z" fill={c.dark} opacity="0.75" />
      <path d="M320 96 L380 70 M420 96 L480 72" stroke={c.ribbon} strokeWidth="1.2" opacity="0.5" />
    </>
  );
}

function selfHelp(c) {
  return (
    <>
      <circle cx="690" cy="62" r="40" fill={c.ribbon} opacity="0.25" />
      <g filter={c.shadow}><circle cx="690" cy="62" r="22" fill={c.ribbon} /></g>
      <path d="M0 96 Q80 54 170 70 Q240 82 320 64 Q400 46 480 72 Q560 88 640 66 Q720 46 800 74 V96Z" fill={mix(c.accent, '#000000', 0.25)} />
      <path d="M0 96 Q120 74 240 88 Q380 100 520 84 Q660 70 800 90 V96Z" fill={c.dark} />
      <path d="M150 44 l6 -10 l6 10 M150 44 v18" stroke={c.pale} strokeWidth="1.4" fill="none" opacity="0.8" />
    </>
  );
}

function waves(c) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <path key={`w-${i}`} d={`M0 ${44 + i * 14} Q100 ${24 + i * 14} 200 ${44 + i * 14} T400 ${44 + i * 14} T600 ${44 + i * 14} T800 ${44 + i * 14}`} fill="none" stroke={c.pale} strokeWidth="3" opacity={0.5 - i * 0.12} />
      ))}
      {[120, 690].map((x) => <g key={`b-${x}`} filter={c.shadow}><circle cx={x} cy="40" r="22" fill={c.pale} opacity="0.4" /></g>)}
    </>
  );
}

export default function GenreBanner({ genre, count }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const theme = THEMES[genre] || FALLBACK;
  const rng = makeRng(hash(`banner-${genre}`));
  const c = {
    accent: theme.accent,
    ribbon: theme.ribbon,
    dark: mix(theme.accent, '#000000', 0.6),
    deep: mix(theme.accent, '#000000', 0.35),
    light: mix(theme.accent, '#ffffff', 0.5),
    pale: mix(theme.accent, '#ffffff', 0.8),
    rr: (min, max) => min + rng() * (max - min),
    shadow: `url(#shadow-${uid})`,
  };
  const art = { Mystery: mystery, Fantasy: fantasy, Classics: classics, 'Science Fiction': scifi, 'Top Recommended': recommended, Horror: horror, Romance: romance, 'Thriller / Action': thriller, 'True Crime': trueCrime, Autobiography: autobiography, 'Self Help / Personal Development': selfHelp }[genre] || waves;

  return (
    <div className="genre-banner">
      <svg className="banner-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c.dark} />
            <stop offset="0.5" stopColor={c.accent} />
            <stop offset="1" stopColor={c.dark} />
          </linearGradient>
          <filter id={`shadow-${uid}`} x="-30%" y="-30%" width="170%" height="170%">
            <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>
        <rect width={W} height={H} fill={`url(#bg-${uid})`} />
        {art(c, uid)}
      </svg>
      <div className="banner-plate">
        <h2 className={`banner-title${genre.length > 20 ? " is-long" : ""}`}>{genre}</h2>
        <span className="banner-count">{count} {count === 1 ? 'reading group' : 'reading groups'}</span>
      </div>
    </div>
  );
}
