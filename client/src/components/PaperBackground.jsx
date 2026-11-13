import { useTheme } from '../context/ThemeContext.jsx';

// Aged-parchment paper drawn with SVG filters, fixed behind the whole app.
const PALETTES = {
  light: { base: '#E3CF9F', mot: [0.45, 0.28, 0.1], moOp: 0.5, lit: '#ffffff', blend: 'multiply', coOp: 0.45, grain: [0.25, 0.16, 0.05], gOp: 0.35, vig: '#4A2808', vOp: 0.55, fox: '#7A4A18', fxOp: 0.38, edge: '#4A2808', eOp: 0.5 },
  dark: { base: '#2A2017', mot: [0.02, 0.01, 0], moOp: 0.6, lit: '#D9BC8C', blend: 'soft-light', coOp: 0.7, grain: [0.8, 0.65, 0.4], gOp: 0.14, vig: '#000000', vOp: 0.7, fox: '#C8A064', fxOp: 0.16, edge: '#000000', eOp: 0.6 },
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
      <rect width="100%" height="100%" filter="url(#paper-c)" opacity={p.coOp} style={{ mixBlendMode: p.blend }} />
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
