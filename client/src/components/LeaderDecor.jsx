// Ink-line drawings for the empty space beside the Leader page: a chalkboard, an apple on books, a graduation cap,
// a megaphone, a lightbulb, speech bubbles, a trophy, balloons, a pencil and stars. Line color comes from --vine,
// like the genre borders and the Administrator tools.

const Chalkboard = () => (
  <g>
    <rect x="12" y="14" width="76" height="52" rx="3" />
    <rect x="17" y="19" width="66" height="42" rx="1.5" strokeWidth="1.2" />
    <path d="M26 32 l6 -8 l6 8 M28 29 h8 M46 26 h26 M46 34 h20 M26 46 h12 M44 46 h28 M26 54 h22" strokeWidth="1.6" />
    <path d="M22 66 v22 M78 66 v22 M12 88 h12 M76 88 h12" />
    <path d="M30 72 h14" strokeWidth="3" />
  </g>
);

const AppleOnBooks = () => (
  <g>
    <rect x="14" y="68" width="72" height="12" rx="2" />
    <rect x="20" y="80" width="62" height="11" rx="2" />
    <path d="M24 68 v12 M78 80 v11" strokeWidth="1.2" />
    <path d="M50 66 c-18 4 -24 -14 -12 -24 c6 -4 10 0 12 2 c2 -2 6 -6 12 -2 c12 10 6 28 -12 24z" />
    <path d="M50 44 c0 -8 2 -12 6 -16 M52 34 c6 -6 12 -4 14 -2 c-4 6 -10 6 -14 2z" />
  </g>
);

const GradCap = () => (
  <g>
    <path d="M50 22 L92 40 L50 58 L8 40z" />
    <path d="M28 50 v16 c8 8 36 8 44 0 v-16" />
    <path d="M86 43 v24" />
    <circle cx="86" cy="70" r="3.2" />
    <path d="M83 73 l-3 12 M86 73 v12 M89 73 l3 12" strokeWidth="1.4" />
  </g>
);

const Megaphone = () => (
  <g transform="rotate(-12 50 50)">
    <path d="M18 38 h14 l40 -20 v64 l-40 -20 h-14z" />
    <path d="M28 58 l6 24 h12 l-6 -24" />
    <path d="M78 34 q10 16 0 32 M86 26 q16 24 0 48" strokeWidth="1.6" />
  </g>
);

const Lightbulb = () => (
  <g>
    <path d="M50 10 c-18 0 -28 12 -28 26 c0 10 6 16 12 22 c3 3 4 6 4 10 h24 c0 -4 1 -7 4 -10 c6 -6 12 -12 12 -22 c0 -14 -10 -26 -28 -26z" />
    <path d="M38 74 h24 M40 82 h20 M44 90 h12" />
    <path d="M42 56 l8 -14 l8 14 M42 56 h16" strokeWidth="1.4" />
    <path d="M8 30 l8 4 M92 30 l-8 4 M50 0 v0 M14 12 l6 6 M86 12 l-6 6" strokeWidth="1.6" />
  </g>
);

const Bubbles = () => (
  <g>
    <path d="M10 16 h50 q8 0 8 8 v22 q0 8 -8 8 h-30 l-14 12 v-12 h-6 q-8 0 -8 -8 v-22 q0 -8 8 -8z" />
    <path d="M22 28 h30 M22 38 h20" strokeWidth="1.6" />
    <path d="M44 62 h40 q8 0 8 8 v14 q0 8 -8 8 h-4 v10 l-12 -10 h-24 q-8 0 -8 -8 v-14 q0 -8 8 -8z" transform="translate(0 -8)" />
    <circle cx="56" cy="74" r="2" /><circle cx="66" cy="74" r="2" /><circle cx="76" cy="74" r="2" />
  </g>
);

const Trophy = () => (
  <g>
    <path d="M30 12 h40 v22 c0 14 -8 22 -20 22 s-20 -8 -20 -22z" />
    <path d="M30 18 h-14 c0 14 4 22 16 24 M70 18 h14 c0 14 -4 22 -16 24" />
    <path d="M50 56 v14 M36 86 h28 M40 70 h20 v16 h-20z" />
    <path d="M50 22 l3 7 l7 1 l-5 5 l1 7 l-6 -4 l-6 4 l1 -7 l-5 -5 l7 -1z" strokeWidth="1.4" />
  </g>
);

const Balloons = () => (
  <g>
    <ellipse cx="34" cy="32" rx="18" ry="22" /><path d="M34 54 l-3 5 h6z M34 59 c-6 10 6 16 0 28" />
    <ellipse cx="66" cy="40" rx="16" ry="20" /><path d="M66 60 l-3 5 h6z M66 65 c6 8 -6 14 0 24" />
    <path d="M26 24 q2 -6 8 -8 M60 32 q2 -6 8 -6" strokeWidth="1.4" />
  </g>
);

const Pencil = () => (
  <g transform="rotate(-38 50 50)">
    <path d="M40 10 h20 v56 l-10 18 l-10 -18z" />
    <path d="M40 22 h20 M40 66 h20 M44 74 h12" strokeWidth="1.4" />
    <path d="M45 78 l5 6 l5 -6" strokeWidth="1.4" />
    <path d="M40 10 q0 -6 10 -6 q10 0 10 6" />
  </g>
);

const Stars = () => (
  <g>
    {[[34, 34, 22], [72, 24, 12], [70, 70, 16], [24, 76, 9]].map(([x, y, r], i) => {
      const pts = Array.from({ length: 10 }, (_, k) => {
        const a = (Math.PI / 5) * k - Math.PI / 2;
        const rad = k % 2 ? r * 0.45 : r;
        return `${(x + rad * Math.cos(a)).toFixed(1)},${(y + rad * Math.sin(a)).toFixed(1)}`;
      }).join(' ');
      return <polygon key={i} points={pts} />;
    })}
  </g>
);

const Item = ({ children }) => (
  <svg className="leader-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// side="left" or "right": a column of drawings on each side of the page
export default function LeaderDecor({ side = 'left' }) {
  const left = [<Chalkboard key="c" />, <AppleOnBooks key="a" />, <Megaphone key="m" />, <Balloons key="b" />, <Stars key="s" />];
  const right = [<GradCap key="g" />, <Lightbulb key="l" />, <Bubbles key="u" />, <Trophy key="t" />, <Pencil key="p" />];
  return (
    <div className={`leader-decor ${side}`} aria-hidden="true">
      {(side === 'left' ? left : right).map((art, i) => <Item key={i}>{art}</Item>)}
    </div>
  );
}
