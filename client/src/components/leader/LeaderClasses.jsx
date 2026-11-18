import { useCallback, useEffect, useState } from 'react';
import * as leader from '../../services/leaderService.js';
import { formatStart } from '../../utils/startDate.js';
import BookCover from '../BookCover.jsx';
import Modal from '../Modal.jsx';
import ClassTools from './ClassTools.jsx';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

// What a tile says about its class
const tagOf = (g) => {
  if (g.currentWeek > 0 && g.currentWeek >= g.totalWeeks) return { key: 'finished', label: 'Wrap up' };
  if (g.currentWeek >= 1) return { key: 'started', label: `Week ${g.currentWeek}` };
  return g.planned ? { key: 'open', label: 'Open' } : { key: 'soon', label: 'Plan needed' };
};

// My classes: a tile for each class I lead. Click one to open its tools.
export default function LeaderClasses({ onGoVolunteer }) {
  const [groups, setGroups] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setGroups((await leader.getClasses()).groups);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!groups && !error) return <Loader />;

  return (
    <section className="panel">
      <h2>My classes</h2>
      <p className="muted small">Click a book to write weekly notes, set the reading plan, or offer one-on-one times.</p>
      <ErrorMessage message={error} />
      {message && <p className="notice" role="status">{message}</p>}

      {groups && groups.length === 0 && (
        <p className="muted">
          You do not lead any classes yet.{' '}
          <button type="button" className="link-button" onClick={onGoVolunteer}>Volunteer to lead one</button>
        </p>
      )}

      <div className="admin-tiles">
        {(groups || []).map((g) => {
          const tag = tagOf(g);
          return (
            <div
              key={g.id}
              className="admin-tile"
              role="button"
              tabIndex={0}
              onClick={() => { setMessage(''); setOpen(g); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMessage(''); setOpen(g); } }}
            >
              <BookCover book={g.book} />
              <strong className="tile-title">{g.book.title}</strong>
              <span className="start-date small">
                {g.currentWeek >= 1 ? `Week ${g.currentWeek} of ${g.totalWeeks}` : `Starts ${formatStart(g.startDate).text}`}
              </span>
              <span className="muted small">{g.timeSlots.length} meeting{g.timeSlots.length === 1 ? '' : 's'} a week</span>
              <span className="admin-tile-foot">
                <span className={`tag status-${tag.key}`}>{tag.label}</span>
                <span className="btn btn-small">Open</span>
              </span>
            </div>
          );
        })}
      </div>

      {open && (
        <Modal title={open.book.title} subtitle={`${open.book.author}${open.book.genre ? ` · ${open.book.genre}` : ''} · ${open.totalWeeks} weeks`} onClose={() => setOpen(null)}>
          <ClassTools
            key={open.id}
            group={open}
            onFinished={() => { setOpen(null); setMessage('Class finished. It is now in your record.'); load(); }}
          />
        </Modal>
      )}
    </section>
  );
}
