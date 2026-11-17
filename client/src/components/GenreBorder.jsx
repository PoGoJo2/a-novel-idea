import FloralArt, { Sprig } from './FloralDecor.jsx';

// Ink-line artwork for the empty space at the left of each genre row, matching the genre:
// a magnifying glass, spyglass and footprints for mystery; a wizard hat, crystal ball and wand for
// fantasy; planets, a robot and a rocket for science fiction; a quill, books and a rose for classics.
// Other genres get flowers. The line color comes from the CSS variable --vine.

const Sparkle = ({ x, y, s = 1 }) => (
  <path d="M0 -8 Q1 -1 8 0 Q1 1 0 8 Q-1 1 -8 0 Q-1 -1 0 -8Z" transform={`translate(${x} ${y}) scale(${s})`} />
);
const Dot = ({ x, y, r = 1.2 }) => <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />;

const Footprint = ({ x, y, rot, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`}>
    <path d="M0 0 C-8 -3 -9 -18 -3 -27 C3 -34 10 -26 8 -14 C7 -6 6 -1 0 0Z" />
    <path d="M-5 6 C-6 13 5 15 6 8 C6 3 -5 2 -5 6Z" />
    <path d="M-4 -12 H5 M-5 -18 H4 M-3 -23 H3" strokeWidth="0.8" />
  </g>
);

function MysteryArt() {
  return (
    <g>
      {/* magnifying glass with a fingerprint under the lens */}
      <circle cx="104" cy="112" r="58" strokeWidth="3.4" />
      <circle cx="104" cy="112" r="50" strokeWidth="1" />
      <path d="M62 96 A44 44 0 0 1 88 70" strokeWidth="1.8" />
      <path d="M56 114 A48 48 0 0 1 58 102" strokeWidth="1.4" />
      {[5, 10, 15, 20, 25, 31, 37].map((r) => (
        <path key={r} d={`M${112 - r} 122 A${r} ${r * 1.25} 0 0 1 ${112 + r} 122 M${112 - r} 122 A${r} ${r * 1.1} 0 0 0 ${112 - r * 0.55} ${122 + r * 0.95}`} strokeWidth="0.9" />
      ))}
      <g transform="translate(104 112) rotate(45)">
        <rect x="58" y="-7" width="24" height="14" rx="2" />
        <path d="M86 -10 H136 Q148 -10 148 0 Q148 10 136 10 H86 Z" />
        <path d="M98 -10 V10 M110 -10 V10 M122 -10 V10" strokeWidth="0.9" />
      </g>

      {/* a brass spyglass */}
      <g transform="translate(24 300) rotate(-10)">
        <path d="M0 -7 H34 V7 H0 Z" />
        <path d="M6 -7 V7 M12 -7 V7" strokeWidth="0.9" />
        <path d="M34 -10 H86 V10 H34 Z" />
        <path d="M42 -10 V10 M78 -10 V10" strokeWidth="0.9" />
        <path d="M86 -14 H150 V14 H86 Z" />
        <path d="M94 -14 V14 M142 -14 V14" strokeWidth="0.9" />
        <path d="M150 -18 H164 V18 H150 Z" />
        <ellipse cx="164" cy="0" rx="5" ry="18" />
        <path d="M162 -10 Q160 -2 163 6" strokeWidth="1" />
      </g>

      {/* a trail of footprints */}
      {[[70, 376, -14, 0], [96, 396, -8, 1], [78, 428, -14, 0], [104, 450, -6, 1], [88, 482, -12, 0], [112, 504, -4, 1]].map(([x, y, rot, flip]) => (
        <Footprint key={`${x}-${y}`} x={x} y={y} rot={rot} flip={flip} />
      ))}
      <circle cx="160" cy="400" r="8" /><path d="M156 406 L153 422 H167 L164 406" />
      <Dot x={176} y={470} /><Dot x={186} y={484} /><Dot x={170} y={492} />
    </g>
  );
}

function FantasyArt() {
  return (
    <g>
      {/* crescent moon and stars */}
      <path d="M62 28 A24 24 0 1 0 84 64 A19 19 0 1 1 62 28 Z" />
      <Sparkle x={140} y={40} s={1.2} /><Sparkle x={178} y={84} s={0.9} /><Sparkle x={34} y={108} s={0.8} /><Sparkle x={128} y={100} s={0.7} />
      <Dot x={110} y={30} /><Dot x={190} y={50} /><Dot x={60} y={96} /><Dot x={170} y={118} />

      {/* wizard hat */}
      <g transform="translate(112 196)">
        <ellipse cx="0" cy="46" rx="64" ry="14" />
        <path d="M-38 44 C-32 8 -10 -34 14 -66 C20 -72 28 -64 22 -54 C10 -32 26 10 38 44" />
        <path d="M-35 28 Q0 40 36 28" />
        <rect x="-6" y="30" width="14" height="12" rx="2" />
        <path d="M-2 36 H4" />
        <Sparkle x={-8} y={4} s={0.7} /><Sparkle x={10} y={-20} s={0.6} /><Sparkle x={-18} y={-14} s={0.5} />
      </g>

      {/* crystal ball on a stand */}
      <g transform="translate(110 350)">
        <circle r="40" />
        <path d="M-28 6 C-18 -10 -6 -10 2 0 S22 8 30 -6" />
        <path d="M-22 18 C-12 8 0 10 8 18 S24 22 28 14" />
        <path d="M-26 -18 A32 32 0 0 1 -8 -32" strokeWidth="1.8" />
        <Sparkle x={16} y={-14} s={0.9} />
        <path d="M-30 40 L-40 56 H40 L30 40" />
        <path d="M-44 56 H44 V64 H-44Z" />
      </g>

      {/* potion flask and magic wand */}
      <g transform="translate(54 470)">
        <path d="M-6 -22 V-6 C-24 4 -26 30 -10 36 H10 C26 30 24 4 6 -6 V-22" />
        <path d="M-9 -22 H9" />
        <rect x="-6" y="-30" width="12" height="8" rx="2" />
        <path d="M-18 16 Q0 22 18 16" />
        <circle cx="-4" cy="4" r="2.5" /><circle cx="6" cy="-2" r="2" /><circle cx="2" cy="10" r="1.8" />
      </g>
      <g transform="translate(142 516) rotate(-52)">
        <rect x="0" y="-3.5" width="68" height="7" rx="3.5" />
        <path d="M10 -3.5 V3.5 M58 -3.5 V3.5" strokeWidth="0.9" />
      </g>
      <Sparkle x={196} y={456} s={1.4} /><Sparkle x={176} y={436} s={0.7} /><Sparkle x={208} y={476} s={0.6} />
    </g>
  );
}

function SciFiArt() {
  return (
    <g>
      {/* ringed planet */}
      <g transform="translate(110 88)">
        <circle r="36" />
        <path d="M-34 -10 Q0 -4 34 -12 M-36 8 Q0 18 36 6 M-28 24 Q0 30 28 22" strokeWidth="1" />
        <circle cx="-12" cy="-20" r="3" /><circle cx="16" cy="-22" r="2" />
        <ellipse cx="0" cy="0" rx="68" ry="14" transform="rotate(-18)" strokeWidth="1.8" />
        <ellipse cx="0" cy="0" rx="58" ry="11" transform="rotate(-18)" strokeWidth="0.7" />
      </g>
      <Sparkle x={182} y={36} s={0.9} /><Sparkle x={34} y={40} s={0.8} /><Sparkle x={190} y={150} s={0.7} /><Dot x={150} y={150} /><Dot x={70} y={150} /><Dot x={204} y={100} />
      <circle cx="30" cy="150" r="10" /><circle cx="27" cy="147" r="2" /><circle cx="34" cy="154" r="1.5" />

      {/* a friendly robot */}
      <g transform="translate(110 300)">
        <rect x="-26" y="-92" width="52" height="42" rx="8" />
        <path d="M0 -92 V-106" /><circle cx="0" cy="-110" r="4" />
        <circle cx="-11" cy="-72" r="7" /><circle cx="-11" cy="-72" r="2.4" fill="currentColor" />
        <circle cx="11" cy="-72" r="7" /><circle cx="11" cy="-72" r="2.4" fill="currentColor" />
        <path d="M-12 -58 H12 M-8 -62 V-54 M0 -62 V-54 M8 -62 V-54" strokeWidth="0.9" />
        <rect x="-34" y="-80" width="8" height="18" rx="2" /><rect x="26" y="-80" width="8" height="18" rx="2" />
        <path d="M-8 -50 V-44 M8 -50 V-44" />
        <rect x="-34" y="-44" width="68" height="72" rx="8" />
        <rect x="-20" y="-32" width="40" height="26" rx="4" />
        <circle cx="-10" cy="-19" r="3" /><circle cx="0" cy="-19" r="3" /><circle cx="10" cy="-19" r="3" />
        <path d="M-26 6 H26 M-26 14 H26" strokeWidth="0.9" />
        <rect x="-50" y="-40" width="12" height="48" rx="5" /><circle cx="-44" cy="14" r="7" />
        <rect x="38" y="-40" width="12" height="48" rx="5" /><circle cx="44" cy="14" r="7" />
        <rect x="-24" y="28" width="16" height="30" rx="3" /><rect x="8" y="28" width="16" height="30" rx="3" />
        <path d="M-30 58 H-4 V68 H-30Z M4 58 H30 V68 H4Z" />
      </g>

      {/* rocket and a red planet */}
      <g transform="translate(112 452) rotate(22)">
        <path d="M0 -46 C18 -30 18 14 12 32 H-12 C-18 14 -18 -30 0 -46Z" />
        <circle cx="0" cy="-14" r="8" /><circle cx="0" cy="-14" r="4" strokeWidth="0.8" />
        <path d="M-15 6 H15" />
        <path d="M-13 12 L-30 38 L-12 32 Z M13 12 L30 38 L12 32 Z" />
        <path d="M-7 32 Q0 62 7 32 M-3 32 Q0 48 3 32" />
      </g>
      <circle cx="176" cy="516" r="18" /><circle cx="170" cy="510" r="3.5" /><circle cx="182" cy="522" r="2.5" /><circle cx="178" cy="506" r="1.8" />
      <Sparkle x={40} y={500} s={0.8} /><Dot x={60} y={530} /><Dot x={30} y={540} /><Dot x={90} y={520} />
    </g>
  );
}

function ClassicsArt() {
  const barbs = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].flatMap((t, i) => {
    const px = 6 + 50 * t;
    const py = 18 - 100 * t;
    const len = 16 * (1 - Math.abs(t - 0.5) * 0.8);
    return [[-1, `L${(px + 0.45 * 8 - 0.9 * len).toFixed(1)} ${(py - 0.9 * 8 - 0.45 * len).toFixed(1)}`], [1, `L${(px + 0.45 * 8 + 0.9 * len).toFixed(1)} ${(py - 0.9 * 8 + 0.45 * len).toFixed(1)}`]].map(([side, d]) => (
      <path key={`${i}-${side}`} d={`M${px.toFixed(1)} ${py.toFixed(1)} ${d}`} strokeWidth="0.8" />
    ));
  });
  const book = (x, y, w, h) => (
    <g key={y}>
      <rect x={x} y={y} width={w} height={h} rx="3" />
      <path d={`M${x + 10} ${y} V${y + h} M${x + 14} ${y} V${y + h} M${x + w - 14} ${y} V${y + h} M${x + w - 10} ${y} V${y + h}`} strokeWidth="0.9" />
      <rect x={x + w / 2 - 22} y={y + 5} width="44" height={h - 10} rx="2" strokeWidth="0.9" />
    </g>
  );
  return (
    <g>
      {/* quill in an inkwell */}
      <g transform="translate(100 112)">
        <path d="M-26 26 V52 Q-26 62 -16 62 H16 Q26 62 26 52 V26 Z" />
        <path d="M-14 26 V18 H14 V26 M-18 18 H18" />
        <path d="M-20 40 Q0 46 20 40" strokeWidth="0.9" />
        <path d="M4 18 C-8 -14 10 -54 58 -84 C56 -46 38 -10 12 20 Z" />
        <path d="M6 18 L58 -82" />
        {barbs}
      </g>
      <Sparkle x={176} y={40} s={0.8} /><Dot x={30} y={50} /><Dot x={190} y={110} />

      {/* a stack of books with a bookmark and a rose */}
      <g transform="translate(110 296)">
        {book(-64, 34, 128, 26)}
        {book(-54, 8, 108, 26)}
        {book(-44, -16, 88, 24)}
        <path d="M40 34 V58 L45 52 L50 58 V34" />
        <g transform="translate(0 -34)">
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx="0" cy="-8" r="7" transform={`rotate(${a})`} />)}
          <circle r="7" /><path d="M0 0 c3 -3 7 0 5 4 c-2 4 -8 3 -8 -2" strokeWidth="0.9" />
          <path d="M-12 10 Q-22 18 -34 12" />
          <path d="M-22 15 C-24 8 -30 6 -34 8 C-32 14 -28 17 -22 15Z" />
        </g>
      </g>

      {/* laurel branches and scrolls */}
      <Sprig curve={[[26, 548], [70, 500], [130, 524], [194, 476]]} leaves={[0.12, 0.26, 0.4, 0.54, 0.68, 0.82, 0.96]} leafScale={1.05} />
      <Sprig curve={[[196, 548], [150, 516], [100, 530], [40, 482]]} leaves={[0.2, 0.36, 0.52, 0.68, 0.84]} leafScale={0.9} bud={false} />
      <path d="M110 520 c-14 -10 -30 0 -22 12 c6 8 18 2 14 -6 M110 520 c14 -10 30 0 22 12 c-6 8 -18 2 -14 -6" />
    </g>
  );
}

function RecommendedArt() {
  const star5 = (cx, cy, r) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + i * 36) * (Math.PI / 180);
      const rad = i % 2 === 0 ? r : r * 0.42;
      return `${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
    });
    return `M${pts.join(' L')} Z`;
  };
  return (
    <g>
      {/* an unrolled scroll with lines of writing and a wax seal */}
      <rect x="44" y="52" width="132" height="14" rx="7" />
      <path d="M54 66 H166 V132 H54" />
      <rect x="44" y="130" width="132" height="14" rx="7" />
      <path d="M52 59 q-6 7 0 14 M168 59 q6 7 0 14" strokeWidth="1" />
      <path d="M70 84 H150 M70 96 H150 M70 108 H138 M70 120 H112" strokeWidth="1.1" />
      <circle cx="148" cy="116" r="11" />
      <path d={star5(148, 116, 7)} strokeWidth="1" />
      <path d="M144 126 L140 150 L148 144 L154 152 L152 127" strokeWidth="1.2" />
      <path d={star5(50, 24, 11)} /><path d={star5(168, 30, 7)} strokeWidth="1.2" /><path d={star5(100, 180, 6)} strokeWidth="1.2" />
      <Sparkle x={26} y={96} s={0.8} /><Sparkle x={196} y={92} s={0.9} /><Dot x={120} y={20} /><Dot x={190} y={170} /><Dot x={28} y={160} />

      {/* a golden trophy cup */}
      <path d="M70 252 H150 V292 Q150 334 110 340 Q70 334 70 292 Z" strokeWidth="2.6" />
      <path d="M70 264 Q40 262 42 292 Q44 316 74 316 M150 264 Q180 262 178 292 Q176 316 146 316" />
      <path d="M110 340 V360 M96 360 H124" />
      <rect x="80" y="360" width="60" height="12" rx="2" />
      <rect x="68" y="372" width="84" height="12" rx="2" />
      <path d={star5(110, 294, 17)} strokeWidth="1.6" />
      <path d="M82 258 V300 Q84 322 100 330" strokeWidth="1" />
      <path d={star5(36, 244, 8)} strokeWidth="1.2" /><path d={star5(190, 238, 10)} strokeWidth="1.2" />
      <Sparkle x={26} y={348} s={0.9} /><Sparkle x={196} y={350} s={0.8} /><Dot x={190} y={392} /><Dot x={30} y={396} />

      {/* a prize rosette with ribbons, flanked by laurel branches */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i * 22.5) * (Math.PI / 180);
        return <circle key={i} cx={(110 + 31 * Math.cos(a)).toFixed(1)} cy={(452 + 31 * Math.sin(a)).toFixed(1)} r="7" strokeWidth="1.2" />;
      })}
      <circle cx="110" cy="452" r="26" /><circle cx="110" cy="452" r="18" strokeWidth="1" />
      <path d={star5(110, 452, 12)} strokeWidth="1.3" />
      <path d="M92 478 L80 540 L98 528 L108 548 L110 482 M128 478 L140 540 L122 528 L112 548 L110 482" strokeWidth="1.4" />
      <Sprig curve={[[40, 548], [28, 500], [38, 450], [64, 410]]} leaves={[0.15, 0.3, 0.45, 0.6, 0.75, 0.9]} leafScale={0.95} bud={false} />
      <Sprig curve={[[182, 548], [196, 500], [186, 450], [160, 410]]} leaves={[0.15, 0.3, 0.45, 0.6, 0.75, 0.9]} leafScale={0.95} bud={false} />
      <Sparkle x={110} y={410} s={0.9} />
    </g>
  );
}

const ARTS = { 'Top Recommended': RecommendedArt, Mystery: MysteryArt, Fantasy: FantasyArt, 'Science Fiction': SciFiArt, Classics: ClassicsArt };

// The artwork is cut into bands (y-ranges of the 220 x 560 drawing). The bands are spread down the full
// height of the row, so the border reaches the bottom of the section however tall the row is.
const BANDS = {
  Mystery: [[10, 240], [245, 340], [342, 525]],
  Fantasy: [[8, 262], [300, 420], [424, 548]],
  'Science Fiction': [[10, 180], [184, 380], [396, 550]],
  Classics: [[8, 190], [240, 365], [440, 558]],
  'Top Recommended': [[8, 195], [232, 390], [398, 556]],
};

// Which side of the row a border sits on. The right side is the left side mirrored with CSS.
export default function GenreBorder({ genre, side = 'left' }) {
  const Art = ARTS[genre];
  const bands = BANDS[genre];
  return (
    <div className={`genre-border ${side}`} aria-hidden="true">
      {Art && bands ? (
        <div className="gb-bands">
          {bands.map(([y0, y1]) => (
            <svg key={y0} className="gb-band" viewBox={`0 ${y0} 220 ${y1 - y0}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <Art />
            </svg>
          ))}
        </div>
      ) : (
        <FloralArt />
      )}
    </div>
  );
}

// An ink vine that grows out of the border, sways inward, and curls around the scroll arrow,
// so the arrow looks like part of the border. Drawn in the space beside the arrow.
export function ArrowVine({ side = 'left' }) {
  return (
    <svg className={`arrow-vine ${side}`} viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <g>
        <path vectorEffect="non-scaling-stroke" d="M70 0 C26 36 8 112 8 200 C8 288 26 364 70 400" />
        <path vectorEffect="non-scaling-stroke" d="M8 200 C30 200 50 200 78 200" />
        <path vectorEffect="non-scaling-stroke" d="M46 200 C50 188 60 184 66 190 M46 200 C50 212 60 216 66 210" />
        <path vectorEffect="non-scaling-stroke" d="M13 140 c-9 -3 -12 -12 -7 -18 c8 2 10 10 7 18 M13 260 c-9 3 -12 12 -7 18 c8 -2 10 -10 7 -18" />
        <path vectorEffect="non-scaling-stroke" d="M30 66 c-8 -5 -9 -14 -3 -19 c8 3 9 12 3 19 M30 334 c-8 5 -9 14 -3 19 c8 -3 9 -12 3 -19" />
        <path vectorEffect="non-scaling-stroke" d="M12 92 C22 96 28 104 26 112 M12 308 C22 304 28 296 26 288" />
      </g>
    </svg>
  );
}
