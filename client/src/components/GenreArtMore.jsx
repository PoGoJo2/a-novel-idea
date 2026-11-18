// Ink-line artwork for the borders of the newer genre rows: Horror, Romance, Thriller / Action, True Crime,
// Autobiography, and Self Help / Personal Development. Each border has three drawings (top, middle, bottom),
// in the same ink style as the older genres. Lines use the CSS color of the parent border.

const Sparkle = ({ x, y, s = 1 }) => (
  <path d="M0 -8 Q1 -1 8 0 Q1 1 0 8 Q-1 1 -8 0 Q-1 -1 0 -8Z" transform={`translate(${x} ${y}) scale(${s})`} />
);
const Dot = ({ x, y, r = 1.2 }) => <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />;

// A 40 x 40 drawing enlarged to fit the 220 x 560 border artwork
const Big = ({ x, y, children }) => (
  <g transform={`translate(${x} ${y}) scale(3.1)`} strokeWidth="0.55">{children}</g>
);

const batmoon = () => (
  <><path d="M10 6 a11 11 0 1 0 12 14 a9 9 0 0 1 -12 -14z"/><path d="M20 30 q4 -8 8 -2 q4 -6 8 2 q-8 -2 -8 4 q0 -6 -8 -4z"/><circle cx="31" cy="8" r="1"/><circle cx="36" cy="14" r="1"/></>
);

const tomb = () => (
  <><path d="M10 38 v-22 a10 10 0 0 1 20 0 v22z"/><path d="M20 12 v14 M15 17 h10"/><path d="M4 38 h32 M8 34 l-3 4 M32 34 l3 4"/></>
);

const skull = () => (
  <><path d="M8 20 a12 11 0 1 1 24 0 v4 l-5 2 v6 h-14 v-6 l-5 -2z"/><circle cx="14.5" cy="19" r="3.2"/><circle cx="25.5" cy="19" r="3.2"/><path d="M20 23 l-2 4 h4z M16 32 v-4 M20 32 v-4 M24 32 v-4"/></>
);

const heartarrow = () => (
  <><path d="M20 34 c-18 -12 -8 -26 0 -15 c8 -11 18 3 0 15z"/><path d="M4 6 l32 28 M4 6 l1 6 M4 6 l6 1 M36 34 l-1 -6 M36 34 l-6 -1"/></>
);

const letter = () => (
  <><rect x="4" y="10" width="32" height="22"/><path d="M4 10 l16 13 l16 -13"/><path d="M20 28 c-6 -4 -3 -9 0 -5 c3 -4 6 1 0 5z"/></>
);

const rose = () => (
  <><circle cx="20" cy="13" r="9"/><path d="M20 13 m-4 0 a4 4 0 1 1 4 4 a7 7 0 1 1 -7 -9"/><path d="M20 22 v16 M20 30 q-9 -2 -10 -9 q8 0 10 9 M20 33 q8 -2 9 -8 q-7 0 -9 8"/></>
);

const bolt = () => (
  <><path d="M24 2 l-14 20 h10 l-5 16 l17 -22 h-11z"/><path d="M4 8 l4 3 M34 6 l-4 3 M36 26 l-5 -1"/></>
);

const stopwatch = () => (
  <><circle cx="20" cy="23" r="14"/><path d="M20 23 v-9 M20 23 l6 4 M16 5 h8 M20 5 v4 M32 10 l3 -3"/></>
);

const target = () => (
  <><circle cx="20" cy="20" r="15"/><circle cx="20" cy="20" r="8"/><circle cx="20" cy="20" r="1.5"/><path d="M20 2 v10 M20 28 v10 M2 20 h10 M28 20 h10"/></>
);

const badge = () => (
  <><polygon points="20.0,4.0 23.9,12.9 33.3,10.4 28.8,19.0 36.6,24.8 27.0,26.6 27.4,36.3 20.0,30.0 12.6,36.3 13.0,26.6 3.4,24.8 11.2,19.0 6.7,10.4 16.1,12.9"/><circle cx="20" cy="21" r="5"/></>
);

const tag = () => (
  <><path d="M6 8 h20 l8 8 v22 h-28z"/><circle cx="14" cy="14" r="2"/><path d="M14 14 q-10 -14 -2 -12 M12 24 h16 M12 29 h12 M12 34 h8"/></>
);

const cuffs = () => (
  <><circle cx="11" cy="24" r="8"/><circle cx="31" cy="24" r="8"/><path d="M11 16 v-5 M31 16 v-5 M17 17 q3 -6 6 0"/><circle cx="11" cy="24" r="2"/><circle cx="31" cy="24" r="2"/></>
);

const frame = () => (
  <><rect x="4" y="3" width="32" height="36"/><rect x="9" y="8" width="22" height="26"/><circle cx="20" cy="18" r="5"/><path d="M10 34 q10 -14 20 0"/></>
);

const key = () => (
  <><circle cx="11" cy="12" r="8"/><circle cx="11" cy="12" r="3"/><path d="M17 18 l18 18 M28 29 l4 -4 M33 34 l3 -3"/></>
);

const journal = () => (
  <><path d="M3 12 q8 -4 17 2 q9 -6 17 -2 v22 q-8 -4 -17 2 q-9 -6 -17 -2z M20 14 v22"/><path d="M30 2 l-9 14 M30 2 q5 4 -2 9"/></>
);

const sun = () => (
  <><circle cx="20" cy="22" r="8"/><path d="M20 4 v5 M20 35 v3 M2 22 h5 M33 22 h5 M7 9 l4 4 M33 9 l-4 4 M7 35 l4 -4 M33 35 l-4 -4"/></>
);

const mountain = () => (
  <><path d="M2 36 l12 -22 l7 11 l5 -7 l12 18z"/><path d="M14 14 v-9 l8 3 l-8 3"/><path d="M10 22 l4 -3 l3 4"/></>
);

const sprout = () => (
  <><path d="M20 36 v-16 M20 26 q-12 0 -14 -12 q13 0 14 12 M20 22 q12 -2 14 -14 q-13 2 -14 14"/><path d="M8 36 h24 M12 36 q8 -6 16 0"/></>
);

const make = (top, mid, bottom, extras) => function Art() {
  const [T, M, B] = [top, mid, bottom];
  return (
    <g>
      <Big x={46} y={24}><T /></Big>
      <Big x={46} y={262}><M /></Big>
      <Big x={46} y={420}><B /></Big>
      {extras}
    </g>
  );
};

const stars = (
  <>
    <Sparkle x={26} y={50} s={0.9} /><Sparkle x={196} y={130} s={0.8} /><Dot x={30} y={150} /><Dot x={190} y={40} />
    <Sparkle x={30} y={300} s={0.8} /><Sparkle x={194} y={352} s={0.9} /><Dot x={192} y={270} /><Dot x={28} y={376} />
    <Sparkle x={196} y={452} s={0.8} /><Sparkle x={26} y={520} s={0.9} /><Dot x={30} y={440} /><Dot x={190} y={532} />
  </>
);

export const MORE_ARTS = {
  'Horror': make(batmoon, tomb, skull, stars),
  'Romance': make(heartarrow, letter, rose, stars),
  'Thriller / Action': make(bolt, stopwatch, target, stars),
  'True Crime': make(badge, tag, cuffs, stars),
  'Autobiography': make(frame, key, journal, stars),
  'Self Help / Personal Development': make(sun, mountain, sprout, stars),
};

export const MORE_BANDS = {
  Horror: [[8, 176], [242, 392], [398, 552]],
  Romance: [[8, 176], [242, 392], [398, 552]],
  'Thriller / Action': [[8, 176], [242, 392], [398, 552]],
  'True Crime': [[8, 176], [242, 392], [398, 552]],
  Autobiography: [[8, 176], [242, 392], [398, 552]],
  'Self Help / Personal Development': [[8, 176], [242, 392], [398, 552]],
};
