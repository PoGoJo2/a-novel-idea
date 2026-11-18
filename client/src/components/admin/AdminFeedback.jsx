import { useCallback, useEffect, useState } from 'react';
import * as admin from '../../services/adminService.js';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

// Complaints and reviews sent in by members.
export default function AdminFeedback() {
  const [items, setItems] = useState(null);
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('new');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (kind) p.set('kind', kind);
    if (status) p.set('status', status);
    admin.getFeedback(`?${p}`).then((d) => setItems(d.feedback)).catch((e) => setError(e.message));
  }, [kind, status]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (item) => {
    try { await admin.setFeedbackStatus(item.id, item.status === 'new' ? 'resolved' : 'new'); load(); } catch (err) { setError(err.message); }
  };

  return (
    <section className="panel">
      <h2>Complaints and reviews</h2>
      <ErrorMessage message={error} />
      <div className="admin-row">
        <label className="field"><span>Show</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">Everything</option><option value="complaint">Complaints</option><option value="review">Reviews</option><option value="other">Other</option>
          </select>
        </label>
        <label className="field"><span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="new">New</option><option value="resolved">Resolved</option><option value="">All</option>
          </select>
        </label>
      </div>
      {!items && !error && <Loader />}
      {items && items.length === 0 && <p className="muted">Nothing here.</p>}
      <ul className="admin-list">
        {(items || []).map((f) => (
          <li key={f.id} className="admin-item">
            <div className="admin-item-head">
              <div>
                <span className={`tag kind-${f.kind}`}>{f.kind}</span>{' '}
                {f.rating && <span aria-label={`${f.rating} stars`}>{stars(f.rating)}</span>}
                <div className="muted small">{f.user?.name || 'Former member'} {f.user?.email && `(${f.user.email})`}{f.book && <> · about {f.book.title}</>} · {new Date(f.createdAt).toLocaleDateString()}</div>
              </div>
              <button type="button" className="btn btn-small" onClick={() => toggle(f)}>{f.status === 'new' ? 'Mark resolved' : 'Reopen'}</button>
            </div>
            <p className="admin-message">{f.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
