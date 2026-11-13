// A row of thin, hand-drawn dark books standing on a shelf. Decoration only.
const COLORS = ['#14504f', '#8c3f12', '#1f4d3a', '#5a1f1f', '#1b2a47', '#2b2b2b', '#a04a14', '#2f5a43', '#3b1f3a', '#4a3a1a'];
const WIDTHS = [16, 20, 14, 24, 18, 22, 15, 26, 19, 21];
const HEIGHTS = [112, 128, 100, 140, 118, 132, 106, 146, 122, 136, 110, 126];
const TILTS = [0, 0, -1.2, 0, 1, 0, 0, -0.8];
const CORNERS = ['3px 3px 0 0', '4px 2px 0 0', '2px 4px 0 0', '3px 3px 0 0'];

// Five little patterns drawn on the spines
function Motif({ kind }) {
  if (kind === 0) {
    return (
      <>
        <span className="ln" style={{ top: '9%', height: '1.5px' }} />
        <span className="ln" style={{ top: '15%' }} />
        <span className="ln" style={{ bottom: '15%' }} />
        <span className="ln" style={{ bottom: '9%', height: '1.5px' }} />
        <span className="dots" />
      </>
    );
  }
  if (kind === 1) {
    return (
      <>
        <span className="label-box" />
        <span className="ln" style={{ bottom: '12%', height: '1.5px' }} />
      </>
    );
  }
  if (kind === 2) {
    return (
      <svg className="motif-svg" viewBox="0 0 14 90" aria-hidden="true">
        <path d="M7 4 V86" />
        <path d="M7 20 C1 18 0 11 5 8 C8 12 8 16 7 20Z" />
        <path d="M7 38 C13 36 14 29 9 26 C6 30 6 34 7 38Z" />
        <path d="M7 56 C1 54 0 47 5 44 C8 48 8 52 7 56Z" />
        <path d="M7 74 C13 72 14 65 9 62 C6 66 6 70 7 74Z" />
      </svg>
    );
  }
  if (kind === 3) return <span className="dots dots-tall" />;
  return (
    <svg className="motif-svg" viewBox="0 0 10 90" aria-hidden="true">
      <path d="M5 3 L9 8 L5 13 L1 8Z" />
      <path d="M5 24 L9 29 L5 34 L1 29Z" />
      <path d="M5 45 L9 50 L5 55 L1 50Z" />
      <path d="M5 66 L9 71 L5 76 L1 71Z" />
    </svg>
  );
}

export default function BookShelf() {
  const books = Array.from({ length: 64 }, (_, i) => (
    <div
      key={i}
      className="shelf-book"
      style={{
        '--w': `${WIDTHS[i % 10]}px`,
        '--h': `${Math.round(HEIGHTS[i % 12] * 0.62)}px`,
        background: COLORS[(i * 3 + Math.floor(i / 10)) % 10],
        transform: `rotate(${TILTS[i % 8]}deg)`,
        borderRadius: CORNERS[i % 4],
      }}
    >
      <Motif kind={i % 5} />
    </div>
  ));

  return (
    <div className="shelf" aria-hidden="true">
      <div className="shelf-row">{books}</div>
      <div className="shelf-board" />
    </div>
  );
}
