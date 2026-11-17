import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as tools from '../services/memberToolsService.js';
import { viewerZone, meetingDateTime } from '../utils/time.js';
import GoalEditor from '../components/GoalEditor.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// Leader tools: write weekly notes and offer one-on-one times for the groups you lead.
export default function LeaderPage() {
  const { user } = useAuth();
  const zone = viewerZone(user);
  const [groups, setGroups] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [notes, setNotes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [week, setWeek] = useState(1);
  const [content, setContent] = useState('');
  const [when, setWhen] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const isLeader = user.role === 'leader' || user.role === 'admin';
  const group = groups?.find((g) => g.id === groupId);

  useEffect(() => {
    if (!isLeader) return;
    tools.getLedGroups()
      .then((data) => {
        setGroups(data.groups);
        if (data.groups[0]) setGroupId(data.groups[0].id);
      })
      .catch((err) => setError(err.message));
  }, [isLeader]);

  const loadGroup = useCallback(async () => {
    if (!groupId) return;
    try {
      const [n, o] = await Promise.all([tools.getNotes(groupId), tools.getOneOnOnes(groupId)]);
      setNotes(n.notes);
      setSlots(o.slots);
    } catch (err) {
      setError(err.message);
    }
  }, [groupId]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  // When a group is chosen, start on its current week
  useEffect(() => {
    if (group) setWeek(Math.max(group.currentWeek, 1));
  }, [group]);

  // Show the saved notes for the chosen week in the box so they can be edited
  useEffect(() => {
    setContent(notes.find((n) => n.weekNumber === Number(week))?.content || '');
  }, [week, notes]);

  const run = async (action, doneMessage) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      await loadGroup();
      setMessage(doneMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!isLeader) return <ErrorMessage message="This page is for group leaders only." />;
  if (!groups && !error) return <Loader />;
  if (groups && groups.length === 0) return <p className="empty">You do not lead any reading groups yet.</p>;

  return (
    <div className="dashboard">
      <p className="eyebrow">Leader tools</p>
      <h1>Run your group</h1>
      <hr className="rule" />

      <ErrorMessage message={error} />
      {message && <p className="notice" role="status">{message}</p>}

      {groups && (
        <label className="field">
          <span>Reading group</span>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.book.title} (week {g.currentWeek} of {g.totalWeeks})</option>
            ))}
          </select>
        </label>
      )}

      {group && (
        <>
          <GoalEditor key={groupId} groupId={groupId} totalWeeks={group.totalWeeks} />

          <section className="panel">
            <h2>Weekly notes</h2>
            <p className="muted small">Notes are saved for both meeting times that week. Members see a week once that week begins.</p>
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
                <textarea rows={6} maxLength={5000} value={content} onChange={(e) => setContent(e.target.value)} required />
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
        </>
      )}
    </div>
  );
}
