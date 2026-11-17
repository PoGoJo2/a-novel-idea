import { useCallback, useEffect, useState } from 'react';
import * as tools from '../services/memberToolsService.js';
import { meetingDateTime } from '../utils/time.js';
import ErrorMessage from './ErrorMessage.jsx';

// For one group on the dashboard: the weekly notes (to catch up after a missed meeting)
// and the one-on-one times the member can book with the leader.
export default function GroupCatchUp({ membership, zone }) {
  const { group } = membership;
  const [notes, setNotes] = useState(null);
  const [oneOnOnes, setOneOnOnes] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    try {
      const [n, o] = await Promise.all([tools.getNotes(group.id), tools.getOneOnOnes(group.id)]);
      setNotes(n.notes);
      setOneOnOnes(o);
    } catch (err) {
      setError(err.message);
    }
  }, [group.id]);

  useEffect(() => { load(); }, [load]);

  const run = async (slotId, action) => {
    setBusyId(slotId);
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="panel catch-up" aria-label={`Catch up on ${group.book.title}`}>
      <h2>{group.book.title}</h2>
      <ErrorMessage message={error} />

      <h3>Weekly notes</h3>
      {!notes ? (
        <p className="muted">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="muted">No notes yet. After each meeting, the leader posts notes here.</p>
      ) : (
        <div className="note-list">
          {notes.map((note) => (
            <details key={note.weekNumber} className="note">
              <summary>Week {note.weekNumber} notes</summary>
              <p>{note.content}</p>
              <small className="muted">By {note.author}</small>
            </details>
          ))}
        </div>
      )}

      <h3>One-on-ones with {group.leader.name}</h3>
      {!oneOnOnes ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <p className="muted small">
            {oneOnOnes.remaining} of {oneOnOnes.allowance} left. Missed a meeting? Book a private catch-up.
          </p>
          {oneOnOnes.slots.length === 0 ? (
            <p className="muted">No times are open right now. Check back soon.</p>
          ) : (
            <ul className="slot-rows">
              {oneOnOnes.slots.map((slot) => (
                <li key={slot.id} className={`slot-row${slot.mine ? ' mine' : ''}`}>
                  <span>
                    <strong>{meetingDateTime(slot.startsAtUtc, zone)}</strong>
                    <small> · {slot.durationMinutes} min</small>
                  </span>
                  {slot.mine ? (
                    <span className="slot-actions">
                      {slot.meetingLink && <a className="btn btn-small" href={slot.meetingLink} target="_blank" rel="noopener noreferrer">Open video</a>}
                      <button type="button" className="btn btn-small" disabled={busyId === slot.id} onClick={() => run(slot.id, () => tools.cancelMyOneOnOne(slot.id))}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="btn btn-small btn-primary" disabled={busyId === slot.id || oneOnOnes.remaining === 0} onClick={() => run(slot.id, () => tools.bookOneOnOne(slot.id))}>
                      Book
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
