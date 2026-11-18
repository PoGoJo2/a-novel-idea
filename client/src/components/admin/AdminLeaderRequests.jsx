import { useCallback, useEffect, useState } from 'react';
import * as admin from '../../services/adminService.js';
import { formatStart } from '../../utils/startDate.js';
import BookCover from '../BookCover.jsx';
import ErrorMessage from '../ErrorMessage.jsx';
import { slotsText } from '../leader/classTimes.js';

// Leaders who volunteered to lead a class. Approving moves the class to that leader.
export default function AdminLeaderRequests({ onDecided }) {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRequests((await admin.getLeaderRequests()).requests);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const decide = async (r, decision) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await admin.decideLeaderRequest(r.id, decision);
      setMessage(decision === 'approved' ? `${r.group.book.title} now belongs to ${r.requester.name}.` : 'Request declined.');
      await load();
      if (decision === 'approved' && onDecided) onDecided();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!requests && !error) return null;

  return (
    <section className="panel">
      <h2>Leader requests {requests && requests.length > 0 && <span className="tag status-soon">{requests.length} waiting</span>}</h2>
      <ErrorMessage message={error} />
      {message && <p className="notice" role="status">{message}</p>}
      {requests && requests.length === 0 && <p className="muted small">No leader requests waiting.</p>}
      <ul className="record-list">
        {(requests || []).map((r) => (
          <li key={r.id} className="record-row">
            <BookCover book={r.group.book} />
            <div>
              <strong className="tile-title">{r.group.book.title}</strong>
              <div className="muted small">Starts {formatStart(r.group.startDate).text} · {slotsText(r.group.timeSlots)}</div>
              <div className="small"><strong>{r.requester.name}</strong> asks to lead (now: {r.group.currentLeader || 'no one'}){r.note ? ` — “${r.note}”` : ''}</div>
            </div>
            <span className="request-actions">
              <button type="button" className="btn btn-small btn-primary" disabled={busy} onClick={() => decide(r, 'approved')}>Approve</button>
              <button type="button" className="btn btn-small" disabled={busy} onClick={() => decide(r, 'declined')}>Decline</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
