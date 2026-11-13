// Three short reminders of what the app does, shown beside the log-in and sign-up forms.
const icon = (children) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const FEATURES = [
  { text: 'Choose one of two weekly meeting times', svg: icon(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>) },
  { text: 'Read the notes if you miss a session', svg: icon(<><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 12h7M9 16h7" /></>) },
  { text: 'Ask the AI assistant for your next read', svg: icon(<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>) },
];

export default function FeatureList() {
  return (
    <ul className="features">
      {FEATURES.map((f) => (
        <li key={f.text}>
          {f.svg}
          <span>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}
