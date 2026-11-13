import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {['light', 'dark'].map((t) => (
        <button key={t} type="button" aria-pressed={theme === t} className={theme === t ? 'on' : ''} onClick={() => setTheme(t)}>
          {t === 'light' ? 'Light' : 'Dark'}
        </button>
      ))}
    </div>
  );
}
