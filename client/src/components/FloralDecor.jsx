import { makeRng } from '../utils/color.js';

// Ink-line flower artwork, used as the border for genres that have no picture of their own: poppies, daisies,
// small wildflowers, leafy sprigs, and baby's-breath, drawn as fine outlines. The color comes from
// the CSS variable --vine (black in the light theme, cream in the dark theme).

// A point and direction at position t (0 to 1) along a curve
const along = ([p0, p1, p2, p3], t) => {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
};

export const Leaf = ({ x, y, angle, scale = 1 }) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${scale})`}>
    <path d="M0 0 C4 -5 12 -5 18 0 C12 5 4 5 0 0Z" />
    <path d="M2 0 H15" strokeWidth="0.6" />
  </g>
);

// A thin curved stem with leaves on alternating sides and a bud at the tip
export function Sprig({ curve, leaves, leafScale = 1, bud = true }) {
  const [p0, p1, p2, p3] = curve;
  const tip = along(curve, 1);
  return (
    <g>
      <path d={`M${p0} C${p1} ${p2} ${p3}`} />
      {leaves.map((t, i) => {
        const pt = along(curve, t);
        return <Leaf key={t} x={pt.x} y={pt.y} angle={pt.angle + (i % 2 ? 38 : -38)} scale={leafScale} />;
      })}
      {bud && <ellipse cx="0" cy="0" rx="4" ry="2.4" transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(${tip.angle.toFixed(1)})`} />}
    </g>
  );
}

// A big ruffled poppy seen from the front
export function Poppy({ x, y, scale = 1, turn = 0 }) {
  const petal = 'M0 0 C-30 -8 -42 -44 -16 -56 C0 -63 22 -56 30 -40 C42 -18 26 -4 0 0Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((a, i) => (
        <g key={a} transform={`rotate(${a}) scale(${1 - (i % 2) * 0.08})`}>
          <path d={petal} />
          <path d="M-4 -12 C-12 -24 -10 -38 -2 -46 M8 -14 C14 -26 14 -36 10 -44" strokeWidth="0.7" />
        </g>
      ))}
      <circle r="8" fill="currentColor" />
      <circle r="12" strokeWidth="0.8" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1="9" y1="0" x2="17" y2="0" strokeWidth="0.7" transform={`rotate(${i * 22.5})`} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={`d-${i}`} cx="19" cy="0" r="1.2" fill="currentColor" transform={`rotate(${i * 22.5 + 11})`} />
      ))}
    </g>
  );
}

// A daisy with many narrow petals
export function Daisy({ x, y, scale = 1, turn = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
      {Array.from({ length: 18 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 20})`}>
          <ellipse cx="0" cy="-27" rx="4.6" ry="15" />
          <path d="M0 -15 V-38" strokeWidth="0.5" />
        </g>
      ))}
      <circle r="11" />
      <circle r="6" strokeWidth="0.7" />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx="0" cy="-8.5" r="0.9" fill="currentColor" transform={`rotate(${i * 45})`} />
      ))}
    </g>
  );
}

// A small five-petal wildflower
export function Blossom({ x, y, scale = 1, turn = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx="0" cy="-8" r="6.5" transform={`rotate(${a})`} />
      ))}
      <circle r="3" />
      <circle r="1" fill="currentColor" />
    </g>
  );
}

// Tiny round flowers on hair-thin branches
export function Gypsophila({ x, y, spread = 34, seed = 1 }) {
  const rng = makeRng(seed);
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const angle = -150 + i * 34 + rng() * 10;
        const len = spread * (0.55 + rng() * 0.45);
        const ex = x + Math.cos((angle * Math.PI) / 180) * len;
        const ey = y + Math.sin((angle * Math.PI) / 180) * len;
        return (
          <g key={i}>
            <path d={`M${x} ${y} Q${(x + ex) / 2 + 3} ${(y + ey) / 2 - 3} ${ex.toFixed(1)} ${ey.toFixed(1)}`} strokeWidth="0.6" />
            <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r={1.4 + rng() * 1.1} />
          </g>
        );
      })}
    </g>
  );
}

export default function FloralArt() {
  return (
    <>
      <svg viewBox="0 0 220 680" preserveAspectRatio="xMinYMid meet" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {/* a fine vertical line with a break of three dots, like a picture frame */}
        <path d="M26 372 V428 M26 486 V566" strokeWidth="1" />
        <circle cx="26" cy="446" r="1.1" fill="currentColor" />
        <circle cx="26" cy="456" r="1.1" fill="currentColor" />
        <circle cx="26" cy="466" r="1.1" fill="currentColor" />
        <path d="M26 66 H74 M26 66 V108" strokeWidth="1" />

        {/* top bouquet */}
        <Sprig curve={[[112, 116], [140, 98], [170, 96], [208, 62]]} leaves={[0.2, 0.4, 0.6, 0.8]} leafScale={0.9} />
        <Sprig curve={[[62, 232], [50, 270], [38, 305], [28, 352]]} leaves={[0.25, 0.45, 0.65, 0.85]} />
        <Sprig curve={[[98, 204], [122, 220], [140, 240], [162, 276]]} leaves={[0.3, 0.55, 0.8]} leafScale={0.85} />
        <Gypsophila x={150} y={150} spread={36} seed={7} />
        <Gypsophila x={44} y={262} spread={26} seed={3} />
        <Poppy x={82} y={112} scale={1.05} turn={-10} />
        <Daisy x={62} y={192} scale={0.88} turn={8} />
        <Blossom x={22} y={158} scale={0.85} />
        <Blossom x={38} y={226} scale={0.7} turn={20} />
        <Blossom x={150} y={206} scale={0.6} turn={10} />

        {/* wildflowers along the line */}
        <Blossom x={42} y={398} scale={0.6} turn={15} />
        <Blossom x={44} y={508} scale={0.55} turn={30} />

        {/* bottom bouquet */}
        <g transform="translate(0 -190)">
          <Sprig curve={[[50, 706], [40, 670], [36, 630], [30, 575]]} leaves={[0.2, 0.4, 0.6, 0.8]} />
          <Sprig curve={[[112, 790], [140, 806], [172, 812], [206, 794]]} leaves={[0.25, 0.5, 0.75, 0.95]} leafScale={0.9} bud={false} />
          <Gypsophila x={62} y={700} spread={32} seed={11} />
          <Gypsophila x={112} y={720} spread={22} seed={5} />
          <Poppy x={76} y={772} scale={1.05} turn={6} />
          <Daisy x={160} y={776} scale={0.62} turn={-6} />
          <Blossom x={26} y={690} scale={0.8} />
          <Blossom x={56} y={640} scale={0.65} turn={30} />
          <Blossom x={22} y={750} scale={0.6} turn={12} />
          <path d="M206 794 c10 -4 15 4 9 8 c-5 3 -9 -2 -5 -5" strokeWidth="1" />
        </g>
      </svg>
    </>
  );
}
