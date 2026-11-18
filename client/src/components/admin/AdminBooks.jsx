import { useCallback, useEffect, useState } from 'react';
import * as admin from '../../services/adminService.js';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

const GENRES = ['Mystery', 'Fantasy', 'Classics', 'Science Fiction', 'Horror', 'Romance', 'Thriller / Action', 'True Crime', 'Autobiography', 'Self Help / Personal Development', 'Historical', 'Non-fiction'];
const blank = { title: '', author: '', genre: 'Mystery', description: '', pageCount: '', coverUrl: '' };

// Books: add new books, discard (retire) old ones, bring them back.
export default function AdminBooks() {
  const [books, setBooks] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => admin.getBooks().then((d) => setBooks(d.books)).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const run = async (action, done) => {
    setBusy(true); setError(''); setMessage('');
    try { await action(); setMessage(done); await load(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (!books && !error) return <Loader />;

  return (
    <>
      <section className="panel">
        <h2>Add a new book</h2>
        <ErrorMessage message={error} />
        {message && <p className="notice" role="status">{message}</p>}
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); run(async () => { await admin.createBook(form); setForm(blank); }, 'Book added. Open a reading group for it on the Groups tab.'); }}>
          <div className="admin-row">
            <label className="field"><span>Title</span><input value={form.title} maxLength={150} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label className="field"><span>Author</span><input value={form.author} maxLength={100} onChange={(e) => setForm({ ...form, author: e.target.value })} required /></label>
          </div>
          <div className="admin-row">
            <label className="field"><span>Genre</span>
              <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>{GENRES.map((g) => <option key={g}>{g}</option>)}</select>
            </label>
            <label className="field"><span>Pages</span><input type="number" min={1} value={form.pageCount} onChange={(e) => setForm({ ...form, pageCount: e.target.value })} /></label>
          </div>
          <label className="field"><span>Cover image link (optional)</span><input type="url" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} /></label>
          <label className="field"><span>Description</span><textarea rows={4} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
          <div><button type="submit" className="btn btn-primary" disabled={busy}>Add book</button></div>
        </form>
      </section>

      <section className="panel">
        <h2>All books ({books?.length || 0})</h2>
        <p className="muted small">Discarding a book hides it from Browse so no one new can join. Groups already running keep going. You can bring a book back any time.</p>
        <ul className="admin-list">
          {(books || []).map((b) => (
            <li key={b.id} className={`admin-item${b.retired ? ' is-retired' : ''}`}>
              <div className="admin-item-head">
                <div>
                  <strong>{b.title}</strong>{b.retired && <span className="tag">discarded</span>}
                  <div className="muted small">{b.author} · {b.genre} · {b.activeGroups} active group{b.activeGroups === 1 ? '' : 's'}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={busy}
                  onClick={() => {
                    if (b.retired || window.confirm(`Discard "${b.title}"? It will disappear from Browse.`)) {
                      run(() => admin.retireBook(b.id, !b.retired), b.retired ? 'Book brought back.' : 'Book discarded.');
                    }
                  }}
                >
                  {b.retired ? 'Bring back' : 'Discard'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
