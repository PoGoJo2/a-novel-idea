// The AI helper's character: a navy leather book with a monocle and mustache who waves.
// His motion comes from CSS (see stacks.css) and stops for readers who prefer reduced motion.
export default function AiMascot() {
  return (
<svg className="ai-mascot-svg" viewBox="0 0 170 200" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="ai-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2f5aa8"/><stop offset="1" stopColor="#16295a"/></linearGradient>
    <linearGradient id="ai-sp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0a1430"/><stop offset="1" stopColor="#1f3a78"/></linearGradient>
    <linearGradient id="ai-sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0a47c"/><stop offset="1" stopColor="#c98a62"/></linearGradient>
  </defs>
  <g className="m-bob">
    <ellipse cx="82" cy="188" rx="46" ry="7" fill="rgba(0,0,0,.25)"/>
    <g>
      <path className="m-page" d="M134 52 Q158 40 164 22 Q146 26 134 40 Z" fill="#f3e7c8" stroke="#1a100a" strokeWidth="1.5"/>
      <path className="m-page" d="M134 62 Q162 56 168 40 Q148 42 134 52 Z" fill="#efe0bb" stroke="#1a100a" strokeWidth="1.5"/>
      <path className="m-page" d="M134 74 Q164 74 168 58 Q148 58 134 66 Z" fill="#f6ecd0" stroke="#1a100a" strokeWidth="1.5"/>
    </g>
    <rect x="52" y="152" width="9" height="16" fill="#e8d7b0" stroke="#1a100a" strokeWidth="1.5"/>
    <rect x="98" y="152" width="9" height="16" fill="#e8d7b0" stroke="#1a100a" strokeWidth="1.5"/>
    <path d="M44 172 Q44 166 54 166 H64 Q66 176 62 180 H44 Z" fill="#16295a" stroke="#1a100a" strokeWidth="2"/>
    <path d="M94 172 Q94 166 104 166 H114 Q116 176 112 180 H94 Z" fill="#16295a" stroke="#1a100a" strokeWidth="2"/>
    <path d="M48 170 h12 M98 170 h12" stroke="#d8b25a" strokeWidth="1.4"/>
    <rect x="34" y="34" width="104" height="122" rx="7" fill="url(#ai-lg)" stroke="#1a100a" strokeWidth="2.5"/>
    <rect x="41" y="41" width="90" height="108" rx="4" fill="none" stroke="#d8b25a" strokeWidth="1.6"/>
    <path d="M44 56 q8 -2 10 -10 M128 56 q-8 -2 -10 -10 M44 134 q8 2 10 10 M128 134 q-8 2 -10 10" fill="none" stroke="#d8b25a" strokeWidth="1.6" strokeLinecap="round"/>
    <rect x="22" y="34" width="18" height="122" rx="5" fill="url(#ai-sp)" stroke="#1a100a" strokeWidth="2.5"/>
    <rect x="25" y="48" width="12" height="26" fill="#060b1c" stroke="#d8b25a" strokeWidth="1.2"/>
    <rect x="25" y="92" width="12" height="16" fill="#060b1c" stroke="#d8b25a" strokeWidth="1.2"/>
    <path d="M23 40 h16 M23 82 h16 M23 120 h16 M23 140 h16" stroke="#d8b25a" strokeWidth="1.4"/>
    <path d="M28 54 h6 M28 59 h6 M28 64 h6 M28 98 h6 M28 103 h6" stroke="#d8b25a" strokeWidth="1"/>
    <ellipse cx="86" cy="94" rx="36" ry="44" fill="url(#ai-sk)" stroke="#8a5535" strokeWidth="1.6"/>
    <path d="M62 66 Q73 58 82 64" fill="none" stroke="#2b1a10" strokeWidth="4" strokeLinecap="round"/>
    <path d="M92 64 Q103 58 112 66" fill="none" stroke="#2b1a10" strokeWidth="4" strokeLinecap="round"/>
    <ellipse className="m-eye" cx="74" cy="80" rx="8" ry="9" fill="#fff" stroke="#1a100a" strokeWidth="1.6"/>
    <ellipse className="m-eye" cx="100" cy="80" rx="8" ry="9" fill="#fff" stroke="#1a100a" strokeWidth="1.6"/>
    <circle cx="75" cy="81" r="4.3" fill="#6a3b1d"/><circle cx="101" cy="81" r="4.3" fill="#6a3b1d"/>
    <circle cx="75" cy="81" r="1.9" fill="#120a05"/><circle cx="101" cy="81" r="1.9" fill="#120a05"/>
    <circle cx="76.5" cy="79" r="1.1" fill="#fff"/><circle cx="102.5" cy="79" r="1.1" fill="#fff"/>
    <circle cx="100" cy="80" r="12.5" fill="rgba(255,255,255,.12)" stroke="#d8b25a" strokeWidth="2.6"/>
    <path d="M91 74 Q96 70 102 71" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8"/>
    <path d="M112 86 Q122 104 112 124 Q110 128 106 128" fill="none" stroke="#d8b25a" strokeWidth="1.4" strokeDasharray="2 2"/>
    <path d="M86 84 Q82 98 80 100 Q86 104 92 100 Q90 96 88 88" fill="#cf8f66" stroke="#8a5535" strokeWidth="1.3"/>
    <g className="m-stache"><path d="M86 104 Q74 98 64 106 Q60 112 68 112 Q76 112 86 108 Q96 112 104 112 Q112 112 108 106 Q98 98 86 104 Z" fill="#2b1a10" stroke="#1a100a" strokeWidth="1.2"/></g>
    <path d="M76 116 Q86 124 96 116" fill="none" stroke="#7a3b2a" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M24 110 Q10 118 8 130" fill="none" stroke="#e8d7b0" strokeWidth="7" strokeLinecap="round"/>
    <g><ellipse cx="7" cy="136" rx="9" ry="8" fill="#0b0b0f" stroke="#1a100a" strokeWidth="1.8"/>
    <path d="M0 140 q-4 4 -1 8 M5 144 q-2 6 2 8 M11 142 q1 6 5 6" fill="none" stroke="#0b0b0f" strokeWidth="3.4" strokeLinecap="round"/></g>
    <g className="m-arm">
      <path d="M136 104 Q152 96 158 74" fill="none" stroke="#e8d7b0" strokeWidth="7" strokeLinecap="round"/>
      <ellipse cx="160" cy="66" rx="9" ry="9" fill="#0b0b0f" stroke="#1a100a" strokeWidth="1.8"/>
      <path d="M154 60 q-3 -8 0 -10 M160 57 q0 -9 3 -10 M166 60 q4 -7 6 -6" fill="none" stroke="#0b0b0f" strokeWidth="3.4" strokeLinecap="round"/>
    </g>
  </g>
</svg>
  );
}
