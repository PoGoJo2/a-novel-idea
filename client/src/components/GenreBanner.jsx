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
  const art = { Mystery: mystery, Fantasy: fantasy, Classics: classics, 'Science Fiction': scifi, 'Top Recommended': recommended }[genre] || waves;

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
        <h2 className="banner-title">{genre}</h2>
        <span className="banner-count">{count} {count === 1 ? 'reading group' : 'reading groups'}</span>
      </div>
    </div>
  );
}
