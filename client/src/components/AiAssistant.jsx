import { useEffect, useRef, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { askAssistant } from '../services/aiService.js';

const SEEN_KEY = 'ani_ai_seen';
const GREETING = {
  role: 'assistant',
  content: 'Hi! I’m your reading helper. I can find a book for you, show review links, tell you where to buy a book, or write spoiler-safe study notes.',
};

const safeStorage = {
  get: () => { try { return sessionStorage.getItem(SEEN_KEY); } catch { return null; } },
  set: () => { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage may be blocked */ } },
};

// The AI helper: pops up on the home page the first time, and is an "Ask AI" button on every other page.
export default function AiAssistant() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const bookId = matchPath('/books/:id', location.pathname)?.params.id || null;

  const [open, setOpen] = useState(() => isHome && !safeStorage.get());
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy, open]);

  const close = () => {
    setOpen(false);
    safeStorage.set();
  };

  const send = async (text) => {
    const message = text.trim();
    if (!message || busy) return;
    const history = messages.filter((m) => m !== GREETING).slice(-6).map((m) => ({ role: m.role, content: m.content }));
    setMessages((list) => [...list, { role: 'user', content: message }]);
    setInput('');
    setBusy(true);
    try {
      const data = await askAssistant({ message, bookId, history });
      setMessages((list) => [...list, { role: 'assistant', content: data.reply, books: data.books, links: data.links, source: data.source, limit: data.spoilerLimit }]);
    } catch (err) {
      setMessages((list) => [...list, { role: 'assistant', content: err.message, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  // Quick buttons: some can run right away; others need a book title typed first
  const chips = [
    { label: 'Find my book', run: 'Recommend a book for me' },
    { label: 'Review links', run: bookId ? 'Show review links' : null, fill: 'Show review links for ' },
    { label: 'Where to buy', run: bookId ? 'Where can I buy this book?' : null, fill: 'Where can I buy ' },
    { label: 'Study notes', run: bookId ? 'Give me study notes' : null, fill: 'Give me study notes for ' },
  ];
  const useChip = (chip) => {
    if (chip.run) return send(chip.run);
    setInput(chip.fill);
    inputRef.current?.focus();
    return undefined;
  };

  return (
    <>
      {!open && (
        <button type="button" className="ai-launcher" onClick={() => setOpen(true)} aria-label="Open the AI reading helper">
          <span aria-hidden="true">✦</span> Ask AI
        </button>
      )}

      {open && (
        <section className="ai-panel" role="dialog" aria-label="AI reading helper">
          <header className="ai-head">
            <strong><span aria-hidden="true">✦</span> Reading helper</strong>
            <button type="button" className="ai-close" onClick={close} aria-label="Close the AI helper">×</button>
          </header>

          <div className="ai-log" ref={logRef} role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}${m.error ? ' error' : ''}`}>
                <p>{m.content}</p>
                {m.books?.length > 0 && (
                  <ul className="ai-books">
                    {m.books.map((b) => (
                      <li key={b.id}>
                        <Link to={`/books/${b.id}`} onClick={() => setOpen(true)}>{b.title}</Link>
                        <span> · {b.author}</span>
                        {b.meets && <small>Meets {b.meets}</small>}
                      </li>
                    ))}
                  </ul>
                )}
                {m.links?.length > 0 && (
                  <ul className="ai-links">
                    {m.links.map((l) => (
                      <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a></li>
                    ))}
                  </ul>
                )}
                {m.limit && (
                  <small className="ai-note">
                    Spoiler-safe: {m.limit.week === 0 ? 'overview only' : `through week ${m.limit.week} of ${m.limit.totalWeeks}`}
                  </small>
                )}
                {m.role === 'assistant' && m.source && <small className="ai-note">{m.source === 'ai' ? 'Written by AI' : 'Smart search'}</small>}
              </div>
            ))}
            {busy && <div className="ai-msg assistant"><p className="ai-typing">Thinking…</p></div>}
          </div>

          <div className="ai-chips">
            {chips.map((chip) => (
              <button key={chip.label} type="button" className="ai-chip" onClick={() => useChip(chip)} disabled={busy}>{chip.label}</button>
            ))}
          </div>

          <form className="ai-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <label htmlFor="ai-input" className="sr-only">Ask the reading helper</label>
            <input id="ai-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder={bookId ? 'Ask about this book…' : 'Ask for a book, review, or notes…'} autoComplete="off" />
            <button type="submit" className="ai-send" disabled={busy || !input.trim()}>Send</button>
          </form>
          <p className="ai-foot">Answers use our book list. AI can make mistakes.</p>
        </section>
      )}
    </>
  );
}
