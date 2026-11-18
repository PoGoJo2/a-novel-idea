import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tools from '../../services/memberToolsService.js';
import * as leader from '../../services/leaderService.js';
import { viewerZone, meetingDateTime } from '../../utils/time.js';
import GoalEditor from '../GoalEditor.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

// Everything a leader does for one class: reading plan, weekly notes, one-on-one times, and finishing the class.
export default function ClassTools({ group, onFinished }) {
  const { user } = useAuth();
  const zone = viewerZone(user);
  const groupId = group.id;
  const [notes, setNotes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [week, setWeek] = useState(Math.max(group.currentWeek, 1));
  const [content, setContent] = useState('');
  const [when, setWhen] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [n, o] = await Promise.all([tools.getNotes(groupId), tools.getOneOnOnes(groupId)]);
      setNotes(n.notes);
      setSlots(o.slots);
    } catch (err) {
      setError(err.message);
    }
  }, [groupId]);
  useEffect(() => { load(); }, [load]);

  // Show the saved notes for the chosen week in the box so they can be edited
  useEffect(() => {
    setContent(notes.find((n) => n.weekNumber === Number(week))?.content || '');
  }, [week, notes]);

  const run = async (action, done) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      await load();
      setMessage(done);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const canFinish = group.currentWeek > 0 && group.currentWeek >= group.totalWeeks;

  const finish = async () => {
    if (!window.confirm(`Mark "${group.book.title}" as finished? It moves to your record.`)) return;
    setBusy(true);
    setError('');
    try {
      await leader.finishClass(groupId);
      onFinished();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="class-tools">
      <ErrorMessage message={error} />
      {message && <p className="notice" role="status">{message}</p>}

      <GoalEditor groupId={groupId} totalWeeks={group.totalWeeks} />

      <section className="panel">
        <h2>Weekly notes</h2>
        <p className="muted small">Notes are saved for every meeting time that week. Members see a week once that week begins.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => tools.saveNotes(groupId, Number(week), content), `Week ${week} notes saved.`);
          }}
        >
          <label className="field">
            <span>Week</span>
            <select value={week} onChange={(e) => setWeek(Number(e.target.value))}>
              {Array.from({ length: group.totalWeeks }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>What the group discussed</span>
            <textarea rows={5} maxLength={5000} value={content} onChange={(e) => setContent(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy || !content.trim()}>Save notes</button>
        </form>
      </section>

      <section className="panel">
        <h2>One-on-one times</h2>
        <p className="muted small">Each member gets a limited number. Times are in your time zone ({zone}).</p>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => tools.createOneOnOne(groupId, { startsAtUtc: new Date(when).toISOString(), durationMinutes: Number(minutes) }), 'One-on-one time added.');
          }}
        >
          <label className="field">
            <span>Date and time</span>
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
          </label>
          <label className="field">
            <span>Minutes</span>
            <input type="number" min={5} max={120} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy || !when}>Add time</button>
        </form>

        {slots.length === 0 ? (
          <p className="muted">No times yet.</p>
        ) : (
          <ul className="slot-rows">
            {slots.map((slot) => (
              <li key={slot.id} className={`slot-row${slot.status === 'booked' ? ' mine' : ''}`}>
                <span>
                  <strong>{meetingDateTime(slot.startsAtUtc, zone)}</strong>
                  <small> · {slot.durationMinutes} min · {slot.bookedBy ? `booked by ${slot.bookedBy.name}` : 'open'}</small>
                </span>
                <button type="button" className="btn btn-small" disabled={busy} onClick={() => run(() => tools.withdrawOneOnOne(slot.id), 'That time was withdrawn.')}>
                  Withdraw
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canFinish && (
        <section className="panel finish-panel">
          <h2>Finish this class</h2>
          <p className="muted small">The last week has been held. Finishing adds this class to your record.</p>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={finish}>Mark class finished</button>
        </section>
      )}
    </div>
  );
}
