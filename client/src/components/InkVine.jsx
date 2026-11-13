// A black ink-line vine (cream in the dark theme). Colored by the CSS variable --vine.
const LEAVES = [[28, 126, -45, 1.1], [52, 106, 25, 1.0], [94, 80, -30, 1.1], [124, 62, 200, 1.0], [140, 44, -40, 1.0], [160, 24, 195, 1.0], [190, 12, -25, 1.0], [92, 52, -70, 0.9]];

export default function InkVine({ className = '' }) {
  return (
    <svg className={`ink-vine ${className}`} aria-hidden="true" viewBox="0 0 220 160" fill="none">
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M4 156 C36 132 38 92 78 82 S128 52 150 22 S198 12 216 4" strokeWidth="1.8" />
        <path d="M78 82 C68 62 86 46 104 44" strokeWidth="1.3" />
        <path d="M150 22 C146 8 160 0 174 4" strokeWidth="1.3" />
        <path d="M104 44 c4 -10 16 -6 12 2 c-3 5 -9 2 -6 -2" strokeWidth="1.2" />
        <path d="M38 100 c-8 -4 -16 4 -10 10 c4 3 8 -1 5 -4" strokeWidth="1.2" />
      </g>
      {LEAVES.map(([x, y, rotate, scale]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
          <path d="M0 0 C4 -8 12 -8 16 0 C12 5 4 5 0 0Z" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
