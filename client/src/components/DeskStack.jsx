// An inkwell with a quill resting on a stack of three flat books. Decoration only.
function FlatBook({ width, height, color }) {
  return (
    <div className="flat-book" style={{ width, height, background: color }}>
      <span className="flat-pages" />
    </div>
  );
}

export default function DeskStack() {
  return (
    <div className="desk-stack" aria-hidden="true">
      <svg width="74" height="120" viewBox="0 0 74 120">
        <path d="M30 70 C28 40 40 14 66 4 C62 30 54 56 38 74 Z" fill="#FDF6E3" stroke="#17595A" strokeWidth="1.2" />
        <path d="M33 72 L64 7" stroke="#17595A" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M40 56 L50 58 M44 44 L55 46 M50 32 L60 32 M38 62 L30 58" stroke="#17595A" strokeWidth="1" strokeLinecap="round" />
        <rect x="14" y="78" width="44" height="34" rx="8" fill="#14233F" stroke="#F1E6D0" strokeWidth="1.2" />
        <rect x="26" y="70" width="20" height="10" rx="2" fill="#0B1424" />
        <rect x="20" y="90" width="32" height="12" rx="2" fill="#F1E6D0" opacity=".85" />
      </svg>
      <FlatBook width={108} height={20} color="#8c3f12" />
      <FlatBook width={128} height={22} color="#5a1f1f" />
      <FlatBook width={150} height={24} color="#14504f" />
    </div>
  );
}
