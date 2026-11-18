// Ink-line tools for the empty space beside the Administrator page: wrenches, gears, a hammer, a screwdriver,
// pliers, and a nut and bolt. The line color comes from the CSS variable --vine, like the genre borders.

// A gear: a ring of teeth around a hub
const gear = (cx, cy, outer, inner, teeth) => {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step - Math.PI / 2;
    [[-0.28, inner], [-0.16, outer], [0.16, outer], [0.28, inner]].forEach(([k, r]) => {
      pts.push(`${(cx + r * Math.cos(a + k * step * 1.7)).toFixed(1)},${(cy + r * Math.sin(a + k * step * 1.7)).toFixed(1)}`);
    });
  }
  return pts.join(' ');
};

const Gear = ({ cx = 50, cy = 50, r = 30, teeth = 10 }) => (
  <g>
    <polygon points={gear(cx, cy, r, r * 0.8, teeth)} />
    <circle cx={cx} cy={cy} r={r * 0.5} />
    <circle cx={cx} cy={cy} r={r * 0.2} />
  </g>
);

const Wrench = () => (
  <g transform="rotate(-40 50 50)">
    <path d="M38 8 a14 14 0 0 0 0 26 v6 h24 v-6 a14 14 0 0 0 0 -26 v10 h-8 v-12 h-8 v12 h-8z" transform="translate(0 0)" />
    <path d="M40 40 v44 a10 10 0 0 0 20 0 v-44" />
    <circle cx="50" cy="82" r="3.5" />
  </g>
);

const Hammer = () => (
  <g transform="rotate(35 50 50)">
    <path d="M22 14 h46 q8 0 8 8 v6 q0 8 -8 8 h-46 q-6 0 -10 -6 q-4 -6 0 -14 q4 -2 10 -2z" />
    <path d="M40 36 v54 a6 6 0 0 0 12 0 v-54" />
    <path d="M40 48 h12 M40 58 h12 M40 68 h12" strokeWidth="1" />
  </g>
);

const Screwdriver = () => (
  <g transform="rotate(-30 50 50)">
    <rect x="40" y="6" width="20" height="34" rx="9" />
    <path d="M44 14 v18 M50 14 v18 M56 14 v18" strokeWidth="1" />
    <path d="M47 40 v38 M53 40 v38 M47 78 l3 10 l3 -10" />
  </g>
);

const Pliers = () => (
  <g transform="rotate(20 50 50)">
    <path d="M42 8 q-8 8 -4 24 l12 12 l12 -12 q4 -16 -4 -24 q-4 2 -8 8 q-4 -6 -8 -8z" />
    <circle cx="50" cy="40" r="3" />
    <path d="M38 52 l-12 36 a5 5 0 0 0 10 2 l14 -34 M62 52 l12 36 a5 5 0 0 1 -10 2 l-14 -34" />
  </g>
);

const Bolt = () => (
  <g>
    <polygon points="50,6 78,22 78,54 50,70 22,54 22,22" />
    <circle cx="50" cy="38" r="12" />
    <path d="M34 78 h32 M36 84 h28 M38 90 h24" />
  </g>
);

const Item = ({ children }) => (
  <svg className="admin-tool" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// side="left" or "right": two columns of tools, one on each side of the page
export default function AdminTools({ side = 'left' }) {
  const left = [<Wrench key="w" />, <Gear key="g" r={32} teeth={12} />, <Hammer key="h" />, <Bolt key="b" />];
  const right = [<Gear key="g" r={32} teeth={9} />, <Pliers key="p" />, <Screwdriver key="s" />, <Wrench key="w" />];
  return (
    <div className={`admin-tools ${side}`} aria-hidden="true">
      {(side === 'left' ? left : right).map((tool, i) => <Item key={i}>{tool}</Item>)}
    </div>
  );
}

// A small cluster of gears for the empty space beside the page heading
export function GearCluster() {
  return (
    <svg className="gear-cluster" viewBox="0 0 160 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Gear cx={52} cy={52} r={36} teeth={11} />
      <Gear cx={124} cy={30} r={22} teeth={8} />
      <Gear cx={128} cy={80} r={14} teeth={6} />
    </svg>
  );
}
