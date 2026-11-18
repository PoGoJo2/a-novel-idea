import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import * as admin from '../../services/adminService.js';
import { formatStart } from '../../utils/startDate.js';
import BookCover from '../BookCover.jsx';
import GroupForm from './GroupForm.jsx';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

// What a tile says about its group
const statusOf = (g) => {
  if (g.status === 'finished') return { key: 'finished', label: 'Finished' };
  if (g.currentWeek >= 1) return { key: 'started', label: `Week ${g.currentWeek}` };
  return g.planned ? { key: 'open', label: 'Open' } : { key: 'soon', label: 'Coming soon' };
};

// A window that opens over the page. Esc or a click outside closes it.
function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Drawn straight into the page body so it sits above everything, including the Ask AI helper
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-window" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <h3 className="modal-title">{title}</h3>
        {subtitle && <p className="muted small">{subtitle}</p>}
        {children}
      </div>
    </div>,
    document.body
  );
}

// Groups: a tile for each book. Click a tile to change its start date, leader, class sizes or meeting times.
export default function AdminGroups() {
  const [groups, setGroups] = useState(null);
  const [books, setBooks] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [open, setOpen] = useState(null); // a group, or 'new'
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState({ q: '', genre: '', status: '' });

  const load = useCallback(async () => {
    try {
      const [g, b, l, a] = await Promise.all([admin.getGroups(), admin.getBooks(), admin.getUsers('?role=leader'), admin.getUsers('?role=admin')]);
      setGroups(g.groups);
      setBooks(b.books.filter((x) => !x.retired));
      setLeaders([...l.users, ...a.users].filter((u) => !u.suspended));
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (action, done) => {
    setBusy(true); setError(''); setMessage('');
    try {
      await action();
      setMessage(done);
      setOpen(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const genres = useMemo(() => [...new Set((groups || []).map((g) => g.book.genre).filter(Boolean))].sort(), [groups]);
  const shown = useMemo(() => (groups || []).filter((g) => {
    const text = `${g.book.title} ${g.book.author} ${g.leader?.name || ''}`.toLowerCase();
    return (!filters.q || text.includes(filters.q.toLowerCase()))
      && (!filters.genre || g.book.genre === filters.genre)
      && (!filters.status || statusOf(g).key === filters.status);
  }), [groups, filters]);

  if (!groups && !error) return <Loader />;

  return (
    <section className="panel">
      <h2>Reading groups</h2>
      <p className="muted small">Click a book to change its start date, leader, class sizes, or meeting times.</p>
      <ErrorMessage message={error} />
      {message && <p className="notice" role="status">{message}</p>}

      <div className="admin-row admin-filters">
        <label className="field wide"><span>Search by book or leader</span>
          <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </label>
        <label className="field"><span>Genre</span>
          <select value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })}>
            <option value="">All genres</option>{genres.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label className="field"><span>Status</span>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option><option value="open">Open</option><option value="soon">Coming soon</option><option value="started">Started</option><option value="finished">Finished</option>
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={() => { setError(''); setOpen('new'); }}>+ New group</button>
      </div>

      {shown.length === 0 && <p className="muted">No groups match.</p>}
      <div className="admin-tiles">
        {shown.map((g) => {
          const st = statusOf(g);
          return (
            <div key={g.id} className="admin-tile" role="button" tabIndex={0}
              onClick={() => { setError(''); setOpen(g); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setError(''); setOpen(g); } }}>
              <BookCover book={g.book} />
              <strong className="tile-title">{g.book.title}</strong>
              <span className="muted small">Led by {g.leader?.name || 'no one'}</span>
              <span className="start-date small">{g.currentWeek >= 1 ? 'Started' : 'Starts'} {formatStart(g.startDate).text}</span>
              <span className="muted small">{g.timeSlots.length} meeting{g.timeSlots.length === 1 ? '' : 's'} a week · {g.totalWeeks} weeks</span>
              <span className="admin-tile-foot">
                <span className={`tag status-${st.key}`}>{st.label}</span>
                <span className="btn btn-small">Edit</span>
              </span>
            </div>
          );
        })}
      </div>

      {open === 'new' && (
        <Modal title="Open a new group" subtitle="The weeks start empty, so the book shows “Coming soon” until the leader sets the chapters or pages." onClose={() => setOpen(null)}>
          <ErrorMessage message={error} />
          <GroupForm books={books} leaders={leaders} busy={busy} submitLabel="Create group" onCancel={() => setOpen(null)} onSubmit={(body) => save(() => admin.createGroup(body), 'Group created.')} />
        </Modal>
      )}

      {open && open !== 'new' && (
        <Modal title={open.book.title} subtitle={`${open.book.author}${open.book.genre ? ` · ${open.book.genre}` : ''}`} onClose={() => setOpen(null)}>
          <ErrorMessage message={error} />
          <GroupForm
            key={open.id}
            initial={open}
            leaders={leaders}
            locked={open.currentWeek > 0}
            busy={busy}
            submitLabel="Save changes"
            onCancel={() => setOpen(null)}
            onSubmit={(body) => save(() => admin.updateGroup(open.id, body), 'Group saved.')}
          />
          <div className="danger-zone">
            <div>
              <strong>Danger zone</strong>
              <div className="muted small">Retire this book to hide it from Browse. Groups already running keep going.</div>
            </div>
            <button
              type="button"
              className="btn btn-small btn-danger"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Retire "${open.book.title}"? It will disappear from Browse.`)) save(() => admin.retireBook(open.book.id, true), 'Book retired.');
              }}
            >
              Retire book
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
