import { useTheme } from '../context/ThemeContext.jsx';

// Aged-parchment paper drawn with SVG filters, fixed behind the whole app.
const PALETTES = {
  light: { base: '#E3CF9F', mot: [0.45, 0.28, 0.1], moOp: 0.6, lit: '#ffffff', blend: 'multiply', coOp: 0.55, grain: [0.25, 0.16, 0.05], gOp: 0.45, vig: '#4A2808', vOp: 0.55, fox: '#7A4A18', fxOp: 0.45, edge: '#4A2808', eOp: 0.5, fibers: true, fibOp: 0.32 },
  dark: { base: '#A2836A', mot: [0.22, 0.13, 0.05], moOp: 0.9, lit: '#FFFFFF', blend: 'multiply', coOp: 0.85, grain: [0.22, 0.14, 0.05], gOp: 0.8, vig: '#2E1A08', vOp: 0.6, fox: '#4A2A10', fxOp: 0.55, edge: '#1E1006', eOp: 0.55, clouds: false, fibers: true, fibOp: 0.65 },
};
const SPOTS = [[12, 18, 40], [82, 10, 30], [90, 50, 50], [24, 66, 36], [70, 82, 44], [8, 90, 30]];

export default function PaperBackground() {
  const { theme } = useTheme();
  const p = PALETTES[theme] || PALETTES.light;
  const [m, g] = [p.mot, p.grain];

  return (
    <svg className="paper-bg" aria-hidden="true" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="paper-m" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="4" seed="11" />
          <feColorMatrix type="matrix" values={`0 0 0 0 ${m[0]} 0 0 0 0 ${m[1]} 0 0 0 0 ${m[2]} 0 0 0 1.6 -0.55`} />
        </filter>
        <filter id="paper-cd" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.005" numOctaves="3" seed="21" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.16 0 0 0 0 0.10 0 0 0 0 0.04 0 0 0 2.6 -1.05" />
        </filter>
        <filter id="paper-cl" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.006" numOctaves="3" seed="44" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.82 0 0 0 0 0.66 0 0 0 0 0.40 0 0 0 2.6 -1.1" />
        </filter>
        <filter id="paper-fib" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07 0.1" numOctaves="3" seed="9" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.25 0 0 0 0 0.16 0 0 0 0 0.07 0 0 0 1.8 -0.85" />
        </filter>
        <filter id="paper-c" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.03" numOctaves="5" seed="3" result="t" />
          <feDiffuseLighting in="t" surfaceScale="2.4" diffuseConstant="1.1" lightingColor={p.lit}>
            <feDistantLight azimuth="50" elevation="58" />
          </feDiffuseLighting>
        </filter>
        <filter id="paper-g" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
          <feColorMatrix type="matrix" values={`0 0 0 0 ${g[0]} 0 0 0 0 ${g[1]} 0 0 0 0 ${g[2]} 0 0 0 0.9 -0.3`} />
        </filter>
        <radialGradient id="paper-v" cx="50%" cy="50%" r="72%">
          <stop offset="0.55" stopColor={p.vig} stopOpacity="0" />
          <stop offset="1" stopColor={p.vig} stopOpacity={p.vOp} />
        </radialGradient>
        <radialGradient id="paper-f">
          <stop offset="0" stopColor={p.fox} stopOpacity={p.fxOp} />
          <stop offset="1" stopColor={p.fox} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="paper-t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.edge} stopOpacity={p.eOp} />
          <stop offset="1" stopColor={p.edge} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paper-b" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={p.edge} stopOpacity={p.eOp} />
          <stop offset="1" stopColor={p.edge} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill={p.base} />
      <rect width="100%" height="100%" filter="url(#paper-m)" opacity={p.moOp} />
      {p.clouds && <rect width="100%" height="100%" filter="url(#paper-cd)" opacity="0.8" />}
      {p.clouds && <rect width="100%" height="100%" filter="url(#paper-cl)" opacity="0.55" />}
      <rect width="100%" height="100%" filter="url(#paper-c)" opacity={p.coOp} style={{ mixBlendMode: p.blend }} />
      {p.fibers && <rect width="100%" height="100%" filter="url(#paper-fib)" opacity={p.fibOp} />}
      <rect width="100%" height="100%" filter="url(#paper-g)" opacity={p.gOp} />
      {SPOTS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="url(#paper-f)" />
      ))}
      <rect width="100%" height="100%" fill="url(#paper-v)" />
      <rect width="100%" height="36" fill="url(#paper-t)" />
      <rect y="100%" width="100%" height="36" transform="translate(0 -36)" fill="url(#paper-b)" />
    </svg>
  );
}
