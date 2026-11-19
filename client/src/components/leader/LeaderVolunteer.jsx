import { useCallback, useEffect, useState } from 'react';
import * as leader from '../../services/leaderService.js';
import { formatStart } from '../../utils/startDate.js';
import BookCover from '../BookCover.jsx';
import Modal from '../Modal.jsx';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';
import { slotText, slotsText } from './classTimes.js';

// Volunteer to lead: classes that have not started yet. A request goes to the administrator.
export default function LeaderVolunteer() {
  const [groups, setGroups] = useState(null);
  const [asking, setAsking] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setGroups((await leader.getOpenClasses()).groups);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (action, done, after) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(done);
      if (after) after();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!groups && !error) return <Loader />;

  return (
    <section className="panel">
      <h2>Volunteer to lead</h2>
      <p className="muted small">Classes that have not started yet. Tell the administrator you are free for the meeting times and they will approve your request.</p>
      <ErrorMessage message={asking ? '' : error} />
      {message && <p className="notice" role="status">{message}</p>}
      {groups && groups.length === 0 && <p className="muted">There are no classes to volunteer for right now.</p>}

      <div className="admin-tiles">
        {(groups || []).map((g) => {
          const st = g.request?.status;
          return (
            <div key={g.id} className="admin-tile static">
              <BookCover book={g.book} />
              <strong className="tile-title">{g.book.title}</strong>
              <span className="start-date small">Starts {formatStart(g.startDate).text}</span>
              <span className="muted small">{slotsText(g.timeSlots)}</span>
              {g.clash && <span className="small clash-note">{g.clash}</span>}
              <span className="admin-tile-foot">
                {g.mine && <span className="tag status-open">You lead this</span>}
                {!g.mine && st === 'pending' && <span className="tag status-soon">Request sent</span>}
                {!g.mine && st === 'declined' && <span className="tag status-finished">Not approved</span>}
                {!g.mine && st !== 'pending' && st !== 'declined' && <span className="tag">{g.leader ? `Led by ${g.leader.name}` : 'Needs a leader'}</span>}

                {!g.mine && st === 'pending' && (
                  <button type="button" className="btn btn-small" disabled={busy} onClick={() => run(() => leader.withdrawRequest(g.id), 'Request withdrawn.')}>Withdraw</button>
                )}
                {!g.mine && st !== 'pending' && (
                  <button type="button" className="btn btn-small btn-primary" disabled={busy || Boolean(g.clash)} onClick={() => { setError(''); setNote(''); setAsking(g); }}>
                    {st === 'declined' ? 'Ask again' : 'Volunteer'}
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {asking && (
        <Modal title={asking.book.title} subtitle={`Volunteer to lead · starts ${formatStart(asking.startDate).text}`} onClose={() => setAsking(null)}>
          <ErrorMessage message={error} />
          <p><strong>Meets:</strong> {asking.timeSlots.map(slotText).join(' and ')} <span className="muted small">(Eastern time)</span></p>
          <label className="field">
            <span>When are you free? (optional)</span>
            <textarea rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="I am free for both times." />
          </label>
          <div className="admin-row">
            <button type="button" className="btn" onClick={() => setAsking(null)}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => run(() => leader.requestToLead(asking.id, note), 'Request sent. The administrator will review it.', () => setAsking(null))}
            >
              Send request
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
